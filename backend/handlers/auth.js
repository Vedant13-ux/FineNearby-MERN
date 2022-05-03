const db = require('../models');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
var mailOptionsImport = require('./mailOptions')

exports.signup = async function (req, res, next) {
  try {
    console.log(req.body)
    req.body.emailToken = crypto.randomBytes(64).toString('hex');
    const newUser = await db.User.create(req.body);
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
      err.message = 'Sorry, that username/email is already taken.'
    }
    return next({
      status: 400,
      message: err.message
    });
  }
}

exports.signin = async function (req, res, next) {
  try {
    let user = await db.User.findOne({
      email: req.body.email
    })
    if (!user) {
      return next({
        status: 400,
        message: 'Invalid email or password.'
      });
    }

    let isMatch = await user.comparePassword(req.body.password, next);
    const { email, name,_id } = user;

    if (isMatch) {
      let token = jwt.sign({
        email, name, _id
      }, process.env.SECRET_KEY);

      return res.status(200).json({
         token, ...user._doc, password: ''
      })
    } else {
      next({
        status: 400,
        message: 'Invalid Email/Passowrd.'
      })
    }

  } catch (err) {
    return next(err);
  }

}
