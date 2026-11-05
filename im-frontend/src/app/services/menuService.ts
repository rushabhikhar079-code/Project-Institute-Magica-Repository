// menuService.ts

import api from "./api";
import type { Module, SubModule } from "../types/menu";
import { ModuleHierarchyItem } from "../../app/components/common/Sidebar/menuHierarchy";
export const getModules = async (
  instituteId?: number,
  branchId: number = 0,
): Promise<Module[]> => {
  try {
    const instId =
      instituteId ?? Number(localStorage.getItem("instituteId")) ?? 0;
    const response = await api.get(
      `/Auth/institutes/${instId}/branches/${branchId}/getmodules`,
    );
    console.log(api.defaults.withCredentials);
    // const response = await api.get("/Auth/GetModules");
    return response.data?.data ?? response.data ?? [];
  } catch (error) {
    console.error("Failed to fetch modules:", error);
    return [];
  }
};

// export const getSubModules = async (moduleId: number) => {
//   const response = await api.get(`/Auth/GetSubModules/${moduleId}`, {
//     withCredentials: true,
//   });

//   return response.data.data;
// };
export const getSubModules = async (moduleId: number) => {
  // Guard against invalid/undefined moduleId calls
  if (!moduleId || isNaN(moduleId)) {
    console.warn("Invalid moduleId provided to getSubModules:", moduleId);
    return [];
  }

  const response = await api.get(`/Auth/GetSubModules/${moduleId}`);

  return response.data?.data;
};

export const getModuleHierarchy = async (
  branchSpecific: number,
): Promise<ModuleHierarchyItem[]> => {
  const response = await api.get(
    "/Auth/modules/modulehierarchy_branchSpecific",
    {
      params: {
        branchSpecific,
      },
    },
  );

  return response.data.data;
};
