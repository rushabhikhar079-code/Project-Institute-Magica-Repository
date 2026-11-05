import { useState, createContext, useContext, useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { Sidebar } from "./common/Sidebar/Sidebar";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { fetchModules } from "../redux/slices/menuSlice";
// import { useAppSelector } from "../redux/hooks";
import { fetchSubModules } from "../redux/slices/menuSlice";
import SessionExpiredHandler from "../SessionExpiredHandler";

// Map old page-name strings → URL paths
export const PAGE_PATHS: Record<string, string> = {
  dashboard: "/",
  manageBranches: "/branches",
  manageStudents: "/students",
  studentRegistration: "/students/registration",
  studentEnquiry: "/students/enquiry",
  branchActivePayment: "/payment/active",
  branchPaymentProcessing: "/payment/processing",
  branchLiveClasses: "/classes/live",
  "studentsAttendance&Tracking": "/attendance",
  userProfile: "/profile",
  editProfile: "/profile/edit",
  changePassword: "/profile/change-password",
  academicReports: "/reports/academic",
  paymentReports: "/reports/payment",
  branchTestManagement: "/tests",
  testCreation: "/tests/create",
  testCalendar: "/tests/calendar",
  testMarksSheet: "/tests/marks",
  testOmrUpload: "/tests/omr",
  testOnline: "/tests/online",
  testResults: "/tests/results",
  testSchedule: "/tests/schedule",
  instituteRegistration: "/institutes/registration",
  manageInstitutes: "/institutes",
  clockTable: "/clock",
  login: "/login",
  resetPassword: "/reset-password",
  forgotPassword: "/forgot-password",
  register: "/register",
  "Manage Institutes": "/subscription/manage-institutes",
  "Manage Study Material": "courses/study-material",
  "Manage Study Materials": "courses/study-material",
  "study-material": "courses/study-material",
  managestudymaterial: "courses/study-material",
  manageStudyMaterial: "courses/study-material",
};

// Reverse map: URL path → page-name string (for Sidebar active highlighting)
const PATH_TO_PAGE: Record<string, string> = Object.fromEntries(
  Object.entries(PAGE_PATHS).map(([k, v]) => [v, k]),
);

interface AppContextValue {
  selectedBranch: string;
  setSelectedBranch: (b: string) => void;
  navigate: (page: string) => void;
}

const AppContext = createContext<AppContextValue>({
  selectedBranch: "",
  setSelectedBranch: () => {},
  navigate: () => {},
});

export const useAppContext = () => useContext(AppContext);

export function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState("");
  const dispatch = useAppDispatch();

  const { modules, subModules } = useAppSelector((state) => state.menu);
  const rnav = useNavigate();
  const { pathname } = useLocation();

  const navigate = (page: string) => {
    const path = PAGE_PATHS[page] ?? `/${page}`;
    rnav(path);
    setSidebarOpen(false);
  };

  const currentPage = PATH_TO_PAGE[pathname] ?? pathname.slice(1);
  const instituteId = useAppSelector((state) => state.auth?.instituteId);
  useEffect(() => {
    const accessToken = localStorage.getItem("accessToken");

    if (!accessToken) return;

    if (instituteId) {
      dispatch(fetchModules(instituteId));
    } else {
      dispatch(fetchModules());
    }
  }, [dispatch, instituteId]);
  useEffect(() => {
    const accessToken = localStorage.getItem("accessToken");

    if (!accessToken || !modules.length) return;

    modules.forEach((module) => {
      if (!subModules[module.moduleId]) {
        dispatch(fetchSubModules(module.moduleId));
      }
    });
  }, [dispatch, modules, subModules]);
  return (
    <>
      <SessionExpiredHandler />

      <AppContext.Provider
        value={{ selectedBranch, setSelectedBranch, navigate }}
      >
        <div className="min-h-screen bg-[#f9fafb] flex flex-col">
          <Sidebar
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
            // setCurrentPage={navigate}
            // selectedBranch={selectedBranch}
            // setSelectedBranch={setSelectedBranch}
            //currentPage={currentPage}
          />

          {sidebarOpen && (
            <div
              className="fixed inset-0 bg-black bg-opacity-50 z-40 xl:hidden"
              onClick={() => setSidebarOpen(false)}
            />
          )}

          <div className="flex flex-col min-h-screen xl:ml-64">
            {/* flex flex-col xl:ml-64 */}
            <Header
              onMenuClick={() => setSidebarOpen((o) => !o)}
              setCurrentPage={navigate}
            />

            <main className="flex-1 px-4 md:px-6 lg:px-8 py-6 md:py-8 bg-gradient-to-br from-gray-50 to-gray-100">
              <Outlet />
            </main>

            <Footer />
          </div>
        </div>
      </AppContext.Provider>
    </>
  );
}
