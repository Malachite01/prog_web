const gridSize = 12;
let remainingFlags = 8;
const mines = []

class Case {
  constructor(x, y, caseState = 0, isRevealed = false) {
    this.x = x;
    this.y = y;
    this.caseState = caseState;
    this.isRevealed = isRevealed;
  }

  isMine() {
    return caseState === -1;
  }
  
  neighborCalculation() {
    let nbNeighbor = 0;
    if (!this.isMine()) {
      
    }
  }
}

class Plateau {
  constructor() {
    this.size = gridSize;
    this.matrix = this.createEmptyBoard();
    this.generateMines();
  }

  // crée la matrice de cases nulles 12*12
  createEmptyBoard() {
    for (let x = 0; x < gridSize; x++) {
      let row = []
      for (let y = 0; y < gridSize; y++) {
        row.push(new Case(x,y));
      }
    }
  }

  //génère 30 mines dans un terrain en 12x12
  generateMines() {
    for (let i = 0; i < 30; i++) {
      placeMine();
    }
  }

  //place une mine au hasard sur une case sans mine 
  //!! ajout de la vérification du clic à ajouter plus tard !!
  placeMine() {
    let indRow = Math.ceil(Math.random() * 11);
    let indCol = Math.ceil(Math.random() * 11);

    while (this.matrix[indRow][indCol].caseState == -1 && !this.checkClickedCase(0, 0, indRow, indCol)) {
      indRow = Math.ceil(Math.random() * 11);
      indCol = Math.ceil(Math.random() * 11);
    }

    this.matrix[indRow][indCol] = -1;

  }

  checkClickedCase(x, y, indRow, indCol) {
    let rowValid = (indRow < x - 1) || (indRow > x + 1);
    let colValid = (indCol < y - 1) || (indCol > y + 1);
    return rowValid && colValid;
  }

}

// Empecher menu contextuel, pour utiliser clic droit = placer/retirer drapeau
window.addEventListener(`contextmenu`, (e) => e.preventDefault());

//Fonction pour créer la grille en HTML
function createInitialGrid() {
  const grid = document.getElementById('grid');
  // Affichage du nombre de drapeaux restants au démarrage
  document.getElementById('flag-counter').textContent = remainingFlags;

  // Création de la grille
  for (let i = 0; i < gridSize; i++) {
    const row = document.createElement('tr');
    for (let j = 0; j < gridSize; j++) {
      const cell = document.createElement('td');
      const button = document.createElement('button');
      button.classList.add('cell-button');
      // Attribut data-pos pour récupérer la position de la case (x,y)
      //!! Attention, de 0 à 11, et (0,0) en haut à gauche
      button.setAttribute('data-pos', j + ',' + i);
      button.onmousedown = (e) => {
        // Gérer le clic de la souris
        handleMouseClick(e);
      };
      cell.appendChild(button);
      row.appendChild(cell);
    }
    grid.appendChild(row);
  }
}

function handleMouseClick(e) {
  const button = e.button; // 0 = gauche, 1 = milieu, 2 = droite
  const pos = e.target.getAttribute('data-pos').split(','); // [x, y]

  if (button === 0) {
    // TODO: Gérer le clic gauche et les mines
    alert(pos);
  } else if (button === 2) {
    // Vérifier si la case contient déjà un drapeau
    const existingFlag = e.target.querySelector('.flag');
    if (existingFlag) {
      // Supprimer le drapeau
      existingFlag.remove();
      updateFlagsCounter("-");
    } else {
      // S'il nous reste des drapeaux à placer
      if (remainingFlags > 0) {
        // Ajouter un drapeau
        const flag = document.createElement('div');
        flag.classList.add('flag');
        e.target.appendChild(flag);
        updateFlagsCounter("+");
      }
    }
  }
}

// Fonction pour mettre à jour le compteur de drapeaux
function updateFlagsCounter(operator) {
  const flagCounter = document.getElementById('flag-counter');
  if (operator === "+") {
    remainingFlags--;
    flagCounter.textContent = remainingFlags;
  } else if (operator === "-") {
    remainingFlags++;
    flagCounter.textContent = remainingFlags;
  }
}

// Mettre a jour le timer
document.addEventListener("DOMContentLoaded", () => {
  const timeCounter = document.getElementById("time-counter");
  let secondsElapsed = 0;

  function updateTimer() {
      const minutes = String(Math.floor(secondsElapsed / 60)).padStart(2, '0');
      const seconds = String(secondsElapsed % 60).padStart(2, '0');
      timeCounter.textContent = `${minutes}:${seconds}`;
      secondsElapsed++;
  }

  // Appeler la fonction updateTimer toutes les secondes
  setInterval(updateTimer, 1000);
});
