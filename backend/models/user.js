const mongoose = require('mongoose');
const bcrypt = require('bcrypt');


var userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
    },
    photo: {
        type: String,
        default: 'https://cdn.pixabay.com/photo/2016/08/08/09/17/avatar-1577909_1280.png'
    },
    photoId: String,
    created: {
        type: Date,
        default: Date.now
    },
    hotel: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Hotel',
        required: true
    },
    posts: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Post'
        }
    ],
    bookings: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Booking_Customer'
        }
    ],
    interactions: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Interaction'
        }
    ],

});
userSchema.methods.comparePassword = async function (password, next) {
    try {
        let isMatch = await bcrypt.compare(password, this.password);
        return isMatch;

    } catch (err) {
        return next(err);
    }
}

userSchema.pre('save', async function (next) {
    try {
        if (!this.isModified('password')) {
            return next();
        }
        let hash = await bcrypt.hash(this.password, 10);
        this.password = hash;
        return next();

    } catch (err) {
        next(err);
    }
});

userSchema.pre('remove', async function (next) {
    try {
        await this.model('Post').deleteMany({ user: this._id });
        return next();
    } catch (err) {
        next(err);
    }
});



module.exports = mongoose.model('User', userSchema);