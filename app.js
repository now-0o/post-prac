const express = require('express');
const app = express();
const port = 3000;
app.use(express.json());
const postRouter = require('./routes/posts')

const sequelize = require('./config/database');
require('./models');
sequelize.sync({
    force: false
})

app.use('/posts', postRouter)

app.listen(port, async () => {
  console.log(`서버가 실행됩니다. http://localhost:${port}`);
})