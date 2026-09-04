// Client server using node.js, express and socket.io. Server can accept multiple clients, track connected players, and send/recieve
// game events between clients and the server. Networking for player connection, char selection, starting game, dice rolls, player
// movements, and disconnections is done (and hopefully works). 

// Hopefully when it's all complete, we can have it online mulitplayer. Obviously the other clients (you guys) would have to be in 
// range to the game running off my laptop but it should be possible to all connect to the same Node server 


const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Serve the files inside the public folder
app.use(express.static(path.join(__dirname, "public")));

// Store connected players
const players = new Map();


// =====================================================
// CLIENT CONNECTION
// =====================================================

io.on("connection", (socket) => {
    console.log(`Player connected: ${socket.id}`);

    // Create a new player
    const player = {
        id: socket.id,
        name: `Player ${players.size + 1}`,
        character: null,
        position: 0
    };

    players.set(socket.id, player);

    // Tell this client that the connection worked
    socket.emit("connectionConfirmed", {
        playerId: socket.id,
        message: "Connected to Get to the Guillotine!"
    });

    // Tell everyone that a new player joined
    io.emit("playerJoined", {
        id: player.id,
        name: player.name,
        character: player.character
    });

    // Send the current player list to everyone
    broadcastPlayers();


    // =================================================
    // CHARACTER SELECTION
    // =================================================

    socket.on("selectCharacter", (characterNumber) => {
        const currentPlayer = players.get(socket.id);

        if (!currentPlayer) {
            return;
        }

        currentPlayer.character = characterNumber;

        console.log(
            `${currentPlayer.name} selected Character ${characterNumber}`
        );

        // Tell every connected client about the selection
        io.emit("characterSelected", {
            playerId: currentPlayer.id,
            playerName: currentPlayer.name,
            character: characterNumber
        });

        broadcastPlayers();
    });


    // =================================================
    // START GAME
    // =================================================

    socket.on("startGame", () => {
        console.log("Game start requested.");

        // Tell every connected client that the game started
        io.emit("gameStarted");
    });


    // =================================================
    // DICE ROLL
    // =================================================

    socket.on("rollDice", () => {
        const currentPlayer = players.get(socket.id);

        if (!currentPlayer) {
            return;
        }

        const dice1 = Math.floor(Math.random() * 6) + 1;
        const dice2 = Math.floor(Math.random() * 6) + 1;

        const total = dice1 + dice2;

        console.log(
            `${currentPlayer.name} rolled ${dice1} + ${dice2} = ${total}`
        );

        // Tell every client what was rolled
        io.emit("diceRolled", {
            playerId: currentPlayer.id,
            playerName: currentPlayer.name,
            dice1: dice1,
            dice2: dice2,
            total: total
        });
    });


    // =================================================
    // PLAYER MOVEMENT
    // =================================================

    socket.on("movePlayer", (newPosition) => {
        const currentPlayer = players.get(socket.id);

        if (!currentPlayer) {
            return;
        }

        currentPlayer.position = newPosition;

        console.log(
            `${currentPlayer.name} moved to position ${newPosition}`
        );

        // Tell every client about the movement
        io.emit("playerMoved", {
            playerId: currentPlayer.id,
            playerName: currentPlayer.name,
            position: newPosition
        });

        // Temporary win condition
        // The actual board will eventually replace this.
        if (newPosition >= 50) {
            io.emit("gameOver", {
                playerId: currentPlayer.id,
                playerName: currentPlayer.name
            });
        }
    });


    // =================================================
    // PLAYER DISCONNECT
    // =================================================

    socket.on("disconnect", () => {
        const disconnectedPlayer = players.get(socket.id);

        if (disconnectedPlayer) {
            console.log(
                `${disconnectedPlayer.name} disconnected.`
            );
        }

        players.delete(socket.id);

        // Tell everyone that this player left
        io.emit("playerLeft", {
            playerId: socket.id
        });

        broadcastPlayers();
    });
});


// =====================================================
// SEND PLAYER LIST TO EVERYONE
// =====================================================

function broadcastPlayers() {
    io.emit(
        "playersUpdated",
        Array.from(players.values())
    );
}


// =====================================================
// START SERVER
// =====================================================

const PORT = 3000;

server.listen(PORT, () => {
    console.log(
        `Get to the Guillotine running at http://localhost:${PORT}`
    );
});