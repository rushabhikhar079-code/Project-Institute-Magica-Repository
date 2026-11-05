import { GraduationCap, Plus, Trash2 } from "lucide-react";
import { forwardRef, useImperativeHandle } from "react";
import { useFormContext } from "react-hook-form";

import { DataTable } from "../../../../../../app/components/common/DataTable";
import { TextBox } from "../../../../../components/common/TextBox";

import {
  educationQualificationSchema,
  type EnquiryFormData,
} from "../../validations/enquirySchema";

interface EducationQualification {
  Id: number;
  Degree: string;
  Collegename: string;
  Stream: string;
  Percentage: string;
  Year1: string;
  tempId: string;
}

export interface EducationRef {
  saveQualification: () => boolean;
}

const Education = forwardRef<EducationRef>((_, ref) => {
  const { getValues, setValue, setError, clearErrors, watch } =
    useFormContext<EnquiryFormData>();

  const qualifications = watch("EducationQualifications") || [];

  /**
   * Validate current qualification fields.
   *
   * Rules:
   * - If nothing is entered -> nothing should be added.
   * - Degree is mandatory whenever a qualification is being created.
   * - Other fields are validated only when entered.
   */
  const validateQualification = () => {
    const data = getValues();

    clearErrors(["Degree", "Collegename", "Stream", "Percentage", "Year1"]);

    const fields = {
      Degree: data.Degree?.trim() || "",
      Collegename: data.Collegename?.trim() || "",
      Stream: data.Stream?.trim() || "",
      Percentage: data.Percentage?.trim() || "",
      Year1: data.Year1?.trim() || "",
    };

    // Nothing entered -> don't create a qualification
    const hasData = Object.values(fields).some((value) => value !== "");

    if (!hasData) {
      return false;
    }

    // Degree is mandatory
    if (!fields.Degree) {
      setError("Degree", {
        type: "manual",
        message: "Degree is required.",
      });

      return false;
    }

    // Validate only fields that contain values
    Object.entries(fields).forEach(([field, value]) => {
      if (!value) return;

      const result =
        educationQualificationSchema.shape[
          field as keyof typeof educationQualificationSchema.shape
        ].safeParse(value);

      if (!result.success) {
        setError(field as keyof EnquiryFormData, {
          type: "manual",
          message: result.error.issues[0]?.message,
        });
      }
    });

    // Check whether any validation failed
    const hasError = Object.entries(fields).some(([field, value]) => {
      if (!value) return false;

      const result =
        educationQualificationSchema.shape[
          field as keyof typeof educationQualificationSchema.shape
        ].safeParse(value);

      return !result.success;
    });

    return !hasError;
  };

  /**
   * Save the currently entered qualification.
   *
   * This is also exposed to the parent so that clicking
   * "Next" can perform exactly the same validation.
   */
  const saveCurrentQualification = () => {
    const data = getValues();

    const hasData =
      !!data.Degree?.trim() ||
      !!data.Collegename?.trim() ||
      !!data.Stream?.trim() ||
      !!data.Percentage?.trim() ||
      !!data.Year1?.trim();

    // Nothing entered -> don't create a row.
    // This is valid because education itself is optional.
    if (!hasData) {
      return true;
    }

    // Validate before creating the DataTable row.
    if (!validateQualification()) {
      return false;
    }

    const newQualification: EducationQualification = {
      Id: 0,
      Degree: data.Degree?.trim() || "",
      Collegename: data.Collegename?.trim() || "",
      Stream: data.Stream?.trim() || "",
      Percentage: data.Percentage?.trim() || "",
      Year1: data.Year1?.trim() || "",
      tempId: crypto.randomUUID(),
    };

    setValue("EducationQualifications", [...qualifications, newQualification], {
      shouldDirty: true,
      shouldValidate: true,
    });

    // Clear textbox fields after adding.
    setValue("Degree", "");
    setValue("Collegename", "");
    setValue("Stream", "");
    setValue("Percentage", "");
    setValue("Year1", "");

    return true;
  };

  /**
   * Expose saveQualification() to the parent.
   */
  useImperativeHandle(ref, () => ({
    saveQualification: saveCurrentQualification,
  }));

  const handleAddQualification = () => {
    saveCurrentQualification();
  };

  const handleDeleteQualification = (tempId: string) => {
    setValue(
      "EducationQualifications",
      qualifications.filter((item) => item.tempId !== tempId),
    );
  };

  const sortedQualifications = [...qualifications].sort((a, b) => {
    const yearA = Number(a.Year1);
    const yearB = Number(b.Year1);

    // Empty/invalid years go to the end.
    if (Number.isNaN(yearA)) return 1;
    if (Number.isNaN(yearB)) return -1;

    return yearB - yearA;
  });

  const isQualificationEmpty =
    !watch("Degree")?.trim() &&
    !watch("Collegename")?.trim() &&
    !watch("Stream")?.trim() &&
    !watch("Percentage")?.trim() &&
    !watch("Year1")?.trim();

  const columns = [
    {
      key: "action",
      header: "Action",
      sortable: false,
      width: "50px",
      align: "center" as const,
      render: (row: EducationQualification) => (
        <button
          type="button"
          onClick={() => handleDeleteQualification(row.tempId)}
          className="text-red-500 hover:text-red-700 transition-colors"
          title="Delete"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      ),
    },
    {
      key: "Degree",
      header: "Degree",
      sortable: false,
    },
    {
      key: "Collegename",
      header: "College Name",
      sortable: false,
    },
    {
      key: "Stream",
      header: "Stream",
      sortable: false,
    },
    {
      key: "Percentage",
      header: "Percentage",
      sortable: false,
    },
    {
      key: "Year1",
      header: "Year",
      sortable: false,
    },
  ];

  return (
    <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <div className="flex items-center gap-2.5 mb-5">
        <div className="w-8 h-8 rounded-lg bg-[#0F4C81]/10 flex items-center justify-center shrink-0">
          <GraduationCap className="w-4 h-4 text-[#0F4C81]" />
        </div>

        <h2 className="text-base font-semibold text-gray-800">
          Educational Qualifications
        </h2>
      </div>

      <div className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <TextBox
            name="Degree"
            label="Degree"
            placeholder="Enter degree"
            required={false}
          />

          <TextBox
            name="Collegename"
            label="College Name"
            placeholder="Enter college name"
            required={false}
          />

          <TextBox
            name="Stream"
            label="Stream"
            placeholder="Enter stream"
            required={false}
          />

          <TextBox
            name="Percentage"
            label="Percentage"
            placeholder="Enter percentage"
            required={false}
          />

          <TextBox
            name="Year1"
            label="Year"
            placeholder="Enter passing year"
            required={false}
          />
        </div>

        <button
          type="button"
          onClick={handleAddQualification}
          disabled={isQualificationEmpty}
          className={`mt-4 flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
            isQualificationEmpty
              ? "text-gray-400 border border-gray-200 bg-gray-50 cursor-not-allowed"
              : "text-[#0F4C81] border border-[#0F4C81]/40 hover:bg-[#0F4C81]/5"
          }`}
        >
          <Plus className="w-4 h-4" />
          Add Another Qualification
        </button>

        {qualifications.length > 0 && (
          <div className="mt-5">
            <DataTable
              columns={columns}
              data={sortedQualifications}
              rowKey="tempId"
              emptyMessage="No educational qualifications added."
            />
          </div>
        )}
      </div>
    </section>
  );
});

Education.displayName = "Education";

export default Education;
