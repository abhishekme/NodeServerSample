'use strict'


module.exports = {  
  up: async (queryInterface, Sequelize) => {
    try {
      await queryInterface.addColumn('user', 'profile_pic', {
        type: Sequelize.STRING,
        after: "email"
      });
      await queryInterface.addColumn('user', 'status', {
        type: Sequelize.INTEGER,
        after: "email"
      });
      return Promise.resolve();
    } catch (e) {
      return Promise.reject(e);
    }
  },
  down: (queryInterface, Sequelize) => {
    return [
      queryInterface.removeColumn('user', 'profile_pic'),
      queryInterface.removeColumn('user', 'status'),
    ];
  }
};
