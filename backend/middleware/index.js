// require('dotenv').load();
const jwt = require('jsonwebtoken');
const db = require('../models');
exports.loginRequired = function (req, res, next) {
    try {
        let token = req.headers.authorization.split(' ')[1];
        jwt.verify(token, process.env.SECRET_KEY, function (err, decoded) {
            if (err) {
                return next(err)
            }
            if (decoded) {
                return next();
            } else {
                return next({
                    status: 401,
                    message: 'Please Log in first'
                })
            }
        })
    } catch (err) {
        next({
            status: 401,
            message: 'Please Log in first'
        });
    }
}

exports.ensureCorrectUser = function (req, res, next) {
    try {
        const token = req.headers.authorization.split(' ')[1];
        jwt.verify(token, process.env.SECRET_KEY, function (err, decoded) {
            if (decoded && (decoded._id === req.params.secureId)) {
                return next();
            } else {
                return next({
                    status: 401,
                    message: 'Unauthorized'
                })
            }
        })
    } catch (err) {
        next({
            status: 401,
            message: 'Unauthorized'
        });
    }
}

exports.correctAccess = function (req, res, next) {
    if (req.params.secureId === req.params.id) {
        next()
    } else {
        next({
            status: 403,
            message: 'Permission Denied'
        })
    }
}

exports.checkHotelSecret = function (req, res, next) {
    const secretToken = req.headers.api_key    
    console.log(secretToken,req.params.hotel_id )
    db.Hotel.findOne({
        _id: req.params.hotel_id,
        secretToken
    })
        .then(hotel => {
            if (hotel) {
                return next();
            } else {
                return next({
                    status: 401,
                    message: 'Unauthorized'
                })
            }
        })
        .catch(err => {
            next(err)
        })
}

