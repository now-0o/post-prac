const express = require('express');
const router = express.Router();
const { Post } = require('../models')

router.get('/', async (req, res) => {
   const post = await Post.findAll({
    attributes: ['id', 'title', 'content']
   });

   const message = {success : "success", data : post};

  res.status(200).send(message);
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
    const message = {success : "success", data : post};

    res.status(200).send(message);
  }else {
    const message = {success : "fail", message : "해당 id의 게시글이 없습니다."};

    res.status(404).send(message);
  }
})

router.post('/', async (req, res) => {
    const {title, content} = req.body;
    const savedPost = await Post.create({
      title,
      content
    })
    const message = {success : "success", data : savedPost};
    res.status(201).send(message);
  })

router.patch('/:id', async (req, res) => {
  const params = req.params;
  const {title, content} = req.body;
  const updatePost = await Post.update({
    title,
    content
  }, {
    where : {
      id : params.id
    }
  });

  const post = await Post.findAll({
    attributes: ['id', 'title', 'content'],
    where : {
     id : params.id
    }
   });

  if(updatePost.length>0){
    const message = {success : "success", data : post};
    res.status(200).send(post);
  }else {
    const message = {success : "fail", message : "해당 id의 게시글이 없습니다."};
    res.status(404).send("해당 id의 게시글이 없습니다.");
  }
});

  module.exports = router;