import { Constants } from "./constant";
import { BlockShape, Blocks, Control, Coord, Movement, SVGMetaData, State, Status, TestResult } from "./types";
import { selectMostCube, searchCoordInList, revertControl, moveSVG, levelCalculate, createBlock, applyMovement, getCoords, randomSelect } from "./utility";
export { initialState, reduceState };

const randomSelectBlock: ()=>BlockShape = randomSelect(Constants.BLOCK_TYPE);
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
}as State;

const reduceState = (state: State, control: Number | Movement | Control): State => {
    //If user input, apply to current block
    if (control instanceof Movement) {
        return moveBlock(control)(state).state
    }
    //If user input restart and game has ended, restart game
    else if (control instanceof Control) {
        if (control.restart && state.gameEnd) {
            return {
                ...state,
                gameEnd: false,
                currentBlock: createBlock(randomSelectBlock())(`B0`)(),
                cubePreview: createBlock(randomSelectBlock())(`B1`)(true),
            }as State
        }
        return state
    }
    //Else see should we tick, if current level is higher, faster it ticks.
    return (control as number % Math.max(11 - state.level, 1) == 0 ? tick(state) : state);
}

/**
 * Updates the state by proceeding with one time step.
 *
 * @param state Current state
 * @returns Updated state
 */
const tick = (state: State): State => {
    if (state.gameEnd) return {
        ...initialState,
        gameEnd: true,
        highScore: state.score > state.highScore ? state.score : state.highScore,
    }

    const applyGravity = moveBlock(new Movement(0, false, 1, 0, false));

    //If currentBlock is null, create a new one
    return !state.currentBlock ?
        applyGravity({
            ...state,
            //Here use preview shape
            currentBlock: createBlock(state.cubePreview.shape)(`B${state.totalBlockGenerated}`)(),

            cubePreviewDead: state.cubePreview.cubes,

            cubePreview: createBlock(randomSelectBlock())(`B${state.totalBlockGenerated}`)(true),

            skipCollide: 5,
            totalBlockGenerated: state.totalBlockGenerated + 1
        }).state :
        //If it is normal game, apply gravity to current block
        applyGravity(state).state;
};


/**
 * Function to move current block with provided control set
 * @param control Movement control set provided
 * @param state State current state
 * @returns Status new State
 */
const moveBlock = (control: Movement) => (state: State): Status => {
    if (state.currentBlock && !state.gameEnd) {
        //Apply the movement provided
        const newState: State = {
            ...state,
            //Always create new block while swapping current block and block on hold with same shape
            blockOnHold: control.hold && !state.swapped ?
                createBlock(state.currentBlock.shape)('hold')(true) : state.blockOnHold,

            //Test if ready to swap with block on hold
            currentBlock: control.hold && !state.swapped ?
                (state.blockOnHold ?
                    createBlock(state.blockOnHold.shape)(`B${state.totalBlockGenerated}`)() :
                    null) : applyMovement(state.currentBlock)(control),

            swapped: control.hold || state.swapped,
            cubeDead: control.hold && !state.swapped ? state.currentBlock.cubes : [],

            totalBlockGenerated: control.hold && !state.swapped ?
                state.totalBlockGenerated + 1 : state.totalBlockGenerated,

            skipCollide: control.push ? 0 : state.skipCollide
        }

        //Indicates whether is the movement valid
        const result: Status =
            newState.currentBlock ?
            collide(newState)(control)(newState.currentBlock as Blocks) : {
                updated: true,
                state: newState
            };

        //If it is to push, move the block further downward.
        return control.push ?
            moveBlock(new Movement(0, true, 1, 0, false))(result.state) :
            result;
    }

    return {
        updated: false,
        state: state
    };
}

/**
 * Function that legalise illegal move and handle collision
 * @param state State current state
 * @param control Movement control set provided
 * @returns Status new state
 */
const collide = (state: State) => (control: Movement) => (b: Blocks): Status => {
    const testResult: TestResult = testIsValid(state)(b);
    //If the block has impact on other block or wall and is rotating, try wallkick 
    if (testResult.hitBlock) {
        if (control.clockwise != 0) {
            const validKick: ReadonlyArray < Movement > =
                (b.shape != 'I' ?
                    Constants.WALL_KICK_OFFSET[b.quadrant] :
                    Constants.WALL_KICK_OFFSET_I[b.quadrant])
                .map(({x,y}) => new Movement(x, false, y, 0, false))
                .filter(movement => !testIsValid(state)(applyMovement(b)(movement)).hitBlock);

            if (validKick.length > 0) return moveBlock(validKick[0])(state);
        }
        //If unable to kick, revert control.
        return moveBlock(revertControl(control))(state);
    }
    if (testResult.hitBottom) return handleCollision(state)(b);

    return {
        updated: false,
        state: state
    };
}

/**
 * Function that determines that a block is in illegal position (Out of bound, duplicate position).
 * @param state State current state
 * @param control Movement previous or next movement to be apply on current block
 * @param b Blocks current block
 * @param beforeMovement Boolean is control provided applied?
 * @returns TestResult indicates block is out of bound, hit another block or hit bottom
 */
const testIsValid = (state: State) => (b: Blocks): TestResult => {
    const globalCoords: ReadonlyArray < Coord > = getCoords(state.cubeAlive);
    const blockCoords: ReadonlyArray < Coord > = getCoords(b);

    //Indicates blocks has been out of bound, or has same position as other block
    const impact: boolean =
        (selectMostCube(false)(b)(control => control.x) > Constants.GRID_WIDTH - 1) ||
        (selectMostCube(true)(b)(control => control.x) < 0) ||
        (selectMostCube(false)(b)(control => control.y) > Constants.GRID_HEIGHT - 1) ||
        (blockCoords.filter(searchCoordInList(globalCoords)).length > 0);

    //Indicates blocks has something else bottom.
    const bottom: boolean =
        (selectMostCube(false)(b)(coord => coord.y) > Constants.GRID_HEIGHT - 2) ||
        (blockCoords.filter(({
                x,
                y
            }) =>
            searchCoordInList(globalCoords)({
                x: x,
                y: y + 1
            })).length > 0);

    return {
        hitBlock: impact,
        hitBottom: bottom
    }as TestResult;
}

/**
 * Function that handle collision, release current block, remove full row, score and level calculation
 * @param state State current state
 * @returns Status new state
 */
const handleCollision = (state: State) => (b: Blocks): Status => {
    if (state.skipCollide > 0) return {
        updated: false,
        state: {
            ...state,
            skipCollide: state.skipCollide - 1
        }
    }as Status;
    //If collide at roof, game end. 
    if (selectMostCube(false)(b)(control => control.y) < 1)
        return {
            updated: true,
            state: {
                ...state,
                gameEnd: true
            }
        }

    //Map all cubes into 2d array by its position.
    const allCubes: ReadonlyArray < ReadonlyArray < SVGMetaData >> =
        state.cubeAlive.concat(b.cubes)
        .reduce((acc, cube) =>
            acc.map((arr, index) =>
                index == Constants.GRID_HEIGHT - cube.coord.y - 1 ? arr.concat([cube]) : arr),
            Array.from({
                length: Constants.GRID_HEIGHT
            }, () => []) as ReadonlyArray < ReadonlyArray < SVGMetaData >> );

    const reachedTop: boolean = allCubes[Constants.GRID_HEIGHT - 1].length > 0;

    //Check all row if has 10 cubes, remove it from grid
    const finalState: Readonly < {
            delta: number,
            result: ReadonlyArray < SVGMetaData > ,
            deadCube: ReadonlyArray < SVGMetaData >
        } > =
        allCubes.reduce((acc, arr: ReadonlyArray < SVGMetaData > ) => ({
            ...acc,
            delta: arr.length >= 10 ? acc.delta + 1 : acc.delta,
            deadCube: arr.length >= 10 ? acc.deadCube.concat(arr) : acc.deadCube,
            result: arr.length >= 10 ?
                acc.result : acc.result.concat(arr.map(element =>
                    moveSVG({
                        vertical: acc.delta,
                        horizontal: 0
                    })(element)))
        }), {
            delta: 0,
            result: [] as ReadonlyArray < SVGMetaData > ,
            deadCube: [] as ReadonlyArray < SVGMetaData >
        });

    return {
        updated: true,
        state: {
            ...state,
            gameEnd: reachedTop && finalState.delta == 0,
            currentBlock: null,
            swapped: false,
            cubeAlive: finalState.result,
            cubeDead: finalState.deadCube,
            score: state.score + Constants.SCORE_TABLE[finalState.delta] * state.level,
            level: levelCalculate(state.rowCleared + finalState.delta)() + 1,
            rowCleared: state.rowCleared + finalState.delta
        }as State
    }
}