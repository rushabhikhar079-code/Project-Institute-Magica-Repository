export interface AccountHistoryDto {
  paymentHistoryId: number;
  userId: number;
  purchaseDate: string;
  amount: number;
  startDate: string;
  endDate: string;
  isActive: number; // 1 for active, 0 for inactive
  totalAmount: number;
  noOfStudents: number;
  days: number;
  months: number;
  noOfEnquiry: number;
  type: string; // e.g. "Trial", "Branch Wise", "Student Wise"
  noOfBranches: number;
  remark: string; // e.g. "Trial", "Branch Wise", "Student Wise"
}
export interface AccountHistorySearchDto {
  pageNumber?: number;
  pageSize?: number;
  instId: number;
  planName?: string;
  searchStatus?: string;
}
