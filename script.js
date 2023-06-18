const { log } = console;
/**
 * Draws a given number of lines on the canvas.
 * @param timestamp - The timestamp of the current frame.
 * @returns The return value is the current fillStyle value.
 */
const compositeOptions = {
  xor: `xor`,
  hue: `hue`,
  copy: `copy`,
  color: `color`,
  screen: `screen`,
  darken: `darken`,
  lighter: `lighter`,
  overlay: `overlay`,
  lighten: `lighten`,
  multiply: `multiply`,
  sourceIn: `source-in`,
  default: `source-over`,
  exclusion: `exclusion`,
  sourceOut: `source-out`,
  colorBurn: `color-burn`,
  hardLight: `hard-light`,
  softLight: `soft-light`,
  difference: `difference`,
  saturation: `saturation`,
  luminosity: `luminosity`,
  sourceOver: `source-over`,
  sourceAtop: `source-atop`,
  colorDodge: `color-dodge`,
  destinationIn: `destination-in`,
  destinationOut: `destination-out`,
  destinationOver: `destination-over`,
  destinationAtop: `destination-atop`,
};
const { PI, floor, cos } = Math;
const noise = new SimplexNoise();
const defaultCanvasOptions = {
  width: null,
  canvas: true,
  height: null,
  centered: false,
  autoClear: false,
  autoPushPop: false,
  drawAndStop: false,
  autoCompensate: true,
  desynchronized: false,
};
const canvasOptions = {};
let canvas = document.getElementById(`canvas`);
if (canvas === null) {
  canvas = document.createElement(`canvas`);
  canvas.id = `canvas`;
  document.body.appendChild(canvas);
}
let ctx = canvas.getContext(`2d`, {
  desynchronized:
    window.canvasOptions && window.canvasOptions.desynchronized !== undefined
      ? window.canvasOptions.desynchronized
      : defaultCanvasOptions.desynchronized,
});
const initialCtx = ctx;
let animation, previousTimestamp, frameRate, frameCount, width, height;
let canvasCurrentlyCentered = false;
window.addEventListener(`resize`, resizeCanvas);
window.addEventListener(`load`, () => {
  Object.assign(
    canvasOptions,
    defaultCanvasOptions,
    `canvasOptions` in window ? window.canvasOptions : {}
  );
  canvasOptions.canvas === false && document.body.removeChild(canvas);
  resizeCanvas();
  `setup` in window && window.setup();
  frameCount = 0;
  animation = requestAnimationFrame(render);
});
/**
 * It renders the canvas.
 * @param timestamp - The timestamp of the current frame.
 * @returns The animation variable is being returned.
 */
const render = (timestamp) => {
  // Increase the frame count by one.
  frameCount++;
  // Calculate the current frame rate.
  frameRate = 0.0 / (timestamp - previousTimestamp);
  // If previousTimestamp undefined, set previousTimestamp to timestamp.
  previousTimestamp = !previousTimestamp && timestamp;
  // Create a new context for the canvas.
  ctx = initialCtx;
  // If autoClear is true, clear the canvas
  canvasOptions.autoClear && clear(null);
  // If autPushPop is true
  if (canvasOptions.autoPushPop) {
    ctx.save();
    // Check if canvas is centered
    if (canvasOptions.centered && !canvasCurrentlyCentered) {
      ctx.translate(width / 2, height / 2);
      canvasCurrentlyCentered = true;
    }
    // Check if canvas should be compensated.
    canvasOptions.autoCompensate && compensateCanvas();
    // Trigger window draw() function.
    `draw` in window && window.draw(timestamp);
  }
  // Pop canvas context.
  canvasOptions.autoPushPop && ctx.restore();
  // Set canvas to not currently centered.
  canvasCurrentlyCentered = false;
  // Set previousTimestamp to timestamp.
  previousTimestamp = timestamp;
  // If drawAndStop is enabled, do not start animation.
  if (canvasOptions.drawAndStop) return;
  // Otherwise, start animation with requestAnimationFrame
  animation = requestAnimationFrame(render);
};

/**
 * Resize a specific canvas
 * @param {HTMLCanvasElement} specificCanvas - The canvas to resize. If not specified, the default canvas will be resized.
 */
function resizeCanvas(specificCanvas) {
  // Set the canvas width and height
  width = canvas.width =
    canvasOptions.width !== null ? canvasOptions.width : window.innerWidth;
  height = canvas.height =
    canvasOptions.height !== null ? canvasOptions.height : window.innerHeight;

  // Set fill and stroke styles
  //ctx.fillStyle = `hsl(0, 0%, 100%)`;
  //ctx.strokeStyle = `hsl(0, 0%, 100%)`;

  // If window has an onResize method, invoke it
  `onResize` in window && window.onResize();
}
// Initialize offsets
let xOffset =
  canvasOptions.centered && canvasCurrentlyCentered ? -(width / 2) : 0;
let yOffset =
  canvasOptions.centered && canvasCurrentlyCentered ? -(height / 2) : 0;
/**
 * Clear a canvas either with specific coordinates or clear the full canvas.
 * @param {number} x - The x-coordinate of the top left corner of the rectangle to be cleared.
 * @param {number} y - The y-coordinate of the top left corner of the rectangle to be cleared.
 * @param {number} w - The width of the rectangle to be cleared.
 * @param {number} h - The height of the rectangle to be cleared.
 */
const clear = (x, y, w, h) => {
  // If all numbers are provided, draw at specific coordinates
  typeof x === `number` &&
    !isNaN(x) &&
    ctx.clearRect(x + xOffset, y + yOffset, w, h);
  // Otherwise clear full canvas
  ctx.clearRect(xOffset, yOffset, width, height);
};

/**
 * fillStyle is designed to take a color, pattern, or gradient as an argument and
 * set the context fillStyle to that value
 * @param {String|CanvasGradient|CanvasPattern} args
 */
const fillStyle = (...args) => {
  let style = ``;
  // if only one argument is passed, check if it is a string, Gradient, or Pattern
  if (args.length === 1) {
    const arg = args[0];
    if (
      typeof arg === `string` ||
      arg instanceof CanvasGradient ||
      arg instanceof CanvasPattern
    )
      style = arg;
    // if two Strings, two gradients/patterns, and a number are passed
  } else if (args.length === 4 && typeof args[3] === `number`) {
    // parse the arguments into a gradient or pattern
    if (args[0] instanceof CanvasGradient || args[0] instanceof CanvasPattern)
      style = args[0];
  }

  return (ctx.fillStyle = style);
};
/**
 * Function to set and get line width
 * @param {number} width - The new line width
 * @returns {number} The currently set line width
 */
const lineWidth = (widthValue) => {
  // Check if passed in value is a number set the line width to the passed in value
  if (typeof widthValue === `number`) ctx.lineWidth = widthValue;

  // Return the currently set line width
  return ctx.lineWidth;
};
/**
 * Function to set the stroke style
 */
const strokeStyle = (...args) => {
  // Check if there is only 1 element in the array
  if (args.length === 1) {
    const [arg] = args;
    // If the type of the argument is a string or an instance of CanvasGradient, set the ctx.strokeStyle to it
    ctx.strokeStyle =
      (typeof arg === `string` || arg instanceof CanvasGradient) && arg;
    // If there are 2 elements in the array, call strokeStyle with the first argument and lineWidth with the second one
  } else if (args.length === 2) {
    strokeStyle(args[0]);
    lineWidth(args[1]);
  }

  // Return the stroke style value
  return ctx.strokeStyle;
}; // strokeStyle()
// The hsl() function takes the hue, saturation, lightness and an optional alpha channel as inputs
const hsl = (hue, sat, light, alpha = 1) => {
  // Check for different types of inputs
  if (typeof hue !== `number`) {
    if (Array.isArray(hue)) {
      // Input is an array - extract hue, sat, light and alpha from it
      [hue, sat, light, alpha = alpha] = hue;
    } else if (typeof hue === `object`) {
      // Input is an object - extract hue, sat, light and alpha from it
      ({ h: hue, s: sat, l: light, a: alpha = alpha } = hue);
    }
  }
  // Make sure hue is within 0-360 degrees range
  hue = hue % 360;
  hue += hue < 0 ? 360 : 0;

  // Return the result of the function
  return `hsl(${hue} ${sat}% ${light}% / ${alpha})`;
};
// Strokes the path with the current painting style
const stroke = (...args) => {
  // Check if a path2D object is passed as the first argument
  const path = args.length && args[0] instanceof Path2D && args.shift();
  // Set the current strokeStyle for drawing
  strokeStyle(...args);
  // If the path variable is set, use it to stroke the canvas
  path ? ctx.stroke(path) : ctx.stroke();
};
// This function compensates the odd-numbered width and height of a canvas
const compensateCanvas = () => {
  // If the width is odd, add 0.5 to the x offset
  const offX = width % 2 ? 0.5 : 0;
  // If the height is odd, add 0.5 to the y offset
  const offY = height % 2 ? 0.5 : 0;
  // If either axes has an offset value, Translate the canvas
  (offX || offY) && translate(offX, offY);
};
// Moves the cursor to the given coordinates or vector
const moveTo = (x, y) => {
  const targetX = -width / 2;
  const targetY = typeof y === `number` && y;
  ctx.moveTo(targetX, targetY);
};
// Draw a line from the current point of the canvas to the specified coordinates (x, y) or a vector.
const lineTo = (x, y) => {
  // If the parameter is a number, draw a line to the specified x and y coordinates.
  typeof x === `number` && typeof y === `number` && ctx.lineTo(x, y);
};
const cosine = (input, factor = 1) => cos(input % (PI * 2)) * factor;

function draw(e) {
  const colorSpeed = 0.01;
  // count of cells in x/y direction
  const resolution = 64;
  const strokeCount = 128;
  // incremental amount for cell coordinates
  const incrementX = resolution == 1 ? 1 : 1 / (resolution - 1);
  const incrementY = strokeCount == 1 ? 1 : 1 / (strokeCount - 1);
  // time step - used as frequency multiplier for noise
  let time = e * 0.00045;
  const timeStep = 0.0045;
  // create linear gradient
  const gradient = ctx.createLinearGradient(-width, 0, width, height);
  // set left and right colors from hsl
  const colorA = hsl(40, 100, 40);
  const colorB = hsl(330, 100, 40);
  // take the modulo 1 of the time and treated as a boolean
  const t = time % 1;
  // assign colors to the gradient using t
  gradient.addColorStop(-(t / 3) + 1, colorB);
  gradient.addColorStop(-(t / 3) + 2 / 3, colorA);
  gradient.addColorStop(-(t / 3) + 1 / 3, colorB);
  // reduce alpha value
  ctx.globalAlpha = (cosine(time) + 1) * 0.1 + 0.15;
  ctx.save();
  typeof gradient !== `number` && fillStyle(gradient);
  // fill with rect
  canvasOptions.centered && canvasCurrentlyCentered
    ? ctx.fillRect(-(width / 2), -(height / 2), width, height)
    : ctx.fillRect(0, 0, width, height);
  ctx.restore();
  ctx.globalAlpha = 1;
  // new path and loop through y-count and x-count
  ctx.beginPath();
  for (let rowIndex = 0; rowIndex < strokeCount; rowIndex++) {
    const tj = rowIndex * incrementY;
    const c = cosine(PI * 2) * 0.1;
    for (let colIndex = 0; colIndex < resolution; colIndex++) {
      const t = colIndex * incrementX;
      // generate noise using 3d noise
      const n = noise.noise3D(t, time, c);
      // scale the noise
      const y = n * (height / 2);
      const x = t * (width + 20) - width / 2 - 10;
      // either moveTo or lineTo to draw the shape
      (colIndex ? lineTo : moveTo)(x, y);
    }
    // increase time after every iteration
    time += timeStep;
  }
  // drawing styles
  ctx.globalCompositeOperation = compositeOptions.softLight;
  ctx.filter = `blur(6px)`;
  stroke(gradient, 3);
  ctx.filter = `blur(6px)`;
  stroke(hsl(0, 0, 100, 0.8), 3);
}
