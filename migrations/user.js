'use strict'


module.exports = {  
  up: async (queryInterface, Sequelize) => {
    try {
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
      queryInterface.removeColumn('user', 'status'),
    ];
  }
};
