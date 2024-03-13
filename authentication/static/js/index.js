// Afficher à l'utilisateur s'il est connecté
$.get('/user', function(data){
    // Vérifier si des données sont reçues
    if (typeof data !== 'undefined') {
        // Mettre à jour l'élément #users avec les données reçues
        $('#users').text(data);
    }
});

// Obtenir et afficher les messages
$.get('/mess', function(data){
    // Vérifier si des données sont reçues
    if (typeof data !== 'undefined') {
        // Mettre à jour l'élément #mess avec les données reçues
        $('#mess').text(data);
    }
});

// Fonction de validation du formulaire
function validateForm() {
    // Récupérer les valeurs des champs utilisateur et mot de passe
    var id = $('#user').val();
    var passW = $('#pass').val();
    
    // Vérifier si l'un des champs est vide
    if (id.trim() === "" || passW.trim() === "") {
        // Afficher un message d'alerte demandant de remplir les deux champs
        alert("Veuillez entrer des valeurs dans les 2 cases");
        // Empêcher l'exécution ultérieure du formulaire
        return false;
    } else {
        // Si les deux champs sont remplis, autoriser la soumission du formulaire
        return true;
    }
}
