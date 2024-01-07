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
import ExploreDone from './ExploreDone.tsx'
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

var good_symbols : string []  = [];
var bad_symbols : string[] = [];
var images : string[][] = [];

var index : number = 0;
function App() {  
  const [state, setState] = useState("seed");
  const [level, setLevel] = useState<levelData[] | undefined>(undefined);
  const [end_progress, progress_end] = useState(0);
  console.log(JSON.stringify(levels));
  function startGame(e: [string, string]){
    if(levels == undefined){
      throw "Start game called with undefined level";
    }
    index = parseInt(e[0])*5 + parseInt(e[1]); 
    setLevel(levels[index]);
    setState("level");
  }
  
  switch(state){
    case "level":
      if(level == undefined){
        throw "Level state but undefined level";
      }
      return (
        <GameDisplay  data={level} return_fn={(result: boolean ) => setState(result ? "win" : "lose")} player={{invincibility:15, speed:10, hp:5}}/>
       )
    case "win":
        for(var word of (symbols as string[][])[index]){
          learned_translations[word ] =true
        }
        //return <ExploreDone symbols={(symbols as string[][])[index]} ATE={alien_to_english} callback={() => setState("select")}></ExploreDone>
        return <ExploreDone symbols={["green","four","star"].map((x) =>english_to_alien == undefined ? "" : english_to_alien[x])} ATE={alien_to_english} callback={() => setState("select")}></ExploreDone>
        
    case "lose":
      return <>You lose! <button onClick={() => setState("select")}> Play again </button></>
    case "trueWin":
      return <>You escaped!</>
    case "select":
      if(levels == undefined || symbols == undefined){
        throw "Symbol state but undefined level";
      }
      return <LevelSelector levels={levels}  symbols = {symbols} callback={(e : [string, string]) => startGame(e)} readCallback={() => setState("puzzle")} obtained={learned_translations} />
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
          learned_translations[s] = true;
          console.log(s);
        }
        // make a level
        [levels,symbols,english_to_alien, alien_to_english] = generateGame(seed + "game", WIDTH, HEIGHT, JSON.parse(JSON.stringify(WORDS)), alien_words);
        // get final puzzle here
        puzzle = generatePuzzle(seed + " puzzle");
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
        setState("select");
      }}>Start</button></>
      case "puzzle":
        if(end_progress == 4){
          setState("trueWin");
          return <></>
        }
        return <SymbolsC ETA={english_to_alien} ATE={alien_to_english} seed={seed} LT={learned_translations} puzzle={puzzle} progress={end_progress} backCallback={() => setState("select")}progress_callback={() => progress_end(end_progress+1)} GS={good_symbols} BS={bad_symbols} IM={images}/>
  }
}

export default App;
