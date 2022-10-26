const ENTREES = [
  "7",
  "0 100",
  "1000 500",
  "1500 1500",
  "3000 1000",
  "4000 150",
  "5500 150",
  "6999 800",
  "2500 2700 0 0 550 0 0",
]

// On crée le générateur pour lire le fichier
let reader = fileReader(ENTREES)

// Générateur pour lire une par une les lignes du fichier des entrées
function* fileReader(fichier) {
  const lignes = fichier
  for (const ligne of lignes) {
    yield ligne
  }
}

export default function readline() {
  return reader.next().value
}
