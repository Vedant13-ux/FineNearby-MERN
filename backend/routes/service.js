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
        .then(booking => {
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
                owner.bookings.push(owner_booking)
                booking.serviceSharedBy.push(owner_booking)
                owner.save()

                // SharedBy Customers Booking
                sharedBy.array.forEach(customer => {
                    var cust = await db.User.findOne({ 'email': customer }).populate('bookings').exec()
                    var cust_booking_data = {
                        booking: booking._id,
                        customer: cust._id,
                        status: 'Pending', 
                        email: customer
                    }
                    var cust_booking = await db.Booking_Customer.create(cust_booking_data)
                    cust.bookings.push(cust_booking)
                    booking.serviceSharedBy.push(cust_booking)
                    cust.save()
                });

                booking.save()
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
        var customer = await db.User.findById(req.params.customer_id).populate({path:'bookings', populate: {path: 'booking', populate: 'service serviceSharedBy'} })
        var accepted_booking = customer.bookings.filter(booking => {
            return booking.status === req.params.status
        })
        res.status(200).send(accepted_booking)
    } catch (err) {
        next(err)
    }
})

