import { Blocks, Coord, Movement, SVGMetaData } from "./types";
export { createBlock, moveSVG, searchCoordInList, selectMostCube, revertControl, rotate, levelCalculate, getCoords, applyMovement, I, K, randomSelect, DOUBLE };

/** Utility functions */
/**
 *  Create a block with 4 cubes with provided shape
 * @param shape Shape string, T, I, O, Z, S, etc
 * @param id String given id of block
 * @param preview Boolean is preview?
 * @returns Blocks created
 */
const createBlock = (shape: string) => (id: string) => (preview: boolean = false): Blocks => {
    const xDelta = preview ? -1 : 0;
    const yDelta = preview ? 2 : 0;
    if (shape === 'T') {
        return new Blocks(shape,
            [{id:`${id}-1-${preview ? 'preview' : 'real'}`,coord:{x:3+xDelta,y:0+yDelta},colour: 'purple'},
            {id:`${id}-2-${preview ? 'preview' : 'real'}`,coord:{x:4+xDelta,y:0+yDelta},colour: 'purple'},
            {id:`${id}-3-${preview ? 'preview' : 'real'}`,coord:{x:5+xDelta,y:0+yDelta},colour: 'purple'},
            {id:`${id}-4-${preview ? 'preview' : 'real'}`,coord:{x:4+xDelta,y:-1+yDelta},colour: 'purple'}],
            'purple',
            [{x:-1,y:0},{x:0,y:0},{x:1,y:0},{x:0,y:-1}],0);
    }
    else if(shape === 'O'){
        return new Blocks(shape,
            [{id:`${id}-1-${preview ? 'preview' : 'real'}`,coord:{x:4+xDelta,y:0+yDelta},colour: 'yellow'},
            {id:`${id}-2-${preview ? 'preview' : 'real'}`,coord:{x:5+xDelta,y:0+yDelta},colour: 'yellow'},
            {id:`${id}-3-${preview ? 'preview' : 'real'}`,coord:{x:4+xDelta,y:-1+yDelta},colour: 'yellow'},
            {id:`${id}-4-${preview ? 'preview' : 'real'}`,coord:{x:5+xDelta,y:-1+yDelta},colour: 'yellow'}],
            'yellow',
            [{x:0,y:0},{x:0,y:0},{x:0,y:0},{x:0,y:0}],0);
    }
    else if(shape === 'I'){
        return new Blocks(shape,
            [{id:`${id}-1-${preview ? 'preview' : 'real'}`,coord:{x:4+2*xDelta,y:0+yDelta},colour: 'cyan'},
            {id:`${id}-2-${preview ? 'preview' : 'real'}`,coord:{x:5+2*xDelta,y:0+yDelta},colour: 'cyan'},
            {id:`${id}-3-${preview ? 'preview' : 'real'}`,coord:{x:6+2*xDelta,y:0+yDelta},colour: 'cyan'},
            {id:`${id}-4-${preview ? 'preview' : 'real'}`,coord:{x:7+2*xDelta,y:0+yDelta},colour: 'cyan'}],
            'cyan',
            [{x:-1,y:0},{x:0,y:0},{x:1,y:0},{x:2,y:0}],0);
    }
    else if(shape === 'S'){
        return new Blocks(shape,
            [{id:`${id}-1-${preview ? 'preview' : 'real'}`,coord:{x:4+xDelta,y:0+yDelta},colour: 'green'},
            {id:`${id}-2-${preview ? 'preview' : 'real'}`,coord:{x:5+xDelta,y:0+yDelta},colour: 'green'},
            {id:`${id}-3-${preview ? 'preview' : 'real'}`,coord:{x:5+xDelta,y:-1+yDelta},colour: 'green'},
            {id:`${id}-4-${preview ? 'preview' : 'real'}`,coord:{x:6+xDelta,y:-1+yDelta},colour: 'green'}],
            'green',
            [{x:-1,y:0},{x:0,y:0},{x:0,y:-1},{x:1,y:-1}],0);
    }
    else if(shape === 'Z'){
        return new Blocks(shape,
            [{id:`${id}-1-${preview ? 'preview' : 'real'}`,coord:{x:4+xDelta,y:-1+yDelta},colour: 'red'},
            {id:`${id}-2-${preview ? 'preview' : 'real'}`,coord:{x:5+xDelta,y:-1+yDelta},colour: 'red'},
            {id:`${id}-3-${preview ? 'preview' : 'real'}`,coord:{x:5+xDelta,y:0+yDelta},colour: 'red'},
            {id:`${id}-4-${preview ? 'preview' : 'real'}`,coord:{x:6+xDelta,y:0+yDelta},colour: 'red'}],
            'red',
            [{x:-1,y:-1},{x:0,y:-1},{x:0,y:0},{x:1,y:0}],0);
    }
    else if(shape === 'L'){
        return new Blocks(shape,
            [{id:`${id}-1-${preview ? 'preview' : 'real'}`,coord:{x:4+xDelta,y:0+yDelta},colour: 'orange'},
            {id:`${id}-2-${preview ? 'preview' : 'real'}`,coord:{x:5+xDelta,y:0+yDelta},colour: 'orange'},
            {id:`${id}-3-${preview ? 'preview' : 'real'}`,coord:{x:6+xDelta,y:0+yDelta},colour: 'orange'},
            {id:`${id}-4-${preview ? 'preview' : 'real'}`,coord:{x:6+xDelta,y:-1+yDelta},colour: 'orange'}],
            'orange',
            [{x:-1,y:-0},{x:0,y:0},{x:1,y:0},{x:1,y:-1}],0);
    }
    return new Blocks('1',
        [{id:`${id}-1-${preview ? 'preview' : 'real'}`,coord:{x:4+xDelta,y:-1+yDelta},colour: 'blue'},
        {id:`${id}-2-${preview ? 'preview' : 'real'}`,coord:{x:4+xDelta,y:0+yDelta},colour: 'blue'},
        {id:`${id}-3-${preview ? 'preview' : 'real'}`,coord:{x:5+xDelta,y:0+yDelta},colour: 'blue'},
        {id:`${id}-4-${preview ? 'preview' : 'real'}`,coord:{x:6+xDelta,y:0+yDelta},colour: 'blue'}],
        'blue',
        [{x:-1,y:-1},{x:-1,y:0},{x:0,y:0},{x:1,y:0}],0);
}

/**
 *  To modify the position of a cube
 * @param control ControlSet with only vertical and horizontal
 * @param svg SVGMetaData which represent a cube
 * @returns SVGMetaData that has been shifted with control set provided amount
 */
const moveSVG = (control: Readonly < {
    vertical: number,
    horizontal: number
} > ) => (svg: SVGMetaData): SVGMetaData => ({
    ...svg,
    coord: {
        x: svg.coord.x + control.horizontal,
        y: svg.coord.y + control.vertical
    }
});

/**
 * Select left most cube or right most cube for a provided blocks
 * @param is Boolean isLeft or isTop?
 * @param b Blocks to search
 * @param f Mapping function
 * @returns Coord left most coord or right most coord
 */
const selectMostCube = (is: boolean) => (block: Blocks) => (f: (coord: Coord) => number): number =>
    f(getCoords(block).reduce((acc: Coord, data: Coord) => selectiveChoosing(is)(acc)(data)(f)));

/**
 * To select most top or most left cube
 * @param is isTop or isLeft
 * @param c1 Coord Coord 1
 * @param c2 Coord Coord 2
 * @param f function that map coord into number
 * @returns Coord left most? or top? coord
 */
// is ? (f(c1) < f(c2) ? c2 : c1) : (f(c1) > f(c2) ? c2 : c1)
const selectiveChoosing = (is: boolean) => (coord1: Coord) => (coord2: Coord) => (f: (coord: Coord) => Number): Coord =>
    xor(is)(f(coord1) > f(coord2)) ? coord2 : coord1

/**
 * XOR gate
 * @param b1 boolean 1
 * @param b2 boolean 2
 * @returns boolean b1 xor b2
 */
const xor = (boolean1: boolean) => (boolean2: boolean) => (boolean1 || !boolean2) && (!boolean1 || boolean2);

/**
 * A search function indicating whether a coord is in a list.
 * @param c coord to search
 * @param arr list to be searched.
 * @returns true if coord is in the list, false otherwise.
 */
const searchCoordInList = (arr: ReadonlyArray < Coord > ) =>
    (coord: Coord): Boolean => arr.filter(({
        x,
        y
    }) => x == coord.x && y == coord.y).length > 0;

/**
 * To revert an illegal movement
 * @param c Movement
 * @returns An inverted movement
 */
const revertControl = (c: Movement): Movement =>
    new Movement(-c.horizontal, false, -c.gravity, -c.clockwise, false);

/**
 *  Function that helps rotate the Blocks.
 *  Equation proposed from: https://en.wikipedia.org/wiki/Rotation_(mathematics)
 * @param c Old Coord
 * @param clockwise Number representing clockwise if 1, counterclockwise if -1, none if 0
 * @returns new Coord
 */
const rotate = (clockwise: number) => (c: Coord): Coord =>
    clockwise == 0 ? c : clockwise > 0 ? {
        x: -c.y,
        y: c.x
    } : {
        x: c.y,
        y: -c.x
    };

/**
 * Calculate the provided row number belonging level
 * Data provided by: https://tetris.fandom.com/wiki/Tetris_(NES,_Nintendo)
 * @param rowNumber Number number of cleared row
 * @param temp Number number to get row needed to level up
 * @returns Number level
 */
const levelCalculate = (rowNumber: number) => (temp: number = 1): number =>
    getRowForLevel(temp) > rowNumber ? temp - 1 : levelCalculate(rowNumber)(temp + 1);

/**
 * Calculate how much row needed for provided number of level
 * @param level Number level
 * @returns Number row needed to clear for the level
 */
const getRowForLevel = (level: number): number =>
    level <= 0 ? 0 : (getRowForLevel(level - 1) + Math.min(level, 10) * 10);

/**
 * Map all cubes into coords
 * @param b Blocks or ReadonlyArray<SVGMetaData> to be mapped
 * @returns ReadonlyArray<Coord> Coords.
 */
const getCoords = (block: Blocks | ReadonlyArray < SVGMetaData > ): ReadonlyArray < Coord > =>
    block instanceof Blocks ? block.cubes.map(({
        coord
    }) => coord) : block.map(({
        coord
    }) => coord);

/**
 * Function that return blocks after applying movement
 * @param b Blocks to be apply movement
 * @returns Blocks new block
 */
const applyMovement = (block: Blocks) => (move: Movement): Blocks => {
    const newRelativeCoord: ReadonlyArray < Coord > = block.relativeCoords.map(rotate(move.clockwise));
    //Apply substraction to old relative coord and new relative coord to get difference
    const diffCoord: ReadonlyArray < Coord > = block.relativeCoords.map((coord, index) =>
        ({
            x: newRelativeCoord[index].x - coord.x,
            y: newRelativeCoord[index].y - coord.y
        }));

    return new Blocks(block.shape,
        block.cubes.map((cube, index) => moveSVG({
            vertical: move.gravity + diffCoord[index].y,
            horizontal: move.horizontal + diffCoord[index].x
        })(cube)),
        block.color,
        newRelativeCoord,
        (block.quadrant + move.clockwise) % 4);
}

//Lazy evaluation random choice
const randomSelect = <T>(arr: ReadonlyArray < T > ) => () => {
    const seed = RNG.hash(Date.now());
    const range = RNG.scale(seed)(arr.length);
    return arr[range]
}

//Combinators
const I = <T>(i:T) => i;
const K = <T>(x: T) => (y: T) => x;
const DOUBLE = <T,U>(x: (x:T) => U) => (y: (y:T) => U) => (param: T) => {
    x(param);
    y(param);
};

//Provided by FIT 2102 Workshop 4(modified)
class RNG {
    // LCG using GCC's constants
    private static m = 0x80000000; // 2**31
    private static a = 1103515245;
    private static c = 12345;
  
    /**
     * Call `hash` repeatedly to generate the sequence of hashes.
     * @param seed 
     * @returns a hash of the seed
     */
    public static hash = (seed: number) => (RNG.a * seed + RNG.c) % RNG.m;
  
    /**
  h    * Takes hash value and scales it to the range [0, max]
     */
    public static scale = (hash: number) => (max: number) => Math.floor((max * hash) / (RNG.m - 1)) ;
  }