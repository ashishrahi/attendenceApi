const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail', 
  auth: {
    user: 'akdwivedi7355@gmail.com', 
    pass: 'iwed ylay tlbi kwmd',
  },
});

  const transporters = nodemailer.createTransport({
      host: 'smtp.multifacet-software.com',  // Correct SMTP server address
      port: 587,  // Ensure this is the correct port (587 for TLS, 465 for SSL)
      secure: false,  // true for SSL, false for TLS
      auth: {
        user: 'test@multifacet-software.com',
        pass: 'Admin@123456',  // Correct password or App Password
      },
    });

const sendEmail = (username, temporaryPassword,email) => {
    const mailOptions = {
        from: 'akdwivedi7355@gmail.com', // Your email address (sender)
        to: email,                      // Recipient's email address
        subject: 'Your Temporary Password', // Email subject line
        text: `Hello ${username},
      
      Your temporary password is: ${temporaryPassword}
      
      For security reasons, please log in to your account and change this password as soon as possible.
      
      If you encounter any issues or need assistance, feel free to contact our support team.
      
      Best regards,  
      multifacet software 
      `, 
      };


  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log('Error sending email:', error);
    } else {
      console.log('Email sent successfully:', info.response);
    }
  });
};

const AccountCreationmail = (username, password,email) => {
    const mailOptions = {
        from: 'akdwivedi7355@gmail.com', 
        to: email,                      
        subject: 'Account Created Successfully', 
        text: `Hello ${username}, and welcome to our platform!
      
      Your account has been created successfully.
      
      Please login to your account. Your username and password are as follows:
      
      Username: ${username}
      Password: ${password}
      
      If you have any questions or need assistance, feel free to reach out to us. 
      
      Best regards,  
      multifacet software 
        `, 
      };
      
  
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log('Error sending email:', error);
      } else {
        console.log('Email sent successfully:', info.response);
      }
    });
  };

module.exports = { sendEmail,AccountCreationmail };
