import { useState } from 'react';
import { Calendar, X, Download, RefreshCw, CheckCircle, XCircle, Save, Trash2 } from 'lucide-react';

interface AttendanceProps {
  branchName: string;
  setCurrentPage: (page: string) => void;
}

interface StudentAttendance {
  srNo: number;
  regNo: string;
  studentName: string;
  biometricId: string;
  attendanceStatus: 'present' | 'absent' | 'none';
}

export function Attendance({ branchName, setCurrentPage }: AttendanceProps) {
  const [selectedDate, setSelectedDate] = useState('');
  const [showAllBatches, setShowAllBatches] = useState(false);
  const [showAttendanceTaken, setShowAttendanceTaken] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState('');
  const [selectedTrainer, setSelectedTrainer] = useState('');
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [selectAllTopics, setSelectAllTopics] = useState(false);
  const [attendanceData, setAttendanceData] = useState<StudentAttendance[]>([]);

  // Sample data
  const batches = [
    'Batch A - Morning',
    'Batch B - Afternoon',
    'Batch C - Evening',
    'Batch D - Morning',
    'Batch E - Weekend'
  ];

  const trainers = [
    'Dr. Rajesh Kumar',
    'Prof. Priya Sharma',
    'Dr. Amit Patel',
    'Ms. Sneha Reddy',
    'Dr. Vikram Singh',
    'Prof. Ankit Verma'
  ];

  const topics = [
    'Introduction to Programming',
    'Data Structures',
    'Algorithms',
    'Object-Oriented Programming',
    'Database Management',
    'Web Development',
    'Software Engineering',
    'Computer Networks'
  ];

  const sampleStudents: StudentAttendance[] = [
    {
      srNo: 1,
      regNo: 'STU-2024-001',
      studentName: 'Rahul Sharma',
      biometricId: 'BIO001',
      attendanceStatus: 'none'
    },
    {
      srNo: 2,
      regNo: 'STU-2024-002',
      studentName: 'Priya Patel',
      biometricId: 'BIO002',
      attendanceStatus: 'none'
    },
    {
      srNo: 3,
      regNo: 'STU-2024-003',
      studentName: 'Amit Kumar',
      biometricId: 'BIO003',
      attendanceStatus: 'none'
    },
    {
      srNo: 4,
      regNo: 'STU-2024-004',
      studentName: 'Sneha Reddy',
      biometricId: 'BIO004',
      attendanceStatus: 'none'
    },
    {
      srNo: 5,
      regNo: 'STU-2024-005',
      studentName: 'Vikram Singh',
      biometricId: 'BIO005',
      attendanceStatus: 'none'
    }
  ];

  const getDayName = (dateString: string) => {
    if (!dateString) return '';
    const [year, month, day] = dateString.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[date.getDay()];
  };

  const formatDateDisplay = (dateString: string) => {
    if (!dateString) return '';
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
  };

  const handleClearDate = () => {
    setSelectedDate('');
  };

  const handleTopicToggle = (topic: string) => {
    if (selectedTopics.includes(topic)) {
      setSelectedTopics(selectedTopics.filter(t => t !== topic));
      setSelectAllTopics(false);
    } else {
      const newTopics = [...selectedTopics, topic];
      setSelectedTopics(newTopics);
      if (newTopics.length === topics.length) {
        setSelectAllTopics(true);
      }
    }
  };

  const handleSelectAllTopics = () => {
    if (selectAllTopics) {
      setSelectedTopics([]);
      setSelectAllTopics(false);
    } else {
      setSelectedTopics([...topics]);
      setSelectAllTopics(true);
    }
  };

  const handleGetAttendance = () => {
    if (selectedDate && selectedBatch && selectedTrainer) {
      // Simulate loading attendance data
      setAttendanceData(sampleStudents);
    }
  };

  const handleAttendanceStatusChange = (srNo: number, status: 'present' | 'absent') => {
    setAttendanceData(prevData =>
      prevData.map(student =>
        student.srNo === srNo
          ? { ...student, attendanceStatus: status }
          : student
      )
    );
  };

  const handleSave = () => {
    console.log('Saving attendance:', attendanceData);
    alert('Attendance saved successfully!');
  };

  const handleClear = () => {
    setAttendanceData([]);
    setSelectedDate('');
    setSelectedBatch('');
    setSelectedTrainer('');
    setSelectedTopics([]);
    setSelectAllTopics(false);
    setShowAllBatches(false);
    setShowAttendanceTaken(false);
  };

  const handleCancel = () => {
    setCurrentPage('dashboard');
  };

  const totalPresent = attendanceData.filter(s => s.attendanceStatus === 'present').length;
  const totalAbsent = attendanceData.filter(s => s.attendanceStatus === 'absent').length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Attendance Management</h1>
          <p className="text-sm text-gray-500 mt-1">
            Branch: <span className="font-medium text-[#0F4C81]">{branchName}</span>
          </p>
        </div>
      </div>

      {/* Main Form Container */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
        {/* Date Selection Section */}
        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Date Selection</h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Date Picker */}
            <div className="lg:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Date <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full px-4 py-2.5 pr-10 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0F4C81] focus:border-transparent"
                />
                {selectedDate && (
                  <button
                    onClick={handleClearDate}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              {selectedDate && (
                <div className="mt-2 space-y-1">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Date:</span> {formatDateDisplay(selectedDate)}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Day:</span> {getDayName(selectedDate)}
                  </p>
                </div>
              )}
            </div>

            {/* Checkboxes */}
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Display Options
              </label>
              <div className="flex flex-col gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showAllBatches}
                    onChange={(e) => setShowAllBatches(e.target.checked)}
                    className="w-4 h-4 text-[#0F4C81] border-gray-300 rounded focus:ring-[#0F4C81] cursor-pointer"
                  />
                  <span className="text-sm text-gray-700">Show All Batches</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showAttendanceTaken}
                    onChange={(e) => setShowAttendanceTaken(e.target.checked)}
                    className="w-4 h-4 text-[#0F4C81] border-gray-300 rounded focus:ring-[#0F4C81] cursor-pointer"
                  />
                  <span className="text-sm text-gray-700">Show Attendance Taken Batches Only</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Form Fields Section */}
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Batch & Trainer Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Batch Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Batch Name <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedBatch}
                onChange={(e) => setSelectedBatch(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0F4C81] focus:border-transparent"
              >
                <option value="">-- Select Batch --</option>
                {batches.map((batch) => (
                  <option key={batch} value={batch}>
                    {batch}
                  </option>
                ))}
              </select>
            </div>

            {/* Trainer Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Trainer Name <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedTrainer}
                onChange={(e) => setSelectedTrainer(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0F4C81] focus:border-transparent"
              >
                <option value="">-- Select Trainer --</option>
                {trainers.map((trainer) => (
                  <option key={trainer} value={trainer}>
                    {trainer}
                  </option>
                ))}
              </select>
            </div>

            {/* Topic Name (Multi-select) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Topic Name
              </label>
              <div className="relative">
                <div className="border border-gray-300 rounded-lg p-3 bg-white max-h-40 overflow-y-auto">
                  {/* Select All Option */}
                  <label className="flex items-center gap-2 cursor-pointer mb-2 pb-2 border-b border-gray-200">
                    <input
                      type="checkbox"
                      checked={selectAllTopics}
                      onChange={handleSelectAllTopics}
                      className="w-4 h-4 text-[#0F4C81] border-gray-300 rounded focus:ring-[#0F4C81] cursor-pointer"
                    />
                    <span className="text-sm font-semibold text-gray-900">Select All</span>
                  </label>
                  
                  {/* Individual Topics */}
                  <div className="space-y-2">
                    {topics.map((topic) => (
                      <label key={topic} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedTopics.includes(topic)}
                          onChange={() => handleTopicToggle(topic)}
                          className="w-4 h-4 text-[#0F4C81] border-gray-300 rounded focus:ring-[#0F4C81] cursor-pointer"
                        />
                        <span className="text-sm text-gray-700">{topic}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
              {selectedTopics.length > 0 && (
                <p className="text-xs text-gray-500 mt-1">
                  {selectedTopics.length} topic(s) selected
                </p>
              )}
            </div>
          </div>

          {/* Get Attendance Link */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <button
              onClick={handleGetAttendance}
              disabled={!selectedDate || !selectedBatch || !selectedTrainer}
              className="inline-flex items-center gap-2 text-sm font-medium text-[#0F4C81] hover:text-[#0d3f6b] disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              <Download className="w-4 h-4" />
              <span className="underline">Get Attendance From Device for Selected Date</span>
            </button>
          </div>
        </div>

        {/* Attendance Summary */}
        {attendanceData.length > 0 && (
          <div className="p-6 border-b border-gray-200 bg-gray-50">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Attendance Summary</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="text-sm text-gray-500 mb-1">Total Students</div>
                <div className="text-2xl font-bold text-gray-900">{attendanceData.length}</div>
              </div>
              <div className="bg-white border border-green-200 rounded-lg p-4">
                <div className="text-sm text-gray-500 mb-1">Total Present</div>
                <div className="text-2xl font-bold text-green-600 flex items-center gap-2">
                  <CheckCircle className="w-6 h-6" />
                  {totalPresent}
                </div>
              </div>
              <div className="bg-white border border-red-200 rounded-lg p-4">
                <div className="text-sm text-gray-500 mb-1">Total Absent</div>
                <div className="text-2xl font-bold text-red-600 flex items-center gap-2">
                  <XCircle className="w-6 h-6" />
                  {totalAbsent}
                </div>
              </div>
              <div className="bg-white border border-blue-200 rounded-lg p-4">
                <div className="text-sm text-gray-500 mb-1">Attendance %</div>
                <div className="text-2xl font-bold text-blue-600">
                  {attendanceData.length > 0 ? Math.round((totalPresent / attendanceData.length) * 100) : 0}%
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Attendance Table */}
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Student Attendance</h2>
          <div className="overflow-x-auto border border-gray-200 rounded-lg">
            <table className="w-full">
              <thead className="bg-gray-100 border-b border-gray-200">
                <tr>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Sr. No.</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Reg No.</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Student Name</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Biometric Attendance ID</th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Attendance Status</th>
                </tr>
              </thead>
              <tbody>
                {attendanceData.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-12 text-gray-500">
                      <div className="flex flex-col items-center gap-3">
                        <Calendar className="w-12 h-12 text-gray-300" />
                        <p className="text-sm font-medium">No Record Available</p>
                        <p className="text-xs text-gray-400">
                          Please select date, batch, and trainer, then click "Get Attendance From Device"
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  attendanceData.map((student) => (
                    <tr key={student.srNo} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-4 text-sm text-gray-900">{student.srNo}</td>
                      <td className="py-3 px-4 text-sm text-gray-900 font-medium">{student.regNo}</td>
                      <td className="py-3 px-4 text-sm text-gray-900">{student.studentName}</td>
                      <td className="py-3 px-4 text-sm text-gray-600 font-mono">{student.biometricId}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-center gap-4">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              name={`attendance-${student.srNo}`}
                              checked={student.attendanceStatus === 'present'}
                              onChange={() => handleAttendanceStatusChange(student.srNo, 'present')}
                              className="w-4 h-4 text-green-600 border-gray-300 focus:ring-green-500 cursor-pointer"
                            />
                            <span className="text-sm font-medium text-green-600">Present</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              name={`attendance-${student.srNo}`}
                              checked={student.attendanceStatus === 'absent'}
                              onChange={() => handleAttendanceStatusChange(student.srNo, 'absent')}
                              className="w-4 h-4 text-red-600 border-gray-300 focus:ring-red-500 cursor-pointer"
                            />
                            <span className="text-sm font-medium text-red-600">Absent</span>
                          </label>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-6 bg-gray-50 border-t border-gray-200 flex flex-col sm:flex-row gap-3 justify-end">
          <button
            onClick={handleCancel}
            className="flex items-center justify-center gap-2 px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-medium"
          >
            <X className="w-4 h-4" />
            Cancel
          </button>
          <button
            onClick={handleClear}
            className="flex items-center justify-center gap-2 px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-medium"
          >
            <Trash2 className="w-4 h-4" />
            Clear
          </button>
          <button
            onClick={handleSave}
            disabled={attendanceData.length === 0 || (totalPresent === 0 && totalAbsent === 0)}
            className="flex items-center justify-center gap-2 px-6 py-2.5 bg-[#0F4C81] text-white rounded-lg hover:bg-[#0d3f6b] disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
          >
            <Save className="w-4 h-4" />
            Save Attendance
          </button>
        </div>
      </div>
    </div>
  );
}
