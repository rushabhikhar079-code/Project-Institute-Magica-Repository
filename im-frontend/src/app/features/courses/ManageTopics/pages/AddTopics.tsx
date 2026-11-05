import { useEffect, useState } from "react";
import { Save, X, Layers } from "lucide-react";

import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useParams } from "react-router-dom";
import { useAppSelector } from "../../../../redux/hooks";
import { toast } from "react-toastify";

import PageHeader from "../../../../components/common/PageHeader/PageHeader";
import { Dropdown } from "../../../../components/common/Select";

import {
  getTopicById,
  createTopic,
  updateTopic,
  getNextTopicSequence,
} from "../topicService";

import {
  getCourses,
  getCourseSubjects,
} from "../../ManageCourses/courseService";

import { InstituteSubjectApi } from "../../ManageCourses/types";

import {
  topicSchema,
  type TopicFormValidation,
} from "../../validations/topicSchema";

import type { CreateTopicRequest } from "../types";

import { inp, lbl } from "../constants";
import ValidationErrorSummary from "../../../../components/common/ValidationErrorSummary";
import { useDispatch } from "react-redux";
import { clearGlobalError } from "../../../../redux/slices/errorSlice";
import { getCurriculums } from "../../ManageCurriculum/curriculumService";

type AddTopicProps = {
  mode: "add" | "edit";
};

const DEFAULT_FORM_VALUES: TopicFormValidation = {
  curriculumId: 0,
  courseId: 0,
  subjectId: 0,
  topicSeqNum: 0,
  topicName: "",
  topicDurId: 0,
  topicDuration: "",
  remark: "",
  isActive: 1,
  isReflect: false,
};

const TOPIC_DURATION_OPTIONS = [
  { label: "Hours", value: 1 },
  { label: "Days", value: 2 },
  { label: "Months", value: 3 },
];

export default function AddTopic({ mode }: AddTopicProps) {
  const isEdit = mode === "edit";

  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const branchId = useAppSelector((state) => state.branch.branchId);

  const topicId = id ? Number(id) : undefined;

  const [courseOptions, setCourseOptions] = useState<
    { label: string; value: string | number }[]
  >([]);
  const [curriculumOptions, setCurriculumOptions] = useState<
    { label: string; value: string | number }[]
  >([]);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(clearGlobalError());

    return () => {
      dispatch(clearGlobalError());
    };
  }, [dispatch]);
  const [subjectOptions, setSubjectOptions] = useState<
    { label: string; value: string | number }[]
  >([]);
  const [editSubjectId, setEditSubjectId] = useState<number | null>(null);
  const [refTopicID, setRefTopicID] = useState(0);
  const methods = useForm<TopicFormValidation>({
    resolver: zodResolver(topicSchema),
    defaultValues: DEFAULT_FORM_VALUES,
  });

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = methods;

  const selectedCurriculumId = watch("curriculumId");
  const selectedCourseId = watch("courseId");
  const topicName = watch("topicName");
  const selectedDurationId = watch("topicDurId");
  const isActive = watch("isActive");
  const isReflect = watch("isReflect");
  const selectedSubjectId = watch("subjectId");
  const showReflect = isEdit && Number(branchId) === 0;
  // ============================================================
  // RESET COURSE, SUBJECT & SEQUENCE WHEN CURRICULUM CHANGES
  // ============================================================
  useEffect(() => {
    if (isEdit) return;

    // When curriculum changes, clear dependent fields
    setValue("courseId", 0);
    setValue("subjectId", 0);
    setValue("topicSeqNum", 0);
    setSubjectOptions([]);
  }, [selectedCurriculumId, isEdit, setValue]);
  // ============================================================
  // RESET SUBJECT & SEQUENCE WHEN COURSE CHANGES
  // ============================================================
  useEffect(() => {
    if (isEdit) return;

    // When course changes, clear dependent fields
    setValue("subjectId", 0);
    setValue("topicSeqNum", 0);
  }, [selectedCourseId, isEdit, setValue]);
  useEffect(() => {
    if (branchId === null || branchId === undefined) return;

    const fetchCurriculumOptions = async () => {
      try {
        const response = await getCurriculums({
          curriculumName: "",
          status: 1,
          pageNumber: 1,
          pageSize: 1000,
          branchId: Number(branchId),
        });

        const options =
          response.items?.map((curriculum) => ({
            label: curriculum.CurriculumName,
            value: curriculum.CurriculumId,
          })) ?? [];

        setCurriculumOptions(options);
      } catch (error) {
        console.error("Failed to fetch curriculums:", error);
        setCurriculumOptions([]);
      }
    };

    fetchCurriculumOptions();
  }, [branchId]);
  /* ============================================================
     FETCH COURSES
  ============================================================ */

  useEffect(() => {
    if (branchId === null || branchId === undefined) return;

    const fetchCourses = async () => {
      try {
        const response = await getCourses({
          courseName: "",
          status: 1,
          curriculumId:
            selectedCurriculumId && Number(selectedCurriculumId) > 0
              ? Number(selectedCurriculumId)
              : 0,
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
  }, [branchId, selectedCurriculumId]);
  /* ============================================================
     FETCH SUBJECTS WHEN COURSE CHANGES
  ============================================================ */

  useEffect(() => {
    if (
      selectedCourseId === null ||
      selectedCourseId === undefined ||
      selectedCourseId === 0 ||
      branchId === null ||
      branchId === undefined
    ) {
      setSubjectOptions([]);
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
        if (isEdit && editSubjectId !== null) {
          setValue("subjectId", editSubjectId);
        }
      } catch (error) {
        console.error("Failed to fetch subjects:", error);
        setSubjectOptions([]);
      }
    };

    fetchSubjects();
  }, [selectedCourseId, branchId, isEdit, editSubjectId, setValue]);
  /* ============================================================
   GET NEXT TOPIC SEQUENCE - ADD
============================================================ */

  // ============================================================
  // GET NEXT TOPIC SEQUENCE - ADD
  // ============================================================
  useEffect(() => {
    if (isEdit) return;

    // No subject selected → keep sequence blank
    if (!selectedSubjectId || Number(selectedSubjectId) === 0) {
      setValue("topicSeqNum", 0);
      return;
    }

    const loadNextTopicSequence = async () => {
      try {
        const response = await getNextTopicSequence(Number(selectedSubjectId));

        const nextSequence = response?.data?.nextSequence;

        if (nextSequence !== undefined && nextSequence !== null) {
          setValue("topicSeqNum", Number(nextSequence), {
            shouldValidate: true,
          });
        }
      } catch (error) {
        console.error("Failed to fetch next topic sequence:", error);

        // If API fails, don't leave an old sequence
        setValue("topicSeqNum", 0);
      }
    };

    loadNextTopicSequence();
  }, [isEdit, selectedSubjectId, setValue]);
  /* ============================================================
     GET TOPIC BY ID - EDIT
  ============================================================ */

  useEffect(() => {
    if (!isEdit || !topicId) return;

    const loadTopic = async () => {
      try {
        const response = await getTopicById(topicId);

        console.log("GET TOPIC RESPONSE:", response);

        const topic = response.data;

        if (!topic) {
          toast.error("Topic details not found");
          return;
        }
        setRefTopicID(Number(topic.refTopicID ?? 0));
        /*
         * First set the course.
         * This causes the subject API to load.
         */
        setValue("curriculumId", topic.curriculumId ?? 0);
        setValue("courseId", topic.courseId);

        setEditSubjectId(topic.subjectId);

        setValue("topicSeqNum", topic.topicSeqNum);
        setValue("topicName", topic.topicName ?? "");
        setValue("topicDurId", topic.topicDurId ?? 0);

        const durationValue = topic.topicDuration
          ? (String(topic.topicDuration).match(/^\d+/)?.[0] ?? "")
          : "";

        setValue("topicDuration", durationValue);
        setValue("remark", topic.remark ?? "");
        setValue("isActive", topic.isActive);
        setValue("isReflect", topic.isReflect);
      } catch (error) {
        console.error("Failed to fetch Topic details:", error);
        // toast.error("Failed to load Topic details");
      }
    };

    loadTopic();
  }, [isEdit, topicId, setValue]);

  /* ============================================================
     SUBMIT
  ============================================================ */

  const onSubmit = async (data: TopicFormValidation) => {
    try {
      const payload: CreateTopicRequest = {
        refTopicID: isEdit ? refTopicID : 0,
        courseId: data.courseId,
        subjectId: data.subjectId,
        topicSeqNum: data.topicSeqNum,
        topicName: data.topicName,
        topicDurId: data.topicDurId,
        topicDuration: data.topicDuration,
        remark: data.remark ?? "",
        isActive: data.isActive,
        isReflect: data.isReflect,
        branchId: Number(branchId),
      };

      console.log("TOPIC PAYLOAD:", payload);

      if (isEdit) {
        if (!topicId) {
          toast.error("Topic ID is missing");
          return;
        }

        await updateTopic(topicId, payload);

        toast.success("Topic updated successfully");

        navigate("/managetopics", {
          state: {
            updatedTopicId: topicId,
          },
        });

        return;
      }

      await createTopic(payload);

      toast.success("Topic added successfully");

      navigate("/managetopics", {
        state: {
          resetPage: true,
        },
      });
    } catch (error) {
      console.error(
        isEdit ? "Failed to update Topic:" : "Failed to add Topic:",
        error,
      );

      // toast.error(isEdit ? "Failed to update Topic" : "Failed to add Topic");
    }
  };

  /* ============================================================
     RENDER
  ============================================================ */

  return (
    <div className="min-h-screen bg-slate-50">
      <PageHeader
        description={isEdit ? "Update topic details" : "Create a new topic"}
        extraBreadcrumbs={[
          {
            label: isEdit
              ? `Edit Topic - ${topicName || "Topic"}`
              : "Add Topic",
          },
        ]}
      />

      <FormProvider {...methods}>
        <form
          onSubmit={handleSubmit(onSubmit, (errors) => {
            console.log("VALIDATION ERRORS:", errors);
          })}
          className="px-6 pb-6 space-y-5"
        >
          {/* ====================================================
              TOPIC DETAILS
          ==================================================== */}

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center gap-2.5 mb-5">
              <div className="w-8 h-8 rounded-lg bg-[#0F4C81]/10 flex items-center justify-center">
                <Layers className="w-4 h-4 text-[#0F4C81]" />
              </div>

              <h2 className="text-base font-semibold text-gray-800">
                Subject Details
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* COURSE */}
              <div>
                <label className={lbl}>Curriculum Name</label>
                <Dropdown
                  name="curriculumId"
                  disabled={isEdit}
                  options={[...curriculumOptions].sort((a, b) => {
                    const nameA = a.label.trim();
                    const nameB = b.label.trim();

                    const isNumberA = /^\d/.test(nameA);
                    const isNumberB = /^\d/.test(nameB);

                    if (isNumberA && !isNumberB) return -1;
                    if (!isNumberA && isNumberB) return 1;

                    if (isNumberA && isNumberB) {
                      const digitA = Number(nameA[0]);
                      const digitB = Number(nameB[0]);

                      if (digitA !== digitB) {
                        return digitA - digitB;
                      }
                    }

                    return nameA.localeCompare(nameB, undefined, {
                      sensitivity: "base",
                    });
                  })}
                />
              </div>
              <div>
                <label className={lbl}>
                  Course Name <span className="text-red-500">*</span>
                </label>

                <Dropdown
                  name="courseId"
                  disabled={isEdit}
                  options={[...courseOptions].sort((a, b) => {
                    const nameA = a.label.trim();
                    const nameB = b.label.trim();

                    const isNumberA = /^\d/.test(nameA);
                    const isNumberB = /^\d/.test(nameB);

                    // Numbers first
                    if (isNumberA && !isNumberB) return -1;
                    if (!isNumberA && isNumberB) return 1;

                    // Both start with numbers → compare ONLY first digit
                    if (isNumberA && isNumberB) {
                      const digitA = Number(nameA[0]);
                      const digitB = Number(nameB[0]);

                      if (digitA !== digitB) {
                        return digitA - digitB;
                      }

                      // Same first digit → alphabetical
                      return nameA.localeCompare(nameB, undefined, {
                        sensitivity: "base",
                      });
                    }

                    // Both start with letters → A-Z
                    return nameA.localeCompare(nameB, undefined, {
                      sensitivity: "base",
                    });
                  })}
                />
              </div>

              {/* SUBJECT */}

              <div>
                <label className={lbl}>
                  Subject Name <span className="text-red-500">*</span>
                </label>

                <Dropdown
                  name="subjectId"
                  disabled={isEdit}
                  options={[...subjectOptions].sort((a, b) => {
                    const nameA = a.label.trim();
                    const nameB = b.label.trim();

                    const isNumberA = /^\d/.test(nameA);
                    const isNumberB = /^\d/.test(nameB);

                    // Numbers first
                    if (isNumberA && !isNumberB) return -1;
                    if (!isNumberA && isNumberB) return 1;

                    // Both start with numbers → compare ONLY first digit
                    if (isNumberA && isNumberB) {
                      const digitA = Number(nameA[0]);
                      const digitB = Number(nameB[0]);

                      if (digitA !== digitB) {
                        return digitA - digitB;
                      }

                      // Same first digit → alphabetical
                      return nameA.localeCompare(nameB, undefined, {
                        sensitivity: "base",
                      });
                    }

                    // Both start with letters → A-Z
                    return nameA.localeCompare(nameB, undefined, {
                      sensitivity: "base",
                    });
                  })}
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center gap-2.5 mb-5">
              <div className="w-8 h-8 rounded-lg bg-[#0F4C81]/10 flex items-center justify-center">
                <Layers className="w-4 h-4 text-[#0F4C81]" />
              </div>

              <h2 className="text-base font-semibold text-gray-800">
                Topic Details
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* TOPIC NAME */}

              <div>
                <label className={lbl}>
                  Topic Name <span className="text-red-500">*</span>
                </label>

                <input
                  type="text"
                  {...register("topicName")}
                  className={`${inp} ${
                    errors.topicName
                      ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200"
                      : ""
                  }`}
                  placeholder="Enter Topic Name"
                />

                {errors.topicName && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.topicName.message}
                  </p>
                )}
              </div>

              {/* SEQUENCE */}

              <div>
                <label className={lbl}>
                  Topic Sequence Number <span className="text-red-500">*</span>
                </label>

                <input
                  type="text"
                  readOnly
                  {...register("topicSeqNum", {
                    valueAsNumber: true,
                  })}
                  className={`${inp} ${
                    errors.topicSeqNum
                      ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200"
                      : ""
                  }`}
                  min={0}
                  placeholder="Enter Sequence"
                />

                {errors.topicSeqNum && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.topicSeqNum.message}
                  </p>
                )}
              </div>

              {/* DURATION */}

              <div>
                <label className={lbl}>
                  Proposed Duration <span className="text-red-500">*</span>
                </label>

                <div className="flex gap-2">
                  <div className="w-1/2">
                    <input
                      type="text"
                      min={1}
                      className={`${inp} w-full ${
                        errors.topicDuration
                          ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200"
                          : ""
                      }`}
                      placeholder="Enter duration"
                      value={watch("topicDuration") ?? ""}
                      onChange={(e) => {
                        setValue("topicDuration", e.target.value, {
                          shouldValidate: true,
                        });
                      }}
                    />

                    {errors.topicDuration && (
                      <p className="mt-1 text-xs text-red-500">
                        {errors.topicDuration.message}
                      </p>
                    )}
                  </div>

                  <div className="w-1/2">
                    <select
                      className={`${inp} w-full ${
                        errors.topicDurId
                          ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200"
                          : ""
                      }`}
                      value={watch("topicDurId") ?? 0}
                      onChange={(e) => {
                        setValue("topicDurId", Number(e.target.value), {
                          shouldValidate: true,
                        });
                      }}
                    >
                      <option value={0}>Select</option>

                      {TOPIC_DURATION_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>

                    {errors.topicDurId && (
                      <p className="mt-1 text-xs text-red-500">
                        {errors.topicDurId.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>
              {/* REMARK */}

              <div>
                <label className={lbl}>Remark</label>

                <input
                  type="text"
                  {...register("remark")}
                  className={`${inp} ${
                    errors.remark
                      ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200"
                      : ""
                  }`}
                  placeholder="Enter Remark"
                />

                {errors.remark && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.remark.message}
                  </p>
                )}
              </div>

              {/* STATUS */}

              {isEdit && (
                <div>
                  <label className={lbl}>Status</label>

                  <div className="flex items-center gap-6 mt-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        checked={isActive === 1}
                        onChange={() => setValue("isActive", 1)}
                      />

                      <span className="text-sm text-gray-700">Active</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        checked={isActive === 0}
                        onChange={() => setValue("isActive", 0)}
                      />

                      <span className="text-sm text-gray-700">Inactive</span>
                    </label>
                  </div>
                </div>
              )}

              {/* REFLECT */}

              {isEdit && Number(branchId) === 0 && (
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    {...register("isReflect")}
                    className="w-4 h-4 accent-[#0F4C81] rounded"
                  />

                  <span className="text-sm font-medium text-gray-700">
                    Reflect in all branches
                  </span>
                </label>
              )}
            </div>
          </div>

          {/* ====================================================
              ACTION BUTTONS
          ==================================================== */}

          <div>
            <ValidationErrorSummary />
            <div className="mt-4 flex items-center justify-start gap-3">
              <button
                type="submit"
                className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-[#0F4C81] text-white text-sm font-semibold hover:bg-[#0c3d6a] transition-all shadow-sm"
              >
                <Save className="w-4 h-4" />

                {isEdit ? "Update Topic" : "Save Topic"}
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
        </form>
      </FormProvider>
    </div>
  );
}
