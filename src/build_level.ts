import { bullet, bullet_fire, enemy, levelData, normal_enemy, spawner } from "./typedefs";
function clone(x : any){
    return JSON.parse(JSON.stringify(x));
}

var b1 : bullet_fire = {
    dir : "towards player",
    speed : 20, 
    img : "images/bullet.png",
    img_offset : [-5,-5],
    delay : 40,
    radius : 5,
    bullet_name : "b1"
}

var brand : bullet_fire = {
    dir : "random",
    speed : 20, 
    img : "images/bullet.png",
    img_offset : [-5,-5],
    delay : 40,
    radius : 5,
    bullet_name : "b1"
}

var bfast : bullet_fire = {
    dir : "random",
    speed : 60, 
    img : "images/bullet.png",
    img_offset : [-5,-5],
    delay : 40,
    radius : 5,
    bullet_name : "b1"
}

var shooter : enemy = {
    type : "normal",
    bullet : b1,
    x: 200,
    y: 400,
    image : "images/turret.png",
    speed : 1,
    radius : -1,
    mode : "pursuit",
    img_offset : [-15,-15],
    birthday:0,
    name:'shooter'
}


var chaser : enemy = {
    type : "charger",
    x: 200,
    y: 200,
    image : "images/chaser.png",
    charge_img : "images/chaser_active.png",
    speed : 1,
    charge_speed:6,
    radius : 15,
    charge_delay:200,
    charge_duration:40,
    mode:"pursuit",
    img_offset : [-15,-15],
    birthday:0,
    name:'chaser'
}


var spawner : spawner = {
    enemy : chaser,
    interval : 150,
    start_time : 200,
    location : {mode : "random",rect :[200, 200, 600, 600]},
    name:"chaser spawner"
}   

var shooter2 = clone(shooter) as normal_enemy; 
shooter2.x = 600

var level : levelData = {
    spawners : [spawner], 
    walls : [[200, 300, 800, 400]],
    enemies : [chaser, shooter , shooter2],
    player_x : 400,
    player_y : 400, 
    goal : {mode : "collect items", img : ["images/coin.png", -15, -15], spawn_delay : 60, spawn_rect :[0, 0, 1000, 580], size : 15, amount : 1},
    door_img : ["images/door.png",-15,-15],
}


var transforming_enemy : enemy = {
    type:"transforming",
    modulus : 400,
    behaviors : [[200, clone(shooter) as enemy], [400, clone(chaser) as enemy]],
    x : 0,
    y : 0,
    birthday : 0,
    name:"shooter and chaser",
    img_offset : [-15,-15],
    image : ""
}

var fire_boom : enemy = {
    type : "fire breath",
    warning_time : 80,
    radius : 30,
    warning_image : "images/fire_warn.png",
    lifespan : 120,
    x:0,
    y:0,
    name:"fire boom",
    birthday : 0,
    img_offset : [-30, -30],
    image : "images/fire_boom.png"
}
var fire_spawner : spawner = {
    enemy : clone(fire_boom),
    interval : 200,
    start_time : 27,
    location : {mode : "random", rect :[0, 0, 1000, 600]},
    name : "fire spawner"
}

var level2 : levelData = {
    spawners : [fire_spawner], 
    walls : [[200, 100, 300, 300]],
    enemies : [transforming_enemy],
    player_x : 400,
    player_y : 400, 
    goal : {mode : "chase orb", time : 100, size : 400, img : ["images/insect.png", -30, -30], speed : 50, waypoints : [[100, 100], [700, 500], [450, 500], [800, 100]]},
    door_img : ["images/door.png",-15,-15],
}



export default [level, level2] 