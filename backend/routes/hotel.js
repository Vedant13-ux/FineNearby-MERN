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
  console.log(req.file.path)
  try {
    req.body.emailToken = crypto.randomBytes(64).toString('hex');
    // req.body.password = crypto.randomBytes(8).toString('hex');
    req.body.password = '1234';

    const newUser = await db.User.create(req.body)

    if (req.file.path) {
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


// Get Customer List
router.get('/get/:hotel_id', (req, res, next) => {
  db.User.find({ hotel: req.params.hotel_id })
    .then(customers => {
      res.status(200).send(customers)
    })
    .catch(err => {
      next(err)
    })
})

// Get Customer Info
router.get('/get/:email', (req, res, next) => {
  db.User.findOne({ email: req.params.email })
    .then(customer => {
      res.status(200).send(customer)
    })
    .catch(err => {
      next(err)
    })
})


// Update Services
router.put('/update/:hotel_id/:service', async (req, res, next) => {
  try {
    var oldService = await db.Service.findOne({ hotel: req.params.hotel_id, name: req.params.service })
    var newService = { ...oldService, ...req.body }
    await db.Service.findByIdAndUpdate(oldService._id, newService)
    return res.status(200).send('Updated Successfully')
  } catch (err) {
    next(err)
  }
})






module.exports = router;