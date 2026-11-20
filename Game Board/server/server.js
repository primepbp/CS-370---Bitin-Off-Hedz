const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = 3000;
const MAX_PLAYERS = 6;
const MAX_USERNAME_LENGTH = 16;
const WINNING_POSITION = 30; // Adjust board length as needed

const rooms = new Map();

const CHARACTERS = [
    "Marie Antoinette",
    "Maximilien Robespierre",
    "Anne Boleyn",
    "King Louis XVI",
    "Headless Horseman",
    "Queen of Hearts"
];

function cleanUsername(value) {
    if (typeof value !== "string") return "";

    return value
        .trim()
        .replace(/\s+/g, " ")
        .replace(/[<>]/g, "")
        .slice(0, MAX_USERNAME_LENGTH);
}

app.use(express.static(path.join(__dirname, "..", "public")));

app.get("/health", (req, res) => {
    res.json({ status: "GTTG server is running" });
});

function generateRoomCode() {
    const characters = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let code;

    do {
        code = "";
        for (let i = 0; i < 5; i++) {
            code += characters[Math.floor(Math.random() * characters.length)];
        }
    } while (rooms.has(code));

    return code;
}

function getPublicPlayers(room) {
    return room.players.map(player => ({
        id: player.id,
        name: player.name,
        character: player.character,
        ready: player.ready,
        isHost: player.id === room.hostId,
        position: player.position
    }));
}

function updateLobby(code) {
    const room = rooms.get(code);
    if (!room) return;

    io.to(code).emit("lobby-update", {
        roomCode: code,
        hostId: room.hostId,
        players: getPublicPlayers(room)
    });
}

function broadcastGameState(code) {
    const room = rooms.get(code);
    if (!room) return;

    io.to(code).emit("gameStateUpdated", {
        started: room.started,
        currentPlayerId: room.currentPlayerId,
        turnNumber: room.turnNumber,
        players: getPublicPlayers(room)
    });
}

function removePlayer(socket) {
    const code = socket.data.roomCode;
    if (!code) return;

    const room = rooms.get(code);
    if (!room) {
        socket.data.roomCode = null;
        return;
    }

    room.players = room.players.filter(player => player.id !== socket.id);
    socket.leave(code);
    socket.data.roomCode = null;

    if (room.players.length === 0) {
        rooms.delete(code);
        console.log("Room deleted:", code);
        return;
    }

    if (room.hostId === socket.id) {
        room.hostId = room.players[0].id;
    }

    if (room.started) {
        if (room.currentPlayerId === socket.id && room.players.length > 0) {
            const currentIndex = room.players.findIndex(p => p.id === socket.id);
            room.currentPlayerId = room.players[currentIndex % room.players.length].id;
        }
        broadcastGameState(code);
    } else {
        updateLobby(code);
    }

    io.to(code).emit("player-left", { playerName: socket.data.playerName });
}

io.on("connection", socket => {
    console.log("Player connected:", socket.id);

    socket.on("host-game", (username, callback) => {
        username = cleanUsername(username);
        if (!username) {
            if (typeof callback === "function") callback({ success: false, message: "Please enter a valid player name." });
            return;
        }

        if (socket.data.roomCode) removePlayer(socket);

        const code = generateRoomCode();
        socket.data.playerName = username;

        const room = {
            hostId: socket.id,
            players: [{
                id: socket.id,
                name: username,
                character: null,
                ready: false,
                position: 0
            }],
            started: false,
            currentPlayerId: null,
            turnNumber: 1
        };

        rooms.set(code, room);
        socket.join(code);
        socket.data.roomCode = code;

        console.log(`${username} created room: ${code}`);

        if (typeof callback === "function") {
            callback({
                success: true,
                roomCode: code,
                hostId: socket.id,
                playerName: username
            });
        }

        updateLobby(code);
    });

    socket.on("join-game", (data, callback) => {
        const username = cleanUsername(data?.username);
        const code = String(data?.roomCode || "").trim().toUpperCase();

        if (!username) {
            if (typeof callback === "function") callback({ success: false, message: "Please enter a valid player name." });
            return;
        }

        const room = rooms.get(code);
        if (!room || room.started) {
            if (typeof callback === "function") callback({ success: false, message: "Room not found or game already started." });
            return;
        }

        if (room.players.length >= MAX_PLAYERS) {
            if (typeof callback === "function") callback({ success: false, message: "Room is full." });
            return;
        }

        if (socket.data.roomCode) removePlayer(socket);
        socket.data.playerName = username;

        room.players.push({
            id: socket.id,
            name: username,
            character: null,
            ready: false,
            position: 0
        });

        socket.join(code);
        socket.data.roomCode = code;

        console.log(`${username} joined room: ${code}`);

        if (typeof callback === "function") {
            callback({
                success: true,
                roomCode: code,
                hostId: room.hostId,
                playerName: username
            });
        }

        io.to(code).emit("player-joined", { playerName: username });
        updateLobby(code);
    });

    socket.on("select-character", data => {
        const code = socket.data.roomCode;
        const room = rooms.get(code);
        if (!room || room.started) return;

        const player = room.players.find(p => p.id === socket.id);
        if (!player || !CHARACTERS.includes(data.character)) return;

        const taken = room.players.some(p => p.id !== socket.id && p.character === data.character);
        if (taken) {
            socket.emit("room-error", { message: "This character is already taken." });
            return;
        }

        player.character = data.character;
        player.ready = false;
        updateLobby(code);
    });

    socket.on("set-ready", data => {
        const code = socket.data.roomCode;
        const room = rooms.get(code);
        if (!room || room.started) return;

        const player = room.players.find(p => p.id === socket.id);
        if (!player) return;

        if (data.ready && !player.character) {
            socket.emit("room-error", { message: "Select a character first." });
            return;
        }

        player.ready = Boolean(data.ready);
        updateLobby(code);
    });

    socket.on("start-game", data => {
        const code = socket.data.roomCode;
        const room = rooms.get(code);
        if (!room || room.started) return;

        if (room.hostId !== socket.id) {
            socket.emit("room-error", { message: "Only the host can start the game." });
            return;
        }

        const allReady = room.players.length >= 2 && room.players.every(p => p.ready && p.character);
        if (!allReady) {
            socket.emit("room-error", { message: "All players must select characters and be ready." });
            return;
        }

        room.started = true;
        room.currentPlayerId = room.players[0].id;
        room.turnNumber = 1;

        io.to(code).emit("game-started", {
            roomCode: code,
            started: true,
            currentPlayerId: room.currentPlayerId,
            turnNumber: room.turnNumber,
            players: getPublicPlayers(room)
        });

        console.log("Game started:", code);
    });

    // SERVER-SIDE DICE ROLL & TURN ADVANCEMENT
    socket.on("rollDice", () => {
        const code = socket.data.roomCode;
        const room = rooms.get(code);
        if (!room || !room.started) return;

        if (room.currentPlayerId !== socket.id) {
            socket.emit("diceRollError", "It is not your turn.");
            return;
        }

        const player = room.players.find(p => p.id === socket.id);
        if (!player) return;

        const dice1 = Math.floor(Math.random() * 6) + 1;
        const dice2 = Math.floor(Math.random() * 6) + 1;
        const total = dice1 + dice2;

        const oldPosition = player.position;
        player.position = Math.min(player.position + total, WINNING_POSITION);

        io.to(code).emit("diceRolled", {
            playerName: player.name,
            dice1,
            dice2,
            total,
            oldPosition,
            newPosition: player.position
        });

        if (player.position >= WINNING_POSITION) {
            io.to(code).emit("gameOver", { playerName: player.name });
            room.started = false;
            return;
        }

        // Advance to next player's turn
        const currentIndex = room.players.findIndex(p => p.id === socket.id);
        const nextIndex = (currentIndex + 1) % room.players.length;
        room.currentPlayerId = room.players[nextIndex].id;
        if (nextIndex === 0) {
            room.turnNumber++;
        }

        broadcastGameState(code);
    });

    socket.on("chat-message", message => {
        const code = socket.data.roomCode;
        const room = rooms.get(code);
        if (!room || !room.started) return;

        const player = room.players.find(p => p.id === socket.id);
        if (!player || typeof message !== "string") return;

        const cleanMessage = message.trim().slice(0, 200);
        if (!cleanMessage) return;

        io.to(code).emit("chat-message", {
            name: player.name,
            message: cleanMessage
        });
    });

    socket.on("leave-room", callback => {
        removePlayer(socket);
        if (typeof callback === "function") callback({ success: true });
    });

    socket.on("disconnect", () => {
        removePlayer(socket);
        console.log("Player disconnected:", socket.id);
    });
});

server.listen(PORT, () => {
    console.log("--------------------------------");
    console.log("GET TO THE GUILLOTINE SERVER");
    console.log(`Running at http://localhost:${PORT}`);
    console.log("--------------------------------");
});