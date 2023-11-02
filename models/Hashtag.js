const {DataTypes, Model} = require("sequelize");
const sequelize = require('../config/database');

const Hashtag = sequelize.define('hashtags',{
    id : {
        autoIncrement : true,
        primaryKey : true,
        type : DataTypes.INTEGER
    },
    hashtag : {
        type: DataTypes.STRING
    }
})

module.exports = Hashtag;