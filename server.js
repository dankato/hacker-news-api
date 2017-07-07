'use strict';

// grab our dependencies

    //  Express (calls middleware to process requests and responses
    const express = require('express');
        // Create the app
        const app = express();

    //  Morgan, HTTP request logger middleware for node.js
    const morgan = require('morgan')

// configure our app


// set routes
    app.get('/', (req, res) => {
        res.send('hello, im the app');
    });


// start server
    app.listen(process.env.PORT || 8080, () => {
        console.log(`App is listening on port ${process.env.PORT || 8080}`);
    });


// TEST EACH STEP