const express = require('express');
const fs = require('fs');
const seedrandom = require('seedrandom');

const app = express();
const port = 4200;

// Lire le contenu du fichier
const fileContent = fs.readFileSync('wordlist.txt', 'utf-8');

// Diviser le contenu en un tableau de mots en utilisant les sauts de ligne comme séparateurs
const wordsArray = fileContent.split('\n');

// Nettoyer le tableau en enlevant les retours chariots et les apostrophes supplémentaires
const cleanedArray = wordsArray.map(word => word.replace(/['\r]/g, ''));

// Fonction pour obtenir un indice aléatoire chaque jour
const getRandomIndex = () => {
  const currentDate = new Date().toISOString().split('T')[0]; // Obtenir la date actuelle au format AAAA-MM-JJ
  const seed = currentDate; // Utiliser la date comme graine
  const rng = seedrandom(seed);
  return Math.floor(rng() * wordsArray.length);
};

// Sélectionner un mot aléatoire dans la liste
const wordD = String(wordsArray[getRandomIndex()]);

// Endpoint pour récupérer le mot choisi pour le jour
app.get('/word', (req, res) => {
  // Retourner le mot aléatoire
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.json({ wordD });
});

// Endpoint pour récupérer la longueur du mot choisi
app.get('/wordNb', (req, res) => {
  // Retourner la taille du mot
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.send(String(wordD.length));
});

// Endpoint pour vérifier si le mot donné est correct ou non
app.get('/check', (req, res) => {
  // Ajouter la logique pour vérifier l'entrée utilisateur ici
  let draw = [];
  const userWord = String(req.query.word);
  console.log(userWord + " " + wordD);
  console.log(userWord.toLowerCase() == wordD.toLowerCase());
  // Comparer les deux mots, cela ne fonctionne pas
  let response = (userWord.toLowerCase() == wordD.toLowerCase());
  // Si les mots ne sont pas égaux, retourner un tableau avec les informations de chaque caractère
  if (!response) {
    for (let i = 0; i < userWord.length; i++) {
      if (userWord[i] === wordD[i]) {
        draw[i] = 2; // Bon caractère au bon endroit
      }
      else if (wordD.includes(userWord[i])) {
        draw[i] = 1; // Bon caractère au mauvais endroit
      }
      else {
        draw[i] = 0; // Mauvais caractère
      }
    }
  }
  console.log(draw);
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.send(draw);
});

app.listen(port, () => {
  console.log(`Serveur en cours d'exécution sur http://localhost:${port}`);
});