

const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = 3000;
const MAX_PLAYERS = 6;
//(Cailyn) Added line 15
const MAX_USERNAME_LENGTH = 16;

const rooms = new Map();

const CHARACTERS = [
    "Marie Antoinette",
    "Maximilien Robespierre",
    "Anne Boleyn",
    "King Louis XVI",
    "Headless Horseman",
    "Queen of Hearts"
];
//(Cailyn) Added to trim extra spaces and limits names to 16 characters.
function cleanUsername(value) {
    if (typeof value !== "string") return "";

    return value
        .trim()
        .replace(/\s+/g, " ")
        .replace(/[<>]/g, "")
        .slice(0, MAX_USERNAME_LENGTH);
}

// Serve files from the main Game Board folder.
//app.use(express.static(path.join(__dirname, "..")));
app.use(express.static(path.join(__dirname, "..", "public")));

app.get("/health", (req, res) => {
    res.json({ status: "GTTG server is running" });
});

// Generate a unique 5-character room code.
function generateRoomCode() {
    const characters = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let code;

    do {
        code = "";

        for (let i = 0; i < 5; i++) {
            code += characters[
                Math.floor(Math.random() * characters.length)
            ];
        }
    } while (rooms.has(code));

    return code;
}

// Updated by Cailyn. Send only public player information.
function getPublicPlayers(room) {
    return room.players.map(player => ({
        id: player.id,
        name: player.name,
        character: player.character,
        ready: player.ready,
        isHost: player.id === room.hostId
    }));
}

// Update the lobby for everyone in the room.
function updateLobby(code) {
    const room = rooms.get(code);

    if (!room) return;

    io.to(code).emit("lobby-update", {
        roomCode: code,
        hostId: room.hostId,
        players: getPublicPlayers(room)
    });
}

// Remove a player from their room.
function removePlayer(socket) {
    const code = socket.data.roomCode;

    if (!code) return;

    const room = rooms.get(code);

    if (!room) {
        socket.data.roomCode = null;
        return;
    }

    room.players = room.players.filter(
        player => player.id !== socket.id
    );

    socket.leave(code);
    socket.data.roomCode = null;

    if (room.players.length === 0) {
        rooms.delete(code);
        console.log("Room deleted:", code);
        return;
    }

    // Transfer host if the original host leaves.
    if (room.hostId === socket.id) {
        room.hostId = room.players[0].id;
    }

    updateLobby(code);
    io.to(code).emit("player-left");
}

// SOCKET.IO CONNECTION
io.on("connection", socket => {
    console.log("Player connected:", socket.id);

    // HOST GAME Updated by Cailyn
socket.on("host-game", (username, callback) => {
    username = cleanUsername(username);

    if (!username) {
        if (typeof callback === "function") {
            callback({
                success: false,
                message: "Please enter a valid player name."
            });
        }
        return;
    }

    if (socket.data.roomCode) {
        removePlayer(socket);
    }

    const code = generateRoomCode();

    const room = {
        hostId: socket.id,
        players: [{
            id: socket.id,
            name: username,
            character: null,
            ready: false
        }],
        started: false
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

    // JOIN GAME
socket.on("join-game", (data, callback) => {
    const username = cleanUsername(data?.username);

    const code = String(data?.roomCode || "")
        .trim()
        .toUpperCase();

    if (!username) {
        if (typeof callback === "function") {
            callback({
                success: false,
                message: "Please enter a valid player name."
            });
        }
        return;
    }

    const room = rooms.get(code);

    if (!room || room.started) {
        if (typeof callback === "function") {
            callback({
                success: false,
                message: "Room not found or game already started."
            });
        }
        return;
    }

    if (room.players.length >= MAX_PLAYERS) {
        if (typeof callback === "function") {
            callback({
                success: false,
                message: "Room is full."
            });
        }
        return;
    }

    if (socket.data.roomCode) {
        removePlayer(socket);
    }

    room.players.push({
        id: socket.id,
        name: username,
        character: null,
        ready: false
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

    io.to(code).emit("player-joined");
    updateLobby(code);
});

    // SELECT CHARACTER
    socket.on("select-character", data => {
        const code = socket.data.roomCode;
        const room = rooms.get(code);

        if (!room || room.started || data?.roomCode !== code) return;

        const player = room.players.find(
            p => p.id === socket.id
        );

        if (!player) return;

        if (!CHARACTERS.includes(data.character)) return;

        const taken = room.players.some(
            p => p.id !== socket.id &&
                p.character === data.character
        );

        if (taken) {
            socket.emit("room-error", {
                message: "This character is already taken."
            });
            return;
        }

        player.character = data.character;
        player.ready = false;

        updateLobby(code);
    });

    // READY STATUS
    socket.on("set-ready", data => {
        const code = socket.data.roomCode;
        const room = rooms.get(code);

        if (!room || room.started || data?.roomCode !== code) return;

        const player = room.players.find(
            p => p.id === socket.id
        );

        if (!player) return;

        if (data.ready && !player.character) {
            socket.emit("room-error", {
                message: "Select a character first."
            });
            return;
        }

        player.ready = Boolean(data.ready);

        updateLobby(code);
    });

    // START GAME
    socket.on("start-game", data => {
        const code = socket.data.roomCode;
        const room = rooms.get(code);

        if (!room || room.started || data?.roomCode !== code) return;

        if (room.hostId !== socket.id) {
            socket.emit("room-error", {
                message: "Only the host can start the game."
            });
            return;
        }

        const allReady =
            room.players.length >= 2 &&
            room.players.length <= MAX_PLAYERS &&
            room.players.every(p =>
                p.ready && p.character
            );

        if (!allReady) {
            socket.emit("room-error", {
                message: "At least 2 players must select different characters and be ready."
            });
            return;
        }

        room.started = true;

        io.to(code).emit("game-started", {
            roomCode: code,
            players: getPublicPlayers(room)
        });

        console.log("Game started:", code);
    });

    // LEAVE ROOM
    socket.on("leave-room", callback => {
        removePlayer(socket);

    if (typeof callback === "function") {
        callback({
            success: true
        });
    }
    });

    // DISCONNECT
    socket.on("disconnect", () => {
        removePlayer(socket);
        console.log("Player disconnected:", socket.id);
    });
});

// START SERVER
server.listen(PORT, () => {
    console.log("--------------------------------");
    console.log("GET TO THE GUILLOTINE SERVER");
    console.log(`Running at http://localhost:${PORT}`);
    console.log("--------------------------------");
});
