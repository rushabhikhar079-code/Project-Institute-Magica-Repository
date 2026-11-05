import api from "../../services/api";
import { InstituteFilterState, InstituteListResponse } from "./institutetypes";
import { InstituteSubmitDto } from "./institutetypes"; // Import your form submit DTO
import { AccountHistorySearchDto } from "./accountHistoryTypes";
export const getInstitutes = async (
  filters: InstituteFilterState,
  pageNumber: number = 1,
  pageSize: number = 10,
  sortBy: string | null = null,
  sortDirection: "asc" | "desc" | null = null,
): Promise<InstituteListResponse> => {
  const formatDateTime = (dateStr?: string) => {
    if (!dateStr || dateStr.trim() === "") {
      return "0001-01-01T00:00:00.000Z";
    }
    return new Date(dateStr).toISOString();
  };

  // 🎯 Send fields FLAT at root level so [FromBody] InstituteSearchDto can bind them directly!
  const payload = {
    instName: filters.instituteName || "",
    cpName: filters.contactPerson || "",
    email: filters.email || "",
    phone: filters.phone || "",
    city: filters.city || "",
    institutePlan: Number(filters.institutePlan) || 0,
    status: filters.status !== undefined ? Number(filters.status) : 2,
    type: filters.type !== undefined ? Number(filters.type) : 2,
    regType:
      filters.registrationType !== undefined
        ? Number(filters.registrationType)
        : 2,
    dtExpiryFrom: formatDateTime(filters.expiryDateFrom),
    dtExpiryTo: formatDateTime(filters.expiryDateTo),

    // Pagination fields directly on the root DTO
    pageNumber: pageNumber,
    pageSize: pageSize,
    sortBy: sortBy || "",
    sortDirection: sortDirection || "",
  };

  console.log("PAYLOAD SENT TO BACKEND:", payload);

  const response = await api.post("/Institute/institute-search", payload, {
    showLoader: false,
  });

  return response.data.data;
};

export const getInstitutePlans = async () => {
  const response = await api.get("Common/institutePlans");
  return response.data.data;
};

export const createInstitute = async (payload: InstituteSubmitDto) => {
  const response = await api.post("/Institute/create-institute", payload, {
    showLoader: true,
  });
  return response.data;
};

export const updateInstitute = async (
  instituteId: string | number,
  payload: any,
) => {
  const response = await api.put(
    `/Institute/update-institute/${instituteId}`,
    payload,
    {
      showLoader: true,
    },
  );
  return response.data;
};
export const getInstituteById = async (instituteId: number | string) => {
  const response = await api.get(`/Institute/get-institute/${instituteId}`);
  return response.data;
};
export const getAccountHistory = async (
  searchParams: AccountHistorySearchDto,
) => {
  const response = await api.post("/Institute/account-history", searchParams);
  return response.data;
};

export const getAccountHistoryById = async (
  paymentHistoryId: number | string,
) => {
  const response = await api.get(
    `/Institute/account-history/${paymentHistoryId}`,
  );
  return response.data;
};

export const updateAccountHistory = async (
  paymentHistoryId: string | number,
  payload: any,
) => {
  const response = await api.put(
    `/Institute/update-accountHistory/${paymentHistoryId}`,
    payload,
    {
      showLoader: true,
    },
  );
  return response.data;
};
export const deleteInstitute = async (id: number): Promise<void> => {
  await api.delete(`/Institute/delete-institute/${id}`, {
    timeout: 120000,
    showLoader: false,
  });
};
