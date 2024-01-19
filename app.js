require('dotenv').config();
var dbServerConnect = require("./config/dbServerConnect");
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const fileUpload = require('express-fileupload');

const bodyParser = require("body-parser");
const cors = require("cors");
const helmet = require("helmet");

var routes = require('./routes'); 

var app = express();

app.use(fileUpload({
  useTempFiles: true,
  responseOnLimit: true,
  tempFileDir: '/tmp/'
}));
app.use(helmet({ contentSecurityPolicy: false }))
app.use(bodyParser.json());
app.use(cors());

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use('/api/v1/', routes);

app.get('*', (req, res) =>  res.sendStatus(200))

dbServerConnect(app)