/*
Player class. instances of player are made in gameboard.js

*/
class Player {
    constructor(name) {
        // gamestate vars
        this.position = 0;
        this.coins = 0;
        this.gameOver = false;
        this.name = name;
    }

    rollDie() {
        return Math.floor(Math.random()*6) + 1;
    }

    updatePlayerPosition(newPosition) {
        this.position += newPosition;
    }

    resetGamestate() {
        this.position = 0;
        this.coins = 0;
        this.gameOver = false;
    }

    rollTurn() {
        var roll1 = this.rollDie();
        var roll2 = this.rollDie();
        var total = roll1 + roll2;
        this.updatePlayerPosition(total);
    }

    checkLandingSpace() {

    }
}