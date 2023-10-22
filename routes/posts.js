const express = require('express');
const router = express.Router();
const { Post } = require('../models')

router.get('/', async (req, res) => {
   const post = await Post.findAll({
    attributes: ['id', 'title', 'content']
   });
  res.status(200).send(post);
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