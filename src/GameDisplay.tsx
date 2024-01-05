import React, { MouseEvent, useRef } from "react";
import game from "./game.tsx";
//@ts-ignore
import * as c from "./canvasDrawing.js";
import { levelData } from "./typedefs";
function GameDisplay(props : any){
    var lastRendered = Date.now();
    var fps = 40;
    var mouseX = 0;
    var mouseY = 0;
    var data : levelData = {
        "spawners" : [{
            enemy : {type:"charger", speed:Math.floor(100/fps),charge_speed:Math.floor(500/fps), charge_delay:Math.floor(5000/fps), charge_duration:Math.floor(1000/fps), mode:"pursuit", radius:40,x:0, y:0,name:"charger1", image:"images/f/9 7.png",charge_img:"images/f/9 8.png", birthday : 0, img_offset : [-40, -40]},
            interval : Math.floor(2000/fps),
            start_time : Math.floor(5000/fps),
            location : {mode:"random", rect : [200, 200, 600, 600]},
            name:"spawner1"

        }],
        "player_x" : 30, 
        "player_y" : 30,
        "walls" : [[100,100,200,200], [12,34,56,78]],
        enemies : [{
            type:"normal",
            bullet:{
                dir:"random", speed:Math.floor(1000/fps), img:"images/f/3 3.png", img_offset : [-40,-40], delay : Math.floor(fps*0.667), radius : 40, bullet_name:"jess"
            }, 
            speed : Math.floor(200/fps),
            mode:"pursuit",
            radius:3,
            birthday:0,
            x:400,
            y:400,
            name:"enemy1",
            image:"images/f/4 1.png",
            img_offset:[-40,-40]
        }],
    } // a single enemy
    var g : game = new game(data);
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
        g.tick(mouseX, mouseY);
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
    }
    setInterval(update, 1000/fps); // FPS is here
    return <>
        <canvas width={990} height={600} id="lowerCanvas" style={{position:"absolute", top:80, left:0, zIndex:0}}  onMouseMove={mouseMove}  ref={lowerCanvas}/>
    </>
}

export default GameDisplay;