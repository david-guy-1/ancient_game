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
    dir : "random" | "towards player" | ["fixed",number,number] | ["burst", number] | ["player angle", number] 
    speed : number,
    img : string, 
    img_offset : [number, number], 
    delay : number, 
    radius : number, 
    bullet_name : string,
    start_at ?: number
}
// random  : current direction, turn speed
// location mover : x and y of target location 
type move_mode = ["random", number | "random", number] | "pursuit" | ["location_mover", number, number]

type base_enemy = {
    name : string
    x : number
    y : number
    image : string 
    birthday : number ,
    img_offset:[number, number],
    lifespan ?: number,
    spawn_on_death ?: enemy[]
}
type normal_enemy   = {
    type : "normal",
    bullet ?: bullet_fire,
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
    start_at ?: number
} & base_enemy

// for these two : spawned as soon as warning shows . 
// does no damage until time - birthday > warning time
// then, switch to damaging + img
type fire_breaths = {
    type : "fire breath"
    warning_time : number,
    radius : number,
    warning_image : string,
    lifespan : number,
} & base_enemy

// wall : tlx, tly, brx, bry (relative to strike location)
type fire_strike = {
    type : "fire strike"
    warning_time : number,
    shape : [number, number,number, number][]
    wall_duration : number,
    warning_image : string,
    lifespan : number
    radius : number
} & base_enemy

// enemy is certain things depending on time. 
// if behaviours is [t1, x1], [t2, x2], [t3, x3], ...
// behaviour with t <= t1 is x1, t1 < t <= t2 is x2, and so on. 
type transforming_enemy =  {
    type : "transforming"; 
    modulus : number
    behaviors : [number, enemy][]
} & base_enemy 

type enemy = normal_enemy | charger | fire_breaths | fire_strike | transforming_enemy

// location rect : tlx, tly, brx, bry
type spawner = {
    enemy : enemy
    interval : number
    start_time : number
    location : [number, number]  | {mode : "random", rect : [number, number,number, number]} | "random edge"
    name : string 
    end_time ?: number

}

type goalSurvive = {mode : "survive" , time : number} 
// numbers are offsets 
type goalChase = {
    mode : "chase orb", 
    size : number, 
    img : [string, number, number], 
    time : number,
    waypoints : [number , number][]
    speed : number
} 
type goalCollect  = {
    mode : "collect items",
    amount : number,
    img : [string, number, number],
    spawn_delay : number,
    spawn_rect : [number,number,number,number]
    size : number
}
type goalCollectF = {
    mode : "collect fixed items",
    locations : [number, number][],
    sequential : boolean,
    spawn_delay : number, 
    img : [string, number, number], 
    collected_img ?: [string, number, number]
    size : number
}
type goalHit = {
    mode : "hit dummy" , 
    img : [string, number, number],
    x : number,
    y : number, 
    amount : number,
    size : number
}

type goal = goalSurvive | goalCollect | goalChase | goalCollectF | goalHit

type goalPSurvive= {mode : "survive" }
type goalPChase = {mode : "chase orb", x : number, y : number, time : number, waypoint : number}
type goalPCollect = {mode : "collect items" , spawn_time : number, x : number, y : number, count : number}
type goalPCollectF = {mode : "collect fixed items" , collected : boolean[], spawn_time : number}
type goalPHit = {mode : "hit dummy" , x : number, y : number, count : number}

type goal_progress =goalPSurvive|goalPChase|goalPCollect|goalPCollectF|goalPHit


type levelData = {
    spawners: spawner[] ,
    walls : wall[], 
    enemies : enemy[],
    player_x : number,
    player_y : number
    goal : goal,
    door_img : [string, number, number],
}

type tickOutput = {
    bullets : bullet[],
    enemies : enemy[],
    spawners : spawner[],
    walls : [wall, number][]
    win : boolean;
}

type player= {
    invincibility : number,
    speed : number,
    hp : number
}

type puzzleType = {
    buttons : string[]
    arithmetic : [number, "+"|"-" , number][]
    path : boolean[][]
    arrows : [string,number][]
}