require('dotenv').config({ path: `.env.production.local` })
var dbServerConnect = require("./config/dbServerConnect");
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const fileUpload = require('express-fileupload');
const favicon = require('serve-favicon');

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
  debug: true,
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

// app.get('*', (req, res) =>  res.json({error: "path not found"}))

dbServerConnect(app)