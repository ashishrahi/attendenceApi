const { getConnection, sql } = require('../config/database');

const Dasboarddata = async (req, res) => {
  try {
    const { type } = req.body;
    const pool = await getConnection();

    // Type 1: Summary (Total, Present, Absent counts)
    if (type === 1) {
      const totalEmpQuery = await pool.request()
        .query(`SELECT COUNT(*) AS total_employees FROM d00_emptable`);

      const presentEmpQuery = await pool.request()
        .query(`SELECT COUNT(DISTINCT UserID) AS present_employees 
                FROM [UserAttendance] 
                WHERE CONVERT(date, AttDateTime) = CONVERT(date, GETDATE())`);

      const total = totalEmpQuery.recordset[0].total_employees;
      const present = presentEmpQuery.recordset[0].present_employees;
      const absent = total - present;

      return res.json({
        success: true,
        message: 'count Retrieved',
        data: {
          total_employees: total,
          present_employees: present,
          absent_employees: absent
        }
      });
    }

    // Type 2: All employee details
    if (type === 2) {
      const detailQuery = await pool.request()
        .query(`SELECT *
                FROM d00_emptable`);

      return res.json({
        success: true,
        message: 'Total Employee Retrieved',
        data: detailQuery.recordset
      });
    }

    // Type 3: Present employee list
    if (type === 3) {
      const presentQuery = await pool.request()
        .query(`SELECT DISTINCT e.*
                FROM d00_emptable e
                INNER JOIN [UserAttendance] ua ON e.userid = ua.UserID
                WHERE CONVERT(date, ua.AttDateTime) = CONVERT(date, GETDATE())`);

      return res.json({
        success: true,
        message: 'Present Employee Retrieved',
        data: presentQuery.recordset
      });
    }

    // Type 4: Absent employee list
    if (type === 4) {
      const absentQuery = await pool.request()
        .query(`SELECT e.*
                FROM d00_emptable e
                WHERE e.userid NOT IN (
                  SELECT DISTINCT UserID 
                  FROM [UserAttendance] 
                  WHERE CONVERT(date, AttDateTime) = CONVERT(date, GETDATE())
                )`);

      return res.json({
        success: true,
        message: 'Absent Employee Retrieved',
        data: absentQuery.recordset
      });
    }

    // Default: Invalid type
    return res.status(400).json({
      success: false,
      message: 'Invalid type'
    });

  } catch (error) {
    console.error('Error in Dasboarddata:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

module.exports = {
  Dasboarddata
};
