import { Blocks, Coord, Movement, SVGMetaData } from "./types";
export { createBlock, moveSVG, searchCoordInList, selectHorizontalMostCube, selectVerticalMostCube, revertControl, rotate, levelCalculate }

/** Utility functions */
const createBlock = (shape: string, id: string, preview: boolean = false): Blocks =>{
    const xDelta = preview ? -1 : 0;
    const yDelta = preview ? 2 : 0;
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
    const result: ReadonlyArray<Coord> =  b.cubes.map(x => x.coord).sort((x,y) => x.x-y.x)
    if(isLeft) return result[0]
    return result[result.length-1]
}
/**
 * 
 * @param isTop 
 * @param b 
 * @returns 
 */
const selectVerticalMostCube = (isTop: boolean, b: Blocks) => {
    let result: ReadonlyArray<Coord> =  b.cubes.map(x => x.coord).sort((x,y) => x.y-y.y)
    if(isTop) return result[0]
    return result[result.length-1]
}

/**
 * A search function indicating whether a coord is in a list.
 * @param c coord to search
 * @param arr list to be searched.
 * @returns true if coord is in the list, false otherwise.
 */
const searchCoordInList = (c: Coord, arr: ReadonlyArray<Coord>) => arr.filter(({x,y}) => x == c.x && y == c.y).length > 0;

/**
 * To revert an illegal movement
 * @param c Movement
 * @returns An inverted movement
 */
const revertControl = (c: Movement) => new Movement(c.horizontal==0 ? 0 : -c.horizontal,false,c.gravity==0 ? 0: -c.gravity, c.clockwise == 0? 0: -c.clockwise);

/**
 *  Function that helps rotate the Blocks.
 * @param c Old Coord
 * @param clockwise Number representing clockwise if 1, counterclockwise if -1, none if 0
 * @returns new Coord
 */
const rotate = (c: Coord, clockwise: number) => clockwise == 0 ? c: clockwise > 0 ? {x: -c.y,y: c.x} : {x: c.y,y: -c.x}

const levelCalculate = (n: number, temp: number = 1): number => getRowForLevel(temp) > n ? temp - 1 : levelCalculate(n, temp + 1);

const getRowForLevel = (level: number): number => level <= 0 ? 0 : (getRowForLevel(level-1) + Math.min(level, 10) * 10);