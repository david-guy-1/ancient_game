import React, { MouseEvent, useEffect, useRef, useState } from "react";
import game from "./game.tsx";
//@ts-ignore
import * as c from "./canvasDrawing.js";
import {WIDTH, HEIGHT, FPS} from "./constants.ts";
import { levelData, player} from "./typedefs";
import _, { last } from "lodash";
import BgImg from "./BgImg.tsx";
var interval = -1;
var g_upgrades : boolean[] = []
// upgrades : slow down, speed up, invincibility.
var totalHits : number = 0; 
function GameDisplay({data, return_fn, player, upgrades} : {data : levelData[], return_fn : Function, player : player , upgrades : boolean[]}){
    var lastRendered = Date.now()+400;
    var mouseX = 0;
    var mouseY = 0;
    var slowUntil = 0;
    var slowPlayerOn = -1;
    var player = JSON.parse(JSON.stringify(player)) as player;
    g_upgrades = upgrades;
    const [level, setLevel]  = useState(0);
    const [lose, setLose]  = useState(false);
    const lowerCanvas = useRef<HTMLCanvasElement>(null);
    const upperCanvas = useRef<HTMLCanvasElement>(null);
    if(level == 0){
        totalHits = 0; // reset 
    }
    player.hp -= totalHits; 
    // set up audio

    useEffect(function(){ 
        console.log("called");
        clearInterval(interval);
        interval = setInterval(update, 1000/FPS); 
    }, [level])

    if(lose){
        clearInterval(interval);
        return_fn(false);
        return;
    }
    if(data[level] == undefined){
        clearInterval(interval);
        return_fn(true);
        return;
    }
    var g : game = new game(data[level], player);
	function mouseMove(e : MouseEvent){
		mouseX = e.nativeEvent.offsetX;
		mouseY = e.nativeEvent.offsetY;
	} 
    
    function count_progress(g : game) : number{
        if(g.progress == "completed" || (g.progress.mode != "collect fixed items" && g.progress.mode != "collect items") ){
            return 0;
        }
        var count = 0;
        if(g.progress.mode == "collect fixed items"){
            count = _.countBy(g.progress.collected).true;
            if(count == undefined) {
                count=0;
            }
        }
        if(g.progress.mode == "collect items"){
            count = g.progress.count;
        }
        return count; 

    }
    function update(){
        if(lowerCanvas.current === null || upperCanvas.current === null){
            return;
        }
        lowerCanvas.current.focus();
        var time = Date.now();
        var old_hits = g.hits;
        var old_count = 0;
        var old_complete = false;
        if(g.progress !== "completed"){
            old_count = count_progress(g);
        } else {
            old_complete = true;
        }
        while(lastRendered + 1000/FPS < time ){ 
            if(g.t == slowPlayerOn){
                g.p.speed *= 0.5;
            }
            var tick_result = g.tick(mouseX, mouseY);
            if(tick_result.win){
                setLevel(level + 1);
                totalHits += g.hits;
                return; 
            }
            lastRendered += 1000/FPS;
            if(slowUntil > time){
                lastRendered += 1000/FPS;  
            } 
        }
        // play new sounds

        //@ts-ignore
        if(window.muted == false){
            if(g.hits > old_hits ){
                new Audio("hit.mp3").play();
            }
            if(count_progress(g) > old_count){
                new Audio("coin.mp3").play();
            };
            
            if(old_complete == false && g.progress == "completed"){
                new Audio("complete.mp3").play();
            };
        }
        //console.log([mouseX, mouseY, g.playerX, g.playerY]);
        var ctx = lowerCanvas.current.getContext("2d");
        var ctxu = upperCanvas.current.getContext("2d");
        const textYCoords = 20;
        if(ctx == undefined || ctxu == undefined){
            return ; 
        }
        ctx.clearRect(0,0,2000,1000);
        ctxu.clearRect(0,0,2000,1000);
        if(lastRendered > Date.now() && g.t == 0){
            console.log("A");
            c.drawText(ctx, level == 0 ? "Mouse to move, you cannot attack" :  "Get Ready!",370, 350); 
        }
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
                var s = "Goal : Survive " + g.t + "/" + g.goal.time
                c.drawText(ctxu, s, 10, textYCoords )
            }
            if(g.goal.mode == "chase orb" && g.progress.mode == "chase orb"){
                var [img, offsetX, offsetY ] = g.goal.img;
                c.drawImage(ctx, img, g.progress.x + offsetX, g.progress.y + offsetY)
                c.drawCircle(ctx, g.progress.x, g.progress.y, g.goal.size, "green");
                var s = g.progress.time + "/" + g.goal.time
                c.drawText(ctxu, "Goal : Stay in the circle " +s, 10, textYCoords )
            }
            if(g.goal.mode == "collect items" && g.progress.mode == "collect items"){
                if(g.t >= g.progress.spawn_time){
                    var [img, offsetX, offsetY ] = g.goal.img;
                    c.drawImage(ctx, img, g.progress.x + offsetX, g.progress.y + offsetY);
                }
                var s = g.progress.count + "/" + g.goal.amount
                c.drawText(ctxu,"Goal : Collect coins "+ s, 10, textYCoords )
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
                c.drawText(ctxu,"Goal : Collect coins "+ s, 10, textYCoords )
            }            
            if(g.goal.mode == "hit dummy" && g.progress.mode == "hit dummy"){
                var [img, offsetX, offsetY] = g.goal.img;
                c.drawImage(ctx, img, g.goal.x+offsetX,  g.goal.y + offsetY);
                var s = g.progress.count + "/" + g.goal.amount
                c.drawText(ctxu, "Goal : Make enemy bullets hit the dummy "+s, 10, textYCoords )
                c.drawText(ctx, "dummy", g.goal.x-42, g.goal.y-45); 
            }
        } else { 
            c.drawText(ctxu, "Goal : Enter the door!", 10, textYCoords )
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

        c.drawText(ctxu, "HP " + (g.p.hp  - g.hits), 500, textYCoords);
        var upgrades_string = "";
        if(upgrades[0]) {
            upgrades_string += "Slow Time (Q) "
        }
        if(upgrades[1]) {
            upgrades_string += "Move Enemies (W) "
        }
        if(upgrades[2]) {
            upgrades_string += "Invincible (E) "
        }
        if(upgrades[3]) {
            upgrades_string += "Door Opener (R) "
        }
        c.drawText(ctxu, upgrades_string, 300, textYCoords+40);

        if(g.p.hp <= g.hits){
            setLose(true);
        }

                
    }
    
    function handlePress(e : string ){
        if(e == "q" && upgrades[0]){
            slowUntil = Date.now() + 5000;
            upgrades[0] = false; 
        }
        if(e == "w" && upgrades[1]){
            for(var item of g.enemies){
                var x = Math.random() < 0.5 ? 10 : WIDTH-10;
                var y = Math.random() < 0.5 ? 10 : HEIGHT-10;
                item.x = x;
                item.y = y;
                if(item.type == "transforming"){
                    for(var j of item.behaviors){
                        j[1].x = x;
                        j[1].y = y;
                    }
                }
            }
            upgrades[1] = false;
        }
        if(e == "e" && upgrades[2]){
            g.last_hit = g.t + 200;
            upgrades[2] = false; 
        }
        if(e == "r" && upgrades[3] && g.progress !== "completed"){
            g.progress = "completed";
            upgrades[3] = false; 
        }

    }
    return <>
    {/* need to call lowerCanvas.current.focus(); so handlePress listener will work */}
        <BgImg img={Math.random() > 0.5 ? "images/background.png" : "images/background2.png"}/>
        <canvas width={WIDTH} height={100} id="lowerCanvas" style={{position:"absolute", top:0, left:0, zIndex:0, border:"1px solid black"}}  onMouseMove={mouseMove}  ref={upperCanvas} onKeyDown={(e) => handlePress(e.key.toLowerCase())}/>
        <canvas tabIndex={0} width={WIDTH} height={HEIGHT} id="lowerCanvas" style={{position:"absolute", top:100, left:0, zIndex:0, border:"1px solid black"}}  onMouseMove={mouseMove}  ref={lowerCanvas} onKeyDown={(e) => handlePress(e.key.toLowerCase())}/>
        <button onClick={() => setLose(true)} style={{position:"absolute", top:50, left:WIDTH-100, width:100,height:50, border:"1px solid black",zIndex:1}} > Give up </button>
    </>
}

export default GameDisplay;