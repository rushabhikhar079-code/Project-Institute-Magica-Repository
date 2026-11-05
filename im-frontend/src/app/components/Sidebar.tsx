// import { ReactNode, useState } from "react";
// import { useAppDispatch, useAppSelector } from "../redux/hooks";
// import { fetchSubModules } from "../redux/slices/menuSlice";
// import { sidebarConfig } from "../sidebarConfig";
// import { useNavigate } from "react-router-dom";
// import {
//   X,
//   ChevronDown,
//   Home,
//   Building2,
//   FileText,
//   BookOpen,
//   Settings,
//   UserCircle,
//   Wrench,
//   School,
//   BarChart3,
//   Users,
//   CheckCircle,
//   Calendar,
//   Search,
//   IndianRupee,
//   ClipboardCheck,
//   Video,
//   Layers,
//   Bell,
//   RefreshCw,
//   User,
//   GitBranch,
//   Package,
//   Wallet,
//   Clock,
//   Upload,
//   CreditCard,
//   ShieldCheck,
//   History,
//   UserPlus,
//   UserCheck,
//   FileSpreadsheet,
//   Share2,
//   UserCheck2,
//   UserCog,
//   Megaphone,
//   LogIn,
//   FileUp,
//   CalendarClock,
//   BookX,
//   ChevronUp,
// } from "lucide-react";
// import { menuRoutes } from "../menuRoutes";

// export type SidebarProps = {
//   isOpen: boolean;
//   onClose: () => void;
//   setCurrentPage: (page: string) => void;
//   selectedBranch: string;
//   setSelectedBranch: (branch: string) => void;
//   currentPage: string;
// };

// export function Sidebar({
//   isOpen,
//   onClose,
//   setCurrentPage,
//   selectedBranch,
//   setSelectedBranch,
//   currentPage,
// }: SidebarProps) {
//   const dispatch = useAppDispatch();

//   const { modules, subModules, loadingSubModules } = useAppSelector(
//     (state) => state.menu,
//   );
//   const toggleProfile = () => {
//     setOpenMenu(openMenu === "Profile" ? "" : "Profile");
//   };
//   const navigate = useNavigate();
//   const [openMenu, setOpenMenu] = useState<string>("");
//   const [activeMenuItem, setActiveMenuItem] = useState("Home");
//   const [activeSubMenuItem, setActiveSubMenuItem] = useState("");
//   const toggleMenu = (name: string) => {
//     const config = sidebarConfig[name as keyof typeof sidebarConfig];
//     const moduleName = config?.moduleName ?? name;

//     const module = modules.find((m) => m.module === moduleName);

//     if (!module?.isSubModule) {
//       return;
//     }

//     if (!subModules[module.moduleId] && !loadingSubModules[module.moduleId]) {
//       dispatch(fetchSubModules(module.moduleId));
//     }

//     setOpenMenu(openMenu === name ? "" : name);
//   };
//   const go = (page: string, menuItem: string, subItem = "") => {
//     setActiveMenuItem(menuItem);
//     setActiveSubMenuItem(subItem);
//     setCurrentPage(page);

//     const route = menuRoutes[page];

//     if (route) {
//       navigate(route);
//     }
//   };

//   const isOnBranchPages =
//     selectedBranch &&
//     (currentPage === "manageStudents" ||
//       currentPage === "studentRegistration" ||
//       currentPage === "studentEnquiry" ||
//       currentPage.startsWith("branch") ||
//       currentPage.startsWith("students"));
//   const profileItem = () => (
//     <>
//       <button
//         onClick={() => setOpenMenu(openMenu === "Profile" ? "" : "Profile")}
//         className={`w-full flex items-center gap-3 px-4 py-3 rounded-md transition-colors duration-200 text-sm font-medium text-left ${
//           openMenu === "Profile"
//             ? "bg-[#00264D] text-sky-300 font-semibold"
//             : "text-sky-100/80 hover:bg-[#07243F] hover:text-white"
//         }`}
//       >
//         <UserCircle className="w-5 h-5" />
//         <span className="flex-1">Profile</span>

//         {openMenu === "Profile" ? (
//           <ChevronUp className="w-4 h-4" />
//         ) : (
//           <ChevronDown className="w-4 h-4" />
//         )}
//       </button>
//     </>
//   );

//   const sub = (
//     label: string,
//     active: boolean,
//     onClick: () => void,
//     icon: React.ReactNode,
//   ) => (
//     <button
//       key={label}
//       onClick={onClick}
//       className={`w-full flex items-center gap-3 pl-12 pr-4 py-2 rounded-md transition-colors duration-200 text-xs font-medium text-left ${
//         active
//           ? "bg-[#00264D] text-sky-300 font-semibold border-l-4 border-sky-400"
//           : "text-sky-100/80 hover:bg-[#07243F] hover:text-white"
//       }`}
//     >
//       <span className={active ? "text-sky-300" : "text-sky-300/70"}>
//         {icon}
//       </span>
//       {label}
//     </button>
//   );

//   const topItem = (
//     name: string,
//     icon: ReactNode,
//     hasDropdown: boolean,
//     onClickLeaf?: () => void,
//   ) => {
//     const active = activeMenuItem === name && !activeSubMenuItem;

//     return (
//       <div key={name}>
//         <button
//           onClick={() => {
//             if (hasDropdown) {
//               toggleMenu(name);
//             } else {
//               setActiveMenuItem(name);
//               setActiveSubMenuItem("");
//               onClickLeaf?.();
//             }
//           }}
//           className={`w-full flex items-center justify-between px-5 py-2.5 rounded-lg transition-colors duration-200 ${
//             active
//               ? "bg-[#00264D] text-white font-semibold shadow-inner"
//               : "text-white/90 hover:bg-white/10 hover:text-white"
//           }`}
//         >
//           <div className="flex items-center gap-3">
//             <span className={active ? "text-sky-300" : "text-sky-200/80"}>
//               {icon}
//             </span>

//             <span className="font-medium text-sm">{name}</span>
//           </div>

//           {hasDropdown && (
//             <ChevronDown
//               className={`w-4 h-4 text-sky-200/80 transition-transform duration-200 ${
//                 openMenu === name ? "rotate-180" : ""
//               }`}
//             />
//           )}
//         </button>
//       </div>
//     );
//   };
//   return (
//     <aside
//       className={`
//       fixed top-0 left-0 z-50 h-screen w-64 bg-[#0F4C81] border-r border-[#0A3860] shadow-xl
//       transform transition-transform duration-300 ease-in-out text-white
//       ${isOpen ? "translate-x-0" : "-translate-x-full"} xl:translate-x-0
//     `}
//     >
//       <div className="h-16 border-b border-[#135A98] px-5 flex items-center justify-between bg-[#0B3C68]">
//         <h2 className="text-lg font-bold text-white tracking-wide">Menu</h2>
//         <button
//           onClick={onClose}
//           className="xl:hidden p-2 rounded-lg text-white hover:bg-white/10"
//         >
//           <X className="w-5 h-5" />
//         </button>
//       </div>

//       <nav
//         className="p-3 space-y-1 mt-1 overflow-y-auto"
//         style={{ maxHeight: "calc(100vh - 64px)" }}
//       >
//         {topItem("Home", <Home className="w-5 h-5" />, false, () =>
//           setCurrentPage("dashboard"),
//         )}

//         {modules
//           .filter((module) => module.allowView)
//           .map((module) => {
//             const config = Object.entries(sidebarConfig).find(
//               ([, value]) => value.moduleName === module.module,
//             );
//             const hasDropdown = module.isSubModule;
//             const menuName = config?.[0] ?? module.module;
//             const icon = config?.[1].icon ?? <FileText className="w-5 h-5" />;

//             return (
//               <div key={module.moduleId}>
//                 {topItem(
//                   menuName,
//                   icon,
//                   hasDropdown,
//                   hasDropdown ? undefined : () => go(menuName, menuName),
//                 )}
//                 {hasDropdown && openMenu === menuName && (
//                   <div className="mt-1 mb-2 ml-2 pl-2 border-l-2 border-sky-400/30 space-y-1 bg-[#093256] p-1.5 rounded-md">
//                     {subModules[module.moduleId]?.map((item) =>
//                       sub(
//                         item.subModuleName,
//                         activeSubMenuItem === item.subModuleName,
//                         () =>
//                           go(item.subModuleName, menuName, item.subModuleName),
//                         <GitBranch className="w-4 h-4" />,
//                       ),
//                     )}
//                   </div>
//                 )}
//               </div>
//             );
//           })}
//         <button
//           onClick={() => setOpenMenu(openMenu === "Profile" ? "" : "Profile")}
//           className={`w-full flex items-center gap-3 px-4 py-3 rounded-md transition-colors duration-200 text-sm font-medium text-left ${
//             openMenu === "Profile"
//               ? "bg-[#00264D] text-sky-300 font-semibold"
//               : "text-sky-100/80 hover:bg-[#07243F] hover:text-white"
//           }`}
//         >
//           <UserCircle className="w-5 h-5" />

//           <span className="flex-1">Profile</span>

//           {openMenu === "Profile" ? (
//             <ChevronUp className="w-4 h-4" />
//           ) : (
//             <ChevronDown className="w-4 h-4" />
//           )}
//         </button>
//         {openMenu === "Profile" && (
//           <div className="mt-1 mb-2 ml-2 pl-2 border-l-2 border-sky-400/30 space-y-1 bg-[#093256] p-1.5 rounded-md">
//             {sub(
//               "My Profile",
//               activeSubMenuItem === "My Profile",
//               () => go("My Profile", "Profile", "My Profile"),
//               <User className="w-4 h-4" />,
//             )}

//             {sub(
//               "Edit Profile",
//               activeSubMenuItem === "Edit Profile",
//               () => go("Edit Profile", "Profile", "Edit Profile"),
//               <UserCircle className="w-4 h-4" />,
//             )}

//             {sub(
//               "Change Password",
//               activeSubMenuItem === "Change Password",
//               () => go("Change Password", "Profile", "Change Password"),
//               <RefreshCw className="w-4 h-4" />,
//             )}

//             {sub(
//               "Institute Profile",
//               activeSubMenuItem === "Institute Profile",
//               () => go("Institute Profile", "Profile", "Institute Profile"),
//               <School className="w-4 h-4" />,
//             )}
//           </div>
//         )}
//         {topItem("Settings", <Settings className="w-5 h-5" />, false, () =>
//           go("Settings", "Settings"),
//         )}
//       </nav>
//     </aside>
//   );
// }
