import { useMemo } from "react";
import { useLocation } from "react-router-dom";
import { useAppSelector } from "../redux/hooks";
import { menuRoutes } from "../menuRoutes";

export interface BreadcrumbItem {
  label: string;
  path?: string;
}

const useBreadcrumb = () => {
  const location = useLocation();

  const { modules, subModules } = useAppSelector((state) => state.menu);

  return useMemo(() => {
    console.log("Current Path:", location.pathname);
    console.log("Modules:", modules);
    console.log("SubModules:", subModules);

    let breadcrumbs: BreadcrumbItem[] = [];

    for (const module of modules) {
      const currentSubModules = subModules[module.moduleId] ?? [];

      console.log("Checking Module:", module.module, currentSubModules);
      console.log(subModules);

      const matched = currentSubModules.find((subModule) => {
        const route = menuRoutes[subModule.subModuleName];

        const isMatched =
          route &&
          (location.pathname === route ||
            location.pathname.startsWith(`${route}/`));

        console.log({
          subModule: subModule.subModuleName,
          mappedRoute: route,
          currentPath: location.pathname,
          matched: isMatched,
        });

        return isMatched;
      });

      if (matched) {
        breadcrumbs = [
          {
            label: module.module,
          },
          {
            label: matched.subModuleName,
            path: menuRoutes[matched.subModuleName],
          },
        ];

        break;
      }
    }

    console.log("Breadcrumbs:", breadcrumbs);

    return {
      breadcrumbs,
    };
  }, [modules, subModules, location.pathname]);
};

export default useBreadcrumb;
