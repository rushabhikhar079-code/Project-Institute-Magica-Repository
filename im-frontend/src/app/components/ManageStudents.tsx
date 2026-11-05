import { useState } from "react";
import {
  Search,
  ChevronRight,
  ChevronDown,
  UserCircle,
  Building2,
  CheckCircle,
  AlertCircle,
  FileSpreadsheet,
  Tag,
  Users,
  KeyRound,
  UserPlus,
  ClipboardList,
  X,
  Save,
  ChevronLeft,
  Edit,
  Trash2,
  Printer,
  Paperclip,
} from "lucide-react";

interface ManageStudentsProps {
  branchName: string;
  setCurrentPage: (page: string) => void;
  onNavigateToRegistration?: () => void;
}

export function ManageStudents({
  branchName,
  setCurrentPage,
  onNavigateToRegistration,
}: ManageStudentsProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);

  // Pagination state
  const [currentPageNum, setCurrentPageNum] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);

  // Edit student state
  const [editingStudent, setEditingStudent] = useState<
    (typeof students)[0] | null
  >(null);
  const [showEditModal, setShowEditModal] = useState(false);

  // Advanced search filters
  const [registrationNumber, setRegistrationNumber] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [registrationStatus, setRegistrationStatus] = useState("all");
  const [status, setStatus] = useState("all");
  const [courseFilter, setCourseFilter] = useState("all");
  const [subjectFilter, setSubjectFilter] = useState("all");
  const [batchFilter, setBatchFilter] = useState("all");
  const [enquiryStatus, setEnquiryStatus] = useState("all");
  const [showSubjectForm, setShowSubjectForm] = useState(false);

  // Checkbox selections for multi-select filters
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [selectedBatches, setSelectedBatches] = useState<string[]>([]);

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
    {
      id: 6,
      firstName: "David",
      lastName: "Miller",
      registrationNumber: "REG006",
      course: "B.Tech",
      subject: "Electrical Engineering",
      batch: "Batch 2024",
      branch: "Branch 01",
      contact: "+91 6789012345",
      fatherNumber: "+91 9876543220",
      motherNumber: "+91 9876543221",
      registrationDate: "2024-02-12",
      registrationStatus: "register",
      enquiryStatus: "converted",
      status: "active",
    },
    {
      id: 7,
      firstName: "Emma",
      lastName: "Davis",
      registrationNumber: "REG007",
      course: "MBA",
      subject: "Marketing",
      batch: "Batch 2023",
      branch: "Branch 02",
      contact: "+91 7890123456",
      fatherNumber: "+91 9876543222",
      motherNumber: "+91 9876543223",
      registrationDate: "2024-01-08",
      registrationStatus: "register",
      enquiryStatus: "converted",
      status: "active",
    },
    {
      id: 8,
      firstName: "Frank",
      lastName: "Garcia",
      registrationNumber: "REG008",
      course: "BBA",
      subject: "Finance",
      batch: "Batch 2024",
      branch: "Head Quarters",
      contact: "+91 8901234567",
      fatherNumber: "+91 9876543224",
      motherNumber: "+91 9876543225",
      registrationDate: "2024-03-15",
      registrationStatus: "enquiry",
      enquiryStatus: "pending",
      status: "active",
    },
    {
      id: 9,
      firstName: "Grace",
      lastName: "Martinez",
      registrationNumber: "REG009",
      course: "MCA",
      subject: "Computer Science",
      batch: "Batch 2023",
      branch: "Branch 03",
      contact: "+91 9012345678",
      fatherNumber: "+91 9876543226",
      motherNumber: "+91 9876543227",
      registrationDate: "2023-11-22",
      registrationStatus: "register",
      enquiryStatus: "converted",
      status: "active",
    },
    {
      id: 10,
      firstName: "Henry",
      lastName: "Rodriguez",
      registrationNumber: "REG010",
      course: "B.Tech",
      subject: "Civil Engineering",
      batch: "Batch 2024",
      branch: "Branch 01",
      contact: "+91 1234567891",
      fatherNumber: "+91 9876543228",
      motherNumber: "+91 9876543229",
      registrationDate: "2024-02-28",
      registrationStatus: "register",
      enquiryStatus: "converted",
      status: "inactive",
    },
    {
      id: 11,
      firstName: "Ivy",
      lastName: "Hernandez",
      registrationNumber: "REG011",
      course: "MBA",
      subject: "Finance",
      batch: "Batch 2024",
      branch: "Head Quarters",
      contact: "+91 2345678902",
      fatherNumber: "+91 9876543230",
      motherNumber: "+91 9876543231",
      registrationDate: "2024-01-18",
      registrationStatus: "enquiry",
      enquiryStatus: "follow-up",
      status: "active",
    },
    {
      id: 12,
      firstName: "Jack",
      lastName: "Lopez",
      registrationNumber: "REG012",
      course: "BBA",
      subject: "Marketing",
      batch: "Batch 2023",
      branch: "Branch 02",
      contact: "+91 3456789013",
      fatherNumber: "+91 9876543232",
      motherNumber: "+91 9876543233",
      registrationDate: "2024-03-05",
      registrationStatus: "register",
      enquiryStatus: "converted",
      status: "active",
    },
    {
      id: 13,
      firstName: "Kelly",
      lastName: "Gonzalez",
      registrationNumber: "REG013",
      course: "MCA",
      subject: "Data Science",
      batch: "Batch 2024",
      branch: "Branch 03",
      contact: "+91 4567890124",
      fatherNumber: "+91 9876543234",
      motherNumber: "+91 9876543235",
      registrationDate: "2024-02-14",
      registrationStatus: "register",
      enquiryStatus: "converted",
      status: "active",
    },
    {
      id: 14,
      firstName: "Liam",
      lastName: "Wilson",
      registrationNumber: "REG014",
      course: "B.Tech",
      subject: "Computer Science",
      batch: "Batch 2023",
      branch: "Branch 01",
      contact: "+91 5678901235",
      fatherNumber: "+91 9876543236",
      motherNumber: "+91 9876543237",
      registrationDate: "2023-12-18",
      registrationStatus: "register",
      enquiryStatus: "converted",
      status: "active",
    },
    {
      id: 15,
      firstName: "Mia",
      lastName: "Anderson",
      registrationNumber: "REG015",
      course: "MBA",
      subject: "Marketing",
      batch: "Batch 2024",
      branch: "Head Quarters",
      contact: "+91 6789012346",
      fatherNumber: "+91 9876543238",
      motherNumber: "+91 9876543239",
      registrationDate: "2024-01-30",
      registrationStatus: "enquiry",
      enquiryStatus: "pending",
      status: "active",
    },
    {
      id: 16,
      firstName: "Noah",
      lastName: "Thomas",
      registrationNumber: "REG016",
      course: "BBA",
      subject: "Finance",
      batch: "Batch 2024",
      branch: "Branch 02",
      contact: "+91 7890123457",
      fatherNumber: "+91 9876543240",
      motherNumber: "+91 9876543241",
      registrationDate: "2024-03-20",
      registrationStatus: "register",
      enquiryStatus: "converted",
      status: "active",
    },
    {
      id: 17,
      firstName: "Olivia",
      lastName: "Taylor",
      registrationNumber: "REG017",
      course: "MCA",
      subject: "Computer Science",
      batch: "Batch 2023",
      branch: "Branch 03",
      contact: "+91 8901234568",
      fatherNumber: "+91 9876543242",
      motherNumber: "+91 9876543243",
      registrationDate: "2023-11-28",
      registrationStatus: "register",
      enquiryStatus: "converted",
      status: "inactive",
    },
    {
      id: 18,
      firstName: "Paul",
      lastName: "Moore",
      registrationNumber: "REG018",
      course: "B.Tech",
      subject: "Mechanical Engineering",
      batch: "Batch 2024",
      branch: "Branch 01",
      contact: "+91 9012345679",
      fatherNumber: "+91 9876543244",
      motherNumber: "+91 9876543245",
      registrationDate: "2024-02-08",
      registrationStatus: "enquiry",
      enquiryStatus: "follow-up",
      status: "active",
    },
    {
      id: 19,
      firstName: "Quinn",
      lastName: "Jackson",
      registrationNumber: "REG019",
      course: "MBA",
      subject: "Finance",
      batch: "Batch 2024",
      branch: "Head Quarters",
      contact: "+91 1234567892",
      fatherNumber: "+91 9876543246",
      motherNumber: "+91 9876543247",
      registrationDate: "2024-01-22",
      registrationStatus: "register",
      enquiryStatus: "converted",
      status: "active",
    },
    {
      id: 20,
      firstName: "Rachel",
      lastName: "Martin",
      registrationNumber: "REG020",
      course: "BBA",
      subject: "Marketing",
      batch: "Batch 2023",
      branch: "Branch 02",
      contact: "+91 2345678903",
      fatherNumber: "+91 9876543248",
      motherNumber: "+91 9876543249",
      registrationDate: "2024-03-12",
      registrationStatus: "register",
      enquiryStatus: "converted",
      status: "active",
    },
    {
      id: 21,
      firstName: "Sam",
      lastName: "Lee",
      registrationNumber: "REG021",
      course: "MCA",
      subject: "Data Science",
      batch: "Batch 2024",
      branch: "Branch 03",
      contact: "+91 3456789014",
      fatherNumber: "+91 9876543250",
      motherNumber: "+91 9876543251",
      registrationDate: "2024-02-18",
      registrationStatus: "register",
      enquiryStatus: "converted",
      status: "active",
    },
    {
      id: 22,
      firstName: "Tina",
      lastName: "Perez",
      registrationNumber: "REG022",
      course: "B.Tech",
      subject: "Electrical Engineering",
      batch: "Batch 2023",
      branch: "Branch 01",
      contact: "+91 4567890125",
      fatherNumber: "+91 9876543252",
      motherNumber: "+91 9876543253",
      registrationDate: "2023-12-10",
      registrationStatus: "register",
      enquiryStatus: "converted",
      status: "active",
    },
    {
      id: 23,
      firstName: "Uma",
      lastName: "White",
      registrationNumber: "REG023",
      course: "MBA",
      subject: "Marketing",
      batch: "Batch 2024",
      branch: "Head Quarters",
      contact: "+91 5678901236",
      fatherNumber: "+91 9876543254",
      motherNumber: "+91 9876543255",
      registrationDate: "2024-01-28",
      registrationStatus: "enquiry",
      enquiryStatus: "pending",
      status: "active",
    },
    {
      id: 24,
      firstName: "Victor",
      lastName: "Harris",
      registrationNumber: "REG024",
      course: "BBA",
      subject: "Finance",
      batch: "Batch 2024",
      branch: "Branch 02",
      contact: "+91 6789012347",
      fatherNumber: "+91 9876543256",
      motherNumber: "+91 9876543257",
      registrationDate: "2024-03-08",
      registrationStatus: "register",
      enquiryStatus: "converted",
      status: "active",
    },
    {
      id: 25,
      firstName: "Wendy",
      lastName: "Clark",
      registrationNumber: "REG025",
      course: "MCA",
      subject: "Computer Science",
      batch: "Batch 2023",
      branch: "Branch 03",
      contact: "+91 7890123458",
      fatherNumber: "+91 9876543258",
      motherNumber: "+91 9876543259",
      registrationDate: "2023-11-15",
      registrationStatus: "register",
      enquiryStatus: "converted",
      status: "inactive",
    },
    {
      id: 26,
      firstName: "Xavier",
      lastName: "Lewis",
      registrationNumber: "REG026",
      course: "B.Tech",
      subject: "Civil Engineering",
      batch: "Batch 2024",
      branch: "Branch 01",
      contact: "+91 8901234569",
      fatherNumber: "+91 9876543260",
      motherNumber: "+91 9876543261",
      registrationDate: "2024-02-22",
      registrationStatus: "enquiry",
      enquiryStatus: "follow-up",
      status: "active",
    },
    {
      id: 27,
      firstName: "Yara",
      lastName: "Robinson",
      registrationNumber: "REG027",
      course: "MBA",
      subject: "Finance",
      batch: "Batch 2024",
      branch: "Head Quarters",
      contact: "+91 9012345680",
      fatherNumber: "+91 9876543262",
      motherNumber: "+91 9876543263",
      registrationDate: "2024-01-12",
      registrationStatus: "register",
      enquiryStatus: "converted",
      status: "active",
    },
    {
      id: 28,
      firstName: "Zack",
      lastName: "Walker",
      registrationNumber: "REG028",
      course: "BBA",
      subject: "Marketing",
      batch: "Batch 2023",
      branch: "Branch 02",
      contact: "+91 1234567893",
      fatherNumber: "+91 9876543264",
      motherNumber: "+91 9876543265",
      registrationDate: "2024-03-18",
      registrationStatus: "register",
      enquiryStatus: "converted",
      status: "active",
    },
    {
      id: 29,
      firstName: "Amy",
      lastName: "Hall",
      registrationNumber: "REG029",
      course: "MCA",
      subject: "Data Science",
      batch: "Batch 2024",
      branch: "Branch 03",
      contact: "+91 2345678904",
      fatherNumber: "+91 9876543266",
      motherNumber: "+91 9876543267",
      registrationDate: "2024-02-25",
      registrationStatus: "register",
      enquiryStatus: "converted",
      status: "active",
    },
    {
      id: 30,
      firstName: "Ben",
      lastName: "Allen",
      registrationNumber: "REG030",
      course: "B.Tech",
      subject: "Mechanical Engineering",
      batch: "Batch 2023",
      branch: "Branch 01",
      contact: "+91 3456789015",
      fatherNumber: "+91 9876543268",
      motherNumber: "+91 9876543269",
      registrationDate: "2023-12-20",
      registrationStatus: "register",
      enquiryStatus: "converted",
      status: "active",
    },
    {
      id: 31,
      firstName: "Chloe",
      lastName: "Young",
      registrationNumber: "REG031",
      course: "MBA",
      subject: "Marketing",
      batch: "Batch 2024",
      branch: "Head Quarters",
      contact: "+91 4567890126",
      fatherNumber: "+91 9876543270",
      motherNumber: "+91 9876543271",
      registrationDate: "2024-01-05",
      registrationStatus: "enquiry",
      enquiryStatus: "pending",
      status: "active",
    },
    {
      id: 32,
      firstName: "Dylan",
      lastName: "King",
      registrationNumber: "REG032",
      course: "BBA",
      subject: "Finance",
      batch: "Batch 2024",
      branch: "Branch 02",
      contact: "+91 5678901237",
      fatherNumber: "+91 9876543272",
      motherNumber: "+91 9876543273",
      registrationDate: "2024-03-22",
      registrationStatus: "register",
      enquiryStatus: "converted",
      status: "active",
    },
    {
      id: 33,
      firstName: "Eva",
      lastName: "Wright",
      registrationNumber: "REG033",
      course: "MCA",
      subject: "Computer Science",
      batch: "Batch 2023",
      branch: "Branch 03",
      contact: "+91 6789012348",
      fatherNumber: "+91 9876543274",
      motherNumber: "+91 9876543275",
      registrationDate: "2023-11-25",
      registrationStatus: "register",
      enquiryStatus: "converted",
      status: "inactive",
    },
    {
      id: 34,
      firstName: "Felix",
      lastName: "Lopez",
      registrationNumber: "REG034",
      course: "B.Tech",
      subject: "Electrical Engineering",
      batch: "Batch 2024",
      branch: "Branch 01",
      contact: "+91 7890123459",
      fatherNumber: "+91 9876543276",
      motherNumber: "+91 9876543277",
      registrationDate: "2024-02-16",
      registrationStatus: "enquiry",
      enquiryStatus: "follow-up",
      status: "active",
    },
    {
      id: 35,
      firstName: "Gina",
      lastName: "Hill",
      registrationNumber: "REG035",
      course: "MBA",
      subject: "Finance",
      batch: "Batch 2024",
      branch: "Head Quarters",
      contact: "+91 8901234570",
      fatherNumber: "+91 9876543278",
      motherNumber: "+91 9876543279",
      registrationDate: "2024-01-19",
      registrationStatus: "register",
      enquiryStatus: "converted",
      status: "active",
    },
  ];

  const filteredStudents = students.filter((student) => {
    const fullName = `${student.firstName} ${student.lastName}`.toLowerCase();
    const matchesBasicSearch =
      fullName.includes(searchTerm.toLowerCase()) ||
      student.course.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.branch.toLowerCase().includes(searchTerm.toLowerCase());

    // Advanced search filters
    const matchesRegistrationNumber =
      !registrationNumber ||
      student.registrationNumber
        .toLowerCase()
        .includes(registrationNumber.toLowerCase());

    const matchesPhoneNumber =
      !phoneNumber || student.contact.includes(phoneNumber);

    const matchesFromDate =
      !fromDate || new Date(student.registrationDate) >= new Date(fromDate);

    const matchesToDate =
      !toDate || new Date(student.registrationDate) <= new Date(toDate);

    const matchesRegistrationStatus =
      registrationStatus === "all" ||
      student.registrationStatus === registrationStatus;

    const matchesStatus = status === "all" || student.status === status;

    const matchesCourse =
      selectedCourses.length === 0 || selectedCourses.includes(student.course);

    const matchesSubject =
      selectedSubjects.length === 0 ||
      selectedSubjects.includes(student.subject);

    const matchesBatch =
      selectedBatches.length === 0 || selectedBatches.includes(student.batch);

    const matchesEnquiryStatus =
      enquiryStatus === "all" || student.enquiryStatus === enquiryStatus;

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
  const totalPages = Math.ceil(filteredStudents.length / entriesPerPage);
  const startIndex = (currentPageNum - 1) * entriesPerPage;
  const endIndex = startIndex + entriesPerPage;
  const paginatedStudents = filteredStudents.slice(startIndex, endIndex);

  const handleClearFilters = () => {
    setSearchTerm("");
    setRegistrationNumber("");
    setPhoneNumber("");
    setFromDate("");
    setToDate("");
    setRegistrationStatus("all");
    setStatus("all");
    setCourseFilter("all");
    setSubjectFilter("all");
    setBatchFilter("all");
    setEnquiryStatus("all");
    setSelectedCourses([]);
    setSelectedSubjects([]);
    setSelectedBatches([]);
    setCurrentPageNum(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPageNum(page);
  };

  const handlePreviousPage = () => {
    if (currentPageNum > 1) {
      setCurrentPageNum(currentPageNum - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPageNum < totalPages) {
      setCurrentPageNum(currentPageNum + 1);
    }
  };

  const handleEditStudent = (student: (typeof students)[0]) => {
    setEditingStudent({ ...student });
    setShowEditModal(true);
  };

  const handleSaveEdit = () => {
    // In a real app, this would update the student in the database
    console.log("Saving student:", editingStudent);
    setShowEditModal(false);
    setEditingStudent(null);
  };

  const handleCancelEdit = () => {
    setShowEditModal(false);
    setEditingStudent(null);
  };

  if (showSubjectForm) {
    return <SubjectFormModal onClose={() => setShowSubjectForm(false)} />;
  }

  return (
    <div>
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manage Students</h1>
          <p className="text-sm text-gray-500 mt-1">
            View and manage students in {branchName}
          </p>
        </div>
      </div>

      {/* Search Bar */}
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
          {showAdvancedSearch ? (
            <ChevronDown className="w-4 h-4" />
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
          Advanced Search
        </button>

        {/* Advanced Search Panel */}
        {showAdvancedSearch && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Registration Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Registration Number
                </label>
                <input
                  type="text"
                  placeholder="Enter registration number"
                  value={registrationNumber}
                  onChange={(e) => setRegistrationNumber(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F4C81] focus:border-transparent text-sm"
                />
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="text"
                  placeholder="Enter phone number"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F4C81] focus:border-transparent text-sm"
                />
              </div>

              {/* Registration From Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Registration From Date
                </label>
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F4C81] focus:border-transparent text-sm"
                />
              </div>

              {/* Registration To Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Registration To Date
                </label>
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F4C81] focus:border-transparent text-sm"
                />
              </div>

              {/* Registration Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Registration Status
                </label>
                <div className="flex flex-wrap gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="registrationStatus"
                      value="all"
                      checked={registrationStatus === "all"}
                      onChange={(e) => setRegistrationStatus(e.target.value)}
                      className="w-4 h-4 text-[#0F4C81] focus:ring-[#0F4C81]"
                    />
                    <span className="text-sm text-gray-700">All</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="registrationStatus"
                      value="register"
                      checked={registrationStatus === "register"}
                      onChange={(e) => setRegistrationStatus(e.target.value)}
                      className="w-4 h-4 text-[#0F4C81] focus:ring-[#0F4C81]"
                    />
                    <span className="text-sm text-gray-700">Register</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="registrationStatus"
                      value="enquiry"
                      checked={registrationStatus === "enquiry"}
                      onChange={(e) => setRegistrationStatus(e.target.value)}
                      className="w-4 h-4 text-[#0F4C81] focus:ring-[#0F4C81]"
                    />
                    <span className="text-sm text-gray-700">Enquiry</span>
                  </label>
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <div className="flex flex-wrap gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="status"
                      value="all"
                      checked={status === "all"}
                      onChange={(e) => setStatus(e.target.value)}
                      className="w-4 h-4 text-[#0F4C81] focus:ring-[#0F4C81]"
                    />
                    <span className="text-sm text-gray-700">All</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="status"
                      value="active"
                      checked={status === "active"}
                      onChange={(e) => setStatus(e.target.value)}
                      className="w-4 h-4 text-[#0F4C81] focus:ring-[#0F4C81]"
                    />
                    <span className="text-sm text-gray-700">Active</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="status"
                      value="inactive"
                      checked={status === "inactive"}
                      onChange={(e) => setStatus(e.target.value)}
                      className="w-4 h-4 text-[#0F4C81] focus:ring-[#0F4C81]"
                    />
                    <span className="text-sm text-gray-700">Inactive</span>
                  </label>
                </div>
              </div>

              {/* Course */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Course
                </label>
                <div className="flex flex-col gap-2">
                  {["B.Tech", "MBA", "BBA", "MCA"].map((course) => (
                    <label
                      key={course}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedCourses.includes(course)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedCourses([...selectedCourses, course]);
                          } else {
                            setSelectedCourses(
                              selectedCourses.filter((c) => c !== course),
                            );
                          }
                        }}
                        className="w-4 h-4 text-[#0F4C81] focus:ring-[#0F4C81] rounded"
                      />
                      <span className="text-sm text-gray-700">{course}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Subject */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subject
                </label>
                <div className="flex flex-col gap-2">
                  {[
                    "Computer Science",
                    "Finance",
                    "Marketing",
                    "Data Science",
                    "Mechanical Engineering",
                  ].map((subject) => (
                    <label
                      key={subject}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedSubjects.includes(subject)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedSubjects([...selectedSubjects, subject]);
                          } else {
                            setSelectedSubjects(
                              selectedSubjects.filter((s) => s !== subject),
                            );
                          }
                        }}
                        className="w-4 h-4 text-[#0F4C81] focus:ring-[#0F4C81] rounded"
                      />
                      <span className="text-sm text-gray-700">{subject}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Batch */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Batch
                </label>
                <div className="flex flex-col gap-2">
                  {["Batch 2024", "Batch 2023", "Batch 2022"].map((batch) => (
                    <label
                      key={batch}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedBatches.includes(batch)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedBatches([...selectedBatches, batch]);
                          } else {
                            setSelectedBatches(
                              selectedBatches.filter((b) => b !== batch),
                            );
                          }
                        }}
                        className="w-4 h-4 text-[#0F4C81] focus:ring-[#0F4C81] rounded"
                      />
                      <span className="text-sm text-gray-700">{batch}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Enquiry Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Enquiry Status
                </label>
                <select
                  value={enquiryStatus}
                  onChange={(e) => setEnquiryStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F4C81] focus:border-transparent text-sm"
                >
                  <option value="all">All Enquiry Status</option>
                  <option value="converted">Converted</option>
                  <option value="pending">Pending</option>
                  <option value="follow-up">Follow-up</option>
                </select>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 mt-4">
              <button className="flex items-center gap-2 px-4 py-2 bg-[#0F4C81] text-white rounded-lg hover:bg-[#0d3f6b] transition-colors text-sm font-medium">
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

      {/* Download Excel Button */}
      <div className="mb-4">
        <button className="flex items-center gap-2 px-4 py-2 border border-[#0F4C81] text-[#0F4C81] rounded-lg hover:bg-[#0F4C81] hover:text-white transition-colors text-sm font-medium">
          <FileSpreadsheet className="w-4 h-4" />
          <span>Download Excel File</span>
        </button>
      </div>

      {/* Action Buttons */}
      <div className="bg-white border border-gray-200 rounded-2xl p-4 mb-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <button
            onClick={() => onNavigateToRegistration?.()}
            className="flex items-center justify-center gap-1.5 px-3 py-2 border border-[#0F4C81] text-[#0F4C81] rounded-lg hover:bg-[#0F4C81] hover:text-white transition-colors text-xs font-medium"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Register</span>
          </button>

          <button
            onClick={() => setCurrentPage("studentEnquiry")}
            className="flex items-center justify-center gap-1.5 px-3 py-2 border border-[#0F4C81] text-[#0F4C81] rounded-lg hover:bg-[#0F4C81] hover:text-white transition-colors text-xs font-medium"
          >
            <ClipboardList className="w-3.5 h-3.5" />
            <span>Add Enquiry</span>
          </button>

          <button
            onClick={() => setShowSubjectForm(true)}
            className="flex items-center justify-center gap-1.5 px-3 py-2 border border-[#0F4C81] text-[#0F4C81] rounded-lg hover:bg-[#0F4C81] hover:text-white transition-colors text-xs font-medium"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Export to Excel</span>
          </button>
          <button className="flex items-center justify-center gap-1.5 px-3 py-2 border border-[#0F4C81] text-[#0F4C81] rounded-lg hover:bg-[#0F4C81] hover:text-white transition-colors text-xs font-medium">
            <Tag className="w-3.5 h-3.5" />
            <span>Address Label</span>
          </button>

          <button className="flex items-center justify-center gap-1.5 px-3 py-2 border border-[#0F4C81] text-[#0F4C81] rounded-lg hover:bg-[#0F4C81] hover:text-white transition-colors text-xs font-medium">
            <Users className="w-3.5 h-3.5" />
            <span>Address Label (Parent)</span>
          </button>

          <button className="flex items-center justify-center gap-1.5 px-3 py-2 border border-[#0F4C81] text-[#0F4C81] rounded-lg hover:bg-[#0F4C81] hover:text-white transition-colors text-xs font-medium">
            <KeyRound className="w-3.5 h-3.5" />
            <span>Export Username/Password</span>
          </button>
        </div>
      </div>

      {/* Students List */}
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
                paginatedStudents.map((student) => (
                  <tr
                    key={student.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center justify-center gap-3">
                        <button
                          className="p-2 text-[#0F4C81] hover:bg-[#e0eef5] rounded-lg transition-colors"
                          onClick={() => handleEditStudent(student)}
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
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 whitespace-nowrap">
                      {student.registrationNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#e0eef5] rounded-full flex items-center justify-center flex-shrink-0">
                          <UserCircle className="w-5 h-5 text-[#0F4C81]" />
                        </div>
                        <span className="font-medium text-gray-900">
                          {student.firstName} {student.lastName}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
                      {student.course}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
                      {student.contact}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
                      {student.fatherNumber}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
                      {student.motherNumber}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
                      {new Date(student.registrationDate).toLocaleDateString(
                        "en-GB",
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span
                        className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${
                          student.registrationStatus === "register"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {student.registrationStatus === "register"
                          ? "Registered"
                          : "Enquiry"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span
                        className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${
                          student.status === "active"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {student.status === "active" ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      {/* Make Payment - Empty */}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      {/* Reset Password - Empty */}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={14}
                    className="px-6 py-8 text-center text-gray-500"
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
              {/* Left side - Showing entries text and page size selector */}
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Show</span>
                  <select
                    value={entriesPerPage}
                    onChange={(e) => {
                      setEntriesPerPage(Number(e.target.value));
                      setCurrentPageNum(1);
                    }}
                    className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0F4C81] focus:border-transparent"
                  >
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                  <span className="text-sm text-gray-600">entries</span>
                </div>

                <div className="text-sm text-gray-600">
                  Showing {startIndex + 1} to{" "}
                  {Math.min(endIndex, filteredStudents.length)} of{" "}
                  {filteredStudents.length} entries
                </div>
              </div>

              {/* Pagination buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePreviousPage}
                  disabled={currentPageNum === 1}
                  className={`flex items-center gap-1 px-3 py-2 border rounded-lg text-sm font-medium transition-colors ${
                    currentPageNum === 1
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-white text-gray-700 hover:bg-gray-50 border-gray-300"
                  }`}
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </button>

                {/* Page numbers */}
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (page) => (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          currentPageNum === page
                            ? "bg-[#0F4C81] text-white"
                            : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-300"
                        }`}
                      >
                        {page}
                      </button>
                    ),
                  )}
                </div>

                <button
                  onClick={handleNextPage}
                  disabled={currentPageNum === totalPages}
                  className={`flex items-center gap-1 px-3 py-2 border rounded-lg text-sm font-medium transition-colors ${
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

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
        <div className="bg-white border border-gray-200 rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Total Students</p>
              <p className="text-2xl font-bold text-gray-900">
                {students.length}
              </p>
            </div>
            <div className="w-12 h-12 bg-[#e0eef5] rounded-full flex items-center justify-center">
              <UserCircle className="w-6 h-6 text-[#0F4C81]" />
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Active Students</p>
              <p className="text-2xl font-bold text-green-600">
                {students.filter((s) => s.status === "active").length}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Registered</p>
              <p className="text-2xl font-bold text-blue-600">
                {
                  students.filter((s) => s.registrationStatus === "register")
                    .length
                }
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <UserCircle className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Enquiries</p>
              <p className="text-2xl font-bold text-yellow-600">
                {
                  students.filter((s) => s.registrationStatus === "enquiry")
                    .length
                }
              </p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && editingStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Edit Student</h2>
              <button
                className="text-gray-500 hover:text-gray-700"
                onClick={handleCancelEdit}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  First Name
                </label>
                <input
                  type="text"
                  value={editingStudent.firstName}
                  onChange={(e) =>
                    setEditingStudent({
                      ...editingStudent,
                      firstName: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F4C81] focus:border-transparent text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name
                </label>
                <input
                  type="text"
                  value={editingStudent.lastName}
                  onChange={(e) =>
                    setEditingStudent({
                      ...editingStudent,
                      lastName: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F4C81] focus:border-transparent text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Registration Number
                </label>
                <input
                  type="text"
                  value={editingStudent.registrationNumber}
                  onChange={(e) =>
                    setEditingStudent({
                      ...editingStudent,
                      registrationNumber: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F4C81] focus:border-transparent text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Course
                </label>
                <select
                  value={editingStudent.course}
                  onChange={(e) =>
                    setEditingStudent({
                      ...editingStudent,
                      course: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F4C81] focus:border-transparent text-sm"
                >
                  <option value="B.Tech">B.Tech</option>
                  <option value="MBA">MBA</option>
                  <option value="BBA">BBA</option>
                  <option value="MCA">MCA</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subject
                </label>
                <select
                  value={editingStudent.subject}
                  onChange={(e) =>
                    setEditingStudent({
                      ...editingStudent,
                      subject: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F4C81] focus:border-transparent text-sm"
                >
                  <option value="Computer Science">Computer Science</option>
                  <option value="Finance">Finance</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Data Science">Data Science</option>
                  <option value="Mechanical Engineering">
                    Mechanical Engineering
                  </option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Batch
                </label>
                <select
                  value={editingStudent.batch}
                  onChange={(e) =>
                    setEditingStudent({
                      ...editingStudent,
                      batch: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F4C81] focus:border-transparent text-sm"
                >
                  <option value="Batch 2024">Batch 2024</option>
                  <option value="Batch 2023">Batch 2023</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Branch
                </label>
                <select
                  value={editingStudent.branch}
                  onChange={(e) =>
                    setEditingStudent({
                      ...editingStudent,
                      branch: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F4C81] focus:border-transparent text-sm"
                >
                  <option value="Head Quarters">Head Quarters</option>
                  <option value="Branch 01">Branch 01</option>
                  <option value="Branch 02">Branch 02</option>
                  <option value="Branch 03">Branch 03</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contact
                </label>
                <input
                  type="text"
                  value={editingStudent.contact}
                  onChange={(e) =>
                    setEditingStudent({
                      ...editingStudent,
                      contact: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F4C81] focus:border-transparent text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Registration Date
                </label>
                <input
                  type="date"
                  value={editingStudent.registrationDate}
                  onChange={(e) =>
                    setEditingStudent({
                      ...editingStudent,
                      registrationDate: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F4C81] focus:border-transparent text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Registration Status
                </label>
                <select
                  value={editingStudent.registrationStatus}
                  onChange={(e) =>
                    setEditingStudent({
                      ...editingStudent,
                      registrationStatus: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F4C81] focus:border-transparent text-sm"
                >
                  <option value="register">Register</option>
                  <option value="enquiry">Enquiry</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={editingStudent.status}
                  onChange={(e) =>
                    setEditingStudent({
                      ...editingStudent,
                      status: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F4C81] focus:border-transparent text-sm"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
            <div className="flex items-center justify-end mt-4">
              <button
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                onClick={handleCancelEdit}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-[#0F4C81] text-white rounded-lg hover:bg-[#0c3d6a] transition-colors text-sm font-medium"
                onClick={handleSaveEdit}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SubjectFormModal({ onClose }: { onClose: () => void }) {
  const [feesType, setFeesType] = useState<"full" | "monthly" | "hourly">(
    "full",
  );
  const [taxable, setTaxable] = useState<"yes" | "no">("no");
  const [taxType, setTaxType] = useState<"including" | "excluding">(
    "including",
  );
  const [prorateAmount, setProrateAmount] = useState<"yes" | "no">("no");
  const [installmentAllowed, setInstallmentAllowed] = useState<"yes" | "no">(
    "no",
  );
  const [adhoc, setAdhoc] = useState(false);
  const [createTemplate, setCreateTemplate] = useState(false);
  const [durationUnit, setDurationUnit] = useState("Year");

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white rounded-t-2xl">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Subject Details
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Academic subject configuration form
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <div className="px-6 py-6 space-y-8">
          {/* Section 1: Subject Details */}
          <section>
            <h3 className="text-sm font-semibold text-[#0F4C81] uppercase tracking-wider mb-4 pb-2 border-b border-[#e0eef5]">
              Subject Details
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Curriculum Name
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0F4C81] focus:border-transparent">
                  <option value="">— Select Curriculum —</option>
                  <option>Engineering 2024</option>
                  <option>Medical Science</option>
                  <option>Commerce Plus</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Course / Class Name <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2">
                  <select className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0F4C81] focus:border-transparent">
                    <option value="">— Select Course —</option>
                    <option>B.Tech Computer Science</option>
                    <option>B.Sc Physics</option>
                    <option>B.Com Honours</option>
                  </select>
                  <button className="px-3 py-2 text-xs font-medium text-[#0F4C81] border border-[#0F4C81] rounded-lg hover:bg-[#0F4C81] hover:text-white transition-colors whitespace-nowrap">
                    + New
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subject Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Advanced Mathematics"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0F4C81] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Duration
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min="0"
                    defaultValue={1}
                    className="w-24 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0F4C81] focus:border-transparent"
                  />
                  <select
                    value={durationUnit}
                    onChange={(e) => setDurationUnit(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0F4C81] focus:border-transparent"
                  >
                    <option>Year</option>
                    <option>Month</option>
                    <option>Week</option>
                    <option>Hour</option>
                  </select>
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Brief description of the subject..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0F4C81] focus:border-transparent resize-none"
                />
              </div>
            </div>
          </section>

          {/* Section 2: Fees Details */}
          <section>
            <h3 className="text-sm font-semibold text-[#0F4C81] uppercase tracking-wider mb-4 pb-2 border-b border-[#e0eef5]">
              Fees Details
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fees Type
                </label>
                <div className="flex flex-wrap gap-4">
                  {(
                    [
                      ["full", "Full Subject Fees"],
                      ["monthly", "Monthly"],
                      ["hourly", "Hourly"],
                    ] as const
                  ).map(([val, label]) => (
                    <label
                      key={val}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <input
                        type="radio"
                        name="feesType"
                        value={val}
                        checked={feesType === val}
                        onChange={() => setFeesType(val)}
                        className="w-4 h-4 text-[#0F4C81] accent-[#0F4C81]"
                      />
                      <span className="text-sm text-gray-700">{label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Amount <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
                      ₹
                    </span>
                    <input
                      type="number"
                      min="0"
                      placeholder="0.00"
                      className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0F4C81] focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-3 justify-center">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={adhoc}
                      onChange={(e) => setAdhoc(e.target.checked)}
                      className="w-4 h-4 accent-[#0F4C81] rounded"
                    />
                    <span className="text-sm text-gray-700">
                      Adhoc Subject Installment
                    </span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Taxable
                </label>
                <div className="flex flex-wrap gap-4 mb-3">
                  {(["yes", "no"] as const).map((val) => (
                    <label
                      key={val}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <input
                        type="radio"
                        name="taxable"
                        value={val}
                        checked={taxable === val}
                        onChange={() => setTaxable(val)}
                        className="w-4 h-4 accent-[#0F4C81]"
                      />
                      <span className="text-sm text-gray-700 capitalize">
                        {val === "yes" ? "Yes" : "No"}
                      </span>
                    </label>
                  ))}
                </div>
                {taxable === "yes" && (
                  <div className="ml-4 pl-4 border-l-2 border-[#e0eef5] flex flex-wrap gap-4">
                    {(["including", "excluding"] as const).map((val) => (
                      <label
                        key={val}
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <input
                          type="radio"
                          name="taxType"
                          value={val}
                          checked={taxType === val}
                          onChange={() => setTaxType(val)}
                          className="w-4 h-4 accent-[#0F4C81]"
                        />
                        <span className="text-sm text-gray-700">
                          {val === "including"
                            ? "Including Tax"
                            : "Excluding Tax"}
                        </span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Section 3: Subject Attributes */}
          <section>
            <h3 className="text-sm font-semibold text-[#0F4C81] uppercase tracking-wider mb-4 pb-2 border-b border-[#e0eef5]">
              Subject Attributes
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Prorate Amount
                </label>
                <div className="flex gap-4">
                  {(["yes", "no"] as const).map((val) => (
                    <label
                      key={val}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <input
                        type="radio"
                        name="prorateAmount"
                        value={val}
                        checked={prorateAmount === val}
                        onChange={() => setProrateAmount(val)}
                        className="w-4 h-4 accent-[#0F4C81]"
                      />
                      <span className="text-sm text-gray-700">
                        {val === "yes" ? "Yes" : "No"}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Installment Allowed
                </label>
                <div className="flex gap-4">
                  {(["yes", "no"] as const).map((val) => (
                    <label
                      key={val}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <input
                        type="radio"
                        name="installmentAllowed"
                        value={val}
                        checked={installmentAllowed === val}
                        onChange={() => setInstallmentAllowed(val)}
                        className="w-4 h-4 accent-[#0F4C81]"
                      />
                      <span className="text-sm text-gray-700">
                        {val === "yes" ? "Yes" : "No"}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Maximum Installment <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  placeholder="e.g. 12"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0F4C81] focus:border-transparent"
                />
              </div>

              <div className="flex flex-col justify-end gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={createTemplate}
                    onChange={(e) => setCreateTemplate(e.target.checked)}
                    className="w-4 h-4 accent-[#0F4C81] rounded"
                  />
                  <span className="text-sm text-gray-700">Create Template</span>
                </label>
                <button
                  type="button"
                  className="self-start flex items-center gap-1.5 px-3 py-1.5 border border-red-300 text-red-600 text-xs font-medium rounded-lg hover:bg-red-50 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete Template
                </button>
              </div>
            </div>
          </section>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-end gap-3 bg-white rounded-b-2xl">
          <button
            onClick={onClose}
            className="px-5 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button className="px-5 py-2 text-sm font-medium text-white bg-[#0F4C81] rounded-lg hover:bg-[#0c3d6a] transition-colors flex items-center gap-2">
            <Save className="w-4 h-4" />
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
