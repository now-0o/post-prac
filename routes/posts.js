const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const { Post, Hashtag, Category, Comment } = require('../models');
const sequelize = require('../config/database');
const HttpException = require('../HttpException');
const asyncHandler = require('../utils/asyncHandler');

router.get('/search', asyncHandler(async (req, res) => {
  const keyword = req.query.keyword;
  
  if(!keyword){
    throw new HttpException(400, '검색할 키워드가 없습니다.')
  }

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

  res.status(200).send(searchedPosts);
}));

router.get('/category/:id', asyncHandler(async (req, res) => {
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
}));


router.get('/hashtag/:id', asyncHandler(async (req, res) => {
const params = req.params;

const hashtagData = await Hashtag.findByPk(params.id);

if (!hashtagData) {
  throw new HttpException(404, '등록되지 않은 해시태그입니다.');
}

const posts = await Post.findAll({
  attributes: ['id', 'title', 'content'],
  include: [
    {
      model: Hashtag,
      where: {
        id: params.id,
      },
      attributes: [],
      through: { attributes: [] },
    },
  ],
});

res.status(200).send(posts);
}));

router.get('/', asyncHandler(async (req, res) => {
  const posts = await Post.findAll({
    attributes: ['id', 'title', 'content', 'createdAt']
  });
  res.status(200).send(posts);
}))

router.get('/:id', asyncHandler(async (req, res) => {
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

  if(!post){
    throw new HttpException(404, '존재하지 않는 게시글입니다.');
  }

  res.status(200).send(post);
}));

router.post('/', asyncHandler(async (req, res) => {
  const { title, content, category, hashtags } = req.body;

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

  if(result.length === 0){
    throw new HttpException(500, '게시글을 저장하는 중에 오류가 발생했습니다.');
  }
  res.status(201).json(result);
}));


router.put('/:id', asyncHandler(async (req, res) => {
  const params = req.params;
  const { title, content} = req.body;
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

  if(result===null){
    throw new HttpException(404,'해당 id의 게시글이 없습니다.');
  }
  res.status(200).send(result);
}));

router.delete('/:id', async (req, res)=>{
  const params = req.params;
  const result = await sequelize.transaction(async () => {
    const deleteComment = await Comment.destroy({
      where : {
        postId : params.id
      }
    })

    const deletePost = await Post.destroy({
      where : {
        id : params.id
      }
    });
    return deletePost;
  })
  if(result === 0) {
    throw new HttpException(404, '해당 id의 게시글이 없습니다.');
  } 
  res.status(204).send();
});

module.exports = router;