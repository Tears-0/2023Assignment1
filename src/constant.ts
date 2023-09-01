/** Constants */

const Viewport = {
    CANVAS_WIDTH: 200,
    CANVAS_HEIGHT: 400,
    PREVIEW_WIDTH: 160,
    PREVIEW_HEIGHT: 80,
  } as const;
  
  const Constants = {
    TICK_RATE_MS: 50,
    GRID_WIDTH: 10,
    GRID_HEIGHT: 20,
    //Source: https://tetris.wiki/Scoring
    SCORE_TABLE: [0,100,300,500,800],
    BLOCK_TYPE: ['T','O','Z','S','I','1','L'],
    //ClockWise Only!
    //Data provided by: https://harddrop.com/wiki/SRS
    WALL_KICK_OFFSET: [
      [{x:0,y:0},{x:-1,y:0},{x:-1,y:-1},{x:0,y:2},{x:-1,y:2}],
      [{x:0,y:0},{x:-1,y:0},{x:-1,y:1},{x:0,y:-2},{x:-1,y:-2}],
      [{x:0,y:0},{x:1,y:0},{x:1,y:-1},{x:0,y:2},{x:1,y:2}],
      [{x:0,y:0},{x:1,y:0},{x:1,y:1},{x:0,y:-2},{x:1,y:-2}]],
    WALL_KICK_OFFSET_I: [
      [{x:0,y:0},{x:1,y:0},{x:-2,y:0},{x:1,y:-2},{x:-2,y:1}],
      [{x:0,y:0},{x:-2,y:0},{x:1,y:0},{x:-2,y:-1},{x:1,y:2}],
      [{x:0,y:0},{x:-1,y:0},{x:2,y:0},{x:-1,y:2},{x:2,y:-1}],
      [{x:0,y:0},{x:2,y:0},{x:-1,y:0},{x:2,y:1},{x:-1,y:-2}]]
  } as const;
  
  const Block = {
    WIDTH: Viewport.CANVAS_WIDTH / Constants.GRID_WIDTH,
    HEIGHT: Viewport.CANVAS_HEIGHT / Constants.GRID_HEIGHT,
  };
  
  export { Constants, Viewport, Block };