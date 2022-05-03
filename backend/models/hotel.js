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
    cutsomers: [
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


hotelSchema.pre('save', async function (next) {
	try {
		if (!this.isModified('password')) {
			return next();
		}
		const secretToken = crypto.randomBytes(64).toString('hex');
		this.secretToken = secretToken;
		return next();

	} catch (err) {
		next(err);
	}
});
module.exports = mongoose.model('Hotel', hotelSchema);