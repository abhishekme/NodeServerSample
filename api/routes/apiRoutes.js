'use strict'

var userController = require('../controller/user');
var authController = require('../controller/auth/authController');
var constants      = require('../../config/constants');
const variableDefined = constants[0].application;

module.exports = function(app) {
//Check Express Middleware
function isAuth(req, res, next){
    var curSession  = req.session;
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    if(curSession.userRec ===  undefined ){
        res.json({message: variableDefined.variables.logged_out, status:0});
    return; // return undefined
    }
    return next();  //HTTP request handlers
}
//-------------------- AUTH Route ---------------------------------
app.route('/logout')
    .post(isAuth, userController.logout)
app.route('/login')
     .post(userController.validate('login'), userController.login)
//-------------------- AUTH Route ---------------------------------

//-------------------- USER SECTION ROUTE ---------------------------------

app.route('/user')
    .get(isAuth, userController.getList)
    .delete(isAuth, userController.delete)
    .post(userController.validate('create'),userController.create)
app.put('/user', isAuth, userController.validate('update'),userController.update);  //PUT requires a callback
app.route('/user/export')  
    .post(isAuth, userController.export)  //Need a csv file mandatory
app.route('/user/upload')
    .post(isAuth, userController.import)
//-------------------- DO OTHER SECTION ROUTE ---------------------------------



};