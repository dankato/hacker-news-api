'use strict'; 

const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');

const { DATABASE, PORT } = require('./config');

const app = express();

// const dotenv = require('dotenv');

let knex = require('knex')(DATABASE);

app.use(morgan(':method :url :res[location] :status'));

const jsonParser = bodyParser.json();

// CORS Enabled
app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE');
  next();
});

// GET ENDPOINT
app.get('/', (req, res) => {
  knex.select()
    .from('news')
    .then(res => console.log(res));
  res.send('i get stuff but look in your command line');
}); 

// POST ENDPOINT
app.post('/api/stories', jsonParser, (req, res) => {
  // ensure `title` and `url` are in request body
  const requiredFields = ['title', 'url'];
  for (let i=0; i<requiredFields.length; i++) {
    const field = requiredFields[i];
    if (!(field in req.body)) {
      const message = `Missing \`${field}\` in request body`;
      console.error(message);
      return res.status(400).send(message);
    }
  }
  knex('news')
    .insert({'title': req.body.title, 'url': req.body.url})
    .returning(['id','title', 'url', 'votes'])
    .then(result => {
      res.status(201).json(result);
    })
    .catch(err => res.status(500).json(err));

  res.set('Location', req.body.url);
});

// PUT ENDPOINT
app.put('/api/stories/:id', jsonParser, (req, res) => {
  knex('news')
    .where('id', req.params.id)
    .increment('votes', 1)
    .then(() => res.sendStatus(200))
    .catch(err => res.status(500).json(err));
});

// DELETE ENDPOINT
app.delete('/api/stories/:id', (req, res) => {
  knex('news')
    .where('id', req.params.id)
    .del()
    .then(() => res.sendStatus(204))
    .catch(err => res.status(500).json(err));
});

let server;
// let knex;
function runServer(database = DATABASE, port = PORT) {
  return new Promise((resolve, reject) => {
    try {
      knex = require('knex')(database);
      server = app.listen(port, () => {
        console.info(`App listening on port ${server.address().port}`);
        resolve();
      });
    }
    catch (err) {
      console.error(`Can't start server: ${err}`);
      reject(err);
    }
  });
}

function closeServer() {
  return knex.destroy().then(() => {
    return new Promise((resolve, reject) => {
      console.log('Closing servers');
      server.close(err => {
        if (err) {
          return reject(err);
        }
        resolve();
      });
    });
  });
}

if (require.main === module) {
  runServer().catch(err => {
    console.error(`Can't start server: ${err}`);
    throw err;
  });
}

module.exports = { app, runServer, closeServer };