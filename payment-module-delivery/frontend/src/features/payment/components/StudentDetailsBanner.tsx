import React from "react";
import type { PaymentSchedule } from "../paymentTypes";
import { formatCurrency } from "../paymentCalculations";

interface StudentDetailsBannerProps {
  schedule: PaymentSchedule;
}

export const StudentDetailsBanner: React.FC<StudentDetailsBannerProps> = ({ schedule }) => {
  const initials = schedule.studentName.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase();
  return (
    <section className="pm-card pm-student-details-banner">
      <div className="pm-student-details-banner__title">STUDENT DETAILS</div>
      <div className="pm-student-details-banner__main">
        <div className="pm-student-details-banner__avatar">{initials}</div>
        <div className="pm-student-details-banner__identity">
          <div><span>Student Name</span><strong>{schedule.studentName}</strong></div>
          <div><span>Registration No.</span><strong>{schedule.studentRegNo}</strong></div>
        </div>
        <div className="pm-student-details-banner__metrics">
          <div><span>Payment type</span><strong>{schedule.paymentType === "LumpSum" ? "Lump Sum" : schedule.paymentType}</strong></div>
          <div><span>Final payable</span><strong>{formatCurrency(schedule.totalPayable)}</strong></div>
          <div><span>Discount</span><strong>{formatCurrency(schedule.totalDiscount)}</strong></div>
          <div><span>Tax</span><strong>{formatCurrency(schedule.totalTax)}</strong></div>
        </div>
      </div>
      <div className="pm-student-details-banner__course"><strong>Course :</strong> {schedule.courseName || "-"}<span>|</span><strong>Subjects :</strong> {schedule.subjectNames || "-"}<span>|</span><strong>Amount :</strong> {formatCurrency(schedule.totalPayable)}</div>
    </section>
  );
};
