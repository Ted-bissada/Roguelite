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

let explosionImage = new Image();//loading a spite sheet i downloaded
explosionImage.src = "data/explosion.png";

let keysPressed = [];//an array that holds the keys currently down

document.addEventListener("keydown",keyDownHandler,false);
document.addEventListener("keyup",keyUpHandler,false);

let character = createCharacter();//creates and holds character
let explosions = [];
let tileList = [];//list of tiles and their locations and atributes
setTileList();//populates the list with hardcoded tile information

let floorMap = generateFloorMap(0);
connectRooms();

let gameOver = false;
showHitBox = false; //dev tool on/off
showMap = true; //dev tool on/off

window.onload = function() //this prevents game from starting before all assets are loaded
{
    drawBackground();
    requestAnimationFrame(gameLoop); //calls game loop 60 times a second
};

function gameLoop()
{
    render();
    if (!gameOver)
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
            temp.x,temp.y,tileList[temp.tileNum].w*2,tileList[temp.tileNum].h*2);
    }
}

function drawMain() //draws all enemies player and interactive objects
{
    fgSurface.clearRect(0,0,600,600); //clear game area
    fgSurface.drawImage(backgroundImage,character.sprite[0],character.sprite[1],character.sprite[2],character.sprite[3],
        Math.floor(character.coordinates[0]),Math.floor(character.coordinates[1]),character.sprite[2]*2,character.sprite[3]*2); //character
    if(showHitBox)
        showHitboxes();
    for (let i=0;i<character.bullets.length;i++) //draws bullets
        character.bullets[i].draw()
    for (let i =0;i<explosions.length;i++)
        explosions[i].draw()
    for (let i =0;i<floorMap.rooms[character.roomLocation].enemies.length;i++)
        floorMap.rooms[character.roomLocation].enemies[i].draw();
    if(showMap)
        drawMap();
}

function drawMap()
{
    fgSurface.strokeStyle = "red";
    fgSurface.fillStyle = "red";
    for(let i =0;i<floorMap.map.length;i++)
    {
        fgSurface.fillStyle = "red";
        fgSurface.beginPath();
        if(floorMap.map[i][2] === character.roomLocation)
            fgSurface.fillRect(300-(floorMap.map[i][0]*15),300-(floorMap.map[i][1]*15),15,15);
        else if(floorMap.map[i][2] === floorMap.stairRoom)
        {
            fgSurface.fillStyle = "yellow";
            fgSurface.fillRect(300 - (floorMap.map[i][0] * 15), 300 - (floorMap.map[i][1] * 15), 15, 15);
        }
        fgSurface.rect(300-(floorMap.map[i][0]*15),300-(floorMap.map[i][1]*15),15,15);
        fgSurface.stroke();
        fgSurface.closePath();
        fgSurface.fillStyle = "white";
        fgSurface.fillText(floorMap.map[i][2],302-(floorMap.map[i][0]*15),310-(floorMap.map[i][1]*15));
    }
}

function drawUI() // draws UI ontop of everything else currently showing debug info
{
    uiSurface.clearRect(0,0,600,100);
    uiSurface.font = "10px Courier New";
    uiSurface.fillText("x: "+Math.floor(character.coordinates[0]).toString(), 50, 10);
    uiSurface.fillText("y: "+Math.floor(character.coordinates[1]).toString(), 50, 30);
    uiSurface.fillText("angle: "+(character.bulletAngle.toFixed(3)).toString(), 100, 10);
    uiSurface.fillText("attack cd: "+character.attackChargeTimer.toString(), 100, 30);
    uiSurface.fillText("Room: "+character.roomLocation.toString(), 200, 10);
    uiSurface.fillText("Health: "+character.health.toString(), 200, 30);
    uiSurface.fillText("# of Rooms: "+floorMap.rooms.length.toString(), 310, 10);
    uiSurface.fillText("# of Rooms placed: "+floorMap.map.length.toString(), 310, 30);
    uiSurface.fillText("Last Placed room: "+floorMap.map[floorMap.map.length-1][2].toString(), 400, 10);
    uiSurface.fillText("current floor "+floorMap.floor.toString(), 450, 30);

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
    for (let i =0;i<explosions.length;i++) //ticks all explosions
        if(explosions[i].tick())
            i--;
    for (let i=0;i<character.bullets.length;i++) //ticks all bullets
        if(character.bullets[i].tick())
            i--;

    for (let i=0;i<floorMap.rooms[character.roomLocation].enemies.length;i++) //ticks all enemies
        if(floorMap.rooms[character.roomLocation].enemies[i].tick())
            i--;
    character.tick(); //ticks character
    collisionSystem();
}

function generateFloorMap (floor) //generates and returns the floor map
{
    let obj = [];
    obj.floor = floor;
    obj.rooms =[];
    obj.map = [];
    obj.stairRoom = 0;
    for(let i =0;i<((floor*3)+4);i++)
        obj.rooms.push(generateRoomMap());
    return obj;
}

function generateRoomMap () //called by floor map generator to generate each room
{
    let tempRand, tempX, tempY,tempCollision;
    let obj = [];
    obj.features = [];
    obj.enemies = [];
    obj.features.push(returnTile(32,32,1)); // top left corner
    obj.features.push(returnTile(512,32,8)); //top right corner
    obj.features.push(returnTile(32,512,4)); //bottom left corner prt one
    obj.features.push(returnTile(512,512,6));//bottom right corner prt one
    obj.features.push(returnTile(32,544,10));//bottom left corner prt two
    obj.features.push(returnTile(512,544,12));//bottom right corner prt two
    for (let i =0;i<14;i++)
    {
        obj.features.push(returnTile(64 + (i * 32), 32, 2));//top wall
        obj.features.push(returnTile(32, 64 + (i * 32), 3));//left wall
        obj.features.push(returnTile(64 + (i * 32), 512, 5));//bottom wall prt one
        obj.features.push(returnTile(512, 64 + (i * 32), 7));//right wall
        obj.features.push(returnTile(64+ (i * 32),544,11)); //bottom wall prt two
    }
    for (let i =0;i<14;i++)
        for (let q =0;q<14;q++)
            obj.features.push(returnTile(64+(i*32),64+(q*32),9)); //ground tiles
    for (let i =0;i<18;i++)
    {
        obj.features.push(returnTile(0,i*32,0)); //left wall collision
        obj.features.push(returnTile(544,i*32,0)); //right wall
    }
    for (let i =0;i<16;i++)
        obj.features.push(returnTile(32+(i*32),0,0)); //top wall
    for (let i=0;i<12;i++)
        obj.features.push(returnTile(45+Math.floor(450*Math.random()),45+Math.floor(450*Math.random()),19));
    for (let i=0;i<50;i++)
    {
        tempRand = Math.floor(Math.random() * 8);
        tempX = 68 + Math.floor(Math.random() * (440 - (tileList[tempRand + 20].w * 2)));
        tempY = 68 + Math.floor(Math.random() * (440 - (tileList[tempRand + 20].h * 2)));
        tempCollision = false;
        for (let q = 0; q < obj.features.length; q++)
            if (tileList[obj.features[q].tileNum].passable !== 1)
                if (roughCollision(tempX - 20, tempY - 20, (tileList[tempRand + 20].w * 2) + 40, (tileList[tempRand + 20].h * 2) + 40,
                    obj.features[q].x, obj.features[q].y, tileList[obj.features[q].tileNum].w * 2, tileList[obj.features[q].tileNum].h * 2))
                    tempCollision = true;
        if (tempCollision === false)
            obj.features.push(returnTile(tempX, tempY, 20 + tempRand));
    }
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

function newExplosion(x,y,type)
{
    let obj = {};
    obj.coordinates = [x,y];
    obj.frame = 0;
    obj.ticks = 0;
    obj.type = type;
    obj.tick = function ()
    {
        this.ticks++;
        if(this.ticks % 3 === 0)
            this.frame++;
        if(this.ticks>30)
        {
            explosions.splice(explosions.indexOf(this), 1);
            return (true);
        }
        else
            return (false);
    };
    obj.draw = function ()
    {
        fgSurface.drawImage(explosionImage,this.frame*32,type*32,32,32,Math.floor(this.coordinates[0]),Math.floor(this.coordinates[1]),32,32);
    };
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
    obj.hitbox= [4,14,26,26]; //offset from coordinates and then w and h of hitbox
    obj.angleFacing = 0; //angle character is facing
    obj.bulletAngle = 0;  //last direction facing used for bullets
    obj.bullets = []; //bullets in the air
    obj.maxHealth = 50;
    obj.health = 50; // health
    obj.sprite = [195,160,15,20,];
    obj.roomLocation = 0;
    obj.currentWeapon = generateWeapon(1,60,3,2,20,0);//dmg, bullet time to live,bullet speed, max bullets, reload timer, special attribute
    obj.attackChargeTimer = 0; //keeps track of reload time for weapon
    obj.trueSpeed= 2; //movement speed
    obj.speed= obj.trueSpeed; //movement speed
    obj.attack = function()
    {
        if (this.attackChargeTimer === 0 && this.bullets.length < this.currentWeapon.bullets)
        {
            this.bullets.push(newBullet());
            this.attackChargeTimer = this.currentWeapon.reload;
        }
    };
    obj.tick = function ()
    {
        if (this.attackChargeTimer > 0)//recharging attack timer
            this.attackChargeTimer--;
        this.angleFacing = Math.atan2(this.baseVector[0], this.baseVector[1]);
        if(this.baseVector[0] !== 0 || this.baseVector[1]!== 0)//applies character movment to bullet firing direction unless char is not moving
        {
            this.coordinates[0] += this.speed*Math.sin(this.angleFacing);
            this.coordinates[1] += this.speed*Math.cos(this.angleFacing);
            this.bulletAngle = this.angleFacing;
        }
        this.speed = this.trueSpeed;
        this.baseVector = [0,0]; //resets character movment vector
        if(this.health<1)
        {
            gameOver = true;
            this.sprite = [0, 0, 0, 0];
        }
    };
    return (obj);
}

function generateWeapon(dmg,range,speed,bullets,reload,special)
{
    let obj = {};
    obj.damage = dmg;
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
    obj.damage = character.currentWeapon.damage;
    obj.coordinates = [character.coordinates[0],character.coordinates[1]];
    obj.vector = [character.currentWeapon.speed*Math.sin(character.bulletAngle),character.currentWeapon.speed*Math.cos(character.bulletAngle)];
    obj.sprite = [190,130,10,10]; //sprite location on spritesheet
    obj.lifetime = character.currentWeapon.range;//time to live for this bullet
    obj.tick = function()
    {
        this.coordinates[0] += this.vector[0];
        this.coordinates[1] += this.vector[1];
        this.lifetime--;
        for(let i = 0;i<floorMap.rooms[character.roomLocation].enemies.length;i++)
            if(roughCollision(this.coordinates[0],this.coordinates[1], this.sprite[2]*2, this.sprite[3]*2,
                floorMap.rooms[character.roomLocation].enemies[i].coordinates[0],floorMap.rooms[character.roomLocation].enemies[i].coordinates[1],
                floorMap.rooms[character.roomLocation].enemies[i].sprite[2]*2,floorMap.rooms[character.roomLocation].enemies[i].sprite[3]*2))
            {
                explosions.push(newExplosion(this.coordinates[0],this.coordinates[1],0));
                floorMap.rooms[character.roomLocation].enemies[i].health -= this.damage;
                character.bullets.splice(character.bullets.indexOf(this), 1);
                return (true);
            }
        if (this.lifetime < 0)
        {
            explosions.push(newExplosion(this.coordinates[0],this.coordinates[1],0));
            character.bullets.splice(character.bullets.indexOf(this), 1);
            return (true);
        }
        else
            return (false);
    };
    obj.draw = function()
    {
        fgSurface.drawImage(backgroundImage, this.sprite[0], this.sprite[1], this.sprite[2], this.sprite[3],
            Math.floor(this.coordinates[0]), Math.floor(this.coordinates[1]), this.sprite[2]*2, this.sprite[3]*2);
    };
    return obj;
}

function enemyType1() //enemy bullet
{
    let obj ={};
    obj.coordinates = [(Math.floor(Math.random()*400)+70),(Math.floor(Math.random()*400)+70)];
    obj.orbitLocation;
    obj.targetLocation ; //the target point for travel
    obj.radius; //radius of circling
    obj.rotationAngle ; //angle on the circle around character
    obj.movementAngle; //angle of current movement
    obj.speed = 2;
    obj.health = 1;
    obj.damage = 1;
    obj.sprite = [2,2,16,8];
    obj.timer = 0;
    obj.animationTimer = 0;
    obj.tick = function ()//called once per frame to decide on what enemy should do
    {
        this.timer--;
        if(this.timer<0)
        {
            this.timer = Math.floor(Math.random()*300)+100;
            this.radius = Math.floor(Math.random()*100)+50;
            this.orbitLocation = [(Math.floor(Math.random()*400)+70),(Math.floor(Math.random()*400)+70)];
        }
        this.rotationAngle = Math.atan2(this.coordinates[0]-this.orbitLocation[0],this.coordinates[1]-this.orbitLocation[1])-0.4;
        this.targetLocation = [(this.orbitLocation[0] + this.radius * Math.sin(this.rotationAngle)), (this.orbitLocation[1] + this.radius * Math.cos(this.rotationAngle))];

        this.animationTimer += 0.1;
        this.targetLocation[0] += Math.cos(this.animationTimer)*40;
        this.targetLocation[1] += Math.sin(this.animationTimer)*40;


        this.movementAngle = Math.atan2(this.targetLocation[0] - this.coordinates[0],this.targetLocation[1]- this.coordinates[1]);
        this.coordinates[0] += this.speed*Math.sin(this.movementAngle);
        this.coordinates[1] += this.speed*Math.cos(this.movementAngle);
        if(this.health < 1)
        {
            explosions.push(newExplosion(this.coordinates[0],this.coordinates[1],1));
            floorMap.rooms[character.roomLocation].enemies.splice(floorMap.rooms[character.roomLocation].enemies.indexOf(this), 1);
            return (true);
        }
        else if(roughCollision(character.coordinates[0]+character.hitbox[0],
            character.coordinates[1]+character.hitbox[1], character.hitbox[2],character.hitbox[3],
            this.coordinates[0],this.coordinates[1],this.sprite[2]*2,this.sprite[3]*2))
        {
            character.health -= this.damage;
            explosions.push(newExplosion(this.coordinates[0],this.coordinates[1],1));
            floorMap.rooms[character.roomLocation].enemies.splice(floorMap.rooms[character.roomLocation].enemies.indexOf(this), 1);
            return (true);
        }
        else
            return (false);
    };
    obj.draw = function()
    {
        fgSurface.drawImage(backgroundImage, this.sprite[0], this.sprite[1], this.sprite[2], this.sprite[3],
            Math.floor(this.coordinates[0]), Math.floor(this.coordinates[1]), this.sprite[2]*2, this.sprite[3]*2);
    };
    return(obj);
}

function enemyType2()
{
    let obj ={};
    obj.coordinates = [(Math.floor(Math.random()*400)+70),(Math.floor(Math.random()*400)+70)];
    obj.targetLocation;
    obj.speed = 2;
    obj.rotationAngle ; //angle on the circle around character
    obj.movementAngle; //angle of current movement
    obj.radius = 150;
    obj.health = 2;
    obj.sprite = [2,12,16,16];
    obj.spawnTimer = 100;
    obj.tick = function ()//called once per frame to decide on what enemy should do
    {
        this.spawnTimer--;
        if(this.spawnTimer<0)
        {
            floorMap.rooms[character.roomLocation].enemies.push(enemyType3(this.coordinates[0],this.coordinates[1]));
            this.spawnTimer = 100;
        }
        this.rotationAngle = Math.atan2(this.coordinates[0]-character.coordinates[0],this.coordinates[1]-character.coordinates[1])-0.4;
        if(this.rotationAngle>Math.PI)
            this.rotationAngle = -Math.PI;
        this.targetLocation = [(character.coordinates[0] + this.radius * Math.sin(this.rotationAngle)), (character.coordinates[1] + this.radius * Math.cos(this.rotationAngle))];
        this.movementAngle = Math.atan2(this.targetLocation[0] - this.coordinates[0],this.targetLocation[1]- this.coordinates[1]);
        this.coordinates[0] += this.speed*Math.sin(this.movementAngle);
        this.coordinates[1] += this.speed*Math.cos(this.movementAngle);
        if(this.health < 1)
        {
            explosions.push(newExplosion(this.coordinates[0],this.coordinates[1],1));
            floorMap.rooms[character.roomLocation].enemies.splice(floorMap.rooms[character.roomLocation].enemies.indexOf(this), 1);
            return (true);
        }
        else
            return (false);
    };
    obj.draw = function()
    {
        fgSurface.drawImage(backgroundImage, this.sprite[0], this.sprite[1], this.sprite[2], this.sprite[3],
            Math.floor(this.coordinates[0]), Math.floor(this.coordinates[1]), this.sprite[2]*2, this.sprite[3]*2);
    };
    return(obj);
}

function enemyType3(x,y)
{
    let obj ={};
    obj.coordinates = [x,y];
    obj.angle = Math.atan2(character.coordinates[0] - obj.coordinates[0],character.coordinates[1]- obj.coordinates[1]);
    obj.speed = 3;
    obj.health = 1;
    obj.damage = 1;
    obj.sprite = [2,40,16,16];
    obj.tick = function ()//called once per frame to decide on what enemy should do
    {
        this.coordinates[0] += this.speed*Math.sin(this.angle);
        this.coordinates[1] += this.speed*Math.cos(this.angle);
        if(this.health < 1)
        {
            explosions.push(newExplosion(this.coordinates[0],this.coordinates[1],1));
            floorMap.rooms[character.roomLocation].enemies.splice(floorMap.rooms[character.roomLocation].enemies.indexOf(this), 1);
            return (true);
        }

        else if(roughCollision(character.coordinates[0]+character.hitbox[0],
            character.coordinates[1]+character.hitbox[1], character.hitbox[2],character.hitbox[3],
            this.coordinates[0],this.coordinates[1],this.sprite[2]*2,this.sprite[3]*2))
        {
            character.health -= this.damage;
            explosions.push(newExplosion(this.coordinates[0],this.coordinates[1],1));
            floorMap.rooms[character.roomLocation].enemies.splice(floorMap.rooms[character.roomLocation].enemies.indexOf(this), 1);
            return (true);
        }
        else
            return (false);
    };
    obj.draw = function()
    {
        fgSurface.drawImage(backgroundImage, this.sprite[0], this.sprite[1], this.sprite[2], this.sprite[3],
            Math.floor(this.coordinates[0]), Math.floor(this.coordinates[1]), this.sprite[2]*2, this.sprite[3]*2);
    };
    return (obj);
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

function setTileList()
{
    tileList.push(tileInfo(32,0,16,16,0)); //tile 0 blackspace with collision
    tileList.push(tileInfo(32,32,16,16,1)); //tile 1 top left corner
    tileList.push(tileInfo(48,32,16,16,1)); //tile 2 top wall
    tileList.push(tileInfo(32,48,16,16,1)); //tile 3 left wall
    tileList.push(tileInfo(32,96,16,16,1)); //tile 4 bottom left corner top half
    tileList.push(tileInfo(48,96,16,16,1)); //tile 5 bottom wall top half
    tileList.push(tileInfo(96,96,16,16,1)); //tile 6 bottom right corner top half
    tileList.push(tileInfo(96,48,16,16,1)); //tile 7 right wall
    tileList.push(tileInfo(96,32,16,16,1)); //tile 8 top right corner
    tileList.push(tileInfo(50,50,16,16,1)); //tile 9 middle
    tileList.push(tileInfo(32,112,16,16,0)); //tile 10 bottom left corner bot half
    tileList.push(tileInfo(48,112,16,16,0)); //tile 11 bottom wall bot half
    tileList.push(tileInfo(96,112,16,16,0)); //tile 12 bottom right corner bot half
    tileList.push(tileInfo(141,130,20,20,1)); //tile 13 bridge left-right
    tileList.push(tileInfo(166,130,16,20,1)); //tile 14 bridge up-down
    tileList.push(tileInfo(32,0,16,8,0)); //tile 15 blackspace with collision half height
    tileList.push(tileInfo(32,0,8,16,0)); //tile 16 blackspace with collision half width
    tileList.push(tileInfo(48,112,16,16,1)); //tile 17 non colliding version of bot wall prt 2
    tileList.push(tileInfo(0,0,16,16,2)); //tile 18 creates a door collision box
    tileList.push(tileInfo(74,49,16,16,1));//tile 19 flavor tile
    tileList.push(tileInfo(162,104,18,24,4));//tile 20 crate
    tileList.push(tileInfo(32,160,48,48,4));//tile 21 large block
    tileList.push(tileInfo(236,32,48,48,3));//tile 22 large lake slows movement
    tileList.push(tileInfo(288,85,16,29,3));//tile 23 small lake 1 slows movement
    tileList.push(tileInfo(309,84,28,16,3));//tile 24 small lake 2 slows movement
    tileList.push(tileInfo(309,84,28,16,3));//tile 25 small lake 2 slows movement
    tileList.push(tileInfo(32,212,32,32,4));//tile 26 small block 1
    tileList.push(tileInfo(140,160,16,48,4));//tile 27 small block 2
    tileList.push(tileInfo(210,105,20,21,5));//tile 28 stairs
}

function showHitboxes()  //dev tool to be removed in final
{
    fgSurface.beginPath();
    fgSurface.strokeStyle="red";
    fgSurface.rect(character.coordinates[0]+character.hitbox[0], character.coordinates[1]+character.hitbox[1], character.hitbox[2], character.hitbox[3]);
    fgSurface.stroke();
    fgSurface.closePath();
    for (let i= 0;i<floorMap.rooms[character.roomLocation].features.length;i++)
    {
        fgSurface.beginPath();
        if(tileList[floorMap.rooms[character.roomLocation].features[i].tileNum].passable === 1)
            fgSurface.strokeStyle="white";
        else if (tileList[floorMap.rooms[character.roomLocation].features[i].tileNum].passable === 2 || tileList[floorMap.rooms[character.roomLocation].features[i].tileNum].passable === 5)
            fgSurface.strokeStyle="yellow";
        else if (tileList[floorMap.rooms[character.roomLocation].features[i].tileNum].passable === 3)
            fgSurface.strokeStyle="green";
        else
            fgSurface.strokeStyle="blue";
        fgSurface.rect(floorMap.rooms[character.roomLocation].features[i].x, floorMap.rooms[character.roomLocation].features[i].y,
            tileList[floorMap.rooms[character.roomLocation].features[i].tileNum].w*2, tileList[floorMap.rooms[character.roomLocation].features[i].tileNum].h*2);
        if(fgSurface.strokeStyle !== "white")
            fgSurface.stroke();
        fgSurface.closePath();
        fgSurface.fillText(i.toString(), floorMap.rooms[character.roomLocation].features[i].x+5, floorMap.rooms[character.roomLocation].features[i].y+10);
    }
}

function collisionSystem()
{
    let x1,y1,w1,h1,temp;
    x1 = character.coordinates[0]+character.hitbox[0];
    y1 = character.coordinates[1]+character.hitbox[1];
    w1 = character.hitbox[2];
    h1 = character.hitbox[3];
    temp = floorMap.rooms[character.roomLocation];

    for (let i= 0;i<floorMap.rooms[character.roomLocation].features.length;i++)
    {
        if(tileList[floorMap.rooms[character.roomLocation].features[i].tileNum].passable !== 1)
           if(roughCollision(x1,y1,w1,h1,temp.features[i].x, temp.features[i].y,tileList[temp.features[i].tileNum].w*2, tileList[temp.features[i].tileNum].h*2))
           {
               if (tileList[temp.features[i].tileNum].passable === 0 || tileList[temp.features[i].tileNum].passable === 4)
                   fineCollision(x1,y1,w1,h1,temp.features[i].x, temp.features[i].y,tileList[temp.features[i].tileNum].w*2, tileList[temp.features[i].tileNum].h*2);
               else if (tileList[temp.features[i].tileNum].passable === 2)
                   i =swapRooms(i);
               else if (tileList[temp.features[i].tileNum].passable === 3)
                   character.speed *=0.6;
               else if (tileList[temp.features[i].tileNum].passable === 5)
                   i = newFloor();
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
        character.baseVector[1]-=1;
    if (b_collision < t_collision && b_collision < l_collision && b_collision < r_collision)
        character.baseVector[1]+=1;
    if (l_collision < r_collision && l_collision < t_collision && l_collision < b_collision)
        character.baseVector[0]-=1;
    if (r_collision < l_collision && r_collision < t_collision && r_collision < b_collision )
        character.baseVector[0]+=1;
}

function swapRooms(i)
{
    if(floorMap.rooms[character.roomLocation].features[i].side === 2)
        character.coordinates[0] = 0;
    else if(floorMap.rooms[character.roomLocation].features[i].side === 0)
        character.coordinates[0] = 545;
    else if(floorMap.rooms[character.roomLocation].features[i].side === 1)
        character.coordinates[1] = 535;
    else if(floorMap.rooms[character.roomLocation].features[i].side === 3)
        character.coordinates[1]= -15;
    character.roomLocation = floorMap.rooms[character.roomLocation].features[i].room;
    drawBackground();
    character.bullets.splice(0,character.bullets.length);
    return(floorMap.rooms[character.roomLocation].features.length);
}

function newFloor()
{
    character.roomLocation = 0;
    character.coordinates = [300,300];
    floorMap = generateFloorMap(floorMap.floor+1);
    connectRooms();
    drawBackground();
    return(floorMap.rooms[character.roomLocation].features.length);
}

function addDoorLeft(room,connection)
{
    removeTiles(1,262,20,40,room);
    floorMap.rooms[room].features.push(returnTile(0,258,13));
    floorMap.rooms[room].features.push(returnTile(0,295,15));
    floorMap.rooms[room].features.push(returnDoor(-31,258,18,connection,0));
}
function addDoorRight(room,connection)
{
    removeTiles(572,262,20,40,room);
    floorMap.rooms[room].features.push(returnTile(540,258,13));
    floorMap.rooms[room].features.push(returnTile(544,298,15));
    floorMap.rooms[room].features.push(returnDoor(575,258,18,connection,2));
}
function addDoorTop(room,connection)
{
    removeTiles(262,0,40,20,room);
    floorMap.rooms[room].features.push(returnTile(256,0,16));
    floorMap.rooms[room].features.push(returnTile(280,-5,14));
    floorMap.rooms[room].features.push(returnDoor(280,-31,18,connection,1));
}
function addDoorBottom(room,connection)
{
    removeTiles(262,570,40,20,room);
    floorMap.rooms[room].features.push(returnTile(256,544,16));
    floorMap.rooms[room].features.push(returnTile(256,544,17));
    floorMap.rooms[room].features.push(returnTile(288,544,17));
    floorMap.rooms[room].features.push(returnTile(280,540,14));
    floorMap.rooms[room].features.push(returnDoor(280,575,18,connection,3));
}

function removeTiles(x,y,w,h,room)//removes tiles intersecting with specified zone
{
    for(let i =0;i<floorMap.rooms[room].features.length;i++)
    {
        if(roughCollision(floorMap.rooms[room].features[i].x,floorMap.rooms[room].features[i].y,
            tileList[floorMap.rooms[room].features[i].tileNum].w*2,
            tileList[floorMap.rooms[room].features[i].tileNum].h*2,
            x,y,w,h))
        {
            floorMap.rooms[room].features.splice(i,1);
            i--;
        }
    }
}

function connectRooms()
{
    let current = [0,0];
    let move = 0;
    let valid = true;
    for(let i = 0;i<floorMap.rooms.length;i++) //places rooms randomly if they are valid
    {
        move = Math.floor(Math.random() * 4); //picks a random side of the current room to place a room on
        if(move === 0)
            current[0]++;
        else if(move === 1)
            current[0]--;
        else if(move === 2)
            current[1]++;
        else if(move === 3)
            current[1]--;
        for (let q = 0;q<floorMap.map.length;q++) //checks if placment is valid
            if(floorMap.map[q][0] === current[0] && floorMap.map[q][1] === current[1])
                valid = false;
        if(valid === true) //places room, if valid if not room is ignored
            floorMap.map.push([current[0],current[1],i]);
        valid = true;
    }
    for(let i =0;i<floorMap.map.length;i++) //connects all rooms as defined on generated map
    {
        for (let q = 0; q < floorMap.map.length; q++) {
            if (floorMap.map[i][0] === floorMap.map[q][0] && floorMap.map[i][1] === floorMap.map[q][1] + 1)
                addDoorBottom(floorMap.map[i][2], floorMap.map[q][2]);
            if (floorMap.map[i][0] === floorMap.map[q][0] && floorMap.map[i][1] === floorMap.map[q][1] - 1)
                addDoorTop(floorMap.map[i][2], floorMap.map[q][2]);
            if (floorMap.map[i][1] === floorMap.map[q][1] && floorMap.map[i][0] === floorMap.map[q][0] + 1)
                addDoorRight(floorMap.map[i][2], floorMap.map[q][2]);
            if (floorMap.map[i][1] === floorMap.map[q][1] && floorMap.map[i][0] === floorMap.map[q][0] - 1)
                addDoorLeft(floorMap.map[i][2], floorMap.map[q][2]);
        }
    }
    placeStairs(floorMap.map[floorMap.map.length-1][2]); //places stairs, first attemps last room placed 15 times if fails randomly selects rooms and repeats

    for(let i =1; i < floorMap.map.length; i++)
    {
        if(floorMap.map[i][2] !== floorMap.stairRoom)
        {
            addEnemies(i)
        }
    }
}

function placeStairs(room)
{
    let tempX;
    let tempY;
    let placed = false;
    let attemps = 15; //remaining attempts till a new room is selected
    while(!placed && attemps > 0)
    {
        placed = true;
        tempX = 68 + Math.floor(Math.random() * (440 - (tileList[28].w * 2)));
        tempY = 68 + Math.floor(Math.random() * (440 - (tileList[28].h * 2)));
        for (let q = 0; q < floorMap.rooms[room].features.length; q++)
            if (tileList[floorMap.rooms[room].features[q].tileNum].passable !== 1)
                if (roughCollision(tempX - 20, tempY - 20, (tileList[28].w * 2) + 40, (tileList[28].h * 2) + 40,
                    floorMap.rooms[room].features[q].x, floorMap.rooms[room].features[q].y,
                    tileList[floorMap.rooms[room].features[q].tileNum].w * 2, tileList[floorMap.rooms[room].features[q].tileNum].h * 2))
                    placed = false;
        attemps--;
    }
    if(attemps > 0)
    {
        floorMap.rooms[room].features.push(returnTile(tempX, tempY, 28));
        floorMap.stairRoom = room;
    }
    else
        placeStairs(floorMap.map[Math.floor(1+Math.random()*(floorMap.map.length-2))][2]);//ensuring stairs are placed somewhere on the map
}

function addEnemies(room)
{
    let points = Math.floor(Math.random()*floorMap.floor*2)+2;
    let random;
    while(points > 0)
    {
        random = Math.floor(Math.random()*100)
        if(random <50)
        {
            for(let i=0;i<3;i++)
                floorMap.rooms[room].enemies.push(enemyType1());
            points--;
        }
        else if(random < 75)
        {
            floorMap.rooms[room].enemies.push(enemyType2());
            points--;
        }
    }
}