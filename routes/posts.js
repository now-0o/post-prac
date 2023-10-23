const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const { Post } = require('../models')

router.get('/detail', async (req, res) => {
  const keyword = req.query.keyword;

  const getPost = await Post.findAll({
    attributes: ['id', 'title', 'content'],
    where: {
      [Op.or]: [
        {
          title: {
            [Op.like]: "%" + keyword + "%"
          },
        },
        {
          content: {
            [Op.like]: "%" + keyword + "%"
          },
        },
      ],
    },
  });

  if (getPost.length > 0) {
    res.status(200).send(getPost);
  } else {
    res.status(404).send("해당 키워드의 검색 결과가 없습니다.");
  }
});

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

  if(post.length > 0){
    res.status(200).send(post);
  } else {
    res.status(404).send("해당 id의 게시글이 없습니다.");
  }
});


router.post('/', async (req, res) => {
    const {title, content} = req.body;
    const savedPost = await Post.create({
      title,
      content
    })
    res.status(201).send(savedPost);
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
    res.status(200).send(post);
  }else {
    res.status(404).send("해당 id의 게시글이 없습니다.");
  }
});

router.delete('/:id', async (req, res)=>{
  const params = req.params;
  const deletePost = await Post.destroy({
    where : {
      id : params.id
    }
  });

  if(deletePost === 1){
    res.status(204).send();
  }else {
    res.status(404).send("해당 id의 게시글이 없습니다.");
  }
});

module.exports = router;