let fgCanvas = document.getElementById("fg");//getting canvas
let fgSurface = fgCanvas.getContext("2d");//setting canvas for drawing
fgSurface.imageSmoothingEnabled = false;

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
    bgSurface.drawImage(backgroundImage,31,31,81,93,110,110,81*3,93*3);//background image
}

function drawMain() //draws all enemies player and interactive objects
{
    fgSurface.clearRect(0,0,600,600); //clear game area
    fgSurface.drawImage(backgroundImage,195,160,15,20,character.cordinates[0],character.cordinates[1],15*3,20*3); //character
    for (let i=0;i<character.bullets.length;i++) //draws bullets
    {
        let temp = character.bullets[i];
        fgSurface.drawImage(backgroundImage, temp.sprite[0], temp.sprite[1], temp.sprite[2], temp.sprite[3], temp.cordinates[0], temp.cordinates[1],
            temp.sprite[2], temp.sprite[3]);
    }

}

function drawUI() // draws UI ontop of everything else currently showing debug info
{
    uiSurface.clearRect(0,600,600,700);
    uiSurface.font = "10px Courier New";
    uiSurface.fillText("x: "+character.cordinates[0].toString(), 50, 610);
    uiSurface.fillText("y: "+character.cordinates[1].toString(), 50, 630);
    uiSurface.fillText("vector: "+character.cordinates[2].toString() +character.cordinates[3].toString(), 100, 610);
    uiSurface.fillText("attack cooldown: "+character.attackChargeTimer.toString(), 100, 630);
}


function userInputHandler() //accepts and applies player input
{
    if(keysPressed.includes(37))//left
        character.cordinates[2]=-1;
    if(keysPressed.includes(39))//right
        character.cordinates[2]=1;
    if(keysPressed.includes(38))//up
        character.cordinates[3]=-1;
    if(keysPressed.includes(40))//down
        character.cordinates[3]=1;
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
    character.moveFinal(); //uses character vector to move it
    if(character.cordinates[2] != 0 || character.cordinates[3]!= 0) //applies character movment to bullet firing direction unless char is not moving
    {
        character.bulletDirection[0] = character.cordinates[2];
        character.bulletDirection[1] = character.cordinates[3];
    }
    character.cordinates[2] = 0; //resets character movment vector
    character.cordinates[3] = 0;
}


function roughCollision(x1,y1,w1,h1,x2,y2,w2,h2) //takes the x,y,width and height of 2 objects and checks for collision returns true or false
{
    return (x1 < x2 + w2 &&
        x1 + w1 > x2 &&
        y1 < y2 + h2 &&
        h1 + y1 > y2)
}

function fineCollision()//will use penetration testing to determine what vector to apply to character to move out of walls
{

}

function killAllOnemies() //kills every enemy and object on screen used during screen transitions
{

}

function spawnAllObjects() //takes the room data and spawns the appropriate enemies and objects used during screen transitions
{

}

function generateFloorMap () //generates and returns the floor map
{

}

function generateRoomMap () //called by floor map generator to generate each room
{

}

function generateTile () //called by room map generator generates to generate tile properties
{

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
    obj.cordinates = [300,300,0,0]; //player characters cordinates stored as x,y pair and player movement vector
    obj.bulletDirection = [1,0];  //last direction facing used for
    obj.bullets = []; //bullets in the air
    obj.health = 5; // health
    obj.state = 0; //player characters current animation state
    obj.currentWeapon = generateWeapon(1,60,3,2,7,0);//dmg, bullet time to live,bullet speed, max bullets, reload timer, special attribute
    obj.attackChargeTimer = 0; //keeps track of reload time for weapon
    obj.speed= 2; //movement speed
    obj.attack = function()
    {
        if (this.attackChargeTimer == 0 && this.bullets.length < this.currentWeapon.bullets)
        {
            this.bullets.push(newBullet());
            this.attackChargeTimer = this.currentWeapon.reload;
        }
    };
    obj.moveFinal = function ()
    {
        this.cordinates[0] += Math.floor(this.cordinates[2] * this.speed);
        this.cordinates[1] += Math.floor(this.cordinates[3] * this.speed);
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
    obj.cordinates = [character.cordinates[0],character.cordinates[1],character.bulletDirection[0]*obj.speed,character.bulletDirection[1]*obj.speed];
    obj.sprite = [190,130,10,10];
    obj.lifetime = character.currentWeapon.range;
    obj.timeToLive = function(){this.lifetime--;return(this.lifetime)};
    obj.move = function ()
    {
        this.cordinates[0] += this.cordinates[2];
        this.cordinates[1] += this.cordinates[3];
    };
    return obj;
}

function enemyType1(x,y,level)
{
    let obj ={};
    obj.cordinates = [x,y,10,10];
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
    obj.cordinates = [x,y,10,10];
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
    obj.cordinates = [x,y,10,10];
    obj.health = level+2;
    obj.damage = Math.floor(2+(level*1.5));
    obj.ai = function ()//called once per frame to decide on what enemy should do
    {

    };
    return(obj);
}