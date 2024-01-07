import { useEffect, useRef, useState } from "react";
//@ts-ignore
import * as d from "./draw_symbols.ts";
import valid_symbols from "./symbols.json"; 
import { WIDTH, HEIGHT } from "./constants.ts";
import { puzzleType } from "./typedefs";
//@ts-ignore
import * as c from "./canvasDrawing.js";
import HoverText from "./HoverText.tsx";

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

function SymbolsC(props : any){
    console.log(hovers);
    var ETA : Record<string, string> = props.ETA;
    var ATE: Record<string, string> = props.ATE;
    var seed : string = props.seed;
    var LT : Record<string, boolean>= props.LT;
    var puzzle : puzzleType = props.puzzle;
    var progress : number = props.progress;
    var progress_callback : Function  = props.progress_callback;
    var GS : string[] = props.GS;
    var BS : string[] = props.BS;
    var IM : string[][] = props.IM;

    const lowerCanvas = useRef<HTMLCanvasElement>(null);

    // first = reset existing, second : call useEffect
    const [render, useRender] = useState<string>("11");

    if(render[0] == "1"){
        presses = [];
        numbers = [];
        moves = [[0,0]];
        arrows = [];
    }

    
    function addMarkings(ctx : CanvasRenderingContext2D, x : number,y : number,symbols : string, absText  : string | undefined = undefined ){
        var size = symbols.split("|").length * 40;
        draw_markings(ctx, x, y, symbols);
        hovers.push([x,y,size,40,absText ? absText : (LT[symbols] == true ? ATE[symbols] : "????"), x, y-24])
    }
    useEffect(() =>{
        if(render[1] == "0"){
            return;
        }
        console.log("ran here")
        // componentDidMount
        hovers = []
        var ctx = lowerCanvas.current?.getContext("2d");
        if(ctx == null){
            return
        }
        switch(progress){
            case 0: 
                // buttons
                var buttons = puzzle.buttons;
                for(var i=0; i < buttons.length; i++){
                    addMarkings(ctx, 50, 50+80*i, ETA[buttons[i]]);
                }
                break;
            case 1: 
                // buttons
                var arith = puzzle.arithmetic;
                for(var i=0; i < arith.length; i++){
                    var [n1, s, n2] = arith[i];
                    var w1 = "zero,one,two,three,four,five,six,seven,eight,nine,ten,eleven,twelve".split(",")[n1]
                    var w2 = "zero,one,two,three,four,five,six,seven,eight,nine,ten,eleven,twelve".split(",")[n2]
                    var s2 =  s == "+" ? "plus" : "minus";
                    addMarkings(ctx, 50, 50+80*i, ETA[w1]);
                    
                    addMarkings(ctx, 250, 50+80*i, ETA[s2]);
                    addMarkings(ctx, 500, 50+80*i, ETA[w2]);
                }
                break;
            case 2:
                addMarkings(ctx, 50, 50, "r,,,ut,dt,dt,,", "step on");
                addMarkings(ctx, 250, 50, "r,r,ut,,ut,,,", "avoid");
                // path
                for(var i=0; i<10; i++){
                    for(var j=0; j<10; j++){
                        var image = IM[i][j];
                        var x = 500 + 40*j;
                        var y = 50 + 40*i;
                        c.drawImage(ctx, image,x,y);
                        var [px,py] = moves[moves.length-1]
                        if(i == py && j == px){
                            c.drawImage(ctx, "images/player.png",x,y);
                        }
                    }
                }
                for(var i=0; i < GS.length; i++){
                    addMarkings(ctx, 50, 150+80*i, ETA[GS[i]]);
                }
            
                for(var i=0; i < BS.length; i++){
                    addMarkings(ctx, 250, 150+80*i, ETA[BS[i]]);
                }
                break;
            case 3: 
                var arrows = puzzle.arrows;
                for(var i=0; i < arrows.length;i++){
                    var [str,amt] = arrows[i];
                    addMarkings(ctx, 50, 50+80*i, ETA[str]);
                    addMarkings(ctx, 250, 50+80*i, ETA["zero,one,two,three,four,five,six,seven,eight,nine,ten,eleven,twelve".split(",")[amt]]);
                }
                break;
        }
        var newRender = Array.from(render)
        newRender[1] = "0"
        useRender(newRender.join("") + "a"); // re-render to get the hover text working
    })
    return <>
        {function(){
        var lst = [];
        for(var item of hovers){
            var [x,y,w,h,text,tx,ty] = item;
            lst.push(<HoverText x={x} y={y} w={w} h={h} text={text} tx={tx} ty={ty} />)
            console.log(item);
        }

        return lst;
    }()}

    <canvas width={1200} height={HEIGHT} id="lowerCanvas" style={{position:"absolute", top:0, left:0, zIndex:-1}}   ref={lowerCanvas}/>
    <span style={{position:"absolute", top:0, left:0, zIndex:0}} >Hover over text for translations</span>
    

</>
}
export default SymbolsC;