const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const { Comment } = require('../models');
const sequelize = require('../config/database');

router.post('/', async (req, res) => {
    const { comment, postId } = req.body;

    try {
        const result = await sequelize.transaction(async () => {
            const savedComment = await Comment.create({
                comment,
                postId
            });

            return savedComment;
        });
        res.status(201).json(result);
    } catch (error) {
        console.error(error);
        res.status(500).send("댓글을 저장하는 중에 오류가 발생했습니다.");
    }
});

router.delete('/:id', async (req, res)=>{
    const params = req.params;

    try {
        const result = await sequelize.transaction(async () => {
            const deletePost = await Comment.destroy({
                where : {
                    id : params.id
                }
            });

            return deletePost;
        });
        if(result === 0) {
            res.status(404).send("해당 id의 댓글이 없습니다.");
            return;
        } 
        res.status(204).send();
    } catch (error) {
        console.error(error);
        res.status(500).send("댓글을 삭제하는 중에 오류가 발생했습니다.");
    }
  });

module.exports = router;