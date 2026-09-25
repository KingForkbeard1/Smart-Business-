export type BusinessPreset = 'grocery' | 'cafe' | 'hardware';

export interface MpesaConfig {
  enabled: boolean;
  businessType: 'till' | 'paybill' | 'pochi' | 'phone';
  receivingPhone: string; // e.g. "0757329235"
  ownerName: string; // e.g. "Victor Mwangi"
  shortcode: string;
  accountReference: string;
  passkey: string;
  consumerKey: string;
  consumerSecret: string;
  environment: 'sandbox' | 'production';
}

export interface BusinessSettings {
  businessName: string;
  businessType: BusinessPreset;
  currency: string;
  currencySymbol: string;
  taxRate: number; // e.g. 0.08 for 8%
  taxName: string; // e.g. "VAT" or "Sales Tax"
  address: string;
  phone: string;
  email: string;
  receiptFooter: string;
  mpesa?: MpesaConfig;
}

export interface UserRole {
  id: string;
  name: string;
  email: string;
  role: 'Owner' | 'Manager' | 'Cashier' | 'Accountant';
  avatarBg: string;
}

export interface ProductCategory {
  id: string;
  name: string;
  icon: string;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  barcode: string;
  categoryId: string;
  costPrice: number;
  salePrice: number;
  stockOnHand: number;
  minThreshold: number;
  unit: string; // "units", "kg", "pcs", "cups"
  imageUrl?: string;
  active: boolean;
}

export interface StockMovement {
  id: string;
  productId: string;
  productName: string;
  date: string;
  type: 'sale' | 'purchase' | 'adjustment' | 'return';
  quantityChange: number; // + or -
  newBalance: number;
  reference: string; // e.g. "POS/2026/001" or "PO-1002"
  performedBy: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  discountPercent: number;
  taxRate: number;
}

export interface POSSession {
  id: string;
  openedAt: string;
  closedAt?: string;
  openedBy: string;
  openingFloat: number;
  cashSalesTotal: number;
  cardSalesTotal: number;
  mobileSalesTotal: number;
  ordersCount: number;
  status: 'open' | 'closed';
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  company?: string;
  street: string;
  city: string;
  balanceDue: number;
  totalSpent: number;
  ordersCount: number;
}

export type SalesOrderStatus = 'quotation' | 'quotation_sent' | 'sales_order' | 'invoiced' | 'cancelled';

export interface OrderLine {
  productId: string;
  productName: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  subtotal: number;
}

export interface SalesOrder {
  id: string;
  reference: string; // e.g. "SO/2026/004"
  customerId: string;
  customerName: string;
  date: string;
  lines: OrderLine[];
  subtotal: number;
  taxTotal: number;
  total: number;
  status: SalesOrderStatus;
  paymentMethod?: 'cash' | 'card' | 'mobile' | 'credit';
  mpesaReceiptNumber?: string;
  mpesaPhoneNumber?: string;
  source: 'pos' | 'sales_order';
  invoiceId?: string;
}

export type PurchaseOrderStatus = 'draft_rfq' | 'rfq_sent' | 'purchase_order' | 'received' | 'billed' | 'cancelled';

export interface Vendor {
  id: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  paymentTerms: string;
}

export interface PurchaseOrderLine {
  productId: string;
  productName: string;
  quantity: number;
  unitCost: number;
  subtotal: number;
}

export interface PurchaseOrder {
  id: string;
  reference: string; // e.g. "PO/2026/012"
  vendorId: string;
  vendorName: string;
  orderDate: string;
  expectedDate: string;
  lines: PurchaseOrderLine[];
  subtotal: number;
  taxTotal: number;
  total: number;
  status: PurchaseOrderStatus;
  productsReceived: boolean;
  billed: boolean;
  billId?: string;
}

export type InvoiceStatus = 'draft' | 'posted' | 'paid' | 'overdue' | 'cancelled';
export type InvoiceType = 'customer_invoice' | 'vendor_bill';

export interface Invoice {
  id: string;
  reference: string; // "INV/2026/001" or "BILL/2026/001"
  type: InvoiceType;
  partnerId: string; // Customer or Vendor ID
  partnerName: string;
  date: string;
  dueDate: string;
  amountUntaxed: number;
  amountTax: number;
  amountTotal: number;
  amountPaid: number;
  status: InvoiceStatus;
  origin?: string; // e.g. "SO/2026/004" or "PO/2026/012"
  paymentMethod?: string;
  mpesaReceiptNumber?: string;
}

export type LeadStage = 'new' | 'qualified' | 'proposition' | 'won' | 'lost';

export interface CRMLead {
  id: string;
  title: string;
  customerId?: string;
  contactName: string;
  email: string;
  phone: string;
  expectedRevenue: number;
  probability: number;
  stage: LeadStage;
  priority: 'low' | 'medium' | 'high';
  notes: string;
  createdDate: string;
}

export interface Employee {
  id: string;
  name: string;
  role: string;
  department: string;
  hourlyRate: number;
  email: string;
  phone: string;
  isClockedIn: boolean;
  lastClockIn?: string;
  avatarBg: string;
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  date: string;
  clockInTime: string;
  clockOutTime?: string;
  durationHours?: number;
}

export type CurrencyCode = 'KES' | 'USD' | 'EUR';

export type SystemMode = 'local_retail' | 'enterprise_erp';

export interface BranchLocation {
  id: string;
  name: string;
  code: string;
  city: string;
  type: 'flagship' | 'branch' | 'warehouse' | 'port_hub';
  manager: string;
  phone: string;
}

export interface GeneralLedgerEntry {
  id: string;
  date: string;
  accountCode: string;
  accountName: string;
  type: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense';
  debit: number;
  credit: number;
  reference: string;
  memo: string;
  branchId?: string;
}

export type AppId = 
  | 'pos'
  | 'inventory'
  | 'sales'
  | 'purchases'
  | 'crm'
  | 'accounting'
  | 'employees'
  | 'settings';
