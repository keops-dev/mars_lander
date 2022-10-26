import { AREA_HEIGHT, AREA_WIDTH } from "./config"
import Game from "./Game"
import MarsLander from "./MarsLander"
import { GameResult, GameState, Position } from "./types"

const gameDataTimer = document.getElementById("timer_value")
const gameDataBestScore = document.getElementById("best_score_value")
const gameDataBestState = document.getElementById("best_state_value")

export default class SimulatorUI {
  height: number = AREA_HEIGHT
  width: number = AREA_WIDTH
  // elems
  marsBg: HTMLCanvasElement
  animation: HTMLCanvasElement
  // contexts
  marsBgContext: CanvasRenderingContext2D
  animationContext: CanvasRenderingContext2D
  // data
  scaleFactor: number

  constructor() {
    this.marsBg = document.getElementById("mars_bg") as HTMLCanvasElement
    this.animation = document.getElementById("animation") as HTMLCanvasElement
    this.marsBgContext = this.marsBg.getContext(
      "2d"
    ) as CanvasRenderingContext2D
    this.animationContext = this.animation.getContext(
      "2d"
    ) as CanvasRenderingContext2D
    this.scaleFactor = this.marsBg.clientWidth / this.width

    this.drawLander = this.drawLander.bind(this)
  }
  clear() {
    // this.marsBgContext.clearRect(0, 0, AREA_WIDTH, AREA_HEIGHT)
    this.animationContext.clearRect(0, 0, AREA_WIDTH, AREA_HEIGHT)
  }

  draw(game: Game) {
    window.requestAnimationFrame(() => this.drawLander(game))
  }

  drawGround(surfaces: Position[]) {
    this.marsBgContext.save()
    this.marsBgContext.translate(0, AREA_HEIGHT)
    this.marsBgContext.scale(1, -1)
    this.marsBgContext.beginPath()
    this.marsBgContext.moveTo(0, 0)
    this.marsBgContext.lineTo(0, surfaces[0].y)
    for (const surface of surfaces) {
      this.marsBgContext.lineTo(surface.x, surface.y)
    }
    this.marsBgContext.lineTo(AREA_WIDTH, 0)
    this.marsBgContext.fillStyle = "rgb(146, 53, 53)"
    this.marsBgContext.fill()
    this.marsBgContext.restore()
  }

  drawLander(game: Game) {
    if (game == null) {
      console.error("Aucun jeu à dessiner")
      return
    }

    const lander = game.lander
    const result = game.result

    this.animationContext?.save()
    this.animationContext?.translate(0, AREA_HEIGHT)
    this.animationContext?.scale(1, -1)

    this.animationContext.beginPath()
    this.animationContext.moveTo(lander.positions[0].x, lander.positions[0].y)
    for (let i = 0; i < lander.positions.length; i++) {
      const pos = lander.positions[i]

      // si c'est le dernier point on le fait plus gros avec un couleur
      if (i === lander.positions.length - 1) {
        this.animationContext!.fillStyle = "rgb(255, 255, 255)"
        if (result === "win") {
          this.animationContext!.fillStyle = "rgb(0, 255, 0)"
        }
        if (result === "crash") {
          this.animationContext!.fillStyle = "rgb(255,0,0)"
        }
        if (result === "onlanding") {
          this.animationContext!.fillStyle = "rgb(0,191,255)"
        }
        this.animationContext?.fillRect(
          Math.round(pos.x) - 20,
          Math.round(pos.y) - 20,
          40,
          40
        )
      }

      this.animationContext!.fillStyle = "rgb(255, 0, 0)"
      if (result === "win") {
        this.animationContext!.fillStyle = "rgb(255, 255, 255)"
      }
      this.animationContext.lineTo(Math.round(pos.x), Math.round(pos.y))
      // this.animationContext?.fillRect(
      //   Math.round(pos.x) - 5,
      //   Math.round(pos.y) - 5,
      //   10,
      //   10
      // )
    }
    this.animationContext.lineWidth = 5
    this.animationContext.stroke()

    // const angleRadian = (Math.PI / 180) * rotation
    // this.animationContext.save()
    // this.animationContext.rotate(angleRadian)
    // this.animationContext.drawImage(lander, marsLander.x - HALF_LANDER_HEIGHT, marsLander.y)
    // this.animationContext.restore()

    // const marsLander = document.getElementById("mars_lander")
    // const x = Math.ceil(pos.x * this.scaleFactor)
    // const y = Math.ceil(pos.y * this.scaleFactor)

    // marsLander!.style.transform = `translate(${x}px, ${-y}px) rotate(${-rotation}deg)`
    this.animationContext?.restore()
  }

  updateInfoFrame(timer: number, bestScore: number, bestState: GameResult) {
    gameDataTimer!.textContent = timer.toString()
    gameDataBestScore!.textContent = bestScore.toString()
    gameDataBestState!.textContent = bestState
  }
}
