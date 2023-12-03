const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const { Payment } = require('../models');
const sequelize = require('../config/database');
const asyncHandler = require('../utils/asyncHandler');
const HttpException = require('../HttpException');

router.post('/', asyncHandler(async (req, res) => {
    const { payment } = req.body;

    const result = await sequelize.transaction(async () => {

        const savedPayment = await Payment.create({
            payment
        });

        return savedPayment;
    });

    res.status(201).json(result);
})); // 결제 대기 데이터 제작을 위한 임시 API

router.put('/:id', asyncHandler(async (req, res) => {
    const { id } = req.params;
    const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    const result = await sequelize.transaction(async () => {
        const foundPayment = await Payment.findByPk(id);
        
        await wait(10000);
        if(!foundPayment){
            throw new HttpException(400, '존재하지않는 결제 ID입니다.');
        }
        
        if(foundPayment.dataValues.payment === "대기"){

            const updatedPayment = await Payment.update({
                payment : "결제완료"
            }, {
                where : {
                id
                }
            });

            return {updatedResult : updatedPayment, message : "결제가 완료되었습니다."};
        }

        return {updatedResult : "", message : "이미 결제가 완료된 항목입니다."};
    })
    console.log(result.updatedResult);
    res.status(200).send(result);
}));

module.exports = router;