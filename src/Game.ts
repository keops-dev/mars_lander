import { AREA_HEIGHT, AREA_WIDTH } from "./config"
import MarsLander from "./MarsLander"
import SimulatorUI from "./SimulatorUI"
import {
  Chromosome,
  Collision,
  GameResult,
  Gene,
  Position,
  Vector,
} from "./types"

export default class Game {
  simulationUI = new SimulatorUI()

  playing = false
  result: GameResult
  score: number = 0
  distanceToLandingArea = 0
  timer = 0

  commands: Chromosome
  surfaces: Position[]
  lander: MarsLander
  ground: Position[]
  landingArea: Vector

  constructor(lander: MarsLander, commands: Chromosome, surfaces: Position[]) {
    this.surfaces = surfaces
    this.commands = commands
    this.ground = [{ x: 0, y: 0 }, ...surfaces, { x: AREA_WIDTH, y: 0 }]
    this.lander = lander
    this.landingArea = this.findLandingArea()
  }

  distanceTo(P1: Position, P2: Position) {
    return Math.sqrt(
      (P2.x - P1.x) * (P2.x - P1.x) + (P2.y - P1.y) * (P2.y - P1.y)
    )
  }

  /**
   * - Plus on est proche d'atterrissage, mieux c'est
   * - Si on se trouve au niveau de la zone d'atterrissage mais qu'on se crash,
   *  c'est du à une vitesse élevée ou à un mauvais angle du lander
   * - Moins on a consommer d'essenve, mieux c'est
   */
  calculateScore(crashed: boolean) {
    // la distance max possible est la longueur des diagonales de l'air de jeu
    const maxDist = Math.sqrt(
      AREA_WIDTH * AREA_WIDTH + AREA_HEIGHT * AREA_HEIGHT
    )

    const landingAreaCenter = {
      x: this.landingArea[0].x / 2 + this.landingArea[1].x / 2,
      y: this.landingArea[0].y,
    }
    this.distanceToLandingArea = this.distanceTo(
      this.lander.pos,
      landingAreaCenter
    )

    if (crashed) {
      this.score = 100 - (100 * this.distanceToLandingArea) / maxDist
    } else if (this.lander.vSpeed < -40 || Math.abs(this.lander.hSpeed) > 20) {
      let hSpeedMalus = 0
      let vSpeedMalus = 0
      let rotateMalus = 0

      if (20 < Math.abs(this.lander.hSpeed)) {
        hSpeedMalus = Math.abs(this.lander.hSpeed)
        const extraSpeed = Math.max(Math.abs(this.lander.hSpeed), 0)
        const deltaRatio = 1.0 - extraSpeed / 100
        hSpeedMalus = 100 - 100 * deltaRatio
      }
      if (this.lander.vSpeed < -40) {
        const extraSpeed = Math.max(Math.abs(this.lander.vSpeed), 0)
        const deltaRatio = 1 - extraSpeed / 140
        vSpeedMalus = 100 - 100 * deltaRatio
      }
      if (this.lander.rotate != 0) {
        const extraRotation = Math.max(Math.abs(this.lander.rotate), 0)
        const deltaRatio = 1 - extraRotation / 90
        rotateMalus = 100 - 100 * deltaRatio
      }
      const malus = vSpeedMalus * 0.5 + hSpeedMalus * 0.5
      // console.log("malus", malus, vSpeedMalus, hSpeedMalus, rotateMalus)

      this.score = 200 - malus
    } else {
      this.score = 200
    }
  }

  stopGame(result: GameResult = "crash") {
    this.playing = false
    this.result = result
    this.calculateScore(result === "crash")
  }
  playGame() {
    this.playing = true
    while (this.playing === true) {
      this.doTurn()
    }
  }

  intersectSegment(A: Position, B: Position, I: Position, P: Position) {
    const D: Position = { x: 0, y: 0 }
    const E: Position = { x: 0, y: 0 }
    D.x = B.x - A.x
    D.y = B.y - A.y
    E.x = P.x - I.x
    E.y = P.y - I.y
    const denom = D.x * E.y - D.y * E.x
    if (denom === 0) {
      return
    }
    const t = -(A.x * E.y - I.x * E.y - E.x * A.y + E.x * I.y) / denom
    if (t < 0 || t >= 1) {
      return
    }
    const u = -(-D.x * A.y + D.x * I.y + D.y * A.x - D.y * I.x) / denom
    if (u < 0 || u >= 1) {
      return
    }

    const x = I.x + u * E.x
    const y = A.y + t * D.y

    return { position: { x, y }, surface: [A, B] }
  }

  collision(
    tab: Position[],
    prevPos: Position,
    currentPos: Position
  ): Collision {
    const pointsNum: number = tab.length
    const intersections: any = []
    for (let i = 0; i < pointsNum; i++) {
      const A = tab[i]
      let B
      if (i == pointsNum - 1) B = tab[0]
      else B = tab[i + 1]
      const iseg = this.intersectSegment(A, B, prevPos, currentPos)
      if (iseg) intersections.push(iseg)
    }
    if (intersections.length % 2 == 1) {
      return { state: true, ...intersections[0] }
    } else return { state: false, position: { x: 0, y: 0 } }
  }

  findLandingArea(): Vector {
    for (let i = 0; i < this.surfaces.length; i++) {
      const point = this.surfaces[i]
      const nextPoint = this.surfaces[i + 1]
      if (point.y === nextPoint.y) {
        return [point, nextPoint]
      }
    }
    return [
      { x: 0, y: 0 },
      { x: 0, y: 0 },
    ]
  }

  private doTurn() {
    const command = this.commands[this.timer]

    // add a second
    this.timer += 1
    const prevPos = Object.assign({}, this.lander.pos)
    this.updateLander(command)

    // si le lander est en dehors des limites on s'arrête là
    if (this.outOfBounds(this.lander.pos)) {
      this.stopGame()
      console.log("Bah... il est passé où le lander ?")
    }

    const collision = this.collision(this.ground, prevPos, this.lander.pos)
    if (collision.state == true) {
      this.lander.pos = collision.position
      this.lander.positions[this.lander.positions.length - 1] =
        collision.position

      if (
        JSON.stringify(this.landingArea) == JSON.stringify(collision.surface)
      ) {
        if (this.lander.landedWell()) {
          this.stopGame("win")
        } else {
          this.stopGame("onlanding")
        }
      } else {
        this.stopGame("crash")
      }
    }
  }

  outOfBounds(target: Position): boolean {
    if (target.x < 0 || target.x > AREA_WIDTH) return true
    if (target.y < 0 || target.y > AREA_HEIGHT) return true
    return false
  }

  updateLander(command: Gene) {
    this.lander.update(command.rotate, command.power)
  }
}
