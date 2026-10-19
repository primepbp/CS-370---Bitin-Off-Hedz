class Player {
    constructor(name, id) {
        this.position = 0; // position on board
        this.coins = 0;
        this.currentSpace; // type of space they are on
        this.totalSpaces = 60;
        this.name = name;
        this.id = id; // their turn order, which is their index in the players array
    }

    rollDie() {
        return Math.floor(Math.random() * 6) + 1;
    }

    updatePosition(newPos) {
        this.position += newPos;
        if (this.position >= this.totalSpaces) {
            this.position = this.totalSpaces - 1;
        } 
    }

    rollTurn() {
        var roll1 = this.rollDie();
        var roll2 = 0;
        // if the current space is an angry mob, only roll the first die
        if (this.currentSpace == "angryMob") {
            roll2 = 0;
        } else {
            roll2 = this.rollDie();
        }
        var total = roll1 + roll2;
        this.updatePosition(total);
    }

    resolveLandingSpace(type) {
        // type is string value taken from the spaces type
        this.currentSpace = type;
        //console.log(type);
        switch (type) {
            case "normal":
                // normal landing space
                console.log("Normal space. nothing happens.");
                break;
            case "coin":
                console.log("coin space. +2 coins");
                this.coins += 2;
                break;
            case "angryMob":
                console.log("angry mob space. next turn, you will only roll 1 die.");
                break;
        }
    }


}