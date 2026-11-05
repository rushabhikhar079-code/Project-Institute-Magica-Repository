import React from "react";
// @ts-ignore — Preview source lives outside src/ in the delivery folder; Vite resolves it at runtime
import { PreviewApp } from "../../../../payment-module-delivery/preview/src/PreviewApp";
import "../../../../payment-module-delivery/frontend/styles/payment-common.css";
import "../../../../payment-module-delivery/preview/src/preview-shell.css";

const PaymentPreview: React.FC = () => {
  return <PreviewApp />;
};

export default PaymentPreview;
