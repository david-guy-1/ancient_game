//@ts-ignore
import * as c from "./canvasDrawing.js";

// all symbols are 40x40, 
// all shapes are 10x35 or 35x35
// all coordinates are top-left
type direction = "u" | "d" | "r" | "l" | "\\" | "/"
function draw_triangle(ctx : CanvasRenderingContext2D, x : number, y : number, d : direction){
    var coords : Record<direction, [[number, number],[number, number],[number, number]]> = {
        "u":[[ 0, 37],[3, 0],[10, 37]],
        "d":[[ 0, 0],[3,37],[10, 0]],
        "r":[[ 0, 0],[37,3],[0, 10]],
        "l":[[ 37, 0],[0,3],[37, 10]],
        "\\":[[3,0],[37,37],[0,3]],
        "/":[[30,0],[0,37],[37,3]] 
    }
    var lines = coords[d].map(a => [a[0]+x,a[1]+y]);
    c.drawPolygon(ctx, lines.map((x) => x[0]), lines.map((x) => x[1]), "black", 1, true)
}

function draw_rectangle(ctx : CanvasRenderingContext2D, x : number, y : number, d : direction){
    var coords : Record<direction, [[number, number],[number, number],[number, number],[number, number]]> = {
        "u":[[ 0, 0],[0, 37],[6,37], [6,0]],
        "d":[[ 0, 0],[0, 37],[6,37], [6,0]],
        "r":[[ 0, 0],[37,0],[37, 6],[0,6]],
        "l":[[ 0, 0],[37,0],[37, 6],[0,6]],
        "\\":[[ 5, 0],[37,30],[30, 37],[0,5]],
        "/":[[30,0],[37,5],[5,37], [0,30]] 
    }
    var lines = coords[d].map(a => [a[0]+x,a[1]+y]);
    c.drawPolygon(ctx, lines.map((x) => x[0]), lines.map((x) => x[1]), "black", 1, true)
}

// down/right triangle, up/left triangle, rectangle
type orthogonal_choice = "dt" | "ut" | "r" | ""
type diagonal_choice = "t"|"r"|""
type shape = {
    "h" : [orthogonal_choice,orthogonal_choice,orthogonal_choice],
    "v" : [orthogonal_choice,orthogonal_choice,orthogonal_choice],
    "\\" : diagonal_choice,
    "/" : diagonal_choice
}
export function draw(ctx : CanvasRenderingContext2D, shape : shape , xn : number, yn : number ){
    var x = 2 + xn
    var y = 5  + yn
    for(var i=0; i < 3; i++){
        // draw horizontal stuff
        var choice = shape["h"][i];
        if(choice == "dt"){
            draw_triangle(ctx, x, y, "r");
        }
        if(choice == "ut"){
            draw_triangle(ctx, x, y, "l");
        }
        if(choice == "r"){
            draw_rectangle(ctx, x, y, "l");
        }
        y+=10
    }
    x=5+ xn
    y=2 + yn
    for(var i=0; i < 3; i++){
        // draw vertical stuff
        var choice = shape["v"][i];
        if(choice == "dt"){
            draw_triangle(ctx, x, y, "d");
        }
        if(choice == "ut"){
            draw_triangle(ctx, x, y, "u");
        }
        if(choice == "r"){
            draw_rectangle(ctx, x, y, "u");
        }
        x += 10
    }
    if(shape["\\"] == 'r'){
        draw_rectangle(ctx, 2+ xn, 2+ yn, "\\");
    }
    if(shape["\\"] == 't'){
        draw_triangle(ctx, 2+ xn, 2+ yn, "\\");
    }
    if(shape["/"] == 'r'){
        draw_rectangle(ctx, 2+ xn, 2+ yn, "/");
    }
    if(shape["/"] == 't'){
        draw_triangle(ctx, 2+ xn, 2+ yn, "/");
    }
}
export function make_shape(s : string) : shape {
    var lst : any[]=s.split(",");
    if(lst.length !== 8){
        throw "make_shape, wrong length"
    }
    return {"h" : [lst[0], lst[1], lst[2]], "v":[lst[3],lst[4],lst[5]],"\\":lst[6],"/":lst[7]}
}

