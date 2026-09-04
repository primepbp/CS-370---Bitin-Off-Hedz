// player class, director class, 2 instances of player, a director
// board itself :D

// director has index of space coordinates Lol. Its based on turn order.


class Player {
    constructor(turnOrder, position) {
        this.position = 0;
        this.turnOrder = 0;
        this.radius = 20;
    }
    roll() {
        //rolls d6
        return (Math.floor(Math.random() * 6) + 1);
    }

}

class Director {
    constructor() {
        this.turnNumber = 0;
        this.playerCount = 2;

    }
    determineTurnOrder(p1, p2) {
        while ((p1.turnOrder != 0) && (p2.turnOrder != 0)) {
            p1Roll = p1.roll();
            p2Roll = p2.roll();
            if (p1Roll > p2Roll) {
                p1.turnOrder = 1;
                p2.turnorder = 2;
            } else if (p1Roll == p2Roll) {
                continue;
            } else {
                p1.turnOrder = 2;
                p2.turnOrder = 1;
            }
        }
    }
    drawPlayers(ctx) {
        color = "red";
        yDiff = 50;
        for (i=0; i < this.playerCount; i++) {
            ctx.arc(spacePositions[0].x, (spacePositions[i].y + yDiff), 20, 0, 2 * Math.PI);
            ctx.fillStyle = color;
            ctx.fill();
            ctx.stroke();
            color = "yellow";
            yDiff = -30;

        }
    }
}

class Space {
    constructor(x, y, spaceNumber) {
        this.x = x;
        this.y = y;
        this.spaceNumber = spaceNumber; // label number for spaces
    }

}

// coordinates for spaces
const spacePositions = [
    {x: 50, y: 250}, 
    {x: 150, y: 250},
    {x: 250, y: 250},
    {x: 350, y: 250},
    {x: 450, y: 250}
];


/*
Plauer
Board
Spaces
spaces seperate thing?
*/


// canvas setup
const canvas = document.getElementById("gameBoard");
// chaining assignments. canvas.width and width are set to the
// same value within the same line.
//const width = (canvas.width = window.innerWidth);
//const height = (canvas.height = window.innerHeight);
const WIDTH = 500;
const HEIGHT = 500;
const ctx = canvas.getContext("2d"); // object with tools to draw

// draw the spaces
spaceRadius = 15;

for (i=0; i<5; i++) {
    ctx.beginPath();
    ctx.arc(spacePositions[i].x, spacePositions[i].y, spaceRadius, 0, 2 * Math.PI);
    ctx.fillStyle = "blue";
    ctx.fill();
    ctx.stroke();
}

// make players and director, figure out turn order, draw players
p1 = new Player();
p2 = new Player();
director = new Director();
director.determineTurnOrder(p1, p2);
director.drawPlayers(ctx);

