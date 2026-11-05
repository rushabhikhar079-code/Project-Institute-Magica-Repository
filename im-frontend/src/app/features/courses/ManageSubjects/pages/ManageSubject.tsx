import { useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate, Outlet } from "react-router-dom";
import { toast } from "react-toastify";
import { getCourses } from "../../ManageCourses/courseService";

import PageHeader from "../../../../components/common/PageHeader/PageHeader";
import SubjectList from "./SubjectList";

import { useAppSelector } from "../../../../redux/hooks";

import type {
  SubjectList as SubjectListType,
  InstituteSubjects,
} from "../types";

import type { FilterField } from "../../../../components/common/SearchFilter/types";
import {
  getSubjects,
  getInstituteSubjectsByCourse,
  deleteSubject,
  importSubject,
  getSubjectById,
  setFixedInstallment,
  setMonthlyInstallment,
  setQuarterlyInstallment,
} from "../subjectService";

import { getFields } from "../constants";
import { getCurriculums } from "../../ManageCurriculum/curriculumService";

type Props = {
  setCurrentPage: (page: string) => void;
  setSelectedSubject: (subject: string) => void;
};

type FilterValues = {
  subjectName: string;
  course: string;
  curriculumId: string | number;
  status: string;
};
export type SubjectOutletContext = {
  // ============================================================
  // MANAGE SUBJECTS
  // ============================================================

  subjects: SubjectListType[];

  currentTablePage: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPrevious: boolean;
  hasNext: boolean;

  onPageChange: (page: number) => Promise<void>;
  onPageSizeChange: (pageSize: number) => Promise<void>;

  resetSubjectPagination: () => Promise<void>;
  courseOptions: {
    label: string;
    value: string | number;
    refCourseId: number;
    isImported: boolean;
    curriculumName: string;
  }[];
  curriculumOptions: {
    label: string;
    value: string | number;
  }[];

  onCurriculumChange: (curriculumId: number) => Promise<void>;

  selectedCourseId: number | null;
  selectedCurriculumId: number;
  courseSubjects: InstituteSubjects[];

  onCourseChange: (courseId: number, refCourseId: number) => Promise<void>;
  // ============================================================
  // INSTITUTE SUBJECTS
  // ============================================================

  instituteSubjects: InstituteSubjects[];

  onAddSubject: (subjectIds: number[]) => Promise<void>;

  instituteCurrentTablePage: number;
  institutePageSize: number;
  instituteTotalCount: number;
  instituteTotalPages: number;
  instituteHasPrevious: boolean;
  instituteHasNext: boolean;

  onInstitutePageChange: (page: number) => Promise<void>;
  onInstitutePageSizeChange: (pageSize: number) => Promise<void>;
  sortBy: string | null;
  sortDirection: "asc" | "desc" | null;

  onSortChange: (
    sortBy: string | null,
    sortDirection: "asc" | "desc" | null,
  ) => Promise<void>;
  instituteSortBy: string | null;
  instituteSortDirection: "asc" | "desc" | null;

  onInstituteSortChange: (
    sortBy: string | null,
    sortDirection: "asc" | "desc" | null,
  ) => Promise<void>;
};

const EMPTY_FILTERS: FilterValues = {
  subjectName: "",
  status: "2",
  course: "",
  curriculumId: "",
};

export function ManageSubjects({ setCurrentPage, setSelectedSubject }: Props) {
  const navigate = useNavigate();
  const location = useLocation();

  // ============================================================
  // REDUX
  // ============================================================

  const branchId = useAppSelector((state) => state.branch.branchId);

  // ============================================================
  // MANAGE SUBJECTS STATE
  // ============================================================

  const [subjects, setSubjects] = useState<SubjectListType[]>([]);

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
  const [curriculumOptions, setCurriculumOptions] = useState<
    { label: string; value: string | number }[]
  >([]);
  const isInstituteSubjectsRoute = location.pathname.endsWith("/instsubjects");
  useEffect(() => {
    if (branchId == null) return;

    const fetchCurriculumOptions = async () => {
      try {
        const response = await getCurriculums({
          curriculumName: "",
          status: 2,
          pageNumber: 1,
          pageSize: 1000,
          branchId: isInstituteSubjectsRoute ? 0 : Number(branchId),
        });

        const options = (response.items ?? []).map((curriculum) => ({
          label: curriculum.CurriculumName,
          value: curriculum.CurriculumId,
        }));

        setCurriculumOptions(options);
      } catch (error) {
        console.error("Failed to fetch curriculums:", error);
        setCurriculumOptions([]);
      }
    };

    fetchCurriculumOptions();
  }, [branchId, isInstituteSubjectsRoute]);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc" | null>(
    null,
  );
  const [courseOptions, setCourseOptions] = useState<
    {
      label: string;
      value: string | number;
      refCourseId: number;
      isImported: boolean;
      curriculumName: string;
    }[]
  >([]);
  const [selectedCurriculumId, setSelectedCurriculumId] = useState<number>(0);
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
  const [courseSubjects, setCourseSubjects] = useState<InstituteSubjects[]>([]);
  // ============================================================
  // INSTITUTE SUBJECTS STATE
  // ============================================================

  const [instituteSubjects, setInstituteSubjects] = useState<
    InstituteSubjects[]
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
  const [instituteSortBy, setInstituteSortBy] = useState<string | null>(null);

  const [instituteSortDirection, setInstituteSortDirection] = useState<
    "asc" | "desc" | null
  >(null);
  // ============================================================
  // CHILD ROUTE
  // ============================================================

  const isChildRoute =
    location.pathname.endsWith("/add") ||
    location.pathname.includes("/edit/") ||
    location.pathname.endsWith("/instsubjects") ||
    location.pathname.endsWith("/expsubjects");

  // ============================================================
  // FETCH MANAGE SUBJECTS
  // ============================================================

  const fetchSubjects = async (
    filters: FilterValues,
    pageNumber = 1,
    pageSize = 10,
    currentSortBy = sortBy,
    currentSortDirection = sortDirection,
  ) => {
    // 0 = institute level, so only reject null/undefined
    if (branchId == null) {
      console.log("No branch/institute context:", branchId);
      return;
    }

    try {
      const request = {
        pageNumber,
        pageSize,
        subjectName: filters.subjectName,
        courseId: Number(filters.course) || 0,
        crclmId: Number(filters.curriculumId) || 0,
        status: Number(filters.status),
        branchId: Number(branchId),
        sortBy: currentSortBy,
        sortDirection: currentSortDirection,
      };

      console.log("FETCH SUBJECTS REQUEST:", request);

      const response = await getSubjects(request);

      console.log("GET SUBJECTS RESPONSE:", response);

      setSubjects(response.items ?? []);

      setPagination({
        pageNumber: response.pageNumber,
        pageSize: response.pageSize,
        totalCount: response.totalCount,
        totalPages: response.totalPages,
        hasPrevious: response.hasPrevious,
        hasNext: response.hasNext,
      });
    } catch (error) {
      console.error("Failed to fetch subjects:", error);
      setSubjects([]);
    }
  };

  const handleCourseChange = useCallback(
    async (courseId: number, refCourseId: number) => {
      setSelectedCourseId(courseId || null);
      setInstituteCurrentTablePage(1);

      // Course deselected
      if (!courseId) {
        await fetchInstituteSubjects(
          selectedCurriculumId,
          0,
          0,
          1,
          institutePagination.pageSize,
          instituteSortBy,
          instituteSortDirection,
        );

        return;
      }

      // Course selected
      await fetchInstituteSubjects(
        selectedCurriculumId,
        courseId,
        refCourseId,
        1,
        institutePagination.pageSize,
        instituteSortBy,
        instituteSortDirection,
      );
    },
    [
      selectedCurriculumId,
      institutePagination.pageSize,
      instituteSortBy,
      instituteSortDirection,
    ],
  );
  // ============================================================
  // FETCH INSTITUTE SUBJECTS
  // ============================================================
  const fetchCourseOptions = useCallback(
    async (curriculumId: number = 0) => {
      if (branchId == null) return;

      try {
        const response = await getCourses({
          courseName: "",
          status: 2,
          curriculumId,
          pageNumber: 1,
          pageSize: 1000,
          instituteId: 0,
          branchId: isInstituteSubjectsRoute ? 0 : Number(branchId),
        });

        console.log("COURSES FOR DROPDOWN:", response);

        setCourseOptions(
          (response.items ?? []).map((course) => ({
            label: course.course_Name,
            value: course.courseId,
            refCourseId: course.refCourseId ?? 0,
            isImported: course.isImported,
            curriculumName: course.curriculumName,
          })),
        );
      } catch (error) {
        console.error("Failed to fetch courses:", error);
        setCourseOptions([]);
      }
    },
    [branchId, isInstituteSubjectsRoute],
  );
  const handleCurriculumChange = useCallback(
    async (curriculumId: number) => {
      setSelectedCurriculumId(curriculumId);
      setSelectedCourseId(null);
      setInstituteCurrentTablePage(1);

      await fetchCourseOptions(curriculumId);

      await fetchInstituteSubjects(
        curriculumId,
        0,
        0,
        1,
        institutePagination.pageSize,
        instituteSortBy,
        instituteSortDirection,
      );
    },
    [
      fetchCourseOptions,
      institutePagination.pageSize,
      instituteSortBy,
      instituteSortDirection,
    ],
  );
  const fetchInstituteSubjects = async (
    crclmId: number = 0,
    courseId: number = 0,
    refCourseId: number = 0,
    pageNumber = 1,
    pageSize = institutePagination.pageSize,
    currentSortBy: string | null = instituteSortBy,
    currentSortDirection: "asc" | "desc" | null = instituteSortDirection,
  ) => {
    try {
      const response = await getInstituteSubjectsByCourse({
        crclmId,
        courseId,
        refCourseId,
        pageNumber,
        pageSize,
        sortBy: currentSortBy,
        sortDirection: currentSortDirection,
      });
      const data = response?.data ?? response;

      setInstituteSubjects(data?.items ?? []);

      setInstitutePagination({
        pageNumber: data?.pageNumber ?? pageNumber,
        pageSize: data?.pageSize ?? pageSize,
        totalCount: data?.totalCount ?? 0,
        totalPages: data?.totalPages ?? 0,
        hasPrevious: data?.hasPrevious ?? false,
        hasNext: data?.hasNext ?? false,
      });
    } catch (error) {
      console.error("Failed to fetch institute subjects:", error);
      setInstituteSubjects([]);
    }
  };
  // const fetchInstituteSubjects = async () => {
  //   if (!selectedCourseId) {
  //     setInstituteSubjects([]);
  //     return;
  //   }

  //   const selectedCourse = courseOptions.find(
  //     (course) => Number(course.value) === Number(selectedCourseId),
  //   );

  //   if (!selectedCourse) {
  //     setInstituteSubjects([]);
  //     return;
  //   }

  //   try {
  //     const response = await getInstituteSubjectsByCourse(
  //       Number(selectedCourse.value),
  //       Number(selectedCourse.refCourseId),
  //     );

  //     console.log("GET INSTITUTE SUBJECTS RESPONSE:", response);

  //     const items = response?.items ?? response?.data ?? response ?? [];

  //     setInstituteSubjects(items);

  //     setInstitutePagination({
  //       pageNumber: 1,
  //       pageSize: institutePagination.pageSize,
  //       totalCount: items.length,
  //       totalPages: Math.ceil(items.length / institutePagination.pageSize),
  //       hasPrevious: false,
  //       hasNext: false,
  //     });
  //   } catch (error) {
  //     console.error("Failed to fetch institute subjects:", error);
  //     setInstituteSubjects([]);
  //   }
  // };
  // ============================================================
  // INITIAL MANAGE SUBJECT FETCH
  // ============================================================
  useEffect(() => {
    if (branchId == null) return;

    fetchSubjects(EMPTY_FILTERS, 1, pagination.pageSize, sortBy, sortDirection);
  }, [branchId]);
  // ============================================================
  // FETCH INSTITUTE SUBJECTS WHEN OPENING PAGE
  // ============================================================
  useEffect(() => {
    if (!location.state?.resetPage) return;

    setCurrentTablePage(1);

    fetchSubjects(filterValues, 1, pagination.pageSize);

    navigate(location.pathname, {
      replace: true,
      state: null,
    });
  }, [location.state]);
  useEffect(() => {
    const updatedSubjectId = location.state?.updatedSubjectId;

    if (!updatedSubjectId) return;

    const refreshUpdatedSubject = async () => {
      // Keep the current page and current filters
      await fetchSubjects(filterValues, currentTablePage, pagination.pageSize);

      // Clear navigation state so refresh doesn't happen again
      navigate(location.pathname, {
        replace: true,
        state: null,
      });
    };

    refreshUpdatedSubject();
  }, [location.state]);
  // ============================================================
  // INITIAL COURSE FETCH
  // Fetch ALL courses on first load
  // ============================================================

  useEffect(() => {
    if (branchId == null) return;

    fetchCourseOptions();

    if (isInstituteSubjectsRoute) {
      setSelectedCurriculumId(0);
      setSelectedCourseId(null);
      setInstituteCurrentTablePage(1);

      fetchInstituteSubjects(
        0,
        0,
        0,
        1,
        institutePagination.pageSize,
        instituteSortBy,
        instituteSortDirection,
      );
    }
  }, [branchId, isInstituteSubjectsRoute, fetchCourseOptions]);
  // ============================================================
  // SEARCH
  // ============================================================

  const handleSearchChange = (value: string) => {
    setSearchValue(value);

    setFilterValues((prev) => ({
      ...prev,
      subjectName: value,
    }));
  };

  const handleFilterChange = async (key: string, value: any) => {
    if (key === "curriculumId") {
      const curriculumId = Number(value) || 0;

      setFilterValues((prev) => ({
        ...prev,
        curriculumId: value,
        course: "",
      }));

      await fetchCourseOptions(curriculumId);

      return;
    }

    setFilterValues((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSearch = async () => {
    setCurrentTablePage(1);

    await fetchSubjects(filterValues, 1, pagination.pageSize);
  };

  const handleClear = async () => {
    setSearchValue("");
    setFilterValues(EMPTY_FILTERS);
    setCurrentTablePage(1);

    await fetchSubjects(EMPTY_FILTERS, 1, pagination.pageSize);
  };

  // ============================================================
  // NAVIGATION
  // ============================================================

  const openAdd = () => {
    navigate("add");
  };

  const openAddFromInst = () => {
    navigate("instsubjects");
  };
  const openexpToBranch = () => {
    navigate("expsubjects");
  };

  const openEdit = (subject: SubjectListType) => {
    console.log("EDIT SUBJECT:", subject);
    console.log("EDIT SUBJECT ID:", subject.subId);

    navigate(`edit/${subject.subId}`);
  };

  // ============================================================
  // DELETE
  // ============================================================
  // ============================================================
  // DELETE SUBJECT
  // ============================================================

  const handleDeleteSubject = async (subjectId: number) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this subject?",
    );

    if (!confirmed) return;

    try {
      await deleteSubject(subjectId);

      toast.success("Subject deleted successfully");

      // Remove only the deleted subject from the current table
      setSubjects((prevSubjects) =>
        prevSubjects.filter(
          (subject) => Number(subject.subId) !== Number(subjectId),
        ),
      );

      // Update total count only
      setPagination((prev) => ({
        ...prev,
        totalCount: Math.max(0, prev.totalCount - 1),
      }));
    } catch (error) {
      console.error("Failed to delete subject:", error);

      // toast.error("Failed to delete subject");
    }
  };
  // ============================================================
  // MANAGE SUBJECT PAGINATION
  // ============================================================

  const handleTablePageChange = async (page: number) => {
    setCurrentTablePage(page);

    await fetchSubjects(
      filterValues,
      page,
      pagination.pageSize,
      sortBy,
      sortDirection,
    );
  };

  const handlePageSizeChange = async (newPageSize: number) => {
    setCurrentTablePage(1);

    await fetchSubjects(filterValues, 1, newPageSize, sortBy, sortDirection);
  };

  // ============================================================
  // INSTITUTE SUBJECT PAGINATION
  // ============================================================
  const handleInstitutePageChange = async (page: number) => {
    const selectedCourse = courseOptions.find(
      (course) => Number(course.value) === Number(selectedCourseId),
    );

    setInstituteCurrentTablePage(page);

    await fetchInstituteSubjects(
      selectedCurriculumId,
      selectedCourseId ?? 0,
      selectedCourse?.refCourseId ?? 0,
      page,
      institutePagination.pageSize,
      instituteSortBy,
      instituteSortDirection,
    );
  };
  const handleInstitutePageSizeChange = async (newPageSize: number) => {
    const selectedCourse = courseOptions.find(
      (course) => Number(course.value) === Number(selectedCourseId),
    );

    setInstituteCurrentTablePage(1);

    await fetchInstituteSubjects(
      selectedCurriculumId,
      selectedCourseId ?? 0,
      selectedCourse?.refCourseId ?? 0,
      1,
      newPageSize,
      instituteSortBy,
      instituteSortDirection,
    );
  };

  // ============================================================
  // REFRESH MANAGE SUBJECTS
  // ============================================================

  const resetSubjectsPagination = async () => {
    setCurrentTablePage(1);

    await fetchSubjects(filterValues, 1, pagination.pageSize);
  };

  // ============================================================
  // ADD SELECTED INSTITUTE SUBJECTS
  // ============================================================

  const handleAddSubjects = async (subjectIds: number[]) => {
    try {
      const selectedCourse = courseOptions.find(
        (course) => Number(course.value) === Number(selectedCourseId),
      );

      const request = {
        courseId: selectedCourse ? Number(selectedCourse.value) : 0,
        refCourseId: selectedCourse?.refCourseId
          ? Number(selectedCourse.refCourseId)
          : 0,
        instSubIds: subjectIds,
        branchId: Number(branchId),
      };

      console.log("SUBMIT INSTITUTE SUBJECTS REQUEST:", request);

      await importSubject(request);

      toast.success("Subject(s) added successfully");

      await fetchSubjects(filterValues, 1, pagination.pageSize);

      navigate("/managesubjects");
    } catch (error) {
      console.error("Failed to import subjects:", error);
    }
  };
  // ============================================================
  // RENDER
  // ============================================================
  const handleSortChange = async (
    newSortBy: string | null,
    newSortDirection: "asc" | "desc" | null,
  ) => {
    setSortBy(newSortBy);
    setSortDirection(newSortDirection);
    setCurrentTablePage(1);

    await fetchSubjects(
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

    const selectedCourse = courseOptions.find(
      (course) => Number(course.value) === Number(selectedCourseId),
    );

    await fetchInstituteSubjects(
      selectedCurriculumId,
      selectedCourseId ?? 0,
      selectedCourse?.refCourseId ?? 0,
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

          <SubjectList
            subjects={subjects}
            fields={getFields(courseOptions, curriculumOptions)}
            openAdd={openAdd}
            openaddFromInst={openAddFromInst}
            openexpToBranch={openexpToBranch}
            onEdit={openEdit}
            onDelete={handleDeleteSubject}
            searchValue={searchValue}
            filterValues={filterValues}
            onSearchChange={handleSearchChange}
            onFilterChange={handleFilterChange}
            onSearch={handleSearch}
            onClear={handleClear}
            setCurrentPage={setCurrentPage}
            setSelectedSubject={setSelectedSubject}
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
          // =====================================================
          // MANAGE SUBJECTS
          // =====================================================

          subjects,

          currentTablePage,
          pageSize: pagination.pageSize,
          totalCount: pagination.totalCount,
          totalPages: pagination.totalPages,
          hasPrevious: pagination.hasPrevious,
          hasNext: pagination.hasNext,

          onPageChange: handleTablePageChange,

          onPageSizeChange: handlePageSizeChange,

          resetSubjectPagination: resetSubjectsPagination,

          // =====================================================
          // INSTITUTE SUBJECTS
          // =====================================================

          instituteSubjects,

          onAddSubject: handleAddSubjects,

          instituteCurrentTablePage,

          institutePageSize: institutePagination.pageSize,

          instituteTotalCount: institutePagination.totalCount,

          instituteTotalPages: institutePagination.totalPages,

          instituteHasPrevious: institutePagination.hasPrevious,

          instituteHasNext: institutePagination.hasNext,

          onInstitutePageChange: handleInstitutePageChange,

          onInstitutePageSizeChange: handleInstitutePageSizeChange,
          courseOptions,
          curriculumOptions,
          selectedCurriculumId,
          selectedCourseId,

          onCurriculumChange: handleCurriculumChange,
          courseSubjects,
          onCourseChange: handleCourseChange,
          instituteSortBy,
          instituteSortDirection,
          onInstituteSortChange: handleInstituteSortChange,
        }}
      />
    </div>
  );
}

export default ManageSubjects;
