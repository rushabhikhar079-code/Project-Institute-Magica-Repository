import { useState } from "react";
import MailIcon from "../components/MailIcon";
import ArrowLeftIcon from "../components/ArrowLeftIcon";
import UserIcon from "../components/UserIcon";
import LockIcon from "../components/LockIcon";
import { ForgotPasswordProps } from "../types";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ForgotPasswordFormData,
  forgotPasswordSchema,
} from "../validations/forgotpasswordSchema";
import { forgotPassword } from "../authService";
import { toast } from "react-toastify";

export default function ForgotPassword({
  setCurrentPage,
}: ForgotPasswordProps) {
  const [maskedEmail, setMaskedEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const {
    register,
    handleSubmit,

    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      username: "",
    },
  });
  const onSubmit = async (data: ForgotPasswordFormData) => {
    try {
      const response = await forgotPassword(data);

      console.log(response);

      if (response.data.success) {
        setMaskedEmail(response.data.data.maskedEmail);
        setSubmitted(true);
      }
    } catch (error: any) {
      console.error(error);
      // toast.error(
      //   error.response?.data?.message ||
      //     "Something went wrong. Please try again.",
      // );
    }
  };
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
                  Forgot Password?
                </h1>
                <p className="text-sm text-gray-500 leading-relaxed max-w-xs">
                  Enter your registered username.
                </p>
                <p className="text-sm text-gray-500 leading-relaxed max-w-xs">
                  {" "}
                  We'll send you instructions to reset your password.{" "}
                </p>
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
                      placeholder="Enter your username"
                      {...register("username")}
                      className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-800 placeholder:text-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0f4c81]/30 focus:border-[#0f4c81] transition-all"
                    />
                  </div>
                  {errors.username && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.username.message}
                    </p>
                  )}
                </div>

                {/* Email
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Email ID <span className="text-[#ee613e]">*</span></label>
                                    <div className="relative">
                                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
                                            <MailIcon />
                                        </span>
                                        <input
                                            type="email"
                                            placeholder="Enter your email"
                                            {...register("email")}
                                            className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-800 placeholder:text-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0f4c81]/30 focus:border-[#0f4c81] transition-all"
                                        /></div>{errors.email && (
                                            <p className="mt-1 text-xs text-red-500">
                                                {errors.email.message}
                                            </p>
                                        )}
                                </div> */}

                <button
                  type="submit"
                  className="w-full bg-[#0f4c81] hover:bg-[#0a3a63] active:scale-[0.98] text-white font-semibold py-3 rounded-xl shadow-lg shadow-[#0f4c81]/25 transition-all duration-200 text-sm mt-2"
                >
                  Send Reset Password Link
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
                Check your inbox
              </h2>
              <p className="text-xs text-gray-400 mb-4">
                We've sent a password reset link to{" "}
                <span className="font-medium">{maskedEmail}</span>. The link
                will expire in 30 mins.
              </p>
              <p className="text-xs text-gray-400 mb-4">
                Didn't receive the email? Check spam or
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="text-sm text-[#0f4c81] font-medium hover:underline"
              >
                Try a different username
              </button>
            </div>
          )}

          {/* Back to login */}
          <div className="mt-8 pt-6 border-t border-gray-100 flex justify-center">
            <button
              type="button"
              onClick={() => setCurrentPage?.("login")}
              className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-[#0f4c81] font-medium transition-colors"
            >
              <ArrowLeftIcon />
              Back to Sign In
            </button>
          </div>
        </div>
      </div>

      <p className="text-xs text-gray-400 mt-6">Version 10.0.0</p>
    </div>
  );
}
