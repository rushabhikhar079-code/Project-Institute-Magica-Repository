import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

// Import schema & types
import {
  registerSchema,
  RegisterFormData,
} from "../validations/instituteRegisterSchema";
// Import common component(s)
import { TextBox } from "../../../components/common/TextBox";
import { LocationSection } from "../../../components/common/LocationSection"; // Shared component!
import { getCaptcha, validateCaptcha, registerInstitute } from "../authService";
import { RegisterInstituteDto } from "../types";
import { toast } from "react-toastify";
import { Toaster } from "sonner";
// Sample mock database for cascading data
// const LOCATION_DATA: Record<string, Record<string, string[]>> = {
//   India: {
//     Maharashtra: ['Mumbai', 'Pune', 'Nagpur'],
//     Karnataka: ['Bengaluru', 'Mysuru'],
//   },
//   USA: {
//     California: ['Los Angeles', 'San Francisco'],
//     Texas: ['Houston', 'Austin'],
//   },
// };
export default function Register() {
  const navigate = useNavigate();

  // const [showPassword, setShowPassword] = useState(false);
  const [captchaImage, setCaptchaImage] = useState("");
  const [captchaId, setCaptchaId] = useState("");
  useEffect(() => {
    fetchCaptcha();
  }, []);
  const fetchCaptcha = async () => {
    try {
      const response = await getCaptcha();

      const imageUrl = URL.createObjectURL(response.data);
      const captchaId = response.headers["x-captcha-id"];

      if (!captchaId) {
        throw new Error("Captcha ID not found in response headers.");
      }

      setCaptchaImage(imageUrl);
      setCaptchaId(captchaId);
    } catch (error) {
      console.error("Failed to fetch captcha:", error);
    }
  };
  // ... useForm setup ...

  const methods = useForm<
    z.input<typeof registerSchema>,
    any,
    z.output<typeof registerSchema>
  >({
    resolver: zodResolver(registerSchema),

    defaultValues: {
      username: "",
      instituteName: "",
      email: "",
      mobileNumber: "",
      address: "",

      country: "",
      countryId: 0,

      state: "",
      stateId: 0,

      city: "",
      cityId: 0,

      pincode: "",
      contactPerson: "",
      numberOfStudents: "",
      coachingFor: "",
      remarks: "",
      captchaInput: "",
      termsAccepted: false,
      otherCity: "",
    },
  });

  const {
    handleSubmit,
    reset,
    register,
    setError,
    setValue,
    formState: { errors, isSubmitting },
  } = methods;

  // 2. Submit Handler
  const onSubmit = async (data: RegisterFormData) => {
    try {
      // 1. Validate CAPTCHA
      // const responseCaptcha = await validateCaptcha(captchaId, data.captchaInput);

      // if (!responseCaptcha.success) {
      //   // 🎯 Set error directly on the captcha form field
      //   setError('captchaInput', {
      //     type: 'manual',
      //     message: responseCaptcha.message || 'Invalid Captcha. Please try again.',
      //   });

      //   // Clear the captcha input and refresh the image
      //   setValue('captchaInput', '');
      //   await fetchCaptcha();
      //   return;
      // }

      // 2. If Captcha is valid, proceed with Registration API call
      console.log("CAPTCHA Validated! Proceeding with registration...", data);
      const payload: RegisterInstituteDto = {
        username: data.username,
        instituteName: data.instituteName,
        emailId: data.email,
        mobileNo: data.mobileNumber,
        address: data.address,
        countryId: data.countryId,
        stateId: data.stateId,
        cityId: data.cityId,
        pincode: data.pincode,
        contactPerson: data.contactPerson,
        remarks: data.remarks || "",
        instNoOfStudents: data.numberOfStudents,
        instProvideCoachingFor: data.coachingFor,
        captchaId: captchaId,
        captchaInput: data.captchaInput,
        otherCity: data.otherCity || "",
      };
      console.log("Payload : " + payload);
      const result = await registerInstitute(payload);

      console.log("result " + result);
      if (result?.statusCode === 200 || result?.success || result?.message) {
        // alert('Institute registered successfully!');
        // toast.success("Institute registered successfully!");
        toast.success(
          "Thank you for registering with us. Your institute registration has been completed successfully. Please check your registered email address for your account details",
        );
        reset();
        navigate("/login");
      } else {
        // alert(result?.message || 'Registration failed.');
        toast.error(result?.message || "Registration failed.");
      }
    } catch (error: any) {
      console.error(error);
      // toast.error(
      //   error.response?.data?.message ||
      //     "Something went wrong. Please try again.",
      // );

      await fetchCaptcha();
    }
    // } catch (error: any) {
    //   console.error('Registration failed:', error);
    //   if (error.response) {
    //   console.log('Backend Error Response Data:', error.response.data);

    //   // ASP.NET Core sends error messages inside error.response.data.errors
    //   if (error.response.data?.errors) {
    //     console.table(error.response.data.errors);
    //   }
    // }
    //   // alert(error?.response?.data?.message || 'An error occurred during registration.');
    //   toast.error(error?.response?.data?.message || 'An error occurred during registration.');
    // }
  };

  // const { watch, setValue } = methods;
  // // Watch selections
  //   const selectedCountry = watch('country');
  //   const selectedState = watch('state');
  //   const selectedCity = watch('city');
  //   // Dynamic state list based on selected country
  //   const stateOptions = selectedCountry && LOCATION_DATA[selectedCountry]
  //     ? Object.keys(LOCATION_DATA[selectedCountry])
  //     : [];

  //   // Dynamic city list based on selected country and state
  //   const cityOptions = selectedCountry && selectedState && LOCATION_DATA[selectedCountry]?.[selectedState]
  //     ? LOCATION_DATA[selectedCountry][selectedState]
  //     : [];

  return (
    // 3. Wrap entire tree in FormProvider so TextBox can access form state
    <FormProvider {...methods}>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        {/* Header */}
        <header className="sticky top-0 z-10 bg-white/95 backdrop-blur border-b border-gray-100 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 bg-[#0f4c81] rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">E</span>
              </div>
              <span className="font-bold text-[#101828] text-lg">
                Institute Magica
              </span>
            </div>
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="px-4 py-2 text-sm text-[#364153] font-medium rounded-lg hover:bg-gray-100 transition-colors"
            >
              Sign In
            </button>
          </div>
        </header>

        {/* Page Body */}
        <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
          <form onSubmit={handleSubmit(onSubmit)}>
            {/* Single Combined Card Container */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 md:p-8 space-y-8">
              {/* Title */}
              <h2 className="text-xl font-semibold text-[#101828]">
                Institute Details
              </h2>

              {/* Input Fields Grid using Common TextBox Component */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
                <TextBox
                  name="username"
                  label="Username"
                  placeholder="Enter your username"
                />
                <TextBox
                  name="instituteName"
                  label="Institute Name"
                  placeholder="Enter your institute name"
                />
                <TextBox
                  name="email"
                  label="Email Id"
                  placeholder="Enter your email id"
                />
                <TextBox
                  name="mobileNumber"
                  label="Mobile Number"
                  placeholder="Enter your mobile number"
                />
                <TextBox
                  name="address"
                  label="Address"
                  placeholder="Enter your address"
                />

                {/* Temporary inputs for dropdowns until you swap them with SelectBox */}
                {/* <TextBox name="country" label="Country" placeholder="Enter Country" />
                <TextBox name="state" label="State" placeholder="Enter State" />
                <TextBox name="city" label="City" placeholder="Enter City" /> */}
                {/* 🌍 Reusable Cascading Location Section (Country -> State -> City) */}
                <LocationSection />
                <TextBox
                  name="pincode"
                  label="Pincode"
                  placeholder="Enter your pincode"
                />
                <TextBox
                  name="contactPerson"
                  label="Contact Person"
                  placeholder="Enter your contact person"
                />
                <TextBox
                  name="numberOfStudents"
                  label="Number Of Students"
                  placeholder="Enter number of students"
                />
                <TextBox
                  name="coachingFor"
                  label="We Provide Coaching For"
                  placeholder="Enter your requirement"
                />

                {/* Textarea for Remarks */}
                <div className="flex flex-col gap-1.5 md:col-span-2">
                  <label className="text-sm text-[#364153]">Remarks</label>
                  <textarea
                    placeholder="Enter remarks"
                    rows={3}
                    {...register("remarks")}
                    className="w-full px-4 py-3 border border-[#d1d5dc] rounded-[10px] text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0f4c81] resize-none"
                  />
                </div>
              </div>

              {/* Divider */}
              <hr className="border-gray-200" />

              {/* Downside Section: Terms, Captcha, Buttons */}
              <div className="space-y-5 pt-2">
                {/* Terms and Conditions Checkbox */}
                <div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="terms"
                      {...register("termsAccepted")}
                      className="w-4 h-4 rounded border-gray-300 text-[#0f4c81] focus:ring-[#0f4c81] cursor-pointer"
                    />
                    <label
                      htmlFor="terms"
                      className="text-sm text-[#364153] cursor-pointer"
                    >
                      I agree to the{" "}
                      <a
                        href="/terms"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#0f4c81] font-medium underline hover:text-[#0a3a63] transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Terms and Conditions
                      </a>
                    </label>
                  </div>
                  {errors.termsAccepted && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.termsAccepted.message}
                    </p>
                  )}
                </div>

                {/* Captcha Block */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Captcha
                  </label>
                  <div className="flex items-center gap-2 mb-2">
                    {/* <div className="flex items-center gap-0.5 rounded-lg px-3 py-2 select-none flex-shrink-0 bg-[#dfe0e0] font-bold text-gray-700"> */}
                    <img
                      src={captchaImage}
                      alt="Captcha"
                      className="h-10"
                      draggable={false}
                    />
                    {/* </div> */}

                    <button
                      type="button"
                      onClick={fetchCaptcha}
                      title="Refresh captcha"
                      className="w-9 h-9 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-[#0f4c81] transition-colors flex-shrink-0"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                        />
                      </svg>
                    </button>

                    <input
                      type="text"
                      placeholder="Type captcha"
                      {...register("captchaInput")}
                      className={`w-full sm:w-auto sm:max-w-[200px] px-3 py-2.5 rounded-xl border text-sm placeholder:text-gray-400 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 transition-all ${
                        errors.captchaInput
                          ? "border-red-400 focus:ring-red-300"
                          : "border-gray-200 focus:ring-[#0f4c81]/30 focus:border-[#0f4c81]"
                      }`}
                    />
                  </div>
                  {errors.captchaInput && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.captchaInput.message}
                    </p>
                  )}
                </div>

                {/* {Object.keys(errors).length > 0 && (
  <div className="p-4 mb-4 bg-red-100 text-red-700 rounded-lg">
    <p className="font-bold">Form Validation Errors:</p>
    <ul className="list-disc pl-5 text-sm">
      {Object.entries(errors).map(([key, err]: [string, any]) => (
        <li key={key}>
          <strong>{key}:</strong> {err?.message || 'Invalid field'}
        </li>
      ))}
    </ul>
  </div>
)} */}
                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 pt-1">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 h-12 bg-[#0f4c81] text-white text-base rounded-[10px] font-medium hover:bg-[#0a3a63] transition-colors shadow disabled:opacity-50"
                  >
                    {isSubmitting ? "Registering..." : "Register"}
                  </button>
                  <button
                    type="button"
                    onClick={() => reset()}
                    className="flex-1 h-12 bg-white text-[#364153] text-base rounded-[10px] font-medium border border-[#d1d5dc] hover:bg-gray-50 transition-colors"
                  >
                    Reset
                  </button>
                </div>
              </div>
            </div>
          </form>
        </main>
      </div>
    </FormProvider>
  );
}
