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
  updateScheduleMock,
} from "../paymentService";
import { mockStudents } from "../paymentMockData";
import {
  calculateFeeLine,
  calculateTotalPayable,
  createTaxConfig,
  distributeEqually,
  round2,
  verifyInstallmentSum,
  formatCurrency,
} from "../paymentCalculations";
import { DEFAULT_TAX_PERCENTAGE, PAYMENT_TYPES, FEES_TYPE } from "../paymentConstants";
import { SubjectSelectionDialog } from "../dialogs/SubjectSelectionDialog";
import { SubjectSelection } from "../components/SubjectSelection";
import { SubjectSelectionAlert } from "../components/SubjectSelectionAlert";
import { ApplicableOtherFees } from "../components/ApplicableOtherFees";
import { InstallmentConfiguration } from "../components/InstallmentConfiguration";
import { PaymentSummaryPanel } from "../components/PaymentSummaryPanel";

interface CreateScheduleProps {
  branchId: number;
  onBack: () => void;
  onSaveAndPay: (scheduleId: string) => void;
}

const formatScheduleDate = (startDate: string, index: number, intervalMonths: number): string => {
  const [year, month, day] = startDate.split("-").map(Number);
  const date = new Date(year, month - 1 + index * intervalMonths, day);
  return date.toLocaleDateString("en-GB");
};

export const CreateSchedule: React.FC<CreateScheduleProps> = ({ branchId, onBack, onSaveAndPay }) => {
  const [student, setStudent] = useState<StudentSearchResult | null>(mockStudents[0] ?? null);
  const [showStudentDialog, setShowStudentDialog] = useState(false);
  const [paymentType, setPaymentType] = useState<PaymentType>("Installment");
  const [subjects, setSubjects] = useState<SubjectFeeInfo[]>([]);
  const [courses, setCourses] = useState<CourseFeeInfo[]>([]);
  const [otherFees, setOtherFees] = useState<OtherFee[]>([]);
  const [selectedSubjectIds, setSelectedSubjectIds] = useState<number[]>([101]);
  const [selectedCourseIds, setSelectedCourseIds] = useState<number[]>([]);
  const [selectedOtherFeeCodes, setSelectedOtherFeeCodes] = useState<number[]>([]);
  const [installments, setInstallments] = useState<Installment[]>([]);
  const [globalDiscount, setGlobalDiscount] = useState(0);
  const [discountMode, setDiscountMode] = useState<"Amount" | "Percent">("Amount");
  const [remarks, setRemarks] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [workflowStep, setWorkflowStep] = useState<"initial" | "installments">("initial");
  const [initialInstallments, setInitialInstallments] = useState<Installment[]>([]);
  const [savedScheduleId, setSavedScheduleId] = useState<string | null>(null);
  const [installmentStartDate, setInstallmentStartDate] = useState("");
  const [intervalMonths, setIntervalMonths] = useState(1);

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
            createTaxConfig(course.taxable, course.includingTax, DEFAULT_TAX_PERCENTAGE, course.hsncode),
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
            createTaxConfig(subject.taxable, subject.includingTax, DEFAULT_TAX_PERCENTAGE, subject.hsncode),
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
            createTaxConfig(fee.istaxable === 1, fee.isincluding === 1, DEFAULT_TAX_PERCENTAGE, ""),
            `OtherFee-${fee.of_code}`,
            "OtherFee",
            String(fee.of_code),
            FEES_TYPE.OTHER,
          ),
        );
        lines[lines.length - 1] = { ...lines[lines.length - 1], frequency: fee.of_FrequencyName };
      }
    });

    return lines;
  }, [selectedCourseIds, selectedSubjectIds, selectedOtherFeeCodes, courses, subjects, otherFees]);

  const basePayable = React.useMemo(() => calculateTotalPayable(feeLines), [feeLines]);
  const totalPayable = React.useMemo(
    () => round2(Math.max(0, basePayable - globalDiscount)),
    [basePayable, globalDiscount],
  );
  const configuredMaximums = [...subjects.filter((subject) => selectedSubjectIds.includes(subject.subId)).map((subject) => subject.maxInstallment), ...courses.filter((course) => selectedCourseIds.includes(course.courseId)).map((course) => course.maxInstallment)].filter((maximum) => maximum > 0);
  const maximumInstallments = configuredMaximums.length > 0 ? Math.min(...configuredMaximums) : 5;

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
          installmentName: paymentType === "LumpSum" ? "Lump Sum" : "Adhoc-1",
          dueDate: new Date().toLocaleDateString("en-GB"),
          basicAmount: totalPayable,
          discountAmount: 0,
          taxPercentage: 0,
          taxAmount: 0,
          netAmount: totalPayable,
          paidAmount: 0,
          outstandingAmount: totalPayable,
          outstandingWithoutTax: totalPayable,
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
          installmentName: `Installment ${idx + 1}`,
          dueDate: "",
          basicAmount: amount,
          discountAmount: 0,
          taxPercentage: 0,
          taxAmount: 0,
          netAmount: amount,
          paidAmount: 0,
          outstandingAmount: amount,
          outstandingWithoutTax: amount,
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
            outstandingWithoutTax: round2((amounts[idx] || 0) - inst.paidAmount),
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

  const persistSchedule = async (): Promise<string | null> => {
    setError(null);

    if (!student) {
      setError("Please select a student.");
      return null;
    }

    if (feeLines.length === 0) {
      setError("Please select at least one subject, course, or other fee.");
      return null;
    }

    if (!verifyInstallmentSum(installments, totalPayable)) {
      setError(
        `Installment total (${round2(installments.reduce((s, i) => s + i.netAmount, 0)).toFixed(2)}) does not match payable amount (${totalPayable.toFixed(2)}). Please adjust installment amounts.`,
      );
      return null;
    }

    setSaving(true);
    try {
      const scheduleFeeLines = feeLines.map((line, index) =>
        index === 0 && globalDiscount > 0
          ? {
              ...line,
              discountAmount: round2(line.discountAmount + globalDiscount),
              netAmount: round2(Math.max(0, line.basicAmount - line.discountAmount - globalDiscount) + line.taxAmount),
            }
          : line,
      );
      const form: ScheduleCreationForm = {
        studentId: student.RegNo,
        studentName: student.Name,
        studentRegNo: student.RegNo,
        studentManualRegNo: student.RegNo_Manual,
        studentStatus: student.Status,
        studentMobile: student.PContact,
        studentEmail: student.EmailId,
        branchId,
        curriculum: student.Curriculum,
        paymentType,
        selectedSubjects: subjects.filter((s) => selectedSubjectIds.includes(s.subId)),
        selectedCourses: courses.filter((c) => selectedCourseIds.includes(c.courseId)),
        selectedOtherFees: otherFees.filter((f) => selectedOtherFeeCodes.includes(f.of_code)),
        feeLines: scheduleFeeLines,
        globalDiscount,
        installments,
        remarks,
      };

      const saved = savedScheduleId
        ? await updateScheduleMock(savedScheduleId, {
            feeLines: scheduleFeeLines,
            installments,
            remarks,
            paymentType,
          })
        : await createScheduleMock(form);
      if (!saved) return null;
      setSavedScheduleId(saved.id);
      return saved.id;
    } catch {
      setError("Failed to create schedule. Please try again.");
      return null;
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async () => {
    const id = await persistSchedule();
    if (id) setWorkflowStep("installments");
  };

  const handleSaveAndPay = async () => {
    const id = await persistSchedule();
    if (id) onSaveAndPay(id);
  };

  const handleCreateInstallments = () => {
    const seeded = installments.length
      ? installments
      : distributeEqually(totalPayable, 3).map((amount, index) => ({
          id: `manual-${Date.now()}-${index}`,
          installmentNo: index + 1,
          installmentName: `Installment ${index + 1}`,
          dueDate: "",
          basicAmount: amount,
          discountAmount: 0,
          taxPercentage: 0,
          taxAmount: 0,
          netAmount: amount,
          paidAmount: 0,
          outstandingAmount: amount,
          outstandingWithoutTax: amount,
          status: "Pending" as const,
          remarks: "",
        }));
    const datedInstallments = seeded.map((installment, index) => ({
      ...installment,
      installmentNo: index + 1,
      dueDate: installmentStartDate ? formatScheduleDate(installmentStartDate, index, intervalMonths) : installment.dueDate,
    }));
    setInstallments(datedInstallments);
    setInitialInstallments(datedInstallments.map((installment) => ({ ...installment })));
    setWorkflowStep("installments");
  };

  const handleResetInstallments = () => {
    if (initialInstallments.length > 0) {
      setInstallments(initialInstallments.map((installment) => ({ ...installment })));
    }
  };

  const hasFeeSelection = feeLines.length > 0;
  const allSubjectIds = subjects.map((subject) => subject.subId);
  const allCourseIds = courses.map((course) => course.courseId);
  const allSelected = allSubjectIds.every((id) => selectedSubjectIds.includes(id)) && allCourseIds.every((id) => selectedCourseIds.includes(id));

  const toggleAll = () => {
    if (allSelected) {
      setSelectedSubjectIds([]);
      setSelectedCourseIds([]);
    } else {
      setSelectedSubjectIds(allSubjectIds);
      setSelectedCourseIds(allCourseIds);
    }
  };

  const handleDiscountModeChange = (mode: "Amount" | "Percent") => {
    setDiscountMode(mode);
    setGlobalDiscount(0);
  };

  return (
    <div className="pm-page pm-schedule-payment-page">
      <div className="pm-page__header pm-page__header--back-only">
        <button type="button" className="pm-btn pm-btn--ghost" onClick={onBack}><ArrowLeft className="w-4 h-4" /> Back To List</button>
      </div>
      {error && <SubjectSelectionAlert visible={true} message={error} onDismiss={() => setError(null)} />}

      <section className="pm-card pm-schedule-form-card">
        <div className="pm-form-section__header"><h3 className="pm-form-section__title">STUDENT &amp; FEE DETAILS</h3></div>
        <div className="pm-schedule-form-card__grid">
          <div className="pm-schedule-form-card__fields">
            <label className="pm-form-row pm-form-row--inline"><span className="pm-label">Student Name <i>*</i></span><input className="pm-input pm-input--readonly" readOnly value={student?.Name || ""} onClick={() => setShowStudentDialog(true)} /></label>
            <div className="pm-form-row pm-form-row--inline"><span className="pm-label">Payment Type</span><div className="pm-radio-row">{PAYMENT_TYPES.map((type) => <label key={type.value}><input type="radio" name="schedule-payment-type" checked={paymentType === type.value} onChange={() => setPaymentType(type.value)} /> {type.label}</label>)}</div></div>
            <div className="pm-form-row pm-form-row--inline"><span className="pm-label">Course Based Fees</span><strong>{formatCurrency(basePayable)}</strong></div>
            <div className="pm-form-row pm-form-row--inline"><span className="pm-label">Fee Discount</span><div className="pm-discount-control"><input className="pm-input" type="number" min="0" value={discountMode === "Percent" && basePayable > 0 ? round2((globalDiscount / basePayable) * 100) : globalDiscount} onChange={(event) => { const value = Number(event.target.value) || 0; setGlobalDiscount(discountMode === "Percent" ? round2(basePayable * value / 100) : value); }} /><label><input type="radio" checked={discountMode === "Amount"} onChange={() => handleDiscountModeChange("Amount")} /> Amount</label><label><input type="radio" checked={discountMode === "Percent"} onChange={() => handleDiscountModeChange("Percent")} /> Percent (%)</label></div></div>
            <div className="pm-form-row pm-form-row--inline"><span className="pm-label">Total Amount</span><input className="pm-input pm-input--readonly pm-schedule-total" readOnly value={formatCurrency(totalPayable)} /></div>
          </div>
          <div className="pm-schedule-subjects">
            <div className="pm-schedule-subjects__heading"><span>Courses / Subjects <i>*</i></span><label><input type="checkbox" checked={allSelected} onChange={toggleAll} /> Select All</label></div>
            <div className="pm-schedule-subjects__tree">
              {courses.map((course) => <div key={course.courseId} className="pm-schedule-subjects__course"><label><input type="checkbox" checked={selectedCourseIds.includes(course.courseId)} onChange={() => handleToggleCourse(course.courseId)} /> {course.courseName} (Inc. Tax {formatCurrency(course.courseFees)})</label>{subjects.filter((subject) => subject.courseName === course.courseName).map((subject) => <label key={subject.subId} className="pm-schedule-subjects__subject"><input type="checkbox" checked={selectedSubjectIds.includes(subject.subId)} onChange={() => handleToggleSubject(subject.subId)} /> {subject.subName}</label>)}</div>)}
              {courses.length === 0 && subjects.map((subject) => <label key={subject.subId} className="pm-schedule-subjects__subject"><input type="checkbox" checked={selectedSubjectIds.includes(subject.subId)} onChange={() => handleToggleSubject(subject.subId)} /> {subject.subName}</label>)}
            </div>
          </div>
        </div>
      </section>

      <section className="pm-card pm-schedule-form-card">
        <div className="pm-form-section__header"><h3 className="pm-form-section__title">INSTALLMENT CONFIGURATION</h3></div>
        <div className="pm-schedule-config-grid">
          <div className="pm-schedule-config-fields">
            <div className="pm-form-row pm-form-row--inline"><span className="pm-label">No. Of Installments <i>*</i></span><input className="pm-input" type="number" min="1" max={maximumInstallments} value={installments.length || 3} onChange={(event) => { const count = Math.max(1, Math.min(maximumInstallments, Number(event.target.value) || 1)); const amounts = distributeEqually(totalPayable, count); setInstallments(amounts.map((amount, index) => ({ ...(installments[index] || { id: `inst-${Date.now()}-${index}`, installmentNo: index + 1, installmentName: `Installment ${index + 1}`, dueDate: "", discountAmount: 0, taxPercentage: 0, taxAmount: 0, paidAmount: 0, outstandingWithoutTax: amount, status: "Pending" as const, remarks: "" }), basicAmount: amount, netAmount: amount, outstandingAmount: amount, outstandingWithoutTax: amount }))); }} /><span>Maximum Installments <strong>{maximumInstallments}</strong></span></div>
            <div className="pm-form-row pm-form-row--inline"><span className="pm-label">Interval</span><select className="pm-select" value={intervalMonths} onChange={(event) => setIntervalMonths(Number(event.target.value))}><option value={1}>1 Month</option><option value={3}>3 Months</option></select></div>
            <div className="pm-form-row pm-form-row--inline"><span className="pm-label">Installment Start Date <i>*</i></span><input className="pm-input" type="date" value={installmentStartDate} onChange={(event) => setInstallmentStartDate(event.target.value)} /></div>
            <button type="button" className="pm-btn pm-btn--primary" onClick={handleCreateInstallments} disabled={!hasFeeSelection || workflowStep === "installments"}>Create Installment Manually</button>
          </div>
          <label className="pm-form-group pm-schedule-remarks"><span className="pm-label">Remarks</span><textarea className="pm-textarea" maxLength={2000} rows={5} value={remarks} onChange={(event) => setRemarks(event.target.value)} /><span className="pm-character-count">{remarks.length} / 2000</span></label>
        </div>
      </section>

      {workflowStep === "installments" && hasFeeSelection && <>
        <section className="pm-card pm-schedule-manual-card"><div className="pm-form-section__header"><h3 className="pm-form-section__title">INSTALLMENT DETAILS</h3></div><InstallmentConfiguration installments={installments} initialInstallments={initialInstallments} totalPayable={totalPayable} subjectFees={calculateTotalPayable(feeLines.filter((line) => line.type !== "OtherFee"))} adjustmentSummaryAmount={globalDiscount} onChange={setInstallments} paymentType={paymentType} showHeader={false} showAdvancedControls={false} /></section>
        <ApplicableOtherFees fees={otherFees} selectedCodes={selectedOtherFeeCodes} onToggle={handleToggleOtherFee} studentName={student?.Name || "Student"} />
        <div className="pm-schedule-actions"><button type="button" className="pm-btn pm-btn--ghost" onClick={handleResetInstallments}>Reset Installments</button><button type="button" className="pm-btn pm-btn--secondary" onClick={() => setWorkflowStep("initial")}>Cancel</button><button type="button" className="pm-btn pm-btn--warning" onClick={handleSave} disabled={saving || !student || !hasFeeSelection}>Save</button><button type="button" className="pm-btn pm-btn--primary" onClick={handleSaveAndPay} disabled={saving || !student || !hasFeeSelection}>Save &amp; Pay</button></div>
      </>}
      <SubjectSelectionDialog open={showStudentDialog} branchId={branchId} onClose={() => setShowStudentDialog(false)} onSelect={(selected) => setStudent(selected)} />
    </div>
  );
};
