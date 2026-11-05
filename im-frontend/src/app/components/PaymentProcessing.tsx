import { useState } from 'react';
import { Search, Filter, Download, Clock, CheckCircle, XCircle, AlertCircle, IndianRupee, Calendar, User, CreditCard, TrendingUp, TrendingDown, FileText, BanknoteIcon } from 'lucide-react';

interface PaymentProcessingProps {
  branchName: string;
  setCurrentPage: (page: string) => void;
}

export function PaymentProcessing({ branchName, setCurrentPage }: PaymentProcessingProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Overview Payment Data
  const paymentProcessingData = [
    {
      id: 'PAY001',
      studentName: 'Rahul Sharma',
      studentId: 'STU-2024-001',
      amount: '₹15,000',
      paymentType: 'Course Fee',
      date: '06/02/2026',
      status: 'pending',
      method: 'Bank Transfer',
      referenceNo: 'TXN123456789'
    },
    {
      id: 'PAY002',
      studentName: 'Priya Patel',
      studentId: 'STU-2024-002',
      amount: '₹8,000',
      paymentType: 'Installment',
      date: '06/02/2026',
      status: 'processing',
      method: 'UPI',
      referenceNo: 'UPI987654321'
    },
    {
      id: 'PAY003',
      studentName: 'Amit Kumar',
      studentId: 'STU-2024-003',
      amount: '₹10,000',
      paymentType: 'Course Fee',
      date: '05/02/2026',
      status: 'completed',
      method: 'Cash',
      referenceNo: 'CASH001'
    },
    {
      id: 'PAY004',
      studentName: 'Sneha Reddy',
      studentId: 'STU-2024-004',
      amount: '₹12,500',
      paymentType: 'Installment',
      date: '05/02/2026',
      status: 'failed',
      method: 'Card',
      referenceNo: 'CARD456789'
    },
    {
      id: 'PAY005',
      studentName: 'Vikram Singh',
      studentId: 'STU-2024-005',
      amount: '₹7,500',
      paymentType: 'Course Fee',
      date: '04/02/2026',
      status: 'completed',
      method: 'Bank Transfer',
      referenceNo: 'TXN987456123'
    }
  ];

  // Deposit Details Data
  const depositData = [
    {
      id: 'DEP001',
      studentName: 'Rahul Sharma',
      studentId: 'STU-2024-001',
      depositAmount: '₹5,000',
      depositType: 'Security Deposit',
      depositDate: '01/01/2026',
      receiptNo: 'REC001',
      status: 'Active',
      refundable: 'Yes',
      dueDate: '31/12/2026'
    },
    {
      id: 'DEP002',
      studentName: 'Priya Patel',
      studentId: 'STU-2024-002',
      depositAmount: '₹3,000',
      depositType: 'Exam Deposit',
      depositDate: '15/01/2026',
      receiptNo: 'REC002',
      status: 'Active',
      refundable: 'Yes',
      dueDate: '15/06/2026'
    },
    {
      id: 'DEP003',
      studentName: 'Amit Kumar',
      studentId: 'STU-2024-003',
      depositAmount: '₹5,000',
      depositType: 'Security Deposit',
      depositDate: '20/01/2026',
      receiptNo: 'REC003',
      status: 'Refunded',
      refundable: 'Yes',
      dueDate: '20/12/2026'
    },
    {
      id: 'DEP004',
      studentName: 'Sneha Reddy',
      studentId: 'STU-2024-004',
      depositAmount: '₹2,500',
      depositType: 'Library Deposit',
      depositDate: '25/01/2026',
      receiptNo: 'REC004',
      status: 'Active',
      refundable: 'Yes',
      dueDate: '25/12/2026'
    },
    {
      id: 'DEP005',
      studentName: 'Vikram Singh',
      studentId: 'STU-2024-005',
      depositAmount: '₹4,000',
      depositType: 'Equipment Deposit',
      depositDate: '30/01/2026',
      receiptNo: 'REC005',
      status: 'Active',
      refundable: 'No',
      dueDate: 'N/A'
    }
  ];

  // Bounced Cheque Data
  const bouncedChequeData = [
    {
      id: 'CHQ001',
      studentName: 'Rohan Gupta',
      studentId: 'STU-2024-008',
      chequeNo: 'CHQ123456',
      amount: '₹10,000',
      bankName: 'HDFC Bank',
      chequeDate: '01/02/2026',
      bounceDate: '03/02/2026',
      bounceReason: 'Insufficient Funds',
      charges: '₹500',
      status: 'Pending Recovery'
    },
    {
      id: 'CHQ002',
      studentName: 'Anjali Verma',
      studentId: 'STU-2024-009',
      chequeNo: 'CHQ789012',
      amount: '₹8,500',
      bankName: 'ICICI Bank',
      chequeDate: '28/01/2026',
      bounceDate: '30/01/2026',
      bounceReason: 'Signature Mismatch',
      charges: '₹500',
      status: 'Recovered'
    },
    {
      id: 'CHQ003',
      studentName: 'Neha Kapoor',
      studentId: 'STU-2024-010',
      chequeNo: 'CHQ345678',
      amount: '₹12,000',
      bankName: 'SBI',
      chequeDate: '25/01/2026',
      bounceDate: '27/01/2026',
      bounceReason: 'Account Closed',
      charges: '₹500',
      status: 'Legal Notice Sent'
    },
    {
      id: 'CHQ004',
      studentName: 'Karan Mehta',
      studentId: 'STU-2024-011',
      chequeNo: 'CHQ901234',
      amount: '₹15,000',
      bankName: 'Axis Bank',
      chequeDate: '20/01/2026',
      bounceDate: '22/01/2026',
      bounceReason: 'Insufficient Funds',
      charges: '₹500',
      status: 'Pending Recovery'
    }
  ];

  // Refund Status Data
  const refundData = [
    {
      id: 'REF001',
      studentName: 'Amit Kumar',
      studentId: 'STU-2024-003',
      refundAmount: '₹5,000',
      refundType: 'Security Deposit',
      requestDate: '01/02/2026',
      approvalDate: '02/02/2026',
      refundDate: '05/02/2026',
      refundMode: 'Bank Transfer',
      status: 'Completed',
      remarks: 'Course Completed'
    },
    {
      id: 'REF002',
      studentName: 'Sanjay Sharma',
      studentId: 'STU-2024-012',
      refundAmount: '₹8,000',
      refundType: 'Fee Refund',
      requestDate: '03/02/2026',
      approvalDate: '04/02/2026',
      refundDate: 'Pending',
      refundMode: 'Cheque',
      status: 'Approved',
      remarks: 'Course Withdrawn'
    },
    {
      id: 'REF003',
      studentName: 'Pooja Desai',
      studentId: 'STU-2024-013',
      refundAmount: '₹3,000',
      refundType: 'Exam Deposit',
      requestDate: '05/02/2026',
      approvalDate: 'Pending',
      refundDate: 'Pending',
      refundMode: 'Bank Transfer',
      status: 'Under Review',
      remarks: 'Exam Completed'
    },
    {
      id: 'REF004',
      studentName: 'Rajesh Kumar',
      studentId: 'STU-2024-014',
      refundAmount: '₹2,500',
      refundType: 'Library Deposit',
      requestDate: '28/01/2026',
      approvalDate: '30/01/2026',
      refundDate: '02/02/2026',
      refundMode: 'Cash',
      status: 'Completed',
      remarks: 'No Dues'
    },
    {
      id: 'REF005',
      studentName: 'Meera Singh',
      studentId: 'STU-2024-015',
      refundAmount: '₹10,000',
      refundType: 'Fee Refund',
      requestDate: '04/02/2026',
      approvalDate: 'Pending',
      refundDate: 'Pending',
      refundMode: 'Bank Transfer',
      status: 'Rejected',
      remarks: 'Policy Violation'
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
      case 'Completed':
      case 'Active':
      case 'Recovered':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full">
            <CheckCircle className="w-3 h-3" />
            {status}
          </span>
        );
      case 'pending':
      case 'Pending Recovery':
      case 'Under Review':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium bg-yellow-100 text-yellow-700 rounded-full">
            <Clock className="w-3 h-3" />
            {status}
          </span>
        );
      case 'processing':
      case 'Approved':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">
            <AlertCircle className="w-3 h-3" />
            {status}
          </span>
        );
      case 'failed':
      case 'Rejected':
      case 'Legal Notice Sent':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium bg-red-100 text-red-700 rounded-full">
            <XCircle className="w-3 h-3" />
            {status}
          </span>
        );
      case 'Refunded':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium bg-purple-100 text-purple-700 rounded-full">
            <TrendingDown className="w-3 h-3" />
            {status}
          </span>
        );
      default:
        return null;
    }
  };

  const filteredData = paymentProcessingData.filter(payment => {
    const matchesSearch = 
      payment.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.referenceNo.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || payment.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const statusCounts = {
    all: paymentProcessingData.length,
    pending: paymentProcessingData.filter(p => p.status === 'pending').length,
    processing: paymentProcessingData.filter(p => p.status === 'processing').length,
    completed: paymentProcessingData.filter(p => p.status === 'completed').length,
    failed: paymentProcessingData.filter(p => p.status === 'failed').length,
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payment Processing</h1>
          <p className="text-sm text-gray-500 mt-1">
            Branch: <span className="font-medium text-[#0F4C81]">{branchName}</span>
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-[#0F4C81] text-white rounded-lg hover:bg-[#0d3f6b] transition-colors">
          <Download className="w-4 h-4" />
          <span className="text-sm font-medium">Export Report</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="flex overflow-x-auto">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex-1 min-w-fit px-6 py-4 text-sm font-medium transition-colors border-b-2 ${
              activeTab === 'overview'
                ? 'border-[#0F4C81] text-[#0F4C81] bg-blue-50'
                : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center gap-2 justify-center">
              <CreditCard className="w-4 h-4" />
              Overview
            </div>
          </button>
          <button
            onClick={() => setActiveTab('deposits')}
            className={`flex-1 min-w-fit px-6 py-4 text-sm font-medium transition-colors border-b-2 ${
              activeTab === 'deposits'
                ? 'border-[#0F4C81] text-[#0F4C81] bg-blue-50'
                : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center gap-2 justify-center">
              <TrendingUp className="w-4 h-4" />
              Deposit Details
            </div>
          </button>
          <button
            onClick={() => setActiveTab('bounced')}
            className={`flex-1 min-w-fit px-6 py-4 text-sm font-medium transition-colors border-b-2 ${
              activeTab === 'bounced'
                ? 'border-[#0F4C81] text-[#0F4C81] bg-blue-50'
                : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center gap-2 justify-center">
              <XCircle className="w-4 h-4" />
              Bounced Cheques
            </div>
          </button>
          <button
            onClick={() => setActiveTab('refunds')}
            className={`flex-1 min-w-fit px-6 py-4 text-sm font-medium transition-colors border-b-2 ${
              activeTab === 'refunds'
                ? 'border-[#0F4C81] text-[#0F4C81] bg-blue-50'
                : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center gap-2 justify-center">
              <TrendingDown className="w-4 h-4" />
              Refund Status
            </div>
          </button>
        </div>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <>
          {/* Statistics Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <div className="text-2xl font-bold text-gray-900">{statusCounts.all}</div>
              <div className="text-xs text-gray-500 mt-1">Total Payments</div>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <div className="text-2xl font-bold text-yellow-600">{statusCounts.pending}</div>
              <div className="text-xs text-gray-500 mt-1">Pending</div>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <div className="text-2xl font-bold text-blue-600">{statusCounts.processing}</div>
              <div className="text-xs text-gray-500 mt-1">Processing</div>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <div className="text-2xl font-bold text-green-600">{statusCounts.completed}</div>
              <div className="text-xs text-gray-500 mt-1">Completed</div>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <div className="text-2xl font-bold text-red-600">{statusCounts.failed}</div>
              <div className="text-xs text-gray-500 mt-1">Failed</div>
            </div>
          </div>

          {/* Search and Filter Bar */}
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by student name, ID, or reference number..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0F4C81] focus:border-transparent"
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0F4C81] focus:border-transparent"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="completed">Completed</option>
                  <option value="failed">Failed</option>
                </select>
              </div>
            </div>
          </div>

          {/* Payment Processing Table */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left py-4 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Payment ID</th>
                    <th className="text-left py-4 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Student Details</th>
                    <th className="text-left py-4 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Payment Type</th>
                    <th className="text-left py-4 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Amount</th>
                    <th className="text-left py-4 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Method</th>
                    <th className="text-left py-4 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Reference No.</th>
                    <th className="text-left py-4 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Date</th>
                    <th className="text-left py-4 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                    <th className="text-left py-4 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredData.map((payment) => (
                    <tr key={payment.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-4">
                        <span className="text-sm font-medium text-[#0F4C81]">{payment.id}</span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-gray-900">{payment.studentName}</span>
                          <span className="text-xs text-gray-500">{payment.studentId}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-sm text-gray-600">{payment.paymentType}</span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-sm font-semibold text-gray-900">{payment.amount}</span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-sm text-gray-600">{payment.method}</span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-xs font-mono text-gray-600">{payment.referenceNo}</span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-1.5 text-sm text-gray-600">
                          <Calendar className="w-3.5 h-3.5" />
                          {payment.date}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        {getStatusBadge(payment.status)}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          {payment.status === 'pending' && (
                            <>
                              <button className="px-3 py-1 text-xs font-medium text-white bg-green-600 rounded hover:bg-green-700 transition-colors">
                                Approve
                              </button>
                              <button className="px-3 py-1 text-xs font-medium text-white bg-red-600 rounded hover:bg-red-700 transition-colors">
                                Reject
                              </button>
                            </>
                          )}
                          {payment.status === 'failed' && (
                            <button className="px-3 py-1 text-xs font-medium text-white bg-blue-600 rounded hover:bg-blue-700 transition-colors">
                              Retry
                            </button>
                          )}
                          {payment.status === 'completed' && (
                            <button className="px-3 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded hover:bg-gray-200 transition-colors">
                              View
                            </button>
                          )}
                          {payment.status === 'processing' && (
                            <button className="px-3 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded hover:bg-gray-200 transition-colors">
                              Track
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Summary Footer */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <IndianRupee className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Processed Today</p>
                  <p className="text-xl font-bold text-gray-900">₹53,500</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                  <Clock className="w-6 h-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Pending Amount</p>
                  <p className="text-xl font-bold text-gray-900">₹24,000</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <CreditCard className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Transactions Today</p>
                  <p className="text-xl font-bold text-gray-900">8</p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Deposit Details Tab */}
      {activeTab === 'deposits' && (
        <>
          {/* Deposit Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <div className="text-2xl font-bold text-gray-900">{depositData.length}</div>
              <div className="text-xs text-gray-500 mt-1">Total Deposits</div>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <div className="text-2xl font-bold text-green-600">{depositData.filter(d => d.status === 'Active').length}</div>
              <div className="text-xs text-gray-500 mt-1">Active</div>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <div className="text-2xl font-bold text-purple-600">{depositData.filter(d => d.status === 'Refunded').length}</div>
              <div className="text-xs text-gray-500 mt-1">Refunded</div>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <div className="text-2xl font-bold text-blue-600">₹19,500</div>
              <div className="text-xs text-gray-500 mt-1">Total Amount</div>
            </div>
          </div>

          {/* Deposit Table */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left py-4 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Deposit ID</th>
                    <th className="text-left py-4 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Student Details</th>
                    <th className="text-left py-4 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Deposit Type</th>
                    <th className="text-left py-4 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Amount</th>
                    <th className="text-left py-4 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Deposit Date</th>
                    <th className="text-left py-4 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Receipt No.</th>
                    <th className="text-left py-4 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Refundable</th>
                    <th className="text-left py-4 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Due Date</th>
                    <th className="text-left py-4 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                    <th className="text-left py-4 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {depositData.map((deposit) => (
                    <tr key={deposit.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-4">
                        <span className="text-sm font-medium text-[#0F4C81]">{deposit.id}</span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-gray-900">{deposit.studentName}</span>
                          <span className="text-xs text-gray-500">{deposit.studentId}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-sm text-gray-600">{deposit.depositType}</span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-sm font-semibold text-gray-900">{deposit.depositAmount}</span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-sm text-gray-600">{deposit.depositDate}</span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-xs font-mono text-gray-600">{deposit.receiptNo}</span>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`text-sm font-medium ${deposit.refundable === 'Yes' ? 'text-green-600' : 'text-red-600'}`}>
                          {deposit.refundable}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-sm text-gray-600">{deposit.dueDate}</span>
                      </td>
                      <td className="py-4 px-4">
                        {getStatusBadge(deposit.status)}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          {deposit.status === 'Active' && (
                            <button className="px-3 py-1 text-xs font-medium text-white bg-[#0F4C81] rounded hover:bg-[#0d3f6b] transition-colors">
                              Initiate Refund
                            </button>
                          )}
                          <button className="px-3 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded hover:bg-gray-200 transition-colors">
                            View Details
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Bounced Cheques Tab */}
      {activeTab === 'bounced' && (
        <>
          {/* Bounced Cheque Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <div className="text-2xl font-bold text-gray-900">{bouncedChequeData.length}</div>
              <div className="text-xs text-gray-500 mt-1">Total Bounced</div>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <div className="text-2xl font-bold text-yellow-600">{bouncedChequeData.filter(c => c.status === 'Pending Recovery').length}</div>
              <div className="text-xs text-gray-500 mt-1">Pending Recovery</div>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <div className="text-2xl font-bold text-green-600">{bouncedChequeData.filter(c => c.status === 'Recovered').length}</div>
              <div className="text-xs text-gray-500 mt-1">Recovered</div>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <div className="text-2xl font-bold text-red-600">₹45,500</div>
              <div className="text-xs text-gray-500 mt-1">Outstanding Amount</div>
            </div>
          </div>

          {/* Bounced Cheque Table */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left py-4 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Cheque ID</th>
                    <th className="text-left py-4 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Student Details</th>
                    <th className="text-left py-4 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Cheque No.</th>
                    <th className="text-left py-4 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Bank Name</th>
                    <th className="text-left py-4 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Amount</th>
                    <th className="text-left py-4 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Bounce Date</th>
                    <th className="text-left py-4 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Bounce Reason</th>
                    <th className="text-left py-4 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Charges</th>
                    <th className="text-left py-4 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                    <th className="text-left py-4 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {bouncedChequeData.map((cheque) => (
                    <tr key={cheque.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-4">
                        <span className="text-sm font-medium text-[#0F4C81]">{cheque.id}</span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-gray-900">{cheque.studentName}</span>
                          <span className="text-xs text-gray-500">{cheque.studentId}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-xs font-mono text-gray-600">{cheque.chequeNo}</span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-sm text-gray-600">{cheque.bankName}</span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-sm font-semibold text-gray-900">{cheque.amount}</span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-sm text-gray-600">{cheque.bounceDate}</span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-sm text-red-600 font-medium">{cheque.bounceReason}</span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-sm font-semibold text-orange-600">{cheque.charges}</span>
                      </td>
                      <td className="py-4 px-4">
                        {getStatusBadge(cheque.status)}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          {cheque.status === 'Pending Recovery' && (
                            <>
                              <button className="px-3 py-1 text-xs font-medium text-white bg-blue-600 rounded hover:bg-blue-700 transition-colors">
                                Send Notice
                              </button>
                              <button className="px-3 py-1 text-xs font-medium text-white bg-green-600 rounded hover:bg-green-700 transition-colors">
                                Mark Recovered
                              </button>
                            </>
                          )}
                          {cheque.status === 'Legal Notice Sent' && (
                            <button className="px-3 py-1 text-xs font-medium text-white bg-red-600 rounded hover:bg-red-700 transition-colors">
                              Legal Action
                            </button>
                          )}
                          <button className="px-3 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded hover:bg-gray-200 transition-colors">
                            View Details
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Refund Status Tab */}
      {activeTab === 'refunds' && (
        <>
          {/* Refund Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <div className="text-2xl font-bold text-gray-900">{refundData.length}</div>
              <div className="text-xs text-gray-500 mt-1">Total Requests</div>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <div className="text-2xl font-bold text-green-600">{refundData.filter(r => r.status === 'Completed').length}</div>
              <div className="text-xs text-gray-500 mt-1">Completed</div>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <div className="text-2xl font-bold text-blue-600">{refundData.filter(r => r.status === 'Approved').length}</div>
              <div className="text-xs text-gray-500 mt-1">Approved</div>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <div className="text-2xl font-bold text-yellow-600">{refundData.filter(r => r.status === 'Under Review').length}</div>
              <div className="text-xs text-gray-500 mt-1">Under Review</div>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <div className="text-2xl font-bold text-red-600">{refundData.filter(r => r.status === 'Rejected').length}</div>
              <div className="text-xs text-gray-500 mt-1">Rejected</div>
            </div>
          </div>

          {/* Refund Table */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left py-4 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Refund ID</th>
                    <th className="text-left py-4 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Student Details</th>
                    <th className="text-left py-4 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Refund Type</th>
                    <th className="text-left py-4 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Amount</th>
                    <th className="text-left py-4 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Request Date</th>
                    <th className="text-left py-4 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Approval Date</th>
                    <th className="text-left py-4 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Refund Date</th>
                    <th className="text-left py-4 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Mode</th>
                    <th className="text-left py-4 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                    <th className="text-left py-4 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Remarks</th>
                    <th className="text-left py-4 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {refundData.map((refund) => (
                    <tr key={refund.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-4">
                        <span className="text-sm font-medium text-[#0F4C81]">{refund.id}</span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-gray-900">{refund.studentName}</span>
                          <span className="text-xs text-gray-500">{refund.studentId}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-sm text-gray-600">{refund.refundType}</span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-sm font-semibold text-gray-900">{refund.refundAmount}</span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-sm text-gray-600">{refund.requestDate}</span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-sm text-gray-600">{refund.approvalDate}</span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-sm text-gray-600">{refund.refundDate}</span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-sm text-gray-600">{refund.refundMode}</span>
                      </td>
                      <td className="py-4 px-4">
                        {getStatusBadge(refund.status)}
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-xs text-gray-500">{refund.remarks}</span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          {refund.status === 'Under Review' && (
                            <>
                              <button className="px-3 py-1 text-xs font-medium text-white bg-green-600 rounded hover:bg-green-700 transition-colors">
                                Approve
                              </button>
                              <button className="px-3 py-1 text-xs font-medium text-white bg-red-600 rounded hover:bg-red-700 transition-colors">
                                Reject
                              </button>
                            </>
                          )}
                          {refund.status === 'Approved' && (
                            <button className="px-3 py-1 text-xs font-medium text-white bg-blue-600 rounded hover:bg-blue-700 transition-colors">
                              Process Payment
                            </button>
                          )}
                          <button className="px-3 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded hover:bg-gray-200 transition-colors">
                            View Details
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}