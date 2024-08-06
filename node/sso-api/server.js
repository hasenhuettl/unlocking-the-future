const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const app = express();
const session = require('express-session');
const https = require("https");
const fs = require("fs");
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

require('dotenv').config();

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;

let redirect;
let action;
let authMethod;
let startTime;

const PORT = 3013;

const options = {
    key: fs.readFileSync('/etc/letsencrypt/live/sso.hasenhuettl.cc/privkey.pem'),
    cert: fs.readFileSync('/etc/letsencrypt/live/sso.hasenhuettl.cc/fullchain.pem')
};

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.json());
app.use(express.static(__dirname + '/public/'));
app.set('view engine', 'ejs');

app.use(session({
  resave: false,
  saveUninitialized: true,
  secret: 'silly egg' 
}));

app.get('/success', (req, res) => res.send(debugProfile));

app.get('/', function(req, res) {
    res.render('pages/auth');
});

const DATABASE_FILE = 'myDatabase.json';

var users = {}; // Temporary storage for users

// Function to load user data from the JSON file
const loadUserData = () => {
    try {
        const data = fs.readFileSync(DATABASE_FILE, 'utf-8');
        users = JSON.parse(data);
    } catch (err) {
        console.error('Error reading user data:', err);
    }
};

// Function to save user data to the JSON file
const saveUserData = () => {
    try {
        fs.writeFileSync(DATABASE_FILE, JSON.stringify(users, null, 2));
    } catch (err) {
        console.error('Error saving user data:', err);
    }
};

// Load user data when the application starts
loadUserData();

app.get('/signup', (req, res) => {

    if (!userProfile) {
        return res.redirect('/400.html?message=User is not logged in.');
    }

    if (users[userProfile]) {
        return res.redirect('/400.html?message=User already exists.');
    }

    users[userProfile] = {};
    saveUserData();

    const readyTime = new Date().getTime();
    const timeMs = readyTime - startTime;
    const params = new URLSearchParams({ authMethod, action, timeMs }).toString();
    return res.redirect('https://authenticate.hasenhuettl.cc/success/index.html?' + params);
});

app.get('/login', (req, res) => {

    if (!users[userProfile]) {
        return res.redirect('/400.html?message=User not found.');
    }

    const readyTime = new Date().getTime();
    const timeMs = readyTime - startTime;
    const params = new URLSearchParams({ authMethod, action, timeMs }).toString();
    return res.redirect('https://authenticate.hasenhuettl.cc/success/index.html?' + params);
});
/*  PASSPORT SETUP  */

const passport = require('passport');
var userProfile;
var debugProfile;

app.use(passport.initialize());
app.use(passport.session());

app.set('view engine', 'ejs');

app.get('/error', (req, res) => res.send("error logging in"));

passport.serializeUser(function(user, cb) {
  cb(null, user);
});

passport.deserializeUser(function(obj, cb) {
  cb(null, obj);
});

/*  Google AUTH  */
 
passport.use(new GoogleStrategy({
    clientID: CLIENT_ID,
    clientSecret: CLIENT_SECRET,
    callbackURL: REDIRECT_URI
  },
  function(accessToken, refreshToken, profile, done) {
      debugProfile=profile;
      userProfile=profile.id;
      return done(null, profile);
  }
));

app.get('/auth/google', (req, res, next) => {
  redirect = req.query.redirect;
  action = req.query.action;
  authMethod = req.query.authMethod;
  startTime = req.query.startTime;
  if (redirect) {
    req.session.redirectTo = redirect;
    passport.authenticate('google', { scope: ['profile', 'email'] })(req, res, next);
  } else {
    return res.status(400).json({ error: "No redirect parameter provided!" });
  }
});

app.get('/auth/google/callback', 
  passport.authenticate('google', { failureRedirect: '/error' }),
  function(req, res) {
    // Successful authentication, redirect to the specified route
    const redirectTo = redirect || '/error';
    redirect = null; // Clear the redirect after using it
    res.redirect(redirectTo);
  }
);

// Logout route
app.get('/logout', (req, res, next) => {
  req.logout(function(err) {
    if (err) { return next(err); }
    userProfile = null;  // Clear userProfile
    req.session.destroy(function(err) {
      if (err) {
        return next(err);
      }
      const lang = req.query.language;
      if (lang) {
        res.redirect(`/?language=${lang}`);
      } else {
        res.redirect('/');
      }
    });
  });
});

https.createServer(options, app).listen(PORT, () => {
    console.log(`Server running at https://localhost:${PORT}/`);
});

