const { getConnection, sql } = require('../config/database');

const applyLeave = async (req, res) => {
  const {
    employeeId,
    leaveTypeId,
    fromDate,
    toDate,
    reason,
    status // default to 'Pending'
  } = req.body;

  try {
    const pool = await getConnection();
    const result = await pool.request()
      .input('EMPLOYEE_ID', sql.Int, employeeId)
      .input('LEAVE_TYPE_ID', sql.Int, leaveTypeId)
      .input('FROM_DATE', sql.SmallDateTime, fromDate)
      .input('TO_DATE', sql.SmallDateTime, toDate)
      .input('REASON', sql.VarChar, reason)
      .input('STATUS', sql.VarChar, status || 'Pending')
      .query(`
        INSERT INTO LeaveApplication (EmployeeId, LeaveTypeId, FromDate, ToDate, Reason, Status)
        VALUES (@EMPLOYEE_ID, @LEAVE_TYPE_ID, @FROM_DATE, @TO_DATE, @REASON, @STATUS);
      `);

    res.status(201).json({ success: true, message: 'Leave applied successfully' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

const updateLeaveStatus = async (req, res) => {
  const { id } = req.params; // leave application id
  const { status, approvedBy } = req.body; // 'Approved' or 'Rejected'

  try {
    const pool = await getConnection();
    const request = pool.request();

    await request
      .input('ID', sql.Int, id)
      .input('STATUS', sql.VarChar, status)
      .input('APPROVED_BY', sql.Int, approvedBy)
      .input('APPROVED_DATE', sql.SmallDateTime, new Date())
      .query(`
        UPDATE LeaveApplication
        SET Status = @STATUS, ApprovedBy = @APPROVED_BY, ApprovedDate = @APPROVED_DATE
        WHERE LeaveApplicationId = @ID
      `);

    // TODO: Update LeaveBalance if approved

    res.status(200).json({ success: true, message: `Leave ${status.toLowerCase()} successfully` });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

module.exports = { applyLeave, updateLeaveStatus };