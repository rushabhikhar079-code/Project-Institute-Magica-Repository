import { useState } from "react";
import ArrowLeftIcon from "../components/ArrowLeftIcon";
import UserIcon from "../components/UserIcon";
import LockIcon from "../components/LockIcon";
import { ResetPasswordProps } from "../types";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ResetPasswordFormData,
  resetPasswordSchema,
} from "../validations/resetpasswordSchema";
import EyeIcon from "../components/EyeIcon";
import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { validateResetToken, resetPassword } from "../authService";
import { toast } from "react-toastify";

export default function ResetPassword({ setCurrentPage }: ResetPasswordProps) {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [submitted, setSubmitted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      username: "",
      password: "",
      confirmpassword: "",
    },
  });

  const onSubmit = async (data: ResetPasswordFormData) => {
    try {
      if (!token) return;

      const response = await resetPassword({
        token: token!,
        password: data.password,
        confirmpassword: data.confirmpassword,
      });
      if (response.success) {
        setSubmitted(true);
      }
    } catch (error) {
      console.error(error);
    }
  };
  useEffect(() => {
    console.log("useEffect ran");

    const validateToken = async () => {
      console.log("validateToken called");
      console.log("Token:", token);

      if (!token) return;

      try {
        const response = await validateResetToken(token);
        console.log(response);

        if (response.success) {
          setValue("username", response.username);
        }
      } catch (error: any) {
        console.error(error);

        // toast.error(
        //     error.response?.data?.message ||
        //     "Something went wrong. Please try again."
        // );
      }
    };

    validateToken();
  }, [token, setValue]);

  return (
    <div className="min-h-screen w-full bg-slate-100 flex flex-col items-center justify-center p-4">
      {/* Logo bar */}
      <div className="flex items-center gap-2.5 mb-8">
        <div className="w-9 h-9 bg-[#0f4c81] rounded-xl flex items-center justify-center shadow">
          <span className="text-white font-black text-base">E</span>
        </div>
        <span className="text-gray-900 font-bold text-lg tracking-tight">
          Institute Magica
        </span>
      </div>

      {/* Card */}
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl shadow-gray-200/80 overflow-hidden">
        {/* Top accent bar */}
        <div className="h-1.5 bg-gradient-to-r from-[#0f4c81] via-[#1e6fba] to-[#fdc700]" />

        <div className="px-8 py-10">
          {!submitted ? (
            <>
              {/* Icon + Heading */}
              <div className="flex flex-col items-center text-center mb-8">
                <div className="w-16 h-16 bg-[#0f4c81]/10 rounded-2xl flex items-center justify-center mb-4">
                  <LockIcon />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  Reset Password
                </h1>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {/* Username */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Username <span className="text-[#ee613e]">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
                      <UserIcon />
                    </span>
                    <input
                      type="text"
                      readOnly
                      {...register("username")}
                      className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-100 text-sm text-gray-700 cursor-not-allowed"
                    />
                  </div>
                  {errors.username && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.username.message}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    New Password <span className="text-[#ee613e]">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"></span>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter new password"
                        {...register("password")}
                        className="w-full px-4 py-3 pr-11 rounded-xl border border-gray-200 text-sm text-gray-800 placeholder:text-gray-400 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0f4c81]/30 focus:border-[#0f4c81] transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <EyeIcon off={showPassword} />
                      </button>
                    </div>
                  </div>
                  {errors.password && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.password.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Confirm Password <span className="text-[#ee613e]">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"></span>
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm new password"
                      {...register("confirmpassword")}
                      className="w-full px-4 py-3 pr-11 rounded-xl border border-gray-200 text-sm text-gray-800 placeholder:text-gray-400 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0f4c81]/30 focus:border-[#0f4c81] transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <EyeIcon off={showConfirmPassword} />
                    </button>
                  </div>
                  {errors.confirmpassword && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.confirmpassword.message}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-[#0f4c81] hover:bg-[#0a3a63] active:scale-[0.98] text-white font-semibold py-3 rounded-xl shadow-lg shadow-[#0f4c81]/25 transition-all duration-200 text-sm mt-2"
                >
                  {isSubmitting ? "Setting Password..." : "Set Password"}
                </button>
              </form>
            </>
          ) : (
            /* Success state */
            <div className="flex flex-col items-center text-center py-4">
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mb-4">
                <svg
                  className="w-8 h-8 text-green-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                Password updated
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                Your password has been updated successfully.
              </p>
              <p className="mt-2 text-sm text-gray-600">
                {" "}
                You can now sign in using your new password.{" "}
              </p>
              <br></br>
              <button
                type="button"
                onClick={() => setCurrentPage?.("login")}
                className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-[#0f4c81] font-medium transition-colors"
              >
                <ArrowLeftIcon />
                Go to Sign In
              </button>
            </div>
          )}

          {/* Back to login
                    <div className="mt-8 pt-6 border-t border-gray-100 flex justify-center">
                        <button
                            type="button"
                            onClick={() => setCurrentPage?.("login")}
                            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-[#0f4c81] font-medium transition-colors"
                        >
                            <ArrowLeftIcon />
                            Back to Sign In
                        </button>
                    </div> */}
        </div>
      </div>

      <p className="text-xs text-gray-400 mt-6">Version 10.0.0</p>
    </div>
  );
}
