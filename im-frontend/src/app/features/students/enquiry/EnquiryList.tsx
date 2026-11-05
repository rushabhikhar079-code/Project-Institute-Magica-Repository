import { useCallback, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { exportStudentsToExcel } from "./enquiryExcel";
import type { RootState } from "../../../redux/store";

import SearchFilter from "../../../components/common/SearchFilter/SearchFilter";
import DataTable from "../../../components/common/DataTable/Datatable";
import {
  searchStudents,
  getBatchesBySubjects,
  deleteStudent,
  bulkDeleteStudents,
  bulkUpdateStudentStatus,
} from "./enquiryService";
import type { Batch } from "./enquiryService";
import { getAdmissionColumns } from "./columns";
import { enquiryFilterFields } from "./constants";
import Pagination from "../../../components/common/DataTable/TablePagination";
import type { StudentList, StudentSearchRequest } from "./enquiryListTypes";
import { enquirySearchSchema } from "./validations/EnquirySearchSchema";
import type { CurriculumList } from "../../courses/ManageCurriculum/types";
import type { CourseList } from "../../courses/ManageCourses/types";
import type { SubjectList } from "../../courses/ManageSubjects/types";

import { getCurriculums } from "../../courses/ManageCurriculum/curriculumService";
import { getCourses } from "../../courses/ManageCourses/courseService";
import { getSubjects } from "../../courses/ManageSubjects/subjectService";
import { toast } from "react-toastify";
import { AlertCircle, Plus, X } from "lucide-react";
import { Dropdown } from "../../../components/common/Select";
import { MultiSelectDropdown } from "../../../components/common/MultiSelectDropdown";
import { useNavigate } from "react-router-dom";

const DEFAULT_FILTERS = {
  studentName: "",
  regManual: "",
  phone: "",
  email: "",
  regFrDate: "",
  regToDate: "",

  regStatus: 0,
  status: 2,
  curriculumId: 0,
  courseId: 0,
  subId: 0,
  batchId: 0,
  enquiryStatus: 0,

  notInBatch: false,
  allBranches: false,
};

type FilterValues = typeof DEFAULT_FILTERS;

const formatDateForApi = (value: string) => {
  if (!value) return "";

  const [year, month, day] = value.split("-");

  if (!year || !month || !day) {
    return "";
  }

  return `${day}/${month}/${year}`;
};

const EnquiryList = () => {
  const branchId = useSelector((state: RootState) => state.branch.branchId);
  const instituteId = useSelector((state: RootState) => state.auth.instituteId);
  const [filters, setFilters] = useState<FilterValues>(DEFAULT_FILTERS);

  const [students, setStudents] = useState<StudentList[]>([]);

  const [currentPage, setCurrentPage] = useState(1);

  const [pageSize, setPageSize] = useState(10);

  const [totalCount, setTotalCount] = useState(0);

  const [totalPages, setTotalPages] = useState(0);

  const [sortBy, setSortBy] = useState<string | null>(null);

  const [sortDirection, setSortDirection] = useState<"asc" | "desc" | null>(
    null,
  );
  const [selectedRegNos, setSelectedRegNos] = useState<StudentList["RegNo"][]>(
    [],
  );

  const [showInactiveModal, setShowInactiveModal] = useState(false);
  const [inactiveReason, setInactiveReason] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const inactiveReasons = [
    { value: "On Leave", label: "On Leave" },
    { value: "Session Completed", label: "Session Completed" },
    { value: "Drop Out", label: "Drop Out" },
    { value: "Did Not Join", label: "Did Not Join" },
    { value: "Other", label: "Other" },
    { value: "Inner Branch Transfer", label: "Inner Branch Transfer" },
  ].sort((a, b) => a.label.localeCompare(b.label));
  const [curriculums, setCurriculums] = useState<CurriculumList[]>([]);
  const [courses, setCourses] = useState<CourseList[]>([]);
  const [subjects, setSubjects] = useState<SubjectList[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [showActiveModal, setShowActiveModal] = useState(false);

  const navigate = useNavigate();

  const filteredCourses =
    Number(filters.curriculumId) === 0
      ? courses
      : courses.filter(
          (course) => Number(course.crclmId) === Number(filters.curriculumId),
        );
  useEffect(() => {
    const loadCurriculums = async () => {
      try {
        const response = await getCurriculums({
          curriculumName: "",
          status: 2,
          pageNumber: 1,
          pageSize: 1000,
          branchId,
        });

        setCurriculums(response.items ?? []);
      } catch (error) {
        console.error("Error loading curriculums:", error);
        setCurriculums([]);
      }
    };

    if (!branchId) {
      setCurriculums([]);
      return;
    }

    loadCurriculums();
  }, [branchId]);
  useEffect(() => {
    const loadCourses = async () => {
      try {
        const response = await getCourses({
          courseName: "",
          status: 2,
          pageNumber: 1,
          pageSize: 1000,
          branchId,
        });

        setCourses(response.items ?? []);
      } catch (error) {
        console.error("Error loading courses:", error);
        setCourses([]);
      }
    };

    if (!branchId) {
      setCourses([]);
      return;
    }

    loadCourses();
  }, [branchId]);
  useEffect(() => {
    const loadSubjects = async () => {
      try {
        let responseItems: SubjectList[] = [];

        // No curriculum + no course
        // → Load ALL subjects
        if (
          Number(filters.curriculumId) === 0 &&
          Number(filters.courseId) === 0
        ) {
          const response = await getSubjects({
            pageNumber: 1,
            pageSize: 1000,
            subjectName: "",
            crclmId: 0,
            courseId: 0,
            status: 2,
            branchId,
            sortBy: null,
            sortDirection: null,
          });

          responseItems = response.items ?? [];
        } else if (Number(filters.courseId) !== 0) {
          // Course selected
          // → Load subjects for selected course
          const response = await getSubjects({
            pageNumber: 1,
            pageSize: 1000,
            subjectName: "",
            crclmId: Number(filters.curriculumId),
            courseId: Number(filters.courseId),
            status: 2,
            branchId,
            sortBy: null,
            sortDirection: null,
          });

          responseItems = response.items ?? [];
        } else {
          // Curriculum selected, but course not selected
          // → Load subjects for all courses in that curriculum
          const curriculumCourses = courses.filter(
            (course) => Number(course.crclmId) === Number(filters.curriculumId),
          );

          const requests = curriculumCourses.map((course) =>
            getSubjects({
              pageNumber: 1,
              pageSize: 1000,
              subjectName: "",
              crclmId: Number(course.crclmId),
              courseId: Number(course.courseId),
              status: 2,
              branchId,
              sortBy: null,
              sortDirection: null,
            }),
          );

          const responses = await Promise.all(requests);

          responseItems = responses.flatMap((response) => response.items ?? []);
        }

        // Remove duplicate subjects
        const uniqueSubjects = Array.from(
          new Map(
            responseItems.map((subject) => [Number(subject.subId), subject]),
          ).values(),
        );

        setSubjects(uniqueSubjects);
      } catch (error) {
        console.error("Error loading subjects:", error);
        setSubjects([]);
      }
    };

    if (!branchId) {
      setSubjects([]);
      return;
    }

    loadSubjects();
  }, [branchId, filters.curriculumId, filters.courseId, courses]);
  useEffect(() => {
    const loadBatches = async () => {
      if (!branchId || !instituteId) {
        setBatches([]);
        return;
      }

      try {
        const subjectId = Number(filters.subId);

        const response = await getBatchesBySubjects(
          Number(instituteId),
          Number(branchId),
          subjectId !== 0 ? [subjectId] : [],
        );

        setBatches(response ?? []);
      } catch (error) {
        console.error("Error loading batches:", error);
        setBatches([]);
      }
    };

    loadBatches();
  }, [branchId, instituteId, filters.subId]);
  const loadStudents = useCallback(
    async (
      filterValues: FilterValues,
      page = 1,
      size = pageSize,
      selectedSortBy = sortBy,
      selectedSortDirection = sortDirection,
    ) => {
      if (!branchId) {
        setStudents([]);
        return;
      }

      const payload: StudentSearchRequest = {
        listType: "Enquiry",

        studentName: filterValues.studentName.trim(),

        reg: "No",

        regManual: filterValues.regManual.trim(),

        phone: filterValues.phone.trim(),
        email: filterValues.email.trim(),
        regFrDate: formatDateForApi(filterValues.regFrDate),

        regToDate: formatDateForApi(filterValues.regToDate),

        status: Number(filterValues.status),
        crclmId: Number(filterValues.curriculumId),
        courseId: Number(filterValues.courseId),

        subId: Number(filterValues.subId),

        batchId: Number(filterValues.batchId),

        enquiryStatus: Number(filterValues.enquiryStatus),

        notInBatch: filterValues.notInBatch,

        branchId: filterValues.allBranches ? 0 : branchId,

        pageNumber: page,

        pageSize: size,

        offset: (page - 1) * size,

        sortBy: selectedSortBy,

        sortDirection: selectedSortDirection,
      };

      try {
        const response = await searchStudents(payload);

        setStudents(response.items ?? []);

        setTotalCount(response.totalCount ?? 0);

        setTotalPages(response.totalPages ?? 0);

        setCurrentPage(response.pageNumber ?? page);
      } catch (error) {
        console.error("Error loading students:", error);

        setStudents([]);
        setTotalCount(0);
        setTotalPages(0);
      }
    },
    [branchId, pageSize, sortBy, sortDirection],
  );

  // Initial load
  useEffect(() => {
    if (!branchId) return;

    loadStudents(DEFAULT_FILTERS, 1, pageSize, null, null);
  }, [branchId]);
  const handleFilterChange = (key: string, value: any) => {
    if (key === "notInBatch") {
      setFilters((prev) => ({
        ...prev,
        notInBatch: Boolean(value),
        batchId: value ? 0 : prev.batchId,
      }));

      return;
    }

    if (key === "curriculumId") {
      setFilters((prev) => ({
        ...prev,
        curriculumId: Number(value),
        courseId: 0,
        subId: 0,
        batchId: 0,
      }));

      return;
    }

    if (key === "courseId") {
      setFilters((prev) => ({
        ...prev,
        courseId: Number(value),
        subId: 0,
        batchId: 0,
      }));

      return;
    }

    if (key === "subId") {
      setFilters((prev) => ({
        ...prev,
        subId: Number(value),
        batchId: 0,
      }));

      return;
    }
    if (key === "allBranches") {
      setFilters((prev) => ({
        ...prev,
        allBranches: Boolean(value),
      }));

      return;
    }
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSearch = () => {
    setCurrentPage(1);

    loadStudents(filters, 1, pageSize, sortBy, sortDirection);
  };

  const handleClear = () => {
    setFilters(DEFAULT_FILTERS);

    setCurrentPage(1);

    setSortBy(null);
    setSortDirection(null);

    loadStudents(DEFAULT_FILTERS, 1, pageSize, null, null);
  };

  const handleSortChange = (
    newSortBy: string | null,
    newSortDirection: "asc" | "desc" | null,
  ) => {
    setSortBy(newSortBy);

    setSortDirection(newSortDirection);

    setCurrentPage(1);

    loadStudents(filters, 1, pageSize, newSortBy, newSortDirection);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);

    loadStudents(filters, page, pageSize, sortBy, sortDirection);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);

    setCurrentPage(1);

    loadStudents(filters, 1, size, sortBy, sortDirection);
  };
  const handleDeleteStudents = async () => {
    if (selectedRegNos.length === 0) {
      return;
    }

    setIsDeleting(true);

    try {
      await bulkDeleteStudents({
        studentIds: selectedRegNos.map((regNo) => Number(regNo)),
      });

      toast.success(
        selectedRegNos.length === 1
          ? "Student deleted successfully."
          : "Students deleted successfully.",
      );

      setSelectedRegNos([]);
      setShowDeleteModal(false);

      await loadStudents(filters, currentPage, pageSize, sortBy, sortDirection);
    } catch (error) {
      console.error("Error deleting student(s):", error);
      toast.error("Failed to delete student(s).");
    } finally {
      setIsDeleting(false);
    }
  };
  const handleUpdateStudentStatus = async (
    status: 1 | 0,
    inactiveStatus = "",
  ) => {
    if (selectedRegNos.length === 0) {
      return;
    }

    setIsUpdatingStatus(true);

    try {
      await bulkUpdateStudentStatus({
        studentIds: selectedRegNos.map((regNo) => Number(regNo)),
        status,
        inactiveStatus,
      });

      toast.success(
        status === 1
          ? "Student(s) activated successfully."
          : "Student(s) marked as inactive successfully.",
      );

      setSelectedRegNos([]);

      if (status === 1) {
        setShowActiveModal(false);
      } else {
        setShowInactiveModal(false);
        setInactiveReason("");
      }

      await loadStudents(filters, currentPage, pageSize, sortBy, sortDirection);
    } catch (error) {
      console.error("Error updating student status:", error);
      toast.error("Failed to update student status.");
    } finally {
      setIsUpdatingStatus(false);
    }
  };
  const handleStudentSelection = (
    regNo: StudentList["RegNo"],
    checked: boolean,
  ) => {
    setSelectedRegNos((prev) => {
      if (checked) {
        return prev.includes(regNo) ? prev : [...prev, regNo];
      }

      return prev.filter((id) => id !== regNo);
    });
  };
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRegNos(students.map((student) => student.RegNo));
    } else {
      setSelectedRegNos([]);
    }
  };
  const allSelected =
    students.length > 0 &&
    students.every((student) => selectedRegNos.includes(student.RegNo));
  const handleEdit = (student: StudentList) => {
    navigate(`/enquiry/edit/${student.RegNo}`);
  };
  const handleExportExcel = () => {
    if (students.length === 0) {
      toast.info("No students available to export.");
      return;
    }

    try {
      exportStudentsToExcel(students);
      toast.success("Student list exported and downloaded successfully.");
    } catch (error) {
      console.error("Error exporting students:", error);
      toast.error("Failed to export student list.");
    }
  };
  const allColumns = getAdmissionColumns({
    onEdit: handleEdit,
    selectedRegNos,
    onStudentSelection: handleStudentSelection,
    onSelectAll: handleSelectAll,
    allSelected,
  });

  const columns = allColumns;
  const filterFields = enquiryFilterFields.map((field) => {
    if (field.key === "curriculumId") {
      return {
        ...field,
        options: curriculums.map((curriculum) => ({
          label: curriculum.CurriculumName,
          value: curriculum.CurriculumId,
        })),
      };
    }

    if (field.key === "courseId") {
      return {
        ...field,
        options: filteredCourses.map((course) => ({
          label: course.course_Name,
          value: course.courseId,
        })),
      };
    }

    if (field.key === "subId") {
      return {
        ...field,
        options: subjects.map((subject) => ({
          label: subject.subName,
          value: subject.subId,
        })),
      };
    }
    if (field.key === "batchId") {
      return {
        ...field,
        options: batches.map((batch) => ({
          label: batch.name,
          value: batch.id,
        })),
        disabled: filters.notInBatch,
      };
    }

    return field;
  });
  return (
    <div className="space-y-5 [&_.grid.grid-cols-1.md\\:grid-cols-3]:md:grid-cols-4">
      {/* Filters */}
      <SearchFilter
        searchValue={filters.studentName}
        searchPlaceholder="Search students by name..."
        onSearchChange={(value) => handleFilterChange("studentName", value)}
        fields={filterFields}
        values={filters}
        onValueChange={handleFilterChange}
        onSearch={handleSearch}
        onClear={handleClear}
        validationSchema={enquirySearchSchema}
      />
      <div className="bg-white border border-gray-200 rounded-2xl p-4 mb-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <button
            type="button"
            onClick={handleExportExcel}
            disabled={students.length === 0}
            className="flex items-center justify-center gap-1.5 px-3 py-2 border border-[#0F4C81] text-[#0F4C81] rounded-lg hover:bg-[#0F4C81] hover:text-white transition-colors text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="w-4 h-4" />
            <span>Export to excel</span>
          </button>
        </div>
      </div>
      {/* Result count */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          {selectedRegNos.length > 0 && (
            <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-gray-200 bg-gray-50">
              <span className="text-sm text-gray-600">
                {selectedRegNos.length} student
                {selectedRegNos.length > 1 ? "s" : ""} selected
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(true)}
                  disabled={isDeleting}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Delete
                </button>
                <button
                  type="button"
                  onClick={() => setShowActiveModal(true)}
                  disabled={isDeleting}
                  className="px-4 py-2 text-sm font-medium text-white bg-[#0F4C81] rounded-md hover:bg-[#0c3d6a] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Active
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setInactiveReason("");
                    setShowInactiveModal(true);
                  }}
                  disabled={isDeleting}
                  className="px-4 py-2 text-sm font-medium text-white bg-gray-600 rounded-md hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Inactive
                </button>
              </div>
            </div>
          )}

          <DataTable
            columns={columns}
            data={students}
            rowKey="RegNo"
            emptyMessage="No students found."
            sortBy={sortBy}
            sortDirection={sortDirection}
            onSortChange={handleSortChange}
          />

          {totalCount > 0 && (
            <Pagination
              currentPage={currentPage}
              pageSize={pageSize}
              totalCount={totalCount}
              totalPages={totalPages}
              hasPrevious={currentPage > 1}
              hasNext={currentPage < totalPages}
              onPageChange={handlePageChange}
              onPageSizeChange={handlePageSizeChange}
            />
          )}
        </div>
      </div>
      {showInactiveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 max-w-lg w-full p-7 space-y-6 animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div className="flex items-center gap-3 text-[#0F4C81]">
                <div className="p-2 bg-[#0F4C81]/10 rounded-xl">
                  <AlertCircle className="w-6 h-6 text-[#0F4C81]" />
                </div>

                <h3 className="font-bold text-lg text-gray-900">
                  Confirm Inactive
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setShowInactiveModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1.5 rounded-lg hover:bg-gray-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="space-y-5">
              {/* Reason */}
              <div className="space-y-2">
                <Dropdown
                  label="Reason for making student(s) Inactive"
                  options={inactiveReasons}
                  value={inactiveReason}
                  onChange={(value) => setInactiveReason(String(value ?? ""))}
                />
              </div>
              {/* Confirmation Question */}
              <div className="space-y-3">
                <p className="text-gray-900 font-bold text-lg">
                  Are you sure you want to make this student(s) Inactive?
                </p>

                <p className="leading-relaxed text-gray-600 text-[15px]">
                  Note that Inactive student(s) will not be shown in payment,
                  attendance, test and outstanding payment reports.
                </p>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-center gap-4 pt-4 border-t border-gray-100">
              <button
                type="button"
                disabled={!inactiveReason || isUpdatingStatus}
                onClick={() => handleUpdateStudentStatus(0, inactiveReason)}
                className={`px-7 py-2.5 rounded-xl text-white font-semibold text-sm transition-all shadow-md ${
                  inactiveReason
                    ? "bg-[#0F4C81] hover:bg-[#0c3d6a] cursor-pointer"
                    : "bg-gray-300 cursor-not-allowed"
                }`}
              >
                {isUpdatingStatus ? "Saving..." : "Yes"}
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowInactiveModal(false);
                  setInactiveReason("");
                }}
                className="px-7 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-semibold text-sm hover:bg-gray-50 hover:border-gray-400 transition-all cursor-pointer"
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}
      {showActiveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 max-w-lg w-full p-7 space-y-6 animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div className="flex items-center gap-3 text-[#0F4C81]">
                <div className="p-2 bg-[#0F4C81]/10 rounded-xl">
                  <AlertCircle className="w-6 h-6 text-[#0F4C81]" />
                </div>

                <h3 className="font-bold text-lg text-gray-900">
                  Confirm Active
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setShowActiveModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1.5 rounded-lg hover:bg-gray-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="space-y-3">
              <p className="text-gray-900 font-bold text-lg">
                Are you sure you want to make this student(s) Active?
              </p>

              <p className="leading-relaxed text-gray-600 text-[15px]">
                The selected student(s)
                {selectedRegNos.length > 1 ? "s" : ""} will be marked as Active.
              </p>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-center gap-4 pt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={() => handleUpdateStudentStatus(1)}
                disabled={isUpdatingStatus}
                className="px-7 py-2.5 rounded-xl text-white font-semibold text-sm transition-all shadow-md bg-[#0F4C81] hover:bg-[#0c3d6a] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUpdatingStatus ? "Saving..." : "Yes"}
              </button>

              <button
                type="button"
                onClick={() => setShowActiveModal(false)}
                className="px-7 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-semibold text-sm hover:bg-gray-50 hover:border-gray-400 transition-all cursor-pointer"
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 max-w-lg w-full p-7 space-y-6 animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div className="flex items-center gap-3 text-[#0F4C81]">
                <div className="p-2 bg-[#0F4C81]/10 rounded-xl">
                  <AlertCircle className="w-6 h-6 text-[#0F4C81]" />
                </div>

                <h3 className="font-bold text-lg text-gray-900">
                  Confirm Delete
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1.5 rounded-lg hover:bg-gray-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="space-y-4">
              <p className="text-gray-900 font-bold text-lg">
                Are you sure, you want to delete the selected student(s)
                {selectedRegNos.length > 1 ? "s" : ""}?
              </p>

              <p className="leading-relaxed text-gray-600 text-[15px]">
                All Payments, Batches and Test info related to the selected
                student(s){selectedRegNos.length > 1 ? "s" : ""} will be lost.
              </p>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-center gap-4 pt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={handleDeleteStudents}
                disabled={isDeleting}
                className="px-7 py-2.5 rounded-xl text-white font-semibold text-sm transition-all shadow-md bg-[#0F4C81] hover:bg-[#0c3d6a] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDeleting ? "Deleting..." : "Yes"}
              </button>

              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="px-7 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-semibold text-sm hover:bg-gray-50 hover:border-gray-400 transition-all cursor-pointer"
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnquiryList;
