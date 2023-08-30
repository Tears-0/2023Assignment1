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
    SCORE_TABLE: [0,100,300,500,800],
    BLOCK_TYPE: ['T','O','Z','S','I','1','L']
  } as const;
  
  const Block = {
    WIDTH: Viewport.CANVAS_WIDTH / Constants.GRID_WIDTH,
    HEIGHT: Viewport.CANVAS_HEIGHT / Constants.GRID_HEIGHT,
  };
  
  export { Constants, Viewport, Block };