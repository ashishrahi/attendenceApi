import PDFDocument from 'pdfkit';
import ExcelJS from 'exceljs';
import moment from 'moment';

interface Column {
  key: string;
  label: string;
  width?: number;
  align?: 'left' | 'center' | 'right';
}

interface Options {
  title?: string;
  subtitle?: string;
  columns?: Column[];
  filename?: string;
  margin?: number;
  pageSize?: PDFKit.PDFDocumentOptions['size'];
  layout?: PDFKit.PDFDocumentOptions['layout'];
  headerColor?: string;
  rowColor?: string;
  alternateRowColor?: string;
  font?: string;
  fontSize?: number;
  lineHeight?: number;
  sheetName?: string;
  dateFormat?: string;
  timeFormat?: string;
  evenRowColor?: string;
  oddRowColor?: string;
}

interface Totals {
  [key: string]: string | number;
}

type DataRow = Record<string, any>;

// ================= PDF =================
export const generateCustomPDFReport = (
  data: DataRow[],
  options: Options,
  totals: Totals | null = null
): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    try {
      const {
        title = 'Report',
        subtitle = '',
        columns = [],
        filename = 'report.pdf',
        margin = 40,
        pageSize = 'A4',
        layout = 'landscape',
        headerColor = '#f2f2f2',
        rowColor = '#ffffff',
        alternateRowColor = '#f9f9f9',
        font = 'Helvetica',
        fontSize = 10,
        lineHeight = 1.2
      } = options;

      const doc = new PDFDocument({
        margin,
        size: pageSize,
        layout,
        bufferPages: true,
        font
      });

      const buffers: Buffer[] = [];
      let pageNumber = 0;

      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', reject);

      doc.on('pageAdded', () => {
        pageNumber++;
        addHeader(doc, title, subtitle, pageNumber, options);
      });

      addHeader(doc, title, subtitle, ++pageNumber, options);
      doc.moveDown(1);

      const availableWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;
      const totalDefinedWidth = columns.reduce((sum, col) => sum + (col.width || 0), 0);
      const remainingWidth = availableWidth - totalDefinedWidth;
      const columnsWithoutWidth = columns.filter(c => !c.width).length;
      const minColumnWidth = 30;
      const defaultWidth = Math.max(minColumnWidth, remainingWidth / Math.max(1, columnsWithoutWidth));

      const finalColumns = columns.map(col => ({
        ...col,
        width: col.width ? Math.max(col.width, minColumnWidth) : defaultWidth,
        align: col.align || 'left'
      }));

      addTable(doc, finalColumns, data, { headerColor, rowColor, alternateRowColor, fontSize, lineHeight, font });

      if (totals && Object.keys(totals).length > 0) {
        addTotalsSection(doc, totals, options);
      }

      addFooter(doc, options);

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
};

function addHeader(doc: PDFKit.PDFDocument, title: string, subtitle: string, pageNumber: number, options: Options) {
  const { font = 'Helvetica', fontSize = 10 } = options;

  doc.fillColor('#333333')
    .font(`${font}-Bold`)
    .fontSize(18)
    .text(title, doc.page.margins.left, 50, {
      width: doc.page.width - doc.page.margins.left - doc.page.margins.right,
      align: 'left',
      lineBreak: false
    });

  if (subtitle) {
    doc.fillColor('#666666')
      .font(font)
      .fontSize(12)
      .text(subtitle, doc.page.margins.left, 75, {
        width: doc.page.width - doc.page.margins.left - doc.page.margins.right,
        align: 'left',
        lineBreak: false
      });
  }

  doc.fontSize(10)
    .fillColor('#444444')
    .text(`Page ${pageNumber}`, doc.page.width - doc.page.margins.right - 50, 50, { align: 'right' });

  doc.y = 100;
}

function addTable(
  doc: PDFKit.PDFDocument,
  columns: Column[],
  data: DataRow[],
  styles: { headerColor: string; rowColor: string; alternateRowColor: string; fontSize: number; lineHeight: number; font?: string }
) {
  const { headerColor, rowColor, alternateRowColor, fontSize, lineHeight, font } = styles;
  const initialY = doc.y;
  let y = initialY;
  const rowHeight = fontSize * lineHeight * 2.5;
  const cellPadding = 5;

  doc.font(`${font || 'Helvetica'}-Bold`).fontSize(fontSize);

  let x = doc.page.margins.left;
  columns.forEach(col => {
    doc.rect(x, y, col.width!, rowHeight)
      .fillAndStroke(headerColor, '#000')
      .fillColor('#000000');

    doc.text(col.label, x + cellPadding, y + cellPadding, { width: col.width! - cellPadding * 2, align: col.align, lineBreak: true, height: rowHeight - cellPadding * 2 });
    x += col.width!;
  });

  y += rowHeight;

  doc.font(font || 'Helvetica').fontSize(fontSize);

  data.forEach((row, rowIndex) => {
    if (y + rowHeight > doc.page.height - 100) {
      doc.addPage();
      y = 100;
    }

    x = doc.page.margins.left;
    const fillColor = rowIndex % 2 === 0 ? rowColor : alternateRowColor;

    columns.forEach(col => {
      const cellValue = row[col.key] !== undefined && row[col.key] !== null ? String(row[col.key]) : '';

      doc.rect(x, y, col.width!, rowHeight).fillAndStroke(fillColor, '#ddd');
      doc.fillColor('#000000').text(cellValue, x + cellPadding, y + cellPadding, { width: col.width! - cellPadding * 2, align: col.align, lineBreak: true, height: rowHeight - cellPadding * 2 });
      x += col.width!;
    });

    y += rowHeight;
  });

  doc.y = y + 10;
}

function addTotalsSection(doc: PDFKit.PDFDocument, totals: Totals, options: Options) {
  const { font = 'Helvetica', fontSize = 10 } = options;
  doc.moveDown(2);

  if (doc.y > doc.page.height - 120) {
    doc.addPage();
    doc.y = 100;
  }

  doc.font(`${font}-Bold`).fontSize(14).fillColor('#000000').text('Summary Totals', doc.page.margins.left);
  doc.moveDown(0.5);

  const totalEntries = Object.entries(totals);
  const availableWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;
  const cellPadding = 10;
  const itemsPerRow = 2;
  const cellWidth = availableWidth / itemsPerRow;
  const cellHeight = 30;

  let x = doc.page.margins.left;
  let y = doc.y;

  doc.font(font).fontSize(fontSize);

  totalEntries.forEach(([label, value], index) => {
    if (index > 0 && index % itemsPerRow === 0) {
      x = doc.page.margins.left;
      y += cellHeight;
      if (y + cellHeight > doc.page.height - 50) {
        doc.addPage();
        y = 100;
      }
    }

    doc.rect(x, y, cellWidth, cellHeight).fillAndStroke('#f5f5f5', '#999');

    const formattedValue = typeof value === 'number' ? value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : String(value);

    doc.fillColor('#333333').text(`${label}:`, x + cellPadding, y + 5, { width: cellWidth - cellPadding * 2, align: 'left' });
    doc.fillColor('#000000').font(`${font}-Bold`).text(formattedValue, x + cellPadding, y + 15, { width: cellWidth - cellPadding * 2, align: 'left' });

    x += cellWidth;
  });

  doc.y = y + cellHeight + 10;
}

function addFooter(doc: PDFKit.PDFDocument, options: Options) {
  const { font = 'Helvetica', fontSize = 10 } = options;

  doc.font(font).fontSize(fontSize).fillColor('#666666').text(`Generated on ${moment().format('YYYY-MM-DD HH:mm:ss')}`, doc.page.margins.left, doc.page.height - 40, {
    align: 'center',
    width: doc.page.width - doc.page.margins.left - doc.page.margins.right
  });
}

// ================= Excel =================
export const generateCustomExcelReport = async (data: DataRow[], totals: Totals | null, options: Options): Promise<Buffer> => {
  const {
    title = 'Report',
    subtitle = '',
    sheetName = 'Data Report',
    dateFormat = 'yyyy-mm-dd',
    timeFormat = 'hh:mm:ss',
    headerColor = '0070C0',
    evenRowColor = 'FFFFFF',
    oddRowColor = 'F2F2F2'
  } = options;

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet(sheetName, {
    pageSetup: {
      paperSize: 9,
      orientation: 'landscape',
      margins: { left: 0.7, right: 0.7, top: 0.75, bottom: 0.75, header: 0.3, footer: 0.3 }
    },
    views: [{ state: 'frozen', ySplit: 3 }],
    properties: { showGridLines: false }
  });

  worksheet.columns = [
    { header: 'S.No.', key: 'sno', width: 10 },
    { header: 'Employee', key: 'employee', width: 25 },
    { header: 'Date', key: 'date', width: 15, style: { numFmt: dateFormat } },
    { header: 'In Time', key: 'inTime', width: 15, style: { numFmt: timeFormat } },
    { header: 'Out Time', key: 'outTime', width: 15, style: { numFmt: timeFormat } },
    { header: 'Working Hours', key: 'workingHours', width: 18, style: { numFmt: '[h]:mm:ss' } },
    { header: 'Out Hours', key: 'outHours', width: 15, style: { numFmt: '[h]:mm:ss' } },
    { header: 'Calculated Hours', key: 'calculatedHours', width: 18, style: { numFmt: '[h]:mm:ss' } },
    { header: 'Balance Hours', key: 'balanceHours', width: 18, style: { numFmt: '[h]:mm:ss' } },
    { header: 'Source', key: 'source', width: 20 }
  ];

  worksheet.mergeCells('A1:J1');
  const titleCell = worksheet.getCell('A1');
  titleCell.value = title;
  titleCell.font = { bold: true, size: 16, color: { argb: '000000' } };
  titleCell.alignment = { horizontal: 'left', vertical: 'middle', wrapText: true };
  titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'D3D3D3' } };
  titleCell.border = { bottom: { style: 'medium', color: { argb: '000000' } } };

  worksheet.mergeCells('A2:J2');
  const subtitleCell = worksheet.getCell('A2');
  subtitleCell.value = subtitle;
  subtitleCell.font = { size: 12, color: { argb: '444444' } };
  subtitleCell.alignment = { horizontal: 'left', vertical: 'middle', wrapText: true };

  const headerRow = worksheet.getRow(3);
  headerRow.values = ['S.No.', 'Employee', 'Date', 'In Time', 'Out Time', 'Working Hours', 'Out Hours', 'Calculated Hours', 'Balance Hours', 'Source'];
  headerRow.height = 25;
  headerRow.eachCell(cell => {
    cell.font = { bold: true, color: { argb: 'FFFFFF' }, size: 11 };
    cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: headerColor } };
    cell.border = {
      top: { style: 'thin', color: { argb: '000000' } },
      left: { style: 'thin', color: { argb: '000000' } },
      bottom: { style: 'thin', color: { argb: '000000' } },
      right: { style: 'thin', color: { argb: '000000' } }
    };
  });

  data.forEach((item, index) => {
    const row = worksheet.addRow({
      sno: item['S.No.'] || index + 1,
      employee: item['Employee'] || '',
      date: item['Date'] instanceof Date ? item['Date'] : new Date(item['Date']),
      inTime: item['In Time(A)'] || item['In Time'] || '',
      outTime: item['Out Time(B)'] || item['Out Time'] || '',
      workingHours: item['Working Hours(C)'] || item['Working Hours'] || 0,
      outHours: item['Out Hours(D)'] || item['Out Hours'] || 0,
      calculatedHours: item['Hours E=(0.45-D)'] || item['Calculated Hours'] || 0,
      balanceHours: item['Balance Hours(F=C-E)'] || item['Balance Hours'] || 0,
      source: item['Attendance Source'] || item['Source'] || ''
    });

    const fillColor = index % 2 === 0 ? evenRowColor : oddRowColor;
    row.height = 20;

    row.eachCell(cell => {
      cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: fillColor } };
      cell.border = {
        top: { style: 'thin', color: { argb: 'DDDDDD' } },
        left: { style: 'thin', color: { argb: 'DDDDDD' } },
        bottom: { style: 'thin', color: { argb: 'DDDDDD' } },
        right: { style: 'thin', color: { argb: 'DDDDDD' } }
      };
    });
  });

  // Totals section handling same as before...
  if (totals && Object.keys(totals).length > 0) {
    let startRow = worksheet.rowCount + 3;
    worksheet.mergeCells(`A${startRow}:J${startRow}`);
    const titleCell = worksheet.getCell(`A${startRow}`);
    titleCell.value = 'Summary Totals';
    titleCell.font = { bold: true, size: 14, color: { argb: '000000' } };
    titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'D3D3D3' } };
    titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
    titleCell.border = { bottom: { style: 'medium', color: { argb: '000000' } } };

    let currentRow = startRow + 1;
    const totalEntries = Object.entries(totals);
    const itemsPerRow = 3;
    for (let i = 0; i < totalEntries.length; i += itemsPerRow) {
      const rowItems = totalEntries.slice(i, i + itemsPerRow);
      const totalsRow = worksheet.addRow([]);
      totalsRow.height = 25;
      rowItems.forEach(([label, value], idx) => {
        const startCol = idx * 3 + 1;
        const endCol = startCol + 1;
        worksheet.mergeCells(currentRow, startCol, currentRow, endCol);
        const cell = worksheet.getCell(currentRow, startCol);
        cell.value = `${label}: ${typeof value === 'number' ? value.toFixed(2) : value}`;
        cell.font = { bold: true, size: 11 };
        cell.alignment = { horizontal: 'left', vertical: 'center' };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'F5F5F5' } };
        cell.border = {
          top: { style: 'thin', color: { argb: '999999' } },
          left: { style: 'thin', color: { argb: '999999' } },
          bottom: { style: 'thin', color: { argb: '999999' } },
          right: { style: 'thin', color: { argb: '999999' } }
        };
      });
      currentRow++;
    }
  }

  return workbook.xlsx.writeBuffer();
};
