const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const https = require("https");
const fs = require("fs");
const { exec } = require('child_process');

const PORT = 3018;
const configFilePath = '/etc/nginx/sites-available/ip-address-filtering.conf';

const options = {
    key: fs.readFileSync('/etc/letsencrypt/live/authenticate.hasenhuettl.cc/privkey.pem'),
    cert: fs.readFileSync('/etc/letsencrypt/live/authenticate.hasenhuettl.cc/fullchain.pem')
};

https.createServer(options, app).listen(PORT, () => {
    console.log(`Server running at https://localhost:${PORT}/`);
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.json());

app.post('/generate_certificate', (req, res) => {
    const { username } = req.body;

    const cmd = `/var/www/scripts/bash/generate_certificate.sh ${username}`;
    const filePath = `/var/www/html/device-certificates/signup/${username}.p12`;

    exec(cmd,
      function (error, stdout, stderr) {
        if (error !== null) {
          console.log(error);
          return res.status(400).json({ error: 'Certificate could not be created!' });
        } else {
          return res.json({ message: 'Certificate has been successfully created!' });
        }
    });

});

