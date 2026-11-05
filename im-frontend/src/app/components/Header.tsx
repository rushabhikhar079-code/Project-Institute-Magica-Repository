import React, { useEffect, useState } from "react";
import { Bell, User, LogOut, Menu } from "lucide-react";
import { logout } from "../features/auth/authService";
import { useNavigate } from "react-router-dom";
import { logout as logoutAction } from "../redux/slices/authSlice";
import { resetBranchState, setBranchList } from "../redux/slices/branchSlice";
import { resetMenuState } from "../redux/slices/menuSlice";
import { setLoggingOut } from "../services/api";
import { toast } from "react-toastify";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { getHeaderDetails } from "../services/headerService";
import Logo from "../../../assets/icons/logo.png";
type HeaderProps = {
  onMenuClick: () => void;
  setCurrentPage: (page: string) => void;
};

interface HeaderDetails {
  instituteName: string;
  userName: string;
  remainingDays: string;
  lastLogin: string;
  email: string;
  expiryDate: string;
  logoBase64?: string;
  roleName?: string;
}

export function Header({ onMenuClick, setCurrentPage }: HeaderProps) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const role = Number(
    useAppSelector(
      (state) => state.auth?.role || localStorage.getItem("role"),
    ) || 0,
  );
  const isSuperAdmin = role === 1;
  // Read state from Redux
  const { branchId, branches, instituteId } = useAppSelector(
    (state) => state.branch,
  );

  const [headerInfo, setHeaderInfo] = useState<HeaderDetails | null>(null);
  const selectedBranch =
    Number(branchId) > 0
      ? branches.find((branch) => Number(branch.branchId) === Number(branchId))
      : null;

  const instituteName = headerInfo?.instituteName || "";

  const displayTitle =
    Number(branchId) > 0 && selectedBranch
      ? `${instituteName} > ${selectedBranch.branchName}`
      : instituteName;

  console.log("HEADER DISPLAY DEBUG:", {
    branchId,
    branches,
    selectedBranch,
    instituteName,
    displayTitle,
  });

  useEffect(() => {
    const fetchHeaderData = async () => {
      try {
        const response: any = await getHeaderDetails(instituteId);

        // Unwrap response payload
        const payload = response?.data || response;

        // FIX: header is an ARRAY in your payload -> payload.header[0]
        const rawHeaderObj = Array.isArray(payload?.header)
          ? payload.header[0]
          : payload?.header;
        const branchList = payload?.branchlist;
        console.log("HEADER API branchList:", branchList);
        console.log("REDUX branchId:", branchId);

        if (rawHeaderObj) {
          setHeaderInfo({
            instituteName: rawHeaderObj.instituteName || "",
            userName: rawHeaderObj.userName || "",
            remainingDays: rawHeaderObj.remainingDays?.toString() || "0",
            lastLogin: rawHeaderObj.lastLogin || "",
            email: rawHeaderObj.email || "",
            expiryDate: rawHeaderObj.expiryDate || "",
            logoBase64: rawHeaderObj.logoBase64 || "",
            roleName: rawHeaderObj.roleName || "",
          });
        }

        if (branchList && Array.isArray(branchList)) {
          dispatch(setBranchList(branchList));
        }
      } catch (error) {
        console.error("Failed to load header details:", error);
      }
    };

    fetchHeaderData();
  }, [dispatch, instituteId]);

  const handleLogout = async () => {
    setLoggingOut(true);

    try {
      await logout();
      dispatch(logoutAction());
      dispatch(resetBranchState());
      dispatch(resetMenuState());
      toast.success("Logged out successfully");

      // Redirect to login
      navigate("/login");
    } catch (err) {
      console.error("Logout failed:", err);

      setLoggingOut(false);
    }
  };
  // Determines text color based on remaining days threshold
  const getSubscriptionColorClass = (daysStr: string | undefined): string => {
    if (daysStr === undefined || daysStr === null || daysStr === "")
      return "text-gray-500";

    const days = Number(daysStr);

    if (days > 15) {
      return "text-green-600"; // Green (> 15 days)
    } else if (days <= 15 && days > 7) {
      return "text-amber-500"; // Yellow/Amber (8 to 15 days)
    } else {
      return "text-red-600"; // Red (7 days or fewer, including expired)
    }
  };

  // Determines subscription text message matching legacy C# logic
  const getSubscriptionText = (daysStr: string | undefined): string => {
    if (daysStr === undefined || daysStr === null || daysStr === "")
      return "Subscription details unavailable";

    const days = Number(daysStr);

    if (days < 0) {
      return "Subscription Expired!";
    } else if (days === 0) {
      return "Subscription will expire Today";
    } else {
      return `Subscription will expire in ${days} days`;
    }
  };
  return (
    <header className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm">
      <div className="h-20 px-4 md:px-6 flex items-center justify-between">
        {/* Left Side: Dynamic "INSTITUTE > BRANCH" display */}
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="xl:hidden p-2 rounded-lg hover:bg-gray-100"
          >
            <Menu className="w-6 h-6" />
          </button>

          <div className="hidden sm:flex items-center gap-4">
            {/* Dynamic Logo / Text Fallback */}
            <img
              src={headerInfo?.logoBase64 ? headerInfo.logoBase64 : Logo}
              alt="Logo"
              className="h-12 md:h-14 w-auto object-contain"
            />
            {!isSuperAdmin && (
              <div className="hidden md:block">
                <p className="text-lg font-semibold text-gray-900">
                  {displayTitle || "Loading..."}
                </p>
                <p
                  className={`text-xs ${getSubscriptionColorClass(headerInfo?.remainingDays)}`}
                >
                  {getSubscriptionText(headerInfo?.remainingDays)}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Info & Profile Dropdown */}
        <div className="flex items-center gap-4">
          {/* <div className="hidden lg:block text-right">
            <p className="text-xs text-gray-500">
              (UTC+05:30) Chennai, Kolkata, Mumbai, New Delhi
            </p>
            <p className="text-xs text-gray-500">Date Format: dd/MM/yyyy</p>
          </div> */}

          <div className="flex items-center gap-2">
            <button className="p-2 rounded-lg hover:bg-gray-100">
              <Bell className="w-5 h-5 text-gray-700" />
            </button>

            {/* Profile Dropdown */}
            <div className="relative group">
              <button
                className="p-2 rounded-lg hover:bg-gray-100"
                onClick={() => setCurrentPage("userProfile")}
              >
                <User className="w-5 h-5 text-gray-700" />
              </button>

              <div className="absolute right-0 top-full mt-2 w-72 rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 overflow-hidden">
                {/* Header strip */}
                <div className="bg-gradient-to-br from-[#0F4C81] to-[#1a6fba] px-4 py-3 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center ring-2 ring-white/40">
                    <User className="w-5 h-5 text-white" />
                  </div>

                  <div>
                    <p className="text-sm font-bold text-white leading-tight">
                      {headerInfo?.userName || "--"}
                    </p>

                    <p className="text-[11px] text-sky-200">
                      {isSuperAdmin
                        ? "Super Admin"
                        : headerInfo?.roleName || "User"}
                    </p>
                  </div>
                </div>

                {/* Info rows */}
                <div className="bg-white divide-y divide-gray-100">
                  {(
                    [
                      // Hide Expiry Date ONLY for Super Admin
                      ...(!isSuperAdmin
                        ? [
                            {
                              label: "Expiry Date",
                              value:
                                headerInfo?.expiryDate ||
                                (headerInfo?.remainingDays
                                  ? `${headerInfo.remainingDays} days`
                                  : "--"),
                              color: "bg-emerald-50",
                              dot: "bg-emerald-400",
                              text: "text-emerald-700",
                            },
                          ]
                        : []),

                      {
                        label: "Last Login",
                        value: headerInfo?.lastLogin || "--",
                        color: "bg-violet-50",
                        dot: "bg-violet-400",
                        text: "text-violet-700",
                      },
                    ] as {
                      label: string;
                      value: string;
                      color: string;
                      dot: string;
                      text: string;
                    }[]
                  ).map(({ label, value, color, dot, text }) => (
                    <div
                      key={label}
                      className={`flex items-center gap-3 px-4 py-2.5 ${color}`}
                    >
                      <span
                        className={`w-2 h-2 rounded-full flex-shrink-0 ${dot}`}
                      />

                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">
                          {label}
                        </p>

                        <p className={`text-sm font-semibold ${text}`}>
                          {value}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Footer action */}
                <div className="bg-gray-50 px-4 py-2.5 border-t border-gray-100">
                  <button
                    onClick={() => setCurrentPage("userProfile")}
                    className="w-full text-xs font-semibold text-[#0F4C81] hover:text-indigo-700 transition-colors duration-150 text-center"
                  >
                    View Full Profile →
                  </button>
                </div>
              </div>
            </div>

            <button
              className="p-2 rounded-lg hover:bg-gray-100"
              onClick={handleLogout}
            >
              <LogOut className="w-5 h-5 text-gray-700" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
