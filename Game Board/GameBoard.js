/* =========================================================
   GET TO THE GUILLOTINE
   NEW BOARD + LOCAL MULTIPLAYER
========================================================= */


/* =========================================================
   GAME SETTINGS
========================================================= */

const MAX_PLAYERS = 6;

const SPACE_RADIUS = 25;

const NORMAL_DICE = 2;

const MOB_DICE = 1;


/* =========================================================
   PLAYER DATA
========================================================= */

const players = [

    {
        id: 1,
        name: "Player 1",
        token: "1",
        color: "#7b1e27",
        position: 0,
        coins: 0
    },

    {
        id: 2,
        name: "Player 2",
        token: "2",
        color: "#263f59",
        position: 0,
        coins: 0
    },

    {
        id: 3,
        name: "Player 3",
        token: "3",
        color: "#68502d",
        position: 0,
        coins: 0
    },

    {
        id: 4,
        name: "Player 4",
        token: "4",
        color: "#4d3155",
        position: 0,
        coins: 0
    },

    {
        id: 5,
        name: "Player 5",
        token: "5",
        color: "#315843",
        position: 0,
        coins: 0
    },

    {
        id: 6,
        name: "Player 6",
        token: "6",
        color: "#8a4b27",
        position: 0,
        coins: 0
    }

];


/* =========================================================
   TURN STATE
========================================================= */

let currentPlayerIndex = 0;

let gameOver = false;

let isMoving = false;


/* =========================================================
   BOARD DATA
=========================================================

   0 = START

   Types:

   normal
   coin
   mob
   shortcut
   dark-alley
   finish

========================================================= */

const spaces = [

    /* -----------------------------------------------------
       START
    ----------------------------------------------------- */

    {
        id: 0,
        x: 75,
        y: 85,
        type: "start",
        name: "Piece de Resistance"
    },


    /* -----------------------------------------------------
       TOP PATH
    ----------------------------------------------------- */

    {
        id: 1,
        x: 170,
        y: 85,
        type: "normal"
    },

    {
        id: 2,
        x: 270,
        y: 85,
        type: "coin"
    },

    {
        id: 3,
        x: 370,
        y: 85,
        type: "normal"
    },

    {
        id: 4,
        x: 470,
        y: 85,
        type: "mob"
    },

    {
        id: 5,
        x: 570,
        y: 85,
        type: "normal"
    },

    {
        id: 6,
        x: 670,
        y: 85,
        type: "mob"
    },

    {
        id: 7,
        x: 770,
        y: 85,
        type: "normal"
    },

    {
        id: 8,
        x: 870,
        y: 85,
        type: "normal"
    },

    {
        id: 9,
        x: 970,
        y: 85,
        type: "coin"
    },


    /* -----------------------------------------------------
       FIRST SHORTCUT
    ----------------------------------------------------- */

    {
        id: "shortcut-1",
        x: 870,
        y: 170,
        type: "shortcut",

        shortcutTarget: 14
    },


    {
        id: "alley-1",
        x: 1040,
        y: 125,
        type: "dark-alley"
    },

    {
        id: "alley-2",
        x: 1040,
        y: 185,
        type: "dark-alley"
    },


    /* -----------------------------------------------------
       SECOND ROW
    ----------------------------------------------------- */

    {
        id: 10,
        x: 970,
        y: 220,
        type: "normal"
    },

    {
        id: 11,
        x: 870,
        y: 220,
        type: "mob"
    },

    {
        id: 12,
        x: 770,
        y: 220,
        type: "normal"
    },

    {
        id: 13,
        x: 670,
        y: 220,
        type: "coin"
    },

    {
        id: 14,
        x: 570,
        y: 220,
        type: "normal"
    },

    {
        id: 15,
        x: 470,
        y: 220,
        type: "mob"
    },

    {
        id: 16,
        x: 370,
        y: 220,
        type: "normal"
    },

    {
        id: 17,
        x: 270,
        y: 220,
        type: "coin"
    },

    {
        id: 18,
        x: 170,
        y: 220,
        type: "normal"
    },


    /* -----------------------------------------------------
       THIRD ROW
    ----------------------------------------------------- */

    {
        id: 19,
        x: 170,
        y: 340,
        type: "mob"
    },

    {
        id: 20,
        x: 270,
        y: 340,
        type: "normal"
    },

    {
        id: 21,
        x: 370,
        y: 340,
        type: "coin"
    },

    {
        id: 22,
        x: 470,
        y: 340,
        type: "normal"
    },

    {
        id: 23,
        x: 570,
        y: 340,
        type: "mob"
    },

    {
        id: 24,
        x: 670,
        y: 340,
        type: "normal"
    },

    {
        id: 25,
        x: 770,
        y: 340,
        type: "coin"
    },

    {
        id: 26,
        x: 870,
        y: 340,
        type: "normal"
    },

    {
        id: 27,
        x: 970,
        y: 340,
        type: "mob"
    },


    /* -----------------------------------------------------
       CENTRAL SHORTCUT
    ----------------------------------------------------- */

    {
        id: "shortcut-2",
        x: 570,
        y: 260,
        type: "shortcut",

        shortcutTarget: 31
    },


    /* -----------------------------------------------------
       REVOLUTIONARY SQUARE EXIT
    ----------------------------------------------------- */

    {
        id: 28,
        x: 1070,
        y: 340,
        type: "normal"
    },

    {
        id: 29,
        x: 1070,
        y: 440,
        type: "coin"
    },

    {
        id: 30,
        x: 970,
        y: 440,
        type: "normal"
    },

    {
        id: 31,
        x: 870,
        y: 440,
        type: "normal"
    },

    {
        id: 32,
        x: 770,
        y: 440,
        type: "mob"
    },

    {
        id: 33,
        x: 670,
        y: 440,
        type: "coin"
    },

    {
        id: 34,
        x: 570,
        y: 440,
        type: "normal"
    },

    {
        id: 35,
        x: 470,
        y: 440,
        type: "mob"
    },

    {
        id: 36,
        x: 370,
        y: 440,
        type: "normal"
    },

    {
        id: 37,
        x: 270,
        y: 440,
        type: "coin"
    },

    {
        id: 38,
        x: 170,
        y: 440,
        type: "normal"
    },


    /* -----------------------------------------------------
       LOWER PATH
    ----------------------------------------------------- */

    {
        id: 39,
        x: 170,
        y: 550,
        type: "mob"
    },

    {
        id: 40,
        x: 270,
        y: 550,
        type: "normal"
    },

    {
        id: 41,
        x: 370,
        y: 550,
        type: "coin"
    },

    {
        id: 42,
        x: 470,
        y: 550,
        type: "normal"
    },

    {
        id: 43,
        x: 570,
        y: 550,
        type: "mob"
    },

    {
        id: 44,
        x: 670,
        y: 550,
        type: "normal"
    },

    {
        id: 45,
        x: 770,
        y: 550,
        type: "coin"
    },

    {
        id: 46,
        x: 870,
        y: 550,
        type: "normal"
    },

    {
        id: 47,
        x: 930,
        y: 600,
        type: "mob"
    },

    {
        id: 48,
        x: 1000,
        y: 630,
        type: "finish",
        name: "The Guillotine"
    }

];


/* =========================================================
   SVG ELEMENTS
========================================================= */

const board = document.getElementById("gameBoard");

const spaceLayer =
    document.getElementById("spaceLayer");

const movementPathLayer =
    document.getElementById("movementPathLayer");

const lineOfSightLayer =
    document.getElementById("lineOfSightLayer");

const playerLayer =
    document.getElementById("playerLayer");


/* =========================================================
   HELPER: CREATE SVG ELEMENT
========================================================= */

function createSVGElement(type, attributes = {}) {

    const element =
        document.createElementNS(
            "http://www.w3.org/2000/svg",
            type
        );

    Object.entries(attributes).forEach(
        ([key, value]) => {

            element.setAttribute(key, value);

        }
    );

    return element;
}


/* =========================================================
   FIND SPACE
========================================================= */

function getSpace(id) {

    return spaces.find(
        space => space.id === id
    );

}


/* =========================================================
   DRAW BOARD SPACES
========================================================= */

function createSpaces() {

    spaceLayer.innerHTML = "";


    spaces.forEach(space => {

        let element;


        /* -------------------------------------------------
           START
        ------------------------------------------------- */

        if (space.type === "start") {

            element = createSVGElement(
                "circle",
                {
                    cx: space.x,
                    cy: space.y,
                    r: 38,
                    class: "board-space start-space"
                }
            );


            const text =
                createSVGElement(
                    "text",
                    {
                        x: space.x,
                        y: space.y,
                        class: "start-text"
                    }
                );

            text.textContent = "START";

            spaceLayer.appendChild(element);

            spaceLayer.appendChild(text);

            return;
        }


        /* -------------------------------------------------
           DARK ALLEY
        ------------------------------------------------- */

        if (space.type === "dark-alley") {

            element = createSVGElement(
                "rect",
                {
                    x: space.x - 22,
                    y: space.y - 22,
                    width: 44,
                    height: 44,
                    class: "dark-alley-space"
                }
            );


            const text =
                createSVGElement(
                    "text",
                    {
                        x: space.x,
                        y: space.y,
                        class: "dark-alley-symbol"
                    }
                );

            text.textContent = "DARK";

            spaceLayer.appendChild(element);

            spaceLayer.appendChild(text);

            return;
        }


        /* -------------------------------------------------
           FINISH
        ------------------------------------------------- */

        if (space.type === "finish") {

            element = createSVGElement(
                "circle",
                {
                    cx: space.x,
                    cy: space.y,
                    r: 32,
                    class: "board-space finish-space"
                }
            );


            const text =
                createSVGElement(
                    "text",
                    {
                        x: space.x,
                        y: space.y,
                        class: "finish-text"
                    }
                );

            text.textContent = "G";

            spaceLayer.appendChild(element);

            spaceLayer.appendChild(text);

            return;
        }


        /* -------------------------------------------------
           SHORTCUT
        ------------------------------------------------- */

        if (space.type === "shortcut") {

            element = createSVGElement(
                "polygon",
                {
                    points:
                        createStarPoints(
                            space.x,
                            space.y,
                            32,
                            20,
                            12
                        ),

                    class: "shortcut-space"
                }
            );


            const text =
                createSVGElement(
                    "text",
                    {
                        x: space.x,
                        y: space.y,
                        class: "shortcut-symbol"
                    }
                );

            text.textContent = "SHORTCUT";

            spaceLayer.appendChild(element);

            spaceLayer.appendChild(text);

            return;
        }


        /* -------------------------------------------------
           MOB / COIN / NORMAL
        ------------------------------------------------- */

        element = createSVGElement(
            "circle",
            {
                cx: space.x,
                cy: space.y,
                r: SPACE_RADIUS,
                class:
                    `board-space ${
                        space.type === "mob"
                            ? "mob-space"
                            : space.type === "coin"
                                ? "coin-space"
                                : ""
                    }`
            }
        );


        spaceLayer.appendChild(element);


        /* Number */

        const number =
            createSVGElement(
                "text",
                {
                    x: space.x,
                    y: space.y,
                    class:
                        space.type === "mob"
                            ? "mob-symbol"
                            : space.type === "coin"
                                ? "coin-symbol"
                                : "board-space-number"
                }
            );


        if (space.type === "mob") {

            number.textContent = "MOB";

        }
        else if (space.type === "coin") {

            number.textContent =
                `${space.id}  C`;

        }
        else {

            number.textContent =
                space.id;

        }


        spaceLayer.appendChild(number);

    });

}


/* =========================================================
   STAR SHAPE
========================================================= */

function createStarPoints(
    centerX,
    centerY,
    outerRadius,
    innerRadius,
    points
) {

    const coordinates = [];

    const step =
        Math.PI / points;

    for (
        let i = 0;
        i < points * 2;
        i++
    ) {

        const radius =
            i % 2 === 0
                ? outerRadius
                : innerRadius;

        const angle =
            i * step - Math.PI / 2;

        const x =
            centerX +
            Math.cos(angle) * radius;

        const y =
            centerY +
            Math.sin(angle) * radius;

        coordinates.push(
            `${x},${y}`
        );

    }

    return coordinates.join(" ");

}


/* =========================================================
   MOVEMENT LINES
========================================================= */

function createMovementPaths() {

    movementPathLayer.innerHTML = "";


    /*
        Connect numbered spaces in order.

        Special shortcut/dark alley spaces are not part
        of the normal numbered movement route.
    */

    const numberedSpaces =
        spaces.filter(
            space =>
                typeof space.id === "number"
        );


    for (
        let i = 0;
        i < numberedSpaces.length - 1;
        i++
    ) {

        const first =
            numberedSpaces[i];

        const second =
            numberedSpaces[i + 1];


        const line =
            createSVGElement(
                "line",
                {
                    x1: first.x,
                    y1: first.y,
                    x2: second.x,
                    y2: second.y,
                    class: "movement-line"
                }
            );


        movementPathLayer.appendChild(line);

    }

}


/* =========================================================
   LINE OF SIGHT
========================================================= */

function createLineOfSight() {

    lineOfSightLayer.innerHTML = "";


    /*
        These are intentionally visual for now.

        Later these same relationships can be used by
        the attack system.
    */

    const sightPairs = [

        [2, 17],
        [3, 16],
        [5, 14],
        [6, 13],

        [9, 12],
        [11, 25],

        [20, 36],
        [21, 35],

        [22, 34],
        [25, 33],

        [29, 45],
        [30, 44],

        [37, 41],
        [38, 40]

    ];


    sightPairs.forEach(
        ([firstID, secondID]) => {

            const first =
                getSpace(firstID);

            const second =
                getSpace(secondID);


            if (!first || !second) {
                return;
            }


            const line =
                createSVGElement(
                    "line",
                    {
                        x1: first.x,
                        y1: first.y,
                        x2: second.x,
                        y2: second.y,
                        class: "line-of-sight"
                    }
                );


            lineOfSightLayer.appendChild(line);

        }
    );

}


/* =========================================================
   CREATE PLAYER TOKENS
========================================================= */

function createPlayers() {

    playerLayer.innerHTML = "";


    players.forEach(
        player => {

            const space =
                getSpace(
                    player.position
                );


            if (!space) {
                return;
            }


            const token =
                createSVGElement(
                    "circle",
                    {
                        cx: space.x,
                        cy: space.y,
                        r: 18,
                        class: "player-token",

                        fill: player.color,

                        "data-player":
                            player.id
                    }
                );


            /*
                Offset players slightly if multiple players
                occupy the same space.
            */

            const offset =
                getPlayerOffset(
                    player
                );


            token.setAttribute(
                "cx",
                space.x + offset.x
            );

            token.setAttribute(
                "cy",
                space.y + offset.y
            );


            const text =
                createSVGElement(
                    "text",
                    {
                        x:
                            space.x +
                            offset.x,

                        y:
                            space.y +
                            offset.y,

                        class:
                            "player-token-text"
                    }
                );


            text.textContent =
                player.token;


            playerLayer.appendChild(token);

            playerLayer.appendChild(text);

        }
    );

}


/* =========================================================
   PLAYER TOKEN OFFSET
========================================================= */

function getPlayerOffset(player) {

    const playersHere =
        players.filter(
            other =>
                other.position ===
                player.position
        );


    const index =
        playersHere.indexOf(player);


    if (playersHere.length === 1) {

        return {
            x: 0,
            y: 0
        };

    }


    const offsets = [

        { x: -12, y: -12 },
        { x: 12, y: -12 },
        { x: -12, y: 12 },
        { x: 12, y: 12 },
        { x: 0, y: -17 },
        { x: 0, y: 17 }

    ];


    return offsets[
        index % offsets.length
    ];

}


/* =========================================================
   PLAYER LIST
========================================================= */

function updatePlayerList() {

    const playerList =
        document.getElementById(
            "playerList"
        );


    playerList.innerHTML = "";


    players.forEach(
        (player, index) => {

            const entry =
                document.createElement("div");


            entry.className =
                "player-entry";


            if (
                index ===
                currentPlayerIndex
            ) {

                entry.classList.add(
                    "active"
                );

            }


            entry.innerHTML = `

                <span
                    style="
                        color:${player.color};
                        font-weight:bold;
                    "
                >
                    ●
                </span>

                <span>
                    ${player.name}
                </span>

            `;


            playerList.appendChild(
                entry
            );

        }
    );

}


/* =========================================================
   CURRENT PLAYER DISPLAY
========================================================= */

function updateTurnDisplay() {

    const player =
        players[
            currentPlayerIndex
        ];


    document.getElementById(
        "currentPlayerDisplay"
    ).textContent =
        player.name;


    document.getElementById(
        "turnMessage"
    ).textContent =
        `${player.coins} coin${
            player.coins === 1
                ? ""
                : "s"
        }`;


    updatePlayerList();

}


/* =========================================================
   DETERMINE DICE COUNT
========================================================= */

function getDiceCount(player) {

    const space =
        getSpace(
            player.position
        );


    /*
        If the player is currently on an Angry Mob
        space, they only get one die.
    */

    if (
        space &&
        space.type === "mob"
    ) {

        return MOB_DICE;

    }


    return NORMAL_DICE;

}


/* =========================================================
   ROLL DICE
========================================================= */

function rollDice() {

    if (gameOver || isMoving) {
        return;
    }


    const player =
        players[
            currentPlayerIndex
        ];


    const diceCount =
        getDiceCount(player);


    const die1 =
        Math.floor(
            Math.random() * 6
        ) + 1;


    let die2 = 0;


    if (diceCount === 2) {

        die2 =
            Math.floor(
                Math.random() * 6
            ) + 1;

    }


    document.getElementById(
        "die1"
    ).textContent =
        die1;


    document.getElementById(
        "die2"
    ).textContent =
        diceCount === 2
            ? die2
            : "-";


    document.getElementById(
        "diceMode"
    ).textContent =
        diceCount === 1
            ? "ANGRY MOB — ONE DIE"
            : "TWO DICE";


    const total =
        die1 + die2;


    movePlayer(
        player,
        total
    );

}


/* =========================================================
   MOVE PLAYER
========================================================= */

async function movePlayer(
    player,
    amount
) {

    isMoving = true;

    document.getElementById(
        "rollButton"
    ).disabled = true;


    for (
        let i = 0;
        i < amount;
        i++
    ) {

        const nextPosition =
            getNextNumberedPosition(
                player.position
            );


        if (
            nextPosition === null
        ) {

            break;

        }


        player.position =
            nextPosition;


        createPlayers();

        updatePlayerList();


        await delay(300);

    }


    await resolveLanding(
        player
    );


    createPlayers();

    updateTurnDisplay();


    if (!gameOver) {

        nextTurn();

    }

}


/* =========================================================
   GET NEXT NUMBERED SPACE
========================================================= */

function getNextNumberedPosition(
    currentPosition
) {

    const numberedSpaces =
        spaces.filter(
            space =>
                typeof space.id === "number"
        );


    const currentIndex =
        numberedSpaces.findIndex(
            space =>
                space.id ===
                currentPosition
        );


    if (currentIndex === -1) {

        return 1;

    }


    if (
        currentIndex >=
        numberedSpaces.length - 1
    ) {

        return numberedSpaces[
            numberedSpaces.length - 1
        ].id;

    }


    return numberedSpaces[
        currentIndex + 1
    ].id;

}


/* =========================================================
   LANDING EFFECTS
========================================================= */

async function resolveLanding(
    player
) {

    const space =
        getSpace(
            player.position
        );


    if (!space) {
        return;
    }


    /* -----------------------------------------------
       COIN
    ------------------------------------------------ */

    if (space.type === "coin") {

        player.coins += 1;


        showMessage(
            `${player.name} found a coin!`
        );

    }


    /* -----------------------------------------------
       ANGRY MOB
    ------------------------------------------------ */

    else if (
        space.type === "mob"
    ) {

        showMessage(
            `${player.name} entered the Angry Mob!`
        );

    }


    /* -----------------------------------------------
       DARK ALLEY
    ------------------------------------------------ */

    else if (
        space.type === "dark-alley"
    ) {

        player.coins = 0;

        player.position = 0;


        showMessage(
            `${player.name} was caught in the Dark Alley! ` +
            `All coins lost. Returned to the Start.`
        );

    }


    /* -----------------------------------------------
       SHORTCUT
    ------------------------------------------------ */

    else if (
        space.type === "shortcut"
    ) {

        await askShortcut(
            player,
            space
        );

    }


    /* -----------------------------------------------
       FINISH
    ------------------------------------------------ */

    else if (
        space.type === "finish"
    ) {

        endGame(
            player
        );

    }

}


/* =========================================================
   SHORTCUT CHOICE
========================================================= */

function askShortcut(
    player,
    shortcut
) {

    return new Promise(
        resolve => {

            const useShortcut =
                confirm(
                    `${player.name} found a shortcut!\n\n` +
                    `Do you want to risk taking the Dark Alley?`
                );


            if (useShortcut) {

                /*
                    For this first version, the shortcut
                    jumps ahead to the shortcut target.

                    Later we can make the Dark Alley
                    a complete alternate route with
                    individual spaces.
                */

                player.position =
                    shortcut.shortcutTarget;


                showMessage(
                    `${player.name} took the shortcut!`
                );

            }
            else {

                showMessage(
                    `${player.name} stayed on the main road.`
                );

            }


            createPlayers();


            resolve();

        }
    );

}


/* =========================================================
   TURN SWITCHING
========================================================= */

function nextTurn() {

    currentPlayerIndex++;

    if (
        currentPlayerIndex >=
        players.length
    ) {

        currentPlayerIndex = 0;

    }


    updateTurnDisplay();


    const player =
        players[
            currentPlayerIndex
        ];


    const space =
        getSpace(
            player.position
        );


    if (
        space &&
        space.type === "mob"
    ) {

        showMessage(
            `${player.name}'s turn. ` +
            `The Angry Mob forces one die!`
        );

    }
    else {

        showMessage(
            `${player.name}'s turn. Roll the dice!`
        );

    }


    isMoving = false;


    document.getElementById(
        "rollButton"
    ).disabled = false;

}


/* =========================================================
   END GAME
========================================================= */

function endGame(player) {

    gameOver = true;


    document.getElementById(
        "winnerText"
    ).textContent =
        `${player.name} reached the Guillotine!`;


    document.getElementById(
        "gameOverPanel"
    ).classList.remove(
        "hidden"
    );


    document.getElementById(
        "rollButton"
    ).disabled = true;

}


/* =========================================================
   MESSAGE
========================================================= */

function showMessage(message) {

    document.getElementById(
        "gameMessage"
    ).textContent =
        message;

}


/* =========================================================
   DELAY
========================================================= */

function delay(ms) {

    return new Promise(
        resolve =>
            setTimeout(
                resolve,
                ms
            )
    );

}


/* =========================================================
   RESTART GAME
========================================================= */

function restartGame() {

    players.forEach(
        player => {

            player.position = 0;

            player.coins = 0;

        }
    );


    currentPlayerIndex = 0;

    gameOver = false;

    isMoving = false;


    document.getElementById(
        "die1"
    ).textContent = "-";


    document.getElementById(
        "die2"
    ).textContent = "-";


    document.getElementById(
        "diceMode"
    ).textContent =
        "TWO DICE";


    document.getElementById(
        "gameOverPanel"
    ).classList.add(
        "hidden"
    );


    document.getElementById(
        "rollButton"
    ).disabled = false;


    createPlayers();

    updateTurnDisplay();

    showMessage(
        "The revolution begins again!"
    );

}


/* =========================================================
   BUTTONS
========================================================= */

document.getElementById(
    "rollButton"
).addEventListener(
    "click",
    rollDice
);


document.getElementById(
    "restartButton"
).addEventListener(
    "click",
    restartGame
);


/* These buttons don't have functionality yet. */

document.getElementById(
    "chatButton"
).addEventListener(
    "click",
    () => {

        showMessage(
            "Chatroom coming soon."
        );

    }
);


document.getElementById(
    "rulesButton"
).addEventListener(
    "click",
    () => {

        showMessage(
            "Game Rules coming soon."
        );

    }
);


document.getElementById(
    "leaderboardButton"
).addEventListener(
    "click",
    () => {

        showMessage(
            "Leader Boards coming soon."
        );

    }
);


/* =========================================================
   INITIALIZE BOARD
========================================================= */

function initializeGame() {

    createSpaces();

    createMovementPaths();

    createLineOfSight();

    createPlayers();

    updateTurnDisplay();

    showMessage(
        "Player 1 begins the revolution!"
    );

}


initializeGame();