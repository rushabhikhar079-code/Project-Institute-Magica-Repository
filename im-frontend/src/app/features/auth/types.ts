//captcha
export interface CaptchaResponse {
  image: string;
}

//login
export interface LoginProps {
  onForgotPassword?: () => void;
  onRequestDemo?: () => void;
}
export interface LoginRequest {
  username: string;
  password: string;
  captchaId: string;
  captchaInput: string;
}

export interface LoginData {
  accessToken?: string;
  refreshToken?: string;
  expiresIn?: number;
  instituteId?: number;
  role?: string;
  message?: string;
}
export interface LoginResponse {
  success: boolean;
  message: string;
  data: LoginData;
}
export interface RefreshTokenDto {
  token: string;
}

//forgotPassword
export interface ForgotPasswordProps {
  setCurrentPage?: (page: string) => void;
}
export interface ForgotPasswordRequest {
  username: string;
}
export interface ForgotPasswordResponse {
  success: boolean;
  message: string;
  maskedEmail: string;
}
//resetPassword
export interface ResetPasswordProps {
  setCurrentPage?: (page: string) => void;
}
export interface ResetPasswordRequest {
  token: string;
  password: string;
  confirmpassword: string;
}
//institute-register
export interface RegisterInstituteDto {
  username: string;
  instituteName: string;
  emailId: string;
  mobileNo: string;
  address: string;
  countryId?: number;
  stateId?: number;
  cityId?: number;
  pincode: string;
  contactPerson: string;
  remarks?: string;
  instNoOfStudents: string;
  instProvideCoachingFor: string;
  captchaId: string;
  captchaInput: string;
  otherCity?: string;
}
export interface ApiResponse<T = any> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
}

export interface ValidateResetTokenResponse {
  success: boolean;
  username: string;
  message: string;
}
