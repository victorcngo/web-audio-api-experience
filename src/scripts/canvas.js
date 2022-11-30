/* Helpers */
// Generate a random number between a min and max
function getRandomInterval(min, max) {
  return Math.floor(Math.random() * (max - min) + min)
}

// Converts position to herz frequency, then invert y min and y max
function yToFrequency(y) {
  return 491 - (y / 600) * 491 + 32
}

// Get offset of an element
function getElementOffset(el) {
  const rect = el.getBoundingClientRect()

  return {
    top: rect.top + window.pageYOffset,
    left: rect.left + window.pageXOffset,
  }
}

/* Canvas */
let canvas = document.querySelector('.app-canvas')

let dpr = window.devicePixelRatio

canvas.width = 600
canvas.height = 600
canvas.style.maxWidth = 600 + 'px'
canvas.style.maxHeight = 600 + 'px'

const cw = canvas.width
const ch = canvas.height
const cw2 = canvas.width / 2
const ch2 = canvas.height / 2

let canvasOffset = getElementOffset(canvas)
let offsetX = getElementOffset(canvas).left
let offsetY = getElementOffset(canvas).top
let scrollX = getElementOffset(canvas).scrollLeft
let scrollY = getElementOffset(canvas).scrollTop

let ctx = canvas.getContext('2d')
ctx.fillStyle = '#EEEEEE'
ctx.fillRect(0, 0, cw, ch)

/* Audio */
const BaseAudioContext = window.AudioContext || window.webkitAudioContext
const context = new BaseAudioContext()

const oscillator = context.createOscillator()
oscillator.frequency.value = 300
oscillator.type = 'sine'

const amp = context.createGain()
amp.gain.setValueAtTime(0.2, context.currentTime)
oscillator.connect(amp).connect(context.destination)

/* Triangles */
let shapes = []

function drawTriangle(x, y, angle, scale, color, audioFrequency) {
  ctx.save() // Save before we apply changes to context
  ctx.beginPath()

  const size = 100

  ctx.translate(x, y)
  ctx.rotate(angle)
  ctx.scale(scale, scale)

  ctx.moveTo(-size / 2, size / 2)
  ctx.lineTo(0, -size / 2)
  ctx.lineTo(size / 2, size / 2)
  ctx.lineTo(-size / 2, size / 2)

  ctx.closePath()

  ctx.fillStyle = color

  ctx.fill()
  ctx.restore() // Restores the content for the next creation

  // Audio
  let lfo = context.createOscillator()
  lfo.connect(amp.gain)
  lfo.type = 'triangle'
  lfo.frequency.linearRampToValueAtTime(
    audioFrequency,
    context.currentTime + 0.5
  )
  lfo.start()
}

const playButton = document.querySelector('.play')
const clearButton = document.querySelector('.clear')
const generateButton = document.querySelector('.generate')

playButton.addEventListener('click', () => {
  oscillator.start(context.currentTime)
  playButton.style.display = 'none'
})

// Returns true if all color channels in each pixel are 0 (or "blank")
function isCanvasBlank(canvas) {
  return !canvas
    .getContext('2d')
    .getImageData(0, 0, canvas.width, canvas.height)
    .data.some((channel) => channel !== 0)
}

/* Generate */
function generate() {
  const colors = ['#F62A6B', '#82F1D6', '#CF93DF']

  /* Generate a triangle */
  const randomColor = Math.floor(Math.random() * colors.length)
  const randomX = getRandomInterval(0, 600)
  const randomY = getRandomInterval(0, 600)
  const randomAngle = getRandomInterval(0, 2 * Math.PI)
  const randomScale = getRandomInterval(1, 1.5)
  const audioFrequency = yToFrequency(randomY)

  drawTriangle(
    randomX,
    randomY,
    randomAngle,
    randomScale,
    colors[randomColor],
    audioFrequency
  )

  console.log('Triangle created')
  console.log(
    `x: ${randomX}, y: ${randomY}, angle: ${randomAngle} rad., audioFrequency: ${audioFrequency}`
  )
}

clearButton.addEventListener('click', () => {
  ctx.clearRect(0, 0, 600, 600)
  ctx.fillRect(0, 0, 600, 600)
  oscillator.stop(context.currentTime)
})

generateButton.addEventListener('click', () => {
  if (isCanvasBlank(canvas)) {
    generate()
  } else {
    ctx.clearRect(0, 0, 600, 600)
    ctx.fillRect(0, 0, 600, 600)
    generate()
  }
})

/* Drag & drop */
// canvas.addEventListener('mousemove', (event) => {
//   // Check whether point is inside circle
//   const isPointInPath = ctx.isPointInPath(circle, event.offsetX, event.offsetY)
//   ctx.fillStyle = isPointInPath ? 'green' : 'red'

//   // Draw circle
//   ctx.clearRect(0, 0, canvas.width, canvas.height)
//   ctx.fill(circle)
// })
