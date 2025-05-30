const { getConnection, sql } = require('../config/database');


const createLeaveMappings = async (req, res) => {
  try {
    const { leaveTypeIds, employeeTypeIds, employeeIds, type } = req.body;

    if (!Array.isArray(leaveTypeIds) || leaveTypeIds.length === 0) {
      return res.status(400).json({ success: false, message: 'leaveTypeIds is required' });
    }

    if (![1, 2].includes(type)) {
      return res.status(400).json({ success: false, message: 'Invalid type. Must be 1 or 2.' });
    }

    const pool = await getConnection();
    const transaction = new sql.Transaction(pool);
    await transaction.begin();

    const now = new Date();

    for (let leaveTypeId of leaveTypeIds) {
      // Step 1: Delete all existing mappings for this LeaveTypeId
      if (type === 1) {
        // Delete from LeaveMappingEmployeeType
        const deleteRequest = new sql.Request(transaction);
        await deleteRequest
          .input('LeaveTypeId', sql.Int, leaveTypeId)
          .query(`DELETE FROM LeaveMappingEmployeeType WHERE LeaveTypeId = @LeaveTypeId`);

        // Step 2: Insert new EmployeeType mappings for this LeaveTypeId
        for (let empTypeId of (employeeTypeIds || [])) {
          const insertRequest = new sql.Request(transaction);
          await insertRequest
            .input('LeaveTypeId', sql.Int, leaveTypeId)
            .input('EmployeeTypeId', sql.Int, empTypeId)
            .input('CreatedAt', sql.DateTime, now)
            .query(`
              INSERT INTO LeaveMappingEmployeeType (LeaveTypeId, EmployeeTypeId, CreatedAt)
              VALUES (@LeaveTypeId, @EmployeeTypeId, @CreatedAt)
            `);
        }
      } else if (type === 2) {
        // Delete from LeaveMappingEmployee
        const deleteRequest = new sql.Request(transaction);
        await deleteRequest
          .input('LeaveTypeId', sql.Int, leaveTypeId)
          .query(`DELETE FROM LeaveMappingEmployee WHERE LeaveTypeId = @LeaveTypeId`);

        // Step 2: Insert new Employee mappings for this LeaveTypeId
        for (let empId of (employeeIds || [])) {
          const insertRequest = new sql.Request(transaction);
          await insertRequest
            .input('LeaveTypeId', sql.Int, leaveTypeId)
            .input('EmployeeId', sql.Int, empId)
            .input('CreatedAt', sql.DateTime, now)
            .query(`
              INSERT INTO LeaveMappingEmployee (LeaveTypeId, EmployeeId, CreatedAt)
              VALUES (@LeaveTypeId, @EmployeeId, @CreatedAt)
            `);
        }
      }
    }

    await transaction.commit();

    res.json({
      success: true,
      message: 'Leave mappings inserted/updated successfully based on LeaveTypeId'
    });

  } catch (error) {
    console.error('Error in createLeaveMappings:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

const getAllLeaveMappings = async (req, res) => {
  try {
    const type = parseInt(req.query.type);

    if (![1, 2].includes(type)) {
      return res.status(400).json({ success: false, message: 'Invalid type. Must be 1 or 2.' });
    }

    const pool = await getConnection();

    let result;

    if (type === 1) {
      result = await pool.request().query(`
        SELECT 
          lmet.MappingId,
          lmet.LeaveTypeId,
          lt.LeaveTypeName,
          lmet.EmployeeTypeId,
          et.EmployeeTypeName,
          NULL AS EmployeeId,
          NULL AS EmployeeName,
          lmet.CreatedAt
        FROM LeaveMappingEmployeeType lmet
        LEFT JOIN LeaveType lt ON lt.LeaveTypeId = lmet.LeaveTypeId
        LEFT JOIN EmployeeType et ON et.EmployeeTypeId = lmet.EmployeeTypeId
      `);
    } else {
      result = await pool.request().query(`
        SELECT 
          lme.MappingId,
          lme.LeaveTypeId,
          lt.LeaveTypeName,
          NULL AS EmployeeTypeId,
          NULL AS EmployeeTypeName,
          lme.EmployeeId,
          e.first_name,
          lme.CreatedAt
        FROM LeaveMappingEmployee lme
        LEFT JOIN LeaveType lt ON lt.LeaveTypeId = lme.LeaveTypeId
        LEFT JOIN d00_emptable e ON e.id = lme.EmployeeId
      `);
    }

    res.json({
      success: true,
      message: 'Leave mappings fetched successfully',
      data: result.recordset
    });

  } catch (error) {
    console.error('Error in getLeaveMappingsByType:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// const getMappedLeaveTypes = async (req, res) => {
//   const { id: employeeId } = req.params;

//   if (!employeeId || isNaN(employeeId)) {
//     return res.status(400).json({
//       success: false,
//       message: 'Valid employeeId आवश्यक है'
//     });
//   }

//   try {
//     const pool = await getConnection();

//     // ✅ Step 1: d00_emptable से EmployeeTypeId प्राप्त करें
//     const empTypeResult = await pool.request()
//       .input('EMP_ID', sql.Int, employeeId)
//       .query(`SELECT EmployeeTypeId FROM d00_emptable WHERE id = @EMP_ID`);

//     if (empTypeResult.recordset.length === 0) {
//       return res.status(404).json({
//         success: false,
//         message: 'Employee नहीं मिला'
//       });
//     }

//     const employeeTypeId = empTypeResult.recordset[0].EmployeeTypeId;

//     // ✅ Step 2: दोनों mapping tables से LeaveTypeIDs निकालें
//     const result = await pool.request()
//       .input('EMP_ID', sql.Int, employeeId)
//       .input('EMP_TYPE_ID', sql.Int, employeeTypeId)
//       .query(`
//         SELECT DISTINCT LT.LeaveTypeID, LT.LeaveTypeName, LT.Description, LT.MaxDaysAllowed
//         FROM LeaveType LT
//         WHERE LT.LeaveTypeID IN (
//           SELECT LeaveTypeId FROM LeaveMappingEmployee WHERE EmployeeId = @EMP_ID
//           UNION
//           SELECT LeaveTypeId FROM LeaveMappingEmployeeType WHERE EmployeeTypeId = @EMP_TYPE_ID
//         )
//         AND LT.IsActive = 1
//       `);

//     return res.status(200).json({
//       success: true,
//       data: result.recordset
//     });

//   } catch (error) {
//     console.error('Error in getMappedLeaveTypes:', error);
//     return res.status(500).json({
//       success: false,
//       message: 'Server error',
//       error: error.message
//     });
//   }
// };

const getMappedLeaveTypes = async (req, res) => {
  const { id: employeeId } = req.params;

  if (!employeeId || isNaN(employeeId)) {
    return res.status(400).json({
      success: false,
      message: 'Valid employeeId आवश्यक है'
    });
  }

  try {
    const pool = await getConnection();

    // Step 1: EmployeeTypeId निकालें
    const empTypeResult = await pool.request()
      .input('EMP_ID', sql.Int, employeeId)
      .query(`SELECT EmployeeTypeId FROM d00_emptable WHERE id = @EMP_ID`);

    if (empTypeResult.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Employee नहीं मिला'
      });
    }

    const employeeTypeId = empTypeResult.recordset[0].EmployeeTypeId;

    // Step 2: Check if direct mappings exist
    const directMapResult = await pool.request()
      .input('EMP_ID', sql.Int, employeeId)
      .query(`
        SELECT LeaveTypeId FROM LeaveMappingEmployee WHERE EmployeeId = @EMP_ID
      `);

    let leaveTypeIds = [];

    if (directMapResult.recordset.length > 0) {
      // Direct mapping मिल गया, वही use करेंगे
      leaveTypeIds = directMapResult.recordset.map(r => r.LeaveTypeId);
    } else {
      // Direct mapping नहीं मिला, EmployeeType से निकालेंगे
      const typeMapResult = await pool.request()
        .input('EMP_TYPE_ID', sql.Int, employeeTypeId)
        .query(`
          SELECT LeaveTypeId FROM LeaveMappingEmployeeType WHERE EmployeeTypeId = @EMP_TYPE_ID
        `);

      leaveTypeIds = typeMapResult.recordset.map(r => r.LeaveTypeId);
    }

    if (leaveTypeIds.length === 0) {
      return res.status(200).json({
        success: true,
        data: []
      });
    }

    // Step 3: LeaveType Details लाना
    const result = await pool.request()
      .query(`
        SELECT DISTINCT LT.LeaveTypeID, LT.LeaveTypeName, LT.Description, LT.MaxDaysAllowed
        FROM LeaveType LT
        WHERE LT.LeaveTypeID IN (${leaveTypeIds.join(',')})
        AND LT.IsActive = 1
      `);

    return res.status(200).json({
      success: true,
      data: result.recordset
    });

  } catch (error) {
    console.error('Error in getMappedLeaveTypes:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};


const deleteAllLeaveMappings = async (req, res) => {
  try {
    const pool = await getConnection();
    await pool.request().query(`DELETE FROM LeaveMapping`);

    res.json({
      success: true,
      message: "All leave mappings deleted successfully"
    });
  } catch (error) {
    console.error('Error in deleteAllLeaveMappings:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

module.exports = {
    createLeaveMappings,
    getAllLeaveMappings,
    deleteAllLeaveMappings,
    getMappedLeaveTypes
};

