const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const app = express();
const https = require("https");
const fs = require("fs");

const PORT = 3009;

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
    const { username, lat, lon } = req.body;
    const roundedLat = parseFloat(lat).toFixed(3);
    const roundedLon = parseFloat(lon).toFixed(3);

    if (!username) {
        return res.status(400).json({ message: 'Username has to be at least 1 character' });
    }

    users[username] = { lat: roundedLat, lon: roundedLon };
    saveUserData();

    res.json({ message: 'Location saved successfully' });
});

app.post('/login', (req, res) => {
    const { username, lat, lon } = req.body;
    const roundedLat = parseFloat(lat).toFixed(3);
    const roundedLon = parseFloat(lon).toFixed(3);

    if (!username) {
        return res.status(400).json({ message: 'Username has to be at least 1 character' });
    }

    if (!users[username]) {
        return res.status(400).json({ message: 'User has not signed up' });
    }

    if (users[username].lat == roundedLat && users[username].lon == roundedLon) {
        return res.status(200).json({ message: 'Login successful.' });
    } else {
        return res.status(400).json({ message: 'User has logged in from unknown location' });
    }

});


