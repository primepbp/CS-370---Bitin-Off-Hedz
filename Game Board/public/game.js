
// ============================================================
// GET TO THE GUILLOTINE
// CLIENT NETWORKING
// ============================================================
//
// This file handles:
//
// - Connecting to the Socket.IO server
// - Hosting games
// - Joining games
// - Character selection
// - Lobby synchronization
// - Starting games
// - Turn display
// - Dice rolling
// - Player movement display
// - Disconnect handling
//
// The SERVER is responsible for the actual game state.
// ============================================================


// ============================================================
// CONNECT TO SERVER
// ============================================================

const socket = io();


// ============================================================
// GET HTML ELEMENTS
// ============================================================

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


// ============================================================
// LOCAL STATE
// ============================================================

let selectedCharacter = null;

let myPlayerId = null;

let currentRoomCode = null;

let isHost = false;

let gameStarted = false;

let currentPlayerTurnId = null;

let currentTurnNumber = 0;

let latestPlayers = [];


// ============================================================
// SCREEN MANAGEMENT
// ============================================================

function showScreen(screen) {

    connectionScreen.classList.add(
        "hidden"
    );

    lobbyScreen.classList.add(
        "hidden"
    );

    gameScreen.classList.add(
        "hidden"
    );


    screen.classList.remove(
        "hidden"
    );
}


// ============================================================
// GET USERNAME
// ============================================================

function getUsername() {

    return usernameInput.value
        .trim()
        .replace(/\s+/g, " ");
}


// ============================================================
// DISPLAY ERROR
// ============================================================

function showConnectionError(message) {

    connectionError.textContent =
        message;
}


// ============================================================
// SERVER CONNECTION
// ============================================================

socket.on(
    "connect",
    () => {

        console.log(
            "Connected to server."
        );


        networkStatus.textContent =
            "Connected to server";


        statusIndicator.classList.add(
            "connected"
        );
    }
);


socket.on(
    "connectionConfirmed",
    (data) => {

        console.log(
            data.message
        );

        myPlayerId =
            data.playerId;
    }
);


socket.on(
    "disconnect",
    () => {

        console.log(
            "Disconnected from server."
        );


        networkStatus.textContent =
            "Disconnected";


        statusIndicator.classList.remove(
            "connected"
        );
    }
);


// ============================================================
// USERNAME INPUT
// ============================================================

usernameInput.addEventListener(
    "input",
    () => {

        showConnectionError("");
    }
);


// ============================================================
// ROOM CODE INPUT
// ============================================================

roomCodeInput.addEventListener(
    "input",
    () => {

        roomCodeInput.value =
            roomCodeInput.value
                .toUpperCase()
                .replace(
                    /[^A-Z0-9]/g,
                    ""
                );


        showConnectionError("");
    }
);


// ============================================================
// HOST GAME
// ============================================================

hostButton.addEventListener(
    "click",
    () => {

        const username =
            getUsername();


        if (!username) {

            showConnectionError(
                "Please enter a username."
            );

            usernameInput.focus();

            return;
        }


        showConnectionError("");


        hostButton.disabled =
            true;

        joinButton.disabled =
            true;


        hostButton.textContent =
            "CREATING GAME...";


        socket.emit(
            "hostGame",
            username
        );
    }
);


// ============================================================
// GAME HOSTED
// ============================================================

socket.on(
    "gameHosted",
    (data) => {

        currentRoomCode =
            data.roomCode;

        myPlayerId =
            data.playerId;

        isHost =
            true;


        roomCodeDisplay.textContent =
            currentRoomCode;


        lobbyMessage.textContent =
            "You are the host. Choose your character and wait for the other players.";


        hostButton.disabled =
            false;

        joinButton.disabled =
            false;


        hostButton.textContent =
            "HOST GAME";


        joinButton.textContent =
            "JOIN GAME";


        showScreen(
            lobbyScreen
        );
    }
);


// ============================================================
// HOST ERROR
// ============================================================

socket.on(
    "hostError",
    (message) => {

        showConnectionError(
            message
        );


        hostButton.disabled =
            false;

        joinButton.disabled =
            false;


        hostButton.textContent =
            "HOST GAME";
    }
);


// ============================================================
// JOIN GAME
// ============================================================

joinButton.addEventListener(
    "click",
    () => {

        const username =
            getUsername();


        const roomCode =
            roomCodeInput.value
                .trim()
                .toUpperCase();


        if (!username) {

            showConnectionError(
                "Please enter a username."
            );

            usernameInput.focus();

            return;
        }


        if (
            roomCode.length !== 6
        ) {

            showConnectionError(
                "Please enter the 6-character game code."
            );

            roomCodeInput.focus();

            return;
        }


        showConnectionError("");


        hostButton.disabled =
            true;

        joinButton.disabled =
            true;


        joinButton.textContent =
            "JOINING...";


        socket.emit(
            "joinGame",
            {

                username:
                    username,

                roomCode:
                    roomCode
            }
        );
    }
);


// ============================================================
// GAME JOINED
// ============================================================

socket.on(
    "gameJoined",
    (data) => {

        currentRoomCode =
            data.roomCode;

        myPlayerId =
            data.playerId;

        isHost =
            false;


        roomCodeDisplay.textContent =
            currentRoomCode;


        lobbyMessage.textContent =
            "You joined the game. Choose an available character.";


        hostButton.disabled =
            false;

        joinButton.disabled =
            false;


        hostButton.textContent =
            "HOST GAME";

        joinButton.textContent =
            "JOIN GAME";


        showScreen(
            lobbyScreen
        );
    }
);


// ============================================================
// JOIN ERROR
// ============================================================

socket.on(
    "joinError",
    (message) => {

        showConnectionError(
            message
        );


        hostButton.disabled =
            false;

        joinButton.disabled =
            false;


        hostButton.textContent =
            "HOST GAME";

        joinButton.textContent =
            "JOIN GAME";
    }
);


// ============================================================
// ENTER KEY SUPPORT
// ============================================================

usernameInput.addEventListener(
    "keydown",
    (event) => {

        if (
            event.key === "Enter"
        ) {

            hostButton.click();
        }
    }
);


roomCodeInput.addEventListener(
    "keydown",
    (event) => {

        if (
            event.key === "Enter"
        ) {

            joinButton.click();
        }
    }
);


// ============================================================
// CHARACTER SELECTION
// ============================================================

characterCards.forEach(
    (card) => {

        card.addEventListener(
            "click",
            () => {

                if (gameStarted) {
                    return;
                }


                if (!currentRoomCode) {
                    return;
                }


                const characterNumber =
                    Number(
                        card.dataset.character
                    );


                socket.emit(
                    "selectCharacter",
                    characterNumber
                );
            }
        );
    }
);


// ============================================================
// CHARACTER SELECTED
// ============================================================

socket.on(
    "characterSelected",
    (data) => {

        console.log(
            `${data.playerName} selected Character ${data.character}`
        );


        if (
            data.playerId ===
            myPlayerId
        ) {

            selectedCharacter =
                data.character;


            selectedCharacterDisplay.textContent =
                `Character ${data.character}`;


            lobbyMessage.textContent =
                "Character selected.";
        }
    }
);


// ============================================================
// CHARACTER SELECTION ERROR
// ============================================================

socket.on(
    "characterSelectionError",
    (message) => {

        lobbyMessage.textContent =
            message;
    }
);


// ============================================================
// UPDATE PLAYER LIST
// ============================================================

socket.on(
    "playersUpdated",
    (players) => {

        latestPlayers =
            players;


        console.log(
            "Players in room:",
            players
        );


        playersList.innerHTML =
            "";


        players.forEach(
            (player) => {

                const playerElement =
                    document.createElement(
                        "div"
                    );


                playerElement.classList.add(
                    "player-entry"
                );


                // -----------------------------------------
                // PLAYER NAME
                // -----------------------------------------

                const playerName =
                    document.createElement(
                        "span"
                    );


                playerName.classList.add(
                    "player-name"
                );


                playerName.textContent =
                    player.name;


                // -----------------------------------------
                // HOST LABEL
                // -----------------------------------------

                if (
                    player.isHost
                ) {

                    const hostLabel =
                        document.createElement(
                            "span"
                        );


                    hostLabel.classList.add(
                        "host-label"
                    );


                    hostLabel.textContent =
                        "HOST";


                    playerName.appendChild(
                        hostLabel
                    );
                }


                // -----------------------------------------
                // CHARACTER
                // -----------------------------------------

                const characterInfo =
                    document.createElement(
                        "span"
                    );


                characterInfo.classList.add(
                    "player-character"
                );


                if (
                    player.character !==
                    null
                ) {

                    characterInfo.textContent =
                        `Character ${player.character}`;

                } else {

                    characterInfo.textContent =
                        "Choosing character...";
                }


                playerElement.appendChild(
                    playerName
                );


                playerElement.appendChild(
                    characterInfo
                );


                // -----------------------------------------
                // HIGHLIGHT CURRENT PLAYER
                // -----------------------------------------

                if (
                    player.id ===
                    myPlayerId
                ) {

                    playerElement.classList.add(
                        "current-player"
                    );
                }


                playersList.appendChild(
                    playerElement
                );
            }
        );


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


        characterCards.forEach(
            (card) => {

                const characterNumber =
                    Number(
                        card.dataset.character
                    );


                const taken =
                    takenCharacters.includes(
                        characterNumber
                    );


                if (taken) {

                    card.classList.add(
                        "taken"
                    );

                    card.disabled =
                        true;

                } else {

                    card.classList.remove(
                        "taken"
                    );


                    card.disabled =
                        gameStarted;
                }
            }
        );


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

            startButton.disabled =
                true;
        }
    }
);


// ============================================================
// START GAME
// ============================================================

startButton.addEventListener(
    "click",
    () => {

        if (!isHost) {
            return;
        }


        socket.emit(
            "startGame"
        );
    }
);


// ============================================================
// START GAME ERROR
// ============================================================

socket.on(
    "startGameError",
    (message) => {

        lobbyMessage.textContent =
            message;
    }
);


// ============================================================
// CREATE GAME SCREEN
// ============================================================
//
// The current HTML only has a placeholder for the future
// board. We create a temporary networking/game-state panel
// here so the multiplayer system can actually be tested.
//
// Later, your team's real GameBoard.js can replace this.
// ============================================================

function createNetworkGameUI() {

    const existing =
        document.getElementById(
            "networkGameUI"
        );


    if (existing) {
        return existing;
    }


    const container =
        document.createElement(
            "div"
        );


    container.id =
        "networkGameUI";


    container.style.maxWidth =
        "700px";

    container.style.margin =
        "0 auto";

    container.style.padding =
        "30px";

    container.style.textAlign =
        "center";

    container.style.border =
        "1px solid rgba(238, 226, 200, 0.25)";

    container.style.borderRadius =
        "10px";


    const title =
        document.createElement(
            "h2"
        );


    title.textContent =
        "MULTIPLAYER GAME";


    const turnDisplay =
        document.createElement(
            "p"
        );


    turnDisplay.id =
        "turnDisplay";


    const diceDisplay =
        document.createElement(
            "p"
        );


    diceDisplay.id =
        "diceDisplay";


    const rollButton =
        document.createElement(
            "button"
        );


    rollButton.id =
        "rollDiceButton";


    rollButton.className =
        "main-button";


    rollButton.textContent =
        "ROLL DICE";


    const playersTitle =
        document.createElement(
            "h3"
        );


    playersTitle.textContent =
        "PLAYER POSITIONS";


    const positions =
        document.createElement(
            "div"
        );


    positions.id =
        "gamePlayersList";


    positions.style.textAlign =
        "left";


    const message =
        document.createElement(
            "p"
        );


    message.id =
        "gameMessage";


    container.appendChild(
        title
    );

    container.appendChild(
        turnDisplay
    );

    container.appendChild(
        diceDisplay
    );

    container.appendChild(
        rollButton
    );

    container.appendChild(
        playersTitle
    );

    container.appendChild(
        positions
    );

    container.appendChild(
        message
    );


    gameScreen.appendChild(
        container
    );


    rollButton.addEventListener(
        "click",
        () => {

            if (
                !gameStarted
            ) {
                return;
            }


            if (
                currentPlayerTurnId !==
                myPlayerId
            ) {

                message.textContent =
                    "It is not your turn.";

                return;
            }


            rollButton.disabled =
                true;


            message.textContent =
                "Rolling...";


            socket.emit(
                "rollDice"
            );
        }
    );


    return container;
}


// ============================================================
// UPDATE GAME PLAYER DISPLAY
// ============================================================

function updateGamePlayerDisplay(
    players
) {

    const list =
        document.getElementById(
            "gamePlayersList"
        );


    if (!list) {
        return;
    }


    list.innerHTML =
        "";


    players.forEach(
        (player) => {

            const row =
                document.createElement(
                    "div"
                );


            row.style.padding =
                "8px 0";


            row.style.borderBottom =
                "1px solid rgba(238, 226, 200, 0.1)";


            let text =
                `${player.name} — ` +
                `Position ${player.position}`;


            if (
                player.id ===
                currentPlayerTurnId
            ) {

                text +=
                    " ← TURN";
            }


            if (
                player.id ===
                myPlayerId
            ) {

                text +=
                    " (YOU)";
            }


            row.textContent =
                text;


            list.appendChild(
                row
            );
        }
    );
}


// ============================================================
// UPDATE TURN DISPLAY
// ============================================================

function updateTurnDisplay() {

    const turnDisplay =
        document.getElementById(
            "turnDisplay"
        );


    const rollButton =
        document.getElementById(
            "rollDiceButton"
        );


    if (!turnDisplay) {
        return;
    }


    const currentPlayer =
        latestPlayers.find(
            player =>
                player.id ===
                currentPlayerTurnId
        );


    if (!currentPlayer) {

        turnDisplay.textContent =
            "Waiting for turn information...";

        return;
    }


    if (
        currentPlayerTurnId ===
        myPlayerId
    ) {

        turnDisplay.textContent =
            `Turn ${currentTurnNumber}: IT IS YOUR TURN`;

        rollButton.disabled =
            false;

    } else {

        turnDisplay.textContent =
            `Turn ${currentTurnNumber}: ${currentPlayer.name}'s turn`;

        rollButton.disabled =
            true;
    }
}


// ============================================================
// GAME STARTED
// ============================================================

socket.on(
    "gameStarted",
    (data) => {

        console.log(
            "The game has started!",
            data
        );


        gameStarted =
            true;


        currentPlayerTurnId =
            data.currentPlayerId;


        currentTurnNumber =
            data.turnNumber;


        latestPlayers =
            data.players || [];


        createNetworkGameUI();


        showScreen(
            gameScreen
        );


        updateGamePlayerDisplay(
            latestPlayers
        );


        updateTurnDisplay();
    }
);


// ============================================================
// GAME STATE UPDATE
// ============================================================

socket.on(
    "gameStateUpdated",
    (data) => {

        console.log(
            "Game state updated:",
            data
        );


        gameStarted =
            data.started;


        currentPlayerTurnId =
            data.currentPlayerId;


        currentTurnNumber =
            data.turnNumber;


        latestPlayers =
            data.players || [];


        createNetworkGameUI();


        updateGamePlayerDisplay(
            latestPlayers
        );


        updateTurnDisplay();
    }
);


// ============================================================
// DICE ROLLED
// ============================================================

socket.on(
    "diceRolled",
    (data) => {

        console.log(
            `${data.playerName} rolled ` +
            `${data.dice1} + ${data.dice2} ` +
            `= ${data.total}`
        );


        const diceDisplay =
            document.getElementById(
                "diceDisplay"
            );


        const message =
            document.getElementById(
                "gameMessage"
            );


        if (diceDisplay) {

            diceDisplay.textContent =
                `${data.playerName} rolled ` +
                `${data.dice1} + ${data.dice2} ` +
                `= ${data.total}`;
        }


        if (message) {

            message.textContent =
                `${data.playerName} moved ` +
                `from space ${data.oldPosition} ` +
                `to space ${data.newPosition}.`;
        }
    }
);


// ============================================================
// DICE ERROR
// ============================================================

socket.on(
    "diceRollError",
    (message) => {

        const gameMessage =
            document.getElementById(
                "gameMessage"
            );


        if (gameMessage) {

            gameMessage.textContent =
                message;
        }


        const rollButton =
            document.getElementById(
                "rollDiceButton"
            );


        if (
            rollButton &&
            currentPlayerTurnId ===
            myPlayerId
        ) {

            rollButton.disabled =
                false;
        }
    }
);


// ============================================================
// PLAYER MOVED
// ============================================================

socket.on(
    "playerMoved",
    (data) => {

        console.log(
            `${data.playerName} moved ` +
            `from ${data.oldPosition} ` +
            `to ${data.position}`
        );


        const player =
            latestPlayers.find(
                p =>
                    p.id ===
                    data.playerId
            );


        if (player) {

            player.position =
                data.position;
        }


        updateGamePlayerDisplay(
            latestPlayers
        );
    }
);


// ============================================================
// GAME OVER
// ============================================================

socket.on(
    "gameOver",
    (data) => {

        gameStarted =
            false;


        const gameMessage =
            document.getElementById(
                "gameMessage"
            );


        const rollButton =
            document.getElementById(
                "rollDiceButton"
            );


        if (rollButton) {

            rollButton.disabled =
                true;
        }


        if (gameMessage) {

            gameMessage.textContent =
                `${data.playerName} reached ` +
                `the guillotine and won!`;
        }


        const turnDisplay =
            document.getElementById(
                "turnDisplay"
            );


        if (turnDisplay) {

            turnDisplay.textContent =
                "GAME OVER";
        }


        console.log(
            `${data.playerName} reached the guillotine!`
        );
    }
);


// ============================================================
// PLAYER JOINED
// ============================================================

socket.on(
    "playerJoined",
    (data) => {

        console.log(
            `${data.playerName} joined the game.`
        );


        lobbyMessage.textContent =
            `${data.playerName} joined the game.`;
    }
);


// ============================================================
// PLAYER LEFT
// ============================================================

socket.on(
    "playerLeft",
    (data) => {

        console.log(
            `${data.playerName} left the game.`
        );


        if (!gameStarted) {

            lobbyMessage.textContent =
                `${data.playerName} left the game.`;
        }
    }
);


// ============================================================
// HOST CHANGED
// ============================================================

socket.on(
    "hostChanged",
    (data) => {

        isHost =
            data.playerId ===
            myPlayerId;


        if (isHost) {

            lobbyMessage.textContent =
                "The previous host left. You are now the host.";
        }


        // playersUpdated will update the HOST label
        // and the START GAME button.
    }
);


// ============================================================
// ROOM CLOSED
// ============================================================

socket.on(
    "roomClosed",
    () => {

        alert(
            "The host left the game."
        );


        window.location.reload();
    }
);
