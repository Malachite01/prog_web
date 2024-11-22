const gridSize = 12;
const mines = []

class Case {
  constructor(x, y, caseState = 0, isRevealed = false) {
    this.x = x;
    this.y = y;
    this.caseState = caseState;
    this.isRevealed = isRevealed;
  }

  isMine() {
    return caseState == -1;
  }
  
  neighborCalculation() {
    let nbNeighbor = 0;
    if (!this.isMine()) {
      
    }
  }
}

class Plateau {
  constructor() {
    this.size = 12;
    this.matrix = this.createEmptyBoard();
    this.generateMines();
  }

  createEmptyBoard() { // crée la matrice de cases nulles 12*12
    for (let x = 0; x < 12; x++) {
      let row = []
      for (let y = 0; y < 12; y++) {
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

//Fonction pour créer la grille
function createInitialGrid() {
  // Elementt HTML de la grille
  const grid = document.getElementById('grid');

  // Création de la grille
  for (let i = 0; i < gridSize; i++) {
    const row = document.createElement('tr');
    for (let j = 0; j < gridSize; j++) {
      const cell = document.createElement('td');
      const button = document.createElement('button');
      button.innerHTML = ' ';
      button.classList.add('cell-button');
      cell.appendChild(button);
      row.appendChild(cell);
    }
    grid.appendChild(row);
  }

}