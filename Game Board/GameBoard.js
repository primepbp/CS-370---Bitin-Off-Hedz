(() => {
    "use strict";

    // ============================================
    // GET TO THE GUILLOTINE
    // Local pass-and-play board game
    // ============================================

    const TOTAL_SPACES = 64;
    const MAX_PLAYERS = 6;

    const BOARD_WIDTH = 3000;
    const BOARD_HEIGHT = 900;

    const SPACE_RADIUS = 27;
    const START_SPACE_RADIUS = 36;
    const FINISH_SPACE_RADIUS = 40;

    const PLAYER_COLORS = [
        "#a52a35",
        "#315c79",
        "#8d713c",
        "#62447c",
        "#39745b",
        "#b85b30"
    ];

    // Space numbers here are zero-based.
    // Space 0 is the start; space 63 is the finish.
    const COIN_SPACES = new Set([
        5, 10, 17, 23, 30, 38, 45, 52, 58
    ]);

    const ANGRY_MOB_SPACES = new Set([
        7, 14, 21, 28, 35, 42, 49, 55, 60
    ]);

    const THINK_SPACES = new Set([
        12, 26, 40, 50
    ]);

    const ALLEY_LENGTH = 3;

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

    // ============================================
    // SVG HELPERS
    // ============================================

    const SVG_NS = "http://www.w3.org/2000/svg";

    function createSvgElement(tag, attributes = {}) {
        const element = document.createElementNS(SVG_NS, tag);

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
    // CREATE THE 64-SPACE BOARD
    // ============================================

    function createBoardSpaces() {
        boardSpaces = [];

        const columns = 8;
        const rows = 8;

        const left = 110;
        const right = 2890;
        const top = 100;
        const bottom = 800;

        const horizontalGap =
            (right - left) / (columns - 1);

        const verticalGap =
            (bottom - top) / (rows - 1);

        for (let row = 0; row < rows; row++) {
            for (let column = 0; column < columns; column++) {
                const actualColumn =
                    row % 2 === 0
                        ? column
                        : columns - 1 - column;

                const number = row * columns + column;

                const x = left + actualColumn * horizontalGap;
                const y = top + row * verticalGap;

                let type = "normal";

                if (number === 0) {
                    type = "start";
                } else if (number === TOTAL_SPACES - 1) {
                    type = "finish";
                } else if (COIN_SPACES.has(number)) {
                    type = "coin";
                } else if (ANGRY_MOB_SPACES.has(number)) {
                    type = "angryMob";
                } else if (THINK_SPACES.has(number)) {
                    type = "think";
                }

                boardSpaces.push({
                    number,
                    x,
                    y,
                    type
                });
            }
        }
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
                class: "board-space"
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
                class: "board-space coin-space"
            })
        );

        addText(
            group,
            space.x,
            space.y,
            "C",
            "coin-space-label"
        );

        spaceLayer.appendChild(group);

        // Small number label below the coin symbol.
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
                class: "board-space angry-mob-space"
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

        const points = [
            `${space.x},${space.y - SPACE_RADIUS}`,
            `${space.x + SPACE_RADIUS},${space.y}`,
            `${space.x},${space.y + SPACE_RADIUS}`,
            `${space.x - SPACE_RADIUS},${space.y}`
        ].join(" ");

        group.appendChild(
            createSvgElement("polygon", {
                points,
                class: "think-space-shape"
            })
        );

        addText(
            group,
            space.x,
            space.y,
            "?",
            "think-space-label"
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

            // Give each branch a visible offset.
            const direction = startNumber % 2 === 0 ? -1 : 1;

            for (let i = 1; i <= ALLEY_LENGTH; i++) {
                const progress = i / (ALLEY_LENGTH + 1);

                const x =
                    start.x +
                    (rejoin.x - start.x) * progress;

                const y =
                    start.y +
                    (rejoin.y - start.y) * progress +
                    direction * 65;

                branchSpaces.push({
                    x,
                    y,
                    number: i
                });
            }

            const points = [
                `${start.x},${start.y}`,
                ...branchSpaces.map(
                    alleySpace => `${alleySpace.x},${alleySpace.y}`
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
                    "DARK",
                    "dark-alley-label"
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

        const connections = [
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
            players.push({
                id: i,
                name: `Player ${i + 1}`,
                position: 0,
                coins: 0,
                color: PLAYER_COLORS[i],
                angryMobNextTurn: false,
                finished: false
            });
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

                const groupElement = createSvgElement("g", {
                    class: "player-piece"
                });

                groupElement.appendChild(
                    createSvgElement("circle", {
                        cx: space.x + offset[0],
                        cy: space.y + offset[1],
                        r: 11,
                        fill: player.color,
                        stroke: "#211013",
                        "stroke-width": 2
                    })
                );

                addText(
                    groupElement,
                    space.x + offset[0],
                    space.y + offset[1],
                    String(player.id + 1),
                    "player-piece-label"
                );

                playerLayer.appendChild(groupElement);
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
        updateUI();

        let spacesMoved = 0;

        movementTimer = window.setInterval(() => {
            if (spacesMoved >= spacesToMove) {
                window.clearInterval(movementTimer);
                movementTimer = null;

                isMoving = false;
                resolveLanding(player);

                return;
            }

            if (player.position < TOTAL_SPACES - 1) {
                player.position++;
            }

            spacesMoved++;

            drawPlayers();
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
             * Current implementation: choosing the Dark Alley
             * advances the player to its rejoin point.
             *
             * The individual alley squares are currently
             * decorative. Landing penalties on those squares
             * will require a separate movement mechanic.
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

        if (thinkChoicePanel) {
            thinkChoicePanel.classList.add("hidden");
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

    const rulesButton = document.getElementById("rulesButton");
    const rulesPanel = document.getElementById("rulesPanel");
    const closeRules = document.getElementById("closeRules");

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
    document.addEventListener("keydown", (event) => {
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
        backgroundMusic.volume = Number(musicVolume.value);

        musicToggle.addEventListener("click", async () => {
            if (backgroundMusic.paused) {
                try {
                    await backgroundMusic.play();
                    musicToggle.textContent = "♫ Turn Music Off";
                } catch (error) {
                    console.error("Music could not play:", error);
                    gameMessage.textContent =
                        "Music could not start. Check the audio file path.";
                }
            } else {
                backgroundMusic.pause();
                musicToggle.textContent = "♫ Play Music";
            }
        });

        musicVolume.addEventListener("input", () => {
            backgroundMusic.volume = Number(musicVolume.value);
        });

        backgroundMusic.addEventListener("ended", () => {
            musicToggle.textContent = "♫ Play Music";
        });
    }

})();