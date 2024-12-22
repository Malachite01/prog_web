let gridSize = 12;
let nbMines = 30;
let remainingFlags = nbMines;
let timer = 0;
let timerInterval = null;

// TODO: idées: niveaux de difficultés (changer gridSize), ajouter une sauvegarde de highscore(avec un formulaire surnom et valider), drapeaux mode téléphone
//  ajouter un I d'informations sur comment jouer
//#region Case class
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
//#endregion


//#region Plateau class
class Plateau {

  constructor(size, initialClick) {
    this.size = size;
    this.field= this.createEmptyBoard();
    const [initX, initY] = initialClick;
    this.generateMines(nbMines, initX, initY);
    this.computeField();
  }

  /**
  * Renvoie une matrice de cases nulles (de valeur 0) carrée de dimension gridSize
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
   * Genere un nombre de mines donné sur le terrain
   */
  generateMines(nbMines, initX, initY) {
    for (let i = 0; i < nbMines; i++) {
      this.placeMine(initX, initY);
    }
  }

  /**
   * Place une mine au hasard sur le terrain en vérifiant qu'il ne s'agit 
   * ni d'une case minée ou d'une case voisine de la première case cliquée
   */
  placeMine(initX, initY) {
    let idRow, idCol;
    do {
      idRow = Math.floor(Math.random() * gridSize);
      idCol = Math.floor(Math.random() * gridSize);
    } while (
      this.field[idRow][idCol].caseValue === -1 ||
      this.checkNeighborCase(initX, initY, idRow, idCol)
    );

    this.field[idRow][idCol].caseValue = -1;
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
   * Applique une fonction callback à tous les voisins d'une case donnée.
   * @param {Case} c - La case centrale.
   * @param {Function} callback - Fonction passée en param appliquée à chaque voisin (neighbor).
   */
  processNeighbors(c, callback) {
    for (let i = -1; i <= 1; i++) {
      for (let j = -1; j <= 1; j++) {
        // Ignorer la case actuelle
        if (i === 0 && j === 0) continue;

        // Coordonnées du voisin
        const nx = c.x + i;
        const ny = c.y + j;
        // Appliquer la fonction callback uniquement si les coordonnées sont valides
        if (this.isInsideBounds(nx, ny)) {
          callback(this.field[nx][ny]);
        }
      }
    }
  }
  
  /**
   * Utilisée dans le constructeur, parcourt toutes les cases de la matrice et calcule leur valeur (nombre de mines autour).
   */
  computeField() {
    for (let i = 0; i < gridSize; i++) {
      for (let j = 0; j < gridSize; j++) {
        const currentCase = this.field[i][j];
        
        // Ne pas calculer la valeur pour une mine
        if (!currentCase.isMine()) {
          let neighbors = 0;

          // Compter les mines dans les voisins
          this.processNeighbors(currentCase, (neighbor) => {
            if (neighbor.isMine()) {
              neighbors++;
            }
          });

          currentCase.caseValue = neighbors;
        }
      }
    }
  }


  /**
  * Révèle toutes les cases à 0 adjacentes et leurs voisins directs (non-minés).
  * @param {Case} c
  */
  revealAllZero(c) {
    // Révéler la case actuelle
    c.isRevealed = true;
  
    // Révéler les voisins directs non-minés
    this.processNeighbors(c, (neighbor) => {
      if (!neighbor.isRevealed && !neighbor.isMine()) {
        neighbor.isRevealed = true;
  
        // Si le voisin est une case à 0, poursuivre la récursion
        if (neighbor.caseValue === 0) {
          this.revealAllZero(neighbor);
        }
      }
    });
  }

  checkAllRevealed() {
    for (let i = 0; i < gridSize; i++) {
      for (let j = 0; j < gridSize; j++) {
          if (!this.field[i][j].isMine() && !this.field[i][j].isRevealed) {
            return false;
          }
        } 
      }
      return true;
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
//#endregion

//#region Grid creation and event handling functions

/**
 * Fonction pour démarrer le jeu avec un clic initial pour éviter la mine dès le début
 * @param {Variable d'événement de clic} e
 * @param {Objet Plateau} field
 * */
function startGameWithInitialClick(e) {
  const [initX, initY] = e.target
        .getAttribute('data-pos')
        .split(',')
        .map(Number);
  const field = new Plateau(gridSize, [initX, initY]);
  handleMouseClick(e, field);
}

/**
 * Fonction pour créer la grille INITIALE (vide) en HTML et faire le clic initial
 */
function createEmptyHTMLGrid() {
  const grid = document.getElementById('grid');
  // Affichage du nombre de drapeaux restants au démarrage
  document.getElementById('flag-counter').textContent = remainingFlags;
  
  // Création de la grille
  for (let i = 0; i < gridSize; i++) { // Lignes
    const row = document.createElement('tr');
    for (let j = 0; j < gridSize; j++) { // Colonnes
      const cell = document.createElement('td');
      const button = document.createElement('button');
      button.classList.add('cell-button');
      // Attribut data-pos pour récupérer la position de la case (x,y)
      //!! Attention, de 0 à 11, et (0,0) en haut à gauche
      button.setAttribute('data-pos', i + ',' + j);
      // Pas de moussedown pour le clic initial pour éviter les drapeaux clic droit
      button.onclick = (e) => {
        startGameWithInitialClick(e);
      };
      cell.appendChild(button);
      row.appendChild(cell);
    }
    grid.appendChild(row);
  }
}

/**
 * Fonction pour créer la grille en HTML
 */
function createHTMLGrid(field) {
  const grid = document.getElementById('grid');
  // Empecher menu contextuel, pour utiliser clic droit = placer/retirer drapeau
  grid.addEventListener(`contextmenu`, (e) => e.preventDefault());

  // Création de la grille
  for (let i = 0; i < field.size; i++) { // Lignes
    const row = document.createElement('tr');
    for (let j = 0; j < field.size; j++) { // Colonnes
      const cell = document.createElement('td');
      const button = document.createElement('button');
      button.classList.add('cell-button');
      button.setAttribute('data-pos', i + ',' + j);
      button.onmousedown = (e) => {
        // Gérer le clic de la souris chaque clic = regénérer la grille html
        handleMouseClick(e, field);
      };

      // Visuel (car a chaque fois on redessine la grille)
      if(field.field[i][j].isFlaged) {
        const flag = document.createElement('div');
        flag.classList.add('flag');
        button.appendChild(flag);
      }
      // Cases découvertes
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

function changeDifficulty() {
  var select = document.getElementById("difficulty-menu").value;
  switch(select) {
    case 'ez':
      gridSize = 8;
      nbMines  = 12;
      break;
    case 'mid':
      gridSize = 12;
      nbMines = 30;
      break;
    case 'hard':
      gridSize = 18;
      nbMines = 100;
      break;
    default:
      gridSize = 14;
      nbMines = 30;
      break;
  }
  const grid = document.getElementById('grid');
  grid.innerHTML = "";
  timer=0;
  clearInterval(timerInterval);
  updateTimer(timerInterval);
  createEmptyHTMLGrid();
}

/**
 * Fonction pour gérer le clic de la souris sur une case
 * @param {Variable d'évenement  de clic} e 
 */
function handleMouseClick(e, field) {

  const button = e.button;
  const pos = e.target.getAttribute('data-pos').split(','); // [x, y]
  // Convert pos[0] and pos[1] to numbers
  const x = parseInt(pos[0], 10);
  const y = parseInt(pos[1], 10);

  // Démarrer le timer si ce n'est pas deja fait appeler la fonction updateTimer toutes les secondes
  timerInterval === null ? timerInterval = setInterval(updateTimer, 1000) : null;

  if (button === 0) { // Clic gauche
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
    if (field.field[x][y].isMine()) gameOver();
    if (field.checkAllRevealed())   victory();  

  } else if (button === 2) { //click droit
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

/**
 * Fonction pour arrêter le jeu et afficher un message de fin
 */
function gameOver() {
  toggleContainer('game-over');
  clearInterval(timerInterval);
}


/**
 * Fonction pour arrêter le jeu et afficher un message de victoire
*/
function victory() {
  toggleContainer('victory');
  clearInterval(timerInterval);
  document.getElementById('victory-time').textContent = "Temps : " + document.getElementById('time-counter').textContent;
  const time = parseTimeToSeconds(document.getElementById('time-counter').textContent);
  const difficulty = document.getElementById('difficulty-menu').value;
  document.getElementById('victory-score').textContent = "Score : " + calculateScore(time, difficulty);
}

//#endregion

//#region Visuel

/**
 * Fonction pour afficher ou masquer un conteneur
 * @param {string} containerName - Nom du conteneur à afficher/masquer
 */
function toggleContainer(containerName) {
  const container = document.getElementById(containerName+'-container');

  if (container.classList.contains('fenButtonOn')) {
    // Si la fenêtre est visible, appliquer l'animation de disparition
    container.classList.remove('fenButtonOn');
    container.classList.add('fenButtonOff');

    // Attendre la fin de l'animation pour cacher le conteneur
    container.addEventListener('animationend', () => {
      container.style.display = 'none';
    }, { once: true });

  } else {
    // Rendre le conteneur visible et appliquer l'animation d'apparition
    container.style.display = 'grid';
    container.classList.remove('fenButtonOff');
    container.classList.add('fenButtonOn');
  }
}

//#endregion

//#region Sound
let isMuted = true;
// Quand la page est chargée, crée un objet Audio pour la musique
let audio = null;
function createAudio() {
  audio = new Audio('https://malachite01.github.io/prog_web/audio/music.mp3');
}

// Mute le son de la musique
function toggleMute() {
  audio.loop = true;
  audio.volume = 0.5;
  const muteImg = document.getElementById('mute-img');
  if (!isMuted) {
    audio.pause();
    muteImg.src = 'https://malachite01.github.io/prog_web/img/no-sound.png';
  } else {
    audio.play();
    muteImg.src = 'https://malachite01.github.io/prog_web/img/sound.png';
  }
  isMuted = !isMuted;
}

//#endregion