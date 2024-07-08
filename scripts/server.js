const https = require('https');
const fs = require('fs');
const { exec } = require('child_process');
const express = require('express');
const bodyParser = require('body-parser');
const { Pool } = require('pg');

const app = express();
const port = 3333;

const options = {
    key: fs.readFileSync('/etc/letsencrypt/live/authenticate.hasenhuettl.cc/privkey.pem'),
    cert: fs.readFileSync('/etc/letsencrypt/live/authenticate.hasenhuettl.cc/fullchain.pem')
};

// Database configuration
const pool = new Pool({
//  user: 'authenticate',
  user: 'postgres',
  host: 'localhost',
  database: 'auth_methods',
  password: process.env.POSTGRES,
  port: 5432,
});

app.use(bodyParser.json());

const executeCommand = (cmd, res) => {
    exec(cmd, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error executing script: ${error}`);
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: false, message: error.toString() }));
        } else {
            console.log(`Script output: ${stdout}`);
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: true, message: 'Script executed successfully' }));
        }
    });
};

app.post('/clearData', (req, res) => {
  const cmd = 'bash /var/www/scripts/bash/cleardata.sh';
  executeCommand(cmd, res);
});


app.post('/saveData', (req, res) => {
  const cmd = 'bash /var/www/scripts/bash/savedata.sh';
  executeCommand(cmd, res);
});

// Endpoint for /saveData
app.post('/saveData', (req, res) => {
  const cmd = 'bash /var/www/scripts/bash/savedata.sh';
  executeCommand(cmd, res);
});

app.post('/saveDevice', async (req, res) => {
  const { username, visitorId, os, browser } = req.body;

  try {
    // Check if the user exists
    let result = await pool.query('SELECT user_id FROM users WHERE username = $1', [username]);
    let userId;

    if (result.rows.length === 0) {
      // Insert new user
      result = await pool.query('INSERT INTO users (username) VALUES ($1) RETURNING user_id', [username]);
      userId = result.rows[0].user_id;
    } else {
      userId = result.rows[0].user_id;
    }

    // Insert device info
    result = await pool.query('INSERT INTO devices (user_id, visitor_id, os, browser) VALUES ($1, $2, $3, $4)', [userId, visitorId, os, browser]);

    res.status(200).json({ message: 'Device saved successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.detail });
  }
});

app.post('/saveMeasurement', async (req, res) => {
  const { visitorId, authMethod, action, timeMs } = req.body;

  try {
    // Check if the device with visitorId exists
    let result = await pool.query('SELECT device_id FROM devices WHERE visitor_id = $1', [visitorId]);
    let deviceId;

    if (result.rows.length === 0) {
      // Device does not exist
      res.status(500).json({ message: 'Internal server error' });
    } else {
      deviceId = result.rows[0].device_id;
    }

    // Insert measurement
    await pool.query('INSERT INTO measurements (device_id, auth_method_name, action, time_ms) VALUES ($1, $2, $3, $4)', [deviceId, authMethod, action, timeMs]);

    res.status(200).json({ message: 'Measurement saved successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

https.createServer(options, app).listen(port, () => {
  console.log(`HTTPS server running at https://localhost:${port}/`);
});

