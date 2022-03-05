// Dependencies
const Sequelize = require('sequelize');
const connection = require('../database/connection');

const Budget = connection.define('budgets', {
    type: {
        type: Sequelize.STRING,
        allowNull: false
    },
    quantity: {
        type: Sequelize.STRING,
        allowNull: false
    }
});

Budget.sync({ force: false })
    .then(() => console.log('Tabela de Orçamento criada!'))
    .catch(err => console.log(err));

module.exports = Budget;