const { getConnection, sql } = require('../config/database');


// const applyLeave = async (req, res) => {
//   const {
//     employeeId,
//     leaveTypeId,
//     fromDate,
//     toDate,
//     reason,
//     status // optional, default = 'Pending'
//   } = req.body;

//   try {
//     const from = new Date(fromDate);
//     const to = new Date(toDate);
//     const totalDays = Math.floor((to - from) / (1000 * 60 * 60 * 24)) + 1;
//     const currentYear = new Date().getFullYear();
//     const currentDate = new Date().toISOString().split('T')[0];

//     const pool = await getConnection();

//     // ✅ Step 0: Overlapping leave check
//     const overlapResult = await pool.request()
//       .input('EMPLOYEE_ID', sql.Int, employeeId)
//       .input('FROM_DATE', sql.SmallDateTime, from)
//       .input('TO_DATE', sql.SmallDateTime, to)
//       .query(`
//         SELECT FromDate, ToDate FROM LeaveApplication
//         WHERE EmployeeID = @EMPLOYEE_ID
//           AND (FromDate <= @TO_DATE AND ToDate >= @FROM_DATE)
//       `);

//     if (overlapResult.recordset.length > 0) {
//       const overlappingRanges = overlapResult.recordset.map(r => ({
//         from: new Date(r.FromDate),
//         to: new Date(r.ToDate)
//       }));

//       const minFrom = new Date(Math.min(...overlappingRanges.map(r => r.from.getTime())));
//       const maxTo = new Date(Math.max(...overlappingRanges.map(r => r.to.getTime())));

//       const nextAvailableDate = new Date(maxTo);
//       nextAvailableDate.setDate(nextAvailableDate.getDate() + 1);

//       return res.status(400).json({
//         success: false,
//         message: `You have already applied for leave from ${minFrom.toISOString().split('T')[0]} to ${maxTo.toISOString().split('T')[0]}. You can apply for leave on or after ${nextAvailableDate.toISOString().split('T')[0]}.`
//       });
//     }

//     // ✅ Step 1: Insert into LeaveApplication with ApprovedDays = 0
//     await pool.request()
//       .input('EMPLOYEE_ID', sql.Int, employeeId)
//       .input('LEAVE_TYPE_ID', sql.Int, leaveTypeId)
//       .input('FROM_DATE', sql.SmallDateTime, from)
//       .input('TO_DATE', sql.SmallDateTime, to)
//       .input('REASON', sql.NVarChar(500), reason)
//       .input('STATUS', sql.NVarChar(50), status || 'Pending')
//       .input('TOTAL_DAYS', sql.Int, totalDays)
//       .input('APPROVED_DAYS', sql.Int, 0)
//       .input('APPLIED_DATE', sql.DateTime, new Date())
//       .query(`
//         INSERT INTO LeaveApplication 
//         (EmployeeID, LeaveTypeID, FromDate, ToDate, Reason, Status, TotalDays, ApprovedDays, AppliedDate)
//         VALUES 
//         (@EMPLOYEE_ID, @LEAVE_TYPE_ID, @FROM_DATE, @TO_DATE, @REASON, @STATUS, @TOTAL_DAYS, @APPROVED_DAYS, @APPLIED_DATE);
//       `);

//     // ✅ Step 2: Check LeaveBalance
//     const result = await pool.request()
//       .input('EMP_ID', sql.Int, employeeId)
//       .input('LEAVE_TYPE_ID', sql.Int, leaveTypeId)
//       .input('YEAR', sql.Int, currentYear)
//       .query(`
//         SELECT * FROM LeaveBalance
//         WHERE EmployeeID = @EMP_ID AND LeaveTypeID = @LEAVE_TYPE_ID AND Year = @YEAR
//       `);

//     if (result.recordset.length > 0) {
//       const leaveRecord = result.recordset[0];
//       const availableLeaves = leaveRecord.TotalEntitled - leaveRecord.LeaveTaken;

//       if (availableLeaves < totalDays) {
//         return res.status(400).json({
//           success: false,
//           message: `You have only ${availableLeaves} leave(s) available, but you have requested ${totalDays} day(s).`
//         });
//       }

//       // 🔴 Step 3a removed
//     } else {
//       // ✅ Step 3b: Fetch entitlement from LeaveType
//       const typeResult = await pool.request()
//         .input('LEAVE_TYPE_ID', sql.Int, leaveTypeId)
//         .query(`
//           SELECT MaxDaysAllowed FROM LeaveType
//           WHERE LeaveTypeId = @LEAVE_TYPE_ID
//         `);

//       const entitledDays = typeResult.recordset[0]?.MaxDaysAllowed || 0;

//       if (entitledDays < totalDays) {
//         return res.status(400).json({
//           success: false,
//           message: `You are entitled to only ${entitledDays} day(s) for this leave type, but you have requested ${totalDays} day(s).`
//         });
//       }

//       // ✅ Step 3c: Insert new LeaveBalance
//       await pool.request()
//         .input('EMP_ID', sql.Int, employeeId)
//         .input('LEAVE_TYPE_ID', sql.Int, leaveTypeId)
//         .input('ENTITLED', sql.Int, entitledDays)
//         .input('TAKEN', sql.Int, 0) // 🆕 Taken should be 0 at apply time
//         .input('LAST_UPDATED', sql.DateTime, new Date())
//         .input('YEAR', sql.Int, currentYear)
//         .input('EFFECTIVE_DATE', sql.Date, currentDate)
//         .query(`
//           INSERT INTO LeaveBalance 
//           (EmployeeID, LeaveTypeID, TotalEntitled, LeaveTaken, LastUpdated, Year, EffectiveDate)
//           VALUES 
//           (@EMP_ID, @LEAVE_TYPE_ID, @ENTITLED, @TAKEN, @LAST_UPDATED, @YEAR, @EFFECTIVE_DATE)
//         `);
//     }

//     // ✅ Final success response
//     res.status(201).json({ success: true, message: 'Leave applied successfully.' });

//   } catch (error) {
//     console.error('Error:', error);
//     res.status(500).json({ success: false, message: 'Server error occurred.', error: error.message });
//   }
// };

const applyLeave = async (req, res) => {
  const {
    employeeId,
    leaveTypeId,
    fromDate,
    toDate,
    reason,
    status // optional, default = 'Pending'
  } = req.body;

  try {
    const from = new Date(fromDate);
    const to = new Date(toDate);
    const totalDays = Math.floor((to - from) / (1000 * 60 * 60 * 24)) + 1;
    const currentYear = new Date().getFullYear();
    const currentDate = new Date().toISOString().split('T')[0];

    const pool = await getConnection();

    // ✅ Step 0.1: Check if the leave type is mapped to this employee
    const mappingResult = await pool.request()
      .input('EMP_ID', sql.Int, employeeId)
      .input('LEAVE_TYPE_ID', sql.Int, leaveTypeId)
      .query(`
        SELECT 1 FROM LeaveMappingEmployee 
        WHERE LeaveTypeId = @LEAVE_TYPE_ID AND EmployeeId = @EMP_ID

        UNION

        SELECT 1 FROM LeaveMappingEmployeeType 
        WHERE LeaveTypeId = @LEAVE_TYPE_ID AND EmployeeTypeId = (
          SELECT EmployeeTypeId FROM d00_emptable WHERE id = @EMP_ID
        )
      `);

    if (mappingResult.recordset.length === 0) {
      return res.status(403).json({
        success: false,
        message: 'यह leave type आपके लिए उपलब्ध नहीं है।'
      });
    }

    // ✅ Step 0.2: Overlapping leave check
    const overlapResult = await pool.request()
      .input('EMPLOYEE_ID', sql.Int, employeeId)
      .input('FROM_DATE', sql.SmallDateTime, from)
      .input('TO_DATE', sql.SmallDateTime, to)
      .query(`
        SELECT FromDate, ToDate FROM LeaveApplication
        WHERE EmployeeID = @EMPLOYEE_ID
          AND (FromDate <= @TO_DATE AND ToDate >= @FROM_DATE)
      `);

    if (overlapResult.recordset.length > 0) {
      const overlappingRanges = overlapResult.recordset.map(r => ({
        from: new Date(r.FromDate),
        to: new Date(r.ToDate)
      }));

      const minFrom = new Date(Math.min(...overlappingRanges.map(r => r.from.getTime())));
      const maxTo = new Date(Math.max(...overlappingRanges.map(r => r.to.getTime())));

      const nextAvailableDate = new Date(maxTo);
      nextAvailableDate.setDate(nextAvailableDate.getDate() + 1);

      return res.status(400).json({
        success: false,
        message: `आप पहले से ${minFrom.toISOString().split('T')[0]} से ${maxTo.toISOString().split('T')[0]} तक छुट्टी के लिए आवेदन कर चुके हैं। कृपया ${nextAvailableDate.toISOString().split('T')[0]} या इसके बाद की तारीख के लिए आवेदन करें।`
      });
    }

    // ✅ Step 1: Insert into LeaveApplication with ApprovedDays = 0
    await pool.request()
      .input('EMPLOYEE_ID', sql.Int, employeeId)
      .input('LEAVE_TYPE_ID', sql.Int, leaveTypeId)
      .input('FROM_DATE', sql.SmallDateTime, from)
      .input('TO_DATE', sql.SmallDateTime, to)
      .input('REASON', sql.NVarChar(500), reason)
      .input('STATUS', sql.NVarChar(50), status || 'Pending')
      .input('TOTAL_DAYS', sql.Int, totalDays)
      .input('APPROVED_DAYS', sql.Int, 0)
      .input('APPLIED_DATE', sql.DateTime, new Date())
      .query(`
        INSERT INTO LeaveApplication 
        (EmployeeID, LeaveTypeID, FromDate, ToDate, Reason, Status, TotalDays, ApprovedDays, AppliedDate)
        VALUES 
        (@EMPLOYEE_ID, @LEAVE_TYPE_ID, @FROM_DATE, @TO_DATE, @REASON, @STATUS, @TOTAL_DAYS, @APPROVED_DAYS, @APPLIED_DATE);
      `);

    // ✅ Step 2: Check LeaveBalance
    const result = await pool.request()
      .input('EMP_ID', sql.Int, employeeId)
      .input('LEAVE_TYPE_ID', sql.Int, leaveTypeId)
      .input('YEAR', sql.Int, currentYear)
      .query(`
        SELECT * FROM LeaveBalance
        WHERE EmployeeID = @EMP_ID AND LeaveTypeID = @LEAVE_TYPE_ID AND Year = @YEAR
      `);

    if (result.recordset.length > 0) {
      const leaveRecord = result.recordset[0];
      const availableLeaves = leaveRecord.TotalEntitled - leaveRecord.LeaveTaken;

      if (availableLeaves < totalDays) {
        return res.status(400).json({
          success: false,
          message: `आपके पास केवल ${availableLeaves} छुट्टी(याँ) उपलब्ध हैं, जबकि आपने ${totalDays} दिन की छुट्टी मांगी है।`
        });
      }

    } else {
      // ✅ Step 3b: Fetch entitlement from LeaveType
      const typeResult = await pool.request()
        .input('LEAVE_TYPE_ID', sql.Int, leaveTypeId)
        .query(`
          SELECT MaxDaysAllowed FROM LeaveType
          WHERE LeaveTypeId = @LEAVE_TYPE_ID
        `);

      const entitledDays = typeResult.recordset[0]?.MaxDaysAllowed || 0;

      if (entitledDays < totalDays) {
        return res.status(400).json({
          success: false,
          message: `आपको इस leave type के लिए केवल ${entitledDays} दिन की अनुमति है, लेकिन आपने ${totalDays} दिन मांगे हैं।`
        });
      }

      // ✅ Step 3c: Insert new LeaveBalance
      await pool.request()
        .input('EMP_ID', sql.Int, employeeId)
        .input('LEAVE_TYPE_ID', sql.Int, leaveTypeId)
        .input('ENTITLED', sql.Int, entitledDays)
        .input('TAKEN', sql.Int, 0)
        .input('LAST_UPDATED', sql.DateTime, new Date())
        .input('YEAR', sql.Int, currentYear)
        .input('EFFECTIVE_DATE', sql.Date, currentDate)
        .query(`
          INSERT INTO LeaveBalance 
          (EmployeeID, LeaveTypeID, TotalEntitled, LeaveTaken, LastUpdated, Year, EffectiveDate)
          VALUES 
          (@EMP_ID, @LEAVE_TYPE_ID, @ENTITLED, @TAKEN, @LAST_UPDATED, @YEAR, @EFFECTIVE_DATE)
        `);
    }

    // ✅ Final success response
    res.status(201).json({ success: true, message: 'Leave applied successfully.' });

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, message: 'Server error occurred.', error: error.message });
  }
};

const updateLeaveStatus = async (req, res) => {
  const { id } = req.params; // LeaveAppID
  const { status, approvedBy, remark, approvedDays } = req.body;

  // Validate status
  if (!status || !['Approved', 'Rejected'].includes(status)) {
    return res.status(400).json({ success: false, message: 'Invalid status value' });
  }

  if (status === 'Rejected' && (!remark || remark.trim() === '')) {
    return res.status(400).json({ success: false, message: 'Rejection remark is required' });
  }

  let transaction;

  try {
    const pool = await getConnection();
    transaction = new sql.Transaction(pool);
    await transaction.begin();

    // Fetch existing leave info
    const leaveInfoResult = await new sql.Request(transaction)
      .input('ID', sql.Int, id)
      .query(`SELECT Status, EmployeeID, LeaveTypeID, TotalDays FROM LeaveApplication WHERE LeaveAppID = @ID`);

    if (leaveInfoResult.recordset.length === 0) {
      await transaction.rollback();
      return res.status(404).json({ success: false, message: 'Leave application not found' });
    }

    const leaveInfo = leaveInfoResult.recordset[0];

    if (leaveInfo.Status === 'Approved') {
      await transaction.rollback();
      return res.status(400).json({ success: false, message: 'Leave is already approved' });
    }

    // If Approved, validate approvedDays
    let approvedDaysToUse = leaveInfo.TotalDays;
    if (status === 'Approved') {
      if (typeof approvedDays !== 'number' || approvedDays <= 0) {
        await transaction.rollback();
        return res.status(400).json({ success: false, message: 'approvedDays must be a positive number when approving leave' });
      }
      if (approvedDays > leaveInfo.TotalDays) {
        await transaction.rollback();
        return res.status(400).json({ success: false, message: 'approvedDays cannot be greater than requested TotalDays' });
      }
      approvedDaysToUse = approvedDays;
    }

    // Update leave application status and approvedDays
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
        .input('APPROVED_DAYS', sql.Int, approvedDaysToUse)
        .query(`
          UPDATE LeaveApplication
          SET Status = @STATUS,
              ApprovedBy = @APPROVED_BY,
              ApprovedDate = @APPROVED_DATE,
              ApprovedDays = @APPROVED_DAYS
          WHERE LeaveAppID = @ID
        `);
    }

    // If approved, update leave balance accordingly
    if (status === 'Approved') {
      // Check leave balance
      const balanceResult = await new sql.Request(transaction)
        .input('EMP_ID', sql.Int, leaveInfo.EmployeeID)
        .input('TYPE_ID', sql.Int, leaveInfo.LeaveTypeID)
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

      if (approvedDaysToUse > remainingLeaves) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          message: `Insufficient leave balance. Available: ${remainingLeaves}, Approved: ${approvedDaysToUse}`
        });
      }

      // Update LeaveTaken
      await new sql.Request(transaction)
        .input('EMP_ID', sql.Int, leaveInfo.EmployeeID)
        .input('TYPE_ID', sql.Int, leaveInfo.LeaveTypeID)
        .input('DAYS', sql.Int, approvedDaysToUse)
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
  const employeeId = parseInt(req.params.id) || -1;
  const { status = null } = req.body;

  try {
    const pool = await getConnection();
    const request = pool.request()
      .input('EMP_ID', sql.Int, employeeId)
      .input('STATUS', sql.VarChar, status);

    if (employeeId === -1) {
      // Step 1: Fetch latest leave for each employee
      const query = `
        SELECT la.* FROM LeaveApplication la
        INNER JOIN (
          SELECT EmployeeID, MAX(FromDate) AS MaxFromDate
          FROM LeaveApplication
          WHERE (@STATUS IS NULL OR Status = @STATUS)
          GROUP BY EmployeeID
        ) latest ON la.EmployeeID = latest.EmployeeID AND la.FromDate = latest.MaxFromDate
        WHERE (@STATUS IS NULL OR la.Status = @STATUS)
        ORDER BY la.EmployeeID
      `;

      const result = await request.query(query);
      const leaveApps = result.recordset;

      // Step 2: Fetch all leave balances
      const balanceResult = await pool.request().query(`
        SELECT 
          EmployeeID, LeaveTypeID, 
          TotalEntitled, LeaveTaken,
          (TotalEntitled - LeaveTaken) AS RemainingLeave
        FROM LeaveBalance
      `);
      const balances = balanceResult.recordset;

      // Step 3: Attach RemainingLeave to each leave application
      const enrichedData = leaveApps.map(app => {
        const match = balances.find(b =>
          b.EmployeeID === app.EmployeeID && b.LeaveTypeID === app.LeaveTypeID
        );
        return {
          ...app,
          RemainingLeave: match ? match.RemainingLeave : null
        };
      });

      res.status(200).json({ success: true, data: enrichedData });

    } else {
      // Step 1: Get all leave applications for the employee
      const query = `
        SELECT * 
        FROM LeaveApplication
        WHERE EmployeeID = @EMP_ID
          AND (@STATUS IS NULL OR Status = @STATUS)
        ORDER BY FromDate DESC
      `;

      const result = await request.query(query);
      const records = result.recordset;

      if (records.length === 0) {
        return res.status(200).json({ success: true, data: [] });
      }

      // Step 2: Fetch leave balances for this employee
      const balanceResult = await pool.request()
        .input('EMP_ID', sql.Int, employeeId)
        .query(`
          SELECT 
            LeaveTypeID, 
            (TotalEntitled - LeaveTaken) AS RemainingLeave
          FROM LeaveBalance
          WHERE EmployeeID = @EMP_ID
        `);

      const balances = balanceResult.recordset;

      // Step 3: Attach RemainingLeave to each leave application
      const enrichedRecords = records.map(app => {
        const match = balances.find(b => b.LeaveTypeID === app.LeaveTypeID);
        return {
          ...app,
          RemainingLeave: match ? match.RemainingLeave : null
        };
      });

      const [parent, ...children] = enrichedRecords;

      res.status(200).json({
        success: true,
        data: [{ parent, children }]
      });
    }

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
  const employeeId = parseInt(req.params.id, 10); // कर्मचारी का ID

  if (isNaN(employeeId)) {
    return res.status(400).json({ success: false, message: 'कर्मचारी ID अमान्य है' });
  }

  try {
    const pool = await getConnection();
    const result = await pool.request()
      .input('EMP_ID', sql.Int, employeeId)
      .query(`
        SELECT 
          LeaveAppID, LeaveTypeID, FromDate, ToDate, TotalDays,
          Status, ApprovedDate, RejectionRemark
        FROM LeaveApplication
        WHERE EmployeeID = @EMP_ID
          AND Status IN ('Approved', 'Rejected') -- केवल अंतिम स्थिति
          AND ApprovedDate IS NOT NULL -- केवल वही जिनका निर्णय हो चुका है
        ORDER BY ApprovedDate DESC
      `);

    res.status(200).json({
      success: true,
      data: result.recordset
    });

  } catch (error) {
    console.error('Error fetching leave notifications:', error);
    res.status(500).json({ success: false, message: 'सर्वर में त्रुटि', error: error.message });
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