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
import { State } from "./types";
import { show, hide, render, gameover } from "./render";
import { control$, setting$, tick$ } from "./observable";
import { initialState, reduceState } from "./state";

/**
 * This is the function called on page load. Your main game loop
 * should be called here.
 */
export function main() {

  const source$ = merge(tick$,control$, setting$)
    .pipe(scan(reduceState, initialState)).subscribe((s: State) => {
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
