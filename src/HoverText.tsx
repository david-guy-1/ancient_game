import { useRef } from "react";

function HoverText ({x,y,w,h,text,tx,ty} : {x : number,y:number, w:number,h:number,text:string,tx:number,ty:number}){
    const ref  = useRef<HTMLSpanElement>(null);
    function show(){
        if(ref.current){
            ref.current.style.display="inline";
        }
    }
    function hide(){
        if(ref.current){
            ref.current.style.display="none";
        }
    }
    return <><div style={{position:"absolute",top:y,left:x,width:w,height:h}} onMouseOver={show} onMouseOut={hide}> </div>
    <span style={{position:"absolute",top:ty,left:tx,display:"none"}} ref={ref}>{text}</span>
    </>
}
export default HoverText