const {DataTypes} = require("sequelize");
const sequelize = require('../config/database');

const Category = sequelize.define('categorys',{
    id: {
        autoIncrement : true,
        primaryKey : true,
        type : DataTypes.INTEGER
    }, category : {
        type : DataTypes.STRING
    }
})

module.exports = Category;