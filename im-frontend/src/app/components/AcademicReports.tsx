import { useState } from 'react';
import { FileText, ClipboardCheck, Calendar, Clock, BookOpen, FileCheck, Receipt, ChevronDown, ChevronRight, Filter, Download } from 'lucide-react';
import { PaymentReports } from './PaymentReports';

export function AcademicReports() {
  const [activeTab, setActiveTab] = useState('Attendance Reports');

  const tabs = [
    { name: 'Attendance Reports', icon: <ClipboardCheck className="w-4 h-4" /> },
    { name: 'Test Reports', icon: <FileCheck className="w-4 h-4" /> },
    { name: 'Session Reports', icon: <Calendar className="w-4 h-4" /> },
    { name: 'Batch Time table', icon: <Clock className="w-4 h-4" /> },
    { name: 'Subject Wise Topic Tracking', icon: <BookOpen className="w-4 h-4" /> },
    { name: 'External Exam Report', icon: <FileText className="w-4 h-4" /> },
    { name: 'Payment Report', icon: <Receipt className="w-4 h-4" /> },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'Attendance Reports':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-gray-800">Attendance Reports</h2>
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <p className="text-gray-600">Attendance reports content will be displayed here.</p>
            </div>
          </div>
        );
      case 'Test Reports':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-gray-800">Test Reports</h2>
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <p className="text-gray-600">Test reports content will be displayed here.</p>
            </div>
          </div>
        );
      case 'Session Reports':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-gray-800">Session Reports</h2>
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <p className="text-gray-600">Session reports content will be displayed here.</p>
            </div>
          </div>
        );
      case 'Batch Time table':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-gray-800">Batch Time table</h2>
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <p className="text-gray-600">Batch time table content will be displayed here.</p>
            </div>
          </div>
        );
      case 'Subject Wise Topic Tracking':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-gray-800">Subject Wise Topic Tracking</h2>
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <p className="text-gray-600">Subject wise topic tracking content will be displayed here.</p>
            </div>
          </div>
        );
      case 'External Exam Report':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-gray-800">External Exam Report</h2>
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <p className="text-gray-600">External exam report content will be displayed here.</p>
            </div>
          </div>
        );
      case 'Payment Report':
        return <PaymentReports />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Academic / Learning Reports</h1>
          <p className="text-gray-600 mt-2">View and manage all academic reports</p>
        </div>

        {/* Tab Buttons */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-2 mb-6">
          <div className="flex flex-wrap gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.name}
                onClick={() => setActiveTab(tab.name)}
                className={`
                  flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium
                  transition-all duration-200
                  ${activeTab === tab.name
                    ? 'bg-[#0F4C81] text-white shadow-md'
                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                  }
                `}
              >
                <span className="text-sm">{tab.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
}