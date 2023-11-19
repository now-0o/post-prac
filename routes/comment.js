const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const { Post, Comment } = require('../models');
const sequelize = require('../config/database');
const asyncHandler = require('../utils/asyncHandler');
const HttpException = require('../HttpException');

router.post('/', asyncHandler(async (req, res) => {
    // postId에 대한 검증
    const { comment, postId } = req.body;
    if(!comment){
        throw new HttpException(400, '등록할 댓글의 내용이 없습니다.');
    }
    const result = await sequelize.transaction(async () => {
        const foundPost = await Post.findByPk(postId);

        if(!foundPost){
            throw new HttpException(400, '존재하지않는 게시글의 ID입니다.');
        }

        const savedComment = await Comment.create({
            comment,
            postId
        });

        return savedComment;
    });

    res.status(201).json(result);
}));

router.delete('/:id', asyncHandler(async (req, res)=>{
    // params.id 코드가 중복됨
    // params.id에 대한 검증 코드
    // 비구조화 할당
    const {id} = req.params;

    const result = await sequelize.transaction(async () => {
        const foundComment = await Comment.findByPk(id);

        if(!foundComment){
            throw new HttpException(400, '존재하지 않는 댓글입니다.');
        }

        const deleteComment = await Comment.destroy({
            where : {
                id
            }
        });

        return deleteComment;
    });

    res.status(204).send();
  }));

module.exports = router;