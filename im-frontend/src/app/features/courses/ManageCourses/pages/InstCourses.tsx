import { useEffect, useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { X } from "lucide-react";

import DataTable from "../../../../components/common/DataTable/Datatable";
import Pagination from "../../../../components/common/DataTable/TablePagination";

import {
  getInstituteCourseColumns,
  getInstituteSubjectColumns,
} from "../columns";

import type { CourseOutletContext } from "./ManageCourses";
import PageHeader from "../../../../components/common/PageHeader/PageHeader";
import ValidationErrorSummary from "../../../../components/common/ValidationErrorSummary";
import { useDispatch } from "react-redux";
import { clearGlobalError } from "../../../../redux/slices/errorSlice";

const InstCourses = () => {
  const {
    instituteCourses,
    onAddCourse,
    subjectCurrentTablePage,
    subjectPageSize,
    subjectTotalCount,
    subjectTotalPages,
    subjectHasPrevious,
    subjectHasNext,

    onSubjectPageChange,
    onSubjectPageSizeChange,
    instituteCurrentTablePage,
    institutePageSize,
    instituteTotalCount,
    instituteTotalPages,
    instituteHasPrevious,
    instituteHasNext,

    onInstitutePageChange,
    onInstitutePageSizeChange,

    // ADD THESE
    instituteSubjects,
    onViewSubjects,
    instituteSortBy,
    instituteSortDirection,
    onInstituteSortChange,
  } = useOutletContext<CourseOutletContext>();

  const [selectedCourseIds, setSelectedCourseIds] = useState<number[]>([]);
  const [showSubjects, setShowSubjects] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(clearGlobalError());

    return () => {
      dispatch(clearGlobalError());
    };
  }, [dispatch]);
  const navigate = useNavigate();

  const handleSelectCourse = (id: number) => {
    setSelectedCourseIds((prev) =>
      prev.includes(id)
        ? prev.filter((courseId) => courseId !== id)
        : [...prev, id],
    );

    // Hide subjects when selection changes
    setShowSubjects(false);
  };
  const handleSelectAll = () => {
    const selectableCourses = instituteCourses.filter(
      (course) => !course.isImported,
    );

    const allSelected =
      selectableCourses.length > 0 &&
      selectableCourses.every((course) =>
        selectedCourseIds.includes(course.courseId),
      );

    if (allSelected) {
      setSelectedCourseIds([]);
    } else {
      setSelectedCourseIds(selectableCourses.map((course) => course.courseId));
    }

    setShowSubjects(false);
  };

  const handleAddCourse = async () => {
    if (selectedCourseIds.length === 0) {
      return;
    }

    await onAddCourse(selectedCourseIds);

    // Optional: clear selection after successful import
    setSelectedCourseIds([]);
    setShowSubjects(false);
    navigate("/managecourses");
  };

  const handleViewSubjects = async () => {
    if (selectedCourseIds.length === 0) {
      return;
    }

    await onViewSubjects(selectedCourseIds);
    setShowSubjects(true);
  };

  const courseColumns = getInstituteCourseColumns({
    selectedCourseIds,
    courses: instituteCourses,
    onSelect: handleSelectCourse,
    onSelectAll: handleSelectAll,
  });

  const subjectColumns = getInstituteSubjectColumns();

  return (
    <div className="space-y-4">
      <PageHeader
        title="Import Courses from Institute"
        description="Select one or more courses to import or view their subjects"
        extraBreadcrumbs={[
          {
            label: "Import Courses from Institute",
          },
        ]}
      />

      {/* ================= COURSES TABLE ================= */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <DataTable
            columns={courseColumns}
            data={instituteCourses}
            rowKey="courseId"
            sortBy={instituteSortBy}
            sortDirection={instituteSortDirection}
            onSortChange={onInstituteSortChange}
            emptyMessage="No Courses found."
          />

          {instituteTotalCount > 0 && (
            <Pagination
              currentPage={instituteCurrentTablePage}
              pageSize={institutePageSize}
              totalCount={instituteTotalCount}
              totalPages={instituteTotalPages}
              hasPrevious={instituteHasPrevious}
              hasNext={instituteHasNext}
              onPageChange={onInstitutePageChange}
              onPageSizeChange={onInstitutePageSizeChange}
            />
          )}
        </div>
      </div>

      {/* ================= SUBJECTS TABLE ================= */}
      {showSubjects && (
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-800">Subjects</h3>
          </div>

          <div className="overflow-x-auto">
            <DataTable
              columns={subjectColumns}
              data={instituteSubjects}
              rowKey="subId"
              emptyMessage="No subjects found for the selected course(s)."
            />
          </div>
          {subjectTotalCount > 0 && (
            <Pagination
              currentPage={subjectCurrentTablePage}
              pageSize={subjectPageSize}
              totalCount={subjectTotalCount}
              totalPages={subjectTotalPages}
              hasPrevious={subjectHasPrevious}
              hasNext={subjectHasNext}
              onPageChange={onSubjectPageChange}
              onPageSizeChange={onSubjectPageSizeChange}
            />
          )}
        </div>
      )}
      {/* ================= ACTIONS ================= */}
      <div>
        <ValidationErrorSummary />
        <div className="mt-4 flex items-center justify-start gap-3">
          {/* IMPORT COURSES */}
          <button
            type="button"
            onClick={handleAddCourse}
            disabled={selectedCourseIds.length === 0}
            className="px-4 py-2 rounded-lg bg-[#0F4C81] text-white text-sm font-medium hover:bg-[#0c3d6a] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Import Course(s)
          </button>

          {/* VIEW SUBJECTS */}
          <button
            type="button"
            onClick={handleViewSubjects}
            disabled={selectedCourseIds.length === 0}
            className="flex items-center justify-center gap-1.5 px-3 py-2 border border-[#0F4C81] text-[#0F4C81] rounded-lg hover:bg-[#0F4C81] disabled:opacity-50 disabled:cursor-not-allowed hover:text-white transition-colors text-xs font-medium"
          >
            View Subjects
          </button>

          {/* CANCEL */}
          <button
            type="button"
            onClick={() => navigate("..")}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-all"
          >
            <X className="w-4 h-4" />
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default InstCourses;
