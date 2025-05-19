const { getConnection, sql } = require('../config/database');

const getLeaveBalance = async (req, res) => {
  const { employeeId } = req.params;

  try {
    const pool = await getConnection();
    const result = await pool.request()
      .input('EMPLOYEE_ID', sql.Int, employeeId)
      .query(`SELECT * FROM LeaveBalance WHERE EmployeeId = @EMPLOYEE_ID`);

    if (result.recordset.length === 0) {
      return res.status(404).json({ success: false, message: 'Leave balance not found' });
    }

    res.status(200).json({ success: true, data: result.recordset[0] });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

const updateLeaveBalance = async (employeeId, leaveDaysTaken) => {
  // This function can be called internally when leave is approved or canceled
  try {
    const pool = await getConnection();
    await pool.request()
      .input('EMPLOYEE_ID', sql.Int, employeeId)
      .input('LEAVE_DAYS_TAKEN', sql.Int, leaveDaysTaken)
      .query(`
        UPDATE LeaveBalance
        SET LeaveTaken = LeaveTaken + @LEAVE_DAYS_TAKEN,
            LeaveRemaining = LeaveRemaining - @LEAVE_DAYS_TAKEN
        WHERE EmployeeId = @EMPLOYEE_ID
      `);
  } catch (error) {
    console.error('Leave balance update error:', error);
  }
};

module.exports = { getLeaveBalance, updateLeaveBalance };