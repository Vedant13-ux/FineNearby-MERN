const express = require('express');
const router = express.Router();
const db = require('../models');
const cloudinary = require('cloudinary');
const multer = require('multer');
const crypto = require('crypto');
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
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
};
var upload = multer({ storage: storage, fileFilter: imageFilter });



function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
}


// Add New Hotel
router.post('/add/:admin_secret', (req, res, next) => {
    if (process.env.SECRET_KEY === req.params.admin_secret) {
        var services = req.body.services;
        req.body.services = []

        db.Hotel.create(req.body)
            .then(hotel => {
                services.forEach(service => {
                    db.Service.create({
                        name: service.name,
                        description: service.description,
                        price: service.price,
                        hotel: hotel._id
                    })
                        .then(service => {
                            hotel.services.push(service._id)
                            hotel.save()

                        })
                        .catch(err => {
                            next(err)
                        })
                })
                res.status(200).send(hotel)
            }).catch(err => {
                next(err)
            })
    } else {
        return next({
            status: 401,
            message: 'Unauthorized'
        })
    }
})

// Delete Customer 
router.post('/addcustomer/:hotel_id', (req, res, next) => {
    
})