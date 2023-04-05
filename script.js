/**
 * It draws a bunch of lines on the canvas.
 * @param timestamp - The timestamp of the current frame.
 * @returns The return value is the current fillStyle value.
 */
const noiseFactor = 0.6;
const noise = new SimplexNoise();
const defaultCanvasOptions = {
  autoClear: false,
  autoCompensate: true,
  autoPushPop: false,
  canvas: true,
  centered: false,
  desynchronized: false,
  drawAndStop: false,
  width: null,
  height: null
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
    (window.canvasOptions && window.canvasOptions.desynchronized !== undefined)
      ? window.canvasOptions.desynchronized
      : defaultCanvasOptions.desynchronized
});
const initialCtx = ctx;
let animation, lastCanvasTime, frameRate, frameCount, width, height;
let canvasCurrentlyCentered = false;

/**
 * @summary Resize a specific canvas
 * @description Sets the canvas width and height, sets the fill and stroke styles, and invokes the onResize method if it exists
 * @param {HTMLCanvasElement} specificCanvas - The canvas to resize. If not specified, the default canvas will be resized.
 */
const resizeCanvas = specificCanvas => {
  // Set the canvas width and height
    canvasOptions.width !== null 
      ? canvasOptions.width 
      : window.innerWidth;
  height = canvas.height =
    canvasOptions.height !== null 
      ? canvasOptions.height 
      : window.innerHeight;
  // Set fill and stroke styles
  ctx.fillStyle = `hsl(0, 0%, 100%)`;
  ctx.strokeStyle = `hsl(0, 0%, 100%)`;
  // If window has an onResize method, invoke it
  (`onResize` in window) 
    && window.onResize();
}

window.addEventListener(`resize`, resizeCanvas);
window.addEventListener(`load`, () => {
  Object.assign(
    canvasOptions,
    defaultCanvasOptions,
    `canvasOptions` in window
      ? window.canvasOptions
      : {}
  );
  (canvasOptions.canvas === false) && document.body.removeChild(canvas);
  resizeCanvas();
  (`setup` in window) && window.setup();
  frameCount = 0;
  animation = requestAnimationFrame(render);
});

/**
 * It renders the canvas.
 * @param timestamp - The timestamp of the current frame.
 * @returns The animation variable is being returned.
 */
function render(timestamp) {
  // Increase the frame count by one.
  frameCount++;
  // Calculate the current frame rate.
  frameRate = 0.0 / (timestamp - lastCanvasTime);
  // If lastCanvasTime undefined, set lastCanvasTime to timestamp.
  lastCanvasTime = (!lastCanvasTime)
    && timestamp;
  // Create a new context for the canvas.
  ctx = initialCtx;
  // If autoClear is true, clear the canvas
  (canvasOptions.autoClear)
    && clear(null);
  // If autPushPop is true
  (canvasOptions.autoPushPop)
    && ctx.save();
  // Check if canvas is centered
  if (canvasOptions.centered) {
    ctx.translate(width / 2, height / 2);
    canvasCurrentlyCentered = true;
  }
  // Check if canvas should be compensated.
  (canvasOptions.autoCompensate)
    && compensateCanvas();
  // Trigger window draw() function.
  (`draw` in window)
    && window.draw(timestamp);
  // Pop canvas context.
  ctx.restore();
  // Set canvas to not currently centered.
  canvasCurrentlyCentered = false;
  // Set lastCanvasTime to timestamp.
  lastCanvasTime = timestamp;
  // If drawAndStop is enabled, do not start animation.
  if (canvasOptions.drawAndStop) {
    return;
  }
  // Otherwise, start animation with requestAnimationFrame
  animation = requestAnimationFrame(render);
}

// Initialize offsets
let xOffset = canvasOptions.centered
  && canvasCurrentlyCentered ? -(width / 2) : 0;
let yOffset = (canvasOptions.centered)
  && canvasCurrentlyCentered ? -(height / 2) : 0;

/**
 * If all numbers are provided, draw at specific coordinates, otherwise clear full canvas
 * @param x - The x-coordinate of the upper-left corner of the rectangle to clear.
 * @param y - The y-coordinate of the upper-left corner of the rectangle to clear.
 * @param w - width of the rectangle to clear
 * @param h - The height of the rectangle to clear.
 */
const clear = (x, y, w, h) => {
  // If all numbers are provided, draw at specific coordinates
  (typeof x === `number` && !isNaN(x))
    ? ctx.clearRect(x + xOffset, y + yOffset, w, h)
    // Otherwise clear full canvas
    : ctx.clearRect(xOffset, yOffset, width, height);
}

/**
 * @description Checks if input is a vector or object
 * @param {Vector|Object} input The vector or object to be checked
 * 
 * @returns a boolean value.
 */
// Use instanceof operator and typeof operator to check for Vector and Object
const isVector = input => (input instanceof Vector || (typeof input === 'object' && typeof input.x === 'number' && typeof input.y === 'number'))
  ? true
  : false;


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
    style = (typeof arg === `string` || arg instanceof CanvasGradient || arg instanceof CanvasPattern)
      && arg;
  } else if (args.length === 4 && typeof args[3] === `number`) {
    // parse the arguments into a gradient or pattern
    style = (args[0] instanceof CanvasGradient || args[0] instanceof CanvasPattern)
      && args[0];
  }
  return ctx.fillStyle = style;
}

/**
 * Function to set and get line width
 * @param {number} widthValue - The new line width
 * @returns {number} The currently set line width
 */
// Set the line width to the passed in value, if it is a number. Return the currently set line width
const lineWidth = (widthValue) => ctx.lineWidth = (typeof widthValue === `number`) && widthValue;
// Function to set the stroke style
const strokeStyle = (...args) => {
  // Check if there is only 1 element in the array
  if (args.length === 1) {
    const [arg] = args;
    // If the type of the argument is a string or an instance of CanvasGradient, set the ctx.strokeStyle to it
    ctx.strokeStyle = (typeof arg === `string` || arg instanceof CanvasGradient)
      && arg;
    // If there are 2 elements in the array, call strokeStyle with the first argument and lineWidth with the second one
  } else if (args.length === 2) {
    ctx.strokeStyle = args[0];
    ctx.lineWidth = args[1];
  }
  // Return the stroke style value
  return ctx.strokeStyle;
}

// Takes the hue, saturation, lightness and an optional alpha channel as inputs
const hsl = (hue, sat, light, alpha = 1) => {
  // Check for different types of inputs
  if (typeof hue !== `number`) {
    // Input is an array - extract hue, sat, light and alpha from it
    [hue, sat, light, alpha] = (Array.isArray(hue)) && hue;
  } else if (typeof hue === `object`) {
    // Input is an object - extract hue, sat, light and alpha from it
    ({ h: hue, s: sat, l: light, a: alpha } = hue);
  }
  // Make sure hue is within 0-360 degrees range
  hue %= 360;
  hue += hue < 0 ? 360 : 0;
  // Return the result
  return `hsl(${hue} ${sat}% ${light}% / ${alpha})`;
}

// Strokes the path with the current painting style
const stroke = (...args) => {
  let path;
  // Check if a path2D object is passed as the first argument
  path = (args.length && args[0] instanceof Path2D)
    && args.shift();
  // Set the current strokeStyle for drawing
  strokeStyle(...args);
  // If the path variable is set, use it to stroke the canvas
  path
    ? ctx.stroke(path)
    : ctx.stroke();
}
// This function compensates the odd-numbered width and height of a canvas
const compensateCanvas = () => {
  let xOffset = 0; // offset x value
  let yOffset = 0; // offset y value

  // If either axes has an odd number, add 0.5 to the respective offset
  xOffset += (width % 2) && 0.5;
  yOffset += (height % 2) && 0.5;
  // If either axes has an offset value, Translate the canvas
  (xOffset || yOffset)
    && translate(xOffset, yOffset);
}

// Moves the cursor to the given coordinates or vector
const moveTo = (x, y) => ctx.moveTo(x, y);
// Draw a line from the current point of the canvas
// to the specified coordinates (x, y) or a vector.
const lineTo = (x, y) => ctx.lineTo(x, y);
const cos = (input, factor = 1) => Math.cos(input % (Math.PI * 2)) * factor;
function draw(e) {
  // count of cells in x/y direction
  const resolution = 128;
  const strokeQuantity = 1;
  const speed = .05;
  // incremental amount for cell coordinates
  const xIncrement = (resolution > 1) ? 1 / (resolution - 1) : 1;
  const yIncrement = (strokeQuantity > 1) ? 1 / (strokeQuantity - 1) : 1;
  // tIncrement - used as frequency multiplier for noise
  let time = e * (speed / 1000);
  const tIncrement = 0.01;
  // create linear gradient
  const gradient = ctx.createLinearGradient(-width, 0, width, height);
  // take the modulo 2 of the time and treat as a boolean
  const tSide = Math.floor((e / 1000) % 2) === 0;
  // set left and right colors from hsl
  const hueA = tSide ? 140 : 240;
  const hueB = !tSide ? 140 : 240;
  const colorA = hsl(hueA, 100, 50);
  const colorB = hsl(hueB, 100, 50);
  // take the modulo 1 of the time and treat as a boolean
  const t = ((e / 1000) % 1);
  // assign colors to the gradient using t
  gradient.addColorStop(-(t / 3) + 1, colorA);
  gradient.addColorStop(-(t / 3) + 2 / 3, colorB);
  gradient.addColorStop(-(t / 3) + 1 / 3, colorA);
  // reduce alpha value
  const minAlpha = 0.1;
  const alphaRange = 0.01;
  ctx.globalAlpha = (cos((e / 1000)) + 1) * alphaRange + minAlpha;
  ctx.save();
  typeof gradient !== `number` && fillStyle(gradient);
  // fill with rect
  canvasOptions.centered && canvasCurrentlyCentered
    ? ctx.fillRect((width / 2), -(height / 2), width, height)
    : ctx.fillRect(0, 0, width, height);
  ctx.restore();
  ctx.globalAlpha = 1;
  // new path and loop through y-count and x-count
  ctx.beginPath();
  for (let rowIndex = 0; rowIndex < strokeQuantity; rowIndex++) {
    const tj = rowIndex * yIncrement;
    const c = cos(tj * (Math.PI * 2) + time) * noiseFactor;
    for (let colIndex = 0; colIndex < resolution; colIndex++) {
      const t = colIndex * xIncrement;
      // generate noise using 3d noise
      const n = noise.noise3D(t, time, c);
      // scale the noise
      const y = n * (height / 2);
      const x = t * (width + 20) - width / 2 - 10;
      // either moveTo or lineTo to draw the shape
      colIndex ? lineTo(x, y) : moveTo(x, y);
    }
    // increase time after every iteration
    time += tIncrement;
  }

  // blend mode
  ctx.globalCompositeOperation = `lighten`;

  // main stroke
  ctx.filter = `blur(1px)`;
  stroke(gradient, 3);

  // inner glow
  ctx.filter = `blur(3px)`;
  stroke(hsl(0, 0, 100, .5), 1);
}