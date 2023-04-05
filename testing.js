/**
 * It draws a bunch of lines on the canvas.
 * @param timestamp - The timestamp of the current frame.
 * @returns The return value is the current fillStyle value.
 */
const compositeOptions = {
  default: `source-over`,
  sourceOver: `source-over`,
  sourceIn: `source-in`,
  sourceOut: `source-out`,
  sourceAtop: `source-atop`,
  destinationOver: `destination-over`,
  destinationIn: `destination-in`,
  destinationOut: `destination-out`,
  destinationAtop: `destination-atop`,
  lighter: `lighter`,
  copy: `copy`,
  xor: `xor`,
  multiply: `multiply`,
  screen: `screen`,
  overlay: `overlay`,
  darken: `darken`,
  lighten: `lighten`,
  colorDodge: `color-dodge`,
  colorBurn: `color-burn`,
  hardLight: `hard-light`,
  softLight: `soft-light`,
  difference: `difference`,
  exclusion: `exclusion`,
  hue: `hue`,
  saturation: `saturation`,
  color: `color`,
  luminosity: `luminosity`,
  source: {
    over: `source-over`,
    in: `source-in`,
    out: `source-out`,
    atop: `source-atop`
  },
  destination: {
    over: `destination-over`,
    in: `destination-in`,
    out: `destination-out`,
    atop: `destination-atop`
  },
  light: {
    hard: `hard-light`,
    soft: `soft-light`
  }
};
const { PI, floor } = Math;
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
    window.canvasOptions && window.canvasOptions.desynchronized !== undefined
      ? window.canvasOptions.desynchronized
      : defaultCanvasOptions.desynchronized
});
const originalCtx = ctx;
let animation, lastCanvasTime, frameRate, frameCount, width, height;
let canvasCurrentlyCentered = false;
window.addEventListener(`resize`, resizeCanvas);
window.addEventListener(`load`, () => {
  Object.assign(
    canvasOptions,
    defaultCanvasOptions,
    `canvasOptions` in window ? window.canvasOptions : {}
  );
  if (canvasOptions.canvas === false) {
    document.body.removeChild(canvas);
  }
  resizeCanvas();
  if (`setup` in window) {
    window.setup();
  }
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
  if (!lastCanvasTime) {
    lastCanvasTime = timestamp;
  }
  // Create a new context for the canvas.
  ctx = originalCtx;
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
  // Set lastCanvasTime to timestamp.
  lastCanvasTime = timestamp;
  // If drawAndStop is enabled, do not start animation.
  if (canvasOptions.drawAndStop) {
    return;
  }
  // Otherwise, start animation with requestAnimationFrame
  animation = requestAnimationFrame(render);
}

/**
 * Resize a specific canvas
 * @param {HTMLCanvasElement} specificCanvas - The canvas to resize
 */
/**
 * It sets the canvas width and height, sets the fill and stroke styles, and invokes the onResize
 * method if it exists
 * @param specificCanvas - The canvas to resize. If not specified, the default canvas will be resized.
 */
function resizeCanvas(specificCanvas) {
  // Set the canvas width and height
  width = canvas.width =
    canvasOptions.width !== null ? canvasOptions.width : window.innerWidth;
  height = canvas.height =
    canvasOptions.height !== null ? canvasOptions.height : window.innerHeight;

  // Set fill and stroke styles
  ctx.fillStyle = `hsl(0, 0%, 100%)`;
  ctx.strokeStyle = `hsl(0, 0%, 100%)`;

  // If window has an onResize method, invoke it
  if (`onResize` in window) {
    window.onResize();
  }
}

// Initialize offsets
let xOffset =
  canvasOptions.centered && canvasCurrentlyCentered ? -(width / 2) : 0;
let yOffset =
  canvasOptions.centered && canvasCurrentlyCentered ? -(height / 2) : 0;

/**
 * Clear a canvas either with specific coordinates or clear the full canvas.
 *
 * @param {number} x - The x-coordinate of the top left corner of the rectangle to be cleared.
 * @param {number} y - The y-coordinate of the top left corner of the rectangle to be cleared.
 * @param {number} w - The width of the rectangle to be cleared.
 * @param {number} h - The height of the rectangle to be cleared.
 */
/**
 * If all numbers are provided, draw at specific coordinates, otherwise clear full canvas
 * @param x - The x-coordinate of the upper-left corner of the rectangle to clear.
 * @param y - The y-coordinate of the upper-left corner of the rectangle to clear.
 * @param w - width of the rectangle to clear
 * @param h - The height of the rectangle to clear.
 */
function clear(x, y, w, h) {
  // If all numbers are provided, draw at specific coordinates
  if (typeof x === `number` && !isNaN(x))
    ctx.clearRect(x + xOffset, y + yOffset, w, h);
  // Otherwise clear full canvas
  ctx.clearRect(xOffset, yOffset, width, height);
}

/**
 * @description Checks if input is a vector or object
 * @param {Vector|Object} input The vector or object to be checked
 */
/**
 * If the input is an instance of Vector or an object with x and y properties, return true, otherwise
 * return false
 * @param input - The input to check if it's a Vector or not.
 * @returns a boolean value.
 */
function isVector(input) {
  // Use instanceof operator and typeof operator to check for Vector and Object
  if (
    input instanceof Vector ||
    (typeof input === 'object' &&
      typeof input.x === 'number' &&
      typeof input.y === 'number')
  ) {
    return true;
  }
  return false;
}

/**
 * fillStyle is designed to take a color, pattern, or gradient as an argument and
 * set the context fillStyle to that value
 * @param {String|CanvasGradient|CanvasPattern} args
 */
function fillStyle(...args) {
  let style = ``;
  // if only one argument is passed, check if it is a string, Gradient, or Pattern
  if (args.length === 1) {
    const arg = args[0];
    if (
      typeof arg === `string` ||
      arg instanceof CanvasGradient ||
      arg instanceof CanvasPattern
    ) {
      style = arg;
    }
    // if two Strings, two gradients/patterns, and a number are passed
  } else if (args.length === 4 && typeof args[3] === `number`) {
    // parse the arguments into a gradient or pattern
    if (args[0] instanceof CanvasGradient || args[0] instanceof CanvasPattern) {
      style = args[0];
    }
  }
  ctx.fillStyle = style;
  return ctx.fillStyle;
}

/**
 * Function to set and get line width
 * @param {number} width - The new line width
 * @returns {number} The currently set line width
 */
function lineWidth(widthValue) {
  // Check if passed in value is a number
  if (typeof widthValue === `number`) {
    // Set the line width to the passed in value
    ctx.lineWidth = widthValue;
  }

  // Return the currently set line width
  return ctx.lineWidth;
}

/*
 * Function to set the stroke style
 */
function strokeStyle(...args) {
  // Check if there is only 1 element in the array
  if (args.length === 1) {
    const [arg] = args;
    // If the type of the argument is a string or an instance of CanvasGradient, set the ctx.strokeStyle to it
    if (typeof arg === `string` || arg instanceof CanvasGradient) {
      ctx.strokeStyle = arg;
    }
    // If there are 2 elements in the array, call strokeStyle with the first argument and lineWidth with the second one
  } else if (args.length === 2) {
    strokeStyle(args[0]);
    lineWidth(args[1]);
  }
  // Return the stroke style value
  return ctx.strokeStyle;
}

// The hsl() function takes the hue, saturation, lightness and an optional alpha channel as inputs
function hsl(hue, sat, light, alpha = 1) {
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
  if (hue < 0) {
    hue += 360;
  }

  // Return the result of the function
  return `hsl(${hue} ${sat}% ${light}% / ${alpha})`;
}

// Strokes the path with the current painting style
function stroke(...args) {
  let path;
  // Check if a path2D object is passed as the first argument
  if (args.length) {
    if (args[0] instanceof Path2D) {
      path = args.shift();
    }
  }

  // Set the current strokeStyle for drawing
  strokeStyle(...args);

  // If the path variable is set, use it to stroke the canvas
  path ? ctx.stroke(path) : ctx.stroke();
}

// This function compensates the odd-numbered width and height of a canvas
function compensateCanvas() {
  let offX = 0; // offset x value
  let offY = 0; // offset y value
  // If the width is odd, add 0.5 to the x offset
  if (width % 2) {
    OffX += 0.5;
  }

  // If the height is odd, add 0.5 to the y offset
  if (height % 2) {
    offY += 0.5;
  }

  // If either axes has an offset value, Translate the canvas
  if (offX || offY) {
    translate(offX, offY);
  }
}

// Moves the cursor to the given coordinates or vector
function moveTo(x, y) {
  let targetX;
  let targetY;
  if (typeof x === `number`) {
    targetX = x;
    targetY = y;
  } else if (isVector(x)) {
    targetX = x.x;
    targetY = x.y;
  }

  ctx.moveTo(targetX, targetY);
}

// Draw a line from the current point of the canvas
// to the specified coordinates (x, y) or a vector.
function lineTo(x, y) {
  // If the parameter is a number, draw a line to
  // the specified x and y coordinates.
  if (typeof x === `number` && typeof y === `number`) {
    ctx.lineTo(x, y);
    // Otherwise, if the parameter is a vector, draw a line
    // to the coordinates specified by the vector.
  } else if (isVector(x)) {
    ctx.lineTo(x.x, x.y);
  }
}

function cos(input, factor = 1) {
  return Math.cos(input % (PI * 2)) * factor;
}

function draw(e) {
  // count of cells in x/y direction
  const gridWidth = 35;
  const gridHeight = 80;
  // incremental amount for cell coordinates
  const incrementX = 1 / (gridWidth - 1);
  const incrementY = 1 / (gridHeight - 1);
  // time step - used as frequency multiplier for noise
  let time = e * 0.001;
  const timeStep = 0.01;
  // create linear gradient
  const grad = ctx.createLinearGradient(-width, 0, width, height);
  const tSide = floor(time % 2) === 0;
  // set left and right colors from hsl
  const hueA = tSide ? 340 : 240;
  const hueB = !tSide ? 340 : 240;
  const colorA = hsl(hueA, 100, 50);
  const colorB = hsl(hueB, 100, 50);
  // take the modulo 1 of the time and treated as a boolean
  const t = time % 1;
  // assign colors to the gradient using t
  grad.addColorStop(-(t / 3) + 1, colorA);
  grad.addColorStop(-(t / 3) + 2 / 3, colorB);
  grad.addColorStop(-(t / 3) + 1, colorA);
  // reduce alpha value
  ctx.globalAlpha = (cos(time) + 1) * 0.1 + 0.15;
  ctx.save();
  if (typeof grad !== `number`) {
    fillStyle(grad);
  }
  // fill with rect
  if (canvasOptions.centered && canvasCurrentlyCentered) {
    ctx.fillRect(-(width / 2), -(height / 2), width, height);
  } else {
    ctx.fillRect(0, 0, width, height);
  }
  ctx.restore();
  ctx.globalAlpha = 1;

  // new path and loop through y-count and x-count
  ctx.beginPath();
  for (let rowIndex = 0; rowIndex < gridHeight; rowIndex++) {
    const tj = rowIndex * incrementY;
    const c = cos(tj * (PI * 2) + time) * 0.1;
    for (let colIndex = 0; colIndex < gridWidth; colIndex++) {
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
  ctx.globalCompositeOperation = compositeOptions.lighter;
  ctx.filter = `blur(10px)`;
  stroke(grad, 5);
  ctx.filter = `blur(5px)`;
  stroke(hsl(0, 0, 100, 0.8), 2);
}