const express = require('express')
var session = require('express-session')
const jwt = require('jsonwebtoken');

const app = express()


const port = 4242
const secretKey = 'MOTUSNICOMNOITCUOS';

app.use(session({
  secret: 'secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 3600000}
}));


//Function to be called in order to ask the auth API to give the user corresponding to the code
app.get('/uri',function (req, res) {
  if (req.query.code){
      res.setHeader("Access-Control-Allow-Origin","*")
      res.redirect(`http://localhost:4203/token?code=${req.query.code}`)
  }
})

//Function that recieve the jwt token user after sending the code and save it as session user
app.get('/newUser', function(req,res){
  const token = req.query.token;
  jwt.verify(token, secretKey, (err, decoded) => {
    if (err) {
      console.error('Error verifying token:', err);
      return res.status(401).json({ error: 'Unauthorized' });
    }
    

    // Token is valid, extract user ID
    const userId = decoded.userId;

    // You can now use the userId for further processing
    req.session.user =userId
    console.log(userId)
    res.redirect('/')
  });

})

//For every call beneth it, it will check if the user is authentified, if not it will redirect him
app.use((req, res,next) => {
  if (req.session.user) {
    const user = req.session.user;
    console.log(`Session data: ${JSON.stringify(req.session.user)}`);
    next();
  } 
  else {
    //redirect the user
    console.log('No session data found : ' + req.session.user);
        const redirectUrl = 'http://localhost:4203/authorize';
        const openidParams = {
          client_id: 'motus',
          redirect_uri: 'http://localhost:4242/uri', 
          response_type: 'code',
          scope: 'openid' // Scopes requested from authentication server
        };
        const redirectQuery = new URLSearchParams(openidParams);
        const fullRedirectUrl = `${redirectUrl}?${redirectQuery}`;
        res.setHeader("Access-Control-Allow-Origin","*")
        res.redirect(fullRedirectUrl);
  }
});

app.use(express.static('static'));

app.get('/user', function (req, res) {
  if (!(req.session.user === "undefined")){
      res.send(req.session.user)
  }
})

//Get called by motus page in order to give the user to score
app.get('/setScore', function (req,res){
    req.session.lastPlayedDate = new Date().toDateString();
    res.setHeader("Access-Control-Allow-Origin","*")
    res.redirect('http://localhost:4208/setScore?nb='+req.query.nb+'&user='+req.session.user+'&score='+req.query.sc)
})

//get called in order to ask the score for the actual user
app.get('/getScore', function (req,res){
  res.setHeader("Access-Control-Allow-Origin","*")
  res.redirect('http://localhost:4208/getScore?user='+req.session.user)

})

//Logout the user and redirect him, hopping the app.use will automaticaly redirect him to the authentification
app.get('/logout', function (req,res){
  if(req.session.user){
    req.session.user = undefined
    res.redirect('/index.html');
  }
})

//Function that check if the current user has already played the game today or not
app.get('/checkAccess', function(req, res) {
  const currentDate = new Date().toDateString();
  const lastPlayedDate = req.session.lastPlayedDate;

  if (lastPlayedDate && lastPlayedDate === currentDate) {
      // User has already played the game today, refuse access
      res.json({ message: "Accès refusé, vous avez déjà joué au jeux aujourd'hui", status: "denied" });
    } else {
        // User is allowed to play the game
        res.json({ message: "Access allowed.", status: "ok" });
    }
})

app.listen(port,() =>{
  console.log(`Serveur en cours d'éxécution sur http://localhost:${port}`);
})