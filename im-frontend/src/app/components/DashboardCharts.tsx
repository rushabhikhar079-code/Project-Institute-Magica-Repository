import {
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  IndianRupee,
  Users,
  UserCheck,
  Calendar,
  Cake,
  CreditCard,
  Play,
  Bell,
  X,
} from "lucide-react";
import { useState, useId, useEffect } from "react";
import {
  Branch,
  CollectionTrend,
  getBranches,
  getCollectionTrend,
  getLeaveDistribution,
  getStudentGrowth,
  LeaveDistributionResponse,
  StudentGrowthResponse,
} from "../services/dashboardService";
import { getRevenueData } from "../services/dashboardService";
import { useAppSelector } from "../redux/hooks";

import { formatCurrency } from "../features/auth/utils/formatters";
import { fetchPaymentAnalysis } from "../services/dashboardService";
import type { PaymentDataItem, PaymentPeriod } from "../types/dashboard";
import { fetchRegistrationStatus } from "../services/dashboardService";
import type { RegistrationDataItem } from "../types/dashboard";
import { fetchLiveNotifications } from "../services/dashboardService";
import type { LiveNotificationData } from "../types/dashboard";
import type { RootState } from "../redux/store";
import { createPortal } from "react-dom";
type CollectionTrendChartProps = {
  branchId: number;
};

// Collection Trend Chart
export function CollectionTrendChart() {
  // Generate 50 branches
  const instituteId = useAppSelector(
    (state: RootState) => (state.auth as any)?.instituteId,
  );

  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedBranch, setSelectedBranch] = useState(0);

  const [collectionData, setCollectionData] = useState<CollectionTrend | null>(
    null,
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getCollectionTrend(selectedBranch);
        setCollectionData(response);
      } catch (err) {
        console.error(err);
      }
    };

    fetchData();
  }, [selectedBranch]);
  useEffect(() => {
    const fetchBranches = async () => {
      const branchList = await getBranches(instituteId);
      try {
        console.log("branchList:", branchList);
        console.log("Is array:", Array.isArray(branchList));

        setBranches(branchList);
      } catch (err) {
        console.error("Error fetching branches:", err);
      }
    };

    if (instituteId > 0) {
      fetchBranches();
    }
  }, [instituteId]);

  const data = collectionData
    ? [
        {
          id: "today",
          name: "Today's Collection",
          amount: collectionData.today,
          fill: "#0F4C81",
        },
        {
          id: "current",
          name: "Current Month",
          amount: collectionData.currentMonth,
          fill: "#10b981",
        },
        {
          id: "previous",
          name: "Previous Month",
          amount: collectionData.previousMonth,
          fill: "#f59e0b",
        },
      ]
    : [];
  const hasData = collectionData && data.some((item) => item.amount > 0);
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6">
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Collection Trends
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              Collection comparison across time periods
            </p>
          </div>
          <div className="flex items-center gap-2">
            <label
              htmlFor="branch-select"
              className="text-sm font-medium text-gray-700"
            >
              Branch:
            </label>
            <select
              id="branch-select"
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(Number(e.target.value))}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value={0}>All Branches</option>

              {branches.map((branch) => (
                <option key={branch.branchId} value={branch.branchId}>
                  {branch.branchname}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
      {hasData ? (
        <ResponsiveContainer key={selectedBranch} width="100%" height={300}>
          <BarChart data={data} barCategoryGap="30%">
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="name" stroke="#6b7280" fontSize={12} />
            <YAxis stroke="#6b7280" fontSize={12} />
            <Tooltip
              contentStyle={{
                backgroundColor: "white",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                fontSize: "12px",
              }}
            />
            <Bar dataKey="amount" radius={[8, 8, 0, 0]} barSize={80}>
              {data.map((entry) => (
                <Cell key={`cell-${entry.id}`} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <div className="h-[300px] flex items-center justify-center text-gray-500">
          No collection data available
        </div>
      )}
    </div>
  );
}

// Payment Analysis Chart
export function PaymentAnalysisChart() {
  const [selectedPeriod, setSelectedPeriod] =
    useState<PaymentPeriod>("monthly");

  const [data, setData] = useState<PaymentDataItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const uid = useId();
  const branchId = useAppSelector(
    (state: RootState) => (state.auth as any)?.branchId,
  );
  useEffect(() => {
    let isMounted = true;
    const loadPaymentData = async () => {
      setLoading(true);
      // Pass selectedPeriod and branchId
      const chartData = await fetchPaymentAnalysis(selectedPeriod, branchId);
      if (isMounted) {
        setData(chartData);
        setLoading(false);
      }
    };

    loadPaymentData();

    // const data = getPaymentData(selectedPeriod);
    return () => {
      isMounted = false;
    };
  }, [selectedPeriod, branchId]);
  const getPeriodLabel = () => {
    switch (selectedPeriod) {
      case "today":
        return "Today's payment breakdown";
      case "weekly":
        return "Weekly payment received vs outstanding";
      case "monthly":
        return "Monthly payment received vs outstanding";
      default:
        return "Payment received vs outstanding";
    }
  };
  // Helper for formatting Y-axis values cleanly (e.g., 2.2M, 150k)
  const formatYAxis = (value: number) => {
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(0)}k`;
    return value.toString();
  };

  // return (
  //   <div className="bg-white border border-gray-200 rounded-2xl p-6">
  //     <div className="mb-4">
  //       <div className="flex items-center justify-between mb-2">
  //         <div>
  //           <h3 className="text-lg font-semibold text-gray-900">
  //             Payment Analysis
  //           </h3>
  //           <p className="text-sm text-gray-500 mt-1">{getPeriodLabel()}</p>
  //         </div>
  //         <div className="flex items-center gap-2">
  //           <label
  //             htmlFor="period-select"
  //             className="text-sm font-medium text-gray-700"
  //           >
  //             Period:
  //           </label>
  //           <select
  //             id="period-select"
  //             value={selectedPeriod}
  //             onChange={(e) => setSelectedPeriod(e.target.value)}
  //             className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:border-[#0F4C81] focus:outline-none focus:ring-2 focus:ring-[#0F4C81] focus:border-transparent transition-colors"
  //           >
  //             <option value="today">Today's Payment</option>
  //             <option value="weekly">Weekly Payment</option>
  //             <option value="monthly">Monthly Payment</option>
  //           </select>
  //         </div>
  //       </div>
  //     </div>
  //     <ResponsiveContainer key={selectedPeriod} width="100%" height={300}>
  //       <AreaChart data={data}>
  //         <defs>
  //           <linearGradient id={`${uid}-recv`} x1="0" y1="0" x2="0" y2="1">
  //             <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
  //             <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
  //           </linearGradient>
  //           <linearGradient id={`${uid}-out`} x1="0" y1="0" x2="0" y2="1">
  //             <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
  //             <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
  //           </linearGradient>
  //         </defs>
  //         <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
  //         <XAxis dataKey="name" stroke="#6b7280" fontSize={12} />
  //         <YAxis stroke="#6b7280" fontSize={12} />
  //         <Tooltip
  //           contentStyle={{
  //             backgroundColor: "white",
  //             border: "1px solid #e5e7eb",
  //             borderRadius: "8px",
  //             fontSize: "12px",
  //           }}
  //         />
  //         <Legend wrapperStyle={{ fontSize: "12px" }} />
  //         <Area
  //           type="monotone"
  //           dataKey="received"
  //           stroke="#10b981"
  //           fillOpacity={1}
  //           fill={`url(#${uid}-recv)`}
  //           name="Payment Received"
  //         />
  //         <Area
  //           type="monotone"
  //           dataKey="outstanding"
  //           stroke="#f97316"
  //           fillOpacity={1}
  //           fill={`url(#${uid}-out)`}
  //           name="Outstanding"
  //         />
  //       </AreaChart>
  //     </ResponsiveContainer>
  //   </div>
  // );
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6">
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Payment Analysis
            </h3>
            <p className="text-sm text-gray-500 mt-1">{getPeriodLabel()}</p>
          </div>

          <div className="flex items-center gap-2">
            <label
              htmlFor="period-select"
              className="text-sm font-medium text-gray-700"
            >
              Period:
            </label>
            <select
              id="period-select"
              value={selectedPeriod}
              onChange={(e) =>
                setSelectedPeriod(e.target.value as PaymentPeriod)
              }
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:border-[#0F4C81] focus:outline-none focus:ring-2 focus:ring-[#0F4C81] focus:border-transparent transition-colors"
            >
              <option value="today">Today's Payment</option>
              <option value="weekly">Weekly Payment</option>
              <option value="monthly">Monthly Payment</option>
            </select>
          </div>
        </div>
      </div>

      <div className="relative min-h-[300px]">
        {loading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/70 rounded-lg">
            <div className="text-sm text-gray-500 font-medium">
              Loading chart data...
            </div>
          </div>
        )}

        <ResponsiveContainer key={selectedPeriod} width="100%" height={300}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id={`${uid}-recv`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
              <linearGradient id={`${uid}-out`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="name" stroke="#6b7280" fontSize={12} />
            <YAxis
              stroke="#6b7280"
              fontSize={12}
              tickFormatter={formatCurrency}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "white",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                fontSize: "12px",
              }}
              formatter={(value: any) => [Number(value).toLocaleString(), ""]}
            />
            <Legend wrapperStyle={{ fontSize: "12px" }} />
            <Area
              type="monotone"
              dataKey="received"
              stroke="#10b981"
              fillOpacity={1}
              fill={`url(#${uid}-recv)`}
              name="Payment Received"
            />
            <Area
              type="monotone"
              dataKey="outstanding"
              stroke="#f97316"
              fillOpacity={1}
              fill={`url(#${uid}-out)`}
              name="Outstanding"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// Registration Status Pie Chart
export function RegistrationStatusChart() {
  const [data, setData] = useState<RegistrationDataItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const branchId = useAppSelector(
    (state: RootState) => (state.auth as any)?.branchId ?? 0,
  );
  useEffect(() => {
    let isMounted = true;

    const loadRegistrationData = async () => {
      setLoading(true);
      const chartData = await fetchRegistrationStatus(branchId);
      if (isMounted) {
        setData(chartData);
        setLoading(false);
      }
    };

    loadRegistrationData();

    return () => {
      isMounted = false;
    };
  }, [branchId]);

  const total = data.reduce((sum, item) => sum + item.value, 0);
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Registration Status
        </h3>
        <p className="text-sm text-gray-500 mt-1">
          Student registration breakdown
        </p>
      </div>

      <div className="relative min-h-[250px] flex flex-col md:flex-row items-center justify-between gap-6">
        {loading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/70 rounded-lg">
            <div className="text-sm text-gray-500 font-medium">
              Loading chart data...
            </div>
          </div>
        )}

        {/* Pie Chart with Center Total Label */}
        <div className="relative w-full md:w-1/2 h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={5}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
              />
            </PieChart>
          </ResponsiveContainer>

          {/* 🟢 Center Content displaying Total */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-2xl font-bold text-gray-900">{total}</span>
            <span className="text-xs text-gray-500 font-medium">Total</span>
          </div>
        </div>

        {/* Legend List */}
        <div className="flex flex-col gap-4 w-full md:w-1/2 pl-0 md:pl-4">
          {data.map((item, index) => {
            const percentage =
              total > 0 ? ((item.value / total) * 100).toFixed(1) : "0.0";

            return (
              <div key={index} className="flex items-start gap-3">
                <span
                  className="w-3 h-3 rounded-full mt-1 flex-shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <div className="flex flex-col text-sm">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-900">
                      {item.name}
                    </span>
                    <span className="text-gray-500">{item.value}</span>
                  </div>
                  <span className="text-xs text-gray-400 font-normal">
                    ({percentage}%)
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// Monthly Revenue Chart
export function MonthlyRevenueChart() {
  const [selectedPeriod, setSelectedPeriod] = useState("monthly");
  const branchId = useAppSelector((state) => state.branch.branchId);
  const instituteId = useAppSelector((state) => state.branch.instituteId);
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    const fetchRevenue = async () => {
      try {
        setLoading(true);

        const response = await getRevenueData(
          selectedPeriod,
          instituteId,
          branchId,
        );

        const formattedData = response.map((item) => ({
          name: item.timeSlot,
          revenue: item.netPayment,
        }));

        setData(formattedData);
      } catch (error) {
        console.error("Revenue API error", error);
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRevenue();
  }, [selectedPeriod, instituteId, branchId]);

  const getChartTitle = () => {
    switch (selectedPeriod) {
      case "monthly":
        return "Monthly Revenue";
      case "yearly":
        return "Yearly Revenue";
      default:
        return "Revenue";
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6">
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {getChartTitle()}
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <label
              htmlFor="revenue-period-select"
              className="text-sm font-medium text-gray-700"
            >
              View:
            </label>

            <select
              id="revenue-period-select"
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:border-[#0F4C81] focus:outline-none focus:ring-2 focus:ring-[#0F4C81] focus:border-transparent transition-colors"
            >
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="h-[300px] flex items-center justify-center text-gray-500">
          Loading revenue data...
        </div>
      ) : data.length === 0 ? (
        <div className="h-[300px] flex items-center justify-center text-gray-500">
          No revenue data available
        </div>
      ) : (
        <ResponsiveContainer key={selectedPeriod} width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />

            <XAxis dataKey="name" stroke="#6b7280" fontSize={12} />

            <YAxis
              stroke="#6b7280"
              fontSize={12}
              tickFormatter={formatCurrency}
            />

            <Tooltip
              formatter={(value: number) => [formatCurrency(value), "Revenue"]}
              contentStyle={{
                backgroundColor: "white",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                fontSize: "12px",
              }}
            />

            <Legend wrapperStyle={{ fontSize: "12px" }} />

            <Line
              type="monotone"
              dataKey="revenue"
              stroke="#0F4C81"
              strokeWidth={3}
              dot={{ fill: "#0F4C81", r: 5 }}
              name="Actual Revenue"
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

// Attendance Trends Chart
export function AttendanceTrendsChart() {
  const [selectedPeriod, setSelectedPeriod] = useState("weekly");

  const getAttendanceData = (period: string) => {
    switch (period) {
      case "today":
        return [
          { name: "Morning", present: 180, absent: 15, leave: 5 },
          { name: "Afternoon", present: 195, absent: 10, leave: 3 },
          { name: "Evening", present: 175, absent: 8, leave: 7 },
        ];
      case "weekly":
        return [
          { name: "Mon", present: 450, absent: 50, leave: 20 },
          { name: "Tue", present: 480, absent: 30, leave: 10 },
          { name: "Wed", present: 470, absent: 35, leave: 15 },
          { name: "Thu", present: 490, absent: 20, leave: 10 },
          { name: "Fri", present: 460, absent: 40, leave: 20 },
          { name: "Sat", present: 440, absent: 55, leave: 25 },
        ];
      case "monthly":
      default:
        return [
          { name: "Jan", present: 9500, absent: 850, leave: 350 },
          { name: "Feb", present: 9800, absent: 750, leave: 280 },
          { name: "Mar", present: 10200, absent: 680, leave: 320 },
          { name: "Apr", present: 9900, absent: 720, leave: 290 },
          { name: "May", present: 10400, absent: 650, leave: 310 },
          { name: "Jun", present: 10100, absent: 700, leave: 340 },
        ];
    }
  };

  const data = getAttendanceData(selectedPeriod);

  const getPeriodLabel = () => {
    switch (selectedPeriod) {
      case "today":
        return "Today's attendance breakdown";
      case "weekly":
        return "Weekly attendance overview";
      case "monthly":
        return "Monthly attendance overview";
      default:
        return "Attendance overview";
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6">
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Attendance Trends
            </h3>
            <p className="text-sm text-gray-500 mt-1">{getPeriodLabel()}</p>
          </div>
          <div className="flex items-center gap-2">
            <label
              htmlFor="attendance-period-select"
              className="text-sm font-medium text-gray-700"
            >
              Period:
            </label>
            <select
              id="attendance-period-select"
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:border-[#0F4C81] focus:outline-none focus:ring-2 focus:ring-[#0F4C81] focus:border-transparent transition-colors"
            >
              <option value="today">Today's</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
        </div>
      </div>
      <ResponsiveContainer key={selectedPeriod} width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="name" stroke="#6b7280" fontSize={12} />
          <YAxis stroke="#6b7280" fontSize={12} />
          <Tooltip
            contentStyle={{
              backgroundColor: "white",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
              fontSize: "12px",
            }}
          />
          <Legend wrapperStyle={{ fontSize: "12px" }} />
          <Bar
            dataKey="present"
            stackId="a"
            fill="#10b981"
            name="Present"
            radius={[0, 0, 0, 0]}
          />
          <Bar
            dataKey="absent"
            stackId="a"
            fill="#ef4444"
            name="Absent"
            radius={[0, 0, 0, 0]}
          />
          <Bar
            dataKey="leave"
            stackId="a"
            fill="#f59e0b"
            name="Leave"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// Quick Stats Cards with Icons
export function QuickStatsCard({
  title,
  value,
  change,
  icon,
  color,
}: {
  title: string;
  value: string;
  change: string;
  icon: React.ReactNode;
  color: string;
}) {
  const isPositive = change.startsWith("+");

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300 cursor-pointer">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg ${color} shadow-md`}>{icon}</div>
      </div>
      <div>
        <p className="text-sm text-gray-500 mb-1">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  );
}

export function StudentGrowthChart() {
  const uid = useId();

  const instituteId = useAppSelector(
    (state: RootState) => (state.auth as any)?.instituteId,
  );
  const branchId = useAppSelector((state) => state.branch.branchId);

  const [growthData, setGrowthData] = useState<StudentGrowthResponse[]>([]);

  useEffect(() => {
    if (!instituteId) return;

    const fetchStudentGrowth = async () => {
      try {
        const data = await getStudentGrowth(instituteId, branchId);
        setGrowthData(data ?? []);
      } catch (error) {
        console.error("Error fetching student growth:", error);
        setGrowthData([]);
      }
    };

    fetchStudentGrowth();
  }, [instituteId, branchId]);

  const chartData = growthData.map((item) => ({
    month: item.monthYear,
    students: item.studCount,
  }));
  if (chartData.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-2xl p-6">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Student Growth
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            Total active students over time
          </p>

          <div className="bg-white border border-gray-200 rounded-2xl p-6 h-[330px] flex items-center justify-center text-gray-500">
            No data available
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Student Growth</h3>
        <p className="text-sm text-gray-500 mt-1">
          Total active students over time
        </p>
      </div>

      <ResponsiveContainer width="100%" height={250}>
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id={`${uid}-students`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#0F4C81" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#0F4C81" stopOpacity={0} />
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />

          <XAxis dataKey="month" stroke="#6b7280" fontSize={12} />

          <YAxis stroke="#6b7280" fontSize={12} />

          <Tooltip
            contentStyle={{
              backgroundColor: "white",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
              fontSize: "12px",
            }}
          />

          <Area
            type="monotone"
            dataKey="students"
            stroke="#0F4C81"
            strokeWidth={2}
            fillOpacity={1}
            fill={`url(#${uid}-students)`}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

// Leave Status Distribution Chart
export function LeaveStatusDistributionChart() {
  const instituteId = useAppSelector(
    (state: RootState) => (state.auth as any)?.instituteId,
  );
  const branchId = useAppSelector((state) => state.branch.branchId);

  const [leaveData, setLeaveData] = useState<LeaveDistributionResponse[]>([]);

  useEffect(() => {
    if (!instituteId) return;

    const fetchLeaveDistribution = async () => {
      try {
        const data = await getLeaveDistribution(instituteId, branchId);
        setLeaveData(data ?? []);
      } catch (err) {
        console.error(err);
        setLeaveData([]);
      }
    };

    fetchLeaveDistribution();
  }, [instituteId, branchId]);
  const approved = leaveData.reduce((sum, item) => sum + item.approvedCount, 0);

  const rejected = leaveData.reduce((sum, item) => sum + item.rejectedCount, 0);

  const pending = leaveData.reduce((sum, item) => sum + item.pendingCount, 0);
  const data = [
    {
      type: "Applied",
      value: pending,
      color: "#f59e0b",
    },
    {
      type: "Approved",
      value: approved,
      color: "#10b981",
    },
    {
      type: "Unapproved",
      value: rejected,
      color: "#ef4444",
    },
  ];
  const hasData = approved > 0 || rejected > 0 || pending > 0;

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Staff Leave Distribution
        </h3>
        <p className="text-sm text-gray-500 mt-1">Current month leave status</p>
      </div>
      {!hasData ? (
        <div className="h-[250px] flex items-center justify-center text-gray-500">
          No leave distribution data available
        </div>
      ) : (
        <div className="flex flex-col md:flex-row items-center gap-6">
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                outerRadius={80}
                dataKey="value"
                label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-col gap-2">
            {data.map((item, index) => (
              <div key={index} className="flex items-center gap-3 py-1">
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-sm text-gray-700 font-medium">
                  {item.type}:{" "}
                  <span className="font-normal text-gray-600">
                    {item.value}
                  </span>
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function LiveNotificationsPanel() {
  const [notificationData, setNotificationData] =
    useState<LiveNotificationData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Modal display states
  const [showBirthdayModal, setShowBirthdayModal] = useState<boolean>(false);
  const [showLiveClassesModal, setShowLiveClassesModal] =
    useState<boolean>(false);

  const branchId = useAppSelector(
    (state: RootState) => (state.auth as any)?.branchId ?? 0,
  );

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      setLoading(true);
      const data = await fetchLiveNotifications(branchId);
      if (isMounted) {
        setNotificationData(data);
        setLoading(false);
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [branchId]);

  // 1. Process Live Classes List
  const liveClassObj = notificationData?.liveClasses?.[0];
  const liveCount = liveClassObj?.liveClassCount ?? "0";
  const rawLiveTopics = liveClassObj?.liveClassName || "";

  // Split bullet-separated topic string into a clean array
  const liveClassesList: string[] = rawLiveTopics
    ? rawLiveTopics
        .split("•")
        .map((topic) => topic.trim())
        .filter(
          (topic) =>
            topic.length > 0 && topic !== "No active live classes today",
        )
    : [];

  const maxVisibleClasses = 3;
  const hasMoreClasses = liveClassesList.length > maxVisibleClasses;
  const visibleClasses = liveClassesList
    .slice(0, maxVisibleClasses)
    .join(" • ");
  const hiddenClassesCount = liveClassesList.length - maxVisibleClasses;

  // 2. Process Birthday List Safely
  const birthdayList: string[] = notificationData?.staffBirthdays?.length
    ? notificationData.staffBirthdays.map((s) => s.staffName.trim())
    : Array.isArray(notificationData?.birthdayNames)
      ? (notificationData.birthdayNames as string[]).map((n) => n.trim())
      : typeof notificationData?.birthdayNames === "string" &&
          notificationData.birthdayNames.trim() !== ""
        ? notificationData.birthdayNames.split(",").map((n) => n.trim())
        : [];

  const maxVisibleBirthdays = 2;
  const hasMoreBirthdays = birthdayList.length > maxVisibleBirthdays;
  const visibleBirthdays = birthdayList
    .slice(0, maxVisibleBirthdays)
    .join(", ");
  const hiddenBirthdaysCount = birthdayList.length - maxVisibleBirthdays;

  return (
    <>
      {/* 🔴 MAIN NOTIFICATION PANEL CARD */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-lg relative">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Bell className="w-5 h-5 text-[#0F4C81] animate-pulse" />
            Live Notifications
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            Real-time updates and alerts
          </p>
        </div>

        {loading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/70 rounded-2xl">
            <span className="text-sm text-gray-500 font-medium">
              Loading notifications...
            </span>
          </div>
        )}

        <div className="space-y-4 max-h-[400px] overflow-y-auto pr-1">
          {/* 1. Today's Birthdays */}
          <div
            className={`flex items-start gap-3 p-3 bg-gradient-to-r from-pink-50 to-purple-50 border border-pink-200 rounded-lg transition-all hover:bg-pink-100/50 ${
              birthdayList.length > 0 ? "cursor-pointer" : ""
            }`}
            onClick={() => {
              if (birthdayList.length > 0) setShowBirthdayModal(true);
            }}
          >
            <Cake className="w-5 h-5 text-pink-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">
                🎉 Today's Birthdays
              </p>
              <p className="text-xs text-gray-600 mt-1">
                {notificationData?.birthdayCount ||
                  "No birthday alerts for today."}
              </p>

              {birthdayList.length > 0 ? (
                <p className="text-xs font-medium mt-1 text-pink-600">
                  {visibleBirthdays}
                  {hasMoreBirthdays && (
                    <span className="font-bold underline ml-1 hover:text-pink-700">
                      +{hiddenBirthdaysCount} more
                    </span>
                  )}
                </p>
              ) : (
                <p className="text-xs font-medium mt-1 text-gray-400">
                  No birthdays today
                </p>
              )}
            </div>
          </div>

          {/* 2. Live Classes */}
          <div
            className={`flex items-start gap-3 p-3 bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-lg transition-all hover:bg-blue-100/50 ${
              liveClassesList.length > 0 ? "cursor-pointer" : ""
            }`}
            onClick={() => {
              if (liveClassesList.length > 0) setShowLiveClassesModal(true);
            }}
          >
            <Play className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0 animate-pulse" />
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">
                🔴 Live Classes
              </p>
              <p className="text-xs text-gray-600 mt-1">
                {liveCount} {parseInt(liveCount) === 1 ? "class" : "classes"}{" "}
                currently ongoing
              </p>

              {liveClassesList.length > 0 ? (
                <p className="text-xs font-medium mt-1 text-blue-600">
                  {visibleClasses}
                  {hasMoreClasses && (
                    <span className="font-bold underline ml-1 hover:text-blue-700">
                      +{hiddenClassesCount} more
                    </span>
                  )}
                </p>
              ) : (
                <p className="text-xs font-medium mt-1 text-gray-400">
                  No active live classes today
                </p>
              )}
            </div>
          </div>

          {/* 3. Payment Alerts */}
          {/* <NotificationItem
            icon={<CreditCard className="w-5 h-5 text-orange-600 mt-0.5" />}
            bg="from-orange-50 to-red-50 border-orange-200"
            title="💰 Payment Alerts"
            sub="₹2,45,000 pending collection"
            detail="18 overdue payments • 25 due this week"
            detailColor="text-orange-600"
          /> */}

          {/* 4. Today's Collection */}
          <NotificationItem
            icon={<IndianRupee className="w-5 h-5 text-green-600 mt-0.5" />}
            bg="from-green-50 to-emerald-50 border-green-200"
            title="✅ Today's Collection"
            sub={notificationData?.todayCollection || "₹0.00 collected so far"}
            detail="Collection Status"
            detailColor="text-green-600"
          />
        </div>
      </div>

      {/* 🔴 MODALS OUTSIDE MAIN CARD (PREVENTS TRANSFORMATION SHIFTS) */}

      {/* Modal 1: Birthday List */}
      {showBirthdayModal &&
        createPortal(
          <div
            className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
            onClick={() => setShowBirthdayModal(false)}
          >
            <div
              className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-gray-100 animate-in fade-in zoom-in-95"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <Cake className="w-5 h-5 text-pink-600" />
                  <h4 className="font-semibold text-gray-900">
                    Today's Birthday List
                  </h4>
                </div>
                <button
                  type="button"
                  onClick={() => setShowBirthdayModal(false)}
                  className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
                {birthdayList.map((name, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-2.5 rounded-xl bg-pink-50/50 border border-pink-100 text-sm text-gray-800 font-medium"
                  >
                    <span className="w-2 h-2 rounded-full bg-pink-500 flex-shrink-0" />
                    <span>{name}</span>
                  </div>
                ))}
              </div>

              <div className="mt-5 text-right">
                <button
                  type="button"
                  onClick={() => setShowBirthdayModal(false)}
                  className="px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}

      {/* Modal 2: Ongoing Live Classes List */}
      {showLiveClassesModal &&
        createPortal(
          <div
            className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
            onClick={() => setShowLiveClassesModal(false)}
          >
            <div
              className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-gray-100 animate-in fade-in zoom-in-95"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <Play className="w-5 h-5 text-blue-600 animate-pulse" />
                  <h4 className="font-semibold text-gray-900">
                    Ongoing Live Classes ({liveCount})
                  </h4>
                </div>
                <button
                  type="button"
                  onClick={() => setShowLiveClassesModal(false)}
                  className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
                {liveClassesList.map((topic, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-2.5 rounded-xl bg-blue-50/50 border border-blue-100 text-sm text-gray-800 font-medium"
                  >
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500 flex-shrink-0 animate-ping" />
                    <span className="truncate">{topic}</span>
                  </div>
                ))}
              </div>

              <div className="mt-5 text-right">
                <button
                  type="button"
                  onClick={() => setShowLiveClassesModal(false)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}

function NotificationItem({
  icon,
  bg,
  title,
  sub,
  detail,
  detailColor,
}: {
  icon: React.ReactNode;
  bg: string;
  title: string;
  sub: string;
  detail: string;
  detailColor: string;
}) {
  return (
    <div
      className={`flex items-start gap-3 p-3 bg-gradient-to-r ${bg} border rounded-lg transition-all cursor-pointer`}
    >
      {icon}
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-900">{title}</p>
        <p className="text-xs text-gray-600 mt-1">{sub}</p>
        {detail && (
          <p className={`text-xs font-medium mt-1 ${detailColor}`}>{detail}</p>
        )}
      </div>
    </div>
  );
}
