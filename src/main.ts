/**
 * Inside this file you will use the classes and functions from rx.js
 * to add visuals to the svg element in index.html, animate them, and make them interactive.
 *
 * Study and complete the tasks in observable exercises first to get ideas.
 *
 * Course Notes showing Asteroids in FRP: https://tgdwyer.github.io/asteroids/
 *
 * You will be marked on your functional programming style
 * as well as the functionality that you implement.
 *
 * Document your code!
 */
import "./style.css";

import { merge, scan } from "rxjs";
import { Control, Movement, State } from "./types";
import { show, hide, render, gameover } from "./render";
import { control$, setting$, tick$ } from "./observable";
import { createBlock } from "./utility";
import { Constants } from "./constant";
import { moveBlock } from "./state";

/** State processing */
const initialState: State = {
  gameEnd: false,
  cubeAlive: [],
  currentBlock: createBlock(Constants.BLOCK_TYPE[Math.floor(Math.random()*Constants.BLOCK_TYPE.length)],`B0`),
  cubePreview: createBlock(Constants.BLOCK_TYPE[Math.floor(Math.random()*Constants.BLOCK_TYPE.length)],`B0`,true),
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
  //If currentBlock is null, create a new one
  if(!s.currentBlock){
    s = {
      ...s,
      //Here use preview shape
      currentBlock: createBlock(s.cubePreview.shape,`B${s.totalBlockGenerated}`),
      cubePreviewDead: s.cubePreview.cubes,
      cubePreview: createBlock(Constants.BLOCK_TYPE[Math.floor(Math.random()*Constants.BLOCK_TYPE.length)],`B${s.totalBlockGenerated}`,true),
      skipCollide: 5,
      totalBlockGenerated: s.totalBlockGenerated + 1
    }
  }
  //If it is normal game, apply gravity to current block
  return moveBlock(new Movement(0,false,1,0,false),s).state;
};

/**
 * This is the function called on page load. Your main game loop
 * should be called here.
 */
export function main() {

  const source$ = merge(tick$,control$, setting$)
    .pipe(scan((acc: State,s: number | Movement | Control): State => {
      //If user input, apply to current block
      if(s instanceof Movement) {
        return moveBlock(s,acc).state
      }
      //If user input restart and game has ended, restart game
      else if(s instanceof Control){
        if(s.restart && acc.gameEnd){
          return {
            ...acc,
            gameEnd: false,
            currentBlock: createBlock(Constants.BLOCK_TYPE[Math.floor(Math.random()*Constants.BLOCK_TYPE.length)],`B0`),
            cubePreview: createBlock(Constants.BLOCK_TYPE[Math.floor(Math.random()*Constants.BLOCK_TYPE.length)],`B1`,true),
          } as State
        }
        return acc
      } 
      //Else see should we tick, if current level is higher, faster it ticks.
      return (s as number % Math.max(11-acc.level, 1) == 0 ? tick(acc) : acc);
    }, initialState)).subscribe((s: State) => {
      if (s.gameEnd) {
        show(gameover);
      } else {
        render(s);
        hide(gameover);
      }
    });
}

// The following simply runs your main function on window load.  Make sure to leave it in place.
if (typeof window !== "undefined") {
  window.onload = () => {
    main()
  };
}
