import { bullet, bullet_fire, enemy, fire_breaths, levelData, normal_enemy, spawner } from "./typedefs";
function clone(x : any){
    return JSON.parse(JSON.stringify(x));
}

/*

x:0,
y:0,
birthday:0,
name: "",
image : "images/",
img_offset : [-15, -15]

*/

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
    speed : 0,
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
    name:"shooter and chaser",
    x : 0,
    y : 0,
    birthday : 0,
    img_offset : [0,0],
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

var random_pursue_enemy : enemy  = {
    type:"transforming",
    modulus:60,
    behaviors : [[30, {
        type : "normal",
        x:0,
        y:0,
        birthday:0,
        name: "",
        image : "images/blob.png",
        img_offset : [-15, -15], 
        mode:["random", 0, 1], 
        speed : 5, 
        radius : 15
    }],
    [60, {
        type : "normal",
        x:0,
        y:0,
        birthday:0,
        name: "",
        image : "images/blob.png",
        img_offset : [-15, -15], 
        mode:"pursuit", 
        speed : 7, 
        radius : 15
    }]
     ], 
    name:"random pursue",
    x:0,
    y:0,
    birthday:0,
    image : "images/",
    img_offset : [-15, -15]
}
var random_pursue_enemy_left = clone(random_pursue_enemy);
random_pursue_enemy_left.behaviors[0][1].mode[1] = Math.PI;

var random_pursue_spawner  : spawner = {
    enemy : random_pursue_enemy,
    interval : 60,
    start_time : 0,
    location : {mode : "random", rect : [100, 100, 150, 600]},
    name : "rp spawner"
}
var random_pursue_spawner_2 : spawner = clone(random_pursue_spawner) as spawner

random_pursue_spawner_2.location = {mode : "random", rect : [700, 100, 750, 600]}
random_pursue_spawner_2.start_time = 30;
random_pursue_spawner_2.enemy = random_pursue_enemy_left;

var random_pursue_level : levelData = {
    goal : {mode:"survive", time : 400},
    walls : [],
    enemies : [],
    spawners : [random_pursue_spawner, random_pursue_spawner_2],
    player_x : 400,
    player_y :400, 
    door_img : ["images/door.png",-15,-15]
}

var fast_fire_spawner = clone(fire_spawner) as spawner;
fast_fire_spawner.interval = 40;
fast_fire_spawner.enemy = clone(fast_fire_spawner.enemy) as fire_breaths ;
fast_fire_spawner.enemy.radius = 120; 
fast_fire_spawner.enemy.image = "images/big_fire.png";
fast_fire_spawner.enemy.img_offset = [-120, -120];


var raining_fire_level : levelData = { 
    goal : {mode : "collect items", amount : 10, img : ["images/coin.png", -15, -15], spawn_delay : 0, spawn_rect : [0,0,600,600], size:15 },
    spawners : [fast_fire_spawner],
    walls : [],
    "enemies" : [],
    player_x : 400,
    player_y :400, 
    door_img : ["images/door.png",-15,-15]    
}
var lst : enemy[] = []

for(var i=0 ; i < 4; i ++){
    var e = clone(shooter) as normal_enemy;
    (e.bullet as bullet_fire).dir = "random";
    e.x =  i % 2==0 ? 200 : 600;
    e.y =  i < 2 ? 200 : 500;
    lst.push(e);
}

e = clone(shooter) as normal_enemy;
e.x = 400; e.y = 300;
(e.bullet as bullet_fire).delay = 40
lst.push(e);
lst.push(clone(chaser));
lst.push(clone(chaser));
lst[lst.length-1].x = 600;
var shooter_level : levelData = {
    goal : {mode : "hit dummy", amount : 20,img : ["images/dummy.png", -20, -20], x:200, y:400 , size:20},
    enemies : lst,
    walls : [],
    spawners : [],
    player_x : 400,
    player_y :400, 
    door_img : ["images/door.png",-15,-15]    

}


function generateGame(seed ?: string ): [levelData[][], string[][], Record<string, string> ]{
    var lst = [];
    var strings = []
    for(var i = 0 ; i < 25; i ++){
        lst.push([clone(raining_fire_level), clone(random_pursue_level)]);
        strings.push(["abcd", "efgh"]);
    } 
    return [lst, strings, {"abc" : "abc" , "def":"def"}];
}

export default generateGame

