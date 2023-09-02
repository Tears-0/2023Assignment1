import { Coord, SVGMetaData, State } from "./types";
import { Block, Viewport } from "./constant";
import { DOUBLE, I } from "./utility";
export { show, hide, render, gameover, createCube };
/** Rendering (side effects) */
// Canvas elements
const svg = document.querySelector("#svgCanvas") as SVGGraphicsElement &
HTMLElement;
const preview = document.querySelector("#svgPreview") as SVGGraphicsElement &
HTMLElement;
const holdBar = document.querySelector("#svgHold") as SVGGraphicsElement &
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
holdBar.setAttribute("height", `${Viewport.PREVIEW_HEIGHT}`);
holdBar.setAttribute("width", `${Viewport.PREVIEW_WIDTH}`);

const modifyMove = (x:SVGMetaData) => modifySVG(moveSVG(x.coord));

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

  //Render block on hold
  s.blockOnHold ? s.blockOnHold.cubes.forEach(data => 
    modifySVG(DOUBLE(moveSVG(data.coord))(setColor(data.colour)))(x=>holdBar.appendChild(createCube(x.coord)(x.colour)(x.id)))(data)) : 
    holdBar.innerHTML = '';

  s.cubeDead.forEach(modifySVG(x => svg.removeChild(x))(I));

  s.cubeAlive.forEach(data => 
    modifyMove(data)(x=>svg.appendChild(createCube(x.coord)(x.colour)(x.id)))(data));

  s.cubePreview.cubes.forEach(modifySVG(I)(x=>preview.appendChild(createCube(x.coord)(x.colour)(x.id))));

  s.cubePreviewDead.forEach(modifySVG(x => preview.children.length > 4 ? preview.removeChild(x) : I(x))(I));

  s.currentBlock ? s.currentBlock.cubes.forEach(data => 
    modifyMove(data)(x=>svg.appendChild(createCube(x.coord)(x.colour)(x.id)))(data)) : null;
};

const modifySVG = (f1: (s:HTMLElement) => any) => (f2: (s:SVGMetaData) => any) => (data: SVGMetaData) =>{
  let element = document.getElementById(data.id);
  element ? f1(element) : f2(data);
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

/**
 *  Function that create new svg cube with coord, color and id
 * @param coord Coord coord of the svg element
 * @param color String color
 * @param id String id of svg element
 * @returns SVGElement created svg element representing cube
 */
const createCube = (coord: Coord) => (color: string) => (id: string): SVGElement => createSvgElement(svg.namespaceURI, "rect", {
  id: id,
  height: `${Block.HEIGHT}`,
  width: `${Block.WIDTH}`,
  x: `${Block.WIDTH * coord.x}`,
  y: `${Block.HEIGHT * coord.y}`,
  style: `fill: ${color}`,
});

/**
 * Set x y of provided html element
 * @param coord Coord to be set
 * @param svg HTMLElement svg to be moved
 */
const moveSVG = (coord: Coord) => (svg: HTMLElement) => {
  svg.setAttribute('x',`${Block.WIDTH * coord.x}`);
  svg.setAttribute('y',`${Block.HEIGHT * coord.y}`);
}

/**
 * Set color of a HTMLElement
 * @param svg HTMLElement svg to be modified
 * @param color String color 
 */
const setColor = (color: string) => (svg: HTMLElement) =>
  svg.setAttribute('style', `fill: ${color}`);