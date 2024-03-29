
import { dual_filter } from "./dual_filter.ts";
import * as l from "./lines.ts"
import { bullet, charger, enemy, goal, goalCollect, goalPChase, goalPCollect, goalPCollectF, goalPHit, goal_progress, levelData, move_mode, player, spawner, tickOutput, transforming_enemy, wall } from "./typedefs";
import {WIDTH, HEIGHT, FPS} from "./constants.ts";
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
    hits : number
    p : player
    constructor( d : levelData, p : player){
        this.playerX = d.player_x;
        this.playerY = d.player_y;
        this.walls = d.walls;
        this.enemies = d.enemies;
        this.spawners = d.spawners;
        this.temp_walls = [];
        this.goal = d.goal;
        this.progress = this.blankGoalProgress(d.goal.mode, d.goal.mode === "collect fixed items" ? d.goal.locations.length : undefined);
        this.end_door = undefined;
        this.last_hit = -Infinity;
        this.door_img = d.door_img;
        this.hits = 0
        this.p = p;
        
    }
    blankGoalProgress(mode : string, items : number | undefined  = undefined) : goal_progress{
        switch(mode){
            case "survive" : 
            return {mode : "survive"};
            case "chase orb" : 
            return {mode : "chase orb", x : 0, y : 0, time : 0, waypoint : 0}
            case "collect items" :
            return {mode : "collect items", spawn_time : 0, x : 0, y : 0 , count : -1}
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
    getTransformedEnemy(e : transforming_enemy, t : number){
        var modTime = (t-e.birthday) % e.modulus;
        var this_beh : enemy | undefined = undefined;
        for(var item of e.behaviors){
            var [modt, b] = item; 
            if(modTime <= modt) {
                this_beh = b;
                break;
            } 
        }
        if(this_beh == undefined){
            throw "enemy with undefined behaviour : " + JSON.stringify(e) + " " + t;
        }
        // e.___ are all irrelevant since we use the chosen behaviour's one
        for(var item of e.behaviors){
            var [modt, b] = item;
            b.x = this_beh.x;
            b.y = this_beh.y;
            b.name = this_beh.name;
            b.birthday = this_beh.birthday;
            b.lifespan = this_beh.lifespan;
        }
        return this_beh;
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
        return (t - (e.start_at == undefined ? 0 : e.start_at) )% e.charge_delay + e.charge_duration > e.charge_delay  
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
        if(this.t - this.last_hit > this.p.invincibility) { 
            bullets.name += "disabled";
            this.hits += 1;
            this.last_hit = this.t
        }
    }
    collideEnemy (e : enemy){
        if(this.t - this.last_hit > this.p.invincibility) { 
            this.hits += 1
            this.last_hit = this.t
        }
    }
    hitDummy(b : bullet){
        b.name += "disabled";
        this.progress = this.progress as any as goalPHit ;
        this.progress.count += 1;
    }
    calculateMoveDirection(mode : move_mode, enemyX : number, enemyY:number, enemySpeed :  number, playerX : number, playerY : number) : [number, number] {

        if(mode == "pursuit"){
            var vector = [playerX - enemyX, playerY - enemyY]
            var length =  Math.sqrt(Math.pow(vector[0],2) + Math.pow(vector[1] , 2) ); 
            enemySpeed = Math.min(length, enemySpeed);
            if(enemySpeed == 0){
                return [0,0]
            }
            return l.normalize(vector,  enemySpeed) as [number, number] ; 
        }

        if(mode[0] == "random"){
            var d = mode[1];
            if(d == "random"){
                d = Math.random() * 2*Math.PI;
            }
            d += (Math.random() * 2*mode[2] - mode[2] );
            mode[1] = d; // mutates enemy
            return [Math.cos(d) * enemySpeed, Math.sin(d) * enemySpeed]
        }
        if(mode[0] == "location_mover"){
            var vector =[mode[1] - enemyX, mode[2] - enemyY];
            var length =  Math.sqrt(Math.pow(vector[0],2) + Math.pow(vector[1] , 2) ); 
            enemySpeed = Math.min(length, enemySpeed);
            if(enemySpeed == 0){
                return [0,0]
            }
            return l.normalize(vector, enemySpeed) as [number, number];
        }
        throw "Unknown enemy move mode "
    }
    spawn_enemy(e : enemy, x : number,  y : number){
        var e = JSON.parse(JSON.stringify(e)) as enemy;
        e.x = x;
        e.y = y;
        e.birthday = this.t;
        if(e.type == "transforming"){
            for (var item2 of e.behaviors){
                var [n, beh] = item2;
                beh.x = e.x;
                beh.y = e.y;
                beh.birthday = e.birthday;
                beh.name = e.name;
                beh.lifespan = e.lifespan
            }
        }
        this.enemies.push(e);
    }
    tick(mouseX : number, mouseY : number ) : tickOutput{
       // console.log(JSON.stringify(this.enemies));
        //console.log(this.t);
        // move player
        this.moveToPoint(mouseX, mouseY, this.p.speed);
        // move bullets
        for(var b of this.bullets){
            b.x += b.speed[0] ;
            b.y += b.speed[1] ;
        }


        // check collisions
        for(var b of this.bullets){
            if(this.t - this.last_hit <= this.p.invincibility){
                break;
            }
            if(b.radius <= 0 ){ 
                continue
            }
            // check if we care in the first place
            if(Math.pow(b.x - this.playerX, 2) + Math.pow(b.y - this.playerY, 2) < Math.pow(b.radius, 2)){
                this.collide(b);
            }
        }
        for(var e of this.enemies){
            if(e.type == "transforming"){
                e = this.getTransformedEnemy(e, this.t)
            }
            switch(e.type) {
                case "normal":
                    var [x,y] = this.calculateMoveDirection(e.mode, e.x, e.y , e.speed, this.playerX, this.playerY );
                    this.moveEnemy(e, x, y);
                    //shoot bullets
                    var mod = e.bullet?.start_at == undefined ? 0 : e.bullet.start_at;
                    if(e.bullet && (this.t+mod) % e.bullet.delay == e.birthday % e.bullet.delay) {
                        // case 1 : single bullet
                        if(e.bullet.dir[0] !== "burst"){
                            var speed: [number, number] = [0,0]
                            if(e.bullet.dir === "random"){
                                var angle = Math.random()*2*Math.PI;
                                speed = [Math.cos(angle) * e.bullet.speed, Math.sin(angle) * e.bullet.speed];
                            };
                            if(e.bullet.dir == "towards player"){
                                try {  
                                    speed = l.normalize([this.playerX - e.x, this.playerY-e.y], e.bullet.speed) as [number, number];
                                } catch(err){
                                    if(err == "normalizing a zero vector"){
                                        speed = [0, e.bullet.speed];
                                    }
                                }
                            }
                            if(Array.isArray(e.bullet.dir) && e.bullet.dir[0] == "player angle"){
                                var offset = e.bullet.dir[1]; 
                                var angle = Math.atan2(this.playerY - e.y, this.playerX - e.x) + offset; 
                                var bspd = e.bullet.speed
                                speed = [Math.cos(angle) * bspd,Math.sin(angle) * bspd]
                            }
                            if(Array.isArray(e.bullet.dir) && e.bullet.dir[0] == "fixed"){
                                speed = [e.bullet.dir[1], e.bullet.dir[2]] 
                            }
                            this.bullets.push({"x" : e.x, "y" : e.y, speed : speed, radius : e.bullet.radius, img:e.bullet.img, img_offset : e.bullet.img_offset, name:e.bullet.bullet_name});
                        } else {
                            // burst bullet
                            var amount = e.bullet.dir[1]  as number;
                            var start_angle = Math.random() * 2 * Math.PI
                            var turn = 2 * Math.PI / amount;    

                            for(var i=0; i < amount; i++){
                                var angle = start_angle + turn * i
                                var speed = l.normalize([Math.cos(angle), Math.sin(angle)], e.bullet.speed) as [number, number]
                                this.bullets.push({"x" : e.x, "y" : e.y, speed : speed, radius : e.bullet.radius, img:e.bullet.img, img_offset : e.bullet.img_offset, name:e.bullet.bullet_name});
                            }
                        }
                    }
                break;
                case "charger":
                    var charging = this.isChargerCharging(e, this.t);
                    var [x,y] = this.calculateMoveDirection(e.mode, e.x, e.y , charging ? e.charge_speed :  e.speed, this.playerX, this.playerY );
                    this.moveEnemy(e, x, y);  
                    break
                case "fire breath":
                    break;
                case "fire strike":
                    if(this.t - e.birthday == e.warning_time){
                        var new_walls : [wall, number][]= [];
                        for(var item of e.shape){
                            new_walls.push([[item[0] + e.x, item[1] + e.y, item[2] + e.x, item[3] + e.y], this.t + e.wall_duration])
                        }
                        this.temp_walls = this.temp_walls.concat(new_walls);
                    }
            }
        }
        // check collision with enemies 
        for(var e of this.enemies){
            if(e.type == "transforming"){
                e = this.getTransformedEnemy(e, this.t)
            }
            if(e.type == "normal" || e.type == "charger" || ((e.type == "fire breath" || e.type == "fire strike") && this.t - e.birthday > e.warning_time)){
                if(e.radius <= 0){
                    continue;
                }
                if(Math.pow(e.x - this.playerX,2) + Math.pow( e.y - this.playerY,2) < Math.pow(e.radius,2)){
                    this.collideEnemy(e);
                }
            }
        }
        // process spawners
        for(var s of this.spawners){
            if(this.t >= s.start_time && this.t % s.interval == s.start_time % s.interval){
                // spawn new enemy 
                var e = JSON.parse(JSON.stringify(s.enemy)) as enemy;
                var x = 0;
                var y = 0; 
                if(Array.isArray(s.location)){
                    x = s.location[0];
                    y = s.location[1];
                } else if(s.location == "random edge"){
                    var side = "udlr"[Math.floor(Math.random()*4)];
                    if(side == "l"){
                        x = 0;
                        y = Math.random() * HEIGHT;
                    }
                    if(side == "r"){
                        x = WIDTH;
                        y = Math.random() * HEIGHT;                         
                    }
                    if(side == "u"){
                        x = Math.random() * WIDTH;
                        y = 0;
                    }
                    if(side == "d"){
                        x = Math.random() * WIDTH;
                        y = HEIGHT;
                    }
                    
                }
                else{
                    var [tlx, tly, brx, bry] = s.location.rect;
                    x = Math.random() * (brx - tlx) + tlx;
                    y = Math.random() * (bry - tly) + tly;
                }
                // spawner makes enemies that move towards a certain location
                if(s.towards != undefined){
                    var tx =0
                    var ty =0
                    var offsetX =  WIDTH * (Math.random() * 0.2 - 0.1)
                    var offsetY =  HEIGHT * (Math.random() * 0.2 - 0.1)
                    if(s.towards == "center"){
                        tx = WIDTH/2 + offsetX;
                        ty = HEIGHT/2 + offsetY;
                    }
                    if(s.towards == "player"){
                        tx = this.playerX + offsetX
                        ty = this.playerY + offsetY;
                    }
                    console.log([tx, ty]);
                    if(e.type == "normal"){
                        e.mode = ["location_mover", tx, ty];
                    } 
                    if(e.type == "transforming"){
                        for(var f of e.behaviors.map((x) => x[1])){
                            if(f.type == "normal"){
                                f.mode = ["location_mover", tx, ty];
                            }
                        }
                    }
                }
                this.spawn_enemy(e, x, y);
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
                    if(this.t == 0){
                        this.progress.x = this.goal.waypoints[0][0];
                        this.progress.y = this.goal.waypoints[0][1];
                    }
                    // move towards the next waypoint
                    var next_index  = this.progress.waypoint + 1 ;
                    if(next_index == this.goal.waypoints.length){
                        next_index = 0;
                    }
                    var next_waypoint = this.goal.waypoints[next_index]
                    var v = [next_waypoint[0]-this.progress.x  ,next_waypoint[1] - this.progress.y ]
                    var length = Math.pow(v[0] ,2 ) + Math.pow(v[1], 2);
                    if(length < Math.pow(this.goal.speed,2)) {
                        this.progress.waypoint++;
                        if(this.progress.waypoint == this.goal.waypoints.length){
                            this.progress.waypoint = 0;
                        }
                    } else {
                        var [dx, dy] = l.normalize(v, this.goal.speed)
                        this.progress.x += dx; 
                        this.progress.y += dy;
                    }

                    if(this.progress.time >= this.goal.time){
                        this.progress = "completed";
                    }
                    
                break;
                case "collect items":
                    this.progress = this.progress as unknown as  goalPCollect;
                    var d = Math.pow(this.playerX - this.progress.x, 2) + Math.pow(this.playerY - this.progress.y, 2);
                    if(this.t == 0 || (d < Math.pow(this.goal.size,2) && this.t > this.progress.spawn_time)) {
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
                        if(d <  Math.pow(this.goal.size,2) ){
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
            this.end_door = [50+Math.random()*(WIDTH - 100),50 + Math.random()*(HEIGHT-100)];
        }
        var win = false;
        if(this.end_door !== undefined) {
            var d = Math.pow(this.playerX - this.end_door[0] , 2) + Math.pow(this.playerY - this.end_door[1] , 2) 
            if(d < 400){
                win = true; ;
            }
        }
        // "special" effects goes here : 

        // filter out things
        
        var [stayed_bullets, destroyed_bullets] = dual_filter(this.bullets, b => b.x > 0 && b.x < WIDTH && b.y > 0 && b.y < HEIGHT && b.name.indexOf("disabled") === -1);
        // for a transforming enemy , if any of its behaviours are disabled, the entire thing is disabled.

        function is_enemy_disabled(x : enemy, t : number){
            if(x.name.indexOf("disabled") !== -1){
                return true;
            } 
            if(x.type=="transforming" && _.some(x.behaviors, t => t[1].name.indexOf("disabled") !== -1)){
                return true;
            }
            if(x.lifespan !== undefined && t > x.birthday + x.lifespan) {
                return true;
            }
            return false;
        }


        var [stayed_enemies, destroyed_enemies] = dual_filter(this.enemies,x => !is_enemy_disabled(x,this.t) );

        var [stayed_spawners, destroyed_spawners] = dual_filter(this.spawners, x => x.name.indexOf("disabled") === -1 && (x.end_time == undefined || x.end_time > this.t));
        var [stayed_walls, destroyed_walls] = dual_filter(this.temp_walls, (x) => x[1] < this.t) ;
        this.bullets = stayed_bullets;
        this.enemies = stayed_enemies;
        this.spawners = stayed_spawners;
        this.temp_walls =stayed_walls;
        for(var e of destroyed_enemies){
            if(e.spawn_on_death){
                for(var e2 of e.spawn_on_death){
                    this.spawn_enemy(e2, e.x, e.y);
                }
            }
        }
        this.t++;
        return {"bullets": destroyed_bullets, "enemies" : destroyed_enemies, "spawners" : destroyed_spawners, "walls": destroyed_walls, "win":win}
        
    }
}

export default game;