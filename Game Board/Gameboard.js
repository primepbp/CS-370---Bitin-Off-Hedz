// create players
const players = [];
players.push(new Player("player1", 0));
players.push(new Player("player2", 1));

// create gameutils instance
const util = new GameUtils(players.length);

// create spaces
const spaces = [];


createSpaces();


gameplayLoop();

console.log("game over");



// gameboard funcs

function gameplayLoop() {
    while (!util.gameOver) {
        var turnOrder = util.turnOrder; // 
        util.updateUI(players[turnOrder].name, 
                      players[turnOrder].position,
                      players[turnOrder].coins);
        players[turnOrder].rollTurn();
        players[turnOrder].resolveLandingSpace(spaces[(players[turnOrder].position)].type);
        util.updateUI(players[turnOrder].name, 
                      players[turnOrder].position,
                      players[turnOrder].coins);
        util.switchTurnOrder();
        util.checkForFinish(players[turnOrder].position);
    }
}

function createSpaces() {
    const possibleSpaces = ["normal", "angryMob", "coin"];
    for (i=0; i < util.totalSpaces; i++) {
        // for now, space types are randomly generated
        spaces.push(new Space(possibleSpaces[Math.floor(Math.random() * 3)], i));
        //console.log(possibleSpaces[Math.floor(Math.random() * 3)])
    }
}