// importing all needed packages
const express = require("express");
const app = express();
const cors = require('cors');
const bodyParser = require("body-parser");
const routes = require('./routes');

// Body-parser middleware
app.use(bodyParser.json());

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: false}))

// allowing cors.
app.use(cors({
    origin: "*",
    credentials: true
}));



// all api routes falls here 
app.use("/api",routes);

// if no routes that is been requested exist shows 404 error not found 
app.use(function (req, res, next) {
    res.status(404);

    

    // respond with json
    if (req.accepts('json')) {
        res.json({
            statuscode:404,
            error: 'Not found'
        });
        return;
    }

    // default to plain-text. send()
    res.type('txt').send('Not found');
});

// starting the server
app.listen(8000, () => {
    console.log("Server started at http://localhost:8000");
});
