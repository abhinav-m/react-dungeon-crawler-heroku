import React, { Component } from 'react';
import './App.css';


//Makes the game matrix.
const MATRIX = (rows, cols) => {
    let arr = [];
    for (let i = 0; i < rows; i++) {
        arr[i] = [];
        for (let j = 0; j < cols; j++)
            arr[i][j]  = 0;
    }
    return arr;
}

/* The random dungeon creating algorithm
   Do not alter the code unless you are ready to lose your hairline
   and a few years of your life.
*/
const MAKE_DUNGEON = (matrix,isBoss) => {
  //Constants for making dungeon's playable area/cross section.
 const AREA_HEIGHT = 4;
 const AREA_WIDTH = 10;
 var cellsPlacedVert = 0;

//Starting i and j from 1
//and subtracting width and height by 1
//to add border  to playable area.
 for(let i= 1; i< matrix.length -1 ;i++) {
   var cellsPlacedHor = 0;
   for(let j =1; j < matrix[i].length -1 ;j++)
   {
        if(i%5===0){
          if(j%10 === 0 )
          matrix[i][j-3] = 1;
        }
        else {
          if( cellsPlacedHor === AREA_WIDTH ) {
            //Add connection to the matrix on the right ( if on the middle of area height)
            if( cellsPlacedVert === AREA_HEIGHT/2 )
            matrix[i][j] = 1;
            cellsPlacedHor = 0;
          }
          else {
            matrix[i][j] = 1;
            cellsPlacedHor++;
          }
        }

  }

  cellsPlacedVert++;
    if(cellsPlacedVert === AREA_HEIGHT) {
      cellsPlacedVert = 0;
    }
 }
 //Add Player in center of matrix(approx)
 matrix[13][16] = 6;
//Add health.
ADD_RANDOM_CHAR(matrix,2,9);
//Add enemies.
 ADD_RANDOM_CHAR(matrix,3,6);
//Add weapon.
 ADD_RANDOM_CHAR(matrix,4,1);
//Add next level entrance (unless its final level)
if(!isBoss)
ADD_RANDOM_CHAR(matrix,5,1);
//Add boss if its the last boss stage
if(isBoss)
ADD_RANDOM_CHAR(matrix,7,1);
 return matrix;
}

//Adds the passed character to the matrix randomly,
//Works in three phases so things are (a little) more uniformly distributed.
//num is the number of items to be added.
const ADD_RANDOM_CHAR = (matrix,character,num) => {
  var ROW_MIN, ROW_MAX;

  const COL_MIN = 1;
  const COL_MAX = 54;
  var phase;




  for(let i = 1;i<=num;i++) {
    phase = getRandomInclusive(1,3);
    if(phase === 1) {
       ROW_MIN = 1;
       ROW_MAX = 4;
    }
    if(phase === 2) {
       ROW_MIN = 6;
       ROW_MAX = 9;
    }
    if(phase === 3) {
      ROW_MIN = 11;
      ROW_MAX = 15;
    }
    //Generate random row between ROW_MIN and ROW_MAX.
     let randomRow = getRandomInclusive(ROW_MIN,ROW_MAX);
    //Generate random column between COL_MIN and COL_MAX
     let randomCol = getRandomInclusive(COL_MIN,COL_MAX);
    while(randomCol === 11 || randomCol === 22)
     randomCol = getRandomInclusive(COL_MIN,COL_MAX);

   //Add check whether tile generated is empty.
    while(matrix[randomRow][randomCol] !== 1)
    randomRow = getRandomInclusive(ROW_MIN,ROW_MAX);
     //Add the random character
     matrix[randomRow][randomCol] = character;
  }

}

//Helper function to generate random value (inclusive) between two values.
const getRandomInclusive = (min,max) => Math.floor(Math.random() * (max - min + 1) )  + min;

//Logic for revealing neighbours adjacent to player position.
const getRevealedNeighbours = (row,col) => {
  let neighbours =[[-1, 0],
            [-1, 1],
            [0, 1],
            [1, 1],
            [1, 0],
            [1, -1],
            [0, -1],
            [-1, -1]];
    let revealed = [];
    neighbours.forEach( v => {
      if(Math.abs(v[1]) === 1) {
        revealed.push( (row+v[0]) + ',' + (col+v[1]) );
        revealed.push( (row+v[0]) + ',' + (col+v[1]*2) );
        revealed.push( (row+v[0]) + ',' + (col+v[1]*3) );
      }
      else
      revealed.push( (row+v[0]) + ',' + (col+v[1]) );

     });
    return revealed;
}


const InstructionScreen = () => {
  return(<div className ='instructionBoard'>
  <h1>Instructions</h1>
<ul>
<li className='instruction' >Each level contains enemies  who grant you experience on killing them. When you come in contact with an enemy you deal damage to them, while taking damage in return. <span className ='right enemy'></span></li>
<li className='instruction' >The HUD on the top of the screen displays your healthbar(in green),your current level,your weapon and the experience needed to level up.</li>
<li className='instruction' >Each level contains one unique weapon  which will make you much stronger to help fight your enemies. Your current weapon along with your level determines how much damage you will deal to your enemies. <span className ='right weapon-2'></span></li>
<li className='instruction' >Health potions are spread throughout the map to help you in case your health falls low. <span className ='right health'></span> </li>
<li className='instruction' >To proceed to the next level, find the entrance  NOTE: ONCE YOU ENTER THE NEXT LEVEL YOU CANT TURN BACK. <span className ='right nextLevel'></span>. </li>
<li className='instruction' >The objective of the game is to beat the BOSS in the 4th dungeon. </li>
<li className='instruction' >Use the arrow keys to move around in the game. </li>
<li className='instruction' >Good luck, may the force be with you. </li>
</ul>
  </div>)
}

class Game extends Component {
  constructor(props) {
    super(props);
    this.level = MAKE_DUNGEON(MATRIX(16,56));
    this.revealed = getRevealedNeighbours(13,16);
    this.revealed.push(13+','+16);
    this.state = {
      level: this.level,
      player_pos_board :   [13,16],
      movIndex:0,
      movClass:'lord-up-0',
      playerDIR:38,
      revealed:this.revealed,
      weapon:0,
      weapons:['Fists','Needle','LongClaw','LightBringer'],
      health:100,
      levelNum:1,
      playerLevel:1,
      playerExp:0,
      enemies: {},
      bossHealth:250,
      isWin:false,
      isLoss:false,
      gameStarted:false
    }
    this.moveChar = this.moveChar.bind(this);
    this.startGame = this.startGame.bind(this);
    this.resetGame = this.resetGame.bind(this);
  }

  componentDidMount(){
   document.addEventListener("keydown", this.moveChar, false);
 }
 componentWillUnmount(){
   document.removeEventListener("keydown", this.moveChar, false);
 }

//start game,initialise everything.
 startGame() {
   let level = MAKE_DUNGEON(MATRIX(16,56));
   let revealed = getRevealedNeighbours(13,16);
   revealed.push(13+','+16);
   this.setState({
     level:level,
     player_pos_board :   [13,16],
     movIndex:0,
     movClass:'lord-up-0',
     playerDIR:38,
     revealed:revealed,
     weapon:0,
     weapons:['Fists','Needle','LongClaw','LightBringer'],
     health:100,
     levelNum:1,
     playerLevel:1,
     playerExp:0,
     enemies: {},
     bossHealth:250,
     isWin:false,
     isLoss:false,
     gameStarted:true
   });
 }

 resetGame() {
this.setState({
  gameStarted:false
})
 }

//Check if key pressed is arrow key
isArrowKey(key) {
  return (key === 37 || key === 38 || key === 39 || key === 40  )
}

 moveChar(e) {

   if(this.isArrowKey(e.which)) {
   //The whole board.
   let level = this.state.level;

   //Player position in the level.
   let player_row_board = this.state.player_pos_board[0];
   let player_col_board = this.state.player_pos_board[1];

   //Movement of player direction currently.
   let playerDIR = this.state.playerDIR;
   //index for movement animation(3 steps to move.)
   let movIndex =this.state.movIndex;
   //Boolean for moving to next levle and resetting the board.
   var isNewLevel = false;
   //Stop the event from propogating, to prevent screen from scrolling.
   e.preventDefault();
   e.stopPropagation();
 //Player can move in one direction three times, after that it has to reset
 //for animating the player movement.
 //If movement is in the current direction,
   if(e.which === playerDIR) {
     //Reset the movement if it is complete.
     if(movIndex === 3)
     movIndex = 0;
     else
     movIndex++;
   }
   //else reset the movement direction and the index to 0.
   else {
   movIndex = 0;
   playerDIR = e.which;
  }

   var movClass;

   /* left = 37
   up = 38
   right = 39
   down = 40 */
//FIX:Player exceeding board edge while moving left and right.

  switch(e.which) {
    //Check if any untraversable part has been reached.
    case 38:  movClass =`lord-up-${movIndex}`;
    if( this.canMove(player_row_board-1,player_col_board) ){
      level[player_row_board][player_col_board] = 1;
       player_row_board--;
       if(level[player_row_board][player_col_board] === 5)
       isNewLevel = true;
       else
       level[player_row_board][player_col_board] = 6;

      }
                 break;
   case 37:      movClass = `lord-left-${movIndex}`;
    if( this.canMove(player_row_board,player_col_board-1) ){
       level[player_row_board][player_col_board] = 1;
            player_col_board--;
            movClass = `lord-left-${movIndex}`;
            if(level[player_row_board][player_col_board] === 5)
            isNewLevel = true;
            else
            level[player_row_board][player_col_board] = 6;
          }
            break;
  case 39: movClass = `lord-right-${movIndex}`;
  if( this.canMove(player_row_board,player_col_board+1 ) ){
      level[player_row_board][player_col_board] = 1;
           player_col_board++;
           movClass = `lord-right-${movIndex}`;
           if(level[player_row_board][player_col_board] === 5)
           isNewLevel = true;
           else
           level[player_row_board][player_col_board] = 6;
         }
           break;

   case 40:movClass =`lord-down-${movIndex}`;
   if( this.canMove(player_row_board+1,player_col_board) ){
     level[player_row_board][player_col_board] = 1;
            player_row_board++;
            if(level[player_row_board][player_col_board] === 5)
            isNewLevel = true;
            else
            level[player_row_board][player_col_board] = 6;
          }
              break;

  default: console.log('wrong key press')
  }
///Code for resetting level once entrance has been reached

 if(isNewLevel) {
   let curLevel = this.state.levelNum;
   curLevel++;
   let newLevel =  MAKE_DUNGEON(MATRIX(16,56),curLevel === 4);
   let newRevealed = getRevealedNeighbours(13,16);
   newRevealed.push(13+','+16);
   let newEnemies = {};

   //Set state for new level
   this.setState({
     player_pos_board :   [13,16],
     levelNum:curLevel,
     movIndex:0,
     movClass:'lord-up-0',
     playerDIR:38,
     level:newLevel,
     enemies:newEnemies,
     revealed: newRevealed
   });
 }
 else {
let revealed = getRevealedNeighbours(player_row_board,player_col_board);
revealed.push(player_row_board+','+player_col_board);
  this.setState({
    player_pos_board:[player_row_board,player_col_board],
    movClass:movClass,
    movIndex:movIndex,
    playerDIR:playerDIR,
    level:level,
    revealed: revealed
     });
   }
 }
}

cellClass(cellType,pos) {
  //0 -> Unpassable terrain, 1 -> part of dungeon, 2 -> Health ,3 -> enemy ,4 -> weapon,5-> next level entrance,6-> Player position.
  const cells = ['cell','cell dungeon','cell dungeon health','cell dungeon enemy',`cell dungeon  weapon-${this.state.levelNum}`,'cell dungeon nextLevel',`cell dungeon   ${this.state.movClass}`,`cell dungeon boss`];
  if(pos==='9,16')
  console.log('test');
  return this.state.revealed.includes(pos) ? cells[cellType] : cells[cellType]+' hidden';
}

// TODO: Helper function to determine if character can move to cell or not.
canMove(row,col) {
  let level = this.state.level;
  let cell = level[row][col];
  if(  cell !== 0 ) {
    switch(cell) {
      case 2: //Add health code.
      let health = this.state.health;
      health += Math.ceil( ( (50 * this.state.playerLevel) + 50) / 4);
      this.setState({
        health:health
      });
      console.log("health"+health);
        break;
      case 3: //Add enemy code.
      let enemies = this.state.enemies;
      var enemyHealth;
      //Check enemy health and attack.
      if (enemies.hasOwnProperty(row+','+col)) {
        //Do damage to enemy, if dead allow movement.
        enemyHealth = enemies[row+','+col];

      }
      else {
        //Encountered enemy is new, its health is maximum.
        let levelNum = this.state.levelNum;
        enemyHealth =  50 * levelNum;

      }
      //Get details such as player level, current level in the game, weapon,current health of player etc.
      let playerLevel = this.state.playerLevel;
      let gameLevel = this.state.levelNum;
      let curWeapon = this.state.weapon;
      let playerHealth = this.state.health;
      let playerExp = this.state.playerExp;
      var isDead = false;
      let maxEnemyhealth = 50 * gameLevel;
      let canMove = false;
      var minDamage,maxDamage;
      //Calculate damage done by player based on his weapon and current game level.
      if(curWeapon === playerLevel && playerLevel >= gameLevel){
       minDamage = Math.ceil(maxEnemyhealth / 6);
       maxDamage = Math.ceil(maxEnemyhealth / 4);
      }
      else {
       minDamage = Math.ceil(maxEnemyhealth / 8);
       maxDamage = Math.ceil(maxEnemyhealth / 6);
      }
      let damageDone = getRandomInclusive(minDamage,maxDamage);
      //Calculate damage done by enemy done to player based on current game level( random between a range, inclusive)
      let minDamageEnemy = ( gameLevel * (gameLevel -1) ) + 3;
      let maxDamageEnemy = minDamageEnemy  * 2;
      let enemyDamage = getRandomInclusive(minDamageEnemy,maxDamageEnemy);
      //Reduce player health <=0 dead.
      playerHealth -= enemyDamage;
      if(playerHealth <=0 ) {
        isDead = true;
      }
      console.log("player dead:"+isDead);
      //Reduce that particular enemies health, and assign to enemies object.
      enemyHealth -= damageDone;
      if(enemyHealth<=0){
      canMove = true;
      playerExp += 20;
      if (playerExp === 100){
      playerLevel++;
      playerHealth = 50 * playerLevel + 50;
      console.log("player levelled, exp/health reset");
      playerExp = 0;
      }
    }
      else {
      enemies[row+','+col] = enemyHealth;
      }

      this.setState({
        enemies:enemies,
        health:playerHealth,
        playerExp:playerExp,
        playerLevel:playerLevel,
        isLoss: isDead
      })
      return canMove;
        break;
      case 4: //Add weapon code.
      let levelNum = this.state.levelNum;

      this.setState({
        weapon:levelNum
      });
      console.log("weapon"+levelNum);
        break;
      case 7:
      //Getting all values needed for boss fight.
      let playerLevelB = this.state.playerLevel;
      let gameLevelB = this.state.levelNum;
      let curWeaponB = this.state.weapon;
      let playerHealthB = this.state.health;
      let canMoveB = false;
      var minDamageB ,maxDamageB;
      let bossHealth = this.state.bossHealth;
      var isWin = false, isLoss = false;
      //Checking if player is correctly levelled and has max weapon.
      if(curWeaponB === playerLevelB && playerLevelB > gameLevelB){
       minDamageB = Math.ceil(250 / 6);
       maxDamageB = Math.ceil(250 / 4);
      }
      else {
        minDamageB = Math.ceil(250 / 8);
        maxDamageB = Math.ceil(250 / 6);
      }
      //Calculte damage done to boss.
      let bossDamageDone = getRandomInclusive(minDamageB,maxDamageB);
      //Calculate damage done by boss.
      let bossDealtDamage = getRandomInclusive(40,45);
      playerHealthB -= bossDealtDamage;
      bossHealth -= bossDamageDone;
      //Player moves if boss dies.
      if(bossHealth <= 0 ){
      canMoveB =  true;
      isWin = true;
     }
     if(playerHealthB <=0) {
       isLoss = true;
     }
      this.setState({
        health:playerHealthB,
        bossHealth:bossHealth,
        isWin:isWin,
        isLoss:isLoss
      });
      console.log("Boss health:"+bossHealth);
      return canMoveB;
      break;
      default:console.log('bug');
    }
    return true;
  }
  return false;
}


  render() {
    if(!this.state.gameStarted)
    return (<div className = 'welcomeScreen'><div className='startButton' onClick = {this.startGame}>Start game</div><InstructionScreen></InstructionScreen></div>);
    if(this.state.isLoss)
    return(<div className = 'endScreen'><div className='resetButton' onClick ={this.resetGame}><i className=" blue fas fa-redo"></i></div><h1>You died. Game over.</h1><i className="red fas fa-frown fa-4x"></i></div>)
    else if(this.state.isWin)
      return(<div className ='endScreen'><div className='resetButton'  onClick ={this.resetGame}><i className=" blue fas fa-redo"></i></div><h1>You saved the world from total destruction!</h1><i className="green fas fa-smile fa-4x"></i></div>)
      else
    return (
      <div className ="App" autoFocus='true' >
      <div className ="gameInfo">
      <h1>Dungeon:{this.state.levelNum}</h1>
      <div>Lv.{this.state.playerLevel}<progress className ='healthBar' value={this.state.health} max={this.state.playerLevel * 50 + 50}></progress>  Exp: <progress className ='Experience' value={this.state.playerExp} max={100}></progress></div>
      <div>Weapon: {this.state.weapons[this.state.weapon]}</div>
      </div>
      <hr/>
      <div className="wrapper" >
        {this.state.level.map ( (r,i) => {
          return (<div className='row'
                    key={i}
                    id={i}>
          {r.map( (v,j) => <div className = { this.cellClass(this.state.level[i][j],i+','+j)  } key ={i+','+j} id ={i+','+j}> </div>)}
        </div>) } ) }
      </div>

      </div>
    );
  }
}

export default Game;
