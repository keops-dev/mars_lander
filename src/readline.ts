import FICHIER_ENTREES from "bundle-text:./entrees.txt"

// On crée le générateur pour lire le fichier
let reader = fileReader(FICHIER_ENTREES)

// Générateur pour lire une par une les lignes du fichier des entrées
function* fileReader(fichier) {
  const lignes = fichier.split("\n")
  for (ligne of lignes) {
    yield ligne
  }
}

export default function readline() {
  return reader.next().value
}
