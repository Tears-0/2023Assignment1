export type{ Key, Event, State, Coord };
export { Control, Blocks };

type Key = "KeyS" | "KeyA" | "KeyD" | "Space";

type Event = "keydown" | "keyup" | "keypress";

type Coord = {x: number, y: number};

class Control { constructor(public readonly horizontal: number, public readonly push: boolean, public readonly gravity: number,public readonly clockwise: number) {} }

class RNG { 
  public next = (n: number) => this.getInterval(0,n);

  public getInterval = (min: number,max: number) => Math.random() * (max - min + 1) + min;
}

class Blocks {
  constructor(public readonly shape: string, public readonly dimension: [number,number], public readonly cubes: ReadonlyArray<SVGElement>, public readonly color: string, public readonly centerCoord: Coord){}
}

type State = Readonly<{
    gameEnd: boolean;
    cubeAlive: ReadonlyArray<SVGElement>;
    currentCube: Blocks | null;
    cubePreview: Blocks;
    cubePreviewDead: ReadonlyArray<SVGElement>;
    cubeDead: ReadonlyArray<SVGElement>;
    score: number;
    skipCollide: boolean
  }>;