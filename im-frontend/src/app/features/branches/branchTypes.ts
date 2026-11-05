export type BranchList = {
  branchId: number;
  branchName: string;
  contactPerson: string;
  cpMobile: string | null;
  cpEmail: string | null;
  statusId: number;
  branchStatus: string;
  franchiseeFlag: number;
  taxRate: number;
  expiryDate: string;
};
export type BranchListResponse = {
  items: BranchList[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
};

export type BranchForm = {
  id: number;
  name: string;
  code: string;
  address: string;

  country: string;
  state: string;
  city: string;

  countryId: number;
  stateId: number;
  cityId: number;
  otherCity: string;

  pinCode: string;
  phone: string;
  email: string;

  taxRate: string;
  status: string;

  contactName: string;
  contactMobile: string;
  contactEmail: string;

  location: string;
  contact: string;
};
export interface UpdateBranchRequest {
  branchId: number;
  branchName: string;
  branchCode: string;
  address: string;
  countryId: number;
  stateId: number;
  cityId: number;
  otherCity: string;
  pinCode: string;
  phone: string;
  email: string;
  contactPerson: string;
  cpMobile: string;
  cpEmail: string;
  taxRate: number;
  status: number;
  makeFranchisee: number;
  signUpDate: string;
  signUpAmt: number;
  monthlyFee: number;
  examFee: number;
  certificationFee: number;
  commAll: number;
  studFee: number;
  agreementFileName: string;
  agreementFile: string;
  courseFees: CourseFee[];
  courseComms: CourseCommission[];
  // courseFees: {
  //   courseId: number;
  //   amount: number;
  // }[];
  // courseComms: {
  //   courseId: number;
  //   commission: number;
  // }[];
  branchStatus: boolean;
}
export interface BranchSubject {
  subId: number;
  subName: string;
  fees: number;
  studCount: number;
  totalFees: number;
  commission: number;
}

export interface BranchCourse {
  courseId: number;
  courseName: string;
  subjects: BranchSubject[];
}
export interface CourseFee {
  courseId: number;
  subId: number;
  amount: number;
}

export interface CourseCommission {
  courseId: number;
  subId: number;
  commission: number;
}
export interface SubjectItem {
  id: string;
  name: string;
  fees: number;
  selected: boolean;
  value: string | number;
}

export interface CourseGroup {
  id: string;
  title: string;
  hasTax: boolean;
  valueLabel: string;
  subjects: SubjectItem[];
}
