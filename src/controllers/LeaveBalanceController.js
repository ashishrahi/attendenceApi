const { getConnection, sql } = require('../config/database');

const createLeaveBalance = async (req, res) => {
  const { employeeId, leaveTypeId, totalEntitled, leaveTaken, year, effectiveDate } = req.body;

  // Validate input
  if (!employeeId || !leaveTypeId || totalEntitled === undefined || leaveTaken === undefined) {
    return res.status(400).json({
      success: false,
      message: 'employeeId, leaveTypeId, totalEntitled, and leaveTaken are required'
    });
  }

  try {
    const pool = await getConnection();

    // Check if record already exists (due to unique constraint)
    const existing = await pool.request()
      .input('EMP_ID', sql.Int, employeeId)
      .input('LEAVE_TYPE_ID', sql.Int, leaveTypeId)
      .query(`
        SELECT * FROM LeaveBalance 
        WHERE EmployeeID = @EMP_ID AND LeaveTypeID = @LEAVE_TYPE_ID
      `);

    if (existing.recordset.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Leave balance already exists for this employee and leave type'
      });
    }

    // Set default values for Year and EffectiveDate if not provided
    const currentYear = year || new Date().getFullYear();  // If no year provided, use current year
    const currentDate = effectiveDate || new Date().toISOString().split('T')[0];  // If no effectiveDate provided, use current date

    // Insert new record
    await pool.request()
      .input('EMP_ID', sql.Int, employeeId)
      .input('LEAVE_TYPE_ID', sql.Int, leaveTypeId)
      .input('ENTITLED', sql.Int, totalEntitled)
      .input('TAKEN', sql.Int, leaveTaken)
      .input('LAST_UPDATED', sql.DateTime, new Date())
      .input('YEAR', sql.Int, currentYear)
      .input('EFFECTIVE_DATE', sql.Date, currentDate)
      .query(`
        INSERT INTO LeaveBalance (EmployeeID, LeaveTypeID, TotalEntitled, LeaveTaken, LastUpdated, Year, EffectiveDate)
        VALUES (@EMP_ID, @LEAVE_TYPE_ID, @ENTITLED, @TAKEN, @LAST_UPDATED, @YEAR, @EFFECTIVE_DATE)
      `);

    res.status(201).json({ success: true, message: 'Leave balance created successfully' });
  } catch (error) {
    console.error('Error creating leave balance:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

const updateLeaveBalance = async (req, res) => {
  const { employeeId, leaveTypeId, totalEntitled, leaveTaken, year, effectiveDate } = req.body;

  if (!employeeId || !leaveTypeId) {
    return res.status(400).json({
      success: false,
      message: 'employeeId and leaveTypeId are required'
    });
  }

  try {
    const pool = await getConnection();

    // Check if record exists
    const check = await pool.request()
      .input('EMP_ID', sql.Int, employeeId)
      .input('TYPE_ID', sql.Int, leaveTypeId)
      .query(`
        SELECT * FROM LeaveBalance 
        WHERE EmployeeID = @EMP_ID AND LeaveTypeID = @TYPE_ID
      `);

    if (check.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Leave balance record not found for given employee and leave type'
      });
    }

    // Prepare dynamic fields to update
    const updates = [];
    if (typeof totalEntitled === 'number') updates.push(`TotalEntitled = @TOTAL`);
    if (typeof leaveTaken === 'number') updates.push(`LeaveTaken = @TAKEN`);

    // Only update Year and EffectiveDate if they are provided
    if (year) updates.push(`Year = @YEAR`);
    if (effectiveDate) updates.push(`EffectiveDate = @EFFECTIVE_DATE`);

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid fields provided for update (totalEntitled or leaveTaken or year or effectiveDate)'
      });
    }

    updates.push(`LastUpdated = @UPDATED`);

    // Build and execute update query
    await pool.request()
      .input('EMP_ID', sql.Int, employeeId)
      .input('TYPE_ID', sql.Int, leaveTypeId)
      .input('TOTAL', sql.Int, totalEntitled)
      .input('TAKEN', sql.Int, leaveTaken)
      .input('YEAR', sql.Int, year)
      .input('EFFECTIVE_DATE', sql.Date, effectiveDate)
      .input('UPDATED', sql.DateTime, new Date())
      .query(`
        UPDATE LeaveBalance
        SET ${updates.join(', ')}
        WHERE EmployeeID = @EMP_ID AND LeaveTypeID = @TYPE_ID
      `);

    res.status(200).json({ success: true, message: 'Leave balance updated successfully' });
  } catch (error) {
    console.error('Error updating leave balance:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

const getLeaveBalance = async (req, res) => {
  const { employeeId, leaveTypeId, year } = req.body;

  try {
    const pool = await getConnection();
    const request = pool.request();

    let query = 'SELECT * FROM LeaveBalance WHERE 1=1';

    if (employeeId !== -1) {
      query += ' AND EmployeeID = @EMP_ID';
      request.input('EMP_ID', sql.Int, employeeId);
    }

    if (leaveTypeId !== -1) {
      query += ' AND LeaveTypeID = @TYPE_ID';
      request.input('TYPE_ID', sql.Int, leaveTypeId);
    }

    if (year !== null && year !== undefined) {
      query += ' AND Year = @YEAR';
      request.input('YEAR', sql.Int, year);
    }

    const result = await request.query(query);

    if (result.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No leave balance records found for the given filters'
      });
    }

    res.status(200).json({
      success: true,
      data: result.recordset
    });
  } catch (error) {
    console.error('Error filtering leave balance:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

const deleteLeaveBalance = async (req, res) => {
  const { id } = req.params; // leaveBalanceId from URL

  if (!id) {
    return res.status(400).json({
      success: false,
      message: 'LeaveBalanceID (id) is required in the URL'
    });
  }

  try {
    const pool = await getConnection();

    // Check if the record exists
    const check = await pool.request()
      .input('ID', sql.Int, id)
      .query('SELECT * FROM LeaveBalance WHERE LeaveBalanceID = @ID');

    if (check.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Leave balance record not found with the given ID'
      });
    }

    // Delete the record
    await pool.request()
      .input('ID', sql.Int, id)
      .query('DELETE FROM LeaveBalance WHERE LeaveBalanceID = @ID');

    res.status(200).json({
      success: true,
      message: 'Leave balance deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting leave balance:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

const getEmployeeLeaveDetails = async (req, res) => {
  const { employeeId } = req.body; 

  if (!employeeId) {
    return res.status(400).json({
      success: false,
      message: 'कर्मचारी ID आवश्यक है।'
    });
  }

  try {
    const pool = await getConnection();
    const request = pool.request();
    request.input('EMP_ID', sql.Int, employeeId);  // Just use employeeId

    const result = await request.query(`
      SELECT 
        la.LeaveAppID,
        la.EmployeeID,
        la.LeaveTypeID,
        lt.LeaveTypeName,
        la.FromDate,
        la.ToDate,
        la.TotalDays,
        la.Reason,
        la.Status,
        la.AppliedDate,
        la.ApprovedBy,
        la.ApprovedDate,
        la.RejectionRemark
      FROM LeaveApplication la
      LEFT JOIN LeaveType lt ON la.LeaveTypeId = lt.LeaveTypeId
      WHERE la.EmployeeId = @EMP_ID;
    `);

    res.status(200).json({
      success: true,
      employeeId,
      leaveDetails: result.recordset
    });
  } catch (error) {
    console.error('डेटा प्राप्त करने में त्रुटि:', error);
    res.status(500).json({
      success: false,
      message: 'सर्वर त्रुटि',
      error: error.message
    });
  }
};






module.exports = {createLeaveBalance,
                  getLeaveBalance,
                  deleteLeaveBalance,
                  updateLeaveBalance,
                  getEmployeeLeaveDetails
                 };