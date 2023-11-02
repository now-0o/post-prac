const express = require('express');
const app = express();
const port = 3000;
app.use(express.json());
const postRouter = require('./routes/posts');
const categoryRouter = require('./routes/category');
const commentRouter = require('./routes/comment');

const sequelize = require('./config/database');
require('./models');
sequelize.sync({
    alter: true
})

app.use('/posts', postRouter)
app.use('/categorys', categoryRouter);
app.use('/comments', commentRouter);

app.listen(port, async () => {
  console.log(`서버가 실행됩니다. http://localhost:${port}`);
})