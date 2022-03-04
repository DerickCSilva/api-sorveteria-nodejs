// Dependencies
const Sequelize = require('sequelize');
const connection = require('../database/connection');

const IceCream = connection.define('icecreams', {
    flavor: {
        type: Sequelize.STRING,
        allowNull: false
    },
    type: {
        type: Sequelize.STRING,
        allowNull: false
    },
    description: {
        type: Sequelize.STRING,
        allowNull: false
    },
    quantity: {
        type: Sequelize.STRING,
        allowNull: false
    },
    value: {
        type: Sequelize.STRING,
        allowNull: false
    },
    url: {
        type: Sequelize.STRING,
        allowNull: false
    }
});

IceCream.sync({ force: false })
    .then(() => console.log('Tabela de Sorvetes criada!'))
    .catch(err => console.log(err));

module.exports = IceCream;