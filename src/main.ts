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
import { Blocks, Control, State } from "./types";
import { show, hide, render, gameover } from "./render";
import { control$, tick$ } from "./observable";
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
  skipCollide: false
} as State;

/**
 * Updates the state by proceeding with one time step.
 *
 * @param s Current state
 * @returns Updated state
 */
const tick = (s: State) => {
  if(s.gameEnd) return s;

  if(!s.currentCube){
    s = {
      ...s,
      currentCube: createBlock(s.cubePreview.shape),
      cubePreviewDead: s.cubePreview.cubes,
      cubePreview: createBlock(Constants.BLOCK_TYPE[Math.floor(Math.random()*Constants.BLOCK_TYPE.length)],true),
      skipCollide: true
    }
  }
  if(s.skipCollide){
    s = {
      ...s,
      skipCollide: false
    }
    return moveBlock(new Control(0,false,1,0),s, false);
  }
  return moveBlock(new Control(0,false,1,0),s, true);
};

/**
 * This is the function called on page load. Your main game loop
 * should be called here.
 */
export function main() {
  

  // Text fields
  const levelText = document.querySelector("#levelText") as HTMLElement;
  const scoreText = document.querySelector("#scoreText") as HTMLElement;
  const highScoreText = document.querySelector("#highScoreText") as HTMLElement;

  const source$ = merge(tick$,control$)
    .pipe(scan((acc: State,s: number | Control) => {
      if(s instanceof Control) {
        return moveBlock(s,acc)
      }
      else {
    return tick(acc);
  }
    }, initialState))
    .subscribe((s: State) => {
      if (s.gameEnd) {
        show(gameover);
      } else {
        render(s);
        scoreText.innerHTML = s.score.toString()
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
