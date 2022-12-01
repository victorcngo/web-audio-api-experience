import { shape1Points } from './utils/shapes/shape1.js'
import { shape2Points } from './utils/shapes/shape2.js'
import { shape3Points } from './utils/shapes/shape3.js'
import { shape4Points } from './utils/shapes/shape4.js'
import { shape5Points } from './utils/shapes/shape5.js'

import oscillators from 'web-audio-oscillators'
import { shape5Points } from './utils/shapes/shape5.js'
console.log(oscillators)

/**
 * Canvas
 */

// Base setup
let canvas = document.querySelector('.app-canvas')

canvas.width = 600
canvas.height = 600

const cw = canvas.width
const ch = canvas.height
const cw2 = canvas.width / 2
const ch2 = canvas.height / 2

canvas.style.maxWidth = cw + 'px'
canvas.style.maxHeight = ch + 'px'

let canvasOffset = getElementOffset(canvas)
let offsetX = getElementOffset(canvas).left
let offsetY = getElementOffset(canvas).top
let scrollX = getElementOffset(canvas).scrollLeft
let scrollY = getElementOffset(canvas).scrollTop

let ctx = canvas.getContext('2d')
ctx.fillStyle = '#2b3a55'
ctx.fillRect(0, 0, cw, ch)

/**
 * Helpers
 */

// Handles if the canvas is empty
function isCanvasBlank(canvas) {
  return !canvas
    .getContext('2d')
    .getImageData(0, 0, canvas.width, canvas.height)
    .data.some((channel) => channel !== 0)
}

// Returns a random number between a min and a max value
function getRandomIntFromInterval(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min)
}

// Returns an element offset in pixels
function getElementOffset(el) {
  const rect = el.getBoundingClientRect()

  return {
    top: rect.top + window.pageYOffset,
    left: rect.left + window.pageXOffset,
  }
}

/**
 * Audio context
 */

// Converts a position (x) between 0 and the max canvas width to a gain between 0 and 0.1
function xToGain(x) {
  return x / 6000
}

// Converts a position (y) between 0 and the max canvas height to a frequency between 32 and 523hz
function yToFrequency(y) {
  return 491 - (y / 600) * 491 + 32
}

// Setup the audio context
const BaseAudioContext = window.AudioContext || window.webkitAudioContext
const context = new BaseAudioContext()

// const oscillator = context.createOscillator()
// oscillator.frequency.value = 300
// oscillator.type = 'sine'

// Ampli
const amp = context.createGain()
amp.gain.setValueAtTime(0.05, context.currentTime)

/**
 * Shapes and sounds
 */

/* Setup */
// Get DOM buttons
const clearButton = document.querySelector('.clear')
const addButton = document.querySelector('.add')

/* Add a shape */
// Array of colors
const colors = ['#CE7777', '#E8C4C4', '#F2E5E5', '#E1DCB3']

addButton.addEventListener('click', () => {
  const randomShape = getRandomIntFromInterval(1, 1)
  const randomColor = Math.floor(Math.random() * colors.length)
  const randomX = getRandomIntFromInterval(60, cw - 60)
  const randomY = getRandomIntFromInterval(90, ch - 90)
  const audioGain = xToGain(randomX)
  const audioFrequency = yToFrequency(randomY)

  // Buzz
  // Aah
  // Ooh
  // Eeh

  // Shape n°1
  if (randomShape === 1) {
    addShape(
      randomX,
      randomY,
      shape1Points,
      colors[randomColor],
      colors[randomColor],
      audioGain,
      audioFrequency,
      'bass4'
    )
  }

  // Shape n°2
  if (randomShape === 2) {
    addShape(
      randomX,
      randomY,
      shape2Points,
      colors[randomColor],
      colors[randomColor],
      audioGain,
      audioFrequency,
      'organ'
    )
  }

  // Shape n°3
  if (randomShape === 3) {
    addShape(
      randomX,
      randomY,
      shape3Points,
      colors[randomColor],
      colors[randomColor],
      audioGain,
      audioFrequency,
      'organ'
    )
  }

  // Shape n°4
  if (randomShape === 4) {
    addShape(
      randomX,
      randomY,
      shape4Points,
      colors[randomColor],
      colors[randomColor],
      audioGain,
      audioFrequency,
      'organ'
    )
  }

  // Shape n°5
  if (randomShape === 5) {
    addShape(
      randomX,
      randomY,
      shape5Points,
      colors[randomColor],
      colors[randomColor],
      audioGain,
      audioFrequency,
      'organ'
    )
  }

  drawAll()
})

clearButton.addEventListener('click', () => {
  ctx.clearRect(0, 0, cw, ch)

  // Empty the array of shapes
  shapes = []

  // Stop every oscillator, then empty the array too
  shapeOscillators.map((child) => {
    child.stop()
  })
  shapeOscillators = []
})

/* Utils */
// Stores the shapes and handle the selected one
let shapes = []
let selectedShape = null

// Store the shapeOscillators
let shapeOscillators = []

function addShape(
  x,
  y,
  points,
  fill,
  stroke,
  audioGain,
  audioFrequency,
  audioType
) {
  // Create a dedicated gain
  const amp = context.createGain()
  amp.gain.linearRampToValueAtTime(audioGain, context.currentTime)

  // Create a dedicated oscillator
  const oscillator = oscillators[audioType](context)
  oscillator.frequency.linearRampToValueAtTime(
    audioFrequency,
    context.currentTime
  )
  // oscillator.type = audioType
  oscillator.connect(amp).connect(context.destination)
  oscillator.start(context.currentTime)
  shapeOscillators.push(oscillator)

  // Push the shape inside an array
  shapes.push({
    x: x,
    y: y,
    points: points,
    fill: fill,
    stroke: stroke,
    amp: amp,
    oscillator: oscillator,
  })
}

function draw(shape) {
  // Check all the points and draw each line starting from the first one
  let x = shape.x
  let y = shape.y
  let points = shape.points
  ctx.save()
  ctx.beginPath()
  ctx.moveTo(x + points[0].x, y + points[0].y)
  for (let i = 1; i < points.length; i++) {
    ctx.lineTo(x + points[i].x, y + points[i].y)
  }
  ctx.closePath()
}

function fill(shape) {
  // Fill and stroke
  draw(shape)
  ctx.fillStyle = shape.fill
  // ctx.fill()
  ctx.strokeStyle = shape.stroke
  ctx.lineWidth = 3
  ctx.stroke()
  ctx.restore()
}

function drawAll() {
  ctx.clearRect(0, 0, cw, ch)

  // Clear stuff
  if (shapes.length > 10) {
    // Shift the shapes array
    shapes.shift()

    // Stop the unused oscillator, then shift the array too
    shapeOscillators[0].stop(context.currentTime + 0.5)
    shapeOscillators.shift()
  }

  // Draw all the shapes
  for (let i = 0; i < shapes.length; i++) {
    fill(shapes[i])
  }
}

/**
 * Drag & drop
 */

let isDown = false
let startX
let startY

function handleMouseDown(e) {
  e.preventDefault()
  startX = parseInt(e.clientX - offsetX)
  startY = parseInt(e.clientY - offsetY)
  for (let i = 0; i < shapes.length; i++) {
    draw(shapes[i])
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
  let deltaX = mouseX - startX
  let deltaY = mouseY - startY
  startX = mouseX
  startY = mouseY

  selectedShape.x += deltaX
  selectedShape.y += deltaY
  drawAll()

  let newAudioGain = xToGain(mouseX)

  selectedShape.amp.gain.linearRampToValueAtTime(
    newAudioGain,
    context.currentTime + 0.1
  )

  let newAudioFrequency = yToFrequency(mouseY)

  selectedShape.oscillator.frequency.linearRampToValueAtTime(
    newAudioFrequency,
    context.currentTime + 0.1
  )
}

canvas.addEventListener('mousedown', (e) => {
  handleMouseDown(e)
  console.log('pressed')
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
