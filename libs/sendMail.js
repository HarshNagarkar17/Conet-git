const nodemailer = require('nodemailer');

exports.sendMail = async(mailID, otp) => {

    let transporter = await nodemailer.createTransport({
        service: 'gmail',
        secure: false,
        auth: {
            user: process.env.EMAIL_ID,
            pass: process.env.EMAIL_PASSWORD
        },
        tls:{
            rejectUnauthorized: false
        }
    });

    let info = await transporter.sendMail({
        from: process.env.EMAIL_ID,
        to: mailID,
        subject: 'Verify your account on Conet to continue',
        html: `<h4>This is your otp for the conet account ${otp}</h4>`
    });

    return info;
}

const crypto = require('crypto');

exports.generateOTP = (length) => {
    const chars = '0123456789';
    const randomBytes = crypto.randomBytes(length);
    const result = new Array(length);
    const byteRange = 256 / chars.length;
    
    for (let i = 0; i < length; i++) {
      result[i] = chars[Math.floor(randomBytes[i] / byteRange)];
    }
    
    return result.join('');
}