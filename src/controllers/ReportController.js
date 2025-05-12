const { getConnection } = require('../config/database');
const moment = require('moment');

const fetchEmployees = async (pool, employeeId) => {
  let query = `SELECT userid, empname FROM d00_emptable`;
  if (employeeId) query += ` WHERE userid = '${employeeId}'`;
  const result = await pool.request().query(query);
  return result.recordset;
};

const handleMonthlyReport = async (req, res) => {
  try {
    const pool = await getConnection();
    const { fromDate, toDate, employeeId } = req.body;

    const start = moment(fromDate);
    const end = moment(toDate);
    const days = [];
    while (start <= end) {
      days.push(start.format('YYYY-MM-DD'));
      start.add(1, 'day');
    }

    const employees = await fetchEmployees(pool, employeeId);

    const attendanceQuery = await pool.request().query(`
      SELECT UserID, AttDateTime, io_mode 
      FROM UserAttendance 
      WHERE CAST(AttDateTime AS DATE) BETWEEN '${fromDate}' AND '${toDate}'
    `);

    const holidayQuery = await pool.request().query(`
      SELECT HolidayDate FROM holiday_master 
      WHERE CAST(HolidayDate AS DATE) BETWEEN '${fromDate}' AND '${toDate}'
    `);

    const holidays = holidayQuery.recordset.map(h => moment(h.HolidayDate).format('YYYY-MM-DD'));
    const attMap = {};

    attendanceQuery.recordset.forEach(row => {
      const date = moment(row.AttDateTime).format('YYYY-MM-DD');
      const key = `${row.UserID}_${date}`;
      attMap[key] = 'P';
    });

    const result = employees.map(emp => {
      const row = { empname: emp.empname, userid: emp.userid };
      days.forEach(d => {
        const key = `${emp.userid}_${d}`;
        const dayOfWeek = moment(d).day();
        if (attMap[key]) row[d] = 'P';
        else if (holidays.includes(d)) row[d] = 'H';
        else if (dayOfWeek === 0) row[d] = 'S';
        else row[d] = 'A';
      });
      return row;
    });

    res.status(200).json({
      isSuccess: true,
      message: 'Monthly report fetched successfully',
      data: result
    });
  } catch (error) {
    console.error('Monthly Report Error:', error.message);
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

    const day = moment(date).format('YYYY-MM-DD');
    const employees = await fetchEmployees(pool, employeeId);

    const attendanceQuery = await pool.request().query(`
      SELECT DISTINCT UserID 
      FROM UserAttendance 
      WHERE CAST(AttDateTime AS DATE) = '${day}'
    `);

    const holidayQuery = await pool.request().query(`
      SELECT HolidayDate FROM holiday_master WHERE HolidayDate = '${day}'
    `);

    const presentIds = attendanceQuery.recordset.map(r => r.UserID);
    const isHoliday = holidayQuery.recordset.length > 0;
    const dayOfWeek = moment(day).day();

    const result = employees.map(emp => {
      const status = presentIds.includes(emp.userid)
        ? 'P'
        : isHoliday
        ? 'H'
        : dayOfWeek === 0
        ? 'S'
        : 'A';
      return { userid: emp.userid, empname: emp.empname, date: day, status };
    });

    res.status(200).json({
      isSuccess: true,
      message: 'Daily report fetched successfully',
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

    const punchQuery = await pool.request().query(`
      SELECT e.userid, e.empname, ua.AttDateTime, ua.io_mode
      FROM d00_emptable e
      JOIN UserAttendance ua ON e.userid = ua.UserID
      WHERE CAST(ua.AttDateTime AS DATE) BETWEEN '${fromDate}' AND '${toDate}'
      ${employeeId ? `AND e.userid = '${employeeId}'` : ''}
      ORDER BY ua.AttDateTime ASC
    `);

    const grouped = {};
    punchQuery.recordset.forEach(p => {
      const date = moment(p.AttDateTime).format('YYYY-MM-DD');
      const key = `${p.userid}_${date}`;
      if (!grouped[key]) {
        grouped[key] = {
          userid: p.userid,
          empname: p.empname,
          date,
          inTime: null,
          outTime: null,
        };
      }
      if (p.io_mode === 0 && !grouped[key].inTime) grouped[key].inTime = p.AttDateTime;
      if (p.io_mode === 1) grouped[key].outTime = p.AttDateTime;
    });

    res.status(200).json({
      isSuccess: true,
      message: 'Punch report fetched successfully',
      data: Object.values(grouped)
    });
  } catch (error) {
    console.error('Punch Report Error:', error.message);
    res.status(500).json({
      isSuccess: false,
      message: `Error in fetching punch report: ${error.message}`,
      data: []
    });
  }
};

module.exports = {
  handlePunchReport,
  handleDailyReport,
  handleMonthlyReport
};
