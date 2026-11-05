import { useState } from 'react';
import { ArrowLeft, Save, X, RotateCcw, AlertCircle } from 'lucide-react';

interface TestCreationProps {
  branchName: string;
  setCurrentPage: (page: string) => void;
}

interface SubjectMarks {
  selected: boolean;
  allowPractical: boolean;
  practicalMarks: string;
  theoryMarks: string;
  totalMarks: number;
  minimumMarks: string;
}

interface SelectedSubjects {
  [key: string]: SubjectMarks;
}

export function TestCreation({ branchName, setCurrentPage }: TestCreationProps) {
  const [testName, setTestName] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [subjectsData, setSubjectsData] = useState<SelectedSubjects>({});

  // Courses data
  const courses = [
    { id: 'c1', name: 'C1 – Institute Level' },
    { id: 'c2', name: 'C2 – B.Tech Programs' },
    { id: 'c3', name: 'C3 – MBA Programs' },
    { id: 'c4', name: 'C4 – BBA Programs' },
    { id: 'c5', name: 'C5 – MCA Programs' },
    { id: 'c6', name: 'C6 – M.Tech Programs' },
    { id: 'c7', name: 'C7 – BCA Programs' },
    { id: 'c8', name: 'C8 – Diploma Programs' },
  ];

  // Subjects by course
  const subjectsByCourse: { [key: string]: Array<{ id: string; name: string }> } = {
    'c1': [
      { id: 's1', name: 'English Communication' },
      { id: 's2', name: 'General Mathematics' },
      { id: 's3', name: 'Environmental Science' },
      { id: 's4', name: 'Physical Education' },
      { id: 's5', name: 'Soft Skills Development' },
    ],
    'c2': [
      { id: 's6', name: 'Computer Science Fundamentals' },
      { id: 's7', name: 'Data Structures & Algorithms' },
      { id: 's8', name: 'Database Management Systems' },
      { id: 's9', name: 'Operating Systems' },
      { id: 's10', name: 'Computer Networks' },
      { id: 's11', name: 'Software Engineering' },
      { id: 's12', name: 'Web Technologies' },
      { id: 's13', name: 'Artificial Intelligence' },
    ],
    'c3': [
      { id: 's14', name: 'Financial Management' },
      { id: 's15', name: 'Marketing Management' },
      { id: 's16', name: 'Human Resource Management' },
      { id: 's17', name: 'Operations Management' },
      { id: 's18', name: 'Business Strategy' },
      { id: 's19', name: 'Organizational Behavior' },
      { id: 's20', name: 'Business Analytics' },
    ],
    'c4': [
      { id: 's21', name: 'Principles of Accounting' },
      { id: 's22', name: 'Business Communication' },
      { id: 's23', name: 'Microeconomics' },
      { id: 's24', name: 'Business Statistics' },
      { id: 's25', name: 'Organizational Behavior' },
      { id: 's26', name: 'Business Law' },
    ],
    'c5': [
      { id: 's27', name: 'Advanced Data Structures' },
      { id: 's28', name: 'Algorithm Design & Analysis' },
      { id: 's29', name: 'Machine Learning' },
      { id: 's30', name: 'Cloud Computing' },
      { id: 's31', name: 'Software Engineering' },
      { id: 's32', name: 'Distributed Systems' },
      { id: 's33', name: 'Cyber Security' },
    ],
    'c6': [
      { id: 's34', name: 'Advanced Computer Architecture' },
      { id: 's35', name: 'High Performance Computing' },
      { id: 's36', name: 'Advanced Networking' },
      { id: 's37', name: 'Research Methodology' },
      { id: 's38', name: 'Embedded Systems' },
    ],
    'c7': [
      { id: 's39', name: 'Programming in C' },
      { id: 's40', name: 'Programming in Java' },
      { id: 's41', name: 'Data Structures' },
      { id: 's42', name: 'Web Development' },
      { id: 's43', name: 'Database Management' },
      { id: 's44', name: 'Computer Networks' },
    ],
    'c8': [
      { id: 's45', name: 'Basic Electronics' },
      { id: 's46', name: 'Digital Electronics' },
      { id: 's47', name: 'Electrical Circuits' },
      { id: 's48', name: 'Engineering Drawing' },
      { id: 's49', name: 'Workshop Practice' },
    ],
  };

  const currentSubjects = selectedCourse ? subjectsByCourse[selectedCourse] || [] : [];

  // Calculate maximum marks automatically
  const calculateMaximumMarks = () => {
    let total = 0;
    Object.values(subjectsData).forEach(subject => {
      if (subject.selected) {
        total += subject.totalMarks;
      }
    });
    return total;
  };

  const maximumMarks = calculateMaximumMarks();

  const handleCourseChange = (courseId: string) => {
    setSelectedCourse(courseId);
    setSubjectsData({});
  };

  const toggleSubjectSelection = (subjectId: string) => {
    setSubjectsData((prev) => {
      const current = prev[subjectId];
      if (current?.selected) {
        // Deselect
        const newData = { ...prev };
        delete newData[subjectId];
        return newData;
      } else {
        // Select
        return {
          ...prev,
          [subjectId]: {
            selected: true,
            allowPractical: false,
            practicalMarks: '',
            theoryMarks: '',
            totalMarks: 0,
            minimumMarks: '',
          },
        };
      }
    });
  };

  const toggleAllowPractical = (subjectId: string) => {
    setSubjectsData((prev) => {
      if (!prev[subjectId]) return prev;
      
      const updated = {
        ...prev[subjectId],
        allowPractical: !prev[subjectId].allowPractical,
        practicalMarks: !prev[subjectId].allowPractical ? prev[subjectId].practicalMarks : '',
      };

      // Recalculate total
      const theory = parseFloat(updated.theoryMarks) || 0;
      const practical = updated.allowPractical ? (parseFloat(updated.practicalMarks) || 0) : 0;
      updated.totalMarks = theory + practical;

      return {
        ...prev,
        [subjectId]: updated,
      };
    });
  };

  const updateMarks = (subjectId: string, field: keyof SubjectMarks, value: string) => {
    setSubjectsData((prev) => {
      if (!prev[subjectId]) return prev;

      const updated = { ...prev[subjectId], [field]: value };

      // Recalculate total marks
      const theory = parseFloat(updated.theoryMarks) || 0;
      const practical = updated.allowPractical ? (parseFloat(updated.practicalMarks) || 0) : 0;
      updated.totalMarks = theory + practical;

      return {
        ...prev,
        [subjectId]: updated,
      };
    });
  };

  const validateMinimumMarks = (subjectId: string): boolean => {
    const subject = subjectsData[subjectId];
    if (!subject) return true;
    
    const minimum = parseFloat(subject.minimumMarks) || 0;
    return minimum <= subject.totalMarks;
  };

  const handleClear = () => {
    if (confirm('Are you sure you want to clear all data?')) {
      setTestName('');
      setSelectedCourse('');
      setSubjectsData({});
    }
  };

  const handleSave = () => {
    // Validation
    if (!testName.trim()) {
      alert('Please enter a test name');
      return;
    }

    if (!selectedCourse) {
      alert('Please select a course');
      return;
    }

    const selectedSubjectsList = Object.keys(subjectsData).filter(id => subjectsData[id].selected);
    
    if (selectedSubjectsList.length === 0) {
      alert('Please select at least one subject');
      return;
    }

    // Validate all selected subjects
    for (const subjectId of selectedSubjectsList) {
      const subject = subjectsData[subjectId];

      if (!subject.theoryMarks || parseFloat(subject.theoryMarks) <= 0) {
        alert('Please enter valid theory marks for all selected subjects');
        return;
      }

      if (subject.allowPractical && (!subject.practicalMarks || parseFloat(subject.practicalMarks) <= 0)) {
        alert('Please enter valid practical marks for subjects with practical enabled');
        return;
      }

      if (!subject.minimumMarks || parseFloat(subject.minimumMarks) <= 0) {
        alert('Please enter valid minimum marks for all selected subjects');
        return;
      }

      if (!validateMinimumMarks(subjectId)) {
        alert('Minimum marks cannot exceed total marks for any subject');
        return;
      }
    }

    console.log('Saving test:', {
      testName,
      maximumMarks,
      course: selectedCourse,
      subjects: subjectsData,
    });

    alert('Test created successfully!');
    setCurrentPage('dashboard');
  };

  const handleCancel = () => {
    if (confirm('Are you sure you want to cancel? All changes will be lost.')) {
      setCurrentPage('dashboard');
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setCurrentPage('dashboard')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Create Test</h1>
            <p className="text-sm text-gray-500 mt-1">{branchName}</p>
          </div>
        </div>
      </div>

      {/* Main Content Card */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6">
        {/* Test Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Test Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Test Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={testName}
              onChange={(e) => setTestName(e.target.value)}
              placeholder="Enter test name"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F4C81] focus:border-transparent text-sm"
            />
          </div>

          {/* Maximum Marks */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Maximum Marks <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={maximumMarks}
              readOnly
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F4C81] focus:border-transparent text-sm bg-gray-50 text-gray-600 cursor-not-allowed"
            />
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="border-t border-gray-200 pt-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column - Courses List */}
            <div className="lg:col-span-3">
              <h2 className="text-base font-semibold text-gray-900 mb-4">Select Course</h2>
              <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {courses.map((course) => (
                  <label
                    key={course.id}
                    className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-all ${
                      selectedCourse === course.id
                        ? 'border-[#0F4C81] bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedCourse === course.id}
                      onChange={() => handleCourseChange(course.id)}
                      className="w-4 h-4 text-[#0F4C81] rounded focus:ring-[#0F4C81]"
                    />
                    <span className="text-sm font-medium text-gray-900">{course.name}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Right Column - Subjects Table */}
            <div className="lg:col-span-9">
              <h2 className="text-base font-semibold text-gray-900 mb-4">Configure Subjects</h2>
              
              {!selectedCourse ? (
                <div className="border border-gray-200 rounded-lg p-8 text-center text-gray-500">
                  Please select a course to view subjects
                </div>
              ) : currentSubjects.length === 0 ? (
                <div className="border border-gray-200 rounded-lg p-8 text-center text-gray-500">
                  No subjects available for this course
                </div>
              ) : (
                <div className="border border-gray-200 rounded-lg overflow-hidden max-h-[400px] overflow-y-auto custom-scrollbar">
                  <table className="w-full min-w-max">
                    <thead className="bg-gray-50 border-b border-gray-200 sticky top-0 z-10">
                      <tr>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap w-16">
                          Select
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap">
                          Subject Name
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap w-32">
                          Allow Practical
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap w-32">
                          Practical Marks
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap w-32">
                          Theory Marks
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap w-32">
                          Total Marks
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap w-32">
                          Minimum Marks
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {currentSubjects.map((subject) => {
                        const subjectData = subjectsData[subject.id];
                        const isSelected = subjectData?.selected || false;
                        const hasError = subjectData?.minimumMarks && !validateMinimumMarks(subject.id);

                        return (
                          <tr key={subject.id} className={isSelected ? 'bg-blue-50' : ''}>
                            {/* Select Checkbox */}
                            <td className="px-4 py-3 text-center">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => toggleSubjectSelection(subject.id)}
                                className="w-4 h-4 text-[#0F4C81] rounded focus:ring-[#0F4C81]"
                              />
                            </td>

                            {/* Subject Name */}
                            <td className="px-4 py-3 text-sm font-medium text-gray-900">
                              {subject.name}
                            </td>

                            {/* Allow Practical */}
                            <td className="px-4 py-3 text-center">
                              <input
                                type="checkbox"
                                checked={subjectData?.allowPractical || false}
                                onChange={() => toggleAllowPractical(subject.id)}
                                disabled={!isSelected}
                                className="w-4 h-4 text-[#0F4C81] rounded focus:ring-[#0F4C81] disabled:opacity-30 disabled:cursor-not-allowed"
                              />
                            </td>

                            {/* Practical Marks */}
                            <td className="px-4 py-3">
                              <input
                                type="number"
                                value={subjectData?.practicalMarks || ''}
                                onChange={(e) => updateMarks(subject.id, 'practicalMarks', e.target.value)}
                                disabled={!isSelected || !subjectData?.allowPractical}
                                placeholder="0"
                                min="0"
                                className="w-full px-3 py-1.5 border border-gray-300 rounded text-sm text-center focus:outline-none focus:ring-2 focus:ring-[#0F4C81] focus:border-transparent disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed"
                              />
                            </td>

                            {/* Theory Marks */}
                            <td className="px-4 py-3">
                              <input
                                type="number"
                                value={subjectData?.theoryMarks || ''}
                                onChange={(e) => updateMarks(subject.id, 'theoryMarks', e.target.value)}
                                disabled={!isSelected}
                                placeholder="0"
                                min="0"
                                className="w-full px-3 py-1.5 border border-gray-300 rounded text-sm text-center focus:outline-none focus:ring-2 focus:ring-[#0F4C81] focus:border-transparent disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed"
                              />
                            </td>

                            {/* Total Marks */}
                            <td className="px-4 py-3">
                              <input
                                type="text"
                                value={subjectData?.totalMarks || 0}
                                readOnly
                                className="w-full px-3 py-1.5 border border-gray-300 rounded text-sm text-center bg-gray-50 text-gray-600 cursor-not-allowed"
                              />
                            </td>

                            {/* Minimum Marks */}
                            <td className="px-4 py-3">
                              <div>
                                <input
                                  type="number"
                                  value={subjectData?.minimumMarks || ''}
                                  onChange={(e) => updateMarks(subject.id, 'minimumMarks', e.target.value)}
                                  disabled={!isSelected}
                                  placeholder="0"
                                  min="0"
                                  className={`w-full px-3 py-1.5 border rounded text-sm text-center focus:outline-none focus:ring-2 focus:ring-[#0F4C81] focus:border-transparent disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed ${
                                    hasError ? 'border-red-500' : 'border-gray-300'
                                  }`}
                                />
                                {hasError && (
                                  <div className="flex items-center justify-center gap-1 mt-1 text-red-600 text-xs">
                                    <AlertCircle className="w-3 h-3" />
                                    <span>Exceeds total</span>
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
          <button
            onClick={handleCancel}
            className="flex items-center gap-2 px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm"
          >
            <X className="w-4 h-4" />
            Cancel
          </button>
          <button
            onClick={handleClear}
            className="flex items-center gap-2 px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm"
          >
            <RotateCcw className="w-4 h-4" />
            Clear
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-6 py-2.5 bg-[#0F4C81] text-white rounded-lg hover:bg-[#0d3f6b] transition-colors font-medium text-sm"
          >
            <Save className="w-4 h-4" />
            Save Test
          </button>
        </div>
      </div>
    </div>
  );
}