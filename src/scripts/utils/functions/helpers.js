/**
 * Helpers
 */

/* Handle cases when canvas is empty */
export function isCanvasBlank(canvas) {
  return !canvas
    .getContext('2d')
    .getImageData(0, 0, canvas.width, canvas.height)
    .data.some((channel) => channel !== 0)
}

/* Returns a random number between a min and a max value */
export function getRandomIntFromInterval(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min)
}

/* Returns an element offset in pixels */
export function getElementOffset(el) {
  const rect = el.getBoundingClientRect()

  return {
    top: rect.top + window.pageYOffset,
    left: rect.left + window.pageXOffset,
  }
}

/* Converts a position (x) between 0 and the max canvas width to a gain between 0 and 0.1 */
export function xToGain(x) {
  return x / 6000
}

/* Converts a position (y) between 0 and the max canvas height to a frequency between 32 and 523hz */
export function yToFrequency(y) {
  return 491 - (y / 600) * 491 + 32
}
