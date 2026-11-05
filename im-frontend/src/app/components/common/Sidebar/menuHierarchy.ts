export interface ModulePermissions {
  view: boolean;
  add: boolean;
  edit: boolean;
  delete: boolean;
  import: boolean;
  export: boolean;
}
export interface ModuleHierarchyItem {
  moduleId: number;
  moduleCode: string;
  name: string;
  level: number;
  sequence: number;
  route?: string | null;
  permissions?: ModulePermissions | null;
  children: ModuleHierarchyItem[];
  selfOperation: boolean;
}
