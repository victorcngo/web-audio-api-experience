import Matter from 'matter-js'

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
  // create an engine
  engine = Engine.create()
  engine.gravity.x = 0
  engine.gravity.y = 0
  world = engine.world

  // create a renderer
  render = Render.create({
    element: document.getElementById('app'),
    engine: engine,
    options: {
      width: 600,
      height: 600,
      pixelRatio: 2,
      background: '#fafafa',
      wireframes: false,
    },
  })

  // run the renderer
  Render.run(render)

  // create runner
  runner = Runner.create()

  // run the engine
  Runner.run(runner, engine)
}

let lastClear = '(not given)'

function clearWorld(exampleName) {
  if (lastClear != exampleName) {
    lastClear = exampleName

    Matter.Composite.clear(engine.world, false)
  }
}

let lowIsToggled = true

const lowButton = document.querySelector('.low')
lowButton.addEventListener('click', (e) => {
  e.target.classList.toggle('toggled')
  handleGravity()
})

function handleGravity() {
  if (lowIsToggled) {
    engine.gravity.y = 1
  } else {
    engine.gravity.y = 0
  }
  lowIsToggled = !lowIsToggled
}

function StartBoxes() {
  clearWorld('Boxes')
  // create two boxes and a ground
  let boxA = Bodies.rectangle(400, 200, 80, 80, {
    render: {
      fillStyle: 'blue',
      strokeStyle: 'blue',
      lineWidth: 5,
    },
  })
  let boxB = Bodies.rectangle(450, 50, 80, 80, {
    render: {
      fillStyle: 'red',
      strokeStyle: 'blue',
      lineWidth: 5,
    },
  })
  let ground = Bodies.rectangle(300, 600, 600, 1, { isStatic: true })
  let leftWall = Bodies.rectangle(0, 300, 1, 600, { isStatic: true })
  let rightwall = Bodies.rectangle(600, 300, 1, 600, { isStatic: true })
  let ceiling = Bodies.rectangle(300, 0, 600, 1, { isStatic: true })

  // add all of the bodies to the world
  Composite.add(engine.world, [
    boxA,
    boxB,
    ground,
    leftWall,
    rightwall,
    ceiling,
  ])

  // add mouse control
  var mouse = Mouse.create(render.canvas),
    mouseConstraint = MouseConstraint.create(engine, {
      mouse: mouse,
      constraint: {
        stiffness: 0.2,
        render: {
          visible: false,
        },
      },
    })

  Composite.add(world, mouseConstraint)

  // keep the mouse in sync with rendering
  render.mouse = mouse

  Engine.update(engine)
}

window.onload = function () {
  init()

  StartBoxes()
}
