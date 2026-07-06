import * as XLSX from 'xlsx-js-style';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export const exportToPDF = (
  students,
  selectedMonth,
  totalExpectedFees,
  collectedThisMonth,
  pendingFees,
  totalStudents,
  pendingStudents
) => {
  try {
    const monthNames = ["January","February","March","April","May","June","July","August","September","October","November","December"];
    const selectedMonthIndex = selectedMonth ? parseInt(selectedMonth.split('-')[1], 10) - 1 : new Date().getMonth();
    const year = selectedMonth ? selectedMonth.split('-')[0] : new Date().getFullYear();
    const currentMonthName = monthNames[selectedMonthIndex];

    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();

    // ── Title ──────────────────────────────────────────────────────
    doc.setFillColor(30, 58, 138); // dark blue
    doc.rect(0, 0, pageWidth, 22, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(`Partha's Sir Tuition`, pageWidth / 2, 10, { align: 'center' });
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text(`Monthly Report: ${currentMonthName} ${year}`, pageWidth / 2, 17, { align: 'center' });

    // ── Overview section ───────────────────────────────────────────
    let y = 28;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 58, 138);
    doc.text('Overview', 14, y);
    y += 2;

    autoTable(doc, {
      startY: y,
      margin: { left: 14, right: 14 },
      theme: 'grid',
      styles: { fontSize: 10, cellPadding: 2.5 },
      headStyles: { fillColor: [29, 78, 216], textColor: 255, fontStyle: 'bold' },
      body: [
        ['Total Students',      String(totalStudents)],
        ['Pending Students',    String(pendingStudents.length)],
        ['Fully Paid Students', String(totalStudents - pendingStudents.length)],
      ],
      columnStyles: {
        0: { fillColor: [59, 130, 246], textColor: 255, fontStyle: 'normal' },
        1: { fillColor: [59, 130, 246], textColor: 255, fontStyle: 'bold', halign: 'right' },
      },
    });

    y = doc.lastAutoTable.finalY + 6;
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 58, 138);
    doc.text('Financials', 14, y);
    y += 2;

    autoTable(doc, {
      startY: y,
      margin: { left: 14, right: 14 },
      theme: 'grid',
      styles: { fontSize: 10, cellPadding: 2.5 },
      body: [
        ['Total Received',  `Rs. ${collectedThisMonth}`],
        ['Pending Amount',  `Rs. ${pendingFees}`],
        ['Total Expected',  `Rs. ${totalExpectedFees}`],
      ],
      columnStyles: {
        0: { fillColor: [59, 130, 246], textColor: 255, fontStyle: 'normal' },
        1: { fillColor: [59, 130, 246], textColor: 255, fontStyle: 'bold', halign: 'right' },
      },
    });

    // ── Student table ──────────────────────────────────────────────
    y = doc.lastAutoTable.finalY + 8;
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 58, 138);
    doc.text('Student Details', 14, y);
    y += 2;

    // Sort: paid first
    const sortedStudents = [...students].sort((a, b) => {
      const aPaid = (a.payments || []).filter(p => p.monthKey === selectedMonth).reduce((s, p) => s + Number(p.amount), 0) >= Number(a.monthlyFee);
      const bPaid = (b.payments || []).filter(p => p.monthKey === selectedMonth).reduce((s, p) => s + Number(p.amount), 0) >= Number(b.monthlyFee);
      if (aPaid && !bPaid) return -1;
      if (!aPaid && bPaid) return 1;
      return 0;
    });

    const tableBody = sortedStudents.map(student => {
      const monthPayments = (student.payments || []).filter(p => p.monthKey === selectedMonth);
      const amountPaid = monthPayments.reduce((sum, p) => sum + Number(p.amount), 0);
      const isPaid = amountPaid >= Number(student.monthlyFee);
      const latestPayment = monthPayments.length > 0
        ? [...monthPayments].sort((a, b) => new Date(b.date) - new Date(a.date))[0]
        : null;
      const paymentDate = latestPayment && latestPayment.date
        ? new Date(latestPayment.date).toLocaleDateString() : '-';
      const paymentMode = latestPayment
        ? (latestPayment.paymentMethod || latestPayment.payment_method || 'online') : '-';

      return {
        row: [
          student.name,
          student.phone || '-',
          student.subjects || '1',
          paymentDate,
          paymentMode,
          `Rs. ${amountPaid}`,
          `Rs. ${student.monthlyFee}`,
          isPaid ? 'PAID' : 'PENDING',
        ],
        isPaid,
      };
    });

    autoTable(doc, {
      startY: y,
      margin: { left: 14, right: 14 },
      theme: 'grid',
      styles: { fontSize: 8.5, cellPadding: 2 },
      headStyles: { fillColor: [29, 78, 216], textColor: 255, fontStyle: 'bold', halign: 'center' },
      head: [['Name', 'Phone', 'Subjects', 'Date', 'Mode', 'Paid', 'Monthly Fee', 'Status']],
      body: tableBody.map(item => item.row),
      didParseCell: (data) => {
        if (data.section === 'body') {
          const item = tableBody[data.row.index];
          if (item) {
            if (item.isPaid) {
              data.cell.styles.fillColor = [22, 163, 74];   // green
              data.cell.styles.textColor = 255;
            } else {
              data.cell.styles.fillColor = [220, 38, 38];   // red
              data.cell.styles.textColor = 255;
            }
          }
        }
      },
      columnStyles: {
        0: { halign: 'left' },
        1: { halign: 'center' },
        2: { halign: 'center' },
        3: { halign: 'center' },
        4: { halign: 'center' },
        5: { halign: 'right' },
        6: { halign: 'right' },
        7: { halign: 'center', fontStyle: 'bold' },
      },
    });

    // ── Footer ─────────────────────────────────────────────────────
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text(
        `Page ${i} of ${pageCount}  |  Generated on ${new Date().toLocaleDateString()}`,
        pageWidth / 2,
        doc.internal.pageSize.getHeight() - 5,
        { align: 'center' }
      );
    }

    doc.save(`Monthly_Report_${selectedMonth}.pdf`);
  } catch (err) {
    console.error('PDF Generation Error:', err);
    alert('Failed to generate PDF: ' + err.message);
  }
};



export const exportToExcel = (
  students,
  selectedMonth,
  totalExpectedFees,
  collectedThisMonth,
  pendingFees,
  totalStudents,
  pendingStudents
) => {
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const selectedMonthIndex = selectedMonth ? parseInt(selectedMonth.split('-')[1], 10) - 1 : new Date().getMonth();
  const year = selectedMonth ? selectedMonth.split('-')[0] : new Date().getFullYear();
  const currentMonthName = monthNames[selectedMonthIndex];

  // ── Border definition ──────────────────────────────────────────
  const border = {
    top:    { style: 'thin', color: { rgb: '000000' } },
    bottom: { style: 'thin', color: { rgb: '000000' } },
    left:   { style: 'thin', color: { rgb: '000000' } },
    right:  { style: 'thin', color: { rgb: '000000' } },
  };

  // ── Styles ────────────────────────────────────────────────────
  const titleStyle = {
    font:      { bold: true, sz: 14, color: { rgb: '000000' } },
    alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
  };

  // Dark blue header for "Overview" / "Financials"
  const sectionHeaderStyle = {
    font:      { bold: true, sz: 12, color: { rgb: 'FFFFFF' } },
    fill:      { fgColor: { rgb: '1D4ED8' } },
    border,
    alignment: { horizontal: 'left', vertical: 'center' },
  };

  // Lighter blue for data rows inside overview/financials
  const blueRowLabelStyle = {
    font:      { sz: 11, color: { rgb: 'FFFFFF' } },
    fill:      { fgColor: { rgb: '3B82F6' } },
    border,
    alignment: { horizontal: 'left', vertical: 'center' },
  };

  const blueRowValueStyle = {
    font:      { bold: true, sz: 11, color: { rgb: 'FFFFFF' } },
    fill:      { fgColor: { rgb: '3B82F6' } },
    border,
    alignment: { horizontal: 'right', vertical: 'center' },
  };

  // Table column header — light blue
  const tableHeaderStyle = {
    font:      { bold: true, sz: 11, color: { rgb: 'FFFFFF' } },
    fill:      { fgColor: { rgb: '3B82F6' } },
    border,
    alignment: { horizontal: 'center', vertical: 'center' },
  };

  // Red — PENDING students
  const redCenterStyle = {
    font:      { sz: 11, color: { rgb: 'FFFFFF' } },
    fill:      { fgColor: { rgb: 'DC2626' } },
    border,
    alignment: { horizontal: 'center', vertical: 'center' },
  };
  const redLeftStyle = {
    ...redCenterStyle,
    alignment: { horizontal: 'left', vertical: 'center' },
  };

  // Green — PAID students
  const greenCenterStyle = {
    font:      { sz: 11, color: { rgb: 'FFFFFF' } },
    fill:      { fgColor: { rgb: '16A34A' } },
    border,
    alignment: { horizontal: 'center', vertical: 'center' },
  };
  const greenLeftStyle = {
    ...greenCenterStyle,
    alignment: { horizontal: 'left', vertical: 'center' },
  };

  const emptyStyle = { font: { sz: 11 } };

  // Helper: create a styled cell
  const sc = (v, s) => ({ v: v === undefined ? '' : v, s, t: typeof v === 'number' ? 'n' : 's' });
  const NUM_COLS = 8;
  const empty = () => Array(NUM_COLS).fill(null).map(() => sc('', emptyStyle));

  // ── Build rows ─────────────────────────────────────────────────
  const rows = [];

  // Title row
  const titleRow = empty();
  titleRow[0] = sc(`Partha's Sir Tuition - Monthly Report: ${currentMonthName} ${year}`, titleStyle);
  rows.push(titleRow);

  // Empty
  rows.push(empty());

  // "Overview" section header spanning cols A-B
  const overviewHdr = empty();
  overviewHdr[0] = sc('Overview', sectionHeaderStyle);
  overviewHdr[1] = sc('', sectionHeaderStyle);
  overviewHdr[2] = sc('', sectionHeaderStyle);
  rows.push(overviewHdr);

  // Overview data rows
  const overviewData = [
    ['Total Students',      totalStudents],
    ['Pending Students',    pendingStudents.length],
    ['Fully Paid Students', totalStudents - pendingStudents.length],
  ];
  overviewData.forEach(([label, val]) => {
    const row = empty();
    row[0] = sc(label, blueRowLabelStyle);
    row[1] = sc(val,   blueRowValueStyle);
    row[2] = sc('', blueRowLabelStyle);
    rows.push(row);
  });

  // Empty
  rows.push(empty());

  // "Financials" section header
  const financialsHdr = empty();
  financialsHdr[0] = sc('Financials', sectionHeaderStyle);
  financialsHdr[1] = sc('', sectionHeaderStyle);
  financialsHdr[2] = sc('', sectionHeaderStyle);
  rows.push(financialsHdr);

  // Financials data rows
  const financialsData = [
    ['Total Received',  `₹${collectedThisMonth}`],
    ['Pending Amount',  `₹${pendingFees}`],
    ['Total Expected',  `₹${totalExpectedFees}`],
  ];
  financialsData.forEach(([label, val]) => {
    const row = empty();
    row[0] = sc(label, blueRowLabelStyle);
    row[1] = sc(val,   blueRowValueStyle);
    row[2] = sc('', blueRowLabelStyle);
    rows.push(row);
  });

  // Two empty rows before table
  rows.push(empty());
  rows.push(empty());

  // Table headers
  const headers = ['Name', 'Phone', 'Subjects', 'Date of Payment', 'Mode of Payment', 'Paid (₹)', 'Total Monthly Fee (₹)', 'Status'];
  rows.push(headers.map(h => sc(h, tableHeaderStyle)));

  // Student rows — paid first, then pending
  const sortedStudents = [...students].sort((a, b) => {
    const aPaid = (a.payments || []).filter(p => p.monthKey === selectedMonth).reduce((s, p) => s + Number(p.amount), 0) >= Number(a.monthlyFee);
    const bPaid = (b.payments || []).filter(p => p.monthKey === selectedMonth).reduce((s, p) => s + Number(p.amount), 0) >= Number(b.monthlyFee);
    if (aPaid && !bPaid) return -1;
    if (!aPaid && bPaid) return 1;
    return 0;
  });
  sortedStudents.forEach(student => {
    const monthPayments = (student.payments || []).filter(p => p.monthKey === selectedMonth);
    const amountPaid = monthPayments.reduce((sum, p) => sum + Number(p.amount), 0);
    const isPaid = amountPaid >= Number(student.monthlyFee);

    const latestPayment = monthPayments.length > 0
      ? [...monthPayments].sort((a, b) => new Date(b.date) - new Date(a.date))[0]
      : null;
    const paymentDate = latestPayment && latestPayment.date
      ? new Date(latestPayment.date).toLocaleDateString()
      : '-';
    const paymentMode = latestPayment
      ? (latestPayment.paymentMethod || latestPayment.payment_method || 'online')
      : '-';

    const cStyle = isPaid ? greenCenterStyle : redCenterStyle;
    const lStyle = isPaid ? greenLeftStyle   : redLeftStyle;

    rows.push([
      sc(student.name,            lStyle),
      sc(student.phone || '-',    cStyle),
      sc(student.subjects || '1', cStyle),
      sc(paymentDate,             cStyle),
      sc(paymentMode,             cStyle),
      sc(amountPaid,              cStyle),
      sc(student.monthlyFee,      cStyle),
      sc(isPaid ? 'PAID' : 'PENDING', cStyle),
    ]);
  });

  // ── Workbook ────────────────────────────────────────────────────
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(rows);

  ws['!cols'] = [
    { wch: 22 }, // Name
    { wch: 16 }, // Phone
    { wch: 10 }, // Subjects
    { wch: 16 }, // Date of Payment
    { wch: 16 }, // Mode of Payment
    { wch: 10 }, // Paid (₹)
    { wch: 22 }, // Total Monthly Fee (₹)
    { wch: 10 }, // Status
  ];

  ws['!rows'] = rows.map(() => ({ hpt: 20 }));
  ws['!rows'][0] = { hpt: 28 };

  // Merge A1:H1 for the title heading
  ws['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 7 } }, // Title row: A1 → H1
  ];

  XLSX.utils.book_append_sheet(wb, ws, `Report_${selectedMonth}`);
  XLSX.writeFile(wb, `Monthly_Report_${selectedMonth}.xlsx`);
};
