const {DataTypes} = require("sequelize");
const sequelize = require('../config/database');

const Payment = sequelize.define('payment',{
    id: {
        autoIncrement : true,
        primaryKey : true,
        type : DataTypes.INTEGER
    }, payment : {
        type : DataTypes.STRING
    }
})

module.exports = Payment;