import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import GameDisplay from "./GameDisplay.tsx"
import Symbols from './Symbols.tsx'
import { levelData } from './typedefs'

/*
if(window.set == undefined){
  window.set = 1;
}
function App() {
  if(window.set === 1){
    window.set = 0;
    return 
  }
  if(window.set === 2){
    return; 
  }
  window.set  = 2;
  return (
   <GameDisplay />
  )
}
*/
const fps = 40; 
function App() {  

  var levelData: levelData[] = [{
    "spawners" : [{
        enemy : {type:"charger", speed:Math.floor(100/fps),charge_speed:Math.floor(500/fps), charge_delay:Math.floor(5000/fps), charge_duration:Math.floor(1000/fps), mode:"pursuit", radius:40,x:0, y:0,name:"charger1", image:"images/f/9 7.png",charge_img:"images/f/9 8.png", birthday : 0, img_offset : [-40, -40]},
        interval : Math.floor(2000/fps),
        start_time : Math.floor(5000/fps),
        location : {mode:"random", rect : [200, 200, 600, 600]},
        name:"spawner1",

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
    goal : {mode : "collect fixed items", locations : [[100, 100], [200,200], [300,300]], sequential : true, spawn_delay : 500/fps, img : ["images/f/4 92.png",-40,-40], size:40 },
    door_img : ["images/f/8 42.png", -40, -40]

}]

  const [state, setState] = useState("level");
  switch(state){
    case "level":
      return (
        <GameDisplay  data={levelData} return_fn={() => setState("win")}/>
       )
    case "win":
        return <>You win! <button onClick={() => setState("level")}> Play again </button></>
  }
}

export default App
