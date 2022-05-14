const mongoose = require('mongoose');
mongoose.set('debug', true);
mongoose.Promise = Promise;
mongoose
    .connect(
        process.env.MONGODB_URI2,
        {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            keepAlive: true
        }
    )
    .then(() => {
        console.log('Connected');
    })
    .catch((err) => {
        console.log(err.message);
    });

module.exports.User = require('./user');
module.exports.Post = require('./post');
module.exports.Comment = require('./comment');
module.exports.Hotel = require('./hotel');
module.exports.Message = require('./message');
module.exports.Conversation = require('./conversation');
module.exports.Interaction = require('./interaction');
module.exports.ServiceBooking = require('./serviceBooking');
module.exports.Service = require('./service');
module.exports.Booking_Customer = require('./booking_customer')
module.exports.Hashtag = require('./hashtag');


