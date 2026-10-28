
// ============================================================
// GET TO THE GUILLOTINE
// MULTIPLAYER SERVER
// ============================================================
//
// Node.js + Express + Socket.IO
//
// This server is responsible for:
//
// - Connecting players
// - Creating game rooms
// - Joining game rooms
// - Player usernames
// - Character selection
// - Starting games
// - Turn order
// - Dice rolls
// - Player movement
// - Synchronizing game state
// - Handling disconnects
// - Transferring the host if the host leaves
//
// IMPORTANT:
// The SERVER is the authority for the game state.
// Clients request actions, but the server decides whether
// those actions are valid.
// ============================================================


const express = require("express");
const http = require("http");
const path = require("path");
const { Server } = require("socket.io");


// ============================================================
// CREATE SERVER
// ============================================================

const app = express();

const server = http.createServer(app);

const io = new Server(server);


// ============================================================
// SERVE THE FRONTEND
// ============================================================

app.use(
    express.static(
        path.join(__dirname, "public")
    )
);


// ============================================================
// GAME SETTINGS
// ============================================================

const PORT = process.env.PORT || 3000;

const MAX_PLAYERS = 8;

const ROOM_CODE_LENGTH = 6;

const NUMBER_OF_CHARACTERS = 8;

const MAX_USERNAME_LENGTH = 16;

// The board currently has 64 spaces.
// Position 0 is the starting space.
// Position 63 is the final space.
const TOTAL_SPACES = 64;

const FINISH_POSITION = TOTAL_SPACES - 1;


// ============================================================
// SERVER DATA
// ============================================================
//
// players:
//     socket.id -> player object
//
// rooms:
//     room code -> room object
//
// The server keeps all active multiplayer games in memory.
// ============================================================

const players = new Map();

const rooms = new Map();


// ============================================================
// ROOM CODE GENERATOR
// ============================================================

function generateRoomCode() {

    // Characters that are easy to distinguish.
    // We leave out O, I, and 1 to avoid confusion.
    const characters =
        "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

    let code;

    do {

        code = "";

        for (
            let i = 0;
            i < ROOM_CODE_LENGTH;
            i++
        ) {

            const randomIndex =
                Math.floor(
                    Math.random() * characters.length
                );

            code += characters[randomIndex];
        }

    } while (rooms.has(code));


    return code;
}


// ============================================================
// CLEAN USERNAME
// ============================================================

function cleanUsername(username) {

    return String(username || "")
        .trim()
        .replace(/\s+/g, " ")
        .slice(0, MAX_USERNAME_LENGTH);
}


// ============================================================
// CLEAN ROOM CODE
// ============================================================

function cleanRoomCode(roomCode) {

    return String(roomCode || "")
        .trim()
        .toUpperCase();
}


// ============================================================
// GET PLAYER
// ============================================================

function getPlayer(socketId) {

    return players.get(socketId) || null;
}


// ============================================================
// GET PLAYER'S ROOM
// ============================================================

function getPlayerRoom(socketId) {

    const player = getPlayer(socketId);

    if (!player || !player.roomCode) {
        return null;
    }

    return rooms.get(player.roomCode) || null;
}


// ============================================================
// GET ROOM PLAYERS
// ============================================================

function getRoomPlayers(room) {

    if (!room) {
        return [];
    }


    return Array.from(room.players)

        .map(playerId =>
            players.get(playerId)
        )

        .filter(Boolean);
}


// ============================================================
// CREATE SAFE PLAYER DATA
// ============================================================
//
// We don't send the entire server-side player object to
// clients. This function controls exactly what the browser
// is allowed to see.
// ============================================================

function getPublicPlayer(player) {

    return {

        id: player.id,

        name: player.name,

        character: player.character,

        position: player.position,

        isHost: player.isHost
    };
}


// ============================================================
// GET PUBLIC PLAYERS
// ============================================================

function getPublicRoomPlayers(room) {

    return getRoomPlayers(room)
        .map(player =>
            getPublicPlayer(player)
        );
}


// ============================================================
// BROADCAST PLAYER LIST
// ============================================================

function broadcastPlayers(roomCode) {

    const room = rooms.get(roomCode);

    if (!room) {
        return;
    }


    io.to(roomCode).emit(
        "playersUpdated",
        getPublicRoomPlayers(room)
    );
}


// ============================================================
// BROADCAST GAME STATE
// ============================================================

function broadcastGameState(room) {

    if (!room) {
        return;
    }


    io.to(room.code).emit(
        "gameStateUpdated",
        {

            roomCode: room.code,

            started: room.started,

            currentPlayerId:
                room.currentPlayerId,

            turnNumber:
                room.turnNumber,

            players:
                getPublicRoomPlayers(room)
        }
    );
}


// ============================================================
// ADVANCE TURN
// ============================================================

function advanceTurn(room) {

    const roomPlayers =
        getRoomPlayers(room);

    if (roomPlayers.length === 0) {

        room.currentPlayerId = null;

        return;
    }


    // Find current player.
    const currentIndex =
        roomPlayers.findIndex(
            player =>
                player.id === room.currentPlayerId
        );


    // If the current player disappeared,
    // start with the first remaining player.
    if (currentIndex === -1) {

        room.currentPlayerId =
            roomPlayers[0].id;

        room.turnNumber++;

        return;
    }


    const nextIndex =
        (currentIndex + 1)
        % roomPlayers.length;


    room.currentPlayerId =
        roomPlayers[nextIndex].id;

    room.turnNumber++;
}


// ============================================================
// CONNECTION
// ============================================================

io.on("connection", (socket) => {

    console.log(
        `Player connected: ${socket.id}`
    );


    // ========================================================
    // CREATE PLAYER
    // ========================================================

    const player = {

        id: socket.id,

        name: "Player",

        character: null,

        position: 0,

        roomCode: null,

        isHost: false
    };


    players.set(
        socket.id,
        player
    );


    // ========================================================
    // CONFIRM CONNECTION
    // ========================================================

    socket.emit(
        "connectionConfirmed",
        {

            playerId: socket.id,

            message:
                "Connected to Get to the Guillotine!"
        }
    );


    // ========================================================
    // HOST GAME
    // ========================================================

    socket.on(
        "hostGame",
        (username) => {

            const currentPlayer =
                getPlayer(socket.id);


            if (!currentPlayer) {
                return;
            }


            username =
                cleanUsername(username);


            // -----------------------------------------------
            // Validate username
            // -----------------------------------------------

            if (!username) {

                socket.emit(
                    "hostError",
                    "Please enter a username."
                );

                return;
            }


            if (
                username.length >
                MAX_USERNAME_LENGTH
            ) {

                socket.emit(
                    "hostError",
                    `Username must be ${MAX_USERNAME_LENGTH} characters or less.`
                );

                return;
            }


            // -----------------------------------------------
            // Make sure player is not already in a room
            // -----------------------------------------------

            if (currentPlayer.roomCode) {

                socket.emit(
                    "hostError",
                    "You are already in a game."
                );

                return;
            }


            // -----------------------------------------------
            // Create room
            // -----------------------------------------------

            const roomCode =
                generateRoomCode();


            const room = {

                code: roomCode,

                hostId: socket.id,

                players: new Set(),

                started: false,

                currentPlayerId: null,

                turnNumber: 0
            };


            rooms.set(
                roomCode,
                room
            );


            // -----------------------------------------------
            // Add host to room
            // -----------------------------------------------

            currentPlayer.name =
                username;

            currentPlayer.roomCode =
                roomCode;

            currentPlayer.isHost =
                true;

            currentPlayer.character =
                null;

            currentPlayer.position =
                0;


            room.players.add(
                socket.id
            );


            socket.join(
                roomCode
            );


            console.log(
                `${currentPlayer.name} created room ${roomCode}`
            );


            // -----------------------------------------------
            // Tell host room was created
            // -----------------------------------------------

            socket.emit(
                "gameHosted",
                {

                    roomCode: roomCode,

                    playerId: socket.id,

                    playerName:
                        currentPlayer.name
                }
            );


            // -----------------------------------------------
            // Send player list
            // -----------------------------------------------

            broadcastPlayers(
                roomCode
            );
        }
    );


    // ========================================================
    // JOIN GAME
    // ========================================================

    socket.on(
        "joinGame",
        (data) => {

            const currentPlayer =
                getPlayer(socket.id);


            if (!currentPlayer) {
                return;
            }


            let username = "";

            let roomCode = "";


            // ------------------------------------------------
            // Expected format:
            //
            // {
            //     username: "John",
            //     roomCode: "ABC123"
            // }
            // ------------------------------------------------

            if (
                data &&
                typeof data === "object"
            ) {

                username =
                    data.username;

                roomCode =
                    data.roomCode;

            } else {

                // Compatibility with an older version
                // that only sent the room code.
                roomCode =
                    data;
            }


            username =
                cleanUsername(username);

            roomCode =
                cleanRoomCode(roomCode);


            // -----------------------------------------------
            // Validate username
            // -----------------------------------------------

            if (!username) {

                socket.emit(
                    "joinError",
                    "Please enter a username."
                );

                return;
            }


            if (
                username.length >
                MAX_USERNAME_LENGTH
            ) {

                socket.emit(
                    "joinError",
                    `Username must be ${MAX_USERNAME_LENGTH} characters or less.`
                );

                return;
            }


            // -----------------------------------------------
            // Validate room code
            // -----------------------------------------------

            if (
                roomCode.length !==
                ROOM_CODE_LENGTH
            ) {

                socket.emit(
                    "joinError",
                    "Please enter the 6-character game code."
                );

                return;
            }


            // -----------------------------------------------
            // Check room
            // -----------------------------------------------

            const room =
                rooms.get(roomCode);


            if (!room) {

                socket.emit(
                    "joinError",
                    "That game does not exist."
                );

                return;
            }


            // -----------------------------------------------
            // Don't allow joining a started game
            // -----------------------------------------------

            if (room.started) {

                socket.emit(
                    "joinError",
                    "That game has already started."
                );

                return;
            }


            // -----------------------------------------------
            // Player limit
            // -----------------------------------------------

            if (
                room.players.size >=
                MAX_PLAYERS
            ) {

                socket.emit(
                    "joinError",
                    "That game is full."
                );

                return;
            }


            // -----------------------------------------------
            // Don't allow duplicate names
            // -----------------------------------------------

            const nameAlreadyUsed =
                getRoomPlayers(room)
                    .some(
                        player =>
                            player.name.toLowerCase() ===
                            username.toLowerCase()
                    );


            if (nameAlreadyUsed) {

                socket.emit(
                    "joinError",
                    "That username is already being used in this game."
                );

                return;
            }


            // -----------------------------------------------
            // Add player
            // -----------------------------------------------

            currentPlayer.name =
                username;

            currentPlayer.roomCode =
                roomCode;

            currentPlayer.isHost =
                false;

            currentPlayer.character =
                null;

            currentPlayer.position =
                0;


            room.players.add(
                socket.id
            );


            socket.join(
                roomCode
            );


            console.log(
                `${currentPlayer.name} joined room ${roomCode}`
            );


            // -----------------------------------------------
            // Tell joining player
            // -----------------------------------------------

            socket.emit(
                "gameJoined",
                {

                    roomCode: roomCode,

                    playerId: socket.id,

                    playerName:
                        currentPlayer.name
                }
            );


            // -----------------------------------------------
            // Tell everyone
            // -----------------------------------------------

            io.to(roomCode).emit(
                "playerJoined",
                {

                    playerId:
                        currentPlayer.id,

                    playerName:
                        currentPlayer.name
                }
            );


            broadcastPlayers(
                roomCode
            );
        }
    );


    // ========================================================
    // CHARACTER SELECTION
    // ========================================================

    socket.on(
        "selectCharacter",
        (characterNumber) => {

            const currentPlayer =
                getPlayer(socket.id);


            if (!currentPlayer) {
                return;
            }


            const room =
                getPlayerRoom(socket.id);


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


            characterNumber =
                Number(characterNumber);


            // -----------------------------------------------
            // Validate character number
            // -----------------------------------------------

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


            // -----------------------------------------------
            // Check if another player has the character
            // -----------------------------------------------

            const characterTaken =
                getRoomPlayers(room)
                    .some(
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


            // -----------------------------------------------
            // Select character
            // -----------------------------------------------

            currentPlayer.character =
                characterNumber;


            console.log(
                `${currentPlayer.name} selected Character ${characterNumber}`
            );


            io.to(room.code).emit(
                "characterSelected",
                {

                    playerId:
                        currentPlayer.id,

                    playerName:
                        currentPlayer.name,

                    character:
                        characterNumber
                }
            );


            broadcastPlayers(
                room.code
            );
        }
    );


    // ========================================================
    // START GAME
    // ========================================================

    socket.on(
        "startGame",
        () => {

            const currentPlayer =
                getPlayer(socket.id);


            if (!currentPlayer) {
                return;
            }


            const room =
                getPlayerRoom(socket.id);


            if (!room) {

                socket.emit(
                    "startGameError",
                    "You are not in a game."
                );

                return;
            }


            // -----------------------------------------------
            // Only host can start
            // -----------------------------------------------

            if (
                room.hostId !==
                socket.id
            ) {

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


            const roomPlayers =
                getRoomPlayers(room);


            // -----------------------------------------------
            // Everyone needs a character
            // -----------------------------------------------

            const everyoneHasCharacter =
                roomPlayers.length > 0 &&
                roomPlayers.every(
                    player =>
                        player.character !== null
                );


            if (!everyoneHasCharacter) {

                socket.emit(
                    "startGameError",
                    "Everyone must select a character before the game can start."
                );

                return;
            }


            // -----------------------------------------------
            // Start game
            // -----------------------------------------------

            room.started =
                true;


            room.turnNumber =
                1;


            room.currentPlayerId =
                roomPlayers[0].id;


            // Reset positions
            roomPlayers.forEach(
                player => {

                    player.position = 0;

                }
            );


            console.log(
                `Room ${room.code} has started.`
            );


            // -----------------------------------------------
            // Tell everyone
            // -----------------------------------------------

            io.to(room.code).emit(
                "gameStarted",
                {

                    roomCode:
                        room.code,

                    currentPlayerId:
                        room.currentPlayerId,

                    turnNumber:
                        room.turnNumber,

                    players:
                        getPublicRoomPlayers(room)
                }
            );


            broadcastGameState(
                room
            );
        }
    );


    // ========================================================
    // ROLL DICE
    // ========================================================
    //
    // The client only asks to roll.
    //
    // The server:
    //   1. Checks whose turn it is
    //   2. Rolls the dice
    //   3. Calculates movement
    //   4. Updates the player's position
    //   5. Sends the result to everyone
    //   6. Advances the turn
    //
    // This prevents individual clients from deciding their
    // own dice results or positions.
    // ========================================================

    socket.on(
        "rollDice",
        () => {

            const currentPlayer =
                getPlayer(socket.id);


            if (!currentPlayer) {
                return;
            }


            const room =
                getPlayerRoom(socket.id);


            if (!room) {

                socket.emit(
                    "diceRollError",
                    "You are not in a game."
                );

                return;
            }


            if (!room.started) {

                socket.emit(
                    "diceRollError",
                    "The game has not started yet."
                );

                return;
            }


            // -----------------------------------------------
            // Make sure it is this player's turn
            // -----------------------------------------------

            if (
                room.currentPlayerId !==
                socket.id
            ) {

                socket.emit(
                    "diceRollError",
                    "It is not your turn."
                );

                return;
            }


            // -----------------------------------------------
            // Roll two six-sided dice
            // -----------------------------------------------

            const dice1 =
                Math.floor(
                    Math.random() * 6
                ) + 1;


            const dice2 =
                Math.floor(
                    Math.random() * 6
                ) + 1;


            const total =
                dice1 + dice2;


            const oldPosition =
                currentPlayer.position;


            let newPosition =
                oldPosition + total;


            // Don't go past the finish.
            if (
                newPosition >
                FINISH_POSITION
            ) {

                newPosition =
                    FINISH_POSITION;
            }


            currentPlayer.position =
                newPosition;


            console.log(
                `${currentPlayer.name} rolled ` +
                `${dice1} + ${dice2} = ${total} ` +
                `and moved from ${oldPosition} ` +
                `to ${newPosition}`
            );


            // -----------------------------------------------
            // Tell everyone about the dice
            // -----------------------------------------------

            io.to(room.code).emit(
                "diceRolled",
                {

                    playerId:
                        currentPlayer.id,

                    playerName:
                        currentPlayer.name,

                    dice1:
                        dice1,

                    dice2:
                        dice2,

                    total:
                        total,

                    oldPosition:
                        oldPosition,

                    newPosition:
                        newPosition,

                    turnNumber:
                        room.turnNumber
                }
            );


            // -----------------------------------------------
            // Tell everyone about movement
            // -----------------------------------------------

            io.to(room.code).emit(
                "playerMoved",
                {

                    playerId:
                        currentPlayer.id,

                    playerName:
                        currentPlayer.name,

                    position:
                        newPosition,

                    oldPosition:
                        oldPosition
                }
            );


            // -----------------------------------------------
            // Check for winner
            // -----------------------------------------------

            if (
                newPosition >=
                FINISH_POSITION
            ) {

                room.started =
                    false;


                io.to(room.code).emit(
                    "gameOver",
                    {

                        playerId:
                            currentPlayer.id,

                        playerName:
                            currentPlayer.name,

                        position:
                            newPosition
                    }
                );


                broadcastGameState(
                    room
                );


                return;
            }


            // -----------------------------------------------
            // Advance to next player
            // -----------------------------------------------

            advanceTurn(room);


            // -----------------------------------------------
            // Send updated state
            // -----------------------------------------------

            broadcastGameState(
                room
            );
        }
    );


    // ========================================================
    // MOVE PLAYER
    // ========================================================
    //
    // This event is kept for compatibility with the current
    // project and future GameBoard integration.
    //
    // The client should NOT normally use this event for
    // regular dice movement. rollDice now handles movement
    // on the server.
    //
    // A future board system can use a validated movement
    // request here if needed.
    // ========================================================

    socket.on(
        "movePlayer",
        (requestedPosition) => {

            const currentPlayer =
                getPlayer(socket.id);


            if (!currentPlayer) {
                return;
            }


            const room =
                getPlayerRoom(socket.id);


            if (!room || !room.started) {
                return;
            }


            // Only the current player may move.
            if (
                room.currentPlayerId !==
                socket.id
            ) {

                socket.emit(
                    "moveError",
                    "It is not your turn."
                );

                return;
            }


            requestedPosition =
                Number(requestedPosition);


            if (
                !Number.isInteger(
                    requestedPosition
                )
            ) {

                socket.emit(
                    "moveError",
                    "Invalid position."
                );

                return;
            }


            // Only allow movement forward.
            if (
                requestedPosition <
                currentPlayer.position
            ) {

                socket.emit(
                    "moveError",
                    "Players cannot move backwards using this action."
                );

                return;
            }


            // Don't allow a client to jump beyond the board.
            if (
                requestedPosition >
                FINISH_POSITION
            ) {

                requestedPosition =
                    FINISH_POSITION;
            }


            const oldPosition =
                currentPlayer.position;


            currentPlayer.position =
                requestedPosition;


            io.to(room.code).emit(
                "playerMoved",
                {

                    playerId:
                        currentPlayer.id,

                    playerName:
                        currentPlayer.name,

                    position:
                        currentPlayer.position,

                    oldPosition:
                        oldPosition
                }
            );


            // Check win
            if (
                currentPlayer.position >=
                FINISH_POSITION
            ) {

                room.started =
                    false;


                io.to(room.code).emit(
                    "gameOver",
                    {

                        playerId:
                            currentPlayer.id,

                        playerName:
                            currentPlayer.name,

                        position:
                            currentPlayer.position
                    }
                );


                broadcastGameState(
                    room
                );

                return;
            }


            advanceTurn(room);

            broadcastGameState(room);
        }
    );


    // ========================================================
    // DISCONNECT
    // ========================================================

    socket.on(
        "disconnect",
        () => {

            const disconnectedPlayer =
                getPlayer(socket.id);


            if (!disconnectedPlayer) {
                return;
            }


            console.log(
                `${disconnectedPlayer.name} disconnected.`
            );


            const roomCode =
                disconnectedPlayer.roomCode;


            // Player wasn't in a room.
            if (!roomCode) {

                players.delete(
                    socket.id
                );

                return;
            }


            const room =
                rooms.get(roomCode);


            if (!room) {

                players.delete(
                    socket.id
                );

                return;
            }


            // Remove the player.
            room.players.delete(
                socket.id
            );


            players.delete(
                socket.id
            );


            // =================================================
            // HOST LEFT
            // =================================================

            if (
                room.hostId ===
                socket.id
            ) {

                const remainingPlayers =
                    getRoomPlayers(room);


                // ---------------------------------------------
                // Nobody remains.
                // ---------------------------------------------

                if (
                    remainingPlayers.length === 0
                ) {

                    rooms.delete(
                        roomCode
                    );

                    console.log(
                        `Room ${roomCode} closed because everyone left.`
                    );

                    return;
                }


                // ---------------------------------------------
                // Transfer host to another player.
                // ---------------------------------------------

                const newHost =
                    remainingPlayers[0];


                room.hostId =
                    newHost.id;


                // Reset everyone to non-host first.
                remainingPlayers.forEach(
                    player => {

                        player.isHost =
                            false;

                    }
                );


                newHost.isHost =
                    true;


                console.log(
                    `${newHost.name} is now host of room ${roomCode}`
                );


                io.to(roomCode).emit(
                    "hostChanged",
                    {

                        playerId:
                            newHost.id,

                        playerName:
                            newHost.name
                    }
                );
            }


            // =================================================
            // IF THE CURRENT TURN PLAYER LEFT
            // =================================================

            if (
                room.started &&
                room.currentPlayerId ===
                socket.id
            ) {

                advanceTurn(room);
            }


            // =================================================
            // TELL ROOM PLAYER LEFT
            // =================================================

            io.to(roomCode).emit(
                "playerLeft",
                {

                    playerId:
                        socket.id,

                    playerName:
                        disconnectedPlayer.name
                }
            );


            broadcastPlayers(
                roomCode
            );


            if (room.started) {

                broadcastGameState(
                    room
                );
            }
        }
    );
});


// ============================================================
// START SERVER
// ============================================================

server.listen(
    PORT,
    "0.0.0.0",
    () => {

        console.log(
            "=============================================="
        );

        console.log(
            "GET TO THE GUILLOTINE SERVER"
        );

        console.log(
            "=============================================="
        );

        console.log(
            `Server running on port ${PORT}`
        );

        console.log(
            `Local: http://localhost:${PORT}`
        );

        console.log(
            "Network access is enabled."
        );

        console.log(
            "=============================================="
        );
    }
);
