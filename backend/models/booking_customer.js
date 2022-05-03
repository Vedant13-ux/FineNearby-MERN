const mongoose = require('mongoose');
const bookingCustomerSchema = new mongoose.Schema({
    booking: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Booking'
    }, 
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }, 
    email : String,
    status: {
        type: String,
        default: 'Pending',
        enum: ['Pending', 'Accepted', 'Rejected']
    }
})

module.exports = mongoose.model('Booking_Customer', bookingCustomerSchema);