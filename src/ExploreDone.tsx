import { useEffect, useRef, useState } from "react";
//@ts-ignore
import * as d from "./draw_symbols.ts";
import valid_symbols from "./symbols.json"; 
import { WIDTH, HEIGHT } from "./constants.ts";
import { puzzleType } from "./typedefs";
//@ts-ignore
import * as c from "./canvasDrawing.js";
import HoverText from "./HoverText.tsx";
import _ from "lodash";
import BgImg from "./BgImg.tsx";

// put puzzle moves here!
var presses : string[]= [];
var numbers : number[]= [];
var moves :[ number,number][]= [];
var arrows :string[]= [];
var hovers : [number, number, number, number,string, number, number][]= []



function draw_markings(ctx :CanvasRenderingContext2D, x : number, y : number,  string : string){
    var items : string[] = string.split("|");
    for(var i=0; i< items.length; i++){
        d.draw(ctx, d.make_shape(items[i]),x+40*i, y)
    }
}

function ExploreDone(props : any){
  
    var ATE: Record<string, string> = props.ATE;
    var symbols : string[] = props.symbols;
    var callback : Function = props.callback;
    var token : boolean = props.token;
    const lowerCanvas = useRef<HTMLCanvasElement>(null);


    useEffect(() =>{
        var ctx = (lowerCanvas.current as HTMLCanvasElement).getContext("2d") as CanvasRenderingContext2D; 
        c.drawText(ctx, "You finished exploring this chamber", 100, 100);
        if(token){
            c.drawText(ctx, "You received an upgrade token, spend it to buy an upgrade.", 100, 130);
        }
        c.drawText(ctx, "You learned the following new words from inscriptions in this chamber", 100, 160);
        var i=0
        for(var item of symbols){
            draw_markings(ctx, 50, 170 + 85*i, item);
            c.drawText(ctx, ATE[item], 250, 170 + 85*i+30);
            i++;
        }
    })
   
    return <> <BgImg img="images/end_ins.png"/><canvas width={1200} height={HEIGHT} id="lowerCanvas" style={{position:"absolute", top:0, left:0, zIndex:-1}}   ref={lowerCanvas}/> <span style={{position:"absolute", top:600,left:400, width:400,height:50,backgroundColor:"darkred", zIndex:0,color:"white",fontSize:30}} onClick={() => callback()}>Go back </span></>
}
export default ExploreDone;