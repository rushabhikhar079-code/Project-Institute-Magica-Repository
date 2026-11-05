import { useState } from 'react';
import { ChevronDown, ChevronRight, Filter, Download, FileText, Receipt, CreditCard, TrendingUp, RefreshCw, IndianRupee, Calendar, Building2 } from 'lucide-react';

type ReportCategory = 'summary' | 'detailed' | 'refunds' | 'expenses';

interface ReportType {
  id: string;
  name: string;
  description: string;
  needsFilters: boolean;
}

interface ReportGroup {
  title: string;
  icon: React.ReactNode;
  reports: ReportType[];
}

export function PaymentReports() {
  const [activeCategory, setActiveCategory] = useState<ReportCategory>('summary');
  const [selectedReport, setSelectedReport] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // Report categories
  const categories = [
    { id: 'summary' as ReportCategory, name: 'Summary Reports', icon: <TrendingUp className="w-4 h-4" /> },
    { id: 'detailed' as ReportCategory, name: 'Detailed Reports', icon: <FileText className="w-4 h-4" /> },
    { id: 'refunds' as ReportCategory, name: 'Refunds', icon: <RefreshCw className="w-4 h-4" /> },
    { id: 'expenses' as ReportCategory, name: 'Expenses', icon: <IndianRupee className="w-4 h-4" /> },
  ];

  // Report groups by category
  const reportGroups: Record<ReportCategory, ReportGroup[]> = {
    summary: [
      {
        title: 'Payment Collection',
        icon: <Receipt className="w-4 h-4" />,
        reports: [
          { id: 'daily-collection', name: 'Daily Collection Summary', description: 'View total payments collected per day', needsFilters: true },
          { id: 'monthly-collection', name: 'Monthly Collection Summary', description: 'Aggregate payment data by month', needsFilters: true },
          { id: 'branch-wise', name: 'Branch-wise Collection', description: 'Compare collections across branches', needsFilters: true },
        ],
      },
      {
        title: 'Fee Analysis',
        icon: <TrendingUp className="w-4 h-4" />,
        reports: [
          { id: 'pending-fees', name: 'Pending Fees Overview', description: 'Students with outstanding fees', needsFilters: true },
          { id: 'course-revenue', name: 'Course-wise Revenue', description: 'Revenue breakdown by course', needsFilters: true },
          { id: 'payment-trends', name: 'Payment Trends', description: 'Analyze payment patterns over time', needsFilters: true },
        ],
      },
    ],
    detailed: [
      {
        title: 'Transaction Records',
        icon: <CreditCard className="w-4 h-4" />,
        reports: [
          { id: 'all-transactions', name: 'All Payment Transactions', description: 'Complete transaction history with details', needsFilters: true },
          { id: 'student-payments', name: 'Student Payment History', description: 'Individual student payment records', needsFilters: true },
          { id: 'payment-mode', name: 'Payment Mode Breakdown', description: 'Transactions grouped by payment method', needsFilters: true },
        ],
      },
      {
        title: 'Fee Structure',
        icon: <FileText className="w-4 h-4" />,
        reports: [
          { id: 'fee-receipts', name: 'Fee Receipts', description: 'Detailed receipt records', needsFilters: true },
          { id: 'installment-tracking', name: 'Installment Tracking', description: 'Track fee installment status', needsFilters: true },
          { id: 'late-payments', name: 'Late Payment Report', description: 'Payments received after due date', needsFilters: true },
        ],
      },
    ],
    refunds: [
      {
        title: 'Refund Processing',
        icon: <RefreshCw className="w-4 h-4" />,
        reports: [
          { id: 'refund-summary', name: 'Refund Summary', description: 'Overview of all refunds processed', needsFilters: true },
          { id: 'pending-refunds', name: 'Pending Refunds', description: 'Refunds awaiting processing', needsFilters: false },
          { id: 'refund-history', name: 'Refund History', description: 'Complete refund transaction history', needsFilters: true },
        ],
      },
    ],
    expenses: [
      {
        title: 'Institute Expenses',
        icon: <IndianRupee className="w-4 h-4" />,
        reports: [
          { id: 'expense-summary', name: 'Expense Summary', description: 'Overview of all expenses', needsFilters: true },
          { id: 'category-expenses', name: 'Category-wise Expenses', description: 'Expenses grouped by category', needsFilters: true },
          { id: 'vendor-payments', name: 'Vendor Payments', description: 'Payments made to vendors', needsFilters: true },
        ],
      },
      {
        title: 'Salary & Payroll',
        icon: <FileText className="w-4 h-4" />,
        reports: [
          { id: 'salary-summary', name: 'Salary Summary', description: 'Staff salary overview', needsFilters: true },
          { id: 'payroll-register', name: 'Payroll Register', description: 'Detailed payroll records', needsFilters: true },
        ],
      },
    ],
  };

  const handleReportSelect = (reportId: string, needsFilters: boolean) => {
    setSelectedReport(reportId);
    setShowFilters(needsFilters);
  };

  const handleGenerateReport = () => {
    console.log('Generating report:', selectedReport);
    // Report generation logic here
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold text-gray-800">Payment Reports</h2>
        <p className="text-sm text-gray-600 mt-1">Select a report category and choose the report you need</p>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => {
              setActiveCategory(category.id);
              setSelectedReport(null);
              setShowFilters(false);
            }}
            className={`
              flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm
              transition-all duration-200
              ${activeCategory === category.id
                ? 'bg-[#0F4C81] text-white shadow-md'
                : 'border border-[#0F4C81] text-[#0F4C81] hover:bg-[#0F4C81] hover:text-white'
              }
            `}
          >
            {category.icon}
            <span>{category.name}</span>
          </button>
        ))}
      </div>

      {/* Report Groups - All Expanded */}
      <div className="space-y-6">
        {reportGroups[activeCategory].map((group) => (
          <div key={group.title} className="space-y-3">
            {/* Group Header - Non-clickable, Always visible */}
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#0F4C81]/10 rounded-lg text-[#0F4C81]">
                {group.icon}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{group.title}</h3>
                <p className="text-xs text-gray-500">{group.reports.length} reports available</p>
              </div>
            </div>

            {/* Report Cards - Always visible in grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {group.reports.map((report) => (
                <label
                  key={report.id}
                  className={`
                    flex items-start gap-3 p-4 rounded-lg cursor-pointer
                    transition-all duration-200
                    ${selectedReport === report.id
                      ? 'bg-[#0F4C81]/5 border-2 border-[#0F4C81] shadow-md'
                      : 'bg-white border border-gray-200 hover:border-[#0F4C81]/50 hover:shadow-sm'
                    }
                  `}
                >
                  <input
                    type="radio"
                    name="report"
                    value={report.id}
                    checked={selectedReport === report.id}
                    onChange={() => handleReportSelect(report.id, report.needsFilters)}
                    className="mt-1 w-4 h-4 text-[#0F4C81] border-gray-300 focus:ring-[#0F4C81]"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-gray-900 text-sm">{report.name}</div>
                    <div className="text-xs text-gray-600 mt-1">{report.description}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Filters Panel */}
      {showFilters && selectedReport && (
        <div className="border border-[#0F4C81]/30 rounded-lg bg-[#0F4C81]/5 p-5">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-[#0F4C81]" />
            <h3 className="font-semibold text-gray-900">Filters</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Branch Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                <Building2 className="w-4 h-4 inline mr-1" />
                Branch
              </label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0F4C81] focus:border-transparent text-sm">
                <option>All Branches</option>
                <option>Main Branch</option>
                <option>Branch A</option>
                <option>Branch B</option>
              </select>
            </div>

            {/* Date From */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                <Calendar className="w-4 h-4 inline mr-1" />
                From Date
              </label>
              <input
                type="date"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0F4C81] focus:border-transparent text-sm"
              />
            </div>

            {/* Date To */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                <Calendar className="w-4 h-4 inline mr-1" />
                To Date
              </label>
              <input
                type="date"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0F4C81] focus:border-transparent text-sm"
              />
            </div>

            {/* Payment Mode */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                <CreditCard className="w-4 h-4 inline mr-1" />
                Payment Mode
              </label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0F4C81] focus:border-transparent text-sm">
                <option>All Modes</option>
                <option>Cash</option>
                <option>Online</option>
                <option>Cheque</option>
                <option>Card</option>
              </select>
            </div>

            {/* Payment Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Payment Status
              </label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0F4C81] focus:border-transparent text-sm">
                <option>All Status</option>
                <option>Completed</option>
                <option>Pending</option>
                <option>Failed</option>
              </select>
            </div>

            {/* Course Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Course
              </label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0F4C81] focus:border-transparent text-sm">
                <option>All Courses</option>
                <option>JEE Main</option>
                <option>JEE Advanced</option>
                <option>NEET</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Generate Report Button */}
      {selectedReport && (
        <div className="flex items-center justify-center pt-4 border-t border-gray-200">
          <button
            onClick={handleGenerateReport}
            className="flex items-center gap-2 px-8 py-3 bg-[#0F4C81] text-white rounded-lg hover:bg-[#0c3d6a] transition-colors font-medium shadow-md hover:shadow-lg"
          >
            <Download className="w-5 h-5" />
            <span>Generate Report</span>
          </button>
        </div>
      )}

      {/* Empty State */}
      {!selectedReport && (
        <div className="text-center py-12 text-gray-500">
          <Receipt className="w-12 h-12 mx-auto mb-3 opacity-40" />
          <p className="text-sm">Select a report type to continue</p>
        </div>
      )}
    </div>
  );
}