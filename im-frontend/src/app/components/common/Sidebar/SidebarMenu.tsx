// import { FileText, GitBranch } from "lucide-react";
// import { SidebarItem } from "./SidebarItem";
// import { SidebarSubItem } from "./SidebarSubitem";
// import { sidebarConfig } from "../../../sidebarConfig";

// type SidebarMenuProps = {
//   modules: any[];
//   subModules: Record<number, any[]>;
//   openMenu: string;
//   activeMenuItem: string;
//   activeSubMenuItem: string;
//   toggleMenu: (name: string) => void;
//   go: (page: string, menuItem: string, subItem?: string) => void;
// };

// export function SidebarMenu({
//   modules,
//   subModules,
//   openMenu,
//   activeMenuItem,
//   activeSubMenuItem,
//   toggleMenu,
//   go,
// }: SidebarMenuProps) {
//   return (
//     <>
//       {(modules??[])
//         .filter((module) => module.allowView)
//         .map((module) => {
//           const config = Object.entries(sidebarConfig).find(
//             ([, value]) => value.moduleName === module.module,
//           );

//           const hasDropdown = module.isSubModule;
//           const menuName = config?.[0] ?? module.module;
//           const icon = config?.[1].icon ?? <FileText className="w-5 h-5" />;

//           return (
//             <div key={module.moduleId}>
//               <SidebarItem
//                 name={menuName}
//                 icon={icon}
//                 active={activeMenuItem === menuName && !activeSubMenuItem}
//                 hasDropdown={hasDropdown}
//                 isOpen={openMenu === menuName}
//                 onClick={() => {
//                   if (hasDropdown) {
//                     toggleMenu(menuName);
//                   } else {
//                     go(menuName, menuName);
//                   }
//                 }}
//               />

//               {hasDropdown && openMenu === menuName && (
//                 <div className="mt-1 mb-2 ml-2 pl-2 border-l-2 border-sky-400/30 space-y-1 bg-[#093256] p-1.5 rounded-md">
//                   {subModules[module.moduleId]?.map((item) => {
//                     const subConfig = Object.values(sidebarConfig).find(
//                       (config) => config.moduleName === item.subModuleName,
//                     );

//                     return (
//                       <SidebarSubItem
//                         key={item.subModuleId}
//                         label={item.subModuleName}
//                         active={activeSubMenuItem === item.subModuleName}
//                         onClick={() =>
//                           go(item.subModuleName, menuName, item.subModuleName)
//                         }
//                         icon={
//                           subConfig?.icon ?? <GitBranch className="w-4 h-4" />
//                         }
//                       />
//                     );
//                   })}
//                 </div>
//               )}
//             </div>
//           );
//         })}
//     </>
//   );
// }
import { FileText, GitBranch } from "lucide-react";
import { SidebarItem } from "./SidebarItem";
import { SidebarSubItem } from "./SidebarSubitem";
import { sidebarConfig } from "../../../sidebarConfig";

type SidebarMenuProps = {
  modules: any[];
  subModules: Record<number, any[]>;
  openMenu: string;
  activeMenuItem: string;
  activeSubMenuItem: string;
  toggleMenu: (name: string) => void;
  go: (page: string, menuItem: string, subItem?: string) => void;
};

export function SidebarMenu({
  modules,
  subModules,
  openMenu,
  activeMenuItem,
  activeSubMenuItem,
  toggleMenu,
  go,
}: SidebarMenuProps) {
  return (
    <>
      {(modules ?? [])
        .filter((module) => module.allowView)
        .map((module) => {
          const config = Object.entries(sidebarConfig).find(
            ([, value]) => value.moduleName === module.module,
          );

          const hasDropdown = module.isSubModule;
          const menuName = config?.[0] ?? module.module;
          const icon = config?.[1].icon ?? <FileText className="w-5 h-5" />;

          return (
            <div key={module.moduleId}>
              <SidebarItem
                name={menuName}
                icon={icon}
                active={activeMenuItem === menuName && !activeSubMenuItem}
                hasDropdown={hasDropdown}
                isOpen={openMenu === menuName}
                onClick={() => {
                  if (hasDropdown) {
                    toggleMenu(menuName);
                  } else {
                    go(menuName, menuName);
                  }
                }}
              />

              {hasDropdown && openMenu === menuName && (
                <div className="mt-1 mb-2 ml-2 pl-2 border-l-2 border-sky-400/30 space-y-1 bg-[#093256] p-1.5 rounded-md">
                  {subModules[module.moduleId]?.map((item) => {
                    // 🎯 Safely handle BOTH PascalCase (backend) and camelCase
                    const rawSubName =
                      item.subModuleName || item.SubModuleName || "";
                    const subName = rawSubName.trim();
                    const subId = item.subModuleId || item.SubModuleId;

                    const subConfig = Object.values(sidebarConfig).find(
                      (config) => config.moduleName === subName,
                    );

                    return (
                      <SidebarSubItem
                        key={subId}
                        label={subName}
                        active={
                          activeSubMenuItem === subName ||
                          activeSubMenuItem.toLowerCase() ===
                            subName.toLowerCase()
                        }
                        onClick={() => go(subName, menuName, subName)}
                        icon={
                          subConfig?.icon ?? <GitBranch className="w-4 h-4" />
                        }
                      />
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
    </>
  );
}
