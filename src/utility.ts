import { from, map, filter, reduce, last } from "rxjs";
import { Blocks, Control, Coord, Movement, SVGMetaData, State } from "./types";
import { Block } from "./constant";
import { createCube, createSvgElement } from "./render";
import { Constants } from "./constant";
export { moveBlock, createBlock, collide }

/** Utility functions */
const createBlock = (shape: string, id: string, preview: boolean = false): Blocks =>{
    let xDelta = preview ? -1 : 0;
    let yDelta = preview ? 2 : 0;
    if(shape === 'T'){
        return new Blocks(shape,[3,3],[{id:`${id}-1-${preview ? 'preview' : 'real'}`,coord:{x:3+xDelta,y:0+yDelta},colour: 'purple'},{id:`${id}-2-${preview ? 'preview' : 'real'}`,coord:{x:4+xDelta,y:0+yDelta},colour: 'purple'},{id:`${id}-3-${preview ? 'preview' : 'real'}`,coord:{x:5+xDelta,y:0+yDelta},colour: 'purple'},{id:`${id}-4-${preview ? 'preview' : 'real'}`,coord:{x:4+xDelta,y:-1+yDelta},colour: 'purple'}],'purple',[{x:-1,y:0},{x:0,y:0},{x:1,y:0},{x:0,y:-1}])
    }
    else if(shape === 'O'){
        return new Blocks(shape,[2,2],[{id:`${id}-1-${preview ? 'preview' : 'real'}`,coord:{x:4+xDelta,y:0+yDelta},colour: 'yellow'},{id:`${id}-2-${preview ? 'preview' : 'real'}`,coord:{x:5+xDelta,y:0+yDelta},colour: 'yellow'},{id:`${id}-3-${preview ? 'preview' : 'real'}`,coord:{x:4+xDelta,y:-1+yDelta},colour: 'yellow'},{id:`${id}-4-${preview ? 'preview' : 'real'}`,coord:{x:5+xDelta,y:-1+yDelta},colour: 'yellow'}],'yellow',[{x:0,y:0},{x:0,y:0},{x:0,y:0},{x:0,y:0}])
    }
    else if(shape === 'I'){
        return new Blocks(shape,[4,4],[{id:`${id}-1-${preview ? 'preview' : 'real'}`,coord:{x:4+2*xDelta,y:0+yDelta},colour: 'cyan'},{id:`${id}-2-${preview ? 'preview' : 'real'}`,coord:{x:5+2*xDelta,y:0+yDelta},colour: 'cyan'},{id:`${id}-3-${preview ? 'preview' : 'real'}`,coord:{x:6+2*xDelta,y:0+yDelta},colour: 'cyan'},{id:`${id}-4-${preview ? 'preview' : 'real'}`,coord:{x:7+2*xDelta,y:0+yDelta},colour: 'cyan'}],'cyan',[{x:-1,y:1},{x:0,y:1},{x:1,y:1},{x:2,y:1}])
    }
    else if(shape === 'S'){
        return new Blocks(shape,[3,3],[{id:`${id}-1-${preview ? 'preview' : 'real'}`,coord:{x:4+xDelta,y:0+yDelta},colour: 'green'},{id:`${id}-2-${preview ? 'preview' : 'real'}`,coord:{x:5+xDelta,y:0+yDelta},colour: 'green'},{id:`${id}-3-${preview ? 'preview' : 'real'}`,coord:{x:5+xDelta,y:-1+yDelta},colour: 'green'},{id:`${id}-4-${preview ? 'preview' : 'real'}`,coord:{x:6+xDelta,y:-1+yDelta},colour: 'green'}],'green',[{x:-1,y:0},{x:0,y:0},{x:0,y:-1},{x:1,y:-1}])
    }
    else if(shape === 'Z'){
        return new Blocks(shape,[3,3],[{id:`${id}-1-${preview ? 'preview' : 'real'}`,coord:{x:4+xDelta,y:-1+yDelta},colour: 'red'},{id:`${id}-2-${preview ? 'preview' : 'real'}`,coord:{x:5+xDelta,y:-1+yDelta},colour: 'red'},{id:`${id}-3-${preview ? 'preview' : 'real'}`,coord:{x:5+xDelta,y:0+yDelta},colour: 'red'},{id:`${id}-4-${preview ? 'preview' : 'real'}`,coord:{x:6+xDelta,y:0+yDelta},colour: 'red'}],'red',[{x:-1,y:-1},{x:0,y:-1},{x:0,y:0},{x:1,y:0}])
    }
    else if(shape === 'L'){
        return new Blocks(shape,[3,3],[{id:`${id}-1-${preview ? 'preview' : 'real'}`,coord:{x:4+xDelta,y:0+yDelta},colour: 'orange'},{id:`${id}-2-${preview ? 'preview' : 'real'}`,coord:{x:5+xDelta,y:0+yDelta},colour: 'orange'},{id:`${id}-3-${preview ? 'preview' : 'real'}`,coord:{x:6+xDelta,y:0+yDelta},colour: 'orange'},{id:`${id}-4-${preview ? 'preview' : 'real'}`,coord:{x:6+xDelta,y:-1+yDelta},colour: 'orange'}],'orange',[{x:-1,y:-0},{x:0,y:0},{x:1,y:0},{x:1,y:-1}])
    }
    return new Blocks('1',[3,3],[{id:`${id}-1-${preview ? 'preview' : 'real'}`,coord:{x:4+xDelta,y:-1+yDelta},colour: 'blue'},{id:`${id}-2-${preview ? 'preview' : 'real'}`,coord:{x:4+xDelta,y:0+yDelta},colour: 'blue'},{id:`${id}-3-${preview ? 'preview' : 'real'}`,coord:{x:5+xDelta,y:0+yDelta},colour: 'blue'},{id:`${id}-4-${preview ? 'preview' : 'real'}`,coord:{x:6+xDelta,y:0+yDelta},colour: 'blue'}],'blue',[{x:-1,y:-1},{x:-1,y:0},{x:0,y:0},{x:1,y:0}])
}

const collide = (s: State, b: Blocks, c: Movement): Readonly<{updated: boolean, state: State}> => {
    if(!b) return{
        updated: false,
        state: s
    };

    let globalCoords = s.cubeAlive.map(x => x.coord)
    let blockCoords = b.cubes.map(x => x.coord)

    if(selectHorizontalMostCube(false,b).x > Constants.GRID_WIDTH-1) s = moveBlock(new Movement(-1,false,0,0),s);
    if(selectHorizontalMostCube(true,b).x <0) s = moveBlock(new Movement(1,false,0,0),s);

    let impactV = blockCoords.filter(coord => searchCoordInList(coord,globalCoords)).length;
    if(impactV > 0){
        return {
            updated: true,
            state: moveBlock(revertControl(c),s)
        }
    }
    let hitBottom = selectVerticalMostCube(false,b).y > Constants.GRID_HEIGHT-2;
    if(selectVerticalMostCube(false,b).y > Constants.GRID_HEIGHT-1) s = moveBlock(new Movement(0,false,-1,0),s);
    let numberHit = blockCoords.filter(({x,y}) => searchCoordInList({x:x,y:y+1},globalCoords)).length;
    return (hitBottom || numberHit > 0 ) ? handleCollision(s,b) : {
        updated: false,
        state: s
    };
}

// release current block and remove full row and remove empty row
const handleCollision = (s: State,b: Blocks) => {
    if(s.skipCollide > 0) return {
        updated: true,
        state:{
            ...s,
            skipCollide: s.skipCollide -1
        }
    }

    if(selectVerticalMostCube(false,b).y < 1) return {updated: true, state: {...s, gameEnd: true}}
    let emptyArr: Array<Array<SVGMetaData>> = [];
    for(let i = 0;i < Constants.GRID_HEIGHT;i++) emptyArr.push([]);
        let allCubes: Array<Array<SVGMetaData>> = s.cubeAlive.concat(b.cubes)
                    .reduce((acc, cube) =>{
                        acc[cube.coord.y].push(cube);
                        return acc;
                    },emptyArr);
    
        let delta = 0;
        let result: Array<SVGMetaData> = [];
        let deadCube: Array<SVGMetaData> = [];
        let reachedTop = allCubes[0].length > 0;
    
        for(let i=0;i<allCubes.length;i++){
            if(allCubes[Constants.GRID_HEIGHT-1-i].length >= 10){
                delta+=1;
                deadCube = deadCube.concat(allCubes[Constants.GRID_HEIGHT-1-i])
                allCubes[Constants.GRID_HEIGHT-1-i] = [];
            } else{
                result = result.concat(allCubes[19-i].map(element => moveSVG({vertical: delta,horizontal: 0},element)));
            }
        }
        return {
            updated: true,
            state: {
                ...s,
                gameEnd: reachedTop && delta==0,
                currentCube: null,
                cubeAlive: result,
                cubeDead: deadCube,
                score: s.score + Constants.SCORE_TABLE[delta]
            }
        }
}

const moveBlock = (c: Movement, s: State, forceCollide: boolean = false): State => {
    if(s.currentCube){
        let result = null;
        let newReC = s.currentCube.relativeCoords.map(coord => rotate(coord,c.clockwise));
        let arr = s.currentCube.relativeCoords
        let newState = {
            ...s,
            currentCube: new Blocks(s.currentCube.shape, 
                    s.currentCube.dimension, 
                    s.currentCube.cubes.map((cube,index) => moveSVG({vertical:c.gravity + (newReC[index].y - arr[index].y),horizontal:c.horizontal + (newReC[index].x - arr[index].x)},cube)),
                    s.currentCube.color,
                    newReC),
            cubeDead: [],
            skipCollide: forceCollide ? 0 : s.skipCollide
        } as State
        result = collide(newState, newState.currentCube as Blocks ,c);

        if(c.push){
            return result.updated ? result.state : moveBlock(new Movement(0,true, 1,0), result.state, true)
        } else {
            return result ? result.state : s;
        }
    } return s;
}

const moveSVG = (control: Readonly<{vertical: number, horizontal: number}>, svg: SVGMetaData) => {
    return {
        ...svg,
        coord: {
            x: svg.coord.x + control.horizontal,
            y: svg.coord.y + control.vertical
        }
    }
}

const selectHorizontalMostCube = (isLeft: boolean, b: Blocks) => {
    let result =  b.cubes.map(x => x.coord).sort((x,y) => x.x-y.x)
    if(isLeft) return result[0]
    return result[result.length-1]
}
const selectVerticalMostCube = (isTop: boolean, b: Blocks) => {
    let result =  b.cubes.map(x => x.coord).sort((x,y) => x.y-y.y)
    if(isTop) return result[0]
    return result[result.length-1]
}

const searchCoordInList = (c: Coord, arr: Coord[]) => {
    for(const coord of arr) {
        if( coord.x == c.x && coord.y == c.y) return true;
    } return false;
}

const revertControl = (c: Movement) => new Movement(c.horizontal==0 ? 0 : -c.horizontal,false,c.gravity==0 ? 0: -c.gravity, c.clockwise == 0? 0: -c.clockwise);

const rotate = (c: Coord, clockwise: number) => clockwise == 0 ? c: clockwise > 0 ? {x: -c.y,y: c.x} : {x: c.y,y: -c.x}