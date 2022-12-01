import Matter from 'matter-js'
import oscillators from 'web-audio-oscillators'

import {
  getRandomIntFromInterval,
  xToGain,
  yToFrequency,
} from './utils/functions/helpers'

/**
 * Audio context
 */

// Setup the audio context
const BaseAudioContext = window.AudioContext || window.webkitAudioContext
const context = new BaseAudioContext()

// Ampli
const amp = context.createGain()
amp.gain.setValueAtTime(0.05, context.currentTime)

/**
 * Physics
 */

// Base
let Engine = Matter.Engine,
  Render = Matter.Render,
  Runner = Matter.Runner,
  Bodies = Matter.Bodies,
  Composite = Matter.Composite,
  Composites = Matter.Composites,
  Constraint = Matter.Constraint,
  MouseConstraint = Matter.MouseConstraint,
  Mouse = Matter.Mouse,
  Events = Matter.Events

let engine
let render
let runner
let world

function init() {
  // Engine
  engine = Engine.create()
  engine.gravity.x = 0
  engine.gravity.y = 0
  // engine.enableSleeping = true
  world = engine.world

  // Renderer
  render = Render.create({
    element: document.getElementById('app'),
    engine: engine,
    options: {
      width: 600,
      height: 600,
      pixelRatio: 2,
      background: '#EEEEEE',
      wireframes: false,
    },
  })

  Render.run(render)
  runner = Runner.create()
  Runner.run(runner, engine)
}

/**
 * Actions
 */

// Add a shape
const addButton = document.querySelector('.add')
const colors = ['#CE7777', '#E8C4C4', '#F2E5E5']

addButton.addEventListener('click', () => {
  const randomShape = getRandomIntFromInterval(1, 3)
  const randomColor = colors[Math.floor(Math.random() * colors.length)]
  const randomX = getRandomIntFromInterval(1, 600)
  const randomY = getRandomIntFromInterval(1, 600)
  const randomWidth = getRandomIntFromInterval(50, 100)
  const randomHeight = getRandomIntFromInterval(50, 100)
  const audioGain = xToGain(randomX)
  const audioFrequency = yToFrequency(randomY)
  const audioType = 'sine'

  createShape(
    randomX,
    randomY,
    randomWidth,
    randomHeight,
    randomColor,
    audioGain,
    audioFrequency,
    audioType
  )

  // TODO: Handle the different shapes
  // ...
})

const clearButton = document.querySelector('.clear')
clearButton.addEventListener('click', () => {
  removeShapes()
})

let lastClear = '(not given)'

/* Clear the world */
function clearWorld(exampleName) {
  if (lastClear != exampleName) {
    lastClear = exampleName
    Matter.Composite.clear(engine.world, false)
  }
}

/* Remove the shapes */
function removeShapes() {
  items.map((child) => {
    child.oscillator.stop()
    Composite.remove(engine.world, child.shape)
  })
}

/* Handle world gravity */
const hlButton = document.querySelector('.high-low')
let hlIsToggled = true

hlButton.addEventListener('click', (e) => {
  e.target.classList.toggle('toggled')
  handleGravity()
})

function handleGravity() {
  if (hlIsToggled) {
    engine.gravity.y = 1
  } else {
    engine.gravity.y = -1
  }
  hlIsToggled = !hlIsToggled
}

/**
 * Shapes and audio
 */

let items = []

/* Create a shape */
function createShape(
  randomX,
  randomY,
  randomWidth,
  randomHeight,
  randomColor,
  audioGain,
  audioFrequency,
  audioType
) {
  if (items.length >= 6) {
    // Remove the shape from the world, then shift the shapes array
    Composite.remove(engine.world, items[0].shape)
    items[0].oscillator.stop(context.currentTime + 0.5)
    items.shift()
  }

  // Create a dedicated shape
  const shape = Bodies.rectangle(randomX, randomY, randomWidth, randomHeight, {
    render: {
      fillStyle: randomColor,
      strokeStyle: randomColor,
    },
  })

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

  const item = {
    shape,
    amp,
    oscillator,
  }
  items.push(item)

  // Add the bodies to the world
  Composite.add(engine.world, item.shape)
}

/**
 * Misc
 */

/* Prepare the experience */
function setupWorld() {
  clearWorld('Boxes')

  let ground = Bodies.rectangle(300, 650, 600, 100, { isStatic: true })
  let leftWall = Bodies.rectangle(-50, 300, 100, 600, { isStatic: true })
  let rightwall = Bodies.rectangle(650, 300, 100, 600, { isStatic: true })
  let ceiling = Bodies.rectangle(300, -50, 600, 100, { isStatic: true })

  // Add edges
  Composite.add(engine.world, [ground, leftWall, rightwall, ceiling])

  /* Mouse control */
  // Create the constraint
  let mouse = Mouse.create(render.canvas),
    mouseConstraint = MouseConstraint.create(engine, {
      mouse: mouse,
      constraint: {
        render: {
          visible: false,
        },
      },
    })

  const canvas = document.querySelector('canvas')

  // Prevent item dragging from doing crazy stuff when hitting edges
  canvas.addEventListener('mouseleave', (event) => {
    mouseConstraint.mouse.mouseup(event)
  })

  Composite.add(world, mouseConstraint)

  // Update the mouse in the render
  render.mouse = mouse

  Engine.update(engine)
}

/**
 * Game loop
 */

function gameLoop() {
  // Maybe ptimize this ?
  items.map((child) => {
    let newAudioGain
    let newAudioFrequency

    if (child.shape.speed > 0.05) {
      // Set new audio values
      newAudioGain = xToGain(child.shape.position.x)
      newAudioFrequency = yToFrequency(child.shape.position.y)

      // Update gain and frequency based on x and y
      child.amp.gain.linearRampToValueAtTime(
        newAudioGain,
        context.currentTime + 0.1
      )
      child.oscillator.frequency.value = newAudioFrequency
    }
  })

  requestAnimationFrame(gameLoop)
}

gameLoop()

// Wait for document to load everything
window.onload = function () {
  init()
  setupWorld()
}
