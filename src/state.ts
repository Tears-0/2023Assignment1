import { Constants, WallKickOffSet, WallKickOffSetI } from "./constant";
import { Blocks, Movement, SVGMetaData, State, Status } from "./types";
import { selectHorizontalMostCube, selectVerticalMostCube, searchCoordInList, revertControl, moveSVG, rotate, levelCalculate } from "./utility";
export { moveBlock };

const testIsValid = (s: State, c: Movement): boolean => {
    if(s.currentCube && !s.gameEnd) {
        const globalCoords = s.cubeAlive.map(x => x.coord);
        const blockCoords = s.currentCube.cubes.map(({coord}) => ({x: coord.x + c.horizontal, y: coord.y + c.gravity}));

        blockCoords
        if(selectHorizontalMostCube(false,blockCoords).x > Constants.GRID_WIDTH-1 || 
            selectHorizontalMostCube(true,blockCoords).x <0 || 
            selectVerticalMostCube(false,blockCoords).y > Constants.GRID_HEIGHT-1) return false;
    
        const impactV = blockCoords.filter(coord => searchCoordInList(coord,globalCoords)).length;
        if(impactV > 0) return false;
    }
    return true;
}

/**
 * Function that legalise illegal move and handle collision
 * @param s State current state
 * @param c Movement control set provided
 * @returns Status new state
 */
const collide = (s: State, c: Movement): Status => {
    if(s.currentCube && !s.gameEnd) {
        const globalCoords = s.cubeAlive.map(x => x.coord);
        const blockCoords = s.currentCube.cubes.map(x => x.coord);
    
        const impactV = blockCoords.filter(coord => searchCoordInList(coord,globalCoords)).length;
        console.log(impactV)

        if(selectHorizontalMostCube(false,s.currentCube).x > Constants.GRID_WIDTH-1 || selectHorizontalMostCube(true,s.currentCube).x <0 || selectVerticalMostCube(false,s.currentCube).y > Constants.GRID_HEIGHT-1 || impactV > 0) {
            if(c.clockwise != 0){
                if(s.currentCube.shape != 'I'){
                    const validKick = WallKickOffSet[s.currentCube.quadrant].map(({x,y}) => new Movement(x,false,y,0)).filter(movement => testIsValid(s,movement));
                    console.log('kick to: ',validKick[0]);
                    if(validKick.length > 0) return moveBlock(validKick[0],s)
                } else{
                    const validKick = WallKickOffSetI[s.currentCube.quadrant].map(({x,y}) => new Movement(x,false,y,0)).filter(movement => testIsValid(s,movement));
                    console.log('kick to: ',validKick[0]);
                    if(validKick.length > 0) return moveBlock(validKick[0],s)
                }
            }
            console.log('revert: ', c, revertControl(c))
            return moveBlock(revertControl(c),s);
        }

        
        // if(selectHorizontalMostCube(false,s.currentCube).x > Constants.GRID_WIDTH-1) {console.log('shift left');return moveBlock(new Movement(-1,false,0,0),s)};
        // if(selectHorizontalMostCube(true,s.currentCube).x <0) {console.log('shift right');return moveBlock(new Movement(1,false,0,0),s)};
        // if(selectVerticalMostCube(false,s.currentCube).y > Constants.GRID_HEIGHT-1) return moveBlock(new Movement(0,false,-1,0),s);
    
        const hitBottom = selectVerticalMostCube(false,s.currentCube).y > Constants.GRID_HEIGHT-2;
        const numberHit = blockCoords.filter(({x,y}) => searchCoordInList({x:x,y:y+1},globalCoords)).length;
        if(hitBottom || numberHit > 0) return handleCollision(s);
    }
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
const handleCollision = (s: State): Status => {
    if(s.skipCollide > 0) return {
        updated: false,
        state:{
            ...s,
            skipCollide: s.skipCollide -1
        }
    }

    if(selectVerticalMostCube(false,s.currentCube as Blocks).y < 1) return {updated: true, state: {...s, gameEnd: true}}

    const allCubes: Array<Array<SVGMetaData>> = s.cubeAlive.concat(s.currentCube?.cubes as Array<SVGMetaData>)
                    .reduce((acc, cube) =>{
                        acc[Constants.GRID_HEIGHT - cube.coord.y - 1].push(cube);
                        return acc;
                    },Array.from({length: Constants.GRID_HEIGHT},() => []) as Array<Array<SVGMetaData>>);
    
    const reachedTop = allCubes[Constants.GRID_HEIGHT-1].length > 0;
    
    const finalState = allCubes.reduce((acc,arr: Array<SVGMetaData>) => {
        if(arr.length >= 10) return{
            ...acc,
            delta: acc.delta + 1,
            deadCube: acc.deadCube.concat(arr) 
        }
        return {
            ...acc,
            result: acc.result.concat(arr.map(element => moveSVG({vertical: acc.delta,horizontal: 0},element)))
        }
    },{
        delta: 0,
        result: [] as Array<SVGMetaData>,
        deadCube: [] as Array<SVGMetaData>
    })
    return {
        updated: true,
        state: {
            ...s,
            gameEnd: reachedTop && finalState.delta==0,
            currentCube: null,
            cubeAlive: finalState.result,
            cubeDead: finalState.deadCube,
            score: s.score + Constants.SCORE_TABLE[finalState.delta],
            level: levelCalculate(s.rowCleared + finalState.delta),
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
    if(s.currentCube && !s.gameEnd){
        const newReC = s.currentCube.relativeCoords.map(coord => rotate(coord,c.clockwise));
        const arr = s.currentCube.relativeCoords.map((coord, index) => ({x: newReC[index].x- coord.x, y: newReC[index].y- coord.y}))
        const newState = {
            ...s,
            currentCube: new Blocks(s.currentCube.shape, 
                    s.currentCube.dimension, 
                    s.currentCube.cubes.map((cube,index) => moveSVG({vertical:c.gravity + arr[index].y,horizontal:c.horizontal + arr[index].x},cube)),
                    s.currentCube.color,
                    newReC,
                    (s.currentCube.quadrant + c.clockwise) % 4),
            cubeDead: [],
            skipCollide: c.push ? 0 : s.skipCollide
        } as State 
        console.log(c)
        const result = collide(newState,c);
        return c.push ? moveBlock(new Movement(0,true, 1,0), result.state) : result;
    } 
    return {
        updated: false,
        state: s
    };
}