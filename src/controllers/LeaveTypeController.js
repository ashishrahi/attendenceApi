const { getConnection, sql } = require('../config/database');

const createLeaveType = async (req, res) => {
  const { leaveTypeName, maxDaysAllowed, description, isActive } = req.body;

  if (!leaveTypeName || maxDaysAllowed === undefined) {
    return res.status(400).json({
      success: false,
      message: 'leaveTypeName and maxDaysAllowed are required'
    });
  }

  try {
    const pool = await getConnection();
    await pool.request()
      .input('LEAVE_TYPE_NAME', sql.NVarChar, leaveTypeName)
      .input('MAX_DAYS_ALLOWED', sql.Int, maxDaysAllowed)
      .input('DESCRIPTION', sql.NVarChar, description || '')
      .input('IS_ACTIVE', sql.Bit, isActive)
      .query(`
        INSERT INTO LeaveType (LeaveTypeName, MaxDaysAllowed, Description, IsActive)
        VALUES (@LEAVE_TYPE_NAME, @MAX_DAYS_ALLOWED, @DESCRIPTION, @IS_ACTIVE)
      `);

    res.status(201).json({ success: true, message: 'Leave Type created successfully' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};



// Get all Leave Types
const getLeaveTypes = async (req, res) => {
  try {
    const pool = await getConnection();
    const result = await pool.request().query('SELECT * FROM LeaveType');
    res.status(200).json({ success: true, data: result.recordset });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Update a Leave Type
const updateLeaveType = async (req, res) => {
  const { id } = req.params;
  const { leaveTypeName, maxDaysAllowed, description, isActive } = req.body;

  if (!leaveTypeName || maxDaysAllowed === undefined) {
    return res.status(400).json({
      success: false,
      message: 'leaveTypeName and maxDaysAllowed are required'
    });
  }

  try {
    const pool = await getConnection();
    await pool.request()
      .input('LEAVE_TYPE_ID', sql.Int, id)
      .input('LEAVE_TYPE_NAME', sql.NVarChar, leaveTypeName)
      .input('MAX_DAYS_ALLOWED', sql.Int, maxDaysAllowed)
      .input('DESCRIPTION', sql.NVarChar, description || '')
      .input('IS_ACTIVE', sql.Bit, isActive)
      .input('MODIFIED_AT', sql.DateTime, new Date())
      .query(`
        UPDATE LeaveType 
        SET 
          LeaveTypeName = @LEAVE_TYPE_NAME,
          MaxDaysAllowed = @MAX_DAYS_ALLOWED,
          Description = @DESCRIPTION,
          IsActive = @IS_ACTIVE,
          ModifiedAt = @MODIFIED_AT
        WHERE LeaveTypeID = @LEAVE_TYPE_ID
      `);

    res.status(200).json({ success: true, message: 'Leave Type updated successfully' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};


// Delete a Leave Type
const deleteLeaveType = async (req, res) => {
  const { id } = req.params;

  try {
    const pool = await getConnection();
    await pool.request()
      .input('LEAVE_TYPE_ID', sql.Int, id)
      .query('DELETE FROM LeaveType WHERE LeaveTypeID = @LEAVE_TYPE_ID');

    res.status(200).json({ success: true, message: 'Leave Type deleted successfully' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};


module.exports = {
  createLeaveType,
  getLeaveTypes,
  updateLeaveType,
  deleteLeaveType
};
