import { useState } from 'react';
import { Video, Search, Filter, Plus, Calendar, Clock, Users, User, PlayCircle, CheckCircle, XCircle, MoreVertical, Edit, Trash2, Copy, ExternalLink } from 'lucide-react';

interface LiveClassesProps {
  branchName: string;
  setCurrentPage: (page: string) => void;
}

export function LiveClasses({ branchName, setCurrentPage }: LiveClassesProps) {
  const [activeTab, setActiveTab] = useState('today');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    className: '',
    subject: '',
    instructor: '',
    date: '',
    startTime: '',
    endTime: '',
    batchName: '',
    meetingLink: '',
    description: ''
  });

  // Today's Classes Data
  const todaysClasses = [
    {
      id: 'CLS001',
      className: 'Mathematics - Algebra Basics',
      subject: 'Mathematics',
      instructor: 'Dr. Rajesh Kumar',
      batchName: 'Batch A - Morning',
      startTime: '09:00 AM',
      endTime: '10:30 AM',
      duration: '90 mins',
      totalStudents: 45,
      joinedStudents: 38,
      status: 'completed',
      meetingLink: 'https://meet.example.com/abc123',
      date: '06/02/2026'
    },
    {
      id: 'CLS002',
      className: 'Physics - Mechanics',
      subject: 'Physics',
      instructor: 'Prof. Priya Sharma',
      batchName: 'Batch B - Afternoon',
      startTime: '02:00 PM',
      endTime: '03:30 PM',
      duration: '90 mins',
      totalStudents: 40,
      joinedStudents: 40,
      status: 'live',
      meetingLink: 'https://meet.example.com/def456',
      date: '06/02/2026'
    },
    {
      id: 'CLS003',
      className: 'Chemistry - Organic Chemistry',
      subject: 'Chemistry',
      instructor: 'Dr. Amit Patel',
      batchName: 'Batch C - Evening',
      startTime: '05:00 PM',
      endTime: '06:30 PM',
      duration: '90 mins',
      totalStudents: 35,
      joinedStudents: 0,
      status: 'scheduled',
      meetingLink: 'https://meet.example.com/ghi789',
      date: '06/02/2026'
    }
  ];

  // Upcoming Classes Data
  const upcomingClasses = [
    {
      id: 'CLS004',
      className: 'English - Grammar & Composition',
      subject: 'English',
      instructor: 'Ms. Sneha Reddy',
      batchName: 'Batch A - Morning',
      startTime: '10:00 AM',
      endTime: '11:30 AM',
      duration: '90 mins',
      totalStudents: 50,
      joinedStudents: 0,
      status: 'scheduled',
      meetingLink: 'https://meet.example.com/jkl012',
      date: '07/02/2026'
    },
    {
      id: 'CLS005',
      className: 'Biology - Cell Structure',
      subject: 'Biology',
      instructor: 'Dr. Vikram Singh',
      batchName: 'Batch D - Morning',
      startTime: '09:00 AM',
      endTime: '10:30 AM',
      duration: '90 mins',
      totalStudents: 42,
      joinedStudents: 0,
      status: 'scheduled',
      meetingLink: 'https://meet.example.com/mno345',
      date: '08/02/2026'
    },
    {
      id: 'CLS006',
      className: 'Computer Science - Python Basics',
      subject: 'Computer Science',
      instructor: 'Prof. Ankit Verma',
      batchName: 'Batch E - Evening',
      startTime: '04:00 PM',
      endTime: '05:30 PM',
      duration: '90 mins',
      totalStudents: 38,
      joinedStudents: 0,
      status: 'scheduled',
      meetingLink: 'https://meet.example.com/pqr678',
      date: '09/02/2026'
    },
    {
      id: 'CLS007',
      className: 'History - Modern Indian History',
      subject: 'History',
      instructor: 'Dr. Meera Kapoor',
      batchName: 'Batch B - Afternoon',
      startTime: '02:30 PM',
      endTime: '04:00 PM',
      duration: '90 mins',
      totalStudents: 30,
      joinedStudents: 0,
      status: 'scheduled',
      meetingLink: 'https://meet.example.com/stu901',
      date: '10/02/2026'
    }
  ];

  // Past Classes Data
  const pastClasses = [
    {
      id: 'CLS008',
      className: 'Mathematics - Trigonometry',
      subject: 'Mathematics',
      instructor: 'Dr. Rajesh Kumar',
      batchName: 'Batch A - Morning',
      startTime: '09:00 AM',
      endTime: '10:30 AM',
      duration: '90 mins',
      totalStudents: 45,
      joinedStudents: 43,
      attendance: '96%',
      status: 'completed',
      meetingLink: 'https://meet.example.com/vwx234',
      date: '05/02/2026',
      recording: 'Available'
    },
    {
      id: 'CLS009',
      className: 'Physics - Thermodynamics',
      subject: 'Physics',
      instructor: 'Prof. Priya Sharma',
      batchName: 'Batch B - Afternoon',
      startTime: '02:00 PM',
      endTime: '03:30 PM',
      duration: '90 mins',
      totalStudents: 40,
      joinedStudents: 35,
      attendance: '88%',
      status: 'completed',
      meetingLink: 'https://meet.example.com/yza567',
      date: '04/02/2026',
      recording: 'Available'
    },
    {
      id: 'CLS010',
      className: 'Chemistry - Inorganic Chemistry',
      subject: 'Chemistry',
      instructor: 'Dr. Amit Patel',
      batchName: 'Batch C - Evening',
      startTime: '05:00 PM',
      endTime: '06:30 PM',
      duration: '90 mins',
      totalStudents: 35,
      joinedStudents: 32,
      attendance: '91%',
      status: 'completed',
      meetingLink: 'https://meet.example.com/bcd890',
      date: '03/02/2026',
      recording: 'Processing'
    },
    {
      id: 'CLS011',
      className: 'English - Poetry Analysis',
      subject: 'English',
      instructor: 'Ms. Sneha Reddy',
      batchName: 'Batch A - Morning',
      startTime: '10:00 AM',
      endTime: '11:30 AM',
      duration: '90 mins',
      totalStudents: 50,
      joinedStudents: 48,
      attendance: '96%',
      status: 'completed',
      meetingLink: 'https://meet.example.com/efg123',
      date: '02/02/2026',
      recording: 'Available'
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'live':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium bg-red-100 text-red-700 rounded-full animate-pulse">
            <div className="w-2 h-2 bg-red-600 rounded-full"></div>
            LIVE
          </span>
        );
      case 'scheduled':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">
            <Clock className="w-3 h-3" />
            Scheduled
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full">
            <CheckCircle className="w-3 h-3" />
            Completed
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full">
            <XCircle className="w-3 h-3" />
            Cancelled
          </span>
        );
      default:
        return null;
    }
  };

  const handleCreateClass = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle create class logic here
    console.log('Creating class:', formData);
    setShowCreateModal(false);
    // Reset form
    setFormData({
      className: '',
      subject: '',
      instructor: '',
      date: '',
      startTime: '',
      endTime: '',
      batchName: '',
      meetingLink: '',
      description: ''
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Live Classes</h1>
          <p className="text-sm text-gray-500 mt-1">
            Branch: <span className="font-medium text-[#0F4C81]">{branchName}</span>
          </p>
        </div>
        <button 
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#0F4C81] text-white rounded-lg hover:bg-[#0d3f6b] transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span className="text-sm font-medium">Create New Class</span>
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{todaysClasses.length}</div>
              <div className="text-xs text-gray-500">Today's Classes</div>
            </div>
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <PlayCircle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-red-600">{todaysClasses.filter(c => c.status === 'live').length}</div>
              <div className="text-xs text-gray-500">Live Now</div>
            </div>
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">{upcomingClasses.length}</div>
              <div className="text-xs text-gray-500">Upcoming</div>
            </div>
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Video className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{pastClasses.length}</div>
              <div className="text-xs text-gray-500">Past Classes</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="flex overflow-x-auto">
          <button
            onClick={() => setActiveTab('today')}
            className={`flex-1 min-w-fit px-6 py-4 text-sm font-medium transition-colors border-b-2 ${
              activeTab === 'today'
                ? 'border-[#0F4C81] text-[#0F4C81] bg-blue-50'
                : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center gap-2 justify-center">
              <Calendar className="w-4 h-4" />
              Today's Classes
            </div>
          </button>
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`flex-1 min-w-fit px-6 py-4 text-sm font-medium transition-colors border-b-2 ${
              activeTab === 'upcoming'
                ? 'border-[#0F4C81] text-[#0F4C81] bg-blue-50'
                : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center gap-2 justify-center">
              <Clock className="w-4 h-4" />
              Upcoming Classes
            </div>
          </button>
          <button
            onClick={() => setActiveTab('past')}
            className={`flex-1 min-w-fit px-6 py-4 text-sm font-medium transition-colors border-b-2 ${
              activeTab === 'past'
                ? 'border-[#0F4C81] text-[#0F4C81] bg-blue-50'
                : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center gap-2 justify-center">
              <Video className="w-4 h-4" />
              Past Classes
            </div>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white border border-gray-200 rounded-xl p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by class name, subject, or instructor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0F4C81] focus:border-transparent"
          />
        </div>
      </div>

      {/* Today's Classes Tab */}
      {activeTab === 'today' && (
        <div className="space-y-4">
          {todaysClasses.map((classItem) => (
            <div key={classItem.id} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                {/* Left Section */}
                <div className="flex-1 space-y-3">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{classItem.className}</h3>
                      <p className="text-sm text-gray-500 mt-1">{classItem.subject}</p>
                    </div>
                    {getStatusBadge(classItem.status)}
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <User className="w-4 h-4 text-gray-400" />
                      <span>{classItem.instructor}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Users className="w-4 h-4 text-gray-400" />
                      <span>{classItem.batchName}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span>{classItem.startTime} - {classItem.endTime}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span>{classItem.date}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-sm">
                      <span className="text-gray-500">Students: </span>
                      <span className="font-semibold text-gray-900">
                        {classItem.joinedStudents}/{classItem.totalStudents}
                      </span>
                    </div>
                    {classItem.status === 'live' && (
                      <div className="text-sm">
                        <span className="text-gray-500">Joined: </span>
                        <span className="font-semibold text-green-600">
                          {Math.round((classItem.joinedStudents / classItem.totalStudents) * 100)}%
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Section - Actions */}
                <div className="flex flex-col gap-2 lg:w-48">
                  {classItem.status === 'live' && (
                    <button className="flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                      <PlayCircle className="w-4 h-4" />
                      <span className="text-sm font-medium">Join Now</span>
                    </button>
                  )}
                  {classItem.status === 'scheduled' && (
                    <button className="flex items-center justify-center gap-2 px-4 py-2 bg-[#0F4C81] text-white rounded-lg hover:bg-[#0d3f6b] transition-colors">
                      <Video className="w-4 h-4" />
                      <span className="text-sm font-medium">Start Class</span>
                    </button>
                  )}
                  {classItem.status === 'completed' && (
                    <button className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                      <CheckCircle className="w-4 h-4" />
                      <span className="text-sm font-medium">View Details</span>
                    </button>
                  )}
                  <div className="flex gap-2">
                    <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                      <Copy className="w-4 h-4" />
                      <span className="text-xs font-medium">Copy Link</span>
                    </button>
                    <button className="px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upcoming Classes Tab */}
      {activeTab === 'upcoming' && (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-4 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Class Details</th>
                  <th className="text-left py-4 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Instructor</th>
                  <th className="text-left py-4 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Batch</th>
                  <th className="text-left py-4 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Date & Time</th>
                  <th className="text-left py-4 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Students</th>
                  <th className="text-left py-4 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                  <th className="text-left py-4 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {upcomingClasses.map((classItem) => (
                  <tr key={classItem.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-4">
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{classItem.className}</p>
                        <p className="text-xs text-gray-500">{classItem.subject}</p>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-sm text-gray-600">{classItem.instructor}</span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-sm text-gray-600">{classItem.batchName}</span>
                    </td>
                    <td className="py-4 px-4">
                      <div>
                        <p className="text-sm text-gray-900">{classItem.date}</p>
                        <p className="text-xs text-gray-500">{classItem.startTime} - {classItem.endTime}</p>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-sm font-medium text-gray-900">{classItem.totalStudents}</span>
                    </td>
                    <td className="py-4 px-4">
                      {getStatusBadge(classItem.status)}
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                          <Copy className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Past Classes Tab */}
      {activeTab === 'past' && (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-4 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Class Details</th>
                  <th className="text-left py-4 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Instructor</th>
                  <th className="text-left py-4 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Date & Time</th>
                  <th className="text-left py-4 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Attendance</th>
                  <th className="text-left py-4 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Recording</th>
                  <th className="text-left py-4 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                  <th className="text-left py-4 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {pastClasses.map((classItem) => (
                  <tr key={classItem.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-4">
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{classItem.className}</p>
                        <p className="text-xs text-gray-500">{classItem.subject}</p>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-sm text-gray-600">{classItem.instructor}</span>
                    </td>
                    <td className="py-4 px-4">
                      <div>
                        <p className="text-sm text-gray-900">{classItem.date}</p>
                        <p className="text-xs text-gray-500">{classItem.startTime} - {classItem.endTime}</p>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{classItem.attendance}</p>
                        <p className="text-xs text-gray-500">{classItem.joinedStudents}/{classItem.totalStudents} students</p>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      {classItem.recording === 'Available' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full">
                          <Video className="w-3 h-3" />
                          Available
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium bg-yellow-100 text-yellow-700 rounded-full">
                          <Clock className="w-3 h-3" />
                          Processing
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      {getStatusBadge(classItem.status)}
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        {classItem.recording === 'Available' && (
                          <button className="px-3 py-1 text-xs font-medium text-white bg-[#0F4C81] rounded hover:bg-[#0d3f6b] transition-colors">
                            Watch Recording
                          </button>
                        )}
                        <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                          <ExternalLink className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create Class Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Create New Class</h2>
              <button 
                onClick={() => setShowCreateModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <XCircle className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            
            <form onSubmit={handleCreateClass} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Class Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="className"
                    value={formData.className}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0F4C81] focus:border-transparent"
                    placeholder="Enter class name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Subject <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0F4C81] focus:border-transparent"
                    placeholder="Enter subject"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Instructor <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="instructor"
                    value={formData.instructor}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0F4C81] focus:border-transparent"
                  >
                    <option value="">Select Instructor</option>
                    <option value="Dr. Rajesh Kumar">Dr. Rajesh Kumar</option>
                    <option value="Prof. Priya Sharma">Prof. Priya Sharma</option>
                    <option value="Dr. Amit Patel">Dr. Amit Patel</option>
                    <option value="Ms. Sneha Reddy">Ms. Sneha Reddy</option>
                    <option value="Dr. Vikram Singh">Dr. Vikram Singh</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Batch <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="batchName"
                    value={formData.batchName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0F4C81] focus:border-transparent"
                  >
                    <option value="">Select Batch</option>
                    <option value="Batch A - Morning">Batch A - Morning</option>
                    <option value="Batch B - Afternoon">Batch B - Afternoon</option>
                    <option value="Batch C - Evening">Batch C - Evening</option>
                    <option value="Batch D - Morning">Batch D - Morning</option>
                    <option value="Batch E - Evening">Batch E - Evening</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0F4C81] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Time <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="time"
                    name="startTime"
                    value={formData.startTime}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0F4C81] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Time <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="time"
                    name="endTime"
                    value={formData.endTime}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0F4C81] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Meeting Link
                  </label>
                  <input
                    type="url"
                    name="meetingLink"
                    value={formData.meetingLink}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0F4C81] focus:border-transparent"
                    placeholder="https://meet.example.com/..."
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0F4C81] focus:border-transparent resize-none"
                  placeholder="Enter class description or agenda..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-[#0F4C81] text-white rounded-lg hover:bg-[#0d3f6b] transition-colors font-medium"
                >
                  Create Class
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
