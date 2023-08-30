import { Blocks, Coord, State } from "./types";
import { Block, Viewport } from "./constant";
import { levelCalculate } from "./utility";
export { show, hide, createSvgElement, render, gameover, createCube };
/** Rendering (side effects) */
// Canvas elements
const svg = document.querySelector("#svgCanvas") as SVGGraphicsElement &
HTMLElement;
const preview = document.querySelector("#svgPreview") as SVGGraphicsElement &
HTMLElement;
const gameover = document.querySelector("#gameOver") as SVGGraphicsElement &
HTMLElement;
const container = document.querySelector("#main") as HTMLElement;

// Text fields
const levelText = document.querySelector("#levelText") as HTMLElement;
const scoreText = document.querySelector("#scoreText") as HTMLElement;
const highScoreText = document.querySelector("#highScoreText") as HTMLElement;

svg.setAttribute("height", `${Viewport.CANVAS_HEIGHT}`);
svg.setAttribute("width", `${Viewport.CANVAS_WIDTH}`);
preview.setAttribute("height", `${Viewport.PREVIEW_HEIGHT}`);
preview.setAttribute("width", `${Viewport.PREVIEW_WIDTH}`);
/**
   * Renders the current state to the canvas.
   *
   * In MVC terms, this updates the View using the Model.
   *
   * @param s Current state
   */
const render = (s: State) => {
  // Add blocks to the main grid canvas
  scoreText.innerHTML = s.score.toString();
  levelText.innerHTML = s.level.toString();
  highScoreText.innerHTML = s.highScore.toString();
  if(s.cubeAlive.length == 0) {
    svg.innerHTML = '';
    svg.appendChild(gameover)
    preview.innerHTML = '';
  }

  s.cubeDead.forEach(data => {
    let e = document.getElementById(data.id) 
    e ? svg.removeChild(e): null});
  s.cubeAlive.forEach(data => {
    let e = document.getElementById(data.id)
    e ? moveSVG(data.coord,e) : svg.appendChild(createCube(data.coord,data.colour,data.id))});
  s.cubePreview.cubes.forEach(data => {
    let e = document.getElementById(data.id)
    e ? moveSVG(data.coord,e) : preview.appendChild(createCube(data.coord,data.colour,data.id));
  })
  s.cubePreviewDead.forEach(data => {
    if(preview.children.length > 4){
    let e = document.getElementById(data.id) 
    e ? preview.removeChild(e): null
    }
  });
  if(s.currentCube) s.currentCube.cubes.forEach(data => {
    let e = document.getElementById(data.id)
    e ? moveSVG(data.coord,e) : svg.appendChild(createCube(data.coord,data.colour,data.id));
  });
};


/**
 * Displays a SVG element on the canvas. Brings to foreground.
 * @param elem SVG element to display
 */
const show = (elem: SVGGraphicsElement) => {
    elem.setAttribute("visibility", "visible");
    elem.parentNode!.appendChild(elem);
  };
  
  /**
   * Hides a SVG element on the canvas.
   * @param elem SVG element to hide
   */
  const hide = (elem: SVGGraphicsElement) =>
    elem.setAttribute("visibility", "hidden");
  
  /**
   * Creates an SVG element with the given properties.
   *
   * See https://developer.mozilla.org/en-US/docs/Web/SVG/Element for valid
   * element names and properties.
   *
   * @param namespace Namespace of the SVG element
   * @param name SVGElement name
   * @param props Properties to set on the SVG element
   * @returns SVG element
   */
  const createSvgElement = (
    namespace: string | null,
    name: string,
    props: Record<string, string> = {}
  ) => {
    const elem = document.createElementNS(namespace, name) as SVGElement;
    Object.entries(props).forEach(([k, v]) => elem.setAttribute(k, v));
    return elem;
  };

  const createCube = (coord: Coord, color: string, id: string) => createSvgElement(svg.namespaceURI, "rect", {
    id: id,
    height: `${Block.HEIGHT}`,
    width: `${Block.WIDTH}`,
    x: `${Block.WIDTH * coord.x}`,
    y: `${Block.HEIGHT * coord.y}`,
    style: `fill: ${color}`,
  });

const moveSVG = (coord: Coord, svg: HTMLElement) => {
  svg.setAttribute('x',`${Block.WIDTH * coord.x}`);
  svg.setAttribute('y',`${Block.HEIGHT * coord.y}`);
  return svg;
}