export type Position = {
  x: number
  y: number
}

export type Vector = [Position, Position]
export interface MarsLanderData {
  X: number
  Y: number
  hSpeed: number
  vSpeed: number
  fuel: number
  rotate: number
  power: number
}
export type Surfaces = Position[]
export type GameState = "stop" | "play" | "pause"
export type GameResult = "win" | "crash" | "onlanding" | "out"
export type Collision = {
  state: boolean
  position: Position
  surface?: Vector
}
// Partie algorythme génétique
export type Gene = {
  rotate: number
  power: number
}
export type Chromosome = Gene[]
export type Population = Chromosome[]
