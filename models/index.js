const Post = require('./Post');
const Category = require('./Category');
const Hashtag = require('./Hashtag');
const Comment = require('./Comment');
const Payment = require('./Payment');

Category.hasMany(Post);
Post.belongsTo(Category);

Post.belongsToMany(Hashtag, {through : "post_hashtag"});
Hashtag.belongsToMany(Post, {through : "post_hashtag"});

Post.hasMany(Comment);
Comment.belongsTo(Post);


module.exports = {
    Post,
    Category,
    Hashtag,
    Comment,
    Payment
}