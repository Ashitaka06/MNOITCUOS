// Récupérer l'élément bouton "Répondre"
var enterB = document.getElementById("answer");
// Initialiser les variables
var value = 0;
var nbTry = 5;
var win = false;

// Valider la réponse lorsque la touche "Entrée" est pressée dans le champ de réponse
enterB.addEventListener("keypress", function(event) {
  if (event.key === "Enter") {
    // Annuler l'action par défaut de la touche "Entrée"
    event.preventDefault();
    // Cliquer sur le bouton de vérification
    document.getElementById("Check").click();
  }
});

// Afficher l'utilisateur dans la barre de navigation s'il existe
$.get('/user', function(data) {
  if (!(data === 'undefined')) {
    $('#user').html('<img src="avatar.png" alt="Avatar" class="user-avatar"> ' + data);
  }
});

// Définir la déconnexion
document.getElementById("user").addEventListener("click", function(event) {
  console.log("ici");
  $.get('/logout');
});

// Lorsque la page est ouverte, appeler l'API 'wordNb' qui retourne le nombre de lettres dans le mot à deviner
$(document).ready(function() {
  $.get('/checkAccess', function(response) {
    if (response.status === "ok") {
      // Accès autorisé, continuer le chargement de la page
      $.get('http://localhost:4200/wordNb', function(data) {
        var rNb = $('#nbTry');
        value = parseInt(data) - 1;
        rNb.text("Le mot à trouver comporte " + value + " lettres.");
      });
    } else {
      // Accès refusé, afficher un message et rediriger vers index.html
      alert("Vous avez déjà joué aujourd'hui. Veuillez revenir demain !");
      $('#message').text(response.message);
      $('#redirectMessage').show(); // Afficher le conteneur du message
      setTimeout(function() {
        window.location.href = "/index.html";
      }, 2000); // Rediriger après 2 secondes
    }
  });
});

// Lorsque le bouton "Vérifier" est cliqué
document.getElementById("Check").addEventListener("click", function(event) {
  event.preventDefault();
  const answerValue = $('#answer').val();

  // Vérifier si la réponse est vide
  if (answerValue.trim() === "") {
    alert("Veuillez entrer un mot");
    return; // Arrêter l'exécution supplémentaire
  } 
  // Vérifier si la longueur est correcte
  else if (answerValue.length != value) {
    alert("Votre mot doit faire exactement " + value + " caractères.");
    return; // Arrêter l'exécution supplémentaire
  } 
  // Vérifier si le jeu peut être joué
  else if (nbTry <= 0 || win) {
    alert("Le jeu est terminé pour aujourd'hui");
    return; // Arrêter l'exécution supplémentaire
  }

  // Appeler l'API 'check' pour savoir si le mot a été trouvé ou non
  $.get('http://localhost:4200/check?word=' + $('#answer').val(), function(data) {
    var resultsContainer = $('#results-container');
    var resultDiv = $('<div>');
    resultDiv.addClass("resultDiv");

    // Ajouter la nouvelle div au conteneur de résultats
    $('#results-container').append(resultDiv);
    var result = true;
    nbTry--;

    for (var i = 0; i < data.length; i++) {
      // Créer une nouvelle div pour chaque caractère
      var charDiv = $('<div class ="box">').text(answerValue[i]);
      
      // Vérifier si une des lettres n'est pas correcte pour savoir si c'est la bonne réponse
      if (data[i] != 2) {
        result = false;
      }
      charDiv.addClass(getColorForCharacter(data[i]));

      // Ajouter la nouvelle div au conteneur de résultats
      resultDiv.append(charDiv);
    }

    var resultA = $('#result');
    if (result) {
      resultA.text("Bonne réponse !");
      win = true;
      // Sauvegarder le score dans l'API Score
      $.get('http://localhost:4242/setScore?nb=' + (5 - nbTry) + '&sc=1');
    } else {
      if (nbTry == 0) {
        // Sauvegarder le score dans l'API Score mais avec 0 car le jeu a échoué
        $.get('http://localhost:4242/setScore?nb=' + (5 - nbTry) + '&sc=0');
        resultA.text("Vous avez épuisé toutes vos chances, vous avez perdu pour aujourd'hui.");
      } else {
        resultA.text("Mauvaise réponse, veuillez réessayer. Il vous reste " + nbTry + " chances");
      }
    }
  });
});

// Fonction qui retourne la classe à ajouter en fonction de la couleur souhaitée
function getColorForCharacter(char) {
  switch (char) {
    case 0:
      return 'color-0'; 
    case 1:
      return 'color-1';
    case 2:
      return 'color-2';
    default:
      return 'color-0'; // couleur par défaut pour les autres caractères
  }
}
