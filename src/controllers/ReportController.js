const { getConnection } = require('../config/database');
const moment = require('moment');
const PDFDocument = require('pdfkit');
const getStream = require('get-stream');

const fetchEmployees = async (pool, employeeId) => {
  let query = `SELECT userid, first_name ,
middle_name ,last_name FROM d00_emptable`;
  if (employeeId) query += ` WHERE userid = '${employeeId}'`;
  const result = await pool.request().query(query);
  return result.recordset;
};


const handleMonthlyReport = async (req, res) => {
  try {
    const pool = await getConnection();
    const { fromDate, toDate, employeeId, mode, type } = req.body;

    // Generate date range and mapping
    const start = moment(fromDate);
    const end = moment(toDate);
    const days = [];
    const dateMap = {};
    let dayIndex = 1;

    while (start <= end) {
      const dateStr = start.format('YYYY-MM-DD');
      const label = `attDate${dayIndex}`;
      days.push(label);
      dateMap[label] = dateStr;
      start.add(1, 'day');
      dayIndex++;
    }

    const employees = await fetchEmployees(pool, employeeId);

    // Fetch attendance data
    let attendanceData = [];
    if (mode === 'withtime') {
      const result = await pool.request()
        .input('fromDate', fromDate)
        .input('toDate', toDate)
        .query(`
          SELECT 
            e.userid, 
            ua_summary.AttDate,
            ua_summary.FirstInTime,
            ua_summary.LastOutTime,
            ua_summary.LastPunch
          FROM d00_emptable e
          INNER JOIN (
            SELECT 
              UserID,
              CAST(AttDateTime AS DATE) AS AttDate,
              MIN(CASE WHEN io_mode = 0 THEN AttDateTime END) AS FirstInTime,
              MAX(CASE WHEN io_mode = 1 THEN AttDateTime END) AS LastOutTime,
              MAX(AttDateTime) AS LastPunch
            FROM UserAttendance
            WHERE CAST(AttDateTime AS DATE) BETWEEN @fromDate AND @toDate
            GROUP BY UserID, CAST(AttDateTime AS DATE)
          ) ua_summary ON e.userid = ua_summary.UserID
        `);
      attendanceData = result.recordset;
    } else {
      const result = await pool.request()
        .input('fromDate', fromDate)
        .input('toDate', toDate)
        .query(`
          SELECT UserID, AttDateTime, io_mode 
          FROM UserAttendance 
          WHERE CAST(AttDateTime AS DATE) BETWEEN @fromDate AND @toDate
        `);
      attendanceData = result.recordset;
    }

    // Fetch holidays
    const holidayQuery = await pool.request()
      .input('fromDate', fromDate)
      .input('toDate', toDate)
      .query(`
        SELECT Date 
        FROM holiDaySchedule 
        WHERE CAST(Date AS DATE) BETWEEN @fromDate AND @toDate 
          AND IsActive = 1
      `);
    const holidays = holidayQuery.recordset.map(h => moment(h.Date).format('YYYY-MM-DD'));

    // Prepare attendance map
    const attMap = {};
    attendanceData.forEach(row => {
      const date = moment.utc(row.AttDateTime || row.AttDate).format('YYYY-MM-DD');
      const key = `${row.UserID || row.userid}_${date}`;
      attMap[key] = mode === 'withtime' ? {
        FirstInTime: row.FirstInTime ? moment(row.FirstInTime).format('HH:mm') : '',
        LastOutTime: row.LastOutTime ? moment(row.LastOutTime).format('HH:mm') : '',
        LastPunch: row.LastPunch ? moment(row.LastPunch).format('HH:mm') : ''
      } : 'P';
    });

    // Build report result
    const reportData = employees.map(emp => {
      const fullName = [emp.first_name, emp.middle_name, emp.last_name].filter(Boolean).join(' ');
      const row = { userid: emp.userid, username: fullName };

      days.forEach(label => {
        const date = dateMap[label];
        const key = `${emp.userid}_${date}`;
        const dayOfWeek = moment(date).day();

        if (dayOfWeek === 0) {
          row[label] = 'S'; // Sunday
        } else if (holidays.includes(date)) {
          row[label] = 'H'; // Holiday
        } else if (attMap[key]) {
          row[label] = mode === 'withtime' ? attMap[key] : 'P';
        } else {
          row[label] = 'A'; // Absent
        }
      });

      return row;
    });

    // Generate PDF or return JSON
    if (type === 'pdf') {
  const doc = new PDFDocument({ margin: 30 });
  let buffers = [];

  doc.on('data', buffers.push.bind(buffers));
  doc.on('end', async () => {
    const pdfBuffer = Buffer.concat(buffers);
    const base64Pdf = pdfBuffer.toString('base64');

    return res.status(200).json({
      isSuccess: true,
      message: 'PDF generated successfully',
      data: base64Pdf,
    });
  });

  doc.fontSize(18).text('Employee Attendance Report', { align: 'center' });
  doc.fontSize(10).text(`Generated on: ${moment().format('MM/DD/YYYY')}`, { align: 'right' });
  doc.moveDown(1);

  // Table Header
  doc.fontSize(12).text('Employee Name [EmpCode]', 30, doc.y, { continued: true });
  doc.text('Status', 200, doc.y, { continued: true });
  doc.text('In Time', 260, doc.y, { continued: true });
  doc.text('Out Time', 330, doc.y, { continued: true });
  doc.text('Department', 400, doc.y);
  doc.moveDown(0.5);

  // Add employee rows
  reportData.forEach(emp => {
    const nameWithCode = `${emp.username} [${emp.userid}]`;

    const dateKey = Object.keys(emp).find(k => k.startsWith('attDate')); // any date column
    let inTime = '';
    let outTime = '';
    let status = 'Absent';

    if (mode === 'withtime' && typeof emp[dateKey] === 'object') {
      inTime = moment(emp[dateKey].FirstInTime).format('HH:mm:ss');
      outTime = moment(emp[dateKey].LastOutTime).format('HH:mm:ss');
      status = 'Present';
    } else if (emp[dateKey] === 'P') {
      status = 'Present';
    } else if (emp[dateKey] === 'H') {
      status = 'Holiday';
    } else if (emp[dateKey] === 'S') {
      status = 'Sunday';
    }

    // You can map department if available via employee lookup
    const department = emp.department || 'Agra'; // placeholder

    doc.fontSize(10).text(nameWithCode, 30, doc.y, { continued: true });
    doc.text(status, 200, doc.y, { continued: true });
    doc.text(inTime, 260, doc.y, { continued: true });
    doc.text(outTime, 330, doc.y, { continued: true });
    doc.text(department, 400, doc.y);
  });

  doc.end();
}
 else {
      res.status(200).json({
        isSuccess: true,
        message: 'Monthly report fetched successfully',
        data: reportData
      });
    }
  } catch (error) {
    res.status(500).json({
      isSuccess: false,
      message: `Error in fetching monthly report: ${error.message}`,
      data: []
    });
  }
};


const handleDailyReport = async (req, res) => {
  try {
    const pool = await getConnection();
    const { date, employeeId } = req.body;

    // Default to today's date if no date is provided
    const day = moment(date || new Date()).format('YYYY-MM-DD');

    // 1. Fetch Employees
    const employeesQuery = `
      SELECT userid, 
             CONCAT(first_name, ' ', ISNULL(middle_name, ''), ' ', last_name) AS empname 
      FROM d00_emptable
      ${employeeId && employeeId !== -1 ? `WHERE userid = '${employeeId}'` : ''}
    `;
    const employees = (await pool.request().query(employeesQuery)).recordset;

    // 2. Fetch Attendance with In/Out Time
    const attendanceQuery = `
      SELECT 
        ua.UserID, 
        MIN(CASE WHEN ua.io_mode = 0 THEN CONVERT(VARCHAR, ua.AttDateTime, 108) END) AS FirstInTime,
        MAX(CASE WHEN ua.io_mode = 1 THEN CONVERT(VARCHAR, ua.AttDateTime, 108) END) AS LastOutTime
      FROM UserAttendance ua
      WHERE CAST(ua.AttDateTime AS DATE) = '${day}'
      GROUP BY ua.UserID
    `;
    const attendanceData = (await pool.request().query(attendanceQuery)).recordset;

    const attendanceMap = {};
    attendanceData.forEach(row => {
      attendanceMap[row.UserID] = {
        inTime: row.FirstInTime,
        outTime: row.LastOutTime
      };
    });

    // 3. Check for Holiday
    const holidayQuery = `
      SELECT Date 
      FROM holiDaySchedule 
      WHERE Date = '${day}' AND IsActive = 1
    `;
    const isHoliday = (await pool.request().query(holidayQuery)).recordset.length > 0;
    const isSunday = moment(day).day() === 0;

    // 4. Generate the days array for the report (only one day in this case)
    const days = [day]; // If you want a range, you can modify this part

    // 5. Prepare the result array to store the report data
    const result = [];

    // 6. Combine Data and Prepare Report
    employees.forEach(emp => {
      const att = attendanceMap[emp.userid];
      let status = 'A'; // Default to Absent
      let workingHours = null;

      // If employee has both FirstInTime and LastOutTime, calculate working hours
      if (att?.inTime && att?.outTime) {
        const inTime = moment(att.inTime, 'HH:mm:ss');
        const outTime = moment(att.outTime, 'HH:mm:ss');
        const duration = moment.duration(outTime.diff(inTime)); // Get the difference
        workingHours = `${duration.hours()}h ${duration.minutes()}m`; // Format it
      }

      // Iterate through each day (only one day in this case)
      days.forEach(d => {
        const key = `${emp.userid}_${d}`;
        const dayOfWeek = moment(d).day();

        if (dayOfWeek === 0) {
          status = 'S'; // Sunday
        } else if (isHoliday) {
          status = 'H'; // Holiday
        } else if (att) {
          status = 'P'; // Present (or adjust as needed)
        }

        // Populate result with the report data (including working hours)
        result.push({
          userid: emp.userid,
          empname: emp.empname.trim().replace(/\s+/g, ' '),
          date: d,
          status,
          FirstInTime: att?.inTime || null,
          LastOutTime: att?.outTime || null,
          workingHours // Add working hours as a separate parameter
        });
      });
    });

    res.status(200).json({
      isSuccess: true,
      message: 'Daily report with In/Out time and working hours fetched successfully',
      data: result
    });
  } catch (error) {
    console.error('Daily Report Error:', error.message);
    res.status(500).json({
      isSuccess: false,
      message: `Error in fetching daily report: ${error.message}`,
      data: []
    });
  }
};


const handlePunchReport = async (req, res) => {
  try {
    const pool = await getConnection();
    const { fromDate, toDate, employeeId } = req.body;

    const start = moment(fromDate || new Date()).startOf('day');
    const end = moment(toDate || new Date()).endOf('day');

    // Generate list of all dates in the range
    const days = [];
    for (let m = moment(start); m.isSameOrBefore(end); m.add(1, 'days')) {
      days.push(m.format('YYYY-MM-DD'));
    }
    // 1. Fetch Employees
    const employeesQuery = `
      SELECT userid, 
             CONCAT(first_name, ' ', ISNULL(middle_name, ''), ' ', last_name) AS empname 
      FROM d00_emptable
      ${employeeId && employeeId !== -1 ? `WHERE userid = '${employeeId}'` : ''}
    `;
    const employees = (await pool.request().query(employeesQuery)).recordset;

    // 2. Fetch Attendance for the range
    const attendanceQuery = `
      SELECT 
        ua.UserID, 
        CAST(ua.AttDateTime AS DATE) AS AttDate,
        MIN(CASE WHEN ua.io_mode = 0 THEN CONVERT(VARCHAR, ua.AttDateTime, 108) END) AS FirstInTime,
        MAX(CASE WHEN ua.io_mode = 1 THEN CONVERT(VARCHAR, ua.AttDateTime, 108) END) AS LastOutTime
      FROM UserAttendance ua
      WHERE ua.AttDateTime BETWEEN '${start.format('YYYY-MM-DD')}' AND '${end.format('YYYY-MM-DD')} 23:59:59'
      GROUP BY ua.UserID, CAST(ua.AttDateTime AS DATE)
    `;
    const attendanceData = (await pool.request().query(attendanceQuery)).recordset;

    // Map attendance per user per date
    const attendanceMap = {};
    attendanceData.forEach(row => {
      const key = `${row.UserID}_${moment(row.AttDate).format('YYYY-MM-DD')}`;
      attendanceMap[key] = {
        inTime: row.FirstInTime,
        outTime: row.LastOutTime
      };
    });

    // 3. Fetch Holidays in the range
    const holidayQuery = `
      SELECT Date 
      FROM holiDaySchedule 
      WHERE Date BETWEEN '${start.format('YYYY-MM-DD')}' AND '${end.format('YYYY-MM-DD')}'
        AND IsActive = 1
    `;
    const holidayDates = new Set(
      (await pool.request().query(holidayQuery)).recordset.map(h => moment(h.Date).format('YYYY-MM-DD'))
    );

    // 4. Prepare the result
    const result = [];

    employees.forEach(emp => {
      days.forEach(day => {
        const key = `${emp.userid}_${day}`;
        const att = attendanceMap[key];
        const dayOfWeek = moment(day).day();

        let status = 'A'; // Default to Absent
        let workingHours = null;

        if (dayOfWeek === 0) {
          status = 'S'; // Sunday
        } else if (holidayDates.has(day)) {
          status = 'H'; // Holiday
        } else if (att) {
          status = 'P'; // Present

          if (att.inTime && att.outTime) {
            const inTime = moment(att.inTime, 'HH:mm:ss');
            const outTime = moment(att.outTime, 'HH:mm:ss');
            const duration = moment.duration(outTime.diff(inTime));
            workingHours = `${duration.hours()}h ${duration.minutes()}m`;
          }
        }

        result.push({
          userid: emp.userid,
          empname: emp.empname.trim().replace(/\s+/g, ' '),
          date: day,
          status,
          FirstInTime: att?.inTime || null,
          LastOutTime: att?.outTime || null,
          workingHours
        });
      });
    });

    res.status(200).json({
      isSuccess: true,
      message: 'Report fetched successfully for date range',
      data: result
    });
  } catch (error) {
    console.error('Punch Report Error:', error.message);
    res.status(500).json({
      isSuccess: false,
      message: `Error generating report: ${error.message}`,
      data: []
    });
  }
};


// const handlePunchReport = async (req, res) => {
//   try {
//     const pool = await getConnection();
//     const { date, employeeId } = req.body;

//     // Default to today's date if no date is provided
//     const day = moment(date || new Date()).format('YYYY-MM-DD');

//     // 1. Fetch Employees
//     const employeesQuery = `
//       SELECT userid, 
//              CONCAT(first_name, ' ', ISNULL(middle_name, ''), ' ', last_name) AS empname 
//       FROM d00_emptable
//       ${employeeId && employeeId !== -1 ? `WHERE userid = '${employeeId}'` : ''}
//     `;
//     const employees = (await pool.request().query(employeesQuery)).recordset;

//     // 2. Fetch Attendance with In/Out Time
//     const attendanceQuery = `
//       SELECT 
//         ua.UserID, 
//         MIN(CASE WHEN ua.io_mode = 0 THEN CONVERT(VARCHAR, ua.AttDateTime, 108) END) AS FirstInTime,
//         MAX(CASE WHEN ua.io_mode = 1 THEN CONVERT(VARCHAR, ua.AttDateTime, 108) END) AS LastOutTime
//       FROM UserAttendance ua
//       WHERE CAST(ua.AttDateTime AS DATE) = '${day}'
//       GROUP BY ua.UserID
//     `;
//     const attendanceData = (await pool.request().query(attendanceQuery)).recordset;

//     const attendanceMap = {};
//     attendanceData.forEach(row => {
//       attendanceMap[row.UserID] = {
//         inTime: row.FirstInTime,
//         outTime: row.LastOutTime
//       };
//     });

//     // 3. Check for Holiday
//     const holidayQuery = `
//       SELECT Date 
//       FROM holiDaySchedule 
//       WHERE Date = '${day}' AND IsActive = 1
//     `;
//     const isHoliday = (await pool.request().query(holidayQuery)).recordset.length > 0;
//     const isSunday = moment(day).day() === 0;

//     // 4. Generate the days array for the report (only one day in this case)
//     const days = [day]; // If you want a range, you can modify this part

//     // 5. Prepare the result array to store the report data
//     const result = [];

//     // 6. Combine Data and Prepare Report
//     employees.forEach(emp => {
//       const att = attendanceMap[emp.userid];
//       let status = 'A'; // Default to Absent
//       let workingHours = null;

//       // If employee has both FirstInTime and LastOutTime, calculate working hours
//       if (att?.inTime && att?.outTime) {
//         const inTime = moment(att.inTime, 'HH:mm:ss');
//         const outTime = moment(att.outTime, 'HH:mm:ss');
//         const duration = moment.duration(outTime.diff(inTime)); // Get the difference
//         workingHours = `${duration.hours()}h ${duration.minutes()}m`; // Format it
//       }

//       // Iterate through each day (only one day in this case)
//       days.forEach(d => {
//         const key = `${emp.userid}_${d}`;
//         const dayOfWeek = moment(d).day();

//         if (dayOfWeek === 0) {
//           status = 'S'; // Sunday
//         } else if (isHoliday) {
//           status = 'H'; // Holiday
//         } else if (att) {
//           status = 'P'; // Present (or adjust as needed)
//         }

//         // Populate result with the report data (including working hours)
//         result.push({
//           userid: emp.userid,
//           empname: emp.empname.trim().replace(/\s+/g, ' '),
//           date: d,
//           status,
//           FirstInTime: att?.inTime || null,
//           LastOutTime: att?.outTime || null,
//           workingHours // Add working hours as a separate parameter
//         });
//       });
//     });

//     res.status(200).json({
//       isSuccess: true,
//       message: 'Daily report with In/Out time and working hours fetched successfully',
//       data: result
//     });
//   } catch (error) {
//     console.error('Daily Report Error:', error.message);
//     res.status(500).json({
//       isSuccess: false,
//       message: `Error in fetching daily report: ${error.message}`,
//       data: []
//     });
//   }
// };














module.exports = {
  handlePunchReport,
  handleDailyReport,
  handleMonthlyReport
};
