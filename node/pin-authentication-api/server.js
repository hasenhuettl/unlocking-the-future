const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const path = require('path');
const app = express();
const https = require("https");
const fs = require("fs");

const PORT = 3004;

const options = {
    key: fs.readFileSync('/etc/letsencrypt/live/authenticate.hasenhuettl.cc/privkey.pem'),
    cert: fs.readFileSync('/etc/letsencrypt/live/authenticate.hasenhuettl.cc/fullchain.pem')
};

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());

const users = {}; // Temporary storage for users

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

https.createServer(options, app).listen(PORT, () => {
    console.log(`Server running at https://localhost:${PORT}/`);
});

const SECRET_KEY = '1234567890987654321'; // Change to a secure key

function validatePin(pin) {
    const minLength = 4;

    if (pin.length < minLength) {
        return 'Pin must be 4 characters long.';
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

app.post('/signup', async (req, res) => {
    const { username, pin } = req.body;
    
    const usernameError = validateUsername(username);
    if (usernameError) {
        return res.status(400).json({ error: usernameError });
    }

    const pinError = validatePin(pin);
    if (pinError) {
        return res.status(400).json({ error: pinError });
    }

    if (users[username]) {
        return res.status(400).json({ error: 'User already exists' });
    }

    const hashedPin = await bcrypt.hash(pin, 10);
    users[username] = { pin: hashedPin };
    res.json({ message: 'User created successfully' });
});

app.post('/login', async (req, res) => {
    const { username, pin } = req.body;
    const user = users[username];
    if (!user) {
        return res.status(400).json({ error: 'User could not be found' });
    }
    const validPin = await bcrypt.compare(pin, user.pin);
    if (!validPin) {
        return res.status(400).json({ error: 'Invalid pin' });
    }
    const token = jwt.sign({ username }, SECRET_KEY, { expiresIn: '1h' });
    res.cookie('auth', token);
    res.json({ message: 'Login successful' });
});

