const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const { Category } = require('../models');
const sequelize = require('../config/database');
const asyncHandler = require("../utils/asyncHandler");
const HttpException = require('../HttpException');

router.get('/', async (req, res) => {
    const categorys = await Category.findAll({
      attributes: ['id', 'category']
    });
    if(categorys.length === 0){
      throw new HttpException(404, '등록된 게시글이 없습니다.')
    }
    res.status(200).send(categorys);
  })

router.post('/', asyncHandler(async (req, res) => {
    const { category } = req.body;
    const result = await sequelize.transaction(async () => {
        const savedCategory = await Category.create({
            category
        });

        return savedCategory;
    });

    if(result === 0){
        throw new HttpException(500,'카테고리를 저장하는 중에 오류가 발생했습니다.');
    }
    res.status(201).json(result);

}));

module.exports = router;