// =========================================
// GET TO THE GUILLOTINE
// 60 SPACE BOARD GAME
// =========================================


// =========================================
// HTML ELEMENTS
// =========================================

const board =
    document.getElementById("board");

const gameViewport =
    document.getElementById("game-viewport");

const gameWorld =
    document.getElementById("game-world");

const miniMap =
    document.getElementById("mini-map");

const miniMapWorld =
    document.getElementById("mini-map-world");


const positionEl =
    document.getElementById("position");

const coinsEl =
    document.getElementById("coins");

const crowdStatusEl =
    document.getElementById("crowd-status");


const die1El =
    document.getElementById("die1");

const die2El =
    document.getElementById("die2");


const diceModeEl =
    document.getElementById("dice-mode");

const messageEl =
    document.getElementById("message");


const rollButton =
    document.getElementById("roll-button");

const restartButton =
    document.getElementById("restart-button");


const extraRollButton =
    document.getElementById(
        "extra-roll-button"
    );


const crowdPassButton =
    document.getElementById(
        "crowd-pass-button"
    );


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
// BOARD SIZE
// =========================================

const totalSpaces = 59;


// IMPORTANT:
//
// Space 0 = START
//
// Space 59 = FINISH
//
// Therefore:
//
// 0 through 59
//
// = 60 total spaces.
// =========================================


// =========================================
// WORLD SIZE
// =========================================

const WORLD_WIDTH = 1900;

const WORLD_HEIGHT = 1350;


// =========================================
// PLAYER DATA
// =========================================

let playerPosition = 0;

let coins = 0;

let crowdTurns = 0;

let gameOver = false;

let isMoving = false;

let extraRolls = 0;

let crowdPasses = 0;


// =========================================
// COLLECTED COINS
// =========================================

let collectedCoins =
    new Set();


// =========================================
// BOARD ELEMENT ARRAYS
// =========================================

const spaceElements = [];

const spacePositions = [];


// =========================================
// MULTIPLAYER-READY PLAYER DATA
// =========================================
//
// For now there is only one player.
//
// Later we can add:
// player2
// player3
// player4
//
// Each player can have their own:
// position
// icon
// name
// coins
// etc.
// =========================================

const players = [

    {

        id: "player1",

        name: "You",

        icon: "🧑",

        position: 0,

        isLocalPlayer: true

    }

];


// =========================================
// CREATE LOCAL PLAYER
// =========================================

const playerEl =
    document.createElement("div");


playerEl.className =
    "player";


playerEl.textContent =
    "🧑";


board.appendChild(
    playerEl
);


// =========================================
// SPACE TYPES
// =========================================
//
// 0 = START
//
// 1–56 = regular game
//
// 57 = Angry Mob
//
// 58 = Angry Mob
//
// 59 = Angry Mob + Guillotine
// =========================================

const spaces = [];


// =========================================
// START SPACE
// =========================================

spaces.push({

    type: "start",

    icon: "🏁",

    name: "START"

});


// =========================================
// CREATE SPACES 1–56
// =========================================

const possibleSpaces = [

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
        name: "Angry Mob"
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
    }

];


// =========================================
// ADD 56 NORMAL GAME SPACES
// =========================================

for (
    let i = 1;
    i <= 56;
    i++
) {

    const template =
        possibleSpaces[
            (i - 1) %
            possibleSpaces.length
        ];


    spaces.push({

        type: template.type,

        icon: template.icon,

        name: template.name

    });

}


// =========================================
// FINAL THREE SPACES
// =========================================
//
// These are deliberately separate from
// the normal random space creation.
//
// 57 = Angry Mob
//
// 58 = Angry Mob
//
// 59 = Angry Mob + Guillotine
// =========================================

spaces.push({

    type: "crowd",

    icon: "😡",

    name: "Final Angry Mob"

});


spaces.push({

    type: "crowd",

    icon: "😡",

    name: "Final Angry Mob"

});


spaces.push({

    type: "finish",

    icon: "🪓",

    name: "GUILLOTINE",

    isFinalMob: true

});


// =========================================
// VERIFY BOARD SIZE
// =========================================

console.log(
    "Total spaces:",
    spaces.length
);


// =========================================
// CREATE BOARD
// =========================================

function createBoard() {

    spaceElements.length = 0;

    spacePositions.length = 0;


    // Clear old elements.

    board
        .querySelectorAll(
            ".space, .route-line, .sight-line, .board-label"
        )
        .forEach(
            element => element.remove()
        );


    // =====================================
    // BOARD PATH SETTINGS
    // =====================================

    const cols = 10;

    const rows = 6;


    const xPadding = 120;

    const yPadding = 140;


    const usableWidth =
        WORLD_WIDTH -
        xPadding * 2;


    const usableHeight =
        WORLD_HEIGHT -
        yPadding * 2;


    const xStep =
        usableWidth /
        (cols - 1);


    const yStep =
        usableHeight /
        (rows - 1);


    // =====================================
    // CALCULATE POSITIONS
    // =====================================

    for (
        let row = 0;
        row < rows;
        row++
    ) {

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
                Every other row travels
                in the opposite direction.

                This creates the large
                winding path.
            */

            const actualCol =
                row % 2 === 0
                    ? col
                    : count - 1 - col;


            spacePositions.push({

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
    // CREATE SPACE ELEMENTS
    // =====================================

    for (
        let i = 0;
        i < spaces.length;
        i++
    ) {

        const data =
            spaces[i];


        const pos =
            spacePositions[i];


        const element =
            document.createElement(
                "div"
            );


        element.className =
            `space ${data.type}-space`;


        // Highlight the final three mob spaces.

        if (
            i >= 57
        ) {

            element.classList.add(
                "final-mob-space"
            );

        }


        element.style.left =
            `${pos.x}px`;


        element.style.top =
            `${pos.y}px`;


        let numberText =
            i === 0
                ? "START"
                : i === totalSpaces
                    ? "FINISH"
                    : i;


        element.innerHTML = `

            <span class="number">

                ${numberText}

            </span>


            <span class="icon">

                ${data.icon}

            </span>

        `;


        element.title =
            `${i}: ${data.name}`;


        board.appendChild(
            element
        );


        spaceElements.push(
            element
        );

    }


    // =====================================
    // CREATE SOLID MOVEMENT PATH
    // =====================================

    for (
        let i = 0;
        i <
        spacePositions.length - 1;
        i++
    ) {

        const a =
            spacePositions[i];


        const b =
            spacePositions[i + 1];


        createConnection(
            a,
            b,
            "route-line"
        );

    }


    // =====================================
    // CREATE DOTTED SIGHT LINES
    // =====================================

    createSightLines();


    // =====================================
    // ADD LOCATION LABELS
    // =====================================

    createBoardLabels();


    // =====================================
    // MOVE PLAYER
    // =====================================

    movePlayerInstant();


    // =====================================
    // BUILD MINI MAP
    // =====================================

    createMiniMap();

}


// =========================================
// CREATE A LINE BETWEEN TWO SPACES
// =========================================

function createConnection(
    a,
    b,
    className
) {

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
        ) *
        180 /
        Math.PI;


    const line =
        document.createElement(
            "div"
        );


    line.className =
        className;


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


// =========================================
// CREATE DOTTED SIGHT LINES
// =========================================
//
// These connections do NOT count as movement.
//
// They simply indicate:
//
// "Players on these spaces can see
// each other."
//
// Later the attack system can use
// these same connections.
// =========================================

function createSightLines() {

    /*
        Because the board has rows of spaces,
        we connect spaces that are directly
        across from each other in neighboring
        rows.

        The dotted lines intentionally
        cross areas where there isn't a
        solid movement connection.
    */

    const cols = 10;


    for (
        let i = 0;
        i < spacePositions.length;
        i++
    ) {

        const row =
            Math.floor(i / cols);


        const col =
            i % cols;


        /*
            Connect this space to the
            corresponding space in the
            next row.

            We only create some of the
            possible connections so the
            board doesn't become covered
            in dotted lines.
        */

        if (
            row < 5 &&
            col % 2 === 0
        ) {

            const oppositeIndex =
                i + cols;


            if (
                oppositeIndex <
                spacePositions.length
            ) {

                createConnection(

                    spacePositions[i],

                    spacePositions[
                        oppositeIndex
                    ],

                    "sight-line"

                );

            }

        }

    }

}


// =========================================
// BOARD LABELS
// =========================================

function createBoardLabels() {

    const labels = [

        {
            className:
                "label-paris",

            text:
                "PARIS",

            left:
                "100px",

            top:
                "100px"

        },


        {
            className:
                "label-seine",

            text:
                "THE SEINE",

            left:
                "250px",

            top:
                "1080px"

        },


        {
            className:
                "label-bastille",

            text:
                "BASTILLE",

            left:
                "1250px",

            top:
                "280px"

        },


        {
            className:
                "label-revolution",

            text:
                "PLACE DE LA RÉVOLUTION",

            left:
                "1150px",

            top:
                "850px"

        }

    ];


    labels.forEach(
        data => {

            const label =
                document.createElement(
                    "div"
                );


            label.className =
                `board-label ${data.className}`;


            label.textContent =
                data.text;


            label.style.left =
                data.left;


            label.style.top =
                data.top;


            board.appendChild(
                label
            );

        }
    );

}


// =========================================
// MOVE PLAYER INSTANTLY
// =========================================

function movePlayerInstant() {

    const target =
        spacePositions[
            playerPosition
        ];


    if (!target) {

        return;

    }


    playerEl.style.left =
        `${target.x}px`;


    playerEl.style.top =
        `${target.y}px`;


    centerCameraOnPlayer();

    updateMiniMap();

}


// =========================================
// CENTER CAMERA ON PLAYER
// =========================================

function centerCameraOnPlayer() {

    const target =
        spacePositions[
            playerPosition
        ];


    if (!target) {

        return;

    }


    const viewportWidth =
        gameViewport.clientWidth;


    const viewportHeight =
        gameViewport.clientHeight;


    /*
        Put the player approximately
        in the center of the screen.
    */

    let cameraX =
        viewportWidth / 2 -
        target.x;


    let cameraY =
        viewportHeight / 2 -
        target.y;


    // =====================================
    // DON'T SHOW OUTSIDE THE WORLD
    // =====================================

    const minX =
        viewportWidth -
        WORLD_WIDTH;


    const minY =
        viewportHeight -
        WORLD_HEIGHT;


    cameraX =
        Math.min(
            0,
            Math.max(
                minX,
                cameraX
            )
        );


    cameraY =
        Math.min(
            0,
            Math.max(
                minY,
                cameraY
            )
        );


    gameWorld.style.left =
        `${cameraX}px`;


    gameWorld.style.top =
        `${cameraY}px`;

}


// =========================================
// DICE
// =========================================

function rollDie() {

    return Math.floor(
        Math.random() * 6
    ) + 1;

}


// =========================================
// DISPLAY DICE
// =========================================

function setDice(
    value1,
    value2 = null
) {

    die1El.textContent =
        diceFaces[
            value1 - 1
        ];


    if (
        value2 === null
    ) {

        die2El.style.visibility =
            "hidden";

    }

    else {

        die2El.style.visibility =
            "visible";


        die2El.textContent =
            diceFaces[
                value2 - 1
            ];

    }

}


// =========================================
// UPDATE UI
// =========================================

function updateUI() {

    if (
        playerPosition === 0
    ) {

        positionEl.textContent =
            "START";

    }

    else {

        positionEl.textContent =
            `${playerPosition} / ${totalSpaces}`;

    }


    coinsEl.textContent =
        coins;


    crowdStatusEl.textContent =
        crowdTurns;


    if (
        crowdTurns > 0
    ) {

        diceModeEl.textContent =
            "😡 Angry Mob: Roll 1 Die";

    }

    else {

        diceModeEl.textContent =
            "Roll 2 Dice";

    }


    extraRollButton.disabled =
        coins < 5 ||
        gameOver;


    crowdPassButton.disabled =
        coins < 8 ||
        gameOver ||
        crowdTurns === 0;

}


// =========================================
// MOVE ONE SPACE
// =========================================

function movePlayerStep(
    step
) {

    return new Promise(
        resolve => {

            playerPosition +=
                step;


            movePlayerInstant();


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

        }
    );

}


// =========================================
// MOVE MULTIPLE SPACES
// =========================================

async function movePlayer(
    steps
) {

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
// COINS
// =========================================

function collectCoinSpace() {

    if (
        collectedCoins.has(
            playerPosition
        )
    ) {

        messageEl.textContent =
            "There are no coins left here.";

        return;

    }


    const amount =
        Math.floor(
            Math.random() * 3
        ) + 1;


    coins +=
        amount;


    collectedCoins.add(
        playerPosition
    );


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

        `You now have ${coins}.`;

}


// =========================================
// RANDOM EVENTS
// =========================================

function resolveEvent() {

    const events = [

        {

            text:
                "A sympathetic citizen gives you 2 coins.",

            coins:
                2

        },


        {

            text:
                "You discover a shortcut through the alleys! Move 1 space.",

            move:
                1

        },


        {

            text:
                "A revolutionary speech inspires the crowd. Nothing happens."

        },


        {

            text:
                "You find a hidden coin in the street.",

            coins:
                1

        },


        {

            text:
                "A sudden commotion lets you slip forward 2 spaces!",

            move:
                2

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


    if (
        event.coins
    ) {

        coins +=
            event.coins;

    }


    if (
        event.move &&
        playerPosition <
            totalSpaces
    ) {

        const available =
            Math.min(

                event.move,

                totalSpaces -
                playerPosition

            );


        setTimeout(
            () => movePlayer(
                available
            ),
            500
        );


        return true;

    }


    return false;

}


// =========================================
// LANDING SPACE
// =========================================

function resolveLandingSpace() {

    // =====================================
    // FINISH
    // =====================================

    if (
        playerPosition >=
        totalSpaces
    ) {

        finishGame();

        return;

    }


    const landed =
        spaces[
            playerPosition
        ];


    // =====================================
    // SPACE TYPE
    // =====================================

    switch (
        landed.type
    ) {


        // ================================
        // COIN
        // ================================

        case "coin":

            collectCoinSpace();

            break;


        // ================================
        // ANGRY MOB
        // ================================

        case "crowd":

            /*
                The player has reached
                an Angry Mob space.

                They will roll only one
                die for the next 2 turns.
            */

            if (
                crowdPasses > 0
            ) {

                crowdPasses--;


                messageEl.textContent =

                    "🛡️ Your Crowd Pass " +

                    "protects you from the mob!";

            }

            else {

                crowdTurns = 2;


                if (
                    playerPosition >= 57
                ) {

                    messageEl.textContent =

                        "😡 FINAL MOB! " +

                        "The crowd closes in! " +

                        "You must roll ONE die " +

                        "for your next 2 turns.";

                }

                else {

                    messageEl.textContent =

                        "😡 The angry mob " +

                        "surrounds you! " +

                        "You roll ONE die " +

                        "for your next 2 turns.";

                }

            }

            break;


        // ================================
        // EVENT
        // ================================

        case "event":

            if (
                resolveEvent()
            ) {

                return;

            }

            break;


        // ================================
        // NORMAL
        // ================================

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
// WIN
// =========================================

function finishGame() {

    gameOver = true;


    rollButton.disabled =
        true;


    messageEl.textContent =

        `🪓 You reached the Guillotine! ` +

        `You survived the final mob ` +

        `with ${coins} coins! ` +

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
    // ANGRY MOB
    // =====================================

    if (
        crowdTurns > 0
    ) {

        roll1 =
            rollDie();


        total =
            roll1;


        setDice(
            roll1
        );


        messageEl.textContent =

            `😡 The mob limits ` +

            `you to one die. ` +

            `You rolled ${roll1}.`;


        crowdTurns--;

    }


    // =====================================
    // NORMAL
    // =====================================

    else {

        roll1 =
            rollDie();


        roll2 =
            rollDie();


        total =
            roll1 +
            roll2;


        setDice(
            roll1,
            roll2
        );


        messageEl.textContent =

            `🎲 You rolled ` +

            `${roll1} + ${roll2} ` +

            `= ${total}!`;

    }


    updateUI();


    // =====================================
    // DON'T PASS FINISH
    // =====================================

    const spacesRemaining =

        totalSpaces -
        playerPosition;


    const actualMovement =

        Math.min(
            total,
            spacesRemaining
        );


    // =====================================
    // MOVE PLAYER
    // =====================================

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


    coins -=
        5;


    extraRolls++;


    messageEl.textContent =

        "🎲 You purchased an Extra Roll! " +

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


    coins -=
        8;


    crowdPasses++;


    messageEl.textContent =

        "🛡️ You purchased a Crowd Pass! " +

        "It will protect you from the next mob.";

    
    updateUI();

}


// =========================================
// MINI MAP
// =========================================

function createMiniMap() {

    miniMapWorld.innerHTML = "";


    const mapWidth =
        miniMapWorld.clientWidth;


    const mapHeight =
        miniMapWorld.clientHeight;


    // =====================================
    // CREATE MINI SPACES
    // =====================================

    for (
        let i = 0;
        i < spaces.length;
        i++
    ) {

        const position =
            spacePositions[i];


        const miniSpace =
            document.createElement(
                "div"
            );


        miniSpace.className =
            "mini-space";


        if (
            spaces[i].type ===
            "coin"
        ) {

            miniSpace.classList.add(
                "coin"
            );

        }


        if (
            spaces[i].type ===
            "crowd"
        ) {

            miniSpace.classList.add(
                "crowd"
            );

        }


        if (
            i === totalSpaces
        ) {

            miniSpace.classList.add(
                "finish"
            );

        }


        miniSpace.style.left =

            `${(
                position.x /
                WORLD_WIDTH
            ) * 100}%`;


        miniSpace.style.top =

            `${(
                position.y /
                WORLD_HEIGHT
            ) * 100}%`;


        miniMapWorld.appendChild(
            miniSpace
        );

    }


    // =====================================
    // CREATE PLAYER MARKERS
    // =====================================

    updateMiniMap();

}


// =========================================
// UPDATE MINI MAP
// =========================================

function updateMiniMap() {

    // Remove old player markers.

    miniMapWorld
        .querySelectorAll(
            ".mini-player, .mini-other-player"
        )
        .forEach(
            marker =>
                marker.remove()
        );


    // =====================================
    // ALL PLAYERS
    // =====================================

    players.forEach(
        player => {

            const position =
                spacePositions[
                    player.position
                ];


            if (!position) {

                return;

            }


            const marker =
                document.createElement(
                    "div"
                );


            if (
                player.isLocalPlayer
            ) {

                marker.className =
                    "mini-player";

            }

            else {

                marker.className =
                    "mini-other-player";

            }


            marker.style.left =

                `${(
                    position.x /
                    WORLD_WIDTH
                ) * 100}%`;


            marker.style.top =

                `${(
                    position.y /
                    WORLD_HEIGHT
                ) * 100}%`;


            marker.title =
                player.name;


            miniMapWorld.appendChild(
                marker
            );

        }
    );

}


// =========================================
// RESTART
// =========================================

function restartGame() {

    playerPosition =
        0;


    players[0].position =
        0;


    coins =
        0;


    crowdTurns =
        0;


    gameOver =
        false;


    isMoving =
        false;


    extraRolls =
        0;


    crowdPasses =
        0;


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
// RESIZE
// =========================================

window.addEventListener(
    "resize",
    () => {

        createBoard();

        centerCameraOnPlayer();

    }
);


// =========================================
// START GAME
// =========================================

createBoard();

updateUI();

centerCameraOnPlayer();