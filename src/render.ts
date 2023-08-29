import { Blocks, Coord, State } from "./types";
import { Block, Viewport } from "./constant";
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
  s.cubeDead.forEach(cube => svg.removeChild(cube));
  s.cubeAlive.forEach(cube => svg.appendChild(cube));
  s.cubePreview.cubes.forEach(cube => preview.appendChild(cube))
  s.cubePreviewDead.forEach(cube => {
    if(preview.children.length > 4)
    preview.removeChild(cube)
  });
  if(s.currentCube) s.currentCube.cubes.forEach(cube => svg.appendChild(cube));
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

  const createCube = (coord: Coord, color: string) => createSvgElement(svg.namespaceURI, "rect", {
    height: `${Block.HEIGHT}`,
    width: `${Block.WIDTH}`,
    x: `${Block.WIDTH * coord.x}`,
    y: `${Block.HEIGHT * coord.y}`,
    style: `fill: ${color}`,
  });