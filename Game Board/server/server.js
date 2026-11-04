<<<<<<< HEAD

const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = 3000;
const MAX_PLAYERS = 6;

const rooms = new Map();

const CHARACTERS = [
    "Marie Antoinette",
    "Maximilien Robespierre",
    "Anne Boleyn",
    "King Louis XVI",
    "Headless Horseman",
    "Queen of Hearts"
];

// Serve the Game Board folder.
app.use(express.static(path.join(__dirname, "..")));

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

// Only send public player information.
function getPublicPlayers(room) {
    return room.players.map(player => ({
        id: player.id,
        character: player.character,
        ready: player.ready,
        isHost: player.id === room.hostId
    }));
}

// Send lobby updates to everyone in the room.
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

    if (!room) return;

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

// Socket.IO CONNECTION
io.on("connection", socket => {
    console.log("Player connected:", socket.id);

    // HOST GAME
    socket.on("host-game", callback => {
        if (socket.data.roomCode) {
            removePlayer(socket);
        }

        const code = generateRoomCode();

        const room = {
            hostId: socket.id,
            players: [{
                id: socket.id,
                character: null,
                ready: false
            }],
            started: false
        };

        rooms.set(code, room);

        socket.join(code);
        socket.data.roomCode = code;

        console.log("Room created:", code);

        if (typeof callback === "function") {
            callback({
                success: true,
                roomCode: code,
                hostId: socket.id
            });
        }

        updateLobby(code);
    });

    // JOIN GAME
    socket.on("join-game", (roomCode, callback) => {
        const code = String(roomCode || "")
            .trim()
            .toUpperCase();

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
            character: null,
            ready: false
        });

        socket.join(code);
        socket.data.roomCode = code;

        console.log("Player joined:", code);

        if (typeof callback === "function") {
            callback({
                success: true,
                roomCode: code,
                hostId: room.hostId
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
    socket.on("leave-room", () => {
        removePlayer(socket);
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
=======
/*
====================================================
 GET TO THE GUILLOTINE
 MULTIPLAYER SERVER
====================================================

 CURRENT FEATURES:
 - Player connections
 - Host creates a room
 - Server generates 4-digit game code
 - Players can join using the code
 - Maximum 4 players per room
 - Players are synchronized inside the room

 LATER:
 - Character selection
 - Ready system
 - Lobby
 - Dice
 - Turns
 - Movement
 - Powers
 - Winning
====================================================
*/


// ==================================================
// 1. IMPORT MODULES
// ==================================================

const http = require("http");

const { Server } = require("socket.io");


// ==================================================
// 2. CREATE HTTP SERVER
// ==================================================

const httpServer = http.createServer();


// ==================================================
// 3. CREATE SOCKET.IO SERVER
// ==================================================

const io = new Server(httpServer, {

    cors: {
        origin: "*"
    }

});


// ==================================================
// 4. STORE ALL GAME ROOMS
// ==================================================

/*
    Example:

    rooms = {

        "3358": {

            host: "abc123",

            players: [

                {
                    id: "abc123",
                    character: null,
                    ready: false
                }

            ]

        }

    }
*/

const rooms = {};


// ==================================================
// 5. PLAYER CONNECTS
// ==================================================

io.on("connection", (socket) => {

    console.log(
        "Player connected:",
        socket.id
    );


    // ==================================================
    // 6. HOST CREATES ROOM
    // ==================================================

    socket.on("createRoom", () => {

        console.log(
            "Create room request from:",
            socket.id
        );


        // Generate a random 4-digit code

        let gameCode;


        do {

            gameCode = Math.floor(
                1000 + Math.random() * 9000
            ).toString();

        } while (rooms[gameCode]);


        // Create the room

        rooms[gameCode] = {

            host: socket.id,

            players: [

                {
                    id: socket.id,
                    character: null,
                    ready: false
                }

            ]

        };


        // Put host inside Socket.IO room

        socket.join(gameCode);


        // Remember the room

        socket.gameCode = gameCode;


        // Send code to host

        socket.emit("roomCreated", {

            code: gameCode

        });


        console.log(
            "Room created:",
            gameCode,
            "Host:",
            socket.id
        );

    });


    // ==================================================
    // 7. PLAYER JOINS ROOM
    // ==================================================

    socket.on("joinRoom", (gameCode) => {

        /*
            Clean the code.

            Example:

            " 3358 "

            becomes:

            "3358"
        */

        gameCode = String(gameCode).trim();


        console.log(
            "Join request:",
            socket.id,
            "wants room",
            gameCode
        );


        // ------------------------------------------------
        // CHECK WHETHER ROOM EXISTS
        // ------------------------------------------------

        if (!rooms[gameCode]) {

            socket.emit("joinError", {

                message:
                    "Game room not found. Check your code."

            });

            console.log(
                "Room does not exist:",
                gameCode
            );

            return;

        }


        // ------------------------------------------------
        // CHECK ROOM SIZE
        // ------------------------------------------------

        const room = rooms[gameCode];


        if (room.players.length >= 4) {

            socket.emit("joinError", {

                message:
                    "This game is already full. Maximum 4 players."

            });

            console.log(
                "Room is full:",
                gameCode
            );

            return;

        }


        // ------------------------------------------------
        // ADD PLAYER
        // ------------------------------------------------

        const newPlayer = {

            id: socket.id,

            character: null,

            ready: false

        };


        room.players.push(newPlayer);


        // Put player inside Socket.IO room

        socket.join(gameCode);


        // Remember the room on this socket

        socket.gameCode = gameCode;


        console.log(
            "Player joined room:",
            gameCode,
            "Player:",
            socket.id
        );


        // ------------------------------------------------
        // SEND SUCCESS MESSAGE TO NEW PLAYER
        // ------------------------------------------------

        socket.emit("joinSuccess", {

            code: gameCode

        });


        // ------------------------------------------------
        // SEND UPDATED PLAYER LIST TO EVERYONE
        // ------------------------------------------------

        io.to(gameCode).emit(
            "roomUpdated",
            {

                code: gameCode,

                players: room.players

            }
        );


        console.log(
            "Players in room:",
            room.players.length
        );

    });


    // ==================================================
    // 8. PLAYER DISCONNECTS
    // ==================================================

    socket.on("disconnect", () => {

        console.log(
            "Player disconnected:",
            socket.id
        );


        const gameCode = socket.gameCode;


        // Player wasn't inside a room

        if (!gameCode) {

            return;

        }


        const room = rooms[gameCode];


        // Room no longer exists

        if (!room) {

            return;

        }


        // ------------------------------------------------
        // REMOVE PLAYER
        // ------------------------------------------------

        room.players =
            room.players.filter(
                (player) =>
                    player.id !== socket.id
            );


        console.log(
            "Player removed from room:",
            gameCode
        );


        // ------------------------------------------------
        // HOST LEFT
        // ------------------------------------------------

        if (room.host === socket.id) {

            /*
                For now, closing the room if the host
                leaves.

                Later we can transfer the host role.
            */

            io.to(gameCode).emit(
                "hostLeft"
            );


            delete rooms[gameCode];


            console.log(
                "Host left. Room closed:",
                gameCode
            );


            return;

        }


        // ------------------------------------------------
        // TELL REMAINING PLAYERS
        // ------------------------------------------------

        io.to(gameCode).emit(
            "roomUpdated",
            {

                code: gameCode,

                players: room.players

            }
        );


        // ------------------------------------------------
        // DELETE EMPTY ROOM
        // ------------------------------------------------

        if (room.players.length === 0) {

            delete rooms[gameCode];


            console.log(
                "Empty room deleted:",
                gameCode
            );

        }

    });

});


// ==================================================
// 9. START SERVER
// ==================================================

const PORT = 3000;


httpServer.listen(PORT, () => {

    console.log(
        "=============================================="
    );

    console.log(
        "GET TO THE GUILLOTINE SERVER"
    );

    console.log(
        `Server running on port ${PORT}`
    );

    console.log(
        "Waiting for players..."
    );

    console.log(
        "=============================================="
    );

});
>>>>>>> d1eff00f1feec972561342668504685b1195bd9c
