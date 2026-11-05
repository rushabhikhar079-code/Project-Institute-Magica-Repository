import { useEffect, useRef, useState } from "react";
import {
  Building2,
  CheckCircle,
  X,
  Save,
  Trash2,
  Upload,
  CalendarDays,
  AlertCircle,
  Layers,
} from "lucide-react";

import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../../../../redux/store";

import {
  getCurriculumById,
  updateCurriculum,
  addnewCurriculum,
  deleteCurriculum,
} from "../curriculumService";
import { fetchUserIpLocation } from "../../../../services/locationService"; // adjust path if needed
import { useNavigate } from "react-router-dom";
import PageHeader from "../../../../components/common/PageHeader/PageHeader";
import { LocationSection } from "../../../../components/common/LocationSection";

import { inp, lbl } from "../constants";

import {
  curriculumSchema,
  type CurriculumFormValidation,
} from "../../validations/curriculumSchema";
import { CurriculumForm, CurriculumSubmitPayload } from "../types";
import { toast } from "react-toastify";
import { useOutletContext } from "react-router-dom";
import ValidationErrorSummary from "../../../../components/common/ValidationErrorSummary";
import { clearGlobalError } from "../../../../redux/slices/errorSlice";
type AddCurriculumProps = {
  mode: "add" | "edit";
};
type CurriculumOutletContext = {
  resetCurriculumPagination: () => Promise<void>;
};

const DEFAULT_FORM_VALUES: CurriculumFormValidation = {
  name: "",
  description: "",
};

export default function AddCurriculum({ mode }: AddCurriculumProps) {
  const isEdit = mode === "edit";
  const { resetCurriculumPagination } =
    useOutletContext<CurriculumOutletContext>();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const curriculumId = id ? Number(id) : undefined;
  const [curriculumNameForDelete, setcurriculumNameForDelete] = useState("");
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(clearGlobalError());

    return () => {
      dispatch(clearGlobalError());
    };
  }, [dispatch]);
  const methods = useForm<CurriculumFormValidation>({
    resolver: zodResolver(curriculumSchema),
    defaultValues: DEFAULT_FORM_VALUES,
  });
  const branchId = useSelector((state: RootState) => state.branch.branchId);
  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    trigger,
    reset,
    watch,
    formState: { errors },
  } = methods;

  const curriculumName = watch("name");

  useEffect(() => {
    if (!isEdit || !curriculumId) {
      return;
    }

    const loadCurriculum = async () => {
      try {
        const response = await getCurriculumById(curriculumId);

        console.log("GET CURRICULUM RESPONSE:", response);

        const curriculum = response.data;

        console.log("CURRICULUM DETAILS:", curriculum);

        if (!curriculum) {
          toast.error("Curriculum details not found");
          return;
        }

        reset({
          name: curriculum.crclmName ?? "",
          description: curriculum.crclmDesc ?? "",
          status: curriculum.crclmStatus ?? true,
        });

        console.log("FORM VALUES AFTER RESET:", getValues());
      } catch (error) {
        console.error("Failed to fetch Curriculum details:", error);
        // toast.error("Failed to load Curriculum details");
      }
    };

    loadCurriculum();
  }, [isEdit, curriculumId, reset, getValues]);
  const status = watch("status");
  const onSubmit = async (data: CurriculumFormValidation) => {
    console.log("FORM DATA:", data);

    try {
      const payload: CurriculumSubmitPayload = {
        crclmId: isEdit ? (curriculumId ?? 0) : 0,
        crclmName: data.name,
        crclmDesc: data.description,
        crclmStatus: isEdit ? (data.status ?? true) : true,
        branchId,
      };
      console.log("CURRICULUM PAYLOAD:", payload);

      // =========================
      // EDIT Curriculum
      // =========================
      if (isEdit) {
        if (!curriculumId) {
          toast.error("Curriculum ID is missing");
          return;
        }

        const response = await updateCurriculum(payload);

        console.log("Curriculum updated successfully:", response);

        toast.success("Curriculum updated successfully");

        navigate("/managecurriculums", {
          state: {
            updatedCurriculumId: curriculumId,
          },
        });

        return;
      }

      // =========================
      // ADD Curriculum
      // =========================
      const response = await addnewCurriculum(payload);

      console.log("Curriculum added successfully:", response);

      toast.success("Curriculum added successfully");

      await resetCurriculumPagination();

      navigate("/managecurriculums");
    } catch (error) {
      console.error(
        isEdit ? "Failed to update Curriculum:" : "Failed to add Curriculum:",
        error,
      );

      // toast.error(
      //   isEdit ? "Failed to update Curriculum" : "Failed to add Curriculum",
      // );
    }
  };
  const handleDelete = async () => {
    if (!curriculumId) {
      toast.error("Curriculum ID is missing");
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete "${curriculumNameForDelete || curriculumName || "this Curriculum"}"?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      await deleteCurriculum(curriculumId);

      toast.success(
        `Curriculum deleted successfully: ${
          curriculumNameForDelete || curriculumName || "Curriculum"
        } (ID: ${curriculumId})`,
      );

      console.log(
        `Curriculum deleted successfully: ${
          curriculumNameForDelete || curriculumName || "Curriculum"
        } (ID: ${curriculumId})`,
      );

      navigate(-1);
    } catch (error) {
      console.error("Failed to delete Curriculum:", error);
      // toast.error("Failed to delete Curriculum");
    }
  };
  return (
    <div className="min-h-screen bg-slate-50">
      <PageHeader
        description={
          isEdit ? "Update curriculum details" : "Create a new curriculum"
        }
        extraBreadcrumbs={[
          {
            label: isEdit
              ? `Edit Curriculum - ${curriculumName || "Curriculum"}`
              : "Add Curriculum",
          },
        ]}
      />

      <FormProvider {...methods}>
        <form
          onSubmit={handleSubmit(onSubmit, (errors) => {
            console.log("❌ VALIDATION ERRORS:", errors);
          })}
          className="px-6 pb-6 space-y-5"
        >
          {" "}
          {/* Breadcrumbs */}
          {/* Curriculum Details Card */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center gap-2.5 mb-5">
              <div className="w-8 h-8 rounded-lg bg-[#0F4C81]/10 flex items-center justify-center">
                <Layers className="w-4 h-4 text-[#0F4C81]" />
              </div>
              <h2 className="text-base font-semibold text-gray-800">
                Curriculum Details
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={lbl}>
                  Curriculum Name <span className="text-red-500">*</span>
                </label>{" "}
                <input
                  type="text"
                  {...register("name")}
                  className={inp}
                  placeholder="Enter Curriculum name"
                />
                {errors.name && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.name.message}
                  </p>
                )}
              </div>

              <div className="sm:col-span-2">
                <label className={lbl}>Description</label>

                <textarea
                  {...register("description")}
                  className={`${inp} !h-20 !min-h-20 !overflow-hidden resize-none whitespace-normal break-words`}
                  placeholder="Enter description..."
                />

                {errors.description && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.description.message}
                  </p>
                )}
              </div>
              {isEdit && (
                <div>
                  <label className={lbl}>Status</label>

                  <div className="flex items-center gap-6 mt-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        value="true"
                        checked={status === true}
                        onChange={() => setValue("status", true)}
                      />
                      <span className="text-sm text-gray-700">Active</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        value="false"
                        checked={status === false}
                        onChange={() => setValue("status", false)}
                      />
                      <span className="text-sm text-gray-700">Inactive</span>
                    </label>
                  </div>

                  {errors.status && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.status.message}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
          {/* Action Buttons */}
          <div>
            <ValidationErrorSummary />
            <div className="mt-4 flex items-center justify-start gap-3">
              {isEdit ? (
                <>
                  <button
                    type="submit"
                    className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-[#0F4C81] text-white text-sm font-semibold hover:bg-[#0c3d6a] transition-all shadow-sm"
                  >
                    <Save className="w-4 h-4" />
                    Update
                  </button>

                  <button
                    type="button"
                    onClick={() => navigate("..")}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-lg border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-all"
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </button>

                  {/* <button
                  type="button"
                  onClick={handleDelete}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-lg border border-red-200 text-red-600 text-sm font-medium hover:bg-red-50 transition-all ml-auto"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button> */}
                </>
              ) : (
                <>
                  <button
                    type="submit"
                    className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-[#0F4C81] text-white text-sm font-semibold hover:bg-[#0c3d6a] transition-all shadow-sm"
                  >
                    <Save className="w-4 h-4" />
                    Save Curriculum
                  </button>

                  <button
                    type="button"
                    onClick={() => navigate("..")}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-lg border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-all"
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </button>
                </>
              )}
            </div>
          </div>
        </form>
      </FormProvider>
    </div>
  );
}
