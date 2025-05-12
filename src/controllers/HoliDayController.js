const { getConnection, sql } = require('../config/database');

// Create Holiday
const createHoliday = async (req, res) => {
  try {
    const {
      HolidayName,
      Description,
      Date,
      IsActive = true,
      CreatedAt = new Date(),
      UpdatedAt = new Date()
    } = req.body;

    const pool = await getConnection();

    const result = await pool.request()
      .input('HolidayName', sql.NVarChar, HolidayName)
      .input('Description', sql.NVarChar, Description)
      .input('Date', sql.Date, Date)
      .input('IsActive', sql.Bit, IsActive)
      .input('CreatedAt', sql.DateTime, CreatedAt)
      .input('UpdatedAt', sql.DateTime, UpdatedAt)
      .query(`
        INSERT INTO holiDaySchedule (HolidayName, Description, Date, IsActive, CreatedAt, UpdatedAt)
        VALUES (@HolidayName, @Description, @Date, @IsActive, @CreatedAt, @UpdatedAt);

        SELECT 1 AS IsSuccess, 'Holiday added successfully' AS Message;
      `);

    const { IsSuccess, Message } = result.recordset[0];

    res.json({
      success: IsSuccess,
      message: Message
    });
  } catch (error) {
    console.error('Error in createHoliday:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};



// Update Holiday
const updateHoliday = async (req, res) => {
  try {
    const {
      ID,
      HolidayName,
      Description,
      Date,
      IsActive,
      UpdatedAt = new Date()
    } = req.body;

    const pool = await getConnection();

    const result = await pool.request()
      .input('ID', sql.Int, ID)
      .input('HolidayName', sql.NVarChar, HolidayName)
      .input('Description', sql.NVarChar, Description)
      .input('Date', sql.Date, Date)
      .input('IsActive', sql.Bit, IsActive)
      .input('UpdatedAt', sql.DateTime, UpdatedAt)
      .query(`
        UPDATE holiDaySchedule
        SET HolidayName = @HolidayName,
            Description = @Description,
            Date = @Date,
            IsActive = @IsActive,
            UpdatedAt = @UpdatedAt
        WHERE ID = @ID;

        SELECT 1 AS IsSuccess, 'Holiday updated successfully' AS Message;
      `);

    const { IsSuccess, Message } = result.recordset[0];

    res.json({
      success: IsSuccess,
      message: Message
    });
  } catch (error) {
    console.error('Error in updateHoliday:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};


// Get All Holidays
const getHolidays = async (req, res) => {
  try {
    const pool = await getConnection();
    const result = await pool.request()
      .query(`SELECT * FROM holiDaySchedule ORDER BY Date ASC`);

    res.json({
      success: true,
      message: 'Holidays fetched successfully',
      data: result.recordset
    });
  } catch (error) {
    console.error('Error in getHolidays:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Delete Holiday
const deleteHoliday = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(id)) {
      return res.status(400).json({ success: false, message: 'Invalid ID' });
    }

    const pool = await getConnection();

    const result = await pool.request()
      .input('id', sql.Int, id)
      .query(`DELETE FROM holiDaySchedule WHERE ID = @id`);

    if (result.rowsAffected[0] > 0) {
      res.json({
        success: true,
        message: 'Holiday deleted successfully'
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'Holiday not found'
      });
    }
  } catch (error) {
    console.error('Error in deleteHoliday:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

module.exports = {
  createHoliday,
  updateHoliday,
  getHolidays,
  deleteHoliday
};
