'use strict'

const Promise = require("bluebird");
const bcrypt = Promise.promisifyAll(require('bcrypt-nodejs'));

module.exports = (sequelize, DataTypes) => {
  
  const User = sequelize.define('user', {
      id: {
        type: DataTypes.INTEGER(11),
        allowNull: true,
        primaryKey: true,
        autoIncrement: true
      },
      first_name: DataTypes.STRING,
      password: DataTypes.STRING,
      last_name: DataTypes.STRING,
      email: DataTypes.STRING,
      status: DataTypes.BIGINT(11),
      username: DataTypes.STRING,
      address: DataTypes.STRING,
      city: DataTypes.STRING,
      filename: DataTypes.STRING,
      profile_pic: DataTypes.TEXT
    },
    /*{
      classMethods: {
        associate: function(models) {
          // associations can be defined here for relationship
        }
      }
    },*/
    {
      freezeTableName: true,
    });

  // checking if password is valid
  User.validPassword = function(password, localPassword) {
    return bcrypt.compareSync(password, localPassword);
 }  
 return User;  
}
