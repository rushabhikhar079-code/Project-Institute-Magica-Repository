import React from "react";
import { CalendarDays, Check, Clock3, Plus } from "lucide-react";
import { formatCurrency } from "../paymentCalculations";

interface PaymentSummaryCardsProps {
  totalPayable: number;
  totalPaid: number;
  totalOutstanding: number;
  activeSchedules: number;
}

interface SummaryCardProps {
  label: string;
  value: string;
  icon: React.ReactNode;
  className: string;
}

const SummaryCard: React.FC<SummaryCardProps> = ({ label, value, icon, className }) => (
  <div className={`pm-card pm-summary-card ${className}`}>
    <span className="pm-summary-card__icon">{icon}</span>
    <span className="pm-summary-card__content">
      <span className="pm-summary-card__label">{label}</span>
      <span className="pm-summary-card__value">{value}</span>
    </span>
  </div>
);

export const PaymentSummaryCards: React.FC<PaymentSummaryCardsProps> = ({
  totalPayable,
  totalPaid,
  totalOutstanding,
  activeSchedules,
}) => (
  <div className="pm-summary-cards">
    <SummaryCard label="Total Schedules" value={String(activeSchedules)} icon={<CalendarDays />} className="pm-summary-card--schedules" />
    <SummaryCard label="Total Fees" value={formatCurrency(totalPayable)} icon={<Plus />} className="pm-summary-card--fees" />
    <SummaryCard label="Total Paid" value={formatCurrency(totalPaid)} icon={<Check />} className="pm-summary-card--paid" />
    <SummaryCard label="Outstanding Balance" value={formatCurrency(totalOutstanding)} icon={<Clock3 />} className="pm-summary-card--outstanding" />
  </div>
);
