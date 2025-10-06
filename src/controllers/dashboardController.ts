import { Request, Response } from 'express';
import { getConnection, sql } from '../config/database';
import { DashboardRequestBody } from '../types/dashboardTypes';


const DashboardData = async (req: Request, res: Response) => {
  try {
    const { type }: DashboardRequestBody = req.body;
    const pool = await getConnection();

    // Type 1: Summary (Total, Present, Absent, Late, Early)
    if (type === 1) {
      const totalEmpQuery = await pool.request().query(`SELECT COUNT(*) AS total_employees FROM d00_emptable`);
      const presentEmpQuery = await pool.request().query(`
        SELECT COUNT(DISTINCT e.userid) AS present_employees
        FROM UserAttendance ua
        JOIN d00_emptable e ON ua.UserID = e.userid
        WHERE CONVERT(date, ua.AttDateTime) = CONVERT(date, GETDATE())
      `);
      const lateEmpQuery = await pool.request().query(`
        SELECT COUNT(*) AS late_count
        FROM d00_emptable e
        JOIN shift_master s ON e.shiftid = s.id
        JOIN (
            SELECT UserID, MIN(AttDateTime) AS FirstInTime
            FROM UserAttendance
            WHERE CAST(AttDateTime AS DATE) = CAST(GETDATE() AS DATE)
            GROUP BY UserID
        ) ua_summary ON e.userid = ua_summary.UserID
        WHERE ua_summary.FirstInTime > CAST(CONVERT(varchar, GETDATE(), 23) + ' ' + CONVERT(varchar, s.intime, 108) AS datetime)
      `);
      const earlyEmpQuery = await pool.request().query(`
        SELECT COUNT(*) AS early_count
        FROM d00_emptable e
        JOIN shift_master s ON e.shiftid = s.id
        JOIN (
            SELECT ua.UserID,
                   MAX(CASE WHEN ua.io_mode = 1 THEN ua.AttDateTime END) AS LastOutTime,
                   MAX(ua.AttDateTime) AS LastPunch,
                   MAX(CASE WHEN ua.AttDateTime = max_att.LastPunchTime THEN ua.io_mode END) AS LastPunchMode
            FROM UserAttendance ua
            JOIN (
                SELECT UserID, MAX(AttDateTime) AS LastPunchTime
                FROM UserAttendance
                WHERE CAST(AttDateTime AS DATE) = CAST(GETDATE() AS DATE)
                GROUP BY UserID
            ) max_att ON ua.UserID = max_att.UserID AND ua.AttDateTime = max_att.LastPunchTime
            WHERE CAST(ua.AttDateTime AS DATE) = CAST(GETDATE() AS DATE)
            GROUP BY ua.UserID, max_att.LastPunchTime
        ) ua_summary ON e.userid = ua_summary.UserID
        WHERE ua_summary.LastOutTime < CAST(CONVERT(varchar, GETDATE(), 23) + ' ' + CONVERT(varchar, s.outtime, 108) AS datetime)
              AND ua_summary.LastPunchMode = 1
      `);

      const total = totalEmpQuery.recordset[0].total_employees;
      const present = presentEmpQuery.recordset[0].present_employees;
      const absent = total - present;
      const late = lateEmpQuery.recordset[0].late_count;
      const early = earlyEmpQuery.recordset[0].early_count;

      return res.json({
        success: true,
        message: 'Counts retrieved successfully',
        data: { total_employees: total, present_employees: present, absent_employees: absent, late_employees: late, early_employees: early }
      });
    }

    // Type 2: All employee details
    if (type === 2) {
      const detailQuery = await pool.request().query(`SELECT * FROM d00_emptable`);
      return res.json({
        success: true,
        message: 'Total employees retrieved',
        data: detailQuery.recordset
      });
    }

    // Type 3: Present employee list
    if (type === 3) {
      const presentQuery = await pool.request().query(`
        SELECT e.*, ua_summary.FirstInTime, ua_summary.LastOutTime, ua_summary.LastPunch,
               CONVERT(varchar, DATEADD(SECOND, DATEDIFF(SECOND, ua_summary.FirstInTime, ua_summary.LastOutTime), 0), 108) AS WorkingHours
        FROM d00_emptable e
        INNER JOIN (
            SELECT UserID,
                   MIN(CASE WHEN io_mode = 0 THEN AttDateTime END) AS FirstInTime,
                   MAX(CASE WHEN io_mode = 1 THEN AttDateTime END) AS LastOutTime,
                   MAX(AttDateTime) AS LastPunch
            FROM UserAttendance
            WHERE CAST(AttDateTime AS DATE) = CAST(GETDATE() AS DATE)
            GROUP BY UserID
        ) ua_summary ON e.userid = ua_summary.UserID
      `);
      return res.json({ success: true, message: 'Present employees retrieved', data: presentQuery.recordset });
    }

    // Type 4: Absent employee list
    if (type === 4) {
      const absentQuery = await pool.request().query(`
        SELECT e.*, ua_summary.FirstInTime, ua_summary.LastOutTime, ua_summary.LastPunch
        FROM d00_emptable e
        LEFT JOIN (
            SELECT UserID,
                   MIN(CASE WHEN io_mode = 0 THEN AttDateTime END) AS FirstInTime,
                   MAX(CASE WHEN io_mode = 1 THEN AttDateTime END) AS LastOutTime,
                   MAX(AttDateTime) AS LastPunch
            FROM UserAttendance
            WHERE CAST(AttDateTime AS DATE) = CAST(GETDATE() AS DATE)
            GROUP BY UserID
        ) ua_summary ON e.userid = ua_summary.UserID
        WHERE ua_summary.UserID IS NULL
      `);
      return res.json({ success: true, message: 'Absent employees retrieved', data: absentQuery.recordset });
    }

    // Type 5: Early leavers
    if (type === 5) {
      const earlyLeaversQuery = await pool.request().query(`
        SELECT e.*, s.shiftname, s.intime AS ShiftInTime, s.outtime AS ShiftOutTime,
               first_time.FirstInTime, ua_summary.LastOutTime, ua_summary.LastPunch,
               CONVERT(varchar, DATEADD(SECOND, DATEDIFF(SECOND, first_time.FirstInTime, ua_summary.LastOutTime), 0), 108) AS WorkingHours
        FROM d00_emptable e
        JOIN shift_master s ON e.shiftid = s.id
        JOIN (
            SELECT ua.UserID,
                   MAX(CASE WHEN ua.io_mode = 1 THEN ua.AttDateTime END) AS LastOutTime,
                   MAX(ua.AttDateTime) AS LastPunch,
                   MAX(CASE WHEN ua.AttDateTime = max_att.LastPunchTime THEN ua.io_mode END) AS LastPunchMode
            FROM UserAttendance ua
            JOIN (
                SELECT UserID, MAX(AttDateTime) AS LastPunchTime
                FROM UserAttendance
                WHERE CAST(AttDateTime AS DATE) = CAST(GETDATE() AS DATE)
                GROUP BY UserID
            ) max_att ON ua.UserID = max_att.UserID AND ua.AttDateTime = max_att.LastPunchTime
            WHERE CAST(ua.AttDateTime AS DATE) = CAST(GETDATE() AS DATE)
            GROUP BY ua.UserID, max_att.LastPunchTime
        ) ua_summary ON e.userid = ua_summary.UserID
        JOIN (
            SELECT UserID, MIN(AttDateTime) AS FirstInTime
            FROM UserAttendance
            WHERE CAST(AttDateTime AS DATE) = CAST(GETDATE() AS DATE)
            GROUP BY UserID
        ) first_time ON e.userid = first_time.UserID
        WHERE ua_summary.LastOutTime < CAST(CONVERT(varchar, GETDATE(), 23) + ' ' + CONVERT(varchar, s.outtime, 108) AS datetime)
              AND ua_summary.LastPunchMode = 1
      `);
      return res.json({ success: true, message: 'Early leavers retrieved', data: earlyLeaversQuery.recordset });
    }

    // Type 6: Late comers
    if (type === 6) {
      const lateComerQuery = await pool.request().query(`
        SELECT e.*, s.shiftname, s.intime AS ShiftInTime, s.outtime AS ShiftOutTime,
               ua_summary.FirstInTime, ua_summary.LastOutTime, ua_summary.LastPunch,
               CONVERT(varchar, DATEADD(SECOND, DATEDIFF(SECOND, ua_summary.FirstInTime, ua_summary.LastOutTime), 0), 108) AS WorkingHours
        FROM d00_emptable e
        JOIN shift_master s ON e.shiftid = s.id
        JOIN (
            SELECT UserID,
                   MIN(AttDateTime) AS FirstInTime,
                   MAX(CASE WHEN io_mode = 1 THEN AttDateTime END) AS LastOutTime,
                   MAX(AttDateTime) AS LastPunch
            FROM UserAttendance
            WHERE CAST(AttDateTime AS DATE) = CAST(GETDATE() AS DATE)
            GROUP BY UserID
        ) ua_summary ON e.userid = ua_summary.UserID
        WHERE ua_summary.FirstInTime > CAST(CONVERT(varchar, GETDATE(), 23) + ' ' + CONVERT(varchar, s.intime, 108) AS datetime)
      `);
      return res.json({ success: true, message: 'Late comers retrieved', data: lateComerQuery.recordset });
    }

    // Type 7: Weekly present employee count
    if (type === 7) {
      const weeklyPresentQuery = await pool.request().query(`
        ;WITH LastDays AS (
          SELECT CAST(GETDATE() AS DATE) AS DayDate
          UNION ALL
          SELECT DATEADD(DAY, -1, DayDate)
          FROM LastDays
          WHERE DATEADD(DAY, -1, DayDate) >= DATEADD(DAY, -13, CAST(GETDATE() AS DATE))
        ),
        FilteredDays AS (
          SELECT TOP 7 DayDate
          FROM LastDays
          WHERE DATEPART(WEEKDAY, DayDate) != 1
          ORDER BY DayDate DESC
        )
        SELECT DATENAME(weekday, F.DayDate) AS DayName,
               F.DayDate AS AttDate,
               ISNULL(COUNT(DISTINCT ua.UserID), 0) AS PresentCount
        FROM FilteredDays F
        LEFT JOIN UserAttendance ua ON CAST(ua.AttDateTime AS DATE) = F.DayDate
        GROUP BY F.DayDate
        ORDER BY F.DayDate
        OPTION (MAXRECURSION 14)
      `);
      return res.json({ success: true, message: 'Weekly present employee data retrieved', data: weeklyPresentQuery.recordset });
    }

    // Invalid type
    return res.status(400).json({ success: false, message: 'Invalid type' });

  } catch (error: any) {
    console.error('Error in DashboardData:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

export { DashboardData };
