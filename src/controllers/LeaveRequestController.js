const { getConnection, sql } = require('../config/database');

const applyLeave = async (req, res) => {
  const {
    employeeId,
    leaveTypeId,
    fromDate,
    toDate,
    reason,
    status // optional
  } = req.body;

  try {
    // Calculate total days
    const from = new Date(fromDate);
    const to = new Date(toDate);
    const totalDays = Math.floor((to - from) / (1000 * 60 * 60 * 24)) + 1;

    const pool = await getConnection();
    await pool.request()
      .input('EMPLOYEE_ID', sql.Int, employeeId)
      .input('LEAVE_TYPE_ID', sql.Int, leaveTypeId)
      .input('FROM_DATE', sql.SmallDateTime, fromDate)
      .input('TO_DATE', sql.SmallDateTime, toDate)
      .input('REASON', sql.VarChar, reason)
      .input('STATUS', sql.VarChar, status || 'Pending')
      .input('TOTAL_DAYS', sql.Int, totalDays)
      .query(`
        INSERT INTO LeaveApplication 
        (EmployeeId, LeaveTypeId, FromDate, ToDate, Reason, Status, TotalDays)
        VALUES 
        (@EMPLOYEE_ID, @LEAVE_TYPE_ID, @FROM_DATE, @TO_DATE, @REASON, @STATUS, @TOTAL_DAYS);
      `);

    res.status(201).json({ success: true, message: 'Leave applied successfully' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// const updateLeaveStatus = async (req, res) => {
//   const { id } = req.params; // LeaveAppID
//   const { status, approvedBy } = req.body; // 'Approved' or 'Rejected'

//   if (!status || !['Approved', 'Rejected'].includes(status)) {
//     return res.status(400).json({ success: false, message: 'Invalid status value' });
//   }

//   let transaction;

//   try {
//     const pool = await getConnection();
//     transaction = new sql.Transaction(pool);
//     await transaction.begin();

//     // Step 1: Check current status
//     const currentStatusResult = await new sql.Request(transaction)
//       .input('ID', sql.Int, id)
//       .query(`SELECT Status FROM LeaveApplication WHERE LeaveAppID = @ID`);

//     if (currentStatusResult.recordset.length === 0) {
//       await transaction.rollback();
//       return res.status(404).json({ success: false, message: 'Leave application not found' });
//     }

//     const currentStatus = currentStatusResult.recordset[0].Status;

//     if (currentStatus === 'Approved') {
//       await transaction.rollback();
//       return res.status(400).json({ success: false, message: 'Leave is already approved' });
//     }

//     // Step 2: Update leave application status
//     await new sql.Request(transaction)
//       .input('ID', sql.Int, id)
//       .input('STATUS', sql.VarChar, status)
//       .input('APPROVED_BY', sql.Int, approvedBy)
//       .input('APPROVED_DATE', sql.DateTime, new Date())
//       .query(`
//         UPDATE LeaveApplication
//         SET Status = @STATUS, ApprovedBy = @APPROVED_BY, ApprovedDate = @APPROVED_DATE
//         WHERE LeaveAppID = @ID
//       `);

//     // Step 3: If approved, update LeaveBalance
//     if (status === 'Approved') {
//       const leaveInfoResult = await new sql.Request(transaction)
//         .input('ID', sql.Int, id)
//         .query(`
//           SELECT EmployeeID, LeaveTypeID, TotalDays
//           FROM LeaveApplication
//           WHERE LeaveAppID = @ID
//         `);

//       const leaveInfo = leaveInfoResult.recordset[0];

//       if (!leaveInfo) {
//         await transaction.rollback();
//         return res.status(404).json({ success: false, message: 'Leave details not found' });
//       }

//       const { EmployeeID, LeaveTypeID, TotalDays } = leaveInfo;

//       // Step 3.1: Check leave balance
//       const balanceResult = await new sql.Request(transaction)
//         .input('EMP_ID', sql.Int, EmployeeID)
//         .input('TYPE_ID', sql.Int, LeaveTypeID)
//         .query(`
//           SELECT TotalEntitled, LeaveTaken
//           FROM LeaveBalance
//           WHERE EmployeeID = @EMP_ID AND LeaveTypeID = @TYPE_ID AND [Year] = YEAR(GETDATE())
//         `);

//       const balance = balanceResult.recordset[0];

//       if (!balance) {
//         await transaction.rollback();
//         return res.status(400).json({ success: false, message: 'Leave balance record not found' });
//       }

//       const remainingLeaves = balance.TotalEntitled - balance.LeaveTaken;

//       if (TotalDays > remainingLeaves) {
//         await transaction.rollback();
//         return res.status(400).json({
//           success: false,
//           message: `Insufficient leave balance. Available: ${remainingLeaves}, Requested: ${TotalDays}`
//         });
//       }

//       // Step 4: Update LeaveTaken
//       await new sql.Request(transaction)
//         .input('EMP_ID', sql.Int, EmployeeID)
//         .input('TYPE_ID', sql.Int, LeaveTypeID)
//         .input('DAYS', sql.Int, TotalDays)
//         .query(`
//           UPDATE LeaveBalance
//           SET LeaveTaken = LeaveTaken + @DAYS,
//               LastUpdated = GETDATE()
//           WHERE EmployeeID = @EMP_ID AND LeaveTypeID = @TYPE_ID AND [Year] = YEAR(GETDATE())
//         `);
//     }

//     await transaction.commit();
//     res.status(200).json({ success: true, message: `Leave ${status.toLowerCase()} successfully` });

//   } catch (error) {
//     console.error('Error updating leave status:', error);
//     if (transaction && !transaction._aborted) {
//       try {
//         await transaction.rollback();
//       } catch (rollbackError) {
//         console.error('Rollback error:', rollbackError);
//       }
//     }
//     res.status(500).json({ success: false, message: 'Server error', error: error.message });
//   }
// };

const updateLeaveStatus = async (req, res) => {
  const { id } = req.params; // LeaveAppID
  const { status, approvedBy, remark } = req.body; // 'Approved' or 'Rejected'

  // Validate status
  if (!status || !['Approved', 'Rejected'].includes(status)) {
    return res.status(400).json({ success: false, message: 'Invalid status value' });
  }

  // Require remark if status is Rejected
  if (status === 'Rejected' && (!remark || remark.trim() === '')) {
    return res.status(400).json({ success: false, message: 'Rejection remark is required' });
  }

  let transaction;

  try {
    const pool = await getConnection();
    transaction = new sql.Transaction(pool);
    await transaction.begin();

    // Step 1: Check current status
    const currentStatusResult = await new sql.Request(transaction)
      .input('ID', sql.Int, id)
      .query(`SELECT Status FROM LeaveApplication WHERE LeaveAppID = @ID`);

    if (currentStatusResult.recordset.length === 0) {
      await transaction.rollback();
      return res.status(404).json({ success: false, message: 'Leave application not found' });
    }

    const currentStatus = currentStatusResult.recordset[0].Status;

    if (currentStatus === 'Approved') {
      await transaction.rollback();
      return res.status(400).json({ success: false, message: 'Leave is already approved' });
    }

    // Step 2: Update leave application status
    if (status === 'Rejected') {
      await new sql.Request(transaction)
        .input('ID', sql.Int, id)
        .input('STATUS', sql.VarChar, status)
        .input('APPROVED_BY', sql.Int, approvedBy)
        .input('APPROVED_DATE', sql.DateTime, new Date())
        .input('REMARK', sql.VarChar, remark)
        .query(`
          UPDATE LeaveApplication
          SET Status = @STATUS, 
              ApprovedBy = @APPROVED_BY, 
              ApprovedDate = @APPROVED_DATE, 
              RejectionRemark = @REMARK
          WHERE LeaveAppID = @ID
        `);
    } else {
      await new sql.Request(transaction)
        .input('ID', sql.Int, id)
        .input('STATUS', sql.VarChar, status)
        .input('APPROVED_BY', sql.Int, approvedBy)
        .input('APPROVED_DATE', sql.DateTime, new Date())
        .query(`
          UPDATE LeaveApplication
          SET Status = @STATUS, 
              ApprovedBy = @APPROVED_BY, 
              ApprovedDate = @APPROVED_DATE
          WHERE LeaveAppID = @ID
        `);
    }

    // Step 3: If approved, update LeaveBalance
    if (status === 'Approved') {
      const leaveInfoResult = await new sql.Request(transaction)
        .input('ID', sql.Int, id)
        .query(`
          SELECT EmployeeID, LeaveTypeID, TotalDays
          FROM LeaveApplication
          WHERE LeaveAppID = @ID
        `);

      const leaveInfo = leaveInfoResult.recordset[0];

      if (!leaveInfo) {
        await transaction.rollback();
        return res.status(404).json({ success: false, message: 'Leave details not found' });
      }

      const { EmployeeID, LeaveTypeID, TotalDays } = leaveInfo;

      // Step 3.1: Check leave balance
      const balanceResult = await new sql.Request(transaction)
        .input('EMP_ID', sql.Int, EmployeeID)
        .input('TYPE_ID', sql.Int, LeaveTypeID)
        .query(`
          SELECT TotalEntitled, LeaveTaken
          FROM LeaveBalance
          WHERE EmployeeID = @EMP_ID AND LeaveTypeID = @TYPE_ID AND [Year] = YEAR(GETDATE())
        `);

      const balance = balanceResult.recordset[0];

      if (!balance) {
        await transaction.rollback();
        return res.status(400).json({ success: false, message: 'Leave balance record not found' });
      }

      const remainingLeaves = balance.TotalEntitled - balance.LeaveTaken;

      if (TotalDays > remainingLeaves) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          message: `Insufficient leave balance. Available: ${remainingLeaves}, Requested: ${TotalDays}`
        });
      }

      // Step 4: Update LeaveTaken
      await new sql.Request(transaction)
        .input('EMP_ID', sql.Int, EmployeeID)
        .input('TYPE_ID', sql.Int, LeaveTypeID)
        .input('DAYS', sql.Int, TotalDays)
        .query(`
          UPDATE LeaveBalance
          SET LeaveTaken = LeaveTaken + @DAYS,
              LastUpdated = GETDATE()
          WHERE EmployeeID = @EMP_ID AND LeaveTypeID = @TYPE_ID AND [Year] = YEAR(GETDATE())
        `);
    }

    await transaction.commit();
    res.status(200).json({ success: true, message: `Leave ${status.toLowerCase()} successfully` });

  } catch (error) {
    console.error('Error updating leave status:', error);
    if (transaction && !transaction._aborted) {
      try {
        await transaction.rollback();
      } catch (rollbackError) {
        console.error('Rollback error:', rollbackError);
      }
    }
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

const getAllLeaveApplications = async (req, res) => {
  const { employeeId = -1, status = null } = req.query;

  try {
    const pool = await getConnection();
    const request = pool.request()
      .input('EMP_ID', sql.Int, parseInt(employeeId))
      .input('STATUS', sql.VarChar, status);

    const result = await request.query(`
      SELECT * 
      FROM LeaveApplication 
      WHERE (@EMP_ID = -1 OR EmployeeID = @EMP_ID)
        AND (@STATUS IS NULL OR Status = @STATUS)
    `);

    res.status(200).json({ success: true, data: result.recordset });
  } catch (error) {
    console.error('Error fetching leave applications:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

const getLeaveApplicationById = async (req, res) => {
  const { id } = req.params;

  try {
    const leaveId = parseInt(id);
    const pool = await getConnection();

    const result = await pool.request()
      .input('ID', sql.Int, leaveId)
      .query(`
        SELECT * FROM LeaveApplication 
        WHERE (@ID = -1 OR LeaveAppID = @ID)
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ success: false, message: 'No leave application(s) found' });
    }

    // If one item, return object. Else array.
    res.status(200).json({
      success: true,
      data: leaveId === -1 ? result.recordset : result.recordset[0],
    });
  } catch (error) {
    console.error('Error fetching leave application:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

const getPendingLeaveApplications = async (req, res) => {
  const { employeeId = -1 } = req.query;

  try {
    const pool = await getConnection();
    const request = pool.request()
      .input('EMP_ID', sql.Int, parseInt(employeeId));

    const result = await request.query(`
      SELECT * 
      FROM LeaveApplication 
      WHERE Status = 'Pending'
        AND (@EMP_ID = -1 OR EmployeeID = @EMP_ID)
    `);

    res.status(200).json({ success: true, data: result.recordset });
  } catch (error) {
    console.error('Error fetching pending leave applications:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

const getMyLeaveApplications = async (req, res) => {
  const id = parseInt(req.params.id, 10);

  try {
    const pool = await getConnection();
    let result;

    if (id === -1) {
      // id = -1 → सबका डेटा लाओ
      result = await pool.request()
        .query(`SELECT * FROM LeaveApplication`);
    } else {
      // किसी एक का डेटा लाओ
      result = await pool.request()
        .input('EMPLOYEE_ID', sql.Int, id)
        .query(`SELECT * FROM LeaveApplication WHERE EmployeeId = @EMPLOYEE_ID`);
    }

    res.status(200).json({
      success: true,
      data: result.recordset
    });
  } catch (error) {
    console.error('Error fetching leave applications:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

const deleteLeaveApplication = async (req, res) => {
  const { id } = req.params;

  try {
    const pool = await getConnection();
    const result = await pool.request()
      .input('ID', sql.Int, parseInt(id))
      .query(`
        DELETE FROM LeaveApplication
        WHERE LeaveAppID = @ID
      `);

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ success: false, message: 'Leave application not found' });
    }

    res.status(200).json({ success: true, message: 'Leave application deleted successfully' });
  } catch (error) {
    console.error('Error deleting leave application:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};


module.exports = { applyLeave,
                   updateLeaveStatus,
                   getAllLeaveApplications,
                   getLeaveApplicationById,
                   getPendingLeaveApplications,
                   getMyLeaveApplications,
                   deleteLeaveApplication
                 };