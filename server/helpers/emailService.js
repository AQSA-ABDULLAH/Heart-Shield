const nodemailer = require('nodemailer');
require('dotenv').config(); // Yahan bhi laga lein safety ke liye

// Debugging Log (Password ka length check karein, print na karein)
console.log("📧 Email Service Init - User:", process.env.SMTP_MAIL);
console.log("📧 Email Service Init - Pass Length:", process.env.SMTP_PASSWORD ? process.env.SMTP_PASSWORD.length : "MISSING");

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_MAIL,
    pass: process.env.SMTP_PASSWORD
  }
});

const sendEmailNotification = async (to, subject, htmlContent) => {
  try {
    console.log(`📨 Attempting to send email to: ${to}`); // <--- LOG ADDED
    
    const mailOptions = {
      from: process.env.SMTP_MAIL,
      to: to,
      subject: subject,
      html: htmlContent
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent successfully to ${to}: ${info.response}`);
  } catch (error) {
    // Ye error console mein show hona bohat zaruri hai
    console.error(`❌ FAILED sending email to ${to}. Error:`, error); 
  }
};

module.exports = sendEmailNotification;