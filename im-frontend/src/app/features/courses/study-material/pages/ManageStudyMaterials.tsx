import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import PageHeader from "../../../../components/common/PageHeader/PageHeader";
import StudyMaterialList from "../pages/StudyMaterialList";
import { studyMaterialFilterFields as initialFields } from "../constants";
import {
  getStudyMaterials,
  getCoursesApi,
  getSubjectsByCourseIdApi,
  deleteStudyMaterialApi,
  getStudyMaterialById,
  getTopicsBySubjectIdApi,
} from "../studyMaterialService";
import type {
  StudyMaterialDto,
  StudyMaterialSearchDto,
} from "../studyMaterialTypes";
import type { FilterField } from "../../../../components/common/SearchFilter/types";
import { getCurriculums } from "../../ManageCurriculum/curriculumService";
import {
  getCourses,
  getCourseSubjects,
  getInstituteCourse,
} from "../../ManageCourses/courseService";
import { getSubjects } from "../../ManageSubjects/subjectService";
import { getTopics } from "../../ManageTopics/topicService";

export function ManageStudyMaterials() {
  const navigate = useNavigate();
  const location = useLocation(); // 👈 Fixed: Missing useLocation hook

  const { instituteId } = useSelector((state: any) => state.auth || {});
  const branchId = useSelector((state: any) => state.branch?.branchId || 0);

  const [materials, setMaterials] = useState<StudyMaterialDto[]>([]);
  const [searchValue, setSearchValue] = useState("");
  const [fields, setFields] = useState<FilterField[]>(initialFields);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedInstituteCurriculumId, setSelectedInstituteCurriculumId] =
    useState<number>(0);

  const [selectedInstituteCourseId, setSelectedInstituteCourseId] =
    useState<number>(0);

  const [selectedInstituteSubjectId, setSelectedInstituteSubjectId] =
    useState<number>(0);

  const [selectedInstituteTopicId, setSelectedInstituteTopicId] =
    useState<number>(0);
  const [instituteStudyMaterials, setInstituteStudyMaterials] = useState<
    StudyMaterialDto[]
  >([]);

  const [instituteCurriculumOptions, setInstituteCurriculumOptions] = useState<
    { label: string; value: number }[]
  >([]);

  const [instituteCourseOptions, setInstituteCourseOptions] = useState<
    { label: string; value: number }[]
  >([]);

  const [instituteSubjectOptions, setInstituteSubjectOptions] = useState<
    { label: string; value: number }[]
  >([]);

  const [instituteTopicOptions, setInstituteTopicOptions] = useState<
    { label: string; value: number }[]
  >([]);

  const [instituteCurrentTablePage, setInstituteCurrentTablePage] = useState(1);

  const [institutePageSize, setInstitutePageSize] = useState(10);

  const [instituteTotalCount, setInstituteTotalCount] = useState(0);

  const [instituteTotalPages, setInstituteTotalPages] = useState(0);

  const [instituteHasPrevious, setInstituteHasPrevious] = useState(false);

  const [instituteHasNext, setInstituteHasNext] = useState(false);

  const [instituteSortBy, setInstituteSortBy] = useState<string>("");

  const [instituteSortDirection, setInstituteSortDirection] = useState<
    "asc" | "desc"
  >("asc");

  const onInstituteCurriculumChange = async (curriculumId: number) => {
    setSelectedInstituteCurriculumId(curriculumId);
    setSelectedInstituteCourseId(0);
    setSelectedInstituteSubjectId(0);
    setSelectedInstituteTopicId(0);

    setInstituteCourseOptions([]);
    setInstituteSubjectOptions([]);
    setInstituteTopicOptions([]);
    setInstituteCurrentTablePage(1);

    try {
      // Nothing selected -> fetch initial data
      if (!curriculumId) {
        await fetchInstituteStudyMaterials(0, 0, 0, 0, 1, institutePageSize);

        return;
      }

      // Curriculum selected -> fetch courses
      const response: any = await getCourses({
        courseName: "",
        status: 1,
        pageNumber: 1,
        pageSize: 1000,
        instituteId,
        branchId: 0,
        curriculumId,
      });

      const courseList = response?.items || [];

      const options = sortOptions(
        courseList.map((course: any) => ({
          label: course.course_Name || "",
          value: Number(course.courseId),
        })),
      );

      setInstituteCourseOptions(options);

      // Curriculum selected -> fetch study materials
      await fetchInstituteStudyMaterials(
        curriculumId,
        0,
        0,
        0,
        1,
        institutePageSize,
      );
    } catch (error) {
      console.error("Failed to fetch institute curriculum data:", error);
    }
  };
  const onInstitutePageSizeChange = async (size: number) => {
    setInstitutePageSize(size);
    setInstituteCurrentTablePage(1);

    await fetchInstituteStudyMaterials(
      selectedInstituteCurriculumId,
      selectedInstituteCourseId,
      selectedInstituteSubjectId,
      selectedInstituteTopicId,
      1,
      size,
    );
  };
  const onInstituteSortChange = async (
    sortKey: string | null,
    sortDirection: "asc" | "desc" | null,
  ) => {
    const newSortBy = sortKey || "";
    const newSortDirection = sortDirection || "asc";

    setInstituteSortBy(newSortBy);
    setInstituteSortDirection(newSortDirection);
    setInstituteCurrentTablePage(1);

    await fetchInstituteStudyMaterials(
      selectedInstituteCurriculumId,
      selectedInstituteCourseId,
      selectedInstituteSubjectId,
      selectedInstituteTopicId,
      1,
      institutePageSize,
      newSortBy,
      newSortDirection,
    );
  };
  const onInstituteCourseChange = async (courseId: number) => {
    setSelectedInstituteCourseId(courseId);
    setSelectedInstituteSubjectId(0);
    setSelectedInstituteTopicId(0);

    setInstituteSubjectOptions([]);
    setInstituteTopicOptions([]);
    setInstituteCurrentTablePage(1);

    try {
      // Course cleared -> fetch study materials for curriculum only
      if (!courseId) {
        await fetchInstituteStudyMaterials(
          selectedInstituteCurriculumId,
          0,
          0,
          0,
          1,
          institutePageSize,
        );

        return;
      }

      // Fetch subjects
      const response = await getSubjects({
        pageNumber: 1,
        pageSize: 1000,
        subjectName: "",
        crclmId: selectedInstituteCurriculumId,
        courseId,
        status: 1,
        branchId: 0,
        sortBy: null,
        sortDirection: null,
      });

      const subjectList = response?.items || [];

      const options = sortOptions(
        subjectList.map((subject: any) => ({
          label: subject.subName || "",
          value: Number(subject.subId),
        })),
      );

      setInstituteSubjectOptions(options);

      // Fetch study materials
      await fetchInstituteStudyMaterials(
        selectedInstituteCurriculumId,
        courseId,
        0,
        0,
        1,
        institutePageSize,
      );
    } catch (error) {
      console.error("Failed to fetch institute course data:", error);
    }
  };
  const fetchInstituteStudyMaterials = async (
    curriculumId: number,
    courseId: number,
    subjectId: number,
    topicId: number,
    pageNumber = 1,
    pageSize = institutePageSize,
    currentSortBy = instituteSortBy,
    currentSortDirection = instituteSortDirection,
  ) => {
    try {
      const response: any = await getStudyMaterials({
        branchId: 0,
        crclmId: curriculumId,
        courseId: courseId,
        subjectId: subjectId,
        topicId: topicId,
        status: 1,
        pageNumber,
        pageSize,
        sortBy: currentSortBy || null,
        sortDirection: currentSortDirection || null,
      });

      const items = response?.data?.items || response?.items || [];

      const totalCount =
        response?.data?.totalCount || response?.totalCount || 0;

      setInstituteStudyMaterials(items);
      setInstituteTotalCount(totalCount);

      const totalPages = Math.ceil(totalCount / pageSize);

      setInstituteTotalPages(totalPages);
      setInstituteHasPrevious(pageNumber > 1);
      setInstituteHasNext(pageNumber < totalPages);
    } catch (error) {
      console.error("Failed to fetch institute study materials:", error);

      setInstituteStudyMaterials([]);
      setInstituteTotalCount(0);
      setInstituteTotalPages(0);
      setInstituteHasPrevious(false);
      setInstituteHasNext(false);
    }
  };
  const fetchInitialInstituteStudyMaterials = async () => {
    try {
      const response: any = await getStudyMaterials({
        branchId: 0,
        crclmId: 0,
        courseId: 0,
        subjectId: 0,
        topicId: 0,
        status: 1,
        pageNumber: 1,
        pageSize: institutePageSize,
        sortBy: instituteSortBy || null,
        sortDirection: instituteSortDirection || null,
      });

      const items = response?.data?.items || response?.items || [];

      const totalCount =
        response?.data?.totalCount || response?.totalCount || 0;

      setInstituteStudyMaterials(items);
      setInstituteTotalCount(totalCount);

      const totalPages = Math.ceil(totalCount / institutePageSize);

      setInstituteTotalPages(totalPages);
      setInstituteHasPrevious(false);
      setInstituteHasNext(1 < totalPages);
    } catch (error) {
      console.error(
        "Failed to fetch initial institute study materials:",
        error,
      );

      setInstituteStudyMaterials([]);
      setInstituteTotalCount(0);
      setInstituteTotalPages(0);
      setInstituteHasPrevious(false);
      setInstituteHasNext(false);
    }
  };
  const onInstituteSubjectChange = async (subjectId: number) => {
    setSelectedInstituteSubjectId(subjectId);
    setSelectedInstituteTopicId(0);

    setInstituteTopicOptions([]);
    setInstituteCurrentTablePage(1);

    try {
      // Subject cleared -> fetch study materials for curriculum + course
      if (!subjectId) {
        await fetchInstituteStudyMaterials(
          selectedInstituteCurriculumId,
          selectedInstituteCourseId,
          0,
          0,
          1,
          institutePageSize,
        );

        return;
      }

      // Fetch topics
      const response = await getTopics({
        pageNumber: 1,
        pageSize: 1000,
        topicName: "",
        crclmId: selectedInstituteCurriculumId,
        courseId: selectedInstituteCourseId,
        subjectId,
        status: 1,
        branchId: 0,
        sortBy: null,
        sortDirection: null,
      });

      const topicList = response?.items || [];

      const options = sortOptions(
        topicList.map((topic: any) => ({
          label: topic.topicName || "",
          value: Number(topic.topicID),
        })),
      );

      setInstituteTopicOptions(options);

      // Fetch study materials
      await fetchInstituteStudyMaterials(
        selectedInstituteCurriculumId,
        selectedInstituteCourseId,
        subjectId,
        0,
        1,
        institutePageSize,
      );
    } catch (error) {
      console.error("Failed to fetch institute subject data:", error);
    }
  };
  const onInstituteTopicChange = async (topicId: number) => {
    setSelectedInstituteTopicId(topicId);
    setInstituteCurrentTablePage(1);

    await fetchInstituteStudyMaterials(
      selectedInstituteCurriculumId,
      selectedInstituteCourseId,
      selectedInstituteSubjectId,
      topicId || 0,
      1,
      institutePageSize,
    );
  };
  useEffect(() => {
    fetchInitialInstituteStudyMaterials();
  }, []);
  const initialFilterState: StudyMaterialSearchDto = {
    branchId: branchId,
    crclmId: 0,
    courseId: 0,
    subjectId: 0,
    studyMaterialHeading: "",
    status: 2,
    pageNumber: 1,
    pageSize: 10,
  };
  const openexpToBranch = () => {
    navigate("expstudymaterial");
  };
  const openInstituteStudyMaterial = () => {
    navigate("inststudymaterial");
  };
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [filterValues, setFilterValues] =
    useState<StudyMaterialSearchDto>(initialFilterState);
  const [appliedFilters, setAppliedFilters] =
    useState<StudyMaterialSearchDto>(initialFilterState);
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
  const sortOptions = (options: { label: string; value: number }[]) => {
    return [...options].sort((a, b) => {
      const aLabel = a.label.trim();
      const bLabel = b.label.trim();

      const aFirst = aLabel.charAt(0);
      const bFirst = bLabel.charAt(0);

      const aIsNumber = /^\d$/.test(aFirst);
      const bIsNumber = /^\d$/.test(bFirst);

      // Numbers first
      if (aIsNumber && !bIsNumber) return -1;
      if (!aIsNumber && bIsNumber) return 1;

      // Both start with numbers - compare only first digit
      if (aIsNumber && bIsNumber) {
        return Number(aFirst) - Number(bFirst);
      }

      // Both start with letters - alphabetical order
      return aLabel.localeCompare(bLabel, undefined, {
        sensitivity: "base",
      });
    });
  };
  const isChildRoute =
    location.pathname.endsWith("/add") ||
    location.pathname.includes("/edit/") ||
    location.pathname.includes("/expstudymaterial") ||
    location.pathname.includes("/inststudymaterial");
  useEffect(() => {
    const fetchCurriculums = async () => {
      try {
        const response = await getCurriculums({
          curriculumName: "",
          status: 2,
          pageNumber: 1,
          pageSize: 1000,
          branchId,
        });

        const curriculumList = Array.isArray(response?.items)
          ? response.items
          : [];

        const curriculumOptions = sortOptions(
          curriculumList.map((c: any) => ({
            label: c.CurriculumName || "",
            value: Number(c.CurriculumId),
          })),
        );

        setFields((prevFields) =>
          prevFields.map((field) =>
            field.key === "crclmId"
              ? { ...field, options: curriculumOptions }
              : field,
          ),
        );
      } catch (error) {
        console.error("Failed to fetch curriculums:", error);
      }
    };

    fetchCurriculums();
  }, [branchId]);
  useEffect(() => {
    const fetchInstituteCurriculums = async () => {
      try {
        const response = await getCurriculums({
          curriculumName: "",
          status: 1,
          pageNumber: 1,
          pageSize: 1000,
          branchId: 0,
        });

        const curriculumList = Array.isArray(response?.items)
          ? response.items
          : [];

        const options = sortOptions(
          curriculumList.map((c: any) => ({
            label: c.CurriculumName || "",
            value: Number(c.CurriculumId),
          })),
        );

        setInstituteCurriculumOptions(options);
      } catch (error) {
        console.error("Failed to fetch institute curriculums:", error);
      }
    };

    fetchInstituteCurriculums();
  }, []);

  const onInstitutePageChange = async (page: number) => {
    setInstituteCurrentTablePage(page);

    await fetchInstituteStudyMaterials(
      selectedInstituteCurriculumId,
      selectedInstituteCourseId,
      selectedInstituteSubjectId,
      selectedInstituteTopicId,
      page,
      institutePageSize,
    );
  };
  // Fetch Courses on load
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response: any = await getCoursesApi(instituteId, branchId);
        const rawData = response?.data?.data || response?.data || response;
        const courseList = Array.isArray(rawData) ? rawData : [];

        const courseOptions = sortOptions(
          courseList.map((c: any) => ({
            label: c.label || c.courseName || c.name || "",
            value: Number(c.value ?? c.courseId ?? c.id),
          })),
        );

        setFields((prevFields) =>
          prevFields.map((field) =>
            field.key === "courseId"
              ? { ...field, options: courseOptions }
              : field,
          ),
        );
      } catch (error) {
        console.error("Failed to fetch courses:", error);
      }
    };

    fetchCourses();
  }, [instituteId, branchId]);

  // Fetch Subjects when Course filter changes
  useEffect(() => {
    const selectedCourseId = filterValues.courseId;

    if (!selectedCourseId) {
      setFields((prevFields) =>
        prevFields.map((field) =>
          field.key === "subjectId"
            ? {
                ...field,
              }
            : field,
        ),
      );
      return;
    }

    const fetchSubjects = async () => {
      try {
        const response: any = await getSubjectsByCourseIdApi(
          Number(selectedCourseId),
        );
        const rawData = response?.data?.data || response?.data || response;
        const subjectList = Array.isArray(rawData) ? rawData : [];

        const subjectOptions = sortOptions(
          subjectList.map((s: any) => ({
            label: s.label || s.subjectName || s.name || "",
            value: Number(s.value ?? s.subjectId ?? s.id),
          })),
        );
        setFields((prevFields) =>
          prevFields.map((field) =>
            field.key === "subjectId"
              ? { ...field, options: subjectOptions, disabled: false }
              : field,
          ),
        );
      } catch (error) {
        console.error("Failed to fetch subjects:", error);
      }
    };

    fetchSubjects();
  }, [filterValues.courseId]);

  const fetchMaterials = async (
    filters: StudyMaterialSearchDto,
    pageNumber = 1,
    pageSize = 10,
    currentSortBy = sortBy,
    currentSortDirection = sortDirection,
  ) => {
    setLoading(true);
    try {
      const payload: StudyMaterialSearchDto = {
        ...filters,
        pageNumber,
        pageSize,
        studyMaterialHeading: searchValue || undefined,
        sortBy: currentSortBy,
        sortDirection: currentSortDirection,
      };

      const response: any = await getStudyMaterials(payload);
      const items = response?.data?.items || response?.items || [];
      const totalCount =
        response?.data?.totalCount || response?.totalCount || 0;

      setMaterials(items);

      const calculatedTotalPages = Math.ceil(totalCount / pageSize);

      setPagination({
        pageNumber: response?.data?.pageNumber || pageNumber,
        pageSize: response?.data?.pageSize || pageSize,
        totalCount: totalCount,
        totalPages: calculatedTotalPages,
        hasPrevious: pageNumber > 1,
        hasNext: pageNumber < calculatedTotalPages,
      });
    } catch (error) {
      console.error("Failed to fetch study materials:", error);
      setMaterials([]);
    } finally {
      setLoading(false);
    }
  };
  const refreshUpdatedStudyMaterial = async (id: number) => {
    try {
      const response: any = await getStudyMaterials({
        ...appliedFilters,
        pageNumber: currentTablePage,
        pageSize: pagination.pageSize,
      });

      const items = response?.data?.items || response?.items || [];

      const updatedMaterial = items.find(
        (material: StudyMaterialDto) =>
          Number(material.studymaterialId) === Number(id),
      );

      if (!updatedMaterial) return;

      setMaterials((prev) =>
        prev.map((material) =>
          Number(material.studymaterialId) === Number(id)
            ? updatedMaterial
            : material,
        ),
      );
    } catch (error) {
      console.error("Failed to refresh updated study material:", error);
    }
  };
  useEffect(() => {
    fetchMaterials(appliedFilters, 1, pagination.pageSize);
  }, []);
  useEffect(() => {
    const state = location.state as {
      resetPage?: boolean;
      updatedStudyMaterialId?: number;
    } | null;

    if (!state) return;

    // ADD → refresh entire list
    if (state.resetPage) {
      setCurrentTablePage(1);

      fetchMaterials(appliedFilters, 1, pagination.pageSize);

      navigate(location.pathname, {
        replace: true,
        state: null,
      });

      return;
    }

    // EDIT → update only the edited row
    if (state.updatedStudyMaterialId) {
      refreshUpdatedStudyMaterial(state.updatedStudyMaterialId);

      navigate(location.pathname, {
        replace: true,
        state: null,
      });
    }
  }, [location.state]);
  const handleSearchChange = (value: string) => {
    setSearchValue(value);
    setFilterValues((prev) => ({
      ...prev,
      studyMaterialHeading: value,
    }));
  };

  const handleFilterChange = (key: string, value: any) => {
    const numericKeys = [
      "status",
      "crclmId",
      "courseId",
      "subjectId",
      "branchId",
    ];
    const parsedValue = numericKeys.includes(key) ? Number(value) : value;

    if (key === "courseId") {
      setFilterValues((prev) => ({
        ...prev,
        courseId: parsedValue,
        subjectId: 0,
      }));
    } else {
      setFilterValues((prev) => ({
        ...prev,
        [key]: parsedValue,
      }));
    }
  };

  const handleSearch = async () => {
    setErrors({});
    setCurrentTablePage(1);
    setAppliedFilters(filterValues);
    await fetchMaterials(
      filterValues,
      1,
      pagination.pageSize,
      sortBy,
      sortDirection,
    );
  };

  const handleClear = async () => {
    setErrors({});
    setSearchValue("");
    setFilterValues(initialFilterState);
    setAppliedFilters(initialFilterState);
    setCurrentTablePage(1);
    await fetchMaterials(
      initialFilterState,
      1,
      pagination.pageSize,
      sortBy,
      sortDirection,
    );
  };

  const handleTablePageChange = async (page: number) => {
    setCurrentTablePage(page);
    await fetchMaterials(
      appliedFilters,
      page,
      pagination.pageSize,
      sortBy,
      sortDirection,
    );
  };

  const handlePageSizeChange = async (newPageSize: number) => {
    setCurrentTablePage(1);
    await fetchMaterials(appliedFilters, 1, newPageSize, sortBy, sortDirection);
  };

  const handleOpenAdd = () => {
    navigate("/managestudymaterial/add");
  };

  const handleEdit = (material: StudyMaterialDto) => {
    navigate(`/managestudymaterial/edit/${material.studymaterialId}`);
  };

  const handleDelete = async (id: number) => {
    try {
      setLoading(true);
      const response: any = await deleteStudyMaterialApi(id);

      const isSuccess = Boolean(
        response?.success ||
        response?.isSuccess ||
        response?.data?.success ||
        response?.data === true,
      );

      if (isSuccess || response) {
        toast.success(
          response?.message || "Study Material deleted successfully!",
        );
        await fetchMaterials(
          appliedFilters,
          currentTablePage,
          pagination.pageSize,
          sortBy,
          sortDirection,
        );
      } else {
        toast.error(response?.message || "Failed to delete study material.");
      }
    } catch (error: any) {
      console.error("Delete Error:", error);
      toast.error(
        error?.response?.data?.message || "Failed to delete study material.",
      );
    } finally {
      setLoading(false);
    }
  };
  const handleSortChange = async (
    newSortBy: string | null,
    newSortDirection: "asc" | "desc" | null,
  ) => {
    setSortBy(newSortBy);
    setSortDirection(newSortDirection);
    setCurrentTablePage(1);

    await fetchMaterials(
      appliedFilters,
      1,
      pagination.pageSize,
      newSortBy,
      newSortDirection,
    );
  };
  return (
    <div>
      {!isChildRoute && (
        <>
          <PageHeader
          // title="Add Study Material"
          // extraBreadcrumbs={[
          //   { label: "Courses", path: "/managecourses" },
          //   { label: "Manage Study Material", path: "/managestudymaterial" },
          // ]}
          />
          <StudyMaterialList
            loading={loading}
            fields={fields}
            materials={materials}
            searchValue={searchValue}
            filterValues={filterValues}
            errors={errors}
            onSearchChange={handleSearchChange}
            onFilterChange={handleFilterChange}
            onSearch={handleSearch}
            onClear={handleClear}
            openAdd={handleOpenAdd}
            onEdit={handleEdit}
            openexpToBranch={openexpToBranch}
            openInstituteStudyMaterial={openInstituteStudyMaterial}
            onDelete={handleDelete}
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
          instituteStudyMaterials,

          instituteCurriculumOptions,
          instituteCourseOptions,
          instituteSubjectOptions,
          instituteTopicOptions,

          onInstituteCurriculumChange,
          onInstituteCourseChange,
          onInstituteSubjectChange,
          onInstituteTopicChange,

          instituteCurrentTablePage,
          institutePageSize,
          instituteTotalCount,
          instituteTotalPages,
          instituteHasPrevious,
          instituteHasNext,

          onInstitutePageChange,
          onInstitutePageSizeChange,

          instituteSortBy,
          instituteSortDirection,
          onInstituteSortChange,
        }}
      />
    </div>
  );
}

export default ManageStudyMaterials;
