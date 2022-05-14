const express = require('express');
const router = express.Router();
const db = require('../models');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
var mailOptionsImport = require('../handlers/mailOptions')
const cloudinary = require('cloudinary');
const multer = require('multer');
cloudinary.config({
  cloud_name: 'ved13',
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});
var storage = multer.diskStorage({
  filename: function (req, file, callback) {
    callback(null, Date.now() + file.originalname);
  }
});
var imageFilter = function (req, file, cb) {
  if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
    return cb(new Error('Only image files are allowed!'), false);
  }
  cb(null, true);
};
var upload = multer({ storage: storage, fileFilter: imageFilter });


// Add Customer 
router.post('/addcustomer', upload.single('file'), async (req, res, next) => {
  try {
    // req.body.password = crypto.randomBytes(8).toString('hex');
    req.body.password = '1234';

    const newUser = await db.User.create(req.body)

    if (req.file) {
      var result = await cloudinary.v2.uploader.upload(req.file.path);
      newUser.photoId = result.public_id;
      newUser.photo = result.secure_url;
      await newUser.save();
    }

    var hotel = await db.Hotel.findById(req.body.hotel);
    console.log(hotel)
    await hotel.customers.push(newUser);
    await hotel.save();

    var mailOptions = mailOptionsImport(req, process);
    var transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'kjsceintern@gmail.com',
        pass: process.env.GMAIL_APP_PASSWORD
      }
    });


    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        return console.log(err.message);
      }
      console.log('Message Sent : %s', info.messageId);
      console.log('Preview URL : %s', info.getTestMessageURL(info));
    });
    return res.status(200).send('Signed Up Successfully')


  } catch (err) {
    if (err.code === 11000) {
      err.message = 'Sorry, that email is already taken';
    }
    return next({
      status: 400,
      message: err.message
    });
  }
})

// Remove a Customer
router.delete('/removecustomer/:email', async (req, res, next) => {
  try {
    var user = await db.User.findOne({ email: req.params.email }).populate({ path: 'interactions', populate: { path: 'otherUser', populate: 'interactions' } });
    var hotel = await db.Hotel.findById(user.hotel);
    await hotel.customers.pull(user);
    var user_interactions = user.interactions;

    for (var i = 0; i < user_interactions.length; i++) {
      var conversation = user_interactions[i].conversation;
      var otherUser = user_interactions[i].otherUser;
      otherUserInteraction = otherUser.interactions.filter(function (interaction) {
        return interaction.conversation.toString() === conversation.toString();
      })
      await otherUser.interactions.pull(otherUserInteraction[0]);
      await otherUser.save();
      await db.Conversation.findByIdAndDelete(conversation);
    }
    await hotel.save();
    await user.remove();
    return res.status(200).send('Customer Removed Successfully')
  } catch (err) {
    return next(
      err
    );
  }
})

// Get Customer List
router.get('/getcustomers/:hotel_id', (req, res, next) => {
  db.User.find({ hotel: req.params.hotel_id })
    .then(customers => {
      res.status(200).send(customers)
    })
    .catch(err => {
      next(err)
    })
})

// Get Customer Info
router.get('/getinfo/:email', (req, res, next) => {
  db.User.findOne({ email: req.params.email }, '-password')
    .then(customer => {
      res.status(200).send(customer)
    })
    .catch(err => {
      next(err)
    })
})


// Update Services
router.put('/updateservice/:hotel_id/:service_name', async (req, res, next) => {
  try {
    var oldService = await db.Service.findOne({ hotel: req.params.hotel_id, name: req.params.service })
    var newService = { ...oldService, ...req.body }
    await db.Service.findByIdAndUpdate(oldService._id, newService)
    return res.status(200).send('Updated Successfully')
  } catch (err) {
    next(err)
  }
})

// Get Cutsomer Billing
router.get('/getbilling/:email', async (req, res, next) => {
  try {
    var bookings = await db.Booking_Customer.find({ email: req.params.email, status: 'Accepted' }).populate({ path: 'booking', populate: 'service' }).exec()

    var bill = 0
    for (let i = 0; i < bookings.length; i++) {
      bill += bookings[i].booking.service.price
    }
    res.status(200).send({email: req.params.email, bill})
  } catch (err) {
    next(err)
  }
})






module.exports = router;