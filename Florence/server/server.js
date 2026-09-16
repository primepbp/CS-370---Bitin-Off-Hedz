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