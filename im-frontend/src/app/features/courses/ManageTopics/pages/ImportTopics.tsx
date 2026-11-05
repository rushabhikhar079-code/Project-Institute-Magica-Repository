import { useEffect, useState } from "react";
import { X } from "lucide-react";

import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { useAppSelector } from "../../../../redux/hooks";

import PageHeader from "../../../../components/common/PageHeader/PageHeader";
import StepsSection, {
  type StepItem,
} from "../../../../components/common/StepsSection";
import { Dropdown } from "../../../../components/common/Select";

import {
  getCourses,
  getCourseSubjects,
} from "../../ManageCourses/courseService";

import { InstituteSubjectApi } from "../../ManageCourses/types";
import FileUpload from "../../../../components/common/FileUpload";

import {
  importTopicSchema,
  type ImportTopicFormValues,
} from "../../validations/importTopicsSchema";

import { z } from "zod";
import { importTopicsFromExcel } from "../topicService";
import { toast } from "react-toastify";
import ValidationErrorSummary from "../../../../components/common/ValidationErrorSummary";
import { useDispatch } from "react-redux";
import { clearGlobalError } from "../../../../redux/slices/errorSlice";

const ImportTopic = () => {
  const navigate = useNavigate();

  const branchId = useAppSelector((state) => state.branch.branchId);

  const methods = useForm<
    z.input<typeof importTopicSchema>,
    any,
    ImportTopicFormValues
  >({
    resolver: zodResolver(importTopicSchema),
    defaultValues: {
      courseId: 0,
      subjectId: 0,
      excelFile: undefined,
    },
  });

  const { watch, setValue } = methods;

  const selectedCourseId = watch("courseId");
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(clearGlobalError());

    return () => {
      dispatch(clearGlobalError());
    };
  }, [dispatch]);

  const [courseOptions, setCourseOptions] = useState<
    { label: string; value: string | number }[]
  >([]);

  const [subjectOptions, setSubjectOptions] = useState<
    { label: string; value: string | number }[]
  >([]);

  /* ============================================================
     FETCH COURSES
  ============================================================ */

  useEffect(() => {
    // branchId = 0 is valid
    if (branchId === null || branchId === undefined) return;

    const fetchCourses = async () => {
      try {
        const response = await getCourses({
          courseName: "",
          status: 2,
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

    fetchCourses();
  }, [branchId]);

  /* ============================================================
     FETCH SUBJECTS WHEN COURSE CHANGES
  ============================================================ */

  useEffect(() => {
    // courseId = 0 means no course selected
    // branchId = 0 is valid
    if (
      selectedCourseId === null ||
      selectedCourseId === undefined ||
      Number(selectedCourseId) === 0 ||
      branchId === null ||
      branchId === undefined
    ) {
      setSubjectOptions([]);
      setValue("subjectId", 0);
      return;
    }

    const fetchSubjects = async () => {
      try {
        const response = await getCourseSubjects({
          courseIds: [Number(selectedCourseId)],
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
    };

    fetchSubjects();
  }, [selectedCourseId, branchId, setValue]);

  const steps: StepItem[] = [
    {
      title: "Download sample file",
      description: "Download the sample Excel file and follow the format.",
      content: (
        <a
          href="/institute-magica/templates/Subject_Topic.xlsx"
          download="Subject_Topic.xlsx"
          className="flex items-center justify-center gap-1 px-2 py-1.5 w-[130px] border border-[#0F4C81] text-[#0F4C81] rounded-md hover:bg-[#0F4C81] hover:text-white transition-colors text-[11px] font-medium"
        >
          Download Sample File
        </a>
      ),
    },

    {
      title: "Enter data or cut and paste into downloaded excel file",
      description: "Enter the topic data in the downloaded Excel file.",
      content: <div />,
    },

    {
      title: (
        <>
          Select class or course <span className="text-red-500">*</span>
        </>
      ),
      description:
        "Choose the class or course for which you want to import topics.",
      content: <Dropdown name="courseId" options={courseOptions} />,
    },

    {
      title: (
        <>
          Select subject <span className="text-red-500">*</span>
        </>
      ),
      description: "Choose the subject for the selected class or course.",
      content: <Dropdown name="subjectId" options={subjectOptions} />,
    },

    {
      title: (
        <>
          Upload Excel File <span className="text-red-500">*</span>
        </>
      ),
      description: "Upload the Excel file containing the topics.",
      content: (
        <div className="w-full">
          <FileUpload
            name="excelFile"
            accept=".xlsx,.xls"
            allowedMimeTypes={[
              "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
              "application/vnd.ms-excel",
            ]}
            maxSizeMB={10}
          />
        </div>
      ),
    },
  ];

  const handleImport = async (data: ImportTopicFormValues) => {
    if (!data.excelFile) return;

    try {
      const formData = new FormData();

      formData.append("file", data.excelFile);
      formData.append("CourseId", String(data.courseId));
      formData.append("SubjectId", String(data.subjectId));
      formData.append("BranchId", String(branchId));

      const response = await importTopicsFromExcel(formData);
      toast.success(response?.message || "Topics imported successfully.");

      navigate("..", {
        state: {
          resetPage: true,
        },
      });
    } catch (error) {
      console.error("Failed to import topics:", error);
    }
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(handleImport)}>
        <div className="min-h-screen bg-slate-50">
          <PageHeader
            description="Import topic data from Excel"
            extraBreadcrumbs={[
              {
                label: "Import Topics Data from Excel",
              },
            ]}
          />

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <StepsSection steps={steps} />
          </div>

          <div>
            <ValidationErrorSummary />
            <div className="mt-4 flex items-center justify-start gap-3">
              <button
                type="submit"
                className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-[#0F4C81] text-white text-sm font-semibold hover:bg-[#0c3d6a] transition-all shadow-sm"
              >
                Import
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
      </form>
    </FormProvider>
  );
};

export default ImportTopic;
