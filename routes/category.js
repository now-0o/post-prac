const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const { Category } = require('../models');
const sequelize = require('../config/database');
const asyncHandler = require("../utils/asyncHandler");
const HttpException = require('../HttpException');

router.get('/', async (req, res) => {
    const categories = await Category.findAll({
      attributes: ['id', 'category']
    });

    if(categories.length === 0){
      console.log(categorys.length);
      throw new HttpException(404, '등록된 카테고리가 없습니다.')
    }
    res.status(200).send(categories);
  })

router.post('/', asyncHandler(async (req, res) => {
    const { category } = req.body;
    if (!category) {
      throw new HttpException(400,'카테고리명은 빈 값일 수 없습니다.');
    }
    const result = await sequelize.transaction(async () => {
        const foundCategory = await Category.findOne({
          attributes : ['id','category'],
          where: {
            category
          }
        })

        if(foundCategory !== null){
          throw new HttpException(409,'이미 존재하는 카테고리 입니다.');
        }
        const savedCategory = await Category.create({
            category
        });

        return savedCategory;
    });

    res.status(201).json(result);
}));

module.exports = router;