import api from "./api";

export const getHeaderDetails = async (instituteId?: number) => {
  try {
    const targetInstituteId =
      instituteId ?? Number(localStorage.getItem("instituteId")) ?? 0;

    const response = await api.get("/Auth/HeaderDetails", {
      params: targetInstituteId ? { instituteId: targetInstituteId } : {},
    });

    // Returns response.data.data from your C# ApiResponse wrapper
    return response.data?.data ?? response.data;
  } catch (error) {
    console.error("Failed to fetch header details:", error);
    return null;
  }
};
