var express = require('express');
var router = express.Router();
const cors = require('cors');
const dotenv = require('dotenv/config');

const nodemailer = require("nodemailer");

const EMAIL = process.env.EMAIL;
const GMAIL_REFRESH_TOKEN = process.env.GMAIL_REFRESH_TOKEN;
const ACCESS_TOKEN = process.env.ACCESS_TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;

router.options('/send', cors())

router.post('/send', function(req, res, next) {
  let data = req.body;
  const user_name     = EMAIL;
  const refresh_token = '';
  const access_token  = '';
  const client_id     = '';
  const client_secret = '';

  const email_to = EMAIL;

  const nodemailer = require('nodemailer');

  let transporter = nodemailer
  .createTransport({
      service: 'Gmail',
      auth: {
          type: 'OAuth2',
          clientId: CLIENT_ID,
          clientSecret: CLIENT_SECRET
      }
  });

  //create approximate date for token expiration
  var myDate = new Date();
  myDate.setHours(myDate.getHours()+24);

  let mailOptions = {
      from    : EMAIL, // sender address
      to      : EMAIL, // list of receivers
      subject : `Personal Site message from ${data.name}`, // Subject line
      text    : `${data.message}`, // plaintext body
      html    : `
                  <div>
                    ${data.message}
                    email: ${data.email}
                  </div>
                `,

      auth : {
          user         : user_name,
          refreshToken : GMAIL_REFRESH_TOKEN,
          accessToken  : ACCESS_TOKEN,
          expires      : myDate
      }
  };

  transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        console.log(err);
          res.send({
            success: false
          })
          return process.exit(1);
      } else {
        res.send({
          success: true
        })
      }

      console.log('Message sent: %s', info.messageId);
      // Preview only available when sending through an Ethereal account
      console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
  });
})

module.exports = router;
