
/*
 * GET TO THE GUILLOTINE (GTTG)
 * Multiplayer Networking Server
 *
 * Features:
 * - Multiple players connected to one server
 * - Host and join games using room codes
 * - Shared player lists and character selection
 * - Maximum of 8 players per room
 * - Host-only game start
 * - Shared dice rolls, movement, and turn order
 * - Player disconnect handling
 *
 * Storage:
 * All game data is stored in server memory.
 * Rooms disappear when the server shuts down.
 */

const express = require("express");
const http = require("http");
const path = require("path");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Serve the existing HTML, CSS, and client JavaScript.
app.use(express.static(path.join(__dirname, "public")));

const PORT = process.env.PORT || 3000;
const MAX_PLAYERS = 8;
const MAX_USERNAME_LENGTH = 16;
const ROOM_CODE_LENGTH = 6;
const NUMBER_OF_CHARACTERS = 8;

// The current GameBoard.js prototype has 64 spaces,
// numbered 0 through 63.
const FINISH_POSITION = 63;

// socket ID -> player data
const players = new Map();

// room code -> room data
const rooms = new Map();

// --------------------------------------------------
// ROOM AND PLAYER HELPERS
// --------------------------------------------------

function generateRoomCode() {
    const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let code;

    do {
        code = "";

        for (let i = 0; i < ROOM_CODE_LENGTH; i++) {
            const index = Math.floor(
                Math.random() * alphabet.length
            );

            code += alphabet[index];
        }
    } while (rooms.has(code));

    return code;
}

function cleanUsername(value) {
    return String(value || "")
        .trim()
        .replace(/\s+/g, " ");
}

function getPlayerRoom(playerId) {
    const player = players.get(playerId);

    if (!player || !player.roomCode) {
        return null;
    }

    return rooms.get(player.roomCode) || null;
}

function getRoomPlayers(room) {
    return Array.from(room.players)
        .map(id => players.get(id))
        .filter(Boolean);
}

// Only send the information clients need.
function getPublicPlayer(player) {
    return {
        id: player.id,
        name: player.name,
        character: player.character,
        position: player.position,
        coins: player.coins,
        isHost: player.isHost
    };
}

function broadcastPlayers(roomCode) {
    const room = rooms.get(roomCode);

    if (!room) {
        return;
    }

    const publicPlayers = getRoomPlayers(room)
        .map(getPublicPlayer);

    io.to(roomCode).emit("playersUpdated", publicPlayers);
}

function sendTurnUpdate(room) {
    const currentPlayer = players.get(room.currentTurnPlayerId);

    io.to(room.code).emit("turnUpdated", {
        currentPlayerId: room.currentTurnPlayerId,
        currentPlayerName: currentPlayer
            ? currentPlayer.name
            : null
    });
}

function advanceTurn(room) {
    const playerIds = Array.from(room.players);

    if (playerIds.length === 0) {
        room.currentTurnPlayerId = null;
        return;
    }

    const currentIndex = playerIds.indexOf(
        room.currentTurnPlayerId
    );

    room.currentTurnPlayerId =
        playerIds[(currentIndex + 1) % playerIds.length];
}

function sendActionError(socket, message) {
    socket.emit("gameActionError", message);
}

// --------------------------------------------------
// CLIENT CONNECTION
// --------------------------------------------------

io.on("connection", socket => {
    console.log("Connected:", socket.id);

    const player = {
        id: socket.id,
        name: "Player",
        character: null,
        position: 0,
        coins: 0,
        roomCode: null,
        isHost: false
    };

    players.set(socket.id, player);

    socket.emit("connectionConfirmed", {
        playerId: socket.id,
        message: "Connected to GTTG server."
    });

    // ------------------------------------------------
    // HOST A GAME
    // ------------------------------------------------

    socket.on("hostGame", username => {
        const currentPlayer = players.get(socket.id);

        if (!currentPlayer) return;

        username = cleanUsername(username);

        if (!username || username.length > MAX_USERNAME_LENGTH) {
            socket.emit(
                "hostError",
                `Enter a username of 1-${MAX_USERNAME_LENGTH} characters.`
            );
            return;
        }

        if (currentPlayer.roomCode) {
            socket.emit("hostError", "You are already in a game.");
            return;
        }

        currentPlayer.name = username;

        const code = generateRoomCode();

        const room = {
            code,
            hostId: socket.id,
            players: new Set([socket.id]),
            started: false,
            gameOver: false,
            currentTurnPlayerId: null,
            pendingRoll: null
        };

        rooms.set(code, room);

        currentPlayer.roomCode = code;
        currentPlayer.isHost = true;

        socket.join(code);

        console.log(`${username} hosted room ${code}`);

        socket.emit("gameHosted", {
            roomCode: code,
            playerId: socket.id,
            playerName: username
        });

        broadcastPlayers(code);
    });

    // ------------------------------------------------
    // JOIN AN EXISTING GAME
    // ------------------------------------------------

    socket.on("joinGame", data => {
        const currentPlayer = players.get(socket.id);

        if (!currentPlayer) return;

        // The current client sends { username, roomCode }.
        const username = cleanUsername(
            data && typeof data === "object"
                ? data.username
                : ""
        );

        const code = String(
            data && typeof data === "object"
                ? data.roomCode || ""
                : data || ""
        ).trim().toUpperCase();

        if (!username || username.length > MAX_USERNAME_LENGTH) {
            socket.emit(
                "joinError",
                `Enter a username of 1-${MAX_USERNAME_LENGTH} characters.`
            );
            return;
        }

        if (currentPlayer.roomCode) {
            socket.emit("joinError", "You are already in a game.");
            return;
        }

        if (code.length !== ROOM_CODE_LENGTH) {
            socket.emit("joinError", "Enter the 6-character game code.");
            return;
        }

        const room = rooms.get(code);

        if (!room) {
            socket.emit("joinError", "Game not found. Check the code.");
            return;
        }

        if (room.started) {
            socket.emit("joinError", "That game has already started.");
            return;
        }

        if (room.players.size >= MAX_PLAYERS) {
            socket.emit("joinError", "That game is full.");
            return;
        }

        currentPlayer.name = username;
        currentPlayer.roomCode = code;
        currentPlayer.isHost = false;

        room.players.add(socket.id);
        socket.join(code);

        console.log(`${username} joined room ${code}`);

        socket.emit("gameJoined", {
            roomCode: code,
            playerId: socket.id,
            playerName: username
        });

        io.to(code).emit("playerJoined", {
            id: currentPlayer.id,
            name: currentPlayer.name
        });

        broadcastPlayers(code);
    });

    // ------------------------------------------------
    // CHARACTER SELECTION
    // ------------------------------------------------

    socket.on("selectCharacter", value => {
        const currentPlayer = players.get(socket.id);
        const room = getPlayerRoom(socket.id);

        if (!currentPlayer || !room) {
            socket.emit(
                "characterSelectionError",
                "Join a game before selecting a character."
            );
            return;
        }

        if (room.started) {
            socket.emit(
                "characterSelectionError",
                "Character selection is locked."
            );
            return;
        }

        const character = Number(value);

        if (
            !Number.isInteger(character) ||
            character < 1 ||
            character > NUMBER_OF_CHARACTERS
        ) {
            socket.emit(
                "characterSelectionError",
                "Invalid character."
            );
            return;
        }

        const alreadyTaken = getRoomPlayers(room).some(other =>
            other.id !== socket.id &&
            other.character === character
        );

        if (alreadyTaken) {
            socket.emit(
                "characterSelectionError",
                "That character is already taken."
            );
            return;
        }

        currentPlayer.character = character;

        io.to(room.code).emit("characterSelected", {
            playerId: currentPlayer.id,
            playerName: currentPlayer.name,
            character
        });

        broadcastPlayers(room.code);
    });

    // ------------------------------------------------
    // START GAME
    // ------------------------------------------------

    socket.on("startGame", () => {
        const room = getPlayerRoom(socket.id);

        if (!room) {
            socket.emit("startGameError", "You are not in a game.");
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

        if (
            roomPlayers.length < 1 ||
            !roomPlayers.every(p => p.character !== null)
        ) {
            socket.emit(
                "startGameError",
                "Every player must select a character first."
            );
            return;
        }

        room.started = true;
        room.currentTurnPlayerId = room.hostId;

        console.log(`Game started in room ${room.code}`);

        io.to(room.code).emit("gameStarted", {
            roomCode: room.code,
            players: roomPlayers.map(getPublicPlayer),
            currentPlayerId: room.currentTurnPlayerId
        });

        sendTurnUpdate(room);
    });

    // ------------------------------------------------
    // ROLL DICE
    // ------------------------------------------------

    socket.on("rollDice", () => {
        const currentPlayer = players.get(socket.id);
        const room = getPlayerRoom(socket.id);

        if (!currentPlayer || !room || !room.started || room.gameOver) {
            sendActionError(socket, "The game is not active.");
            return;
        }

        if (room.currentTurnPlayerId !== socket.id) {
            sendActionError(socket, "It is not your turn.");
            return;
        }

        // Prevent a player from rolling repeatedly before moving.
        if (room.pendingRoll) {
            sendActionError(socket, "Finish the current move first.");
            return;
        }

        const dice1 = Math.floor(Math.random() * 6) + 1;
        const dice2 = Math.floor(Math.random() * 6) + 1;
        const total = dice1 + dice2;

        // The server, not the browser, stores the roll.
        room.pendingRoll = {
            playerId: socket.id,
            dice1,
            dice2,
            total
        };

        io.to(room.code).emit("diceRolled", {
            playerId: socket.id,
            playerName: currentPlayer.name,
            dice1,
            dice2,
            total
        });
    });

    // ------------------------------------------------
    // MOVE PLAYER AFTER A ROLL
    // ------------------------------------------------
    //
    // The client calls socket.emit("movePlayer") after
    // handling/animating the roll. The server calculates
    // the position using its stored roll.
    //
    // This is a basic movement placeholder. Special
    // spaces and character powers can be added later.
    // ------------------------------------------------

    socket.on("movePlayer", () => {
        const currentPlayer = players.get(socket.id);
        const room = getPlayerRoom(socket.id);

        if (!currentPlayer || !room || !room.started || room.gameOver) {
            sendActionError(socket, "The game is not active.");
            return;
        }

        if (room.currentTurnPlayerId !== socket.id) {
            sendActionError(socket, "It is not your turn.");
            return;
        }

        const roll = room.pendingRoll;

        if (!roll || roll.playerId !== socket.id) {
            sendActionError(socket, "Roll the dice before moving.");
            return;
        }

        const proposedPosition = currentPlayer.position + roll.total;

        // The current board prototype uses an exact roll
        // to reach the final space.
        if (proposedPosition <= FINISH_POSITION) {
            currentPlayer.position = proposedPosition;
        }

        room.pendingRoll = null;

        io.to(room.code).emit("playerMoved", {
            playerId: currentPlayer.id,
            playerName: currentPlayer.name,
            position: currentPlayer.position,
            roll: roll.total
        });

        broadcastPlayers(room.code);

        if (currentPlayer.position === FINISH_POSITION) {
            room.gameOver = true;

            io.to(room.code).emit("gameOver", {
                playerId: currentPlayer.id,
                playerName: currentPlayer.name
            });

            return;
        }

        advanceTurn(room);
        sendTurnUpdate(room);
    });

    // ------------------------------------------------
    // DISCONNECT / LEAVE GAME
    // ------------------------------------------------

    socket.on("disconnect", () => {
        const disconnectedPlayer = players.get(socket.id);

        if (!disconnectedPlayer) return;

        const code = disconnectedPlayer.roomCode;

        console.log(`${disconnectedPlayer.name} disconnected`);

        if (!code) {
            players.delete(socket.id);
            return;
        }

        const room = rooms.get(code);

        if (!room) {
            players.delete(socket.id);
            return;
        }

        // If the host leaves, close their room.
        if (room.hostId === socket.id) {
            socket.to(code).emit("roomClosed");

            for (const playerId of room.players) {
                const otherPlayer = players.get(playerId);

                if (otherPlayer && playerId !== socket.id) {
                    otherPlayer.roomCode = null;
                    otherPlayer.isHost = false;
                    otherPlayer.character = null;
                    otherPlayer.position = 0;
                    otherPlayer.coins = 0;
                }
            }

            rooms.delete(code);
            players.delete(socket.id);

            console.log(`Room ${code} closed because the host left`);
            return;
        }

        const wasCurrentTurn = room.currentTurnPlayerId === socket.id;

        room.players.delete(socket.id);
        players.delete(socket.id);

        if (room.pendingRoll?.playerId === socket.id) {
            room.pendingRoll = null;
        }

        if (wasCurrentTurn) {
            room.currentTurnPlayerId = null;

            if (room.players.size > 0) {
                room.currentTurnPlayerId = Array.from(room.players)[0];
            }
        }

        io.to(code).emit("playerLeft", {
            playerId: socket.id
        });

        if (room.players.size === 0) {
            rooms.delete(code);
            return;
        }

        broadcastPlayers(code);

        if (room.started && !room.gameOver) {
            sendTurnUpdate(room);
        }
    });
});

// --------------------------------------------------
// START SERVER
// --------------------------------------------------

server.listen(PORT, "0.0.0.0", () => {
    console.log(`GTTG server running on port ${PORT}`);
    console.log(`Local address: http://localhost:${PORT}`);
});
