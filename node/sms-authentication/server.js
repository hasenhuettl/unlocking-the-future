const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const app = express();
const https = require("https");
const fs = require("fs");

const PORT = 3006;

const options = {
    key: fs.readFileSync('/etc/letsencrypt/live/authenticate.hasenhuettl.cc/privkey.pem'),
    cert: fs.readFileSync('/etc/letsencrypt/live/authenticate.hasenhuettl.cc/fullchain.pem')
};

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());

const numbers = {}; // Temporary storage for numbers

https.createServer(options, app).listen(PORT, () => {
    console.log(`Server running at https://localhost:${PORT}/`);
});

function validateCode(code) {
    const myLength = 6;

    if (code.length != myLength ) {
        return 'Code must be 6 characters long.';
    }
    return null;
}

function validateUsername(number) {
    const minLength = 8;
    if (number.length < minLength) {
        return 'Username must be at least 8 characters long.';
    }
    return null;
}

app.post('/signup', async (req, res) => {
    const { number, code } = req.body;
    
    const numberError = validateUsername(number);
    if (numberError) {
        return res.status(400).json({ error: numberError });
    }

    const codeError = validateCode(code);
    if (codeError) {
        return res.status(400).json({ error: codeError });
    }

    if (numbers[number]) {
        return res.status(400).json({ error: 'User already exists' });
    }

    const hashedCode = await bcrypt.hash(code, 10);
    numbers[number] = { code: hashedCode };
    res.json({ message: 'User created successfully' });
});

app.post('/login', async (req, res) => {
    const { number, code } = req.body;
    const user = numbers[number];
    if (!user) {
        return res.status(400).json({ error: 'User could not be found' });
    }
    const validCode = await bcrypt.compare(code, user.code);
    if (!validCode) {
        return res.status(400).json({ error: 'Invalid code' });
    }
    res.cookie('auth', token);
    res.json({ message: 'Login successful' });
});

