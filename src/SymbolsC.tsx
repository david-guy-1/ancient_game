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

// put puzzle moves here!
var presses : string[]= [];
var numbers : number[]= [];
var moves :[ number,number][]= [];
var arrows :string[]= [];
var hovers : [number, number, number, number,string, number, number][]= []




for(var item in "leaf,star,wand,book,flower,circle,ring,gem".split(",")){
    c.loadImage("final_images/"+item+".png");
  }

  

function SymbolsC(props : any){
    //console.log(hovers);
    var ETA : Record<string, string> = props.ETA;
    var ATE: Record<string, string> = props.ATE;
    var LT : Record<string, boolean>= props.LT;
    var puzzle : puzzleType = props.puzzle;
    var num_arrows = _.sum(puzzle.arrows.map(x => x[1]));
    var progress : number = props.progress;
    var progress_callback : Function  = props.progress_callback;
    var GS : string[] = props.GS;
    var BS : string[] = props.BS;
    var IM : string[][] = props.IM;

    const lowerCanvas = useRef<HTMLCanvasElement>(null);

    // first = reset existing, second : call useEffect
    const [render, useRender] = useState<string>("11l");

    if(render[0] == "1"){
        presses = [];
        numbers = [];
        moves = [[0,0]];
        arrows = [];
        for(var i=0; i<puzzle.arithmetic.length;i++){
            numbers[i] = 0;
        }
    }

    
    function addMarkings(ctx : CanvasRenderingContext2D, x : number,y : number,symbols : string, absText  : string | undefined = undefined ){
        var size = symbols.split("|").length * 40;
        d.draw_markings(ctx, x, y, symbols);
        hovers.push([x,y,size,40,absText ? absText : (LT[symbols] == true ? ATE[symbols] : "????"), x, y-24])
    }
    useEffect(() =>{
        if(render[1] == "0"){
            return;
        }
        //console.log("ran here")
        // componentDidMount
        hovers = []
        var ctx = lowerCanvas.current?.getContext("2d");
        ctx?.clearRect(0,0,2000,1000);
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
                    
                    addMarkings(ctx, 200, 50+80*i, ETA[s2]);
                    addMarkings(ctx, 350, 50+80*i, ETA[w2]);
                }
                for(var i=0; i<numbers.length;i++){
                    var number = numbers[i];
                    for(var j=0 ; j < number; j++){
                        c.drawLine(ctx, 550+10*j, 50+80*i, 550+10*j, 90+80*i, "black", 3)   
                    }
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
                        var [py,px] = moves[moves.length-1]
                        if(i == py && j == px){
                            c.drawImage(ctx, "images/player.png",x,y);
                        }
                    }
                }
                addMarkings(ctx, 900, 450, 
                    "dt,dt,ut,,r,,,", "goal");
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

    function moveMade(){
        // check completion
        switch(progress){
            case 0 : 
                if(presses.join("|") == puzzle.buttons.join("|")){
                    progress_callback(); 
                }
            case 1:
                var solved = true;
                for(var i=0; i<puzzle.arithmetic.length; i++){
                    var [a,o,b]  = puzzle.arithmetic[i];
                    if((o == "+" && a+b != numbers[i]) || (o == "-" && a-b != numbers[i])){
                        solved = false;
                        break;
                    }
                }
                if(solved == true){
                    progress_callback(); 
                }
            break;
            case 2:
                console.log(moves[moves.length-1]);
                var [x,y] = moves[moves.length-1]
                if(x < 0 || y < 0 || x > 9 || y > 9){
                    moves.pop();
                    x=0;
                    y=0;
                }
                if(x == 9 && y  == 9){
                    var solved = true;
                    for(var item of moves){
                        if(puzzle.path[item[0]][item[1]] == false){
                            solved = false;
                            break;
                        }
                    }
                    if(solved == true){
                        progress_callback();
                    }else {
                        moves = [[0,0]];
                    }
                } 
                break;
            case 3:
                var s_arrows = [];
                for(var item2 of puzzle.arrows){
                    var [arr, n ] = item2;
                    for(var i=0; i<n; i++){
                        s_arrows.push(arr);
                    }
                }
                if(JSON.stringify(arrows) == JSON.stringify(s_arrows)){
                    progress_callback();
                }
        }
        // re-draw but don't reset
        useRender(render[2] == "a" ? "01b" : "01a");
    }
    return <>
    <button style={{position:"absolute", top:600, left:600}} onClick={() => props.backCallback()}> Return</button>
        {function(){
        var lst = [];
        for(var item of hovers){
            var [x,y,w,h,text,tx,ty] = item;
            lst.push(<HoverText x={x} y={y} w={w} h={h} text={text} tx={tx} ty={ty} />)
          //  console.log(item);
        }

        return lst;
    }()}

    {/*per level buttons */}

    {
        function(){
            var lst = [];
            switch(progress){
                case 0: // colors
                    var colors = "red,yellow,green,blue,white,black".split(",");
                    for(var i=0; i<colors.length; i++){
                        var el = <div style={{position:"absolute", top:80*i+50, left:600,backgroundColor:colors[i] ,width:50, height:50}} onClick={function(this:string){ presses.push(this); if(presses.length > colors.length) { presses = presses.slice(1)} ; moveMade()}.bind(colors[i])}> </div>
                        lst.push(el);
                    }
                    lst.push(<div style={{position:"absolute", top:600, left:10}}>{presses.join(" ")}</div>)
                break
                case 1 :  // numbers
                for(var i=0; i<numbers.length; i++){
                    var el = <img src="images/minus.png" style={{position:"absolute", top:50+80*i, left:700,width:50, height:50}} onClick={function(this:number){numbers[this]--; if(numbers[this] < 0){numbers[this] = 12;}; moveMade()}.bind(i)}/>
                    var e2 = <img src="images/plus.png" style={{position:"absolute", top:50+80*i, left:750,width:50, height:50}} onClick={function(this:number){numbers[this]++; if(numbers[this] == 13){ numbers[this] = 0};moveMade()}.bind(i)}/>
                    lst.push(el);
                    lst.push(e2);
                }
                break;
                case 2 : 
                    var [y,x] = moves[moves.length-1];
                    lst.push(<img src="images/up.png" style={{position:"absolute", top:400, left:400,width:50, height:50}} onClick={function(this:[number, number]){var [y,x] = this; moves.push([y,x]); moveMade()}.bind([y-1, x])}/>)
                    lst.push(<img src="images/down.png" style={{position:"absolute", top:480, left:400,width:50, height:50}} onClick={function(this:[number, number]){var [y,x] = this; moves.push([y,x]); moveMade()}.bind([y+1, x])}/>)
                    lst.push(<img src="images/left.png" style={{position:"absolute", top:440, left:360,width:50, height:50}} onClick={function(this:[number, number]){var [y,x] = this; moves.push([y,x]); moveMade()}.bind([y, x-1])}/>)
                    lst.push(<img src="images/right.png" style={{position:"absolute", top:440, left:440,width:50, height:50}} onClick={function(this:[number, number]){var [y,x] = this; moves.push([y,x]); moveMade()}.bind([y, x+1])}/>)
                break;
                case 3:
                    lst.push(<img src="images/up.png" style={{position:"absolute", top:400, left:400,width:50, height:50}} onClick={function(this:string){arrows.push(this); if(arrows.length > num_arrows) { arrows = arrows.slice(1)} ; moveMade()}.bind("up")}/>)
                    lst.push(<img src="images/down.png" style={{position:"absolute", top:480, left:400,width:50, height:50}} onClick={function(this:string){arrows.push(this); if(arrows.length > num_arrows) { arrows = arrows.slice(1)} ; moveMade()}.bind("down")}/>)
                    lst.push(<img src="images/left.png" style={{position:"absolute", top:440, left:360,width:50, height:50}} onClick={function(this:string){arrows.push(this); if(arrows.length > num_arrows) { arrows = arrows.slice(1)} ; moveMade()}.bind("left")}/>)
                    lst.push(<img src="images/right.png" style={{position:"absolute", top:440, left:440,width:50, height:50}} onClick={function(this:string){arrows.push(this); if(arrows.length > num_arrows) { arrows = arrows.slice(1)} ; moveMade()}.bind("right")}/>)                    
                    lst.push(<div style={{position:"absolute", top:600, left:10}}>{arrows.join(" ")}</div>)
                break;  
            }
            return lst;
        }()
    }
    <canvas width={1200} height={HEIGHT} id="lowerCanvas" style={{position:"absolute", top:0, left:0, zIndex:-1}}   ref={lowerCanvas}/>
    <span style={{position:"absolute", top:0, left:0, zIndex:0}} >Hover over text for translations</span>
    

</>
}
export default SymbolsC;