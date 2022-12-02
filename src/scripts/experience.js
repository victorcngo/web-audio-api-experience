import Matter from 'matter-js'
import oscillators from 'web-audio-oscillators'
// import gsap from 'gsap'

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
  world = engine.world

  // Renderer
  render = Render.create({
    element: document.getElementById('app'),
    engine: engine,
    options: {
      width: 600,
      height: 600,
      pixelRatio: 2,
      background: '#E8F9FD',
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
const buttons = [...document.querySelectorAll('.button')]
const options = [...document.querySelectorAll('.option')]
const colors = ['#E97777', '#BCE29E', '#8FE3CF']

buttons.map((child) => {
  child.addEventListener('click', (e) => {
    let pattern

    if (e.target.classList.contains('button--rectangle')) {
      pattern = 'rectangle'
    } else if (e.target.classList.contains('button--triangle')) {
      pattern = 'triangle'
    } else {
      pattern = 'circle'
    }

    console.log(e.target.parentElement)

    const randomColor = colors[Math.floor(Math.random() * colors.length)]
    const randomX = getRandomIntFromInterval(1, 600)
    const randomY = getRandomIntFromInterval(1, 600)
    const randomRadius = getRandomIntFromInterval(25, 50)
    const randomWidth = getRandomIntFromInterval(50, 100)
    const randomHeight = getRandomIntFromInterval(50, 100)
    const randomRotation = getRandomIntFromInterval(0, 2 * Math.PI)

    createShape(
      pattern,
      randomX,
      randomY,
      randomRadius,
      randomWidth,
      randomHeight,
      randomColor,
      randomRotation
    )
  })
})

let xGravityActive = false
let yGravityActive = false
let isMuted = false

options.map((child) => {
  child.addEventListener('click', (e) => {
    // TODO: Refactor with a switch() here
    if (!e.target.classList.contains('option--clear')) {
      e.target.classList.toggle('toggled')
    }

    if (e.target.classList.contains('option--gravity-x')) {
      if (xGravityActive) {
        engine.gravity.x = 0
      } else {
        engine.gravity.x = 1
      }
      xGravityActive = !xGravityActive
    } else if (e.target.classList.contains('option--gravity-y')) {
      if (yGravityActive) {
        engine.gravity.y = 0
      } else {
        engine.gravity.y = 1
      }
      yGravityActive = !yGravityActive
    } else if (e.target.classList.contains('option--mute')) {
      if (isMuted) {
        items.map((child) => {
          child.amp.gain.linearRampToValueAtTime(
            xToGain(child.shape.position.x),
            context.currentTime + 0.1
          )
        })
      } else {
        items.map((child) => {
          child.amp.gain.linearRampToValueAtTime(0, context.currentTime + 0.1)
        })
      }
      isMuted = !isMuted
    } else {
      removeShapes()
    }
  })
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

/**
 * Shapes and audio
 */

let items = []

/* Create a shape */
function createShape(
  pattern,
  randomX,
  randomY,
  randomRadius,
  randomWidth,
  randomHeight,
  randomColor,
  randomRotation
) {
  if (items.length >= 10) {
    // Remove the shape from the world, then shift the shapes array
    Composite.remove(engine.world, items[0].shape)
    items[0].oscillator.stop(context.currentTime + 0.5)
    items.shift()
  }

  let shape
  let audioType

  // Create a dedicated shape
  if (pattern === 'rectangle') {
    shape = Bodies.rectangle(randomX, randomY, randomWidth, randomHeight, {
      chamfer: 4,
      render: {
        fillStyle: randomColor,
        strokeStyle: randomColor,
      },
    })
    audioType = 'buzz'
  }

  if (pattern === 'circle') {
    shape = Bodies.circle(randomX, randomY, randomRadius, {
      render: {
        fillStyle: randomColor,
        strokeStyle: randomColor,
      },
    })
    audioType = 'bass'
  }

  if (pattern === 'triangle') {
    shape = Bodies.polygon(randomX, randomY, 3, randomRadius, {
      chamfer: 4,
      render: {
        fillStyle: randomColor,
        strokeStyle: randomColor,
      },
    })
    audioType = 'sine'
  }

  // let obj = {
  //   x: 0.001,
  //   y: 0.001,
  // }

  // Matter.Body.scale(shape, obj.x, obj.y)
  Matter.Body.rotate(shape, randomRotation)

  // Create a dedicated gain
  const amp = context.createGain()
  amp.gain.linearRampToValueAtTime(xToGain(randomX), context.currentTime)

  // Create a dedicated oscillator
  const oscillator = oscillators[audioType](context)
  oscillator.frequency.linearRampToValueAtTime(
    yToFrequency(randomY),
    context.currentTime
  )
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
  let ground = Bodies.rectangle(300, 650, 600, 100, {
    isStatic: true,
    render: {
      visible: false,
    },
  })
  let leftWall = Bodies.rectangle(-50, 300, 100, 600, {
    isStatic: true,
    render: {
      visible: false,
    },
  })
  let rightwall = Bodies.rectangle(650, 300, 100, 600, {
    isStatic: true,
    render: {
      visible: false,
    },
  })
  let ceiling = Bodies.rectangle(300, -50, 600, 100, {
    isStatic: true,
    render: {
      visible: false,
    },
  })

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
  // TODO: Ask if we can maybe optimize this ?
  items.map((child) => {
    let newAudioGain
    let newAudioFrequency

    if (child.shape.speed > 0.05 && !isMuted) {
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
