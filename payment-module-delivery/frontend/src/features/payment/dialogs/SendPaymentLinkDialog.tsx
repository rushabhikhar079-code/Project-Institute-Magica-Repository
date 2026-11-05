// ─── Send Payment Link Dialog ──────────────────────────────────────────────────
// Shows Email and WhatsApp options. Does NOT claim delivery unless the backend
// confirms it. Email service exists (SMTP) but has no payment-link URL to send.
// WhatsApp send is not implemented (Gupshup send API is TODO).
// Payment gateway / link generation does not exist.
import React, { useState } from "react";
import { X, Mail, MessageCircle, AlertTriangle } from "lucide-react";
import type { PaymentSchedule, PaymentLinkResult } from "../paymentTypes";
import { sendPaymentLinkMock } from "../paymentService";
import { formatCurrency } from "../paymentCalculations";

interface SendPaymentLinkDialogProps {
  open: boolean;
  schedule: PaymentSchedule | null;
  onClose: () => void;
}

export const SendPaymentLinkDialog: React.FC<SendPaymentLinkDialogProps> = ({
  open,
  schedule,
  onClose,
}) => {
  const [channel, setChannel] = useState<"Email" | "WhatsApp">("Email");
  const [recipient, setRecipient] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PaymentLinkResult | null>(null);

  React.useEffect(() => {
    if (schedule) {
      setRecipient(channel === "Email" ? schedule.studentEmail : schedule.studentMobile);
      setResult(null);
    }
  }, [schedule, channel]);

  if (!open || !schedule) return null;

  const handleSend = async () => {
    setLoading(true);
    setResult(null);

    try {
      const res = await sendPaymentLinkMock({
        scheduleId: schedule.id,
        channel,
        recipient,
        studentName: schedule.studentName,
        amount: schedule.totalOutstanding,
      });
      setResult(res);
    } catch (err) {
      setResult({
        success: false,
        channel,
        message: "An error occurred while attempting to send.",
        delivered: false,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pm-dialog-overlay" onClick={onClose}>
      <div className="pm-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="pm-dialog__header">
          <h3 className="pm-dialog__title">Send Payment Link</h3>
          <button type="button" className="pm-dialog__close" onClick={onClose}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="pm-dialog__body">
          <div className="pm-dialog__info-grid">
            <div className="pm-dialog__info-item">
              <span className="pm-label">Student</span>
              <span className="pm-text-semibold">{schedule.studentName}</span>
            </div>
            <div className="pm-dialog__info-item">
              <span className="pm-label">Outstanding</span>
              <span className="pm-text-semibold pm-text-danger">
                {formatCurrency(schedule.totalOutstanding)}
              </span>
            </div>
          </div>

          {/* Dependency Warning */}
          <div className="pm-dialog__notice pm-dialog__notice--info">
            <AlertTriangle className="w-4 h-4 inline mr-2" />
            Payment-link generation requires a payment gateway integration that is not yet available.
            Email service exists but cannot include a payment URL. WhatsApp message sending is not implemented.
          </div>

          <div className="pm-form-group">
            <label className="pm-label">Channel</label>
            <div className="pm-radio-group">
              <label className={`pm-radio-item ${channel === "Email" ? "pm-radio-item--selected" : ""}`}>
                <input
                  type="radio"
                  name="channel"
                  checked={channel === "Email"}
                  onChange={() => setChannel("Email")}
                />
                <Mail className="w-4 h-4" />
                Email
              </label>
              <label className={`pm-radio-item ${channel === "WhatsApp" ? "pm-radio-item--selected" : ""}`}>
                <input
                  type="radio"
                  name="channel"
                  checked={channel === "WhatsApp"}
                  onChange={() => setChannel("WhatsApp")}
                />
                <MessageCircle className="w-4 h-4" />
                WhatsApp
              </label>
            </div>
          </div>

          <div className="pm-form-group">
            <label className="pm-label">
              {channel === "Email" ? "Email Address" : "Mobile Number"}
            </label>
            <input
              type="text"
              className="pm-input"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              placeholder={channel === "Email" ? "student@example.com" : "9876543210"}
            />
          </div>

          {result && (
            <div className={`pm-dialog__notice ${result.delivered ? "pm-dialog__notice--success" : "pm-dialog__notice--error"}`}>
              <strong>{result.delivered ? "Sent" : "Not Sent"}</strong>
              <p>{result.message}</p>
            </div>
          )}
        </div>

        <div className="pm-dialog__footer">
          <button type="button" className="pm-btn pm-btn--secondary" onClick={onClose}>
            Close
          </button>
          <button
            type="button"
            className="pm-btn pm-btn--primary"
            onClick={handleSend}
            disabled={loading || !recipient}
          >
            {loading ? "Sending..." : "Send"}
          </button>
        </div>
      </div>
    </div>
  );
};
