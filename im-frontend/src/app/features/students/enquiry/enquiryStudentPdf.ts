import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export const generateStudentPdf = (student: any) => {
  const pdf = new jsPDF("p", "mm", "a4");

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 15;
  const contentWidth = pageWidth - margin * 2;

  // -----------------------------
  // Helpers
  // -----------------------------

  const getStudentName = () =>
    [
      student.salutation,
      student.firstName,
      student.middleName,
      student.lastName,
    ]
      .filter(Boolean)
      .join(" ") || "-";

  const getFatherName = () =>
    [student.fatherFirstName, student.fatherMiddleName, student.fatherLastName]
      .filter(Boolean)
      .join(" ") || "-";

  const getMotherName = () =>
    [student.motherFirstName, student.motherMiddleName, student.motherLastName]
      .filter(Boolean)
      .join(" ") || "-";

  const value = (val: any) =>
    val !== null && val !== undefined && String(val).trim() !== ""
      ? String(val)
      : "-";

  // -----------------------------
  // Header
  // -----------------------------

  pdf.setFillColor(15, 76, 129);
  pdf.rect(0, 0, pageWidth, 35, "F");

  pdf.setTextColor(255, 255, 255);

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(19);

  pdf.text("INSTITUTE MAGICA", pageWidth / 2, 14, {
    align: "center",
  });

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(11);

  pdf.text("STUDENT ENQUIRY DETAILS", pageWidth / 2, 23, {
    align: "center",
  });

  pdf.setFontSize(8);

  pdf.text("Student Enquiry Report", pageWidth / 2, 29, {
    align: "center",
  });

  pdf.setTextColor(0, 0, 0);

  let y = 45;

  // -----------------------------
  // Student Summary Card
  // -----------------------------

  pdf.setFillColor(245, 248, 251);
  pdf.roundedRect(margin, y, contentWidth, 31, 2, 2, "F");

  pdf.setDrawColor(210, 220, 230);
  pdf.setLineWidth(0.3);

  pdf.roundedRect(margin, y, contentWidth, 31, 2, 2, "S");

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(13);

  pdf.text(getStudentName(), margin + 6, y + 9);

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(9);

  pdf.setTextColor(80, 80, 80);

  pdf.text(`Registration No: ${value(student.regNo)}`, margin + 6, y + 17);

  pdf.text(`Enquiry Date: ${value(student.enquiryDate)}`, margin + 6, y + 24);

  pdf.text(`Mobile: ${value(student.mobile)}`, pageWidth / 2 + 5, y + 17);

  pdf.text(`Email: ${value(student.email)}`, pageWidth / 2 + 5, y + 24);

  pdf.setTextColor(0, 0, 0);

  y += 40;

  // -----------------------------
  // Section Heading
  // -----------------------------

  const drawSectionTitle = (title: string) => {
    pdf.setFillColor(15, 76, 129);
    pdf.roundedRect(margin, y, contentWidth, 8, 1.5, 1.5, "F");

    pdf.setTextColor(255, 255, 255);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(10);

    pdf.text(title, margin + 5, y + 5.5);

    pdf.setTextColor(0, 0, 0);

    y += 10;
  };

  // -----------------------------
  // Personal Information
  // -----------------------------

  drawSectionTitle("PERSONAL INFORMATION");

  autoTable(pdf, {
    startY: y,
    theme: "grid",

    head: [["Field", "Details"]],

    body: [
      ["Registration No", value(student.regNo)],
      ["Enquiry Date", value(student.enquiryDate)],
      ["Walk In", value(student.walkIn)],
      ["Mobile", value(student.mobile)],
      ["Email", value(student.email)],
      ["Age", value(student.age)],
      ["Category", value(student.category)],
      ["Comments", value(student.comments)],
    ],

    styles: {
      font: "helvetica",
      fontSize: 9,
      cellPadding: 3,
      lineColor: [215, 220, 225],
      lineWidth: 0.3,
      textColor: [50, 50, 50],
    },

    headStyles: {
      fillColor: [230, 238, 245],
      textColor: [15, 76, 129],
      fontStyle: "bold",
      fontSize: 9,
    },

    columnStyles: {
      0: {
        cellWidth: 55,
        fontStyle: "bold",
      },
      1: {
        cellWidth: contentWidth - 55,
      },
    },

    alternateRowStyles: {
      fillColor: [250, 251, 252],
    },

    margin: {
      left: margin,
      right: margin,
    },
  });

  y = (pdf as any).lastAutoTable.finalY + 10;

  // -----------------------------
  // Family & Work
  // -----------------------------

  drawSectionTitle("FAMILY & WORK");

  autoTable(pdf, {
    startY: y,
    theme: "grid",

    head: [["Field", "Details"]],

    body: [
      ["Father Name", getFatherName()],
      ["Father Mobile", value(student.mobile1)],
      ["Parent Company", value(student.parentCompanyName)],
      ["Parent GST No", value(student.parentGSTNo)],
      ["Mother Name", getMotherName()],
      ["Work Status", value(student.workStatus)],
      ["Occupation", value(student.occupation)],
      ["Organization", value(student.organization)],
      ["Salary", value(student.salary)],
    ],

    styles: {
      font: "helvetica",
      fontSize: 9,
      cellPadding: 3,
      lineColor: [215, 220, 225],
      lineWidth: 0.3,
      textColor: [50, 50, 50],
    },

    headStyles: {
      fillColor: [230, 238, 245],
      textColor: [15, 76, 129],
      fontStyle: "bold",
      fontSize: 9,
    },

    columnStyles: {
      0: {
        cellWidth: 55,
        fontStyle: "bold",
      },
      1: {
        cellWidth: contentWidth - 55,
      },
    },

    alternateRowStyles: {
      fillColor: [250, 251, 252],
    },

    margin: {
      left: margin,
      right: margin,
    },
  });

  y = (pdf as any).lastAutoTable.finalY + 10;

  // -----------------------------
  // Education
  // -----------------------------

  drawSectionTitle("EDUCATION");

  const educationRows =
    student.education?.length > 0
      ? student.education.map((item: any) => [
          value(item.degree),
          value(item.college),
          value(item.stream),
          value(item.percentage),
          value(item.year),
        ])
      : [["-", "-", "-", "-", "-"]];

  autoTable(pdf, {
    startY: y,
    theme: "grid",

    head: [["Degree", "College", "Stream", "Percentage", "Year"]],

    body: educationRows,

    styles: {
      font: "helvetica",
      fontSize: 8.5,
      cellPadding: 3,
      lineColor: [215, 220, 225],
      lineWidth: 0.3,
      textColor: [50, 50, 50],
      valign: "middle",
    },

    headStyles: {
      fillColor: [230, 238, 245],
      textColor: [15, 76, 129],
      fontStyle: "bold",
      fontSize: 8.5,
      halign: "center",
    },

    columnStyles: {
      0: { cellWidth: 30 },
      1: { cellWidth: 45 },
      2: { cellWidth: 42 },
      3: { cellWidth: 27, halign: "center" },
      4: { cellWidth: 26, halign: "center" },
    },

    alternateRowStyles: {
      fillColor: [250, 251, 252],
    },

    margin: {
      left: margin,
      right: margin,
    },
  });

  y = (pdf as any).lastAutoTable.finalY + 10;

  // -----------------------------
  // Remarks
  // -----------------------------

  drawSectionTitle("REMARKS");

  const remarks = value(student.remarks);

  pdf.setFillColor(250, 251, 252);
  pdf.setDrawColor(215, 220, 225);

  const wrappedRemarks = pdf.splitTextToSize(remarks, contentWidth - 10);

  const remarksHeight = Math.max(18, wrappedRemarks.length * 5 + 8);

  pdf.roundedRect(margin, y, contentWidth, remarksHeight, 1.5, 1.5, "FD");

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(9);
  pdf.setTextColor(50, 50, 50);

  pdf.text(wrappedRemarks, margin + 5, y + 7);

  // -----------------------------
  // Footer
  // -----------------------------

  pdf.setTextColor(120, 120, 120);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(8);

  pdf.setDrawColor(210, 210, 210);
  pdf.setLineWidth(0.3);

  pdf.line(margin, pageHeight - 17, pageWidth - margin, pageHeight - 17);

  pdf.text(
    `Generated on: ${new Date().toLocaleString()}`,
    margin,
    pageHeight - 10,
  );

  pdf.text("Institute Magica", pageWidth - margin, pageHeight - 10, {
    align: "right",
  });

  // -----------------------------
  // Page Numbers
  // -----------------------------

  const totalPages = pdf.getNumberOfPages();

  for (let page = 1; page <= totalPages; page++) {
    pdf.setPage(page);

    pdf.setFontSize(8);
    pdf.setTextColor(120, 120, 120);

    pdf.text(`Page ${page} of ${totalPages}`, pageWidth / 2, pageHeight - 10, {
      align: "center",
    });
  }

  // -----------------------------
  // Download
  // -----------------------------

  const studentName =
    [student.firstName, student.middleName, student.lastName]
      .filter(Boolean)
      .join("_") || "Student";

  pdf.save(`${studentName}_${student.regNo || student.studentId}.pdf`);
};
