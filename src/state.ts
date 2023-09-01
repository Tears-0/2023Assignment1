import { Constants, WallKickOffSet, WallKickOffSetI } from "./constant";
import { Blocks, Coord, Movement, SVGMetaData, State, Status, TestResult } from "./types";
import { selectHorizontalMostCube, selectVerticalMostCube, searchCoordInList, revertControl, moveSVG, rotate, levelCalculate, createBlock } from "./utility";
export { moveBlock };

/**
 * Function that determines that a block is in illegal position (Out of bound, duplicate position).
 * @param s State current state
 * @param c Movement previous or next movement to be apply on current block
 * @param b Blocks current block
 * @param beforeMovement Boolean is c provided applied?
 * @returns TestResult indicates block is out of bound, hit another block or hit bottom
 */
const testIsValid = (s: State, c: Movement, b:Blocks, beforeMovement: boolean): TestResult => {
    const globalCoords: ReadonlyArray<Coord> = s.cubeAlive.map(x => x.coord);
    const blockBefore: ReadonlyArray<Coord> = b.cubes.map(({coord}) => ({x: coord.x , y: coord.y}));
    const blockAfter: ReadonlyArray<Coord> = b.cubes.map(({coord}) => ({x: coord.x + c.horizontal, y: coord.y + c.gravity}));
    const blockCoords: ReadonlyArray<Coord> = beforeMovement ? blockBefore : blockAfter;

    const impact: boolean = (selectHorizontalMostCube(false, blockCoords).x > Constants.GRID_WIDTH-1) || 
        (selectHorizontalMostCube(true, blockCoords).x <0) || 
        (selectVerticalMostCube(false, blockCoords).y > Constants.GRID_HEIGHT-1) ||
        (blockCoords.filter(coord => searchCoordInList(coord,globalCoords)).length > 0);

    const bottom: boolean = (selectVerticalMostCube(false,blockCoords).y > Constants.GRID_HEIGHT-2) || 
        (blockCoords.filter(({x,y}) => searchCoordInList({x:x,y:y+1},globalCoords)).length > 0);

    return {
        hitBlock: impact,
        hitBottom: bottom
    } as TestResult;
}
    

/**
 * Function that legalise illegal move and handle collision
 * @param s State current state
 * @param c Movement control set provided
 * @returns Status new state
 */
const collide = (s: State, c: Movement, b: Blocks): Status => {
    const testResult: TestResult = testIsValid(s,c,b,true);
    if(testResult.hitBlock) {
        if(c.clockwise != 0){
            const offsets = b.shape != 'I' ? WallKickOffSet[b.quadrant] : WallKickOffSetI[b.quadrant];
            const validKick = offsets.map(({x,y}) => new Movement(x,false,y,0,false)).filter(movement => !testIsValid(s,movement,b, false).hitBlock);

            if(validKick.length > 0) return moveBlock(validKick[0],s);
        }
        return moveBlock(revertControl(c),s);
    }

    if(testResult.hitBottom) return handleCollision(s, b);

    return {
        updated: false,
        state: s
    };
}

/**
 * Function that handle collision, release current block, remove full row, score and level calculation
 * @param s State current state
 * @returns Status new state
 */
const handleCollision = (s: State, b: Blocks): Status => {
    if(s.skipCollide > 0) return {
        updated: false,
        state:{
            ...s,
            skipCollide: s.skipCollide -1
        }
    }

    if(selectVerticalMostCube(false,b).y < 1) return {updated: true, state: {...s, gameEnd: true}}

    const allCubes: ReadonlyArray<ReadonlyArray<SVGMetaData>> = s.cubeAlive.concat(b.cubes)
                    .reduce((acc, cube) =>
                        acc.map((arr,index) => index == Constants.GRID_HEIGHT - cube.coord.y - 1 ? arr.concat([cube]) : arr),
                        Array.from({length: Constants.GRID_HEIGHT},() => []) as ReadonlyArray<ReadonlyArray<SVGMetaData>>);
    
    const reachedTop: boolean = allCubes[Constants.GRID_HEIGHT-1].length > 0;
    
    const finalState: Readonly<{delta: number, result: ReadonlyArray<SVGMetaData>, deadCube: ReadonlyArray<SVGMetaData>}> = allCubes.reduce((acc,arr: ReadonlyArray<SVGMetaData>) => {
        return arr.length >= 10 ? {
            ...acc,
            delta: acc.delta + 1,
            deadCube: acc.deadCube.concat(arr) 
        } : {
            ...acc,
            result: acc.result.concat(arr.map(element => moveSVG({vertical: acc.delta,horizontal: 0},element)))
        }
    },{
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
            cubeAlive: finalState.result,
            cubeDead: finalState.deadCube,
            score: s.score + Constants.SCORE_TABLE[finalState.delta] * s.level,
            level: levelCalculate(s.rowCleared + finalState.delta) + 1,
            rowCleared: s.rowCleared + finalState.delta
        } as State
    }
}

/**
 * Function to move current block with provided control set
 * @param c Movement control set provided
 * @param s State current state
 * @returns Status new State
 */
const moveBlock = (c: Movement, s: State): Status  => {
    if(s.currentBlock && !s.gameEnd){
        const newReC: ReadonlyArray<Coord> = s.currentBlock.relativeCoords.map(coord => rotate(coord,c.clockwise));
        const arr: ReadonlyArray<Coord> = s.currentBlock.relativeCoords.map((coord, index) => ({x: newReC[index].x- coord.x, y: newReC[index].y- coord.y}))
        const newState: State = {
            ...s,
            blockOnHold: c.hold && !s.swapped ?  createBlock(s.currentBlock.shape,'hold',true) : s.blockOnHold,
            currentBlock: c.hold && !s.swapped ? (s.blockOnHold ? createBlock(s.blockOnHold.shape, `B${s.totalBlockGenerated}`) : null) : new Blocks(s.currentBlock.shape, 
                    s.currentBlock.dimension, 
                    s.currentBlock.cubes.map((cube,index) => moveSVG({vertical:c.gravity + arr[index].y,horizontal:c.horizontal + arr[index].x},cube)),
                    s.currentBlock.color,
                    newReC,
                    (s.currentBlock.quadrant + c.clockwise) % 4),
            cubeDead: c.hold && !s.swapped ? s.currentBlock.cubes : [],
            totalBlockGenerated: c.hold && !s.swapped ? s.totalBlockGenerated + 1 : s.totalBlockGenerated,
            skipCollide: c.push ? 0 : s.skipCollide
        }
        const result: Status = newState.currentBlock ? collide(newState,c, newState.currentBlock as Blocks) : {updated: true, state: newState};
        return c.push ? moveBlock(new Movement(0,true, 1,0,false), result.state) : result;
    } 

    return {
        updated: false,
        state: s
    };
}