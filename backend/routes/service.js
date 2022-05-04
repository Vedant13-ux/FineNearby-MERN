const express = require('express');
const router = express.Router();
const db = require('../models');

// Get Hotel Services 
router.get('/get/:hotel_id', (req, res, next) => {
    db.Service.find({ hotel: req.params.hotel_id })
        .then(services => {
            res.status(200).send(services)
        })
        .catch(err => {
            next(err)
        })
})

// Book a Service by Customer
router.post('/bookservice', async (req, res, next) => {
    var sharedBy = req.body.sharedBy

    req.body.sharedBy = []

    db.ServiceBooking.create(req.body)
        .then(async booking => {
            try {
                // Service Owner Booking
                var owner = await db.User.findById(req.body.owner).populate('bookings').exec()
                var owner_booking_data = {
                    booking: booking._id,
                    customer: owner._id,
                    status: 'Accepted',
                    email: owner.email
                }
                var owner_booking = await db.Booking_Customer.create(owner_booking_data)
                await owner.bookings.push(owner_booking)
                await owner.save()


                // SharedBy Customers Booking
                for (let i = 0; i < sharedBy.length; i++) {
                    var cust = await db.User.findOne({ 'email': sharedBy[i] }).populate('bookings').exec()
                    var cust_booking_data = {
                        booking: booking._id,
                        customer: cust._id,
                        status: 'Pending',
                        email: customer
                    }
                    var cust_booking = await db.Booking_Customer.create(cust_booking_data)
                    await cust.bookings.push(cust_booking)
                    await booking.serviceSharedBy.push(cust_booking)
                    await cust.save()
                }

                await booking.save()
                res.status(200).send("Booking Confirmed")

            } catch (err) {
                next(err)
            }
        })
        .catch(err => {
            next(err)
        })
})

// Change Status of Booking
router.post('/changestatus', async (req, res, next) => {
    try {
        customer_booking = await db.Booking_Customer.findById(req.body.booking_id)
        customer_booking.status = req.body.status
        customer_booking.save()
        res.status(200).send("Status Changed")
    } catch (err) {
        next(err)
    }
})

// Get Bookings of Customer
router.get('/getcustomerbooking/:customer_id/:status', async (req, res, next) => {
    try {
        var bookings = await db.Booking_Customer.find({ customer: req.params.customer_id, status: req.params.status }).populate({ path: 'booking', populate: 'service serviceSharedBy' }).exec()
        res.status(200).send(bookings)
    } catch (err) {
        next(err)
    }
})

// Get Service Info and Customer Emails
router.get('/getserviceinfo/:service_id', async (req, res, next) => {
    db.Service.findById(req.params.service_id)
        .then(service => {
            var customers = db.User.find({ hotel: service.hotel })
            var emails = []
            for (var i = 0; i < customers.length; i++) {
                emails.push(customers[i].email)
            }
            resBody = {
                emails,
                service
            }
            res.status(200).send(resBody)
        }
        ).catch(err => {
            next(err)
        })
})


module.exports = router;
