import { useEffect, useRef, useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { X } from "lucide-react";
import { FormProvider, useForm } from "react-hook-form";

import PageHeader from "../../../../components/common/PageHeader/PageHeader";
import DataTable from "../../../../components/common/DataTable/Datatable";
import Pagination from "../../../../components/common/DataTable/TablePagination";
import { Dropdown } from "../../../../components/common/Select";

import { getInstituteStudyMaterialColumns } from "../columns";
import { StudyMaterialOutletContext } from "../studyMaterialTypes";

import { useAppSelector } from "../../../../redux/hooks";
import { toast } from "react-toastify";

import { addStudyMaterialsFromInstitute } from "../studyMaterialService";
import ValidationErrorSummary from "../../../../components/common/ValidationErrorSummary";
import { useDispatch } from "react-redux";
import { clearGlobalError } from "../../../../redux/slices/errorSlice";

export const InstStudyMaterial = () => {
  const methods = useForm({
    defaultValues: {
      curriculumId: "",
      courseId: "",
      subjectId: "",
      topicId: "",
    },
  });

  const { watch, setValue } = methods;

  const selectedCurriculum = watch("curriculumId");
  const selectedCourse = watch("courseId");
  const selectedSubject = watch("subjectId");
  const selectedTopic = watch("topicId");

  const {
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
  } = useOutletContext<StudyMaterialOutletContext>();

  const navigate = useNavigate();

  const branchId = useAppSelector((state) => state.branch.branchId);

  const [selectedStudyMaterialIds, setSelectedStudyMaterialIds] = useState<
    number[]
  >([]);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(clearGlobalError());

    return () => {
      dispatch(clearGlobalError());
    };
  }, [dispatch]);
  // Curriculum change
  useEffect(() => {
    setValue("courseId", "");
    setValue("subjectId", "");
    setValue("topicId", "");
    setSelectedStudyMaterialIds([]);

    if (selectedCurriculum) {
      onInstituteCurriculumChange(Number(selectedCurriculum));
    }
  }, [selectedCurriculum]);

  // Course change
  useEffect(() => {
    setValue("subjectId", "");
    setValue("topicId", "");
    setSelectedStudyMaterialIds([]);

    if (selectedCourse) {
      onInstituteCourseChange(Number(selectedCourse));
    }
  }, [selectedCourse]);

  // Subject change
  useEffect(() => {
    setValue("topicId", "");
    setSelectedStudyMaterialIds([]);

    if (selectedSubject) {
      onInstituteSubjectChange(Number(selectedSubject));
    }
  }, [selectedSubject]);

  // Topic change
  useEffect(() => {
    setSelectedStudyMaterialIds([]);

    if (selectedTopic) {
      onInstituteTopicChange(Number(selectedTopic));
    }
  }, [selectedTopic]);

  const handleSelectStudyMaterial = (id: number) => {
    setSelectedStudyMaterialIds((prev) =>
      prev.includes(id)
        ? prev.filter((materialId) => materialId !== id)
        : [...prev, id],
    );
  };

  const handleSelectAll = () => {
    const selectableIds = instituteStudyMaterials.map(
      (material) => material.studymaterialId,
    );

    const allSelected =
      selectableIds.length > 0 &&
      selectableIds.every((id) => selectedStudyMaterialIds.includes(id));

    setSelectedStudyMaterialIds(allSelected ? [] : selectableIds);
  };

  const handleImport = async () => {
    if (selectedStudyMaterialIds.length === 0) {
      return;
    }

    try {
      const payload = {
        curriculumId: Number(selectedCurriculum),
        courseId: Number(selectedCourse),
        subjectId: Number(selectedSubject),
        topicId: Number(selectedTopic),
        studyMaterialIds: selectedStudyMaterialIds,
        branchId,
      };

      const response = await addStudyMaterialsFromInstitute(payload);

      if (response?.statusCode === 200 || response?.status === "success") {
        toast.success("Study materials imported successfully.");

        setSelectedStudyMaterialIds([]);

        navigate("..", {
          state: {
            resetPage: true,
          },
        });
      }
    } catch (error) {
      console.error("Error importing study materials:", error);
    }
  };

  const columns = getInstituteStudyMaterialColumns({
    selectedStudyMaterialIds,
    studyMaterials: instituteStudyMaterials,
    onSelect: handleSelectStudyMaterial,
    onSelectAll: handleSelectAll,
  });

  return (
    <FormProvider {...methods}>
      <div className="space-y-4">
        <PageHeader
          title="Manage Study Material"
          description="Select curriculum, course, subject and topic to import study material"
          extraBreadcrumbs={[
            {
              label: "Import study material from institute",
            },
          ]}
        />

        <div className="bg-white border border-gray-200 rounded-2xl p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
              disabled={!selectedCourse}
            />

            <Dropdown
              name="topicId"
              label="Topic Name"
              options={instituteTopicOptions}
              disabled={!selectedSubject}
            />
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <DataTable
              columns={columns}
              data={instituteStudyMaterials}
              rowKey="studymaterialId"
              sortBy={instituteSortBy}
              sortDirection={instituteSortDirection}
              onSortChange={onInstituteSortChange}
              emptyMessage={
                selectedTopic
                  ? "No Study Materials found."
                  : "Select curriculum, course, subject and topic."
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

        <div>
          <ValidationErrorSummary />
          <div className="mt-4 flex items-center justify-start gap-3">
            <button
              type="button"
              onClick={handleImport}
              disabled={selectedStudyMaterialIds.length === 0}
              className="px-4 py-2 rounded-lg bg-[#0F4C81] text-white text-sm font-medium hover:bg-[#0c3d6a] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Import Study Material(s)
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
