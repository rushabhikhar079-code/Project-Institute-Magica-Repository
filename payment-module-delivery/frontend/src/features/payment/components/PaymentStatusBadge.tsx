// ─── Payment Status Badge Component ────────────────────────────────────────────
import React from "react";
import type { InstallmentStatus, ScheduleStatus } from "../paymentTypes";
import { INSTALLMENT_STATUS, SCHEDULE_STATUS } from "../paymentConstants";

interface PaymentStatusBadgeProps {
  status: InstallmentStatus | ScheduleStatus;
  type?: "installment" | "schedule";
}

export const PaymentStatusBadge: React.FC<PaymentStatusBadgeProps> = ({
  status,
  type = "installment",
}) => {
  const statusList = type === "installment" ? INSTALLMENT_STATUS : SCHEDULE_STATUS;
  const found = statusList.find((s) => s.value === status);

  if (!found) {
    return <span className="pm-badge pm-badge--default">{status}</span>;
  }

  return (
    <span
      className="pm-badge"
      style={{
        backgroundColor: `${found.color}15`,
        color: found.color,
        border: `1px solid ${found.color}30`,
      }}
    >
      {found.label}
    </span>
  );
};
