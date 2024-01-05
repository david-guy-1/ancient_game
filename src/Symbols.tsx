import { useEffect, useRef } from "react";
//@ts-ignore
import * as d from "./draw_symbols.ts";
import valid_symbols from "./symbols.json"; 
function Symbols(){
    const lowerCanvas = useRef<HTMLCanvasElement>(null);

    useEffect(() =>{
        var ctx = lowerCanvas.current?.getContext("2d");
        if(ctx == null){
            return
        }

        var x = 0;
        var shapes : string[] = [];
        for(var i=0; i < 100; i++){
            var number = Math.floor(Math.random() * valid_symbols.length );
            shapes.push(valid_symbols[number]);
        }

        for(var i=0; i < 10; i++){
            for(var j=0 ; j<10; j++){
                d.draw(ctx,d.make_shape(shapes[10*i+j]), 40*i, 40*j )
            }
        }
        
    })
    return <>
    <canvas width={990} height={600} id="lowerCanvas" style={{position:"absolute", top:80, left:0, zIndex:0}}   ref={lowerCanvas}/>
</>
}
export default Symbols;