// =====================================================
// CONNECT TO THE SERVER
// =====================================================

const socket = io();


// =====================================================
// GET HTML ELEMENTS
// =====================================================

const characterCards =
    document.querySelectorAll(".character-card");

const selectedCharacterDisplay =
    document.getElementById("selectedCharacter");

const startButton =
    document.getElementById("startButton");

const networkStatus =
    document.getElementById("networkStatus");

const statusIndicator =
    document.getElementById("statusIndicator");


// =====================================================
// LOCAL GAME STATE
// =====================================================

let selectedCharacter = null;

let myPlayerId = null;


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
// CONNECTION CONFIRMATION
// =====================================================

socket.on("connectionConfirmed", (data) => {

    myPlayerId = data.playerId;

    console.log(data.message);

    console.log(
        "My player ID:",
        myPlayerId
    );
});


// =====================================================
// CHARACTER SELECTION
// =====================================================

characterCards.forEach((card) => {

    card.addEventListener("click", () => {

        const characterNumber =
            Number(card.dataset.character);

        selectCharacter(characterNumber);

    });

});


function selectCharacter(characterNumber) {

    selectedCharacter =
        characterNumber;


    // Remove previous selection

    characterCards.forEach((card) => {

        card.classList.remove("selected");

    });


    // Find the selected card

    const selectedCard =
        document.querySelector(
            `[data-character="${characterNumber}"]`
        );


    if (selectedCard) {

        selectedCard.classList.add("selected");

    }


    // Update the selected-character text

    selectedCharacterDisplay.textContent =
        `Character ${characterNumber}`;


    // Enable the start button

    startButton.disabled = false;


    // ---------------------------------------------
    // SEND SIGNAL TO SERVER
    // ---------------------------------------------

    socket.emit(
        "selectCharacter",
        characterNumber
    );


    console.log(
        "Sent character selection:",
        characterNumber
    );
}


// =====================================================
// RECEIVE CHARACTER SELECTION
// =====================================================

socket.on("characterSelected", (data) => {

    console.log(
        `${data.playerName} selected Character ${data.character}`
    );

});


// =====================================================
// PLAYER LIST
// =====================================================

socket.on("playersUpdated", (players) => {

    console.log(
        "Current players:",
        players
    );

});


// =====================================================
// PLAYER JOINED
// =====================================================

socket.on("playerJoined", (player) => {

    console.log(
        `${player.name} joined the game.`
    );

});


// =====================================================
// PLAYER LEFT
// =====================================================

socket.on("playerLeft", (data) => {

    console.log(
        "Player disconnected:",
        data.playerId
    );

});


// =====================================================
// START GAME
// =====================================================

startButton.addEventListener("click", () => {

    if (selectedCharacter === null) {

        return;

    }


    console.log(
        "Requesting game start..."
    );


    // SEND SIGNAL TO SERVER

    socket.emit("startGame");

});


// =====================================================
// GAME STARTED
// =====================================================

socket.on("gameStarted", () => {

    console.log(
        "The server has started the game!"
    );


    // TEMPORARY

    alert(
        "Game starting!\n\n" +
        "The actual game board will go here."
    );

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