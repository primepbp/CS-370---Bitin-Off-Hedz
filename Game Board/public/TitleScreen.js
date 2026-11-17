document.addEventListener("DOMContentLoaded", () => {

    const $ = id => document.getElementById(id);

    const title = $("titleScreen");
    const lobby = $("lobbyScreen");
    const game = $("gameScreen");

    const characters = [
        {
            name: "Marie Antoinette",
            image: "characters/Marie%20Antoinette.gif",
            power: "Cannot be pushed back to the start by another player."
        },
        {
            name: "Maximilien Robespierre",
            image: "characters/Robespierre.gif",
            power: "May ignore one die. If the roll is 2 and 6, may move 2, 6, or 8 spaces."
        },
        {
            name: "Anne Boleyn",
            image: "characters/Anne%20Bolyne.gif",
            power: "May treat Angry Mob spaces as ordinary spaces."
        },
        {
            name: "King Louis XVI",
            image: "characters/King%20Louis%20XVI.gif",
            power: "May reroll both dice by spending one coin."
        },
        {
            name: "Headless Horseman",
            image: "characters/HeadlessHoreman.png",
            power: "Unless on an Angry Mob space, may roll a third die."
        },
        {
            name: "Queen of Hearts",
            image: "characters/Queen%20of%20Hearts.gif",
            power: "May treat Dark Alley and Angry Mob spaces as ordinary spaces. Declare before rolling. Coin limit: 5."
        }
    ];

    const message = $("message");
    const lobbyMessage = $("lobbyMessage");

    const usernameInput = $("usernameInput");

    function getUsername() {
    const username = usernameInput.value.trim();

    if (!username) {
        message.textContent = "Please enter your player name.";
        usernameInput.focus();
        return null;
    }

    if (username.length > 16) {
        message.textContent = "Your name must be 16 characters or fewer.";
        usernameInput.focus();
        return null;
    }

    return username;
}

    if (typeof io === "undefined") {
        message.textContent =
            "Socket.IO did not load. Open this page through the Node.js server.";
        return;
    }

    const socket = io();

    let roomCode = "";
    let isHost = false;
    let index = 0;
    let players = [];
    let selected = null;
    let ready = false;

    // SERVER CONNECTION

    socket.on("connect", () => {
        console.log("Connected:", socket.id);
        message.textContent = "";
    });

    socket.on("connect_error", error => {
        console.error(error);
        message.textContent =
            "Cannot connect to server. Use http://localhost:3000/TitleScreen.html";
    });

    // HOST GAME Updated by Cailyn
    $("hostGame").onclick = () => {

    const username = getUsername();

    if (!username) return;

    message.textContent = "Creating room...";

    socket.emit("host-game", username, response => {

        if (!response?.success) {
            message.textContent =
                response?.message || "Could not create room.";
            return;
        }

        roomCode = response.roomCode;
        isHost = true;

        enterLobby();
        });
    };

    // JOIN GAME

    $("joinGame").onclick = () => {
        $("joinArea").classList.toggle("hidden");
        $("roomCodeInput").focus();
    };

    $("roomCodeInput").oninput = event => {
        event.target.value = event.target.value
            .toUpperCase()
            .replace(/[^A-Z0-9]/g, "")
            .slice(0, 5);
    };

    $("confirmJoin").onclick = () => {

    const username = getUsername();

    if (!username) return;

    const code = $("roomCodeInput").value.trim();

    if (!code) {
        message.textContent = "Enter a room code.";
        return;
    }

    socket.emit("join-game", {
        username,
        roomCode: code
    }, response => {

        if (!response?.success) {
            message.textContent =
                response?.message || "Could not join room.";
            return;
        }

        roomCode = response.roomCode;
        isHost = false;

        enterLobby();
    });
};

    // OPEN LOBBY

    function enterLobby() {

        title.classList.add("hidden");
        lobby.classList.remove("hidden");

        $("roomCode").textContent = roomCode;

        render();
    }

    // DISPLAY CHARACTER

    function renderCharacter() {

        const character = characters[index];

        $("characterImage").src = character.image;
        $("characterImage").alt = character.name;

        $("characterName").textContent = character.name;

        $("characterPosition").textContent =
            `${index + 1} of 6`;

        $("characterPower").textContent = character.power;

        const taken = players.some(player =>
            player.character === character.name &&
            player.id !== socket.id
        );

        $("selectCharacter").disabled = taken || ready;

        $("selectCharacter").textContent =
            selected === character.name
                ? "CHARACTER SELECTED"
                : "SELECT THIS CHARACTER";

        $("selectionStatus").textContent =
            taken
                ? "This character is already taken."
                : selected
                    ? `Your character: ${selected}`
                    : "Choose a character.";
    }

    // CHARACTER ARROWS

    $("previousCharacter").onclick = () => {

        index = (index + 5) % 6;

        renderCharacter();
    };

    $("nextCharacter").onclick = () => {

        index = (index + 1) % 6;

        renderCharacter();
    };

    // SELECT CHARACTER

    $("selectCharacter").onclick = () => {

        socket.emit("select-character", {
            roomCode,
            character: characters[index].name
        });
    };

    // READY BUTTON

    $("readyButton").onclick = () => {

        if (!selected) {
            lobbyMessage.textContent =
                "Select a character first.";
            return;
        }

        ready = !ready;

        socket.emit("set-ready", {
            roomCode,
            ready
        });
    };

    // START GAME

    $("startGame").onclick = () => {
        socket.emit("start-game", { roomCode });
    };

    // LEAVE LOBBY
$("leaveLobby").onclick = () => {

    lobbyMessage.textContent = "Leaving room...";

    $("leaveLobby").disabled = true;

    socket.emit("leave-room", response => {

        $("leaveLobby").disabled = false;

        if (!response?.success) {
            lobbyMessage.textContent =
                "Could not leave the room. Please try again.";
            return;
        }

        roomCode = "";
        isHost = false;
        selected = null;
        ready = false;
        players = [];

        $("playerList").replaceChildren();
        $("roomCode").textContent = "";

        lobbyMessage.textContent = "";
        message.textContent = "";

        lobby.classList.add("hidden");
        title.classList.remove("hidden");
    });
};

    // COPY ROOM CODE

    $("copyRoomCode").onclick = async () => {

        try {
            await navigator.clipboard.writeText(roomCode);
            lobbyMessage.textContent = "Room code copied!";
        } catch {
            lobbyMessage.textContent = "Room code: " + roomCode;
        }
    };

    // UPDATE PLAYER LIST

    function render() {

        $("playerCount").textContent =
            `${players.length} / 6 players`;

        $("playerList").innerHTML = "";

        players.forEach(player => {

            const li = document.createElement("li");

            const name = document.createElement("span");

            name.textContent =
                (player.isHost ? "HOST · " : "") +
                    player.name +
                    " — " +
                (player.character || "Choosing character");

            const status = document.createElement("span");

            status.textContent =
                player.ready ? "READY" : "NOT READY";

            if (player.ready) {
                status.className = "ready-label";
            }

            li.append(name, status);

            $("playerList").append(li);

            if (player.id === socket.id) {
                selected = player.character;
                ready = player.ready;
            }
        });

        $("readyButton").textContent =
            ready ? "CANCEL READY" : "I'M READY";

        $("startGame").classList.toggle("hidden", !isHost);

        $("startGame").disabled =
            players.length < 2 ||
            !players.every(player =>
                player.ready && player.character
            );

        renderCharacter();
    }

    // SERVER LOBBY EVENTS

    socket.on("lobby-update", data => {

        if (data.roomCode !== roomCode) return;

        players = data.players || [];

        isHost = data.hostId === socket.id;

        render();
    });

    socket.on("room-error", data => {
        lobbyMessage.textContent =
            data?.message || "Something went wrong.";
    });

    socket.on("player-joined", () => {
        lobbyMessage.textContent = "A player joined.";
    });

    socket.on("player-left", () => {
        lobbyMessage.textContent = "A player left.";
    });

    
    // ==================================
    // GAME CHAT COMMUNICATION
    // ==================================

    // Receive chat messages from the server.
    socket.on("chat-message", data => {

        const gameBoardFrame = $("gameBoardFrame");

        if (!gameBoardFrame || !gameBoardFrame.contentWindow) {
            return;
        }

        gameBoardFrame.contentWindow.postMessage({
            type: "GTTG_CHAT_MESSAGE",
            name: data.name,
            message: data.message
        }, window.location.origin);

    });


    // Receive chat messages from GameBoard.js.
    window.addEventListener("message", event => {

        if (event.origin !== window.location.origin) {
            return;
        }

        const data = event.data;

        if (!data || data.type !== "GTTG_CHAT_SEND") {
            return;
        }

        // Send the message through the existing room connection.
        socket.emit("chat-message", data.message);

    });

// GAME STARTED

    socket.on("game-started", data => {

        lobby.classList.add("hidden");
        game.classList.remove("hidden");

        const gameBoardFrame = $("gameBoardFrame");

        // Wait until the game board has loaded.
        gameBoardFrame.onload = () => {

            // Send the actual room players to the game board.
            gameBoardFrame.contentWindow.postMessage({
                type: "GTTG_GAME_START",
                roomCode: data.roomCode,
                players: data.players
            }, window.location.origin);

        };

        gameBoardFrame.src = "GameBoard.html";
    });


});