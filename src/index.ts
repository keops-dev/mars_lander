import GameSimulator from "./GameSimulator"
import readline from "./readline"
import SimulatorUI from "./SimulatorUI"
import { Position } from "./types"

// ! partie ui, à ne pas copier sur codingame
// buttons
const playBtn = document.getElementById("play") as HTMLButtonElement
const nextBtn = document.getElementById("next") as HTMLButtonElement
const pauseBtn = document.getElementById("pause") as HTMLButtonElement
const resetBtn = document.getElementById("reset") as HTMLButtonElement

/**
 * Auto-generated code below aims at helping you parse
 * the standard input according to the problem statement.
 **/

const surfaces: Position[] = []

const surfaceN = parseInt(readline()) // the number of points used to draw the surface of Mars.
for (let i = 0; i < surfaceN; i++) {
  var inputs = readline().split(" ")
  const landX = parseInt(inputs[0]) // X coordinate of a surface point. (0 to 6999)
  const landY = parseInt(inputs[1]) // Y coordinate of a surface point. By linking all the points together in a sequential fashion, you form the surface of Mars.
  surfaces.push({ x: landX, y: landY })
}

const ui = new SimulatorUI()
const simulator = new GameSimulator(surfaces, ui)

// events
playBtn.addEventListener("click", simulator.handlePlay)
nextBtn.addEventListener("click", simulator.handleNext)
pauseBtn.addEventListener("click", simulator.handlePause)
resetBtn.addEventListener("click", simulator.handleReset)

let loop = true
// game loop
while (loop) {
  var inputs = readline().split(" ")
  const X = parseInt(inputs[0])
  const Y = parseInt(inputs[1])
  const hSpeed = parseInt(inputs[2]) // the horizontal speed (in m/s), can be negative.
  const vSpeed = parseInt(inputs[3]) // the vertical speed (in m/s), can be negative.
  const fuel = parseInt(inputs[4]) // the quantity of remaining fuel in liters.
  const rotate = parseInt(inputs[5]) // the rotation angle in degrees (-90 to 90).
  const power = parseInt(inputs[6]) // the thrust power (0 to 4).

  // Write an action using console.log()
  // To debug: console.error('Debug messages...');

  // simulator.start(X, Y, hSpeed, vSpeed, fuel, rotate, power)

  // rotate power. rotate is the desired rotation angle. power is the desired thrust power.
  console.log("-20 3")
  loop = false
}
