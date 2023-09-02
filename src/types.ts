export type{ Key, Event, State, Coord, SVGMetaData, Status, TestResult, BlockShape };
export { Control, Blocks, Movement, RNG };

type Key = "KeyS" | "KeyA" | "KeyD" | "KeyW" | "KeyP" | "KeyC"| "Space" | "Escape";

type Event = "keydown" | "keyup" | "keypress";

type BlockShape = "T" | "I" | "S" | "Z" | "O" | "L" | "1"

type Coord = {x: number, y: number};

class Movement { constructor(public readonly horizontal: number, public readonly push: boolean, public readonly gravity: number, public readonly clockwise: number, public readonly hold: boolean) {} }
class Control { constructor(public readonly restart: boolean, public readonly replay: boolean){} }

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

class Blocks {
  constructor(public readonly shape: BlockShape, public readonly cubes: ReadonlyArray<SVGMetaData>, public readonly color: string, public readonly relativeCoords: ReadonlyArray<Coord>, public readonly quadrant: number){}
}

type SVGMetaData = Readonly<{
  id: string;
  coord: Coord;
  colour: string
}>

type Status = Readonly<{updated: boolean, state: State}>

type State = Readonly<{
    gameEnd: boolean;
    cubeAlive: ReadonlyArray<SVGMetaData>;
    currentBlock: Blocks | null;
    cubePreview: Blocks;
    cubePreviewDead: ReadonlyArray<SVGMetaData>;
    cubeDead: ReadonlyArray<SVGMetaData>;
    score: number;
    skipCollide: number;
    highScore: number;
    totalBlockGenerated: number;
    level: number;
    rowCleared: number
    blockOnHold: Blocks | null;
    swapped: boolean
  }>;

type TestResult = Readonly<{
  hitBlock: boolean,
  hitBottom: boolean
}>;