(() => {
    "use strict";

    // ============================================
    // GET TO THE GUILLOTINE
    // ============================================

    const MAX_PLAYERS = 6;

    const PLAYER_IMAGES = [
        "characters/Robespierre.gif",
        "characters/Anne Bolyne.gif",
        "characters/King Louis XVI.gif",
        "characters/Marie Antoinette.gif",
        "characters/Queen of Hearts.gif",
        "characters/HeadlessHoreman.png"
    ];

    const BOARD_WIDTH = 1037;
    const BOARD_HEIGHT = 585;

    const SPACE_RADIUS = 18;
    const START_SPACE_RADIUS = 24;
    const FINISH_SPACE_RADIUS = 30;

    const SAFE_ZONE_SPACES = 7;

    const PLAYER_COLORS = [
        "#a52a35",
        "#315c79",
        "#8d713c",
        "#62447c",
        "#39745b",
        "#b85b30"
    ];

    /*
     * START = separate starting position.
     * Artwork markers = positions 1 through 71.
     * G = final destination, position 72.
     */

       const ARTWORK_SPACES = [
        { type: "normal", x: 266, y: 68, label: "1" },
        { type: "normal", x: 338, y: 40, label: "2" },
        { type: "normal", x: 411, y: 67, label: "3" },
        { type: "normal", x: 484, y: 36, label: "4" },
        { type: "normal", x: 556, y: 72, label: "5" },
        { type: "coin", x: 622, y: 112, label: "6" },
        { type: "normal", x: 669, y: 50, label: "7" },
        { type: "normal", x: 745, y: 51, label: "8" },
        { type: "normal", x: 769, y: 120, label: "9" },
        { type: "angryMob", x: 715, y: 171, label: "10" },
        { type: "angryMob", x: 747, y: 239, label: "11" },
        { type: "think", x: 826, y: 233, label: "12" },
        { type: "normal", x: 844, y: 157, label: "13" },
        { type: "normal", x: 853, y: 79, label: "14" },
        { type: "normal", x: 915, y: 44, label: "15" },
        { type: "coin", x: 947, y: 102, label: "16" },
        { type: "normal", x: 919, y: 172, label: "17" },
        { type: "angryMob", x: 952, y: 236, label: "18" },
        { type: "normal", x: 919, y: 301, label: "19" },
        { type: "normal", x: 962, y: 362, label: "20" },
        { type: "coin", x: 938, y: 432, label: "21" },
        { type: "normal", x: 961, y: 501, label: "22" },
        { type: "angryMob", x: 898, y: 522, label: "23" },
        { type: "normal", x: 843, y: 470, label: "24" },
        { type: "normal", x: 799, y: 524, label: "25" },
        { type: "coin", x: 725, y: 521, label: "26" },
        { type: "normal", x: 763, y: 455, label: "27" },
        { type: "normal", x: 760, y: 379, label: "28" },
        { type: "coin", x: 735, y: 313, label: "29" },
        { type: "normal", x: 672, y: 257, label: "30" },
        { type: "normal", x: 634, y: 186, label: "31" },
        { type: "normal", x: 570, y: 159, label: "32" },
        { type: "coin", x: 507, y: 128, label: "33" },
        { type: "think", x: 425, y: 135, label: "34" },
        { type: "angryMob", x: 347, y: 124, label: "35" },
        { type: "normal", x: 268, y: 143, label: "36" },
        { type: "coin", x: 196, y: 138, label: "37" },
        { type: "coin", x: 116, y: 160, label: "38" },
        { type: "normal", x: 52, y: 212, label: "39" },
        { type: "angryMob", x: 47, y: 282, label: "40" },
        { type: "normal", x: 40, y: 347, label: "41" },
        { type: "coin", x: 48, y: 417, label: "42" },
        { type: "normal", x: 56, y: 484, label: "43" },
        { type: "normal", x: 124, y: 504, label: "44" },
        { type: "angryMob", x: 134, y: 430, label: "45" },
        { type: "normal", x: 113, y: 344, label: "46" },
        { type: "coin", x: 132, y: 256, label: "47" },
        { type: "normal", x: 191, y: 211, label: "48" },
        { type: "normal", x: 269, y: 211, label: "49" },
        { type: "normal", x: 260, y: 278, label: "50" },
        { type: "normal", x: 198, y: 295, label: "51" },
        { type: "coin", x: 195, y: 369, label: "52" },
        { type: "normal", x: 203, y: 455, label: "53" },
        { type: "normal", x: 181, y: 525, label: "54" },
        { type: "angryMob", x: 253, y: 516, label: "55" },
        { type: "coin", x: 325, y: 524, label: "56" },
        { type: "normal", x: 394, y: 530, label: "57" },
        { type: "normal", x: 461, y: 521, label: "58" },
        { type: "normal", x: 427, y: 463, label: "59" },
        { type: "normal", x: 359, y: 449, label: "60" },
        { type: "think", x: 275, y: 426, label: "61" },
        { type: "normal", x: 277, y: 348, label: "62" },
        { type: "normal", x: 338, y: 296, label: "63" },
        { type: "coin", x: 411, y: 302, label: "64" },
        { type: "normal", x: 470, y: 368, label: "65" },
        { type: "normal", x: 493, y: 433, label: "66" },
        { type: "coin", x: 527, y: 498, label: "67" },
        { type: "normal", x: 593, y: 520, label: "68" },
        { type: "normal", x: 658, y: 496, label: "69" },
        { type: "angryMob", x: 697, y: 435, label: "70" },
        { type: "angryMob", x: 680, y: 360, label: "71" },
        { type: "angryMob", x: 618, y: 305, label: "72" },
    ];

    const TOTAL_SPACES = ARTWORK_SPACES.length + 2;

    const COIN_SPACES = new Set(
        ARTWORK_SPACES
            .map((space, index) =>
                space.type === "coin" ? index + 1 : -1
            )
            .filter(index => index >= 0)
    );

    const ANGRY_MOB_SPACES = new Set(
        ARTWORK_SPACES
            .map((space, index) =>
                space.type === "angryMob" ? index + 1 : -1
            )
            .filter(index => index >= 0)
    );

    const THINK_SPACES = new Set(
        ARTWORK_SPACES
            .map((space, index) =>
                space.type === "think" ? index + 1 : -1
            )
            .filter(index => index >= 0)
    );

    const ALLEY_LENGTH = 3;
    const CUT_IN_LINE_COST = 1;

    let connections = [];

    // ============================================
    // HTML ELEMENTS
    // ============================================

    const board = document.getElementById("gameBoard");

    const lineOfSightLayer =
        document.getElementById("lineOfSightLayer");

    const movementPathLayer =
        document.getElementById("movementPathLayer");

    const darkAlleyPathLayer =
        document.getElementById("darkAlleyPathLayer");

    const spaceLayer =
        document.getElementById("spaceLayer");

    const thinkSpaceLayer =
        document.getElementById("thinkSpaceLayer");

    const darkAlleySpaceLayer =
        document.getElementById("darkAlleySpaceLayer");

    const playerLayer =
        document.getElementById("playerLayer");

    const currentPlayerDisplay =
        document.getElementById("currentPlayerDisplay");

    const turnMessage =
        document.getElementById("turnMessage");

    const playerList =
        document.getElementById("playerList");

    const die1Display =
        document.getElementById("die1");

    const die2Display =
        document.getElementById("die2");

    const diceMode =
        document.getElementById("diceMode");

    const rollButton =
        document.getElementById("rollButton");

    const gameMessage =
        document.getElementById("gameMessage");

    // ============================================
    // GAME CHAT ELEMENTS
    // ============================================

    const chatPanel =
        document.getElementById("chatPanel");

    const chatMessages =
        document.getElementById("chatMessages");

    const chatForm =
        document.getElementById("chatForm");

    const chatInput =
        document.getElementById("chatInput");

    const thinkChoicePanel =
        document.getElementById("thinkChoicePanel");

    const thinkChoiceTitle =
        document.getElementById("thinkChoiceTitle");

    const thinkChoiceDescription =
        document.getElementById("thinkChoiceDescription");

    const safeRouteButton =
        document.getElementById("safeRouteButton");

    const darkAlleyButton =
        document.getElementById("darkAlleyButton");

    // DARK ALLEY COIN FLIP + DISHONOR POPUPS

    const darkAlleyFlipPanel =
        document.getElementById("darkAlleyFlipPanel");

    const flipCoinButton =
        document.getElementById("flipCoinButton");

    const coinFace =
        document.getElementById("coinFace");

    const coinFlipResult =
        document.getElementById("coinFlipResult");

    const dishonorPanel =
        document.getElementById("dishonorPanel");

    const dishonorContinueButton =
        document.getElementById("dishonorContinueButton");

    const playerCollisionPanel =
        document.getElementById("playerCollisionPanel");

    const playerCollisionTitle =
        document.getElementById("playerCollisionTitle");

    const playerCollisionDescription =
        document.getElementById("playerCollisionDescription");

    const playerCollisionAttackButton =
        document.getElementById("playerCollisionAttackButton");

    const playerCollisionIgnoreButton =
        document.getElementById("playerCollisionIgnoreButton");

    const cutInLinePanel =
        document.getElementById("cutInLinePanel");

    const cutInLineTitle =
        document.getElementById("cutInLineTitle");

    const cutInLineDescription =
        document.getElementById("cutInLineDescription");

    const cutInLineAttackButton =
        document.getElementById("cutInLineAttackButton");

    const cutInLineIgnoreButton =
        document.getElementById("cutInLineIgnoreButton");

    const gameOverPanel =
        document.getElementById("gameOverPanel");

    const winnerText =
        document.getElementById("winnerText");

    const restartButton =
        document.getElementById("restartButton");

    const requiredElements = [
        board,
        lineOfSightLayer,
        movementPathLayer,
        darkAlleyPathLayer,
        spaceLayer,
        thinkSpaceLayer,
        darkAlleySpaceLayer,
        playerLayer,
        currentPlayerDisplay,
        turnMessage,
        playerList,
        die1Display,
        die2Display,
        diceMode,
        rollButton,
        gameMessage
    ];

    if (requiredElements.some(element => !element)) {
        console.error(
            "GameBoard.js: Required HTML elements are missing. " +
            "Check the IDs in GameBoard.html."
        );
        return;
    }

    // ============================================
    // PLAYER CLASS
    // ============================================

    class Player {
        constructor(id) {
            this.id = id;
            this.name = `Player ${id + 1}`;
            this.position = 0;
            this.coins = 5;
            this.color = PLAYER_COLORS[id];
            this.angryMobNextTurn = false;
            this.finished = false;
            this.character;
            /*
            character codes:
            MA - Marie Antoinette
            MR - Maximilian Robespierre
            AB - Anne Boleyn
            KL - King Louis XVI
            HH - Headless Horseman
            QH - Queen of Hearts
            */
        }
    }

    // ============================================
    // GAME STATE
    // ============================================

    let players = [];
    let currentPlayerIndex = 0;

    let boardSpaces = [];
    let darkAlleys = [];

    let isMoving = false;
    let waitingForThinkChoice = false;
    let gameOver = false;

    let movementTimer = null;
    let cutInLineDefendPlayer = null;
    let movementState = null;

    // Dark Alley coin-flip state.
    let pendingDarkAlley = null;
    let coinFlipInProgress = false;

    // ============================================
    // SVG HELPERS
    // ============================================

    const SVG_NS = "http://www.w3.org/2000/svg";

    function createSvgElement(tag, attributes = {}) {
        const element = document.createElementNS(
            SVG_NS,
            tag
        );

        Object.entries(attributes).forEach(([key, value]) => {
            element.setAttribute(key, value);
        });

        return element;
    }

    function addText(parent, x, y, content, className) {
        const text = createSvgElement("text", {
            x,
            y,
            class: className,
            "text-anchor": "middle",
            "dominant-baseline": "central"
        });

        text.textContent = content;
        parent.appendChild(text);

        return text;
    }

    function clearLayer(layer) {
        layer.replaceChildren();
    }

    // ============================================
    // CREATE BOARD SPACES FROM UPDATED ARTWORK
    // ============================================

    function createBoardSpaces() {
        boardSpaces = [];

        // START is separate from the numbered spaces.
        boardSpaces.push({
            number: 0,
            x: 104,
            y: 78,
            type: "start",
            label: "START",
            colorStage: 0
        });

        ARTWORK_SPACES.forEach((artworkSpace, index) => {
            boardSpaces.push({
                number: index + 1,
                x: artworkSpace.x,
                y: artworkSpace.y,
                type: artworkSpace.type,
                label: artworkSpace.label,
                colorStage: Math.min(
                    6,
                    Math.floor(
                        (index / (ARTWORK_SPACES.length - 1)) * 7
                    )
                )
            });
        });

        // G is the final destination after all 71 artwork markers.
        boardSpaces.push({
            number: ARTWORK_SPACES.length + 1,
            x: 546,
            y: 280,
            type: "finish",
            label: "G",
            colorStage: 6
        });
    }

    // ============================================
    // DRAWING LAYERS
    // ============================================

    function drawMovementPaths() {
        // Connecting lines are already printed in the background image.
        clearLayer(movementPathLayer);
    }

    function drawAllSpaces() {
        // The background image already contains all space artwork.
        // Do not draw duplicate circles or labels over it.
        clearLayer(spaceLayer);
        clearLayer(thinkSpaceLayer);
    }

    function drawNormalSpace(space) {
        const group = createSvgElement("g");

        group.appendChild(
            createSvgElement("circle", {
                cx: space.x,
                cy: space.y,
                r: SPACE_RADIUS,
                class: `board-space region-${space.colorStage}`
            })
        );

        addText(
            group,
            space.x,
            space.y,
            String(space.number + 1),
            "board-space-label"
        );

        spaceLayer.appendChild(group);
    }

    function drawStartSpace(space) {
        const group = createSvgElement("g");

        group.appendChild(
            createSvgElement("circle", {
                cx: space.x,
                cy: space.y,
                r: START_SPACE_RADIUS,
                class: "board-space start-space"
            })
        );

        addText(
            group,
            space.x,
            space.y,
            "START",
            "board-space-label start-space-label"
        );

        spaceLayer.appendChild(group);
    }

    function drawFinishSpace(space) {
        const group = createSvgElement("g");

        group.appendChild(
            createSvgElement("circle", {
                cx: space.x,
                cy: space.y,
                r: FINISH_SPACE_RADIUS,
                class: "board-space finish-space"
            })
        );

        addText(
            group,
            space.x,
            space.y,
            "G",
            "board-space-label finish-space-label"
        );

        spaceLayer.appendChild(group);
    }

    function drawCoinSpace(space) {
        const group = createSvgElement("g");

        group.appendChild(
            createSvgElement("circle", {
                cx: space.x,
                cy: space.y,
                r: SPACE_RADIUS,
                class: `board-space coin-space region-${space.colorStage}`
            })
        );

        addText(
            group,
            space.x,
            space.y,
            "✦",
            "coin-symbol"
        );

        spaceLayer.appendChild(group);

        addText(
            group,
            space.x,
            space.y + 14,
            String(space.number + 1),
            "board-space-label"
        );
    }

    function drawAngryMobSpace(space) {
        const group = createSvgElement("g");

        group.appendChild(
            createSvgElement("circle", {
                cx: space.x,
                cy: space.y,
                r: SPACE_RADIUS,
                class: `board-space mob-space region-${space.colorStage}`
            })
        );

        addText(
            group,
            space.x,
            space.y,
            "MOB",
            "angry-mob-label"
        );

        spaceLayer.appendChild(group);
    }

    function drawThinkSpace(space) {
        const group = createSvgElement("g");

        const points = [];

        for (let i = 0; i < 16; i++) {
            const angle =
                (Math.PI * 2 * i) / 16 - Math.PI / 2;

            const radius =
                i % 2 === 0
                    ? SPACE_RADIUS + 7
                    : SPACE_RADIUS - 2;

            points.push(
                `${space.x + Math.cos(angle) * radius},` +
                `${space.y + Math.sin(angle) * radius}`
            );
        }

        group.appendChild(
            createSvgElement("polygon", {
                points: points.join(" "),
                class: `board-space shortcut-space region-${space.colorStage}`
            })
        );

        addText(
            group,
            space.x,
            space.y,
            "THINK",
            "shortcut-symbol"
        );

        thinkSpaceLayer.appendChild(group);
    }

    // ============================================
    // DARK ALLEY SHORTCUTS
    // ============================================

    function createDarkAlleys() {
        // Dark Alley artwork is already part of the background image.
        // Keep the shortcut movement data without drawing duplicates.
        clearLayer(darkAlleyPathLayer);
        clearLayer(darkAlleySpaceLayer);

        darkAlleys = [];

        THINK_SPACES.forEach(startNumber => {
            const rejoinNumber = Math.min(
                startNumber + ALLEY_LENGTH + 1,
                TOTAL_SPACES - 2
            );

            darkAlleys.push({
                startNumber,
                rejoinNumber,
                spaces: []
            });
        });
    }

    // ============================================
    // LINE OF SIGHT
    // ============================================

    function drawLinesOfSight() {
        clearLayer(lineOfSightLayer);

        // Original project line-of-sight pairings.
        connections = [
            [2, 13],
            [5, 16],
            [9, 20],
            [18, 29],
            [22, 33],
            [27, 36],
            [34, 45],
            [39, 48],
            [44, 53],
            [51, 60]
        ];
    }

    // ============================================
    // CREATE PLAYERS
    // ============================================

    function createPlayers(roomPlayers = null) {
        players = [];

        // If multiplayer players were received, use only those players.
        if (Array.isArray(roomPlayers) && roomPlayers.length > 0) {
            roomPlayers.forEach((roomPlayer, index) => {
                const player = new Player(index);

                player.name = roomPlayer.name;
                player.character = roomPlayer.character;
                player.socketId = roomPlayer.id;


                players.push(player);
            });
        } else {
            // Keep the existing six-player behavior for local testing.
            const CHARACTER_CODES = ["MR","AB", "KL", "MA", "QH", "HH"];
            for (let i = 0; i < MAX_PLAYERS; i++) {
                players.push(new Player(i));
                player.character = CHARACTER_CODES[i];
            }
        }

        currentPlayerIndex = 0;
    }

    function getCurrentPlayer() {
        return players[currentPlayerIndex];
    }

    // ============================================
    // DRAW PLAYER CHARACTERS
    // ============================================

    function drawPlayers() {
        clearLayer(playerLayer);

        const offsets = [
            [-13, -13],
            [13, -13],
            [-13, 13],
            [13, 13],
            [0, -19],
            [0, 19]
        ];

        const groupedPlayers = new Map();

        players.forEach(player => {
            if (!groupedPlayers.has(player.position)) {
                groupedPlayers.set(player.position, []);
            }

            groupedPlayers.get(player.position).push(player);
        });

        groupedPlayers.forEach((group, position) => {
            const space = boardSpaces[position];

            if (!space) return;

            group.forEach((player, index) => {
                const offset = offsets[index % offsets.length];
                const imagePath = PLAYER_IMAGES[player.id];

                const characterImage = createSvgElement("image", {
                    x: space.x + offset[0],
                    y: space.y + offset[1],
                    width: 32,
                    height: 32,
                    href: imagePath,
                    preserveAspectRatio: "xMidYMid meet",
                    class: "player-piece-image"
                });

                playerLayer.appendChild(characterImage);
            });
        });
    }

    // ============================================
    // UPDATE UI
    // ============================================

    function updateUI() {
        const player = getCurrentPlayer();

        currentPlayerDisplay.textContent = player.name;
        turnMessage.textContent = `${player.coins} coins`;

        playerList.replaceChildren();

        players.forEach(item => {
            const entry = document.createElement("div");

            entry.className = "player-entry";

            if (item.id === currentPlayerIndex) {
                entry.classList.add("active-player");
            }

            const marker = document.createElement("span");
            marker.textContent = "● ";
            marker.style.color = item.color;

            const label = document.createElement("span");

            label.textContent =
                `${item.name} — ${item.coins} coins`;

            entry.append(marker, label);
            playerList.appendChild(entry);
        });

        diceMode.textContent = player.angryMobNextTurn
            ? "ONE DIE — ANGRY MOB"
            : "TWO DICE";

        rollButton.disabled =
            isMoving ||
            waitingForThinkChoice ||
            gameOver;
    }

    // ============================================
    // DICE
    // ============================================

    function rollDie() {
        return Math.floor(Math.random() * 6) + 1;
    }

    function rollCurrentPlayer() {
        if (isMoving || waitingForThinkChoice || gameOver) {
            return;
        }

        const player = getCurrentPlayer();

        const oneDieOnly = player.angryMobNextTurn;

        const firstRoll = rollDie();
        const secondRoll = oneDieOnly ? 0 : rollDie();

        const total = firstRoll + secondRoll;

        die1Display.textContent = firstRoll;
        die2Display.textContent = oneDieOnly ? "—" : secondRoll;

        // The penalty only affects the next turn.
        player.angryMobNextTurn = false;

        gameMessage.textContent = oneDieOnly
            ? `${player.name} rolled ${firstRoll} with one die!`
            : `${player.name} rolled ${firstRoll} + ${secondRoll} = ${total}!`;

        movePlayer(player, total);
    }

    // ============================================
    // MOVE PLAYER
    // ============================================

    function movePlayer(player, spacesToMove) {
        const targetPosition = player.position + spacesToMove;
        const finishIndex = TOTAL_SPACES - 1;

        // Exact roll required to reach G.
        if (targetPosition > finishIndex) {
            gameMessage.textContent =
                `${player.name} needs an exact roll to reach the Guillotine. ` +
                "No movement this turn.";

            finishTurn();
            return;
        }

        isMoving = true;

        movementState = {
            player: player,
            spacesToMove: spacesToMove,
            spacesMoved: 0
        };

        updateUI();
        resumeMovement();
    }

    function resumeMovement() {
        if (!movementState || waitingForThinkChoice) return;

        if (movementTimer !== null) {
            clearInterval(movementTimer);
        }

        movementTimer = window.setInterval(() => {
            if (waitingForThinkChoice) {
                clearInterval(movementTimer);
                movementTimer = null;
                return;
            }

            if (
                movementState.spacesMoved >=
                movementState.spacesToMove
            ) {
                clearInterval(movementTimer);
                movementTimer = null;

                const player = movementState.player;
                movementState = null;

                isMoving = false;
                resolveLanding(player);
                return;
            }

            if (
                movementState.player.position <
                TOTAL_SPACES - 1
            ) {
                movementState.player.position++;
            }

            movementState.spacesMoved++;

            drawPlayers();

            checkLineOfSight(movementState.player);

            if (waitingForThinkChoice) {
                clearInterval(movementTimer);
                movementTimer = null;
            }

        }, 180);
    }

    // ============================================
    // RESOLVE LANDING EFFECTS
    // ============================================

    function resolveLanding(player) {
        const space = boardSpaces[player.position];

        if (!space) {
            finishTurn();
            return;
        }

        if (space.type === "finish") {
            endGame(player);
            return;
        }

        switch (space.type) {
            case "coin":
                player.coins += 2;

                gameMessage.textContent =
                    `${player.name} collected 2 coins!`;

                break;

            case "angryMob":
                player.angryMobNextTurn = true;

                gameMessage.textContent =
                    `${player.name} was caught by the Angry Mob! ` +
                    "Only one die next turn.";

                break;

            case "think":
                showThinkChoice(player);
                drawPlayers();
                updateUI();
                return;

            case "start":
                gameMessage.textContent =
                    `${player.name} is in the starting safe zone.`;

                break;

            default:
                gameMessage.textContent =
                    `${player.name} landed on ` +
                    `${space.label ? `space ${space.label}` : `space ${space.number}`}.`;

                break;
        }

        playerCollision(player);
        checkLineOfSight(player);

        drawPlayers();
        updateUI();
        finishTurn();
    }

    // ============================================
    // THINK SPACE CHOICE
    // ============================================

    function showThinkChoice(player) {
        waitingForThinkChoice = true;

        if (thinkChoiceTitle) {
            thinkChoiceTitle.textContent = "Choose Your Route";
        }

        if (thinkChoiceDescription) {
            thinkChoiceDescription.textContent =
                `${player.name}, take the safe route or risk the Dark Alley shortcut?`;
        }

        if (thinkChoicePanel) {
            thinkChoicePanel.classList.remove("hidden");
        }

        updateUI();
    }

    function chooseSafeRoute() {
        if (!waitingForThinkChoice) return;

        waitingForThinkChoice = false;

        if (thinkChoicePanel) {
            thinkChoicePanel.classList.add("hidden");
        }

        gameMessage.textContent =
            `${getCurrentPlayer().name} chose the safe route.`;

        updateUI();
        finishTurn();
    }

    // ============================================
    // DARK ALLEY COIN FLIP
    // ============================================

    function chooseDarkAlley() {
        if (!waitingForThinkChoice || gameOver) return;

        const player = getCurrentPlayer();

        const alley = darkAlleys.find(
            item => item.startNumber === player.position
        );

        if (!alley) {
            waitingForThinkChoice = false;

            if (thinkChoicePanel) {
                thinkChoicePanel.classList.add("hidden");
            }

            gameMessage.textContent =
                "The Dark Alley is unavailable from this space.";

            updateUI();
            finishTurn();
            return;
        }

        // Keep the turn paused while the player flips the coin.
        pendingDarkAlley = alley;
        coinFlipInProgress = false;

        if (thinkChoicePanel) {
            thinkChoicePanel.classList.add("hidden");
        }

        if (coinFace) {
            coinFace.textContent = "?";
            coinFace.classList.remove("flipping");
        }

        if (coinFlipResult) {
            coinFlipResult.textContent = "Click the coin to flip!";
        }

        if (flipCoinButton) {
            flipCoinButton.disabled = false;
        }

        if (darkAlleyFlipPanel) {
            darkAlleyFlipPanel.classList.remove("hidden");
        }

        gameMessage.textContent =
            `${player.name} is risking the Dark Alley!`;

        updateUI();
    }

    function flipDarkAlleyCoin() {
        if (
            !waitingForThinkChoice ||
            coinFlipInProgress ||
            !pendingDarkAlley ||
            gameOver
        ) {
            return;
        }

        coinFlipInProgress = true;

        if (flipCoinButton) {
            flipCoinButton.disabled = true;
        }

        if (coinFace) {
            coinFace.classList.remove("flipping");
            void coinFace.offsetWidth;
            coinFace.classList.add("flipping");
        }

        if (coinFlipResult) {
            coinFlipResult.textContent = "The coin is flipping...";
        }

        // A fair 50/50 coin flip.
        const landedHeads = Math.random() < 0.5;

        window.setTimeout(() => {
            coinFlipInProgress = false;

            if (coinFace) {
                coinFace.classList.remove("flipping");
                coinFace.textContent = landedHeads ? "H" : "T";
            }

            const player = getCurrentPlayer();

            if (landedHeads) {
                // HEADS: the player survives and rejoins beyond the alley.
                player.position = pendingDarkAlley.rejoinNumber;

                if (coinFlipResult) {
                    coinFlipResult.textContent = "HEADS! YOU SURVIVED!";
                }

                gameMessage.textContent =
                    `${player.name} survived the Dark Alley!`;

                pendingDarkAlley = null;
                waitingForThinkChoice = false;

                if (darkAlleyFlipPanel) {
                    darkAlleyFlipPanel.classList.add("hidden");
                }

                drawPlayers();

                if (player.position >= TOTAL_SPACES - 1) {
                    endGame(player);
                    return;
                }

                updateUI();
                finishTurn();

            } else {
                // TAILS: lose every coin and return to the start.
                player.position = 0;
                player.coins = 0;
                player.angryMobNextTurn = false;

                pendingDarkAlley = null;

                if (darkAlleyFlipPanel) {
                    darkAlleyFlipPanel.classList.add("hidden");
                }

                if (dishonorPanel) {
                    dishonorPanel.classList.remove("hidden");
                }

                gameMessage.textContent =
                    `${player.name} died dishonorably in the Dark Alley!`;

                drawPlayers();
                updateUI();

                // Do not finish the turn until the player dismisses Dishonor.
            }
        }, 1200);
    }

    // ============================================
    // PLAYER COLLISION
    // ============================================

    function playerCollision(player) {
        players.forEach(enemyPlayer => {
            if (
                player.position > SAFE_ZONE_SPACES &&
                player.position === enemyPlayer.position &&
                player.id !== enemyPlayer.id
            ) {
                enemyPlayer.position = 0;

                gameMessage.textContent =
                    `${player.name} chopped off ${enemyPlayer.name}'s head! ` +
                    "Off to the start for them!";
            }
        });
    }

    // ============================================
    // LINE OF SIGHT
    // ============================================

    function checkLineOfSight(player) {
        if (waitingForThinkChoice) return;

        for (let i = 0; i < connections.length; i++) {
            const first = connections[i][0];
            const second = connections[i][1];

            if (
                player.position === first ||
                player.position === second
            ) {
                for (let j = 0; j < players.length; j++) {
                    const enemyPlayer = players[j];

                    if (
                        player.position !== enemyPlayer.position &&
                        (
                            enemyPlayer.position === first ||
                            enemyPlayer.position === second
                        )
                    ) {
                        cutInLineDefendPlayer = enemyPlayer;

                        console.log(
                            "attackplayerpos: " + player.position
                        );

                        console.log(
                            "defendplayerpos: " + enemyPlayer.position
                        );

                        decideToCutInLine();
                        return;
                    }
                }
            }
        }
    }

    // ============================================
    // CUT-IN-LINE CHOICE
    // ============================================

    function decideToCutInLine() {
        if (waitingForThinkChoice) return;

        waitingForThinkChoice = true;

        if (cutInLineDescription) {
            cutInLineDescription.textContent =
                `You are within line of sight of ` +
                `${cutInLineDefendPlayer.name}. You may spend a coin ` +
                `to attempt switching positions, or ignore them, ` +
                `and continue along your path.`;
        }

        if (cutInLinePanel) {
            cutInLinePanel.classList.remove("hidden");
        }

        updateUI();
    }

    // ============================================
    // CUT IN LINE
    // ============================================

    function cutInLine() {
        if (!waitingForThinkChoice || !movementState) return;

        const attackPlayer = getCurrentPlayer();
        const defendPlayer = cutInLineDefendPlayer;

        attackPlayer.coins -= CUT_IN_LINE_COST;

        console.log("attackplayerpos: " + attackPlayer.position);
        console.log("defendplayerpos: " + defendPlayer.position);

        const attackPlayerRoll = rollDie() + rollDie();
        const defendPlayerRoll = rollDie() + rollDie();

        gameMessage.textContent =
            `${attackPlayer.name} rolls ${attackPlayerRoll}. ` +
            `${defendPlayer.name} rolls ${defendPlayerRoll}. `;

        if (attackPlayerRoll > defendPlayerRoll) {
            const attackPlayerPos = attackPlayer.position;

            attackPlayer.position = defendPlayer.position;
            defendPlayer.position = attackPlayerPos;

            gameMessage.textContent +=
                `${attackPlayer.name} cuts in line, switching with ` +
                `${defendPlayer.name}.`;
        } else {
            gameMessage.textContent +=
                `${attackPlayer.name} does not roll high enough to cut in line ` +
                `with ${defendPlayer.name}.`;
        }

        waitingForThinkChoice = false;
        cutInLineDefendPlayer = null;

        if (cutInLinePanel) {
            cutInLinePanel.classList.add("hidden");
        }

        if (movementTimer !== null) {
            clearInterval(movementTimer);
            movementTimer = null;
        }

        isMoving = false;
        movementState = null;

        drawPlayers();
        updateUI();
        finishTurn();
    }

    // ============================================
    // END TURN
    // ============================================

    function finishTurn() {
        if (gameOver) return;

        currentPlayerIndex =
            (currentPlayerIndex + 1) % players.length;

        updateUI();
    }

    // ============================================
    // WIN CONDITION
    // ============================================

    function endGame(player) {
        gameOver = true;
        player.finished = true;

        if (winnerText) {
            winnerText.textContent =
                `${player.name} reached the Guillotine first!`;
        }

        if (gameOverPanel) {
            gameOverPanel.classList.remove("hidden");
        }

        gameMessage.textContent =
            `${player.name} has won the revolution!`;

        updateUI();
    }

    // ============================================
    // RESTART GAME
    // ============================================

    function restartGame() {
        if (movementTimer !== null) {
            window.clearInterval(movementTimer);
            movementTimer = null;
        }

        isMoving = false;
        waitingForThinkChoice = false;
        gameOver = false;
        movementState = null;
        cutInLineDefendPlayer = null;
        pendingDarkAlley = null;
        coinFlipInProgress = false;

        if (darkAlleyFlipPanel) {
            darkAlleyFlipPanel.classList.add("hidden");
        }

        if (dishonorPanel) {
            dishonorPanel.classList.add("hidden");
        }

        if (flipCoinButton) {
            flipCoinButton.disabled = false;
        }

        if (coinFace) {
            coinFace.textContent = "?";
            coinFace.classList.remove("flipping");
        }

        if (thinkChoicePanel) {
            thinkChoicePanel.classList.add("hidden");
        }

        if (cutInLinePanel) {
            cutInLinePanel.classList.add("hidden");
        }

        if (gameOverPanel) {
            gameOverPanel.classList.add("hidden");
        }

        die1Display.textContent = "—";
        die2Display.textContent = "—";

        createPlayers();
        drawPlayers();
        updateUI();

        gameMessage.textContent =
            "Player 1 begins the revolution!";
    }

    // ============================================
    // MENU BUTTONS
    // ============================================

    document.getElementById("chatButton")?.addEventListener(
        "click",
        () => {
            const chatPanel = document.getElementById("chatPanel");

            if (chatPanel) {
                chatPanel.classList.toggle("hidden");
            }
        }
    );

    // ============================================
    // GAME RULES DROPDOWN
    // ============================================

    const rulesButton =
        document.getElementById("rulesButton");

    const rulesPanel =
        document.getElementById("rulesPanel");

    const closeRules =
        document.getElementById("closeRules");

    if (rulesButton && rulesPanel) {
        rulesButton.addEventListener("click", () => {
            rulesPanel.classList.toggle("hidden");
        });
    }

    if (closeRules && rulesPanel) {
        closeRules.addEventListener("click", () => {
            rulesPanel.classList.add("hidden");
        });
    }

    document.addEventListener("keydown", event => {
        if (event.key === "Escape" && rulesPanel) {
            rulesPanel.classList.add("hidden");
        }
    });

    // ============================================
    // LEADERBOARD BUTTON
    // ============================================

    document.getElementById("leaderboardButton")?.addEventListener(
        "click",
        () => {
            const standings = [...players].sort(
                (a, b) => b.position - a.position
            );

            gameMessage.textContent =
                "Current standings: " +
                standings.map(player => player.name).join(", ");
        }
    );

    // ============================================
    // CONNECT GAME CONTROLS
    // ============================================

    rollButton.addEventListener("click", rollCurrentPlayer);

    safeRouteButton?.addEventListener(
        "click",
        chooseSafeRoute
    );

    darkAlleyButton?.addEventListener(
        "click",
        chooseDarkAlley
    );

    flipCoinButton?.addEventListener(
        "click",
        flipDarkAlleyCoin
    );

    dishonorContinueButton?.addEventListener(
        "click",
        () => {
            if (dishonorPanel) {
                dishonorPanel.classList.add("hidden");
            }

            waitingForThinkChoice = false;
            updateUI();
            finishTurn();
        }
    );

    cutInLineAttackButton?.addEventListener(
        "click",
        function() {
            if (
                getCurrentPlayer().coins >= CUT_IN_LINE_COST
            ) {
                cutInLine();
            } else {
                waitingForThinkChoice = false;
                cutInLineDefendPlayer = null;

                if (cutInLinePanel) {
                    cutInLinePanel.classList.add("hidden");
                }

                gameMessage.textContent =
                    `${getCurrentPlayer().name} does not have enough ` +
                    `coins to cut in line.`;

                updateUI();
                resumeMovement();
            }
        }
    );

    cutInLineIgnoreButton?.addEventListener(
        "click",
        function() {
            waitingForThinkChoice = false;
            cutInLineDefendPlayer = null;

            if (cutInLinePanel) {
                cutInLinePanel.classList.add("hidden");
            }

            gameMessage.textContent =
                `${getCurrentPlayer().name} does not cut in line.`;

            updateUI();
            resumeMovement();
        }
    );

    restartButton?.addEventListener(
        "click",
        restartGame
    );

    // ============================================
    // GAME CHAT FUNCTIONALITY
    // ============================================

    chatForm?.addEventListener("submit", event => {
        event.preventDefault();

        const message = chatInput.value.trim();

        if (!message) return;

        // Send a message to TitleScreen.js.
        window.parent.postMessage({
            type: "GTTG_CHAT_SEND",
            message: message
        }, window.location.origin);

        chatInput.value = "";
        chatInput.focus();
    });

    // Receive messages from TitleScreen.js.
    window.addEventListener("message", event => {
        if (event.origin !== window.location.origin) {
            return;
        }

        const data = event.data;

        if (!data || data.type !== "GTTG_CHAT_MESSAGE") {
            return;
        }

        const emptyMessage =
            chatMessages.querySelector(".chat-empty-message");

        if (emptyMessage) {
            emptyMessage.remove();
        }

        const messageElement =
            document.createElement("div");

        messageElement.className = "chat-message";

        const senderElement =
            document.createElement("strong");

        senderElement.textContent = data.name + ": ";

        const textElement =
            document.createElement("span");

        textElement.textContent = data.message;

        messageElement.append(
            senderElement,
            textElement
        );

        chatMessages.appendChild(messageElement);

        chatMessages.scrollTop =
            chatMessages.scrollHeight;
    });

    // ============================================
    // INITIALIZE GAME
    // ============================================

    function initializeGame() {
        createBoardSpaces();
        drawMovementPaths();
        drawAllSpaces();
        createDarkAlleys();
        drawLinesOfSight();

        createPlayers();
        drawPlayers();
        updateUI();
    }

    // Receive multiplayer players from TitleScreen.js.
    window.addEventListener("message", event => {
        if (event.origin !== window.location.origin) {
            return;
        }

        const data = event.data;

        if (!data || data.type !== "GTTG_GAME_START") {
            return;
        }

        // Create only the players who joined the room.
        createPlayers(data.players);

        drawPlayers();
        updateUI();
    });

    initializeGame();

    // ============================================
    // BACKGROUND MUSIC
    // ============================================

    const backgroundMusic =
        document.getElementById("backgroundMusic");

    const musicToggle =
        document.getElementById("musicToggle");

    const musicVolume =
        document.getElementById("musicVolume");

    if (backgroundMusic && musicToggle && musicVolume) {
        backgroundMusic.volume =
            Number(musicVolume.value);

        musicToggle.addEventListener("click", async () => {
            if (backgroundMusic.paused) {
                try {
                    await backgroundMusic.play();

                    musicToggle.textContent =
                        "♫ Turn Music Off";

                } catch (error) {
                    console.error(
                        "Music could not play:",
                        error
                    );

                    gameMessage.textContent =
                        "Music could not start. Check the audio file path.";
                }
            } else {
                backgroundMusic.pause();

                musicToggle.textContent =
                    "♫ Play Music";
            }
        });

        musicVolume.addEventListener("input", () => {
            backgroundMusic.volume =
                Number(musicVolume.value);
        });

        backgroundMusic.addEventListener("ended", () => {
            musicToggle.textContent =
                "♫ Play Music";
        });
    }

})();