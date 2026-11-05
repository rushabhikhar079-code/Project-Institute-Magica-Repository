import React, { useEffect, useState } from "react";
import { Check, Link2, Mail, MessageCircle, Send, X } from "lucide-react";
import type { PaymentSchedule, PaymentLinkResult } from "../paymentTypes";
import { sendPaymentLinkMock } from "../paymentService";
import { formatCurrency } from "../paymentCalculations";

interface SendPaymentLinkDialogProps {
  open: boolean;
  schedule: PaymentSchedule | null;
  onClose: () => void;
}

export const SendPaymentLinkDialog: React.FC<SendPaymentLinkDialogProps> = ({ open, schedule, onClose }) => {
  const [emailSelected, setEmailSelected] = useState(false);
  const [whatsAppSelected, setWhatsAppSelected] = useState(true);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PaymentLinkResult | null>(null);

  useEffect(() => {
    if (!schedule) return;
    setEmailSelected(false);
    setWhatsAppSelected(true);
    setResult(null);
  }, [schedule]);

  if (!open || !schedule) return null;

  const handleSend = async () => {
    const channel = emailSelected ? "Email" : whatsAppSelected ? "WhatsApp" : null;
    if (!channel) return;
    setLoading(true);
    setResult(null);
    try {
      setResult(await sendPaymentLinkMock({
        scheduleId: schedule.id,
        channel,
        recipient: channel === "Email" ? schedule.studentEmail : schedule.studentMobile,
        studentName: schedule.studentName,
        amount: schedule.totalOutstanding,
      }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pm-dialog-overlay" onClick={onClose}>
      <div className="pm-dialog pm-send-link-dialog" onClick={(event) => event.stopPropagation()}>
        <div className="pm-dialog__header">
          <div className="pm-dialog__heading"><Link2 className="w-5 h-5" /><div><h3 className="pm-dialog__title">Send Payment Link</h3><p className="pm-dialog__subtitle">Share the payment link with the student to complete the payment.</p></div></div>
          <button type="button" className="pm-dialog__close" onClick={onClose} aria-label="Close"><X className="w-5 h-5" /></button>
        </div>
        <div className="pm-dialog__body pm-send-link-dialog__body">
          <div className="pm-send-link-dialog__grid">
            <div>
              <div className="pm-send-link-dialog__course"><span className="pm-send-link-dialog__icon"><Link2 /></span><div><small>Course Name</small><strong>{schedule.courseName || "Course New"}</strong></div><div><small>Amount</small><strong>{formatCurrency(schedule.totalOutstanding)}</strong></div></div>
              <div className="pm-send-link-dialog__section-label"><Send /> <strong>Select sharing options</strong><span>Choose how you want to send the payment link.</span></div>
              <div className="pm-send-link-dialog__options">
                <label><span className="pm-send-link-dialog__option-icon pm-send-link-dialog__option-icon--email"><Mail /></span><input type="checkbox" checked={emailSelected} onChange={(event) => setEmailSelected(event.target.checked)} /><span><strong>Email</strong><small>send the payment link via email to the student.</small></span></label>
                <label><span className="pm-send-link-dialog__option-icon pm-send-link-dialog__option-icon--whatsapp"><MessageCircle /></span><input type="checkbox" checked={whatsAppSelected} onChange={(event) => setWhatsAppSelected(event.target.checked)} /><span><strong>Whats app</strong><small>send the payment link via WhatsApp to the student.</small></span></label>
              </div>
            </div>
            <div className="pm-send-link-dialog__status">
              <div className="pm-send-link-dialog__illustration"><Link2 /></div>
              <div className={result?.delivered ? "pm-dialog__notice pm-dialog__notice--success" : "pm-send-link-dialog__ready"}><Check /><div><strong>{result ? (result.delivered ? "Sent" : "Not sent") : "Ready to send"}</strong><p>{result?.message || "The payment link will be sent to the student via WhatsApp. Make sure the correct mobile number is on the file."}</p></div></div>
            </div>
          </div>
        </div>
        <div className="pm-dialog__footer"><button type="button" className="pm-btn pm-btn--primary" onClick={handleSend} disabled={loading || (!emailSelected && !whatsAppSelected)}><Send />{loading ? "Sending..." : "Send"}</button></div>
      </div>
    </div>
  );
};
