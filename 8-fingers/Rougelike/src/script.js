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
    let animation = requestAnimationFrame(gameLoop); //calls game loop 60 times a second
    drawBackground();
};



function gameLoop()
{
    render();
    userInputHandler();
    gameLogic();
    animation = requestAnimationFrame(gameLoop);
}

function render() //clears screen and draws all elements in turn
{
    drawMain();
    drawUI();
}


function drawBackground()// draws background layer should only be called during screen transitions
{
    //for(let i =0;i<20;i++)
        //for(let q =0;q<20;q++)
    bgSurface.drawImage(backgroundImage,31,31,81,93,110,110,81*4,93*4);
}

function drawMain() //draws all enemies player and interactive objects
{
    fgSurface.clearRect(0,0,600,600);
    fgSurface.drawImage(backgroundImage,195,160,15,20,character.cordinates[0],character.cordinates[1],15*3,20*3);

}

function drawUI() // draws UI ontop of everything else
{
    uiSurface.clearRect(0,600,600,700);
    uiSurface.font = "10px Courier New";
    uiSurface.fillText(character.cordinates[0].toString(), 50, 610);
    uiSurface.fillText(character.cordinates[1].toString(), 50, 630);
    uiSurface.fillText(character.state.toString(), 100, 610);

}


function userInputHandler() //accepts and applies player input
{
    if(keysPressed.includes(37))//left
        character.moveLeft();
    if(keysPressed.includes(39))//right
        character.moveRight();
    if(keysPressed.includes(38))//up
        character.moveUp();
    if(keysPressed.includes(40))//down
        character.moveDown();
    if(keysPressed.includes(32))//spacebar
        character.attack();
}

function gameLogic() //updates all game functions and ai
{

}


function roughCollision(x1,y1,w1,h1,x2,y2,w2,h2) //takes the x,y,width and height of 2 objects and checks for collision returns true or false
{
    return (x1 < x2 + w2 &&
        x1 + w1 > x2 &&
        y1 < y2 + h2 &&
        h1 + y1 > y2)
}

function fineCollision()//determines the angle of collision so the walls can apply counterforce
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
    obj.cordinates = [300,300]; //player characters cordinates stored as x,y pair
    obj.health = 5;
    obj.state = 0; //player characters current animation state
    obj.currentWeapon = generateWeapon(1,20,1,0);
    obj.attackChargeTimer = 0;
    obj.floorLevel = 0;
    obj.speed= 2;
    obj.moveLeft = function(){character.cordinates[0]-=character.speed;character.state = 4;};
    obj.moveRight = function(){character.cordinates[0]+=character.speed;character.state = 2;};
    obj.moveUp = function(){character.cordinates[1]-=character.speed;character.state = 1;};
    obj.moveDown = function(){character.cordinates[1]+=character.speed;character.state = 3;};
    obj.attack = function(){};
    obj.bullets = [];
    return (obj);
}

function generateWeapon(dmg,range,bullets,special)
{
    let obj = {};
    obj.dmg = dmg;
    obj.range = range;
    obj.bullets = bullets;
    obj.special = special;
}