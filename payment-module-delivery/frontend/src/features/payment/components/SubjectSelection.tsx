// ─── Subject Selection Component ───────────────────────────────────────────────
// Displays available subjects/courses with fee info for selection in schedule creation.
import React from "react";
import { formatCurrency } from "../paymentCalculations";
import type { SubjectFeeInfo, CourseFeeInfo } from "../paymentTypes";

interface SubjectSelectionProps {
  subjects: SubjectFeeInfo[];
  courses: CourseFeeInfo[];
  selectedSubjectIds: number[];
  selectedCourseIds: number[];
  onToggleSubject: (id: number) => void;
  onToggleCourse: (id: number) => void;
}

export const SubjectSelection: React.FC<SubjectSelectionProps> = ({
  subjects,
  courses,
  selectedSubjectIds,
  selectedCourseIds,
  onToggleSubject,
  onToggleCourse,
}) => {
  return (
    <div className="pm-card pm-subject-selection">
      <h4 className="pm-subject-selection__title">Select Subjects & Courses</h4>

      {courses.length > 0 && (
        <div className="pm-subject-selection__section">
          <h5 className="pm-subject-selection__section-title">Courses</h5>
          <div className="pm-subject-selection__list">
            {courses.map((course) => {
              const isSelected = selectedCourseIds.includes(course.courseId);
              return (
                <label
                  key={course.courseId}
                  className={`pm-subject-selection__item ${isSelected ? "pm-subject-selection__item--selected" : ""}`}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => onToggleCourse(course.courseId)}
                    className="pm-checkbox"
                  />
                  <div className="pm-subject-selection__info">
                    <span className="pm-subject-selection__name">{course.courseName}</span>
                    <span className="pm-subject-selection__meta">
                      Max Installments: {course.maxInstallment}
                      {course.adhocCourse === 1 ? " | Adhoc" : ""}
                    </span>
                  </div>
                  <div className="pm-subject-selection__amount">
                    <span className="pm-text-semibold">{formatCurrency(course.courseFees)}</span>
                    {course.taxable && (
                      <span className="pm-subject-selection__tax-badge">
                        {course.includingTax ? "Inc. Tax" : "Excl. Tax"}
                      </span>
                    )}
                  </div>
                </label>
              );
            })}
          </div>
        </div>
      )}

      {subjects.length > 0 && (
        <div className="pm-subject-selection__section">
          <h5 className="pm-subject-selection__section-title">Subjects</h5>
          <div className="pm-subject-selection__list">
            {subjects.map((subject) => {
              const isSelected = selectedSubjectIds.includes(subject.subId);
              return (
                <label
                  key={subject.subId}
                  className={`pm-subject-selection__item ${isSelected ? "pm-subject-selection__item--selected" : ""}`}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => onToggleSubject(subject.subId)}
                    className="pm-checkbox"
                  />
                  <div className="pm-subject-selection__info">
                    <span className="pm-subject-selection__name">{subject.subName}</span>
                    <span className="pm-subject-selection__meta">
                      {subject.courseName} | Max: {subject.maxInstallment}
                      {subject.adhocSub === 1 ? " | Adhoc" : ""}
                    </span>
                  </div>
                  <div className="pm-subject-selection__amount">
                    <span className="pm-text-semibold">{formatCurrency(subject.fees)}</span>
                    {subject.taxable && (
                      <span className="pm-subject-selection__tax-badge">
                        {subject.includingTax ? "Inc. Tax" : "Excl. Tax"}
                      </span>
                    )}
                  </div>
                </label>
              );
            })}
          </div>
        </div>
      )}

      {subjects.length === 0 && courses.length === 0 && (
        <p className="pm-empty-state__text">No subjects or courses available for this branch.</p>
      )}
    </div>
  );
};
