/*
director houses methods for the gameplay loop
rolling dice, resolving landing spaces

*/
class Director {
    constructor(totalPlayers) {
        this.turnOrder = 0;
        this.totalSpaces = 60;
        this.gameOver = false;
        this.totalPlayers = totalPlayers;
    }

    updateUI(playerNum, playerPos, playerCoins) {
        // takes in player values to update ui with
        // player num is their turn order + 1 (turn order starts at 0)
        // for now, updates are shown through console
        console.log("Turn Order: " + playerNum);
        console.log("Position: " + playerPos);
        console.log("Coins: " + playerCoins);
    }

    resolveLandingSpace(player) {
        // checks what kind of space the player landed on
        // 
        if (player.position >= this.totalSpaces) {
            this.finishGame(player);
            return;
        }
        
    }

    finishGame(player) {
        this.gameOver = true;
    }

    resetGame(player) {
        player.resetGamestate();
        this.gameOver = false;
    }

    switchTurnOrder() {
        this.turnOrder++;
        if (this.turnOrder == this.totalPlayers) {
            this.turnOrder = 0;
        }
    }

    

}