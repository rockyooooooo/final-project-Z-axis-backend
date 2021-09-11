'use strict'

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('issues', 'userId', {
      type: Sequelize.INTEGER,
      allowNull: false,
      reference: {
        model: 'Users',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    })
    await queryInterface.addColumn('comments', 'issueId', {
      type: Sequelize.INTEGER,
      allowNull: false,
      reference: {
        model: 'Issues',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    })
    await queryInterface.addColumn('comments', 'guestToken', {
      type: Sequelize.STRING,
      allowNull: false,
      reference: {
        model: 'Guests',
        key: 'guestToken'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    })
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('issues', 'userId')
    await queryInterface.removeColumn('comments', 'issueId')
    await queryInterface.removeColumn('comments', 'guestToken')
  }
}
