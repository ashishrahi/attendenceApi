const { getConnection, sql } = require('../config/database');


const createShift = async (req, res) => {
  try {
    const { shiftname, intime, outtime } = req.body;

    const pool = await getConnection();

    const result = await pool.request()
      .input('shiftname', sql.NVarChar, shiftname)
      .input('intime', sql.Time, intime)
      .input('outtime', sql.Time, outtime)
      .query(`
        INSERT INTO shift_master (shiftname, intime, outtime)
        VALUES (@shiftname, @intime, @outtime);

        SELECT 1 AS IsSuccess, 'Added successfully' AS Message;
      `);

    const { IsSuccess, Message } = result.recordset[0];

    res.json({
      success: IsSuccess,
      message: Message
    });
  } catch (error) {
    console.error('Error in addShift:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};
  
 const updateShift = async (req, res) => {
  try {
    const { id, shiftname, intime, outtime } = req.body;

    const pool = await getConnection();

    const result = await pool.request()
      .input('id', sql.Int, id)
      .input('shiftname', sql.NVarChar, shiftname)
      .input('intime', sql.Time, intime)
      .input('outtime', sql.Time, outtime)
      .query(`
        UPDATE shift_master
        SET shiftname = @shiftname,
            intime = @intime,
            outtime = @outtime
        WHERE id = @id;

        SELECT 1 AS IsSuccess, 'Updated successfully' AS Message;
      `);

    const { IsSuccess, Message } = result.recordset[0];

    res.json({
      success: IsSuccess,
      message: Message
    });
  } catch (error) {
    console.error('Error in updateShift:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

const getShift = async (req, res) => {
  try {
    const pool = await getConnection();
    const result = await pool.request()
      .query("SELECT * FROM [iDMS].[dbo].[shift_master]");

    const shifts = result.recordset;

    res.json({
      success: true,
      message: "Shifts fetched successfully",
      data: shifts
    });
  } catch (error) {
    console.error('Error in getShift:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};


const deleteShift = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(id)) {
      return res.status(400).json({ success: false, message: 'Invalid ID' });
    }

    const pool = await getConnection();

    const result = await pool.request()
      .input('id', sql.Int, id)
      .query("DELETE FROM [iDMS].[dbo].[shift_master] WHERE id = @id");

    if (result.rowsAffected[0] > 0) {
      res.json({
        success: true,
        message: 'Shift deleted successfully'
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'Shift not found'
      });
    }
  } catch (error) {
    console.error('Error in deleteShift:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

  

module.exports = {
    createShift,
    updateShift,
    getShift,
    deleteShift
};