# Roguelite


Controls: 
WASD for movement
right click to shoot


current development goals/ideas

-All enemies give out exp/gold bosses give out a-lot on some floors a room with only a shopkeeper will spawn while standing on the shop keeper an upgrade menu is activated. 

The bosses should give a lot of exp/gold that can be used to purchase upgrades at a shop
-players movement speed max 5?,
-weapon damage unlimited maximum?,
-weapon recharge time 7 frames minimum?,
-Number of bullets allowed no max needed,
-maximum hp max 20?,
-number of bullets fired in a spread per shot max 5?

system
-the ladder does not appear until the boss is dead -set flag on floor creation to hide stairs have boss death remove flag

a transition animation for going down ladders to make it less abrupt and to cover the frame hitch generating a new floor causes
-could be done with a flag similar to the gameOver flag to disable player movement and then re-enable after new floor is loaded

Use sprites for UI system not only do they look better text is really slow on canvas - started

enemies should gain stats, hp and damage and some movement speed per dungeon level -UNIMPORTANT

health pickups should be implemented as enemies that do negative damage on hit
-when enemies dies they have a chance to spawn an hp pickup that just moves towards you
-negative dmg on contact but if your current hp > maxhp current hp = maxhp

traps that fire fireballs at set intervals in set directions cannot die -easy -IMPORTANT

slime that moves at 90 deg angles when he encounters a wall should be pushed back his speed and turn 90 deg -medium -IMPORTANT

boss ideas
-giant slime that charges and destroys obstacles in path leaving a slowing trail behind him -hard
-necromancer teleports' around and summons bats en mass -easy

boss hp bars
-have the boss draw to ui
-have the boss set a flag
