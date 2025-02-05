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
console.log(process.env.NODE_ENV)
var app = express();
// app.use(favicon(path.join(__dirname, '/build', 'favicon.ico')));

app.use(fileUpload({
  useTempFiles: true,
  responseOnLimit: true,
  tempFileDir: '/tmp/'
}));
app.use(bodyParser.json());
// app.use(cors());
app.use(cors({
  origin: 'https://www.360gadgetsafrica.com',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
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

app.get('*', (req, res) => res.sendFile(path.join(__dirname, "/build/index.html")));

// app.get('*', (req, res) =>  res.json({error: "path not found"}))

dbServerConnect(app)