import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, Outlet } from "react-router-dom";
import { toast } from "react-toastify";

import PageHeader from "../../../../components/common/PageHeader/PageHeader";
import TopicList from "./TopicList";

import { useAppSelector } from "../../../../redux/hooks";

import type { Topic as TopicListType, InstituteTopics } from "../types";

import {
  getTopics,
  deleteTopic,
  getInstituteTopics,
  getTopicById,
} from "../topicService";
import {
  getCourses,
  getCourseSubjects,
} from "../../ManageCourses/courseService";

import { InstituteSubjectApi } from "../../ManageCourses/types";
import { getCurriculums } from "../../ManageCurriculum/curriculumService";
import { getSubjects } from "../../ManageSubjects/subjectService";

type Props = {
  setCurrentPage: (page: string) => void;
  setSelectedTopic: (topic: string) => void;
};
type FilterValues = {
  topicName: string;
  curriculumId: string | number;
  course: string;
  subject: string;
  status: string;
};
const EMPTY_FILTERS: FilterValues = {
  topicName: "",
  curriculumId: "",
  course: "",
  subject: "",
  status: "2",
};
export type TopicOutletContext = {
  instituteTopics: InstituteTopics[];
  instituteCurriculumOptions: {
    label: string;
    value: string | number;
  }[];

  onInstituteCurriculumChange: (value: string | number) => void;
  instituteCourseOptions: {
    label: string;
    value: string | number;
  }[];

  instituteSubjectOptions: {
    label: string;
    value: string | number;
  }[];

  onInstituteCourseChange: (value: string | number) => void;

  onInstituteSubjectChange: (value: string | number) => void;

  instituteCurrentTablePage: number;
  institutePageSize: number;
  instituteTotalCount: number;
  instituteTotalPages: number;
  instituteHasPrevious: boolean;
  instituteHasNext: boolean;

  onInstitutePageChange: (page: number) => void;
  onInstitutePageSizeChange: (size: number) => void;
  instituteSortBy: string | null;
  instituteSortDirection: "asc" | "desc" | null;

  onInstituteSortChange: (
    sortBy: string | null,
    sortDirection: "asc" | "desc" | null,
  ) => Promise<void>;
};

export function ManageTopics({ setCurrentPage, setSelectedTopic }: Props) {
  const navigate = useNavigate();
  const location = useLocation();

  // ============================================================
  // REDUX
  // ============================================================

  const branchId = useAppSelector((state) => state.branch.branchId);

  // ============================================================
  // NORMAL TOPIC LIST STATE
  // ============================================================

  const [topics, setTopics] = useState<TopicListType[]>([]);

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
  // ============================================================
  // INSTITUTE TOPIC STATE
  // ============================================================

  const [instituteTopics, setInstituteTopics] = useState<InstituteTopics[]>([]);
  const [instituteCurriculumOptions, setInstituteCurriculumOptions] = useState<
    { label: string; value: string | number }[]
  >([]);

  const lastInstituteCurriculumId = useRef<number | null>(null);
  const lastInstituteCourseId = useRef<number | null>(null);

  const [instituteCourseOptions, setInstituteCourseOptions] = useState<
    { label: string; value: string | number }[]
  >([]);

  const [instituteSubjectOptions, setInstituteSubjectOptions] = useState<
    { label: string; value: string | number }[]
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

  const lastInstituteSubjectId = useRef<number | null>(null);
  // ============================================================
  // CHILD ROUTE
  // ============================================================

  const isChildRoute =
    location.pathname.endsWith("/add") ||
    location.pathname.includes("/edit/") ||
    location.pathname.endsWith("/import") ||
    location.pathname.endsWith("/insttopics") ||
    location.pathname.endsWith("/exptopics");

  // ============================================================
  // NORMAL TOPIC COURSE / SUBJECT OPTIONS
  // ============================================================

  const [courseOptions, setCourseOptions] = useState<
    { label: string; value: string | number }[]
  >([]);

  const [subjectOptions, setSubjectOptions] = useState<
    { label: string; value: string | number }[]
  >([]);
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
  }, [branchId]);
  const fetchCourseOptions = async (curriculumId: number = 0) => {
    if (branchId == null) return;

    try {
      const response = await getCourses({
        courseName: "",
        status: 1,
        curriculumId,
        pageNumber: 1,
        pageSize: 1000,
        branchId: Number(branchId),
      });

      const options =
        response.items?.map((course) => ({
          label: course.course_Name,
          value: course.courseId,
        })) ?? [];

      setCourseOptions(options);
    } catch (error) {
      console.error("Failed to fetch courses:", error);
      setCourseOptions([]);
    }
  };
  const fetchAllSubjectOptions = async () => {
    if (branchId == null) return;

    try {
      const response = await getSubjects({
        pageNumber: 1,
        pageSize: 1000,
        subjectName: "",
        crclmId: 0,
        courseId: 0,
        status: 1,
        branchId: Number(branchId),
      });

      const options =
        response.items?.map((subject) => ({
          label: subject.subName,
          value: subject.subId,
        })) ?? [];

      setSubjectOptions(options);
    } catch (error) {
      console.error("Failed to fetch subjects:", error);
      setSubjectOptions([]);
    }
  };
  useEffect(() => {
    if (branchId == null) return;

    fetchAllSubjectOptions();
  }, [branchId]);
  useEffect(() => {
    if (branchId == null) return;

    const curriculumId =
      filterValues.curriculumId && Number(filterValues.curriculumId) > 0
        ? Number(filterValues.curriculumId)
        : 0;

    fetchCourseOptions(curriculumId);
  }, [branchId, filterValues.curriculumId]);
  // ============================================================
  // NORMAL TOPIC FILTER CHANGE
  // ============================================================

  const handleFilterValueChange = async (key: string, value: any) => {
    if (key === "curriculumId") {
      setFilterValues((prev) => ({
        ...prev,
        curriculumId: value,
        course: "",
        subject: "",
      }));

      setSubjectOptions([]);

      return;
    }

    if (key === "course") {
      setFilterValues((prev) => ({
        ...prev,
        course: String(value),
        subject: "",
      }));

      setSubjectOptions([]);

      if (!value || branchId == null) {
        return;
      }

      try {
        const response = await getCourseSubjects({
          courseIds: [Number(value)],
          branchId: Number(branchId),
          pageNumber: 1,
          pageSize: 1000,
        });

        const options =
          response.items?.map((subject: InstituteSubjectApi) => ({
            label: subject.sub_Name,
            value: subject.subId,
          })) ?? [];

        setSubjectOptions(options);
      } catch (error) {
        console.error("Failed to fetch subjects:", error);
        setSubjectOptions([]);
      }

      return;
    }

    setFilterValues((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  // ============================================================
  // NORMAL TOPIC FETCH
  // ============================================================

  const fetchTopics = async (
    filters: FilterValues,
    pageNumber = 1,
    pageSize = 10,
    currentSortBy = sortBy,
    currentSortDirection = sortDirection,
  ) => {
    if (branchId == null) {
      console.log("No branch/institute context:", branchId);
      return;
    }

    try {
      const request = {
        pageNumber,
        pageSize,
        topicName: filters.topicName,
        crclmId: filters.curriculumId ? Number(filters.curriculumId) : 0,
        courseId: filters.course ? Number(filters.course) : 0,
        subjectId: filters.subject ? Number(filters.subject) : 0,
        status: filters.status ? Number(filters.status) : 2,
        branchId: Number(branchId),
        sortBy: currentSortBy,
        sortDirection: currentSortDirection,
      };

      console.log("FETCH TOPICS REQUEST:", request);

      const response = await getTopics(request);

      console.log("GET TOPICS RESPONSE:", response);

      setTopics(response.items ?? []);

      setPagination({
        pageNumber: response.pageNumber,
        pageSize: response.pageSize,
        totalCount: response.totalCount,
        totalPages: response.totalPages,
        hasPrevious: response.hasPrevious,
        hasNext: response.hasNext,
      });
    } catch (error) {
      console.error("Failed to fetch topics:", error);

      setTopics([]);
    }
  };

  const handleCourseChange = async (value: string | number) => {
    await handleFilterValueChange("course", value);
  };

  const handleSubjectChange = async (value: string | number) => {
    await handleFilterValueChange("subject", value);
  };

  // ============================================================
  // NORMAL TOPIC INITIAL FETCH
  // ============================================================
  // ============================================================
  // REFRESH AFTER ADD
  // ============================================================

  useEffect(() => {
    if (!location.state?.resetPage) return;

    const refreshAfterAdd = async () => {
      setCurrentTablePage(1);
      setSearchValue("");
      setFilterValues(EMPTY_FILTERS);

      await fetchTopics(EMPTY_FILTERS, 1, pagination.pageSize);

      navigate(location.pathname, {
        replace: true,
        state: null,
      });
    };

    refreshAfterAdd();
  }, [location.state]);
  useEffect(() => {
    if (branchId == null) return;

    setCurrentTablePage(1);

    fetchTopics(EMPTY_FILTERS, 1, pagination.pageSize);
  }, [branchId]);
  useEffect(() => {
    if (branchId == null) return;

    const fetchInstituteCurriculums = async () => {
      try {
        const response = await getCurriculums({
          curriculumName: "",
          status: 1,
          pageNumber: 1,
          pageSize: 1000,
          branchId: 0,
        });

        const options =
          response.items?.map((curriculum) => ({
            label: curriculum.CurriculumName,
            value: curriculum.CurriculumId,
          })) ?? [];

        setInstituteCurriculumOptions(options);
      } catch (error) {
        console.error("Failed to fetch institute curriculums:", error);
        setInstituteCurriculumOptions([]);
      }
    };

    fetchInstituteCurriculums();
  }, [branchId]);
  useEffect(() => {
    if (branchId == null) return;

    const fetchInstituteSubjects = async () => {
      try {
        const response = await getSubjects({
          pageNumber: 1,
          pageSize: 1000,
          subjectName: "",
          crclmId: 0,
          courseId: 0,
          status: 1,
          branchId: 0,
        });

        const options =
          response.items?.map((subject) => ({
            label: subject.subName,
            value: subject.subId,
          })) ?? [];

        setInstituteSubjectOptions(options);
      } catch (error) {
        console.error("Failed to fetch institute subjects:", error);
        setInstituteSubjectOptions([]);
      }
    };

    fetchInstituteSubjects();
  }, [branchId]);
  useEffect(() => {
    if (branchId == null) return;
    if (!location.pathname.endsWith("/insttopics")) return;

    lastInstituteCurriculumId.current = null;
    lastInstituteCourseId.current = null;
    lastInstituteSubjectId.current = null;

    fetchInstituteTopics(
      0,
      0,
      0,
      1,
      institutePagination.pageSize,
      instituteSortBy,
      instituteSortDirection,
    );
  }, [branchId, location.pathname]);
  // ============================================================
  // INSTITUTE COURSES
  // ============================================================

  useEffect(() => {
    if (branchId == null) return;

    const fetchInstituteCourses = async () => {
      try {
        const response = await getCourses({
          courseName: "",
          status: 1,
          pageNumber: 1,
          pageSize: 1000,

          // Institute level
          branchId: 0,
        });

        const options =
          response.items
            ?.filter(
              (course) => String(course.status).toLowerCase() !== "inactive",
            )
            .map((course) => ({
              label: course.course_Name,
              value: course.courseId,
            })) ?? [];

        setInstituteCourseOptions(options);
      } catch (error) {
        console.error("Failed to fetch institute courses:", error);

        setInstituteCourseOptions([]);
      }
    };

    fetchInstituteCourses();
  }, [branchId]);
  const handleInstituteCurriculumChange = async (value: string | number) => {
    const curriculumId = Number(value) || 0;

    lastInstituteCurriculumId.current = curriculumId || null;
    lastInstituteCourseId.current = null;
    lastInstituteSubjectId.current = null;

    setInstituteCurrentTablePage(1);

    // Curriculum cleared
    if (!curriculumId) {
      // Reload ALL institute courses
      try {
        const response = await getCourses({
          courseName: "",
          status: 1,
          pageNumber: 1,
          pageSize: 1000,
          branchId: 0,
        });

        const options =
          response.items
            ?.filter(
              (course) => String(course.status).toLowerCase() !== "inactive",
            )
            .map((course) => ({
              label: course.course_Name,
              value: course.courseId,
            })) ?? [];

        setInstituteCourseOptions(options);
      } catch (error) {
        console.error("Failed to fetch institute courses:", error);
        setInstituteCourseOptions([]);
      }

      // Reload ALL institute subjects
      try {
        const response = await getSubjects({
          pageNumber: 1,
          pageSize: 1000,
          subjectName: "",
          crclmId: 0,
          courseId: 0,
          status: 1,
          branchId: 0,
        });

        const options =
          response.items?.map((subject) => ({
            label: subject.subName,
            value: subject.subId,
          })) ?? [];

        setInstituteSubjectOptions(options);
      } catch (error) {
        console.error("Failed to fetch institute subjects:", error);
        setInstituteSubjectOptions([]);
      }

      // Show ALL topics
      await fetchInstituteTopics(
        0,
        0,
        0,
        1,
        institutePagination.pageSize,
        instituteSortBy,
        instituteSortDirection,
      );

      return;
    }

    // Curriculum selected
    try {
      // Get courses belonging to selected curriculum
      const response = await getCourses({
        courseName: "",
        status: 1,
        curriculumId,
        pageNumber: 1,
        pageSize: 1000,
        branchId: 0,
      });

      const options =
        response.items
          ?.filter(
            (course) => String(course.status).toLowerCase() !== "inactive",
          )
          .map((course) => ({
            label: course.course_Name,
            value: course.courseId,
          })) ?? [];

      setInstituteCourseOptions(options);
    } catch (error) {
      console.error("Failed to fetch institute courses:", error);
      setInstituteCourseOptions([]);
    }

    // Get subjects belonging to selected curriculum
    try {
      const response = await getSubjects({
        pageNumber: 1,
        pageSize: 1000,
        subjectName: "",
        crclmId: curriculumId,
        courseId: 0,
        status: 1,
        branchId: 0,
      });

      const options =
        response.items?.map((subject) => ({
          label: subject.subName,
          value: subject.subId,
        })) ?? [];

      setInstituteSubjectOptions(options);
    } catch (error) {
      console.error("Failed to fetch institute subjects:", error);
      setInstituteSubjectOptions([]);
    }

    // Filter topics by curriculum
    await fetchInstituteTopics(
      curriculumId,
      0,
      0,
      1,
      institutePagination.pageSize,
      instituteSortBy,
      instituteSortDirection,
    );
  };
  // ============================================================
  // INSTITUTE COURSE CHANGE
  // ============================================================

  const handleInstituteCourseChange = async (value: string | number) => {
    const courseId = Number(value) || 0;

    const curriculumId = lastInstituteCurriculumId.current ?? 0;

    lastInstituteCourseId.current = courseId || null;
    lastInstituteSubjectId.current = null;

    setInstituteCurrentTablePage(1);

    // ============================================================
    // COURSE CLEARED
    // ============================================================

    if (!courseId) {
      // Reload subjects for selected curriculum
      try {
        const response = await getSubjects({
          pageNumber: 1,
          pageSize: 1000,
          subjectName: "",
          crclmId: curriculumId,
          courseId: 0,
          status: 1,
          branchId: 0,
        });

        const options =
          response.items?.map((subject) => ({
            label: subject.subName,
            value: subject.subId,
          })) ?? [];

        setInstituteSubjectOptions(options);
      } catch (error) {
        console.error("Failed to fetch institute subjects:", error);
        setInstituteSubjectOptions([]);
      }

      // Topics filtered only by curriculum
      await fetchInstituteTopics(
        curriculumId,
        0,
        0,
        1,
        institutePagination.pageSize,
        instituteSortBy,
        instituteSortDirection,
      );

      return;
    }

    // ============================================================
    // COURSE SELECTED
    // ============================================================

    try {
      // Get subjects for selected course
      const response = await getCourseSubjects({
        courseIds: [courseId],
        branchId: 0,
        pageNumber: 1,
        pageSize: 1000,
      });

      const options =
        response.items?.map((subject: InstituteSubjectApi) => ({
          label: subject.sub_Name,
          value: subject.subId,
        })) ?? [];

      setInstituteSubjectOptions(options);

      // Topics filtered by curriculum + course
      await fetchInstituteTopics(
        curriculumId,
        courseId,
        0,
        1,
        institutePagination.pageSize,
        instituteSortBy,
        instituteSortDirection,
      );
    } catch (error) {
      console.error("Failed to fetch institute course/subjects/topics:", error);

      setInstituteSubjectOptions([]);
      setInstituteTopics([]);
    }
  };
  // useEffect(() => {
  //   if (branchId == null) return;
  //   if (!location.pathname.endsWith("/insttopics")) return;

  //   const fetchInitialInstituteTopics = async () => {
  //     try {
  //       const response = await getInstituteTopics({
  //         courseId: 0,
  //         subjectId: 0,
  //         branchId: Number(branchId),
  //       });

  //       console.log("GET INITIAL INSTITUTE TOPICS RESPONSE:", response);

  //       lastInstituteCourseId.current = null;

  //       setInstituteSubjectOptions([]);
  //       setInstituteTopics(response?.items ?? response?.data ?? []);

  //       setInstituteCurrentTablePage(1);

  //       setInstitutePagination({
  //         pageNumber: response?.pageNumber ?? 1,
  //         pageSize: response?.pageSize ?? 10,
  //         totalCount: response?.totalCount ?? 0,
  //         totalPages: response?.totalPages ?? 0,
  //         hasPrevious: response?.hasPrevious ?? false,
  //         hasNext: response?.hasNext ?? false,
  //       });
  //     } catch (error) {
  //       console.error("Failed to fetch initial institute topics:", error);

  //       setInstituteTopics([]);
  //       setInstituteSubjectOptions([]);
  //     }
  //   };

  //   fetchInitialInstituteTopics();
  // }, [branchId, location.pathname]);

  // ============================================================
  // INSTITUTE SUBJECT CHANGE
  // ============================================================

  // const handleInstituteSubjectChange = async (value: string | number) => {
  //   const subjectId = Number(value);
  //   lastInstituteSubjectId.current = subjectId;
  //   setInstituteCurrentTablePage(1);

  //   // Clear topics if subject is cleared
  //   if (!value || !subjectId) {
  //     setInstituteTopics([]);

  //     setInstitutePagination((prev) => ({
  //       ...prev,
  //       pageNumber: 1,
  //       totalCount: 0,
  //       totalPages: 0,
  //       hasPrevious: false,
  //       hasNext: false,
  //     }));

  //     return;
  //   }

  //   // Get currently selected institute course
  //   const courseId = lastInstituteCourseId.current;

  //   if (!courseId) {
  //     console.warn("No institute course selected");
  //     setInstituteTopics([]);
  //     return;
  //   }

  //   try {
  //     await fetchInstituteTopics(
  //       courseId,
  //       subjectId,
  //       1,
  //       institutePagination.pageSize,
  //       instituteSortBy,
  //       instituteSortDirection,
  //     );

  //     // console.log("GET INSTITUTE TOPICS RESPONSE:", response);

  //     //setInstituteTopics(response?.items ?? response?.data ?? []);

  //     // setInstitutePagination({
  //     //   pageNumber: response?.pageNumber ?? 1,
  //     //   pageSize: response?.pageSize ?? institutePagination.pageSize,
  //     //   totalCount: response?.totalCount ?? 0,
  //     //   totalPages: response?.totalPages ?? 0,
  //     //   hasPrevious: response?.hasPrevious ?? false,
  //     //   hasNext: response?.hasNext ?? false,
  //     // });
  //   } catch (error) {
  //     console.error("Failed to fetch institute topics:", error);

  //     setInstituteTopics([]);

  //     setInstitutePagination((prev) => ({
  //       ...prev,
  //       pageNumber: 1,
  //       totalCount: 0,
  //       totalPages: 0,
  //       hasPrevious: false,
  //       hasNext: false,
  //     }));
  //   }
  // };

  const handleInstituteSubjectChange = async (value: string | number) => {
    const subjectId = Number(value) || 0;

    lastInstituteSubjectId.current = subjectId;
    setInstituteCurrentTablePage(1);

    const curriculumId = lastInstituteCurriculumId.current ?? 0;
    const courseId = lastInstituteCourseId.current ?? 0;

    if (!subjectId) {
      await fetchInstituteTopics(
        curriculumId,
        courseId,
        0,
        1,
        institutePagination.pageSize,
        instituteSortBy,
        instituteSortDirection,
      );
      return;
    }

    await fetchInstituteTopics(
      curriculumId,
      courseId,
      subjectId,
      1,
      institutePagination.pageSize,
      instituteSortBy,
      instituteSortDirection,
    );
  };

  // ============================================================
  // UPDATE ONLY THE EDITED TOPIC ROW
  // ============================================================

  // ============================================================
  // UPDATE ONLY THE EDITED TOPIC ROW
  // ============================================================

  useEffect(() => {
    const updatedTopicId = location.state?.updatedTopicId;

    if (!updatedTopicId) return;

    const refreshUpdatedTopic = async () => {
      try {
        const response = await getTopicById(Number(updatedTopicId));

        const updatedTopic = {
          ...response.data,
          topicID: Number(
            response.data?.topicID ?? response.data?.topicId ?? updatedTopicId,
          ),
        };

        setTopics((prevTopics) =>
          prevTopics.map((topic) =>
            Number(topic.topicID) === Number(updatedTopic.topicID)
              ? {
                  ...topic,
                  ...updatedTopic,
                }
              : topic,
          ),
        );
      } catch (error) {
        console.error("Failed to refresh updated topic:", error);
      } finally {
        // Clear navigation state
        navigate(location.pathname, {
          replace: true,
          state: null,
        });
      }
    };

    refreshUpdatedTopic();
  }, [location.state, navigate, location.pathname]);
  // ============================================================
  // SEARCH
  // ============================================================

  const handleSearchChange = (value: string) => {
    setSearchValue(value);

    setFilterValues((prev) => ({
      ...prev,
      topicName: value,
    }));
  };

  const handleSearch = async () => {
    setCurrentTablePage(1);

    await fetchTopics(filterValues, 1, pagination.pageSize);
  };

  const handleClear = async () => {
    setSearchValue("");

    setFilterValues(EMPTY_FILTERS);

    setCurrentTablePage(1);

    await fetchTopics(EMPTY_FILTERS, 1, pagination.pageSize);
  };

  // ============================================================
  // NAVIGATION
  // ============================================================

  const openAdd = () => {
    navigate("add");
  };

  const openEdit = (topic: TopicListType) => {
    console.log("EDIT TOPIC:", topic);

    console.log("EDIT TOPIC ID:", topic.topicID);

    navigate(`edit/${topic.topicID}`);
  };

  const openImport = () => {
    navigate("import");
  };
  const openInstituteTopics = () => {
    navigate("insttopics");
  };
  const openexpToBranch = () => {
    navigate("exptopics");
  };

  // ============================================================
  // DELETE
  // ============================================================

  const handleDeleteTopic = async (topicId: number) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this topic?",
    );

    if (!confirmed) return;

    try {
      await deleteTopic(topicId);

      toast.success("Topic deleted successfully");

      setTopics((prevTopics) =>
        prevTopics.filter((topic) => Number(topic.topicID) !== Number(topicId)),
      );

      setPagination((prev) => ({
        ...prev,
        totalCount: Math.max(0, prev.totalCount - 1),
      }));
    } catch (error) {
      console.error("Failed to delete topic:", error);

      // toast.error("Failed to delete topic");
    }
  };

  // ============================================================
  // NORMAL TOPIC PAGINATION
  // ============================================================

  const handleTablePageChange = async (page: number) => {
    setCurrentTablePage(page);

    await fetchTopics(
      filterValues,
      page,
      pagination.pageSize,
      sortBy,
      sortDirection,
    );
  };

  const handlePageSizeChange = async (newPageSize: number) => {
    setCurrentTablePage(1);

    await fetchTopics(filterValues, 1, newPageSize, sortBy, sortDirection);
  };

  // ============================================================
  // INSTITUTE PAGINATION
  // ============================================================
  const handleInstituteTablePageChange = async (page: number) => {
    setInstituteCurrentTablePage(page);

    await fetchInstituteTopics(
      lastInstituteCurriculumId.current ?? 0,
      lastInstituteCourseId.current ?? 0,
      lastInstituteSubjectId.current ?? 0,
      page,
      institutePagination.pageSize,
      instituteSortBy,
      instituteSortDirection,
    );
  };
  const handleInstitutePageSizeChange = async (newPageSize: number) => {
    setInstituteCurrentTablePage(1);

    await fetchInstituteTopics(
      lastInstituteCurriculumId.current ?? 0,
      lastInstituteCourseId.current ?? 0,
      lastInstituteSubjectId.current ?? 0,
      1,
      newPageSize,
      instituteSortBy,
      instituteSortDirection,
    );
  };
  const handleSortChange = async (
    newSortBy: string | null,
    newSortDirection: "asc" | "desc" | null,
  ) => {
    setSortBy(newSortBy);
    setSortDirection(newSortDirection);
    setCurrentTablePage(1);

    await fetchTopics(
      filterValues,
      1,
      pagination.pageSize,
      newSortBy,
      newSortDirection,
    );
  };
  const fetchInstituteTopics = async (
    crclmId: number,
    courseId: number,
    subjectId: number,
    pageNumber = 1,
    pageSize = institutePagination.pageSize,
    currentSortBy = instituteSortBy,
    currentSortDirection = instituteSortDirection,
  ) => {
    try {
      const response = await getInstituteTopics({
        courseId,
        subjectId,
        crclmId,
        branchId: 0,
        pageNumber,
        pageSize,
        sortBy: currentSortBy,
        sortDirection: currentSortDirection,
      });

      const data = response?.data ?? response;

      setInstituteTopics(data?.items ?? []);

      setInstitutePagination({
        pageNumber: data?.pageNumber ?? pageNumber,
        pageSize: data?.pageSize ?? pageSize,
        totalCount: data?.totalCount ?? 0,
        totalPages: data?.totalPages ?? 0,
        hasPrevious: data?.hasPrevious ?? false,
        hasNext: data?.hasNext ?? false,
      });
    } catch (error) {
      console.error("Failed to fetch institute topics:", error);
      setInstituteTopics([]);
    }
  };
  const handleInstituteSortChange = async (
    newSortBy: string | null,
    newSortDirection: "asc" | "desc" | null,
  ) => {
    setInstituteSortBy(newSortBy);
    setInstituteSortDirection(newSortDirection);
    setInstituteCurrentTablePage(1);

    await fetchInstituteTopics(
      lastInstituteCurriculumId.current ?? 0,
      lastInstituteCourseId.current ?? 0,
      lastInstituteSubjectId.current ?? 0,
      1,
      institutePagination.pageSize,
      newSortBy,
      newSortDirection,
    );
  };
  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div>
      {!isChildRoute && (
        <>
          <PageHeader />

          <TopicList
            topics={topics}
            courseOptions={courseOptions}
            subjectOptions={subjectOptions}
            curriculumOptions={curriculumOptions}
            onValueChange={handleFilterValueChange}
            openAdd={openAdd}
            onEdit={openEdit}
            openImport={openImport}
            openInstituteTopics={openInstituteTopics}
            openexpToBranch={openexpToBranch}
            onDelete={handleDeleteTopic}
            searchValue={searchValue}
            filterValues={filterValues}
            onSearchChange={handleSearchChange}
            onSearch={handleSearch}
            onClear={handleClear}
            setCurrentPage={setCurrentPage}
            setSelectedTopic={setSelectedTopic}
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
          instituteTopics,

          instituteCurriculumOptions,
          onInstituteCurriculumChange: handleInstituteCurriculumChange,

          instituteCourseOptions,
          instituteSubjectOptions,

          onInstituteCourseChange: handleInstituteCourseChange,

          onInstituteSubjectChange: handleInstituteSubjectChange,

          instituteCurrentTablePage,

          institutePageSize: institutePagination.pageSize,

          instituteTotalCount: institutePagination.totalCount,

          instituteTotalPages: institutePagination.totalPages,

          instituteHasPrevious: institutePagination.hasPrevious,

          instituteHasNext: institutePagination.hasNext,

          onInstitutePageChange: handleInstituteTablePageChange,

          onInstitutePageSizeChange: handleInstitutePageSizeChange,
          instituteSortBy,
          instituteSortDirection,
          onInstituteSortChange: handleInstituteSortChange,
        }}
      />
    </div>
  );
}

export default ManageTopics;
