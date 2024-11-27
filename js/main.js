const gridSize = 12;
const nbMines = 25;
let remainingFlags = nbMines;
let timer = 0;
let timerInterval = null;

// TODO: idées: niveaux de difficultés (changer gridSize), ajouter une sauvegarde de highscore(avec un formulaire surnom et valider), drapeaux mode téléphone
// TODO: constructeur de plateau doit prendre un parametre d'entree qui est la premiere case cliquée
class Case {
  constructor(x, y, caseValue = 0, isRevealed = false, isFlaged = false) {
    this.x = x;
    this.y = y;
    this.caseValue = caseValue;
    this.isRevealed = isRevealed;
    this.isFlaged = isFlaged;
  }

  /**
   * Renvoie un booléen indiquant si la case est minée ou non
   */
  isMine() {
    return this.caseValue === -1;
  }
}

class Plateau {
  constructor(size) {
    this.size = size;
    this.field= this.createEmptyBoard();
    this.generateMines(nbMines);
    this.computeField();
  }

  /**
   * Renvoie une matrice de cases nulles (de valeur 0) carrée de dimension de la constante gridSiz
   */
  createEmptyBoard() {
    let field = [] // Matrice de cases
    for (let x = 0; x < gridSize; x++) {
      let row = []
      for (let y = 0; y < gridSize; y++) {
        row.push(new Case(x,y));
      }
      field.push(row);
    }
    return field;
  }

  /**
   * Place une mine au hasard sur le terrain en vérifiant qu'il ne s'agit 
   * ni d'une case minée ou d'une case voisine de la première case cliquée
   */
  placeMine() {
    let idRow = Math.floor(Math.random() * gridSize);
    let idCol = Math.floor(Math.random() * gridSize);
  
    while (this.field[idRow][idCol].caseValue === -1 || this.checkNeighborCase(0, 0, idRow, idCol)) {
      idRow = Math.floor(Math.random() * gridSize);
      idCol = Math.floor(Math.random() * gridSize);
    }
  
    this.field[idRow][idCol].caseValue = -1;
  }

  /**
   * Genere un nombre de mines donné sur le terrain
   */
  generateMines(nbMines) {
    for (let i = 0; i < nbMines; i++) {
      this.placeMine();
    }
  }

  /**
   * Renvoie un booléen indiquant si la case 2 avoisinne la case 1 
   * @param {number} x1 ligne de la case 1 
   * @param {number} y1 colonne de la case 1 
   * @param {number} x2 ligne de la case 2 
   * @param {number} y2 colonne de la case 2 
   */  
  checkNeighborCase(x1, y1, x2, y2) {
    let rowValid = (x2 >= x1 - 1) && (x2 <= x1 + 1);
    let colValid = (y2 >= y1 - 1) && (y2 <= y1 + 1);
    return rowValid && colValid;
  }
  
  /**
   * Remplit la case c, c-à-d calcul son nombre de mine aux alentours et rentre sa valeur dans sa case valeur 
   * @param c 
   */
  neighborCalculation(c) {
    let neighbors = 0;
    if (!c.isMine()) {
      for (let i =-1; i< 2; i++) {
        for (let j = -1; j <2; j ++) {
          if (c.x+i >=0 && c.y+j >=0 && c.x+i<gridSize && c.y+j<gridSize && this.field[c.x+i][c.y+j].isMine() && (i != 0 || j != 0)) {
            neighbors ++;
          }         
        }
      }
      c.caseValue = neighbors;
    }
  }

  /**
   * utilisé dans le constructeur, pour toute les cases de la matrice, calcule sa valeur, ie, son nombre de mine autour
   */
  computeField() {
    for (let i = 0; i < gridSize; i++) {
      for (let j = 0; j < gridSize; j++) {
        this.neighborCalculation(this.field[i][j]);
      }
    }
  }

  /**
   * reveal tout les cases à 0 adjacentes à celle ci quand une case 0 est découverte
   */
  revealAllZero(c) {
    c.isRevealed = true;
    if (c.caseValue > 0 ) return null;
    // lance une recursivité sur les cases n'étant pas revealed et qui ont une value de 0
    for (let i =-1; i< 2; i++) {
      for (let j = -1; j <2; j ++) {
        if (this.isInsideBounds(c.x + i, c.y + j) && !this.field[c.x + i][c.y + j].isRevealed && this.field[c.x + i][c.y + j].caseValue === 0) {
          this.field[c.x + i][c.y + j].isRevealed = true;
          this.revealAllZero(this.field[c.x + i][c.y + j]);
        }
      }
    }
  }

  /**
   * Renvoie un booléen indiquant si la case est dans les limites du terrain
   * @param {number} x
   * @param {number} y
   * @returns {boolean}
  */
  isInsideBounds(x, y) {
    return x >= 0 && y >= 0 && x < gridSize && y < gridSize;
  }
}

// TODO: ajouter une grille vide pour obtenir le clic initial
function startGame() {
  const field = new Plateau(gridSize);
  createHTMLGrid(field);
}


//#region Grid creation and event handling 

/**
 * Fonction pour créer la grille en HTML
 */
function createHTMLGrid(field) {
  const grid = document.getElementById('grid');
  // Empecher menu contextuel, pour utiliser clic droit = placer/retirer drapeau
  grid.addEventListener(`contextmenu`, (e) => e.preventDefault());
  // Affichage du nombre de drapeaux restants au démarrage
  document.getElementById('flag-counter').textContent = remainingFlags;

  // Création de la grille
  for (let i = 0; i < field.size; i++) { // Lignes
    const row = document.createElement('tr');
    for (let j = 0; j < field.size; j++) { // Colonnes
      const cell = document.createElement('td');
      const button = document.createElement('button');
      button.classList.add('cell-button');
      // Attribut data-pos pour récupérer la position de la case (x,y)
      //!! Attention, de 0 à 11, et (0,0) en haut à gauche
      button.setAttribute('data-pos', i + ',' + j);
      button.onmousedown = (e) => {
        // Gérer le clic de la souris chaque clic = regénérer la grille html
        handleMouseClick(e, field);
      };

      // Visuel a chaque fois que l'on redessine
      if(field.field[i][j].isFlaged) {
        const flag = document.createElement('div');
        flag.classList.add('flag');
        button.appendChild(flag);
      }
      if(field.field[i][j].isRevealed) {
        // Classe CSS pour les couleurs de nombres
        const numCssClass = ["zero","one", "two", "three", "four", "five", "six"];
        switch (field.field[i][j].caseValue) {
          // Si la case est une mine
          case -1:
            const mine = document.createElement('img');
            mine.src = "img/mine.svg";
            mine.classList.add('mine');
            button.appendChild(mine);
            button.classList.add('revealed');
            break;
          default:
            button.textContent = field.field[i][j].caseValue;
            button.classList.add('revealed', numCssClass[field.field[i][j].caseValue]);
            break;
        }
      }
      cell.appendChild(button);
      row.appendChild(cell);
    }
    grid.appendChild(row);
  }
}

/**
 * Fonction pour redessiner la grille
 * @param {Matrice d'entrée à passer a la fonction createHTMLGrid} field 
 */
function reDrawGrid(field) {
  const grid = document.getElementById('grid');
  grid.innerHTML = "";
  createHTMLGrid(field);
}

/**
 * Fonction pour gérer le clic de la souris sur une case
 * @param {Variable d'évenement  de clic} e 
 */
function handleMouseClick(e, field) {
  const button = e.button; // 0 = gauche, 1 = milieu, 2 = droite
  const pos = e.target.getAttribute('data-pos').split(','); // [x, y]
  // Convert pos[0] and pos[1] to numbers
  const x = parseInt(pos[0], 10);
  const y = parseInt(pos[1], 10);

  // Démarrer le timer si ce n'est pas deja fait appeler la fonction updateTimer toutes les secondes
  timerInterval === null ? timerInterval = setInterval(updateTimer, 1000) : null;

  if (button === 0) {
    // Si déja un flag, et clic gauche alors on ne peut pas reveal
    if (field.field[x][y].isFlaged) return;
    // Mettre à jour la case
    field.field[x][y].isRevealed = true;
    // Appeler la méthode de révélation des voisins si caseValue === 0
    if (field.field[x][y].caseValue === 0) {
      field.revealAllZero(field.field[x][y]);
    }
    reDrawGrid(field);
    // Si la case cliquée est une mine, game over
    if (field.field[x][y].isMine()) {
      alert("Game Over");
      clearInterval(timerInterval);
    }
  } else if (button === 2) {
    if (field.field[x][y].isFlaged && !field.field[x][y].isRevealed) {
      // Mettre à jour la case
      field.field[x][y].isFlaged = false;
      updateFlagsCounter("-");
    } else if (!field.field[x][y].isFlaged && !field.field[x][y].isRevealed) {
      // S'il nous reste des drapeaux à placer
      if (remainingFlags > 0) {
        // Mettre à jour la case
        field.field[x][y].isFlaged = true;
        updateFlagsCounter("+");
      }
    }
    reDrawGrid(field);
  }
}

/**
 * Fonction pour mettre à jour le compteur de drapeaux
 * @param {Charactère permettant de différencier si l'on doit incrémenter ou décrémenter le compteur} operator 
 */
function updateFlagsCounter(operator) {
  const flagCounter = document.getElementById('flag-counter');
  // Ajout d'un drapeau
  if (operator === "+") {
    remainingFlags--;
    flagCounter.textContent = remainingFlags;
  } else if (operator === "-") { // Retrait d'un drapeau
    remainingFlags++;
    flagCounter.textContent = remainingFlags;
  }
}

/**
 * Fonction pour mettre à jour le timer du jeu (est appelée 
 * toutes les secondes dès la première interaction)
 */
function updateTimer() {
  const timeCounter = document.getElementById("time-counter");
  const minutes = String(Math.floor(timer / 60)).padStart(2, '0');
  const seconds = String(timer % 60).padStart(2, '0');
  timeCounter.textContent = `${minutes}:${seconds}`;
  timer++;
}
//#endregion