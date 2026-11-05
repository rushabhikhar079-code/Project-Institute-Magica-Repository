import { useEffect, useMemo, useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { getInstituteSubjectColumns } from "../columns";
import PageHeader from "../../../../components/common/PageHeader/PageHeader";
import DataTable from "../../../../components/common/DataTable/Datatable";
import Pagination from "../../../../components/common/DataTable/TablePagination";
import { X } from "lucide-react";
import { SubjectOutletContext } from "./ManageSubject";
import { Dropdown } from "../../../../components/common/Select";
import { FormProvider, useForm } from "react-hook-form";
import ValidationErrorSummary from "../../../../components/common/ValidationErrorSummary";
import { useDispatch } from "react-redux";
import { clearGlobalError } from "../../../../redux/slices/errorSlice";

export const InstSubjects = () => {
  const methods = useForm({
    defaultValues: {
      curriculumId: "",
      courseId: "",
    },
  });

  const { watch, setValue } = methods;

  const selectedCurriculum = watch("curriculumId");
  const selectedCourse = watch("courseId");

  const {
    instituteSubjects,
    onAddSubject,

    courseOptions,
    curriculumOptions,

    selectedCourseId,
    courseSubjects,
    onCourseChange,

    instituteCurrentTablePage,
    institutePageSize,
    instituteTotalCount,
    instituteTotalPages,
    instituteHasPrevious,
    instituteHasNext,
    onCurriculumChange,
    onInstitutePageChange,
    onInstitutePageSizeChange,
    instituteSortBy,
    instituteSortDirection,
    onInstituteSortChange,
  } = useOutletContext<SubjectOutletContext>();

  const [selectedSubjectIds, setSelectedSubjectIds] = useState<number[]>([]);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(clearGlobalError());

    return () => {
      dispatch(clearGlobalError());
    };
  }, [dispatch]);
  const navigate = useNavigate();
  useEffect(() => {
    setValue("courseId", "");
    setSelectedSubjectIds([]);

    onCurriculumChange(selectedCurriculum ? Number(selectedCurriculum) : 0);
  }, [selectedCurriculum, setValue, onCurriculumChange]);
  /*
   * Only imported courses should be shown.
   */
  // const importedCourseOptions = useMemo(() => {
  //   return courseOptions.filter((course) => course.isImported === true);
  // }, [courseOptions]);

  // /*
  //  * Filter courses by selected curriculum.
  //  *
  //  * If no curriculum is selected:
  //  *     show all imported courses
  //  *
  //  * If curriculum is selected:
  //  *     show only courses belonging to that curriculum
  //  */
  // const filteredCourseOptions = useMemo(() => {
  //   if (!selectedCurriculum) {
  //     return importedCourseOptions;
  //   }

  //   const selectedCurriculumName = curriculumOptions.find(
  //     (curriculum) => String(curriculum.value) === String(selectedCurriculum),
  //   )?.label;

  //   if (!selectedCurriculumName) {
  //     return [];
  //   }

  //   const normalizedCurriculumName = selectedCurriculumName
  //     .trim()
  //     .toLowerCase();

  //   return importedCourseOptions.filter(
  //     (course) =>
  //       course.curriculumName?.trim().toLowerCase() ===
  //       normalizedCurriculumName,
  //   );
  // }, [importedCourseOptions, selectedCurriculum, curriculumOptions]);

  // useEffect(() => {
  //   if (!selectedCourse) {
  //     return;
  //   }

  //   const courseStillExists = filteredCourseOptions.some(
  //     (course) => String(course.value) === String(selectedCourse),
  //   );

  //   if (!courseStillExists) {
  //     setValue("courseId", "");
  //     setSelectedSubjectIds([]);
  //   }
  // }, [selectedCurriculum, filteredCourseOptions, selectedCourse, setValue]);

  /*
   * Course selection.
   */
  useEffect(() => {
    if (!selectedCourse) {
      return;
    }

    const selectedOption = courseOptions.find(
      (course) => String(course.value) === String(selectedCourse),
    );

    if (!selectedOption) {
      return;
    }

    onCourseChange(Number(selectedOption.value), selectedOption.refCourseId);
  }, [selectedCourse, courseOptions, onCourseChange]);

  /*
   * Subjects.
   *
   * Course filter is already handled by onCourseChange.
   * Curriculum filter should additionally be applied here.
   *
   * This assumes instituteSubjects contains crclmId.
   */

  const filteredSubjects = useMemo(() => {
    let subjects = instituteSubjects;

    if (selectedCurriculum) {
      subjects = subjects.filter(
        (subject) => Number(subject.crclmId) === Number(selectedCurriculum),
      );
    }

    if (selectedCourse) {
      subjects = subjects.filter(
        (subject) => Number(subject.courseId) === Number(selectedCourse),
      );
    }

    return subjects;
  }, [instituteSubjects, selectedCurriculum, selectedCourse]);
  // const filteredSubjects = useMemo(() => {
  //   let subjects = instituteSubjects;

  //   // Curriculum filter
  //   if (selectedCurriculum) {
  //     subjects = subjects.filter(
  //       (subject) => String(subject.crclmId) === String(selectedCurriculum),
  //     );
  //   }

  //   // Course filter
  //   if (selectedCourse) {
  //     subjects = subjects.filter(
  //       (subject) => String(subject.courseId) === String(selectedCourse),
  //     );
  //   }

  //   return subjects;
  // }, [instituteSubjects, selectedCurriculum, selectedCourse]);

  const handleSelectSubject = (id: number) => {
    setSelectedSubjectIds((prev) =>
      prev.includes(id)
        ? prev.filter((subjectId) => subjectId !== id)
        : [...prev, id],
    );
  };

  const handleSelectAll = () => {
    const selectableIds = filteredSubjects.map((subject) => subject.subId);

    const allSelected =
      selectableIds.length > 0 &&
      selectableIds.every((id) => selectedSubjectIds.includes(id));

    if (allSelected) {
      setSelectedSubjectIds((prev) =>
        prev.filter((id) => !selectableIds.includes(id)),
      );
    } else {
      setSelectedSubjectIds((prev) => [
        ...prev,
        ...selectableIds.filter((id) => !prev.includes(id)),
      ]);
    }
  };

  const handleAddSubject = async () => {
    if (selectedSubjectIds.length === 0) {
      return;
    }

    await onAddSubject(selectedSubjectIds);
  };

  const columns = getInstituteSubjectColumns({
    selectedSubjectIds,
    subjects: filteredSubjects,
    onSelect: handleSelectSubject,
    onSelectAll: handleSelectAll,
  });

  return (
    <FormProvider {...methods}>
      <div className="space-y-4">
        <PageHeader
          title="Import Subjects from Institute"
          description="Select a subject to add to your institute"
          extraBreadcrumbs={[
            {
              label: "Import Subjects from Institute",
            },
          ]}
        />

        <div className="bg-white border border-gray-200 rounded-2xl p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Curriculum */}
            <Dropdown
              name="curriculumId"
              label="Curriculum Name"
              options={curriculumOptions}
            />

            {/* Course */}
            <Dropdown
              name="courseId"
              label="Course/Class Name"
              options={courseOptions}
            />
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <DataTable
              columns={columns}
              data={filteredSubjects}
              rowKey="subId"
              sortBy={instituteSortBy}
              sortDirection={instituteSortDirection}
              onSortChange={onInstituteSortChange}
              emptyMessage="No Subjects found."
            />

            {filteredSubjects.length > 0 && (
              <Pagination
                currentPage={instituteCurrentTablePage}
                pageSize={institutePageSize}
                totalCount={filteredSubjects.length}
                totalPages={Math.ceil(
                  filteredSubjects.length / institutePageSize,
                )}
                hasPrevious={instituteHasPrevious}
                hasNext={instituteHasNext}
                onPageChange={onInstitutePageChange}
                onPageSizeChange={onInstitutePageSizeChange}
              />
            )}
          </div>
        </div>

        <div>
          <ValidationErrorSummary />
          <div className="mt-4 flex items-center justify-start gap-3">
            <button
              type="button"
              onClick={handleAddSubject}
              disabled={selectedSubjectIds.length === 0}
              className="px-4 py-2 rounded-lg bg-[#0F4C81] text-white text-sm font-medium hover:bg-[#0c3d6a] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Import Subject(s)
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
