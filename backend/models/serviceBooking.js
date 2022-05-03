const mongoose = require('mongoose');
const bookingSchema = new mongoose.Schema({
    hotel: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Hotel'
    },
    service: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Service'
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    ownerEmail: String,
    serviceSharedBy: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Booking_Customer'
        }
    ],
    date: String,
    time: String
});

module.exports = mongoose.model('Booking', bookingSchema);
