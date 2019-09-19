'use strict'

//Get ORM object
var userController          = require('./user');
var constants               = require('../../config/constants');
var bCrypt                  = require('bcrypt-nodejs');
const { body,validationResult,check } = require('express-validator');
const Sequelize             = require('sequelize');
const Op                    = Sequelize.Op;
const db                    = require('../../models');
const theModel              = db.user; 
const theContr              = userController;
const variableDefined       = constants[0].application;
const fs                    = require('fs');
//const json2csv = require('json2csv').parse;
//const createCsvWriter = require('csv-writer').createObjectCsvWriter;
//const fastcsv = require('fast-csv');
//import { ExportToCsv } from 'export-to-csv';
//const ExportToCsv = require('export-to-csv').ExportToCsv;
//const csv = require('csv').csv;
//const csvParser = require('csv-parser');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
var thisObj                 = this;

/*thisObj.userById = function(theId){
  
  var getID = theId;
  console.log('Get Id: ', theId);
  
}*/

//-----------------------------------------------------------------------
//---------------- API Required Field Validation ------------------------
//-----------------------------------------------------------------------
exports.validate = (method) => {
  switch (method) {
    case 'create' : {
     return [ 
        body('first_name', variableDefined.variables.first_name_required).exists(),
        body('last_name', variableDefined.variables.last_name_required).exists(),
        body('username', variableDefined.variables.username_required).exists(),
        body('email', variableDefined.variables.email_required).exists().isEmail(),
        body('password')  
            .exists().withMessage(variableDefined.variables.password_required)
            .isLength({ min: 5, max:15 }).withMessage(variableDefined.variables.password_strength_step1)
            .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{5,}$/).withMessage(variableDefined.variables.password_strength_step2),
       ]   
    }
    case 'login' : {
      return [ 
         body('email', variableDefined.variables.email_required).exists().isEmail(),
         body('password', variableDefined.variables.password_required).exists(),
        ]   
     }
    case 'update' : {
      return [ 
         body('first_name', variableDefined.variables.first_name_required).exists(),
         body('last_name', variableDefined.variables.last_name_required).exists(),
         body('username', variableDefined.variables.username_required).exists(),
         body('password')  
            .exists().withMessage(variableDefined.variables.password_required)
            .isLength({ min: 5, max:15 }).withMessage(variableDefined.variables.password_strength_step1)
            .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{5,}$/).withMessage(variableDefined.variables.password_strength_step2),
        //  body('password', 'Password is required')
        //     .isLength({min: 8, max:15})
        //     .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[a-zA-Z\d@$.!%*#?&]/)
        //     .withMessage('Password should not be empty, minimum eight characters maximum fifteen, at least one letter, one number and one special character'),
         body('email', variableDefined.variables.email_required).exists().isEmail()
        ]   
     }
  }
}
exports.apiValidation   = function(req,resp){
  const errors          = validationResult(req);
  var validationErr     = [];
  var validationErrMesg = [];
  errors.array().forEach(error => {
      let found = validationErr.filter(errItem => error.param === errItem.param);
      if (!found.length) {
        validationErr.push(error);
      }      
  });
  if(validationErr.length){
    validationErr.forEach(rec => {
       validationErrMesg.push({field: rec.param, message: rec.msg});
    })
    resp.status(422).json({ errors: validationErrMesg, status:0 });
    return true;
  }
  return false;
}
//-----------------------------------------------------------------------
//-----------------API Required Field Validation ------------------------
//-----------------------******** END ********** ------------------------
//-----------------------------------------------------------------------
exports.hashPassword  = function(password){
  return bCrypt.hashSync(password, bCrypt.genSaltSync(8), null);
}
exports.isLoggedIn  = function (req, res, next) {
    // if user is authenticated in the session, carry on 
    var curSession  = req.session;
    if(curSession.userRec !=  undefined && curSession.userRec.id > 0){
        res.json({ message: variableDefined.variables.logged_in, status:1 });
        return next();
    }
    res.json({ message: variableDefined.variables.logged_out, status:0 });
    return;
}
/*-----------------------------------
/-------------LOGOUT USER------------
/---@body: NULL
/------------------------------------
------------------------------------*/
exports.logout   = function(req, res){
  req.session.destroy((err) => {
    if(err) {
      return console.log({message: variableDefined.variables.logout_unSuccess, status:0, error:err});
    }
    res.json({message: variableDefined.variables.logout_success, status:0});    
  });
}

/*-----------------------------------
/-------------LOGIN USER-------------
/---@body: [email, password] --------
/------------------------------------
------------------------------------*/
exports.login  = function(req, resp){
    var postBody  = req.body || null;
    //Add required validation
    theContr.apiValidation(req, resp);
    if(postBody.email != undefined && postBody.password != undefined){
      if(postBody.email){
        theModel.findOne({           
          where: {
           email: postBody.email
         }
        }).then(result => {
            if(result === null || result === undefined){
              resp.json({ message: variableDefined.variables.email_not_exists,status : 0 });
              return;
            }
            if(result.dataValues.id > 0){
               var getRecord  = result;
               var dbPassword = getRecord.password;              
               
              if(!theModel.validPassword(postBody.password, dbPassword)){
                result = null;
                resp.json({ message: variableDefined.variables.password_invalid,status : 0 });
                return;
              }
              var userRec = result.dataValues;
              if(req.session != undefined){
                var curSession  = req.session;
                curSession.userRec = userRec;
                var userRec     = result;
                //Show picture image
                var picPath     = variableDefined.serverPath.userUploadDir +  userRec.dataValues.filename;
                //delete userRec.dataValues.profile_pic;
                userRec.dataValues.profile_pic = picPath;
                resp.json({ message: variableDefined.variables.login_success, status : 1, loggedUser: userRec.dataValues});
              }
           }
        });
      }      
    }
}

//Add List with pagination limit
/*-----------------------------------
/-------------LIST USER--------------
/---@body: NULL ---------------------
/------------------------------------
------------------------------------*/
exports.getList = function(req, res) {
  theModel.findAll().then( (result) => res.json(result))
};



/*-----------------------------------
/-------------CREATE USER -----------
/---@body: [id, email,username]------
/------------------------------------
------------------------------------*/
exports.create  = function(req, resp) {    

  //Add required validation
  var validReturn   = theContr.apiValidation(req, resp);
  if(validReturn) return;

  var getData   = req.body || null;
  if(typeof getData === 'object'){
     var getEmail       = getData.email || '';
     var getUserName    = getData.username;
     if(getEmail){
         theModel.findOne({           
           where: {
            [Op.or]: [{email: getEmail}, {username: getUserName}]
          }
         }).then(result => {
           if(result != null){
             resp.json({ message: variableDefined.variables.email_or_username_exists,record : result });
             return;
           }
           if(result === null){
            if(getData.password != undefined){
               var hashPassword = theContr.hashPassword(getData.password);
               if(hashPassword) getData.password = hashPassword;
            }
            theModel.create(req.body).then((insertRecord) => {
              if(insertRecord.dataValues.id != undefined &&  insertRecord.dataValues.id > 0){
                resp.json({ message: 'Record Inserted!',status : 1, record: insertRecord });
                return;
              }
            })
          }
        });
     }
     return;
  }
};

exports.export  = function(req, res){
  var csvExportFile   = new Date().getTime() + '_user.csv';
  var csvFilePath     = variableDefined.serverPath.userExport + csvExportFile;
  var userRec = [];
  const csvWriter = createCsvWriter({
    path: csvFilePath,
    header: variableDefined.exportTable.userCsvHeader
  });
  theModel.findAll().then( (result) => {
      var theRecord   = result;
      theRecord.forEach(rec => {
        //delete rec.dataValues.profile_pic;
        userRec.push(rec.dataValues);
      })
      csvWriter
        .writeRecords(userRec)
        .then(()=> res.json({ message: variableDefined.variables.csvFileCreated, status : 1 }));
  });
}

/*-----------------------------------
/-------------UPDATE USER -----------
/---@body: [id, email,username]------
/------------------------------------
------------------------------------*/
exports.update = function(req, resp) {
  //Add required validation
  var contentType = req.headers['content-type'];
  if(contentType  ===  variableDefined.contentType.formdata) {
      //resp.setHeader('Content-Type', 'multipart/form-data');
      console.log('Content Type: form-data', req.files);
      // req.on('data', (data) => {
      //   var dataObj =  (data.toString());
      //   console.log(dataObj);
      // });
      // req.busboy.on('body', function (body) {

      //   console.log("body: ", body);
      // });
  }
  if(contentType  ===  variableDefined.contentType.urlencode) {
    console.log('Content Type: urlencode');
  }

  //var validReturn   = theContr.apiValidation(req, resp);
  //if(validReturn)   return;
  // if(req.headers != null){
  //   var contype = req.headers['content-type'];
  //   console.log("Headers: ",checkHeaders);
  // }
  // console.log('Check headers: ', req.headers.origin, " :: ", req.method);
  // return false;

  var getData     = req.body || null;
  var getId       = req.body.id || 0;
  var getEmail    = req.body.email || '';
  var getUserName = req.body.username || '';
  //image upload processing
  var getApiImage =  req.body.profile_pic || null;
  delete req.body.id;

  var curSession  = req.session;
  var logUserRec  = curSession.userRec;

  if(!getId){
    resp.json({ message: variableDefined.variables.id_not_found,status : -1 }); 
    return;
  }
  else if(getEmail != null && getUserName != null){

      theModel.findAll(
      { where: { 
        [Op.or]: [
          {email: getEmail}, {username: getUserName}
        ], 
        id:
          { [Op.ne] : getId}                        
        }}).then(result => {
          var findRec = result;
          if(findRec.length > 0){
            resp.json({ message: variableDefined.variables.email_exists, status : 0,record: findRec }); 
            return;
          }
          if(!findRec.length){            
            if(getData.password != undefined){
              var hashPassword = theContr.hashPassword(getData.password);
              if(hashPassword) getData.password = hashPassword;
            }
            //processing image
            if(getApiImage != null){
              theModel.findAll(
              { where: { 
                  id: getId                                            
                  }}).then(result => {
                    var recordData = result[0].dataValues;
                    //delete recordData.profile_pic;
                    if(result.length > 0){
                      var oldFileName     = recordData.filename;
                      if(oldFileName != null){
                        var filePath = variableDefined.serverPath.userUploadDir + oldFileName;
                        fs.unlinkSync(filePath);
                      }
                      var fileName        = getId + "_" + getData.first_name.toString().replace(/ +/g, "") + variableDefined.variables.user_picture_extension;
                      const path          = variableDefined.serverPath.userUploadDir + fileName;
                      const imgdata       = getApiImage;
                      const bufferSize    = Buffer.from(imgdata.substring(imgdata.indexOf(',') + 1));
                      const bufferLength  = bufferSize.length;
                      const uploadSize    = bufferSize.length / 1e+6;
                      if(uploadSize != null && uploadSize >=1){
                        resp.json({ message: variableDefined.variables.image_upload_max_size, status : 0 });
                        return;
                      }
                      // to convert base64 format into random filename
                      const base64Data  = imgdata.replace(/^data:([A-Za-z-+/]+);base64,/, '');              
                      fs.writeFileSync(path, base64Data,  {encoding: variableDefined.variables.user_picture_upload_encoding});
                      //Add file name
                      getData.filename  = fileName;
                      //Update record with update profile photo
                      theModel.update(getData,
                      {
                          where: {
                            id: getId
                          }
                        }).then((result) => {  
                          
                          if(result){
                            resp.json({ message: variableDefined.variables.record_updated, status : result });
                            return;
                          }
                          else
                            resp.json({ message: variableDefined.variables.record_update_error, status : result });
                            return;
                        })
                    }                    
              });              
            }else{
              theModel.update(getData,
                {
                  where: {
                    id: getId
                  }
                }).then((result) => {
                  if(result){
                    resp.json({ message: variableDefined.variables.record_updated, status : result });
                    return;
                  }
                  else
                    resp.json({ message: variableDefined.variables.record_update_error, status : result });
                    return;
                })
            }
          }
    });
  }   
};
/*-----------------------------------
/------------- DELETE USER ----------
/---@param: id [i.e. /user?id=]------ 
/------------------------------------
------------------------------------*/
exports.delete = function(req, resp) {
  theModel.destroy({
    where: {
      id: req.query.id
    }
  }).then((result) => {
      if(result)
        resp.json({ message: variableDefined.variables.record_deleted,'status' : result });
      else
        resp.json({ message: variableDefined.variables.record_deleted_error,'status' : result });
  })
};
