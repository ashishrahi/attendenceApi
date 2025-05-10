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
        .query(`SELECT COUNT(DISTINCT e.userid) AS present_employees
                FROM [UserAttendance] ua
                JOIN d00_emptable e ON ua.UserID = e.userid
                WHERE CONVERT(date, ua.AttDateTime) = CONVERT(date, GETDATE())`);
    
      const lateEmpQuery = await pool.request()
        .query(`
          SELECT COUNT(*) AS late_count
          FROM d00_emptable e
          JOIN shift_master s ON e.shiftid = s.id
          JOIN (
              SELECT 
                  UserID, 
                  MIN(AttDateTime) AS FirstInTime
              FROM UserAttendance
              WHERE CAST(AttDateTime AS DATE) = CAST(GETDATE() AS DATE)
              GROUP BY UserID
          ) ua_summary ON e.userid = ua_summary.UserID
          WHERE ua_summary.FirstInTime > 
                CAST(CONVERT(varchar, GETDATE(), 23) + ' ' + CONVERT(varchar, s.intime, 108) AS datetime)
        `);
    
      const earlyEmpQuery = await pool.request()
        .query(`
          SELECT COUNT(*) AS early_count
          FROM d00_emptable e
          JOIN shift_master s ON e.shiftid = s.id
          JOIN (
              SELECT 
                  ua.UserID,
                  MAX(CASE WHEN ua.io_mode = 1 THEN ua.AttDateTime END) AS LastOutTime,
                  MAX(ua.AttDateTime) AS LastPunch,
                  MAX(CASE WHEN ua.AttDateTime = max_att.LastPunchTime THEN ua.io_mode END) AS LastPunchMode
              FROM UserAttendance ua
              JOIN (
                  SELECT 
                      UserID, 
                      MAX(AttDateTime) AS LastPunchTime
                  FROM UserAttendance
                  WHERE CAST(AttDateTime AS DATE) = CAST(GETDATE() AS DATE)
                  GROUP BY UserID
              ) max_att ON ua.UserID = max_att.UserID
                       AND ua.AttDateTime = max_att.LastPunchTime
              WHERE CAST(ua.AttDateTime AS DATE) = CAST(GETDATE() AS DATE)
              GROUP BY ua.UserID, max_att.LastPunchTime
          ) ua_summary ON e.userid = ua_summary.UserID
          WHERE ua_summary.LastOutTime < 
                CAST(CONVERT(varchar, GETDATE(), 23) + ' ' + CONVERT(varchar, s.outtime, 108) AS datetime)
            AND ua_summary.LastPunchMode = 1
        `);
    
      const total = totalEmpQuery.recordset[0].total_employees;
      const present = presentEmpQuery.recordset[0].present_employees;
      const absent = total - present;
      const late = lateEmpQuery.recordset[0].late_count;
      const early = earlyEmpQuery.recordset[0].early_count;
    
      return res.json({
        success: true,
        message: 'count Retrieved',
        data: {
          total_employees: total,
          present_employees: present,
          absent_employees: absent,
          late_employees: late,
          early_employees: early
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
        .query(`SELECT 
            e.*, 
            ua_summary.FirstInTime,
            ua_summary.LastOutTime,
            ua_summary.LastPunch
        FROM 
            d00_emptable e
        INNER JOIN (
            SELECT 
                UserID,
                MIN(CASE WHEN io_mode = 0 THEN AttDateTime END) AS FirstInTime,
                MAX(CASE WHEN io_mode = 1 THEN AttDateTime END) AS LastOutTime,
                MAX(AttDateTime) AS LastPunch
            FROM 
                UserAttendance
            WHERE 
                CAST(AttDateTime AS DATE) = CAST(GETDATE() AS DATE)
            GROUP BY 
                UserID
        ) ua_summary ON e.userid = ua_summary.UserID;
                `);

      return res.json({
        success: true,
        message: 'Present Employee Retrieved',
        data: presentQuery.recordset
      });
    }

    // Type 4: Absent employee list
    if (type === 4) {
      const absentQuery = await pool.request()
        .query(`SELECT 
              e.*, 
              ua_summary.FirstInTime,
              ua_summary.LastOutTime,
              ua_summary.LastPunch
            FROM 
              d00_emptable e
            LEFT JOIN (
              SELECT 
                UserID,
                MIN(CASE WHEN io_mode = 0 THEN AttDateTime END) AS FirstInTime,
                MAX(CASE WHEN io_mode = 1 THEN AttDateTime END) AS LastOutTime,
                MAX(AttDateTime) AS LastPunch
              FROM 
                UserAttendance
              WHERE 
                CAST(AttDateTime AS DATE) = CAST(GETDATE() AS DATE)
              GROUP BY 
                UserID
            ) ua_summary ON e.userid = ua_summary.UserID
            WHERE ua_summary.UserID IS NULL;`);

      return res.json({
        success: true,
        message: 'Absent Employee Retrieved',
        data: absentQuery.recordset
      });
    }

    if (type === 5) {
      const earlyLeaversQuery = await pool.request().query(`
        SELECT 
            e.*, 
            s.shiftname, 
            s.intime AS ShiftInTime, 
            s.outtime AS ShiftOutTime,
            first_time.FirstInTime,
            ua_summary.LastOutTime,
            ua_summary.LastPunch
        FROM 
            d00_emptable e
        JOIN 
            shift_master s ON e.shiftid = s.id
        JOIN (
            SELECT 
                ua.UserID,
                MAX(CASE WHEN ua.io_mode = 1 THEN ua.AttDateTime END) AS LastOutTime,
                MAX(ua.AttDateTime) AS LastPunch,
                MAX(CASE WHEN ua.AttDateTime = max_att.LastPunchTime THEN ua.io_mode END) AS LastPunchMode
            FROM 
                UserAttendance ua
            JOIN (
                SELECT 
                    UserID, 
                    MAX(AttDateTime) AS LastPunchTime
                FROM 
                    UserAttendance
                WHERE 
                    CAST(AttDateTime AS DATE) = CAST(GETDATE() AS DATE)
                GROUP BY 
                    UserID
            ) max_att ON ua.UserID = max_att.UserID
                     AND ua.AttDateTime = max_att.LastPunchTime
            WHERE 
                CAST(ua.AttDateTime AS DATE) = CAST(GETDATE() AS DATE)
            GROUP BY 
                ua.UserID, max_att.LastPunchTime
        ) ua_summary ON e.userid = ua_summary.UserID
        JOIN (
            SELECT 
                UserID, 
                MIN(AttDateTime) AS FirstInTime
            FROM 
                UserAttendance
            WHERE 
                CAST(AttDateTime AS DATE) = CAST(GETDATE() AS DATE)
            GROUP BY 
                UserID
        ) first_time ON e.userid = first_time.UserID
        WHERE 
            ua_summary.LastOutTime < 
                CAST(CONVERT(varchar, GETDATE(), 23) + ' ' + CONVERT(varchar, s.outtime, 108) AS datetime)
            AND ua_summary.LastPunchMode = 1;
      `);
    
      return res.json({
        success: true,
        message: 'Early leavers retrieved',
        data: earlyLeaversQuery.recordset
      });
    }
    
    if (type === 6) {
      const Latecomerquery = await pool.request()
        .query(`
          SELECT 
              e.*, 
              s.shiftname, 
              s.intime AS ShiftInTime, 
              s.outtime AS ShiftOutTime,
              ua_summary.FirstInTime,
              ua_summary.LastOutTime,
              ua_summary.LastPunch
          FROM 
              d00_emptable e
          JOIN 
              shift_master s ON e.shiftid = s.id
          JOIN (
              SELECT 
                  ua.UserID,
                  MIN(ua.AttDateTime) AS FirstInTime,
                  MAX(CASE WHEN ua.io_mode = 1 THEN ua.AttDateTime END) AS LastOutTime,
                  MAX(ua.AttDateTime) AS LastPunch
              FROM 
                  UserAttendance ua
              WHERE 
                  CAST(ua.AttDateTime AS DATE) = CAST(GETDATE() AS DATE)
              GROUP BY 
                  ua.UserID
          ) ua_summary ON e.userid = ua_summary.UserID
          WHERE 
              ua_summary.FirstInTime > CAST(CONVERT(varchar, GETDATE(), 23) + ' ' + CONVERT(varchar, s.intime, 108) AS datetime);


        `);
    
      return res.json({
        success: true,
        message: 'late comer retrieved',
        data: Latecomerquery.recordset
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
