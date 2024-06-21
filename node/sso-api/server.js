const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const app = express();
const https = require("https");
const fs = require("fs");

const PORT = 3013;

const options = {
    key: fs.readFileSync('/etc/letsencrypt/live/authenticate.hasenhuettl.cc/privkey.pem'),
    cert: fs.readFileSync('/etc/letsencrypt/live/authenticate.hasenhuettl.cc/fullchain.pem')
};

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.json());

const DATABASE_FILE = 'myDatabase.json';

var users = {}; // Temporary storage for users

https.createServer(options, app).listen(PORT, () => {
    console.log(`Server running at https://localhost:${PORT}/`);
});

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

app.post('/signup', (req, res) => {
    const { lat, lon } = req.body;
    const roundedLat = parseFloat(lat).toFixed(3);
    const roundedLon = parseFloat(lon).toFixed(3);
    const key = `${roundedLat},${roundedLon}`;

    if (users[key]) {
        return res.status(400).json({ message: 'User already exists at this location.' });
    }

    users[key] = { lat: roundedLat, lon: roundedLon };
    saveUserData();

    res.json({ message: 'User created successfully' });
});

app.post('/login', (req, res) => {
    const { lat, lon } = req.body;
    const roundedLat = parseFloat(lat).toFixed(3);
    const roundedLon = parseFloat(lon).toFixed(3);
    const key = `${roundedLat},${roundedLon}`;

    if (users[key]) {
        return res.status(200).json({ message: 'Login successful.' });
    }

    return res.status(400).json({ message: 'User not found.' });
});


