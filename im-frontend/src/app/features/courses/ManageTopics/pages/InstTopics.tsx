// import { useEffect, useState } from "react";
// import { useNavigate, useOutletContext } from "react-router-dom";
// import { X } from "lucide-react";
// import { FormProvider, useForm } from "react-hook-form";

// import PageHeader from "../../../../components/common/PageHeader/PageHeader";
// import DataTable from "../../../../components/common/DataTable/Datatable";
// import Pagination from "../../../../components/common/DataTable/TablePagination";
// import { Dropdown } from "../../../../components/common/Select";

// import { getInstituteTopicColumns } from "../columns";
// import { TopicOutletContext } from "./ManageTopics";
// import { useAppSelector } from "../../../../redux/hooks";
// import { toast } from "react-toastify";
// import { addTopicsFromInstitute } from "../topicService";

// export const InstTopics = () => {
//   const methods = useForm({
//     defaultValues: {
//       courseId: "",
//       subjectId: "",
//     },
//   });

//   const { watch, setValue } = methods;

//   const selectedCourse = watch("courseId");
//   const selectedSubject = watch("subjectId");

//   const {
//     instituteTopics,
//     instituteCourseOptions,
//     instituteSubjectOptions,

//     onInstituteCourseChange,
//     onInstituteSubjectChange,

//     instituteCurrentTablePage,
//     institutePageSize,
//     instituteTotalCount,
//     instituteTotalPages,
//     instituteHasPrevious,
//     instituteHasNext,

//     onInstitutePageChange,
//     onInstitutePageSizeChange,
//   } = useOutletContext<TopicOutletContext>();

//   const navigate = useNavigate();
//   const branchId = useAppSelector((state) => state.branch.branchId);
//   const [selectedTopicIds, setSelectedTopicIds] = useState<number[]>([]);

//   // ============================================================
//   // COURSE CHANGE
//   // ============================================================
//   const handleAddTopic = async () => {
//     if (selectedTopicIds.length === 0) {
//       return;
//     }

//     try {
//       const payload = {
//         topicIds: selectedTopicIds,
//         branchId,
//       };

//       const response = await addTopicsFromInstitute(payload);

//       if (response?.statusCode === 200 || response?.status === "success") {
//         toast.success("Topics added successfully.");

//         setSelectedTopicIds([]);
//         navigate("..", {
//           state: {
//             resetPage: true,
//           },
//         });
//       }
//     } catch (error) {
//       console.error("Error adding topics:", error);
//     }
//   };
//   useEffect(() => {
//     if (!selectedCourse) {
//       setValue("subjectId", "");
//       setSelectedTopicIds([]);
//       return;
//     }

//     const selectedOption = instituteCourseOptions.find(
//       (course) => String(course.value) === String(selectedCourse),
//     );

//     if (!selectedOption) {
//       return;
//     }

//     // Clear previously selected subject and topics
//     setValue("subjectId", "");
//     setSelectedTopicIds([]);

//     onInstituteCourseChange(Number(selectedOption.value));
//   }, [
//     selectedCourse,
//     instituteCourseOptions,
//     onInstituteCourseChange,
//     setValue,
//   ]);

//   // ============================================================
//   // SUBJECT CHANGE
//   // ============================================================

//   useEffect(() => {
//     if (!selectedSubject) {
//       setSelectedTopicIds([]);
//       return;
//     }

//     const selectedOption = instituteSubjectOptions.find(
//       (subject) => String(subject.value) === String(selectedSubject),
//     );

//     if (!selectedOption) {
//       return;
//     }

//     setSelectedTopicIds([]);

//     onInstituteSubjectChange(Number(selectedOption.value));
//   }, [selectedSubject, instituteSubjectOptions, onInstituteSubjectChange]);

//   // ============================================================
//   // SELECT TOPIC
//   // ============================================================

//   const handleSelectTopic = (id: number) => {
//     setSelectedTopicIds((prev) =>
//       prev.includes(id)
//         ? prev.filter((topicId) => topicId !== id)
//         : [...prev, id],
//     );
//   };

//   // ============================================================
//   // SELECT ALL
//   // ============================================================

//   const handleSelectAll = () => {
//     const selectableIds = instituteTopics.map((topic) => topic.topicId);

//     const allSelected =
//       selectableIds.length > 0 &&
//       selectableIds.every((id) => selectedTopicIds.includes(id));

//     if (allSelected) {
//       setSelectedTopicIds([]);
//     } else {
//       setSelectedTopicIds(selectableIds);
//     }
//   };

//   // ============================================================
//   // COLUMNS
//   // ============================================================

//   const columns = getInstituteTopicColumns({
//     selectedTopicIds,
//     topics: instituteTopics,
//     onSelect: handleSelectTopic,
//     onSelectAll: handleSelectAll,
//   });

//   // ============================================================
//   // RENDER
//   // ============================================================

//   return (
//     <FormProvider {...methods}>
//       <div className="space-y-4">
//         <PageHeader
//           title="Manage Topics"
//           description="Select a course and subject to manage topics"
//           extraBreadcrumbs={[
//             {
//               label: "Import topics form institute",
//             },
//           ]}
//         />

//         {/* Course & Subject Filters */}
//         <div className="bg-white border border-gray-200 rounded-2xl p-4">
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             <Dropdown
//               name="courseId"
//               label="Course/Class Name"
//               required
//               options={instituteCourseOptions}
//             />

//             <Dropdown
//               name="subjectId"
//               label="Subject Name"
//               required
//               options={instituteSubjectOptions}
//               disabled={!selectedCourse}
//             />
//           </div>
//         </div>

//         {/* Topics Table */}
//         <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
//           <div className="overflow-x-auto">
//             <DataTable
//               columns={columns}
//               data={instituteTopics}
//               rowKey="topicId"
//               emptyMessage={
//                 selectedSubject
//                   ? "No Topics found."
//                   : "Select a course and subject."
//               }
//             />

//             {instituteTotalCount > 0 && (
//               <Pagination
//                 currentPage={instituteCurrentTablePage}
//                 pageSize={institutePageSize}
//                 totalCount={instituteTotalCount}
//                 totalPages={instituteTotalPages}
//                 hasPrevious={instituteHasPrevious}
//                 hasNext={instituteHasNext}
//                 onPageChange={onInstitutePageChange}
//                 onPageSizeChange={onInstitutePageSizeChange}
//               />
//             )}
//           </div>
//         </div>

//         {/* Buttons */}
//         <div className="flex items-center gap-3 pt-2">
//           <button
//             type="button"
//             onClick={handleAddTopic}
//             disabled={selectedTopicIds.length === 0}
//             className="px-4 py-2 rounded-lg bg-[#0F4C81] text-white text-sm font-medium hover:bg-[#0c3d6a] disabled:opacity-50 disabled:cursor-not-allowed"
//           >
//             Add Topic
//           </button>
//           <button
//             type="button"
//             onClick={() => navigate("..")}
//             className="flex items-center gap-2 px-5 py-2.5 rounded-lg border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-all"
//           >
//             <X className="w-4 h-4" />
//             Cancel
//           </button>
//         </div>
//       </div>
//     </FormProvider>
//   );
// };
import { useEffect, useRef, useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { X } from "lucide-react";
import { FormProvider, useForm } from "react-hook-form";

import PageHeader from "../../../../components/common/PageHeader/PageHeader";
import DataTable from "../../../../components/common/DataTable/Datatable";
import Pagination from "../../../../components/common/DataTable/TablePagination";
import { Dropdown } from "../../../../components/common/Select";

import { getInstituteTopicColumns } from "../columns";
import { TopicOutletContext } from "./ManageTopics";
import { useAppSelector } from "../../../../redux/hooks";
import { toast } from "react-toastify";
import { addTopicsFromInstitute, getInstituteTopics } from "../topicService";
import ValidationErrorSummary from "../../../../components/common/ValidationErrorSummary";
import { useDispatch } from "react-redux";
import { clearGlobalError } from "../../../../redux/slices/errorSlice";

export const InstTopics = () => {
  const methods = useForm({
    defaultValues: {
      curriculumId: "",
      courseId: "",
      subjectId: "",
    },
  });
  const { watch, setValue } = methods;

  const selectedCurriculum = watch("curriculumId");
  const selectedCourse = watch("courseId");
  const selectedSubject = watch("subjectId");
  const previousCourse = useRef<string | number>("");
  const {
    instituteTopics,
    instituteCourseOptions,
    instituteSubjectOptions,
    instituteCurriculumOptions,
    onInstituteCurriculumChange,
    onInstituteCourseChange,
    onInstituteSubjectChange,

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
  } = useOutletContext<TopicOutletContext>();

  const navigate = useNavigate();
  const branchId = useAppSelector((state) => state.branch.branchId);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(clearGlobalError());

    return () => {
      dispatch(clearGlobalError());
    };
  }, [dispatch]);

  const [selectedTopicIds, setSelectedTopicIds] = useState<number[]>([]);
  // useEffect(() => {
  //   const fetchInitialTopics = async () => {
  //     if (branchId == null) return;

  //     try {
  //       const response = await getInstituteTopics({
  //         courseId: 0,
  //         subjectId: 0,
  //         branchId: Number(branchId),
  //         pageNumber: 1,
  //         pageSize: 10,
  //         sortBy: null,
  //         sortDirection: null,
  //       });

  //       console.log("INITIAL INSTITUTE TOPICS:", response);
  //     } catch (error) {
  //       console.error("Failed to fetch initial institute topics:", error);
  //     }
  //   };

  //   fetchInitialTopics();
  // }, [branchId]);
  // ============================================================
  // FIRST LOAD
  // Fetch all institute topics
  // courseId = 0
  // subjectId = 0
  // ============================================================

  // ============================================================
  // ADD TOPIC
  // ============================================================
  const handleAddTopic = async () => {
    if (selectedTopicIds.length === 0) {
      return;
    }

    try {
      const payload = {
        topicIds: selectedTopicIds,
        branchId,
      };

      const response = await addTopicsFromInstitute(payload);

      if (response?.statusCode === 200 || response?.status === "success") {
        toast.success("Topics added successfully.");

        setSelectedTopicIds([]);

        navigate("..", {
          state: {
            resetPage: true,
          },
        });
      }
    } catch (error) {
      console.error("Error adding topics:", error);
    }
  };
  useEffect(() => {
    if (!selectedCurriculum) {
      setValue("courseId", "");
      setValue("subjectId", "");
      setSelectedTopicIds([]);
      return;
    }

    setValue("courseId", "");
    setValue("subjectId", "");
    setSelectedTopicIds([]);

    onInstituteCurriculumChange(Number(selectedCurriculum));
  }, [selectedCurriculum]);
  // ============================================================
  // COURSE CHANGE
  // ============================================================
  // ============================================================
  // COURSE CHANGE
  // ============================================================
  // ============================================================
  // COURSE CHANGE
  // ============================================================
  useEffect(() => {
    if (!selectedCourse) {
      previousCourse.current = "";
      setValue("subjectId", "");
      setSelectedTopicIds([]);
      return;
    }

    // Only clear subject when the COURSE actually changes
    if (String(previousCourse.current) !== String(selectedCourse)) {
      previousCourse.current = selectedCourse;

      setValue("subjectId", "");
      setSelectedTopicIds([]);

      onInstituteCourseChange(Number(selectedCourse));
    }
  }, [selectedCourse]);

  // ============================================================
  // SUBJECT CHANGE
  // ============================================================
  // ============================================================
  // SUBJECT CHANGE
  // ============================================================
  const previousSubject = useRef<string | number>("");
  useEffect(() => {
    const subjectId = Number(selectedSubject) || 0;

    // Don't call again if the value hasn't actually changed
    if (String(previousSubject.current) === String(selectedSubject)) {
      return;
    }

    previousSubject.current = selectedSubject;

    setSelectedTopicIds([]);

    onInstituteSubjectChange(subjectId);
  }, [selectedSubject]);
  // ============================================================
  // SELECT TOPIC
  // ============================================================
  const handleSelectTopic = (id: number) => {
    setSelectedTopicIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((topicId) => topicId !== id);
      }

      return [...prev, id];
    });
  };

  const handleSelectAll = () => {
    const topicIds = instituteTopics.map((topic) => Number(topic.topicId));

    const allSelected =
      topicIds.length > 0 &&
      topicIds.every((id) => selectedTopicIds.includes(id));

    setSelectedTopicIds(allSelected ? [] : topicIds);
  };
  // ============================================================
  const columns = getInstituteTopicColumns({
    selectedTopicIds,
    topics: instituteTopics,
    onSelect: handleSelectTopic,
    onSelectAll: handleSelectAll,
  });

  // ============================================================
  // RENDER
  // ============================================================
  return (
    <FormProvider {...methods}>
      <div className="space-y-4">
        <PageHeader
          title="Manage Topics"
          description="Select a course and subject to manage topics"
          extraBreadcrumbs={[
            {
              label: "Import topics from institute",
            },
          ]}
        />

        {/* Course & Subject Filters */}
        <div className="bg-white border border-gray-200 rounded-2xl p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Dropdown
              name="curriculumId"
              label="Curriculum Name"
              options={instituteCurriculumOptions}
            />
            <Dropdown
              name="courseId"
              label="Course/Class Name"
              options={instituteCourseOptions}
            />

            <Dropdown
              name="subjectId"
              label="Subject Name"
              options={instituteSubjectOptions}
            />
          </div>
        </div>

        {/* Topics Table */}
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <DataTable
              columns={columns}
              data={instituteTopics}
              rowKey="topicId"
              sortBy={instituteSortBy}
              sortDirection={instituteSortDirection}
              onSortChange={onInstituteSortChange}
              emptyMessage={
                selectedSubject
                  ? "No Topics found."
                  : "Select a course and subject."
              }
            />

            {instituteTotalCount > 0 && (
              <Pagination
                currentPage={instituteCurrentTablePage}
                pageSize={institutePageSize}
                totalCount={instituteTotalCount}
                totalPages={instituteTotalPages}
                hasPrevious={instituteHasPrevious}
                hasNext={instituteHasNext}
                onPageChange={onInstitutePageChange}
                onPageSizeChange={onInstitutePageSizeChange}
              />
            )}
          </div>
        </div>

        {/* Buttons */}
        <div>
          <ValidationErrorSummary />
          <div className="mt-4 flex items-center justify-start gap-3">
            <button
              type="button"
              onClick={handleAddTopic}
              disabled={selectedTopicIds.length === 0}
              className="px-4 py-2 rounded-lg bg-[#0F4C81] text-white text-sm font-medium hover:bg-[#0c3d6a] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Import Topic(s)
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
    </FormProvider>
  );
};
