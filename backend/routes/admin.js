const express = require('express');
const router = express.Router();
const db = require('../models');
const crypto = require('crypto');


// Get Hotel Info
router.get('/info/:admin_secret/:hotel_id', (req, res, next) => {
    if (process.env.SECRET_KEY === req.headers.admin_secret) {
        db.Hotel.findById(req.params.hotel_id)
            .then(hotel => {
                return res.status(200).send(hotel)
            }
            ).catch(err => {
                next(err)
            })
    } else {
        return next({
            status: 401,
            message: 'Unauthorized'
        })
    }
})

// Add New Hotel
router.post('/add', (req, res, next) => {
    if (process.env.SECRET_KEY === req.headers.admin_secret) {
        var secretToken = crypto.randomBytes(64).toString('hex');
        console.log(req.body)
        req.body.secretToken = secretToken;
        var services = req.body.services;
        req.body.services = []

        db.Hotel.create(req.body)
            .then(async hotel => {
                try {

                    for (let i = 0; i < services.length; i++) {
                        var service = await db.Service.create({
                            "name": services[i].name,
                            "description": services[i].description,
                            "price": services[i].price,
                            "hotel": hotel._id
                        })
                        await hotel.services.push(service)
                    }
                    await hotel.save()
                    return res.status(200).send(hotel)

                } catch (err) {
                    next(err)
                }
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
// router.post('/addcustomer/:hotel_id', (req, res, next) => {

// })

module.exports = router
