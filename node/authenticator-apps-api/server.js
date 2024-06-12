const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const app = express();
const https = require('https');
const fs = require('fs');
const crypto = require('crypto')
const OTPAuth = require('otpauth');
const { encode } = require('hi-base32');
const QRCode = require('qrcode');

const PORT = 3010;

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

const generateBase32Secret = () => {
  const buffer = crypto.randomBytes(15);
  const base32 = encode(buffer).replace(/=/g, "").substring(0, 24);
  return base32;
};

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
    const { username } = req.body;

    const base32_secret = generateBase32Secret();
    users[username] = { secret: base32_secret };

    let totp = new OTPAuth.TOTP({
        issuer: "authenticate.hasenhuettl.cc",
        label: username,
        algorithm: "SHA1",
        digits: 6,
        period: 30,
        secret: base32_secret,
    });

    let otpauth_url = totp.toString();

    // Generate and send the QR code as a response
    QRCode.toDataURL(otpauth_url, (err, qrUrl) => {
        if(err) {
            return res.status(500).json({
                status: 'fail',
                message: "Error while generating QR Code"
            })
        }
        res.status(200).json({
            status: "success",
            data: {
                qrCodeUrl: qrUrl,
                secret: base32_secret
            }
        })
    })

    saveUserData();

});

app.post('/login', (req, res) => {
    const { username, token } = req.body;

    user = users[username];

    if (!user) {
        return res.status(400).json({ message: 'User not found. Please create a QR code first.' });
    }

    let totp = new OTPAuth.TOTP({
        issuer: "authenticate.hasenhuettl.cc",
        label: username,
        algorithm: "SHA1",
        digits: 6,
        period: 30,
        secret: user.secret,
    });

    let delta = totp.validate({ token });

    if ( delta || token == totp.generate() ) {
        res.json({
            status: "success",
            message: "Authentication successful"
        })
    } else {
        res.status(401).json({
            status: "fail",
            message: "Authentication failed"
        }) 
    }
});

