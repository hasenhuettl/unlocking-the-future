const port = 3333;
const https = require('https');
const fs = require("fs");
const { exec } = require('child_process');

const options = {
    key: fs.readFileSync('/etc/letsencrypt/live/authenticate.hasenhuettl.cc/privkey.pem'),
    cert: fs.readFileSync('/etc/letsencrypt/live/authenticate.hasenhuettl.cc/fullchain.pem')
};

const executeCommand = (cmd, res) => {
    exec(cmd, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error executing script: ${error}`);
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: false, message: 'Error executing script' }));
        } else {
            console.log(`Script output: ${stdout}`);
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: true, message: 'Script executed successfully' }));
        }
    });
};

const server = https.createServer(options, (req, res) => {
    let cmd;

    if (req.url === '/clearData' && req.method === 'POST') {
        cmd = 'bash /var/www/scripts/bash/cleardata.sh';
    } else if (req.url === '/saveData' && req.method === 'POST') {
        cmd = 'bash /var/www/scripts/bash/savedata.sh';
    }

    if (cmd) {
        executeCommand(cmd, res);
    } else {
        res.statusCode = 404;
        res.end('Not found');
    }
});

server.listen(port, () => {
    console.log(`Server running at https://localhost:${port}/`);
});

