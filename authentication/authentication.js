const session = require('express-session');
const express = require('express');
const escapeHtml = require('escape-html');
const fs = require('fs');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

const app = express();

// Configuration de la session
app.use(session({
  secret: 'secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 3600000
  }
}));

app.use(express.static('static')); // Serveur de fichiers statiques

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Port d'écoute du serveur
const port = 4203;
app.listen(port, () => {
  console.log(`Serveur en cours d'exécution sur http://localhost:${port}`);
});

// Route principale
app.get('/', (req, res) => {
  const user = req.session.user;
});

// Variables globales
let uri = '';
let mess = '';
let mess2 = '';
const codeStore = [];
const secretKey = 'MOTUSNICOMNOITCUOS';

// Vérifie si l'appel API est autorisé avec les paramètres corrects
app.get('/authorize', (req, res) => {
  const { client_id, scope, redirect_uri } = req.query;
  // Vérifie l'identifiant client
  if (client_id !== 'motus') {
    return res.status(400).send('Identifiant client non valide');
  }
  // Vérifie la portée (scope)
  if (scope !== 'openid') {
    return res.status(400).send('Portée (scope) non valide');
  }
  // Vérifie l'URI de redirection
  if (redirect_uri !== 'http://localhost:4242/uri') {
    return res.status(400).send('URI de redirection non valide');
  }
  uri = redirect_uri;
  if (req.session.user) {
    req.session.user = null;
    res.redirect('/');
  }
  res.redirect('/');
});

// Affiche l'utilisateur
app.get('/user', (req, res) => {
  if (req.session.user !== undefined) {
    res.send(escapeHtml(req.session.user));
  }
});

// Affiche les informations de session
app.get('/session', (req, res) => {
  res.json(req.session);
});

// Crée un nouvel utilisateur si inexistant
app.get('/create', (req, res) => {
  mess2 = '';
  checkIdToFile(req.query.user, req.query.pass, (err, result) => {
    if (err) {
      console.error('Erreur lors de la vérification de l\'identifiant :', err);
      return res.redirect('/error.html'); // Redirige vers la page d'erreur
    }
    if (result) {
      req.session.user = req.query.user;
      const code = Math.random().toString(36).substr(2, 12).toUpperCase();
      const user = req.session.user;
      codeStore.push({ user, code });
      res.setHeader('Access-Control-Allow-Origin', '*');
      return res.redirect(`${uri}?code=${code}`);
    } else {
      mess2 = 'L\'identifiant est déjà pris';
      return res.redirect('/register.html');
    }
  });
});

// Gère la connexion de l'utilisateur
app.get('/login', express.urlencoded({ extended: false }), (req, res) => {
  mess = '';
  req.session.regenerate((err) => {
    if (err) console.error(err);
    if (req.session.user) {
      req.session.user = null;
    }
    const { user, pass } = req.query;
    checkIdFromFile(user, pass, (err, exists) => {
      if (err) console.log("erreur");
      else {
        if (exists) {
          req.session.user = req.query.user;
          const code = Math.random().toString(36).substr(2, 12).toUpperCase();
          const user = req.session.user;
          codeStore.push({ user, code });
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.redirect(`${uri}?code=${code}`);
        } else {
          mess = 'Identifiant ou mot de passe incorrect';
          res.redirect('/');
        }
      }
    });
  });
});

// Déconnexion de l'utilisateur
app.get('/logout', (req, res) => {
  req.session.user = null;
  res.redirect('/');
});

// Vérifie le code reçu et renvoie l'utilisateur associé
app.get('/token', (req, res) => {
  const code = req.query.code;
  const entry = codeStore.find(entry => entry.code === code);
  if (!entry) {
    return res.status(400).send('Le code n\'existe pas');
  } else {
    const userId = entry.user;
    jwt.sign({ userId }, secretKey, { expiresIn: '1h' }, (err, token) => {
      if (err) {
        console.error('Erreur lors de la génération du jeton :', err);
        return res.status(500).json({ error: 'Erreur interne du serveur' });
      }
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.redirect(`http://localhost:4242/newUser?token=${token}`);
    });
  }
});

// Affiche le message d'erreur dans le formulaire de connexion
app.get('/mess', (req, res) => {
  if (mess !== '') {
    res.send(escapeHtml(mess));
  } else {
    res.send('');
  }
});

// Affiche le message d'erreur dans le formulaire d'inscription
app.get('/mess2', (req, res) => {
  if (mess2 !== '') {
    res.send(escapeHtml(mess2));
  } else {
    res.send('');
  }
});

// Ajoute le nouvel utilisateur dans le fichier JSON
function checkIdToFile(id, pass, callback) {
  fs.readFile('user-data.json', 'utf8', (err, data) => {
    let jsonData = {};
    if (err) {
      if (err.code === 'ENOENT') {
        jsonData = { users: [] };
        const newUser = { id: id, pass: pass };
        jsonData.users.push(newUser);
        const updatedData = JSON.stringify(jsonData, null, 2);
        fs.writeFile('user-data.json', updatedData, 'utf8', (err) => {
          if (err) {
            console.error('Erreur lors de l\'écriture du fichier JSON :', err);
            callback(err, null);
          }
          console.log(`Ajout de l'identifiant ${id} avec le mot de passe ${pass} dans user-data.json`);
          callback(null, true);
        });
      } else {
        console.error('Erreur lors de la lecture de user-data.json :', err);
        callback(err, null);
      }
    } else {
      try {
        jsonData = JSON.parse(data);
        if (!jsonData.users.some(user => user.id === id)) {
          pass = hashPassword(pass);
          const newUser = { id: id, pass: pass };
          jsonData.users.push(newUser);
          const updatedData = JSON.stringify(jsonData, null, 2);
          fs.writeFile('user-data.json', updatedData, 'utf8', (err) => {
            if (err) {
              console.error('Erreur lors de l\'écriture du fichier JSON :', err);
              callback(err, null);
            }
            console.log(`Ajout de l'identifiant ${id} avec le mot de passe ${pass} dans user-data.json`);
            callback(null, true);
          });
        } else {
          callback(err, null);
        }
      } catch (parseError) {
        console.error('Erreur lors du parsing JSON :', parseError);
        callback(parseError, null);
      }
    }
  });
}

// Vérifie si l'utilisateur est dans le fichier
function checkIdFromFile(id, pass, callback) {
  fs.readFile('user-data.json', 'utf8', (err, data) => {
    if (err) {
      console.error('Erreur lors de la lecture du fichier :', err);
      callback(err, null);
      return;
    }
    try {
      const idData = JSON.parse(data);
      const user = idData.users.find(user => user.id === id);
      if (!user) {
        callback(null, false); // Utilisateur non trouvé
        return;
      }
      const passwordMatch = verifyPassword(pass, user.pass);
      callback(null, passwordMatch);
    } catch (parseError) {
      console.error('Erreur lors du parsing JSON :', parseError);
      callback(parseError, false);
    }
  });
}

// Fonction de hachage d'un mot de passe en utilisant SHA-256
function hashPassword(password) {
  const hash = crypto.createHash('sha256');
  hash.update(password);
  return hash.digest('hex');
}

// Vérifie si le mot de passe fourni correspond au hachage stocké
function verifyPassword(inputPassword, storedHash) {
  const inputHash = hashPassword(inputPassword);
  return inputHash === storedHash;
}