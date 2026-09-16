// =====================================================
// CONNECT TO SERVER
// =====================================================

const socket = io();


// =====================================================
// GET HTML ELEMENTS
// =====================================================

const connectionScreen =
    document.getElementById("connectionScreen");

const lobbyScreen =
    document.getElementById("lobbyScreen");

const gameScreen =
    document.getElementById("gameScreen");

const usernameInput =
    document.getElementById("usernameInput");

const hostButton =
    document.getElementById("hostButton");

const joinButton =
    document.getElementById("joinButton");

const roomCodeInput =
    document.getElementById("roomCodeInput");

const roomCodeDisplay =
    document.getElementById("roomCodeDisplay");

const connectionError =
    document.getElementById("connectionError");

const characterCards =
    document.querySelectorAll(".character-card");

const selectedCharacterDisplay =
    document.getElementById("selectedCharacter");

const startButton =
    document.getElementById("startButton");

const playersList =
    document.getElementById("playersList");

const lobbyMessage =
    document.getElementById("lobbyMessage");

const networkStatus =
    document.getElementById("networkStatus");

const statusIndicator =
    document.getElementById("statusIndicator");


// =====================================================
// LOCAL STATE
// =====================================================

let selectedCharacter = null;
let myPlayerId = null;
let currentRoomCode = null;
let isHost = false;
let gameStarted = false;


// =====================================================
// SCREEN MANAGEMENT
// =====================================================

function showScreen(screen) {

    connectionScreen.classList.add("hidden");
    lobbyScreen.classList.add("hidden");
    gameScreen.classList.add("hidden");

    screen.classList.remove("hidden");
}


// =====================================================
// GET USERNAME
// =====================================================

function getUsername() {

    return usernameInput.value
        .trim()
        .replace(/\s+/g, " ");
}


// =====================================================
// SERVER CONNECTION
// =====================================================

socket.on("connect", () => {

    console.log("Connected to server.");

    networkStatus.textContent =
        "Connected to server";

    statusIndicator.classList.add("connected");
});


socket.on("disconnect", () => {

    console.log("Disconnected from server.");

    networkStatus.textContent =
        "Disconnected";

    statusIndicator.classList.remove("connected");
});


// =====================================================
// USERNAME INPUT
// =====================================================

usernameInput.addEventListener("input", () => {

    connectionError.textContent = "";

});


// =====================================================
// ROOM CODE INPUT
// =====================================================

roomCodeInput.addEventListener("input", () => {

    roomCodeInput.value =
        roomCodeInput.value
            .toUpperCase()
            .replace(/[^A-Z0-9]/g, "");

    connectionError.textContent = "";

});


// =====================================================
// HOST GAME
// =====================================================

hostButton.addEventListener("click", () => {

    const username = getUsername();


    if (!username) {

        connectionError.textContent =
            "Please enter a username.";

        usernameInput.focus();

        return;
    }


    connectionError.textContent = "";

    hostButton.disabled = true;
    joinButton.disabled = true;

    hostButton.textContent =
        "CREATING GAME...";


    socket.emit(
        "hostGame",
        username
    );
});


// =====================================================
// GAME HOSTED
// =====================================================

socket.on("gameHosted", (data) => {

    currentRoomCode =
        data.roomCode;

    myPlayerId =
        data.playerId;

    isHost = true;


    roomCodeDisplay.textContent =
        currentRoomCode;


    lobbyMessage.textContent =
        "You are the host. Choose your character and start the game when everyone is ready.";


    hostButton.disabled = false;
    joinButton.disabled = false;

    hostButton.textContent =
        "HOST GAME";


    showScreen(lobbyScreen);
});


// =====================================================
// HOST ERROR
// =====================================================

socket.on("hostError", (message) => {

    connectionError.textContent =
        message;

    hostButton.disabled = false;
    joinButton.disabled = false;

    hostButton.textContent =
        "HOST GAME";
});


// =====================================================
// JOIN GAME
// =====================================================

joinButton.addEventListener("click", () => {

    const username =
        getUsername();

    const roomCode =
        roomCodeInput.value
            .trim()
            .toUpperCase();


    if (!username) {

        connectionError.textContent =
            "Please enter a username.";

        usernameInput.focus();

        return;
    }


    if (roomCode.length !== 6) {

        connectionError.textContent =
            "Please enter the 6-character game code.";

        roomCodeInput.focus();

        return;
    }


    connectionError.textContent = "";

    hostButton.disabled = true;
    joinButton.disabled = true;

    joinButton.textContent =
        "JOINING...";


    socket.emit(
        "joinGame",
        {
            username: username,
            roomCode: roomCode
        }
    );
});


// =====================================================
// JOIN GAME SUCCESS
// =====================================================

socket.on("gameJoined", (data) => {

    currentRoomCode =
        data.roomCode;

    myPlayerId =
        data.playerId;

    isHost = false;


    roomCodeDisplay.textContent =
        currentRoomCode;


    lobbyMessage.textContent =
        "You joined the game. Choose an available character.";


    hostButton.disabled = false;
    joinButton.disabled = false;

    hostButton.textContent =
        "HOST GAME";

    joinButton.textContent =
        "JOIN GAME";


    showScreen(lobbyScreen);
});


// =====================================================
// JOIN ERROR
// =====================================================

socket.on("joinError", (message) => {

    connectionError.textContent =
        message;

    hostButton.disabled = false;
    joinButton.disabled = false;

    hostButton.textContent =
        "HOST GAME";

    joinButton.textContent =
        "JOIN GAME";
});


// =====================================================
// ENTER KEY
// =====================================================

usernameInput.addEventListener("keydown", (event) => {

    if (event.key === "Enter") {
        hostButton.click();
    }

});


roomCodeInput.addEventListener("keydown", (event) => {

    if (event.key === "Enter") {
        joinButton.click();
    }

});


// =====================================================
// CHARACTER SELECTION
// =====================================================

characterCards.forEach((card) => {

    card.addEventListener("click", () => {

        if (gameStarted) {
            return;
        }

        if (!currentRoomCode) {
            return;
        }


        const characterNumber =
            Number(card.dataset.character);


        socket.emit(
            "selectCharacter",
            characterNumber
        );

    });

});


// =====================================================
// CHARACTER SELECTED
// =====================================================

socket.on("characterSelected", (data) => {

    console.log(
        `${data.playerName} selected Character ${data.character}`
    );


    if (data.playerId === myPlayerId) {

        selectedCharacter =
            data.character;

        selectedCharacterDisplay.textContent =
            `Character ${data.character}`;

    }

});


// =====================================================
// CHARACTER SELECTION ERROR
// =====================================================

socket.on("characterSelectionError", (message) => {

    lobbyMessage.textContent =
        message;

});


// =====================================================
// UPDATE PLAYER LIST
// =====================================================

socket.on("playersUpdated", (players) => {

    console.log(
        "Players in room:",
        players
    );


    playersList.innerHTML = "";


    players.forEach((player) => {

        const playerElement =
            document.createElement("div");

        playerElement.classList.add(
            "player-entry"
        );


        // ---------------------------------------------
        // Player information
        // ---------------------------------------------

        const playerName =
            document.createElement("span");

        playerName.classList.add(
            "player-name"
        );

        playerName.textContent =
            player.name;


        // ---------------------------------------------
        // Character information
        // ---------------------------------------------

        const characterInfo =
            document.createElement("span");

        characterInfo.classList.add(
            "player-character"
        );


        if (player.character !== null) {

            characterInfo.textContent =
                `Character ${player.character}`;

        } else {

            characterInfo.textContent =
                "Choosing character...";

        }


        // ---------------------------------------------
        // Host indicator
        // ---------------------------------------------

        if (player.isHost) {

            const hostLabel =
                document.createElement("span");

            hostLabel.classList.add(
                "host-label"
            );

            hostLabel.textContent =
                "HOST";

            playerName.appendChild(
                hostLabel
            );
        }


        playerElement.appendChild(
            playerName
        );

        playerElement.appendChild(
            characterInfo
        );


        // Highlight yourself
        if (player.id === myPlayerId) {

            playerElement.classList.add(
                "current-player"
            );

        }


        playersList.appendChild(
            playerElement
        );

    });


    // =================================================
    // DISABLE TAKEN CHARACTERS
    // =================================================

    const takenCharacters =
        players
            .filter(
                player =>
                    player.character !== null &&
                    player.id !== myPlayerId
            )
            .map(
                player =>
                    player.character
            );


    characterCards.forEach((card) => {

        const characterNumber =
            Number(card.dataset.character);


        const taken =
            takenCharacters.includes(
                characterNumber
            );


        if (taken) {

            card.classList.add("taken");
            card.disabled = true;

        } else {

            card.classList.remove("taken");
            card.disabled = false;

        }

    });


    // =================================================
    // START BUTTON
    // =================================================

    if (isHost) {

        const allPlayersHaveCharacters =
            players.length > 0 &&
            players.every(
                player =>
                    player.character !== null
            );


        startButton.disabled =
            !allPlayersHaveCharacters;

    } else {

        startButton.disabled = true;

    }

});


// =====================================================
// START GAME
// =====================================================

startButton.addEventListener("click", () => {

    if (!isHost) {
        return;
    }


    socket.emit("startGame");

});


// =====================================================
// START GAME ERROR
// =====================================================

socket.on("startGameError", (message) => {

    lobbyMessage.textContent =
        message;

});


// =====================================================
// GAME STARTED
// =====================================================

socket.on("gameStarted", (data) => {

    console.log(
        "The game has started!",
        data
    );


    gameStarted = true;


    showScreen(gameScreen);

});


// =====================================================
// DICE ROLL
// =====================================================

socket.on("diceRolled", (data) => {

    console.log(
        `${data.playerName} rolled ` +
        `${data.dice1} + ${data.dice2} ` +
        `= ${data.total}`
    );

});


// =====================================================
// PLAYER MOVED
// =====================================================

socket.on("playerMoved", (data) => {

    console.log(
        `${data.playerName} moved to ` +
        `position ${data.position}`
    );

});


// =====================================================
// GAME OVER
// =====================================================

socket.on("gameOver", (data) => {

    console.log(
        `${data.playerName} reached the guillotine!`
    );

});


// =====================================================
// ROOM CLOSED
// =====================================================

socket.on("roomClosed", () => {

    alert(
        "The host left the game."
    );

    window.location.reload();

});