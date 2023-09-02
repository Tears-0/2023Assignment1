import { Constants } from "./constant";
import { Blocks, Control, Coord, Movement, SVGMetaData, State, Status, TestResult } from "./types";
import { selectMostCube, searchCoordInList, revertControl, moveSVG, levelCalculate, createBlock, applyMovement, getCoords, randomSelect } from "./utility";
export { initialState, reduceState };

const randomSelectBlock = randomSelect(Constants.BLOCK_TYPE);
/** State processing */
const initialState: State = {
    gameEnd: false,
    cubeAlive: [],
    currentBlock: createBlock(randomSelectBlock())(`B0`)(),
    cubePreview: createBlock(randomSelectBlock())(`B0`)(true),
    blockOnHold: null,
    swapped: false,
    score: 0,
    cubeDead: [],
    cubePreviewDead: [],
    skipCollide: 5,
    highScore: 0,
    totalBlockGenerated: 1,
    level: 1,
    rowCleared: 0
  } as State;

const reduceState =  (s: State,c: Number | Movement | Control): State => {
    //If user input, apply to current block
    if(c instanceof Movement) {
        return moveBlock(c)(s).state
      }
      //If user input restart and game has ended, restart game
      else if(c instanceof Control){
        if(c.restart && s.gameEnd){
          return {
            ...s,
            gameEnd: false,
            currentBlock: createBlock(randomSelectBlock())(`B0`)(),
            cubePreview: createBlock(randomSelectBlock())(`B1`)(true),
          } as State
        }
        return s
      } 
      //Else see should we tick, if current level is higher, faster it ticks.
      return (c as number % Math.max(11-s.level, 1) == 0 ? tick(s) : s);
}

/**
 * Updates the state by proceeding with one time step.
 *
 * @param s Current state
 * @returns Updated state
 */
const tick = (s: State): State => {
    if(s.gameEnd) return {
      ...initialState,
      gameEnd: true,
      highScore: s.score > s.highScore ? s.score : s.highScore,
    }

    const applyGravity = moveBlock(new Movement(0,false,1,0,false));

    //If currentBlock is null, create a new one
    return !s.currentBlock ?
        applyGravity({
            ...s,
            //Here use preview shape
            currentBlock: 
                createBlock(s.cubePreview.shape)(`B${s.totalBlockGenerated}`)(),

            cubePreviewDead: s.cubePreview.cubes,

            cubePreview: 
                createBlock(randomSelectBlock())(`B${s.totalBlockGenerated}`)(true),

            skipCollide: 5,
            totalBlockGenerated: s.totalBlockGenerated + 1
        }).state : 
    //If it is normal game, apply gravity to current block
    applyGravity(s).state;
  };


/**
 * Function to move current block with provided control set
 * @param c Movement control set provided
 * @param s State current state
 * @returns Status new State
 */
const moveBlock = (c: Movement) => (s: State): Status  => {
    if(s.currentBlock && !s.gameEnd){
        //Apply the movement provided
        const newState: State = {
            ...s,
            //Always create new block while swapping current block and block on hold with same shape
            blockOnHold: 
                c.hold && !s.swapped ?  
                    createBlock(s.currentBlock.shape)('hold')(true) : 
                    s.blockOnHold,

            //Test if ready to swap with block on hold
            currentBlock: 
                c.hold && !s.swapped ? 
                    (s.blockOnHold ? 
                        createBlock(s.blockOnHold.shape)(`B${s.totalBlockGenerated}`)() :
                        null) : 
                    applyMovement(s.currentBlock)(c),

            swapped: c.hold || s.swapped,
            cubeDead: c.hold && !s.swapped ? s.currentBlock.cubes : [],

            totalBlockGenerated: 
                c.hold && !s.swapped ? 
                    s.totalBlockGenerated + 1 : 
                    s.totalBlockGenerated,

            skipCollide: c.push ? 0 : s.skipCollide
        }

        //Indicates whether is the movement valid
        const result: Status = 
            newState.currentBlock ? 
                collide(newState)(c)(newState.currentBlock as Blocks) : 
                {updated: true, state: newState};

        //If it is to push, move the block further downward.
        return c.push ? 
            moveBlock(new Movement(0,true, 1,0,false))(result.state) : 
            result;
    } 

    return {
        updated: false,
        state: s
    };
}   

/**
 * Function that legalise illegal move and handle collision
 * @param s State current state
 * @param c Movement control set provided
 * @returns Status new state
 */
const collide = (s: State) => (c: Movement) =>  (b: Blocks): Status => {
    const testResult: TestResult = testIsValid(s)(b);
    //If the block has impact on other block or wall and is rotating, try wallkick 
    if(testResult.hitBlock) {
        if(c.clockwise != 0){
            const validKick: ReadonlyArray<Movement> = 
                (b.shape != 'I' ? 
                    Constants.WALL_KICK_OFFSET[b.quadrant] : 
                    Constants.WALL_KICK_OFFSET_I[b.quadrant])
                .map(({x,y}) => new Movement(x,false,y,0,false))
                .filter(movement => 
                    !testIsValid(s)(applyMovement(b)(movement)).hitBlock);

            if(validKick.length > 0) return moveBlock(validKick[0])(s);
        }
        //If unable to kick, revert control.
        return moveBlock(revertControl(c))(s);
    }
    if(testResult.hitBottom) return handleCollision(s)(b);

    return {
        updated: false,
        state: s
    };
}

/**
 * Function that determines that a block is in illegal position (Out of bound, duplicate position).
 * @param s State current state
 * @param c Movement previous or next movement to be apply on current block
 * @param b Blocks current block
 * @param beforeMovement Boolean is c provided applied?
 * @returns TestResult indicates block is out of bound, hit another block or hit bottom
 */
const testIsValid = (s: State) => (b:Blocks): TestResult => {
    const globalCoords: ReadonlyArray<Coord> = getCoords(s.cubeAlive);
    const blockCoords: ReadonlyArray<Coord> = getCoords(b);

    //Indicates blocks has been out of bound, or has same position as other block
    const impact: boolean = 
        (selectMostCube(false)(b)(c=>c.x) > Constants.GRID_WIDTH-1) || 
        (selectMostCube(true)(b)(c=>c.x) <0) || 
        (selectMostCube(false)(b)(c=>c.y) > Constants.GRID_HEIGHT-1) ||
        (blockCoords.filter(searchCoordInList(globalCoords)).length > 0);

    //Indicates blocks has something else bottom.
    const bottom: boolean = 
        (selectMostCube(false)(b)(x=>x.y) > Constants.GRID_HEIGHT-2) || 
        (blockCoords.filter(({x,y}) => 
            searchCoordInList(globalCoords)({x:x,y:y+1})).length > 0);

    return {
        hitBlock: impact,
        hitBottom: bottom
    } as TestResult;
}

/**
 * Function that handle collision, release current block, remove full row, score and level calculation
 * @param s State current state
 * @returns Status new state
 */
const handleCollision = (s: State) => (b: Blocks): Status => {
    if(s.skipCollide > 0) return {
        updated: false,
        state:{
            ...s,
            skipCollide: s.skipCollide -1
        }
    } as Status;
    //If collide at roof, game end. 
    if(selectMostCube(false)(b)(c=>c.y) < 1) 
        return {updated: true, state: {...s, gameEnd: true}}

    //Map all cubes into 2d array by its position.
    const allCubes: ReadonlyArray<ReadonlyArray<SVGMetaData>> = 
        s.cubeAlive.concat(b.cubes)
            .reduce((acc, cube) =>
                acc.map((arr,index) => 
                    index == Constants.GRID_HEIGHT - cube.coord.y - 1 ? arr.concat([cube]) : arr),
                Array.from({length: Constants.GRID_HEIGHT},() => []) as ReadonlyArray<ReadonlyArray<SVGMetaData>>);

    const reachedTop: boolean = allCubes[Constants.GRID_HEIGHT-1].length > 0;
    
    //Check all row if has 10 cubes, remove it from grid
    const finalState: Readonly<{delta: number, result: ReadonlyArray<SVGMetaData>, deadCube: ReadonlyArray<SVGMetaData>}> = 
        allCubes.reduce((acc,arr: ReadonlyArray<SVGMetaData>) => ({
            ...acc,
            delta: arr.length >= 10 ? acc.delta + 1 : acc.delta,
            deadCube: arr.length >= 10 ? acc.deadCube.concat(arr) : acc.deadCube,
            result: arr.length >= 10 ? 
                acc.result : 
                acc.result.concat(arr.map(element => 
                    moveSVG({vertical: acc.delta,horizontal: 0})(element)))
        }),{
            delta: 0,
            result: [] as ReadonlyArray<SVGMetaData>,
            deadCube: [] as ReadonlyArray<SVGMetaData>
        });

    return {
        updated: true,
        state: {
            ...s,
            gameEnd: reachedTop && finalState.delta==0,
            currentBlock: null,
            swapped: false,
            cubeAlive: finalState.result,
            cubeDead: finalState.deadCube,
            score: s.score + Constants.SCORE_TABLE[finalState.delta] * s.level,
            level: levelCalculate(s.rowCleared + finalState.delta)() + 1,
            rowCleared: s.rowCleared + finalState.delta
        } as State
    }
}
