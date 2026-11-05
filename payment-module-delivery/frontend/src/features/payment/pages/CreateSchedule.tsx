// ─── Create Schedule Page ──────────────────────────────────────────────────────
// Full schedule creation flow:
// 1. Select student
// 2. Select payment type (Lump Sum, Adhoc, Installment)
// 3. Select subjects/courses/other fees
// 4. Configure installments (custom dates, amounts, equal distribution, adjustments)
// 5. Review summary and save
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

  // Fetch reference data
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

  // ─── Initialize installments when fee lines or payment type changes ──────
  useEffect(() => {
    if (totalPayable <= 0) {
      setInstallments([]);
      return;
    }

    if (paymentType === "LumpSum" || paymentType === "Adhoc") {
      // Single installment
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
      // Default to 3 installments for custom
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
      // Recalculate amounts if total changed but keep count
      // Only auto-redistribute if the sum doesn't match
      const sum = round2(installments.reduce((s, i) => s + i.netAmount, 0));
      if (sum !== round2(totalPayable) && installments.length > 0) {
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
        <div className="pm-error-banner">
          {error}
        </div>
      )}

      {/* Step 1: Select Student */}
      <div className="pm-card pm-create-section">
        <h3 className="pm-create-section__title">1. Select Student</h3>
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

      {/* Step 2: Select Payment Type */}
      <div className="pm-card pm-create-section">
        <h3 className="pm-create-section__title">2. Select Payment Type</h3>
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

      {/* Step 3: Select Fees */}
      <div className="pm-create-section">
        <h3 className="pm-create-section__title">3. Select Fees</h3>
        <SubjectSelection
          subjects={subjects}
          courses={courses}
          selectedSubjectIds={selectedSubjectIds}
          selectedCourseIds={selectedCourseIds}
          onToggleSubject={handleToggleSubject}
          onToggleCourse={handleToggleCourse}
        />
        <ApplicableOtherFees
          fees={otherFees}
          selectedCodes={selectedOtherFeeCodes}
          onToggle={handleToggleOtherFee}
        />
      </div>

      {/* Step 4: Configure Installments */}
      {hasFeeSelection && (
        <div className="pm-create-section">
          <h3 className="pm-create-section__title">4. Configure Installments</h3>
          <InstallmentConfiguration
            installments={installments}
            totalPayable={totalPayable}
            onChange={setInstallments}
            paymentType={paymentType}
          />
        </div>
      )}

      {/* Step 5: Review & Save */}
      {hasFeeSelection && (
        <div className="pm-create-section">
          <h3 className="pm-create-section__title">5. Review & Save</h3>
          <PaymentSummaryPanel
            feeLines={feeLines}
            installments={installments}
            globalDiscount={globalDiscount}
          />
          <div className="pm-form-group" style={{ marginTop: "1rem" }}>
            <label className="pm-label">Remarks</label>
            <textarea
              className="pm-textarea"
              rows={2}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="Optional remarks for this schedule..."
            />
          </div>
          <div className="pm-create-actions">
            <button type="button" className="pm-btn pm-btn--secondary" onClick={onBack}>
              Cancel
            </button>
            <button
              type="button"
              className="pm-btn pm-btn--primary"
              onClick={handleSave}
              disabled={saving || !student}
            >
              <Save className="w-4 h-4" />
              {saving ? "Saving..." : "Create Schedule"}
            </button>
          </div>
        </div>
      )}

      <SubjectSelectionDialog
        open={showStudentDialog}
        branchId={branchId}
        onClose={() => setShowStudentDialog(false)}
        onSelect={(s) => setStudent(s)}
      />
    </div>
  );
};
