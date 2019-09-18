'use strict'

module.exports = (sequelize, DataTypes) => {
  
  const Employee = sequelize.define('employee', {
      id: {
        type: DataTypes.INTEGER(11),
        allowNull: true,
        primaryKey: true,
        autoIncrement: true
      },
      first_name: DataTypes.STRING,
      last_name: DataTypes.STRING,
      email: DataTypes.STRING,
      address: DataTypes.STRING,
      designation: DataTypes.STRING,
      city: DataTypes.STRING,
    },
    {
      freezeTableName: true,
    });  
 return Employee;  
}
