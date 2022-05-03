const mongoose = require('mongoose');
const serviceSchema = new mongoose.Schema({
    hotel: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Hotel'
    },
    name: {
        type: String,
        required: true,
    },
    description: String,
    price: Number,
});
module.exports = mongoose.model('Service', serviceSchema);
