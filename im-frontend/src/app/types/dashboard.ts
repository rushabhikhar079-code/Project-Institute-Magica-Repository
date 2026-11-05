export interface PaymentDataItem {
  name: string;
  received: number;
  outstanding: number;
}
export type PaymentPeriod = "today" | "weekly" | "monthly";
export interface PaymentApiResponse {
  status: boolean;
  message?: string;
  data: {
    label: string;
    receivedAmount: number;
    outstandingAmount: number;
  }[];
}

export interface RegistrationDataItem {
  name: string;
  value: number;
  color: string;
}
export interface RegistrationStatusApiResponse {
  status: boolean;
  message?: string;
  data: {
    totalCount: number;
    regCount: number;
    enqCount: number;
  };
}

export interface LiveNotificationData {
  birthdayCount: string;
  birthdayNames: string;
  staffBirthdays: any[];
  todayCollection: string;
  liveClasses: LiveClassItem[];
}
export interface LiveNotificationApiResponse {
  status: string;
  statusCode: number;
  message: string;
  timeStamp: string;
  error: string | null;
  data: LiveNotificationData;
}
export interface LiveClassItem {
  liveClassCount: string;
  liveClassName: string;
}
