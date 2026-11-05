import { useState } from 'react';
import { ArrowLeft, ChevronDown, ChevronRight, Save, X, AlertCircle } from 'lucide-react';

interface BranchTestManagementProps {
  branchName: string;
  setCurrentPage: (page: string) => void;
}

interface SubjectMarks {
  marksType: 'theory' | 'theory-practical';
  theoryMarks: string;
  practicalMarks: string;
  minimumMarks: string;
  totalMarks: number;
}

interface SelectedSubjects {
  [key: string]: SubjectMarks;
}

export function BranchTestManagement({ branchName, setCurrentPage }: BranchTestManagementProps) {
  const [testName, setTestName] = useState('');
  const [maximumMarks, setMaximumMarks] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedSubjects, setSelectedSubjects] = useState<SelectedSubjects>({});
  const [expandedSubjects, setExpandedSubjects] = useState<Set<string>>(new Set());

  // Sample courses and subjects data
  const courses = [
    { id: 'btech', name: 'B.Tech' },
    { id: 'mba', name: 'MBA' },
    { id: 'bba', name: 'BBA' },
    { id: 'mca', name: 'MCA' },
  ];

  const subjectsByCourse: { [key: string]: Array<{ id: string; name: string }> } = {
    'btech': [
      { id: 'cs', name: 'Computer Science' },
      { id: 'math', name: 'Mathematics' },
      { id: 'physics', name: 'Physics' },
      { id: 'chemistry', name: 'Chemistry' },
      { id: 'electronics', name: 'Electronics' },
    ],
    'mba': [
      { id: 'finance', name: 'Finance Management' },
      { id: 'marketing', name: 'Marketing Management' },
      { id: 'hr', name: 'Human Resource Management' },
      { id: 'operations', name: 'Operations Management' },
    ],
    'bba': [
      { id: 'accounting', name: 'Accounting' },
      { id: 'business', name: 'Business Communication' },
      { id: 'economics', name: 'Economics' },
      { id: 'statistics', name: 'Statistics' },
    ],
    'mca': [
      { id: 'datastructures', name: 'Data Structures' },
      { id: 'algorithms', name: 'Algorithms' },
      { id: 'database', name: 'Database Management' },
      { id: 'networks', name: 'Computer Networks' },
    ],
  };

  const currentSubjects = selectedCourse ? subjectsByCourse[selectedCourse] || [] : [];

  const toggleSubject = (subjectId: string) => {
    if (selectedSubjects[subjectId]) {
      // Remove subject
      const newSelected = { ...selectedSubjects };
      delete newSelected[subjectId];
      setSelectedSubjects(newSelected);
      
      const newExpanded = new Set(expandedSubjects);
      newExpanded.delete(subjectId);
      setExpandedSubjects(newExpanded);
    } else {
      // Add subject with default values
      setSelectedSubjects({
        ...selectedSubjects,
        [subjectId]: {
          marksType: 'theory',
          theoryMarks: '',
          practicalMarks: '',
          minimumMarks: '',
          totalMarks: 0,
        },
      });
      
      // Auto-expand when selected
      const newExpanded = new Set(expandedSubjects);
      newExpanded.add(subjectId);
      setExpandedSubjects(newExpanded);
    }
  };

  const toggleExpanded = (subjectId: string) => {
    const newExpanded = new Set(expandedSubjects);
    if (newExpanded.has(subjectId)) {
      newExpanded.delete(subjectId);
    } else {
      newExpanded.add(subjectId);
    }
    setExpandedSubjects(newExpanded);
  };

  const updateSubjectMarks = (subjectId: string, field: keyof SubjectMarks, value: string) => {
    const updated = { ...selectedSubjects[subjectId], [field]: value };
    
    // Calculate total marks
    const theory = parseFloat(updated.theoryMarks) || 0;
    const practical = updated.marksType === 'theory-practical' ? (parseFloat(updated.practicalMarks) || 0) : 0;
    updated.totalMarks = theory + practical;
    
    setSelectedSubjects({
      ...selectedSubjects,
      [subjectId]: updated,
    });
  };

  const validateMinimumMarks = (subjectId: string): boolean => {
    const subject = selectedSubjects[subjectId];
    const minimum = parseFloat(subject.minimumMarks) || 0;
    return minimum <= subject.totalMarks;
  };

  const handleSave = () => {
    // Validation
    if (!testName.trim()) {
      alert('Please enter a test name');
      return;
    }

    if (!maximumMarks || parseFloat(maximumMarks) <= 0) {
      alert('Please enter valid maximum marks');
      return;
    }

    if (!selectedCourse) {
      alert('Please select a course');
      return;
    }

    if (Object.keys(selectedSubjects).length === 0) {
      alert('Please select at least one subject');
      return;
    }

    // Validate all subjects
    for (const subjectId in selectedSubjects) {
      const subject = selectedSubjects[subjectId];
      
      if (!subject.theoryMarks || parseFloat(subject.theoryMarks) <= 0) {
        alert('Please enter valid theory marks for all selected subjects');
        return;
      }

      if (subject.marksType === 'theory-practical') {
        if (!subject.practicalMarks || parseFloat(subject.practicalMarks) <= 0) {
          alert('Please enter valid practical marks for all subjects with practical');
          return;
        }
      }

      if (!subject.minimumMarks || parseFloat(subject.minimumMarks) <= 0) {
        alert('Please enter valid minimum marks for all selected subjects');
        return;
      }

      if (!validateMinimumMarks(subjectId)) {
        alert('Minimum marks cannot exceed total marks');
        return;
      }
    }

    // Save logic here
    console.log('Saving test:', {
      testName,
      maximumMarks,
      selectedCourse,
      subjects: selectedSubjects,
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
        <div className="space-y-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                onChange={(e) => setMaximumMarks(e.target.value)}
                placeholder="Enter maximum marks"
                min="0"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F4C81] focus:border-transparent text-sm"
              />
            </div>
          </div>

          {/* Course Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Select Course <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedCourse}
              onChange={(e) => {
                setSelectedCourse(e.target.value);
                setSelectedSubjects({});
                setExpandedSubjects(new Set());
              }}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F4C81] focus:border-transparent text-sm"
            >
              <option value="">-- Select Course --</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Subjects Section */}
        {selectedCourse && (
          <div className="border-t border-gray-200 pt-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Configure Subjects
            </h2>

            {currentSubjects.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No subjects available for this course.
              </div>
            ) : (
              <div className="space-y-3">
                {currentSubjects.map((subject) => {
                  const isSelected = !!selectedSubjects[subject.id];
                  const isExpanded = expandedSubjects.has(subject.id);
                  const subjectData = selectedSubjects[subject.id];

                  return (
                    <div
                      key={subject.id}
                      className={`border rounded-lg transition-all ${
                        isSelected ? 'border-[#0F4C81] bg-blue-50' : 'border-gray-200 bg-white'
                      }`}
                    >
                      {/* Subject Header */}
                      <div className="flex items-center justify-between p-4">
                        <div className="flex items-center gap-3 flex-1">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSubject(subject.id)}
                            className="w-5 h-5 text-[#0F4C81] rounded focus:ring-[#0F4C81] cursor-pointer"
                          />
                          <label className="text-sm font-medium text-gray-900 cursor-pointer">
                            {subject.name}
                          </label>
                        </div>

                        {isSelected && (
                          <button
                            onClick={() => toggleExpanded(subject.id)}
                            className="p-1 hover:bg-white rounded transition-colors"
                          >
                            {isExpanded ? (
                              <ChevronDown className="w-5 h-5 text-gray-600" />
                            ) : (
                              <ChevronRight className="w-5 h-5 text-gray-600" />
                            )}
                          </button>
                        )}
                      </div>

                      {/* Marks Configuration (Expandable) */}
                      {isSelected && isExpanded && subjectData && (
                        <div className="px-4 pb-4 border-t border-blue-200 bg-white">
                          <div className="pt-4 space-y-4">
                            {/* Marks Type Selector */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Marks Type
                              </label>
                              <div className="flex gap-4">
                                <label className="flex items-center gap-2 cursor-pointer">
                                  <input
                                    type="radio"
                                    name={`marksType-${subject.id}`}
                                    value="theory"
                                    checked={subjectData.marksType === 'theory'}
                                    onChange={(e) =>
                                      updateSubjectMarks(subject.id, 'marksType', e.target.value as any)
                                    }
                                    className="w-4 h-4 text-[#0F4C81] focus:ring-[#0F4C81]"
                                  />
                                  <span className="text-sm text-gray-700">Theory Only</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                  <input
                                    type="radio"
                                    name={`marksType-${subject.id}`}
                                    value="theory-practical"
                                    checked={subjectData.marksType === 'theory-practical'}
                                    onChange={(e) =>
                                      updateSubjectMarks(subject.id, 'marksType', e.target.value as any)
                                    }
                                    className="w-4 h-4 text-[#0F4C81] focus:ring-[#0F4C81]"
                                  />
                                  <span className="text-sm text-gray-700">Theory + Practical</span>
                                </label>
                              </div>
                            </div>

                            {/* Marks Input Fields */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {/* Theory Marks */}
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Theory Marks <span className="text-red-500">*</span>
                                </label>
                                <input
                                  type="number"
                                  value={subjectData.theoryMarks}
                                  onChange={(e) =>
                                    updateSubjectMarks(subject.id, 'theoryMarks', e.target.value)
                                  }
                                  placeholder="Enter theory marks"
                                  min="0"
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F4C81] focus:border-transparent text-sm"
                                />
                              </div>

                              {/* Practical Marks (only if theory-practical) */}
                              {subjectData.marksType === 'theory-practical' && (
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Practical Marks <span className="text-red-500">*</span>
                                  </label>
                                  <input
                                    type="number"
                                    value={subjectData.practicalMarks}
                                    onChange={(e) =>
                                      updateSubjectMarks(subject.id, 'practicalMarks', e.target.value)
                                    }
                                    placeholder="Enter practical marks"
                                    min="0"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F4C81] focus:border-transparent text-sm"
                                  />
                                </div>
                              )}

                              {/* Minimum Marks */}
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Minimum Marks <span className="text-red-500">*</span>
                                </label>
                                <input
                                  type="number"
                                  value={subjectData.minimumMarks}
                                  onChange={(e) =>
                                    updateSubjectMarks(subject.id, 'minimumMarks', e.target.value)
                                  }
                                  placeholder="Enter minimum marks"
                                  min="0"
                                  max={subjectData.totalMarks}
                                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F4C81] focus:border-transparent text-sm ${
                                    subjectData.minimumMarks && !validateMinimumMarks(subject.id)
                                      ? 'border-red-500'
                                      : 'border-gray-300'
                                  }`}
                                />
                                {subjectData.minimumMarks && !validateMinimumMarks(subject.id) && (
                                  <div className="flex items-center gap-1 mt-1 text-red-600 text-xs">
                                    <AlertCircle className="w-3 h-3" />
                                    <span>Minimum marks cannot exceed total marks</span>
                                  </div>
                                )}
                              </div>

                              {/* Total Marks (Read-only) */}
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Total Marks
                                </label>
                                <input
                                  type="text"
                                  value={subjectData.totalMarks}
                                  readOnly
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 text-sm cursor-not-allowed"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 mt-8 pt-6 border-t border-gray-200">
          <button
            onClick={handleCancel}
            className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm"
          >
            Cancel
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
