const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const { Comment } = require('../models');
const sequelize = require('../config/database');
const asyncHandler = require('../utils/asyncHandler');
const HttpException = require('../HttpException');

router.post('/', asyncHandler(async (req, res) => {
    const { comment, postId } = req.body;
    const result = await sequelize.transaction(async () => {
        const savedComment = await Comment.create({
            comment,
            postId
        });

        return savedComment;
    });

    if(result.length === 0){
        throw new HttpException(500, '댓글을 저장하는 중에 오류가 발생했습니다.');
    }
    res.status(201).json(result);
}));

router.delete('/:id', asyncHandler(async (req, res)=>{
    const params = req.params;

    const result = await sequelize.transaction(async () => {
        const deletePost = await Comment.destroy({
            where : {
                id : params.id
            }
        });

        return deletePost;
    });
    if(result === 0) {
        throw new HttpException(404, '해당 id의 댓글이 없습니다.');
    } 
    res.status(204).send();
  }));

module.exports = router;