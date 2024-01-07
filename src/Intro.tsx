import { useEffect, useState } from "react";
import BgImg from "./BgImg";
import { draw_markings } from "./draw_symbols";

function Intro({words, callback}: {words  : string[], callback:Function}  ){
    var [type, setType]  = useState(0);

    var images = ["images/intro.png", "images/puzzlebw.png", "images/selection_bg.png"]
    var text = ["You're stuck in some kind of alien labyrinth","You see some symbols that might tell you how to get out. But you don't understand them.", "You see some chambers up ahead. If you explore them you might be able to decipher some of these symbols. "];
    useEffect(function(){
        if(type == 1){
            var ctx = (document.getElementById("Canvas") as HTMLCanvasElement).getContext("2d") as CanvasRenderingContext2D;
            ctx.clearRect(0,0,1000,1000,)

            var i = 0;
            for(var word of words){
                draw_markings(ctx, 50, 50+80*i, word);
                i++;
            }
        }
    })

    return <>
    <BgImg img={images[type]} />
        <span style={{position:"absolute", top:650, left:0, width:1200, height:50, backgroundColor:"white", font:"30px",color:"black"}}>{text[type]}</span>
        <span style={{position:"absolute", top:650, left:1200, width:100, height:50, backgroundColor:"#cccccc", font:"30px"}} onClick={() => {
            if(type == 2) {
                 callback();
            } else {
                setType(type + 1);
            }
        }}>NEXT</span>
        {
            function() { if(type == 1) {
                var colors = "red,yellow,green,blue,white,black".split(",");
                return <><canvas style={{position:"absolute", left:0, top:0}} height={600} width={200} id="Canvas"></canvas>
                {colors.map(function(color){
                    var i  = "red,yellow,green,blue,white,black".split(",").indexOf(color);
                    return <div style={{position:"absolute", top:80*i+50, left:600,backgroundColor:color,width:50, height:50}}> </div>
                })}
                </>
            }}()
        }
        

    </>
}
export default Intro; 