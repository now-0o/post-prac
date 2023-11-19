const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const { Post, Hashtag, Category, Comment } = require('../models');
const sequelize = require('../config/database');
const HttpException = require('../HttpException');
const asyncHandler = require('../utils/asyncHandler');

router.get('/search', asyncHandler(async (req, res) => {
  // 비구조화할당 
  const {keyword} = req.query;
  
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
  // 비구조화할당
  // params.id에 대한 검증
  const {id} = req.params;

  // 변수명에 Data라는 키워드를 잘 안 씀
  const category= await Category.findByPk(id);

  if (!category) {
    throw new HttpException(404, '등록되지 않은 카테고리입니다.');
  }

  const posts = await Post.findAll({
    attributes: ['id', 'title', 'content', 'createdAt'],
    where: {
      categoryId: id,
    },
    include: {
      model: Category,
      attributes: ['category'],
    },
  });

  res.status(200).send(posts);
}));


router.get('/hashtag/:id', asyncHandler(async (req, res) => {
  // 비구조화할당
  // params.id에 대한 검증
const {id} = req.params;

// Data 변수
const hashtag = await Hashtag.findByPk(id);

if (!hashtag) {
  throw new HttpException(404, '등록되지 않은 해시태그입니다.');
}

const posts = await Post.findAll({
  attributes: ['id', 'title', 'content'],
  include: [
    {
      model: Hashtag,
      where: {
        id,
      },
      attributes: [], // 이 코드를 남겨둔 이유 ?
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
  // 비구조화할당
  // 검증
  const {id} = req.params;

  const post = await Post.findOne({
    attributes: ['id', 'title', 'content'],
    where: {
      id
    },
    include: {
      model: Category,
      attributes: ['category']
    },
    include: {
      model: Hashtag,
      attributes: ['hashtag']
    }
  });

  if(!post){
    throw new HttpException(404, '존재하지 않는 게시글입니다.');
  }

  res.status(200).send(post);
}));

router.post('/', asyncHandler(async (req, res) => {
  const { title, content, category, hashtags } = req.body;

  if(!title){
    throw new HttpException(400, '등록할 게시글의 제목은 빈 값일 수 없습니다.');
  }
  if(typeof title !== 'string') {
    throw new HttpException(400, '등록할 게시글의 제목은 문자여야만 합니다.');
  }
  if(!content){
    throw new HttpException(400, '등록할 게시글의 내용은 빈 값일 수 없습니다.');
  }
  if(typeof content !== 'string') {
    throw new HttpException(400, '등록할 게시글의 내용은 문자여야만 합니다.');
  }
  if(!category){
    throw new HttpException(400, '등록할 게시글의 카테고리는 빈 값일 수 없습니다.');
  }
  if(typeof category !== 'string') {
    throw new HttpException(400, '등록할 게시글의 카테고리는 문자여야만 합니다.');
  }

  const result = await sequelize.transaction(async () => {
    const foundCategory = await Category.findByPk(category);
    
    if(!foundCategory){
      throw new HttpException(400, '존재하지 않는 카테고리입니다.');
    }

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

        await savedPost.addHashtags([hashtagData]);

        if (created) {
          console.log(`새로운 해시태그 생성: ${hashtag}`);
        }
      }
    }

    return savedPost;
  });

  res.status(201).json(result);
}));


router.put('/:id', asyncHandler(async (req, res) => {
  const {id} = req.params;
  const {title, content} = req.body;

  if(!title){
    throw new HttpException(400, '수정할 게시글 제목은 빈 값일 수 없습니다.');
  }
  if(!content){
    throw new HttpException(400, '수정할 게시글 내용은 빈 값일 수 없습니다.');
  }

  const result = await sequelize.transaction(async () => {
    const foundPost = await Post.findByPk(id);

    if(!foundPost){
      throw new HttpException(400, '존재하지 않는 게시글입니다.');
    }

    const updatePost = await Post.update({
      title,
      content
    }, {
      where : {
        id
      }
    });

    const post = await Post.findOne({
      attributes: ['id', 'title', 'content'],
      where: {
        id
      },
      include: {
        model: Category,
        attributes: ['category']
      },
      include: {
        model: Hashtag,
        attributes: ['hashtag']
      }
    });

    return post;
  })

  res.status(200).send(result);
}));

router.delete('/:id', async (req, res)=>{
  const {id} = req.params;
  const result = await sequelize.transaction(async () => {
    const foundPost = await Post.findByPk(id);

    if(!foundPost){
      throw new HttpException(400, '존재하지 않는 게시글입니다.');
    }

    const deleteComment = await Comment.destroy({
      where : {
        postId : id
      }
    })

    const deletePost = await Post.destroy({
      where : {
        id
      }
    });
    return deletePost;
  })

  res.status(204).send();
});

module.exports = router;