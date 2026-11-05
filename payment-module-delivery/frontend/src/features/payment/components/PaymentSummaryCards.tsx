// ─── Payment Summary Cards Component ───────────────────────────────────────────
import React from "react";
import { Wallet, TrendingUp, AlertCircle, CheckCircle } from "lucide-react";
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
  color: string;
  bgColor: string;
}

const SummaryCard: React.FC<SummaryCardProps> = ({ label, value, icon, color, bgColor }) => (
  <div className="pm-card pm-summary-card">
    <div className="pm-summary-card__icon" style={{ backgroundColor: bgColor, color }}>
      {icon}
    </div>
    <div className="pm-summary-card__content">
      <span className="pm-summary-card__label">{label}</span>
      <span className="pm-summary-card__value" style={{ color }}>
        {value}
      </span>
    </div>
  </div>
);

export const PaymentSummaryCards: React.FC<PaymentSummaryCardsProps> = ({
  totalPayable,
  totalPaid,
  totalOutstanding,
  activeSchedules,
}) => {
  return (
    <div className="pm-summary-cards">
      <SummaryCard
        label="Total Payable"
        value={formatCurrency(totalPayable)}
        icon={<Wallet className="w-5 h-5" />}
        color="#0F4C81"
        bgColor="#e0eef5"
      />
      <SummaryCard
        label="Total Collected"
        value={formatCurrency(totalPaid)}
        icon={<CheckCircle className="w-5 h-5" />}
        color="#16a34a"
        bgColor="#dcfce7"
      />
      <SummaryCard
        label="Outstanding"
        value={formatCurrency(totalOutstanding)}
        icon={<AlertCircle className="w-5 h-5" />}
        color="#dc2626"
        bgColor="#fee2e2"
      />
      <SummaryCard
        label="Active Schedules"
        value={String(activeSchedules)}
        icon={<TrendingUp className="w-5 h-5" />}
        color="#f59e0b"
        bgColor="#fef3c7"
      />
    </div>
  );
};
