import { useState } from "react";
import {
  Search,
  ChevronRight,
  ChevronDown,
  FileSpreadsheet,
  Tag,
  Users,
  KeyRound,
  UserPlus,
  ClipboardList,
  ChevronLeft,
  Edit,
  Trash2,
  Printer,
  Paperclip,
} from "lucide-react";

interface FranchiseOrderManagementProps {
  branchName?: string;
  setCurrentPage?: (page: string) => void;
  onNavigateToRegistration?: () => void;
}

export function FranchiseOrderManagement({
  setCurrentPage,
  onNavigateToRegistration,
}: FranchiseOrderManagementProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [showAdvancedSearch, setShowAdvancedSearch] =
    useState(true);

  // Pagination state
  const [currentPageNum, setCurrentPageNum] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);

  // Advanced search filters
  const [registrationNumber, setRegistrationNumber] =
    useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [registrationStatus, setRegistrationStatus] =
    useState("all");
  const [status, setStatus] = useState("all");
  const [enquiryStatus, setEnquiryStatus] = useState("all");

  // Checkbox selections for multi-select filters
  const [selectedCourses, setSelectedCourses] = useState<
    string[]
  >([]);
  const [selectedSubjects, setSelectedSubjects] = useState<
    string[]
  >([]);
  const [selectedBatches, setSelectedBatches] = useState<
    string[]
  >([]);

  const students = [
    {
      id: 1,
      firstName: "John",
      lastName: "Doe",
      registrationNumber: "REG001",
      course: "B.Tech",
      subject: "Computer Science",
      batch: "Batch 2024",
      branch: "Head Quarters",
      contact: "+91 1234567890",
      fatherNumber: "+91 9876543210",
      motherNumber: "+91 9876543211",
      registrationDate: "2024-01-15",
      registrationStatus: "register",
      enquiryStatus: "converted",
      status: "active",
    },
    {
      id: 2,
      firstName: "Jane",
      lastName: "Smith",
      registrationNumber: "REG002",
      course: "MBA",
      subject: "Finance",
      batch: "Batch 2023",
      branch: "Branch 01",
      contact: "+91 2345678901",
      fatherNumber: "+91 9876543212",
      motherNumber: "+91 9876543213",
      registrationDate: "2024-02-20",
      registrationStatus: "register",
      enquiryStatus: "converted",
      status: "active",
    },
    {
      id: 3,
      firstName: "Alice",
      lastName: "Johnson",
      registrationNumber: "REG003",
      course: "BBA",
      subject: "Marketing",
      batch: "Batch 2024",
      branch: "Branch 02",
      contact: "+91 3456789012",
      fatherNumber: "+91 9876543214",
      motherNumber: "+91 9876543215",
      registrationDate: "2024-03-10",
      registrationStatus: "enquiry",
      enquiryStatus: "pending",
      status: "active",
    },
    {
      id: 4,
      firstName: "Bob",
      lastName: "Brown",
      registrationNumber: "REG004",
      course: "MCA",
      subject: "Data Science",
      batch: "Batch 2023",
      branch: "Branch 03",
      contact: "+91 4567890123",
      fatherNumber: "+91 9876543216",
      motherNumber: "+91 9876543217",
      registrationDate: "2023-12-05",
      registrationStatus: "register",
      enquiryStatus: "converted",
      status: "inactive",
    },
    {
      id: 5,
      firstName: "Charlie",
      lastName: "Wilson",
      registrationNumber: "REG005",
      course: "B.Tech",
      subject: "Mechanical Engineering",
      batch: "Batch 2024",
      branch: "Head Quarters",
      contact: "+91 5678901234",
      fatherNumber: "+91 9876543218",
      motherNumber: "+91 9876543219",
      registrationDate: "2024-01-25",
      registrationStatus: "enquiry",
      enquiryStatus: "follow-up",
      status: "active",
    },
  ];

  const filteredStudents = students.filter((student) => {
    const fullName =
      `${student.firstName} ${student.lastName}`.toLowerCase();
    const matchesBasicSearch =
      fullName.includes(searchTerm.toLowerCase()) ||
      student.course
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      student.branch
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

    const matchesRegistrationNumber =
      !registrationNumber ||
      student.registrationNumber
        .toLowerCase()
        .includes(registrationNumber.toLowerCase());

    const matchesPhoneNumber =
      !phoneNumber || student.contact.includes(phoneNumber);

    const matchesFromDate =
      !fromDate ||
      new Date(student.registrationDate) >= new Date(fromDate);

    const matchesToDate =
      !toDate ||
      new Date(student.registrationDate) <= new Date(toDate);

    const matchesRegistrationStatus =
      registrationStatus === "all" ||
      student.registrationStatus === registrationStatus;

    const matchesStatus =
      status === "all" || student.status === status;

    const matchesCourse =
      selectedCourses.length === 0 ||
      selectedCourses.includes(student.course);

    const matchesSubject =
      selectedSubjects.length === 0 ||
      selectedSubjects.includes(student.subject);

    const matchesBatch =
      selectedBatches.length === 0 ||
      selectedBatches.includes(student.batch);

    const matchesEnquiryStatus =
      enquiryStatus === "all" ||
      student.enquiryStatus === enquiryStatus;

    return (
      matchesBasicSearch &&
      matchesRegistrationNumber &&
      matchesPhoneNumber &&
      matchesFromDate &&
      matchesToDate &&
      matchesRegistrationStatus &&
      matchesStatus &&
      matchesCourse &&
      matchesSubject &&
      matchesBatch &&
      matchesEnquiryStatus
    );
  });

  // Pagination calculations
  const totalPages =
    Math.ceil(filteredStudents.length / entriesPerPage) || 1;
  const startIndex = (currentPageNum - 1) * entriesPerPage;
  const endIndex = startIndex + entriesPerPage;
  const paginatedStudents = filteredStudents.slice(
    startIndex,
    endIndex,
  );

  const handleClearFilters = () => {
    setSearchTerm("");
    setRegistrationNumber("");
    setPhoneNumber("");
    setFromDate("");
    setToDate("");
    setRegistrationStatus("all");
    setStatus("all");
    setEnquiryStatus("all");
    setSelectedCourses([]);
    setSelectedSubjects([]);
    setSelectedBatches([]);
    setCurrentPageNum(1);
  };

  return (
    <div className="space-y-6">
      {/* Advanced Search Panel */}
      <div className="bg-white border border-gray-200 rounded-2xl p-4 mb-6">
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search students by name, course, or branch..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F4C81] focus:border-transparent"
          />
        </div>

        {/* Advanced Search Toggle */}
        <button
          onClick={() => setShowAdvancedSearch(!showAdvancedSearch)}
          className="flex items-center gap-2 text-[#0F4C81] text-sm font-medium hover:underline"
        >
          {showAdvancedSearch ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          Advanced Search
        </button>

        {/* Advanced Search Panel */}
        {showAdvancedSearch && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Registration Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
            Item Name
                </label>
                <input
                  type="text"
                  placeholder="Enter Item Name"
                  value={registrationNumber}
                  onChange={(e) => setRegistrationNumber(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F4C81] focus:border-transparent text-sm"
                />
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Franchise Center
                </label>
                <input
                  type="text"
                  placeholder="Enter Franchise Center"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F4C81] focus:border-transparent text-sm"
                />
              </div>

              {/* Registration From Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                Order Number
                </label>
                <input
                  type="text"
                  placeholder="Enter Order Number"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F4C81] focus:border-transparent text-sm"
                />
              </div>

              {/* Registration To Date */}
              

              {/* Registration Status */}
              

              {/* Status */}
              

              {/* Course */}
              

              {/* Subject */}
              

              {/* Batch */}
              

              {/* Enquiry Status */}
              
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 mt-4">
              <button
                className="flex items-center gap-2 px-4 py-2 bg-[#0F4C81] text-white rounded-lg hover:bg-[#0d3f6b] transition-colors text-sm font-medium"
              >
                <Search className="w-4 h-4" />
                Search
              </button>
              <button
                onClick={handleClearFilters}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
              >
                Clear Filters
              </button>
              <div className="text-sm text-gray-600">
                Showing {filteredStudents.length} of {students.length} students
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons Bar */}
      <div className="bg-white border border-gray-200 rounded-2xl p-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <button
            onClick={() => onNavigateToRegistration?.()}
            className="flex items-center justify-center gap-1.5 px-3 py-2 border border-[#0F4C81] text-[#0F4C81] rounded-lg hover:bg-[#0F4C81] hover:text-white transition-colors text-xs font-medium"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Order Item </span>
          </button>

          <button
            onClick={() => setCurrentPage?.("studentEnquiry")}
            className="flex items-center justify-center gap-1.5 px-3 py-2 border border-[#0F4C81] text-[#0F4C81] rounded-lg hover:bg-[#0F4C81] hover:text-white transition-colors text-xs font-medium"
          >
            <ClipboardList className="w-3.5 h-3.5" />
            <span>Recevied Items</span>
          </button>

          

          

          

          
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
  <div className="overflow-x-auto">
    <table className="w-full min-w-max">
      <thead className="bg-[#0F4C81] border-b border-[#0F4C81]">
        <tr>
          <th className="px-6 py-4 text-center text-xs font-semibold text-white uppercase tracking-wider whitespace-nowrap">
            Actions
          </th>
          <th className="px-6 py-4 text-center text-xs font-semibold text-white uppercase tracking-wider whitespace-nowrap">
            Print
          </th>
          <th className="px-6 py-4 text-center text-xs font-semibold text-white uppercase tracking-wider whitespace-nowrap">
            Attach
          </th>
          <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider whitespace-nowrap">
            Registration No.
          </th>
          <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider whitespace-nowrap">
            Student Name
          </th>
          <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider whitespace-nowrap">
            Course
          </th>
          <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider whitespace-nowrap">
            Contact
          </th>
          <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider whitespace-nowrap">
            Father Number
          </th>
          <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider whitespace-nowrap">
            Mother Number
          </th>
          <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider whitespace-nowrap">
            Registration Date
          </th>
          <th className="px-6 py-4 text-center text-xs font-semibold text-white uppercase tracking-wider whitespace-nowrap">
            Reg. Status
          </th>
          <th className="px-6 py-4 text-center text-xs font-semibold text-white uppercase tracking-wider whitespace-nowrap">
            Status
          </th>
          <th className="px-6 py-4 text-center text-xs font-semibold text-white uppercase tracking-wider whitespace-nowrap">
            Make Payment
          </th>
          <th className="px-6 py-4 text-center text-xs font-semibold text-white uppercase tracking-wider whitespace-nowrap">
            Reset Password
          </th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-200">
        {paginatedStudents.length > 0 ? (
          paginatedStudents.map((student, index) => (
            <tr
              key={student.id}
              className={`${index % 2 === 1 ? "bg-[#e0eef5]/30" : "bg-white"} hover:bg-[#e0eef5]/60 transition-colors`}
            >
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center justify-center gap-3">
                  <button
                    className="p-2 text-[#0F4C81] hover:bg-[#e0eef5] rounded-lg transition-colors"
                    title="Edit Student"
                  >
                    <Edit className="w-5 h-5" />
                  </button>
                  <button
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete Student"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-center">
                <button
                  className="p-2 text-[#0F4C81] hover:bg-[#e0eef5] rounded-lg transition-colors inline-flex items-center justify-center"
                  title="Print Student Details"
                >
                  <Printer className="w-5 h-5" />
                </button>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-center">
                <button
                  className="p-2 text-[#0F4C81] hover:bg-[#e0eef5] rounded-lg transition-colors inline-flex items-center justify-center"
                  title="Attach Documents"
                >
                  <Paperclip className="w-5 h-5" />
                </button>
              </td>
              <td className="px-6 py-4 text-sm font-semibold text-gray-900 whitespace-nowrap">
                {student.registrationNumber}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="font-semibold text-gray-900">
                  {student.firstName} {student.lastName}
                </span>
              </td>
              <td className="px-6 py-4 text-sm font-semibold text-gray-700 whitespace-nowrap">
                {student.course}
              </td>
              <td className="px-6 py-4 text-sm font-semibold text-gray-700 whitespace-nowrap">
                {student.contact}
              </td>
              <td className="px-6 py-4 text-sm font-semibold text-gray-700 whitespace-nowrap">
                {student.fatherNumber}
              </td>
              <td className="px-6 py-4 text-sm font-semibold text-gray-700 whitespace-nowrap">
                {student.motherNumber}
              </td>
              <td className="px-6 py-4 text-sm font-semibold text-gray-700 whitespace-nowrap">
                {new Date(
                  student.registrationDate,
                ).toLocaleDateString("en-GB")}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-center">
                <span
                  className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                    student.registrationStatus === "register"
                      ? "bg-blue-100 text-blue-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {student.registrationStatus === "register"
                    ? "Registered"
                    : "Enquiry"}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-center">
                <span
                  className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                    student.status === "active"
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {student.status === "active" ? "Active" : "Inactive"}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-center"></td>
              <td className="px-6 py-4 whitespace-nowrap text-center"></td>
            </tr>
          ))
        ) : (
          <tr>
            <td
              colSpan={14}
              className="px-6 py-8 text-center text-gray-600 font-semibold"
            >
              No students found matching your search criteria.
            </td>
          </tr>
        )}
      </tbody>
    </table>
  </div>

  {/* Pagination Controls */}
  {filteredStudents.length > 0 && (
    <div className="px-6 py-4 border-t border-gray-200">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-gray-700">
              Show
            </span>
            <select
              value={entriesPerPage}
              onChange={(e) => {
                setEntriesPerPage(Number(e.target.value));
                setCurrentPageNum(1);
              }}
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#0F4C81]"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <span className="text-sm font-semibold text-gray-700">
              entries
            </span>
          </div>

          <div className="text-sm font-semibold text-gray-700">
            Showing {startIndex + 1} to{" "}
            {Math.min(endIndex, filteredStudents.length)}{" "}
            of {filteredStudents.length} entries
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() =>
              setCurrentPageNum((p) => Math.max(1, p - 1))
            }
            disabled={currentPageNum === 1}
            className={`flex items-center gap-1 px-3 py-2 border rounded-lg text-sm font-semibold transition-colors ${
              currentPageNum === 1
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-white text-gray-700 hover:bg-gray-50 border-gray-300"
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </button>

          <div className="flex items-center gap-1">
            {Array.from(
              { length: totalPages },
              (_, i) => i + 1,
            ).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPageNum(page)}
                className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                  currentPageNum === page
                    ? "bg-[#0F4C81] text-white"
                    : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-300"
                }`}
              >
                {page}
              </button>
            ))}
          </div>

          <button
            onClick={() =>
              setCurrentPageNum((p) =>
                Math.min(totalPages, p + 1),
              )
            }
            disabled={currentPageNum === totalPages}
            className={`flex items-center gap-1 px-3 py-2 border rounded-lg text-sm font-semibold transition-colors ${
              currentPageNum === totalPages
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-white text-gray-700 hover:bg-gray-50 border-gray-300"
            }`}
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )}
</div>
    </div>
  );
}