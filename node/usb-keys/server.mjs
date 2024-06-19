/*
 * @license
 * Copyright 2023 Google Inc. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License
 */

// init project
import express from 'express';
import session from 'express-session';
import hbs from 'hbs';
import { auth } from './libs/auth.mjs';
const app = express();
import useragent from 'express-useragent';
import path from 'path';
import { fileURLToPath } from 'url';

import https from 'https';
import fs from 'fs';

const PORT = 3002;

const options = {
    key: fs.readFileSync('/etc/letsencrypt/live/authenticate.hasenhuettl.cc/privkey.pem'),
    cert: fs.readFileSync('/etc/letsencrypt/live/authenticate.hasenhuettl.cc/fullchain.pem')
};

const DATABASE_FILE = 'myDatabase.json';

const users = {}; // Temporary storage for users
const __filename = fileURLToPath(import.meta.url); // get the resolved path to the file
const __dirname = path.dirname(__filename); // get the name of the directory

app.set('view engine', 'html');
app.engine('html', hbs.__express);
app.set('views', './views');
app.use(express.json());
app.use(useragent.express());
// app.use(express.static('public'));
app.use(express.static(__dirname + '/public/'));
app.use(express.static('dist'));
app.use(session({
  secret: 'secret', // You should specify a real secret here
  resave: true,
  saveUninitialized: false,
  proxy: true,
  cookie:{
    httpOnly: true,
    secure: true,
    sameSite: 'none'
  }
}));

const RP_NAME = 'Passkeys';

// http://expressjs.com/en/starter/basic-routing.html
app.get('/', (req, res) => {
  res.render('index.html', {
    project_name: process.env.PROJECT_NAME,
    title: RP_NAME,
  });
});

app.get('/home', (req, res) => {
  if (!req.session.username || req.session['signed-in'] != 'yes') {
    // If user is not signed in, redirect to `/`.
    res.redirect(307, '/');
    return;
  }
  // `home.html` shows sign-out link
  res.render('home.html', {
    displayName: req.session.username,
    project_name: process.env.PROJECT_NAME,
    title: RP_NAME,
  });
});

app.get('/test', (req, res) => {
  res.render('test.html');
})

app.use('/auth', auth);

//app.get('/', (req, res) => {
//    res.sendFile(path.join(__dirname, 'index.html'));
//});

https.createServer(options, app).listen(PORT, () => {
    console.log(`Server running at https://localhost:${PORT}/`);
});
