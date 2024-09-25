#!/usr/bin/env node
const port = 3016;
const https = require('https');
const fs = require("fs");
const { exec } = require('child_process');
const express = require('express');
const multer = require('multer');
const path = require('path');
const cookieParser = require('cookie-parser');

const options = {
    key: fs.readFileSync('/etc/letsencrypt/live/authenticate.hasenhuettl.cc/privkey.pem'),
    cert: fs.readFileSync('/etc/letsencrypt/live/authenticate.hasenhuettl.cc/fullchain.pem')
};

const app = express();

app.use(cookieParser());

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const username = req.cookies.username;
        const userDir = `./uploads/${username}`;

        fs.mkdir(userDir, { recursive: true }, (err) => {
            if (err) {
                console.error('Error creating directory:', err);
                return cb(err, userDir);
            }
            cb(null, userDir);
        });
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
});

const upload = multer({ storage: storage });

app.post('/signup', upload.single('file'), (req, res) => {
    if (req.file) {
        console.log(`Uploaded file: ${req.file.originalname}`);
        res.status(200).json({ success: true, message: 'OK' });
    } else {
        res.status(400).json({ success: false, message: 'No file uploaded' });
    }
});

app.post('/login', upload.single('file'), (req, res) => {
    const username = req.cookies.username; // Get username from cookie
    if (req.file) {
        console.log(`Uploaded file: ${req.file.filename}`);
        const cmd = `python3 /var/www/node/facial-recognition-api/main.py /uploads/${username}/`;
        exec(cmd, (error, stdout, stderr) => {
            if (error) {
                console.error(`Error executing script: ${error}`);
                res.status(500).json({ success: false, message: 'Face did not match the recorded image' });
            } else {
                const output = stdout.trim();
                if (output === 'True') {
                    console.log('successful');
                    res.status(200).json({ success: true, message: 'OK' });
                } else {
                    console.log('Login failed');
                    res.status(200).json({ success: false, message: 'Login failed' });
                }
            }
        });
    } else {
        res.status(400).json({ success: false, message: 'No file uploaded' });
    }
});

https.createServer(options, app).listen(port, () => {
    console.log(`Server running at https://localhost:${port}/`);
});

