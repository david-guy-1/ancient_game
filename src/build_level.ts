import { bullet, bullet_fire, charger, enemy, fire_breaths, goal, levelData, normal_enemy, spawner, transforming_enemy } from "./typedefs";
//@ts-ignore
import * as r from "./random.js";
import _, { shuffle } from "lodash";





function clone(x : any){
    return JSON.parse(JSON.stringify(x));
}

type  goal_type = "survive"|"chase orb"|"collect items"|"collect fixed items"|"hit dummy";

const standard_goals : Record<goal_type, goal>= {
    "survive" : {mode : "survive", time : 0},
    "chase orb" : {mode:"chase orb", size:20, img:["images/insect.png", -10, -10] , time:200, waypoints : [[100,100], [100, 600], [600, 600], [600, 100]], speed:50},
    "collect items" : {mode:"collect items", amount:10, img:["images/coin.png", -10, -10], spawn_delay:10, spawn_rect:[0,0,600,600], size:20},
    "collect fixed items" : {mode:"collect fixed items", locations:[], sequential:false, spawn_delay:0, img:["images/coin.png",-10,-10] , collected_img:["images/coin2.png", -10, -10], size:20},
    "hit dummy" : {mode:"hit dummy", img:["images/dummy.png", -20, -20], x:400, y:400, amount:10, size:20}
}


/*
// enemy boilerplate

x:0,
y:0,
birthday:0,
name: "",
image : "images/",
img_offset : [-15, -15]

*/

// --BULLETS 

// speed < 1.5 * radius please

var b1 : bullet_fire = {
    dir : ["player angle", 0],
    speed : 10, 
    img : "images/bullet.png",
    img_offset : [-5,-5],
    delay : 40,
    radius : 25,
    bullet_name : "b1"
}


// -- ENEMIES

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

var b1_burst = clone(b1);
b1_burst.dir = ["burst", 12];
b1_burst.delay = 1;

var stationary : enemy = {
    type : "normal",
    x:0,
    y:0,
    birthday:0,
    name: "",
    image : "BAD_IMAGE", 
    img_offset : [-15, -15],  
    speed : 0,
    mode : "pursuit",
    radius : -1
}

var boom : enemy = {
    type : "normal",
    bullet :b1_burst,
    x:0,
    y:0,
    birthday:0,
    name: "",
    image : "BAD_IMAGE", 
    img_offset : [-15, -15],
    lifespan:1 ,  
    speed : 0,
    mode : "pursuit",
    radius : -1
}

var burst_turret : enemy = clone(stationary) as normal_enemy;
burst_turret.bullet = clone(b1_burst);

var move_towards : enemy = clone(stationary) as normal_enemy;
move_towards.speed = 7;
move_towards.radius  = 20;

var shooter2 = clone(shooter) as normal_enemy; 
shooter2.x = 600


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


var random_pursue_enemy : enemy  = {
    type:"transforming",
    modulus:63,
    behaviors : [[29, {
        type : "normal",
        x:0,
        y:0,
        birthday:0,
        name: "",
        image : "images/blob.png",
        img_offset : [-15, -15], 
        mode:["random", "random", 1], 
        speed : 5, 
        radius : 15
    }],
    [63, {
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
    image : "", // again image is irrelevant for transforming
    img_offset : [-15, -15]
}
var random_pursue_enemy_left = clone(random_pursue_enemy);
random_pursue_enemy_left.behaviors[0][1].mode[1] = Math.PI;



function exploder_enemy(lifespan : number, bullets : number, warning ?: number ) : transforming_enemy {
    var e = {
        x:0,
        y:0,
        birthday:0,
        name: "",
        image : "", // image is irrelevant for transforming
        img_offset : [-15, -15],
        type:"transforming",
        modulus : lifespan+1,
        lifespan : lifespan,
        behaviors : [[lifespan-1, clone(stationary) as normal_enemy],
        [lifespan, clone(boom) as normal_enemy]]
    } as transforming_enemy;
    if(warning){
        var lst =  [[warning, clone(stationary) as enemy]] as [number, enemy][]
        lst = lst.concat(e.behaviors);
        e.behaviors = lst;
    }
    //@ts-ignore
    e.behaviors[e.behaviors.length-1][1].bullet.dir[1] = bullets
    return e;
};

var burster_enemy = exploder_enemy(102, 12, 73) as transforming_enemy;

burster_enemy.behaviors[0][1].image = "images/bomb.png";
burster_enemy.behaviors[1][1].image = "images/bomb2.png";
burster_enemy.behaviors[2][1].image = "images/bomb2.png";

var cloning_enemy : enemy = clone(move_towards);
cloning_enemy.spawn_on_death = [clone(random_pursue_enemy), clone(shooter)]
cloning_enemy.lifespan = 60; 

console.log(cloning_enemy)
// --SPAWNERS
var spawner : spawner = {
    enemy : chaser,
    interval : 150,
    start_time : 200,
    location : {mode : "random",rect :[200, 200, 600, 600]},
    name:"chaser spawner"
}   

var shooter_spawner : spawner = {
    enemy : clone(shooter),
    interval : 150,
    start_time : 1,
    location : {mode : "random",rect :[200, 200, 600, 600]},
    name:"chaser spawner"
}   ;

((shooter_spawner.enemy as normal_enemy).bullet as bullet_fire).delay = 32;

var burster_spawner : spawner = clone(shooter_spawner);
burster_spawner.enemy = clone(burst_turret);


var fire_spawner : spawner = {
    enemy : clone(fire_boom),
    interval : 200,
    start_time : 27,
    location : {mode : "random", rect :[0, 0, 1000, 600]},
    name : "fire spawner"
}

var random_pursue_spawner  : spawner = {
    enemy : random_pursue_enemy,
    interval : 51,
    start_time : 0,
    location : {mode : "random", rect : [100, 100, 150, 600]},
    name : "rp spawner"
}
var random_pursue_spawner_2 : spawner = clone(random_pursue_spawner) as spawner

random_pursue_spawner_2.location = {mode : "random", rect : [700, 100, 750, 600]}
random_pursue_spawner_2.start_time = 28;
random_pursue_spawner_2.enemy = random_pursue_enemy_left;



var fast_fire_spawner = clone(fire_spawner) as spawner;
fast_fire_spawner.interval = 32;
fast_fire_spawner.start_time = 1;
fast_fire_spawner.enemy = clone(fast_fire_spawner.enemy) as fire_breaths ;
fast_fire_spawner.enemy.radius = 120; 
fast_fire_spawner.enemy.image = "images/big_fire.png";
fast_fire_spawner.enemy.img_offset = [-60, -60];

console.log(burster_enemy);
console.log(fast_fire_spawner);

var bomb_spawner : spawner = {
    enemy: burster_enemy,
    interval: 57,
    start_time: 11,
    location: [100, 100],
    name: ""
}

var exploder_enemy_move = clone(exploder_enemy(100, 21)) as transforming_enemy
var move_towards_2 = clone(move_towards) as normal_enemy;
move_towards_2.speed = 3;
exploder_enemy_move.behaviors[0][1] = move_towards_2; 

var bomb_layer : spawner = {
    enemy : exploder_enemy_move,
    interval : 40,
    start_time : 0,
    end_time: 170,
    location : [100, 100],
    name:""

}

// --LEVELS


var basic_level : levelData = {
    goal : {mode:"survive", time : 1},
    walls : [],
    enemies : [],
    spawners : [],
    player_x : 400,
    player_y :400, 
    door_img : ["images/door.png",-15,-15],
}


var chaser2 = clone(chaser) as normal_enemy;
chaser2.x = 600;

var spawners = []
for(var i=0; i < 4; i++){
    spawner = clone(bomb_spawner);
    spawner.interval = 260;
    spawner.start_time = 11+ 60*i;
    spawner.location = [i%2 == 0 ? 100 : 900, i < 2 ? 100 : 500]
    spawners.push(spawner);
}
spawners.push(fire_spawner)
var chase_orb_level : levelData = {
    spawners : spawners, 
    walls : [],
    enemies : [chaser,chaser2],
    player_x : 400,
    player_y : 400, 
    goal : {mode : "chase orb", time : 100, size : 100, img : ["images/insect.png", -30, -30], speed : 10, waypoints : [[100, 100], [700, 500], [450, 500], [800, 100]]},
    door_img : ["images/door.png",-15,-15],
}


var random_pursue_level : levelData = {
    goal : {mode:"survive", time : 400},
    walls : [],
    enemies : [],
    spawners : [random_pursue_spawner, random_pursue_spawner_2],
    player_x : 400,
    player_y :400, 
    door_img : ["images/door.png",-15,-15],
}


var raining_fire_level : levelData = { 
    goal : {mode : "collect items", amount : 10, img : ["images/coin.png", -15, -15], spawn_delay : 0, spawn_rect : [0,0,600,600], size:15 },
    spawners : [fast_fire_spawner],
    walls : [],
    "enemies" : [],
    player_x : 400,
    player_y :400, 
    door_img : ["images/door.png",-15,-15]  ,
}

var bomb_level : levelData = clone(basic_level);
bomb_level.spawners = [];
for(var i=0 ; i < 4; i ++){
    var item =clone(bomb_layer) as spawner;
    item.location = [ i%2 == 0 ? 100 : 700, i<2 ? 100 : 500]
    item.interval = 160
    item.start_time = 40*i
    bomb_level.spawners.push(item);
}


var lst : enemy[] = []
for(var i=0 ; i < 4; i ++){
    var e = clone(shooter) as normal_enemy;
    (e.bullet as bullet_fire).dir = "random";
    e.x =  i % 2==0 ? 200 : 600;
    e.y =  i < 2 ? 200 : 500;
    (e.bullet as bullet_fire).start_at = 10*i; 
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
    goal : {mode : "hit dummy", amount : 8,img : ["images/dummy.png", -20, -20], x:200, y:400 , size:20},
    enemies : lst,
    walls : [],
    spawners : [],
    player_x : 400,
    player_y :400, 
    door_img : ["images/door.png",-15,-15]  ,

}
console.log(cloning_enemy);
var clone_levels = clone(basic_level) as levelData;
for(var i=0; i< 4; i++){
    var e = clone(cloning_enemy) as normal_enemy;
    e.x = i%2 == 0 ? 700 : 100;
    e.y = i<2 ? 400 : 100;
    e.speed = 3;

    ((e.spawn_on_death as normal_enemy[])[1].bullet as bullet_fire).start_at = i * 10;
    ((e.spawn_on_death as normal_enemy[])[1].bullet as bullet_fire).dir = ["player angle", Math.random() * 1 - 0.5];

    clone_levels.enemies.push(e);
}
clone_levels.enemies.push(); 

var levels = [raining_fire_level, random_pursue_level, shooter_level,chase_orb_level, clone_levels ]

var [c,s,p] = [clone(chaser), clone(shooter), clone(random_pursue_enemy)]

console.log([c,s,p])
function generateLevel(seed : string, diff : number, width : number = 700, height : number = 600): levelData{
    
    var types = ["survive","chase orb","collect fixed items","hit dummy"] 
    if(diff>= 4){
        types.push("collect items");
    }

    var type= r.choice(types , seed + "goal type") as goal_type
    //var type = r.choice( ["collect fixed items"], seed + "goal type") as goal_type
    var goal : goal = clone(standard_goals[type]) as goal;

    // adjust goal based on difficulty

    var movement_patterns = {
        "rectangular":[[50, 50], [50, height-50], [width-50, height-50], [width-50, 50]],
        "hourglass" : [[50, 50], [width-50, height-50],[50, height-50], [width-50, 50]],
        "zigzag" : [[50, 50], [width/3, height-50],[width/3, 50], [2*width/3, height-50],[2* width/3, 50],[width-50, height-50], [50, height-50], [2*width/3, height-50], [2*width/3, 50], [width/3, height-50], [width/3, 50], [50, height-50], [50, 50]]
    }
    switch(goal.mode){
        case "chase orb":
            goal.speed = 6 + 2*diff;
            goal.size = 300 - 20*diff;
            goal.time = 200 + 40*diff; 
            var choice = r.choice(["rectangular", "hourglass", "zigzag","random"], seed + "goal") as "rectangular"|"hourglass"| "zigzag"|"random";
            if(choice == "random"){
                for(var i=0; i<10; i++){
                    var x = r.randint(50, width-50, seed + "orb choice x " + i);
                    var y = r.randint(50, height-50, seed + "orb choice y " + i);
                    goal.waypoints.push([x,y]);
                }
            } else{
                //@ts-ignore
                goal.waypoints = movement_patterns[choice];
            }
        break;
        case "collect fixed items":
            if(diff >= 4){
                goal.sequential = r.randint(0, 2, seed + " fixed seq") == 1;
            } else {
                goal.sequential = false;
            }
            goal.collected_img=undefined;
            var nItems : number = r.randint(5 + diff, 8+diff, seed + " fixed nItems")
            var edge : boolean  = r.randint(0, 2, seed + " near edge") == 1;
            var tries = 0;
            for(var i=0; i<nItems; i++){
                var x= r.randint(50, width-50, seed + " placing fixed item x" + i + " " + tries);
                var y= r.randint(50, height-50, seed + " placing fixed item y" + i+ " " + tries);
                if(edge){
                    var pass = (Math.abs(x) < 100 || Math.abs(x - width) < 100) ||  (Math.abs(y) < 100 || Math.abs(y - height) < 100) 
                    if(!pass){
                        i--;
                        tries++;
                    } else {
                        goal.locations.push([x,y]);
                    }
                } else {
                    goal.locations.push([x,y]);
                } 
            }
            goal.spawn_delay = r.randint(3 + diff, 10, seed + " spawn delay ");
        break;
        case "collect items":
            goal.spawn_rect = [50, 50, width-50, height-50]; 
            goal.amount = 5  + diff;
            goal.spawn_delay = r.randint(3 + diff, 10, seed + " spawn delay ");
        break;
        case "hit dummy":
            goal.x = r.randint(50, width-50, seed + "dummy location x");
            goal.y = r.randint(50, height-50, seed + "dummy location y");
        break;
        case "survive":
            goal.time = 200 + 40*diff;
    }
    var level = clone(basic_level) as levelData;
    level.goal = goal;
    if(level.goal.mode=="hit dummy"){
        var newsp = clone(shooter_spawner) as spawner;
        newsp.interval = 400;
        newsp.location = {"mode":"random", 'rect':[0, 0, width, height]};
        level.spawners.push(newsp)
    }
    // decide enemies and spawners
    var items : string[] = ["raining fire","egg layer","burster spawner","bomb spawner", "chaser","shooter","pursue spawner" ];
    var added : string[] = [];
    var i=0;
    while(i < diff){
        var choiceOf : string  = ""
        try{
            choiceOf= r.choice(_.difference(items, added) , seed  + " choose enemy " + i );
        }
        catch(e){
            if(e == "choice from empty list"){
                console.log("debug")
                break;

            }
        }
        added.push(choiceOf);
        switch(choiceOf){
            case "egg layer":
                var spawner =  clone(shooter_spawner) as spawner;
                var egg = clone(stationary) as normal_enemy;
                egg.speed= 9 + diff;
                spawner.towards = "player"
                egg.image = "images/egg.png";
                egg.lifespan = 40;
                egg.img_offset = [-20, -20];
                egg.radius = -1;
                var [c,s1,s2,p] = [clone(chaser), clone(shooter),clone(shooter), clone(random_pursue_enemy)]
                s1.bullet.dir[1] = 0.1;
                s1.bullet.delay = 46-2*diff;
                s2.bullet.delay = 46-2*diff;
                s2.bullet.dir[1] = -0.1;
                p.image = "blob.png";
                egg.spawn_on_death = [c,s1,s2,p]
                spawner.enemy = egg;
                spawner.interval = 180 - 6*diff;
                spawner.location = "random edge";
                level.spawners.push(spawner)
            break;
            case "burster spawner":
                var spawner =  clone(burster_spawner) as spawner;
                
                spawner.enemy.image = "images/burst_turret.png";
                (spawner.enemy as normal_enemy).speed = 6 + 0.2*diff;
                (spawner.enemy as normal_enemy).bullet?.dir[1] == 12 + 2*diff; 
                ((spawner.enemy as normal_enemy).bullet as bullet_fire).delay  = 74 - diff;
                spawner.enemy.lifespan = 150
                spawner.interval = 187 - 5*diff;
                spawner.towards = "center";
                level.spawners.push(spawner);
                if(diff > 3){
                    var e = clone(random_pursue_enemy);
                    e.image = "blob.png";
                    spawner.enemy.spawn_on_death = [e];
                }
                spawner.location = "random edge";
            break;
            case "bomb spawner":
                var spawner = clone(bomb_spawner) as spawner;
                (((spawner.enemy as transforming_enemy).behaviors[2][1] as normal_enemy).bullet as bullet_fire).dir = ["burst", 5 + 2*diff];
                (((spawner.enemy as transforming_enemy).behaviors[2][1] as normal_enemy).bullet as bullet_fire).speed = 8 + 0.2*diff;
                spawner.interval = 57 - 3*diff;
                spawner.location = {"mode":"random", "rect":[50, 50, width-50, height-50]};
                level.spawners.push(spawner);
            break;
            case "chaser":
                for(var j = 0 ; j < Math.floor(10+ diff); j++){
                    var enemyc = clone(chaser) as charger;
                    enemyc.charge_delay = 120 - 5*diff;
                    enemyc.charge_duration = 40 + 3*diff;
                    enemyc.speed = 1 + 0.2*diff; 
                    enemyc.charge_speed = 6 + 0.3 * diff;
                    enemyc.x = r.randint(50, width-50, seed + "charger location x " + i+ " " + j);
                    enemyc.y = r.randint(50, height-50, seed + "charger location y" + i + " " + j);
                    enemyc.start_at = Math.random() * 200;
                    level.enemies.push(enemyc)
                }
            break;
            case "shooter":
                for(var j = 0 ; j < Math.floor(5 + diff); j++){
                    var enemys = clone(shooter) as normal_enemy;
                    if(enemys.bullet == undefined){
                        throw "Cloned shooter does not have bullet";
                    }
                    enemys.bullet.dir = ["player angle", Math.random() * 1 - 0.5]; 
                    enemys.bullet.delay = 80 - diff;
                    enemys.bullet.speed = 10 + 0.4*diff;
                    enemys.x = r.randint(50, width-50, seed + "shooter location x " + i + " " + j);
                    enemys.y = r.randint(50, height-50, seed + "shooter location y" + i + " " + j);
                    enemys.bullet.start_at = Math.floor(Math.random() * 40) - enemys.bullet.delay;
                    level.enemies.push(enemys)
                }
            break;
            case "raining fire":
                var spawner = clone(fast_fire_spawner) as spawner; 
                spawner.location = {"mode":"random", "rect":[50, 50, width-50, height-50]};
                spawner.interval = 80-2*diff;
                (spawner.enemy as fire_breaths).warning_time = 83 + diff;
                spawner.enemy.img_offset = [-120, -120];
                console.log(spawner);
                level.spawners.push(spawner);
            break;
            case "pursue spawner":
                var spawner = clone(random_pursue_spawner) as spawner;
                spawner.location = "random edge";
                spawner.interval = 40 - 2*diff;
                ((spawner.enemy as transforming_enemy).behaviors[1][1] as normal_enemy).speed = 7 + diff/5;
                (spawner.enemy as transforming_enemy).behaviors[0][0] = 45 - 3*diff; 
                level.spawners.push(spawner);
            break;
        }
        i+=1;

    }

    if(JSON.stringify(level).indexOf("BAD_IMAGE") !== -1){
        throw "bad image used"
    }
    return level;
}
function generateGame(seed : string , width : number,height:number, english_words : string[], alien_words : string[]): [levelData[][], string[][], Record<string, string>,Record<string, string> , number[] ]{
    if(english_words.length != alien_words.length ){
        throw "list of words have different lengths";
    }
    var lst : levelData[][] = [];
    var strings : string[][] = []
    var difficulty_lst = [
        5,4,4,4,5,
        4,3,2,3,4,
        3,1,1,1,3,
        4,3,2,3,4,
        5,4,4,4,5
    ]
    for(var i = 0 ; i < 25; i ++){
        var this_diff = difficulty_lst[i];
        var nLevels = Math.ceil(1 + this_diff/2);
        var levels : levelData[] =[];
        for(var j = 0; j < nLevels; j++){
            levels.push(generateLevel(seed + " " + i + " " + j , this_diff, width, height));
        }
        lst.push(levels);
        strings.push([]);
    } 
    // for each alien word, choose 2 rooms to put it into
    for(var i=0; i<25; i++){
        var word = r.choice(alien_words , seed + " choose word to put in room " + i); 
        strings[i].push(word);
    }
    var add_tries = 0;
    for(var word of alien_words){
        var successful_adds = 0;
        while(successful_adds  < 2){
            
            add_tries ++; 
            var n1 = r.randint(0, 25, seed + word + " a " + add_tries);
            if(strings[n1].length >= 4){
                continue;
            }
            if(strings[n1].indexOf(word) !== -1){
                continue;
            }
            strings[n1].push(word);
            successful_adds++
        }
    }
    var words = r.shuffle(english_words, seed + " shuffle words") ;
    var english_to_alien  :Record<string, string> = {};
    var alien_to_english  :Record<string, string> = {};
    for(var i=0; i < words.length; i++){
        english_to_alien[words[i]] = alien_words[i];
        alien_to_english[ alien_words[i]] = words[i];
    }
    var token_lst : number[]= []
    var random_lst : number[]= []
    for(var i = 0; i < 25; i++){
        if([0,4,12,20,24].indexOf(i) == -1){
        token_lst.push(i);
        }
    }
    token_lst = r.shuffle(token_lst, seed + "token").slice(0, 3);
    token_lst.push(12);
    
    return [lst, strings, english_to_alien, alien_to_english, token_lst ];
}

export default generateGame

