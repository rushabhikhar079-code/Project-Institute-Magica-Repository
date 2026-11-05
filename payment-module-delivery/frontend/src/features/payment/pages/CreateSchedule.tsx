// ─── Create Schedule Page ──────────────────────────────────────────────────────
// Single-page form layout matching the Adobe XD design.
// All sections are visible simultaneously on one page — no wizard/stepper.
// Sections: Student Details, Payment Type, Fee Selection, Discount,
//           Installment Configuration, Adjustment Options, Remarks,
//           Payment Summary, Save/Cancel actions.
import React, { useState, useEffect } from "react";
import { ArrowLeft, Save, UserPlus } from "lucide-react";
import type {
  PaymentType,
  Installment,
  SubjectFeeInfo,
  CourseFeeInfo,
  OtherFee,
  StudentSearchResult,
  ScheduleCreationForm,
  FeeLine,
} from "../paymentTypes";
import {
  getOtherFeesMock,
  getSubjectsMock,
  getCoursesMock,
  createScheduleMock,
} from "../paymentService";
import {
  calculateFeeLine,
  calculateTotalPayable,
  createTaxConfig,
  distributeEqually,
  round2,
  verifyInstallmentSum,
  formatCurrency,
} from "../paymentCalculations";
import { PAYMENT_TYPES, FEES_TYPE } from "../paymentConstants";
import { SubjectSelectionDialog } from "../dialogs/SubjectSelectionDialog";
import { SubjectSelection } from "../components/SubjectSelection";
import { ApplicableOtherFees } from "../components/ApplicableOtherFees";
import { InstallmentConfiguration } from "../components/InstallmentConfiguration";
import { PaymentSummaryPanel } from "../components/PaymentSummaryPanel";

interface CreateScheduleProps {
  branchId: number;
  onBack: () => void;
  onCreated: (scheduleId: string) => void;
}

export const CreateSchedule: React.FC<CreateScheduleProps> = ({ branchId, onBack, onCreated }) => {
  const [student, setStudent] = useState<StudentSearchResult | null>(null);
  const [showStudentDialog, setShowStudentDialog] = useState(false);
  const [paymentType, setPaymentType] = useState<PaymentType>("Installment");
  const [subjects, setSubjects] = useState<SubjectFeeInfo[]>([]);
  const [courses, setCourses] = useState<CourseFeeInfo[]>([]);
  const [otherFees, setOtherFees] = useState<OtherFee[]>([]);
  const [selectedSubjectIds, setSelectedSubjectIds] = useState<number[]>([]);
  const [selectedCourseIds, setSelectedCourseIds] = useState<number[]>([]);
  const [selectedOtherFeeCodes, setSelectedOtherFeeCodes] = useState<number[]>([]);
  const [installments, setInstallments] = useState<Installment[]>([]);
  const [globalDiscount, setGlobalDiscount] = useState(0);
  const [remarks, setRemarks] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [subs, crses, fees] = await Promise.all([
          getSubjectsMock(),
          getCoursesMock(),
          getOtherFeesMock(),
        ]);
        setSubjects(subs);
        setCourses(crses);
        setOtherFees(fees);
      } catch {
        setError("Failed to load fee configuration data.");
      }
    };
    fetchData();
  }, []);

  // ─── Build fee lines from selections ─────────────────────────────────────
  const feeLines: FeeLine[] = React.useMemo(() => {
    const lines: FeeLine[] = [];

    selectedCourseIds.forEach((id) => {
      const course = courses.find((c) => c.courseId === id);
      if (course) {
        lines.push(
          calculateFeeLine(
            course.courseName,
            course.courseFees,
            0,
            createTaxConfig(course.taxable, course.includingTax, 18, course.hsncode),
            `Course-${course.courseId}`,
            "Course",
            String(course.courseId),
            FEES_TYPE.SUBJECTWISE,
          ),
        );
      }
    });

    selectedSubjectIds.forEach((id) => {
      const subject = subjects.find((s) => s.subId === id);
      if (subject) {
        lines.push(
          calculateFeeLine(
            subject.subName,
            subject.fees,
            0,
            createTaxConfig(subject.taxable, subject.includingTax, 18, subject.hsncode),
            `Subject-${subject.subId}`,
            "Subject",
            String(subject.subId),
            subject.feesType,
          ),
        );
      }
    });

    selectedOtherFeeCodes.forEach((code) => {
      const fee = otherFees.find((f) => f.of_code === code);
      if (fee) {
        lines.push(
          calculateFeeLine(
            fee.of_name,
            fee.amount,
            0,
            createTaxConfig(fee.istaxable === 1, fee.isincluding === 1, 18, ""),
            `OtherFee-${fee.of_code}`,
            "OtherFee",
            String(fee.of_code),
            FEES_TYPE.OTHER,
          ),
        );
      }
    });

    return lines;
  }, [selectedCourseIds, selectedSubjectIds, selectedOtherFeeCodes, courses, subjects, otherFees]);

  const totalPayable = React.useMemo(() => calculateTotalPayable(feeLines), [feeLines]);

  // ─── Initialize / redistribute installments when fee lines or type changes ─
  useEffect(() => {
    if (totalPayable <= 0) {
      setInstallments([]);
      return;
    }

    if (paymentType === "LumpSum" || paymentType === "Adhoc") {
      setInstallments([
        {
          id: `inst-${Date.now()}`,
          installmentNo: 1,
          dueDate: new Date().toLocaleDateString("en-GB"),
          basicAmount: totalPayable,
          discountAmount: 0,
          taxPercentage: 0,
          taxAmount: 0,
          netAmount: totalPayable,
          paidAmount: 0,
          outstandingAmount: totalPayable,
          status: "Pending",
          remarks: "",
        },
      ]);
    } else if (paymentType === "Installment" && installments.length === 0) {
      const amounts = distributeEqually(totalPayable, 3);
      setInstallments(
        amounts.map((amount, idx) => ({
          id: `inst-${Date.now()}-${idx}`,
          installmentNo: idx + 1,
          dueDate: "",
          basicAmount: amount,
          discountAmount: 0,
          taxPercentage: 0,
          taxAmount: 0,
          netAmount: amount,
          paidAmount: 0,
          outstandingAmount: amount,
          status: "Pending",
          remarks: "",
        })),
      );
    } else if (paymentType === "Installment" && installments.length > 0) {
      const sum = round2(installments.reduce((s, i) => s + i.netAmount, 0));
      if (sum !== round2(totalPayable)) {
        const amounts = distributeEqually(totalPayable, installments.length);
        setInstallments(
          installments.map((inst, idx) => ({
            ...inst,
            basicAmount: amounts[idx] || 0,
            netAmount: amounts[idx] || 0,
            outstandingAmount: amounts[idx] || 0,
          })),
        );
      }
    }
  }, [paymentType, totalPayable]);

  const handleToggleSubject = (id: number) => {
    setSelectedSubjectIds((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id],
    );
  };

  const handleToggleCourse = (id: number) => {
    setSelectedCourseIds((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id],
    );
  };

  const handleToggleOtherFee = (code: number) => {
    setSelectedOtherFeeCodes((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code],
    );
  };

  const handleSave = async () => {
    setError(null);

    if (!student) {
      setError("Please select a student.");
      return;
    }

    if (feeLines.length === 0) {
      setError("Please select at least one subject, course, or other fee.");
      return;
    }

    if (!verifyInstallmentSum(installments, totalPayable)) {
      setError(
        `Installment total (${round2(installments.reduce((s, i) => s + i.netAmount, 0)).toFixed(2)}) does not match payable amount (${totalPayable.toFixed(2)}). Please adjust installment amounts.`,
      );
      return;
    }

    setSaving(true);
    try {
      const form: ScheduleCreationForm = {
        studentId: student.RegNo,
        studentName: student.Name,
        studentRegNo: student.RegNo_Manual || student.RegNo,
        studentMobile: student.PContact,
        studentEmail: student.EmailId,
        branchId,
        paymentType,
        selectedSubjects: subjects.filter((s) => selectedSubjectIds.includes(s.subId)),
        selectedCourses: courses.filter((c) => selectedCourseIds.includes(c.courseId)),
        selectedOtherFees: otherFees.filter((f) => selectedOtherFeeCodes.includes(f.of_code)),
        globalDiscount,
        installments,
        remarks,
      };

      const created = await createScheduleMock(form);
      onCreated(created.id);
    } catch {
      setError("Failed to create schedule. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const hasFeeSelection = feeLines.length > 0;

  // ─── Two-column XD layout: left = form sections, right = summary sidebar ──
  return (
    <div className="pm-page">
      <div className="pm-page__header">
        <button type="button" className="pm-btn pm-btn--ghost" onClick={onBack}>
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <h1 className="pm-page__title">Create Payment Schedule</h1>
      </div>

      {error && (
        <div className="pm-error-banner">{error}</div>
      )}

      <div className="pm-create-layout">
        {/* ─── Left Column: Form Sections ─────────────────────────────── */}
        <div className="pm-create-layout__main">
          {/* ── Student Details ── */}
          <div className="pm-card pm-form-section">
            <div className="pm-form-section__header">
              <h3 className="pm-form-section__title">Student Details</h3>
            </div>
            <div className="pm-form-section__body">
              {student ? (
                <div className="pm-student-selected">
                  <div className="pm-student-selected__info">
                    <span className="pm-text-semibold">{student.Name}</span>
                    <span className="pm-text-muted">
                      {student.RegNo_Manual || student.RegNo} | {student.PContact} | {student.CourseNames}
                    </span>
                  </div>
                  <button
                    type="button"
                    className="pm-btn pm-btn--ghost pm-btn--sm"
                    onClick={() => setShowStudentDialog(true)}
                  >
                    Change
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  className="pm-btn pm-btn--secondary"
                  onClick={() => setShowStudentDialog(true)}
                >
                  <UserPlus className="w-4 h-4" />
                  Select Student
                </button>
              )}
            </div>
          </div>

          {/* ── Payment Type ── */}
          <div className="pm-card pm-form-section">
            <div className="pm-form-section__header">
              <h3 className="pm-form-section__title">Payment Type</h3>
            </div>
            <div className="pm-form-section__body">
              <div className="pm-payment-type-grid">
                {PAYMENT_TYPES.map((type) => (
                  <label
                    key={type.value}
                    className={`pm-payment-type-card ${paymentType === type.value ? "pm-payment-type-card--selected" : ""}`}
                  >
                    <input
                      type="radio"
                      name="paymentType"
                      checked={paymentType === type.value}
                      onChange={() => setPaymentType(type.value)}
                    />
                    <div className="pm-payment-type-card__content">
                      <span className="pm-payment-type-card__label">{type.label}</span>
                      <span className="pm-payment-type-card__desc">{type.description}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* ── Course / Subject Fees ── */}
          <div className="pm-card pm-form-section">
            <div className="pm-form-section__header">
              <h3 className="pm-form-section__title">Course / Subject Fees</h3>
            </div>
            <div className="pm-form-section__body">
              <SubjectSelection
                subjects={subjects}
                courses={courses}
                selectedSubjectIds={selectedSubjectIds}
                selectedCourseIds={selectedCourseIds}
                onToggleSubject={handleToggleSubject}
                onToggleCourse={handleToggleCourse}
              />
            </div>
          </div>

          {/* ── Other Fees ── */}
          <div className="pm-card pm-form-section">
            <div className="pm-form-section__header">
              <h3 className="pm-form-section__title">Other Fees</h3>
            </div>
            <div className="pm-form-section__body">
              <ApplicableOtherFees
                fees={otherFees}
                selectedCodes={selectedOtherFeeCodes}
                onToggle={handleToggleOtherFee}
              />
            </div>
          </div>

          {/* ── Discount ── */}
          <div className="pm-card pm-form-section">
            <div className="pm-form-section__header">
              <h3 className="pm-form-section__title">Discount</h3>
            </div>
            <div className="pm-form-section__body">
              <div className="pm-form-row">
                <div className="pm-form-group">
                  <label className="pm-label">Global Discount Amount</label>
                  <input
                    type="number"
                    className="pm-input"
                    step="0.01"
                    min="0"
                    value={globalDiscount}
                    onChange={(e) => setGlobalDiscount(parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                  />
                </div>
                <div className="pm-form-group">
                  <label className="pm-label">Total After Discount</label>
                  <input
                    type="text"
                    className="pm-input pm-input--readonly"
                    readOnly
                    value={formatCurrency(round2(totalPayable - globalDiscount))}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ── Installment Configuration (includes adjustment options) ── */}
          {hasFeeSelection && (
            <div className="pm-card pm-form-section">
              <div className="pm-form-section__header">
                <h3 className="pm-form-section__title">Installment Configuration</h3>
              </div>
              <div className="pm-form-section__body">
                <InstallmentConfiguration
                  installments={installments}
                  totalPayable={totalPayable}
                  onChange={setInstallments}
                  paymentType={paymentType}
                />
              </div>
            </div>
          )}

          {/* ── Remarks ── */}
          <div className="pm-card pm-form-section">
            <div className="pm-form-section__header">
              <h3 className="pm-form-section__title">Remarks</h3>
            </div>
            <div className="pm-form-section__body">
              <textarea
                className="pm-textarea"
                rows={2}
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Optional remarks for this schedule..."
              />
            </div>
          </div>
        </div>

        {/* ─── Right Column: Payment Summary Sidebar ──────────────────── */}
        <div className="pm-create-layout__sidebar">
          {hasFeeSelection ? (
            <PaymentSummaryPanel
              feeLines={feeLines}
              installments={installments}
              globalDiscount={globalDiscount}
            />
          ) : (
            <div className="pm-card pm-summary-panel">
              <h4 className="pm-summary-panel__title">Payment Summary</h4>
              <div className="pm-summary-panel__status">
                <span className="pm-text-muted pm-text-sm">
                  Select courses, subjects, or other fees to see the payment summary.
                </span>
              </div>
            </div>
          )}

          {/* Save / Cancel actions in sidebar */}
          <div className="pm-create-layout__actions">
            <button type="button" className="pm-btn pm-btn--secondary" onClick={onBack}>
              Cancel
            </button>
            <button
              type="button"
              className="pm-btn pm-btn--primary"
              onClick={handleSave}
              disabled={saving || !student || !hasFeeSelection}
            >
              <Save className="w-4 h-4" />
              {saving ? "Saving..." : "Create Schedule"}
            </button>
          </div>
        </div>
      </div>

      <SubjectSelectionDialog
        open={showStudentDialog}
        branchId={branchId}
        onClose={() => setShowStudentDialog(false)}
        onSelect={(s) => setStudent(s)}
      />
    </div>
  );
};
