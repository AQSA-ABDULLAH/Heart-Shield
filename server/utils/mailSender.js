// utils/mailSender.js
const nodemailer = require('nodemailer');

const mailSender = async (email, title, body) => {
  try {

    // Create a Transporter to send emails
    let transporter = nodemailer.createTransport({
      host: process.env.HOST,
      service:process.env.SERVICE,
      post:Number(process.env.EMAIL_PORT),
      secure:process.env.SECURE,
      
      auth: {
        user: process.env.USER,
        pass: process.env.PASS
    }
    });
    // Send emails to users
    let info = await transporter.sendMail({
      from: process.env.USER,
      to: email,
      subject: title,
      html: body,
    });
    console.log("Email info: ", info);
    return info;
  } catch (error) {
    console.log(error.message);
  }
};
module.exports = mailSender;