import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { useAppDispatch, useAppSelector } from "../../../redux/hooks";
import { fetchModuleHierarchy } from "../../../redux/slices/menuSlice";

// import { menuRoutes } from "../../../menuRoutes";

import { SidebarItem } from "./SidebarItem";
import { ProfileMenu } from "./ProfileMenu";
import { DynamicSidebarMenu } from "./DynamicSidebarMenu";

import {
  Home,
  Settings,
  X,
  Building2,
  GitBranch,
  Building2Icon,
  BuildingIcon,
  Building,
  School,
} from "lucide-react";
import {
  setBranchId,
  setBranchLocation,
} from "../../../redux/slices/branchSlice";

import { getBranchById } from "../../../features/branches/branchService";
import type { ModuleHierarchyItem } from "../../common/Sidebar/menuHierarchy";
export type SidebarProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const dispatch = useAppDispatch();

  const location = useLocation();
  const navigate = useNavigate();
  const { branchId, branches } = useAppSelector((state) => state.branch);
  const { instituteModules, branchModules } = useAppSelector(
    (state) => state.menu,
  );
  console.log("===== SIDEBAR DEBUG =====");
  console.log("Institute Modules:", instituteModules);
  console.log("Branch Modules:", branchModules);
  console.log("Branch ID:", branchId);
  console.log("Branches:", branches);
  console.log("=========================");
  const [openMenu, setOpenMenu] = useState<string>("");

  const [openSection, setOpenSection] = useState<string>(
    branchId > 0 ? "branch" : "institute",
  );

  const [activeMenuItem, setActiveMenuItem] = useState("Home");

  const [activeSubMenuItem, setActiveSubMenuItem] = useState("");
  // const [selectedBranchId, setSelectedBranchId] = useState<number>(0);
  const selectedBranch = branches.find(
    (branch) => branch.branchId === branchId,
  );
  useEffect(() => {
    if (branchId > 0) {
      setOpenSection("branch");
    } else {
      setOpenSection("institute");
    }
  }, [branchId]);
  const handleBranchSelect = async (selectedBranchId: number) => {
    dispatch(setBranchId(selectedBranchId));

    try {
      const response = await getBranchById(selectedBranchId);

      console.log("SELECTED BRANCH DETAILS:", response);

      const branch = response.data;

      dispatch(
        setBranchLocation({
          countryId: branch.countryId,
          stateId: branch.stateId,
          cityId: branch.cityId,
          otherCity: branch.otherCity ?? "",
        }),
      );
    } catch (error) {
      console.error("Failed to load branch location:", error);

      dispatch(setBranchLocation(null));
    }

    setOpenSection("branch");
    setOpenMenu("");
    setActiveMenuItem("");
    setActiveSubMenuItem("");

    navigate("/dashboard");
  };
  // Fetch Institute and Branch module hierarchy
  // Fetch Institute Level modules
  useEffect(() => {
    dispatch(fetchModuleHierarchy(0));
  }, [dispatch]);

  // Fetch Branch Level modules when a branch is selected
  useEffect(() => {
    if (branchId > 0) {
      dispatch(fetchModuleHierarchy(1));
    }
  }, [dispatch, branchId]);

  // Sync Home active state with current route
  useEffect(() => {
    const currentPath = location.pathname.toLowerCase();

    if (currentPath === "/" || currentPath === "/dashboard") {
      setActiveMenuItem("Home");
      setActiveSubMenuItem("");
      setOpenMenu("");
    }
  }, [location.pathname]);

  const toggleMenu = (name: string) => {
    setOpenMenu((previous) => (previous === name ? "" : name));
  };

  // const go = (page: string, menuItem: string, subItem = "") => {
  //   const cleanPage = page.trim();

  //   setActiveMenuItem(menuItem);
  //   setActiveSubMenuItem(subItem.trim());

  //   // const route = menuRoutes[cleanPage];
  //   const route = dynamicModuleRoutes[cleanPage];
  //   if (route) {
  //     navigate(route);
  //   }
  // };
  const go = (module: ModuleHierarchyItem, menuItem: string, subItem = "") => {
    setActiveMenuItem(menuItem);
    setActiveSubMenuItem(subItem.trim());

    if (module.route) {
      navigate(module.route);
    } else {
      console.warn(`No route configured for module: ${module.name}`);
    }
  };
  return (
    <aside
      className={`
        fixed top-0 left-0 z-50
        h-screen w-64
        bg-[#0F4C81]
        border-r border-[#0A3860]
        shadow-xl
        transform
        transition-transform
        duration-300
        ease-in-out
        text-white
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
        xl:translate-x-0
      `}
    >
      {/* Header */}
      <div
        className="
          h-16
          border-b
          border-[#135A98]
          px-5
          flex
          items-center
          justify-between
          bg-[#0B3C68]
        "
      >
        <h2 className="text-lg font-bold text-white tracking-wide">Menu</h2>

        <button
          onClick={onClose}
          className="
            xl:hidden
            p-2
            rounded-lg
            text-white
            hover:bg-white/10
          "
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <nav
        className="
          p-3
          space-y-1
          mt-1
          overflow-y-auto
        "
        style={{
          maxHeight: "calc(100vh - 64px)",
        }}
      >
        {/* Home */}
        {/* <SidebarItem
          name="Home"
          icon={<Home className="w-5 h-5" />}
          active={activeMenuItem === "Home" && !activeSubMenuItem}
          hasDropdown={false}
          isOpen={false}
          onClick={() => {
            dispatch(setBranchId(0));

            setOpenSection("");
            setOpenMenu("");
            setActiveMenuItem("Home");
            setActiveSubMenuItem("");

            navigate("/dashboard");
          }}
        /> */}

        {/* Institute Level Section */}
        <SidebarItem
          name="Institute"
          icon={<Building2 className="w-5 h-5" />}
          active={openSection === "institute"}
          hasDropdown={true}
          isOpen={openSection === "institute"}
          onClick={() => {
            dispatch(setBranchId(0));
            setOpenSection((previous) =>
              previous === "institute" ? "" : "institute",
            );

            setOpenMenu("");
            setActiveMenuItem("");
            setActiveSubMenuItem("");
            navigate("/dashboard");
          }}
        />

        {openSection === "institute" && (
          <div className="ml-2 border-l border-sky-400/30">
            <DynamicSidebarMenu
              modules={instituteModules}
              openMenu={openMenu}
              activeMenuItem={activeMenuItem}
              activeSubMenuItem={activeSubMenuItem}
              toggleMenu={toggleMenu}
              go={go}
            />
          </div>
        )}
        {/* Go To Branch */}
        <SidebarItem
          name="Go to Branch"
          icon={<School className="w-5 h-5" />}
          active={openSection === "goToBranch"}
          hasDropdown={true}
          isOpen={openSection === "goToBranch"}
          onClick={() => {
            setOpenSection((previous) =>
              previous === "goToBranch" ? "" : "goToBranch",
            );

            setOpenMenu("");
          }}
        />

        {openSection === "goToBranch" && (
          <div className="mt-1 mb-2 ml-2 pl-2 border-l-2 border-sky-400/30 space-y-1 bg-[#07326B] p-1.5 rounded-md">
            {branches.map((branch) => {
              const isSelected = branch.branchId === branchId;

              return (
                <button
                  key={branch.branchId}
                  onClick={() => handleBranchSelect(branch.branchId)}
                  className={`
            w-full
            flex
            items-center
            gap-3
            pl-4
            pr-4
            py-2
            rounded-md
            text-xs
            font-medium
            text-left
            transition-colors
            ${
              isSelected
                ? "bg-[#00264D] text-white font-semibold border-l-4 border-sky-400"
                : "text-sky-100/80 hover:bg-[#07243F] hover:text-white"
            }
          `}
                >
                  {/* <GitBranch
                    className={`w-4 h-4 ${
                      isSelected ? "text-sky-300" : "text-sky-300/70"
                    }`}
                  /> */}

                  <span>{branch.branchName}</span>
                </button>
              );
            })}
          </div>
        )}
        {branchId > 0 && selectedBranch && (
          <>
            <SidebarItem
              name={selectedBranch.branchName}
              icon={
                <span className="relative inline-flex flex-shrink-0">
                  <School className="w-5 h-5" />

                  {/* {openSection === "branch" && ( */}
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full flex items-center justify-center shadow-sm">
                    <svg
                      viewBox="0 0 10 10"
                      fill="none"
                      stroke="white"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="w-2 h-2"
                    >
                      <polyline points="2,5.5 4,7.5 8,3" />
                    </svg>
                  </span>
                  {/* )} */}
                </span>
              }
              active={openSection === "branch"}
              hasDropdown={true}
              isOpen={openSection === "branch"}
              onClick={() => {
                setOpenSection((previous) =>
                  previous === "branch" ? "" : "branch",
                );

                setOpenMenu("");
              }}
            />

            {openSection === "branch" && (
              <div className="ml-2 border-l border-sky-400/30">
                <DynamicSidebarMenu
                  modules={branchModules}
                  openMenu={openMenu}
                  activeMenuItem={activeMenuItem}
                  activeSubMenuItem={activeSubMenuItem}
                  toggleMenu={toggleMenu}
                  go={go}
                />
              </div>
            )}
          </>
        )}
        {/* Branch Level - Temporary */}
        {/* <SidebarItem
          name="Branch Level"
          icon={<GitBranch className="w-5 h-5" />}
          active={false}
          hasDropdown={true}
          isOpen={openSection === "branch"}
          onClick={() => {
            setOpenSection((previous) =>
              previous === "branch" ? "" : "branch",
            );

            setOpenMenu("");
          }}
        /> */}

        {/* {openSection === "branch" && (
          <div className="ml-2">
            <DynamicSidebarMenu
              modules={branchModules}
              openMenu={openMenu}
              activeMenuItem={activeMenuItem}
              activeSubMenuItem={activeSubMenuItem}
              toggleMenu={toggleMenu}
              go={go}
            />
          </div>
        )} */}

        {/* Profile */}
        {/* <ProfileMenu
          open={openMenu === "Profile"}
          activeSubMenuItem={activeSubMenuItem}
          onToggle={() =>
            setOpenMenu((previous) => (previous === "Profile" ? "" : "Profile"))
          }
          onNavigate={go}
        /> */}

        {/* Settings */}
        {/* <SidebarItem
          name="Settings"
          icon={<Settings className="w-5 h-5" />}
          active={activeMenuItem === "Settings" && !activeSubMenuItem}
          hasDropdown={false}
          isOpen={false}
          onClick={() => go("Settings", "Settings")}
        /> */}
      </nav>
    </aside>
  );
}
