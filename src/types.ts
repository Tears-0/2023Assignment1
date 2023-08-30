export type{ Key, Event, State, Coord, SVGMetaData };
export { Control, Blocks, Movement };

type Key = "KeyS" | "KeyA" | "KeyD" | "KeyW" | "KeyP" | "Space" | "Escape";

type Event = "keydown" | "keyup" | "keypress";

type Coord = {x: number, y: number};

class Movement { constructor(public readonly horizontal: number, public readonly push: boolean, public readonly gravity: number,public readonly clockwise: number) {} }
class Control { constructor(public readonly restart: boolean){} }
class RNG { 
  public next = (n: number) => this.getInterval(0,n);

  public getInterval = (min: number,max: number) => Math.random() * (max - min + 1) + min;
}

class Blocks {
  constructor(public readonly shape: string, public readonly dimension: [number,number], public readonly cubes: ReadonlyArray<SVGMetaData>, public readonly color: string, public readonly relativeCoords: Coord[]){}
}

type SVGMetaData = Readonly<{
  id: string;
  coord: Coord;
  colour: string
}>

type State = Readonly<{
    gameEnd: boolean;
    cubeAlive: ReadonlyArray<SVGMetaData>;
    currentCube: Blocks | null;
    cubePreview: Blocks;
    cubePreviewDead: ReadonlyArray<SVGMetaData>;
    cubeDead: ReadonlyArray<SVGMetaData>;
    score: number;
    skipCollide: number
    highScore: number
    totalBlockGenerated: number
  }>;