import bullet from "./bullet.ts";
import * as l from "./lines.ts"
class game{
    // other data here as well if necessary
    playerX : number;
    playerY : number; 
    walls : wall[];
    temp_walls : [wall, number][] = [];
    bullets : bullet[] = [];
    t : number  = 0;
    constructor(playerX : number, playerY : number, walls : wall[],temp_walls : [wall, number][] = [],  bullets : bullet[] = []){
        this.playerX = playerX;
        this.playerY = playerY;
        this.walls = walls;
        this.bullets = bullets;
        this.temp_walls = temp_walls;
    }
	// returns the point in that direction, and whether or not it goes into a wall
    pointInDirection(curX : number, curY : number, x : number, y : number, maxLength : number): [number, number,boolean]{
		var length = Math.sqrt(x*x + y*y)
		// want vector to have length maxLnegth. 
		if(length < maxLength){
			maxLength = length;
		}
		var newX = curX + x * maxLength / length;
		var newY = curY + y * maxLength / length;
		// check if newX, newY is in a wall
        var walls : wall[] = this.walls.concat(this.temp_walls.filter((x) => x[1] < this.t).map((x) => x[0]));
		for (var wall of walls){
			if(l.doLinesIntersect([curX, curY, newX, newY], wall)){
				return [newX, newY, true];
			}
		}
		return [newX, newY, false]
		
	}


    // attempts to move to a given location  way. If there is a wall, return false. else, return true
    move(x: number,y: number,maxLength: number) : boolean{
		if(x == 0 && y == 0){
			return true;
		}
		var result = this.pointInDirection(this.playerX, this.playerY, x, y, maxLength);
		if(result[2] == true){
			return false
		}
        console.log([x, y]);
		this.playerX = result[0];
		this.playerY = result[1];
		return true;
	}

    moveToPoint(x : number,y : number,maxLength : number): boolean{
		return this.move(x - this.playerX, y -this.playerY, maxLength);
	}
    collide(bullet : bullet){
        bullet.name += "disabled";
    }
    tick(mouseX : number, mouseY : number ){
        this.t++;
        // move player
        this.moveToPoint(mouseX, mouseY, 10);
        // move bullets
        for(var b of this.bullets){
            b.x += b.speed[0] ;
            b.y += b.speed[1] ;
        }
        this.bullets = this.bullets.filter(b => b.x > 0 && b.x < 1000 && b.y > 0 && b.y < 1000 && b.name.indexOf("disabled") === -1);
        if(this.t % 60 == 0){
            // shoot a random bullet.
            this.bullets.push(new bullet("a bullet", 400, 400, [Math.random() * 10 - 5,  Math.random() * 10 - 5], 20,"images/bullet.png"));
        }
        // check collisions
        for(var b of this.bullets){
            // check if we care in the first place
            if(Math.pow(b.x - this.playerX, 2) + Math.pow(b.y - this.playerY, 2) < Math.pow(b.radius, 2)){
                this.collide(b);
            }
        }
    }
}

export default game;