import { useState } from "react";

 function MuteBtn(){
    
    const [render, reRender] = useState(true);
    console.log("rendering");
    //@ts-ignore
    window.renderMute = () => {reRender(!render)};
    //@ts-ignore
    return<img style={{position:"absolute", top:0,left:1270 }} src={window.muted || window.muted == undefined ? "images/mute.png" : "images/unmute.png"} onClick={() => window.toggleMute()} />
}

export default MuteBtn