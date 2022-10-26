import { CHROMOSOME_SIZE, POPULATION_SIZE, SELECTED_PERCENT } from "./config"
import Game from "./Game"
import MarsLander from "./MarsLander"
import SimulatorUI from "./SimulatorUI"
import { Surfaces, MarsLanderData, Chromosome, Population, Gene } from "./types"

export default class GameSimulator {
  simulationUI: SimulatorUI | null

  simulate = false
  turns = 0
  surfaces: Surfaces
  tick: NodeJS.Timer
  population: Population
  landerInitialData: MarsLanderData

  constructor(surfaces: Surfaces, ui: SimulatorUI | null = null) {
    this.surfaces = surfaces

    // ui
    if (ui) {
      this.simulationUI = ui
    }
    this.simulationUI?.drawGround(this.surfaces)

    // events listeners bind
    this.loop = this.loop.bind(this)
    this.handlePlay = this.handlePlay.bind(this)
    this.handleNext = this.handleNext.bind(this)
    this.handlePause = this.handlePause.bind(this)
    this.handleReset = this.handleReset.bind(this)
  }

  handlePlay() {
    // this.start(6500, 2800, -90, 0, 550, 0, 0, true)
    this.start(2500, 2700, 0, 0, 550, 0, 0, true)
  }
  handleNext() {
    this.start(2500, 2700, 0, 0, 550, 0, 0, false)
    // this.start(6500, 2800, -90, 0, 550, 0, 0, false)
  }
  handlePause() {
    this.stop()
  }
  handleReset() {
    this.stop()
    this.population.length = 0
    this.turns = 0
    this.simulationUI!.clear()
  }
  stop() {
    this.simulate = false
    clearInterval(this.tick)
  }

  start(X, Y, hSpeed, vSpeed, fuel, rotate, power, startLoop) {
    this.landerInitialData = { X, Y, hSpeed, vSpeed, fuel, rotate, power }

    if (startLoop === true) {
      if (this.simulationUI != null) {
        this.simulate = true
        this.tick = setInterval(this.loop, 60)
      } else {
        this.simulate = true
        while (this.simulate === true) {
          this.loop()
        }
      }
    } else {
      this.loop()
    }
  }

  loop() {
    if (this.simulationUI != null) {
      window.requestAnimationFrame(() => this.simulationUI!.clear())
    }

    if (this.turns === 0) {
      this.population = this.createPopulation(POPULATION_SIZE, CHROMOSOME_SIZE)
    }

    const { games, isSolution } = this.simulateGames(this.population)
    if (isSolution === true) {
      this.stop()
      console.log("GAGNEEEEEE !!!!!! :D")
    }
    const selectedGames = this.selection(games)

    const bestGame = selectedGames[0]
    console.log("BEST GAME :", bestGame)

    if (this.simulationUI != null) {
      window.requestAnimationFrame(() =>
        this.simulationUI!.updateInfoFrame(
          this.turns,
          selectedGames[0].score,
          selectedGames[0].result
        )
      )
    }

    const nIndividuals = this.generatePopulation(
      selectedGames,
      Math.floor(POPULATION_SIZE * (1 - SELECTED_PERCENT))
    )
    this.population = [
      ...selectedGames.map((game) => this.mutate(game.commands)),
      ...nIndividuals,
    ]

    this.turns += 1

    if (this.turns > 20000) {
      this.stop()
    }
  }
  generatePopulation(populationSelected: Game[], size: number): Population {
    const children: Population = []
    while (children.length < size) {
      const momIndex = Math.floor(Math.random() * populationSelected.length)
      const dadIndex = Math.floor(Math.random() * populationSelected.length)
      const mom = populationSelected[momIndex]
      const dad = populationSelected[dadIndex]

      // Chaque couple fait deux enfants
      const nIndividuals = this.crossOver(mom, dad)
      nIndividuals.map((i) => this.mutate(i, mom, dad))
      children.push(...nIndividuals)
    }
    return children
  }
  crossOver(mom: Game, dad: Game): Chromosome[] {
    let first = mom
    let second = dad
    if (Math.random() < 0.5) {
      first = dad
      second = mom
    }

    let nIndividual1: Chromosome = []
    let nIndividual2: Chromosome = []
    const randomWeight = Math.random()
    // 1ere méthode avec un index aléatoire
    // const minTurns = Math.min(first.timer, second.timer)
    // const randParentIndex = Math.floor(Math.random() * minTurns)
    // for (let i = 0; i < randParentIndex; i++) {
    //   nIndividual.push(first.commands[i])
    // }
    // for (let i = randParentIndex; i < this.CHROMOSOME_SIZE; i++) {
    //   nIndividual.push(second.commands[i])
    // }

    // 2eme méthode avec nouveau gene la somme pondéré de ceux de ses parents
    for (let i = 0; i < CHROMOSOME_SIZE; i++) {
      const firstParentGene = first.commands[i] as Gene
      const secondParentGene = second.commands[i] as Gene
      const nGene1 = {
        rotate: Math.round(
          randomWeight * firstParentGene.rotate +
            (1 - randomWeight) * secondParentGene.rotate
        ),
        power: Math.round(
          randomWeight * firstParentGene.power +
            (1 - randomWeight) * secondParentGene.power
        ),
      }
      const nGene2 = {
        rotate: Math.round(
          randomWeight * secondParentGene.rotate +
            (1 - randomWeight) * firstParentGene.rotate
        ),
        power: Math.round(
          randomWeight * secondParentGene.power +
            (1 - randomWeight) * firstParentGene.power
        ),
      }
      nIndividual1.push(nGene1)
      nIndividual2.push(nGene2)
    }

    return [nIndividual1, nIndividual2]
  }
  mutate(
    chromosome: Chromosome,
    mom: Game | null = null,
    dad: Game | null = null
  ) {
    let scoreMultiplier = 1

    if (mom == null) {
      scoreMultiplier = 0.2
    }

    for (let i = 0; i < CHROMOSOME_SIZE; i++) {
      const progress = i / CHROMOSOME_SIZE
      const progressChance = 0.4 + progress + 10 * progress * progress
      const mutationChance =
        0.01 * Math.random() * progressChance * scoreMultiplier

      const rand = Math.random()
      if (rand < mutationChance) {
        chromosome[i] = this.createGene()
      }
    }
    return chromosome
  }
  selection(population: Game[]): Game[] {
    const sorted = population.sort((a, b) => b.score - a.score)

    const nPopulation: Game[] = []

    // select x% of bests
    const toRetainNum = Math.floor(POPULATION_SIZE * SELECTED_PERCENT)
    const bests = sorted.slice(0, toRetainNum)
    bests.forEach((best) => nPopulation.push(best))
    return bests
  }
  createGene() {
    return {
      rotate: Math.round(Math.random() * 15) * (Math.random() < 0.5 ? -1 : 1),
      power: Math.round(Math.random() * 4),
    }
  }

  createChromosome(size: number): Chromosome {
    const chromosome: Chromosome = []
    for (let i = 0; i < size; i++) {
      chromosome.push(this.createGene())
    }
    return chromosome
  }

  createPopulation(size: number, chromSize: number) {
    const population: Population = []
    for (let i = 0; i < size; i++) {
      population.push(this.createChromosome(chromSize))
    }
    return population
  }
  simulateGames(population: Population) {
    const games: Game[] = []
    let isSolution = false
    for (let i = 0; i < population.length; i++) {
      const chromosome = population[i]
      const game = this.simulateGame(chromosome)
      games.push(game)
      if (game.result === "win") {
        console.log("JEU GAGNANT", game)

        isSolution = true
        break
      }
    }
    return { games, isSolution }
  }

  simulateGame(commands: Chromosome) {
    const lander = new MarsLander(
      {
        x: this.landerInitialData.X,
        y: this.landerInitialData.Y,
      },
      this.landerInitialData.hSpeed,
      this.landerInitialData.vSpeed,
      this.landerInitialData.fuel,
      this.landerInitialData.rotate
    )
    const game = new Game(lander, commands, this.surfaces)
    game.playGame()
    this.simulationUI!.draw(game)
    return game
  }
}
