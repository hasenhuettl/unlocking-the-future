const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const https = require("https");
const fs = require("fs");
const { exec } = require('child_process');

const PORT = 3008;
const configFilePath = '/etc/nginx/sites-available/ip-address-filtering.conf';

const options = {
    key: fs.readFileSync('/etc/letsencrypt/live/authenticate.hasenhuettl.cc/privkey.pem'),
    cert: fs.readFileSync('/etc/letsencrypt/live/authenticate.hasenhuettl.cc/fullchain.pem')
};

https.createServer(options, app).listen(PORT, () => {
    console.log(`Server running at https://localhost:${PORT}/`);
});

app.set('view engine', 'ejs');
app.set('trust proxy', true); // Return real remote IP (behind proxy)

app.use(bodyParser.urlencoded({ extended: true }));

function readAllowedIps() {
    const data = fs.readFileSync(configFilePath, 'utf-8');
    const lines = data.split('\n');
    const allowedIps = [];
    lines.forEach(line => {
        if (line.trim().startsWith('allow')) {
            allowedIps.push(line.trim().split(' ')[1].slice(0, -1));
        }
    });
    return allowedIps;
}

function writeAllowedIps(ips) {
    const newConfig = [
        'location /ip-address-filtering/login {',
        '    error_page 403 /ip-address-filtering/403.html;'
    ];
    ips.forEach(ip => {
        newConfig.push(`    allow ${ip};`);
    });
    newConfig.push('    deny all;');
    newConfig.push('}');
    
    fs.writeFileSync(configFilePath, newConfig.join('\n'));
    reloadNginx();
}

function reloadNginx() {
    exec('sudo systemctl restart nginx', (error, stdout, stderr) => {
        if (error) {
            console.error(`Error reloading Nginx: ${error}`);
            return;
        }
        console.log('Nginx reloaded successfully');
    });
}

app.get('/', (req, res) => {
    const allowedIps = readAllowedIps();
    res.render('index', { allowedIps });
});

app.post('/current-ip', (req, res) => {
    const addIp = req.header('X-REMOTE-IP') + "/32";
    const allowedIps = readAllowedIps();

    if (addIp && !allowedIps.includes(addIp)) {
        allowedIps.push(addIp);
    }

    writeAllowedIps(allowedIps);

    setTimeout(function (){ res.redirect('/ip-address-filtering/login/'); }, 1000);
});

app.post('/update', (req, res) => {
    const addIp = req.body.add_ip;
    const allowedIps = readAllowedIps();

    if (addIp && !allowedIps.includes(addIp)) {
        allowedIps.push(addIp);
    }

    writeAllowedIps(allowedIps);

    setTimeout(function (){ res.redirect('/ip-address-filtering/login/'); }, 1000);
});

app.post('/reset', (req, res) => {
    const allowedIps = [];

    writeAllowedIps(allowedIps);

    res.redirect('/ip-address-filtering-api/');
});

