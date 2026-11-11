(() => {
    "use strict";

    // ============================================
    // GET TO THE GUILLOTINE
    // Local pass-and-play board game
    // ============================================

    const TOTAL_SPACES = 64;
    const MAX_PLAYERS = 6;

    const PLAYER_IMAGES = [
        "characters/Robespierre.gif",
        "characters/Anne Bolyne.gif",
        "characters/King Louis XVI.gif",
        "characters/Marie Antoinette.gif",
        "characters/Queen of Hearts.gif",
        "characters/HeadlessHoreman.png"
    ];

    const BOARD_WIDTH = 3000;
    const BOARD_HEIGHT = 900;

    const SPACE_RADIUS = 27;
    const START_SPACE_RADIUS = 36;
    const FINISH_SPACE_RADIUS = 40;

    const SAFE_ZONE_SPACES = 7;

    const PLAYER_COLORS = [
        "#a52a35",
        "#315c79",
        "#8d713c",
        "#62447c",
        "#39745b",
        "#b85b30"
    ];

    // Space numbers are zero-based.
    // No Angry Mob spaces appear in the opening stretch.

    const COIN_SPACES = new Set([
        8, 15, 23, 30, 39, 47, 55
    ]);

    const ANGRY_MOB_SPACES = new Set([
        17, 27, 37, 46, 54, 58, 59, 60, 61, 62
    ]);

    // Think spaces replace ordinary spaces.
    const THINK_SPACES = new Set([
        13, 32, 48
    ]);

    const ALLEY_LENGTH = 3;
    const CUT_IN_LINE_COST = 1;

    var connections = [];

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

    // Player collision HTML elements
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

    // Cutting in line HTML elements
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
    // CREATE THE CUSTOM SPIRAL BOARD
    // ============================================

    function createBoardSpaces() {
        boardSpaces = [];

        /*
         * The path winds around the board and gradually
         * spirals inward, like the hand-drawn design.
         * It has one entrance at START and one continuous
         * main route.
         */

        const grid = [];
        const rows = 8;
        const columns = 9;

        for (let row = 0; row < rows; row++) {
            grid[row] = [];

            for (let column = 0; column < columns; column++) {
                grid[row][column] = { row, column };
            }
        }

        const route = [];

        let top = 0;
        let bottom = rows - 1;
        let left = 0;
        let right = columns - 1;

        while (top <= bottom && left <= right) {
            for (let col = left; col <= right; col++) {
                route.push(grid[top][col]);
            }

            top++;

            for (let row = top; row <= bottom; row++) {
                route.push(grid[row][right]);
            }

            right--;

            if (top <= bottom) {
                for (let col = right; col >= left; col--) {
                    route.push(grid[bottom][col]);
                }

                bottom--;
            }

            if (left <= right) {
                for (let row = bottom; row >= top; row--) {
                    route.push(grid[row][left]);
                }

                left++;
            }
        }

        const leftEdge = 145;
        const rightEdge = 2855;
        const topEdge = 105;
        const bottomEdge = 795;

        const xGap =
            (rightEdge - leftEdge) / (columns - 1);

        const yGap =
            (bottomEdge - topEdge) / (rows - 1);

        route.slice(0, TOTAL_SPACES).forEach((cell, number) => {
            let type = "normal";

            if (number === 0) {
                type = "start";
            } else if (number === TOTAL_SPACES - 1) {
                type = "finish";
            } else if (THINK_SPACES.has(number)) {
                type = "think";
            } else if (ANGRY_MOB_SPACES.has(number)) {
                type = "angryMob";
            } else if (COIN_SPACES.has(number)) {
                type = "coin";
            }

            boardSpaces.push({
                number,
                x: leftEdge + cell.column * xGap,
                y: topEdge + cell.row * yGap,
                type,
                colorStage: Math.min(
                    6,
                    Math.floor(
                        (number / (TOTAL_SPACES - 1)) * 7
                    )
                )
            });
        });
    }

    // ============================================
    // DRAW THE MAIN MOVEMENT PATH
    // ============================================

    function drawMovementPaths() {
        clearLayer(movementPathLayer);

        for (let i = 0; i < boardSpaces.length - 1; i++) {
            const current = boardSpaces[i];
            const next = boardSpaces[i + 1];

            movementPathLayer.appendChild(
                createSvgElement("line", {
                    x1: current.x,
                    y1: current.y,
                    x2: next.x,
                    y2: next.y,
                    class: "movement-path"
                })
            );
        }
    }

    // ============================================
    // DRAW ALL BOARD SPACES
    // ============================================

    function drawAllSpaces() {
        clearLayer(spaceLayer);
        clearLayer(thinkSpaceLayer);

        boardSpaces.forEach(space => {
            switch (space.type) {
                case "start":
                    drawStartSpace(space);
                    break;

                case "finish":
                    drawFinishSpace(space);
                    break;

                case "coin":
                    drawCoinSpace(space);
                    break;

                case "angryMob":
                    drawAngryMobSpace(space);
                    break;

                case "think":
                    drawThinkSpace(space);
                    break;

                default:
                    drawNormalSpace(space);
                    break;
            }
        });
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
    // DARK ALLEY BRANCHES
    // ============================================

    function createDarkAlleys() {
        clearLayer(darkAlleyPathLayer);
        clearLayer(darkAlleySpaceLayer);

        darkAlleys = [];

        THINK_SPACES.forEach(startNumber => {
            const start = boardSpaces[startNumber];

            // Skip over the next three spaces and rejoin.
            const rejoinNumber = Math.min(
                startNumber + ALLEY_LENGTH + 1,
                TOTAL_SPACES - 2
            );

            const rejoin = boardSpaces[rejoinNumber];

            const branchSpaces = [];

            // Offset the three shortcut spaces perpendicular
            // to the main route so the branch is visible.

            const dx = rejoin.x - start.x;
            const dy = rejoin.y - start.y;
            const length = Math.hypot(dx, dy) || 1;

            const perpendicularX = -dy / length;
            const perpendicularY = dx / length;

            const centerX = BOARD_WIDTH / 2;
            const centerY = BOARD_HEIGHT / 2;

            const towardCenter =
                (centerX - start.x) * perpendicularX +
                (centerY - start.y) * perpendicularY;

            const direction = towardCenter >= 0 ? 1 : -1;
            const offset = 78;

            for (let i = 1; i <= ALLEY_LENGTH; i++) {
                const progress = i / (ALLEY_LENGTH + 1);

                const x =
                    start.x +
                    dx * progress +
                    perpendicularX * offset * direction;

                const y =
                    start.y +
                    dy * progress +
                    perpendicularY * offset * direction;

                branchSpaces.push({
                    x,
                    y,
                    number: i
                });
            }

            const points = [
                `${start.x},${start.y}`,
                ...branchSpaces.map(
                    alleySpace =>
                        `${alleySpace.x},${alleySpace.y}`
                ),
                `${rejoin.x},${rejoin.y}`
            ].join(" ");

            darkAlleyPathLayer.appendChild(
                createSvgElement("polyline", {
                    points,
                    class: "dark-alley-path"
                })
            );

            branchSpaces.forEach(alleySpace => {
                const group = createSvgElement("g");

                group.appendChild(
                    createSvgElement("rect", {
                        x: alleySpace.x - 22,
                        y: alleySpace.y - 15,
                        width: 44,
                        height: 30,
                        rx: 3,
                        class: "dark-alley-space"
                    })
                );

                addText(
                    group,
                    alleySpace.x,
                    alleySpace.y,
                    `D${alleySpace.number}`,
                    "dark-alley-symbol"
                );

                darkAlleySpaceLayer.appendChild(group);
            });

            darkAlleys.push({
                startNumber,
                rejoinNumber,
                spaces: branchSpaces
            });
        });
    }

    // ============================================
    // LINE OF SIGHT
    // ============================================

    function drawLinesOfSight() {
        clearLayer(lineOfSightLayer);

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
            [51, 60],

            // Debug connections for testing.
            [3, 14],
            [4, 13],
            [5, 12],
            [6, 11],
            [7, 10]
        ];

        connections.forEach(([from, to]) => {
            const first = boardSpaces[from];
            const second = boardSpaces[to];

            if (!first || !second) return;

            lineOfSightLayer.appendChild(
                createSvgElement("line", {
                    x1: first.x,
                    y1: first.y,
                    x2: second.x,
                    y2: second.y,
                    class: "line-of-sight"
                })
            );
        });
    }

    // ============================================
    // CREATE SIX PLAYERS
    // ============================================

    function createPlayers() {
        players = [];

        for (let i = 0; i < MAX_PLAYERS; i++) {
            players.push(new Player(i));
        }

        currentPlayerIndex = 0;
    }

    function getCurrentPlayer() {
        return players[currentPlayerIndex];
    }

    // ============================================
    // DRAW PLAYER PIECES
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
                    x: space.x + offset[0] - 16,
                    y: space.y + offset[1] - 16,
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
    // UPDATE THE UI
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
    // DICE ROLLING
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
    // MOVE THE PLAYER
    // ============================================

    function movePlayer(player, spacesToMove) {
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

        // Prevent multiple movement intervals.
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

            // Immediately stop if an opponent is detected.
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
                    `${player.name} landed on space ${space.number + 1}.`;

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

    function chooseDarkAlley() {
        if (!waitingForThinkChoice) return;

        const player = getCurrentPlayer();

        const alley = darkAlleys.find(
            item => item.startNumber === player.position
        );

        waitingForThinkChoice = false;

        if (thinkChoicePanel) {
            thinkChoicePanel.classList.add("hidden");
        }

        if (alley) {
            /*
             * Choosing the Dark Alley advances the player
             * to its rejoin point.
             *
             * The three alley squares are currently visual
             * spaces; the shortcut moves directly to the
             * rejoining point.
             */

            player.position = alley.rejoinNumber;

            gameMessage.textContent =
                `${player.name} took the Dark Alley shortcut!`;
        }

        drawPlayers();

        if (player.position >= TOTAL_SPACES - 1) {
            endGame(player);
            return;
        }

        updateUI();
        finishTurn();
    }

    // ===============================================
    // CHECK PLAYER COLLISION
    // ===============================================

    function playerCollision(player) {
        players.forEach(enemyPlayer => {
            // Check if the player is outside the starting
            // area and shares a position with another player.

            if (
                player.position > SAFE_ZONE_SPACES &&
                player.position === enemyPlayer.position &&
                player.id !== enemyPlayer.id
            ) {
                // The opposing player is sent back to START.

                enemyPlayer.position = 0;

                gameMessage.textContent =
                    `${player.name} chopped off ${enemyPlayer.name}'s head! ` +
                    "Off to the start for them!";
            }
        });
    }

    // ===============================================
    // CHECK PLAYER LINE OF SIGHT
    // ===============================================

    function checkLineOfSight(player) {
        // Called during movement and after landing.
        // It checks whether another player is connected
        // to the current player's position.

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
    // ASK PLAYER IF THEY WISH TO CUT IN LINE
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

        // Deduct the cost for cutting in line.
        attackPlayer.coins -= CUT_IN_LINE_COST;

        console.log("attackplayerpos: " + attackPlayer.position);
        console.log("defendplayerpos: " + defendPlayer.position);

        // Both players roll two dice.
        const attackPlayerRoll = rollDie() + rollDie();
        const defendPlayerRoll = rollDie() + rollDie();

        gameMessage.textContent =
            `${attackPlayer.name} rolls ${attackPlayerRoll}. ` +
            `${defendPlayer.name} rolls ${defendPlayerRoll}. `;

        // Check the rolls.
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

        // Reset HTML elements and game state variables.
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
            gameMessage.textContent =
                "The local chatroom is not implemented yet.";
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

    // Close the rules panel with Escape.
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

    /*
    playerCollisionAttackButton?.addEventListener(
        "click",
        // Add player collision attack behavior here.
    );

    playerCollisionIgnoreButton?.addEventListener(
        "click",
        // Add player collision ignore behavior here.
    );
    */

    cutInLineAttackButton?.addEventListener(
        "click",
        function() {
            // Check if the player has enough coins.
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
    // INITIALIZE THE BOARD
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

    initializeGame();

    // ============================================
    // BACKGROUND TAVERN MUSIC
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