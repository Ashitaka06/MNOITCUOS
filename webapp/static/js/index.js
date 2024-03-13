// Affiche l'utilisateur dans la barre de navigation s'il existe
$.get('/user', function(data){
    // Vérifie si les données ne sont pas indéfinies
    if(data !== undefined){
        // Met à jour le contenu de l'élément avec l'identifiant 'user'
        $('#user').html('<img src="avatar.png" alt="Avatar" class="user-avatar"> ' + data);
    }
});

// Configure la déconnexion
document.getElementById("user").addEventListener("click", function(event){
    // Affiche un message dans la console indiquant que la déconnexion est en cours
    console.log("ici");
    // Effectue une requête de déconnexion
    $.get('/logout');
});

document.getElementById("startGameButton").addEventListener("click", function() {
    window.location.href = "mnoitcuos.html";
});
