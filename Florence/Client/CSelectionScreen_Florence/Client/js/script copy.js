/*
====================================================
 GET TO THE GUILLOTINE
 CLIENT JAVASCRIPT
====================================================

 CURRENT FEATURES:
 - Multiplayer connection
 - Host game
 - Server-generated game code
 - Join game
 - Room validation
 - Maximum 4 players
 - Player count
 - Copy game code
 - Back buttons

 CHARACTERS:
 - Quincy
 - Cailyn
 - June
 - Florence

 NEXT:
 - Multiplayer lobby
 - Character selection
 - Ready system
====================================================
*/


// ==================================================
// 1. CONNECT TO SERVER
// ==================================================

const socket =
    io("http://localhost:3000");


// --------------------------------------------------
// CONNECTION SUCCESS
// --------------------------------------------------

socket.on("connect", function () {

    console.log(
        "Connected to multiplayer server!"
    );

    console.log(
        "My player ID:",
        socket.id
    );

});


// --------------------------------------------------
// CONNECTION LOST
// --------------------------------------------------

socket.on("disconnect", function () {

    console.log(
        "Disconnected from server."
    );

});


// ==================================================
// 2. GET HTML ELEMENTS
// ==================================================

// Main menu

const mainMenu =
    document.getElementById("main-menu");


// Screens

const hostScreen =
    document.getElementById("host-screen");

const joinScreen =
    document.getElementById("join-screen");

const rulesScreen =
    document.getElementById("rules-screen");


// Main buttons

const hostButton =
    document.getElementById("host-button");

const joinButton =
    document.getElementById("join-button");

const rulesButton =
    document.getElementById("rules-button");


// Back buttons

const hostBackButton =
    document.getElementById("host-back-button");

const joinBackButton =
    document.getElementById("join-back-button");

const rulesBackButton =
    document.getElementById("rules-back-button");


// Host screen

const gameCodeDisplay =
    document.getElementById("game-code");

const copyCodeButton =
    document.getElementById("copy-code-button");


// Join screen

const gameCodeInput =
    document.getElementById("game-code-input");

const joinConfirmButton =
    document.getElementById(
        "join-confirm-button"
    );


// ==================================================
// 3. SHOW SCREEN
// ==================================================

function showScreen(screen) {

    mainMenu.classList.add("hidden");

    hostScreen.classList.add("hidden");

    joinScreen.classList.add("hidden");

    rulesScreen.classList.add("hidden");


    screen.classList.remove("hidden");

}


// ==================================================
// 4. SHOW MAIN MENU
// ==================================================

function showMainMenu() {

    hostScreen.classList.add("hidden");

    joinScreen.classList.add("hidden");

    rulesScreen.classList.add("hidden");

    mainMenu.classList.remove("hidden");

}


// ==================================================
// 5. HOST GAME
// ==================================================

hostButton.addEventListener(
    "click",
    function () {

        console.log(
            "HOST GAME button clicked!"
        );


        /*
            Ask server to create a room.
        */

        socket.emit("createRoom");


        console.log(
            "Sent createRoom request."
        );

    }
);


// ==================================================
// 6. ROOM CREATED
// ==================================================

socket.on(
    "roomCreated",
    function (data) {

        console.log(
            "ROOM CREATED!"
        );

        console.log(
            "Game code:",
            data.code
        );


        // Display code

        gameCodeDisplay.textContent =
            data.code;


        // Show host screen

        showScreen(hostScreen);

    }
);


// ==================================================
// 7. JOIN SCREEN
// ==================================================

joinButton.addEventListener(
    "click",
    function () {

        console.log(
            "JOIN GAME button clicked!"
        );


        // Clear previous input

        gameCodeInput.value = "";


        // Show Join screen

        showScreen(joinScreen);


        // Focus input

        gameCodeInput.focus();

    }
);


// ==================================================
// 8. JOIN GAME
// ==================================================

joinConfirmButton.addEventListener(
    "click",
    function () {

        /*
            Get the code entered by player.
        */

        const enteredCode =
            gameCodeInput.value.trim();


        // ------------------------------------------------
        // CHECK EMPTY
        // ------------------------------------------------

        if (enteredCode === "") {

            alert(
                "Please enter a game code."
            );

            return;

        }


        // ------------------------------------------------
        // CHECK 4 DIGITS
        // ------------------------------------------------

        if (!/^\d{4}$/.test(enteredCode)) {

            alert(
                "Game codes must contain exactly 4 digits."
            );

            return;

        }


        console.log(
            "Trying to join room:",
            enteredCode
        );


        /*
            Send the code to the server.

            The server will check:

            Does the room exist?

            Is there space?

            If yes → join.

            If no → error.
        */

        socket.emit(
            "joinRoom",
            enteredCode
        );

    }
);


// ==================================================
// 9. JOIN SUCCESS
// ==================================================

socket.on(
    "joinSuccess",
    function (data) {

        console.log(
            "Successfully joined room:",
            data.code
        );


        /*
            For now, show a simple message.

            Later this will take the player
            directly to the multiplayer lobby.
        */

        alert(
            "You successfully joined game " +
            data.code
        );

    }
);


// ==================================================
// 10. JOIN ERROR
// ==================================================

socket.on(
    "joinError",
    function (data) {

        console.log(
            "Join error:",
            data.message
        );


        alert(
            data.message
        );

    }
);


// ==================================================
// 11. ROOM UPDATED
// ==================================================

socket.on(
    "roomUpdated",
    function (data) {

        /*
            This message is sent to EVERY player
            inside the room whenever someone joins
            or leaves.
        */

        console.log(
            "ROOM UPDATED"
        );


        console.log(
            "Game code:",
            data.code
        );


        console.log(
            "Players:",
            data.players
        );


        console.log(
            "Number of players:",
            data.players.length
        );

    }
);


// ==================================================
// 12. HOST LEFT
// ==================================================

socket.on(
    "hostLeft",
    function () {

        alert(
            "The host has left the game."
        );


        showMainMenu();

    }
);


// ==================================================
// 13. HOW TO PLAY
// ==================================================

rulesButton.addEventListener(
    "click",
    function () {

        showScreen(rulesScreen);

    }
);


// ==================================================
// 14. BACK BUTTONS
// ==================================================

hostBackButton.addEventListener(
    "click",
    function () {

        showMainMenu();

    }
);


joinBackButton.addEventListener(
    "click",
    function () {

        showMainMenu();

    }
);


rulesBackButton.addEventListener(
    "click",
    function () {

        showMainMenu();

    }
);


// ==================================================
// 15. COPY GAME CODE
// ==================================================

copyCodeButton.addEventListener(
    "click",
    async function () {

        const code =
            gameCodeDisplay.textContent;


        if (!code || code === "----") {

            alert(
                "There is no game code to copy."
            );

            return;

        }


        try {

            await navigator.clipboard.writeText(
                code
            );


            copyCodeButton.textContent =
                "✓ COPIED!";


            setTimeout(
                function () {

                    copyCodeButton.textContent =
                        "📋 COPY CODE";

                },
                1500
            );


        } catch (error) {

            alert(
                "Please copy the code manually: " +
                code
            );

        }

    }
);


// ==================================================
// 16. ENTER KEY
// ==================================================

gameCodeInput.addEventListener(
    "keydown",
    function (event) {

        if (event.key === "Enter") {

            joinConfirmButton.click();

        }

    }
);


// ==================================================
// 17. STARTUP MESSAGE
// ==================================================

console.log(
    "Get To The Guillotine client loaded."
);
// =========================================================
// CHARACTER SELECTION
// =========================================================

// All six playable characters
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
        quote: '"A true revolutionary should be ready to perish in the process."',
        power: "May ignore one die when moving."
    },
    {
        name: "Anne Boleyn",
        image: "characters/Anne Bolyne.gif",
        quote: '"O Death, rock me asleep..."',
        power: "Angry Mob spaces are treated as ordinary spaces."
    },
    {
        name: "King Louis XVI",
        image: "characters/King Louis XVI.gif",
        quote: '"A king must be willing to die for his people."',
        power: "Spend one coin to reroll both dice."
    },
    {
        name: "Headless Horseman",
        image: null,
        quote: "The horseman rides again.",
        power: "Unless in Angry Mob, roll a third die."
    },
    {
        name: "Queen of Hearts",
        image: null,
        quote: '"Off with my head!"',
        power: "Power coming soon."
    }
];

// Keep track of which character is currently selected
let currentCharacter = 0;

// Get the character-selection elements
const characterScreen = document.getElementById("character-screen");
const selectedCharacterImage =
    document.getElementById("selectedCharacterImage");

const selectedCharacterName =
    document.getElementById("selectedCharacterName");

const selectedCharacterQuote =
    document.getElementById("selectedCharacterQuote");

const selectedCharacterPower =
    document.getElementById("selectedCharacterPower");

const previousCharacter =
    document.getElementById("previousCharacter");

const nextCharacter =
    document.getElementById("nextCharacter");

const characterOptions =
    document.querySelectorAll(".character-option");


// =========================================================
// SHOW A CHARACTER
// =========================================================

function showCharacter(index) {

    // Save the selected character number
    currentCharacter = index;

    // Get the character information
    const character = characters[index];

    // Update name
    selectedCharacterName.textContent = character.name;

    // Update quote
    selectedCharacterQuote.textContent = character.quote;

    // Update power
    selectedCharacterPower.textContent = character.power;

    // Update the main image
    if (character.image) {

        selectedCharacterImage.src = character.image;
        selectedCharacterImage.style.display = "block";

    } else {

        // Temporary image for characters without artwork
        selectedCharacterImage.removeAttribute("src");
        selectedCharacterImage.style.display = "none";
    }

    // Remove selected effect from every character
    characterOptions.forEach(option => {
        option.classList.remove("active");
    });

    // Add selected effect to the current character
    if (characterOptions[index]) {
        characterOptions[index].classList.add("active");
    }
}


// =========================================================
// CHARACTER ARROWS
// =========================================================

// Previous character button
if (previousCharacter) {

    previousCharacter.addEventListener("click", () => {

        currentCharacter--;

        // Loop back to the last character
        if (currentCharacter < 0) {
            currentCharacter = characters.length - 1;
        }

        showCharacter(currentCharacter);
    });
}


// Next character button
if (nextCharacter) {

    nextCharacter.addEventListener("click", () => {

        currentCharacter++;

        // Loop back to the first character
        if (currentCharacter >= characters.length) {
            currentCharacter = 0;
        }

        showCharacter(currentCharacter);
    });
}


// =========================================================
// CLICK A CHARACTER AT THE BOTTOM
// =========================================================

characterOptions.forEach(option => {

    option.addEventListener("click", () => {

        // Get the character number from data-character
        const index = Number(option.dataset.character);

        showCharacter(index);
    });
});


// =========================================================
// OPEN CHARACTER SCREEN
// =========================================================

// This function allows other parts of the game
// to open the character-selection screen.
function openCharacterSelection() {

    // Hide all normal screens
    document.querySelectorAll(".screen").forEach(screen => {
        screen.classList.add("hidden");
    });

    // Show character screen
    if (characterScreen) {
        characterScreen.classList.remove("hidden");
    }

    // Start with Marie Antoinette
    showCharacter(0);
}


// =========================================================
// BACK BUTTON
// =========================================================

const characterBackButton =
    document.getElementById("characterBackButton");

if (characterBackButton) {

    characterBackButton.addEventListener("click", () => {

        // Hide character screen
        characterScreen.classList.add("hidden");

        // Return to the main menu
        const mainMenu = document.getElementById("main-menu");

        if (mainMenu) {
            mainMenu.classList.remove("hidden");
        }
    });
}


// =========================================================
// TEMPORARY START BUTTON
// =========================================================

const startGameButton =
    document.getElementById("startGameButton");

if (startGameButton) {

    startGameButton.addEventListener("click", () => {

        alert(
            "Character selected: " +
            characters[currentCharacter].name
        );

    });
}


// =========================================================
// INITIAL CHARACTER
// =========================================================

showCharacter(0);