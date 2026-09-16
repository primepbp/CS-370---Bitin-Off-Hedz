// =========================================================
// GET TO THE GUILLOTINE
// MAIN GAME JAVASCRIPT
// =========================================================


// =========================================================
// CONNECT TO OUR NODE.JS SOCKET.IO SERVER
// =========================================================

const socket = io("http://192.168.1.209:3000");


// Show when we successfully connect
socket.on("connect", () => {

    console.log("Connected to server!");

    console.log("My socket ID:", socket.id);

});


// Show if connection is lost
socket.on("disconnect", () => {

    console.log("Disconnected from server.");

});


// =========================================================
// GET HTML ELEMENTS
// =========================================================

// Main screens
const mainMenu = document.getElementById("main-menu");
const hostScreen = document.getElementById("host-screen");
const joinScreen = document.getElementById("join-screen");
const rulesScreen = document.getElementById("rules-screen");
const characterScreen = document.getElementById("character-screen");


// Main menu buttons
const hostButton = document.getElementById("hostButton");
const joinButton = document.getElementById("joinButton");
const rulesButton = document.getElementById("rulesButton");


// Host screen
const gameCodeDisplay = document.getElementById("gameCodeDisplay");
const copyCodeButton = document.getElementById("copyCodeButton");
const hostContinueButton = document.getElementById("hostContinueButton");
const hostBackButton = document.getElementById("hostBackButton");


// Join screen
const gameCodeInput = document.getElementById("gameCodeInput");
const joinConfirmButton = document.getElementById("joinConfirmButton");
const joinBackButton = document.getElementById("joinBackButton");


// Rules
const rulesBackButton = document.getElementById("rulesBackButton");


// Character screen
const characterGameCode =
    document.getElementById("characterGameCode");

const previousCharacter =
    document.getElementById("previousCharacter");

const nextCharacter =
    document.getElementById("nextCharacter");

const selectedCharacterImage =
    document.getElementById("selectedCharacterImage");

const selectedCharacterName =
    document.getElementById("selectedCharacterName");

const selectedCharacterQuote =
    document.getElementById("selectedCharacterQuote");

const selectedCharacterPower =
    document.getElementById("selectedCharacterPower");

const characterPlaceholder =
    document.getElementById("characterPlaceholder");

const characterOptions =
    document.querySelectorAll(".character-option");

const characterBackButton =
    document.getElementById("characterBackButton");

const startGameButton =
    document.getElementById("startGameButton");

const playerCount =
    document.getElementById("playerCount");


// =========================================================
// SCREEN FUNCTION
// =========================================================

// This function hides every screen
// and then shows the screen we want.
function showScreen(screenToShow) {

    const screens = document.querySelectorAll(".screen");

    screens.forEach(screen => {

        screen.classList.add("hidden");

    });

    screenToShow.classList.remove("hidden");
}


// =========================================================
// MAIN MENU
// =========================================================


// Host button
hostButton.addEventListener("click", () => {

    console.log("Creating game...");

    socket.emit("createRoom");

});


// Join button
joinButton.addEventListener("click", () => {

    showScreen(joinScreen);

    gameCodeInput.focus();

});


// Rules button
rulesButton.addEventListener("click", () => {

    showScreen(rulesScreen);

});


// =========================================================
// HOST GAME
// =========================================================


// Server tells us that the room was created
socket.on("roomCreated", (data) => {

    console.log("ROOM CREATED!");

    console.log("Game code:", data.code);


    // Display the code
    gameCodeDisplay.textContent = data.code;


    // Save the code for the character screen
    characterGameCode.textContent = data.code;


    // Show host screen
    showScreen(hostScreen);

});


// Continue from host screen
hostContinueButton.addEventListener("click", () => {

    openCharacterSelection();

});


// Copy game code
copyCodeButton.addEventListener("click", async () => {

    const code = gameCodeDisplay.textContent;

    try {

        await navigator.clipboard.writeText(code);

        copyCodeButton.textContent = "COPIED!";

        setTimeout(() => {

            copyCodeButton.textContent = "COPY CODE";

        }, 1500);

    } catch (error) {

        console.log("Could not copy code.");

    }

});


// Host back button
hostBackButton.addEventListener("click", () => {

    showScreen(mainMenu);

});


// =========================================================
// JOIN GAME
// =========================================================


// Join button
joinConfirmButton.addEventListener("click", () => {

    const code = gameCodeInput.value.trim();


    // Make sure code is four digits
    if (!/^\d{4}$/.test(code)) {

        alert("Please enter a 4-digit game code.");

        return;

    }


    console.log("Trying to join:", code);


    // Send code to server
    socket.emit("joinRoom", code);

});


// Server confirms successful join
socket.on("joinSuccess", (data) => {

    console.log("Successfully joined game!");

    console.log("Game code:", data.code);


    // Display room code on character screen
    characterGameCode.textContent = data.code;


    // Open character selection
    openCharacterSelection();

});


// Server says the room could not be joined
socket.on("joinError", (message) => {

    console.log("Join error:", message);

    alert(message);

});


// Join back button
joinBackButton.addEventListener("click", () => {

    showScreen(mainMenu);

    gameCodeInput.value = "";

});


// =========================================================
// RULES
// =========================================================


rulesBackButton.addEventListener("click", () => {

    showScreen(mainMenu);

});


// =========================================================
// CHARACTER DATA
// =========================================================

const characters = [

    {
        name: "Marie Antoinette",

        image: "characters/Marie Antoinette.gif",

        quote: '"Let them eat cake."',

        power: "Power coming soon."
    },


    {
        name: "Maximilien Robespierre",

        image: "characters/Robespierre.gif",

        quote:
            '"A true revolutionary should be ready to perish in the process."',

        power:
            "May ignore one die when moving. For example, a roll of 2 + 6 can be used as 2, 6, or 8."
    },


    {
        name: "Anne Boleyn",

        image: "characters/Anne Bolyne.gif",

        quote:
            '"O Death, rock me asleep, bring me to quiet rest."',

        power:
            "Angry Mob spaces are treated as ordinary spaces."
    },


    {
        name: "King Louis XVI",

        image: "characters/King Louis XVI.gif",

        quote:
            '"A king must be willing to die for his people."',

        power:
            "Spend one coin to reroll both dice."
    },


    {
        name: "Headless Horseman",

        image: null,

        quote:
            "The rider without a head returns from the darkness.",

        power:
            "Unless in an Angry Mob, roll a third die."
    },


    {
        name: "Queen of Hearts",

        image: null,

        quote:
            '"Off with my head!"',

        power:
            "Power coming soon."
    }

];


// =========================================================
// CURRENT CHARACTER
// =========================================================

// Character number currently selected
let currentCharacter = 0;


// =========================================================
// DISPLAY CHARACTER
// =========================================================

function showCharacter(index) {

    // Make sure the number stays within the array
    if (index < 0) {

        index = characters.length - 1;

    }

    if (index >= characters.length) {

        index = 0;

    }


    // Save current character
    currentCharacter = index;


    // Get character data
    const character = characters[index];


    // Update name
    selectedCharacterName.textContent =
        character.name;


    // Update quote
    selectedCharacterQuote.textContent =
        character.quote;


    // Update power
    selectedCharacterPower.textContent =
        character.power;


    // Update image
    if (character.image) {

        selectedCharacterImage.src =
            character.image;

        selectedCharacterImage.alt =
            character.name;

        selectedCharacterImage.classList.remove("hidden");

        characterPlaceholder.classList.add("hidden");

    } else {

        // Temporary placeholder
        selectedCharacterImage.classList.add("hidden");

        characterPlaceholder.classList.remove("hidden");

        // Use different placeholder icons
        if (character.name === "Headless Horseman") {

            characterPlaceholder.textContent = "🐎";

        } else {

            characterPlaceholder.textContent = "♥";

        }

    }


    // Remove active effect from all six cards
    characterOptions.forEach(option => {

        option.classList.remove("active");

    });


    // Highlight selected character
    if (characterOptions[index]) {

        characterOptions[index].classList.add("active");

    }


    console.log(
        "Selected character:",
        character.name
    );

}


// =========================================================
// PREVIOUS CHARACTER
// =========================================================

previousCharacter.addEventListener("click", () => {

    showCharacter(currentCharacter - 1);

});


// =========================================================
// NEXT CHARACTER
// =========================================================

nextCharacter.addEventListener("click", () => {

    showCharacter(currentCharacter + 1);

});


// =========================================================
// CLICK CHARACTER CARD
// =========================================================

characterOptions.forEach(option => {

    option.addEventListener("click", () => {

        // Read the character number
        const index =
            Number(option.dataset.character);


        // Display selected character
        showCharacter(index);

    });

});


// =========================================================
// OPEN CHARACTER SELECTION
// =========================================================

function openCharacterSelection() {

    // Show character screen
    showScreen(characterScreen);


    // Start with the first character
    showCharacter(0);


    console.log(
        "Character selection opened."
    );

}


// =========================================================
// CHARACTER BACK BUTTON
// =========================================================

characterBackButton.addEventListener("click", () => {

    // Return to main menu
    showScreen(mainMenu);

});


// =========================================================
// START BUTTON
// =========================================================

startGameButton.addEventListener("click", () => {

    const selected =
        characters[currentCharacter];


    alert(
        "Selected character:\n\n" +
        selected.name +
        "\n\nThe actual game board will come next!"
    );

});


// =========================================================
// MULTIPLAYER ROOM UPDATES
// =========================================================

// Your server already sends roomUpdated.
// For now, we simply show how many players are connected.
socket.on("roomUpdated", (room) => {

    console.log("Room updated:", room);


    if (room && room.players) {

        playerCount.textContent =
            "Players in room: " +
            room.players.length +
            " / 4";

    }

});


// =========================================================
// HOST LEFT
// =========================================================

socket.on("hostLeft", () => {

    alert(
        "The host left the game."
    );


    showScreen(mainMenu);

});


// =========================================================
// ENTER KEY FOR JOIN CODE
// =========================================================

gameCodeInput.addEventListener("keydown", event => {

    if (event.key === "Enter") {

        joinConfirmButton.click();

    }

});


// =========================================================
// MENU BUTTON
// =========================================================

document
    .getElementById("menuButton")
    .addEventListener("click", () => {

        showScreen(mainMenu);

    });


// =========================================================
// CHAT BUTTON
// =========================================================

document
    .getElementById("chatButton")
    .addEventListener("click", () => {

        alert(
            "Chat Room will be added next."
        );

    });


// =========================================================
// RULES BUTTON FROM CHARACTER SCREEN
// =========================================================

document
    .getElementById("rulesButton2")
    .addEventListener("click", () => {

        showScreen(rulesScreen);

    });


// =========================================================
// START WITH MARIE ANTOINETTE
// =========================================================

showCharacter(0);