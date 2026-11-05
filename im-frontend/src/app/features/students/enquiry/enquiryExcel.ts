import * as XLSX from "xlsx";
import type { StudentList } from "./enquiryListTypes";

export const exportStudentsToExcel = (students: StudentList[]) => {
  const excelData = students.map((student) => ({
    Name: student.Name,
    "Contact No": student.PContact,
    fmobile: student.FMobile,
    mmobile: student.MMobile,
    EmailId: student.EmailId,
    Status: student.Status,
    Registered: student.Registered,
    RegNo_Manual: student.RegNo_Manual,
    regdate: student.EnquiryDate,
    EnqStatus: student.EnqStatus,
    username: student.Username,
  }));

  const worksheet = XLSX.utils.json_to_sheet(excelData);

  // Set column widths
  worksheet["!cols"] = [
    { wch: 25 }, // Name
    { wch: 16 }, // Contact No
    { wch: 16 }, // fmobile
    { wch: 16 }, // mmobile
    { wch: 30 }, // EmailId
    { wch: 12 }, // Status
    { wch: 14 }, // Registered
    { wch: 18 }, // RegNo_Manual
    { wch: 14 }, // regdate
    { wch: 14 }, // EnqStatus
    { wch: 22 }, // username
  ];

  const workbook = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(workbook, worksheet, "Table1");

  XLSX.writeFile(workbook, "Student_List.xlsx");
};
