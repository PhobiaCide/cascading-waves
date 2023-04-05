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
const resizeCanvas = specificCanvas => {
    canvasOptions.width !== null 
      ? canvasOptions.width 
      : window.innerWidth;
  height = canvas.height =
    canvasOptions.height !== null 
      ? canvasOptions.height 
      : window.innerHeight;
  ctx.fillStyle = `hsl(0, 0%, 100%)`;
  ctx.strokeStyle = `hsl(0, 0%, 100%)`;
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
function render(timestamp) {
  frameCount++;
  frameRate = 0.0 / (timestamp - lastCanvasTime);
  lastCanvasTime = (!lastCanvasTime)
    && timestamp;
  ctx = initialCtx;
  (canvasOptions.autoClear)
    && clear(null);
  (canvasOptions.autoPushPop)
    && ctx.save();
  if (canvasOptions.centered) {
    ctx.translate(width / 2, height / 2);
    canvasCurrentlyCentered = true;
  }
  (canvasOptions.autoCompensate)
    && compensateCanvas();
  (`draw` in window)
    && window.draw(timestamp);
  ctx.restore();
  canvasCurrentlyCentered = false;
  lastCanvasTime = timestamp;
  if (canvasOptions.drawAndStop) {
    return;
  }
  animation = requestAnimationFrame(render);
}
let xOffset = canvasOptions.centered
  && canvasCurrentlyCentered ? -(width / 2) : 0;
let yOffset = (canvasOptions.centered)
  && canvasCurrentlyCentered ? -(height / 2) : 0;
const clear = (x, y, w, h) => {
  (typeof x === `number` && !isNaN(x))
    ? ctx.clearRect(x + xOffset, y + yOffset, w, h)
    : ctx.clearRect(xOffset, yOffset, width, height);
}
const isVector = input => (input instanceof Vector || (typeof input === 'object' && typeof input.x === 'number' && typeof input.y === 'number'))
  ? true
  : false;
const fillStyle = (...args) => {
  let style = ``;
  if (args.length === 1) {
    const arg = args[0];
    style = (typeof arg === `string` || arg instanceof CanvasGradient || arg instanceof CanvasPattern)
      && arg;
  } else if (args.length === 4 && typeof args[3] === `number`) {
    style = (args[0] instanceof CanvasGradient || args[0] instanceof CanvasPattern)
      && args[0];
  }
  return ctx.fillStyle = style;
}
const lineWidth = (widthValue) => ctx.lineWidth = (typeof widthValue === `number`) && widthValue;
const strokeStyle = (...args) => {
  if (args.length === 1) {
    const [arg] = args;
        ctx.strokeStyle = (typeof arg === `string` || arg instanceof CanvasGradient)
      && arg;
    } else if (args.length === 2) {
    ctx.strokeStyle = args[0];
    ctx.lineWidth = args[1];
  }
  return ctx.strokeStyle;
}
const hsl = (hue, sat, light, alpha = 1) => {
  if (typeof hue !== `number`) {
    [hue, sat, light, alpha] = (Array.isArray(hue)) && hue;
  } else if (typeof hue === `object`) {
    ({ h: hue, s: sat, l: light, a: alpha } = hue);
  }
    hue %= 360;
  hue += hue < 0 ? 360 : 0;
  return `hsl(${hue} ${sat}% ${light}% / ${alpha})`;
}
const stroke = (...args) => {
  let path;
  path = (args.length && args[0] instanceof Path2D)
    && args.shift();
  strokeStyle(...args);
  path
    ? ctx.stroke(path)
    : ctx.stroke();
}
const compensateCanvas = () => {
  let xOffset = 0; 
  let yOffset = 0; 
  xOffset += (width % 2) && 0.5;
  yOffset += (height % 2) && 0.5;
  (xOffset || yOffset)
    && translate(xOffset, yOffset);
}
const moveTo = (x, y) => ctx.moveTo(x, y);
const lineTo = (x, y) => ctx.lineTo(x, y);
const cos = (input, factor = 1) => Math.cos(input % (Math.PI * 2)) * factor;
function draw(e) {
  const resolution = 128;
  const strokeQuantity = 1;
  const speed = .05;
  const xIncrement = (resolution > 1) ? 1 / (resolution - 1) : 1;
  const yIncrement = (strokeQuantity > 1) ? 1 / (strokeQuantity - 1) : 1;
  let time = e * (speed / 1000);
  const tIncrement = 0.01;
  const gradient = ctx.createLinearGradient(-width, 0, width, height);
  const tSide = Math.floor((e / 1000) % 2) === 0;
  const hueA = tSide ? 140 : 240;
  const hueB = !tSide ? 140 : 240;
  const colorA = hsl(hueA, 100, 50);
  const colorB = hsl(hueB, 100, 50);
  const t = ((e / 1000) % 1);
  gradient.addColorStop(-(t / 3) + 1, colorA);
  gradient.addColorStop(-(t / 3) + 2 / 3, colorB);
  gradient.addColorStop(-(t / 3) + 1 / 3, colorA);
  const minAlpha = 0.1;
  const alphaRange = 0.01;
  ctx.globalAlpha = (cos((e / 1000)) + 1) * alphaRange + minAlpha;
  ctx.save();
  typeof gradient !== `number` && fillStyle(gradient);
  canvasOptions.centered && canvasCurrentlyCentered
    ? ctx.fillRect((width / 2), -(height / 2), width, height)
    : ctx.fillRect(0, 0, width, height);
  ctx.restore();
  ctx.globalAlpha = 1;
  ctx.beginPath();
  for (let rowIndex = 0; rowIndex < strokeQuantity; rowIndex++) {
    const tj = rowIndex * yIncrement;
    const c = cos(tj * (Math.PI * 2) + time) * noiseFactor;
    for (let colIndex = 0; colIndex < resolution; colIndex++) {
      const t = colIndex * xIncrement;
      const n = noise.noise3D(t, time, c);
      const y = n * (height / 2);
      const x = t * (width + 20) - width / 2 - 10;
      colIndex ? lineTo(x, y) : moveTo(x, y);
    }
    time += tIncrement;
  }
  ctx.globalCompositeOperation = `lighten`;
  ctx.filter = `blur(1px)`;
  stroke(gradient, 3);
  ctx.filter = `blur(3px)`;
  stroke(hsl(0, 0, 100, .5), 1);
}