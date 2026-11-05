import { FileText, GitBranch } from "lucide-react";

import { SidebarItem } from "./SidebarItem";
import { SidebarSubItem } from "./SidebarSubitem";

import { sidebarConfig } from "../../../sidebarConfig";

import type { ModuleHierarchyItem } from "../../common/Sidebar/menuHierarchy";

type DynamicSidebarMenuProps = {
  modules: ModuleHierarchyItem[];
  openMenu: string;
  activeMenuItem: string;
  activeSubMenuItem: string;

  toggleMenu: (name: string) => void;

  go: (module: ModuleHierarchyItem, menuItem: string, subItem?: string) => void;
};

export function DynamicSidebarMenu({
  modules,
  openMenu,
  activeMenuItem,
  activeSubMenuItem,
  toggleMenu,
  go,
}: DynamicSidebarMenuProps) {
  return (
    <>
      {(modules ?? []).map((module) => {
        const hasChildren = module.children && module.children.length > 0;

        const config = Object.entries(sidebarConfig).find(
          ([, value]) => value.moduleName === module.name,
        );

        const icon = config?.[1].icon ?? <FileText className="w-5 h-5" />;

        return (
          <div key={module.moduleId}>
            <SidebarItem
              name={module.name}
              icon={icon}
              active={activeMenuItem === module.name && !activeSubMenuItem}
              hasDropdown={hasChildren}
              isOpen={openMenu === module.name}
              onClick={() => {
                if (hasChildren) {
                  toggleMenu(module.name);
                } else {
                  go(module, module.name);
                }
              }}
            />

            {hasChildren && openMenu === module.name && (
              <div className="mt-1 mb-2 ml-2 pl-2 border-l-2 border-sky-400/30 space-y-1 bg-[#07326B] p-1.5 rounded-md">
                {module.children.map((child) => {
                  const childConfig = Object.values(sidebarConfig).find(
                    (config) => config.moduleName === child.name,
                  );

                  return (
                    <SidebarSubItem
                      key={child.moduleId}
                      label={child.name}
                      active={
                        activeSubMenuItem === child.name ||
                        activeSubMenuItem.toLowerCase() ===
                          child.name.toLowerCase()
                      }
                      onClick={() => go(child, module.name, child.name)}
                      icon={
                        childConfig?.icon ?? <GitBranch className="w-4 h-4" />
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
