/**
 * Fonction pour convertir un temps (mm:ss) en secondes
 * @param {string} timeString - Temps à convertir
 */
function parseTimeToSeconds(timeString) {
  const [minutes, seconds] = timeString.split(':').map(Number);
  return minutes * 60 + seconds;
}

/**
 * Ajoute un score à la liste des scores.
 * @param {Event} event - Événement de soumission du formulaire. 
 */
function addScore(event) {
  // Empêcher le formulaire de recharger la page
  event.preventDefault();

  // Création d'un objet String pour le nom d'utilisateur sans les espaces
  const username = new String(document.getElementById('username').value.trim());
  const timeInSeconds = parseTimeToSeconds(document.getElementById('victory-time').textContent);
  const difficulty = document.getElementById('difficulty-menu').value;

  const score = calculateScore(timeInSeconds, difficulty);

  // Sauvegarder le score
  saveHighScore(username, score);

  // Refresh la page pour afficher les scores
  window.location.reload();
}


/**
  * Fonction pour calculer le score en fonction du temps et de la difficulté
  * @param {number} timeInSeconds - Temps en secondes
  * @param {string} difficulty - Difficulté (ez, mid, hard)
  * @returns {number} Score calculé
*/
function calculateScore(timeInSeconds, difficulty) {
  let multiplier = 1; // Multiplicateur par défaut

  // Ajuster le multiplicateur selon la difficulté
  switch (difficulty) {
    case 'ez': // Easy
      multiplier = 0.5;
      break;
    case 'mid': // Medium
      multiplier = 1;
      break;
    case 'hard': // Difficult
      multiplier = 2;
      break;
  }

  // Calcul du score final
  return Math.round(1000 / timeInSeconds * multiplier);
}

/**
 * Fonction pour sauvegarder le score dans le localStorage
 * @param {string} username - Nom de l'utilisateur
 * @param {number} score - Score à sauvegarder
 */
function saveHighScore(username, score) {
  // Récupérer les scores existants
  let highScores = JSON.parse(localStorage.getItem('highScores')) || [];

  // Ajouter le nouveau score
  highScores.push({ username, score });

  // Trier les scores (du plus élevé au plus bas)
  highScores.sort((a, b) => b.score - a.score);

  // Limiter à 10 scores maximum (top 10)
  highScores = highScores.slice(0, 10);

  // Sauvegarder dans le localStorage
  localStorage.setItem('highScores', JSON.stringify(highScores));
}

/**
 * Fonction pour afficher les scores sauvegardés
 */
function displayHighScores() {
  const highScores = JSON.parse(localStorage.getItem('highScores')) || [];
  const highScoresTable = document.getElementById('high-scores');

  // Réinitialiser le contenu de la table
  highScoresTable.innerHTML = '<thead><tr><th>Nom</th><th>Score</th></tr></thead><tbody></tbody>';

  // Vérifier si la liste des scores est vide
  if (highScores.length === 0) {
    const messageRow = document.createElement('tr');
    messageRow.innerHTML = `<td colspan="2" style="text-align: center;">Aucun score disponible</td>`;
    highScoresTable.closest('table').querySelector('tbody').appendChild(messageRow);
  } else {
    // Ajouter chaque score en tant que ligne
    highScores.forEach(scoreEntry => {
      const row = document.createElement('tr');
      row.innerHTML = `<td>${scoreEntry.username}</td><td>${scoreEntry.score}</td>`;
      highScoresTable.closest('table').querySelector('tbody').appendChild(row);
    });
  }
}
