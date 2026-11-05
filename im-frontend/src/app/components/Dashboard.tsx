import {
  RefreshCw,
  Bell,
  IndianRupee,
  Users,
  CheckCircle,
  AlertCircle,
  Cake,
  Play,
  CreditCard,
} from "lucide-react";
import {
  CollectionTrendChart,
  PaymentAnalysisChart,
  RegistrationStatusChart,
  MonthlyRevenueChart,
  AttendanceTrendsChart,
  QuickStatsCard,
  StudentGrowthChart,
  LeaveStatusDistributionChart,
  LiveNotificationsPanel,
} from "./DashboardCharts";
import {
  getDashboardCounts,
  DashboardCounts,
} from "../../app/services/dashboardService";
import { useEffect, useState } from "react";
import { useAppSelector } from "../redux/hooks";
import { formatCurrency } from "../features/auth/utils/formatters";

export function Dashboard() {
  const [dashboardCounts, setDashboardCounts] =
    useState<DashboardCounts | null>(null);
  const { instituteId, branchId } = useAppSelector((state) => state.branch);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchDashboardCounts = async () => {
      console.log("===== DASHBOARD LOADED =====");

      console.log("Dashboard Institute ID:", instituteId);
      console.log("Dashboard Branch ID:", branchId);
      try {
        const data = await getDashboardCounts();
        console.log(data);
        setDashboardCounts(data);
      } catch (error) {
        console.error("Failed to fetch dashboard counts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardCounts();
  }, []);
  const dashboardCards = dashboardCounts
    ? [
        {
          title: "Total Revenue",
          value: formatCurrency(dashboardCounts.totalRevenue),
          change: "+12.5%",
          icon: <IndianRupee className="w-5 h-5 text-white" />,
          color: "bg-[#0F4C81]",
        },
        {
          title: "Registered Students",
          value: dashboardCounts.activeStudentCount.toString(),
          change: "+8.2%",
          icon: <Users className="w-5 h-5 text-white" />,
          color: "bg-green-500",
        },
        {
          title: "Total Enquiries",
          value: dashboardCounts.registeredStudentCount.toString(),
          change: "+15.3%",
          icon: <CheckCircle className="w-5 h-5 text-white" />,
          color: "bg-blue-500",
        },
        {
          title: "Outstanding Collection",
          value: formatCurrency(dashboardCounts.totalOutstandingCollection),
          change: "-5.1%",
          icon: <AlertCircle className="w-5 h-5 text-white" />,
          color: "bg-orange-500",
        },
      ]
    : [];
  return (
    <div className="animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Institute Admin Dashboard
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Welcome back! Here's what's happening today.
          </p>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="flex items-center gap-2 px-3 py-2 bg-[#e0eef5] text-[#0F4C81] rounded-lg hover:bg-[#d4e5f0] transition-colors self-start sm:self-auto"
        >
          <RefreshCw className="w-4 h-4" />
          <span className="font-medium text-sm">Refresh</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mt-6 animate-slideUp">
        {dashboardCards.map((card) => (
          <QuickStatsCard
            key={card.title}
            title={card.title}
            value={card.value}
            change={card.change}
            icon={card.icon}
            color={card.color}
          />
        ))}
      </div>

      <div
        className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 mt-6 animate-slideUp"
        style={{ animationDelay: "0.1s" }}
      >
        <div className="transform transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl">
          <CollectionTrendChart />
        </div>
        <div className="transform transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl">
          <PaymentAnalysisChart />
        </div>
      </div>

      <div
        className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 mt-6 animate-slideUp"
        style={{ animationDelay: "0.2s" }}
      >
        <div className="transform transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl">
          <MonthlyRevenueChart />
        </div>
        <div className="transform transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl">
          <RegistrationStatusChart />
        </div>
      </div>

      <div
        className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 mt-6 animate-slideUp"
        style={{ animationDelay: "0.3s" }}
      >
        {/* <div className="transform transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl">
          <AttendanceTrendsChart />
        </div> */}
        <div className="transform transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl">
          <StudentGrowthChart />
        </div>
        <div className="transform transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl">
          <LeaveStatusDistributionChart />
        </div>
      </div>

      <div
        className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 mt-6 mb-8 animate-slideUp"
        style={{ animationDelay: "0.4s" }}
      >
        <div className="transform transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl">
          <LiveNotificationsPanel />
        </div>
      </div>
    </div>
  );
}

// function LiveNotificationsPanel() {
//   return (
//     <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-lg">
//       <div className="mb-4">
//         <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
//           <Bell className="w-5 h-5 text-[#0F4C81] animate-pulse" />
//           Live Notifications
//         </h3>
//         <p className="text-sm text-gray-500 mt-1">
//           Real-time updates and alerts
//         </p>
//       </div>
//       <div className="space-y-4 max-h-[400px] overflow-y-auto pr-1">
//         <NotificationItem
//           icon={<Cake className="w-5 h-5 text-pink-600 mt-0.5" />}
//           bg="from-pink-50 to-purple-50 border-pink-200"
//           title="🎉 Today's Birthdays"
//           sub="5 students celebrating today"
//           detail="Raj Kumar, Priya Singh, Ankit Sharma +2 more"
//           detailColor="text-pink-600"
//         />
//         <NotificationItem
//           icon={<Play className="w-5 h-5 text-blue-600 mt-0.5 animate-pulse" />}
//           bg="from-blue-50 to-cyan-50 border-blue-200"
//           title="🔴 Live Classes"
//           sub="3 classes currently ongoing"
//           detail="Physics (Grade 10) • Chemistry Lab • Math Advanced"
//           detailColor="text-blue-600"
//         />
//         <NotificationItem
//           icon={<CreditCard className="w-5 h-5 text-orange-600 mt-0.5" />}
//           bg="from-orange-50 to-red-50 border-orange-200"
//           title="💰 Payment Alerts"
//           sub="₹2,45,000 pending collection"
//           detail="18 overdue payments • 25 due this week"
//           detailColor="text-orange-600"
//         />
//         <NotificationItem
//           icon={<IndianRupee className="w-5 h-5 text-green-600 mt-0.5" />}
//           bg="from-green-50 to-emerald-50 border-green-200"
//           title="✅ Today's Collection"
//           sub="₹58,500 collected so far"
//           detail="12 payments received • Target: ₹75,000"
//           detailColor="text-green-600"
//         />
//       </div>
//     </div>
//   );
// }
