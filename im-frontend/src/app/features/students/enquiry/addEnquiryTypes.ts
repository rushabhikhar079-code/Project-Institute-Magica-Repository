export interface EnquiryFormData {
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
  // Follow-up
  FollowUpRequired: boolean;
  Followup: string;
  FollowDate: string;
  FollowTime: string;
  FollowupReminder: number;
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
  // Correspondence Address
  CorrAddress: string;
  countryC: string;
  countryidc: number | string;
  stateidc: number | string;
  cityidc: number | string;
  othercityc: string;
  state: string;
  city: string;
  District: string;
  pincode: string;

  // Permanent Address
  // Permanent Address
  PermanentAdd: string;
  country: string;
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
export interface FollowupStatus {
  sname: string;
  statusid: number;
  sflag: number;
  instid: number;
  branchid: number;
  reminder: number;
}
