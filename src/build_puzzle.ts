//@ts-ignore
import * as r from "./random.js";
import { puzzleType } from "./typedefs.js";

function step(item : [number, number], move : string) : [number, number]{
    var [x,y] = item;
    if(move == "u"){
        y--;
    }
    if(move == "d"){
        y++;
    }
    if(move == "l"){
        x--;
    }
    if(move == "r"){
        x++;
    }
    return [x,y];
}
function touches(seen : [number, number, string][] , move : string, size1 : number, size2 : number){
    var [x,y] = step(seen[seen.length-1].slice(0,2) as [number, number], move); 

    if(x < 0 || x >= size1 || y < 0 || y >= size2) {
         return true;
    }
    for(var i=0; i < seen.length-1; i++){
        var [exist_x, exist_y]  = seen[i];
        if(Math.abs(x - exist_x  ) + Math.abs(y - exist_y  )  <= 1){
            return true;
        } 
    }
    return false; 
}

function bfs(seen : [number,number,string][], size1 : number, size2 : number, end : [number, number] ) : boolean{
    var frontier : [number, number][] = [];
    var touched : Set<string>= new Set();
    frontier.push([seen[seen.length-1][0],seen[seen.length-1][1]]);
    // make cannot go list
    var cannot_go : Set<string> = new Set();
    for(var i=0; i < seen.length-1; i++){
        for(var d of ["u","d","l","r"]){
            var [badx,bady] = step([seen[i][0], seen[i][1]], d);
            cannot_go.add(badx + " " + bady);
        }
    }
    while(frontier.length != 0){
        var new_frontier : [number, number][] = [];
        for(var point of frontier){
            touched.add(point[0] + " " + point[1]);
            for(var d of ["u","d","l","r"]){
                var [newx, newy] = step(point, d);
                if(newx < 0 || newy < 0 || newx >= size1 || newy >= size2){
                    continue;
                }
                if(touched.has(newx + " " + newy )){
                    continue;
                }
                new_frontier.push([newx, newy]);
                touched.add(newx + " "  + newy)
                if(newx == end[0] && newy == end[1]){
                    return true;
                }
            }
        }
        frontier = new_frontier;
    }
    return false;
}
function generatePath(size1  : number, size2 : number, startPt : [number,number], endPt : [number,number], seed : string) : boolean[][]{
    var seen : [number, number, string][]  = [[startPt[0], startPt[1], ""]];
    var comeFrom : string | undefined = undefined
    var tries = 0; 
    while(seen[seen.length-1][0] !== endPt[0] || seen[seen.length-1][1] !== endPt[1] ){
    /* 
        make a list of valid directions. If not coming from a pop, all valid. Otherwise, only ones after the pop are valid. 
        guess go a direction. 
        if new direction is :
            touches previous ones
            out of bounds
        skip it.
        If no valid new directions, pop seen. 
        step in that direction
        do a bfs to see if still possible.
        If not possible, pop seen. 
    */
        // do bfs
        if(bfs(seen, size1, size2, endPt) == false){
            if(seen.length == 1){
                throw "path not found";
            }
            //@ts-ignore
            comeFrom= seen.pop()[2];
            continue;
            
        }

        var valid_moves : string[] =  tries < 1000 ? ["u","u","d","l","l","r"]: ["u","d","l","r"];;
        if(comeFrom != undefined){
            valid_moves = valid_moves.slice(valid_moves.indexOf(comeFrom) + 1); 
        }
        valid_moves = valid_moves.filter((x) => !touches(seen, x,size1, size2));
        if(valid_moves.length == 0){
            if(seen.length == 1){
                throw "path not found";
            }

            //@ts-ignore
            
            comeFrom= seen.pop()[2];
            continue;
        }
        // choose a move
        var choice = r.choice(valid_moves, seed + " " + tries);
        comeFrom = undefined;
        var [new_x , new_y] = step([seen[seen.length-1][0], seen[seen.length-1][1]] , choice);
        seen.push([new_x, new_y, choice]);
        tries ++; 
        if(tries > 10000){
            throw "can't find a path";
        }
    }
    // has a list now
    var seenString : Set<string> = new Set(seen.map(x => x[0] + " " + x[1]));
    var output : boolean[][] = [];
    for(var i = 0 ; i < size1; i++){
        output.push([]);
        for(var j = 0 ; j < size2; j++){
            if(seenString.has(i + " " + j)){
                output[output.length-1].push(true);
            } else {
                output[output.length-1].push(false);
            }
        }
    }
    console.log(seen);
    return output; 
}


export function generatePuzzle(seed : string) : puzzleType{
    var buttons = r.shuffle("red,yellow,green,blue,white,black".split(","), seed + " colors" );
    console.log(buttons);
    var arithmetic : [number, "+" | "-", number][]= [];
    var tries = 0;
    for(var i=0; i < 7; i++){
        // add an arithmetic problem, numbers go to 12
        var added = false;
        while(added == false){
            tries ++;
            var n1 = r.randint(0, 13,seed + " " + tries )
            var n2 = r.randint(0, 13,seed + "b " + tries )
            var symbol = r.randint(0,2, seed + "c" + tries) == 1 ? "+" : "-";
            if(symbol == "+" && 0 <= n1+n2 && n1+n2 <= 12){
                added = true;
                arithmetic.push([n1, symbol, n2]);
            }
            if(symbol == "-" && 0 <= n1-n2 && n1-n2 <= 12){
                added = true;
                arithmetic.push([n1, symbol, n2]);
            }
        }
    };
    var path  = generatePath(10, 10, [0,0], [9,9], seed + " path ");
    var arrows : [string, number][] =  [];
    for(var i=0; i < 7; i++){
        var amt = r.randint(4,9, seed + " arrows amount " + i);
        var choice = r.choice(["up","down","left","right"], seed + " arrows " + i);
        arrows.push([choice, amt]);

    }
    return {
        buttons: buttons,
        arithmetic : arithmetic,
        path : path,
        arrows : arrows
    }



}