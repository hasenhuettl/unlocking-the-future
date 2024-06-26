const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const path = require('path');
const app = express();
const https = require("https");
const fs = require("fs");

const PORT = 3014;

const options = {
    key: fs.readFileSync('/etc/letsencrypt/live/authenticate.hasenhuettl.cc/privkey.pem'),
    cert: fs.readFileSync('/etc/letsencrypt/live/authenticate.hasenhuettl.cc/fullchain.pem')
};

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(express.json());

const DATABASE_FILE = 'myDatabase.json';

var users = {}; // Temporary storage for users

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

https.createServer(options, app).listen(PORT, () => {
    console.log(`Server running at https://localhost:${PORT}/`);
});

const SECRET_KEY = 'silly egg'; // Change to a secure key

function calculateMeanDifference(signupTimes, loginTimes) {
    if (signupTimes.length !== loginTimes.length) {
        return -1;
    }
    let totalDifference = 0;
    for (let i = 0; i < signupTimes.length; i++) {
        const difference = Math.abs(loginTimes[i] - signupTimes[i]) / signupTimes[i];
        totalDifference += difference;
    }
    return (totalDifference / signupTimes.length) * 100;
}

function validateTimes(password, keyPressTimes) {
    if (password.length !== keyPressTimes.length + 1) {
        return 'Key press times do not match password length';
    }
    return null;
}

function validatePassword(password) {
    const minLength = 6;

    if (password.length < minLength) {
        return 'Password must be at least 6 characters long.';
    }
    return null;
}

function validateUsername(username) {
    const minLength = 8;
    if (username.length < minLength) {
        return 'Username must be at least 8 characters long.';
    }
    return null;
}

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

app.post('/signup', async (req, res) => {
    const { username, password, keyPressTimes } = req.body;
    
    const usernameError = validateUsername(username);
    if (usernameError) {
        return res.status(400).json({ error: usernameError });
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
        return res.status(400).json({ error: passwordError });
    }

    const timesError = validateTimes(password, keyPressTimes);
    if (timesError) {
        return res.status(400).json({ error: timesError });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    users[username] = { password: hashedPassword, keyPressTimes };
    saveUserData();

    res.json({ message: 'User created successfully' });
});

app.post('/login', async (req, res) => {
    const { username, password, keyPressTimes } = req.body;
    const user = users[username];
    if (!user) {
        return res.status(400).json({ error: 'User could not be found' });
    }
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
        return res.status(400).json({ error: 'Invalid password' });
    }

    const meanDifference = calculateMeanDifference(user.keyPressTimes, keyPressTimes);

    if (meanDifference == -1) {
        return res.status(400).json({ error: 'Key press times do not match saved data' });
    }

    if (meanDifference >= 100) {
        return res.status(400).json({ error: 'Time between keystrokes did not match recorded data' });
    }

    const token = jwt.sign({ username }, SECRET_KEY, { expiresIn: '1h' });
    res.cookie('auth', token);
    res.json({ message: 'Login successful' });
});

