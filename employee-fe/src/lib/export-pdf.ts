import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Attendance } from "@/app/admin/rekap-presensi/page";

type Holiday = {
  date: Date;
  note: string;
};

export const exportAttendanceToPDF = (
  data: Attendance[],
  options: {
    schoolName: string;
    teacherName: string;
    NIP: string;
    principalName: string;
    principalNIP: string;
    schoolYear: string;
    levelOfEducation: string;
    address: string;
    month: number;
    year: number;
    holidays: Holiday[];
  }
) => {
  const { schoolName, teacherName, NIP, principalName, principalNIP, schoolYear, levelOfEducation, address, month, year } = options;
  const doc = new jsPDF("landscape");
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0);
  const dateColumns: string[] = [];
  const dateStrings: string[] = [];

  const holidaySet = new Set(
    options.holidays.map(h => formatDateLocal(new Date(h.date)))
  );

  const isSunday = (date: Date) => {
    return date.getDay() === 0;
  }

  const isHoliday = (dateStr: string) => {
    return holidaySet.has(dateStr);
  }

  function formatDateLocal(date: any) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  const redColumnIndexes: number[] = [];
  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    const currentDate = new Date(d);
    const dateStr = formatDateLocal(currentDate);
    dateStrings.push(dateStr);
    dateColumns.push(`${currentDate.getDate()}`);

    const isRed = isSunday(currentDate) || isHoliday(dateStr);
    if (isRed) {
      redColumnIndexes.push(dateColumns.length - 1 + 3);
    }
  }

  // Header
  doc.setFontSize(14);
  doc.text(`Rekap Presensi ${levelOfEducation}`, doc.internal.pageSize.getWidth() / 2, 15, { align: "center" });

  doc.setFontSize(12);
  doc.text(`Tahun Ajaran ${schoolYear}`, doc.internal.pageSize.getWidth() / 2, 22, { align: "center" });
  doc.text(`${schoolName}`, doc.internal.pageSize.getWidth() / 2, 29, { align: "center" });

  // Tampilkan nama bulan berdasarkan parameter
  const monthName = new Date(year, month - 1).toLocaleString("id-ID", { month: "long" });
  doc.text(`Bulan ${monthName}`, doc.internal.pageSize.getWidth() / 2, 36, { align: "center" });

  // Header Table
  const tableColumn = [
    "No.",
    "NISN",
    "Nama Siswa",
    ...dateColumns,
    "S",
    "I",
    "A"
  ];

  // Data Rows
  const tableRows = data.map((student, index) => {
    const sakit = student.SAKIT || 0;
    const ijin = student.IJIN || 0;
    const tanpaKeterangan = student.TANPA_KETERANGAN || 0;

    const attendancePerDay = dateStrings.map(dateStr => {
      const record = student.attendance_detail?.find(r => r.date === dateStr);
      if (!record) return "";
      switch (record.status) {
        case "H": return "v";
        case "S": return "S";
        case "I": return "I";
        case "A": return "A";
        default: return "";
      }
    });

    return [
      index + 1,
      student.nisn || "",
      student.name,
      ...attendancePerDay,
      sakit,
      ijin,
      tanpaKeterangan
    ];
  });

  autoTable(doc, {
    head: [tableColumn],
    body: tableRows,
    startY: 46,
    styles: {
      fontSize: 6,
      cellWidth: 'wrap',
      fillColor: [255, 255, 255],
    },
    headStyles: {
      fillColor: [0, 0, 0],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
    },
    columnStyles: {
      0: { cellWidth: 10 },
      1: { cellWidth: 20 },
      2: { cellWidth: 40 },
    },
    willDrawCell: function (data) {
      if (data.section === 'head') {
        if (redColumnIndexes.includes(data.column.index)) {
          doc.setTextColor(255, 0, 0);
        } else {
          doc.setTextColor(255, 255, 255);
        }
      } else {
        doc.setTextColor(0, 0, 0);
      }
    },
    didDrawCell: function (data) {
      if (redColumnIndexes.includes(data.column.index)) {
        const { cell } = data;
        doc.setFillColor(255, 200, 200);
        doc.rect(cell.x, cell.y, cell.width, cell.height, 'F');
      }
    }
  });

  const finalY = ((doc as any).lastAutoTable?.finalY || 58) + 20;
  const pageWidth = doc.internal.pageSize.getWidth();

  const today = new Date();
  const formattedAddress = address;
  const formattedDate = `${today.getDate()} ${today.toLocaleString("id-ID", {
    month: "long"
  })} ${today.getFullYear()}`;

  doc.setFontSize(8);

  // Kiri - Kepala Sekolah
  const leftX = 20;
  doc.text("Mengetahui,", leftX, finalY + 10);
  doc.text(`Kepala ${schoolName}`, leftX, finalY + 16);
  doc.setFont("helvetica", "bold");
  doc.text(principalName, leftX, finalY + 39);
  doc.setFont("helvetica", "bold");
  doc.line(leftX, finalY + 42, leftX + 50, finalY + 42);
  doc.text(`NIP.${principalNIP}`, leftX, finalY + 48);

  // Kanan - Wali Kelas
  const rightX = pageWidth - 90;
  doc.setFont("helvetica", "normal");
  doc.text(`${formattedAddress},`, rightX, finalY + 10);
  doc.text(formattedDate, rightX, finalY + 16);
  doc.setFont("helvetica", "bold");
  doc.text(teacherName, rightX, finalY + 39);
  doc.setFont("helvetica", "bold");
  doc.line(rightX, finalY + 42, rightX + 50, finalY + 42);
  doc.text(`NIP.${NIP}`, rightX, finalY + 48);

  const now = new Date();
  const pad = (n: number) => n.toString().padStart(2, "0");
  const localTimestamp = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}_${pad(now.getHours())}-${pad(now.getMinutes())}-${pad(now.getSeconds())}`;

  const fileName = `rekap-presensi_${localTimestamp}.pdf`;
  doc.save(fileName);
};
