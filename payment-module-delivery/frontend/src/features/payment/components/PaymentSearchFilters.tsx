// ─── Payment Search Filters Component ──────────────────────────────────────────
import React, { useState } from "react";
import { Search, X } from "lucide-react";
import type { PaymentSearchRequest } from "../paymentTypes";
import { PAYMENT_TYPES, SCHEDULE_STATUS } from "../paymentConstants";

interface PaymentSearchFiltersProps {
  onSearch: (request: PaymentSearchRequest) => void;
  onReset: () => void;
  branchId: number;
}

export const PaymentSearchFilters: React.FC<PaymentSearchFiltersProps> = ({
  onSearch,
  onReset,
  branchId,
}) => {
  const [studentName, setStudentName] = useState("");
  const [regNo, setRegNo] = useState("");
  const [paymentType, setPaymentType] = useState<string>("");
  const [status, setStatus] = useState<string>("");

  const handleSearch = () => {
    onSearch({
      studentName,
      regNo,
      paymentType: paymentType as PaymentSearchRequest["paymentType"],
      status: status as PaymentSearchRequest["status"],
      branchId,
      pageNumber: 1,
      pageSize: 10,
      sortBy: null,
      sortDirection: null,
    });
  };

  const handleReset = () => {
    setStudentName("");
    setRegNo("");
    setPaymentType("");
    setStatus("");
    onReset();
  };

  return (
    <div className="pm-card pm-search-filters">
      <div className="pm-search-filters__row">
        <div className="pm-form-group">
          <label className="pm-label">Student Name</label>
          <input
            type="text"
            className="pm-input"
            placeholder="Search by student name"
            value={studentName}
            onChange={(e) => setStudentName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
        </div>
        <div className="pm-form-group">
          <label className="pm-label">Reg. No.</label>
          <input
            type="text"
            className="pm-input"
            placeholder="Search by registration no."
            value={regNo}
            onChange={(e) => setRegNo(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
        </div>
        <div className="pm-form-group">
          <label className="pm-label">Payment Type</label>
          <select
            className="pm-select"
            value={paymentType}
            onChange={(e) => setPaymentType(e.target.value)}
          >
            <option value="">All Types</option>
            {PAYMENT_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
        <div className="pm-form-group">
          <label className="pm-label">Status</label>
          <select
            className="pm-select"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="">All Status</option>
            {SCHEDULE_STATUS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
        <div className="pm-search-filters__actions">
          <button type="button" className="pm-btn pm-btn--primary" onClick={handleSearch}>
            <Search className="w-4 h-4" />
            Search
          </button>
          <button type="button" className="pm-btn pm-btn--secondary" onClick={handleReset}>
            <X className="w-4 h-4" />
            Clear
          </button>
        </div>
      </div>
    </div>
  );
};
