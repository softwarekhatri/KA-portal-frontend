export enum PaymentMode {
  CASH = "CASH",
  ONLINE = "ONLINE",
}

export interface BillItem {
  id: string;
  name: string;
  weight: number;
  rate: number; // rate per 10 gram
  makingCharge: number;
  discount: number;
}

export interface Payment {
  id: string;
  amount: number;
  date: string;
  mode: PaymentMode;
  reference?: string;
}

export interface Bill {
  id: string;
  customerId: string;
  date: string;
  items: BillItem[];
  payments: Payment[];
}

export interface CustomerResponse {
  data: Customer[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface Customer {
  _id?: string;
  name: string;
  phone: string[];
  address: string;
  totalBills?: number;
  totalDues?: number;
}
