//import * as playerClass from "./Player.js";
//import * as directorClass from "./Director.js";
//import * as spaceClass from "./Spaces.js";


// create players and director
const players = [];
players.push(new Player("player1"));
players.push(new Player("player2"));
const director = new Director(players.length);

// spaces
const spaces = [];
const spacesTypes = ["normal", "coin", "angryMob"];

// create spaces
// for now, is randomly generated
for (i=0; i < director.totalSpaces; i++) {
    spaces.push(new Space(spaceTypes[(i % spaceTypes.length) - 1], i));
}

// game loop
while (!director.gameOver) {
    director.updateUI(players[director.turnOrder].name, players[director.turnOrder].position, players[director.turnOrder].coins);
    players[director.turnOrder].rollTurn();
    director.updateUI(players[director.turnOrder].name, players[director.turnOrder].position, players[director.turnOrder].coins);
    director.resolveLandingSpace(players[director.turnOrder]);
    director.switchTurnOrder();
}

console.log("Game over!");