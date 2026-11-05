export interface StudentSearchRequest {
  listType: "Registration" | "Enquiry" | "";

  studentName: string;
  reg: string;
  regManual: string;
  phone: string;

  regFrDate: string;
  regToDate: string;
  email: string;
  crclmId: number;
  status: number;

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

  courseNames?: string;
  subjectNames?: string;
  batchNames?: string;
  RegNo_Manual: string;
  RegDate: string;
  BranchId: number;
  EnqStatus: string;
  Username: string;
  AllowStudModule: boolean;
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
