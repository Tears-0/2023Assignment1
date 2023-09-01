import { Blocks, Coord, Movement, SVGMetaData } from "./types";
export { createBlock, moveSVG, searchCoordInList, selectHorizontalMostCube, selectVerticalMostCube, revertControl, rotate, levelCalculate }

/** Utility functions */
/**
 *  Create a block with 4 cubes with provided shape
 * @param shape Shape string, T, I, O, Z, S, etc
 * @param id String given id of block
 * @param preview Boolean is preview?
 * @returns Blocks created
 */
const createBlock = (shape: string, id: string, preview: boolean = false): Blocks =>{
    const xDelta = preview ? -1 : 0;
    const yDelta = preview ? 2 : 0;
    if(shape === 'T'){
        return new Blocks(shape,[3,3],[{id:`${id}-1-${preview ? 'preview' : 'real'}`,coord:{x:3+xDelta,y:0+yDelta},colour: 'purple'},{id:`${id}-2-${preview ? 'preview' : 'real'}`,coord:{x:4+xDelta,y:0+yDelta},colour: 'purple'},{id:`${id}-3-${preview ? 'preview' : 'real'}`,coord:{x:5+xDelta,y:0+yDelta},colour: 'purple'},{id:`${id}-4-${preview ? 'preview' : 'real'}`,coord:{x:4+xDelta,y:-1+yDelta},colour: 'purple'}],'purple',[{x:-1,y:0},{x:0,y:0},{x:1,y:0},{x:0,y:-1}],0)
    }
    else if(shape === 'O'){
        return new Blocks(shape,[2,2],[{id:`${id}-1-${preview ? 'preview' : 'real'}`,coord:{x:4+xDelta,y:0+yDelta},colour: 'yellow'},{id:`${id}-2-${preview ? 'preview' : 'real'}`,coord:{x:5+xDelta,y:0+yDelta},colour: 'yellow'},{id:`${id}-3-${preview ? 'preview' : 'real'}`,coord:{x:4+xDelta,y:-1+yDelta},colour: 'yellow'},{id:`${id}-4-${preview ? 'preview' : 'real'}`,coord:{x:5+xDelta,y:-1+yDelta},colour: 'yellow'}],'yellow',[{x:0,y:0},{x:0,y:0},{x:0,y:0},{x:0,y:0}],0)
    }
    else if(shape === 'I'){
        return new Blocks(shape,[4,4],[{id:`${id}-1-${preview ? 'preview' : 'real'}`,coord:{x:4+2*xDelta,y:0+yDelta},colour: 'cyan'},{id:`${id}-2-${preview ? 'preview' : 'real'}`,coord:{x:5+2*xDelta,y:0+yDelta},colour: 'cyan'},{id:`${id}-3-${preview ? 'preview' : 'real'}`,coord:{x:6+2*xDelta,y:0+yDelta},colour: 'cyan'},{id:`${id}-4-${preview ? 'preview' : 'real'}`,coord:{x:7+2*xDelta,y:0+yDelta},colour: 'cyan'}],'cyan',[{x:-1,y:0},{x:0,y:0},{x:1,y:0},{x:2,y:0}],0)
    }
    else if(shape === 'S'){
        return new Blocks(shape,[3,3],[{id:`${id}-1-${preview ? 'preview' : 'real'}`,coord:{x:4+xDelta,y:0+yDelta},colour: 'green'},{id:`${id}-2-${preview ? 'preview' : 'real'}`,coord:{x:5+xDelta,y:0+yDelta},colour: 'green'},{id:`${id}-3-${preview ? 'preview' : 'real'}`,coord:{x:5+xDelta,y:-1+yDelta},colour: 'green'},{id:`${id}-4-${preview ? 'preview' : 'real'}`,coord:{x:6+xDelta,y:-1+yDelta},colour: 'green'}],'green',[{x:-1,y:0},{x:0,y:0},{x:0,y:-1},{x:1,y:-1}],0)
    }
    else if(shape === 'Z'){
        return new Blocks(shape,[3,3],[{id:`${id}-1-${preview ? 'preview' : 'real'}`,coord:{x:4+xDelta,y:-1+yDelta},colour: 'red'},{id:`${id}-2-${preview ? 'preview' : 'real'}`,coord:{x:5+xDelta,y:-1+yDelta},colour: 'red'},{id:`${id}-3-${preview ? 'preview' : 'real'}`,coord:{x:5+xDelta,y:0+yDelta},colour: 'red'},{id:`${id}-4-${preview ? 'preview' : 'real'}`,coord:{x:6+xDelta,y:0+yDelta},colour: 'red'}],'red',[{x:-1,y:-1},{x:0,y:-1},{x:0,y:0},{x:1,y:0}],0)
    }
    else if(shape === 'L'){
        return new Blocks(shape,[3,3],[{id:`${id}-1-${preview ? 'preview' : 'real'}`,coord:{x:4+xDelta,y:0+yDelta},colour: 'orange'},{id:`${id}-2-${preview ? 'preview' : 'real'}`,coord:{x:5+xDelta,y:0+yDelta},colour: 'orange'},{id:`${id}-3-${preview ? 'preview' : 'real'}`,coord:{x:6+xDelta,y:0+yDelta},colour: 'orange'},{id:`${id}-4-${preview ? 'preview' : 'real'}`,coord:{x:6+xDelta,y:-1+yDelta},colour: 'orange'}],'orange',[{x:-1,y:-0},{x:0,y:0},{x:1,y:0},{x:1,y:-1}],0)
    }
    return new Blocks('1',[3,3],[{id:`${id}-1-${preview ? 'preview' : 'real'}`,coord:{x:4+xDelta,y:-1+yDelta},colour: 'blue'},{id:`${id}-2-${preview ? 'preview' : 'real'}`,coord:{x:4+xDelta,y:0+yDelta},colour: 'blue'},{id:`${id}-3-${preview ? 'preview' : 'real'}`,coord:{x:5+xDelta,y:0+yDelta},colour: 'blue'},{id:`${id}-4-${preview ? 'preview' : 'real'}`,coord:{x:6+xDelta,y:0+yDelta},colour: 'blue'}],'blue',[{x:-1,y:-1},{x:-1,y:0},{x:0,y:0},{x:1,y:0}],0)
}

/**
 *  To modify the position of a cube
 * @param control ControlSet with only vertical and horizontal
 * @param svg SVGMetaData which represent a cube
 * @returns SVGMetaData that has been shifted with control set provided amount
 */
const moveSVG = (control: Readonly<{vertical: number, horizontal: number}>, svg: SVGMetaData): SVGMetaData => {
    return {
        ...svg,
        coord: {
            x: svg.coord.x + control.horizontal,
            y: svg.coord.y + control.vertical
        }
    }
}

/**
 * Select left most cube or right most cube for a provided blocks
 * @param isLeft Boolean isLeft?
 * @param b Blocks to search
 * @returns Coord left most coord or right most coord
 */
const selectHorizontalMostCube = (isLeft: boolean, b: Blocks | ReadonlyArray<Coord>): Coord => {
    //Sort all coords by x
    const result: ReadonlyArray<Coord> = b instanceof Blocks ? b.cubes.map(x => x.coord).sort((x,y) => x.x-y.x) : b.map(x=>x).sort((x,y) => x.x-y.x);
    if(isLeft) return result[0]
    return result[result.length-1]
}
/**
 * Select top cube or bottom cube for a provided blocks
 * @param isTop Boolean isTop?
 * @param b Blocks to search
 * @returns Coord top coord or bottom coord
 */
const selectVerticalMostCube = (isTop: boolean, b: Blocks | ReadonlyArray<Coord>): Coord => {
    //Sort all coords by y
    const result: ReadonlyArray<Coord> = b instanceof Blocks ? b.cubes.map(x => x.coord).sort((x,y) => x.y-y.y) : b.map(x=>x).sort((x,y) => x.y-y.y);
    if(isTop) return result[0]
    return result[result.length-1]
}

/**
 * A search function indicating whether a coord is in a list.
 * @param c coord to search
 * @param arr list to be searched.
 * @returns true if coord is in the list, false otherwise.
 */
const searchCoordInList = (c: Coord, arr: ReadonlyArray<Coord>): Boolean => arr.filter(({x,y}) => x == c.x && y == c.y).length > 0;

/**
 * To revert an illegal movement
 * @param c Movement
 * @returns An inverted movement
 */
const revertControl = (c: Movement): Movement => new Movement(-c.horizontal,false,-c.gravity, -c.clockwise, false);

/**
 *  Function that helps rotate the Blocks.
 *  Equation proposed from: https://en.wikipedia.org/wiki/Rotation_(mathematics)
 * @param c Old Coord
 * @param clockwise Number representing clockwise if 1, counterclockwise if -1, none if 0
 * @returns new Coord
 */
const rotate = (c: Coord, clockwise: number): Coord => clockwise == 0 ? c: clockwise > 0 ? {x: -c.y,y: c.x} : {x: c.y,y: -c.x}

/**
 * Calculate the provided row number belonging level
 * Data provided by: https://tetris.fandom.com/wiki/Tetris_(NES,_Nintendo)
 * @param rowNumber Number number of cleared row
 * @param temp Number number to get row needed to level up
 * @returns Number level
 */
const levelCalculate = (rowNumber: number, temp: number = 1): number => getRowForLevel(temp) > rowNumber ? temp - 1 : levelCalculate(rowNumber, temp + 1);

/**
 * Calculate how much row needed for provided number of level
 * @param level Number level
 * @returns Number row needed to clear for the level
 */
const getRowForLevel = (level: number): number => level <= 0 ? 0 : (getRowForLevel(level-1) + Math.min(level, 10) * 10);