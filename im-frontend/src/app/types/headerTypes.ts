export interface BranchItem {
  branchId: number;
  branchName: string;
}

export interface HeaderInfo {
  instituteName: string;
  userName: string;
  remainingDays: string;
  lastLogin: string;
  email: string;
  contactPerson?: string;
}

// Response payload structure inside 'data'
export interface HeaderPayload {
  header: HeaderInfo;
  branchlist: BranchItem[];
}

export interface HeaderApiResponse {
  status: string;
  statusCode: number;
  message: string;
  timeStamp: string;
  data: HeaderPayload;
}
