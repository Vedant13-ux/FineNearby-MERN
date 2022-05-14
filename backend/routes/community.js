const express = require('express');
const router = express.Router();
const db = require('../models');
const cloudinary = require('cloudinary');
const multer = require('multer');
cloudinary.config({
    cloud_name: 'ved13',
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});
var storage = multer.diskStorage({
    filename: function (req, file, callback) {
        callback(null, Date.now() + file.originalname);
    }
});
var imageFilter = function (req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif|mp4|flv|mov|mkv|WMV|WebM)$/i)) {
        return cb(new Error('Only media files are allowed!'), false);
    }
    cb(null, true);
};
var upload = multer({ storage: storage, fileFilter: imageFilter });


// Getting Posts
router.get('/posts/getAll/:hotel_id', (req, res, next) => {
    db.Post.find({ hotel: req.params.hotel_id }).sort({ 'created': -1 }).limit(parseInt(req.query.limit)).populate({ path: 'author', select: 'name photo email' }).populate({ path: 'comments', populate: { path: 'author', select: 'name email photo' } }).exec()
        .then(posts => {
            db.Hashtag.find({ hotel: req.params.hotel_id }).sort({ 'posts.length': -1 }).limit(5).exec()
                .then((results) => {
                    return res.send({ posts, trending: results });

                }).catch((err) => {
                    next(err);
                });
        })
        .catch(err => next(err));
});


router.get('/posts/getAllWithHashtag/:id/:hotel_id', (req, res, next) => {
    db.Hashtag.find({ name: req.params.id, hotel: req.params.hotel_id }).populate({ path: 'posts', populate: { path: 'author', select: 'name email photo' } }).populate({ path: 'posts', populate: { path: 'comments', populate: { path: 'author', select: 'name email photo' } } }).sort({ created: -1 }).exec()
        .then(data => {
            res.status(200).send(data[0].posts);
        })
        .catch(err => next(err));
});

router.get('/posts/getNext/:curId/:hotel_id', (req, res, next) => { // migth get issue here
    db.Post.find({ _id: { $gt: req.params.curId }, hotel: req.params.hotel_id }).sort({ _id: 1, created: -1 }).limit(parseInt(req.query.limit)).populate({ path: 'author', select: 'name photo email' }).populate({ path: 'comments', populate: { path: 'author', select: 'name email photo' } }).exec()
        .then(posts => {
            res.status(200).send(posts);
        })
        .catch(err => next(err))
});

router.get('/posts/:id', (req, res, next) => {
    db.Post.findById(req.params.id).populate({ path: 'author', select: 'name photo email' }).populate({ path: 'comments', populate: { path: 'author', select: 'name photo email' } })
        .then((post) => {
            if (!post) {
                return next({
                    status: 404,
                    message: "Post Not Found"
                })
            }
            res.status(200).send(post);
        })
        .catch(err => next(err))
});

router.post('/posts/create', upload.single('file'), (req, res, next) => {
    console.log(req.body)
    db.User.findById(req.body.author)
        .then((user) => {
            if (!user) {
                return next({
                    status: 404,
                    message: 'User Not Found'
                })
            }
            let hashtags = req.body.content.match(/#([0-9a-z]*)/ig);

            req.body.hashtags = hashtags;
            if (req.file) {
                cloudinary.v2.uploader.upload(req.file.path, function (err, result) {
                    if (err) {
                        return next(err);
                    }
                    req.body.image = result.secure_url;
                    req.body.imageId = result.public_id;
                    db.Post.create(req.body)
                        .then(async (newPost) => {
                            await user.posts.push(newPost);
                            await user.save();
                            res.status(200).send(newPost);
                            hashtags.forEach((e) => {
                                e = e.slice(1, e.length)
                                db.Hashtag.find({ name: e, hotel: req.body.hotel }).then(async (h) => {
                                    console.log('hashtag found')

                                    if (Object.keys(h).length > 0) {
                                        await h[0].posts.unshift(newPost);
                                        h[0].save()
                                    }
                                    else {
                                        h = await db.Hashtag.create({ name: e, posts: [newPost,], hotel: req.body.hotel });
                                        h.save()
                                    }
                                })
                            })
                        })
                        .catch(err => next(err))
                })
            } else {
                db.Post.create(req.body)
                    .then(async (newPost) => {
                        await user.posts.push(newPost);
                        await user.save();
                        res.status(200).send(newPost);
                        hashtags.forEach((e) => {
                            e = e.slice(1, e.length)
                            db.Hashtag.find({ name: e, hotel: req.body.hotel }).then(async (h) => {
                                if (Object.keys(h).length > 0) {
                                    await h[0].posts.unshift(newPost);
                                    h[0].save()
                                }
                                else {
                                    h = await db.Hashtag.create({ name: e, posts: [newPost,], hotel: req.body.hotel });
                                    h.save()
                                }
                            })
                        })
                    })
                    .catch(err => next(err))

            }
        }).catch((err) => {
            return next(err);
        });

});


router.put('/posts/edit/:id', (req, res, next) => {
    db.Post.findByIdAndUpdate(req.params.id, req.body)
        .then((edited) => {
            if (!edited) {
                return next({
                    status: 404,
                    message: 'Post Not Found'
                })
            }
            res.status(200).send(edited);
        })
});

router.post('/posts/like/:id', (req, res, next) => {
    db.Post.findById(req.params.id)
        .then(async (post) => {
            if (!post) {
                return next({
                    status: 404,
                    message: 'Post Not Found'
                })
            }
            try {
                if (post.likedBy.findIndex((u) => u == req.body.id) == -1) {
                    await post.likedBy.push(req.body.id);
                    var created = new Date();
                    await post.save()
                    return res.status(200).send(created);
                }
                return next({
                    status: 403,
                    message: 'You have already liked this post'
                });
            } catch (err) { next(err) }

        })
});


router.put('/posts/like/:id', (req, res, next) => {
    db.Post.findById(req.params.id)
        .then(async (post) => {
            if (!post) {
                return next({
                    status: 404,
                    message: 'Post Not Found'
                })
            }
            try {
                let to_remove = post.likedBy.findIndex((u) => {
                    return u == req.body.id;
                });
                if (to_remove !== -1) {
                    await post.likedBy.splice(to_remove, 1);
                    await post.save();
                    return res.status(200).send('Unliked Post');
                }

                return next({
                    status: 403,
                    message: 'You do not like this post.'
                });
            } catch (err) { next(err) }

        })
});

// Comments
router.get('/posts/comments/:id', (req, res, next) => {
    db.Post.findById(req.params.id).populate('comments').exec()
        .then((post) => {
            if (!post) {
                return next({
                    status: 404,
                    message: 'Post Not Found'
                })
            }
            res.status(200).send(post.comments);

        }).catch((err) => {
            next(err);
        });
});

router.post('/posts/comments/:id', (req, res, next) => {
    db.Post.findById(req.params.id)
        .then(async (post) => {
            if (!post) {
                return next({
                    status: 404,
                    message: 'Post Not Found'
                })
            }
            try {
                let user = await db.User.findById(req.body.id);
                if (user) {
                    commentBody = {
                        author: user,
                        text: req.body.text
                    }
                    db.Comment.create(commentBody)
                        .then(async (comment) => {
                            await post.comments.push(comment);
                            await post.save();
                            res.status(200).send(comment);
                            return;
                        }).catch((err) => {
                            return next(err);
                        });
                } else {
                    return next({
                        status: 404,
                        message: 'User Not Found'
                    })
                }
            } catch (err) { next(err) }

        })
        .catch(err => next(err));
});

router.put('/posts/comments/edit/:id', (req, res, next) => {
    db.Comment.findByIdAndUpdate(req.params.id, req.body)
        .then((comment) => {
            if (!comment) {
                next({
                    status: 404,
                    message: 'Comment Not Found'
                })
            }
            res.send(comment);
        })
        .catch((err) => {
            next(err)
        });
});
router.delete('/posts/comments/delete/:postId/:cmntId', (req, res, next) => {
    db.Post.findById(req.params.id).populate('comments')
        .then((post) => {
            if (!post) {
                return next({
                    status: 404,
                    message: 'Post Not Found'
                })
            }
            db.Comment.findByIdAndRemove(req.params.cmntId)
                .then(async (comment) => {
                    if (!comment) {
                        return next({
                            status: 404,
                            message: 'Comment Not Found'
                        })
                    }
                    const toRemove = post.comments.findIndex(cmnt => cmnt == req.params.cmntId);
                    if (toRemove != -1 && user) {
                        await post.comments.splice(toRemove, 1);
                        await post.save();
                        user.commented = user.commented.filter(p => JSON.stringify(p._id) == JSON.stringify(post._id));
                        await user.save();
                        return res.send(posts.comments);
                    }

                }).catch((err) => {
                    next(err);
                });

        }).catch((err) => {
            next(err);
        });
})


module.exports = router;



