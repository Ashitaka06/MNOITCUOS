// Affiche à l'utilisateur s'il est connecté
$.get('/user', function(data){
    if (data !== undefined) {
        $('#users').text(data);
    }
});

// Affiche les messages
$.get('/mess2', function(data){
    if (data !== undefined) {
        $('#mess').text(data);
    }
});

// Crée le nouvel utilisateur dans le JSON
function validateForm() {
    var id = $('#log').val();
    var passW = $('#pass').val();
    var passW2 = $('#pass2').val();

    // Vérifie si toutes les données d'entrée sont remplies
    if (id.trim() === "" || passW.trim() === "" || passW2.trim() === "") {
        alert("Veuillez remplir les 3 champs");
        return false; // Arrête l'exécution ultérieure
    }

    // Vérifie si le mot de passe et sa confirmation sont identiques
    if (passW === passW2) {
        console.log(passW); // Debug
        return true;
    } else {
        alert("Les 2 mots de passe saisis ne sont pas identiques");
        return false; // Arrête l'exécution ultérieure
    }
}
