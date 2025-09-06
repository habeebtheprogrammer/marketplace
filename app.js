require('dotenv').config({ path: `.env.production.local` });
const mongoose = require('mongoose');
const dbServerConnect = require("./config/dbServerConnect");
const express = require('express');
const journeyWorker = require('./workers/journey.worker');
const blogWorker = require('./workers/blog.worker');
const dailyDataPlanWorker = require("./workers/dailyDataPlan.worker");
const notificationWorker = require('./workers/notification.worker');

var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const fileUpload = require('express-fileupload');

const bodyParser = require("body-parser");
const cors = require("cors");
const helmet = require("helmet");

const routes = require('./routes');
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

// Chat sessions API

app.get('*', (req, res) => res.send("Hello world"));

// Start workers when the database connection is established
mongoose.connection.once('connected', () => {
  journeyWorker.start();
  blogWorker.start();
  dailyDataPlanWorker.start();
  notificationWorker.start();
  console.log('Workers started');
});

// Handle process termination
process.on('SIGINT', async () => {
  console.log('Shutting down workers...');
  await Promise.all([
    journeyWorker.stop(),
    blogWorker.stop(),
    dailyDataPlanWorker.stop(),
    notificationWorker.stop ? notificationWorker.stop() : Promise.resolve()
  ].map(p => p.catch(console.error)));
  process.exit(0);
});

// app.get('*', (req, res) =>  res.json({error: "path not found"}))

dbServerConnect(app)