import React, { MouseEvent, useRef } from "react";
import game from "./game.tsx";
//@ts-ignore
import * as c from "./canvasDrawing.js";
function GameDisplay(props : any){
    var lastRendered = Date.now();
    var fps = 40;
    var mouseX = 0;
    var mouseY = 0;
    var g : game = new game(30, 30, [[200, 200, 600, 600]]);
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
            c.drawImage(ctx, b.img, b.x-b.img_offset[0], b.y-b.img_offset[1]);
        }
    }
    setInterval(update, 1000/60);
    return <>
        <canvas width={990} height={600} id="lowerCanvas" style={{position:"absolute", top:80, left:0, zIndex:0}}  onMouseMove={mouseMove}  ref={lowerCanvas}/>
    </>
}

export default GameDisplay;