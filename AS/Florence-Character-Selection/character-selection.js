
// =========================================================
// GET TO THE GUILLOTINE
// CHARACTER SELECTION JAVASCRIPT
// =========================================================


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

        image: "characters/Queen of Hearts.gif",

        quote:
            '"Off with my head!"',

        power:
            "Power coming soon."
    }

];


// =========================================================
// GET HTML ELEMENTS
// =========================================================

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

const previousCharacter =
    document.getElementById("previousCharacter");

const nextCharacter =
    document.getElementById("nextCharacter");

const startGameButton =
    document.getElementById("startGameButton");

const characterBackButton =
    document.getElementById("characterBackButton");

const menuButton =
    document.getElementById("menuButton");

const chatButton =
    document.getElementById("chatButton");

const rulesButton2 =
    document.getElementById("rulesButton2");


// =========================================================
// CURRENT CHARACTER
// =========================================================

// Character number currently selected
let currentCharacter = 0;


// =========================================================
// DISPLAY CHARACTER
// =========================================================

function showCharacter(index) {

    // Keep the number within the character array
    if (index < 0) {

        index = characters.length - 1;

    }

    if (index >= characters.length) {

        index = 0;

    }


    // Save selected character number
    currentCharacter = index;


    // Get selected character data
    const character = characters[index];


    // Update character name
    selectedCharacterName.textContent =
        character.name;


    // Update quote
    selectedCharacterQuote.textContent =
        character.quote;


    // Update special power
    selectedCharacterPower.textContent =
        character.power;


    // Update character image
    if (character.image) {

        selectedCharacterImage.src =
            character.image;

        selectedCharacterImage.alt =
            character.name;

        selectedCharacterImage.classList.remove("hidden");

        characterPlaceholder.classList.add("hidden");

    } else {

        // Show placeholder for characters without artwork
        selectedCharacterImage.classList.add("hidden");

        characterPlaceholder.classList.remove("hidden");


        // Choose placeholder icon
        if (character.name === "Headless Horseman") {

            characterPlaceholder.textContent = "🐎";

        } else {

            characterPlaceholder.textContent = "♥";

        }

    }


    // Remove active effect from all character buttons
    characterOptions.forEach(option => {

        option.classList.remove("active");

    });


    // Highlight selected character button
    if (characterOptions[index]) {

        characterOptions[index].classList.add("active");

    }


    console.log("Selected character:", character.name);

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

        // Read character number from HTML
        const index = Number(option.dataset.character);

        // Display selected character
        showCharacter(index);

    });

});


// =========================================================
// SEND EVENT TO THE MAIN GAME
// =========================================================

// These custom events let your friend connect this
// screen to their main menu, chat, rules, and game board.

function sendCharacterEvent(eventName, detail = {}) {

    document.dispatchEvent(
        new CustomEvent(eventName, {
            detail: detail
        })
    );

}


// =========================================================
// BACK BUTTON
// =========================================================

characterBackButton.addEventListener("click", () => {

    sendCharacterEvent("gttg:back");

});


// =========================================================
// START BUTTON
// =========================================================

startGameButton.addEventListener("click", () => {

    const selected = characters[currentCharacter];

    console.log("Starting with:", selected.name);

    // Send the selected character to the main game
    sendCharacterEvent("gttg:start", {
        character: selected,
        characterIndex: currentCharacter
    });

});


// =========================================================
// MENU BUTTON
// =========================================================

menuButton.addEventListener("click", () => {

    sendCharacterEvent("gttg:menu");

});


// =========================================================
// CHAT BUTTON
// =========================================================

chatButton.addEventListener("click", () => {

    sendCharacterEvent("gttg:chat");

});


// =========================================================
// RULES BUTTON
// =========================================================

rulesButton2.addEventListener("click", () => {

    sendCharacterEvent("gttg:rules");

});


// =========================================================
// START WITH MARIE ANTOINETTE
// =========================================================

showCharacter(0);