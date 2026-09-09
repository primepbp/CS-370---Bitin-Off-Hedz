// =========================================
// GET TO THE GUILLOTINE
// Main Game JavaScript
// =========================================


// =========================================
// GET HTML ELEMENTS
// =========================================

const board = document.getElementById("board");

const positionEl = document.getElementById("position");
const coinsEl = document.getElementById("coins");
const crowdStatusEl = document.getElementById("crowd-status");

const die1El = document.getElementById("die1");
const die2El = document.getElementById("die2");

const diceModeEl = document.getElementById("dice-mode");
const messageEl = document.getElementById("message");

const rollButton = document.getElementById("roll-button");
const restartButton = document.getElementById("restart-button");

const extraRollButton =
    document.getElementById("extra-roll-button");

const crowdPassButton =
    document.getElementById("crowd-pass-button");


// =========================================
// CREATE PLAYER
// =========================================

const playerEl = document.createElement("div");

playerEl.className = "player";

playerEl.textContent = "🧑";

board.appendChild(playerEl);


// =========================================
// DICE FACES
// =========================================

const diceFaces = [
    "⚀",
    "⚁",
    "⚂",
    "⚃",
    "⚄",
    "⚅"
];


// =========================================
// GAME SETTINGS
// =========================================

const totalSpaces = 36;


// =========================================
// PLAYER GAME DATA
// =========================================

let playerPosition = 0;

let coins = 0;

let crowdTurns = 0;

let gameOver = false;

let isMoving = false;

let extraRolls = 0;

let crowdPasses = 0;


// Keeps track of coin spaces that
// have already been collected.

let collectedCoins = new Set();


// =========================================
// BOARD SPACE DATA
// =========================================

/*
    Each space has a type.

    normal
        Regular space.

    coin
        Gives the player coins.

    crowd
        Causes the Angry Crowd effect.

    event
        Causes a random event.

    start
        Beginning of the game.

    finish
        The Guillotine.
*/


const spaces = [

    {
        type: "start",
        icon: "🏁",
        name: "START"
    },


    {
        type: "normal",
        icon: "•",
        name: "Rue des Martyrs"
    },


    {
        type: "coin",
        icon: "🪙",
        name: "Market Stall"
    },


    {
        type: "normal",
        icon: "•",
        name: "Narrow Street"
    },


    {
        type: "crowd",
        icon: "😡",
        name: "Angry Crowd"
    },


    {
        type: "normal",
        icon: "•",
        name: "Town Square"
    },


    {
        type: "coin",
        icon: "🪙",
        name: "Abandoned Purse"
    },


    {
        type: "event",
        icon: "⭐",
        name: "Revolutionary Rumor"
    },


    {
        type: "normal",
        icon: "•",
        name: "Cobblestone Alley"
    },


    {
        type: "crowd",
        icon: "😡",
        name: "Angry Crowd"
    },


    {
        type: "normal",
        icon: "•",
        name: "Bakery Street"
    },


    {
        type: "coin",
        icon: "🪙",
        name: "Market Stall"
    },


    {
        type: "normal",
        icon: "•",
        name: "Barricade"
    },


    {
        type: "event",
        icon: "⭐",
        name: "Helpful Citizen"
    },


    {
        type: "normal",
        icon: "•",
        name: "Rue Saint-Honoré"
    },


    {
        type: "crowd",
        icon: "😡",
        name: "Angry Crowd"
    },


    {
        type: "coin",
        icon: "🪙",
        name: "Dropped Coins"
    },


    {
        type: "normal",
        icon: "•",
        name: "Palace Road"
    },


    {
        type: "event",
        icon: "⭐",
        name: "Revolutionary Speech"
    },


    {
        type: "normal",
        icon: "•",
        name: "Stone Bridge"
    },


    {
        type: "coin",
        icon: "🪙",
        name: "Market Stall"
    },


    {
        type: "normal",
        icon: "•",
        name: "Busy Street"
    },


    {
        type: "crowd",
        icon: "😡",
        name: "Angry Crowd"
    },


    {
        type: "normal",
        icon: "•",
        name: "Barricade"
    },


    {
        type: "event",
        icon: "⭐",
        name: "Lucky Find"
    },


    {
        type: "normal",
        icon: "•",
        name: "Courthouse Road"
    },


    {
        type: "coin",
        icon: "🪙",
        name: "Coin Purse"
    },


    {
        type: "crowd",
        icon: "😡",
        name: "Angry Crowd"
    },


    {
        type: "normal",
        icon: "•",
        name: "Revolutionary District"
    },


    {
        type: "event",
        icon: "⭐",
        name: "Secret Passage"
    },


    {
        type: "normal",
        icon: "•",
        name: "Place de la Révolution"
    },


    {
        type: "coin",
        icon: "🪙",
        name: "Final Coins"
    },


    {
        type: "normal",
        icon: "•",
        name: "Execution Square"
    },


    {
        type: "crowd",
        icon: "😡",
        name: "Angry Crowd"
    },


    {
        type: "normal",
        icon: "•",
        name: "The Last Road"
    },


    {
        type: "finish",
        icon: "🪓",
        name: "GUILLOTINE"
    }

];


// =========================================
// CREATE BOARD
// =========================================

function createBoard() {

    // Remove old spaces and lines.

    spaceElements.length = 0;

    document
        .querySelectorAll(
            ".space, .route-line, .board-label"
        )
        .forEach(element => {
            element.remove();
        });


    const width = board.clientWidth;

    const height = board.clientHeight;


    // Number of columns.

    const cols = width < 650 ? 6 : 9;


    // Calculate number of rows.

    const rows = Math.ceil(
        spaces.length / cols
    );


    // Board padding.

    const xPadding =
        width < 650 ? 45 : 70;

    const yPadding = 70;


    const usableWidth =
        width - xPadding * 2;

    const usableHeight =
        height - yPadding * 2;


    const xStep =
        usableWidth / (cols - 1);

    const yStep =
        usableHeight / (rows - 1);


    const positions = [];


    // =====================================
    // CALCULATE SPACE POSITIONS
    // =====================================

    for (let row = 0; row < rows; row++) {

        const start =
            row * cols;

        const end =
            Math.min(
                start + cols,
                spaces.length
            );

        const count =
            end - start;


        for (
            let col = 0;
            col < count;
            col++
        ) {

            /*
                Every other row reverses direction.

                This creates the winding
                board-game path.
            */

            const actualCol =
                row % 2 === 0
                    ? col
                    : count - 1 - col;


            positions.push({

                x:
                    xPadding +
                    actualCol * xStep,

                y:
                    yPadding +
                    row * yStep

            });

        }

    }


    // =====================================
    // CREATE SPACES
    // =====================================

    for (
        let i = 0;
        i < spaces.length;
        i++
    ) {

        const data = spaces[i];

        const pos = positions[i];


        const element =
            document.createElement("div");


        element.className =
            `space ${data.type}-space`;


        element.style.left =
            `${pos.x}px`;

        element.style.top =
            `${pos.y}px`;


        element.innerHTML = `

            <span class="number">

                ${
                    i === 0
                        ? "START"
                        : i === totalSpaces
                            ? "END"
                            : i
                }

            </span>

            <span class="icon">

                ${data.icon}

            </span>

        `;


        element.title =
            data.name;


        board.appendChild(element);


        spaceElements.push(element);

    }


    // =====================================
    // CONNECT THE SPACES
    // =====================================

    for (
        let i = 0;
        i < positions.length - 1;
        i++
    ) {

        const a = positions[i];

        const b = positions[i + 1];


        const dx =
            b.x - a.x;

        const dy =
            b.y - a.y;


        const distance =
            Math.sqrt(
                dx * dx +
                dy * dy
            );


        const angle =
            Math.atan2(
                dy,
                dx
            ) * 180 / Math.PI;


        const line =
            document.createElement("div");


        line.className =
            "route-line";


        line.style.width =
            `${distance}px`;


        line.style.left =
            `${a.x}px`;


        line.style.top =
            `${a.y}px`;


        line.style.transform =
            `rotate(${angle}deg)`;


        board.insertBefore(
            line,
            board.firstChild
        );

    }


    // =====================================
    // BOARD LABELS
    // =====================================

    const labels = [

        [
            "label-paris",
            "PARIS",
            7,
            8
        ],

        [
            "label-square",
            "PLACE DE LA RÉVOLUTION",
            57,
            43
        ],

        [
            "label-seine",
            "THE SEINE",
            12,
            90
        ]

    ];


    labels.forEach(
        ([className, text, left, top]) => {

            const label =
                document.createElement("div");


            label.className =
                `board-label ${className}`;


            label.textContent =
                text;


            label.style.left =
                `${left}%`;


            label.style.top =
                `${top}%`;


            board.appendChild(label);

        }
    );


    // Put player in correct position.

    movePlayerInstant();

}


// =========================================
// STORE BOARD ELEMENTS
// =========================================

const spaceElements = [];


// =========================================
// MOVE PLAYER INSTANTLY
// =========================================

function movePlayerInstant() {

    const target =
        spaceElements[playerPosition];


    if (!target) {
        return;
    }


    playerEl.style.left =
        target.style.left;


    playerEl.style.top =
        target.style.top;

}


// =========================================
// ROLL ONE DIE
// =========================================

function rollDie() {

    return Math.floor(
        Math.random() * 6
    ) + 1;

}


// =========================================
// UPDATE DICE DISPLAY
// =========================================

function setDice(
    value1,
    value2 = null
) {

    die1El.textContent =
        diceFaces[value1 - 1];


    if (value2 === null) {

        die2El.style.visibility =
            "hidden";

    }

    else {

        die2El.style.visibility =
            "visible";

        die2El.textContent =
            diceFaces[value2 - 1];

    }

}


// =========================================
// UPDATE INFORMATION PANEL
// =========================================

function updateUI() {

    // Position

    if (playerPosition === 0) {

        positionEl.textContent =
            "START";

    }

    else {

        positionEl.textContent =
            `${playerPosition} / ${totalSpaces}`;

    }


    // Coins

    coinsEl.textContent =
        coins;


    // Angry Crowd

    crowdStatusEl.textContent =
        crowdTurns;


    // Dice mode

    if (crowdTurns > 0) {

        diceModeEl.textContent =
            "😡 Angry crowd: roll 1 die";

    }

    else {

        diceModeEl.textContent =
            "Roll 2 dice";

    }


    // Shop buttons

    extraRollButton.disabled =
        coins < 5 ||
        gameOver;


    crowdPassButton.disabled =
        coins < 8 ||
        gameOver ||
        crowdTurns === 0;

}


// =========================================
// MOVE PLAYER ONE SPACE
// =========================================

function movePlayerStep(step) {

    return new Promise(resolve => {

        playerPosition += step;


        movePlayerInstant();


        // Restart animation.

        playerEl.classList.remove(
            "moving"
        );


        void playerEl.offsetWidth;


        playerEl.classList.add(
            "moving"
        );


        setTimeout(
            resolve,
            260
        );

    });

}


// =========================================
// MOVE PLAYER MULTIPLE SPACES
// =========================================

async function movePlayer(steps) {

    isMoving = true;

    rollButton.disabled = true;


    for (
        let i = 0;
        i < steps;
        i++
    ) {

        if (
            playerPosition >=
            totalSpaces
        ) {

            break;

        }


        await movePlayerStep(1);

    }


    playerEl.classList.remove(
        "moving"
    );


    isMoving = false;


    updateUI();


    resolveLandingSpace();

}


// =========================================
// COIN SPACE
// =========================================

function collectCoinSpace() {

    /*
        Prevent the same coin space
        from giving coins repeatedly.
    */

    if (
        collectedCoins.has(
            playerPosition
        )
    ) {

        messageEl.textContent =
            "You already collected the coins from here.";

        return;

    }


    // Give 1–3 coins.

    const amount =
        Math.floor(
            Math.random() * 3
        ) + 1;


    coins += amount;


    collectedCoins.add(
        playerPosition
    );


    // Change the board space.

    spaceElements[
        playerPosition
    ].innerHTML = `

        <span class="number">
            ${playerPosition}
        </span>

        <span class="icon">
            ✓
        </span>

    `;


    messageEl.textContent =

        `🪙 You found ${amount} ` +

        `coin${amount === 1 ? "" : "s"}! ` +

        `Your pouch now holds ${coins}.`;

}


// =========================================
// EVENT SPACE
// =========================================

function resolveEvent() {

    const events = [

        {
            text:
                "A sympathetic citizen gives you 2 coins.",

            coins: 2
        },


        {
            text:
                "You find a useful shortcut! Move 1 extra space.",

            move: 1
        },


        {
            text:
                "A revolutionary speech inspires you. Nothing happens, but you feel braver."
        },


        {
            text:
                "You find a hidden coin in the street.",

            coins: 1
        },


        {
            text:
                "A sudden commotion lets you slip forward 2 spaces!",

            move: 2
        }

    ];


    const event =
        events[
            Math.floor(
                Math.random() *
                events.length
            )
        ];


    messageEl.textContent =
        `⭐ ${event.text}`;


    // Add coins.

    if (event.coins) {

        coins += event.coins;

    }


    // Move forward.

    if (
        event.move &&
        playerPosition < totalSpaces
    ) {

        const available =
            Math.min(
                event.move,
                totalSpaces -
                playerPosition
            );


        setTimeout(
            () => movePlayer(available),
            500
        );


        return true;

    }


    return false;

}


// =========================================
// LANDING ON A SPACE
// =========================================

function resolveLandingSpace() {

    // Did the player reach the Guillotine?

    if (
        playerPosition >=
        totalSpaces
    ) {

        finishGame();

        return;

    }


    const landed =
        spaces[playerPosition];


    switch (landed.type) {


        // =================================
        // COIN
        // =================================

        case "coin":

            collectCoinSpace();

            break;


        // =================================
        // ANGRY CROWD
        // =================================

        case "crowd":

            /*
                A Crowd Pass protects
                the player.
            */

            if (crowdPasses > 0) {

                crowdPasses--;


                messageEl.textContent =

                    "🛡️ Your Crowd Pass " +

                    "protects you! The angry " +

                    "crowd cannot slow you down.";

            }


            else {

                /*
                    Player has to roll one die
                    for the next 2 turns.
                */

                crowdTurns = 2;


                messageEl.textContent =

                    "😡 The crowd surrounds you! " +

                    "For the next 2 turns, " +

                    "you roll only ONE die.";

            }

            break;


        // =================================
        // EVENT
        // =================================

        case "event":

            if (
                resolveEvent()
            ) {

                return;

            }

            break;


        // =================================
        // NORMAL SPACE
        // =================================

        case "normal":

            messageEl.textContent =

                `You arrived at ` +

                `${landed.name}.`;

            break;

    }


    updateUI();


    rollButton.disabled =
        false;

}


// =========================================
// WIN GAME
// =========================================

function finishGame() {

    gameOver = true;


    rollButton.disabled =
        true;


    messageEl.textContent =

        `🪓 You reached the Guillotine! ` +

        `You made it with ${coins} coins. ` +

        `Congratulations!`;


    updateUI();

}


// =========================================
// ROLL DICE
// =========================================

async function rollDice() {

    if (
        isMoving ||
        gameOver
    ) {

        return;

    }


    rollButton.disabled =
        true;


    let roll1;

    let roll2 = null;

    let total;


    // =====================================
    // ANGRY CROWD
    // =====================================

    if (crowdTurns > 0) {

        // Roll only ONE die.

        roll1 = rollDie();


        total = roll1;


        setDice(roll1);


        messageEl.textContent =

            `😡 The crowd limits you ` +

            `to one die. You rolled ${roll1}.`;


        // Use one crowd turn.

        crowdTurns--;

    }


    // =====================================
    // NORMAL DICE
    // =====================================

    else {

        roll1 = rollDie();

        roll2 = rollDie();


        total =
            roll1 + roll2;


        setDice(
            roll1,
            roll2
        );


        messageEl.textContent =

            `🎲 You rolled ${roll1} ` +

            `+ ${roll2} = ${total}!`;

    }


    updateUI();


    // =====================================
    // MAKE SURE PLAYER DOESN'T
    // GO PAST THE GUILLOTINE
    // =====================================

    const spacesRemaining =
        totalSpaces -
        playerPosition;


    const actualMovement =
        Math.min(
            total,
            spacesRemaining
        );


    // Move one space at a time.

    await movePlayer(
        actualMovement
    );


    // =====================================
    // EXTRA ROLL
    // =====================================

    if (
        extraRolls > 0 &&
        !gameOver
    ) {

        extraRolls--;


        messageEl.textContent =

            "🎲 Your Extra Roll activates! " +

            "Roll again.";


        updateUI();


        rollButton.disabled =
            false;

    }

}


// =========================================
// BUY EXTRA ROLL
// =========================================

function buyExtraRoll() {

    if (
        coins < 5 ||
        gameOver
    ) {

        return;

    }


    coins -= 5;


    extraRolls++;


    messageEl.textContent =

        "🎲 You bought an Extra Roll! " +

        "It will activate after your next turn.";


    updateUI();

}


// =========================================
// BUY CROWD PASS
// =========================================

function buyCrowdPass() {

    if (
        coins < 8 ||
        crowdTurns === 0 ||
        gameOver
    ) {

        return;

    }


    coins -= 8;


    crowdPasses++;


    messageEl.textContent =

        "🛡️ You bought a Crowd Pass! " +

        "It will protect you from the " +

        "next Angry Crowd.";


    updateUI();

}


// =========================================
// RESTART GAME
// =========================================

function restartGame() {

    playerPosition = 0;

    coins = 0;

    crowdTurns = 0;

    gameOver = false;

    isMoving = false;

    extraRolls = 0;

    crowdPasses = 0;


    collectedCoins =
        new Set();


    setDice(
        1,
        1
    );


    messageEl.textContent =

        "Your journey begins at the START.";


    createBoard();

    updateUI();


    rollButton.disabled =
        false;

}


// =========================================
// BUTTON EVENTS
// =========================================

rollButton.addEventListener(
    "click",
    rollDice
);


restartButton.addEventListener(
    "click",
    restartGame
);


extraRollButton.addEventListener(
    "click",
    buyExtraRoll
);


crowdPassButton.addEventListener(
    "click",
    buyCrowdPass
);


// =========================================
// WINDOW RESIZE
// =========================================

window.addEventListener(
    "resize",
    createBoard
);


// =========================================
// START GAME
// =========================================

createBoard();

updateUI();