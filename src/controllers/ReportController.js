const { getConnection, sql } = require("../config/database");
const {
  generateCustomPDFReport,
  generateCustomExcelReport,
} = require("../utilities/helper/breakTableAttendanceExport");
const moment = require("moment");
const PDFDocument = require("pdfkit");
const getStream = require("get-stream");
const fs = require("fs");
const path = require("path");
const ExcelJS = require("exceljs");

const fetchEmployees = async (pool, employeeId) => {
  let query = `SELECT 
    e.userid, 
    e.first_name, 
    e.middle_name, 
    e.last_name, 
    e.shiftid,
    s.shiftname,       
    s.intime, 
    s.outtime    
FROM 
    d00_emptable e
JOIN 
    shift_master s ON e.shiftid = s.id
`;
  if (employeeId) query += ` WHERE e.userid = '${employeeId}'`;
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
      const dateStr = start.format("YYYY-MM-DD");
      const label = `attDate${dayIndex}`;
      days.push(label);
      dateMap[label] = dateStr;
      start.add(1, "day");
      dayIndex++;
    }

    const employees = await fetchEmployees(pool, employeeId);

    let attendanceData = [];
    const result = await pool
      .request()
      .input("fromDate", fromDate)
      .input("toDate", toDate).query(`
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

    const holidayQuery = await pool
      .request()
      .input("fromDate", fromDate)
      .input("toDate", toDate).query(`
        SELECT Date 
        FROM holiDaySchedule 
        WHERE CAST(Date AS DATE) BETWEEN @fromDate AND @toDate 
          AND IsActive = 1
      `);
    const holidays = holidayQuery.recordset.map((h) =>
      moment(h.Date).format("YYYY-MM-DD")
    );

    const attMap = {};
    attendanceData.forEach((row) => {
      const date = moment
        .utc(row.AttDateTime || row.AttDate)
        .format("YYYY-MM-DD");
      const key = `${row.UserID || row.userid}_${date}`;
      attMap[key] = {
        FirstInTime: row.FirstInTime
          ? moment.utc(row.FirstInTime).format("HH:mm")
          : "",
        LastOutTime: row.LastOutTime
          ? moment.utc(row.LastOutTime).format("HH:mm")
          : "",
        LastPunch: row.LastPunch
          ? moment.utc(row.LastPunch).format("HH:mm")
          : "",
      };
    });

    const reportData = employees.map((emp) => {
      const fullName = [emp.first_name, emp.middle_name, emp.last_name]
        .filter(Boolean)
        .join(" ");
      const row = {
        userid: emp.userid,
        username: fullName,
        S: 0,
        H: 0,
        P: 0,
        A: 0,
        EL: 0,
        LC: 0,
      };

      days.forEach((label) => {
        const date = dateMap[label];
        const key = `${emp.userid}_${date}`;
        const dayOfWeek = moment(date).day();

        if (dayOfWeek === 0) {
          row[label] = "S";
          row.S += 1;
        } else if (holidays.includes(date)) {
          row[label] = "H";
          row.H += 1;
        } else if (attMap[key]) {
          const att = attMap[key];

          if (typeof att === "object") {
            const inTime = att.FirstInTime;
            const outTime = att.LastOutTime;
            const LastPunchu = att.LastPunch;
            console.log(att);

            const shiftIn = emp.intime;
            const shiftOut = emp.outtime;

            const hhintime = moment.utc(inTime, "HH:mm").format("HH:mm"),
              hhouttime = moment.utc(outTime, "HH:mm").format("HH:mm"),
              hhshiftin = moment.utc(shiftIn, "HH:mm").format("HH:mm"),
              hhshiftout = moment.utc(shiftOut, "HH:mm").format("HH:mm"),
              hhlastpunch = moment.utc(LastPunchu, "HH:mm").format("HH:mm");

            if (hhintime && hhintime > hhshiftin) {
              row.LC += 1;
            }

            if (
              hhlastpunch &&
              hhouttime == hhlastpunch &&
              hhouttime < hhshiftout
            ) {
              row.EL += 1;
            }

            row[label] = mode === "withtime" ? attMap[key] : "P";
          } else {
            row[label] = "P";
          }

          row.P += 1;
        } else {
          row[label] = "A";
          row.A += 1;
        }
      });

      return row;
    });

    // ✅ Return base64-encoded PDF
    if (type === "pdf") {
      const doc = new PDFDocument({
        margin: 20,
        size: "A4",
        layout: "landscape",
      });
      const buffers = [];

      doc.on("data", buffers.push.bind(buffers));
      doc.on("end", () => {
        const pdfData = Buffer.concat(buffers);
        const base64PDF = pdfData.toString("base64");

        res.status(200).json({
          isSuccess: true,
          message: "PDF generated successfully",
          base64: base64PDF,
        });
      });

      const usablePageWidth = 595.28 - 40;
      const fixedLeftWidth = 150;
      const dynamicWidth = usablePageWidth - fixedLeftWidth;
      const dayCount = days.length;
      const colWidth = Math.floor(dynamicWidth / dayCount) + 8;

      doc
        .fillColor("#0A5275")
        .fontSize(16)
        .font("Helvetica-Bold")
        .text("Monthly Attendance Report", { align: "center" });
      doc.moveDown(0.3);
      doc
        .fillColor("black")
        .fontSize(10)
        .text(`From: ${fromDate} To: ${toDate}`, { align: "center" });
      doc.moveDown(1);

      // Table headers
      let x = 20;
      let y = doc.y;

      doc.font("Helvetica-Bold").fontSize(8);

      doc
        .rect(x, y, 30, 25)
        .fillAndStroke("#D6EAF8", "#000")
        .fillColor("black");
      doc.text("UserID", x + 2, y + 6);
      x += 30;

      doc
        .rect(x, y, 80, 25)
        .fillAndStroke("#D6EAF8", "#000")
        .fillColor("black");
      doc.text("Name", x + 5, y + 6);
      x += 80;

      days.forEach((day, i) => {
        const dayNum = i + 1;
        doc
          .rect(x, y, colWidth, 25)
          .fillAndStroke("#AED6F1", "#000")
          .fillColor("black");
        if (colWidth < 18) {
          doc.save();
          doc.text(dayNum.toString(), x + 6, y + 20, {
            width: 20,
            align: "left",
          });
          doc.restore();
        } else {
          doc.text(dayNum.toString(), x + 2, y + 6, {
            width: colWidth - 4,
            align: "center",
          });
        }
        x += colWidth;
      });

      y += 25;

      reportData.forEach((emp) => {
        x = 20;
        if (y > 550) {
          doc.addPage({ layout: "landscape" });
          y = 30;
        }

        doc.fillColor("black").font("Helvetica").fontSize(6);

        doc.rect(x, y, 30, 20).stroke();
        doc.text(emp.userid.toString(), x + 2, y + 4, {
          width: 28,
          align: "left",
        });
        x += 30;

        doc.rect(x, y, 80, 20).stroke();
        doc.text(emp.username, x + 2, y + 4, { width: 78, align: "left" });
        x += 80;

        days.forEach((day) => {
          const value = emp[day];
          let display = "";

          if (mode === "withtime" && typeof value === "object") {
            const inTime = value.FirstInTime || "--";
            const outTime = value.LastOutTime || "--";
            display = `${inTime}-${outTime}`;
          } else {
            display = value || "-";
          }

          doc.rect(x, y, colWidth, 20).stroke();
          doc.text(display, x + 1, y + 4, {
            width: colWidth - 2,
            align: "center",
          });
          x += colWidth;
        });

        y += 20;
      });

      doc.end();
    } else if (type === "excel") {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Monthly Attendance Report", {
        pageSetup: {
          paperSize: 9, // A4 paper
          orientation: "landscape", // Landscape orientation
        },
      });

      // Title
      worksheet.mergeCells("A1:Z1");
      worksheet.getCell("A1").value = "Monthly Attendance Report";
      worksheet.getCell("A1").alignment = {
        vertical: "middle",
        horizontal: "center",
      };
      worksheet.getCell("A1").font = { bold: true, size: 16 };

      // Date Range
      worksheet.mergeCells("A2:Z2");
      worksheet.getCell("A2").value = `From: ${fromDate} To: ${toDate}`;
      worksheet.getCell("A2").alignment = {
        vertical: "middle",
        horizontal: "center",
      };
      worksheet.getCell("A2").font = { size: 10 };

      // Table Header
      const headerColumns = [
        { header: "UserID", width: 10, alignment: "left" },
        { header: "Name", width: 20, alignment: "left" },
      ];

      // Add day columns
      days.forEach((day, i) => {
        const dayNum = i + 1;
        headerColumns.push({
          header: dayNum.toString(),
          width: 8,
          alignment: "center",
        });
      });

      // Set column widths and headers
      headerColumns.forEach((col, idx) => {
        worksheet.getColumn(idx + 1).width = col.width;
        worksheet.getCell(3, idx + 1).value = col.header;
        worksheet.getCell(3, idx + 1).alignment = {
          vertical: "middle",
          horizontal: col.alignment,
        };
        worksheet.getCell(3, idx + 1).font = { bold: true, size: 10 };
      });

      // Add data rows
      reportData.forEach((emp, rowIndex) => {
        const row = [emp.userid.toString(), emp.username];

        // Add data for each day
        days.forEach((day) => {
          const value = emp[day];
          let display = "";

          if (mode === "withtime" && typeof value === "object") {
            const inTime = value.FirstInTime || "--";
            const outTime = value.LastOutTime || "--";
            display = `${inTime}-${outTime}`;
          } else {
            display = value || "-";
          }

          row.push(display);
        });

        // Insert row into worksheet
        worksheet.addRow(row);
        const rowIdx = rowIndex + 4;
        worksheet.getRow(rowIdx).eachCell((cell, colNumber) => {
          const column = headerColumns[colNumber - 1];
          cell.alignment = { vertical: "middle", horizontal: column.alignment };
        });
      });

      // Convert to Buffer
      const buffer = await workbook.xlsx.writeBuffer();

      // Convert buffer to Base64
      const base64Excel = buffer.toString("base64");

      // Send Base64 response
      res.status(200).json({
        isSuccess: true,
        message: "Excel report generated successfully",
        base64: base64Excel,
      });
    } else {
      res.status(200).json({
        isSuccess: true,
        message: "Monthly report fetched successfully",
        data: reportData,
      });
    }
  } catch (error) {
    res.status(500).json({
      isSuccess: false,
      message: `Error in fetching monthly report: ${error.message}`,
      data: [],
    });
  }
};

const handleDailyReport = async (req, res) => {
  try {
    const pool = await getConnection();
    const {
      date,
      employeeId,
      dept_id,
      type,
      zone_id,
      ward_id,
      area_id,
      beat_id,
    } = req.body;

    const day = moment(date || new Date()).format("YYYY-MM-DD");

    // 👇 Build WHERE clause with multiple optional filters
    const filters = [];
    if (employeeId && employeeId !== -1)
      filters.push(`userid = '${employeeId}'`);
    if (dept_id) filters.push(`dept_id = '${dept_id}'`);
    if (zone_id) filters.push(`zone_id = '${zone_id}'`);
    if (ward_id) filters.push(`ward_id = '${ward_id}'`);
    if (area_id) filters.push(`area_id = '${area_id}'`);
    if (beat_id) filters.push(`beat_id = '${beat_id}'`);
    const whereClause = filters.length ? `WHERE ${filters.join(" AND ")}` : "";

    const employeesQuery = `
  SELECT userid, 
         CONCAT(first_name, ' ', ISNULL(middle_name, ''), ' ', last_name) AS empname,
         dept_id,
         zone_id,
         ward_id,
         area_id,
         beat_id
  FROM d00_emptable
  WHERE (${employeeId} = -1 OR userid = ${employeeId})
    AND (${zone_id} = -1 OR zone_id = ${zone_id})
    AND (${ward_id} = -1 OR ward_id = ${ward_id})
    AND (${area_id} = -1 OR area_id = ${area_id})
    AND (${beat_id} = -1 OR beat_id = ${beat_id})
    AND (${dept_id} = -1 OR dept_id = ${dept_id})
`;
    const employees = (await pool.request().query(employeesQuery)).recordset;

    const attendanceQuery = `
      SELECT 
        ua.UserID, 
        ua.AttDateTime, 
        ua.io_mode 
      FROM UserAttendance ua
      WHERE CAST(ua.AttDateTime AS DATE) = '${day}'
      ORDER BY ua.UserID, ua.AttDateTime
    `;
    const attendanceData = (await pool.request().query(attendanceQuery))
      .recordset;
    console.log("attendanceData", attendanceData);
    const attendanceMap = {};

    attendanceData.forEach((row) => {
      const { UserID, AttDateTime, io_mode } = row;
      if (!attendanceMap[UserID]) attendanceMap[UserID] = [];
      attendanceMap[UserID].push({ time: moment(AttDateTime), mode: io_mode });
    });

    const holidayQuery = `
      SELECT Date 
      FROM holiDaySchedule 
      WHERE Date = '${day}' AND IsActive = 1
    `;
    const isHoliday =
      (await pool.request().query(holidayQuery)).recordset.length > 0;
    const isSunday = moment(day).day() === 0;

    const result = [];

    employees.forEach((emp) => {
      const logs = attendanceMap[emp.userid] || [];
      let status = "A";
      let FirstInTime = null;
      let LastOutTime = null;
      let lastpunch = null;
      let totalMinutes = 0;

      if (logs.length > 0) {
        status = "P";
        console.log("logs.length ", logs);
        lastpunch = moment.utc(logs[logs.length - 1].time).format("HH:mm:ss");

        const inOutPairs = [];
        for (let i = 0; i < logs.length - 1; i++) {
          if (logs[i].mode == 0 && logs[i + 1].mode == 1) {
            console.log("([logs[i].time, logs[i + 1].time])", [
              logs[i].time,
              logs[i + 1].time,
            ]);
            inOutPairs.push([logs[i].time, logs[i + 1].time]);
            i++;
          }
        }
        // console.log("inOutPairs", inOutPairs);

        if (inOutPairs.length > 0) {
          totalMinutes = inOutPairs.reduce(
            (acc, [inT, outT]) => acc + outT.diff(inT, "minutes"),
            0
          );
          FirstInTime = moment.utc(inOutPairs[0][0]).format("HH:mm:ss");
          LastOutTime = moment
            .utc(inOutPairs[inOutPairs.length - 1][1])
            .format("HH:mm:ss");
        }
      }

      if (isSunday) status = "S";
      else if (isHoliday) status = "H";
      else if (logs.length === 0) status = "A";
      console.log("totalMinutes", totalMinutes);

      const workingHours = totalMinutes
        ? `${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}m`
        : null;
      console.log(workingHours);

      result.push({
        userid: emp.userid,
        empname: emp.empname.trim().replace(/\s+/g, " "),
        date: day,
        status,
        dept_id: emp.dept_id,
        zone_id: emp.zone_id,
        ward_id: emp.ward_id,
        area_id: emp.area_id,
        beat_id: emp.beat_id,
        FirstInTime: FirstInTime || "--",
        LastOutTime: LastOutTime || "--",
        workingHours: workingHours || "--",
        lastpunch: lastpunch || "--",
      });
    });

    if (type === "totalpunch") {
      const totalPunch =
        employeeId == "-1"
          ? attendanceData
          : attendanceData.filter((record) => record.UserID == employeeId);

      return res.status(200).json({
        isSuccess: true,
        message: "Total Punch",
        data: totalPunch,
      });
    }

    // PDF Export
    if (type === "pdf") {
      const doc = new PDFDocument({
        margin: 30,
        size: "A4",
        layout: "portrait",
      });
      const buffers = [];

      doc.on("data", buffers.push.bind(buffers));
      doc.on("end", () => {
        const pdfData = Buffer.concat(buffers);
        const base64PDF = pdfData.toString("base64");

        res.status(200).json({
          isSuccess: true,
          message: "Daily PDF report generated successfully",
          base64: base64PDF,
        });
      });

      doc
        .fillColor("#0A5275")
        .fontSize(16)
        .font("Helvetica-Bold")
        .text("Daily Attendance Report", { align: "center" });
      doc.moveDown(0.3);
      doc
        .fillColor("black")
        .fontSize(10)
        .text(`Date: ${day}`, { align: "center" });
      doc.moveDown(1);

      const columns = [
        { label: "UserID", width: 60 },
        { label: "Name", width: 120 },
        { label: "Status", width: 60 },
        { label: "In Time", width: 80 },
        { label: "Out Time", width: 80 },
        { label: "Working Hours", width: 100 },
      ];

      const tableWidth = columns.reduce((acc, col) => acc + col.width, 0);
      let x = (595.28 - tableWidth) / 2;
      let y = doc.y;

      doc.font("Helvetica-Bold").fontSize(9);
      columns.forEach((col, i) => {
        doc
          .rect(x, y, col.width, 25)
          .fillAndStroke("#D6EAF8", "#000")
          .fillColor("black");
        const align = i === 0 ? "right" : "left";
        doc.text(col.label, x + 5, y + 7, { width: col.width - 10, align });
        x += col.width;
      });

      y += 25;

      doc.font("Helvetica").fontSize(8);
      result.forEach((row) => {
        x = (595.28 - tableWidth) / 2;
        if (y > 770) {
          doc.addPage({ layout: "portrait" });
          y = 40;
        }

        const rowData = [
          row.userid.toString(),
          row.empname,
          row.status,
          row.FirstInTime,
          row.LastOutTime,
          row.workingHours,
        ];

        rowData.forEach((text, i) => {
          const col = columns[i];
          doc.rect(x, y, col.width, 20).stroke();
          const align = i === 0 ? "right" : "left";
          doc.text(text, x + 5, y + 6, { width: col.width - 10, align });
          x += col.width;
        });

        y += 20;
      });

      doc.end();
    }

    // Excel Export
    else if (type === "excel") {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Daily Attendance Report", {
        pageSetup: { paperSize: 9, orientation: "portrait" },
      });

      worksheet.mergeCells("A1:F1");
      worksheet.getCell("A1").value = "Daily Attendance Report";
      worksheet.getCell("A1").alignment = {
        vertical: "middle",
        horizontal: "center",
      };
      worksheet.getCell("A1").font = { bold: true, size: 14 };

      worksheet.mergeCells("A2:F2");
      worksheet.getCell("A2").value = `Date: ${day}`;
      worksheet.getCell("A2").alignment = {
        vertical: "middle",
        horizontal: "center",
      };
      worksheet.getCell("A2").font = { size: 10 };

      const columns = [
        { header: "UserID", width: 10, alignment: "right" },
        { header: "Name", width: 20, alignment: "left" },
        { header: "Status", width: 10, alignment: "left" },
        { header: "In Time", width: 15, alignment: "left" },
        { header: "Out Time", width: 15, alignment: "left" },
        { header: "Working Hours", width: 20, alignment: "left" },
      ];

      worksheet.addRow(columns.map((col) => col.header));
      columns.forEach((col, idx) => {
        worksheet.getColumn(idx + 1).width = col.width;
        worksheet.getCell(3, idx + 1).alignment = {
          vertical: "middle",
          horizontal: "center",
        };
        worksheet.getCell(3, idx + 1).font = { bold: true };
      });

      result.forEach((row, index) => {
        worksheet.addRow([
          row.userid.toString(),
          row.empname,
          row.status,
          row.FirstInTime,
          row.LastOutTime,
          row.workingHours,
        ]);

        const rowIndex = index + 4;
        worksheet.getRow(rowIndex).eachCell((cell, colNumber) => {
          const column = columns[colNumber - 1];
          cell.alignment = { vertical: "middle", horizontal: column.alignment };
        });
      });

      const buffer = await workbook.xlsx.writeBuffer();
      const base64Excel = buffer.toString("base64");

      res.status(200).json({
        isSuccess: true,
        message: "Excel report generated successfully",
        base64: base64Excel,
      });
    }

    // Default JSON Response
    else {
      res.status(200).json({
        isSuccess: true,
        message: "Daily report get successfully",
        data: result,
      });
    }
  } catch (error) {
    console.error("Daily Report Error:", error.message);
    res.status(500).json({
      isSuccess: false,
      message: `Error in fetching daily report: ${error.message}`,
      data: [],
    });
  }
};

const handlePunchReport = async (req, res) => {
  try {
    const pool = await getConnection();
    const {
      fromDate,
      toDate,
      employeeId,
      type,
      zone_id,
      ward_id,
      area_id,
      beat_id,
      dept_id,
    } = req.body;

    const start = moment(fromDate || new Date()).startOf("day");
    const end = moment(toDate || new Date()).endOf("day");

    const days = [];
    for (let m = moment(start); m.isSameOrBefore(end); m.add(1, "days")) {
      days.push(m.format("YYYY-MM-DD"));
    }

    // 👇 Build WHERE clause with multiple optional filters
    const filters = [];
    if (employeeId && employeeId !== -1)
      filters.push(`userid = '${employeeId}'`);
    if (dept_id) filters.push(`dept_id = '${dept_id}'`);
    if (zone_id) filters.push(`zone_id = '${zone_id}'`);
    if (ward_id) filters.push(`ward_id = '${ward_id}'`);
    if (area_id) filters.push(`area_id = '${area_id}'`);
    if (beat_id) filters.push(`beat_id = '${beat_id}'`);
    const whereClause = filters.length ? `WHERE ${filters.join(" AND ")}` : "";

    const employeesQuery = `
         SELECT userid, 
         CONCAT(first_name, ' ', ISNULL(middle_name, ''), ' ', last_name) AS empname,
         dept_id,
         zone_id,
         ward_id,
         area_id,
         beat_id
  FROM d00_emptable
  WHERE (${employeeId} = -1 OR userid = ${employeeId})
    AND (${zone_id} = -1 OR zone_id = ${zone_id})
    AND (${ward_id} = -1 OR ward_id = ${ward_id})
    AND (${area_id} = -1 OR area_id = ${area_id})
    AND (${beat_id} = -1 OR beat_id = ${beat_id})
    AND (${dept_id} = -1 OR dept_id = ${dept_id})
`;
    const employees = (await pool.request().query(employeesQuery)).recordset;

    const attendanceQuery = `
      SELECT 
        ua.UserID, 
        CAST(ua.AttDateTime AS DATE) AS AttDate,
        MIN(CASE WHEN ua.io_mode = 0 THEN CONVERT(VARCHAR, ua.AttDateTime, 108) END) AS FirstInTime,
        MAX(CASE WHEN ua.io_mode = 1 THEN CONVERT(VARCHAR, ua.AttDateTime, 108) END) AS LastOutTime
      FROM UserAttendance ua
      WHERE ua.AttDateTime BETWEEN '${start.format(
        "YYYY-MM-DD"
      )}' AND '${end.format("YYYY-MM-DD")} 23:59:59'
      GROUP BY ua.UserID, CAST(ua.AttDateTime AS DATE)
    `;
    const attendanceData = (await pool.request().query(attendanceQuery))
      .recordset;

    const attendanceMap = {};
    attendanceData.forEach((row) => {
      const key = `${row.UserID}_${moment(row.AttDate).format("YYYY-MM-DD")}`;
      attendanceMap[key] = {
        inTime: row.FirstInTime,
        outTime: row.LastOutTime,
      };
    });

    const holidayQuery = `
      SELECT Date 
      FROM holiDaySchedule 
      WHERE Date BETWEEN '${start.format("YYYY-MM-DD")}' AND '${end.format(
      "YYYY-MM-DD"
    )}'
        AND IsActive = 1
    `;
    const holidayDates = new Set(
      (await pool.request().query(holidayQuery)).recordset.map((h) =>
        moment(h.Date).format("YYYY-MM-DD")
      )
    );

    const result = [];

    employees.forEach((emp) => {
      days.forEach((day) => {
        const key = `${emp.userid}_${day}`;
        const att = attendanceMap[key];
        const dayOfWeek = moment(day).day();

        let status = "A";
        let workingHours = null;

        if (dayOfWeek === 0) {
          status = "S";
        } else if (holidayDates.has(day)) {
          status = "H";
        } else if (att) {
          status = "P";

          if (att.inTime && att.outTime) {
            const inTime = moment(att.inTime, "HH:mm:ss");
            const outTime = moment(att.outTime, "HH:mm:ss");
            const duration = moment.duration(outTime.diff(inTime));
            workingHours = `${duration.hours()}h ${duration.minutes()}m`;
          }
        }

        result.push({
          userid: emp.userid,
          empname: emp.empname.trim().replace(/\s+/g, " "),
          date: day,
          status,
          dept_id: emp.dept_id,
          zone_id: emp.zone_id,
          ward_id: emp.ward_id,
          area_id: emp.area_id,
          beat_id: emp.beat_id,
          FirstInTime: att?.inTime || "--",
          LastOutTime: att?.outTime || "--",
          workingHours: workingHours || "--",
          lastpunch: att?.outTime || "--",
        });
      });
    });

    // Export as PDF
    if (type === "pdf") {
      const doc = new PDFDocument({
        margin: 30,
        size: "A4",
        layout: "portrait",
      });
      const buffers = [];

      doc.on("data", buffers.push.bind(buffers));
      doc.on("end", () => {
        const pdfData = Buffer.concat(buffers);
        const base64PDF = pdfData.toString("base64");

        return res.status(200).json({
          isSuccess: true,
          message: "Punching Report PDF generated successfully",
          base64: base64PDF,
        });
      });

      doc
        .fillColor("#0A5275")
        .fontSize(16)
        .font("Helvetica-Bold")
        .text("Punching Attendance Report", { align: "center" });
      doc.moveDown(0.3);
      doc
        .fillColor("black")
        .fontSize(10)
        .text(`From: ${fromDate} To: ${toDate}`, { align: "center" });
      doc.moveDown(1);

      const columns = [
        { label: "UserID", width: 50 },
        { label: "Name", width: 120 },
        { label: "Date", width: 70 },
        { label: "Status", width: 50 },
        { label: "In Time", width: 80 },
        { label: "Out Time", width: 80 },
        { label: "Working Hours", width: 100 },
      ];

      let tableWidth = columns.reduce((sum, col) => sum + col.width, 0);
      let x = (595.28 - tableWidth) / 2;
      let y = doc.y;

      doc.font("Helvetica-Bold").fontSize(9);
      columns.forEach((col, i) => {
        doc
          .rect(x, y, col.width, 25)
          .fillAndStroke("#D6EAF8", "#000")
          .fillColor("black");
        const align =
          typeof result[0][col.label.toLowerCase()] === "number"
            ? "right"
            : "left";
        doc.text(col.label, x + 5, y + 7, { width: col.width - 10, align });
        x += col.width;
      });

      y += 25;
      doc.font("Helvetica").fontSize(8);

      result.forEach((row) => {
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
          row.workingHours,
        ];

        rowData.forEach((text, i) => {
          const col = columns[i];
          doc.rect(x, y, col.width, 20).stroke();
          const align = typeof text === "number" ? "right" : "left";
          doc.text(text.toString(), x + 5, y + 6, {
            width: col.width - 10,
            align,
          });
          x += col.width;
        });

        y += 20;
      });

      doc.end();
    }

    // Export as Excel
    else if (type === "excel") {
      const workbook = new ExcelJS.Workbook();
      const sheet = workbook.addWorksheet("Punching Report");

      const headers = [
        "UserID",
        "Name",
        "Date",
        "Status",
        "In Time",
        "Out Time",
        "Working Hours",
      ];
      sheet.addRow(headers);

      // Styles
      sheet.columns = [
        { width: 10 }, // UserID
        { width: 25 }, // Name
        { width: 15 }, // Date
        { width: 10 }, // Status
        { width: 15 }, // In Time
        { width: 15 }, // Out Time
        { width: 20 }, // Working Hours
      ];

      sheet.getRow(1).eachCell((cell) => {
        cell.font = { bold: true };
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "D6EAF8" },
        };
        cell.alignment = { horizontal: "center" };
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
      });

      result.forEach((row) => {
        const rowData = [
          row.userid,
          row.empname,
          row.date,
          row.status,
          row.FirstInTime,
          row.LastOutTime,
          row.workingHours,
        ];
        const inserted = sheet.addRow(rowData);
        inserted.eachCell((cell, colNumber) => {
          cell.alignment = {
            horizontal:
              typeof rowData[colNumber - 1] === "number" ? "right" : "left",
          };
          cell.border = {
            top: { style: "thin" },
            left: { style: "thin" },
            bottom: { style: "thin" },
            right: { style: "thin" },
          };
        });
      });

      const buffer = await workbook.xlsx.writeBuffer();
      const base64Excel = buffer.toString("base64");

      res.status(200).json({
        isSuccess: true,
        message: "Punching Report Excel generated successfully",
        base64: base64Excel,
      });
    } else {
      // Normal JSON response if no type is provided
      res.status(200).json({
        isSuccess: true,
        message: "Punching Report data retrieved",
        data: result,
      });
    }
  } catch (error) {
    console.error("Punch Report Error:", error.message);
    res.status(500).json({
      isSuccess: false,
      message: `Error generating report: ${error.message}`,
      data: [],
    });
  }
};

function formatDurationToHHMMSS(duration, showNegativeAsZero = true) {
  if (!duration || typeof duration.asMilliseconds !== "function") {
    return "--";
  }
  let ms = duration.asMilliseconds();

  if (ms < 0) {
    if (showNegativeAsZero) {
      return "00:00:00";
    }
  }

  const nonNegativeMs = Math.max(0, ms); // Ensures ms is not negative for calculations

  const totalSeconds = Math.round(nonNegativeMs / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
    2,
    "0"
  )}:${String(seconds).padStart(2, "0")}`;
}

function formatSignedDurationForColumnE(
  duration,
  allottedDuration,
  actualBreakDuration
) {
  if (
    !duration ||
    typeof duration.asMilliseconds !== "function" ||
    !allottedDuration ||
    typeof allottedDuration.asMilliseconds !== "function" ||
    !actualBreakDuration ||
    typeof actualBreakDuration.asMilliseconds !== "function"
  ) {
    return "--";
  }

  if (
    actualBreakDuration.asMilliseconds() <= allottedDuration.asMilliseconds()
  ) {
    return "00:00:00";
  } else {
    const ms = duration.asMilliseconds(); // Will be negative here, as duration = allotted - actual
    const absTotalSeconds = Math.round(Math.abs(ms) / 1000);
    const hours = Math.floor(absTotalSeconds / 3600);
    const minutes = Math.floor((absTotalSeconds % 3600) / 60);
    const seconds = absTotalSeconds % 60;
    return `-${String(hours).padStart(2, "0")}:${String(minutes).padStart(
      2,
      "0"
    )}:${String(seconds).padStart(2, "0")}`;
  }
}

const OutReports = async (req, res) => {
  try {
    const pool = await getConnection();
    const { fromDate, toDate, employeeId, type } = req.body;

    const start = moment(fromDate || new Date()).startOf("day");
    const end = moment(toDate || new Date()).endOf("day");

    const days = [];
    for (let m = moment(start); m.isSameOrBefore(end); m.add(1, "days")) {
      days.push(m.format("YYYY-MM-DD"));
    }

    // Corrected alias to lunch_duration_minutes
    // Made employeeId filter robust for string/numeric '-1' and empty/null
    const employeesQuery = `
          SELECT userid, 
                 CONCAT(first_name, ' ', ISNULL(middle_name, ''), ' ', last_name) AS empname,
                 45 AS lunch_duration_minutes 
          FROM d00_emptable
          ${
            employeeId && employeeId.toString() !== "-1"
              ? `WHERE userid = '${employeeId}'`
              : ""
          }
        `;
    const employees = (await pool.request().query(employeesQuery)).recordset;

    const attendanceQuery = `
          SELECT 
            ua.UserID, 
            ua.AttDateTime,
            ua.io_mode
          FROM UserAttendance ua
          WHERE ua.AttDateTime BETWEEN '${start.format(
            "YYYY-MM-DD HH:mm:ss"
          )}' AND '${end.format("YYYY-MM-DD HH:mm:ss")}'
          ${
            employeeId && employeeId.toString() !== "-1"
              ? `AND ua.UserID = '${employeeId}'`
              : ""
          }
          ORDER BY ua.UserID, ua.AttDateTime
        `;
    const attendanceData = (await pool.request().query(attendanceQuery))
      .recordset;

    const attendanceMap = {};
    attendanceData.forEach((row) => {
      const dateStr = moment(row.AttDateTime).format("YYYY-MM-DD");
      // Ensure UserID is string and trimmed for key consistency
      const userIdStr = String(row.UserID).trim();
      const key = `${userIdStr}_${dateStr}`;
      if (!attendanceMap[key]) {
        attendanceMap[key] = { punches: [] };
      }
      attendanceMap[key].punches.push({
        dateTime: moment(row.AttDateTime),
        io_mode: parseInt(row.io_mode, 10), // Parse io_mode to integer
      });
    });

    const holidayQuery = `
          SELECT Date 
          FROM holiDaySchedule 
          WHERE Date BETWEEN '${start.format("YYYY-MM-DD")}' AND '${end.format(
      "YYYY-MM-DD"
    )}'
            AND IsActive = 1
        `;
    const holidayDates = new Set(
      (await pool.request().query(holidayQuery)).recordset.map((h) =>
        moment(h.Date).format("YYYY-MM-DD")
      )
    );

    const result = [];

    employees.forEach((emp) => {
      // Ensure emp.userid is string and trimmed for key consistency
      const empIdStr = String(emp.userid).trim();

      days.forEach((day) => {
        const key = `${empIdStr}_${day}`;
        const dailyAttendance = attendanceMap[key];
        const dayOfWeek = moment(day).day(); // 0 for Sunday, 6 for Saturday

        let status = "A";
        let firstInTimeStr = "--";
        let lastOutTimeStr = "--";
        let hoursCStr = "--";
        let outHoursDStr = "--";
        let hourEStr = "--";
        let balanceHoursFStr = "--";

        // emp.lunch_duration_minutes is now correctly sourced from employeesQuery
        const allottedLunchMinutes =
          parseInt(emp.lunch_duration_minutes, 10) || 45;
        const allottedLunchDuration = moment.duration(
          allottedLunchMinutes,
          "minutes"
        );

        if (dayOfWeek === 0) {
          status = "S";
        } else if (holidayDates.has(day)) {
          status = "H";
        } else if (
          dailyAttendance &&
          dailyAttendance.punches &&
          dailyAttendance.punches.length > 0
        ) {
          const punches = dailyAttendance.punches;
          // Punches are already sorted by SQL query (ORDER BY ua.AttDateTime)

          const firstPunch = punches[0];
          const lastPunch = punches[punches.length - 1];

          // io_mode is now an integer due to parseInt()
          if (
            punches.length >= 2 &&
            firstPunch.io_mode === 0 &&
            lastPunch.io_mode === 1
          ) {
            status = "P";
            const firstInTime = firstPunch.dateTime;
            const lastOutTime = lastPunch.dateTime;

            firstInTimeStr = firstInTime.format("HH:mm:ss");
            lastOutTimeStr = lastOutTime.format("HH:mm:ss");

            const hoursCDuration = moment.duration(
              lastOutTime.diff(firstInTime)
            );
            hoursCStr = formatDurationToHHMMSS(hoursCDuration);

            let actualBreakDuration = moment.duration(0);
            for (let i = 0; i < punches.length - 1; i++) {
              if (punches[i].io_mode === 1 && punches[i + 1].io_mode === 0) {
                // OUT punch followed by IN punch
                const breakStart = punches[i].dateTime;
                const breakEnd = punches[i + 1].dateTime;
                if (breakEnd.isAfter(breakStart)) {
                  actualBreakDuration.add(
                    moment.duration(breakEnd.diff(breakStart))
                  );
                }
              }
            }
            outHoursDStr = formatDurationToHHMMSS(actualBreakDuration);

            const differenceDurationE = allottedLunchDuration
              .clone()
              .subtract(actualBreakDuration);
            hourEStr = formatSignedDurationForColumnE(
              differenceDurationE,
              allottedLunchDuration,
              actualBreakDuration
            );

            let balanceHoursFDuration;
            if (
              actualBreakDuration.asMilliseconds() <=
              allottedLunchDuration.asMilliseconds()
            ) {
              balanceHoursFDuration = hoursCDuration.clone();
            } else {
              const excessBreakDuration = actualBreakDuration
                .clone()
                .subtract(allottedLunchDuration);
              balanceHoursFDuration = hoursCDuration
                .clone()
                .subtract(excessBreakDuration);
            }
            if (balanceHoursFDuration.asMilliseconds() < 0) {
              balanceHoursFDuration = moment.duration(0);
            }
            balanceHoursFStr = formatDurationToHHMMSS(balanceHoursFDuration);
          } else {
            status = "M"; // Missed punch or invalid sequence
          }
        }
        // If not S, H, P, or M, status remains 'A' (e.g., no punches for the day)

        result.push({
          userid: emp.userid, // Original userid for the report
          empname: emp.empname.trim().replace(/\s+/g, " "),
          date: moment(day).format("DD-MMM-YYYY"),
          status,
          FirstInTime: firstInTimeStr,
          LastOutTime: lastOutTimeStr,
          Hours_C: hoursCStr,
          OutHours_D: outHoursDStr,
          Hour_E: hourEStr,
          BalanceHours_F: balanceHoursFStr,
          attendanceFrom: "BioMetric",
        });
      });
    });

    // PDF and Excel export logic (remains the same)
    if (type === "pdf") {
      const doc = new PDFDocument({
        margin: 30,
        size: "A4",
        layout: "landscape",
      });
      const buffers = [];
      doc.on("data", buffers.push.bind(buffers));
      doc.on("end", () => {
        const pdfData = Buffer.concat(buffers);
        const base64PDF = pdfData.toString("base64");
        return res.status(200).json({
          isSuccess: true,
          message: "Punching Report PDF generated successfully",
          base64: base64PDF,
        });
      });

      doc
        .fillColor("#0A5275")
        .fontSize(16)
        .font("Helvetica-Bold")
        .text("Daily Performance Report", { align: "center" });
      doc.moveDown(0.3);
      doc
        .fillColor("black")
        .fontSize(10)
        .text(
          `From: ${moment(start).format("DD-MMM-YYYY")} To: ${moment(
            end
          ).format("DD-MMM-YYYY")}`,
          { align: "center" }
        );
      doc.moveDown(1);

      const pdfColumns = [
        { label: "S.No.", key: "sno", width: 30, align: "center" },
        { label: "Employee", key: "empname", width: 120, align: "left" },
        { label: "Date", key: "date", width: 70, align: "center" },
        {
          label: "In Time (A)",
          key: "FirstInTime",
          width: 60,
          align: "center",
        },
        {
          label: "Out Time (B)",
          key: "LastOutTime",
          width: 60,
          align: "center",
        },
        { label: "Hours (C)", key: "Hours_C", width: 60, align: "center" },
        {
          label: "Out Hours (D)",
          key: "OutHours_D",
          width: 65,
          align: "center",
        },
        { label: "Hour(+/-) E", key: "Hour_E", width: 65, align: "center" },
        {
          label: "Balance Hours F",
          key: "BalanceHours_F",
          width: 70,
          align: "center",
        },
        {
          label: "Attendance From",
          key: "attendanceFrom",
          width: 80,
          align: "left",
        },
      ];
      const pageMargin = 30;
      const availableWidth = 841.89 - 2 * pageMargin;
      let tableWidth = pdfColumns.reduce((sum, col) => sum + col.width, 0);
      let x = (availableWidth - tableWidth) / 2 + pageMargin;
      if (x < pageMargin) x = pageMargin;
      let y = doc.y;

      doc.font("Helvetica-Bold").fontSize(8);
      pdfColumns.forEach((col) => {
        doc
          .rect(x, y, col.width, 20)
          .fillAndStroke("#D6EAF8", "#000")
          .fillColor("black");
        doc.text(col.label, x + 3, y + 6, {
          width: col.width - 6,
          align: col.align || "left",
        });
        x += col.width;
      });
      y += 20;

      doc.font("Helvetica").fontSize(7);
      result.forEach((row, index) => {
        x = (availableWidth - tableWidth) / 2 + pageMargin;
        if (x < pageMargin) x = pageMargin;
        if (y > 550) {
          doc.addPage({ margin: 30, size: "A4", layout: "landscape" });
          y = pageMargin;
          let headerX = (availableWidth - tableWidth) / 2 + pageMargin;
          if (headerX < pageMargin) headerX = pageMargin;
          doc.font("Helvetica-Bold").fontSize(8);
          pdfColumns.forEach((col) => {
            doc
              .rect(headerX, y, col.width, 20)
              .fillAndStroke("#D6EAF8", "#000")
              .fillColor("black");
            doc.text(col.label, headerX + 3, y + 6, {
              width: col.width - 6,
              align: col.align || "left",
            });
            headerX += col.width;
          });
          y += 20;
          doc.font("Helvetica").fontSize(7);
        }
        const rowData = { ...row, sno: index + 1 };
        pdfColumns.forEach((col) => {
          doc.rect(x, y, col.width, 18).stroke();
          doc
            .fillColor("black")
            .text(rowData[col.key]?.toString() || "--", x + 3, y + 5, {
              width: col.width - 6,
              align: col.align || "left",
            });
          x += col.width;
        });
        y += 18;
      });
      doc.end();
    } else if (type === "excel") {
      const workbook = new ExcelJS.Workbook();
      const sheet = workbook.addWorksheet("Daily Performance Report");
      const excelHeaders = [
        { header: "S.No.", key: "sno", width: 8 },
        { header: "Employee", key: "empname", width: 25 },
        { header: "Date", key: "date", width: 15 },
        { header: "Status", key: "status", width: 10 },
        { header: "In Time (A)", key: "FirstInTime", width: 12 },
        { header: "Out Time (B)", key: "LastOutTime", width: 12 },
        { header: "Hours (C)", key: "Hours_C", width: 12 },
        { header: "Out Hours (D)", key: "OutHours_D", width: 12 },
        { header: "Hour(+/-) E", key: "Hour_E", width: 12 },
        { header: "Balance Hours F", key: "BalanceHours_F", width: 15 },
        { header: "Attendance From", key: "attendanceFrom", width: 18 },
      ];
      sheet.columns = excelHeaders;
      sheet.getRow(1).eachCell((cell) => {
        cell.font = { bold: true, color: { argb: "FFFFFF" } };
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "0A5275" },
        };
        cell.alignment = { horizontal: "center", vertical: "middle" };
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
      });
      result.forEach((row, index) => {
        const rowData = { sno: index + 1, ...row };
        const insertedRow = sheet.addRow(rowData);
        insertedRow.eachCell((cell, colNumber) => {
          const columnKey = excelHeaders[colNumber - 1].key;
          let align = "left";
          if (
            [
              "sno",
              "FirstInTime",
              "LastOutTime",
              "Hours_C",
              "OutHours_D",
              "Hour_E",
              "BalanceHours_F",
              "status",
              "date",
            ].includes(columnKey)
          ) {
            align = "center";
          }
          cell.alignment = { horizontal: align, vertical: "middle" };
          cell.border = {
            top: { style: "thin" },
            left: { style: "thin" },
            bottom: { style: "thin" },
            right: { style: "thin" },
          };
        });
      });
      const buffer = await workbook.xlsx.writeBuffer();
      const base64Excel = buffer.toString("base64");
      res.status(200).json({
        isSuccess: true,
        message: "Report Excel generated successfully",
        base64: base64Excel,
      });
    } else {
      res.status(200).json({
        isSuccess: true,
        message: "Report data retrieved",
        data: result,
      });
    }
  } catch (error) {
    console.error("OutReports Error:", error.message, error.stack); // Log stack for better debugging
    res.status(500).json({
      isSuccess: false,
      message: `Error generating report: ${error.message}`,
      data: [],
    });
  }
};

// 45 break api last 08/06/2025
// const BreakAttendance = async (req, res) => {
//     const { employeeId, dateFrom, dateTo } = req.body;

//     // Validate date range
//     if (new Date(dateFrom) > new Date(dateTo)) {
//       return res.status(400).json({
//         isSuccess: false,
//         message: "Invalid date range - dateFrom must be before dateTo"
//       });
//     }

//     // Helper function to count Sundays in date range
//     function countSundaysInRange(startDate, endDate) {
//       let count = 0;
//       const current = moment(startDate);
//       const end = moment(endDate);

//       while (current <= end) {
//         if (current.isoWeekday() === 7) { // Sunday
//           count++;
//         }
//         current.add(1, 'day');
//       }
//       return count;
//     }

//     try {
//       const pool = await getConnection();

//       // 1. Fetch employee details (all employees if employeeId is -1)
//       const employeeQuery = `
//         SELECT
//           e.userid,
//           CONCAT(e.first_name, ' ', ISNULL(e.middle_name, ''), ' ', e.last_name) AS empname,
//           e.gender_id,
//           g.name AS gender_name
//         FROM d00_emptable e
//         LEFT JOIN d07_gender g ON e.gender_id = g.id
//         WHERE (@employeeId = -1 OR e.userid = @employeeId)
//         ORDER BY e.userid`;

//       const employeeResult = await pool
//         .request()
//         .input("employeeId", sql.VarChar(50), employeeId)
//         .query(employeeQuery);

//       if (!employeeResult.recordset.length) {
//         return res.status(404).json({
//           isSuccess: false,
//           message: "No employees found matching the criteria"
//         });
//       }

//       // 2. Fetch salary information for all relevant employees
//       const salaryQuery = `
//         SELECT user_id, SalaryAmt, SalaryType
//         FROM SalaryInfo
//         WHERE (@employeeId = -1 OR user_id = @employeeId)`;

//       const salaryResult = await pool
//         .request()
//         .input("employeeId", sql.VarChar(50), employeeId)
//         .query(salaryQuery);

//       const salaryMap = {};
//       salaryResult.recordset.forEach(salary => {
//         salaryMap[salary.user_id] = {
//           salaryAmt: salary.SalaryAmt,
//           salaryType: salary.SalaryType
//         };
//       });

//       // 3. Fetch break duration configuration
//       const breakQuery = `
//         SELECT intervalMinutes
//         FROM dbo.BreakMaster
//         WHERE isActive = 1`;
//       const breakResult = await pool.request().query(breakQuery);

//       if (!breakResult.recordset.length) {
//         return res.status(404).json({
//           isSuccess: false,
//           message: "No active break duration found in BreakMaster table"
//         });
//       }
//       const standardBreakSeconds = breakResult.recordset[0].intervalMinutes * 60;

//       // 4. Fetch attendance settings for all relevant employees
//       const settingsQuery = `
//         WITH LatestSettings AS (
//           SELECT
//             user_id,
//             WorksHour,
//             SundayType,
//             ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY EffectiveDate DESC) as rn
//           FROM AttendanceSetting
//           WHERE @employeeId = -1 OR user_id = @employeeId
//         )
//         SELECT user_id, WorksHour, SundayType
//         FROM LatestSettings
//         WHERE rn = 1`;

//       const settingsResult = await pool
//         .request()
//         .input("employeeId", sql.VarChar(50), employeeId)
//         .query(settingsQuery);

//       const workHoursMap = {};
//       settingsResult.recordset.forEach(setting => {
//         workHoursMap[setting.user_id] = {
//           worksHour: setting.WorksHour,
//           sundayType: setting.SundayType
//         };
//       });

//       // 5. Fetch attendance data for the date range
//       const attendanceQuery = `
//         SELECT
//           UserID,
//           AttDateTime,
//           verifyMode,
//           io_mode
//         FROM UserAttendance
//         WHERE CAST(AttDateTime AS DATE) BETWEEN @dateFrom AND @dateTo
//           AND (@employeeId = -1 OR UserID = @employeeId)
//         ORDER BY UserID, AttDateTime`;

//       const attendanceResult = await pool
//         .request()
//         .input("dateFrom", sql.Date, dateFrom)
//         .input("dateTo", sql.Date, dateTo)
//         .input("employeeId", sql.VarChar(50), employeeId)
//         .query(attendanceQuery);

//       // 6. Fetch holidays for the date range
//       const holidayQuery = `
//         SELECT Date, HolidayName, Description
//         FROM dbo.holiDaySchedule
//         WHERE Date BETWEEN @dateFrom AND @dateTo
//           AND IsActive = 1`;

//       const holidayResult = await pool
//         .request()
//         .input("dateFrom", sql.Date, dateFrom)
//         .input("dateTo", sql.Date, dateTo)
//         .query(holidayQuery);

//       const holidayMap = {};
//       holidayResult.recordset.forEach(h => {
//         holidayMap[moment.utc(h.Date).format("YYYY-MM-DD")] = {
//           name: h.HolidayName,
//           description: h.Description,
//         };
//       });

//       // Helper function to format duration
//       function formatDurationWithSign(totalSeconds) {
//         if (totalSeconds === 0) return "00:00:00";
//         const sign = totalSeconds < 0 ? "-" : "";
//         const absSeconds = Math.abs(totalSeconds);
//         const hours = Math.floor(absSeconds / 3600);
//         const minutes = Math.floor((absSeconds % 3600) / 60);
//         const seconds = absSeconds % 60;
//         return sign +
//           hours.toString().padStart(2, "0") + ":" +
//           minutes.toString().padStart(2, "0") + ":" +
//           seconds.toString().padStart(2, "0");
//       }

//       function formatDuration(duration) {
//         return [
//           duration.hours().toString().padStart(2, "0"),
//           duration.minutes().toString().padStart(2, "0"),
//           duration.seconds().toString().padStart(2, "0")
//         ].join(":");
//       }

//       // Process each employee's data
//       const employeeReports = [];
//       const attendanceByEmployee = {};

//       // Group attendance data by employee
//       attendanceResult.recordset.forEach(punch => {
//         if (!attendanceByEmployee[punch.UserID]) {
//           attendanceByEmployee[punch.UserID] = [];
//         }
//         attendanceByEmployee[punch.UserID].push(punch);
//       });

//       for (const employee of employeeResult.recordset) {
//         const employeeAttendance = attendanceByEmployee[employee.userid] || [];
//         const employeeOutDetails = [];
//         let employeeTotalOutSeconds = 0;
//         let employeeTotalWorkingSeconds = 0;
//         let employeeTotalHoursESeconds = 0;
//         const dailyPunches = {};

//         // Get employee settings
//         const employeeSettings = workHoursMap[employee.userid] || {
//           worksHour: 9,
//           sundayType: 'Standard'
//         };
//         const standardWorkingHours = employeeSettings.worksHour;
//         const sundayType = employeeSettings.sundayType;
//         const standardWorkingSeconds = standardWorkingHours * 3600;
//         const sundayWorkingSeconds = sundayType === 'Proportionate'
//           ? Math.round(standardWorkingSeconds / 6)
//           : standardWorkingSeconds;

//         // Get employee salary
//         const employeeSalary = salaryMap[employee.userid] || {
//           salaryAmt: 0,
//           salaryType: 'Monthly'
//         };
//         const monthlySalary = employeeSalary.salaryAmt;
//         const salaryType = employeeSalary.salaryType;

//         // Calculate salary rates
//         let dailySalary = 0;
//         let minuteSalary = 0;
//         let hourlySalary = 0;

//         if (salaryType === 'Monthly') {
//           const currentMonth = moment(dateFrom).month();
//           const currentYear = moment(dateFrom).year();
//           const totalDaysInMonth = moment(`${currentYear}-${currentMonth + 1}`, "YYYY-MM").daysInMonth();
//           dailySalary = monthlySalary / totalDaysInMonth;
//         }
//         else if (salaryType === 'Daily') {
//           dailySalary = monthlySalary;
//         }
//         else if (salaryType === 'Hourly') {
//           dailySalary = monthlySalary * standardWorkingHours;
//         }
//         else {
//           dailySalary = monthlySalary * standardWorkingHours;
//         }

//         minuteSalary = dailySalary / (standardWorkingHours * 60);
//         hourlySalary = dailySalary / standardWorkingHours;

//         // Group punches by date and process each day
//         employeeAttendance.forEach(punch => {
//           const dateKey = moment.utc(punch.AttDateTime).format("YYYY-MM-DD");
//           if (!dailyPunches[dateKey]) {
//             dailyPunches[dateKey] = {
//               firstIn: null,
//               lastOut: null,
//               punches: [],
//               outSeconds: 0,
//               hasAttendance: false,
//               isHoliday: false,
//               holidayName: null,
//               holidayDescription: null,
//               isSunday: false,
//               isEarnedSunday: false,
//               requiredWorkingSeconds: standardWorkingSeconds,
//               sundayValue: 0,
//               sundayValueFormatted: "00:00:00",
//               workingSeconds: 0,
//               workingHours: null,
//               workingHoursFormatted: "00:00:00",
//               hoursESeconds: 0,
//               hoursE: "00:00:00",
//               balanceSeconds: 0,
//               balanceHours: "00:00:00",
//               processedForOutDetails: false,
//               hasOutTime: false
//             };
//           }
//           dailyPunches[dateKey].punches.push(punch);
//           dailyPunches[dateKey].hasAttendance = true;
//         });

//         // Include all dates in the range, even those without punches
//         const allDatesInRange = [];
//         let currentDate = moment.utc(dateFrom);
//         const endDate = moment.utc(dateTo);

//         while (currentDate <= endDate) {
//           const dateKey = currentDate.format("YYYY-MM-DD");
//           allDatesInRange.push(dateKey);

//           if (!dailyPunches[dateKey]) {
//             dailyPunches[dateKey] = {
//               firstIn: null,
//               lastOut: null,
//               punches: [],
//               outSeconds: 0,
//               hasAttendance: false,
//               isHoliday: false,
//               holidayName: null,
//               holidayDescription: null,
//               isSunday: false,
//               isEarnedSunday: false,
//               requiredWorkingSeconds: standardWorkingSeconds,
//               sundayValue: 0,
//               sundayValueFormatted: "00:00:00",
//               workingSeconds: 0,
//               workingHours: null,
//               workingHoursFormatted: "00:00:00",
//               hoursESeconds: 0,
//               hoursE: "00:00:00",
//               balanceSeconds: 0,
//               balanceHours: "00:00:00",
//               processedForOutDetails: false,
//               hasOutTime: false
//             };
//           }

//           // Mark holidays
//           if (holidayMap[dateKey]) {
//             dailyPunches[dateKey].isHoliday = true;
//             dailyPunches[dateKey].holidayName = holidayMap[dateKey].name;
//             dailyPunches[dateKey].holidayDescription = holidayMap[dateKey].description;
//           }

//           // Mark Sundays and set required working hours
//           if (currentDate.isoWeekday() === 7) {
//             dailyPunches[dateKey].isSunday = true;
//             dailyPunches[dateKey].requiredWorkingSeconds = sundayWorkingSeconds;
//           }

//           currentDate = currentDate.add(1, 'days');
//         }

//         const sortedDates = Object.keys(dailyPunches).sort((a, b) => new Date(a) - new Date(b));

//         // Calculate daily working hours (first in to last out)
//         sortedDates.forEach(dateKey => {
//           const daily = dailyPunches[dateKey];
//           const punches = daily.punches;

//           if (punches.length > 0) {
//             const firstIn = punches.find(p => p.io_mode === '0');
//             const lastOut = punches.slice().reverse().find(p => p.io_mode === '1');

//             if (firstIn) {
//               daily.firstIn = firstIn;
//               if (lastOut) {
//                 const start = moment.utc(firstIn.AttDateTime);
//                 const end = moment.utc(lastOut.AttDateTime);
//                 const duration = moment.duration(end.diff(start));

//                 daily.workingSeconds = duration.asSeconds();
//                 daily.workingHours = duration;
//                 daily.workingHoursFormatted = formatDuration(duration);
//                 daily.lastOut = lastOut;
//               } else {
//                 // Only first in exists
//                 daily.workingSeconds = 0;
//                 daily.workingHours = moment.duration(0);
//                 daily.workingHoursFormatted = "00:00:00";
//               }
//             }
//           }
//         });

//         // Calculate daily out seconds (sum of all out durations)
//         sortedDates.forEach(dateKey => {
//           const daily = dailyPunches[dateKey];
//           const punches = daily.punches;
//           let dateOutSeconds = 0;
//           let hasOutTime = false;

//           for (let i = 0; i < punches.length - 1; i++) {
//             const current = punches[i];
//             const next = punches[i + 1];
//             if (current.io_mode === '1' && next.io_mode === '0') {
//               const outTime = moment.utc(current.AttDateTime);
//               const inTime = moment.utc(next.AttDateTime);
//               const duration = moment.duration(inTime.diff(outTime));
//               dateOutSeconds += duration.asSeconds();
//               hasOutTime = true;
//             }
//           }

//           daily.outSeconds = dateOutSeconds;
//           daily.outDuration = formatDurationWithSign(dateOutSeconds);
//           daily.hasOutTime = hasOutTime;
//           employeeTotalOutSeconds += dateOutSeconds;
//         });

//         // Calculate total working seconds
//         employeeTotalWorkingSeconds = 0;
//         sortedDates.forEach(dateKey => {
//           if (dailyPunches[dateKey].workingSeconds) {
//             employeeTotalWorkingSeconds += dailyPunches[dateKey].workingSeconds;
//           }
//         });

//         // Count present, absent and earned Sundays
//         let presentDays = 0;
//         let absentDays = 0;
//         let earnedSundayCount = 0;
//         let totalSundays = 0;
//         const weekWorkMap = {};
//         const weekBalanceMap = {};

//         sortedDates.forEach(dateKey => {
//           const weekday = moment.utc(dateKey).isoWeekday();
//           const daily = dailyPunches[dateKey];
//           const hasAttendance = daily.hasAttendance;
//           const isHoliday = daily.isHoliday;
//           const isSunday = daily.isSunday;

//           if (isSunday) {
//             totalSundays++;
//           }

//           if (hasAttendance) {
//             presentDays++;

//             if (weekday >= 1 && weekday <= 6 && daily.workingSeconds >= standardWorkingSeconds) {
//               const weekNum = moment.utc(dateKey).isoWeek();
//               if (!weekWorkMap[weekNum]) weekWorkMap[weekNum] = [];
//               weekWorkMap[weekNum].push(dateKey);
//             }
//           } else if (!isHoliday && !isSunday) {
//             absentDays++;
//           }
//         });

//         // Mark earned Sundays
//         Object.entries(weekWorkMap).forEach(([weekNum, days]) => {
//           if (days.length >= 6) {
//             earnedSundayCount++;
//             const sundayKey = sortedDates.find(dateKey =>
//               moment.utc(dateKey).isoWeek() === parseInt(weekNum) &&
//               moment.utc(dateKey).isoWeekday() === 7
//             );
//             if (sundayKey && dailyPunches[sundayKey]) {
//               dailyPunches[sundayKey].isEarnedSunday = true;
//               dailyPunches[sundayKey].requiredWorkingSeconds = standardWorkingSeconds;
//             }
//           }
//         });

//         // Calculate HoursE and Balance Hours with carry forward
//         let carryForwardSeconds = 0;
//         sortedDates.forEach(dateKey => {
//           const weekday = moment.utc(dateKey).isoWeekday();
//           const weekNum = moment.utc(dateKey).isoWeek();
//           const daily = dailyPunches[dateKey];
//           const requiredSeconds = daily.requiredWorkingSeconds;

//           let hoursESeconds = 0;

//           if (daily.hasOutTime) {
//             hoursESeconds = standardBreakSeconds - daily.outSeconds;
//           }

//           hoursESeconds += carryForwardSeconds;
//           carryForwardSeconds = 0;

//           daily.hoursESeconds = hoursESeconds;
//           daily.hoursE = formatDurationWithSign(hoursESeconds);
//           employeeTotalHoursESeconds += hoursESeconds;

//           let balanceSeconds = 0;
//           const workingSeconds = daily.workingSeconds || 0;

//           if (daily.isHoliday && daily.hasAttendance) {
//             balanceSeconds = requiredSeconds - Math.abs(hoursESeconds);
//           } else if (daily.isEarnedSunday) {
//             balanceSeconds = requiredSeconds - Math.abs(hoursESeconds);
//           } else {
//             balanceSeconds = workingSeconds - Math.abs(hoursESeconds);
//           }

//           daily.balanceSeconds = balanceSeconds;
//           daily.balanceHours = formatDurationWithSign(balanceSeconds);

//           if (weekday >= 1 && weekday <= 6) {
//             if (!weekBalanceMap[weekNum]) {
//               weekBalanceMap[weekNum] = 0;
//             }
//             weekBalanceMap[weekNum] += balanceSeconds;
//           }
//         });

//         // Calculate sundayValue (1/6 of weekday balances)
//         sortedDates.forEach(dateKey => {
//           const daily = dailyPunches[dateKey];
//           if (daily.isSunday) {
//             const weekNum = moment.utc(dateKey).isoWeek();
//             const weekdayBalance = weekBalanceMap[weekNum] || 0;
//             daily.sundayValue = weekdayBalance / 6;
//             daily.sundayValueFormatted = formatDurationWithSign(daily.sundayValue);
//           }
//         });

//         // Prepare outDetails - include all entries with punches
//         for (let i = 0; i < employeeAttendance.length - 1; i++) {
//           const current = employeeAttendance[i];
//           const next = employeeAttendance[i + 1];

//           if (current.io_mode === '1' && next.io_mode === '0') {
//             const outTime = moment.utc(current.AttDateTime);
//             const inTime = moment.utc(next.AttDateTime);
//             const duration = moment.duration(inTime.diff(outTime));
//             const dateKey = outTime.format("YYYY-MM-DD");
//             const daily = dailyPunches[dateKey];

//             employeeOutDetails.push({
//               "S.No.": employeeOutDetails.length + 1,
//               "Employee": employee.empname,
//               "EmpCode": employee.userid,
//               "Date": outTime.format("DD-MMM-YYYY"),
//               "FirstIn": daily.firstIn ? moment.utc(daily.firstIn.AttDateTime).format("HH:mm:ss") : "N/A",
//               "LastOut": daily.lastOut ? moment.utc(daily.lastOut.AttDateTime).format("HH:mm:ss") : "N/A",
//               "WorkingHours": daily.workingHoursFormatted,
//               "HoursE": daily.hoursE,
//               "BalanceHours": daily.balanceHours,
//               "SundayValue": daily.sundayValueFormatted,
//               "Out Time": outTime.format("HH:mm:ss"),
//               "In Time": inTime.format("HH:mm:ss"),
//               "Out Duration": formatDuration(duration),
//               "Total Out Duration": daily.outDuration,
//               "Attendance From": current.verifyMode,
//               "IsHoliday": daily.isHoliday,
//               "HolidayName": daily.holidayName,
//               "IsSunday": daily.isSunday,
//               "IsEarnedSunday": daily.isEarnedSunday,
//               "StandardBreakDuration": standardBreakSeconds / 60 + " minutes",
//               "StandardWorkingHours": standardWorkingHours + " hours",
//               "SundayType": sundayType,
//               "SundayWorkingHours": sundayWorkingSeconds / 3600 + " hours",
//               "MinuteSalary": minuteSalary.toFixed(2),
//               "HourlySalary": hourlySalary.toFixed(2),
//               "DailySalary": dailySalary.toFixed(2)
//             });
//             daily.processedForOutDetails = true;
//           }
//         }

//         // Include all days with punches, even those without out-in pairs
//         sortedDates.forEach(dateKey => {
//           const daily = dailyPunches[dateKey];
//           if (daily.hasAttendance && !daily.processedForOutDetails) {
//             const firstIn = daily.punches.find(p => p.io_mode === '0');
//             employeeOutDetails.push({
//               "S.No.": employeeOutDetails.length + 1,
//               "Employee": employee.empname,
//               "EmpCode": employee.userid,
//               "Date": moment.utc(dateKey).format("DD-MMM-YYYY"),
//               "FirstIn": firstIn ? moment.utc(firstIn.AttDateTime).format("HH:mm:ss") : "N/A",
//               "LastOut": daily.lastOut ? moment.utc(daily.lastOut.AttDateTime).format("HH:mm:ss") : "N/A",
//               "WorkingHours": daily.workingHoursFormatted,
//               "HoursE": daily.hoursE,
//               "BalanceHours": daily.balanceHours,
//               "SundayValue": daily.sundayValueFormatted,
//               "Out Time": "N/A",
//               "In Time": "N/A",
//               "Out Duration": "00:00:00",
//               "Total Out Duration": daily.outDuration,
//               "Attendance From": firstIn ? firstIn.verifyMode : "N/A",
//               "IsHoliday": daily.isHoliday,
//               "HolidayName": daily.holidayName,
//               "IsSunday": daily.isSunday,
//               "IsEarnedSunday": daily.isEarnedSunday,
//               "StandardBreakDuration": standardBreakSeconds / 60 + " minutes",
//               "StandardWorkingHours": standardWorkingHours + " hours",
//               "SundayType": sundayType,
//               "SundayWorkingHours": sundayWorkingSeconds / 3600 + " hours",
//               "MinuteSalary": minuteSalary.toFixed(2),
//               "HourlySalary": hourlySalary.toFixed(2),
//               "DailySalary": dailySalary.toFixed(2)
//             });
//             daily.processedForOutDetails = true;
//           }
//         });

//         // Sort outDetails by date
//         employeeOutDetails.sort((a, b) => new Date(a.Date) - new Date(b.Date));

//         // Calculate totals from dailyPunches
//         let totalBalanceSeconds = 0;
//         let totalSundayValue = 0;
//         let totalHoursESeconds = 0;
//         let totalWorkingSeconds = 0;
//         let totalOutSeconds = 0;
//         let presentDaysCount = 0;

//         sortedDates.forEach(dateKey => {
//           const daily = dailyPunches[dateKey];
//           if (daily.hasAttendance) {
//             totalBalanceSeconds += daily.balanceSeconds || 0;
//             totalHoursESeconds += daily.hoursESeconds || 0;
//             totalWorkingSeconds += daily.workingSeconds || 0;
//             totalOutSeconds += daily.outSeconds || 0;
//             presentDaysCount++;

//             if (daily.isSunday) {
//               totalSundayValue += daily.sundayValue || 0;
//             }
//           }
//         });

//         // Format totals
//         const totalOutDuration = formatDurationWithSign(totalOutSeconds);
//         const totalWorkingDuration = formatDurationWithSign(totalWorkingSeconds);
//         const totalOutDays = (totalOutSeconds / (standardWorkingHours * 3600)).toFixed(2);
//         const totalHoursE = formatDurationWithSign(totalHoursESeconds);
//         const totalBalanceHours = formatDurationWithSign(totalBalanceSeconds);
//         const totalSundayValueFormatted = formatDurationWithSign(totalSundayValue);

//         const perdaywork = presentDaysCount > 0
//           ? (totalBalanceSeconds / (standardWorkingHours * 3600)).toFixed(2)
//           : "0.00";

//         const totalDaysInRange = moment(dateTo).diff(moment(dateFrom), 'days') + 1;
//         const workingDaysCount = totalDaysInRange - totalSundays - holidayResult.recordset.length;

//         const workingDaysInSeconds = workingDaysCount * standardWorkingHours * 3600;
//         const workingDaysFormatted = formatDurationWithSign(workingDaysInSeconds);

//         let calculatedEarnedSundays = 0;
//         if (workingDaysCount > 0) {
//           const totalSundaysInRange = countSundaysInRange(dateFrom, dateTo);
//           console.log("totalSundaysInRange",totalSundaysInRange)
//           console.log("workingDaysCount",workingDaysCount)

//           calculatedEarnedSundays = (totalSundaysInRange / workingDaysCount) * parseFloat(perdaywork);
//         }

//         employeeReports.push({
//           employeeId: employee.userid,
//           empname: employee.empname,
//           gender: employee.gender_name,
//           outDetails: employeeOutDetails,
//           totals: {
//             perdaywork: perdaywork,
//             outDays: totalOutDays,
//             outHour: totalOutDuration,
//             workingHours: totalWorkingDuration,
//             hoursE: totalHoursE,
//             balanceHours: totalBalanceHours,
//             sundayValue: totalSundayValueFormatted,
//             presentDays: presentDaysCount,
//             absentDays: absentDays,
//             totalDays: totalDaysInRange,
//             workingDays: workingDaysFormatted,
//             workingDaysCount: workingDaysCount,
//             sundays: totalSundays,
//             standardWorkingHours: standardWorkingHours + " hours",
//             holidayHour: standardWorkingHours + " hours",
//             earnedSundays: calculatedEarnedSundays.toFixed(2),
//             holidayDays: holidayResult.recordset.length,
//             standardBreakDuration: standardBreakSeconds / 60 + " minutes",
//             sundayType: sundayType,
//             sundayWorkingHours: sundayWorkingSeconds / 3600 + " hours",
//             minuteSalary: minuteSalary.toFixed(2),
//             hourlySalary: hourlySalary.toFixed(2),
//             dailySalary: dailySalary.toFixed(2),
//             salaryType: salaryType,
//             totalDaysInMonth: salaryType === 'Monthly' ?
//               moment(`${moment(dateFrom).year()}-${moment(dateFrom).month() + 1}`, "YYYY-MM").daysInMonth() :
//               null
//           }
//         });
//       }

//       const response = {
//         isSuccess: true,
//         message: "Break attendance report generated successfully",
//         data: employeeReports,
//         holidays: holidayResult.recordset,
//         dateRange: {
//           from: moment.utc(dateFrom).format("DD-MMM-YYYY"),
//           to: moment.utc(dateTo).format("DD-MMM-YYYY"),
//           totalDays: moment(dateTo).diff(moment(dateFrom), 'days') + 1
//         },
//         standardBreakDuration: standardBreakSeconds / 60 + " minutes"
//       };

//       res.json(response);

//     } catch (err) {
//       console.error("Error in BreakAttendance:", err);
//       res.status(500).json({
//         isSuccess: false,
//         message: `Server error: ${err.message}`,
//       });
//     }
// };

// 45 break api newApi 09/06/2025
const BreakAttendance = async (req, res) => {
  const { employeeId, dateFrom, dateTo } = req.body;

  if (new Date(dateFrom) > new Date(dateTo)) {
    return res.status(400).json({
      isSuccess: false,
      message: "Invalid date range - dateFrom must be before dateTo",
    });
  }

  function countSundaysInMonth(anyDateInMonth) {
    const startOfMonth = moment(anyDateInMonth).startOf("month");
    const endOfMonth = moment(anyDateInMonth).endOf("month");
    let count = 0;
    const current = startOfMonth.clone();

    while (current.isSameOrBefore(endOfMonth, "day")) {
      if (current.isoWeekday() === 7) {
        // Sunday
        count++;
      }
      current.add(1, "day");
    }

    return count;
  }

  try {
    const pool = await getConnection();

    // Fetch approved grace minutes for employees
    const graceMinutesQuery = `
        SELECT 
          empid,
          no_of_minutes as graceMinutes
        FROM PunchCorrections
        WHERE status = 'Approved'
      `;

    const graceMinutesRequest = pool
      .request()
      .input("dateFrom", sql.Date, dateFrom)
      .input("dateTo", sql.Date, dateTo);

    if (employeeId !== -1) {
      graceMinutesRequest.input("employeeId", sql.VarChar(50), employeeId);
    }

    const graceMinutesResult = await graceMinutesRequest.query(
      graceMinutesQuery
    );

    // Create a map of employee grace minutes (array since there might be multiple entries)
    const graceMinutesMap = {};
    graceMinutesResult.recordset.forEach((row) => {
      if (!graceMinutesMap[row.empid]) {
        graceMinutesMap[row.empid] = [];
      }
      graceMinutesMap[row.empid].push(row.graceMinutes);
    });

    // Fetch employee details
    const employeeQuery = `
        SELECT 
          e.userid, 
          CONCAT(e.first_name, ' ', ISNULL(e.middle_name, ''), ' ', e.last_name) AS empname,
          e.gender_id,
          g.name AS gender_name
        FROM d00_emptable e
        LEFT JOIN d07_gender g ON e.gender_id = g.id
        WHERE (${employeeId} = -1 OR e.userid = @employeeId)`;

    const employeeResult = await pool
      .request()
      .input("employeeId", sql.VarChar(50), employeeId)
      .query(employeeQuery);

    if (!employeeResult.recordset.length) {
      return res
        .status(404)
        .json({
          isSuccess: false,
          message: "No employees found matching the criteria",
        });
    }

    // Fetch salary information
    const salaryQuery = `
        SELECT user_id, SalaryAmt, SalaryType
        FROM SalaryInfo
      `;

    const salaryRequest = pool.request().input("dateTo", sql.Date, dateTo);
    if (employeeId !== -1) {
      salaryRequest.input("employeeId", sql.VarChar(50), employeeId);
    }
    const salaryResult = await salaryRequest.query(salaryQuery);

    const salaryMap = {};
    salaryResult.recordset.forEach((salary) => {
      salaryMap[salary.user_id] = {
        salaryAmt: salary.SalaryAmt,
        salaryType: salary.SalaryType,
      };
    });

    // Fetch attendance settings (now including GraceMinute)
    const settingsQuery = `
        WITH LatestSettings AS (
          SELECT 
            user_id, 
            WorksHour,
            GraceMinute,
            SundayType,
            ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY EffectiveDate DESC) as rn
          FROM AttendanceSetting
        )
        SELECT user_id, WorksHour, SundayType, GraceMinute
        FROM LatestSettings
        WHERE rn = 1
      `;
    const settingsResult = await pool.request().query(settingsQuery);

    const workHoursMap = {};
    settingsResult.recordset.forEach((setting) => {
      workHoursMap[setting.user_id] = {
        worksHour: setting.WorksHour,
        sundayType: setting.SundayType,
        graceMinute: setting.GraceMinute
      };
    });

    // Fetch attendance data
    let attendanceQuery = `
        SELECT 
          UserID,
          AttDateTime,
          verifyMode,
          io_mode
        FROM UserAttendance
        WHERE CAST(AttDateTime AS DATE) BETWEEN @dateFrom AND @dateTo
      `;
    if (employeeId !== -1) {
      attendanceQuery += ` AND UserID = @employeeId`;
    }
    attendanceQuery += ` ORDER BY UserID, AttDateTime`;

    const attendanceRequest = pool
      .request()
      .input("dateFrom", sql.Date, dateFrom)
      .input("dateTo", sql.Date, dateTo);
    if (employeeId !== -1) {
      attendanceRequest.input("employeeId", sql.VarChar(50), employeeId);
    }
    const attendanceResult = await attendanceRequest.query(attendanceQuery);

    // Fetch holidays
    const holidayQuery = `
        SELECT Date, HolidayName, Description
        FROM dbo.holiDaySchedule
        WHERE Date BETWEEN @dateFrom AND @dateTo
          AND IsActive = 1
      `;
    const holidayResult = await pool
      .request()
      .input("dateFrom", sql.Date, dateFrom)
      .input("dateTo", sql.Date, dateTo)
      .query(holidayQuery);

    const holidayMap = {};
    holidayResult.recordset.forEach((h) => {
      holidayMap[moment.utc(h.Date).format("YYYY-MM-DD")] = {
        name: h.HolidayName,
        description: h.Description,
      };
    });

    // Helper function to format duration
    function formatDurationWithSign(totalSeconds) {
      if (totalSeconds === 0) return "00:00:00";
      const sign = totalSeconds < 0 ? "-" : "";
      const absSeconds = Math.abs(totalSeconds);
      const hours = Math.floor(absSeconds / 3600);
      const minutes = Math.floor((absSeconds % 3600) / 60);
      const seconds = absSeconds % 60;
      return (
        sign +
        hours.toString().padStart(2, "0") +
        ":" +
        minutes.toString().padStart(2, "0") +
        ":" +
        seconds.toString().padStart(2, "0")
      );
    }

    function formatDuration(duration) {
      return [
        duration.hours().toString().padStart(2, "0"),
        duration.minutes().toString().padStart(2, "0"),
        duration.seconds().toString().padStart(2, "0"),
      ].join(":");
    }

    // Process each employee
    const employeeReports = [];
    const attendanceByEmployee = {};
    attendanceResult.recordset.forEach((punch) => {
      if (!attendanceByEmployee[punch.UserID]) {
        attendanceByEmployee[punch.UserID] = [];
      }
      attendanceByEmployee[punch.UserID].push(punch);
    });

    for (const employee of employeeResult.recordset) {
      // Get employee's grace minutes (array of all approved grace minutes)
      const employeeGraceMinutes = graceMinutesMap[employee.userid] || [];

      const employeeOutDetails = [];
      const dailyPunches = {};

      // Get employee settings
      const employeeSettings = workHoursMap[employee.userid] || {
        worksHour: 9,
        sundayType: "Standard",
        graceMinute: 45 // Default grace minutes if not found
      };
      const standardWorkingHours = employeeSettings.worksHour;
      const sundayType = employeeSettings.sundayType;
      const standardWorkingSeconds = standardWorkingHours * 3600;
      const sundayWorkingSeconds =
        sundayType === "Proportionate"
          ? Math.round(standardWorkingSeconds / 6)
          : standardWorkingSeconds;
      
      // Use graceMinute for break duration (convert minutes to seconds)
      const standardBreakSeconds = (employeeSettings.graceMinute || 45) * 60;

      // Get employee salary
      const employeeSalary = salaryMap[employee.userid] || {
        salaryAmt: 0,
        salaryType: "Monthly",
      };
      const monthlySalary = employeeSalary.salaryAmt;
      const salaryType = employeeSalary.salaryType;

      // START: SALARY CALCULATION LOGIC FROM FIRST FUNCTION
      let dailySalary = 0;
      let minuteSalary = 0;
      let hourlySalary = 0;

      if (salaryType === "Monthly") {
        // Get total days in the current month
        const currentMonth = moment(dateFrom).month();
        const currentYear = moment(dateFrom).year();
        const totalDaysInMonth = moment(
          `${currentYear}-${currentMonth + 1}`,
          "YYYY-MM"
        ).daysInMonth();
        dailySalary = monthlySalary / totalDaysInMonth;
      } else if (salaryType === "Daily") {
        dailySalary = monthlySalary;
      } else if (salaryType === "Hourly") {
        dailySalary = monthlySalary * standardWorkingHours;
      } else {
        // For other types, default to hourly calculation
        dailySalary = monthlySalary * standardWorkingHours;
      }

      // Then calculate minute and hourly rates from daily salary
      if (dailySalary > 0 && standardWorkingHours > 0) {
        hourlySalary = dailySalary / standardWorkingHours;
        minuteSalary = hourlySalary / 60;
      }
      // END: SALARY CALCULATION LOGIC FROM FIRST FUNCTION

      // Group punches by date
      const employeeAttendance = attendanceByEmployee[employee.userid] || [];
      employeeAttendance.forEach((punch) => {
        const dateKey = moment.utc(punch.AttDateTime).format("YYYY-MM-DD");
        if (!dailyPunches[dateKey]) {
          dailyPunches[dateKey] = {
            firstIn: null,
            lastOut: null,
            punches: [],
            outSeconds: 0,
            hasAttendance: false,
            isHoliday: false,
            holidayName: null,
            holidayDescription: null,
            isSunday: false,
            isEarnedSunday: false,
            requiredWorkingSeconds: standardWorkingSeconds,
            sundayValue: 0,
            sundayValueFormatted: "00:00:00",
            workingSeconds: 0,
            workingHours: null,
            workingHoursFormatted: "00:00:00",
            hoursESeconds: 0,
            hoursE: "00:00:00",
            balanceSeconds: 0,
            balanceHours: "00:00:00",
            processedForOutDetails: false,
          };
        }
        dailyPunches[dateKey].punches.push(punch);
        dailyPunches[dateKey].hasAttendance = true;
      });

      // Include all dates in range
      let currentDate = moment.utc(dateFrom);
      const endDate = moment.utc(dateTo);

      while (currentDate <= endDate) {
        const dateKey = currentDate.format("YYYY-MM-DD");
        if (!dailyPunches[dateKey]) {
          dailyPunches[dateKey] = {
            firstIn: null,
            lastOut: null,
            punches: [],
            outSeconds: 0,
            hasAttendance: false,
            isHoliday: false,
            holidayName: null,
            holidayDescription: null,
            isSunday: false,
            isEarnedSunday: false,
            requiredWorkingSeconds: standardWorkingSeconds,
            sundayValue: 0,
            sundayValueFormatted: "00:00:00",
            workingSeconds: 0,
            workingHours: null,
            workingHoursFormatted: "00:00:00",
            hoursESeconds: 0,
            hoursE: "00:00:00",
            balanceSeconds: 0,
            balanceHours: "00:00:00",
            processedForOutDetails: false,
          };
        }
        if (holidayMap[dateKey]) {
          dailyPunches[dateKey].isHoliday = true;
          dailyPunches[dateKey].holidayName = holidayMap[dateKey].name;
          dailyPunches[dateKey].holidayDescription =
            holidayMap[dateKey].description;
        }
        if (currentDate.isoWeekday() === 7) {
          dailyPunches[dateKey].isSunday = true;
          dailyPunches[dateKey].requiredWorkingSeconds = sundayWorkingSeconds;
        }
        currentDate = currentDate.add(1, "days");
      }

      const sortedDates = Object.keys(dailyPunches).sort(
        (a, b) => new Date(a) - new Date(b)
      );

      // Calculate daily values
      sortedDates.forEach((dateKey) => {
        const daily = dailyPunches[dateKey];
        const punches = daily.punches;

        if (punches.length > 0) {
          const firstIn = punches.find((p) => p.io_mode === "0");
          const lastOut = punches
            .slice()
            .reverse()
            .find((p) => p.io_mode === "1");

          if (firstIn && lastOut) {
            const start = moment.utc(firstIn.AttDateTime);
            const end = moment.utc(lastOut.AttDateTime);
            const duration = moment.duration(end.diff(start));

            daily.workingSeconds =
              duration.asSeconds() > 0 ? duration.asSeconds() : 0;
            daily.workingHours = duration;
            daily.workingHoursFormatted = formatDuration(duration);
            daily.firstIn = firstIn;
            daily.lastOut = lastOut;
          } else if (firstIn) {
            daily.firstIn = firstIn;
          }
        }

        let dateOutSeconds = 0;
        for (let i = 0; i < punches.length - 1; i++) {
          const currentPunch = punches[i];
          const nextPunch = punches[i + 1];
          const outTimeMoment = moment.utc(currentPunch.AttDateTime);
          const inTimeMoment = moment.utc(nextPunch.AttDateTime);

          if (
            currentPunch.io_mode === "1" &&
            nextPunch.io_mode === "0" &&
            outTimeMoment.isSame(inTimeMoment, "day")
          ) {
            const duration = moment.duration(inTimeMoment.diff(outTimeMoment));
            if (duration.asSeconds() > 0) {
              dateOutSeconds += duration.asSeconds();
            }
          }
        }
        daily.outSeconds = dateOutSeconds;
        daily.outDuration = formatDurationWithSign(dateOutSeconds);

        daily.hoursESeconds = standardBreakSeconds - daily.outSeconds;
        const displayDailyHoursESeconds = Math.min(0, daily.hoursESeconds);
        daily.hoursE = formatDurationWithSign(displayDailyHoursESeconds);

        const excessBreakSeconds = Math.max(
          0,
          daily.outSeconds - standardBreakSeconds
        );
        daily.balanceSeconds = (daily.workingSeconds || 0) - excessBreakSeconds;
        daily.balanceHours = formatDurationWithSign(daily.balanceSeconds);
      });

      // Present, absent and earned Sundays count
      let presentDays = 0;
      let absentDays = 0;
      let totalSundays = 0;
      const weekWorkMap = {};
      const weekBalanceMap = {};

      sortedDates.forEach((dateKey) => {
        const daily = dailyPunches[dateKey];
        const hasAttendance = daily.hasAttendance;
        const isHoliday = daily.isHoliday;
        const isSunday = daily.isSunday;

        if (isSunday) totalSundays++;

        if (hasAttendance) {
          presentDays++;
          const weekNum = moment.utc(dateKey).isoWeek();
          const weekday = moment.utc(dateKey).isoWeekday();
          if (weekday >= 1 && weekday <= 6) {
            if (daily.workingSeconds >= standardWorkingSeconds) {
              if (!weekWorkMap[weekNum]) weekWorkMap[weekNum] = [];
              weekWorkMap[weekNum].push(dateKey);
            }
            if (!weekBalanceMap[weekNum]) weekBalanceMap[weekNum] = 0;
            weekBalanceMap[weekNum] += daily.balanceSeconds;
          }
        } else if (!isHoliday && !isSunday) {
          absentDays++;
        }
      });

      // Sunday Value calculations
      Object.entries(weekWorkMap).forEach(([weekNum, days]) => {
        if (days.length >= 6) {
          const sundayKey = sortedDates.find(
            (dateKey) =>
              moment.utc(dateKey).isoWeek() === parseInt(weekNum) &&
              moment.utc(dateKey).isoWeekday() === 7
          );
          if (sundayKey && dailyPunches[sundayKey]) {
            dailyPunches[sundayKey].isEarnedSunday = true;
            dailyPunches[sundayKey].requiredWorkingSeconds =
              standardWorkingSeconds;
          }
        }
      });
      sortedDates.forEach((dateKey) => {
        const daily = dailyPunches[dateKey];
        if (daily.isSunday) {
          const weekNum = moment.utc(dateKey).isoWeek();
          const weekdayBalance = weekBalanceMap[weekNum] || 0;
          daily.sundayValue = weekdayBalance / 6;
          daily.sundayValueFormatted = formatDurationWithSign(
            daily.sundayValue
          );
        }
      });

      // Prepare outDetails
      for (let i = 0; i < employeeAttendance.length - 1; i++) {
        const current = employeeAttendance[i];
        const next = employeeAttendance[i + 1];
        const outTime = moment.utc(current.AttDateTime);
        const inTime = moment.utc(next.AttDateTime);

        if (
          current.io_mode === "1" &&
          next.io_mode === "0" &&
          outTime.isSame(inTime, "day")
        ) {
          const duration = moment.duration(inTime.diff(outTime));
          const dateKey = outTime.format("YYYY-MM-DD");
          const daily = dailyPunches[dateKey];

          if (daily) daily.processedForOutDetails = true;

          employeeOutDetails.push({
            "S.No.": employeeOutDetails.length + 1,
            Employee: employee.empname,
            EmpCode: employee.userid,
            Date: outTime.format("DD-MMM-YYYY"),
            FirstIn: daily.firstIn
              ? moment.utc(daily.firstIn.AttDateTime).format("HH:mm:ss")
              : "N/A",
            LastOut: daily.lastOut
              ? moment.utc(daily.lastOut.AttDateTime).format("HH:mm:ss")
              : "N/A",
            WorkingHours: daily.workingHoursFormatted,
            HoursE: daily.hoursE,
            BalanceHours: daily.balanceHours,
            SundayValue: daily.sundayValueFormatted,
            "Out Time": outTime.format("HH:mm:ss"),
            "In Time": inTime.format("HH:mm:ss"),
            "Out Duration":
              duration.asSeconds() > 0 ? formatDuration(duration) : "00:00:00",
            "Total Out Duration": daily.outDuration,
            "Attendance From": current.verifyMode,
            IsHoliday: daily.isHoliday,
            HolidayName: daily.holidayName,
            IsSunday: daily.isSunday,
            IsEarnedSunday: daily.isEarnedSunday,
            StandardBreakDuration: standardBreakSeconds / 60 + " minutes",
            StandardWorkingHours: standardWorkingHours + " hours",
            SundayType: sundayType,
            SundayWorkingHours: sundayWorkingSeconds / 3600 + " hours",
            MinuteSalary: minuteSalary,
            HourlySalary: hourlySalary,
            DailySalary: dailySalary,
            GraceMinutes: employeeGraceMinutes,
          });
        }
      }
      sortedDates.forEach((dateKey) => {
        const daily = dailyPunches[dateKey];
        if (daily.hasAttendance && !daily.processedForOutDetails) {
          const firstIn = daily.firstIn;
          employeeOutDetails.push({
            "S.No.": employeeOutDetails.length + 1,
            Employee: employee.empname,
            EmpCode: employee.userid,
            Date: moment.utc(dateKey).format("DD-MMM-YYYY"),
            FirstIn: firstIn
              ? moment.utc(firstIn.AttDateTime).format("HH:mm:ss")
              : "N/A",
            LastOut: daily.lastOut
              ? moment.utc(daily.lastOut.AttDateTime).format("HH:mm:ss")
              : "N/A",
            WorkingHours: daily.workingHoursFormatted,
            HoursE: daily.hoursE,
            BalanceHours: daily.balanceHours,
            SundayValue: daily.sundayValueFormatted,
            "Out Time": "N/A",
            "In Time": "N/A",
            "Out Duration": "00:00:00",
            "Total Out Duration": daily.outDuration,
            "Attendance From": firstIn ? firstIn.verifyMode : "N/A",
            IsHoliday: daily.isHoliday,
            HolidayName: daily.holidayName,
            IsSunday: daily.isSunday,
            IsEarnedSunday: daily.isEarnedSunday,
            StandardBreakDuration: standardBreakSeconds / 60 + " minutes",
            StandardWorkingHours: standardWorkingHours + " hours",
            SundayType: sundayType,
            SundayWorkingHours: sundayWorkingSeconds / 3600 + " hours",
            MinuteSalary: minuteSalary,
            HourlySalary: hourlySalary,
            DailySalary: dailySalary,
            GraceMinutes: employeeGraceMinutes,
          });
        }
      });

      employeeOutDetails.sort((a, b) => {
        const dateA = new Date(a.Date);
        const dateB = new Date(b.Date);
        if (dateA - dateB !== 0) return dateA - dateB;
        if (a["Out Time"] === "N/A") return 1;
        if (b["Out Time"] === "N/A") return -1;
        return a["Out Time"].localeCompare(b["Out Time"]);
      });
      employeeOutDetails.forEach((detail, index) => {
        detail["S.No."] = index + 1;
      });

      // Calculate totals from dailyPunches
      let totalWorkingSeconds = 0;
      let totalOutSeconds = 0;
      let presentDaysCount = 0;
      let totalSundayValue = 0;

      sortedDates.forEach((dateKey) => {
        const daily = dailyPunches[dateKey];
        if (daily.hasAttendance) {
          totalWorkingSeconds += daily.workingSeconds || 0;
          totalOutSeconds += daily.outSeconds || 0;
          presentDaysCount++;
          if (daily.isSunday) {
            totalSundayValue += daily.sundayValue || 0;
          }
        }
      });

      // Final Total Calculations
      const totalBreakAllowanceSeconds =
        presentDaysCount * standardBreakSeconds;
      const finalTotalHoursESeconds =
        totalBreakAllowanceSeconds - totalOutSeconds;
      const displayTotalHoursESeconds = Math.min(0, finalTotalHoursESeconds);

      const totalExcessBreakSeconds = Math.max(
        0,
        totalOutSeconds - totalBreakAllowanceSeconds
      );
      const finalTotalBalanceSeconds =
        totalWorkingSeconds - totalExcessBreakSeconds;

      // Format all totals
      const totalOutDuration = formatDurationWithSign(totalOutSeconds);
      const totalWorkingDuration = formatDurationWithSign(totalWorkingSeconds);
      const totalOutDays = (
        totalOutSeconds /
        (standardWorkingHours * 3600)
      ).toFixed(2);
      const totalHoursE = formatDurationWithSign(displayTotalHoursESeconds);
      const totalBalanceHours = formatDurationWithSign(
        finalTotalBalanceSeconds
      );
      const totalSundayValueFormatted =
        formatDurationWithSign(totalSundayValue);

      const perdaywork =
        presentDaysCount > 0
          ? (finalTotalBalanceSeconds / (standardWorkingHours * 3600)).toFixed(
              2
            )
          : "0.00";
      const totalDaysInRange =
        moment(dateTo).diff(moment(dateFrom), "days") + 1;
      const workingDaysCount =
        totalDaysInRange - totalSundays - holidayResult.recordset.length;
      const workingDaysInSeconds =
        workingDaysCount * standardWorkingHours * 3600;
      const workingDaysFormatted = formatDurationWithSign(workingDaysInSeconds);

      let calculatedEarnedSundays = 0;
      const totalDaysInMonth = moment(dateTo).endOf("month").date(); 
      const totalSundaysInMonth = countSundaysInMonth(
        moment(dateFrom).startOf("month"),
        moment(dateFrom).endOf("month")
      );
      const daysWithoutSundays = totalDaysInMonth - totalSundaysInMonth;

      if (daysWithoutSundays > 0) {
        calculatedEarnedSundays =
          (totalSundaysInMonth / daysWithoutSundays) * parseFloat(perdaywork);
      }

      employeeReports.push({
        employeeId: employee.userid,
        empname: employee.empname,
        gender: employee.gender_name,
        graceMinutes: employeeGraceMinutes,
        outDetails: employeeOutDetails,
        totals: {
          perdaywork: perdaywork,
          outDays: totalOutDays,
          outHour: totalOutDuration,
          workingHours: totalWorkingDuration,
          hoursE: totalHoursE,
          balanceHours: totalBalanceHours,
          sundayValue: totalSundayValueFormatted,
          presentDays: presentDaysCount,
          absentDays: absentDays,
          totalDays: totalDaysInRange,
          workingDays: workingDaysFormatted,
          workingDaysCount: workingDaysCount,
          sundays: totalSundays,
          standardWorkingHours: standardWorkingHours + " hours",
          holidayHour: standardWorkingHours + " hours",
          earnedSundays: calculatedEarnedSundays.toFixed(2),
          holidayDays: holidayResult.recordset.length,
          standardBreakDuration: standardBreakSeconds / 60 + " minutes",
          sundayType: sundayType,
          sundayWorkingHours: sundayWorkingSeconds / 3600 + " hours",
          minuteSalary: minuteSalary,
          hourlySalary: hourlySalary,
          dailySalary: dailySalary,
          salaryType: salaryType,
          graceMinutes: employeeGraceMinutes,
          totalDaysInMonth:
            salaryType === "Monthly"
              ? moment(
                  `${moment(dateFrom).year()}-${moment(dateFrom).month() + 1}`,
                  "YYYY-MM"
                ).daysInMonth()
              : null,
        },
      });
    }

    const response = {
      isSuccess: true,
      message: "Break attendance report generated successfully",
      data: employeeReports,
      holidays: holidayResult.recordset,
      dateRange: {
        from: moment.utc(dateFrom).format("DD-MMM-YYYY"),
        to: moment.utc(dateTo).format("DD-MMM-YYYY"),
        totalDays: moment(dateTo).diff(moment(dateFrom), "days") + 1,
      },
      standardBreakDuration: "From employee settings", // Updated this line
    };

    if (req.body.type === "pdf") {
      try {
        const dateRangeStr = `${moment
          .utc(dateFrom)
          .format("DD-MM-YYYY")} to ${moment.utc(dateTo).format("DD-MM-YYYY")}`;

        const pdfData = employeeReports.flatMap((report) =>
          report.outDetails.map((detail) => ({
            "S.No.": detail["S.No."],
            Employee: "✓ " + detail.Employee,
            Date: moment(detail.Date, "DD-MMM-YYYY").format("DD-MM-YYYY"),
            "In Time(A)": detail.FirstIn === "N/A" ? "N/A" : detail.FirstIn,
            "Out Time(B)": detail.LastOut === "N/A" ? "N/A" : detail.LastOut,
            "Working Hours(C)": detail.WorkingHours,
            "Out Hours(D)": detail["Total Out Duration"],
            "Hours E=(0.45-D)": detail.HoursE,
            "Balance Hours(F=C-E)": detail.BalanceHours,
            "Attendance Source": "Finger",
          }))
        );

        const pdfColumns = [
          { key: "S.No.", label: "S.No.", width: 40 },
          { key: "Employee", label: "Employee", width: 100 },
          { key: "Date", label: "Date", width: 80 },
          { key: "In Time(A)", label: "In Time(A)", width: 70 },
          { key: "Out Time(B)", label: "Out Time(B)", width: 70 },
          { key: "Working Hours(C)", label: "Working Hours(C)", width: 80 },
          { key: "Out Hours(D)", label: "Out Hours(D)", width: 70 },
          { key: "Hours E=(0.45-D)", label: "Hours E=(0.45-D)", width: 90 },
          {
            key: "Balance Hours(F=C-E)",
            label: "Balance Hours(F=C-E)",
            width: 90,
          },
          { key: "Attendance Source", label: "Attendance Source", width: 80 },
        ];

        const totals = {};
        if (employeeReports.length > 0) {
          const report = employeeReports[0];
          totals["Present"] = report.totals.presentDays;
          totals["Absent"] = report.totals.absentDays;
          totals["Given Holiday"] = report.totals.holidayDays;
          totals["Earned Sunday"] = report.totals.earnedSundays;
          totals["Working Days"] = report.totals.perdaywork;
          totals["Total Working Hours"] = report.totals.workingHours;
          totals["Total Break Time"] = report.totals.outHour;
          totals["Final Days (Days + Sun + HD)"] = (
            parseFloat(report.totals.perdaywork) +
            parseFloat(report.totals.earnedSundays) +
            report.totals.holidayDays
          );
          totals["Salary"] = (
            report.totals.dailySalary *
            parseFloat(totals["Final Days (Days + Sun + HD)"])
          );
        }

        const pdfBuffer = await generateCustomPDFReport(
          pdfData,
          {
            title: "Employee: " + (employeeReports[0]?.empname || ""),
            subtitle: `Date Range: ${dateRangeStr}\nTotal Break Time: ${
              employeeReports[0]?.totals?.outHour || "00:00:00"
            }`,
            columns: pdfColumns,
            filename: `break_attendance_${dateFrom}_to_${dateTo}.pdf`,
          },
          totals
        );

        res.setHeader("Content-Type", "application/pdf");
        res.setHeader(
          "Content-Disposition",
          `attachment; filename=break_attendance_${dateFrom}_to_${dateTo}.pdf`
        );

        return res.send(pdfBuffer);
      } catch (err) {
        console.error("PDF generation error:", err);
        return res.status(500).json({
          isSuccess: false,
          message: "Failed to generate PDF report",
        });
      }
    }

    if (req.body.type === "excel") {
      try {
        const dateRangeStr = `${moment
          .utc(dateFrom)
          .format("DD-MM-YYYY")} to ${moment.utc(dateTo).format("DD-MM-YYYY")}`;

        const excelData = employeeReports.flatMap((report) =>
          report.outDetails.map((detail) => ({
            "S.No.": detail["S.No."],
            Employee: "✓ " + detail.Employee,
            Date: moment(detail.Date, "DD-MMM-YYYY").format("DD-MM-YYYY"),
            "In Time(A)": detail.FirstIn === "N/A" ? "N/A" : detail.FirstIn,
            "Out Time(B)": detail.LastOut === "N/A" ? "N/A" : detail.LastOut,
            "Working Hours(C)": detail.WorkingHours,
            "Out Hours(D)": detail["Total Out Duration"],
            "Hours E=(0.45-D)": detail.HoursE,
            "Balance Hours(F=C-E)": detail.BalanceHours,
            "Attendance Source": "Finger",
          }))
        );

        const excelTotals = {};
        if (employeeReports.length > 0) {
          const report = employeeReports[0];
          excelTotals["Present"] = report.totals.presentDays;
          excelTotals["Absent"] = report.totals.absentDays;
          excelTotals["Given Holiday"] = report.totals.holidayDays;
          excelTotals["Earned Sunday"] = report.totals.earnedSundays;
          excelTotals["Working Days"] = report.totals.perdaywork;
          excelTotals["Total Working Hours"] = report.totals.workingHours;
          excelTotals["Total Break Time"] = report.totals.outHour;
          excelTotals["Final Days (Days + Sun + HD)"] = (
            parseFloat(report.totals.perdaywork) +
            parseFloat(report.totals.earnedSundays) +
            report.totals.holidayDays
          ).toFixed(2);
          excelTotals["Salary"] = (
            report.totals.dailySalary *
            parseFloat(excelTotals["Final Days (Days + Sun + HD)"])
          ).toFixed(2);
        }

        const buffer = await generateCustomExcelReport(excelData, excelTotals, {
          title: "Employee: " + (employeeReports[0]?.empname || ""),
          subtitle: `Date Range: ${dateRangeStr}\nTotal Break Time: ${
            employeeReports[0]?.totals?.outHour || "00:00:00"
          }`,
          filename: `break_attendance_${dateFrom}_to_${dateTo}.xlsx`,
        });

        return res.status(200).json({
          isSuccess: true,
          message: "Break attendance Excel generated successfully",
          base64: buffer.toString("base64"),
        });
      } catch (err) {
        console.error("Excel generation error:", err);
        return res.status(500).json({
          isSuccess: false,
          message: "Failed to generate Excel report",
        });
      }
    }
    res.json(response);
  } catch (err) {
    console.error("Error in BreakAttendance:", err);
    res.status(500).json({
      isSuccess: false,
      message: `Server error: ${err.message}`,
    });
  }
};

// PunchCorrection
const PunchCorrection = async (req, res) => {
  const { userId, date, inTime, outTime, deviceId = "MANUAL" } = req.body;

  // Validate required fields
  if (!userId || !date) {
    return res.status(400).json({
      isSuccess: false,
      message: "Missing required fields (userId, date)",
    });
  }

  // Validate at least one time is provided
  if (!inTime && !outTime) {
    return res.status(400).json({
      isSuccess: false,
      message: "At least one of inTime or outTime must be provided",
    });
  }

  const pool = await getConnection();
  const transaction = new sql.Transaction(pool);

  try {
    await transaction.begin();

    // Process IN punch if provided
    if (inTime) {
      const inDateTime = new Date(
        `${date}T${inTime.includes(":") ? inTime : inTime + ":00"}`
      );

      // Try to update existing record first
      const updateResult = await transaction
        .request()
        .input("deviceId", sql.NVarChar, deviceId)
        .input("userId", sql.Int, userId)
        .input("attDateTime", sql.DateTime, inDateTime).query(`
          UPDATE UserAttendance 
          SET 
            AttState = 0,
            VerifyMode = 99,
            UpdateedOn = GETDATE(),
            IsAbnomal = 1,
            upload = 1,
            io_mode = 0
          WHERE 
            DeviceID = @deviceId 
            AND UserID = @userId 
            AND AttDateTime = @attDateTime
        `);

      // If no existing record, insert new one
      if (updateResult.rowsAffected[0] === 0) {
        await transaction
          .request()
          .input("deviceId", sql.NVarChar, deviceId)
          .input("userId", sql.Int, userId)
          .input("attDateTime", sql.DateTime, inDateTime).query(`
            INSERT INTO UserAttendance (
              DeviceID, UserID, AttState, VerifyMode, AttDateTime, 
              UpdateedOn, IsAbnomal, upload, io_mode
            ) VALUES (
              @deviceId, @userId, 0, 99, @attDateTime,
              GETDATE(), 1, 1, 0
            )
          `);
      }
    }

    // Process OUT punch if provided
    if (outTime) {
      const outDateTime = new Date(
        `${date}T${outTime.includes(":") ? outTime : outTime + ":00"}`
      );

      const updateResult = await transaction
        .request()
        .input("deviceId", sql.NVarChar, deviceId)
        .input("userId", sql.Int, userId)
        .input("attDateTime", sql.DateTime, outDateTime).query(`
          UPDATE UserAttendance 
          SET 
            AttState = 1,
            VerifyMode = 99,
            UpdateedOn = GETDATE(),
            IsAbnomal = 1,
            upload = 1,
            io_mode = 1
          WHERE 
            DeviceID = @deviceId 
            AND UserID = @userId 
            AND AttDateTime = @attDateTime
        `);

      if (updateResult.rowsAffected[0] === 0) {
        await transaction
          .request()
          .input("deviceId", sql.NVarChar, deviceId)
          .input("userId", sql.Int, userId)
          .input("attDateTime", sql.DateTime, outDateTime).query(`
            INSERT INTO UserAttendance (
              DeviceID, UserID, AttState, VerifyMode, AttDateTime, 
              UpdateedOn, IsAbnomal, upload, io_mode
            ) VALUES (
              @deviceId, @userId, 1, 99, @attDateTime,
              GETDATE(), 1, 1, 1
            )
          `);
      }
    }

    await transaction.commit();

    return res.status(200).json({
      isSuccess: true,
      message: "Attendance correction processed successfully",
    });
  } catch (err) {
    await transaction.rollback();
    console.error("Error in PunchCorrection:", err);

    if (err.message.includes("PRIMARY KEY")) {
      return res.status(409).json({
        isSuccess: false,
        message: "Duplicate attendance record detected",
        suggestion:
          "Try again with slightly different time (e.g., add seconds)",
      });
    }

    return res.status(500).json({
      isSuccess: false,
      message: `Error processing correction: ${err.message}`,
    });
  }
};

module.exports = {
  handlePunchReport,
  handleDailyReport,
  handleMonthlyReport,
  OutReports,
  BreakAttendance,
  PunchCorrection,
};
