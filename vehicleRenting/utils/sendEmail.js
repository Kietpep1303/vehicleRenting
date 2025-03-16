const nodemailer = require('nodemailer');

async function sendEmail(email, subjectData, data) {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'cccxsh123@gmail.com',
        pass: 'cajt yubn zzkr utkh',
      },
    });
  
    const mailOptions = {
      from: 'cccxsh123@gmail.com',
      to: email,
      subject: subjectData,
      text: data,
    };
  
    await transporter.sendMail(mailOptions);
  }
  
module.exports = { sendEmail };