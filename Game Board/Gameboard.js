//import * as playerClass from "./Player.js";
//import * as directorClass from "./Director.js";
//import * as spaceClass from "./Spaces.js";


const players = [];
players.push(new Player("player1"));
players.push(new Player("player2"));
const director = new Director(players.length);

while (!director.gameOver) {
    director.updateUI(players[director.turnOrder].name, players[director.turnOrder].position, players[director.turnOrder].coins);
    players[director.turnOrder].rollTurn();
    director.updateUI(players[director.turnOrder].name, players[director.turnOrder].position, players[director.turnOrder].coins);
    director.resolveLandingSpace(players[director.turnOrder]);
    director.switchTurnOrder();
}

console.log("Game over!");