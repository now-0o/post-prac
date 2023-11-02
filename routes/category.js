const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const { Category } = require('../models');
const sequelize = require('../config/database');

router.post('/', async (req, res) => {
    const { category } = req.body;

    try {
        const result = await sequelize.transaction(async (t) => {
            const savedCategory = await Category.create({
                category
            }, { transaction: t });

            return savedCategory;
        });
        res.status(201).json(result);
    } catch (error) {
        console.error(error);
        res.status(500).send("카테고리를 저장하는 중에 오류가 발생했습니다.");
    }
});

module.exports = router;