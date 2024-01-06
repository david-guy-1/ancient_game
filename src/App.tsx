import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import GameDisplay from "./GameDisplay.tsx"
import Symbols from './Symbols.tsx'
import { levelData } from './typedefs'
import generateGame from "./build_level.ts"
import LevelSelector from './LevelSelector.tsx'
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

  
  const [state, setState] = useState("select");
  const [level, setLevel] = useState<levelData[] | undefined>(undefined);
  const [levels, symbols] = generateGame(); 

  function startGame(e: [string, string]){
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
      return <LevelSelector levels={levels}  symbols = {symbols} callback={(e : [string, string]) => startGame(e)} />
  }
}

export default App;
