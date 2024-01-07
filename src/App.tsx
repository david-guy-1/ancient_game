import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import GameDisplay from "./GameDisplay.tsx"
import valid_symbols from "./symbols.json";
import { levelData, puzzleType } from './typedefs'
import generateGame from "./build_level.ts"
import LevelSelector from './LevelSelector.tsx'
//@ts-ignore
import * as r from "./random.js";
import {WIDTH, HEIGHT, FPS, WORDS} from "./constants.ts";
import { generatePuzzle } from './build_puzzle.ts'
import SymbolsC from './SymbolsC.tsx'
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
var english_to_alien : Record<string, string> | undefined = undefined; 
var alien_to_english : Record<string, string> | undefined = undefined; 
var seed : string | undefined  = undefined; 
var learned_translations : Record<string, boolean> = {};
var puzzle : puzzleType;
var end_progress = 0; 
var good_symbols : string []  = [];
var bad_symbols : string[] = [];
var images : string[][] = [];
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
        <GameDisplay  data={level} return_fn={(result: boolean ) => setState(result ? "win" : "lose")} player={{invincibility:999999999, speed:10, hp:5}}/>
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
        // choose alien words
        learned_translations = {}; 
        var len = WORDS.length;
        var alien_words : string[] = [];
        for(var i=0; i < len; i++){
          while(true){
            var s = "";
            var wordlen = Math.random() < 0.5 ? 2 : 3
            for(var j=0; j < wordlen; j++){
              s += valid_symbols[Math.floor(Math.random() * len) ]+ "|"
            }
            s = s.slice(0, s.length-1);
            if(alien_words.indexOf(s) == -1){
              break;
            }
          }
          alien_words.push(s);
          learned_translations[s] = Math.random() < 0.5 // DEBUG;
          console.log(s);
        }
        end_progress = 3;
        // make a level
        [levels,symbols,english_to_alien, alien_to_english] = generateGame(seed + "game", WIDTH, HEIGHT, JSON.parse(JSON.stringify(WORDS)), alien_words);
        // get final puzzle here
        //puzzle = generatePuzzle(seed + " puzzle");
        // DEBUG
        puzzle={"buttons":["red","yellow","green","blue","white","black"],"arithmetic":[[4,"-",3],[8,"+",1],[6,"-",0],[2,"+",10],[7,"+",0],[0,"+",7],[5,"-",4]],"path":[[true,true,false,false,false,false,false,false,false,false],[false,true,false,false,false,false,false,false,false,false],[false,true,false,true,true,true,false,false,false,false],[true,true,false,true,false,true,false,false,false,false],[true,false,true,true,false,true,true,false,false,false],[true,false,true,false,false,false,true,false,false,false],[true,false,true,false,false,false,true,false,false,false],[true,true,true,false,false,false,true,true,true,true],[false,false,false,false,false,false,false,false,false,true],[false,false,false,false,false,false,false,false,false,true]],"arrows":[["down",7],["left",7],["left",6],["up",4],["left",7],["left",4],["up",6]]}

        
        var words = r.shuffle("leaf,star,wand,book,flower,circle,ring,gem".split(","),seed + " words ");
        good_symbols = words.slice(0, 4);
        bad_symbols = words.slice(4);
        images = [];
        for(var i = 0; i < 10; i ++){
          images.push([]);
          for(var j=0; j<10; j++){
            var good = puzzle.path[i][j];
            if(good){
              var image_string = "final_images/" +r.choice(good_symbols, seed + " symbol " +i + " " + j  ) + ".png"
            } else {
              var image_string = "final_images/" +r.choice(bad_symbols, seed + " symbol " +i + " " + j  ) + ".png"
            }
            images[images.length-1].push(image_string);
          }
        }
        //
        setState("puzzle");
      }}>Start</button></>
      case "puzzle":
        return <SymbolsC ETA={english_to_alien} ATE={alien_to_english} seed={seed} LT={learned_translations} puzzle={puzzle} progress={end_progress} progress_callback={() => end_progress++} GS={good_symbols} BS={bad_symbols} IM={images}/>
  }
}

export default App;
