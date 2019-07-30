'use strict';

const express = require('express');
const path = require('path');

const app = express();

app.use((req, res, next) => {
  console.log(req.method, req.url, req.header('x-real-ip') || req.ip);
  next();
});

app.use(express.static(path.join(__dirname, 'public')));

require('./api')(app);

app.listen(8080, () => {
  console.log('App started and available at http://localhost:8080');
});