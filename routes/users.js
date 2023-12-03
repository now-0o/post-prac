const express = require("express");
const router = express.Router();
const { User } = require("../models/index")
const authenticateToken = require('../middlewares/authenticateToken');
const asyncHandler = require("../utils/asyncHandler");

router.get('/me', authenticateToken, asyncHandler( async (req, res)=> {
    const userId = req.user.id;
    const foundUser = await User.findByPk(userId);

    res.status(200).send({
        id : foundUser.id,
        email : foundUser.email,
        createdTime : foundUser.createdAt
    });
}));

module.exports = router;