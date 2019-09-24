'use strict'

const express           = require("express");
var busboy              = require('connect-busboy'); //middleware for form/file upload
const cors              = require('cors');
const formidable        = require('express-formidable');
const bodyParser        = require("body-parser");
var routes              = require('./api/routes/apiRoutes.js'); //importing route
const session           = require('express-session');
const app               = express();

app.use(busboy());
app.use(cors());    //Allow CORS
//Application session
app.use(session({secret: 'scott-tiger', maxAge: 20000}));
app.use(express.json());    //{ extended: false }
app.use(express.urlencoded());

/****************************
 * Large File Upload Allow
 * Start
 ****************************/
    //app.use(express.urlencoded({ extended: true ,limit: '50mb' }));
    //app.use(express.json({ limit: '50mb' }));
/****************************
 * Large File Upload Allow
 * End
 ****************************/
app.use(express.static("app/public"));  //use user upload section
routes(app);

app.listen(8085, () => {
    console.log("App listening on port 8085");
});
