const express = require('express');
const router = express.Router();
const db = require('../models');

// Get User Profile
router.get('/profile/:user_id', (req, res) => {
    db.User.findById(req.params.user_id).populate('hotel', 'image name address').exec()
        .then(user => {
            res.json(user);
        }
        )
        .catch(err => {
            res.send(err);
        });
})

// Get USer Posts
router.get('/getUsersPosts/:userId', async (req, res, next) => {
    db.User.findById(req.params.userId).populate("posts").populate({ path: "posts", populate: { path: 'comments', populate: { path: 'author', select: 'name email photo _id' } } })
        .then(async (user) => {
            if (!user) {
                return next({
                    status: 404,
                    message: "User Not Found"
                })
            }
            try {
                res.status(200).send({ posts: user.posts })
            } catch (err) {
                next(err);
            }
        }).catch((err) => {
            next(err);
        });
})

module.exports = router
