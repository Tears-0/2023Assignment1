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

import { fromEvent, interval, merge, from } from "rxjs";
import { map, filter, scan } from "rxjs/operators";
import { Blocks, Control, Movement, State } from "./types";
import { show, hide, render, gameover } from "./render";
import { control$, restart$, tick$ } from "./observable";
import {  collide, createBlock, moveBlock } from "./utility";
import { Constants } from "./constant";

/** State processing */
const initialState: State = {
  gameEnd: false,
  cubeAlive: [],
  currentCube: createBlock(Constants.BLOCK_TYPE[Math.floor(Math.random()*Constants.BLOCK_TYPE.length)]),
  cubePreview: createBlock(Constants.BLOCK_TYPE[Math.floor(Math.random()*Constants.BLOCK_TYPE.length)],true),
  score: 0,
  cubeDead: [],
  cubePreviewDead: [],
  skipCollide: 0,
  highScore: 0
} as State;

/**
 * Updates the state by proceeding with one time step.
 *
 * @param s Current state
 * @returns Updated state
 */
const tick = (s: State) => {
  if(s.gameEnd) return {
    ...s,
    cubeAlive: [],
    cubeDead: [],
    cubePreviewDead: [],
    highScore: s.score > s.highScore ? s.score : s.highScore,
    score: 0,
  };
  if(!s.currentCube){
    s = {
      ...s,
      currentCube: createBlock(s.cubePreview.shape),
      cubePreviewDead: s.cubePreview.cubes,
      cubePreview: createBlock(Constants.BLOCK_TYPE[Math.floor(Math.random()*Constants.BLOCK_TYPE.length)],true),
      skipCollide: 1
    }
  }
  return moveBlock(new Movement(0,false,1,0),s, true);
};

/**
 * This is the function called on page load. Your main game loop
 * should be called here.
 */
export function main() {

  const source$ = merge(tick$,control$, restart$  )
    .pipe(scan((acc: State,s: number | Movement | Control) => {
      if(s instanceof Movement) {
        return moveBlock(s,acc)
      }
      else if(s instanceof Control){
        if(s.restart && acc.gameEnd){
          return {
            ...acc,
            gameEnd: false,
            currentCube: createBlock(Constants.BLOCK_TYPE[Math.floor(Math.random()*Constants.BLOCK_TYPE.length)]),
            cubePreview: createBlock(Constants.BLOCK_TYPE[Math.floor(Math.random()*Constants.BLOCK_TYPE.length)],true),
          } as State
        }
        return acc
      } else {
    return tick(acc);
  }
    }, initialState))
    .subscribe((s: State) => {
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
