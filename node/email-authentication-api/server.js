const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const app = express();
const https = require("https");
const fs = require("fs");
const twilio = require('twilio');
const validator = require('email-validator');
const nodemailer = require('nodemailer');

// Load environment variables from .env file
require('dotenv').config();

const PORT = 3017;

const options = {
    key: fs.readFileSync('/etc/letsencrypt/live/authenticate.hasenhuettl.cc/privkey.pem'),
    cert: fs.readFileSync('/etc/letsencrypt/live/authenticate.hasenhuettl.cc/fullchain.pem')
};

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(express.json());

const DATABASE_FILE = 'myDatabase.json';
var usernames = {}; // Temporary storage for usernames

https.createServer(options, app).listen(PORT, () => {
    console.log(`Server running at https://localhost:${PORT}/`);
});

// save data to file
const saveUserData = () => {
    try {
        fs.writeFileSync(DATABASE_FILE, JSON.stringify(usernames, null, 2));
    } catch (err) {
        console.error('Error saving user data:', err);
    }
};

// load data from file
const loadUserData = () => {
    try {
        const data = fs.readFileSync(DATABASE_FILE, 'utf-8');
        usernames = JSON.parse(data);
    } catch (err) {
        console.error('Could not read :', DATABASE_FILE, err);
    }
};

function validateEMail(email) {
    const isValid = validator.validate(email);
    if (!isValid) {
        return email + ' is not a valid E-Mail format.';
    }

    return null;
}

function validateUsername(username) {
    const minLength = 1;
    if (username.length < minLength) {
        return 'Username must be at least 1 character long.';
    }

    return null;
}

loadUserData();

app.post('/signup', async (req, res) => {
    const { username, email } = req.body;
    
    const usernameError = validateUsername(username);
    if (usernameError) {
        return res.status(400).json({ error: usernameError });
    }

    const eMailError = validateEMail(email);
    if (eMailError) {
        return res.status(400).json({ error: eMailError });
    }

    usernames[username] = { email: email};

    saveUserData();

    res.json({ message: 'User created successfully' });
});

app.post('/email', async (req, res) => {
    const { username } = req.body;
    let error;

    // Edit credentials in .env
    const transporter = nodemailer.createTransport({
        service: process.env.MAILPROVIDER,
        host: process.env.MAILHOST,
        port: process.env.MAILPORT,
        secure: true,
        auth: {
            user: process.env.MAILUSER,
            pass: process.env.MAILPASS
        }
    });

    // Generate new code
    var min = 10000;
    var max = 99999;
    var newCode = Math.floor(Math.random() * (max - min + 1)) + min;

    const user = usernames[username];
    if (!user) {
        return res.status(400).json({ error: 'User could not be found' });
    }

    const from    = 'authenticate.hasenhuettl.cc@gmail.com';
    const to      = user.email;
    const subject = 'Login code'
    const text    = 'Your login code for authenticate.hasenhuettl.cc is: ' + newCode;

    let mailOptions = {
        from: from,
        to: to,
        subject: subject,
        text: text
    };

    transporter.sendMail(mailOptions, function(err, info){
        if (err) {
            error = ("Error sending E-Mail: ", err);
            return res.status(400).json({ error: error });
        } else {
            usernames[username] = { email: to, code: newCode };
            return res.json({ message: 'E-Mail send' });
        }
    });

});

app.post('/login', async (req, res) => {
    const { username, code } = req.body;
    const user = usernames[username];
    if (!user) {
        return res.status(400).json({ error: 'User could not be found' });
    }

    if (code != user.code) {
        return res.status(400).json({ error: 'Invalid code' });
    }

    res.json({ message: 'Login successful' });
});

