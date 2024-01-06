import React, { MouseEvent, useRef, useState } from "react";
import game from "./game.tsx";
//@ts-ignore
import * as c from "./canvasDrawing.js";
import { levelData } from "./typedefs";
import _ from "lodash";
function GameDisplay({data, return_fn} : {data : levelData[], return_fn : Function }){
    var lastRendered = Date.now();
    var fps = 40;
    var mouseX = 0;
    var mouseY = 0;
    const [level, setLevel]  = useState(0);
    if(data[level] == undefined){
        return_fn(); 
        return <>Done!</>
    }
    var g : game = new game(data[level]);
	function mouseMove(e : MouseEvent){
		mouseX = e.nativeEvent.offsetX;
		mouseY = e.nativeEvent.offsetY;
	} 
    const lowerCanvas = useRef<HTMLCanvasElement>(null);
    var playerImg : string = "images/player.png"; 
    
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
        //draw the player
        c.drawImage(ctx, playerImg, g.playerX-15, g.playerY-15);
        
        // draw the bullets
        for(var b of g.bullets){
            c.drawImage(ctx, b.img, b.x+b.img_offset[0], b.y+b.img_offset[1]);
        }
        //draw the enemies
        for(var e of g.enemies){
            var image = e.image;
            if(e.type === "charger" && g.isChargerCharging(e, g.t) ){
                image = e.charge_img;
            }
            var offset = e.img_offset;
            c.drawImage(ctx, image, e.x + offset[0], e.y + offset[1]);
        }

        // draw the goals
        if(g.progress !== "completed") {
            if(g.goal.mode == "survive" && g.progress.mode == "survive"){
                var s = g.progress.time + "/" + g.goal.time
                c.drawText(ctx, s, 10, 40 )
            }
            if(g.goal.mode == "chase orb" && g.progress.mode == "chase orb"){
                var [img, offsetX, offsetY ] = g.goal.img;
                c.drawImage(img, g.progress.x + offsetX, g.progress.y + offsetY)
                c.drawCircle(ctx, g.progress.x, g.progress.y, g.goal.size, "green");
                var s = g.progress.time + "/" + g.goal.time
                c.drawText(ctx, s, 10, 40 )
            }
            if(g.goal.mode == "collect items" && g.progress.mode == "collect items"){
                if(g.t >= g.progress.spawn_time){
                    var [img, offsetX, offsetY ] = g.goal.img;
                    c.drawImage(ctx, img, g.progress.x + offsetX, g.progress.y + offsetY);
                }
                var s = g.progress.count + "/" + g.goal.amount
                c.drawText(ctx, s, 10, 40 )
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
                var s = _.countBy(g.progress.collected).true + "/" + g.goal.locations.length
                c.drawText(ctx, s, 10, 40 )
            }            
            if(g.goal.mode == "hit dummy" && g.progress.mode == "hit dummy"){
                var [img, offsetX, offsetY] = g.goal.img;
                c.drawImage(ctx, img, g.goal.x+offsetX,  g.goal.y + offsetY);
                var s = g.progress.count + "/" + g.goal.amount
                c.drawText(ctx, s, 10, 40 )
            }
        }
        if(g.end_door !== undefined){
            var [img, offsetX, offsetY] = g.door_img;
            c.drawImage(ctx, img, g.end_door[0] + offsetX , g.end_door[1] + offsetY  )
        }
    }
    setInterval(update, 1000/fps); // FPS is here
    return <>
        <canvas width={990} height={600} id="lowerCanvas" style={{position:"absolute", top:80, left:0, zIndex:0}}  onMouseMove={mouseMove}  ref={lowerCanvas}/>
    </>
}

export default GameDisplay;