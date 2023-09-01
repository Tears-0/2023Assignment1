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

const left$ = fromKey("KeyA").pipe(map(_=> new Movement(-1,false,0,0,false)));
const right$ = fromKey("KeyD").pipe(map(_=> new Movement(1,false,0,0,false)));
const down$ = fromKey("KeyS").pipe(map(_=> new Movement(0,false,1,0,false)));
const space$ = fromKey("Space").pipe(map(_=> new Movement(0,true,0,0,false)));
const up$ = fromKey("KeyW").pipe(map(_=> new Movement(0,false,0,1,false)));
const hold$ = fromKey("KeyC").pipe(map(_=> new Movement(0,false,0,0,true)));

const control$ = merge(left$,right$,down$,space$,up$,hold$)

const restart$ = fromEvent<MouseEvent>(document, "mousedown").pipe(map(_=> new Control(true,false)));
const replay$ = fromKey("KeyP").pipe(map(_=> new Control(false,true)));
const setting$ = merge(restart$, replay$);