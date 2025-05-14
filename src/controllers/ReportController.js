const { getConnection } = require('../config/database');
const moment = require('moment');
const PDFDocument = require('pdfkit');
const getStream = require('get-stream');
const fs = require('fs');
const path = require('path');
const ExcelJS = require('exceljs');

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
              MAX(CASE WHEN io_mode = 1  THEN AttDateTime END) AS LastOutTime,
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

const reportData = employees.map(emp => {
  const fullName = [emp.first_name, emp.middle_name, emp.last_name].filter(Boolean).join(' ');
  const row = {
    userid: emp.userid,
    username: fullName,
    S: 0,
    H: 0,
    P: 0,
    A: 0,
    EL: 0,
    LC: 0
  };

  days.forEach(label => {
    const date = dateMap[label];
    const key = `${emp.userid}_${date}`;
    const dayOfWeek = moment(date).day();

    if (dayOfWeek === 0) {
      row[label] = 'S';
      row.S += 1;
    } else if (holidays.includes(date)) {
      row[label] = 'H';
      row.H += 1;
    } else if (attMap[key]) {
      const att = attMap[key];

      if (mode === 'withtime' && typeof att === 'object') {
        const inTime = att.FirstInTime;
        const outTime = att.LastOutTime;

        // ✅ Shift टाइमिंग निकालें (default दे सकते हैं या emp.shift से fetch कर सकते हैं)
        const shiftIn = emp.shift_in_time || '09:30';    // HH:mm format
        const shiftOut = emp.shift_out_time || '18:00';  // HH:mm format

        console.log("emp.shift_in_time",emp.shift_in_time)

        // ✅ Late Come Check
        if (inTime && moment(inTime, 'HH:mm').isAfter(moment(shiftIn, 'HH:mm'))) {
          row.LC += 1;
        }

        // ✅ Early Leave Check
        if (outTime && moment(outTime, 'HH:mm').isBefore(moment(shiftOut, 'HH:mm'))) {
          row.EL += 1;
        }

        row[label] = mode === 'withtime' ? attMap[key] : 'P';
      } else {
        row[label] = 'P';
      }

      row.P += 1;
    } else {
      row[label] = 'A';
      row.A += 1;
    }
  });

  return row;
});


    // ✅ Return base64-encoded PDF
    if (type === 'pdf') {
      const doc = new PDFDocument({ margin: 20, size: 'A4', layout: 'landscape' });
      const buffers = [];

      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfData = Buffer.concat(buffers);
        const base64PDF = pdfData.toString('base64');

        res.status(200).json({
          isSuccess: true,
          message: 'PDF generated successfully',
          base64: base64PDF,
        });
      });

      const usablePageWidth = 595.28 - 40;
      const fixedLeftWidth = 150;
      const dynamicWidth = usablePageWidth - fixedLeftWidth;
      const dayCount = days.length;
      const colWidth = Math.floor(dynamicWidth / dayCount) + 8;

      doc.fillColor('#0A5275').fontSize(16).font('Helvetica-Bold').text('Monthly Attendance Report', { align: 'center' });
      doc.moveDown(0.3);
      doc.fillColor('black').fontSize(10).text(`From: ${fromDate} To: ${toDate}`, { align: 'center' });
      doc.moveDown(1);

      // Table headers
      let x = 20;
      let y = doc.y;

      doc.font('Helvetica-Bold').fontSize(8);

      doc.rect(x, y, 30, 25).fillAndStroke('#D6EAF8', '#000').fillColor('black');
      doc.text('UserID', x + 2, y + 6);
      x += 30;

      doc.rect(x, y, 80, 25).fillAndStroke('#D6EAF8', '#000').fillColor('black');
      doc.text('Name', x + 5, y + 6);
      x += 80;

      days.forEach((day, i) => {
        const dayNum = i + 1;
        doc.rect(x, y, colWidth, 25).fillAndStroke('#AED6F1', '#000').fillColor('black');
        if (colWidth < 18) {
          doc.save();
          doc.text(dayNum.toString(), x + 6, y + 20, { width: 20, align: 'left' });
          doc.restore();
        } else {
          doc.text(dayNum.toString(), x + 2, y + 6, { width: colWidth - 4, align: 'center' });
        }
        x += colWidth;
      });

      y += 25;

      reportData.forEach(emp => {
        x = 20;
        if (y > 550) {
          doc.addPage({ layout: 'landscape' });
          y = 30;
        }

        doc.fillColor('black').font('Helvetica').fontSize(6);

        doc.rect(x, y, 30, 20).stroke();
        doc.text(emp.userid.toString(), x + 2, y + 4, { width: 28, align: 'left' });
        x += 30;

        doc.rect(x, y, 80, 20).stroke();
        doc.text(emp.username, x + 2, y + 4, { width: 78, align: 'left' });
        x += 80;

        days.forEach(day => {
          const value = emp[day];
          let display = '';

          if (mode === 'withtime' && typeof value === 'object') {
            const inTime = value.FirstInTime || '--';
            const outTime = value.LastOutTime || '--';
            display = `${inTime}-${outTime}`;
          } else {
            display = value || '-';
          }

          doc.rect(x, y, colWidth, 20).stroke();
          doc.text(display, x + 1, y + 4, { width: colWidth - 2, align: 'center' });
          x += colWidth;
        });

        y += 20;
      });

      doc.end();
    } 
    else if (type === 'excel') {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Monthly Attendance Report', {
        pageSetup: {
          paperSize: 9, // A4 paper
          orientation: 'landscape' // Landscape orientation
        }
      });

      // Title
      worksheet.mergeCells('A1:Z1');
      worksheet.getCell('A1').value = 'Monthly Attendance Report';
      worksheet.getCell('A1').alignment = { vertical: 'middle', horizontal: 'center' };
      worksheet.getCell('A1').font = { bold: true, size: 16 };

      // Date Range
      worksheet.mergeCells('A2:Z2');
      worksheet.getCell('A2').value = `From: ${fromDate} To: ${toDate}`;
      worksheet.getCell('A2').alignment = { vertical: 'middle', horizontal: 'center' };
      worksheet.getCell('A2').font = { size: 10 };

      // Table Header
      const headerColumns = [
        { header: 'UserID', width: 10, alignment: 'left' },
        { header: 'Name', width: 20, alignment: 'left' }
      ];

      // Add day columns
      days.forEach((day, i) => {
        const dayNum = i + 1;
        headerColumns.push({
          header: dayNum.toString(),
          width: 8,
          alignment: 'center'
        });
      });

      // Set column widths and headers
      headerColumns.forEach((col, idx) => {
        worksheet.getColumn(idx + 1).width = col.width;
        worksheet.getCell(3, idx + 1).value = col.header;
        worksheet.getCell(3, idx + 1).alignment = { vertical: 'middle', horizontal: col.alignment };
        worksheet.getCell(3, idx + 1).font = { bold: true, size: 10 };
      });

      // Add data rows
      reportData.forEach((emp, rowIndex) => {
        const row = [
          emp.userid.toString(),
          emp.username
        ];

        // Add data for each day
        days.forEach(day => {
          const value = emp[day];
          let display = '';

          if (mode === 'withtime' && typeof value === 'object') {
            const inTime = value.FirstInTime || '--';
            const outTime = value.LastOutTime || '--';
            display = `${inTime}-${outTime}`;
          } else {
            display = value || '-';
          }

          row.push(display);
        });

        // Insert row into worksheet
        worksheet.addRow(row);
        const rowIdx = rowIndex + 4;
        worksheet.getRow(rowIdx).eachCell((cell, colNumber) => {
          const column = headerColumns[colNumber - 1];
          cell.alignment = { vertical: 'middle', horizontal: column.alignment };
        });
      });

      // Convert to Buffer
      const buffer = await workbook.xlsx.writeBuffer();

      // Convert buffer to Base64
      const base64Excel = buffer.toString('base64');

      // Send Base64 response
      res.status(200).json({
        isSuccess: true,
        message: 'Excel report generated successfully',
        base64: base64Excel
      });
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
    const { date, employeeId, type } = req.body;

    const day = moment(date || new Date()).format('YYYY-MM-DD');

    const employeesQuery = `
      SELECT userid, 
             CONCAT(first_name, ' ', ISNULL(middle_name, ''), ' ', last_name) AS empname 
      FROM d00_emptable
      ${employeeId && employeeId !== -1 ? `WHERE userid = '${employeeId}'` : ''}
    `;
    const employees = (await pool.request().query(employeesQuery)).recordset;

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

    const holidayQuery = `
      SELECT Date 
      FROM holiDaySchedule 
      WHERE Date = '${day}' AND IsActive = 1
    `;
    const isHoliday = (await pool.request().query(holidayQuery)).recordset.length > 0;
    const isSunday = moment(day).day() === 0;

    const days = [day];
    const result = [];

    employees.forEach(emp => {
      const att = attendanceMap[emp.userid];
      let status = 'A';
      let workingHours = null;

      if (att?.inTime && att?.outTime) {
        const inTime = moment(att.inTime, 'HH:mm:ss');
        const outTime = moment(att.outTime, 'HH:mm:ss');
        const duration = moment.duration(outTime.diff(inTime));
        workingHours = `${duration.hours()}h ${duration.minutes()}m`;
      }

      days.forEach(d => {
        const dayOfWeek = moment(d).day();

        if (dayOfWeek === 0) {
          status = 'S';
        } else if (isHoliday) {
          status = 'H';
        } else if (att) {
          status = 'P';
        }

        result.push({
          userid: emp.userid,
          empname: emp.empname.trim().replace(/\s+/g, ' '),
          date: d,
          status,
          FirstInTime: att?.inTime || null,
          LastOutTime: att?.outTime || null,
          workingHours
        });
      });
    });

    // ✅ PDF output
    if (type === 'pdf') {
      const doc = new PDFDocument({ margin: 30, size: 'A4', layout: 'portrait' });
      const buffers = [];

      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfData = Buffer.concat(buffers);
        const base64PDF = pdfData.toString('base64');

        res.status(200).json({
          isSuccess: true,
          message: 'Daily PDF report generated successfully',
          base64: base64PDF
        });
      });

      doc.fillColor('#0A5275').fontSize(16).font('Helvetica-Bold').text('Daily Attendance Report', { align: 'center' });
      doc.moveDown(0.3);
      doc.fillColor('black').fontSize(10).text(`Date: ${day}`, { align: 'center' });
      doc.moveDown(1);

      const columns = [
        { label: 'UserID', width: 60 },
        { label: 'Name', width: 120 },
        { label: 'Status', width: 60 },
        { label: 'In Time', width: 80 },
        { label: 'Out Time', width: 80 },
        { label: 'Working Hours', width: 100 }
      ];

      const tableWidth = columns.reduce((acc, col) => acc + col.width, 0);
      let x = (595.28 - tableWidth) / 2; // Center horizontally on A4 width
      let y = doc.y;

      // Header
      doc.font('Helvetica-Bold').fontSize(9);
      columns.forEach((col, i) => {
        doc.rect(x, y, col.width, 25).fillAndStroke('#D6EAF8', '#000').fillColor('black');
        const align = i === 0 ? 'right' : 'left';
        doc.text(col.label, x + 5, y + 7, { width: col.width - 10, align });
        x += col.width;
      });

      y += 25;

      // Rows
      doc.font('Helvetica').fontSize(8);
      result.forEach(row => {
        x = (595.28 - tableWidth) / 2;
        if (y > 770) {
          doc.addPage({ layout: 'portrait' });
          y = 40;
        }

        const rowData = [
          row.userid.toString(),
          row.empname,
          row.status,
          row.FirstInTime || '--',
          row.LastOutTime || '--',
          row.workingHours || '--'
        ];

        rowData.forEach((text, i) => {
          const col = columns[i];
          doc.rect(x, y, col.width, 20).stroke();

          const align = i === 0 ? 'right' : 'left';
          doc.text(text, x + 5, y + 6, { width: col.width - 10, align });
          x += col.width;
        });

        y += 20;
      });

      doc.end();
    }
    else if (type === 'excel') {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Daily Attendance Report', {
        pageSetup: { paperSize: 9, orientation: 'portrait' }
      });

      // Title
      worksheet.mergeCells('A1:F1');
      worksheet.getCell('A1').value = 'Daily Attendance Report';
      worksheet.getCell('A1').alignment = { vertical: 'middle', horizontal: 'center' };
      worksheet.getCell('A1').font = { bold: true, size: 14 };

      // Date
      worksheet.mergeCells('A2:F2');
      worksheet.getCell('A2').value = `Date: ${day}`;
      worksheet.getCell('A2').alignment = { vertical: 'middle', horizontal: 'center' };
      worksheet.getCell('A2').font = { size: 10 };

      // Table Header
      const columns = [
        { header: 'UserID', width: 10, alignment: 'right' },
        { header: 'Name', width: 20, alignment: 'left' },
        { header: 'Status', width: 10, alignment: 'left' },
        { header: 'In Time', width: 15, alignment: 'left' },
        { header: 'Out Time', width: 15, alignment: 'left' },
        { header: 'Working Hours', width: 20, alignment: 'left' }
      ];

      worksheet.addRow(columns.map(col => col.header));
      columns.forEach((col, idx) => {
        worksheet.getColumn(idx + 1).width = col.width;
        worksheet.getCell(3, idx + 1).alignment = { vertical: 'middle', horizontal: 'center' };
        worksheet.getCell(3, idx + 1).font = { bold: true };
      });

      // Data Rows
      result.forEach((row, index) => {
        worksheet.addRow([
          row.userid.toString(),
          row.empname,
          row.status,
          row.FirstInTime || '--',
          row.LastOutTime || '--',
          row.workingHours || '--'
        ]);

        const rowIndex = index + 4;
        worksheet.getRow(rowIndex).eachCell((cell, colNumber) => {
          const column = columns[colNumber - 1];
          cell.alignment = { vertical: 'middle', horizontal: column.alignment };
        });
      });

      // Convert to Buffer
      const buffer = await workbook.xlsx.writeBuffer();

      // Convert buffer to Base64
      const base64Excel = buffer.toString('base64');

      // Send Base64 response
      res.status(200).json({
        isSuccess: true,
        message: 'Excel report generated successfully',
        base64: base64Excel
      });
    } else {
      res.status(200).json({
        isSuccess: true,
        message: 'Daily report with In/Out time and working hours fetched successfully',
        data: result
      });
    }

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
    const { fromDate, toDate, employeeId, type } = req.body;

    const start = moment(fromDate || new Date()).startOf('day');
    const end = moment(toDate || new Date()).endOf('day');

    const days = [];
    for (let m = moment(start); m.isSameOrBefore(end); m.add(1, 'days')) {
      days.push(m.format('YYYY-MM-DD'));
    }

    const employeesQuery = `
      SELECT userid, 
             CONCAT(first_name, ' ', ISNULL(middle_name, ''), ' ', last_name) AS empname 
      FROM d00_emptable
      ${employeeId && employeeId !== -1 ? `WHERE userid = '${employeeId}'` : ''}
    `;
    const employees = (await pool.request().query(employeesQuery)).recordset;

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

    const attendanceMap = {};
    attendanceData.forEach(row => {
      const key = `${row.UserID}_${moment(row.AttDate).format('YYYY-MM-DD')}`;
      attendanceMap[key] = {
        inTime: row.FirstInTime,
        outTime: row.LastOutTime
      };
    });

    const holidayQuery = `
      SELECT Date 
      FROM holiDaySchedule 
      WHERE Date BETWEEN '${start.format('YYYY-MM-DD')}' AND '${end.format('YYYY-MM-DD')}'
        AND IsActive = 1
    `;
    const holidayDates = new Set(
      (await pool.request().query(holidayQuery)).recordset.map(h => moment(h.Date).format('YYYY-MM-DD'))
    );

    const result = [];

    employees.forEach(emp => {
      days.forEach(day => {
        const key = `${emp.userid}_${day}`;
        const att = attendanceMap[key];
        const dayOfWeek = moment(day).day();

        let status = 'A';
        let workingHours = null;

        if (dayOfWeek === 0) {
          status = 'S';
        } else if (holidayDates.has(day)) {
          status = 'H';
        } else if (att) {
          status = 'P';

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
          FirstInTime: att?.inTime || '--',
          LastOutTime: att?.outTime || '--',
          workingHours: workingHours || '--'
        });
      });
    });

    // Export as PDF
    if (type === 'pdf') {
      const doc = new PDFDocument({ margin: 30, size: 'A4', layout: 'portrait' });
      const buffers = [];

      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfData = Buffer.concat(buffers);
        const base64PDF = pdfData.toString('base64');

        return res.status(200).json({
          isSuccess: true,
          message: 'Punching Report PDF generated successfully',
          base64: base64PDF
        });
      });

      doc.fillColor('#0A5275').fontSize(16).font('Helvetica-Bold').text('Punching Attendance Report', { align: 'center' });
      doc.moveDown(0.3);
      doc.fillColor('black').fontSize(10).text(`From: ${fromDate} To: ${toDate}`, { align: 'center' });
      doc.moveDown(1);

      const columns = [
        { label: 'UserID', width: 50 },
        { label: 'Name', width: 120 },
        { label: 'Date', width: 70 },
        { label: 'Status', width: 50 },
        { label: 'In Time', width: 80 },
        { label: 'Out Time', width: 80 },
        { label: 'Working Hours', width: 100 }
      ];

      let tableWidth = columns.reduce((sum, col) => sum + col.width, 0);
      let x = (595.28 - tableWidth) / 2;
      let y = doc.y;

      doc.font('Helvetica-Bold').fontSize(9);
      columns.forEach((col, i) => {
        doc.rect(x, y, col.width, 25).fillAndStroke('#D6EAF8', '#000').fillColor('black');
        const align = typeof result[0][col.label.toLowerCase()] === 'number' ? 'right' : 'left';
        doc.text(col.label, x + 5, y + 7, { width: col.width - 10, align });
        x += col.width;
      });

      y += 25;
      doc.font('Helvetica').fontSize(8);

      result.forEach(row => {
        x = (595.28 - tableWidth) / 2;
        if (y > 770) {
          doc.addPage();
          y = 40;
        }

        const rowData = [
          row.userid,
          row.empname,
          row.date,
          row.status,
          row.FirstInTime,
          row.LastOutTime,
          row.workingHours
        ];

        rowData.forEach((text, i) => {
          const col = columns[i];
          doc.rect(x, y, col.width, 20).stroke();
          const align = typeof text === 'number' ? 'right' : 'left';
          doc.text(text.toString(), x + 5, y + 6, { width: col.width - 10, align });
          x += col.width;
        });

        y += 20;
      });

      doc.end();
    }

    // Export as Excel
    else if (type === 'excel') {
      const workbook = new ExcelJS.Workbook();
      const sheet = workbook.addWorksheet('Punching Report');

      const headers = ['UserID', 'Name', 'Date', 'Status', 'In Time', 'Out Time', 'Working Hours'];
      sheet.addRow(headers);

      // Styles
      sheet.columns = [
        { width: 10 }, // UserID
        { width: 25 }, // Name
        { width: 15 }, // Date
        { width: 10 }, // Status
        { width: 15 }, // In Time
        { width: 15 }, // Out Time
        { width: 20 }  // Working Hours
      ];

      sheet.getRow(1).eachCell(cell => {
        cell.font = { bold: true };
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'D6EAF8' }
        };
        cell.alignment = { horizontal: 'center' };
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
      });

      result.forEach(row => {
        const rowData = [
          row.userid,
          row.empname,
          row.date,
          row.status,
          row.FirstInTime,
          row.LastOutTime,
          row.workingHours
        ];
        const inserted = sheet.addRow(rowData);
        inserted.eachCell((cell, colNumber) => {
          cell.alignment = {
            horizontal: typeof rowData[colNumber - 1] === 'number' ? 'right' : 'left'
          };
          cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
          };
        });
      });

      const buffer = await workbook.xlsx.writeBuffer();
      const base64Excel = buffer.toString('base64');

      res.status(200).json({
        isSuccess: true,
        message: 'Punching Report Excel generated successfully',
        base64: base64Excel
      });
    } else {
      // Normal JSON response if no type is provided
      res.status(200).json({
        isSuccess: true,
        message: 'Punching Report data retrieved',
        data: result
      });
    }
  } catch (error) {
    console.error('Punch Report Error:', error.message);
    res.status(500).json({
      isSuccess: false,
      message: `Error generating report: ${error.message}`,
      data: []
    });
  }
};

function formatDurationToHHMMSS(duration, showNegativeAsZero = true) {
    if (!duration || typeof duration.asMilliseconds !== 'function') {
        return '--';
    }
    let ms = duration.asMilliseconds();

    if (ms < 0) {
        if (showNegativeAsZero) {
            return '00:00:00';
        }
    }
    
    const nonNegativeMs = Math.max(0, ms); // Ensures ms is not negative for calculations

    const totalSeconds = Math.round(nonNegativeMs / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}


function formatSignedDurationForColumnE(duration, allottedDuration, actualBreakDuration) {
    if (!duration || typeof duration.asMilliseconds !== 'function' ||
        !allottedDuration || typeof allottedDuration.asMilliseconds !== 'function' ||
        !actualBreakDuration || typeof actualBreakDuration.asMilliseconds !== 'function') {
        return '--';
    }

    if (actualBreakDuration.asMilliseconds() <= allottedDuration.asMilliseconds()) {
        return '00:00:00';
    } else {
        const ms = duration.asMilliseconds(); // Will be negative here, as duration = allotted - actual
        const absTotalSeconds = Math.round(Math.abs(ms) / 1000);
        const hours = Math.floor(absTotalSeconds / 3600);
        const minutes = Math.floor((absTotalSeconds % 3600) / 60);
        const seconds = absTotalSeconds % 60;
        return `-${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }
}

const OutReports = async (req, res) => {
    try {
        const pool = await getConnection();
        const { fromDate, toDate, employeeId, type } = req.body;

        const start = moment(fromDate || new Date()).startOf('day');
        const end = moment(toDate || new Date()).endOf('day');

        const days = [];
        for (let m = moment(start); m.isSameOrBefore(end); m.add(1, 'days')) {
            days.push(m.format('YYYY-MM-DD'));
        }

        // Corrected alias to lunch_duration_minutes
        // Made employeeId filter robust for string/numeric '-1' and empty/null
        const employeesQuery = `
          SELECT userid, 
                 CONCAT(first_name, ' ', ISNULL(middle_name, ''), ' ', last_name) AS empname,
                 45 AS lunch_duration_minutes 
          FROM d00_emptable
          ${employeeId && employeeId.toString() !== '-1' ? `WHERE userid = '${employeeId}'` : ''}
        `;
        const employees = (await pool.request().query(employeesQuery)).recordset;

        const attendanceQuery = `
          SELECT 
            ua.UserID, 
            ua.AttDateTime,
            ua.io_mode
          FROM UserAttendance ua
          WHERE ua.AttDateTime BETWEEN '${start.format('YYYY-MM-DD HH:mm:ss')}' AND '${end.format('YYYY-MM-DD HH:mm:ss')}'
          ${employeeId && employeeId.toString() !== '-1' ? `AND ua.UserID = '${employeeId}'` : ''}
          ORDER BY ua.UserID, ua.AttDateTime
        `;
        const attendanceData = (await pool.request().query(attendanceQuery)).recordset;

        const attendanceMap = {};
        attendanceData.forEach(row => {
            const dateStr = moment(row.AttDateTime).format('YYYY-MM-DD');
            // Ensure UserID is string and trimmed for key consistency
            const userIdStr = String(row.UserID).trim(); 
            const key = `${userIdStr}_${dateStr}`;
            if (!attendanceMap[key]) {
                attendanceMap[key] = { punches: [] };
            }
            attendanceMap[key].punches.push({
                dateTime: moment(row.AttDateTime),
                io_mode: parseInt(row.io_mode, 10) // Parse io_mode to integer
            });
        });

        const holidayQuery = `
          SELECT Date 
          FROM holiDaySchedule 
          WHERE Date BETWEEN '${start.format('YYYY-MM-DD')}' AND '${end.format('YYYY-MM-DD')}'
            AND IsActive = 1
        `;
        const holidayDates = new Set(
            (await pool.request().query(holidayQuery)).recordset.map(h => moment(h.Date).format('YYYY-MM-DD'))
        );

        const result = [];

        employees.forEach(emp => {
            // Ensure emp.userid is string and trimmed for key consistency
            const empIdStr = String(emp.userid).trim(); 

            days.forEach(day => {
                const key = `${empIdStr}_${day}`;
                const dailyAttendance = attendanceMap[key];
                const dayOfWeek = moment(day).day(); // 0 for Sunday, 6 for Saturday

                let status = 'A';
                let firstInTimeStr = '--';
                let lastOutTimeStr = '--';
                let hoursCStr = '--';
                let outHoursDStr = '--';
                let hourEStr = '--';
                let balanceHoursFStr = '--';

                // emp.lunch_duration_minutes is now correctly sourced from employeesQuery
                const allottedLunchMinutes = parseInt(emp.lunch_duration_minutes, 10) || 45;
                const allottedLunchDuration = moment.duration(allottedLunchMinutes, 'minutes');

                if (dayOfWeek === 0) {
                    status = 'S';
                } else if (holidayDates.has(day)) {
                    status = 'H';
                } else if (dailyAttendance && dailyAttendance.punches && dailyAttendance.punches.length > 0) {
                    const punches = dailyAttendance.punches;
                    // Punches are already sorted by SQL query (ORDER BY ua.AttDateTime)

                    const firstPunch = punches[0];
                    const lastPunch = punches[punches.length - 1];

                    // io_mode is now an integer due to parseInt()
                    if (punches.length >= 2 && firstPunch.io_mode === 0 && lastPunch.io_mode === 1) {
                        status = 'P';
                        const firstInTime = firstPunch.dateTime;
                        const lastOutTime = lastPunch.dateTime;

                        firstInTimeStr = firstInTime.format('HH:mm:ss');
                        lastOutTimeStr = lastOutTime.format('HH:mm:ss');

                        const hoursCDuration = moment.duration(lastOutTime.diff(firstInTime));
                        hoursCStr = formatDurationToHHMMSS(hoursCDuration);

                        let actualBreakDuration = moment.duration(0);
                        for (let i = 0; i < punches.length - 1; i++) {
                            if (punches[i].io_mode === 1 && punches[i+1].io_mode === 0) { // OUT punch followed by IN punch
                                const breakStart = punches[i].dateTime;
                                const breakEnd = punches[i+1].dateTime;
                                if (breakEnd.isAfter(breakStart)) {
                                    actualBreakDuration.add(moment.duration(breakEnd.diff(breakStart)));
                                }
                            }
                        }
                        outHoursDStr = formatDurationToHHMMSS(actualBreakDuration);
                        
                        const differenceDurationE = allottedLunchDuration.clone().subtract(actualBreakDuration);
                        hourEStr = formatSignedDurationForColumnE(differenceDurationE, allottedLunchDuration, actualBreakDuration);
                        
                        let balanceHoursFDuration;
                        if (actualBreakDuration.asMilliseconds() <= allottedLunchDuration.asMilliseconds()) {
                            balanceHoursFDuration = hoursCDuration.clone();
                        } else {
                            const excessBreakDuration = actualBreakDuration.clone().subtract(allottedLunchDuration);
                            balanceHoursFDuration = hoursCDuration.clone().subtract(excessBreakDuration);
                        }
                        if (balanceHoursFDuration.asMilliseconds() < 0) {
                            balanceHoursFDuration = moment.duration(0);
                        }
                        balanceHoursFStr = formatDurationToHHMMSS(balanceHoursFDuration);

                    } else {
                        status = 'M'; // Missed punch or invalid sequence
                    }
                }
                // If not S, H, P, or M, status remains 'A' (e.g., no punches for the day)

                result.push({
                    userid: emp.userid, // Original userid for the report
                    empname: emp.empname.trim().replace(/\s+/g, ' '),
                    date: moment(day).format('DD-MMM-YYYY'),
                    status,
                    FirstInTime: firstInTimeStr,
                    LastOutTime: lastOutTimeStr,
                    Hours_C: hoursCStr,
                    OutHours_D: outHoursDStr,
                    Hour_E: hourEStr,
                    BalanceHours_F: balanceHoursFStr,
                    attendanceFrom: 'BioMetric'
                });
            });
        });
        
        // PDF and Excel export logic (remains the same)
        if (type === 'pdf') {
            const doc = new PDFDocument({ margin: 30, size: 'A4', layout: 'landscape' });
            const buffers = [];
            doc.on('data', buffers.push.bind(buffers));
            doc.on('end', () => {
                const pdfData = Buffer.concat(buffers);
                const base64PDF = pdfData.toString('base64');
                return res.status(200).json({
                    isSuccess: true,
                    message: 'Punching Report PDF generated successfully',
                    base64: base64PDF
                });
            });

            doc.fillColor('#0A5275').fontSize(16).font('Helvetica-Bold').text('Daily Performance Report', { align: 'center' });
            doc.moveDown(0.3);
            doc.fillColor('black').fontSize(10).text(`From: ${moment(start).format('DD-MMM-YYYY')} To: ${moment(end).format('DD-MMM-YYYY')}`, { align: 'center' });
            doc.moveDown(1);

            const pdfColumns = [
                { label: 'S.No.', key: 'sno', width: 30, align: 'center' },
                { label: 'Employee', key: 'empname', width: 120, align: 'left' },
                { label: 'Date', key: 'date', width: 70, align: 'center' },
                { label: 'In Time (A)', key: 'FirstInTime', width: 60, align: 'center' },
                { label: 'Out Time (B)', key: 'LastOutTime', width: 60, align: 'center' },
                { label: 'Hours (C)', key: 'Hours_C', width: 60, align: 'center' },
                { label: 'Out Hours (D)', key: 'OutHours_D', width: 65, align: 'center' },
                { label: 'Hour(+/-) E', key: 'Hour_E', width: 65, align: 'center' },
                { label: 'Balance Hours F', key: 'BalanceHours_F', width: 70, align: 'center' },
                { label: 'Attendance From', key: 'attendanceFrom', width: 80, align: 'left' }
            ];
            const pageMargin = 30;
            const availableWidth = 841.89 - (2 * pageMargin);
            let tableWidth = pdfColumns.reduce((sum, col) => sum + col.width, 0);
            let x = (availableWidth - tableWidth) / 2 + pageMargin;
            if (x < pageMargin) x = pageMargin;
            let y = doc.y;

            doc.font('Helvetica-Bold').fontSize(8);
            pdfColumns.forEach(col => {
                doc.rect(x, y, col.width, 20).fillAndStroke('#D6EAF8', '#000').fillColor('black');
                doc.text(col.label, x + 3, y + 6, { width: col.width - 6, align: col.align || 'left' });
                x += col.width;
            });
            y += 20;

            doc.font('Helvetica').fontSize(7);
            result.forEach((row, index) => {
                x = (availableWidth - tableWidth) / 2 + pageMargin;
                 if (x < pageMargin) x = pageMargin;
                if (y > 550) {
                    doc.addPage({ margin: 30, size: 'A4', layout: 'landscape' });
                    y = pageMargin;
                    let headerX = (availableWidth - tableWidth) / 2 + pageMargin;
                    if (headerX < pageMargin) headerX = pageMargin;
                    doc.font('Helvetica-Bold').fontSize(8);
                    pdfColumns.forEach(col => {
                        doc.rect(headerX, y, col.width, 20).fillAndStroke('#D6EAF8', '#000').fillColor('black');
                        doc.text(col.label, headerX + 3, y + 6, { width: col.width - 6, align: col.align || 'left' });
                        headerX += col.width;
                    });
                    y += 20;
                    doc.font('Helvetica').fontSize(7);
                }
                const rowData = { ...row, sno: index + 1 };
                pdfColumns.forEach(col => {
                    doc.rect(x, y, col.width, 18).stroke();
                    doc.fillColor('black').text(rowData[col.key]?.toString() || '--', x + 3, y + 5, { width: col.width - 6, align: col.align || 'left' });
                    x += col.width;
                });
                y += 18;
            });
            doc.end();

        } else if (type === 'excel') {
            const workbook = new ExcelJS.Workbook();
            const sheet = workbook.addWorksheet('Daily Performance Report');
            const excelHeaders = [
                { header: 'S.No.', key: 'sno', width: 8 },
                { header: 'Employee', key: 'empname', width: 25 },
                { header: 'Date', key: 'date', width: 15 },
                { header: 'Status', key: 'status', width: 10 },
                { header: 'In Time (A)', key: 'FirstInTime', width: 12 },
                { header: 'Out Time (B)', key: 'LastOutTime', width: 12 },
                { header: 'Hours (C)', key: 'Hours_C', width: 12 },
                { header: 'Out Hours (D)', key: 'OutHours_D', width: 12 },
                { header: 'Hour(+/-) E', key: 'Hour_E', width: 12 },
                { header: 'Balance Hours F', key: 'BalanceHours_F', width: 15 },
                { header: 'Attendance From', key: 'attendanceFrom', width: 18 }
            ];
            sheet.columns = excelHeaders;
            sheet.getRow(1).eachCell((cell) => {
                cell.font = { bold: true, color: { argb: 'FFFFFF' } };
                cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '0A5275' } };
                cell.alignment = { horizontal: 'center', vertical: 'middle' };
                cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
            });
            result.forEach((row, index) => {
                const rowData = { sno: index + 1, ...row };
                const insertedRow = sheet.addRow(rowData);
                insertedRow.eachCell((cell, colNumber) => {
                    const columnKey = excelHeaders[colNumber - 1].key;
                    let align = 'left';
                    if (['sno', 'FirstInTime', 'LastOutTime', 'Hours_C', 'OutHours_D', 'Hour_E', 'BalanceHours_F', 'status', 'date'].includes(columnKey)) {
                        align = 'center';
                    }
                    cell.alignment = { horizontal: align, vertical: 'middle' };
                    cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
                });
            });
            const buffer = await workbook.xlsx.writeBuffer();
            const base64Excel = buffer.toString('base64');
            res.status(200).json({
                isSuccess: true,
                message: 'Report Excel generated successfully',
                base64: base64Excel
            });
        } else {
            res.status(200).json({
                isSuccess: true,
                message: 'Report data retrieved',
                data: result
            });
        }

    } catch (error) {
        console.error('OutReports Error:', error.message, error.stack); // Log stack for better debugging
        res.status(500).json({
            isSuccess: false,
            message: `Error generating report: ${error.message}`,
            data: []
        });
    }
};


module.exports = {
  handlePunchReport,
  handleDailyReport,
  handleMonthlyReport,
  OutReports
};
