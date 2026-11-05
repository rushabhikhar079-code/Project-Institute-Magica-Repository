import { useEffect, useRef, useState } from "react";
import {
  FormProvider,
  useForm,
  useFormContext,
  useWatch,
} from "react-hook-form";
import { ClipboardList, UserRound, Camera, Upload, Trash2 } from "lucide-react";

import { CustomDatePicker } from "../../../../../components/common/CustomDatePicker";
import { TextBox } from "../../../../../components/common/TextBox";
import { Dropdown } from "../../../../../components/common/Select";
import { CheckBox } from "../../../../../components/common/CheckBox";
import PhotoCaptureModal from "../../../../../components/common/PhotoCaptureModal";
import type { EnquiryFormData } from "../../addEnquiryTypes";
import { LocationSection } from "../../../../../components/common/LocationSection";
import { useAppSelector } from "../../../../../redux/hooks";
import { getFollowupStatuses } from "../../enquiryService";
import { EnquiryLocationSection } from "../../../../../components/common/EnquiryLocationSection";
import { RadioGroup } from "../../../../../components/common/RadioGroup";

const enquiryStatusOptions = [
  { label: "New", value: 1 },
  { label: "Hot", value: 2 },
  { label: "Warm", value: 3 },
  { label: "Cold", value: 4 },
  { label: "Dead", value: 5 },
];

const salutationOptions = [
  { label: "Mr.", value: "Mr." },
  { label: "Ms.", value: "Ms." },
  { label: "Mrs.", value: "Mrs." },
];

const genderOptions = [
  { label: "Male", value: 1 },
  { label: "Female", value: 2 },
  { label: "Other", value: 3 },
];

const categoryOptions = [
  { label: "Open", value: "Open" },
  { label: "OBC", value: "OBC" },
  { label: "SC", value: "SC" },
  { label: "ST", value: "ST" },
  { label: "NT", value: "NT" },
  { label: "Other", value: "Other" },
];

interface FollowupStatusOption {
  label: string;
  value: string;
  reminder: number;
}
interface RegistrationPersonalProps {
  existingPhoto: string | null;
}
export default function RegistrationPersonal({
  existingPhoto,
}: RegistrationPersonalProps) {
  const {
    setValue,
    trigger,
    formState: { errors },
  } = useFormContext<EnquiryFormData>();
  const image = useWatch({
    name: "Image",
  });
  const followupStatusOptions = [
    { label: "Active", value: 1 },
    { label: "Inactive", value: 0 },
  ];
  const [showWebcam, setShowWebcam] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [browseImage, setBrowseImage] = useState<string | null>(null);
  useEffect(() => {
    if (image instanceof File) {
      const imageUrl = URL.createObjectURL(image);

      setPhotoPreview(imageUrl);

      return () => {
        URL.revokeObjectURL(imageUrl);
      };
    }

    // No newly uploaded image → show existing API photo
    setPhotoPreview(existingPhoto);
  }, [image, existingPhoto]);
  const handleRemovePhoto = () => {
    if (photoPreview?.startsWith("blob:")) {
      URL.revokeObjectURL(photoPreview);
    }

    setPhotoPreview(null);
    setValue("Image", null as never);
  };

  const selectedCity = useWatch({
    name: "city",
  });
  const sameAsCorrespondence = useWatch({
    name: "sameAsCorrespondence",
  });
  const followUpRequired = useWatch({
    name: "FollowUpRequired",
  });
  const walkIn = useWatch({
    name: "walkIn",
  });
  useEffect(() => {
    if (walkIn) {
      const today = new Date();

      const formattedDate = [
        today.getFullYear(),
        String(today.getMonth() + 1).padStart(2, "0"),
        String(today.getDate()).padStart(2, "0"),
      ].join("-");

      setValue("walkInDate", formattedDate);
    } else {
      setValue("walkInDate", "");
    }
  }, [walkIn, setValue]);
  const selectedFollowup = useWatch({
    name: "Followup",
  });
  const followDate = useWatch({
    name: "FollowDate",
  });

  const followTime = useWatch({
    name: "FollowTime",
  });
  const dateOfBirth = useWatch({
    name: "DOB",
  });

  const correspondenceAddress = useWatch({
    name: "CorrAddress",
  });

  const correspondenceCountryName = useWatch({
    name: "countryC",
  });

  const correspondenceCountryId = useWatch({
    name: "countryidc",
  });

  const correspondenceStateName = useWatch({
    name: "state",
  });

  const correspondenceStateId = useWatch({
    name: "stateidc",
  });

  const correspondenceCityName = useWatch({
    name: "city",
  });

  const correspondenceCityId = useWatch({
    name: "cityidc",
  });

  const correspondenceOtherCity = useWatch({
    name: "othercityc",
  });

  const correspondencePinCode = useWatch({
    name: "pincodeC",
  });

  const instituteId = useAppSelector((state) => state.auth.instituteId);
  const [followupOptions, setFollowupOptions] = useState<
    FollowupStatusOption[]
  >([]);
  const selectedFollowupOption = followupOptions.find(
    (option) => option.value === String(selectedFollowup ?? ""),
  );
  const remark = useWatch({
    name: "remark",
  });

  const previousFollowupRef = useRef<string | null>(null);

  useEffect(() => {
    if (!followUpRequired || !selectedFollowupOption) {
      return;
    }

    const currentFollowup = String(selectedFollowupOption.value);

    // First selection or Followup Status changed
    if (previousFollowupRef.current !== currentFollowup) {
      setValue("remark", selectedFollowupOption.label, {
        shouldDirty: true,
        shouldValidate: true,
      });
      setValue("FollowupReminder", selectedFollowupOption.reminder, {
        shouldDirty: true,
        shouldValidate: true,
      });
      previousFollowupRef.current = currentFollowup;
    }
  }, [followUpRequired, selectedFollowupOption, setValue]);
  const showFollowupReminder =
    followUpRequired && selectedFollowupOption?.reminder === 1;
  const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

  const allowedImageTypes = ["image/jpeg", "image/jpg", "image/png"];
  useEffect(() => {
    if (!followUpRequired) {
      setValue("Followup", "", {
        shouldDirty: true,
        shouldValidate: true,
      });

      setValue("FollowupReminder", 0, {
        shouldDirty: true,
        shouldValidate: true,
      });

      setValue("FollowDate", "", {
        shouldDirty: true,
        shouldValidate: true,
      });

      setValue("FollowTime", "", {
        shouldDirty: true,
        shouldValidate: true,
      });

      previousFollowupRef.current = null;

      return;
    }

    // Don't clear anything while followup options are still loading.
    if (!selectedFollowupOption) {
      return;
    }

    if (selectedFollowupOption.reminder !== 1) {
      setValue("FollowDate", "", {
        shouldDirty: true,
        shouldValidate: true,
      });

      setValue("FollowTime", "", {
        shouldDirty: true,
        shouldValidate: true,
      });
    }
  }, [followUpRequired, selectedFollowupOption, setValue]);
  const timeOptions = Array.from({ length: 24 * 2 }, (_, index) => {
    const hour = Math.floor(index / 2);
    const minute = index % 2 === 0 ? "00" : "30";

    const period = hour < 12 ? "AM" : "PM";
    const displayHour = hour % 12 || 12;

    return {
      label: `${displayHour}:${minute} ${period}`,
      value: `${String(hour).padStart(2, "0")}:${minute}`,
    };
  });
  const branchId = useAppSelector((state) => state.branch.branchId);
  useEffect(() => {
    const fetchFollowups = async () => {
      if (!instituteId || !branchId) {
        setFollowupOptions([]);
        return;
      }

      try {
        const response = await getFollowupStatuses(instituteId, branchId);
        const options: FollowupStatusOption[] = (response?.data ?? []).map(
          (item: any) => ({
            label: item.sName,
            value: String(item.statusId),
            reminder: Number(item.reminder) || 0,
          }),
        );

        console.log("Followup API data:", response?.data);
        console.log("Followup dropdown options:", options);

        setFollowupOptions(options);
      } catch (error) {
        console.error("Failed to fetch followup options:", error);
        setFollowupOptions([]);
      }
    };

    fetchFollowups();
  }, [instituteId, branchId]);
  useEffect(() => {
    if (!showFollowupReminder) {
      return;
    }

    if (!followDate || !followTime) {
      return;
    }

    const dateOnly = followDate.split(" ")[0];

    const currentDateTime = `${dateOnly} ${followTime}:00`;

    if (followDate !== currentDateTime) {
      setValue("FollowDate", currentDateTime, {
        shouldDirty: true,
      });
    }
  }, [followDate, followTime, showFollowupReminder, setValue]);
  /*
   * Calculate age from DOB
   */
  useEffect(() => {
    if (!dateOfBirth) {
      setValue("Age", "");
      return;
    }

    const dob = new Date(dateOfBirth);

    if (Number.isNaN(dob.getTime())) {
      setValue("Age", "");
      return;
    }

    const today = new Date();

    let age = today.getFullYear() - dob.getFullYear();

    const monthDifference = today.getMonth() - dob.getMonth();

    if (
      monthDifference < 0 ||
      (monthDifference === 0 && today.getDate() < dob.getDate())
    ) {
      age--;
    }

    setValue("Age", String(age));
  }, [dateOfBirth, setValue]);

  /*
   * Copy correspondence address to permanent address
   */
  useEffect(() => {
    if (!sameAsCorrespondence) {
      return;
    }

    // Address
    setValue("PermanentAdd", correspondenceAddress || "");

    // Country
    setValue("country", correspondenceCountryName || "");
    setValue("countryid", correspondenceCountryId || 0, {
      shouldValidate: true,
      shouldDirty: true,
    });
    // State
    setValue("stateC", correspondenceStateName || "");
    setValue("stateid", correspondenceStateId || 0);

    // City
    setValue("cityC", correspondenceCityName || "");
    setValue("cityid", correspondenceCityId || 0);

    // Other City
    setValue("othercity", correspondenceOtherCity || "");

    // Pincode
    setValue("pincode", correspondencePinCode || "");
  }, [
    sameAsCorrespondence,
    correspondenceAddress,
    correspondenceCountryName,
    correspondenceCountryId,
    correspondenceStateName,
    correspondenceStateId,
    correspondenceCityName,
    correspondenceCityId,
    correspondenceOtherCity,
    correspondencePinCode,
    setValue,
  ]);

  return (
    <div className="space-y-5">
      {/* =====================================================
          REGISTRATION DETAILS
      ===================================================== */}
      <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center gap-2.5 mb-5">
          <div className="w-8 h-8 rounded-lg bg-[#0F4C81]/10 flex items-center justify-center shrink-0">
            <ClipboardList className="w-4 h-4 text-[#0F4C81]" />
          </div>

          <h2 className="text-base font-semibold text-gray-800">
            Enquiry Details
          </h2>
        </div>

        {/* Date of Enquiry */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <CustomDatePicker
            name="EnquiryDate"
            label="Date of Enquiry"
            required
          />

          <Dropdown
            name="EnqStatus"
            label="Enquiry Status"
            options={enquiryStatusOptions}
          />
        </div>

        {/* =================================================
            ENQUIRY TRACKING
        ================================================= */}
        <div className="p-4 rounded-xl bg-blue-50 border border-blue-100">
          <div className="text-xs font-semibold text-[#0F4C81] uppercase tracking-wide mb-4">
            Enquiry Tracking
          </div>

          {/* Walk In */}
          <div className="mb-5 rounded-lg border border-gray-200 bg-white p-4">
            <div className="flex items-center h-10">
              <CheckBox name="walkIn" label="Walk In" />
            </div>

            {walkIn && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-3">
                <CustomDatePicker
                  name="walkInDate"
                  label="Walk In Date"
                  required
                />
              </div>
            )}
          </div>

          {/* Follow Up */}
          <div className="mb-5 rounded-lg border border-gray-200 bg-white p-4">
            <div className="flex items-center h-10">
              <CheckBox name="FollowUpRequired" label="Followup Required" />
            </div>

            {followUpRequired && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-3">
                <Dropdown
                  name="Followup"
                  label="Followup Status"
                  required
                  options={followupOptions}
                />

                {showFollowupReminder && (
                  <>
                    <CustomDatePicker name="FollowDate" required label="Date" />

                    <Dropdown
                      name="FollowTime"
                      label="Time"
                      required
                      options={timeOptions}
                    />
                  </>
                )}
              </div>
            )}
          </div>
          {/* Follow Up Status */}
          <div className="mb-5 rounded-lg border border-gray-200 bg-white p-4">
            <RadioGroup
              name="StatusFlag"
              label="Status"
              options={followupStatusOptions}
              required
            />
          </div>

          {/* Remark */}
          <div className="mt-4">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
              Remark
            </label>

            <textarea
              {...useFormContext<EnquiryFormData>().register("remark")}
              placeholder="Remark..."
              rows={2}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-white text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0F4C81]/25 focus:border-[#0F4C81] transition-all resize-none"
            />
          </div>
        </div>
      </section>

      {/* =====================================================
          PERSONAL INFORMATION
      ===================================================== */}
      <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center gap-2.5 mb-5">
          <div className="w-8 h-8 rounded-lg bg-[#0F4C81]/10 flex items-center justify-center shrink-0">
            <UserRound className="w-4 h-4 text-[#0F4C81]" />
          </div>

          <h2 className="text-base font-semibold text-gray-800">
            Personal Information
          </h2>
        </div>

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
            {/* Browse */}
            <label className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all text-xs font-medium shadow-sm cursor-pointer">
              <Upload className="w-3.5 h-3.5" />
              Browse
              <input
                type="file"
                accept="image/png,image/jpeg,image/jpg"
                className="hidden"
                onChange={async (e) => {
                  const file = e.target.files?.[0];

                  if (!file) return;

                  // Temporarily validate the selected file
                  setValue("Image", file, {
                    shouldDirty: true,
                  });

                  const isValid = await trigger("Image");

                  if (!isValid) {
                    // Remove the invalid file from the form state
                    setValue("Image", null, {
                      shouldDirty: true,
                      shouldValidate: false,
                    });

                    e.target.value = "";
                    return;
                  }

                  // Only valid files reach here
                  const imageUrl = URL.createObjectURL(file);

                  setBrowseImage(imageUrl);
                  setShowWebcam(true);

                  e.target.value = "";
                }}
              />
            </label>
            <button
              type="button"
              onClick={() => setShowWebcam(true)}
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

            {errors.Image && (
              <p className="w-full text-xs text-red-600">
                {errors.Image.message}
              </p>
            )}
          </div>
        </div>

        {/* =================================================
            NAME & SALUTATION
        ================================================= */}
        <div className="pt-5">
          <SectionTitle title="Name & Salutation" />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <RadioGroup
              name="Gender"
              label="Gender"
              options={genderOptions}
              required
            />
            <Dropdown
              name="Salutation"
              label="Salutation"
              options={salutationOptions}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
            <TextBox
              name="Fname"
              label="First Name"
              placeholder="First name"
              required={true}
              allowOnly="alpha"
            />

            <TextBox
              name="Mname"
              label="Middle Name"
              placeholder="Middle name"
              required={false}
              allowOnly="alpha"
            />

            <TextBox
              name="Lname"
              label="Last Name"
              placeholder="Last name"
              required={false}
              allowOnly="alpha"
            />
          </div>
        </div>

        {/* =================================================
            CONTACT DETAILS
        ================================================= */}
        <div className="pt-5">
          <SectionTitle title="Contact Details" />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <TextBox
              name="PContact"
              label="Contact Number"
              placeholder="+91 9876543210"
              required={true}
              allowOnly="numeric"
              maxLength={15}
            />

            <TextBox
              name="EmailId"
              label="Email"
              placeholder="email@example.com"
              required={false}
              type="email"
            />
          </div>
        </div>

        {/* =================================================
            IDENTITY
        ================================================= */}
        <div className="pt-5">
          <SectionTitle title="Identity" />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <CustomDatePicker
              name="DOB"
              label="Date of Birth"
              required={false}
            />

            <TextBox
              name="Age"
              label="Age"
              placeholder="Auto-calculated"
              required={false}
              disabled
            />

            <Dropdown
              name="Stud_Category"
              label="Category"
              options={categoryOptions}
              required={false}
            />
          </div>

          <div className="mt-4 sm:w-1/3">
            <TextBox
              name="biometricattendanceid"
              label="Biometric ID"
              placeholder="Biometric ID"
              required={false}
            />
          </div>
        </div>

        {/* =================================================
            CORRESPONDENCE ADDRESS
        ================================================= */}
        {/* =================================================
    CORRESPONDENCE ADDRESS
================================================= */}
        <div className="pt-5">
          <SectionTitle title="Correspondence Address" />

          <TextBox
            name="CorrAddress"
            label="Street / Locality"
            placeholder="Enter street / locality"
            required={false}
            allowOnly="address"
          />

          <div className="mt-4">
            <EnquiryLocationSection required={false} mode="correspondence" />
          </div>
        </div>

        {/* Same Address */}
        <div className="mt-4">
          <CheckBox
            name="sameAsCorrespondence"
            label="Permanent address same as correspondence address"
          />
        </div>

        {/* =================================================
    PERMANENT ADDRESS
================================================= */}
        <div className="pt-5">
          <SectionTitle title="Permanent Address" />

          <TextBox
            name="PermanentAdd"
            label="Street / Locality"
            placeholder="Street, area, locality"
            required={false}
            allowOnly="address"
            disabled={sameAsCorrespondence}
          />

          <div className="mt-4">
            <EnquiryLocationSection
              required={false}
              mode="permanent"
              disabled={sameAsCorrespondence}
            />
          </div>
        </div>
      </section>
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
            setPhotoPreview(imageUrl);

            setValue("Image", imageFile as File, {
              shouldValidate: true,
              shouldDirty: true,
            });

            setShowWebcam(false);

            if (browseImage) {
              URL.revokeObjectURL(browseImage);
              setBrowseImage(null);
            }
          }}
        />
      )}
    </div>
  );
}

function SectionTitle({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <span className="text-[11px] font-bold text-[#0F4C81] uppercase tracking-widest whitespace-nowrap">
        {title}
      </span>

      <div className="flex-1 h-px bg-[#0F4C81]/15" />
    </div>
  );
}
function PermanentLocationSection({ disabled }: { disabled: boolean }) {
  const { setValue } = useFormContext<EnquiryFormData>();

  // Correspondence values from the main AddEnquiry form
  const correspondenceAddress = useWatch({
    name: "CorrAddress",
  });

  const correspondenceCountry = useWatch({
    name: "countryId",
  });

  const correspondenceState = useWatch({
    name: "stateId",
  });

  const correspondenceCity = useWatch({
    name: "cityId",
  });

  const correspondenceOtherCity = useWatch({
    name: "otherCity",
  });

  const correspondencePinCode = useWatch({
    name: "pincodeC",
  });

  // Permanent city
  const permanentCity = useWatch({
    name: "cityC",
  });

  /*
   * Copy correspondence → permanent
   * when "Same as Correspondence" is checked.
   */
  useEffect(() => {
    if (!disabled) return;

    setValue("PermanentAdd", correspondenceAddress || "");
    setValue("countryid", correspondenceCountry || 0);
    setValue("stateid", correspondenceState || 0);
    setValue("cityid", correspondenceCity || 0);
    setValue("othercity", correspondenceOtherCity || "");

    // Correspondence pincode -> Permanent pincode
    setValue("pincode", correspondencePinCode || "");
  }, [
    disabled,
    correspondenceAddress,
    correspondenceCountry,
    correspondenceState,
    correspondenceCity,
    correspondenceOtherCity,
    correspondencePinCode,
    setValue,
  ]);

  return (
    <fieldset disabled={disabled}>
      <div
        className={`grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 ${
          permanentCity === "Other"
            ? "[&>div:nth-child(4)]:!col-span-1"
            : "[&>div:nth-child(4)]:!hidden"
        }`}
      >
        <LocationSection required={false} />

        <TextBox
          name="pincode"
          label="Pin Code"
          placeholder="Pin code"
          required={false}
          allowOnly="numeric"
          maxLength={6}
        />
      </div>
    </fieldset>
  );
}
