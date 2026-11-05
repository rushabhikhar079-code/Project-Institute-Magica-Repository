export interface StudentSearchRequest {
  listType: "Registration" | "Enquiry" | "";

  studentName: string;
  reg: string;
  regManual: string;
  phone: string;

  regFrDate: string;
  regToDate: string;

  status: number;
  curriculumId: number;
  courseId: number;
  subId: number;
  batchId: number;
  enquiryStatus: number;

  notInBatch: boolean;

  branchId: number;

  pageNumber: number;
  pageSize: number;
  offset: number;

  sortBy: string | null;
  sortDirection: "asc" | "desc" | null;
}

export interface StudentList {
  RegNo: string;
  Name: string;
  PContact: string;
  FMobile: string;
  MMobile: string;
  EmailId: string;
  Status: string;
  Registered: string;
  RegNo_Manual: string;
  RegDate: string;
  BranchId: number;
  EnqStatus: string;
  Username: string;
  AllowStudModule: boolean;
  CourseNames: string;
  SubjectNames: string;
  BatchNames: string;
}

export interface StudentSearchResponse {
  items: StudentList[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPrevious: boolean;
  hasNext: boolean;
}
export interface AdmissionFormData {
  // Registration / Enquiry
  RegNo?: number;
  RegDate: string;
  RegNo_Manual: string;
  EnquiryDate: string;
  EnqStatus: number | string;
  Source: string;
  Registered: string;
  ActiveStatus: string;
  StatusFlag: number;

  // Follow-up
  FollowUpRequired: boolean;
  FollowDate: string;
  walkIn: string;
  walkInDate: string;

  // Remarks
  remark: string;
  newremarks: string;

  // Personal
  Image: File | null;
  Fname: string;
  Mname: string;
  Lname: string;
  Salutation: string | number;
  Gender: number | string;
  DOB: string;
  Age: number | string;
  Stud_Category: string;
  biometricattendanceid: string;

  // Contact
  PContact: string;
  FMobile: string;
  MMobile: string;
  HomeNo: string;
  EmailId: string;

  // Correspondence Address
  CorrAddress: string;
  countryidc: number | string;
  stateidc: number | string;
  cityidc: number | string;
  othercityc: string;
  state: string;
  city: string;
  District: string;
  pincode: string;

  // Permanent Address
  PermanentAdd: string;
  countryid: number | string;
  stateid: number | string;
  cityid: number | string;
  othercity: string;
  stateC: string;
  cityC: string;
  DistrictC: string;
  pincodeC: string;

  // Family
  FatherFname: string;
  FatherMname: string;
  FatherLname: string;
  Occupation: string;
  OrgName: string;
  Income: string;

  // Work
  Working: string;
  Company: string;
  Salary: string;

  // Other DB fields
  Comments: string;
  ValidUpto: string;
  Username: string;
  Password: string;
  InactiveStatus: string;
  AttendanceID: string;
  userid: number | string;
  Rollno: number | string;

  // Other fields shown in DB
  ParentCompanyName: string;
  GSTNumber: string;
}
export interface OtherFee {
  of_code: number;
  of_name: string;
  amount: number;
  istaxable: number;
  isincluding: number;
  of_FrequencyName: string;
}
