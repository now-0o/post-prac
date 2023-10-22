const express = require('express');
const router = express.Router();
const { Post } = require('../models')

router.post('/', async (req, res) => {
    const {title, content} = req.body;
    const savedPost = await Post.create({
      title,
      content
    })
    res.status(201).send(savedPost);
  })

  module.exports = router;