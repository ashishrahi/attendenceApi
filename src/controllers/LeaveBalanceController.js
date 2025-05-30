const { getConnection, sql } = require('../config/database');
const PDFDocument = require('pdfkit');
const ExcelJS = require('exceljs');
const moment = require('moment');
const stream = require("stream");

const createLeaveBalance = async (req, res) => {
  const { employeeId, leaveTypeId, totalEntitled, leaveTaken, year, effectiveDate } = req.body;

  // Validate input
  if (!employeeId || !leaveTypeId || totalEntitled === undefined || leaveTaken === undefined) {
    return res.status(400).json({
      success: false,
      message: 'employeeId, leaveTypeId, totalEntitled, and leaveTaken are required'
    });
  }

  try {
    const pool = await getConnection();

    // Check if record already exists (due to unique constraint)
    const existing = await pool.request()
      .input('EMP_ID', sql.Int, employeeId)
      .input('LEAVE_TYPE_ID', sql.Int, leaveTypeId)
      .query(`
        SELECT * FROM LeaveBalance 
        WHERE EmployeeID = @EMP_ID AND LeaveTypeID = @LEAVE_TYPE_ID
      `);

    if (existing.recordset.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Leave balance already exists for this employee and leave type'
      });
    }

    // Set default values for Year and EffectiveDate if not provided
    const currentYear = year || new Date().getFullYear();  // If no year provided, use current year
    const currentDate = effectiveDate || new Date().toISOString().split('T')[0];  // If no effectiveDate provided, use current date

    // Insert new record
    await pool.request()
      .input('EMP_ID', sql.Int, employeeId)
      .input('LEAVE_TYPE_ID', sql.Int, leaveTypeId)
      .input('ENTITLED', sql.Int, totalEntitled)
      .input('TAKEN', sql.Int, leaveTaken)
      .input('LAST_UPDATED', sql.DateTime, new Date())
      .input('YEAR', sql.Int, currentYear)
      .input('EFFECTIVE_DATE', sql.Date, currentDate)
      .query(`
        INSERT INTO LeaveBalance (EmployeeID, LeaveTypeID, TotalEntitled, LeaveTaken, LastUpdated, Year, EffectiveDate)
        VALUES (@EMP_ID, @LEAVE_TYPE_ID, @ENTITLED, @TAKEN, @LAST_UPDATED, @YEAR, @EFFECTIVE_DATE)
      `);

    res.status(201).json({ success: true, message: 'Leave balance created successfully' });
  } catch (error) {
    console.error('Error creating leave balance:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

const updateLeaveBalance = async (req, res) => {
  const { employeeId, leaveTypeId, totalEntitled, leaveTaken, year, effectiveDate } = req.body;

  if (!employeeId || !leaveTypeId) {
    return res.status(400).json({
      success: false,
      message: 'employeeId and leaveTypeId are required'
    });
  }

  try {
    const pool = await getConnection();

    // Check if record exists
    const check = await pool.request()
      .input('EMP_ID', sql.Int, employeeId)
      .input('TYPE_ID', sql.Int, leaveTypeId)
      .query(`
        SELECT * FROM LeaveBalance 
        WHERE EmployeeID = @EMP_ID AND LeaveTypeID = @TYPE_ID
      `);

    if (check.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Leave balance record not found for given employee and leave type'
      });
    }

    // Prepare dynamic fields to update
    const updates = [];
    if (typeof totalEntitled === 'number') updates.push(`TotalEntitled = @TOTAL`);
    if (typeof leaveTaken === 'number') updates.push(`LeaveTaken = @TAKEN`);

    // Only update Year and EffectiveDate if they are provided
    if (year) updates.push(`Year = @YEAR`);
    if (effectiveDate) updates.push(`EffectiveDate = @EFFECTIVE_DATE`);

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid fields provided for update (totalEntitled or leaveTaken or year or effectiveDate)'
      });
    }

    updates.push(`LastUpdated = @UPDATED`);

    // Build and execute update query
    await pool.request()
      .input('EMP_ID', sql.Int, employeeId)
      .input('TYPE_ID', sql.Int, leaveTypeId)
      .input('TOTAL', sql.Int, totalEntitled)
      .input('TAKEN', sql.Int, leaveTaken)
      .input('YEAR', sql.Int, year)
      .input('EFFECTIVE_DATE', sql.Date, effectiveDate)
      .input('UPDATED', sql.DateTime, new Date())
      .query(`
        UPDATE LeaveBalance
        SET ${updates.join(', ')}
        WHERE EmployeeID = @EMP_ID AND LeaveTypeID = @TYPE_ID
      `);

    res.status(200).json({ success: true, message: 'Leave balance updated successfully' });
  } catch (error) {
    console.error('Error updating leave balance:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// const getLeaveBalance = async (req, res) => {
//   const { employeeId, leaveTypeId, year } = req.body;

//   try {
//     const pool = await getConnection();
//     const request = pool.request();

//     if (employeeId === -1) {
//       // For all employees: Distinct by EmployeeID, pick latest LastUpdated
//       const query = `
//         SELECT lb.*
//         FROM LeaveBalance lb
//         INNER JOIN (
//           SELECT EmployeeID, MAX(LastUpdated) AS MaxUpdated
//           FROM LeaveBalance
//           GROUP BY EmployeeID
//         ) latest ON lb.EmployeeID = latest.EmployeeID AND lb.LastUpdated = latest.MaxUpdated
//         ORDER BY lb.EmployeeID
//       `;

//       const result = await request.query(query);

//       return res.status(200).json({
//         success: true,
//         data: result.recordset
//       });

//     } else {
//       // For specific employee: All records, latest LastUpdated as parent
//       let query = `
//         SELECT * FROM LeaveBalance
//         WHERE EmployeeID = @EMP_ID
//         ${leaveTypeId !== -1 ? 'AND LeaveTypeID = @TYPE_ID' : ''}
//         ${year !== null && year !== undefined ? 'AND Year = @YEAR' : ''}
//         ORDER BY LastUpdated DESC
//       `;

//       request.input('EMP_ID', sql.Int, employeeId);
//       if (leaveTypeId !== -1) request.input('TYPE_ID', sql.Int, leaveTypeId);
//       if (year !== null && year !== undefined) request.input('YEAR', sql.Int, year);

//       const result = await request.query(query);

//       if (result.recordset.length === 0) {
//         return res.status(404).json({
//           success: false,
//           message: 'No Leave Balance record found for the given filters.'
//         });
//       }

//       const [parent, ...children] = result.recordset;
//       return res.status(200).json({
//         success: true,
//         data: { parent, children }
//       });
//     }

//   } catch (error) {
//     console.error('Error occurred while fetching leave balance:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Server error',
//       error: error.message
//     });
//   }
// };

const getLeaveBalance = async (req, res) => {
  const { employeeId, leaveTypeId, year, type } = req.body;

  try {
    const pool = await getConnection();
    const request = pool.request();

    let resultData;

    if (employeeId === -1) {
      const query = `
        SELECT lb.LeaveBalanceID,
               em.id AS EmployeeID,
               em.first_name AS EmployeeName,
               lt.LeaveTypeID,
               lt.LeaveTypeName AS LeaveType,
               lb.TotalEntitled,
               lb.LeaveTaken,
               lb.LeaveRemaining,
               lb.Year,
               lb.LastUpdated AS EffectiveDate
        FROM LeaveBalance lb
        INNER JOIN (
          SELECT EmployeeID, MAX(LastUpdated) AS MaxUpdated
          FROM LeaveBalance
          GROUP BY EmployeeID
        ) latest ON lb.EmployeeID = latest.EmployeeID AND lb.LastUpdated = latest.MaxUpdated
        INNER JOIN d00_emptable em ON lb.EmployeeID = em.id
        INNER JOIN LeaveType lt ON lb.LeaveTypeID = lt.LeaveTypeID
        ORDER BY lb.EmployeeID;
      `;

      const result = await request.query(query);
      resultData = result.recordset;

    } else {
      let query = `
        SELECT 
          lb.LeaveBalanceID,
          em.id AS EmployeeID,
          em.first_name AS EmployeeName,
          lt.LeaveTypeID,
          lt.LeaveTypeName AS LeaveType,
          lb.TotalEntitled,
          lb.LeaveTaken,
          lb.LeaveRemaining,
          lb.Year,
          lb.LastUpdated AS EffectiveDate
        FROM LeaveBalance lb
        INNER JOIN d00_emptable em ON lb.EmployeeID = em.id
        INNER JOIN LeaveType lt ON lb.LeaveTypeID = lt.LeaveTypeID
        WHERE lb.EmployeeID = @EMP_ID
        ${leaveTypeId !== -1 ? 'AND lb.LeaveTypeID = @TYPE_ID' : ''}
        ${year !== null && year !== undefined ? 'AND lb.Year = @YEAR' : ''}
        ORDER BY lb.LastUpdated DESC
      `;
      request.input('EMP_ID', sql.Int, employeeId);
      if (leaveTypeId !== -1) request.input('TYPE_ID', sql.Int, leaveTypeId);
      if (year !== null && year !== undefined) request.input('YEAR', sql.Int, year);

      const result = await request.query(query);
      if (result.recordset.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'No Leave Balance record found for the given filters.'
        });
      }

      const [parent, ...children] = result.recordset;
      resultData = { parent, children };
    }

    // 📄 PDF Export
    if (type === 'pdf') {
      const PDFDocument = require('pdfkit');
      const moment = require('moment');
      const doc = new PDFDocument({ margin: 30, size: 'A4', layout: 'landscape' });
      const buffers = [];

      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfData = Buffer.concat(buffers);
        const base64PDF = pdfData.toString('base64');
        return res.status(200).json({
          success: true,
          message: 'Leave balance PDF generated successfully',
          base64: base64PDF
        });
      });

      doc.fillColor('#0A5275').fontSize(16).font('Helvetica-Bold').text('Leave Balance Report', { align: 'center' });
      doc.moveDown();

      const headers = ['Sr. No.', 'Employee', 'Leave Type', 'Total Entitled', 'Leave Taken', 'Leave Remaining', 'Year', 'Effective Date'];
      const colWidths = [50, 100, 80, 80, 70, 80, 50, 100];
      const totalTableWidth = colWidths.reduce((a, b) => a + b, 0);

      let rows = employeeId === -1 ? resultData : [resultData.parent, ...resultData.children];
      let xStart = (doc.page.width - totalTableWidth) / 2;
      let y = doc.y;

      // Header Row
      let x = xStart;
      doc.font('Helvetica-Bold').fontSize(9);
      headers.forEach((text, i) => {
        doc.rect(x, y, colWidths[i], 20).fillAndStroke('#D6EAF8', '#000').fillColor('black').text(text, x + 3, y + 5);
        x += colWidths[i];
      });

      y += 20;
      doc.font('Helvetica').fontSize(8);

      rows.forEach((row, index) => {
        x = xStart;
        if (y > 770) {
          doc.addPage();
          y = 40;
        }

        const values = [
          index + 1,
          row.EmployeeName ?? '',
          row.LeaveType ?? '',
          row.TotalEntitled ?? '',
          row.LeaveTaken ?? '',
          row.LeaveRemaining ?? '',
          row.Year ?? '',
          row.EffectiveDate ? moment(row.EffectiveDate).format('DD/MM/YYYY') : ''
        ];

        values.forEach((val, i) => {
          doc.rect(x, y, colWidths[i], 20).stroke().text(val.toString(), x + 3, y + 5);
          x += colWidths[i];
        });

        y += 20;
      });

      doc.end();
      return;
    }

    // 📊 Excel Export
    else if (type === 'excel') {
      const ExcelJS = require('exceljs');
      const moment = require('moment');
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Leave Balance Report');

      worksheet.mergeCells('A1:H1');
      worksheet.getCell('A1').value = 'Leave Balance Report';
      worksheet.getCell('A1').alignment = { vertical: 'middle', horizontal: 'center' };
      worksheet.getCell('A1').font = { bold: true, size: 14 };

      worksheet.columns = [
        { header: 'Sr. No.', key: 'sr', width: 10 },
        { header: 'Employee', key: 'emp', width: 25 },
        { header: 'Leave Type', key: 'type', width: 20 },
        { header: 'Total Entitled', key: 'totalEntitled', width: 15 },
        { header: 'Leave Taken', key: 'taken', width: 15 },
        { header: 'Leave Remaining', key: 'remain', width: 15 },
        { header: 'Year', key: 'year', width: 10 },
        { header: 'Effective Date', key: 'date', width: 20 },
      ];

      const rows = employeeId === -1 ? resultData : [resultData.parent, ...resultData.children];

      rows.forEach((row, index) => {
        worksheet.addRow({
          sr: index + 1,
          emp: row.EmployeeName,
          type: row.LeaveType,
          totalEntitled: row.TotalEntitled,
          taken: row.LeaveTaken,
          remain: row.LeaveRemaining,
          year: row.Year,
          date: moment(row.EffectiveDate).format('DD/MM/YYYY')
        });
      });

      const buffer = await workbook.xlsx.writeBuffer();
      const base64Excel = buffer.toString('base64');

      return res.status(200).json({
        success: true,
        message: 'Excel leave balance generated successfully',
        base64: base64Excel
      });
    }

    // 🟢 Default JSON response
    return res.status(200).json({
      success: true,
      data: resultData
    });

  } catch (error) {
    console.error('Error occurred while fetching leave balance:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};



const deleteLeaveBalance = async (req, res) => {
  const { id } = req.params; // leaveBalanceId from URL

  if (!id) {
    return res.status(400).json({
      success: false,
      message: 'LeaveBalanceID (id) is required in the URL'
    });
  }

  try {
    const pool = await getConnection();

    // Check if the record exists
    const check = await pool.request()
      .input('ID', sql.Int, id)
      .query('SELECT * FROM LeaveBalance WHERE LeaveBalanceID = @ID');

    if (check.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Leave balance record not found with the given ID'
      });
    }

    // Delete the record
    await pool.request()
      .input('ID', sql.Int, id)
      .query('DELETE FROM LeaveBalance WHERE LeaveBalanceID = @ID');

    res.status(200).json({
      success: true,
      message: 'Leave balance deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting leave balance:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

const getEmployeeLeaveDetails = async (req, res) => {
  const { employeeId } = req.body;

  if (!employeeId) {
    return res.status(400).json({
      success: false,
      message: 'कर्मचारी ID आवश्यक है।'
    });
  }

  try {
    const pool = await getConnection();
    const request = pool.request();
    request.input('EMP_ID', sql.Int, employeeId);

    const result = await request.query(`
      SELECT 
        la.LeaveAppID,
        la.EmployeeID,
        la.LeaveTypeID,
        lt.LeaveTypeName,
        la.FromDate,
        la.ToDate,
        la.TotalDays,
        la.Reason,
        la.Status,
        la.AppliedDate,
        la.ApprovedBy,
        la.ApprovedDate,
        la.RejectionRemark
      FROM LeaveApplication la
      LEFT JOIN LeaveType lt ON la.LeaveTypeId = lt.LeaveTypeId
      WHERE la.EmployeeId = @EMP_ID
      ORDER BY la.FromDate DESC
    `);

    const leaves = result.recordset;

    if (leaves.length === 0) {
      return res.status(200).json({
        success: true,
        employeeId,
        leaveDetails: []
      });
    }

    const [parent, ...children] = leaves;

    res.status(200).json({
      success: true,
      employeeId,
      leaveDetails: {
        parent,
        children
      }
    });
  } catch (error) {
    console.error('डेटा प्राप्त करने में त्रुटि:', error);
    res.status(500).json({
      success: false,
      message: 'सर्वर त्रुटि',
      error: error.message
    });
  }
};

module.exports = {
  createLeaveBalance,
  getLeaveBalance,
  deleteLeaveBalance,
  updateLeaveBalance,
  getEmployeeLeaveDetails
};