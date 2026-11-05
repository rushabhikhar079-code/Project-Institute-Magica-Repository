// src/app/features/institutes/institutetypes.ts

export interface InstituteListType {
  instituteId: number;
  instituteName: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  institutePlan?: string;
  type?: string;
  status?: string;
  registrationType?: string;
  expiryDate?: string;
  payType?: string;
}

export interface InstituteFilterState {
  instituteName?: string;
  contactPerson?: string;
  city?: string;
  email?: string;
  phone?: string;
  institutePlan?: number;
  type?: number;
  status?: number;
  registrationType?: number;
  expiryDateFrom?: string;
  expiryDateTo?: string;
}

// 🎯 Matches your Swagger Request Body EXACTLY
export interface InstituteSearchPayload {
  pageNumber: number;
  pageSize: number;
  instName: string;
  cpName: string;
  cpEmail: string;
  cpPhone: string;
  city: string;
  institutePlan: number;
  status: number;
  type: number;
  regType: number;
  dtExpiryFrom: string | null;
  dtExpiryTo: string | null;
}

export type InstituteListResponse = {
  items: InstituteListType[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPrevious: boolean;
  hasNext: boolean;
};
export interface SubscriptionDetails {
  subscriptionPlan?: string;
  startDate?: string;
  endDate?: string;
  noOfDays?: number;
  noOfRegisteredStudents?: number;
  noOfEnquiryStudents?: number;
  noOfBranches?: number;
  // institutePlanId?: number;
  planStatus?: number;
}
export interface InstituteSubmitDto {
  regDate: string;
  instituteShortCode?: string;
  parentCompanyName?: string;
  instituteName: string;
  address: string;
  countryId: number;
  stateId: number;
  districtId?: number;
  otherCity?: string;
  pinCode?: string;
  phone?: string;
  email: string;
  noOfStudents?: number;
  instProCoachingFor?: string;
  salesPersonName?: string;
  isInternalUse: boolean;
  logo?: string; // Base64 string for API byte[] payload
  logoPath?: string;
  instituteType: number;
  instituteStatus: number;
  instituteExpiryDate?: string;
  isAllowStudModule: boolean;
  isAllowedAndroidApp: boolean;
  isAllowTestEngine: boolean;
  contactPerson: string;
  cpMobile: string;
  cpEmail: string;
  subscription?: SubscriptionDetails;
  institutePlanId: number;
}
export type InstituteFormMode = "add" | "edit";
