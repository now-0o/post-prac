const {DataTypes} = require("sequelize");
const sequelize = require('../config/database');

const Comment = sequelize.define('comments',{
    id: {
        autoIncrement : true,
        primaryKey : true,
        type : DataTypes.INTEGER
    }, comment : {
        type : DataTypes.STRING
    }
})

module.exports = Comment;