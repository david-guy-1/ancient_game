
import { dual_filter } from "./dual_filter.ts";
import * as l from "./lines.ts"
import { bullet, charger, enemy, goal, goalCollect, goalPChase, goalPCollect, goalPCollectF, goalPHit, goal_progress, levelData, move_mode, spawner, tickOutput, wall } from "./typedefs";
import _ from "lodash"
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
    goal : goal;
    progress : goal_progress | "completed";
    end_door : [number, number] | undefined
    door_img : [string, number , number]
    last_hit : number
    constructor( d : levelData){
        this.playerX = d.player_x;
        this.playerY = d.player_y;
        this.walls = d.walls;
        this.enemies = d.enemies;
        this.spawners = d.spawners;
        this.temp_walls = [];
        this.goal = d.goal;
        this.progress = this.blankGoalProgress(d.goal.mode, d.goal.mode === "collect fixed items" ? d.goal.locations.length : undefined);
        this.end_door = undefined;
        this.last_hit = 0;
        this.door_img = d.door_img
        
    }
    blankGoalProgress(mode : string, items : number | undefined  = undefined) : goal_progress{
        switch(mode){
            case "survive" : 
            return {mode : "survive", time : 0};
            case "chase orb" : 
            return {mode : "chase orb", x : 0, y : 0, time : 0}
            case "collect items" :
            return {mode : "collect items", spawn_time : 0, x : 0, y : 0 , count : 0}
            case "collect fixed items" :
            if(items == undefined){
                throw "fixed items with undefined items"
            }
            var item_lst : boolean[] = [];
            for(var i=0; i < items ; i++){
                item_lst.push(false);
            }
            return {mode: "collect fixed items", collected : item_lst, spawn_time : 0}
            case "hit dummy":
                return {mode : "hit dummy", x : 0, y : 0, count : 0}
            default:
                throw "unknown type of goal " + mode;
        }
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
    hitDummy(b : bullet){
        b.name += "disabled";
        this.progress = this.progress as any as goalPHit ;
        this.progress.count += 1;
    }
    calculateMoveDirection(mode : move_mode, enemyX : number, enemyY:number, enemySpeed :  number, playerX : number, playerY : number) : [number, number] {
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
    tick(mouseX : number, mouseY : number ) : tickOutput{
       // console.log(JSON.stringify(this.enemies));
        this.t++;
        // move player
        this.moveToPoint(mouseX, mouseY, 10);
        // move bullets
        for(var b of this.bullets){
            b.x += b.speed[0] ;
            b.y += b.speed[1] ;
        }


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
                    var [x,y] = this.calculateMoveDirection(e.mode, e.x, e.y , e.speed, this.playerX, this.playerY );
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
                    var [x,y] = this.calculateMoveDirection(e.mode, e.x, e.y , charging ? e.charge_speed :  e.speed, this.playerX, this.playerY );
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
        if(this.progress !== "completed") { 
            // process goal 
            switch(this.goal.mode){    
                case "collect fixed items":
                    this.progress = this.progress as unknown as  goalPCollectF
                    var locations :[number, number, number][]  = [];   
                    for(var i = 0; i < this.goal.locations.length; i++){
                        if(this.progress.collected[i] == false){
                            locations.push(this.goal.locations[i].concat([i]) as [number, number, number]);
                            if(this.goal.sequential) {
                                break;
                            }
                        }
                    }
                    // list all stuff to collect 
                    for(var [x,y,index] of locations) {
                        if(Math.pow(x - this.playerX, 2) + Math.pow (y - this.playerY, 2) < Math.pow(this.goal.size,2) && this.t > this.progress.spawn_time){
                            // collected it!
                            this.progress.collected[index] = true; 
                            this.progress.spawn_time = this.t + this.goal.spawn_delay; 
                        }
                    }
                    // check completion
                    if(_.every(this.progress.collected)){
                        this.progress = "completed"; 
                    }
                break;
                case "chase orb":
                    this.progress = this.progress as unknown as  goalPChase;
                    var d = Math.pow(this.playerX - this.progress.x, 2) + Math.pow(this.playerY - this.progress.y, 2);
                    if(d < Math.pow(this.goal.size,2)) { 
                        this.progress.time ++; 
                    }
                    if(this.progress.time >= this.goal.time){
                        this.progress = "completed";
                    }
                break;
                case "collect items":
                    this.progress = this.progress as unknown as  goalPCollect;
                    var d = Math.pow(this.playerX - this.progress.x, 2) + Math.pow(this.playerY - this.progress.y, 2);
                    if(d < Math.pow(this.goal.size,2) && this.t > this.progress.spawn_time) {
                        this.progress.count ++; 
                        this.progress.spawn_time = this.t + this.goal.spawn_delay;
                        var [tlx, tly, brx, bry] = this.goal.spawn_rect
                        this.progress.x = Math.random() * (brx-tlx) + tlx
                        this.progress.y = Math.random() * (bry-tly) + tly
                    }
                    if(this.progress.count >= this.goal.amount){
                        this.progress = "completed";
                    }
                break;
                case "hit dummy":
                    this.progress = this.progress as unknown as  goalPHit;
                    for(var b of this.bullets){
                        var d = Math.pow(b.x - this.goal.x , 2) +  Math.pow(b.y - this.goal.y , 2);
                        if(d < b.radius + this.goal.size ){
                            this.hitDummy(b);
                        }
                    }
                    if(this.progress.count >= this.goal.amount){
                        this.progress = "completed";
                    }
                break;
                case "survive":
                    if(this.t > this.goal.time){
                        this.progress = "completed";
                    }
            }
        }   
        if(this.progress == "completed" && this.end_door == undefined){
            this.end_door = [Math.random() * 600 + 200, Math.random() * 600 + 100 ];
        }
        var win = false;
        if(this.end_door !== undefined) {
            var d = Math.pow(this.playerX - this.end_door[0] , 2) + Math.pow(this.playerY - this.end_door[1] , 2) 
            if(d < 64){
                win = true; ;
            }
        }
        // filter out things
        
        var [stayed_bullets, destroyed_bullets] = dual_filter(this.bullets, b => b.x > 0 && b.x < 1000 && b.y > 0 && b.y < 1000 && b.name.indexOf("disabled") === -1);
        var [stayed_enemies, destroyed_enemies] = dual_filter(this.enemies,x => x.name.indexOf("disabled") === -1);
        var [stayed_spawners, destroyed_spawners] = dual_filter(this.spawners, x => x.name.indexOf("disabled") === -1);
        var [stayed_walls, destroyed_walls] = dual_filter(this.temp_walls, (x) => x[1] < this.t) ;
        this.bullets = stayed_bullets;
        this.enemies = stayed_enemies;
        this.spawners = stayed_spawners;
        this.temp_walls =stayed_walls;
        return {"bullets": destroyed_bullets, "enemies" : destroyed_enemies, "spawners" : destroyed_spawners, "walls": destroyed_walls, "win":win}
        
    }
}

export default game;