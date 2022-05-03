const mongoose = require('mongoose')
const db = require('../models/index');
const router = require('express').Router()
const { loginRequired, ensureCorrectUser, correctAccess } = require('../middleware/index')

// Get user by id
router.get('/api/:secureId/user/:id', loginRequired, ensureCorrectUser, correctAccess, (req, res, next) => {
    db.User.findById(req.params.id, '-password')
        .then((user) => {
            if (user) {
                return res.status(200).send(user);
            } else {
                next({
                    status: 404,
                    message: 'User Not Found'
                })
            }
        }).catch((err) => {
            next(err);
        });
});

module.exports = router