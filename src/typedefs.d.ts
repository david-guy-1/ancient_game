import { DO_NOT_USE_OR_YOU_WILL_BE_FIRED_EXPERIMENTAL_FORM_ACTIONS, DO_NOT_USE_OR_YOU_WILL_BE_FIRED_EXPERIMENTAL_REACT_NODES } from "react"

type wall = [number, number, number, number]

type bullet = {name:string,
    x:number,
    y:number,
    speed:[number, number],
    radius:number,
    img:string,
    img_offset:[number, number]
}

type bullet_fire = {
    dir : "random" | "towards player", 
    speed : number,
    img : string, 
    img_offset : [number, number], 
    delay : number, 
    radius : number, 
    bullet_name : string}
// random  : current direction, turn speed
// location mover : x and y of target location 
type move_mode = ["random", number, number] | "pursuit" | ["location_mover", number, number]

type base_enemy = {
    name : string
    x : number
    y : number
    image : string 
    birthday : number ,
    img_offset:[number, number]
}
type normal_enemy   = {
    type : "normal",
    bullet : bullet_fire,
    speed :number,
    mode : move_mode,
    radius : number
} & base_enemy

// if t % charge_delay > charge_duration, charge at the player
type charger = {
    type : "charger"
    speed : number,
    charge_speed : number,
    charge_delay : number,
    charge_duration : number, 
    mode : move_mode
    radius : number
    charge_img :  string,
} & base_enemy

type fire_breaths = {
    type : "fire breath"
    warning_time : number,
    radius : number,
    warning_image : string,
    blast_anim : string[]
    lifespan : number,
    box : [number, number, number , number]
} & base_enemy

// wall : tlx, tly, brx, bry (relative to strike location)
type fire_strike = {
    type : "fire strike"
    warning_time : number,
    shape : [number, number,number, number][]
    wall_duration : number,
    warning_image : string,
    blast_anim : string[] 
    lifespan : number
} & base_enemy

type enemy = normal_enemy | charger | fire_breaths | fire_strike

// location rect : tlx, tly, brx, bry
type spawner = {
    enemy : enemy
    interval : number
    start_time : number
    location : [number, number]  | {mode : "random", rect : [number, number,number, number]}
    name : string 

}

type levelData = {
    spawners: spawner[] ,
    walls : wall[], 
    enemies : enemy[],
    player_x : number,
    player_y : number

}