import { useRef, useState } from 'react'
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
import BgImg from './BgImg.tsx'
import MuteBtn from "./MuteBtn.tsx";
import Intro from './Intro.tsx'
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
var seed : string   = ""; 
var learned_translations : Record<string, boolean> = {};
var puzzle : puzzleType;

var good_symbols : string []  = [];
var bad_symbols : string[] = [];
var images : string[][] = [];

// upgrades : slow down, speed up, invincibility, extra HP
var upgrades : boolean[] = [false, false, false, false ]
var tokens = 0; 
var index : number = 0;
var token_levels: number[] = []; 

var bgm = new Audio("output.mp3");

function App() {  
  const [state, setState] = useState("seed");
  const [render, reRender] = useState(true);
  const [level, setLevel] = useState<levelData[] | undefined>(undefined);
  const [end_progress, progress_end] = useState(0);

  const muteRef = useRef<typeof MuteBtn>(null);
  //@ts-ignore
  window.toggleMute = function(){
        //@ts-ignore
        window.muted = !window.muted;
        //@ts-ignore
        if(window.muted){
            bgm.pause() ;
        } else {
            bgm.play() 
        }
        //@ts-ignore
        if(window.renderMute !== undefined){
          //@ts-ignore
          window.renderMute();
        }
  }
  //@ts-ignore
  if(window.muted==undefined){
    console.log("listener added");
    document.addEventListener("keydown", (e) => {
      if((e as KeyboardEvent).key.toLowerCase() == "m"){
          //@ts-ignore
          window.toggleMute();
    }
    })
    
    //@ts-ignore
    window.muted = true;   
  }
  
  bgm.loop = true; 
  //@ts-ignore
  if(window.muted == false){
      bgm.play();
  } else {
      bgm.pause();
  }

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
        <>
        <GameDisplay  data={level} return_fn={(result: boolean ) => setState(result ? "win" : "lose")} player={{invincibility:15, speed:10,hp: upgrades[3] ? 50 : 25}}  upgrades={JSON.parse(JSON.stringify(upgrades))}/>
        </>
       )
    case "win":
        for(var word of (symbols as string[][])[index]){
          learned_translations[word ] =true
        }
        var got_token = token_levels.indexOf(index);
        if(got_token !== -1){
          token_levels.splice(got_token, 1);
          tokens ++;
        }
        return <ExploreDone symbols={(symbols as string[][])[index]} token={got_token != -1} ATE={alien_to_english} callback={() => {progress_end(0); setState("select")}}></ExploreDone>

        
    case "lose":
      return <>You lose! <button onClick={() => setState("select")}> Play again </button></>
    case "trueWin":
      return <><BgImg img="images/end.png"/><div style={{position:"absolute", left:281,top:509}}>You escaped... but to where? You don't recognize this place!<br /><button onClick={() => setState("seed")}>Back to main menu</button></div></>
    case "select":
      if(levels == undefined || symbols == undefined){
        throw "Symbol state but undefined level";
      }
      return <>
      <button onClick={() => setState("trueWin")} style={{zIndex:3,position:"absolute"}}>asasda</button>
      <LevelSelector seed={seed} levels={levels}  symbols = {symbols} callback={(e : [string, string]) => startGame(e)} stateCallback={(e : string) => setState(e)} obtained={learned_translations} /></>
    case "seed":
      return <><BgImg img="images/mainMenu.png"/>
      <div style={{position:"absolute", top:200,left:300,color:"white"}}><h1>Alien Planet Decipherment Escape</h1>Press M to mute/unmute<br />Note: it starts out muted, this is not a bug.<br />Enter a seed, or leave blank for random seed<br /><textarea id="seeder"></textarea><br /><button onClick={() => {
        seed = (document.getElementById("seeder") as HTMLTextAreaElement).value;
        if(seed.length == 0){
          seed = r.sha256("" + Math.random()); 
        }
        upgrades = [false, false, false, false ]
        tokens = 0; //debug
        // choose alien words
        learned_translations = {}; 
        var len = WORDS.length;
        var alien_words : string[] = [];
        for(var i=0; i < len; i++){
          while(true){
            var s = "";
            var wordlen = Math.random() < 0.5 ? 2 : 3
            for(var j=0; j < wordlen; j++){
              s += valid_symbols[Math.floor(Math.random() * valid_symbols.length) ]+ "|"
            }
            s = s.slice(0, s.length-1);
            if(alien_words.indexOf(s) == -1){
              break;
            }
          }
          alien_words.push(s);
          console.log(s);
          learned_translations[s] = false;
        }
        // make a level
        [levels,symbols,english_to_alien, alien_to_english, token_levels] = generateGame(seed + "game", WIDTH, HEIGHT, JSON.parse(JSON.stringify(WORDS)), alien_words);

        console.log(token_levels);
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
        setState("intro");
      }}>Start</button><br />
      <button onClick={() => setState("credits")}>Credits</button></div> 
      </>
      case "credits":
        return <><ul>
          <li>Code, art and music : TDGPerson</li>
          <li>Image processing : Paint.net</li>
          <li>Framework : React</li>
          <li>Piano sounds : <a href="https://freesound.org/people/TEDAgame/packs/25405/" target="_blank"> TEDAgame</a></li>
          <li>Made in 3 days for the <a href="https://itch.io/jam/mini-jam-149-ancient" target="_blank">Mini Jam 149: Ancient </a></li></ul><br />
          <button onClick={() => setState("seed")}>Go back</button></>
      case "puzzle":
        if(end_progress == 4){
          setState("trueWin");
          return <></>
        }
        return <SymbolsC ETA={english_to_alien} ATE={alien_to_english} seed={seed} LT={learned_translations} puzzle={puzzle} progress={end_progress} backCallback={() => setState("select")}progress_callback={() => progress_end(end_progress+1)} GS={good_symbols} BS={bad_symbols} IM={images}/>
      case "upgrades":
        return <>
        <BgImg img="images/upgrades.png" />
        <table><tbody><td><h3>Buy upgrades</h3></td><td><button onClick={() => setState("select") }>Go back</button></td><td>You have {tokens} tokens</td></tbody></table>
          {
            function(){
              var lst  =[];
              var upStrings = ["slow time", "speed up", "invincibility", "extra health"];
              var upDesc = ["Press Q to slow down time for a bit", "Press W to give yourself extra speed", "Press E to give yourself temporary invincibility", "50 HP instead of 25"]
              for(var i=0; i < 4; i++){
                lst.push(<><h3>{upStrings[i]}{ tokens == 0 ? <button>Can't afford</button>: upgrades[i] ? <button>Already bought</button> :
                <button onClick={function(this:number){upgrades[this] = true;tokens--; reRender(!render)}.bind(i)}>Buy </button>}</h3>
                <span>{upDesc[i]}</span>
                <br /></>) 
              }
              return lst; 
            }()
          }
        </>
      case "intro":
        if(english_to_alien == undefined){
          throw "no english/alien dictionary "
        }
        //@ts-ignore
        return <Intro words={ puzzle.buttons.map((x) => english_to_alien[x])} callback={() => setState("select")}/>
      default:
        return <>Unknown type {state} </>
  }
}

export default App;
