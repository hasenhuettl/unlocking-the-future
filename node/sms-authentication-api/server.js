const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const app = express();
const https = require("https");
const fs = require("fs");
const PNF = require('google-libphonenumber').PhoneNumberFormat;
const phoneUtil = require('google-libphonenumber').PhoneNumberUtil.getInstance();

const PORT = 3006;

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

function validateNumber(number) {
    const myLength = 6;

    if (number.length < myLength ) {
        return 'Phone number must be at least 6 characters long.';
    }

    try {
        const numberParsed = phoneUtil.parse(number, null);
        number = phoneUtil.format(numberParsed, PNF.E164);
    } catch (e) {
        return 'Phone number must be in the E164 format (+43 000 0000000).';
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

loadUserData();

app.post('/signup', async (req, res) => {
    const { username, number } = req.body;
    
    const usernameError = validateUsername(username);
    if (usernameError) {
        return res.status(400).json({ error: usernameError });
    }

    const numberError = validateNumber(number);
    if (numberError) {
        return res.status(400).json({ error: numberError });
    }

    if (usernames[username]) {
        return res.status(400).json({ error: 'User already exists' });
    }

    usernames[username] = { number: number };

    saveUserData();

    res.json({ message: 'User created successfully' });
});

app.post('/sms', async (req, res) => {
    const { username } = req.body;

    const twilio = require('twilio');

    // Load environment variables from .env file
    require('dotenv').config();

    // Twilio credentials from environment variables
    var fromNumber = process.env.TWILIO_PHONE_NUMBER;
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;

    // Generate new code
    var min = 10000;
    var max = 99999;
    var newCode = Math.floor(Math.random() * (max - min + 1)) + min;

    const user = usernames[username];
    if (!user) {
        return res.status(400).json({ error: 'User could not be found' });
    }

    // Input
    var toNumber = user.number;
    const message = 'Your login code for authenticate.hasenhuettl.cc is: ' + newCode;

    // Sanitize phone numbers
    const pattern = /[0-9\+]+/g;
    fromNumber = fromNumber.match(pattern).join('')
    toNumber = toNumber.match(pattern).join('')

    // Send the SMS
    const client = twilio(accountSid, authToken);
    var error;

    client.messages.create({
      body: message,
      from: fromNumber,
      to: toNumber
    })
    .then(message => error = ("SMS sent successfully: ", message.sid))
    .catch(err => error = ("Error sending SMS: ", err));

    if (error) {
        return res.status(400).json({ error: error });
    }

    usernames[username] = { number: toNumber, code: newCode };

    res.json({ message: 'SMS send' });
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

