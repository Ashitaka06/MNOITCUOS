const tableBody = document.getElementById('table-body');

// Appelle les données des scores pour les afficher
$.get('http://localhost:4208/getScores', function(users) {
    // Trie les utilisateurs par score décroissant et moyenne d'essais croissante
    users.sort((a, b) => {
        if (b.score === a.score) {
            return (a.nbTry / a.score) - (b.nbTry / b.score);
        }
        return b.score - a.score;
    });

    users.forEach(user => {
        const { pseudo, score, nbTry } = user;
        const avgTries = nbTry / score;

        // Crée une nouvelle ligne de tableau
        const row = document.createElement('tr');

        // Crée une cellule pour le pseudo
        const pseudoCell = document.createElement('td');
        pseudoCell.textContent = pseudo;
        row.appendChild(pseudoCell);

        // Crée une cellule pour le score
        const scoreCell = document.createElement('td');
        scoreCell.textContent = score;
        row.appendChild(scoreCell);

        // Crée une cellule pour la moyenne
        const avgCell = document.createElement('td');
        avgCell.textContent = avgTries.toFixed(2);
        row.appendChild(avgCell);

        // Ajoute la ligne au corps du tableau
        tableBody.appendChild(row);
    });
});

// Définit la fonction de déconnexion
document.getElementById("user").addEventListener("click", function(event) {
    console.log("ici");
    // Effectue une demande de déconnexion
    $.get('/logout');
});

// Affiche l'utilisateur connecté
$.get('/user', function(data) {
    // Vérifie si des données sont reçues
    if (data !== 'undefined') {
        // Modifie le contenu de l'élément #user avec les données de l'utilisateur
        $('#user').html('<img src="avatar.png" alt="Avatar" class="user-avatar"> ' + data);
    }
});
