const express = require('express');
const router = express.Router();
const db = require('../models');
function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
}


router.put('/new/:id', async (req, res, next) => {
    try {
        var user = await db.User.findById(req.body.uid).populate('interactions').exec()
        var convId = ""
        user.interactions.forEach(i => {
            if (i.otherUser.equals(req.params.id)) {
                convId = i.conversation
                return;
            }
        });
        if (convId !== "") {
            return res.status(200).send({ convId })
        } else {
            db.User.findById(req.params.id)
                .then((otherUser) => {
                    if (!otherUser) {
                        return next({ status: 404, message: 'User Not Found' })
                    }
                    db.Conversation.create({})
                        .then(async (conversation) => {
                            try {
                                let interaction = await db.Interaction.create({ conversation: conversation._id, otherUser })
                                conversation.interactionId = interaction._id
                                await user.interactions.push(interaction)
                                await user.save()
                                await conversation.save()
                                return res.status(200).send({ convId: conversation._id })
                            } catch (error) {
                                next(error)
                            }
                        }).catch((err) => {
                            next(err)
                        });
                }).catch((err) => {

                });
        }


    } catch (error) {
        next(error)
    }

})

router.put('/interactions', (req, res, next) => {
    db.User.findById(req.body.uid, 'interactions').populate({ path: 'interactions', populate: [{ path: 'otherUser', select: 'name photo _id email' }, { path: 'conversation', select: 'updatedAt _id' }] })
        .then(async (user) => {
            for (let i = 0; i < user.interactions.length; i++) {
                user.interactions[i].unreadmessages = await db.Message.find({ conversationId: user.interactions[i].conversation, author: user.interactions[i].otherUser._id, isRead: false }).count()
            }
            res.send(user.interactions)
        }).catch((err) => {
            next(err)
        });
})


// Suggested Members
router.get('/suggestUsers/:hotel_id/:name', (req, res, next) => {

    const name = RegExp(escapeRegex(req.params.name), 'gi');
    db.User.find({ name: name, hotel: req.params.hotel_id }, 'name photo email')
        .then((users) => {
            res.send(users);
        }).catch((err) => {
            next(err);
        });
})


module.exports = router