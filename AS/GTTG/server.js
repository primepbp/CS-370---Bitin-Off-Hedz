// =====================================================
// GET TO THE GUILLOTINE - SERVER
// =====================================================
//
// Node.js + Express + Socket.IO
//
// Handles:
// - Player connections
// - Usernames
// - Game rooms
// - Hosting games
// - Joining games
// - Character selection
// - Starting games
// - Dice rolls
// - Player movement
// - Player disconnects
//
// =====================================================

const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Serve files from public folder
app.use(express.static(path.join(__dirname, "public")));

// =====================================================
// GAME SETTINGS
// =====================================================

const PORT = 3000;
const MAX_PLAYERS = 8;
const ROOM_CODE_LENGTH = 6;
const NUMBER_OF_CHARACTERS = 8;
const MAX_USERNAME_LENGTH = 16;

// =====================================================
// DATA STORAGE
// =====================================================

const players = new Map();
const rooms = new Map();


// =====================================================
// ROOM CODE GENERATION
// =====================================================

function generateRoomCode() {
    const characters = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

    let code;

    do {
        code = "";

        for (let i = 0; i < ROOM_CODE_LENGTH; i++) {
            const randomIndex = Math.floor(
                Math.random() * characters.length
            );

            code += characters[randomIndex];
        }

    } while (rooms.has(code));

    return code;
}


// =====================================================
// GET ROOM FOR PLAYER
// =====================================================

function getPlayerRoom(socketId) {
    const player = players.get(socketId);

    if (!player || !player.roomCode) {
        return null;
    }

    return rooms.get(player.roomCode) || null;
}


// =====================================================
// GET PLAYERS IN ROOM
// =====================================================

function getRoomPlayers(room) {
    if (!room) {
        return [];
    }

    return Array.from(room.players)
        .map(playerId => players.get(playerId))
        .filter(Boolean);
}


// =====================================================
// SEND PLAYER LIST TO ROOM
// =====================================================

function broadcastPlayers(roomCode) {
    const room = rooms.get(roomCode);

    if (!room) {
        return;
    }

    const roomPlayers = getRoomPlayers(room);

    io.to(roomCode).emit(
        "playersUpdated",
        roomPlayers
    );
}


// =====================================================
// CLIENT CONNECTION
// =====================================================

io.on("connection", (socket) => {

    console.log(`Player connected: ${socket.id}`);


    // =================================================
    // CREATE PLAYER
    // =================================================

    const player = {
        id: socket.id,
        name: `Player`,
        character: null,
        position: 0,
        roomCode: null,
        isHost: false
    };

    players.set(socket.id, player);


    // =================================================
    // CONNECTION CONFIRMATION
    // =================================================

    socket.emit("connectionConfirmed", {
        playerId: socket.id,
        message: "Connected to Get to the Guillotine!"
    });


    // =================================================
    // HOST GAME
    // =================================================

    socket.on("hostGame", (username) => {

        const currentPlayer = players.get(socket.id);

        if (!currentPlayer) {
            return;
        }


        // ---------------------------------------------
        // Clean username
        // ---------------------------------------------

        username = String(username || "")
            .trim()
            .replace(/\s+/g, " ");


        if (username.length === 0) {
            socket.emit(
                "hostError",
                "Please enter a username."
            );

            return;
        }


        if (username.length > MAX_USERNAME_LENGTH) {
            socket.emit(
                "hostError",
                `Username must be ${MAX_USERNAME_LENGTH} characters or less.`
            );

            return;
        }


        // ---------------------------------------------
        // Make sure player isn't already in a room
        // ---------------------------------------------

        if (currentPlayer.roomCode) {

            socket.emit(
                "hostError",
                "You are already in a game."
            );

            return;
        }


        // ---------------------------------------------
        // Set username
        // ---------------------------------------------

        currentPlayer.name = username;


        // ---------------------------------------------
        // Create room
        // ---------------------------------------------

        const roomCode = generateRoomCode();

        const room = {
            code: roomCode,
            hostId: socket.id,
            players: new Set(),
            started: false
        };


        rooms.set(roomCode, room);

        room.players.add(socket.id);

        currentPlayer.roomCode = roomCode;
        currentPlayer.isHost = true;

        socket.join(roomCode);


        console.log(
            `${currentPlayer.name} created room ${roomCode}`
        );


        // ---------------------------------------------
        // Tell host the game was created
        // ---------------------------------------------

        socket.emit("gameHosted", {
            roomCode: roomCode,
            playerId: socket.id,
            playerName: currentPlayer.name
        });


        broadcastPlayers(roomCode);
    });


    // =================================================
    // JOIN GAME
    // =================================================

    socket.on("joinGame", (data) => {

        const currentPlayer = players.get(socket.id);

        if (!currentPlayer) {
            return;
        }


        // ---------------------------------------------
        // Get username and room code
        // ---------------------------------------------

        let username = "";
        let roomCode = "";


        if (typeof data === "object") {
            username = data.username;
            roomCode = data.roomCode;
        } else {
            // Compatibility with old version
            roomCode = data;
        }


        username = String(username || "")
            .trim()
            .replace(/\s+/g, " ");

        roomCode = String(roomCode || "")
            .trim()
            .toUpperCase();


        // ---------------------------------------------
        // Validate username
        // ---------------------------------------------

        if (username.length === 0) {

            socket.emit(
                "joinError",
                "Please enter a username."
            );

            return;
        }


        if (username.length > MAX_USERNAME_LENGTH) {

            socket.emit(
                "joinError",
                `Username must be ${MAX_USERNAME_LENGTH} characters or less.`
            );

            return;
        }


        // ---------------------------------------------
        // Validate room code
        // ---------------------------------------------

        if (roomCode.length !== ROOM_CODE_LENGTH) {

            socket.emit(
                "joinError",
                "Please enter the 6-character game code."
            );

            return;
        }


        // ---------------------------------------------
        // Already in room?
        // ---------------------------------------------

        if (currentPlayer.roomCode) {

            socket.emit(
                "joinError",
                "You are already in a game."
            );

            return;
        }


        // ---------------------------------------------
        // Find room
        // ---------------------------------------------

        const room = rooms.get(roomCode);

        if (!room) {

            socket.emit(
                "joinError",
                "Game not found. Check the game code and try again."
            );

            return;
        }


        // ---------------------------------------------
        // Check game status
        // ---------------------------------------------

        if (room.started) {

            socket.emit(
                "joinError",
                "That game has already started."
            );

            return;
        }


        // ---------------------------------------------
        // Check player limit
        // ---------------------------------------------

        if (room.players.size >= MAX_PLAYERS) {

            socket.emit(
                "joinError",
                "That game is full."
            );

            return;
        }


        // ---------------------------------------------
        // Set username
        // ---------------------------------------------

        currentPlayer.name = username;


        // ---------------------------------------------
        // Add player to room
        // ---------------------------------------------

        room.players.add(socket.id);

        currentPlayer.roomCode = roomCode;
        currentPlayer.isHost = false;

        socket.join(roomCode);


        console.log(
            `${currentPlayer.name} joined room ${roomCode}`
        );


        // ---------------------------------------------
        // Tell player they joined
        // ---------------------------------------------

        socket.emit("gameJoined", {
            roomCode: roomCode,
            playerId: socket.id,
            playerName: currentPlayer.name
        });


        // ---------------------------------------------
        // Tell everyone about new player
        // ---------------------------------------------

        io.to(roomCode).emit("playerJoined", {
            id: currentPlayer.id,
            name: currentPlayer.name,
            character: currentPlayer.character
        });


        broadcastPlayers(roomCode);
    });


    // =================================================
    // CHARACTER SELECTION
    // =================================================

    socket.on("selectCharacter", (characterNumber) => {

        const currentPlayer = players.get(socket.id);

        if (!currentPlayer) {
            return;
        }


        const room = getPlayerRoom(socket.id);

        if (!room) {

            socket.emit(
                "characterSelectionError",
                "You must join a game first."
            );

            return;
        }


        if (room.started) {

            socket.emit(
                "characterSelectionError",
                "The game has already started."
            );

            return;
        }


        characterNumber = Number(characterNumber);


        // ---------------------------------------------
        // Validate character
        // ---------------------------------------------

        if (
            !Number.isInteger(characterNumber) ||
            characterNumber < 1 ||
            characterNumber > NUMBER_OF_CHARACTERS
        ) {

            socket.emit(
                "characterSelectionError",
                "Invalid character."
            );

            return;
        }


        // ---------------------------------------------
        // Check if character is taken
        // ---------------------------------------------

        const roomPlayers = getRoomPlayers(room);

        const characterTaken = roomPlayers.some(
            player =>
                player.id !== socket.id &&
                player.character === characterNumber
        );


        if (characterTaken) {

            socket.emit(
                "characterSelectionError",
                "That character is already taken."
            );

            return;
        }


        // ---------------------------------------------
        // Assign character
        // ---------------------------------------------

        currentPlayer.character = characterNumber;


        console.log(
            `${currentPlayer.name} selected Character ${characterNumber}`
        );


        io.to(room.code).emit(
            "characterSelected",
            {
                playerId: currentPlayer.id,
                playerName: currentPlayer.name,
                character: characterNumber
            }
        );


        broadcastPlayers(room.code);
    });


    // =================================================
    // START GAME
    // =================================================

    socket.on("startGame", () => {

        const currentPlayer = players.get(socket.id);

        if (!currentPlayer) {
            return;
        }


        const room = getPlayerRoom(socket.id);

        if (!room) {

            socket.emit(
                "startGameError",
                "You are not in a game."
            );

            return;
        }


        if (room.hostId !== socket.id) {

            socket.emit(
                "startGameError",
                "Only the host can start the game."
            );

            return;
        }


        if (room.started) {

            socket.emit(
                "startGameError",
                "The game has already started."
            );

            return;
        }


        const roomPlayers = getRoomPlayers(room);


        const everyoneHasCharacter =
            roomPlayers.length > 0 &&
            roomPlayers.every(
                player => player.character !== null
            );


        if (!everyoneHasCharacter) {

            socket.emit(
                "startGameError",
                "Everyone must select a character before the game can start."
            );

            return;
        }


        room.started = true;


        console.log(
            `Room ${room.code} has started.`
        );


        io.to(room.code).emit(
            "gameStarted",
            {
                roomCode: room.code,
                players: roomPlayers
            }
        );
    });


    // =================================================
    // DICE ROLL
    // =================================================

    socket.on("rollDice", () => {

        const currentPlayer = players.get(socket.id);

        if (!currentPlayer) {
            return;
        }


        const room = getPlayerRoom(socket.id);

        if (!room || !room.started) {
            return;
        }


        const dice1 =
            Math.floor(Math.random() * 6) + 1;

        const dice2 =
            Math.floor(Math.random() * 6) + 1;

        const total = dice1 + dice2;


        console.log(
            `${currentPlayer.name} rolled ` +
            `${dice1} + ${dice2} = ${total}`
        );


        io.to(room.code).emit(
            "diceRolled",
            {
                playerId: currentPlayer.id,
                playerName: currentPlayer.name,
                dice1: dice1,
                dice2: dice2,
                total: total
            }
        );
    });


    // =================================================
    // PLAYER MOVEMENT
    // =================================================

    socket.on("movePlayer", (newPosition) => {

        const currentPlayer = players.get(socket.id);

        if (!currentPlayer) {
            return;
        }


        const room = getPlayerRoom(socket.id);

        if (!room || !room.started) {
            return;
        }


        currentPlayer.position = Number(newPosition);


        console.log(
            `${currentPlayer.name} moved to position ` +
            `${currentPlayer.position}`
        );


        io.to(room.code).emit(
            "playerMoved",
            {
                playerId: currentPlayer.id,
                playerName: currentPlayer.name,
                position: currentPlayer.position
            }
        );


        // Temporary win condition
        if (currentPlayer.position >= 50) {

            io.to(room.code).emit(
                "gameOver",
                {
                    playerId: currentPlayer.id,
                    playerName: currentPlayer.name
                }
            );
        }
    });


    // =================================================
    // PLAYER DISCONNECT
    // =================================================

    socket.on("disconnect", () => {

        const disconnectedPlayer =
            players.get(socket.id);


        if (!disconnectedPlayer) {
            return;
        }


        console.log(
            `${disconnectedPlayer.name} disconnected.`
        );


        const roomCode =
            disconnectedPlayer.roomCode;


        if (!roomCode) {

            players.delete(socket.id);

            return;
        }


        const room = rooms.get(roomCode);


        if (!room) {

            players.delete(socket.id);

            return;
        }


        // ---------------------------------------------
        // HOST LEFT
        // ---------------------------------------------

        if (room.hostId === socket.id) {

            console.log(
                `Host left room ${roomCode}. Closing room.`
            );


            socket.to(roomCode).emit(
                "roomClosed"
            );


            rooms.delete(roomCode);


            room.players.forEach(playerId => {

                const player =
                    players.get(playerId);

                if (player) {
                    player.roomCode = null;
                    player.isHost = false;
                }
            });


            players.delete(socket.id);

            return;
        }


        // ---------------------------------------------
        // NORMAL PLAYER LEFT
        // ---------------------------------------------

        room.players.delete(socket.id);

        players.delete(socket.id);


        io.to(roomCode).emit(
            "playerLeft",
            {
                playerId: socket.id
            }
        );


        broadcastPlayers(roomCode);
    });
});


// =====================================================
// START SERVER
// =====================================================

server.listen(PORT, () => {

    console.log(
        `Get to the Guillotine running at http://localhost:${PORT}`
    );

});