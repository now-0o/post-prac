const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const { Post, Hashtag, Category } = require('../models');
const sequelize = require('../config/database');
const HttpException = require('../HttpException');

router.get('/search', async (req, res) => {
  const keyword = req.query.keyword;

  const searchedPosts = await Post.findAll({
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

  if (searchedPosts.length === 0) {
    throw new HttpException(404, '해당 키워드의 검색결과가 없습니다.');
  }
  res.status(200).send(searchedPosts);
});

router.get('/', async (req, res) => {
  const posts = await Post.findAll({
    attributes: ['id', 'title', 'content', 'createdAt']
  });
  if(posts.length === 0){
    throw new HttpException(404, '등록된 게시글이 없습니다.')
  }
  res.status(200).send(posts);
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

  if(post === null){
    throw new HttpException(404, '해당 id의 게시글이 없습니다.');
  } 
  res.status(200).send(post);
});

router.get('/category/:id', async (req, res) => {
  try {
    const params = req.params;

    const categoryData = await Category.findByPk(params.id);

    if (!categoryData) {
      throw new HttpException(404, '등록되지 않은 카테고리입니다.');
    }

    const posts = await Post.findAll({
      attributes: ['id', 'title', 'content', 'createdAt'],
      where: {
        categoryId: params.id,
      },
      include: {
        model: Category,
        attributes: ['category'],
      },
    });

    res.status(200).send(posts);
  } catch (error) {
    res.status(error.status || 500).send(error.message || '서버 오류');
  }
});


router.post('/', async (req, res) => {
  const { title, content, category, hashtags } = req.body;

  try {
    const result = await sequelize.transaction(async () => {
      const savedPost = await Post.create({
        title,
        content,
        categoryId: category
      });

      if (hashtags && hashtags.length > 0) {
        for (const hashtag of hashtags) {
          const [hashtagData, created] = await Hashtag.findOrCreate({
            where: {
              hashtag
            }
          });

          await savedPost.addHashtags([hashtagData]); // addHashtags 메서드를 사용하여 연결

          if (created) {
            console.log(`새로운 해시태그 생성: ${hashtag}`);
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
    const result = await sequelize.transaction(async () => {
      const updatePost = await Post.update({
        title,
        content
      }, {
        where : {
          id : params.id
        }
      });

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