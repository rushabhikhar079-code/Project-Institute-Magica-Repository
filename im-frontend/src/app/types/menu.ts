export interface Module {
  moduleId: number;
  module: string;
  subModuleId: number | null;
  subModuleName: string | null;
  allowView: boolean;
  allowAdd: boolean;
  allowModify: boolean;
  allowDelete: boolean;
  allowReports: boolean;
  isSubModule: boolean; // <-- Ad
}

export interface SubModule {
  subModuleId: number;
  subModuleName: string;
  moduleId: number;
  isActive: boolean;
}
