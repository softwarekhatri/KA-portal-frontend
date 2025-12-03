// API response for bills
export interface BillApiResponse {
  data: Bill[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export enum PaymentMode {
  CASH = "CASH",
  ONLINE = "ONLINE",
  DISCOUNT = "DISCOUNT",
}

export interface BillItem {
  name: string;
  weightInGrams: number;
  ratePer10g: number; // rate per 10 gram
  makingCharge: number;
  makingChargeType: MakingChargeType;
  discount?: number;
  totalPrice: number;
}

export interface Payment {
  amountPaid: number;
  paymentMode: PaymentMode;
  paymentDate: Date;
  referenceId?: string;
}

export interface Bill {
  _id?: string;
  customerId: string;
  billDate: Date;
  items: BillItem[];
  payments: Payment[];
  totalAmount: number;
  balanceDues: number;
  createdAt?: string;
  updatedAt?: string;
  customer?: Customer;
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

export enum MakingChargeType {
  FIXED = "FIXED",
  PER_GRAM = "PER_GRAM",
  PERCENTAGE = "PERCENTAGE",
}
