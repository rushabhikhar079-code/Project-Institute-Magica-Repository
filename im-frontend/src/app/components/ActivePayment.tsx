import { IndianRupee, ClipboardCheck, Layers, FileText, CreditCard } from 'lucide-react';

interface ActivePaymentProps {
  branchName: string;
  setCurrentPage: (page: string) => void;
}

export function ActivePayment({ branchName, setCurrentPage }: ActivePaymentProps) {
  const paymentOptions = [
    {
      id: 1,
      title: 'Create Installment',
      description: 'Set up new payment installment plans for students',
      icon: <ClipboardCheck className="w-8 h-8" />,
      color: 'bg-blue-500',
      hoverColor: 'hover:bg-blue-600',
      action: () => console.log('Create Installment clicked')
    },
    {
      id: 2,
      title: 'Installment',
      description: 'View and manage existing installment plans',
      icon: <Layers className="w-8 h-8" />,
      color: 'bg-purple-500',
      hoverColor: 'hover:bg-purple-600',
      action: () => console.log('Installment clicked')
    },
    {
      id: 3,
      title: 'Payment',
      description: 'Process and record student payments',
      icon: <IndianRupee className="w-8 h-8" />,
      color: 'bg-green-500',
      hoverColor: 'hover:bg-green-600',
      action: () => console.log('Payment clicked')
    },
    {
      id: 4,
      title: 'Apply for Payment',
      description: 'Submit payment applications and requests',
      icon: <FileText className="w-8 h-8" />,
      color: 'bg-orange-500',
      hoverColor: 'hover:bg-orange-600',
      action: () => console.log('Apply for Payment clicked')
    }
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Active Payment Management</h1>
          <p className="text-sm text-gray-500 mt-1">
            Branch: <span className="font-medium text-[#0F4C81]">{branchName}</span>
          </p>
        </div>
      </div>

      {/* Payment Options Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
        {paymentOptions.map((option) => (
          <button
            key={option.id}
            onClick={option.action}
            className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group"
          >
            <div className="flex flex-col items-center text-center gap-4">
              {/* Icon Circle */}
              <div className={`${option.color} ${option.hoverColor} w-16 h-16 rounded-full flex items-center justify-center text-white transition-colors duration-300 group-hover:scale-110 transform`}>
                {option.icon}
              </div>
              
              {/* Title */}
              <h3 className="text-lg font-semibold text-gray-900 group-hover:text-[#0F4C81] transition-colors">
                {option.title}
              </h3>
              
              {/* Description */}
              <p className="text-sm text-gray-500 leading-relaxed">
                {option.description}
              </p>
            </div>
          </button>
        ))}
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        {/* Total Payments Card */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Total Payments</p>
              <p className="text-2xl font-bold text-gray-900">₹2,45,000</p>
              <p className="text-xs text-green-600 mt-1">+12% from last month</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <IndianRupee className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        {/* Pending Installments Card */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Pending Installments</p>
              <p className="text-2xl font-bold text-gray-900">24</p>
              <p className="text-xs text-orange-600 mt-1">Due this month</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
              <Layers className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>

        {/* Active Plans Card */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Active Plans</p>
              <p className="text-2xl font-bold text-gray-900">156</p>
              <p className="text-xs text-blue-600 mt-1">Across all students</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <CreditCard className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 mt-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Transactions</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Student Name</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Payment Type</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Amount</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Date</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-3 px-4 text-sm text-gray-900">Rahul Sharma</td>
                <td className="py-3 px-4 text-sm text-gray-600">Course Fee</td>
                <td className="py-3 px-4 text-sm font-medium text-gray-900">₹15,000</td>
                <td className="py-3 px-4 text-sm text-gray-600">06/02/2026</td>
                <td className="py-3 px-4">
                  <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full">Completed</span>
                </td>
              </tr>
              <tr className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-3 px-4 text-sm text-gray-900">Priya Patel</td>
                <td className="py-3 px-4 text-sm text-gray-600">Installment</td>
                <td className="py-3 px-4 text-sm font-medium text-gray-900">₹8,000</td>
                <td className="py-3 px-4 text-sm text-gray-600">05/02/2026</td>
                <td className="py-3 px-4">
                  <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full">Completed</span>
                </td>
              </tr>
              <tr className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-3 px-4 text-sm text-gray-900">Amit Kumar</td>
                <td className="py-3 px-4 text-sm text-gray-600">Installment</td>
                <td className="py-3 px-4 text-sm font-medium text-gray-900">₹10,000</td>
                <td className="py-3 px-4 text-sm text-gray-600">04/02/2026</td>
                <td className="py-3 px-4">
                  <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-700 rounded-full">Pending</span>
                </td>
              </tr>
              <tr className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-3 px-4 text-sm text-gray-900">Sneha Reddy</td>
                <td className="py-3 px-4 text-sm text-gray-600">Course Fee</td>
                <td className="py-3 px-4 text-sm font-medium text-gray-900">₹12,500</td>
                <td className="py-3 px-4 text-sm text-gray-600">03/02/2026</td>
                <td className="py-3 px-4">
                  <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full">Completed</span>
                </td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="py-3 px-4 text-sm text-gray-900">Vikram Singh</td>
                <td className="py-3 px-4 text-sm text-gray-600">Installment</td>
                <td className="py-3 px-4 text-sm font-medium text-gray-900">₹7,500</td>
                <td className="py-3 px-4 text-sm text-gray-600">02/02/2026</td>
                <td className="py-3 px-4">
                  <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full">Completed</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}