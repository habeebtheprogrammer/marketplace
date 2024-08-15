require('dotenv').config({ path: `.env.${process.env.NODE_ENV}.local` })
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

var app = express();
// app.use(favicon(path.join(__dirname, '/build', 'favicon.ico')));

app.use(fileUpload({
  useTempFiles: true,
  responseOnLimit: true,
  tempFileDir: '/tmp/'
}));

app.use((req, res, next) => {
  // res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
  // res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
  res.setHeader('Cross-origin-Opener-Policy','same-origin-allow-popups');
  next()
});
app.use(helmet({ contentSecurityPolicy: false }))
app.use(bodyParser.json());
app.use(cors());
app.use(express.static(path.join(__dirname, 'build')));

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use('/api', routes);

app.get('*', (req, res) => res.sendFile(path.join(__dirname, "/build/index.html")));

// app.get('*', (req, res) =>  res.json({error: "path not found"}))

dbServerConnect(app)