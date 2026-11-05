import React, { useState, useEffect } from "react";
import {
  useForm,
  FormProvider,
  SubmitHandler,
  Controller,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import { BookOpen, Upload } from "lucide-react";
import * as z from "zod";

import PageHeader from "../../../../components/common/PageHeader/PageHeader";
import { TextBox } from "../../../../components/common/TextBox";
import { RadioGroup } from "../../../../components/common/RadioGroup";
import { Dropdown } from "../../../../components/common/Select";
import { Button } from "../../../../components/common/Button";
import { FormSkeleton } from "../../../../components/common/FormSkeleton";

import {
  getCoursesApi,
  getSubjectsByCourseIdApi,
  getTopicsBySubjectIdApi,
  saveStudyMaterial,
  getStudyMaterialById,
} from "../studyMaterialService";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import type { SaveStudyMaterialFormData } from "../studyMaterialTypes";
import FileUpload from "../../../../components/common/FileUpload";
import ValidationErrorSummary from "../../../../components/common/ValidationErrorSummary";
import { clearGlobalError } from "../../../../redux/slices/errorSlice";
import { getCurriculums } from "../../ManageCurriculum/curriculumService";
import { getCourses } from "../../ManageCourses/courseService";

interface AddEditStudyMaterialProps {
  mode: "add" | "edit";
  materialTitle?: string;
}

const quillModules = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ["bold", "italic", "underline", "strike"],
    [{ list: "ordered" }, { list: "bullet" }],
    [{ align: [] }],
    ["link", "image"],
    ["clean"],
  ],
};

const studyMaterialSchema = z.object({
  CrclmId: z.coerce.number().min(0),

  courseId: z.coerce.number().min(1, "Course Name is required"),
  subjectId: z.coerce.number().min(1, "Subject Name is required"),
  topicId: z.coerce.number().min(1, "Topic is required"),

  title: z.string().min(1, "Title is required").max(100, "Max 100 characters"),
  description: z
    .string()
    .refine(
      (value) => {
        const text = value.replace(/<[^>]*>/g, "").trim();
        return text.length <= 200;
      },
      {
        message: "Description must not exceed 200 characters",
      },
    )
    .optional(),
  isActive: z.number().default(1),

  attachment: z
    .instanceof(File)
    .refine(
      (file) =>
        [".mp3", ".mp4", ".pdf"].includes(
          `.${file.name.split(".").pop()?.toLowerCase()}`,
        ),
      "Only MP3, MP4, and PDF files are allowed",
    )
    .refine(
      (file) => file.size <= 100 * 1024 * 1024,
      "File size must not exceed 100 MB",
    )
    .optional()
    .nullable(),
});

type StudyMaterialFormValues = z.infer<typeof studyMaterialSchema>;

const DEFAULT_VALUES: StudyMaterialFormValues = {
  CrclmId: 0,
  courseId: 0,
  subjectId: 0,
  topicId: 0,
  title: "",
  description: "",
  isActive: 1,
};

export default function AddEditStudyMaterial({
  mode,
  materialTitle,
}: AddEditStudyMaterialProps) {
  const isEdit = mode === "edit";
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [loading, setLoading] = useState<boolean>(true);
  const [curriculums, setCurriculums] = useState<
    { label: string; value: number }[]
  >([]);
  const [courses, setCourses] = useState<
    {
      label: string;
      value: number;
      crclmId: number;
    }[]
  >([]);
  const [subjects, setSubjects] = useState<{ label: string; value: number }[]>(
    [],
  );

  const [topics, setTopics] = useState<{ label: string; value: number }[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [attachmentRemoved, setAttachmentRemoved] = useState(false);
  const [existingFile, setExistingFile] = useState<{
    name: string;
    path: string;
    extension: string;
    size: number;
  } | null>(null);
  const instituteId = useSelector((state: any) => state.auth?.instituteId || 0);
  const branchId = useSelector((state: any) => state.branch?.branchId || 0);

  const methods = useForm<StudyMaterialFormValues>({
    resolver: zodResolver(studyMaterialSchema) as any,
    defaultValues: DEFAULT_VALUES,
    mode: "onTouched",
  });
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(clearGlobalError());

    return () => {
      dispatch(clearGlobalError());
    };
  }, [dispatch]);
  const { handleSubmit, setValue, watch, reset, control } = methods;

  const selectedCourseId = watch("courseId");
  const selectedSubjectId = watch("subjectId");
  const selectedCrclmId = watch("CrclmId");

  const [studyMaterialTitle, setStudyMaterialTitle] = useState("");
  const pageTitle = isEdit ? "Edit Study Material" : "Add Study Material";
  const fullBreadcrumbs = [
    { label: "Courses", path: "/managecourses" },
    { label: "Manage Study Material", path: "/managestudymaterial" },
    {
      label: isEdit
        ? `Edit Study Material${materialTitle ? ` - ${materialTitle}` : ""}`
        : "Add Study Material",
      path: "",
    },
  ];
  // Load Initial Courses for Add mode
  useEffect(() => {
    if (mode !== "add") return;

    const loadInitialData = async () => {
      try {
        setLoading(true);

        const [curriculumRes, courseRes] = await Promise.all([
          getCurriculums({
            curriculumName: "",
            status: 1,
            pageNumber: 1,
            pageSize: 1000,
            branchId: Number(branchId),
          }),

          getCourses({
            courseName: "",
            status: 1,
            pageNumber: 1,
            pageSize: 1000,
            instituteId: Number(instituteId),
            branchId: Number(branchId),
          }),
        ]);

        // Load Curriculums
        setCurriculums(
          (curriculumRes?.items || []).map((item: any) => ({
            label: item.CurriculumName,
            value: Number(item.CurriculumId),
          })),
        );

        // Load ALL Courses
        setCourses(
          (courseRes?.items || []).map((c: any) => ({
            label: c.course_Name,
            value: Number(c.courseId),
            crclmId: Number(c.crclmId || 0),
          })),
        );
        // Initially Subject + Topic remain empty
        setSubjects([]);
        setTopics([]);
      } catch (error) {
        console.error("Failed to load initial data", error);

        setCurriculums([]);
        setCourses([]);
        setSubjects([]);
        setTopics([]);
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, [mode, instituteId, branchId]);
  useEffect(() => {
    if (mode !== "add") return;

    const curriculumId = Number(selectedCrclmId || 0);

    // Curriculum cleared → load ALL courses again
    if (curriculumId === 0) {
      // Reset Course, Subject and Topic
      setValue("courseId", 0);
      setValue("subjectId", 0);
      setValue("topicId", 0);

      setSubjects([]);
      setTopics([]);
      const loadAllCourses = async () => {
        try {
          const response = await getCourses({
            courseName: "",
            status: 1,
            pageNumber: 1,
            pageSize: 1000,
            instituteId: Number(instituteId),
            branchId: Number(branchId),
          });

          setCourses(
            (response?.items || []).map((c: any) => ({
              label: c.course_Name,
              value: Number(c.courseId),
              crclmId: Number(c.crclmId || 0),
            })),
          );
        } catch (error) {
          console.error("Failed to load courses", error);
          setCourses([]);
        }
      };

      loadAllCourses();
      return;
    }

    // Curriculum selected → filter courses
    const loadCurriculumCourses = async () => {
      try {
        const response = await getCourses({
          courseName: "",
          status: 1,
          pageNumber: 1,
          pageSize: 1000,
          instituteId: Number(instituteId),
          branchId: Number(branchId),
          curriculumId,
        });

        setCourses(
          (response?.items || []).map((c: any) => ({
            label: c.course_Name,
            value: Number(c.courseId),
            crclmId: Number(c.crclmId || 0),
          })),
        );

        // Reset dependent selections
        setValue("courseId", 0);
        setValue("subjectId", 0);
        setValue("topicId", 0);
        setSubjects([]);
        setTopics([]);
      } catch (error) {
        console.error("Failed to load curriculum courses", error);
        setCourses([]);
      }
    };

    loadCurriculumCourses();
  }, [selectedCrclmId, mode, instituteId, branchId, setValue]);
  // Load Details in Edit Mode
  useEffect(() => {
    if (!id || mode !== "edit") return;

    const fetchEditData = async () => {
      try {
        setLoading(true);

        const res: any = await getStudyMaterialById(id);
        const apiData = res?.data?.data || res?.data || res;
        const crclmIdVal = Number(apiData.CrclmId || apiData.crclmId || 0);
        if (apiData) {
          const title =
            apiData.heading || apiData.Heading || apiData.title || "";

          setStudyMaterialTitle(title);
          const courseIdVal = Number(apiData.courseId || apiData.CourseId || 0);
          const subjectIdVal = Number(
            apiData.subjectId || apiData.SubjectId || 0,
          );
          const topicIdVal = Number(apiData.topicId || apiData.TopicId || 0);

          const [courseRes, subjRes, topicRes] = await Promise.all([
            getCoursesApi(instituteId, branchId),
            courseIdVal > 0
              ? getSubjectsByCourseIdApi(courseIdVal)
              : Promise.resolve(null),
            courseIdVal > 0 && subjectIdVal > 0
              ? getTopicsBySubjectIdApi(courseIdVal, subjectIdVal)
              : Promise.resolve(null),
          ]);
          const curriculumRes = await getCurriculums({
            curriculumName: "",
            status: 1,
            pageNumber: 1,
            pageSize: 1000,
            branchId: Number(branchId),
          });

          setCurriculums(
            (curriculumRes?.items || []).map((item: any) => ({
              label: item.CurriculumName,
              value: Number(item.CurriculumId),
            })),
          );
          const rawCourses =
            courseRes?.data?.data || courseRes?.data || courseRes || [];
          setCourses([
            ...rawCourses.map((c: any) => ({
              label: c.courseName || c.name,
              value: Number(c.id || c.courseId),
            })),
          ]);
          console.log("SUBJECT RESPONSE:", subjRes);
          console.log("TOPIC RESPONSE:", topicRes);
          if (subjRes) {
            const rawSubjs =
              subjRes?.data?.data || subjRes?.data || subjRes || [];

            setSubjects(
              rawSubjs.map((s: any) => ({
                label:
                  s.subjectName || s.SubjectName || s.subName || s.name || "",
                value: Number(
                  s.subjectId || s.SubjectId || s.subId || s.id || 0,
                ),
              })),
            );
          }
          console.log("SUBJECT RESPONSE:", subjRes);
          console.log("TOPIC RESPONSE:", topicRes);
          if (topicRes) {
            const rawTopics =
              topicRes?.data?.data || topicRes?.data || topicRes || [];

            setTopics(
              rawTopics.map((t: any) => ({
                label: t.topicName || t.TopicName || t.topic || t.name || "",
                value: Number(t.topicId || t.TopicId || t.topicID || t.id || 0),
              })),
            );
          }
          if (apiData.attachmentOriginalName && apiData.attachmentPath) {
            setExistingFile({
              name: apiData.attachmentOriginalName,
              path: `${import.meta.env.VITE_API_BASE_URL.replace(/\/api\/?$/, "")}${apiData.attachmentPath}`,
              extension: apiData.attachmentExtension,
              size: Number(apiData.attachmentSize || 0),
            });
          } else {
            setExistingFile(null);
            setAttachmentRemoved(false);
          }

          reset({
            CrclmId: crclmIdVal,
            courseId: courseIdVal,
            subjectId: subjectIdVal,
            topicId: topicIdVal,
            title: apiData.heading || apiData.Heading || apiData.title || "",
            description:
              apiData.studymaterialHtml ||
              apiData.StudymaterialHtml ||
              apiData.description ||
              "",
            isActive: Number(apiData.isActive ?? apiData.IsActive ?? 1),
          });
        }
      } catch (error) {
        console.error("Failed to fetch study material details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEditData();
  }, [id, mode, instituteId, branchId, reset]);

  // Handle Dynamic Course Selection (Add Mode Only)
  useEffect(() => {
    if (mode !== "add") return;
    // Reset dependent fields whenever course changes
    setValue("subjectId", 0);
    setValue("topicId", 0);

    setSubjects([]);
    setTopics([]);

    if (!selectedCourseId || Number(selectedCourseId) === 0) {
      return;
    }

    const fetchSubjects = async () => {
      try {
        const response: any = await getSubjectsByCourseIdApi(
          Number(selectedCourseId),
        );

        const rawData =
          response?.data?.data || response?.data || response || [];

        const subjectOptions = rawData.map((s: any) => ({
          label: s.subjectName || s.SubjectName || s.name || s.Name || "",
          value: Number(s.subjectId || s.SubjectId || s.id || s.Id || 0),
        }));

        setSubjects(subjectOptions);
      } catch (err) {
        console.error("Failed to load subjects", err);
        setSubjects([]);
      }
    };

    fetchSubjects();
  }, [selectedCourseId, setValue]);

  // Handle Dynamic Topic Selection (Add Mode Only)
  useEffect(() => {
    if (mode !== "add") return;

    // Reset topic whenever subject changes
    setValue("topicId", 0);
    setTopics([]);

    if (
      !selectedCourseId ||
      Number(selectedCourseId) === 0 ||
      !selectedSubjectId ||
      Number(selectedSubjectId) === 0
    ) {
      return;
    }

    const fetchTopics = async () => {
      try {
        const response: any = await getTopicsBySubjectIdApi(
          Number(selectedCourseId),
          Number(selectedSubjectId),
        );

        const rawData =
          response?.data?.data || response?.data || response || [];

        const topicOptions = rawData.map((t: any) => ({
          label: t.topicName || t.TopicName || t.name || t.Name || "",
          value: Number(t.topicId || t.TopicId || t.id || t.Id || 0),
        }));

        setTopics(topicOptions);
      } catch (err) {
        console.error("Failed to load topics", err);
        setTopics([]);
      }
    };

    fetchTopics();
  }, [selectedCourseId, selectedSubjectId, setValue, mode]);
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 100 * 1024 * 1024) {
        toast.error("File size should not be greater than 100 MB");
        return;
      }
      setSelectedFile(file);
    }
  };

  const onSubmit: SubmitHandler<StudyMaterialFormValues> = async (
    formDataValues,
  ) => {
    try {
      const headingText = formDataValues.title?.trim() || "";
      if (!headingText) {
        toast.error("Please Enter Study Material Heading.");
        return;
      }

      const payload: SaveStudyMaterialFormData = {
        StudymaterialId: isEdit && id ? Number(id) : 0,
        BranchId: Number(branchId || 0),
        CourseId: Number(formDataValues.courseId),
        CrclmId: Number(formDataValues.CrclmId),

        SubjectId: Number(formDataValues.subjectId),
        TopicId: Number(formDataValues.topicId),
        Heading: headingText,
        StudymaterialHtml: formDataValues.description || "",
        IsActive: Number(formDataValues.isActive),
        Attachment: formDataValues.attachment || undefined,
        AttachmentRemoved: attachmentRemoved,
      };

      const res: any = await saveStudyMaterial(payload);

      const isSuccess = Boolean(
        res?.success ||
        res?.isSuccess ||
        res?.data?.success ||
        res?.data === true,
      );

      if (isSuccess) {
        toast.success(
          res?.message ||
            (isEdit
              ? "Study Material updated successfully"
              : "Study Material saved successfully"),
        );

        if (isEdit) {
          navigate("/managestudymaterial", {
            state: {
              updatedStudyMaterialId: Number(id),
            },
          });
        } else {
          navigate("/managestudymaterial", {
            state: {
              resetPage: true,
            },
          });
        }
      } else {
        toast.error(res?.message || "Failed to save study material");
      }
    } catch (error: any) {
      console.error(
        "Submission Error Details:",
        error?.response?.data || error,
      );
    }
  };

  const handleCancel = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    navigate("..");
  };

  if (loading) {
    return <FormSkeleton fieldsCount={6} columns={3} showTitle={true} />;
  }

  // const fullBreadcrumbs = [
  //   { label: "Courses", path: "/courses" },
  //   { label: "Manage Study Material", path: "/managestudymaterial" },
  //   {
  //     label: isEdit
  //       ? `Edit Study Material${materialTitle ? ` - ${materialTitle}` : ""}`
  //       : "Add Study Material",
  //     path: "",
  //   },
  // ];
  const actionLabel = isEdit ? "Edit" : "Add";
  return (
    <div className="min-h-screen bg-slate-50">
      <PageHeader
        description={
          isEdit
            ? "Update study material details"
            : "Create a new study material"
        }
        extraBreadcrumbs={[
          {
            label: isEdit
              ? `Edit Study Material - ${
                  studyMaterialTitle || "Study Material"
                }`
              : "Add Study Material",
          },
        ]}
      />

      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)} className="px-6 pb-6 space-y-5">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center gap-2.5 mb-5">
              <div className="w-8 h-8 rounded-lg bg-[#0F4C81]/10 flex items-center justify-center">
                <BookOpen className="w-4 h-4 text-[#0F4C81]" />
              </div>
              <h2 className="text-base font-semibold text-gray-800">
                Study Material Details
              </h2>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Dropdown
                  name="CrclmId"
                  label="Curriculum Name"
                  options={curriculums}
                />
                <Dropdown
                  name="courseId"
                  label="Course Name"
                  options={courses}
                  required
                />
              </div>{" "}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Dropdown
                  name="subjectId"
                  label="Subject Name"
                  options={subjects}
                  required
                  disabled={!selectedCourseId || Number(selectedCourseId) === 0}
                />

                <Dropdown
                  name="topicId"
                  label="Topic Name"
                  options={topics}
                  required
                  disabled={
                    !selectedSubjectId || Number(selectedSubjectId) === 0
                  }
                />
              </div>
              <div className="grid grid-cols-1 gap-4">
                <TextBox
                  name="title"
                  label="Study Material Title"
                  placeholder="Enter Study Material Title"
                  required
                  allowOnly="noSpecialChars"
                  maxLength={100}
                />
              </div>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Study Material Description
                  </label>
                  <Controller
                    name="description"
                    control={control}
                    render={({ field: { onChange, value }, fieldState }) => (
                      <div>
                        <ReactQuill
                          theme="snow"
                          value={value || ""}
                          onChange={onChange}
                          modules={quillModules}
                          placeholder="Enter Study Material Description..."
                          className="bg-white rounded-lg"
                        />

                        {fieldState.error && (
                          <p className="mt-1 text-xs text-red-500">
                            {fieldState.error.message}
                          </p>
                        )}
                      </div>
                    )}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start pt-2">
                <RadioGroup
                  name="isActive"
                  label="Status"
                  options={[
                    { label: "Active", value: 1 },
                    { label: "Inactive", value: 0 },
                  ]}
                />

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Attachment
                  </label>

                  <FileUpload
                    name="attachment"
                    accept=".mp3,.mp4,.pdf"
                    maxSizeMB={100}
                    label="Choose File"
                    helperText="MP3, MP4, PDF · Max 100MB"
                    existingFile={existingFile}
                    onFileSelected={() => {
                      setAttachmentRemoved(false);
                    }}
                    onRemoveExisting={() => {
                      setAttachmentRemoved(true);
                      setExistingFile(null);
                      setValue("attachment", null);
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div>
            <ValidationErrorSummary />
            <div className="mt-4 flex items-center justify-start gap-3">
              <Button preset={isEdit ? "update" : "save"} />
              <Button type="button" preset="cancel" onClick={handleCancel} />
            </div>
          </div>
        </form>
      </FormProvider>
    </div>
  );
}
