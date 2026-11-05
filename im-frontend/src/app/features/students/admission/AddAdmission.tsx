//TODO: Complete registration ui
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FormProvider, useForm, useFormContext } from "react-hook-form";
import { ArrowLeft, ArrowRight, ClipboardList } from "lucide-react";

import { Button } from "../../../components/common/Button";
import RegistrationPersonal from "./components/RegistrationPersonal";
import Academic from "./components/Academic";
import FamilyWork from "./components/FamilyWork";
import Education from "./components/Education";
import Remarks from "./components/Remarks";
import { useAppDispatch, useAppSelector } from "../../../redux/hooks";
import { loadIpLocation } from "../../../redux/slices/locationSlice";
import {
  fetchCities,
  fetchStates,
  LocationDto,
} from "../../../services/locationService";
import { SearchableSelect } from "../../../components/common/SearchableSelect";
import EnquiryStepper from "../enquiry/components/addEnquiry/EnquiryStepper";
import { registerStudent } from "./admissionService";
import { toast } from "react-toastify";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  admissionValidationSchema,
  type AdmissionFormValues,
} from "./AdmissionValidationSchema";
import { useDispatch } from "react-redux";
import { clearGlobalError } from "../../../redux/slices/errorSlice";
import ValidationErrorSummary from "../../../components/common/ValidationErrorSummary";
// type AdmissionFormValues = {
//   // Registration
//   regDate: string;
//   regNo: string;
//   rollNo: string;
//   status: number;

//   // Personal
//   gender: number | "";
//   salutation: string;
//   firstName: string;
//   middleName: string;
//   lastName: string;
//   mobile: string;
//   email: string;
//   biometricAttendanceId: string;
//   dateOfBirth: string;
//   age: string;
//   category: string;
//   Image: File | null;

//   // Address
//   address: string;
//   countryId: number;
//   stateId: number;
//   cityId: number;
//   pinCode: string;
//   sameAsAddress: boolean;
//   permanentAddress: string;
//   countryIdC: number;
//   stateIdC: number;
//   cityIdC: number;
//   pinCodeC: string;

//   country: string;
//   state: string;
//   city: string;

//   countryC: string;
//   stateC: string;
//   cityC: string;

//   // Academic
//   selectedCourses: number[];
//   selectedSubjects: number[];
//   batchIds: number[];
//   otherFeesIds: number[];
//   selectedSubjectsPayload: string;

//   // Family
//   fatherFirstName: string;
//   fatherMiddleName: string;
//   fatherLastName: string;
//   motherFirstName: string;
//   motherMiddleName: string;
//   motherLastName: string;
//   mobile1: string;
//   mobile2: string;
//   parentCompanyName: string;
//   parentGSTNo: string;
//   workStatus: string;
//   occupation: string;
//   organization: string;
//   salary: string;

//   // Education
//   education: {
//     qualification: string;
//     school: string;
//     stream: string;
//     percentage: string;
//     year: string;
//   }[];

//   // Remarks
//   source: string;
//   comments: string;
//   remarks: string;
// };

const admissionSteps = [
  "Registration\n& Personal",
  "Academic",
  "Family &\nWork",
  "Education",
  "Remarks",
];

const GENDER_OPTIONS = [
  { label: "Male", value: 1 },
  { label: "Female", value: 2 },
  { label: "Other", value: 3 },
];

const SALUTATION_OPTIONS = [
  { label: "Ms/Mrs", value: "Ms/Mrs" },
  { label: "Mr", value: "Mr" },
  { label: "Ms", value: "Ms" },
];

const SOURCE_OPTIONS = [
  { label: "Advertisement", value: "Advertisement" },
  { label: "Friend / Reference", value: "Reference" },
  { label: "Website", value: "Website" },
  { label: "Social Media", value: "Social Media" },
  { label: "Other", value: "Other" },
];

const EMPTY_FORM: AdmissionFormValues = {
  regDate: new Date().toISOString().slice(0, 10),
  regNo: "",
  rollNo: "",
  status: 1,

  gender: 0,
  salutation: "",
  firstName: "",
  middleName: "",
  lastName: "",
  mobile: "",
  email: "",
  biometricAttendanceId: "",
  dateOfBirth: "",
  age: "",
  category: "",
  Image: null,
  address: "",
  countryId: 0,
  stateId: 0,
  cityId: 0,
  pinCode: "",
  sameAsAddress: false,
  permanentAddress: "",
  countryIdC: 0,
  stateIdC: 0,
  cityIdC: 0,
  pinCodeC: "",
  country: "",
  state: "",
  city: "",
  countryC: "",
  stateC: "",
  cityC: "",

  selectedCourses: [],
  selectedSubjects: [],
  batchIds: [],
  otherFeesIds: [],
  selectedSubjectsPayload: "",

  fatherFirstName: "",
  fatherMiddleName: "",
  fatherLastName: "",
  motherFirstName: "",
  motherMiddleName: "",
  motherLastName: "",
  mobile1: "",
  mobile2: "",
  parentCompanyName: "",
  parentGSTNo: "",
  workStatus: "No",
  occupation: "",
  organization: "",
  salary: "",

  education: [
    {
      qualification: "",
      school: "",
      stream: "",
      percentage: "",
      year: "",
    },
  ],

  source: "",
  comments: "",
  remarks: "",

  otherCity: "",
  otherCityC: "",
};

const inputClass =
  "w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 outline-none transition focus:border-[#0F4C81] focus:ring-2 focus:ring-[#0F4C81]/10";

const sectionClass =
  "rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6";

function SectionHeading({
  icon: Icon,
  children,
}: {
  icon: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex items-center gap-3">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-[#0F4C81]">
        <Icon size={18} />
      </div>
      <h2 className="text-base font-semibold text-gray-900">{children}</h2>
    </div>
  );
}

function FieldGroup({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mt-6 first:mt-0">
      <div className="mb-4 flex items-center gap-3">
        <span className="text-[11px] font-bold text-[#0F4C81] uppercase tracking-widest whitespace-nowrap">
          {title}
        </span>
        <div className="flex-1 h-px bg-[#0F4C81]/15" />
      </div>
      {children}
    </div>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;

  return <p className="mt-1 text-xs text-red-500">{message}</p>;
}

type AddAdmissionProps = {
  onSaveSuccess?: () => void;
};

export default function AddAdmission({ onSaveSuccess }: AddAdmissionProps) {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { branchId } = useAppSelector((state) => state.branch);
  const { ipLocation, countries, initialStates, initialCities } =
    useAppSelector((state) => state.location);

  useEffect(() => {
    dispatch(loadIpLocation());
  }, [dispatch]);
  const [activeStep, setActiveStep] = useState(0);
  const [photoName, setPhotoName] = useState("");

  // const methods = useForm<AdmissionFormValues>({
  //   defaultValues: EMPTY_FORM,
  //   mode: "onTouched",
  // });
  const methods = useForm<AdmissionFormValues>({
    defaultValues: EMPTY_FORM,
    mode: "onTouched",
    resolver: zodResolver(admissionValidationSchema),
  });
  const { handleSubmit, trigger, getValues, setValue, watch } = methods;

  // const sameAsAddress = watch("sameAsAddress");

  // Correspondence Address — source fields
  // const correspondenceAddress = watch("address");
  // const correspondenceCountry = watch("countryC");
  // const correspondenceState = watch("stateC");
  // const correspondenceCity = watch("cityC");
  // const correspondenceCountryId = watch("countryIdC");
  // const correspondenceStateId = watch("stateIdC");
  // const correspondenceCityId = watch("cityIdC");
  // const correspondencePinCode = watch("pinCodeC");

  // const workStatus = watch("workStatus");
  // const dob = watch("dateOfBirth");

  // Copy Correspondence Address to Permanent Address
  const sameAsAddress = watch("sameAsAddress");

  // Correspondence Address is the source
  const correspondenceAddress = watch("address");
  const correspondenceCountry = watch("countryC");
  const correspondenceState = watch("stateC");
  const correspondenceCity = watch("cityC");
  const correspondenceCountryId = watch("countryIdC");
  const correspondenceStateId = watch("stateIdC");
  const correspondenceCityId = watch("cityIdC");
  const correspondencePinCode = watch("pinCodeC");
  const correspondenceOtherCity = watch("otherCityC");
  const dob = watch("dateOfBirth");

  useEffect(() => {
    if (!sameAsAddress) return;

    setValue("permanentAddress", correspondenceAddress, {
      shouldDirty: true,
      shouldValidate: true,
    });

    setValue("country", correspondenceCountry, {
      shouldDirty: true,
      shouldValidate: true,
    });

    setValue("state", correspondenceState, {
      shouldDirty: true,
      shouldValidate: true,
    });

    setValue("city", correspondenceCity, {
      shouldDirty: true,
      shouldValidate: true,
    });

    setValue("countryId", correspondenceCountryId, {
      shouldDirty: true,
      shouldValidate: true,
    });

    setValue("stateId", correspondenceStateId, {
      shouldDirty: true,
      shouldValidate: true,
    });

    setValue("cityId", correspondenceCityId, {
      shouldDirty: true,
      shouldValidate: true,
    });

    setValue("pinCode", correspondencePinCode, {
      shouldDirty: true,
      shouldValidate: true,
    });

    setValue("otherCity", correspondenceOtherCity, {
      shouldDirty: true,
      shouldValidate: true,
    });
  }, [
    sameAsAddress,
    correspondenceAddress,
    correspondenceCountry,
    correspondenceState,
    correspondenceCity,
    correspondenceCountryId,
    correspondenceStateId,
    correspondenceCityId,
    correspondencePinCode,
    correspondenceOtherCity,
    setValue,
  ]);
  // const getStepFields = (step: number): (keyof AdmissionFormValues)[] => {
  //   switch (step) {
  //     case 0:
  //       return [
  //         "regDate",
  //         "regNo",
  //         "gender",
  //         "firstName",
  //         "mobile",
  //         "email",
  //         "address",
  //       ];
  //     case 1:
  //       return ["selectedCourses", "selectedSubjects"];
  //     case 2:
  //       return ["fatherFirstName"];
  //     default:
  //       return [];
  //   }
  // };
  const getStepFields = (step: number): (keyof AdmissionFormValues)[] => {
    switch (step) {
      case 0:
        return [
          "regDate",
          "regNo",
          "gender",
          "firstName",
          "mobile",
          "email", // Correspondence address
          "address",
          "countryIdC",
          "stateIdC",
          "cityIdC",
          "otherCityC",
          "pinCodeC",

          // Permanent address
          "permanentAddress",
          "countryId",
          "stateId",
          "cityId",
          "otherCity",
          "pinCode",
        ];

      case 1:
        return ["selectedCourses", "selectedSubjects"];

      case 2:
        return [
          "fatherFirstName",
          "motherFirstName",
          "mobile1",
          "mobile2",
          "workStatus",
          "occupation",
          "organization",
          "salary",
        ];

      case 3:
        return ["education"];

      case 4:
        return ["source", "comments", "remarks"];

      default:
        return [];
    }
  };
  const handleNext = async (e?: React.MouseEvent<HTMLButtonElement>) => {
    e?.preventDefault();
    e?.stopPropagation();

    // Do not move beyond the final step
    if (activeStep === admissionSteps.length - 1) {
      return;
    }

    const valid = await trigger(getStepFields(activeStep));

    if (!valid) {
      return;
    }

    setActiveStep((current) =>
      Math.min(current + 1, admissionSteps.length - 1),
    );

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleStepChange = async (nextStep: number) => {
    if (nextStep === activeStep) return;

    // Validate each step when moving forward.
    if (nextStep > activeStep) {
      for (let step = activeStep; step < nextStep; step++) {
        const isValid = await trigger(getStepFields(step));

        if (!isValid) {
          setActiveStep(step);
          window.scrollTo({ top: 0, behavior: "smooth" });
          return;
        }
      }
    }

    setActiveStep(nextStep);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handlePrevious = () => {
    setActiveStep((current) => Math.max(current - 1, 0));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const [saving, setSaving] = useState(false);

  const fileToBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = () => {
        const result = reader.result;

        if (typeof result !== "string") {
          reject(new Error("Unable to read image"));
          return;
        }

        // Remove the data:image/...;base64, prefix.
        resolve(result.split(",")[1] ?? "");
      };

      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });

  const handleSave = async (values: AdmissionFormValues) => {
    if (!branchId) {
      alert("Please select a branch before saving.");
      return;
    }

    setSaving(true);

    try {
      const photo =
        values.Image instanceof File ? await fileToBase64(values.Image) : null;

      const payload = {
        // Registration
        regDate: values.regDate,
        regNo: values.regNo,
        rollNo: values.rollNo || null,
        status: values.status,

        // Personal
        gender: Number(values.gender),
        salutation: values.salutation,
        firstName: values.firstName.trim(),
        middleName: values.middleName || "",
        lastName: values.lastName || "",
        mobile: values.mobile,
        email: values.email,
        biometricAttendanceId: values.biometricAttendanceId || null,
        dateOfBirth: values.dateOfBirth || null,
        age: values.age ? Number(values.age) : null,
        category: values.category || null,
        photo,

        // Academic
        selectedCourses: values.selectedCourses.join(","),
        // selectedSubjects: values.selectedSubjects.join(","),
        selectedSubjects: values.selectedSubjectsPayload,
        otherFeesIds:
          values.otherFeesIds.length > 0 ? values.otherFeesIds.join(",") : null,
        batchIds: values.batchIds,

        // Correspondence address
        address: values.address,
        countryIdC: values.countryIdC,
        stateIdC: values.stateIdC,
        cityIdC: values.cityIdC,
        otherCityC: values.otherCityC || null,
        pinCodeC: values.pinCodeC || null,

        // Permanent address
        permanentAddress: values.permanentAddress || null,
        countryId: values.countryId,
        stateId: values.stateId,
        cityId: values.cityId,
        otherCity: values.otherCity || null,
        pinCode: values.pinCode || null,

        // Family
        fatherFirstName: values.fatherFirstName,
        fatherMiddleName: values.fatherMiddleName || null,
        fatherLastName: values.fatherLastName || null,
        mobile1: values.mobile1 || null,
        mobile2: values.mobile2 || null,
        parentCompanyName: values.parentCompanyName || null,
        parentGSTNo: values.parentGSTNo || null,

        // Work
        workStatus: values.workStatus || "No",
        occupation: values.occupation || null,
        organization: values.organization || null,
        salary: values.salary ? Number(values.salary) : null,

        // Education
        education: values.education
          .filter((item) => item.qualification.trim() !== "")
          .map((item) => ({
            degree: item.qualification,
            college: item.school || null,
            stream: item.stream || null,
            percentage: item.percentage || null,
            year: item.year || null,
          })),

        // Remarks
        source: values.source || null,
        comments: values.comments || null,
        remarks: values.remarks || null,

        // Branch
        branchId,
      };

      const response = await registerStudent(payload);

      if (response.data?.success) {
        toast.success(
          `Admission saved successfully. Registration No: ${
            response.data.regNo ?? values.regNo
          }`,
        );

        // Clear the form
        methods.reset(EMPTY_FORM);
        setActiveStep(0);
        setPhotoName("");

        // Redirect to Admission List
        navigate("/admission/list");
      } else {
        toast.error(response.message || "Failed to save admission.");
      }
    } catch (error: any) {
      console.error("Error saving admission:", error);

      // Backend validation errors are displayed in ValidationErrorSummary
      if (error?.response?.status === 400) {
        return;
      }

      const message =
        error?.response?.data?.message ??
        error?.message ??
        "An error occurred while saving admission.";

      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select an image file.");
      event.target.value = "";
      return;
    }

    setPhotoName(file.name);
    // Photo upload / byte-array conversion will be connected with the API.
  };

  const calculateAge = (value: string) => {
    if (!value) return "";

    const birthDate = new Date(value);
    if (Number.isNaN(birthDate.getTime())) return "";

    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();

    const beforeBirthday =
      today.getMonth() < birthDate.getMonth() ||
      (today.getMonth() === birthDate.getMonth() &&
        today.getDate() < birthDate.getDate());

    if (beforeBirthday) age--;

    return age >= 0 ? String(age) : "";
  };

  const addEducation = () => {
    setValue("education", [
      ...getValues("education"),
      {
        qualification: "",
        school: "",
        stream: "",
        percentage: "",
        year: "",
      },
    ]);
  };

  const removeEducation = (index: number) => {
    const education = getValues("education");

    if (education.length <= 1) return;

    setValue(
      "education",
      education.filter((_, i) => i !== index),
    );
  };
  type AddressLocationFieldsProps = {
    suffix?: "C" | "";
    disabled?: boolean;
    countries: LocationDto[];
    initialStates?: LocationDto[];
    initialCities?: LocationDto[];
  };
  const handleSameAddress = (checked: boolean) => {
    setValue("sameAsAddress", checked, {
      shouldDirty: true,
    });
  };

  function AddressLocationFields({
    suffix = "",
    disabled = false,
    countries,
    initialStates = [],
    initialCities = [],
  }: AddressLocationFieldsProps) {
    const { watch, setValue, getValues } =
      useFormContext<AdmissionFormValues>();

    const countryNameField = suffix ? "countryC" : "country";
    const stateNameField = suffix ? "stateC" : "state";
    const cityNameField = suffix ? "cityC" : "city";

    const countryIdField = suffix ? "countryIdC" : "countryId";
    const stateIdField = suffix ? "stateIdC" : "stateId";
    const cityIdField = suffix ? "cityIdC" : "cityId";

    const countryId = watch(countryIdField);
    const stateId = watch(stateIdField);

    const [states, setStates] = useState<LocationDto[]>(initialStates);
    const [cities, setCities] = useState<LocationDto[]>(initialCities);

    useEffect(() => {
      setStates(initialStates);
    }, [initialStates]);

    useEffect(() => {
      setCities(initialCities);
    }, [initialCities]);

    useEffect(() => {
      let cancelled = false;

      if (!countryId || Number(countryId) === 0) {
        setStates([]);
        return;
      }

      fetchStates(Number(countryId))
        .then((data) => {
          if (!cancelled) setStates(data);
        })
        .catch((error) => {
          console.error("Failed to load states:", error);
          if (!cancelled) setStates([]);
        });

      return () => {
        cancelled = true;
      };
    }, [countryId]);

    useEffect(() => {
      let cancelled = false;

      if (!stateId || Number(stateId) === 0) {
        setCities([]);
        return;
      }

      fetchCities(Number(stateId))
        .then((data) => {
          if (!cancelled) setCities(data);
        })
        .catch((error) => {
          console.error("Failed to load cities:", error);
          if (!cancelled) setCities([]);
        });

      return () => {
        cancelled = true;
      };
    }, [stateId]);

    const selectCountry = (name: string) => {
      const selected = countries.find((item) => item.name === name);

      if (!selected) {
        setValue(countryNameField, "", { shouldDirty: true });
        setValue(countryIdField, 0, { shouldDirty: true });
        setValue(stateNameField, "", { shouldDirty: true });
        setValue(stateIdField, 0, { shouldDirty: true });
        setValue(cityNameField, "", { shouldDirty: true });
        setValue(cityIdField, 0, { shouldDirty: true });
        setStates([]);
        setCities([]);
        return;
      }

      if (Number(getValues(countryIdField)) === Number(selected.id)) return;

      setValue(countryIdField, Number(selected.id), { shouldDirty: true });
      setValue(stateNameField, "", { shouldDirty: true });
      setValue(stateIdField, 0, { shouldDirty: true });
      setValue(cityNameField, "", { shouldDirty: true });
      setValue(cityIdField, 0, { shouldDirty: true });

      setStates([]);
      setCities([]);
    };

    const selectState = (name: string) => {
      const selected = states.find((item) => item.name === name);

      if (!selected) {
        setValue(stateNameField, "", { shouldDirty: true });
        setValue(stateIdField, 0, { shouldDirty: true });
        setValue(cityNameField, "", { shouldDirty: true });
        setValue(cityIdField, 0, { shouldDirty: true });
        setCities([]);
        return;
      }

      if (Number(getValues(stateIdField)) === Number(selected.id)) return;

      setValue(stateIdField, Number(selected.id), { shouldDirty: true });
      setValue(cityNameField, "", { shouldDirty: true });
      setValue(cityIdField, 0, { shouldDirty: true });
      setCities([]);
    };

    const selectCity = (name: string) => {
      const selected = cities.find((item) => item.name === name);

      setValue(cityIdField, Number(selected?.id ?? 0), {
        shouldDirty: true,
      });
    };

    useEffect(() => {
      if (!ipLocation?.countryId || !countries.length) return;

      const currentCountryId = getValues("countryIdC");

      // Don't overwrite an existing selection.
      if (Number(currentCountryId) !== 0) return;

      const country = countries.find(
        (item) => Number(item.id) === Number(ipLocation.countryId),
      );

      if (!country) return;

      setValue("countryC", country.name);
      setValue("countryIdC", Number(ipLocation.countryId));

      if (ipLocation.stateId) {
        setValue("stateC", ipLocation.stateName ?? "");
        setValue("stateIdC", Number(ipLocation.stateId));
      }

      if (ipLocation.cityId) {
        setValue("cityC", ipLocation.cityName ?? "");
        setValue("cityIdC", Number(ipLocation.cityId));
      }
    }, [ipLocation, countries, getValues, setValue]);

    const dispatch = useDispatch();
    useEffect(() => {
      dispatch(clearGlobalError());

      return () => {
        dispatch(clearGlobalError());
      };
    }, [dispatch]);

    return (
      <>
        <SearchableSelect
          name={countryNameField}
          label="Country"
          placeholder="Select Country"
          options={countries.map((item) => item.name)}
          required={false}
          onSelectCallback={selectCountry}
        />

        <SearchableSelect
          name={stateNameField}
          label="State"
          placeholder="Select State"
          options={states.map((item) => item.name)}
          required={false}
          onSelectCallback={selectState}
        />

        <SearchableSelect
          name={cityNameField}
          label="City"
          placeholder="Select City"
          options={cities.map((item) => item.name)}
          required={false}
          onSelectCallback={selectCity}
        />
      </>
    );
  }
  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(handleSave)} className="space-y-5">
        {/* Page heading */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 bg-white px-5 py-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handlePrevious}
              disabled={activeStep === 0}
              className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-30"
              aria-label="Previous step"
            >
              <ArrowLeft size={18} />
            </button>

            <div>
              <h1 className="text-lg font-semibold text-gray-900">
                Student Registration
              </h1>
              <p className="text-xs text-gray-500">
                Step {activeStep + 1} / {admissionSteps.length} —{" "}
                {admissionSteps[activeStep].replace("\n", " ")}
              </p>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            className="!inline-flex !flex-row !h-10 !w-auto !items-center !justify-center !gap-2 !whitespace-nowrap !rounded-xl !border-transparent !bg-[#E8EEF2] !px-4 !text-[#15558A] hover:!bg-[#DCE6EC]"
            onClick={() =>
              alert("Update from Enquiry will be connected later.")
            }
          >
            <ClipboardList
              size={15}
              className="!inline-block !shrink-0 !mr-1"
            />
            <span className="!whitespace-nowrap">Update from Enquiry</span>
          </Button>
        </div>
        <div className="space-y-6">
          <EnquiryStepper
            steps={admissionSteps}
            currentStep={activeStep}
            onStepChange={handleStepChange}
          />
        </div>

        {/* Stepper */}
        {/* <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white px-4 py-5">
          <div className="mx-auto flex min-w-[600px] max-w-5xl items-start">
            {STEPS.map((step, index) => {
              const Icon = step.icon;
              const completed = index < activeStep;
              const active = index === activeStep;

              return (
                <div key={step.label} className="flex flex-1 items-start">
                  <button
                    type="button"
                    onClick={async () => {
                      if (index < activeStep) setActiveStep(index);
                      else if (index === activeStep + 1) await handleNext();
                    }}
                    className="flex min-w-0 flex-1 flex-col items-center gap-2"
                  >
                    <span
                      className={`flex h-10 w-10 items-center justify-center rounded-full border transition ${
                        active
                          ? "border-[#0F4C81] bg-[#0F4C81] text-white ring-4 ring-blue-100"
                          : completed
                            ? "border-[#0F4C81] bg-[#0F4C81] text-white"
                            : "border-gray-200 bg-gray-100 text-gray-400"
                      }`}
                    >
                      {completed ? <Check size={17} /> : <Icon size={17} />}
                    </span>

                    <span
                      className={`max-w-28 text-center text-xs ${
                        active
                          ? "font-semibold text-[#0F4C81]"
                          : "text-gray-500"
                      }`}
                    >
                      {step.label}
                    </span>
                  </button>

                  {index < admissionSteps.length - 1 && (
                    <div
                      className={`mt-5 h-px flex-1 ${
                        completed ? "bg-[#0F4C81]" : "bg-gray-200"
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div> */}

        <RegistrationPersonal
          activeStep={activeStep}
          inputClass={inputClass}
          sectionClass={sectionClass}
          photoName={photoName}
          handlePhotoChange={handlePhotoChange}
          calculateAge={calculateAge}
          dob={dob}
          countries={countries}
          initialStates={initialStates}
          initialCities={initialCities}
          AddressLocationFields={AddressLocationFields}
          SectionHeading={SectionHeading}
          FieldGroup={FieldGroup}
          FieldError={FieldError}
          SALUTATION_OPTIONS={SALUTATION_OPTIONS}
          GENDER_OPTIONS={GENDER_OPTIONS}
        />

        <Academic
          activeStep={activeStep}
          sectionClass={sectionClass}
          SectionHeading={SectionHeading}
          FieldError={FieldError}
        />

        <FamilyWork
          activeStep={activeStep}
          sectionClass={sectionClass}
          SectionHeading={SectionHeading}
          FieldGroup={FieldGroup}
          FieldError={FieldError}
        />

        <Education
          activeStep={activeStep}
          inputClass={inputClass}
          sectionClass={sectionClass}
          SectionHeading={SectionHeading}
          addEducation={addEducation}
          removeEducation={removeEducation}
        />

        <Remarks
          activeStep={activeStep}
          inputClass={inputClass}
          sectionClass={sectionClass}
          SectionHeading={SectionHeading}
          SOURCE_OPTIONS={SOURCE_OPTIONS}
        />
        <ValidationErrorSummary />
        {/* Footer actions */}
        <div className="flex h-[92px] items-center justify-between px-6">
          <Button
            type="button"
            variant="outline"
            className="h-11 px-6"
            disabled={activeStep === 0}
            onClick={handlePrevious}
          >
            Previous
          </Button>

          {activeStep < admissionSteps.length - 1 ? (
            <Button type="button" className="h-11 px-6" onClick={handleNext}>
              Next
            </Button>
          ) : (
            <Button type="submit" className="h-11 px-6" disabled={saving}>
              {saving ? "Saving..." : "Save"}
            </Button>
          )}
        </div>
      </form>
    </FormProvider>
  );
}
