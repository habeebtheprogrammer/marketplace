require('dotenv').config({ path: `.env.production.local` });
const mongoose = require('mongoose');
const dbServerConnect = require("./config/dbServerConnect");
const express = require('express');
const worker = require('./workers/journey.worker');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const fileUpload = require('express-fileupload');

const bodyParser = require("body-parser");
const cors = require("cors");
const helmet = require("helmet");

var routes = require('./routes'); 
const { createSiteMap } = require('./utils/sitemap');
 
var app = express();
// app.use(favicon(path.join(__dirname, '/build', 'favicon.ico')));

app.use(fileUpload({
  useTempFiles: true,
  responseOnLimit: true,
  tempFileDir: '/tmp/',
  // debug: true,
  abortOnLimit: true,
  responseOnLimit: 'File size limit has been reached.', // Send a response if limit is hit
  limits: {
    fileSize: 50 * 1024 * 1024 // 20MB limit
  }
}));
app.use(bodyParser.json());
app.use(cors());
app.use(express.static(path.join(__dirname, 'build')));

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.get('/robots.txt', (req, res) => {
  res.sendFile(path.join(__dirname, 'robots.txt'));
});

app.get('/sitemap.xml', createSiteMap)
app.get('/robots.txt', createSiteMap)
app.use('/api', routes);

app.get('*', (req, res) => res.send("Hello world"));

// Start the worker when the database connection is established
mongoose.connection.once('connected', () => {
  worker.start();
  console.log('Journey worker started');
});

// Handle process termination
process.on('SIGINT', async () => {
  console.log('Shutting down worker...');
  await worker.stop();
  process.exit(0);
});

// app.get('*', (req, res) =>  res.json({error: "path not found"}))

dbServerConnect(app)