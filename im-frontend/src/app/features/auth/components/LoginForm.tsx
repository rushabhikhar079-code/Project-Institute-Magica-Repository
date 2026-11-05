import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import LeftPanel from "./LoginBanner";
import EyeIcon from "./EyeIcon";
import type { LoginProps } from "../types";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginFormData } from "../validations/loginSchema";
import { getCaptcha, login } from "../authService";
import UserIcon from "./UserIcon";
import { toast } from "react-toastify";
import { useAppDispatch } from "../../../redux/hooks";
import { setAuthData } from "../../../redux/slices/authSlice";
import ValidationErrorSummary from "../../../components/common/ValidationErrorSummary";
import { clearGlobalError } from "../../../redux/slices/errorSlice";

function LoginForm({ onForgotPassword, onRequestDemo }: LoginProps) {
  const dispatch = useAppDispatch();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });
  const [showPassword, setShowPassword] = useState(false);
  const [captchaImage, setCaptchaImage] = useState("");
  const [captchaId, setCaptchaId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

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

  useEffect(() => {
    dispatch(clearGlobalError());

    return () => {
      dispatch(clearGlobalError());
    };
  }, [dispatch]);
  const onSubmit = async (data: LoginFormData) => {
    if (isSubmitting) return;

    setIsSubmitting(true);

    try {
      const payload = {
        username: data.username,
        password: data.password,
        captchaId,
        captchaInput: data.captcha,
      };

      const response = await login(payload);

      const { instituteId, role } = response.data;

      dispatch(
        setAuthData({
          instituteId: instituteId ?? 0,
          role: role ?? "",
        }),
      );

      console.log("Response data:", response.data);

      toast.success(response.data.message);
      if (role === "1") {
        navigate("/subscription/manage-institutes");
      } else {
        navigate("/dashboard");
      }
    } catch (error: any) {
      console.error(error);

      // toast.error(
      //   error.response?.data?.message ||
      //     "Something went wrong. Please try again.",
      //   {
      //     toastId: "login-error",
      //   },
      // );

      await fetchCaptcha();
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <div className="min-h-screen w-full bg-slate-100 flex items-center justify-center p-4 lg:p-8">
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl overflow-hidden grid lg:grid-cols-[1.1fr_1fr]">
        <LeftPanel />

        {/* Right: Form */}
        <div className="flex flex-col justify-center px-8 py-12 sm:px-12 bg-white">
          <div className="w-full max-w-sm mx-auto">
            {/* Heading */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-1">
                Welcome back
              </h2>
              <p className="text-gray-500 text-sm">
                Sign in to your account to continue
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {/* Username */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Username
                </label>

                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
                    <UserIcon />
                  </span>

                  <input
                    type="text"
                    placeholder="Enter your username"
                    autoComplete="username"
                    {...register("username")}
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-800 placeholder:text-gray-400 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0f4c81]/30 focus:border-[#0f4c81] transition-all"
                  />
                </div>

                {errors.username && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.username.message}
                  </p>
                )}
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-sm font-medium text-gray-700">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={onForgotPassword}
                    className="text-xs text-[#0f4c81] hover:text-[#0a3a63] font-medium hover:underline transition-colors"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    autoComplete="current-password"
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
                {errors.password && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.password.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Captcha
                </label>
                <div className="flex items-center gap-2 mb-2">
                  <img
                    src={captchaImage}
                    draggable="false"
                    alt="Captcha"
                    className="h-10"
                  />

                  {/* Refresh */}
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
                  {/* Input */}
                  <input
                    type="text"
                    placeholder="Type captcha"
                    {...register("captcha")}
                    className={`flex-1 px-3 py-2.5 rounded-xl border text-sm placeholder:text-gray-400 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 transition-all ${
                      errors.captcha
                        ? "border-red-400 focus:ring-red-300"
                        : "border-gray-200 focus:ring-[#0f4c81]/30 focus:border-[#0f4c81]"
                    }`}
                  />
                </div>
                {errors.captcha && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.captcha.message}
                  </p>
                )}
              </div>
              <ValidationErrorSummary />
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#0f4c81] hover:bg-[#0a3a63] disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl shadow-lg shadow-[#0f4c81]/25 transition-all duration-200 text-sm mt-2"
              >
                Sign in
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-3 my-6">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-xs text-gray-400">or</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            {/* Register */}
            <button
              type="button"
              onClick={onRequestDemo}
              className="w-full border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 font-medium py-3 rounded-xl transition-all text-sm"
            >
              Register Your Institute
            </button>

            <p className="text-center text-xs text-gray-400 mt-6">
              By signing in you agree to our{" "}
              <a href="#" className="text-[#0f4c81] hover:underline">
                Terms
              </a>{" "}
              &{" "}
              <a href="#" className="text-[#0f4c81] hover:underline">
                Privacy Policy
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
export default LoginForm;
