class GameUtils {
    constructor(totalPlayers) {
        this.turnOrder = 0;
        this.totalSpaces = 60;
        this.totalPlayers = totalPlayers;
        this.gameOver = false;
    }

    updateUI(name, pos, coin) {
        console.log(name + "'s turn");
        console.log("Position: " + pos);
        console.log("Coins: " + coin);
    }

    checkForFinish(pos) {
        if (pos >= this.totalSpaces - 1) {
            this.finishGame();
        }
    }

    finishGame() {
        this.gameOver = true;
    }

    resetGame() {
        this.gameOver = false;
    }

    switchTurnOrder() {
        this.turnOrder++;
        if (this.turnOrder == this.totalPlayers) {
            this.turnOrder = 0;
        }
    }
}