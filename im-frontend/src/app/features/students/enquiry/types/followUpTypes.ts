export interface EnquiryFollowUpSearchRequest {
  category: number;
  studentName?: string;
  courseIds?: string;
  subjectIds?: string;
  enqStatus?: number | null;
  fromDate?: string;
  toDate?: string;
  filterOn: number;
  callbackFromDate?: string;
  callbackToDate?: string;
  branchId: number;
  pageNumber?: number;
  pageSize?: number;
  sortBy?: string | null;
  sortDirection?: "asc" | "desc";
}

export interface EnquiryFollowUpRow {
  regNo: number;
  enquiryDate: string;
  name: string;
  pContact: string;
  subjects: string;
  callBackDate: string;
  callbackTime: string;
  followDate: string;
  remark: string;
  regNoManual: string;
  enquiryStatus?: number | null;
  enqStatusText: string;
  registered: string;
  eDate: string;
  isInterested?: boolean | null;
}

export interface PaginatedEnquiryFollowUpResponse {
  items: EnquiryFollowUpRow[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface FollowUpRemarkHistoryItem {
  callDate: string;
  remarks: string;
  called_By: string;
  callId: number;
  callbackDate?: string | null;
  callbackTime?: string | null;
}

export interface FollowUpStatusOption {
  statusId: number;
  statusName: string;
  flag: number;
  reminder: number;
  productive: string;
  instId: number;
}

export interface FollowUpSubmitPayload {
  studentId: number;
  enquiryStatus: number;
  statusId: number;
  callbackDate?: string | null;
  callbackTime?: string | null;
  interested: boolean;
  remarks: string;
  branchId: number;
}

export interface EnquiryFollowUpFilters {
  category: number;
  studentName: string;
  courseIds: string;
  subjectIds: string;
  enqStatus: number;
  fromDate: string;
  toDate: string;
  filterOn: number;
  callbackFromDate: string;
  callbackToDate: string;
  allBranches: boolean;
}
