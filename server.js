'use strict'

const express           = require("express");
//var busboy              = require('connect-busboy'); //middleware for form/file upload
const cors              = require('cors');
const formidable        = require('express-formidable');
const bodyParser        = require("body-parser");
//const db                = require("./api/models");    //use if needed
var routes              = require('./api/routes/apiRoutes.js'); //importing route
//const expressValidator  = require('express-validator'); //use if needed
const session           = require('express-session');
const app               = express();

//app.use(busboy());
app.use(cors());
//Application session
app.use(session({secret: 'scott-tiger'}));
app.use(express.json());    //{ extended: false }
app.use(express.urlencoded());

app.use(express.static("app/public"));  //use user upload section
routes(app);

app.listen(8085, () => {
    console.log("App listening on port 8085");
});
