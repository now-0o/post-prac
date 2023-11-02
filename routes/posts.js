const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const { Post, Hashtag, Category } = require('../models');
const sequelize = require('../config/database');

router.get('/search', async (req, res) => {
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
    attributes: ['id', 'title', 'content', 'createdAt']
   });
  res.status(200).send(post);
})

router.get('/:id', async (req, res) => {
  const params = req.params;

  const post = await Post.findOne({
    attributes: ['id', 'title', 'content'],
    where: {
      id: params.id
    },
    include: {
      model: Category,
      attributes: ['category']
    },
    include: {
      model: Hashtag,
      attributes: ['hashtag'], 
      through: { attributes: [] }
    }
  });

  if(post != null){
    res.status(200).send(post);
  } else {
    res.status(404).send("해당 id의 게시글이 없습니다.");
  }
});

router.get('/category/:id', async (req, res) => {
  const params = req.params;

  const categoryData = await Category.findByPk(params.id);

  if(categoryData){
    const post = await Post.findAll({
      attributes: ['id', 'title', 'content', 'createdAt'],
      include: {
        model: Category,
        attributes: ['category'],
        where : {
          id : params.id
        }
      }
    });
    res.status(200).send(post);
  }else {
    res.status(404).send("등록되지 않은 카테고리입니다.");
  }
});

router.post('/', async (req, res) => {
  const { title, content, category, hashtags } = req.body;

  try {
    const result = await sequelize.transaction(async (t) => {
      const savedPost = await Post.create({
        title,
        content,
        categoryId: category
      }, { transaction: t });

      if (hashtag && hashtag.length > 0) {
        for (const hashtag of hashtags) {
          const hashtagData = await Hashtag.findOne({
            where : {
              hashtag
            }
          });

          if (hashtagData) {
            await savedPost.addHashtags(hashtagData, { transaction: t });
          } else {
            
          }
        }
      }

      return savedPost;
    });

    res.status(201).json(result);
  } catch (error) {
    console.error(error);
    res.status(500).send("게시물을 저장하는 중에 오류가 발생했습니다.");
  }
});


router.put('/:id', async (req, res) => {
  const params = req.params;
  const { title, content} = req.body;
  try {
    const result = await sequelize.transaction(async (t) => {
      const updatePost = await Post.update({
        title,
        content
      }, {
        where : {
          id : params.id
        }
      }, { transaction: t });

      const post = await Post.findOne({
        attributes: ['id', 'title', 'content'],
        where: {
          id: params.id
        },
        include: {
          model: Category,
          attributes: ['category']
        },
        include: {
          model: Hashtag,
          attributes: ['hashtag'], 
          through: { attributes: [] }
        }
      }, { transaction: t });

      return post
    })

    if(result!=null){
      res.status(200).send(result);
    }else {
      res.status(404).send("해당 id의 게시글이 없습니다.");
    }
  }catch (error) {
    console.error(error);
    res.status(500).send("게시물을 수정하는 중에 오류가 발생했습니다.");
  }
});

router.delete('/:id', async (req, res)=>{
  const params = req.params;
  const deletePost = await Post.destroy({
    where : {
      id : params.id
    }
  });

  if(deletePost === 1) {
    res.status(204).send();
  } else {
    res.status(404).send("해당 id의 게시글이 없습니다.");
  }
});

module.exports = router;