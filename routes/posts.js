const express = require('express');
const router = express.Router();
const { Post } = require('../models')

router.get('/', async (req, res) => {
   const post = await Post.findAll({
    attributes: ['id', 'title', 'content']
   });
  res.status(200).send(post);
})

router.get('/:id', async (req, res) => {
  const params = req.params;

  const post = await Post.findAll({
   attributes: ['id', 'title', 'content'],
   where : {
    id : params.id
   }
  });

  if(post.length>0){
    res.status(200).send(post);
  }else {
    res.status(404).send("해당 id의 게시글이 없습니다.");
  }
})

router.post('/', async (req, res) => {
    const {title, content} = req.body;
    const savedPost = await Post.create({
      title,
      content
    })
    res.status(201).send(savedPost);
  })

  module.exports = router;