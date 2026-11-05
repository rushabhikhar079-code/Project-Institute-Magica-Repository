import {
  useEffect,
  useState,
  type ChangeEvent,
  type ComponentType,
} from "react";
import { Camera, ClipboardList, UserRound, Upload, Trash2 } from "lucide-react";
import { useFormContext, useWatch } from "react-hook-form";
import { TextBox } from "../../../../components/common/TextBox";
import { Dropdown } from "../../../../components/common/Select";
import { CustomDatePicker } from "../../../../components/common/CustomDatePicker";
import { RadioGroup } from "../../../../components/common/RadioGroup";
import type { LocationDto } from "../../../../services/locationService";
import PhotoCaptureModal from "../../../../components/common/PhotoCaptureModal";
import { useAppSelector } from "../../../../redux/hooks";
import {
  getAutoRegNo,
  getRegNoManual,
} from "../../../students/admission/admissionService";
import { AdmissionLocationSection } from "../../../../components/common/AdmissionLocationSection";
interface DropdownOption {
  value: string;
  label: string;
}
type Props = {
  activeStep: number;
  inputClass: string;
  sectionClass: string;
  photoName: string;
  handlePhotoChange: (event: ChangeEvent<HTMLInputElement>) => void;
  calculateAge: (value: string) => string;
  dob: string;
  countries: LocationDto[];
  initialStates?: LocationDto[];
  initialCities?: LocationDto[];
  AddressLocationFields: ComponentType<any>;
  SectionHeading: ComponentType<any>;
  FieldGroup: ComponentType<any>;
  FieldError: ComponentType<any>;
  SALUTATION_OPTIONS: { label: string; value: string }[];
  GENDER_OPTIONS: { label: string; value: number }[];
};

export default function RegistrationPersonal(props: Props) {
  const {
    setValue,
    register,
    formState: { errors },
  } = useFormContext<any>();

  const image = useWatch({ name: "Image" });
  const [showWebcam, setShowWebcam] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [browseImage, setBrowseImage] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const sameAsAddress = useWatch({
    name: "sameAsAddress",
  });
  const CATEGORY_OPTIONS = [
    { label: "Open", value: "Open" },
    { label: "OBC", value: "OBC" },
    { label: "SC", value: "SC" },
    { label: "ST", value: "ST" },
    { label: "NT", value: "NT" },
    { label: "Other", value: "Other" },
  ];
  // Keep the preview synchronized with the Image field in React Hook Form.
  useEffect(() => {
    if (!image) {
      setPhotoPreview(null);
      return;
    }

    if (image instanceof File) {
      const imageUrl = URL.createObjectURL(image);
      setPhotoPreview(imageUrl);

      return () => {
        URL.revokeObjectURL(imageUrl);
      };
    }
  }, [image]);

  const handleRemovePhoto = () => {
    if (photoPreview?.startsWith("blob:")) {
      URL.revokeObjectURL(photoPreview);
    }

    setPhotoPreview(null);
    setPhotoError(null);
    setValue("Image", null);
  };

  const handleBrowsePhoto = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!/^image\/(png|jpeg)$/.test(file.type)) {
      setPhotoError("Please select a PNG or JPEG image.");
      event.target.value = "";
      return;
    }
    const MAX_FILE_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_FILE_SIZE) {
      setPhotoError("Photo size must not exceed 10 MB.");
      event.target.value = "";
      return;
    }
    const imageUrl = URL.createObjectURL(file);
    setBrowseImage(imageUrl);
    handlePhotoChange(event);
    setShowWebcam(true);
    event.target.value = "";
  };
  const { instituteId } = useAppSelector((state) => state.auth);
  const { branchId } = useAppSelector((state) => state.branch);
  useEffect(() => {
    let cancelled = false;

    const loadRegistrationNumber = async () => {
      if (!instituteId) return;

      try {
        const response = await getAutoRegNo(instituteId, branchId);

        if (cancelled) return;

        setValue("regNo", response.registrationNo ?? "", {
          shouldValidate: true,
          shouldDirty: false,
        });
      } catch (error) {
        console.error("Failed to load registration number:", error);
      }
    };

    loadRegistrationNumber();

    return () => {
      cancelled = true;
    };
  }, [instituteId, branchId, setValue]);
  const [regNoOptions, setRegNoOptions] = useState<
    { label: string; value: string }[]
  >([]);

  useEffect(() => {
    let cancelled = false;

    const loadRegNoOptions = async () => {
      if (!branchId) {
        setRegNoOptions([]);
        return;
      }

      try {
        const response = await getRegNoManual(branchId);

        if (cancelled) return;

        setRegNoOptions(
          response.map((item) => ({
            label: item.name,
            value: String(item.id),
          })),
        );
      } catch (error) {
        console.error("Failed to load manual registration numbers:", error);

        if (!cancelled) {
          setRegNoOptions([]);
        }
      }
    };

    loadRegNoOptions();

    return () => {
      cancelled = true;
    };
  }, [branchId]);
  const {
    activeStep,
    inputClass,
    sectionClass,
    handlePhotoChange,
    calculateAge,
    dob,
    countries,
    initialStates,
    initialCities,
    AddressLocationFields,
    SectionHeading,
    FieldGroup,
    FieldError,
    SALUTATION_OPTIONS,
    GENDER_OPTIONS,
  } = props;

  return (
    <>
      {/* STEP 1 — REGISTRATION & PERSONAL */}
      {activeStep === 0 && (
        <>
          <section className={sectionClass}>
            <SectionHeading icon={ClipboardList}>
              Registration Details
            </SectionHeading>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
              <div>
                <CustomDatePicker
                  name="regDate"
                  label="Registration Date"
                  required
                  maxDate={new Date().toISOString().slice(0, 10)}
                />
                {/* <FieldError
                  message={errors.regDate?.message as string | undefined}
                /> */}
              </div>

              <div>
                <TextBox
                  name="regNo"
                  label="Registration Number"
                  placeholder="e.g. REG006"
                  required
                  maxLength={50}
                  readOnly
                />
                {/* <FieldError
                  message={errors.regNo?.message as string | undefined}
                /> */}
              </div>

              <div>
                <Dropdown
                  name="lastUsedRegNo"
                  label="Last Used Reg. No."
                  options={regNoOptions}
                />
              </div>

              <TextBox
                name="rollNo"
                label="Roll Number"
                placeholder="Roll number"
                required={false}
                allowOnly="numeric"
                maxLength={10}
              />

              {/* <Dropdown
                  name="status"
                  label="Student Status"
                  options={STATUS_OPTIONS}
                  required
                /> */}
            </div>
          </section>

          <section className={sectionClass}>
            <SectionHeading icon={UserRound}>
              Personal Information
            </SectionHeading>

            {/* Photo */}
            <div className="flex items-start gap-3 pb-5 border-b border-gray-100">
              <div className="w-[120px] h-[120px] rounded-xl border border-dashed border-gray-300 flex items-center justify-center bg-gray-50 overflow-hidden">
                {photoPreview ? (
                  <img
                    src={photoPreview}
                    alt="Student"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Camera className="w-7 h-7 text-gray-300" />
                )}
              </div>
              <div className="flex flex-wrap gap-2 items-start pt-1">
                {/* Browse */}
                <label className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all text-xs font-medium shadow-sm cursor-pointer">
                  <Upload className="w-3.5 h-3.5" />
                  Browse
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/jpg"
                    className="hidden"
                    onChange={handleBrowsePhoto}
                  />
                </label>

                {/* Webcam */}
                <button
                  type="button"
                  onClick={() => {
                    setPhotoError(null);
                    setShowWebcam(true);
                  }}
                  className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-300 text-blue-700 rounded-lg hover:bg-blue-100 hover:border-blue-400 transition-all text-xs font-medium shadow-sm"
                >
                  <Camera className="w-3.5 h-3.5" />
                  Webcam
                </button>

                {/* Remove */}
                {photoPreview && (
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    className="flex items-center gap-2 px-3 py-1.5 bg-red-50 border border-red-200 text-red-600 rounded-lg hover:bg-red-100 hover:border-red-300 transition-all text-xs font-medium shadow-sm"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Remove
                  </button>
                )}
                {/* Photo Validation Error */}
                {photoError && (
                  <div className="basis-full mt-1 text-xs text-red-500">
                    {photoError}
                  </div>
                )}
              </div>
            </div>
            <FieldGroup title="Name & Salutation">
              <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
                <RadioGroup
                  name="gender"
                  label="Gender"
                  options={GENDER_OPTIONS}
                  required
                />
                <Dropdown
                  name="salutation"
                  label="Salutation"
                  options={SALUTATION_OPTIONS}
                />
              </div>

              <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-3">
                <div>
                  <TextBox
                    name="firstName"
                    label="First Name"
                    placeholder="First name"
                    required
                    maxLength={100}
                  />
                  {/* <FieldError
                    message={errors.firstName?.message as string | undefined}
                  /> */}
                </div>

                <TextBox
                  name="middleName"
                  label="Middle Name"
                  placeholder="Middle name"
                  required={false}
                  maxLength={100}
                />

                <TextBox
                  name="lastName"
                  label="Last Name"
                  placeholder="Last name"
                  required={false}
                  maxLength={100}
                />
              </div>
            </FieldGroup>
            <FieldGroup title="Contact Details">
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div>
                  <TextBox
                    name="mobile"
                    label="Contact Number"
                    placeholder="10-digit mobile number"
                    required
                    allowOnly="numeric"
                    maxLength={15}
                  />
                  {/* <FieldError
                    message={errors.mobile?.message as string | undefined}
                  /> */}
                </div>

                <div>
                  <TextBox
                    name="email"
                    label="Email"
                    placeholder="email@example.com"
                    type="email"
                    required
                  />
                  {/* <FieldError
                    message={errors.email?.message as string | undefined}
                  /> */}
                </div>
              </div>
            </FieldGroup>

            <FieldGroup title="Identity">
              <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
                <div>
                  <CustomDatePicker
                    name="dateOfBirth"
                    label="Date of Birth"
                    maxDate={new Date().toISOString().slice(0, 10)}
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    Age
                  </label>
                  <input
                    value={calculateAge(dob)}
                    readOnly
                    placeholder="Auto-calculated"
                    className={`${inputClass} bg-gray-50`}
                  />
                </div>

                <Dropdown
                  name="category"
                  label="Category"
                  options={CATEGORY_OPTIONS}
                />

                <TextBox
                  name="biometricAttendanceId"
                  label="Biometric ID"
                  placeholder="Biometric ID"
                  required={false}
                  maxLength={45}
                />
              </div>
            </FieldGroup>

            <FieldGroup title="Correspondence Address">
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div className="md:col-span-2">
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    Street / Locality
                  </label>

                  <textarea
                    {...register("address")}
                    rows={2}
                    // disabled={sameAsAddress}
                    placeholder="Street, area, locality"
                    className={`${inputClass} disabled:bg-gray-50`}
                    maxLength={200}
                  />
                </div>

                {/* <AddressLocationFields
                  suffix="C"
                  countries={countries}
                  initialStates={initialStates}
                  initialCities={initialCities}
                /> */}
                <div className="mt-4 md:col-span-2">
                  <AdmissionLocationSection
                    required={false}
                    mode="correspondence"
                  />
                </div>

                {/* <TextBox
                  name="pinCodeC"
                  label="Pin Code"
                  placeholder="Pin code"
                  required={false}
                  allowOnly="numeric"
                  maxLength={6}
                /> */}
              </div>
            </FieldGroup>

            <div className="mt-5">
              <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  {...register("sameAsAddress")}
                  className="h-4 w-4 cursor-pointer rounded border-gray-300 text-[#0f4c81] focus:ring-[#0f4c81]"
                />

                <span>Permanent address same as correspondence address</span>
              </label>
            </div>

            <FieldGroup title="Permanent Address">
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div className="md:col-span-2">
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    Street / Locality
                  </label>

                  <textarea
                    {...register("permanentAddress")}
                    rows={2}
                    placeholder="Street, area, locality"
                    className={inputClass}
                    maxLength={200}
                  />
                </div>

                {/* <AddressLocationFields
                  countries={countries}
                  initialStates={initialStates}
                  initialCities={initialCities}
                /> */}
                <div className="mt-4 md:col-span-2">
                  <AdmissionLocationSection
                    required={false}
                    mode="permanent"
                    disabled={sameAsAddress}
                  />
                </div>
                {/* <TextBox
                  name="pinCode"
                  label="Pin Code"
                  placeholder="Pin code"
                  required={false}
                  allowOnly="numeric"
                  maxLength={6}
                /> */}
              </div>
            </FieldGroup>
          </section>
        </>
      )}
      {showWebcam && (
        <PhotoCaptureModal
          initialImage={browseImage}
          onClose={() => {
            setShowWebcam(false);
            if (browseImage) {
              URL.revokeObjectURL(browseImage);
              setBrowseImage(null);
            }
          }}
          onImageSelect={(imageUrl, imageFile) => {
            setPhotoError(null);

            // Validate captured image size
            const MAX_FILE_SIZE = 10 * 1024 * 1024;
            // const MAX_FILE_SIZE = 0.5 * 1024; // 0.5 KB = 512 bytes
            if (imageFile.size > MAX_FILE_SIZE) {
              setPhotoError("Captured photo size must not exceed 10 MB.");
              return;
            }

            // Validate image type
            if (
              imageFile.type !== "image/jpeg" &&
              imageFile.type !== "image/png"
            ) {
              setPhotoError("Captured photo must be in JPEG or PNG format.");
              return;
            }

            // Valid captured photo
            setPhotoPreview(imageUrl);
            setValue("Image", imageFile, {
              shouldDirty: true,
            });

            setShowWebcam(false);
          }}
        />
      )}
    </>
  );
}
