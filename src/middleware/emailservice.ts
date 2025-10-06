// utils/email.ts
import nodemailer from "nodemailer";

// Gmail transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'akdwivedi7355@gmail.com',
    pass: 'iwed ylay tlbi kwmd', // consider using environment variables for security
  },
});

// SMTP transporter
const transporters = nodemailer.createTransport({
  host: 'smtp.multifacet-software.com',
  port: 587, // 587 for TLS, 465 for SSL
  secure: false, // true for SSL, false for TLS
  auth: {
    user: 'test@multifacet-software.com',
    pass: 'Admin@123456', // consider using environment variables
  },
});

/**
 * Sends a temporary password email
 * @param username - User's name
 * @param temporaryPassword - Temporary password to send
 * @param email - Recipient's email
 */
export const sendEmail = (username: string, temporaryPassword: string, email: string): void => {
  const mailOptions: nodemailer.SendMailOptions = {
    from: 'akdwivedi7355@gmail.com',
    to: email,
    subject: 'Your Temporary Password',
    text: `Hello ${username},

Your temporary password is: ${temporaryPassword}

For security reasons, please log in to your account and change this password as soon as possible.

If you encounter any issues or need assistance, feel free to contact our support team.

Best regards,
Multifacet Software
    `,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Error sending email:', error);
    } else {
      console.log('Email sent successfully:', info.response);
    }
  });
};

/**
 * Sends account creation email
 * @param username - User's name
 * @param password - User's password
 * @param email - Recipient's email
 */
export const accountCreationMail = (username: string, password: string, email: string): void => {
  const mailOptions: nodemailer.SendMailOptions = {
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
Multifacet Software
    `,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Error sending email:', error);
    } else {
      console.log('Email sent successfully:', info.response);
    }
  });
};
