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

app.get('/', (req, res) => {
  knex.select()
    .from('news')
    .then(res => console.log(res));

  res.send('hello world');
}); 

// Create a POST endpoint, /api/stories, which adds new stories to your database.
// It should expect a JSON request body containing a title property and a url property
// It should respond with a 201 Created status and the story ////
  // The submitted title, URL and the new ID should come back
  // Plus the URL should be in the location header
// Sending a votes property should not allow users to cheat the system by setting an arbitrary number of upvotes
// Test your endpoint by:
// Using Postman to add some stories
// Using the shell to make sure they were added to the database

// psql postgres://ikqipnsg:Sl_j_HtbHVTOjEXmBk9VYza5EWqqI9wn@pellefant.db.elephantsql.com:5432/ikqipnsg
// server pellefant.db.elephantsql.com
// user/database ikqipnsg
// password Sl_j_HtbHVTOjEXmBk9VYza5EWqqI9wn

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

// Sending a votes property should not allow users to cheat the system by setting an arbitrary number of upvotes



// PUT ENDPOINT


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