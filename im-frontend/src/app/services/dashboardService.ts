// src/services/dashboardService.ts

import api from "./api";
import type { PaymentDataItem, PaymentPeriod } from "../types/dashboard";
import type { RegistrationDataItem } from "../types/dashboard";
import type { LiveNotificationData } from "../types/dashboard";
export interface DashboardCounts {
  totalRevenue: number;
  activeStudentCount: number;
  registeredStudentCount: number;
  totalOutstandingCollection: number;
}
export interface CollectionTrend {
  today: number;
  currentMonth: number;
  previousMonth: number;
}
export interface Branch {
  branchId: number;
  branchname: string;
}
export interface RevenueData {
  timeSlot: string;
  netPayment: number;
  branch_id: number;
}
export interface Branch {
  branchId: number;
  branchName: string;
}

export interface StudentGrowthResponse {
  studCount: number;
  registeredByMonth: number;
  monthName: string;
  monthYear: string;
}
export interface LeaveDistributionResponse {
  requestDate: string;
  approvedCount: number;
  rejectedCount: number;
  pendingCount: number;
}
interface ApiResponse<T> {
  status: string;
  statusCode: number;
  message: string;
  timeStamp: string;
  error: string | null;
  data: T;
}

export const getDashboardCounts = async () => {
  const response =
    await api.get<ApiResponse<DashboardCounts>>("Dashboard/count");

  return response.data.data;
};
// export const getCollectionTrend = async (branchId: number) => {
//   const response = await api.get<ApiResponse<CollectionTrend>>(
//     `/Dashboard/GetCollectionTrend/${branchId}`,
//   );

//   return response.data.data;
// };
export const getCollectionTrend = async (branchId: number) => {
  const response = await api.get<ApiResponse<CollectionTrend>>(
    `/Dashboard/collection-trends`,
    {
      params: {
        branchId,
      },
    },
  );

  console.log("Response:", response.data);

  return response.data.data;
};
export const getBranches = async (instituteId: number): Promise<Branch[]> => {
  const response = await api.get<ApiResponse<Branch[]>>(
    `/Dashboard/${instituteId}/branches`,
  );

  return response.data.data;
};
export const getStudentGrowth = async (
  instituteId: number,
  branchId: number,
) => {
  const response = await api.get("/Dashboard/student-growth", {
    params: {
      instituteId,
      branchId,
    },
  });

  return response.data.data;
};

export const getRevenueData = async (
  period: string,
  instituteId: number,
  branchId: number,
): Promise<RevenueData[]> => {
  const response = await api.get<ApiResponse<RevenueData[]>>(
    "/Dashboard/revenue",
    {
      params: {
        period,
        instituteId,
        branchId,
      },
    },
  );

  return response.data.data;
};
export const getLeaveDistribution = async (
  instituteId: number,
  branchId: number,
) => {
  const response = await api.get("/Dashboard/staff-leave-distribution", {
    params: {
      instituteId,
      branchId,
    },
  });

  return response.data.data;
};

export const fetchPaymentAnalysis = async (
  period: PaymentPeriod,
  branchId: Number = 0,
): Promise<PaymentDataItem[]> => {
  try {
    const response = await api.get("/Dashboard/payment-analysis", {
      params: {
        period,
        branchId,
      },
    });
    const rawData = response.data?.data ?? response.data ?? [];
    return rawData.map((item: any) => ({
      name: item.label ?? item.name ?? "",
      received: item.receivedAmount ?? item.received ?? 0,
      outstanding: item.outstandingAmount ?? item.outstanding ?? 0,
    }));
  } catch (error) {
    console.error("Failed to fetch payment analysis data:", error);
    return [];
  }
};

// Color mapping for statuses
const STATUS_COLORS: Record<string, string> = {
  Registration: "#10b981",
  Enquiry: "#f59e0b",
  Total: "#ef4444",
};
export const fetchRegistrationStatus = async (
  branchId: number = 0,
): Promise<RegistrationDataItem[]> => {
  try {
    const response = await api.get(`/Dashboard/registration-status`, {
      params: { branchId },
    });

    const data = response.data?.data ?? response.data;

    // Handle array or object structure depending on API return
    if (Array.isArray(data)) {
      return data.map((item: any) => ({
        name: item.name ?? item.status ?? "",
        value: item.value ?? item.count ?? 0,
        color: STATUS_COLORS[item.name] ?? item.color ?? "#6b7280",
      }));
    }

    // Default object mapping (e.g. { activeCount: 450, pendingCount: 89, inactiveCount: 45 })
    return [
      // {
      //   name: "Total Students",
      //   value: data?.totalCount ?? data?.active ?? 0,
      //   color: STATUS_COLORS.Active,
      // },
      {
        name: "Registration",
        value: data?.regCount ?? data?.pending ?? 0,
        color: STATUS_COLORS.Registration,
      },
      {
        name: "Enquiry",
        value: data?.enqCount ?? data?.inactive ?? 0,
        color: STATUS_COLORS.Enquiry,
      },
    ];
  } catch (error) {
    console.error("Failed to fetch registration status data:", error);
    return [];
  }
};

export const fetchLiveNotifications = async (
  branchId: number = 0,
): Promise<LiveNotificationData | null> => {
  try {
    const response = await api.get(`/Dashboard/live-notifications`, {
      params: { branchId },
    });
    return response.data?.data ?? null;
  } catch (error) {
    console.error("Failed to fetch live notifications:", error);
    return null;
  }
};
