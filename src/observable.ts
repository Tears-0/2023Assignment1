import { fromEvent, merge, filter, map, interval } from "rxjs";
import { Key, Control, Movement } from "./types";
import { Constants } from "./constant";

export { control$, tick$, setting$ };
/** Observables */
/** Determines the rate of time steps */
const tick$ = interval(Constants.TICK_RATE_MS);

/** User input */
const key$ = fromEvent<KeyboardEvent>(document, "keypress");

const fromKey = (keyCode: Key) =>
  key$.pipe(filter(({ code }) => code === keyCode));

const left$ = fromKey("KeyA").pipe(map(_=> new Movement(-1,false,0,0)));
const right$ = fromKey("KeyD").pipe(map(_=> new Movement(1,false,0,0)));
const down$ = fromKey("KeyS").pipe(map(_=> new Movement(0,false,1,0)));
const space$ = fromKey("Space").pipe(map(_=> new Movement(0,true,0,0)));
const up$ = fromKey("KeyW").pipe(map(_=> new Movement(0,false,0,1)));

const control$ = merge(left$,right$,down$,space$,up$)

const restart$ = fromEvent<MouseEvent>(document, "mousedown").pipe(map(_=> new Control(true,false)));
const replay$ = fromKey("KeyP").pipe(map(_=> new Control(false,true)));
const setting$ = merge(restart$, replay$);