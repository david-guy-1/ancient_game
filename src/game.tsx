
import * as l from "./lines.ts"
import { bullet, charger, enemy, levelData, move_mode, spawner, wall } from "./typedefs";
class game{
    // other data here as well if necessary
    playerX : number;
    playerY : number; 
    walls : wall[];
    temp_walls : [wall, number][] = [];
    bullets : bullet[] = [];
    enemies : enemy[] = [];
    spawners : spawner[] = [];
    t : number  = 0;
    constructor( d : levelData){
        this.playerX = d.player_x;
        this.playerY = d.player_y;
        this.walls = d.walls;
        this.enemies = d.enemies;
        this.spawners = d.spawners;
        this.temp_walls = [];
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
       // console.log([x, y]);
		this.playerX = result[0];
		this.playerY = result[1];
		return true;
	}
    isChargerCharging(e : charger, t : number) : boolean{
        return t % e.charge_delay + e.charge_duration > e.charge_delay  
    }
    moveEnemy(e : enemy, x : number , y : number ){
        var is_wall = this.pointInDirection(e.x, e.y, x, y, Infinity);
        if(!is_wall[2]){
            e.x += x;
            e.y += y;
        }
    }

    moveToPoint(x : number,y : number,maxLength : number): boolean{
		return this.move(x - this.playerX, y -this.playerY, maxLength);
	}
    collide(bullets: bullet){
        bullets.name += "disabled";
    }
    collideEnemy (e : enemy){
        ;
    }
    calculateMoveDIrection(mode : move_mode, enemyX : number, enemyY:number, enemySpeed :  number, playerX : number, playerY : number) : [number, number] {
        if(mode == "pursuit"){
            var vector = [playerX - enemyX, playerY - enemyY]
            return l.normalize(vector,  enemySpeed) as [number, number] ; 
        }
        if(mode[0] == "random"){
            var d = mode[1];
            d += (Math.random() * 2*mode[2] - mode[2] )+ d;
            mode[1] = d; // mutates enemy
            return [Math.cos(d) * enemySpeed, Math.sin(d) * enemySpeed]
        }
        if(mode[0] == "location_mover"){
            var vector =[mode[1] - enemyX, mode[2] - enemyY];
            return l.normalize(vector, enemySpeed) as [number, number];
        }
        throw "Unknown enemy move mode "
    }
    tick(mouseX : number, mouseY : number ){
       // console.log(JSON.stringify(this.enemies));
        this.t++;
        // move player
        this.moveToPoint(mouseX, mouseY, 10);
        // move bullets
        for(var b of this.bullets){
            b.x += b.speed[0] ;
            b.y += b.speed[1] ;
        }
        this.bullets = this.bullets.filter(b => b.x > 0 && b.x < 1000 && b.y > 0 && b.y < 1000 && b.name.indexOf("disabled") === -1);

        // check collisions
        for(var b of this.bullets){
            // check if we care in the first place
            if(Math.pow(b.x - this.playerX, 2) + Math.pow(b.y - this.playerY, 2) < Math.pow(b.radius, 2)){
                this.collide(b);
            }
        }
        for(var e of this.enemies){
            switch(e.type) {
                case "normal":
                    var [x,y] = this.calculateMoveDIrection(e.mode, e.x, e.y , e.speed, this.playerX, this.playerY );
                    this.moveEnemy(e, x, y);
                    //shoot bullets
                    if(this.t % e.bullet.delay == e.birthday % e.bullet.delay) {
                        console.log("boom!")
                        var speed: [number, number] = [0,0]
                        if(e.bullet.dir === "random"){
                            var angle = Math.random()*2*Math.PI;
                            speed = [Math.cos(angle) * e.bullet.speed, Math.sin(angle) * e.bullet.speed];
                        };
                        if(e.bullet.dir == "towards player"){
                            speed = l.normalize([this.playerX - e.x, this.playerY-e.y], e.bullet.speed) as [number, number];
                        }
                        this.bullets.push({"x" : e.x, "y" : e.y, speed : speed, radius : e.bullet.radius, img:e.bullet.img, img_offset : e.bullet.img_offset, name:e.bullet.bullet_name});
                    }
                break;
                case "charger":
                    var charging = this.isChargerCharging(e, this.t);
                    var [x,y] = this.calculateMoveDIrection(e.mode, e.x, e.y , charging ? e.charge_speed :  e.speed, this.playerX, this.playerY );
                    this.moveEnemy(e, x, y);  
                    break
                case "fire breath":
                    e.lifespan--;
                    if(e.lifespan <= 0){
                        e.name += "disabled";
                    }
                    break;
                case "fire strike":
                    var new_walls : [wall, number][]= [];
                    for(var item of e.shape){
                        new_walls.push([[item[0] + e.x, item[1] + e.y, item[2] + e.x, item[3] + e.y], this.t + e.wall_duration])
                    }
                    this.temp_walls = this.temp_walls.concat(new_walls);
                    e.lifespan--;
                    if(e.lifespan <= 0){
                        e.name += "disabled";
                    }
            }
        }
        // check collision with enemies 
        for(var e of this.enemies){
            if(e.type == "normal" || e.type == "charger"){
                if(Math.pow(e.x - this.playerX,2) + Math.pow( e.y - this.playerY,2) < Math.pow(e.radius,2)){
                    this.collideEnemy(e);
                }
            }
        }
        // process spawners
        for(var s of this.spawners){
            if(this.t > s.start_time && this.t % s.interval == s.start_time % s.interval){
                // spawn new enemy 
                var e = JSON.parse(JSON.stringify(s.enemy)) as enemy;
                e.birthday = this.t; 
                if(Array.isArray(s.location)){
                    e.x = s.location[0];
                    e.y = s.location[1];
                }
                else{
                    var [tlx, tly, brx, bry] = s.location.rect;
                    e.x = Math.random() * (brx - tlx) + tlx;
                    e.y = Math.random() * (bry - tly) + tly;
                }
                this.enemies.push(e);
            }
            
        }
    }
}

export default game;