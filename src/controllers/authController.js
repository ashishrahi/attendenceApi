const { getConnection, sql } = require('../config/database');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { encryptData } = require('../middleware/crypto');
const emailservice = require('../middleware/emailservice');

const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const pool = await getConnection();
    
    const result = await pool.request()
      .input('Type', sql.Int, 1)
      .input('UserName', sql.NVarChar, username)
      .input('HashPassword', sql.NVarChar, encryptData(password))
      .execute('LoginValidationAndResetPassword');
    console.log(result);
    const { IsSuccess, Message } = result.recordsets[0][0];
    
    if (IsSuccess) {
      const personData = result.recordsets[1][0];
      const token = jwt.sign(
        { personData },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
      );
      
      res.json({
        success: true,
        message: Message,
        data: [{token,...personData}]
      });
    } else {
      res.json({
        success: false,
        message: Message
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

const changePassword = async (req, res) => {
  try {
    const { username, oldPassword, newPassword } = req.body;
    const pool = await getConnection();
    
    const result = await pool.request()
      .input('Type', sql.Int, 3)
      .input('UserName', sql.NVarChar, username)
      .input('HashPassword', sql.NVarChar, encryptData(newPassword))
      .input('NewHashPassword', sql.NVarChar, encryptData(newPassword))
      .execute('LoginValidationAndResetPassword');
    
    const { IsSuccess, Message } = result.recordsets[0][0];
    if (IsSuccess) {
      const personData = result.recordsets[1][0];;
      
    
    res.json({
      success: IsSuccess,
      message: Message,
      data: [{...personData}]
    });
  } else {
    res .json({
      success: false,
      message: Message
    });
  }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};



const resetPassword = async (req, res) => {
  try {
    const { username , email } = req.body;  
    const TemporaryPassword = Math.random().toString(36).substring(2, 8).toUpperCase();


    const pool = await getConnection();
    const result = await pool.request()
      .input('Type', sql.Int, 2)
      .input('UserName', sql.NVarChar, username)
      .input('NewHashPassword', sql.NVarChar, encryptData(TemporaryPassword))
      .input('Email', sql.NVarChar, email)
      .execute('LoginValidationAndResetPassword');  
      console.log(result);
      
     emailservice.sendEmail(username, TemporaryPassword ,email);

    const { IsSuccess, Message } = result.recordsets[0][0];

    if (IsSuccess) {    
      const personData = result.recordsets[1][0];
      res.json({
        success: IsSuccess,
        message: Message,
        data: [{...personData}]
      }); 
    } else {
      res.status(204).json({
        success: false,
        message: Message
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
} 

module.exports = {
  login,
  resetPassword,
  changePassword
};