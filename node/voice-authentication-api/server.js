const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const app = express();
const https = require('https');
const fs = require('fs');
const multer = require('multer');
const axios = require('axios');

const PORT = 3011;

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        const userId = req.body.userId;
        const ext = path.extname(file.originalname);
        const filename = `${req.url === '/signup' ? 'signup' : 'login'}-${userId}${ext}`;
        cb(null, filename);
    }
});

const upload = multer({ storage: storage });

const options = {
    key: fs.readFileSync('/etc/letsencrypt/live/authenticate.hasenhuettl.cc/privkey.pem'),
    cert: fs.readFileSync('/etc/letsencrypt/live/authenticate.hasenhuettl.cc/fullchain.pem')
};

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.json());

https.createServer(options, app).listen(PORT, () => {
    console.log(`Server running at https://localhost:${PORT}/`);
});

const makeAxiosPostRequest = (path, req, res) => {
    const file = req.file;
    const userId = req.body.userId;

    if (!file) {
        return res.status(400).send('Please record your voice first');
    }

    if (!userId) {
        return res.status(400).send('User ID is required');
    }

    axios.post(`http://localhost:5000${path}`, {
        filePath: file.path,
        userId: req.body.userId
    }).then(response => {
        res.send(response.data);
    }).catch(error => {
        if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            res.status(400).send(error.response.data);
        } else if (error.request) {
            // The request was made but no response was received
            // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
            // http.ClientRequest in node.js
            res.status(404).send(error.request);
        } else {
            // Something happened in setting up the request that triggered an Error
            res.status(500).send('Error', error.message);
        }
        console.log(error.config);
    });
};

app.post('/signup', upload.single('voice'), (req, res) => {
    makeAxiosPostRequest('/signup', req, res);
});

app.post('/login', upload.single('voice'), (req, res) => {
    makeAxiosPostRequest('/login', req, res);
});

