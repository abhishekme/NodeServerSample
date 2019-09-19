'use strict'


module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('user', 'profile_pic', {
      type: Sequelize.STRING
    }).then(() => {
    console.log('Update column');
    })    
  },
  down: (queryInterface, Sequelize) => {
    return [
      queryInterface.removeColumn('user', 'profile_pic_user'),
    ];
  }
};
