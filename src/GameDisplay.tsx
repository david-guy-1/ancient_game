import React, { MouseEvent, useEffect, useRef, useState } from "react";
import game from "./game.tsx";
//@ts-ignore
import * as c from "./canvasDrawing.js";
import {WIDTH, HEIGHT, FPS} from "./constants.ts";
import { levelData, player} from "./typedefs";
import _ from "lodash";
var interval = -1;

function GameDisplay({data, return_fn, player} : {data : levelData[], return_fn : Function, player : player }){
    var lastRendered = Date.now();
    var mouseX = 0;
    var mouseY = 0;
    const [level, setLevel]  = useState(0);
    const [lose, setLose]  = useState(false);
    const lowerCanvas = useRef<HTMLCanvasElement>(null);

    useEffect(function(){ 
        console.log("called");
        clearInterval(interval);
        interval = setInterval(update, 1000/FPS); 
    }, [level])

    if(lose){
        clearInterval(interval);
        return <>You lose! <button onClick={() => return_fn(false)}> Return</button></>
    }
    if(data[level] == undefined){
        clearInterval(interval);
        return <>You win! <button onClick={() => return_fn(true)}> Return</button></>
    }
    var g : game = new game(data[level], player);
	function mouseMove(e : MouseEvent){
		mouseX = e.nativeEvent.offsetX;
		mouseY = e.nativeEvent.offsetY;
	} 
    
    
    function update(){
        if(lowerCanvas.current === null){
            return;
        }
        var tick_result = g.tick(mouseX, mouseY);
        if(tick_result.win){
            setLevel(level + 1);
            return; 
        }
        //console.log([mouseX, mouseY, g.playerX, g.playerY]);
        var ctx = lowerCanvas.current.getContext("2d");
        if(ctx == undefined){
            return ; 
        }
        ctx?.clearRect(0,0,1000,1000);
        for(var wall of g.walls){
            c.drawLine(ctx, wall[0], wall[1], wall[2], wall[3]);
        }

        // draw the bullets
        for(var b of g.bullets){
            c.drawImage(ctx, b.img, b.x+b.img_offset[0], b.y+b.img_offset[1]);
        }
        //draw the enemies
        for(var e of g.enemies){
            if(e.type == "transforming"){
                e = g.getTransformedEnemy(e, g.t);
            }
            var image = e.image;
            if(e.type === "charger" && g.isChargerCharging(e, g.t) ){
                image = e.charge_img;
            }
            var offset = e.img_offset;
            if(e.type != 'fire breath' && e.type != 'fire strike'){
                c.drawImage(ctx, image, e.x + offset[0], e.y + offset[1]);
            }
            if(e.type == "fire breath" || e.type == "fire strike"){
                if( g.t - e.birthday > e.warning_time){
                    c.drawImage(ctx, e.image, e.x + offset[0],e.y + offset[1]); 
                }  else {
                    c.drawImage(ctx, e.warning_image, e.x + offset[0],e.y + offset[1]); 
                }
            }
        }

        // draw the goals
        if(g.progress !== "completed") {
            if(g.goal.mode == "survive" && g.progress.mode == "survive"){
                var s = "Survive " + g.t + "/" + g.goal.time
                c.drawText(ctx, s, 10, 40 )
            }
            if(g.goal.mode == "chase orb" && g.progress.mode == "chase orb"){
                var [img, offsetX, offsetY ] = g.goal.img;
                c.drawImage(ctx, img, g.progress.x + offsetX, g.progress.y + offsetY)
                c.drawCircle(ctx, g.progress.x, g.progress.y, g.goal.size, "green");
                var s = g.progress.time + "/" + g.goal.time
                c.drawText(ctx, "Stay in the circle " +s, 10, 40 )
            }
            if(g.goal.mode == "collect items" && g.progress.mode == "collect items"){
                if(g.t >= g.progress.spawn_time){
                    var [img, offsetX, offsetY ] = g.goal.img;
                    c.drawImage(ctx, img, g.progress.x + offsetX, g.progress.y + offsetY);
                }
                var s = g.progress.count + "/" + g.goal.amount
                c.drawText(ctx,"Collect items "+ s, 10, 40 )
            }            
            if(g.goal.mode == "collect fixed items" && g.progress.mode == "collect fixed items"){
                var allSoFar = true; 
                for(var i=0 ; i < g.goal.locations.length; i++){
                    /*
                        if it's collected , and collected_img is not empty ,draw it. 
                        if it's not collected, and (sequential is false or ( all previous collected and next one is available time-wise)), draw it.
                    */
                    if(g.progress.collected[i] == true && g.goal.collected_img !== undefined){
                        var [img, offsetX, offsetY ] = g.goal.collected_img;
                        var [x,y] = g.goal.locations[i];
                        c.drawImage(ctx, img, x+offsetX, y + offsetY);
                    }
                    if(g.progress.collected[i] == false && (g.goal.sequential == false || (allSoFar == true && g.progress.spawn_time <= g.t))){
                        var [img, offsetX, offsetY ] = g.goal.img;
                        var [x,y] = g.goal.locations[i];
                        c.drawImage(ctx, img, x+offsetX, y + offsetY);
                    }
                    if(g.progress.collected[i] == false){
                        allSoFar = false;
                    }
                }
                var collected = _.countBy(g.progress.collected).true;
                if(collected == undefined){
                    collected = 0;
                }
                var s = collected + "/" + g.goal.locations.length
                c.drawText(ctx,"Collect items "+ s, 10, 40 )
            }            
            if(g.goal.mode == "hit dummy" && g.progress.mode == "hit dummy"){
                var [img, offsetX, offsetY] = g.goal.img;
                c.drawImage(ctx, img, g.goal.x+offsetX,  g.goal.y + offsetY);
                var s = g.progress.count + "/" + g.goal.amount
                c.drawText(ctx, "Make enemy bullets hit the object "+s, 10, 40 )
            }
        } else { 
            c.drawText(ctx, "Enter the door!", 10, 40 )
        }
        //draw the end door 
        if(g.end_door !== undefined){
            var [img, offsetX, offsetY] = g.door_img;
            c.drawImage(ctx, img, g.end_door[0] + offsetX , g.end_door[1] + offsetY  )
        }
        // draw the player and hp bar
        var isInv = g.t - g.last_hit < g.p.invincibility
        var playerImg : string = "images/player.png"; 
        var playerInvImg : string = "images/playerInv.png"; 
        c.drawImage(ctx, isInv ? playerInvImg : playerImg, g.playerX-15, g.playerY-15);

        c.drawText(ctx, "HP " + (g.p.hp  - g.hits) +"/" + g.p.hp, 500, 40);

        if(g.p.hp <= g.hits){
            setLose(true);
        }

                
    }
    
    return <>
        <canvas width={990} height={600} id="lowerCanvas" style={{position:"absolute", top:80, left:0, zIndex:0}}  onMouseMove={mouseMove}  ref={lowerCanvas}/>
    </>
}

export default GameDisplay;