const mongoose = require('mongoose');
const hotelSchema = new mongoose.Schema({
    name: String,
    image: String,
    created: {
        type: Date,
        default: Date.now
    },
    secretToken: String,
    address: {
        street: String,
        city: String,
        state: String,
        zip: String
    },
    customers: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    ],
    services: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Service'
        }
    ]
});


module.exports = mongoose.model('Hotel', hotelSchema);