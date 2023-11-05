const express = require('express');
const app = express();
const port = 3000;
app.use(express.json());
const postRouter = require('./routes/posts');
const categoryRouter = require('./routes/category');
const commentRouter = require('./routes/comment');
const HttpException = require('./HttpException');
const asyncHandler = require('./utils/asyncHandler');

const sequelize = require('./config/database');
require('./models');
sequelize.sync({
    alter: true
})

app.use('/posts', asyncHandler(postRouter));
app.use('/categorys', asyncHandler(categoryRouter));
app.use('/comments', asyncHandler(commentRouter));

app.listen(port, async () => {
  console.log(`서버가 실행됩니다. http://localhost:${port}`);
})

app.use((err, req, res, next) => {
  console.log(err);
  if(err instanceof HttpException){
    res.status(err.status).send(err.message);
    return;
  }
  res.status(500).send({
    message : "서버에러입니다."
  })
})