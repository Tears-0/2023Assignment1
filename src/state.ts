import { Constants } from "./constant";
import { Blocks, Movement, SVGMetaData, State } from "./types";
import { selectHorizontalMostCube, selectVerticalMostCube, searchCoordInList, revertControl, moveSVG, rotate } from "./utility";
export { moveBlock };

const collide = (s: State, c: Movement): Readonly<{updated: boolean, state: State}> => {
    if(s.currentCube && !s.gameEnd) {
        const globalCoords = s.cubeAlive.map(x => x.coord);
        const blockCoords = s.currentCube.cubes.map(x => x.coord);
        if(selectHorizontalMostCube(false,s.currentCube).x > Constants.GRID_WIDTH-1) return moveBlock(new Movement(-1,false,0,0),s);
        if(selectHorizontalMostCube(true,s.currentCube).x <0) return moveBlock(new Movement(1,false,0,0),s);
        if(selectVerticalMostCube(false,s.currentCube).y > Constants.GRID_HEIGHT-1) return moveBlock(new Movement(0,false,-1,0),s);
    
        const impactV = blockCoords.filter(coord => searchCoordInList(coord,globalCoords)).length;
        if(impactV > 0) return moveBlock(revertControl(c),s);
    
        const hitBottom = selectVerticalMostCube(false,s.currentCube).y > Constants.GRID_HEIGHT-2;
        const numberHit = blockCoords.filter(({x,y}) => searchCoordInList({x:x,y:y+1},globalCoords)).length;
        if(hitBottom || numberHit > 0) return handleCollision(s);
    }
    return {
        updated: false,
        state: s
    };
}

// release current block and remove full row and remove empty row
const handleCollision = (s: State) => {
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
            score: s.score + Constants.SCORE_TABLE[finalState.delta]
        }
    }
}

const moveBlock = (c: Movement, s: State, forceCollide: boolean = false): Readonly<{updated: boolean, state: State}>  => {
    if(s.currentCube && !s.gameEnd){
        const newReC = s.currentCube.relativeCoords.map(coord => rotate(coord,c.clockwise));
        const arr = s.currentCube.relativeCoords.map((coord, index) => ({x: newReC[index].x- coord.x, y: newReC[index].y- coord.y}))
        const result = collide({
            ...s,
            currentCube: new Blocks(s.currentCube.shape, 
                    s.currentCube.dimension, 
                    s.currentCube.cubes.map((cube,index) => moveSVG({vertical:c.gravity + arr[index].y,horizontal:c.horizontal + arr[index].x},cube)),
                    s.currentCube.color,
                    newReC),
            cubeDead: [],
            skipCollide: forceCollide ? 0 : s.skipCollide
        } as State,c);
        return c.push ? moveBlock(new Movement(0,true, 1,0), result.state, true) : result;
    } 
    return {
        updated: false,
        state: s
    };
}