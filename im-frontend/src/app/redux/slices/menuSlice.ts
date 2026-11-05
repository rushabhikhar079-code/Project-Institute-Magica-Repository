import {
  createAsyncThunk,
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";
import {
  getModules,
  getSubModules,
  getModuleHierarchy,
} from "../../services/menuService";
import type { Module, SubModule } from "../../types/menu";
import { ModuleHierarchyItem } from "../../../app/components/common/Sidebar/menuHierarchy";
interface MenuState {
  modules: Module[];
  subModules: Record<number, SubModule[]>;
  loadingModules: boolean;
  loadingSubModules: Record<number, boolean>;
  error: string | null;

  // New Dynamic Sidebar
  instituteModules: ModuleHierarchyItem[];
  branchModules: ModuleHierarchyItem[];
  loadingInstituteModules: boolean;
  loadingBranchModules: boolean;
  hierarchyError: string | null;
}

const initialState: MenuState = {
  modules: [],
  subModules: {},
  loadingModules: false,
  loadingSubModules: {},
  error: null,
  // New Dynamic Sidebar
  instituteModules: [],
  branchModules: [],
  loadingInstituteModules: false,
  loadingBranchModules: false,
  hierarchyError: null,
};

export const fetchModules = createAsyncThunk(
  "menu/fetchModules",
  async (instituteId?: number) => {
    return await getModules(instituteId);
  },
  {
    condition: (_, { getState }: any) => {
      const { loadingModules } = getState().menu;
      const { instituteId } = getState().auth;

      // User is logged out
      if (instituteId === undefined || instituteId === null) {
        return false;
      }

      // Prevent duplicate requests
      if (loadingModules) {
        return false;
      }

      return true;
    },
  },
);

export const fetchSubModules = createAsyncThunk(
  "menu/fetchSubModules",
  async (moduleId: number) => {
    const subModules = await getSubModules(moduleId);

    return {
      moduleId,
      subModules,
    };
  },
  {
    // 🎯 PREVENT DUPLICATE CALLS:
    condition: (moduleId, { getState }: any) => {
      const { subModules, loadingSubModules } = getState().menu;

      if (loadingSubModules[moduleId] || subModules[moduleId]) {
        return false; // Blocks extra network calls completely
      }
      return true;
    },
  },
);

export const fetchModuleHierarchy = createAsyncThunk(
  "menu/fetchModuleHierarchy",

  async (branchSpecific: number) => {
    const modules = await getModuleHierarchy(branchSpecific);

    return {
      branchSpecific,
      modules,
    };
  },

  {
    condition: (branchSpecific, { getState }: any) => {
      const {
        instituteModules,
        branchModules,
        loadingInstituteModules,
        loadingBranchModules,
      } = getState().menu;

      if (
        branchSpecific === 0 &&
        (loadingInstituteModules || instituteModules.length > 0)
      ) {
        return false;
      }

      if (
        branchSpecific === 1 &&
        (loadingBranchModules || branchModules.length > 0)
      ) {
        return false;
      }

      return true;
    },
  },
);

const menuSlice = createSlice({
  name: "menu",
  initialState,
  reducers: {
    resetMenuState: (state) => {
      state.modules = [];
      state.subModules = {};

      // New
      state.instituteModules = [];
      state.branchModules = [];
      state.loadingInstituteModules = false;
      state.loadingBranchModules = false;
      state.hierarchyError = null;
    },
  },

  extraReducers: (builder) => {
    builder
      // Modules
      .addCase(fetchModules.pending, (state) => {
        state.loadingModules = true;
      })
      .addCase(
        fetchModules.fulfilled,
        (state, action: PayloadAction<Module[]>) => {
          state.loadingModules = false;
          state.modules = action.payload;
        },
      )
      .addCase(fetchModules.rejected, (state) => {
        state.loadingModules = false;
        state.error = "Failed to load modules";
      })

      // Submodules
      .addCase(fetchSubModules.pending, (state, action) => {
        state.loadingSubModules[action.meta.arg] = true;
      })
      .addCase(fetchSubModules.fulfilled, (state, action) => {
        state.loadingSubModules[action.payload.moduleId] = false;

        state.subModules[action.payload.moduleId] = action.payload.subModules;
      })
      .addCase(fetchSubModules.rejected, (state, action) => {
        state.loadingSubModules[action.meta.arg] = false;
      })
      // Module Hierarchy
      .addCase(fetchModuleHierarchy.pending, (state, action) => {
        state.hierarchyError = null;

        if (action.meta.arg === 0) {
          state.loadingInstituteModules = true;
        } else if (action.meta.arg === 1) {
          state.loadingBranchModules = true;
        }
      })
      .addCase(fetchModuleHierarchy.fulfilled, (state, action) => {
        const { branchSpecific, modules } = action.payload;

        if (branchSpecific === 0) {
          state.loadingInstituteModules = false;
          state.instituteModules = modules;
        } else if (branchSpecific === 1) {
          state.loadingBranchModules = false;
          state.branchModules = modules;
        }
      })

      .addCase(fetchModuleHierarchy.rejected, (state, action) => {
        if (action.meta.arg === 0) {
          state.loadingInstituteModules = false;
        } else if (action.meta.arg === 1) {
          state.loadingBranchModules = false;
        }

        state.hierarchyError = "Failed to load module hierarchy";
      });
  },
});
export const { resetMenuState } = menuSlice.actions;
export default menuSlice.reducer;
