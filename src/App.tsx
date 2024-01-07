import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import GameDisplay from "./GameDisplay.tsx"
import Symbols from './Symbols.tsx'
import { levelData } from './typedefs'
import generateGame from "./build_level.ts"
import LevelSelector from './LevelSelector.tsx'

import {WIDTH, HEIGHT, FPS} from "./constants.ts";
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
var levels : levelData[][] | undefined = undefined;
var symbols : string[][] | undefined = undefined; 
var translations : Record<string, string> | undefined = undefined; 
var seed : string | undefined  = undefined; 
function App() {  

  const [state, setState] = useState("seed");
  const [level, setLevel] = useState<levelData[] | undefined>(undefined);
  console.log(JSON.stringify(levels));
  function startGame(e: [string, string]){
    if(levels == undefined){
      throw "Start game called with undefined level";
    }
    var index = parseInt(e[0])*5 + parseInt(e[1]); 
    setLevel(levels[index]);
    setState("level");
  }
  
  switch(state){
    case "level":
      if(level == undefined){
        throw "Level state but undefined level";
      }
      return (
        <GameDisplay  data={level} return_fn={(result: boolean ) => setState(result ? "win" : "lose")} player={{invincibility:20, speed:10, hp:5}}/>
       )
    case "win":
        return <>You win! <button onClick={() => setState("level")}> Play again </button></>
    case "lose":
      return <>You lose! <button onClick={() => setState("level")}> Play again </button></>
    case "select":
      if(levels == undefined || symbols == undefined){
        throw "Level/symbol state but undefined level";
      }
      return <LevelSelector levels={levels}  symbols = {symbols} callback={(e : [string, string]) => startGame(e)} />
    case "seed":
      return <>Enter a seed, or leave blank for random seed<br /><textarea id="seeder"></textarea><br /><button onClick={() => {
        seed = (document.getElementById("seeder") as HTMLTextAreaElement).value;
        [levels,symbols,translations] = generateGame(seed, WIDTH, HEIGHT);
        setState("select");
      }}>Start</button></>
  }
}

export default App;
