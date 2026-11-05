import { useEffect, useState } from "react";
import { useLocation, useNavigate, Outlet } from "react-router-dom";
import { toast } from "react-toastify";

import PageHeader from "../../../../components/common/PageHeader/PageHeader";
import CourseList from "./CoursesList";

import type {
  CourseList as CourseListType,
  InstituteCourses,
  InstituteSubjectApi,
} from "../types";
import type { FilterField } from "../../../../components/common/SearchFilter/types";

import {
  getCourses,
  getInstituteCourse,
  getCourseSubjects,
  deleteCourse,
  importCourse,
  getCourseById,
} from "../courseService";

import { fields } from "../constants";
import { useAppSelector } from "../../../../redux/hooks";
import { getCurriculums } from "../../ManageCurriculum/curriculumService";

type Props = {
  setCurrentPage: (page: string) => void;
  setSelectedCourse: (course: string) => void;
};
type FilterValues = {
  courseName: string;
  status: string;
  curriculumId: string | number;
};

export type CourseOutletContext = {
  // Manage Courses data
  courses: CourseListType[];

  // Add from Institute data
  instituteCourses: InstituteCourses[];
  instituteSubjects: InstituteSubjectApi[];
  onViewSubjects: (courseIds: number[]) => Promise<void>;

  onAddCourse: (courseIds: number[]) => Promise<void>;

  // Manage Courses pagination
  currentTablePage: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPrevious: boolean;
  hasNext: boolean;

  // Institute Courses pagination
  instituteCurrentTablePage: number;
  institutePageSize: number;
  instituteTotalCount: number;
  instituteTotalPages: number;
  instituteHasPrevious: boolean;
  instituteHasNext: boolean;

  onPageChange: (page: number) => Promise<void>;
  onPageSizeChange: (pageSize: number) => Promise<void>;

  instituteSortBy: string | null;
  instituteSortDirection: "asc" | "desc" | null;
  onInstituteSortChange: (
    sortBy: string | null,
    sortDirection: "asc" | "desc" | null,
  ) => Promise<void>;
  onInstitutePageChange: (page: number) => Promise<void>;
  onInstitutePageSizeChange: (pageSize: number) => Promise<void>;

  subjectCurrentTablePage: number;
  subjectPageSize: number;
  subjectTotalCount: number;
  subjectTotalPages: number;
  subjectHasPrevious: boolean;
  subjectHasNext: boolean;

  onSubjectPageChange: (page: number) => Promise<void>;
  onSubjectPageSizeChange: (pageSize: number) => Promise<void>;
  resetCoursesPagination: () => Promise<void>;
  updateCourseRow: (updatedCourse: CourseList) => void;
};

const EMPTY_FILTERS: FilterValues = {
  courseName: "",
  status: "2",
  curriculumId: "",
};
export function ManageCourses({ setCurrentPage, setSelectedCourse }: Props) {
  const navigate = useNavigate();
  const location = useLocation();
  const branchId = useAppSelector((state) => state.branch.branchId);
  // ============================================================
  // MANAGE Courses STATE
  // ============================================================

  const [courses, setCourses] = useState<CourseListType[]>([]);
  const updateCourseRow = (updatedCourse: CourseList) => {
    setCourses((prev) =>
      prev.map((course) =>
        Number(course.courseId) === Number(updatedCourse.courseId)
          ? {
              ...course,
              ...updatedCourse,
              curriculum_Name:
                updatedCourse.curriculum_Name || course.curriculum_Name,
            }
          : course,
      ),
    );
  };

  const [searchValue, setSearchValue] = useState("");

  const [filterValues, setFilterValues] = useState<FilterValues>(EMPTY_FILTERS);

  const [currentTablePage, setCurrentTablePage] = useState(1);

  const [pagination, setPagination] = useState({
    pageNumber: 1,
    pageSize: 10,
    totalCount: 0,
    totalPages: 0,
    hasPrevious: false,
    hasNext: false,
  });
  const [sortBy, setSortBy] = useState<string | null>(null);

  const [sortDirection, setSortDirection] = useState<"asc" | "desc" | null>(
    null,
  );
  const [instituteSortBy, setInstituteSortBy] = useState<string | null>(null);

  const [instituteSortDirection, setInstituteSortDirection] = useState<
    "asc" | "desc" | null
  >(null);
  // ============================================================
  // INSTITUTE Courses STATE
  // ============================================================

  const [instituteCourses, setInstituteCourses] = useState<InstituteCourses[]>(
    [],
  );
  const [instituteSubjects, setInstituteSubjects] = useState<
    InstituteSubjectApi[]
  >([]);

  const [instituteCurrentTablePage, setInstituteCurrentTablePage] = useState(1);

  const [institutePagination, setInstitutePagination] = useState({
    pageNumber: 1,
    pageSize: 10,
    totalCount: 0,
    totalPages: 0,
    hasPrevious: false,
    hasNext: false,
  });
  const [subjectPagination, setSubjectPagination] = useState({
    pageNumber: 1,
    pageSize: 10,
    totalCount: 0,
    totalPages: 0,
    hasPrevious: false,
    hasNext: false,
  });

  const [selectedSubjectCourseIds, setSelectedSubjectCourseIds] = useState<
    number[]
  >([]);
  // ============================================================
  // CHILD ROUTE
  // ============================================================
  const [curriculumOptions, setCurriculumOptions] = useState<
    { label: string; value: string | number }[]
  >([]);
  useEffect(() => {
    if (branchId == null) return;

    const fetchCurriculumOptions = async () => {
      try {
        const response = await getCurriculums({
          curriculumName: "",
          status: 1,
          pageNumber: 1,
          pageSize: 1000,
          branchId: Number(branchId),
        });

        const options = (response.items ?? [])
          .map((curriculum) => ({
            label: curriculum.CurriculumName,
            value: curriculum.CurriculumId,
          }))
          .sort((a, b) => {
            const aFirst = a.label.trim().charAt(0);
            const bFirst = b.label.trim().charAt(0);

            const aIsNumber = /^\d$/.test(aFirst);
            const bIsNumber = /^\d$/.test(bFirst);

            // Numbers first
            if (aIsNumber && !bIsNumber) return -1;
            if (!aIsNumber && bIsNumber) return 1;

            // Both start with numbers:
            // compare only the first digit
            if (aIsNumber && bIsNumber) {
              return Number(aFirst) - Number(bFirst);
            }

            // Both start with letters:
            // alphabetical, case-insensitive
            return a.label.localeCompare(b.label, undefined, {
              sensitivity: "base",
            });
          });

        setCurriculumOptions(options);
      } catch (error) {
        console.error("Failed to fetch curriculums:", error);
        setCurriculumOptions([]);
      }
    };

    fetchCurriculumOptions();
  }, [branchId]);

  const isChildRoute =
    location.pathname.endsWith("/add") ||
    location.pathname.includes("/edit/") ||
    location.pathname.endsWith("/instcourses") ||
    location.pathname.endsWith("/expcourse");
  // ============================================================
  // FETCH MANAGE Courses
  // ============================================================

  const fetchCourses = async (
    filters: FilterValues,
    pageNumber = 1,
    pageSize = 10,
    currentSortBy = sortBy,
    currentSortDirection = sortDirection,
  ) => {
    try {
      const response = await getCourses({
        courseName: filters.courseName,
        status: Number(filters.status),
        curriculumId: Number(filters.curriculumId) || 0,
        pageNumber,
        pageSize,
        branchId,
        sortBy: currentSortBy,
        sortDirection: currentSortDirection,
      });
      console.log("GET courses RESPONSE:", response);

      setCourses(response.items ?? []);

      setPagination({
        pageNumber: response.pageNumber,
        pageSize: response.pageSize,
        totalCount: response.totalCount,
        totalPages: response.totalPages,
        hasPrevious: response.hasPrevious,
        hasNext: response.hasNext,
      });
    } catch (error) {
      console.error("Failed to fetch Courses:", error);
      setCourses([]);
    }
  };

  // ============================================================
  // FETCH INSTITUTE Courses
  // ============================================================

  const fetchInstituteCourses = async (
    pageNumber = 1,
    pageSize = 10,
    currentSortBy = instituteSortBy,
    currentSortDirection = instituteSortDirection,
  ) => {
    try {
      const response = await getInstituteCourse({
        pageNumber,
        pageSize,
        branchId,
        sortBy: currentSortBy,
        sortDirection: currentSortDirection,
      });

      console.log("GET INSTITUTE COURSES RESPONSE:", response);

      setInstituteCourses(response.items ?? []);

      setInstitutePagination({
        pageNumber: response.pageNumber,
        pageSize: response.pageSize,
        totalCount: response.totalCount,
        totalPages: response.totalPages,
        hasPrevious: response.hasPrevious,
        hasNext: response.hasNext,
      });
    } catch (error) {
      console.error("Failed to fetch institute courses:", error);

      setInstituteCourses([]);
    }
  };
  const handleViewSubjects = async (
    courseIds: number[],
    pageNumber = 1,
    pageSize = 10,
  ) => {
    try {
      setSelectedSubjectCourseIds(courseIds);

      const response = await getCourseSubjects({
        courseIds,
        branchId,
        pageNumber,
        pageSize,
      });

      console.log("SUBJECT ITEMS:", response.items);
      console.log("SUBJECT ITEMS LENGTH:", response.items?.length);
      console.log("SUBJECT PAGINATION:", {
        pageNumber: response.pageNumber,
        pageSize: response.pageSize,
        totalCount: response.totalCount,
        totalPages: response.totalPages,
      });

      setInstituteSubjects(response.items ?? []);

      setSubjectPagination({
        pageNumber: response.pageNumber,
        pageSize: response.pageSize,
        totalCount: response.totalCount,
        totalPages: response.totalPages,
        hasPrevious: response.hasPrevious,
        hasNext: response.hasNext,
      });
    } catch (error) {
      console.error("Failed to fetch course subjects:", error);

      setInstituteSubjects([]);

      setSubjectPagination({
        pageNumber: 1,
        pageSize: 10,
        totalCount: 0,
        totalPages: 0,
        hasPrevious: false,
        hasNext: false,
      });

      // toast.error("Failed to fetch subjects");
    }
  };
  // ============================================================
  // INITIAL LOAD
  // ============================================================

  useEffect(() => {
    fetchCourses(EMPTY_FILTERS);
  }, []);

  // ============================================================
  // FETCH INSTITUTE Courses WHEN OPENING THAT PAGE
  // ============================================================

  useEffect(() => {
    if (location.pathname.endsWith("/instcourses")) {
      fetchInstituteCourses(1, 10);
    }
  }, [location.pathname]);

  // ============================================================
  // SEARCH
  // ============================================================

  const handleSearchChange = (value: string) => {
    setSearchValue(value);

    setFilterValues((prev) => ({
      ...prev,
      courseName: value,
    }));
  };

  const handleFilterChange = (key: string, value: any) => {
    setFilterValues((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSearch = async () => {
    setCurrentTablePage(1);

    await fetchCourses(
      filterValues,
      1,
      pagination.pageSize,
      sortBy,
      sortDirection,
    );
  };

  const handleClear = async () => {
    setSearchValue("");
    setFilterValues(EMPTY_FILTERS);
    setCurrentTablePage(1);

    await fetchCourses(EMPTY_FILTERS, 1, pagination.pageSize);
  };

  // ============================================================
  // NAVIGATION
  // ============================================================

  const openAdd = () => {
    navigate("add");
  };

  const openAddFromInst = () => {
    navigate("instcourses");
  };
  const openexpToBranch = () => {
    navigate("expcourse");
  };
  const openAddSubjects = () => {
    navigate("/managesubjects/add");
  };
  const openEdit = (courses: CourseListType) => {
    navigate(`edit/${courses.courseId}`);
  };

  // ============================================================
  // DELETE
  // ============================================================

  const handleDelete = async (courseId: number) => {
    const course = courses.find((course) => course.courseId === courseId);

    const confirmed = window.confirm(
      `Are you sure you want to delete "${course?.course_Name ?? "this course"}"?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      await deleteCourse(courseId);

      setCourses((prev) =>
        prev.filter((course) => course.courseId !== courseId),
      );

      setPagination((prev) => ({
        ...prev,
        totalCount: Math.max(0, prev.totalCount - 1),
      }));

      toast.success("Course deleted successfully");
    } catch (error) {
      console.error("Failed to delete course:", error);
      // toast.error("Failed to delete course");
    }
  };
  const handleCourseUpdated = (updatedCourse: CourseListType) => {
    setCourses((prev) =>
      prev.map((course) =>
        course.courseId === updatedCourse.courseId ? updatedCourse : course,
      ),
    );
  };

  // ============================================================
  // MANAGE course PAGINATION
  // ============================================================

  const handleTablePageChange = async (page: number) => {
    setCurrentTablePage(page);

    await fetchCourses(
      filterValues,
      page,
      pagination.pageSize,
      sortBy,
      sortDirection,
    );
  };

  const handlePageSizeChange = async (newPageSize: number) => {
    setCurrentTablePage(1);

    await fetchCourses(filterValues, 1, newPageSize, sortBy, sortDirection);
  };

  // ============================================================
  // INSTITUTE Courses PAGINATION
  // ============================================================

  const handleInstitutePageChange = async (page: number) => {
    setInstituteCurrentTablePage(page);

    await fetchInstituteCourses(
      page,
      institutePagination.pageSize,
      instituteSortBy,
      instituteSortDirection,
    );
  };

  const handleInstitutePageSizeChange = async (newPageSize: number) => {
    setInstituteCurrentTablePage(1);

    await fetchInstituteCourses(
      1,
      newPageSize,
      instituteSortBy,
      instituteSortDirection,
    );
  };
  const handleSubjectPageChange = async (page: number) => {
    await handleViewSubjects(
      selectedSubjectCourseIds,
      page,
      subjectPagination.pageSize,
    );
  };

  const handleSubjectPageSizeChange = async (newPageSize: number) => {
    await handleViewSubjects(selectedSubjectCourseIds, 1, newPageSize);
  };
  // ============================================================
  // REFRESH MANAGE Courses
  // ============================================================

  const resetCoursesPagination = async () => {
    // Used after ADD
    setCurrentTablePage(1);

    await fetchCourses(filterValues, 1, pagination.pageSize);
  };

  const refreshCurrentCoursePage = async () => {
    // Used after EDIT / DELETE
    await fetchCourses(filterValues, currentTablePage, pagination.pageSize);
  };
  // ============================================================
  // ADD SELECTED INSTITUTE Courses
  // ============================================================

  const handleAddCourses = async (courseIds: number[]) => {
    try {
      await importCourse(courseIds, branchId);

      toast.success("Course(s) imported successfully");

      // Fetch the latest ManageCourses data
      const response = await getCourses({
        courseName: filterValues.courseName,
        status: Number(filterValues.status),
        pageNumber: currentTablePage,
        pageSize: pagination.pageSize,
        branchId,
      });

      const latestCourses = response.items ?? [];

      // Update ONLY the rows that changed/are newly imported.
      setCourses((prevCourses) => {
        const previousIds = new Set(
          prevCourses.map((course) => Number(course.courseId)),
        );

        const newCourses = latestCourses.filter(
          (course) => !previousIds.has(Number(course.courseId)),
        );

        // Update existing rows + add newly imported rows
        const updatedExistingCourses = prevCourses.map((oldCourse) => {
          const latestCourse = latestCourses.find(
            (newCourse) =>
              Number(newCourse.courseId) === Number(oldCourse.courseId),
          );

          return latestCourse ?? oldCourse;
        });

        return [...updatedExistingCourses, ...newCourses];
      });

      // Keep pagination metadata in sync
      setPagination((prev) => ({
        ...prev,
        totalCount: response.totalCount,
        totalPages: response.totalPages,
        hasPrevious: response.hasPrevious,
        hasNext: response.hasNext,
      }));

      // Refresh institute list so imported courses are marked accordingly
      await fetchInstituteCourses(
        institutePagination.pageNumber,
        institutePagination.pageSize,
        instituteSortBy,
        instituteSortDirection,
      );
    } catch (error) {
      console.error("Import course error:", error);

      throw error;
    }
  }; // ============================================================
  // RENDER
  // ============================================================
  const handleSortChange = async (
    newSortBy: string | null,
    newSortDirection: "asc" | "desc" | null,
  ) => {
    setSortBy(newSortBy);
    setSortDirection(newSortDirection);
    setCurrentTablePage(1);

    await fetchCourses(
      filterValues,
      1,
      pagination.pageSize,
      newSortBy,
      newSortDirection,
    );
  };
  const handleInstituteSortChange = async (
    newSortBy: string | null,
    newSortDirection: "asc" | "desc" | null,
  ) => {
    setInstituteSortBy(newSortBy);
    setInstituteSortDirection(newSortDirection);
    setInstituteCurrentTablePage(1);

    await fetchInstituteCourses(
      1,
      institutePagination.pageSize,
      newSortBy,
      newSortDirection,
    );
  };
  return (
    <div>
      {!isChildRoute && (
        <>
          <PageHeader />

          <CourseList
            courses={courses}
            fields={fields.map((field) =>
              field.key === "curriculumId"
                ? { ...field, options: curriculumOptions }
                : field,
            )}
            openAdd={openAdd}
            openaddFromInst={openAddFromInst}
            openexpToBranch={openexpToBranch}
            openAddSubjects={openAddSubjects}
            onEdit={openEdit}
            onDelete={handleDelete}
            searchValue={searchValue}
            filterValues={filterValues}
            onSearchChange={handleSearchChange}
            onFilterChange={handleFilterChange}
            onSearch={handleSearch}
            onClear={handleClear}
            setCurrentPage={setCurrentPage}
            setSelectedCourse={setSelectedCourse}
            currentTablePage={currentTablePage}
            pageSize={pagination.pageSize}
            totalCount={pagination.totalCount}
            totalPages={pagination.totalPages}
            hasPrevious={pagination.hasPrevious}
            hasNext={pagination.hasNext}
            onPageChange={handleTablePageChange}
            onPageSizeChange={handlePageSizeChange}
            sortBy={sortBy}
            sortDirection={sortDirection}
            onSortChange={handleSortChange}
          />
        </>
      )}

      <Outlet
        context={{
          // Manage Courses
          courses,

          // Institute Courses
          instituteCourses,
          instituteSubjects,
          onViewSubjects: handleViewSubjects,
          onAddCourse: handleAddCourses,

          // Manage pagination
          currentTablePage,
          pageSize: pagination.pageSize,
          totalCount: pagination.totalCount,
          totalPages: pagination.totalPages,
          hasPrevious: pagination.hasPrevious,
          hasNext: pagination.hasNext,

          onPageChange: handleTablePageChange,
          onPageSizeChange: handlePageSizeChange,

          // Institute pagination
          instituteCurrentTablePage,
          institutePageSize: institutePagination.pageSize,
          instituteTotalCount: institutePagination.totalCount,
          instituteTotalPages: institutePagination.totalPages,
          instituteHasPrevious: institutePagination.hasPrevious,
          instituteHasNext: institutePagination.hasNext,

          onInstitutePageChange: handleInstitutePageChange,
          onInstitutePageSizeChange: handleInstitutePageSizeChange,
          // Subject pagination
          subjectCurrentTablePage: subjectPagination.pageNumber,
          subjectPageSize: subjectPagination.pageSize,
          subjectTotalCount: subjectPagination.totalCount,
          subjectTotalPages: subjectPagination.totalPages,
          subjectHasPrevious: subjectPagination.hasPrevious,
          subjectHasNext: subjectPagination.hasNext,

          onSubjectPageChange: handleSubjectPageChange,
          onSubjectPageSizeChange: handleSubjectPageSizeChange,

          resetCoursesPagination,
          updateCourseRow,
          instituteSortBy,
          instituteSortDirection,
          onInstituteSortChange: handleInstituteSortChange,
        }}
      />
    </div>
  );
}
