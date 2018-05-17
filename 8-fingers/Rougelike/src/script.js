let fgCanvas = document.getElementById("fg");//getting canvas
let fgSurface = fgCanvas.getContext("2d");//setting canvas for drawing
fgSurface.imageSmoothingEnabled = false;

fgSurface.fillStyle = 'white';//used to number tiles on canavas remove for final build

let bgCanvas = document.getElementById("bg");//getting canvas
let bgSurface = bgCanvas.getContext("2d");//setting canvas for drawing
bgSurface.imageSmoothingEnabled = false;


let uiCanvas = document.getElementById("ui");//getting canvas
let uiSurface = uiCanvas.getContext("2d");//setting canvas for drawing
uiSurface.imageSmoothingEnabled = false;
uiSurface.fillStyle = 'white';//text colour for text used on canvas

//var audioAttack = new Audio();//example audio loading
//audioAttack.src = "data/foo.mp3";

let backgroundImage = new Image();//loading a spite sheet i downloaded
backgroundImage.src = "data/dungeon_tiles.png";

let keysPressed = [];//an array that holds the keys currently down

document.addEventListener("keydown",keyDownHandler,false);
document.addEventListener("keyup",keyUpHandler,false);

let character = createCharacter();//creates and holds character
let enemies = []; //array of all currently active enemies
let miscObjects = []; // other interactive objects
let tileList = [];
setTilelist();
let floorMap = generateFloorMap(0);
connectRooms();

floorMap.rooms[1].features.push(returnTile(300,300,10));

window.onload = function(){
    drawBackground();
    requestAnimationFrame(gameLoop); //calls game loop 60 times a second
};



function gameLoop()
{
    render();
    userInputHandler();
    gameLogic();
    requestAnimationFrame(gameLoop);
}

function render() //clears screen and draws all elements in turn
{
    drawMain();
    drawUI();
}


function drawBackground()// draws background layer should only be called during screen transitions
{
    bgSurface.clearRect(0,0,600,600);
    for(let i =0;i<floorMap.rooms[character.roomLocation].features.length;i++)
    {
        let temp = floorMap.rooms[character.roomLocation].features[i];
        bgSurface.drawImage(backgroundImage,tileList[temp.tileNum].x,tileList[temp.tileNum].y,tileList[temp.tileNum].w,tileList[temp.tileNum].h,
            temp.x,temp.y,tileList[temp.tileNum].w*3,tileList[temp.tileNum].h*3);
    }
}

function drawMain() //draws all enemies player and interactive objects
{
    fgSurface.clearRect(0,0,600,600); //clear game area
    fgSurface.drawImage(backgroundImage,195,160,15,20,Math.floor(character.coordinates[0]),Math.floor(character.coordinates[1]),15*3,20*3); //character

    //showHitboxes();

    for (let i=0;i<character.bullets.length;i++) //draws bullets
    {
        let temp = character.bullets[i];
        fgSurface.drawImage(backgroundImage, temp.sprite[0], temp.sprite[1], temp.sprite[2], temp.sprite[3],
            Math.floor(temp.coordinates[0]), Math.floor(temp.coordinates[1]), temp.sprite[2]*3, temp.sprite[3]*3);
    }

}

function drawUI() // draws UI ontop of everything else currently showing debug info
{
    uiSurface.clearRect(0,0,600,100);
    uiSurface.font = "10px Courier New";
    uiSurface.fillText("x: "+Math.floor(character.coordinates[0].toString()), 50, 10);
    uiSurface.fillText("y: "+Math.floor(character.coordinates[1].toString()), 50, 30);
    uiSurface.fillText("angle: "+character.bulletAngle.toString(), 100, 10);
    uiSurface.fillText("attack cooldown: "+character.attackChargeTimer.toString(), 100, 30);
    uiSurface.fillText("Room: "+character.roomLocation.toString(), 240, 60);
}


function userInputHandler() //accepts and applies player input
{
    if(keysPressed.includes(37))//left
        character.baseVector[0]-=1;
    if(keysPressed.includes(39))//right
        character.baseVector[0]+=1;
    if(keysPressed.includes(38))//up
        character.baseVector[1]-=1;
    if(keysPressed.includes(40))//down
        character.baseVector[1]+=1;
    if(keysPressed.includes(32))//spacebar
        character.attack();
}

function gameLogic() //updates all game functions and ai
{
    for (let i=0;i<character.bullets.length;i++) //itererates through bullet list
    {
        character.bullets[i].move(); // moves bullets
        if (character.bullets[i].timeToLive() <= 0) //changes and returns time to live
        {
            character.bullets.splice(i,1); //destroy expires bullets
            i--; //moves back one plaec in the list
        }
    }
    if (character.attackChargeTimer > 0)//recharging attack timer
        character.attackChargeTimer--;
    if(character.baseVector[0] != 0 || character.baseVector[1]!= 0) //applies character movment to bullet firing direction unless char is not moving
    {
        character.move(); //uses character vector to move it
        character.bulletAngle = character.angleFacing;
    }
    character.baseVector = [0,0]; //resets character movment vector
    collisionSystem();
}

function killAllOnemies() //kills every enemy and object on screen used during screen transitions
{

}

function spawnAllObjects() //takes the room data and spawns the appropriate enemies and objects used during screen transitions
{

}

function generateFloorMap (floor) //generates and returns the floor map
{
    let obj = [];
    obj.floor = floor;
    obj.rooms =[];
    //for(let i =0;i<((floor*2)+2);i++)
    for(let i =0;i<5;i++)
        obj.rooms.push(generateRoomMap(Math.floor((5 + floor) * Math.random())));
    return obj;
}

function generateRoomMap (points) //called by floor map generator to generate each room
{
    let obj = [];
    obj.features = [];
    obj.features.push(returnTile(30,30,1));
    for (let i =0;i<16;i++)
        obj.features.push(returnTile(60+(i*30),30,2));
    for (let i =0;i<16;i++)
        obj.features.push(returnTile(30,60+(i*30),3));
    obj.features.push(returnTile(30,540,4));
    for (let i =0;i<16;i++)
        obj.features.push(returnTile(60+(i*30),540,5));
    obj.features.push(returnTile(540,540,6));
    for (let i =0;i<16;i++)
        obj.features.push(returnTile(540,60+(i*30),7));
    obj.features.push(returnTile(540,30,8));
    for (let i =0;i<16;i++)
        for (let q =0;q<16;q++)
        obj.features.push(returnTile(60+(i*30),60+(q*30),9));
    obj.features.push(returnTile(30,570,10));
    for (let i =0;i<16;i++)
        obj.features.push(returnTile(60+(i*30),570,11));
    obj.features.push(returnTile(540,570,12));
    for (let i =0;i<20;i++)
        obj.features.push(returnTile(0,i*30,0));
    for (let i =0;i<18;i++)
        obj.features.push(returnTile(30+(i*30),0,0));
    for (let i =0;i<20;i++)
        obj.features.push(returnTile(570,i*30,0));

    /*let temp;
    for(let i=0;i<points;)
    {
        temp = Math.floor(Math.random() * 100);
        obj.features.push(generateFeatures(temp));
        i+=(temp%4);
    }*/
    return obj;
}


function returnTile(x,y,tileNum)
{
    let obj = {};
    obj.x = x;
    obj.y = y;
    obj.tileNum = tileNum;
    return obj;
}

function returnDoor(x,y,tileNum,room,side)
{
    let obj = {};
    obj.x = x;
    obj.y = y;
    obj.tileNum = tileNum;
    obj.room = room;
    obj.side = side;
    return obj;
}

function keyDownHandler(e) //appends key to array if it is not already present
{
    if(!keysPressed.includes(e.keyCode))
        keysPressed.push(e.keyCode)
}

function keyUpHandler(e) //removes specified key from array
{
    keysPressed.splice(keysPressed.indexOf(e.keyCode), 1);
}

function createCharacter() //generates and contains game character
{
    let obj = {};
    obj.coordinates = [300,300]; //player characters coordinates stored as x,y pair and player movement vector
    obj.baseVector = [0,0];//what directions the player is traveling only uses 1 0 and -1
    obj.hitbox= [20,10,30,30]; //offset from coordinates and then w and h of hitbox
    obj.angleFacing = 0; //angle character is facing
    obj.bulletAngle = 0;  //last direction facing used for bullets
    obj.bullets = []; //bullets in the air
    obj.health = 5; // health
    obj.roomLocation = 0;
    obj.currentWeapon = generateWeapon(1,60,3,2,20,0);//dmg, bullet time to live,bullet speed, max bullets, reload timer, special attribute
    obj.attackChargeTimer = 0; //keeps track of reload time for weapon
    obj.speed= 2; //movement speed
    obj.attack = function()
    {
        if (this.attackChargeTimer === 0 && this.bullets.length < this.currentWeapon.bullets)
        {
            this.bullets.push(newBullet());
            this.attackChargeTimer = this.currentWeapon.reload;
        }
    };
    obj.move = function ()
    {
        this.angleFacing = Math.atan2(this.baseVector[0], this.baseVector[1]);
        this.coordinates[0] += this.speed*Math.sin(this.angleFacing);
        this.coordinates[1] += this.speed*Math.cos(this.angleFacing);
    };
    return (obj);
}

function generateWeapon(dmg,range,speed,bullets,reload,special)
{
    let obj = {};
    obj.dmg = dmg;
    obj.range = range;
    obj.speed = speed;
    obj.bullets = bullets;
    obj.reload = reload;
    obj.special = special;
    return (obj);
}

function newBullet()
{
    let obj = {};
    obj.speed = character.currentWeapon.speed;
    obj.coordinates = [character.coordinates[0],character.coordinates[1]];
    obj.angle = character.bulletAngle;
    obj.sprite = [190,130,10,10]; //sprite location on spritesheet
    obj.lifetime = character.currentWeapon.range;//time to live for this bullet
    obj.timeToLive = function(){this.lifetime--;return(this.lifetime)};
    obj.move = function ()
    {
        this.coordinates[0] += this.speed*Math.sin(this.angle);
        this.coordinates[1] += this.speed*Math.cos(this.angle);
    };
    return obj;
}

function enemyType1(x,y,level)
{
    let obj ={};
    obj.coordinates = [x,y];
    obj.level = 1;
    obj.health = level+2;
    obj.damage = Math.floor((level/2)+1);
    obj.ai = function ()//called once per frame to decide on what enemy should do
    {

    };
    return(obj);
}

function enemyType2(x,y,level)
{
    let obj ={};
    obj.coordinates = [x,y];
    obj.level = 1;
    obj.health = level*2;
    obj.damage = Math.floor(level);
    obj.ai = function ()//called once per frame to decide on what enemy should do
    {

    };
    return(obj);
}

function enemyType3(x,y,level)
{
    let obj ={};
    obj.coordinates = [x,y,10,10];
    obj.health = level+2;
    obj.damage = Math.floor(2+(level*1.5));
    obj.ai = function ()//called once per frame to decide on what enemy should do
    {

    };
    return(obj);
}

function tileInfo(x,y,w,h,passable)
{
    let obj = {};
    obj.x = x;
    obj.y = y;
    obj.w = w;
    obj.h = h;
    obj.passable = passable;
    return obj;
}

function setTilelist()
{
    //tile contains x on spritesheet, y on spritesheet, width on spitesheet, height on spritesheet, collision type 0 for collision 1 for passable 2 for doors
    tileList.push(tileInfo(0,0,10,10,0)); //tile 0 blackspace with collision
    tileList.push(tileInfo(30,30,10,10,1)); //tile 1 top left corner
    tileList.push(tileInfo(40,30,10,10,1)); //tile 2 top wall
    tileList.push(tileInfo(30,40,10,10,1)); //tile 3 left wall
    tileList.push(tileInfo(30,105,10,10,1)); //tile 4 bottom left corner top half
    tileList.push(tileInfo(40,105,10,10,1)); //tile 5 bottom wall top half
    tileList.push(tileInfo(105,105,10,10,1)); //tile 6 bottom right corner top half
    tileList.push(tileInfo(105,40,10,10,1)); //tile 7 right wall
    tileList.push(tileInfo(105,30,10,10,1)); //tile 8 top right corner
    tileList.push(tileInfo(50,50,10,10,1)); //tile 9 middle
    tileList.push(tileInfo(30,115,10,10,0)); //tile 10 bottom left corner bot half
    tileList.push(tileInfo(40,115,10,10,0)); //tile 11 bottom wall bot half
    tileList.push(tileInfo(105,115,10,10,0)); //tile 12 bottom right corner bot half
    tileList.push(tileInfo(141,130,20,20,1)); //tile 13 bridge left-right
    tileList.push(tileInfo(166,130,15,20,1)); //tile 14 bridge up-down
    tileList.push(tileInfo(0,0,10,5,0)); //tile 15 blackspace with collision half height
    tileList.push(tileInfo(0,0,5,10,0)); //tile 16 blackspace with collision half width
    tileList.push(tileInfo(45,115,5,10,0)); //tile 17 bottom wall bot half, half width
    tileList.push(tileInfo(0,0,10,10,2)); //tile 18 creates a door collision box
}

function showHitboxes()  //dev tool to be removed in final
{
    fgSurface.beginPath();
    fgSurface.strokeStyle="red";
    fgSurface.rect(character.coordinates[0]+character.hitbox[1], character.coordinates[1]+character.hitbox[0], character.hitbox[2], character.hitbox[3]);
    fgSurface.stroke();
    fgSurface.closePath();
    for (let i= 0;i<floorMap.rooms[character.roomLocation].features.length;i++)
    {
        fgSurface.beginPath();
        if(tileList[floorMap.rooms[character.roomLocation].features[i].tileNum].passable === 1)
            fgSurface.strokeStyle="white";
        else if (tileList[floorMap.rooms[character.roomLocation].features[i].tileNum].passable === 2)
            fgSurface.strokeStyle="yellow";
        else
            fgSurface.strokeStyle="blue";
        fgSurface.rect(floorMap.rooms[character.roomLocation].features[i].x, floorMap.rooms[character.roomLocation].features[i].y,
            tileList[floorMap.rooms[character.roomLocation].features[i].tileNum].w*3, tileList[floorMap.rooms[character.roomLocation].features[i].tileNum].h*3);
        fgSurface.stroke();
        fgSurface.closePath();
        fgSurface.fillText(i.toString(), floorMap.rooms[character.roomLocation].features[i].x+5, floorMap.rooms[character.roomLocation].features[i].y+10);
    }
}

function collisionSystem()
{
    let x1,y1,w1,h1,temp;
    x1 = character.coordinates[0]+character.hitbox[1];
    y1 = character.coordinates[1]+character.hitbox[0];
    w1 = character.hitbox[2];
    h1 = character.hitbox[3];
    temp = floorMap.rooms[character.roomLocation];

    for (let i= 0;i<floorMap.rooms[character.roomLocation].features.length;i++)
    {
        if(tileList[floorMap.rooms[character.roomLocation].features[i].tileNum].passable !== 1)
           if(roughCollision(x1,y1,w1,h1,temp.features[i].x, temp.features[i].y,tileList[temp.features[i].tileNum].w*3, tileList[temp.features[i].tileNum].h*3))
           {
               if (tileList[floorMap.rooms[character.roomLocation].features[i].tileNum].passable == 0)
                   fineCollision(x1,y1,w1,h1,temp.features[i].x, temp.features[i].y,tileList[temp.features[i].tileNum].w*3, tileList[temp.features[i].tileNum].h*3);
               if (tileList[floorMap.rooms[character.roomLocation].features[i].tileNum].passable == 2)
                   i =swapRooms(i);
           }
    }
}

function roughCollision(x1,y1,w1,h1,x2,y2,w2,h2) //takes the x,y,width and height of 2 objects and checks for collision returns true or false
{
    return (x1 < x2 + w2 && x1 + w1 > x2 && y1 < y2 + h2 && h1 + y1 > y2);
}

function fineCollision(x1,y1,w1,h1,x2,y2,w2,h2)//will use penetration testing to determine what vector to apply to character to move out of walls
{
    let b_collision = y2+h2-y1;
    let t_collision = y1+h1-y2;
    let l_collision = x1+w1-x2;
    let r_collision = x2+w2-x1;

    if (t_collision < b_collision && t_collision < l_collision && t_collision < r_collision )
        character.baseVector[1]-=character.speed;
    if (b_collision < t_collision && b_collision < l_collision && b_collision < r_collision)
        character.baseVector[1]+=character.speed;
    if (l_collision < r_collision && l_collision < t_collision && l_collision < b_collision)
        character.baseVector[0]-=character.speed;
    if (r_collision < l_collision && r_collision < t_collision && r_collision < b_collision )
        character.baseVector[0]+=character.speed;
}

function swapRooms(i)
{
    if(floorMap.rooms[character.roomLocation].features[i].side == 2)
        character.coordinates = [0, 265];
    else if(floorMap.rooms[character.roomLocation].features[i].side == 0)
        character.coordinates = [550,265];
    else if(floorMap.rooms[character.roomLocation].features[i].side == 1)
        character.coordinates = [275,545];
    else if(floorMap.rooms[character.roomLocation].features[i].side == 3)
        character.coordinates = [275,-15];
    character.roomLocation = floorMap.rooms[character.roomLocation].features[i].room;
    drawBackground();
    return(floorMap.rooms[character.roomLocation].features.length);
}

function addDoorLeft(room,connection)
{
    for(let i =0;i<floorMap.rooms[room].features.length;i++)
    {
        if(roughCollision(floorMap.rooms[room].features[i].x,floorMap.rooms[room].features[i].y,
            tileList[floorMap.rooms[room].features[i].tileNum].w*3,
            tileList[floorMap.rooms[room].features[i].tileNum].h*3,
            0,270,20,60))
        {
            floorMap.rooms[room].features.splice(i,1);
            i--;
        }
    }
    floorMap.rooms[room].features.push(returnTile(0,270,13));
    floorMap.rooms[room].features.push(returnTile(0,315,15));
    floorMap.rooms[room].features.push(returnDoor(-25,280,18,connection,0));
}
function addDoorRight(room,connection)
{
    for(let i =0;i<floorMap.rooms[room].features.length;i++)
    {
        if(roughCollision(floorMap.rooms[room].features[i].x,floorMap.rooms[room].features[i].y,
            tileList[floorMap.rooms[room].features[i].tileNum].w*3,
            tileList[floorMap.rooms[room].features[i].tileNum].h*3,
            570,270,20,60))
        {
            floorMap.rooms[room].features.splice(i,1);
            i--;
        }
    }
    floorMap.rooms[room].features.push(returnTile(550,270,13));
    floorMap.rooms[room].features.push(returnTile(570,315,15));
    floorMap.rooms[room].features.push(returnDoor(595,280,18,connection,2));
}
function addDoorTop(room,connection)
{
    for(let i =0;i<floorMap.rooms[room].features.length;i++)
    {
        if(roughCollision(floorMap.rooms[room].features[i].x,floorMap.rooms[room].features[i].y,
            tileList[floorMap.rooms[room].features[i].tileNum].w*3,
            tileList[floorMap.rooms[room].features[i].tileNum].h*3,
            270,0,60,20))
        {
            floorMap.rooms[room].features.splice(i,1);
            i--;
        }
    }
    floorMap.rooms[room].features.push(returnTile(285,-10,14));
    floorMap.rooms[room].features.push(returnTile(270,0,16));
    floorMap.rooms[room].features.push(returnDoor(295,-25,18,connection,1));
}
function addDoorBottom(room,connection)
{
    for(let i =0;i<floorMap.rooms[room].features.length;i++)
    {
        if(roughCollision(floorMap.rooms[room].features[i].x,floorMap.rooms[room].features[i].y,
            tileList[floorMap.rooms[room].features[i].tileNum].w*3,
            tileList[floorMap.rooms[room].features[i].tileNum].h*3,
            270,570,60,20))
        {
            floorMap.rooms[room].features.splice(i,1);
            i--;
        }
    }
    floorMap.rooms[room].features.push(returnTile(285,560,14));
    floorMap.rooms[room].features.push(returnTile(270,570,17));
    floorMap.rooms[room].features.push(returnDoor(295,595,18,connection,3));
}

function connectRooms()
{
    addDoorLeft(0, 1); //door in room, connecting to room
    addDoorRight(1, 0);
    addDoorTop(0, 2);
    addDoorBottom(2, 0);
    addDoorTop(2, 3);
    addDoorBottom(3, 2);
}