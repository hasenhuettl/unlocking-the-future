const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const path = require('path');
const app = express();
const https = require("https");
const fs = require("fs");

const PORT = 3005;

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

function validateAnswer(answer) {

    const minLength = 1;
    if (answer.length < minLength ) {
        return 'Security Question must be at least 1 character long.';
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
    const { username, question, answer } = req.body;
    
    const usernameError = validateUsername(username);
    if (usernameError) {
        return res.status(400).json({ error: usernameError });
    }

    const answerError = validateAnswer(answer);
    if (answerError) {
        return res.status(400).json({ error: answerError });
    }

    if (users[username]) {
        return res.status(400).json({ error: 'User already exists' });
    }

    const hashedAnswer = await bcrypt.hash(question + answer, 10);
    users[username] = { answer: hashedAnswer };
    res.json({ message: 'User created successfully.' });
});

app.post('/login', async (req, res) => {
    const { username, question, answer } = req.body;
    const user = users[username];
    if (!user) {
        return res.status(400).json({ error: 'User could not be found' });
    }
    const validAnswer = await bcrypt.compare(question + answer, user.answer);
    if (!validAnswer) {
        return res.status(400).json({ error: 'Invalid question or answer' });
    }
    const token = jwt.sign({ username }, SECRET_KEY, { expiresIn: '1h' });
    res.cookie('auth', token);
    res.json({ message: 'Login successful' });
});

