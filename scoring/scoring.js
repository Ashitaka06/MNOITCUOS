const express = require('express');
const fs = require('fs');

const app = express();
const port = 4208;

// Middleware pour gérer les requêtes CORS
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS'); // Ajoutez d'autres méthodes si nécessaire
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

// Route pour définir le score de l'utilisateur dans le fichier JSON
/**
 * Entrée : nbTr, nombre de tentatives
 *          user : nom de l'utilisateur
 *          score : 0 si échoué, 1 sinon
 */
app.get('/setScore', (req, res) => {
    let nbTr = parseInt(req.query.nb);
    let user = req.query.user;
    let score = parseInt(req.query.score);
    
    // Enregistre les paramètres dans le fichier JSON
    saveScoreToFile(nbTr, user, score);
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.send('ok');
});

// Route pour obtenir le score de l'utilisateur connecté
/**
 * Entrée : user
 * Sortie : score de l'utilisateur, nbTry/score et l'utilisateur
 */
app.get('/getScore', (req, res) => { 
    let user = req.query.user;
    
    // Recherche de l'utilisateur dans le fichier JSON
    readScoreFromFile(user, (err, scoreData) => {
        if (err) {
            return;
        }
        var { score, nbTry } = scoreData;
        res.setHeader("Access-Control-Allow-Origin", "*");
        if(score == 0){
            res.send(score + ";" + 0 + ";" + user);
        }
        res.send(score + ";" + (nbTry/score) + ";" + user);
    });
});

// Route pour obtenir le tableau des scores triés
app.get('/getScores', (req, res) => {
    fs.readFile('score-data.json', 'utf8', (err, data) => {
        if (err) {
            console.error('Erreur lors de la lecture du fichier JSON :', err);
            res.status(500).send('Erreur lors de la lecture du fichier JSON');
            return;
        }

        try {
            const scoreData = JSON.parse(data);
            const { users } = scoreData;

            // Trier les utilisateurs par score décroissant
            users.sort((a, b) => b.score - a.score);

            res.setHeader("Access-Control-Allow-Origin", "*");
            res.json(users);
        } catch (parseError) {
            console.error("Erreur lors de l'analyse du JSON :", parseError);
            res.status(500).send('Erreur lors de l\'analyse du JSON');
        }
    });
});

// Fonction pour sauvegarder le score dans le fichier JSON
function saveScoreToFile(nbTry, userA, score) {
    fs.readFile('score-data.json', 'utf8', (err, data) => {
        if (err) {
            console.error('Erreur lors de la lecture du fichier JSON :', err);
            return;
        }
    
        let jsonData;
        try {
            // Analyse des données JSON
            jsonData = JSON.parse(data);
        } catch (error) {
            console.error("Erreur lors de l'analyse des données JSON :", error);
            return;
        }
        
        // Création des paramètres pour le JSON
        const newUser = { pseudo: userA, score: score, nbTry: nbTry };
        // Adapter au format JSON
        const { users } = jsonData;
        // Recherche si l'utilisateur existe déjà dans le fichier, pour le créer ou l'ajouter à l'existant
        const existingUserIndex = users.findIndex(user => user.pseudo === newUser.pseudo);
        if (existingUserIndex !== -1) {
            // Mettre à jour l'utilisateur existant
            users[existingUserIndex].score = parseInt(users[existingUserIndex].score) + score;
            users[existingUserIndex].nbTry = parseInt(users[existingUserIndex].nbTry) + nbTry;
        } else {
            // Ajouter un nouvel utilisateur
            jsonData.users.push(newUser);
        }
    
        // Convertir l'objet JavaScript en JSON
        const updatedData = JSON.stringify(jsonData, null, 2);
    
        // Écrire le JSON mis à jour dans le fichier
        fs.writeFile('score-data.json', updatedData, 'utf8', (err) => {
            if (err) {
                console.error("Erreur lors de l'écriture du fichier JSON :", err);
                return;
            }
            console.log('Données utilisateur mises à jour avec succès.');
        });
    });
}

// Fonction pour lire le score à partir du fichier JSON
function readScoreFromFile(userA, callback) {
    fs.readFile('score-data.json', 'utf8', (err, data) => {
        if (err) {
            console.error('Erreur lors de la lecture du score à partir du fichier :', err);
            callback(err, null);
            return;
        }

        try {
            // Enregistrer le JSON dans un autre format
            const scoreData = JSON.parse(data);
            // Extraire les utilisateurs
            const { users } = scoreData;
            // Recherche de l'utilisateur dans le fichier
            const existingUserIndex = users.findIndex(user => user.pseudo === userA);
            let score = 0;
            let nbTry = 5;
            if (existingUserIndex !== -1) {
                // Mettre à jour l'utilisateur existant
                score = parseInt(users[existingUserIndex].score);
                nbTry = parseInt(users[existingUserIndex].nbTry);
            } else {
                // Ajouter le score dans l'utilisateur indéfini
                score = parseInt(users[0].score);
                nbTry = parseInt(users[0].nbTry);
            }
            callback(null, { score, nbTry });
        } catch (parseError) {
            console.error("Erreur lors de l'analyse du JSON :", parseError);
            callback(parseError, null);
        }
    });
}

// Démarrer le serveur
app.listen(port, () => {
 console.log(`Serveur en cours d'exécution sur http://localhost:${port}`);
});
