import { useNavigate } from "react-router-dom";
import api, { setLoggingOut } from "../../services/api";
import { RegisterInstituteDto, ApiResponse } from "./types";
import type {
  ForgotPasswordRequest,
  LoginRequest,
  LoginResponse,
  ResetPasswordRequest,
  ValidateResetTokenResponse,
} from "./types";

//captcha
export const getCaptcha = () => {
  return api.get("/Captcha/generate", {
    responseType: "blob",
  });
};
export const validateCaptcha = async (captchaId: string, userInput: string) => {
  console.log("captchaId:", captchaId);
  console.log("userInput:", userInput);

  const payload = {
    captchaId,
    userInput,
  };

  console.log("payload:", payload);
  const response = await api.post("/Captcha/validate", payload);
  return response.data;
};

//login
// export const login = (payload: LoginRequest) => {
//   return api.post<LoginResponse>("/Auth/CheckLogin", payload, {
//     showLoader: true,
//   });
// };
export const login = async (payload: LoginRequest): Promise<LoginResponse> => {
  const response = await api.post<LoginResponse>("/Auth/CheckLogin", payload, {
    showLoader: true,
  });
  const data = response.data?.data;
  if (data?.accessToken && data?.refreshToken) {
    localStorage.setItem("accessToken", data.accessToken);
    localStorage.setItem("refreshToken", data.refreshToken);
  }
  return response.data;
};

//forgotPassword
export const forgotPassword = async (data: ForgotPasswordRequest) => {
  const response = await api.post("/PasswordReset/forgot-password", data, {
    showLoader: true,
  });
  return response.data;
};
export const validateResetToken = async (
  token: string,
): Promise<ValidateResetTokenResponse> => {
  const response = await api.get(
    `/PasswordReset/validate-reset-token?token=${encodeURIComponent(token)}`,
  );

  return response.data;
};
export const resetPassword = async (data: ResetPasswordRequest) => {
  const response = await api.post("/PasswordReset/reset-password", data, {
    showLoader: true,
  });
  return response.data;
};

//institute-register
export const registerInstitute = async (payload: RegisterInstituteDto) => {
  const response = await api.post<ApiResponse>(
    "/Institute/RegisterInstitute",
    payload,
    {
      showLoader: true,
    },
  );
  return response.data;
};
// export const logout = async () => {
//   await api.post("/Auth/Logout");
// };
// Logout
export let isLoggingOut = false;
export const logout = async () => {
  try {
    setLoggingOut(true);
    const refreshToken = localStorage.getItem("refreshToken");

    // Pass the refresh token in the body so the backend revokes it
    if (refreshToken) {
      await api.post("/Auth/Logout", { token: refreshToken });
    } else {
      await api.post("/Auth/Logout");
    }
  } catch (error) {
    console.error("Logout request failed:", error);
  } finally {
    // Clear all token storage on client side
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    setLoggingOut(false);
  }
};
