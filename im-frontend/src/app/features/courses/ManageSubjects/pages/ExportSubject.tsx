import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BookOpen,
  Building2,
  FileText,
  Network,
  School,
  X,
} from "lucide-react";

import PageHeader from "../../../../components/common/PageHeader/PageHeader";
import DataTable from "../../../../components/common/DataTable/Datatable";
import Pagination from "../../../../components/common/DataTable/TablePagination";

import { getBranchColumns } from "../../columns";
import type { BranchList } from "../../../branches/branchTypes";
import { getBranches } from "../../../branches/branchService";
import { Dropdown } from "../../../../components/common/Select";
import {
  exportSubject,
  getExportSubjects,
  getSubjects,
} from "../subjectService";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../../../redux/store";
import { FormProvider, useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { MultiSelectDropdown } from "../../../../components/common/MultiSelectDropdown";
import ValidationErrorSummary from "../../../../components/common/ValidationErrorSummary";
import { clearGlobalError } from "../../../../redux/slices/errorSlice";
import { SubjectList } from "../types";
import { getExportSubjectColumns } from "../columns";
import { CurriculumList } from "../../ManageCurriculum/types";
import { CourseList } from "../../ManageCourses/types";
import { getCurriculums } from "../../ManageCurriculum/curriculumService";
import { getCourses } from "../../ManageCourses/courseService";

const ExpSubjects = () => {
  const navigate = useNavigate();
  const methods = useForm({
    defaultValues: {
      subIds: [] as string[],
    },
  });
  const [branches, setBranches] = useState<BranchList[]>([]);
  const [selectedBranchIds, setSelectedBranchIds] = useState<number[]>([]);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [hasPrevious, setHasPrevious] = useState(false);
  const [hasNext, setHasNext] = useState(false);

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(clearGlobalError());

    return () => {
      dispatch(clearGlobalError());
    };
  }, [dispatch]);
  const fetchBranches = async () => {
    try {
      const response = await getBranches({
        branchName: "",
        city: "",
        contactPerson: "",
        email: "",
        mobile: "",
        status: 1,
        pageNumber: currentPage,
        pageSize,
      });

      setBranches(response.items ?? []);
      setTotalCount(response.totalCount);
      setTotalPages(response.totalPages);
      setHasPrevious(response.hasPrevious);
      setHasNext(response.hasNext);
    } catch (error) {
      console.error("Failed to fetch branches:", error);
      setBranches([]);
    }
  };

  useEffect(() => {
    fetchBranches();
  }, [currentPage, pageSize]);
  const branchId = useSelector((state: RootState) => state.branch.branchId);
  const [subjects, setSubjects] = useState<SubjectList[]>([]);
  const [selectedSubjectIds, setSelectedSubjectIds] = useState<number[]>([]);

  const [subjectCurrentPage, setSubjectCurrentPage] = useState(1);
  const [subjectPageSize, setSubjectPageSize] = useState(10);

  const [subjectTotalCount, setSubjectTotalCount] = useState(0);
  const [subjectTotalPages, setSubjectTotalPages] = useState(0);
  const [subjectHasPrevious, setSubjectHasPrevious] = useState(false);
  const [subjectHasNext, setSubjectHasNext] = useState(false);

  const [curriculums, setCurriculums] = useState<CurriculumList[]>([]);
  const [courses, setCourses] = useState<CourseList[]>([]);

  const [selectedCurriculumIds, setSelectedCurriculumIds] = useState<number[]>(
    [],
  );
  const [selectedCourseIds, setSelectedCourseIds] = useState<number[]>([]);
  const filteredCourses =
    selectedCurriculumIds.length === 0
      ? courses
      : courses.filter((course) =>
          selectedCurriculumIds.includes(Number(course.crclmId)),
        );
  useEffect(() => {
    const loadCurriculums = async () => {
      try {
        const response = await getCurriculums({
          curriculumName: "",
          status: 1,
          pageNumber: 1,
          pageSize: 1000,
          branchId,
        });

        setCurriculums(response.items);
      } catch (error) {
        console.error("Error loading curriculums:", error);
      }
    };

    loadCurriculums();
  }, [branchId]);
  useEffect(() => {
    const loadCourses = async () => {
      try {
        const response = await getCourses({
          courseName: "",
          status: 1,
          pageNumber: 1,
          pageSize: 1000,

          branchId,
        });

        setCourses(response.items);
      } catch (error) {
        console.error("Error loading courses:", error);
      }
    };

    loadCourses();
  }, [branchId]);
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const response = await getExportSubjects({
          pageNumber: subjectCurrentPage,
          pageSize: subjectPageSize,
          subjectName: "",
          status: 1,
          branchId,
          crclmIds: selectedCurriculumIds,
          courseIds: selectedCourseIds,
          sortBy: null,
          sortDirection: null,
        });

        setSubjects(response.items ?? []);
        setSubjectTotalCount(response.totalCount);
        setSubjectTotalPages(response.totalPages);
        setSubjectHasPrevious(response.hasPrevious);
        setSubjectHasNext(response.hasNext);
      } catch (error) {
        console.error("Failed to fetch subjects:", error);
        setSubjects([]);
      }
    };

    fetchSubjects();
  }, [
    branchId,
    subjectCurrentPage,
    subjectPageSize,
    selectedCurriculumIds,
    selectedCourseIds,
  ]);
  const handleCurriculumChange = (values: number[]) => {
    setSelectedCurriculumIds(values);

    setSelectedCourseIds((previousCourseIds) => {
      if (values.length === 0) {
        return [];
      }

      return previousCourseIds.filter((courseId) => {
        const course = courses.find(
          (item) => Number(item.courseId) === Number(courseId),
        );

        return course && values.includes(Number(course.crclmId));
      });
    });

    setSubjectCurrentPage(1);
  };
  const handleCourseChange = (values: number[]) => {
    setSelectedCourseIds(values);
    setSubjectCurrentPage(1);
  };
  const handleSelectSubject = (id: number) => {
    setSelectedSubjectIds((prev) =>
      prev.includes(id)
        ? prev.filter((subjectId) => subjectId !== id)
        : [...prev, id],
    );
  };

  const handleSelectAllSubjects = () => {
    const subjectIds = subjects.map((subject) => subject.subId);

    const allSelected =
      subjectIds.length > 0 &&
      subjectIds.every((id) => selectedSubjectIds.includes(id));

    if (allSelected) {
      setSelectedSubjectIds((prev) =>
        prev.filter((id) => !subjectIds.includes(id)),
      );
    } else {
      setSelectedSubjectIds((prev) => [...new Set([...prev, ...subjectIds])]);
    }
  };
  const handleSelectBranch = (id: number) => {
    setSelectedBranchIds((prev) =>
      prev.includes(id)
        ? prev.filter((branchId) => branchId !== id)
        : [...prev, id],
    );
  };

  const handleSelectAll = () => {
    const branchIds = branches.map((branch) => branch.branchId);

    const allSelected =
      branchIds.length > 0 &&
      branchIds.every((id) => selectedBranchIds.includes(id));

    if (allSelected) {
      setSelectedBranchIds((prev) =>
        prev.filter((id) => !branchIds.includes(id)),
      );
    } else {
      setSelectedBranchIds((prev) => [...new Set([...prev, ...branchIds])]);
    }
  };
  const handleExportSubject = async () => {
    try {
      const payload = {
        subjectIds: selectedSubjectIds,
        branchIds: selectedBranchIds,
      };

      console.log("EXPORT subject PAYLOAD:", payload);

      const response = await exportSubject(payload);

      console.log("EXPORT subject RESPONSE:", response);

      toast.success("Subject(s) exported successfully");
      navigate("/managesubjects");
    } catch (error) {
      console.error("Failed to export subject:", error);
    }
  };
  const columns = getBranchColumns({
    selectedBranchIds,
    branches,
    onSelect: handleSelectBranch,
    onSelectAll: handleSelectAll,
  });
  const subjectColumns = getExportSubjectColumns({
    selectedSubjectIds,
    subjects,
    onSelect: handleSelectSubject,
    onSelectAll: handleSelectAllSubjects,
  });

  return (
    <div className="space-y-4">
      <PageHeader
        title="Export Subjects to Branches"
        description="Select branches to export subject"
        extraBreadcrumbs={[
          {
            label: "Export Subjects to Branches",
          },
        ]}
      />

      <div className="bg-white border border-gray-200 rounded-2xl p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <MultiSelectDropdown
            label="Curriculum"
            options={curriculums.map((curriculum) => ({
              label: curriculum.CurriculumName,
              value: curriculum.CurriculumId,
            }))}
            value={selectedCurriculumIds}
            onChange={(values) => handleCurriculumChange(values.map(Number))}
          />

          <MultiSelectDropdown
            label="Course"
            options={filteredCourses.map((course) => ({
              label: course.course_Name,
              value: course.courseId,
            }))}
            value={selectedCourseIds}
            onChange={(values) => handleCourseChange(values.map(Number))}
          />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center gap-3 border-b border-gray-100 pb-4 mb-5">
          <div className="p-2 bg-slate-100 text-[#0F4C81] rounded-xl flex items-center justify-center">
            <FileText className="w-5 h-5 stroke-[2]" />
          </div>

          <h2 className="text-lg font-bold text-[#0F4C81]">Subjects</h2>
        </div>
        <DataTable
          columns={subjectColumns}
          data={subjects}
          rowKey="subId"
          emptyMessage="No subjects found."
        />
        {subjectTotalCount > 0 && (
          <Pagination
            currentPage={subjectCurrentPage}
            pageSize={subjectPageSize}
            totalCount={subjectTotalCount}
            totalPages={subjectTotalPages}
            hasPrevious={subjectHasPrevious}
            hasNext={subjectHasNext}
            onPageChange={setSubjectCurrentPage}
            onPageSizeChange={(size) => {
              setSubjectPageSize(size);
              setSubjectCurrentPage(1);
            }}
          />
        )}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center gap-3 border-b border-gray-100 pb-4 mb-5">
          <div className="p-2 bg-slate-100 text-[#0F4C81] rounded-xl flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              className="lucide lucide-building2 lucide-building-2 w-5 h-5 stroke-[2]"
            >
              <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"></path>
              <path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"></path>
              <path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"></path>
              <path d="M10 6h4"></path>
              <path d="M10 10h4"></path>
              <path d="M10 14h4"></path>
              <path d="M10 18h4"></path>
            </svg>
          </div>
          <h2 className="text-lg font-bold text-[#0F4C81]">Branches</h2>
        </div>
        <div className="overflow-x-auto">
          <DataTable
            columns={columns}
            data={branches}
            rowKey="branchId"
            emptyMessage="No branches found."
          />

          {totalCount > 0 && (
            <Pagination
              currentPage={currentPage}
              pageSize={pageSize}
              totalCount={totalCount}
              totalPages={totalPages}
              hasPrevious={hasPrevious}
              hasNext={hasNext}
              onPageChange={setCurrentPage}
              onPageSizeChange={(size) => {
                setPageSize(size);
                setCurrentPage(1);
              }}
            />
          )}
        </div>
        <div className="flex items-center gap-2 pl-4">
          <div className="w-6 h-6 rounded-full bg-[#e0eef5] flex items-center justify-center flex-shrink-0">
            <School className="w-3.5 h-3.5 text-[#0F4C81]" />
          </div>

          <span className="text-sm text-gray-600">- Branch</span>
          <div className="w-6 h-6 rounded-full bg-[#e0eef5] flex items-center justify-center flex-shrink-0">
            <Building2 className="w-3.5 h-3.5 text-[#0F4C81]" />
          </div>

          <span className="text-sm text-gray-600">
            - Franchisee level branch
          </span>
        </div>
      </div>

      <div>
        <ValidationErrorSummary />
        <div className="mt-4 flex items-center justify-start gap-3">
          <button
            type="button"
            onClick={handleExportSubject}
            disabled={
              selectedBranchIds.length === 0 || selectedSubjectIds.length === 0
            }
            className="px-4 py-2 rounded-lg bg-[#0F4C81] text-white text-sm font-medium hover:bg-[#0c3d6a] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Export to branch(es)
          </button>
          <button
            type="button"
            onClick={() => navigate("..")}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-all"
          >
            <X className="w-4 h-4" />
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExpSubjects;
