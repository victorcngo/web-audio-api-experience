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

function drawShape(x, y, points, color, audioFrequency) {
  const shape = new Path2D()
  const size = 100

  ctx.save()
  ctx.translate(x, y)
  // ctx.rotate(angle)
  // ctx.scale(scale, scale)

  shape.moveTo(-size / 2, size / 2)
  shape.lineTo(0, -size / 2)
  shape.lineTo(size / 2, size / 2)
  shape.lineTo(-size / 2, size / 2)

  shape.closePath()

  ctx.fillStyle = color

  ctx.fill(shape)
  ctx.restore()

  shapes.push({ x, y })
  console.log(shapes)

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

  drawShape(
    randomX,
    randomY,
    [
      {
        x: 0,
        y: 20,
      },
      {
        x: 30,
        y: 0,
      },
      {
        x: 70,
        y: 45,
      },
    ],
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
    generate()
  }
})

/* Drag & drop */

function handleMouseDown(e) {
  e.preventDefault()
  startX = parseInt(e.clientX - offsetX)
  startY = parseInt(e.clientY - offsetY)
  for (var i = 0; i < shapes.length; i++) {
    define(shapes[i])
    if (ctx.isPointInPath(startX, startY)) {
      selectedShape = shapes[i]
      isDown = true
    }
  }
}

function handleMouseUp(e) {
  e.preventDefault()
  isDown = false
  selectedShape = null
}

function handleMouseOut(e) {
  e.preventDefault()
  isDown = false
  selectedShape = null
}

function handleMouseMove(e) {
  if (!isDown) {
    return
  }
  e.preventDefault()
  mouseX = parseInt(e.clientX - offsetX)
  mouseY = parseInt(e.clientY - offsetY)
  var dx = mouseX - startX
  var dy = mouseY - startY
  startX = mouseX
  startY = mouseY

  selectedShape.x += dx
  selectedShape.y += dy
  // drawAll()
}

canvas.addEventListener('mousedown', (e) => {
  handleMouseDown(e)
})

canvas.addEventListener('mousemove', (e) => {
  handleMouseMove(e)
})

canvas.addEventListener('mouseup', (e) => {
  handleMouseUp(e)
})

canvas.addEventListener('mouseout', (e) => {
  handleMouseOut(e)
})
