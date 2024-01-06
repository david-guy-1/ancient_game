import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import GameDisplay from "./GameDisplay.tsx"
import Symbols from './Symbols.tsx'
import { levelData } from './typedefs'
import level from "./build_level.ts"
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

  var levelData: levelData[] = level;

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
