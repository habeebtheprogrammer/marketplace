require('dotenv').config({ path: `.env.${process.env.NODE_ENV}.local` })
const express = require('express');
const next = require('next');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const fileUpload = require('express-fileupload');
const bodyParser = require("body-parser");
const cors = require("cors");

const dev =false;
const nextApp = next({ dev });
const handle = nextApp.getRequestHandler();

const dbServerConnect = require("./config/dbServerConnect");
const routes = require('./routes');
const { createSiteMap } = require('./utils/sitemap');

nextApp.prepare().then(() => {
  const app = express();

  app.use(fileUpload({
    useTempFiles: true,
    responseOnLimit: true,
    tempFileDir: '/tmp/'
  }));
  app.use(bodyParser.json());
  app.use(cors());

  app.use(logger('dev'));
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
  app.use(cookieParser());

  // Serve static files from the Next.js .next directory
  app.use('/_next', express.static(path.join(__dirname, '.next')));

  app.get('/robots.txt', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'robots.txt'));
  }); 

  app.get('/sitemap.xml', createSiteMap);
  app.use('/api', routes);

  // Handle all other routes with Next.js
  app.all('*', (req, res) => {
    return handle(req, res);
  });

  dbServerConnect(app);

  const port = process.env.PORT || 3000;
  app.listen(port, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://localhost:${port}`);
  });
});