import { levelData } from "./typedefs";
import * as d from "./draw_symbols.ts";
//@ts-ignore
import * as c from "./canvasDrawing.js";
// 

function hover(x : [number,number], levels : levelData[][] , symbols : string[][], obtained : Record<string ,boolean>){
    var ctx = (document.getElementById("Canvas") as HTMLCanvasElement).getContext("2d") as CanvasRenderingContext2D;
    ctx.clearRect(0,0,1000,1000,)
    var index = x[0]*5 + x[1];
    var i=0;
    c.drawText(ctx, "Difficulty: "  + ["","","easy","medium","hard"][levels[index].length] , 0, 30)
    
    c.drawText(ctx, "Symbols in this room:" , 0, 70)
    for(var item of symbols[index]){
        d.draw_markings(ctx, 30, 150+50*i, item)
        if(obtained[item] == true){
            c.drawText(ctx, "✓", 0, 150+50*i+30,undefined, "green")
        }
        i++;
    }

}
function LevelSelector({levels,symbols, callback,stateCallback,obtained}: {levels : levelData[][], symbols : string[][], callback : Function,stateCallback:Function,obtained : Record<string ,boolean>}){
    return <><table style={{position:"absolute", left:0, top:0,width:600,height:600}} ><tbody>
    {function() { 
        var lst = []
        for(var i=0 ; i < 5; i++){
            lst.push(<tr key ={"table row " + i}>
                {
                    function(){
                        var lst2 = [];
                        for(var j=0; j<5; j++){
                            lst2.push(<td onMouseOver={function(this:[number,number]){hover(this, levels, symbols,obtained)}.bind([i,j])}key ={"table row col " + i + " " + j} id={i + " " + j} onClick={(e) => callback((e.target as HTMLElement).getAttribute("id")?.split(" "))}>{i} {j}</td>)
                        }
                        return lst2; 
                    }()
                }
            </tr>)
        }
        return lst;
    }()}

    </tbody></table>
    <canvas style={{position:"absolute", left:700, top:0}} height={600} width={200} id="Canvas"></canvas>
    <br />
    <button style={{position:"absolute", left:700, top:500}}  onClick={() => stateCallback("puzzle")}>Read inscription</button>
    <button style={{position:"absolute", left:700, top:550}}  onClick={() => stateCallback("upgrades")}>Upgrades</button>
    </>
}

export default LevelSelector;