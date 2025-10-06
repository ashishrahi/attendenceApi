// services/breakAttendanceExport.ts
import PDFDocument from 'pdfkit';
import ExcelJS from 'exceljs';
import { Response } from 'express';

interface BreakDetail {
  Date: string;
  FirstIn: string;
  LastOut: string;
  'Out Time': string;
  'In Time': string;
  'Out Duration': string;
  'Total Out Duration': string;
  IsHoliday: boolean;
  IsSunday: boolean;
  IsEarnedSunday?: boolean;
  HoursE: string;
  WorkingHours?: string;
  GraceMinutes?: string[];
}

interface EmployeeBreak {
  employeeId: string;
  empname: string;
  totals: {
    presentDays: number;
    absentDays: number;
    outHour: string;
    workingHours: string;
    balanceHours: string;
    sundayValue: string;
  };
  outDetails: BreakDetail[];
}

interface ExportOptions {
  title?: string;
  subtitle?: string;
  dateRange?: string;
  filename?: string;
}

// PDF Export
export const generateBreakAttendancePDF = (
  data: EmployeeBreak[],
  options: ExportOptions,
  res: Response
) => {
  const {
    title = 'Break Attendance Report',
    subtitle = '',
    dateRange = '',
    filename = 'break_attendance.pdf'
  } = options;

  const doc = new PDFDocument({ margin: 30, size: 'A4', layout: 'landscape' });
  const buffers: Buffer[] = [];

  doc.on('data', buffers.push.bind(buffers));
  doc.on('end', () => {
    const pdfData = Buffer.concat(buffers);
    res.status(200).json({
      isSuccess: true,
      message: "Break attendance PDF generated successfully",
      base64: pdfData.toString('base64')
    });
  });

  // Header
  doc.fillColor('#0A5275')
     .fontSize(16)
     .font('Helvetica-Bold')
     .text(title, { align: 'center' });

  if (subtitle) {
    doc.moveDown(0.3)
       .fillColor('black')
       .fontSize(10)
       .text(subtitle, { align: 'center' });
  }

  if (dateRange) {
    doc.moveDown(0.3)
       .fillColor('black')
       .fontSize(10)
       .text(`Date Range: ${dateRange}`, { align: 'center' });
  }

  doc.moveDown(1);

  // Employee Summary Table
  const summaryColumns = [
    { label: "Emp ID", width: 60 },
    { label: "Name", width: 120 },
    { label: "Present Days", width: 60 },
    { label: "Absent Days", width: 60 },
    { label: "Total Out Time", width: 80 },
    { label: "Working Hours", width: 80 },
    { label: "Balance Hours", width: 80 },
    { label: "Sunday Value", width: 80 }
  ];

  let x = 30;
  let y = doc.y;

  // Summary Table Header
  doc.font('Helvetica-Bold').fontSize(9);
  summaryColumns.forEach(col => {
    doc.rect(x, y, col.width, 20)
       .fillAndStroke('#D6EAF8', '#000')
       .fillColor('black')
       .text(col.label, x + 5, y + 5, { width: col.width - 10, align: 'center' });
    x += col.width;
  });

  y += 20;

  // Summary Table Rows
  doc.font('Helvetica').fontSize(8);
  data.forEach(employee => {
    x = 30;
    if (y > 550) {
      doc.addPage({ layout: 'landscape' });
      y = 50;
    }

    const rowData = [
      employee.employeeId,
      employee.empname,
      employee.totals.presentDays,
      employee.totals.absentDays,
      employee.totals.outHour,
      employee.totals.workingHours,
      employee.totals.balanceHours,
      employee.totals.sundayValue
    ];

    rowData.forEach((text, i) => {
      const col = summaryColumns[i];
      doc.rect(x, y, col.width, 20).stroke();
      doc.text(String(text), x + 5, y + 5, { 
        width: col.width - 10, 
        align: i > 1 ? 'center' : 'left' 
      });
      x += col.width;
    });

    y += 20;

    // Detailed Break Table for each employee
    const breakColumns = [
      { label: "Date", width: 80 },
      { label: "First In", width: 60 },
      { label: "Last Out", width: 60 },
      { label: "Out Time", width: 60 },
      { label: "In Time", width: 60 },
      { label: "Out Duration", width: 80 },
      { label: "Total Out", width: 80 },
      { label: "Break Status", width: 80 }
    ];

    // Employee Name Header
    y += 10;
    doc.font('Helvetica-Bold').fontSize(10)
       .text(`${employee.empname} (${employee.employeeId}) - Break Details`, 30, y);
    y += 20;

    // Break Table Header
    x = 30;
    doc.font('Helvetica-Bold').fontSize(8);
    breakColumns.forEach(col => {
      doc.rect(x, y, col.width, 20)
         .fillAndStroke('#E5E5E5', '#000')
         .fillColor('black')
         .text(col.label, x + 5, y + 5, { width: col.width - 10, align: 'center' });
      x += col.width;
    });

    y += 20;

    // Break Table Rows
    doc.font('Helvetica').fontSize(8);
    employee.outDetails.forEach(detail => {
      x = 30;
      if (y > 550) {
        doc.addPage({ layout: 'landscape' });
        y = 50;
      }

      const breakStatus = detail.IsHoliday ? 'Holiday' : 
                         detail.IsSunday ? (detail.IsEarnedSunday ? 'Earned Sunday' : 'Sunday') :
                         detail.HoursE.startsWith('-') ? 'Excess Break' : 'Normal Break';

      const rowData = [
        detail.Date,
        detail.FirstIn,
        detail.LastOut,
        detail["Out Time"],
        detail["In Time"],
        detail["Out Duration"],
        detail["Total Out Duration"],
        breakStatus
      ];

      rowData.forEach((text, i) => {
        const col = breakColumns[i];
        doc.rect(x, y, col.width, 20).stroke();
        doc.text(String(text), x + 5, y + 5, { 
          width: col.width - 5, 
          align: 'center' 
        });
        x += col.width;
      });

      y += 20;
    });

    y += 10;
  });

  doc.end();
};

// Excel Export
export const generateBreakAttendanceExcel = async (
  data: EmployeeBreak[],
  options: ExportOptions
): Promise<Buffer> => {
  const {
    title = 'Break Attendance Report',
    subtitle = '',
    dateRange = '',
    filename = 'break_attendance.xlsx'
  } = options;

  const workbook = new ExcelJS.Workbook();
  const summarySheet = workbook.addWorksheet('Summary');
  const detailSheet = workbook.addWorksheet('Details');

  // Summary Sheet
  summarySheet.mergeCells('A1:H1');
  summarySheet.getCell('A1').value = title;
  summarySheet.getCell('A1').font = { bold: true, size: 14 };
  summarySheet.getCell('A1').alignment = { horizontal: 'center' };

  if (subtitle) {
    summarySheet.mergeCells('A2:H2');
    summarySheet.getCell('A2').value = subtitle;
    summarySheet.getCell('A2').font = { size: 12 };
    summarySheet.getCell('A2').alignment = { horizontal: 'center' };
  }

  if (dateRange) {
    summarySheet.mergeCells('A3:H3');
    summarySheet.getCell('A3').value = `Date Range: ${dateRange}`;
    summarySheet.getCell('A3').font = { size: 10 };
    summarySheet.getCell('A3').alignment = { horizontal: 'center' };
  }

  // Summary Table Header
  const summaryHeader = [
    { header: 'Emp ID', width: 15 },
    { header: 'Name', width: 25 },
    { header: 'Present Days', width: 15 },
    { header: 'Absent Days', width: 15 },
    { header: 'Total Out Time', width: 20 },
    { header: 'Working Hours', width: 20 },
    { header: 'Balance Hours', width: 20 },
    { header: 'Sunday Value', width: 20 }
  ];

  summarySheet.addRow(summaryHeader.map(col => col.header));
  summaryHeader.forEach((col, idx) => {
    summarySheet.getColumn(idx + 1).width = col.width;
    summarySheet.getRow(5).getCell(idx + 1).font = { bold: true };
    summarySheet.getRow(5).getCell(idx + 1).alignment = { horizontal: 'center' };
  });

  // Summary Table Data
  data.forEach(employee => {
    summarySheet.addRow([
      employee.employeeId,
      employee.empname,
      employee.totals.presentDays,
      employee.totals.absentDays,
      employee.totals.outHour,
      employee.totals.workingHours,
      employee.totals.balanceHours,
      employee.totals.sundayValue
    ]);
  });

  // Details Sheet
  detailSheet.mergeCells('A1:N1');
  detailSheet.getCell('A1').value = `${title} - Detailed Break Records`;
  detailSheet.getCell('A1').font = { bold: true, size: 14 };
  detailSheet.getCell('A1').alignment = { horizontal: 'center' };

  if (dateRange) {
    detailSheet.mergeCells('A2:N2');
    detailSheet.getCell('A2').value = `Date Range: ${dateRange}`;
    detailSheet.getCell('A2').font = { size: 10 };
    detailSheet.getCell('A2').alignment = { horizontal: 'center' };
  }

  // Details Table Header
  const detailHeader = [
    { header: 'Emp ID', width: 15 },
    { header: 'Name', width: 25 },
    { header: 'Date', width: 15 },
    { header: 'First In', width: 15 },
    { header: 'Last Out', width: 15 },
    { header: 'Out Time', width: 15 },
    { header: 'In Time', width: 15 },
    { header: 'Out Duration', width: 20 },
    { header: 'Total Out', width: 20 },
    { header: 'Working Hours', width: 20 },
    { header: 'Break Status', width: 20 },
    { header: 'Is Holiday', width: 15 },
    { header: 'Is Sunday', width: 15 },
    { header: 'Grace Minutes', width: 20 }
  ];

  detailSheet.addRow(detailHeader.map(col => col.header));
  detailHeader.forEach((col, idx) => {
    detailSheet.getColumn(idx + 1).width = col.width;
    detailSheet.getRow(4).getCell(idx + 1).font = { bold: true };
    detailSheet.getRow(4).getCell(idx + 1).alignment = { horizontal: 'center' };
  });

  // Details Table Data
  data.forEach(employee => {
    employee.outDetails.forEach(detail => {
      const breakStatus = detail.IsHoliday ? 'Holiday' : 
                        detail.IsSunday ? (detail.IsEarnedSunday ? 'Earned Sunday' : 'Sunday') :
                        detail.HoursE.startsWith('-') ? 'Excess Break' : 'Normal Break';

      detailSheet.addRow([
        employee.employeeId,
        employee.empname,
        detail.Date,
        detail.FirstIn,
        detail.LastOut,
        detail["Out Time"],
        detail["In Time"],
        detail["Out Duration"],
        detail["Total Out Duration"],
        detail.WorkingHours || '',
        breakStatus,
        detail.IsHoliday ? 'Yes' : 'No',
        detail.IsSunday ? 'Yes' : 'No',
        detail.GraceMinutes ? detail.GraceMinutes.join(', ') : 'None'
      ]);
    });
  });

  const buffer = await workbook.xlsx.writeBuffer();
  return buffer;
};
