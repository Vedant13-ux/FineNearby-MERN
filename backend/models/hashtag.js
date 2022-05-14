const mongoose = require('mongoose');
const hashtagScehma = new mongoose.Schema({
    name: String,
    posts: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Post'
        }
    ],
    hotel: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Hotel'
    }
});

module.exports = mongoose.model('Hashtag', hashtagScehma);