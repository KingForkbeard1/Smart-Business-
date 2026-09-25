import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  AppId,
  BusinessPreset,
  BusinessSettings,
  ProductCategory,
  Product,
  Customer,
  Vendor,
  SalesOrder,
  SalesOrderStatus,
  PurchaseOrder,
  Invoice,
  CRMLead,
  LeadStage,
  Employee,
  AttendanceRecord,
  StockMovement,
  POSSession,
  CartItem,
  UserRole,
  BranchLocation,
  SystemMode,
  CurrencyCode
} from '../types';
import { PRESETS } from '../data/mockData';

export const USER_ROLES: UserRole[] = [
  { id: 'user-01', name: 'Victor Mwangi', email: 'mwangivictor30@gmail.com', role: 'Owner', avatarBg: 'bg-blue-800' },
  { id: 'user-02', name: 'Sarah Njeri, CPA', email: 'sarah.njeri@apex.co.ke', role: 'Manager', avatarBg: 'bg-blue-600' },
  { id: 'user-03', name: 'David Kipkorir', email: 'david.k@apex.co.ke', role: 'Manager', avatarBg: 'bg-sky-700' },
  { id: 'user-04', name: 'Faith Achieng', email: 'faith.a@apex.co.ke', role: 'Cashier', avatarBg: 'bg-indigo-600' }
];

export const BRANCH_LOCATIONS: BranchLocation[] = [
  { id: 'branch-hq', name: 'Nairobi CBD Flagship Store', code: 'HQ-01', city: 'Nairobi', type: 'flagship', manager: 'Victor Mwangi', phone: '+254 757 329 235' },
  { id: 'branch-westlands', name: 'Westlands Premium Retail', code: 'BR-02', city: 'Nairobi', type: 'branch', manager: 'Sarah Njeri', phone: '+254 722 890 123' },
  { id: 'branch-industrial', name: 'Central Warehouse & Hub', code: 'WH-01', city: 'Nairobi', type: 'warehouse', manager: 'David Kipkorir', phone: '+254 733 456 789' },
  { id: 'branch-mombasa', name: 'Mombasa Coastal Depot', code: 'HB-03', city: 'Mombasa', type: 'port_hub', manager: 'Omar Salim', phone: '+254 711 654 321' }
];

interface BusinessContextType {
  // Navigation & Shell
  currentApp: AppId;
  setCurrentApp: (app: AppId) => void;
  isAppLauncherOpen: boolean;
  openAppLauncher: () => void;
  closeAppLauncher: () => void;
  toggleAppLauncher: () => void;
  isGithubModalOpen: boolean;
  openGithubModal: () => void;
  closeGithubModal: () => void;
  toggleGithubModal: () => void;

  // Active User & Branch Management (Enterprise)
  currentUser: UserRole;
  setCurrentUser: (user: UserRole) => void;
  userRoles: UserRole[];
  branches: BranchLocation[];
  currentBranch: BranchLocation;
  setCurrentBranch: (branch: BranchLocation) => void;
  systemMode: SystemMode;
  setSystemMode: (mode: SystemMode) => void;
  activeCurrency: CurrencyCode;
  setActiveCurrency: (cur: CurrencyCode) => void;

  // Settings & Presets
  settings: BusinessSettings;
  updateSettings: (newSettings: Partial<BusinessSettings>) => void;
  switchPreset: (preset: BusinessPreset) => void;
  formatCurrency: (amount: number, overrideCurrency?: CurrencyCode) => string;

  // POS
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  cartSubtotal: number;
  cartTaxTotal: number;
  cartTotal: number;
  selectedCustomer: Customer;
  setSelectedCustomer: (customer: Customer) => void;
  currentSession: POSSession;
  openNewSession: (openingFloat: number) => void;
  closeCurrentSession: () => void;
  processPosSale: (
    paymentMethod: 'cash' | 'card' | 'mobile',
    cashTendered?: number,
    mpesaDetails?: { receiptNumber: string; phoneNumber: string }
  ) => { order: SalesOrder; changeDue: number };

  // Products & Inventory
  categories: ProductCategory[];
  products: Product[];
  stockMovements: StockMovement[];
  addProduct: (product: Omit<Product, 'id'>) => Product;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  adjustStock: (productId: string, newQuantity: number, reason: string) => void;

  // Sales Orders & Quotations
  salesOrders: SalesOrder[];
  createSalesOrder: (order: Partial<SalesOrder>) => SalesOrder;
  updateSalesOrderStatus: (orderId: string, status: SalesOrderStatus) => void;
  createInvoiceFromSalesOrder: (orderId: string) => Invoice | null;

  // Purchases & Vendors
  purchaseOrders: PurchaseOrder[];
  vendors: Vendor[];
  createPurchaseOrder: (po: Partial<PurchaseOrder>) => PurchaseOrder;
  receivePurchaseOrder: (poId: string) => void;
  createBillFromPurchaseOrder: (poId: string) => Invoice | null;

  // Accounting & Invoices
  invoices: Invoice[];
  registerInvoicePayment: (invoiceId: string, amount: number, method: string, mpesaReceiptNumber?: string) => void;
  financialMetrics: {
    totalSalesRevenue: number;
    totalExpenses: number;
    grossProfit: number;
    accountsReceivable: number;
    accountsPayable: number;
    unpaidInvoicesCount: number;
  };

  // CRM
  leads: CRMLead[];
  customers: Customer[];
  createLead: (lead: Partial<CRMLead>) => CRMLead;
  updateLeadStage: (leadId: string, stage: LeadStage) => void;
  addCustomer: (customer: Partial<Customer>) => Customer;
  updateCustomer: (id: string, updates: Partial<Customer>) => void;

  // Employees & Attendance
  employees: Employee[];
  attendance: AttendanceRecord[];
  clockInOut: (employeeId: string) => void;
  addEmployee: (emp: Partial<Employee>) => Employee;

  // Data Management
  exportDataJson: () => string;
  importDataJson: (jsonStr: string) => boolean;
  resetAllData: () => void;
}

const STORAGE_KEY = 'odoo_local_business_erp_kes_v5';

const BusinessContext = createContext<BusinessContextType | undefined>(undefined);

export const BusinessProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentApp, setCurrentApp] = useState<AppId>('pos');
  const [isAppLauncherOpen, setIsAppLauncherOpen] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<UserRole>(USER_ROLES[0]);
  const [currentBranch, setCurrentBranch] = useState<BranchLocation>(BRANCH_LOCATIONS[0]);
  const [systemMode, setSystemMode] = useState<SystemMode>('enterprise_erp');
  const [activeCurrency, setActiveCurrency] = useState<CurrencyCode>('KES');

  // Load from local storage or initialize with default Kenyan grocery preset
  const [state, setState] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.settings) {
          // Always ensure Kenyan Shillings
          parsed.settings.currencySymbol = 'KSh ';
          parsed.settings.currency = 'KES';
          parsed.settings.taxName = parsed.settings.taxName || '16% VAT';
          parsed.settings.taxRate = parsed.settings.taxRate || 0.16;

          if (!parsed.settings.mpesa) {
            parsed.settings.mpesa = {
              enabled: true,
              businessType: 'phone',
              receivingPhone: '0757329235',
              ownerName: 'Victor Mwangi',
              shortcode: '0757329235',
              accountReference: 'GREENLEAF',
              passkey: 'bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919',
              consumerKey: '',
              consumerSecret: '',
              environment: 'sandbox'
            };
          } else {
            parsed.settings.mpesa.receivingPhone = parsed.settings.mpesa.receivingPhone || '0757329235';
            parsed.settings.mpesa.ownerName = parsed.settings.mpesa.ownerName || 'Victor Mwangi';
          }
          return parsed;
        }
      }
    } catch {
      // Fallback
    }
    return PRESETS.grocery;
  });

  // State slices
  const settings: BusinessSettings = state.settings;
  const categories: ProductCategory[] = state.categories;
  const products: Product[] = state.products;
  const customers: Customer[] = state.customers;
  const vendors: Vendor[] = state.vendors;
  const salesOrders: SalesOrder[] = state.salesOrders;
  const purchaseOrders: PurchaseOrder[] = state.purchaseOrders;
  const invoices: Invoice[] = state.invoices;
  const leads: CRMLead[] = state.leads;
  const employees: Employee[] = state.employees;
  const attendance: AttendanceRecord[] = state.attendance;
  const stockMovements: StockMovement[] = state.stockMovements;
  const currentSession: POSSession = state.currentSession;

  // Save to localStorage whenever state changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.error('Failed to save to localStorage', e);
    }
  }, [state]);

  // POS Cart State (transient for current cashier interaction)
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer>(() => {
    const walkin = customers.find(c => c.id === 'cust-walkin') || customers[0];
    return walkin;
  });

  // Format currency helper (Kenyan Shillings default, with live multi-currency conversion for enterprise B2B)
  const formatCurrency = (amount: number, overrideCurrency?: CurrencyCode): string => {
    const cur = overrideCurrency || activeCurrency;
    const num = Number(amount || 0);
    if (cur === 'USD') {
      const converted = num / 130;
      return `$${converted.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    if (cur === 'EUR') {
      const converted = num / 142;
      return `€${converted.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    // Default KES
    const symbol = settings?.currencySymbol || 'KSh ';
    return `${symbol}${num.toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const openAppLauncher = () => setIsAppLauncherOpen(true);
  const closeAppLauncher = () => setIsAppLauncherOpen(false);
  const toggleAppLauncher = () => setIsAppLauncherOpen(prev => !prev);

  // Settings
  const updateSettings = (newSettings: Partial<BusinessSettings>) => {
    setState((prev: any) => ({
      ...prev,
      settings: { ...prev.settings, ...newSettings }
    }));
  };

  const switchPreset = (preset: BusinessPreset) => {
    const targetData = PRESETS[preset] || PRESETS.grocery;
    setState(JSON.parse(JSON.stringify(targetData)));
    setCart([]);
    const walkin = targetData.customers.find(c => c.id === 'cust-walkin') || targetData.customers[0];
    setSelectedCustomer(walkin);
  };

  const resetAllData = () => {
    switchPreset(settings.businessType || 'grocery');
  };

  // Cart operations
  const addToCart = (product: Product, quantity = 1) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, {
        product,
        quantity,
        discountPercent: 0,
        taxRate: settings.taxRate
      }];
    });
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(prev => prev.map(item =>
      item.product.id === productId ? { ...item, quantity } : item
    ));
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };

  const clearCart = () => setCart([]);

  // Cart totals
  const cartSubtotal = useMemo(() => {
    return cart.reduce((sum, item) => {
      const linePrice = item.product.salePrice * item.quantity;
      const discount = linePrice * (item.discountPercent / 100);
      return sum + (linePrice - discount);
    }, 0);
  }, [cart]);

  const cartTaxTotal = useMemo(() => {
    return cartSubtotal * settings.taxRate;
  }, [cartSubtotal, settings.taxRate]);

  const cartTotal = useMemo(() => {
    return cartSubtotal + cartTaxTotal;
  }, [cartSubtotal, cartTaxTotal]);

  // POS Session operations
  const openNewSession = (openingFloat: number) => {
    const newSession: POSSession = {
      id: `pos-sess-${Date.now().toString().slice(-4)}`,
      openedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      openedBy: currentUser.name,
      openingFloat,
      cashSalesTotal: 0,
      cardSalesTotal: 0,
      mobileSalesTotal: 0,
      ordersCount: 0,
      status: 'open'
    };
    setState((prev: any) => ({ ...prev, currentSession: newSession }));
  };

  const closeCurrentSession = () => {
    setState((prev: any) => ({
      ...prev,
      currentSession: {
        ...prev.currentSession,
        closedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
        status: 'closed'
      }
    }));
  };

  // Process POS Sale:
  // 1. Creates Sales Order with source: 'pos'
  // 2. Decrements Product stockOnHand
  // 3. Appends StockMovement
  // 4. Updates POS session sales totals
  // 5. Appends paid Customer Invoice to Accounting
  // 6. Updates Customer totalSpent
  const processPosSale = (
    paymentMethod: 'cash' | 'card' | 'mobile',
    cashTendered = cartTotal,
    mpesaDetails?: { receiptNumber: string; phoneNumber: string }
  ) => {
    const changeDue = Math.max(0, cashTendered - cartTotal);
    const orderRef = `POS/${new Date().getFullYear()}/${(salesOrders.length + 1).toString().padStart(4, '0')}`;
    const invoiceRef = `INV/${new Date().getFullYear()}/${(invoices.length + 1).toString().padStart(4, '0')}`;
    const invoiceId = `inv-${Date.now()}`;
    const orderId = `so-${Date.now()}`;
    const dateStr = new Date().toISOString().slice(0, 10);
    const timeStr = new Date().toISOString().replace('T', ' ').slice(0, 16);

    const orderLines = cart.map(item => ({
      productId: item.product.id,
      productName: item.product.name,
      sku: item.product.sku,
      quantity: item.quantity,
      unitPrice: item.product.salePrice,
      taxRate: settings.taxRate,
      subtotal: (item.product.salePrice * item.quantity) * (1 - item.discountPercent / 100)
    }));

    const newOrder: SalesOrder = {
      id: orderId,
      reference: orderRef,
      customerId: selectedCustomer.id,
      customerName: selectedCustomer.name,
      date: dateStr,
      lines: orderLines,
      subtotal: cartSubtotal,
      taxTotal: cartTaxTotal,
      total: cartTotal,
      status: 'invoiced',
      paymentMethod,
      mpesaReceiptNumber: mpesaDetails?.receiptNumber,
      mpesaPhoneNumber: mpesaDetails?.phoneNumber,
      source: 'pos',
      invoiceId
    };

    const newInvoice: Invoice = {
      id: invoiceId,
      reference: invoiceRef,
      type: 'customer_invoice',
      partnerId: selectedCustomer.id,
      partnerName: selectedCustomer.name,
      date: dateStr,
      dueDate: dateStr,
      amountUntaxed: cartSubtotal,
      amountTax: cartTaxTotal,
      amountTotal: cartTotal,
      amountPaid: cartTotal,
      status: 'paid',
      origin: orderRef,
      paymentMethod: paymentMethod === 'mobile' ? 'M-PESA STK PUSH' : paymentMethod.toUpperCase(),
      mpesaReceiptNumber: mpesaDetails?.receiptNumber
    };

    // Prepare stock movements and updated products
    const newMovements: StockMovement[] = [];
    const updatedProducts = products.map(prod => {
      const inCart = cart.find(c => c.product.id === prod.id);
      if (inCart) {
        const newBalance = Math.max(0, prod.stockOnHand - inCart.quantity);
        newMovements.push({
          id: `sm-${Date.now()}-${prod.id}`,
          productId: prod.id,
          productName: prod.name,
          date: timeStr,
          type: 'sale',
          quantityChange: -inCart.quantity,
          newBalance,
          reference: orderRef,
          performedBy: currentUser.name
        });
        return { ...prod, stockOnHand: newBalance };
      }
      return prod;
    });

    // Update customer stats
    const updatedCustomers = customers.map(c => {
      if (c.id === selectedCustomer.id) {
        return {
          ...c,
          totalSpent: c.totalSpent + cartTotal,
          ordersCount: c.ordersCount + 1
        };
      }
      return c;
    });

    // Update POS Session
    const updatedSession: POSSession = {
      ...currentSession,
      ordersCount: (currentSession.ordersCount || 0) + 1,
      cashSalesTotal: paymentMethod === 'cash' ? (currentSession.cashSalesTotal || 0) + cartTotal : (currentSession.cashSalesTotal || 0),
      cardSalesTotal: paymentMethod === 'card' ? (currentSession.cardSalesTotal || 0) + cartTotal : (currentSession.cardSalesTotal || 0),
      mobileSalesTotal: paymentMethod === 'mobile' ? (currentSession.mobileSalesTotal || 0) + cartTotal : (currentSession.mobileSalesTotal || 0)
    };

    setState((prev: any) => ({
      ...prev,
      products: updatedProducts,
      stockMovements: [...newMovements, ...prev.stockMovements],
      salesOrders: [newOrder, ...prev.salesOrders],
      invoices: [newInvoice, ...prev.invoices],
      customers: updatedCustomers,
      currentSession: updatedSession
    }));

    clearCart();

    return { order: newOrder, changeDue };
  };

  // Product Operations
  const addProduct = (prodData: Omit<Product, 'id'>): Product => {
    const id = `prod-${Date.now()}`;
    const newProduct: Product = { ...prodData, id };
    const timeStr = new Date().toISOString().replace('T', ' ').slice(0, 16);

    const initialMovement: StockMovement = {
      id: `sm-${Date.now()}`,
      productId: id,
      productName: newProduct.name,
      date: timeStr,
      type: 'adjustment',
      quantityChange: newProduct.stockOnHand,
      newBalance: newProduct.stockOnHand,
      reference: 'INITIAL-STOCK',
      performedBy: currentUser.name
    };

    setState((prev: any) => ({
      ...prev,
      products: [newProduct, ...prev.products],
      stockMovements: [initialMovement, ...prev.stockMovements]
    }));
    return newProduct;
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    setState((prev: any) => ({
      ...prev,
      products: prev.products.map((p: Product) => (p.id === id ? { ...p, ...updates } : p))
    }));
  };

  const deleteProduct = (id: string) => {
    setState((prev: any) => ({
      ...prev,
      products: prev.products.filter((p: Product) => p.id !== id)
    }));
  };

  const adjustStock = (productId: string, newQuantity: number, reason: string) => {
    const prod = products.find(p => p.id === productId);
    if (!prod) return;
    const diff = newQuantity - prod.stockOnHand;
    const timeStr = new Date().toISOString().replace('T', ' ').slice(0, 16);

    const movement: StockMovement = {
      id: `sm-${Date.now()}`,
      productId: prod.id,
      productName: prod.name,
      date: timeStr,
      type: 'adjustment',
      quantityChange: diff,
      newBalance: newQuantity,
      reference: reason || 'STOCK-ADJUSTMENT',
      performedBy: currentUser.name
    };

    setState((prev: any) => ({
      ...prev,
      products: prev.products.map((p: Product) => (p.id === productId ? { ...p, stockOnHand: newQuantity } : p)),
      stockMovements: [movement, ...prev.stockMovements]
    }));
  };

  // Sales Order Operations
  const createSalesOrder = (orderData: Partial<SalesOrder>): SalesOrder => {
    const ref = `SO/${new Date().getFullYear()}/${(salesOrders.length + 1).toString().padStart(4, '0')}`;
    const id = `so-${Date.now()}`;
    const newOrder: SalesOrder = {
      id,
      reference: ref,
      customerId: orderData.customerId || customers[0].id,
      customerName: orderData.customerName || customers[0].name,
      date: new Date().toISOString().slice(0, 10),
      lines: orderData.lines || [],
      subtotal: orderData.subtotal || 0,
      taxTotal: orderData.taxTotal || 0,
      total: orderData.total || 0,
      status: orderData.status || 'quotation',
      source: 'sales_order'
    };

    setState((prev: any) => ({
      ...prev,
      salesOrders: [newOrder, ...prev.salesOrders]
    }));
    return newOrder;
  };

  const updateSalesOrderStatus = (orderId: string, status: SalesOrderStatus) => {
    setState((prev: any) => ({
      ...prev,
      salesOrders: prev.salesOrders.map((so: SalesOrder) => (so.id === orderId ? { ...so, status } : so))
    }));
  };

  const createInvoiceFromSalesOrder = (orderId: string): Invoice | null => {
    const order = salesOrders.find(so => so.id === orderId);
    if (!order) return null;

    const invoiceRef = `INV/${new Date().getFullYear()}/${(invoices.length + 1).toString().padStart(4, '0')}`;
    const invoiceId = `inv-${Date.now()}`;
    const dateStr = new Date().toISOString().slice(0, 10);

    const newInvoice: Invoice = {
      id: invoiceId,
      reference: invoiceRef,
      type: 'customer_invoice',
      partnerId: order.customerId,
      partnerName: order.customerName,
      date: dateStr,
      dueDate: new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10),
      amountUntaxed: order.subtotal,
      amountTax: order.taxTotal,
      amountTotal: order.total,
      amountPaid: 0,
      status: 'posted',
      origin: order.reference
    };

    setState((prev: any) => ({
      ...prev,
      invoices: [newInvoice, ...prev.invoices],
      salesOrders: prev.salesOrders.map((so: SalesOrder) =>
        so.id === orderId ? { ...so, status: 'invoiced', invoiceId } : so
      )
    }));
    return newInvoice;
  };

  // Purchases & Supplier Operations
  const createPurchaseOrder = (poData: Partial<PurchaseOrder>): PurchaseOrder => {
    const ref = `PO/${new Date().getFullYear()}/${(purchaseOrders.length + 1).toString().padStart(4, '0')}`;
    const id = `po-${Date.now()}`;
    const newPO: PurchaseOrder = {
      id,
      reference: ref,
      vendorId: poData.vendorId || vendors[0]?.id || '',
      vendorName: poData.vendorName || vendors[0]?.name || '',
      orderDate: new Date().toISOString().slice(0, 10),
      expectedDate: new Date(Date.now() + 5 * 86400000).toISOString().slice(0, 10),
      lines: poData.lines || [],
      subtotal: poData.subtotal || 0,
      taxTotal: poData.taxTotal || 0,
      total: poData.total || 0,
      status: poData.status || 'draft_rfq',
      productsReceived: false,
      billed: false
    };

    setState((prev: any) => ({
      ...prev,
      purchaseOrders: [newPO, ...prev.purchaseOrders]
    }));
    return newPO;
  };

  // Receive Products: Increments stock in Inventory!
  const receivePurchaseOrder = (poId: string) => {
    const po = purchaseOrders.find(p => p.id === poId);
    if (!po || po.productsReceived) return;

    const timeStr = new Date().toISOString().replace('T', ' ').slice(0, 16);
    const newMovements: StockMovement[] = [];

    const updatedProducts = products.map(prod => {
      const line = po.lines.find(l => l.productId === prod.id);
      if (line) {
        const newBalance = prod.stockOnHand + line.quantity;
        newMovements.push({
          id: `sm-${Date.now()}-${prod.id}`,
          productId: prod.id,
          productName: prod.name,
          date: timeStr,
          type: 'purchase',
          quantityChange: line.quantity,
          newBalance,
          reference: po.reference,
          performedBy: currentUser.name
        });
        return { ...prod, stockOnHand: newBalance };
      }
      return prod;
    });

    setState((prev: any) => ({
      ...prev,
      products: updatedProducts,
      stockMovements: [...newMovements, ...prev.stockMovements],
      purchaseOrders: prev.purchaseOrders.map((p: PurchaseOrder) =>
        p.id === poId ? { ...p, productsReceived: true, status: 'received' } : p
      )
    }));
  };

  // Create Bill from PO: creates vendor bill in Accounting!
  const createBillFromPurchaseOrder = (poId: string): Invoice | null => {
    const po = purchaseOrders.find(p => p.id === poId);
    if (!po || po.billed) return null;

    const billRef = `BILL/${new Date().getFullYear()}/${(invoices.filter(i => i.type === 'vendor_bill').length + 1).toString().padStart(4, '0')}`;
    const billId = `bill-${Date.now()}`;
    const dateStr = new Date().toISOString().slice(0, 10);

    const newBill: Invoice = {
      id: billId,
      reference: billRef,
      type: 'vendor_bill',
      partnerId: po.vendorId,
      partnerName: po.vendorName,
      date: dateStr,
      dueDate: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
      amountUntaxed: po.subtotal,
      amountTax: po.taxTotal,
      amountTotal: po.total,
      amountPaid: 0,
      status: 'posted',
      origin: po.reference
    };

    setState((prev: any) => ({
      ...prev,
      invoices: [newBill, ...prev.invoices],
      purchaseOrders: prev.purchaseOrders.map((p: PurchaseOrder) =>
        p.id === poId ? { ...p, billed: true, billId, status: 'billed' } : p
      )
    }));
    return newBill;
  };

  // Invoicing & Accounting
  const registerInvoicePayment = (invoiceId: string, amount: number, method: string, mpesaReceiptNumber?: string) => {
    setState((prev: any) => ({
      ...prev,
      invoices: prev.invoices.map((inv: Invoice) => {
        if (inv.id === invoiceId) {
          const newPaid = inv.amountPaid + amount;
          const status = newPaid >= inv.amountTotal ? 'paid' : 'posted';
          return {
            ...inv,
            amountPaid: newPaid,
            status,
            paymentMethod: method,
            mpesaReceiptNumber: mpesaReceiptNumber || inv.mpesaReceiptNumber
          };
        }
        return inv;
      })
    }));
  };

  const financialMetrics = useMemo(() => {
    let totalSalesRevenue = 0;
    let totalExpenses = 0;
    let accountsReceivable = 0;
    let accountsPayable = 0;
    let unpaidInvoicesCount = 0;

    invoices.forEach(inv => {
      if (inv.type === 'customer_invoice') {
        if (inv.status !== 'cancelled') {
          totalSalesRevenue += inv.amountTotal;
          const due = inv.amountTotal - inv.amountPaid;
          if (due > 0) {
            accountsReceivable += due;
            unpaidInvoicesCount += 1;
          }
        }
      } else if (inv.type === 'vendor_bill') {
        if (inv.status !== 'cancelled') {
          totalExpenses += inv.amountTotal;
          const due = inv.amountTotal - inv.amountPaid;
          if (due > 0) {
            accountsPayable += due;
          }
        }
      }
    });

    const grossProfit = totalSalesRevenue - totalExpenses;

    return {
      totalSalesRevenue,
      totalExpenses,
      grossProfit,
      accountsReceivable,
      accountsPayable,
      unpaidInvoicesCount
    };
  }, [invoices]);

  // CRM
  const createLead = (leadData: Partial<CRMLead>): CRMLead => {
    const id = `lead-${Date.now()}`;
    const newLead: CRMLead = {
      id,
      title: leadData.title || 'New Business Inbound Opportunity',
      contactName: leadData.contactName || '',
      email: leadData.email || '',
      phone: leadData.phone || '',
      expectedRevenue: leadData.expectedRevenue || 0,
      probability: leadData.probability || 30,
      stage: leadData.stage || 'new',
      priority: leadData.priority || 'medium',
      notes: leadData.notes || '',
      createdDate: new Date().toISOString().slice(0, 10)
    };

    setState((prev: any) => ({
      ...prev,
      leads: [newLead, ...prev.leads]
    }));
    return newLead;
  };

  const updateLeadStage = (leadId: string, stage: LeadStage) => {
    setState((prev: any) => ({
      ...prev,
      leads: prev.leads.map((l: CRMLead) => (l.id === leadId ? { ...l, stage } : l))
    }));
  };

  const addCustomer = (customerData: Partial<Customer>): Customer => {
    const id = `cust-${Date.now()}`;
    const newCustomer: Customer = {
      id,
      name: customerData.name || 'New Customer',
      email: customerData.email || '',
      phone: customerData.phone || '',
      company: customerData.company || '',
      street: customerData.street || '',
      city: customerData.city || '',
      balanceDue: 0,
      totalSpent: 0,
      ordersCount: 0
    };

    setState((prev: any) => ({
      ...prev,
      customers: [newCustomer, ...prev.customers]
    }));
    return newCustomer;
  };

  const updateCustomer = (id: string, updates: Partial<Customer>) => {
    setState((prev: any) => ({
      ...prev,
      customers: prev.customers.map((c: Customer) => (c.id === id ? { ...c, ...updates } : c))
    }));
  };

  // Employees & Attendance Punch Clock
  const clockInOut = (employeeId: string) => {
    const emp = employees.find(e => e.id === employeeId);
    if (!emp) return;

    const now = new Date();
    const timeFormatted = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const dateFormatted = now.toISOString().slice(0, 10);

    if (emp.isClockedIn) {
      // Clock Out: update active record duration
      const lastClockInDate = emp.lastClockIn ? new Date(emp.lastClockIn) : new Date(now.getTime() - 4 * 3600000);
      const diffHours = Math.max(0.1, Number(((now.getTime() - lastClockInDate.getTime()) / 3600000).toFixed(2)));

      const newRecord: AttendanceRecord = {
        id: `att-${Date.now()}`,
        employeeId: emp.id,
        employeeName: emp.name,
        date: dateFormatted,
        clockInTime: lastClockInDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        clockOutTime: timeFormatted,
        durationHours: diffHours
      };

      setState((prev: any) => ({
        ...prev,
        employees: prev.employees.map((e: Employee) =>
          e.id === employeeId ? { ...e, isClockedIn: false, lastClockIn: undefined } : e
        ),
        attendance: [newRecord, ...prev.attendance]
      }));
    } else {
      // Clock In
      setState((prev: any) => ({
        ...prev,
        employees: prev.employees.map((e: Employee) =>
          e.id === employeeId ? { ...e, isClockedIn: true, lastClockIn: now.toISOString() } : e
        )
      }));
    }
  };

  const addEmployee = (empData: Partial<Employee>): Employee => {
    const id = `emp-${Date.now()}`;
    const colors = ['bg-indigo-600', 'bg-emerald-600', 'bg-amber-600', 'bg-rose-600', 'bg-cyan-600'];
    const newEmp: Employee = {
      id,
      name: empData.name || 'New Staff Member',
      role: empData.role || 'Associate',
      department: empData.department || 'Operations',
      hourlyRate: empData.hourlyRate || 18.00,
      email: empData.email || '',
      phone: empData.phone || '',
      isClockedIn: false,
      avatarBg: colors[employees.length % colors.length]
    };

    setState((prev: any) => ({
      ...prev,
      employees: [...prev.employees, newEmp]
    }));
    return newEmp;
  };

  // Backup & Restore
  const exportDataJson = (): string => {
    return JSON.stringify(state, null, 2);
  };

  const importDataJson = (jsonStr: string): boolean => {
    try {
      const parsed = JSON.parse(jsonStr);
      if (parsed.settings && parsed.products) {
        setState(parsed);
        return true;
      }
    } catch (e) {
      console.error('Invalid JSON', e);
    }
    return false;
  };

  return (
    <BusinessContext.Provider
      value={{
        currentApp,
        setCurrentApp,
        isAppLauncherOpen,
        openAppLauncher,
        closeAppLauncher,
        toggleAppLauncher,
        currentUser,
        setCurrentUser,
        userRoles: USER_ROLES,
        branches: BRANCH_LOCATIONS,
        currentBranch,
        setCurrentBranch,
        systemMode,
        setSystemMode,
        activeCurrency,
        setActiveCurrency,
        settings,
        updateSettings,
        switchPreset,
        formatCurrency,
        cart,
        addToCart,
        updateCartQuantity,
        removeFromCart,
        clearCart,
        cartSubtotal,
        cartTaxTotal,
        cartTotal,
        selectedCustomer,
        setSelectedCustomer,
        currentSession,
        openNewSession,
        closeCurrentSession,
        processPosSale,
        categories,
        products,
        stockMovements,
        addProduct,
        updateProduct,
        deleteProduct,
        adjustStock,
        salesOrders,
        createSalesOrder,
        updateSalesOrderStatus,
        createInvoiceFromSalesOrder,
        purchaseOrders,
        vendors,
        createPurchaseOrder,
        receivePurchaseOrder,
        createBillFromPurchaseOrder,
        invoices,
        registerInvoicePayment,
        financialMetrics,
        leads,
        customers,
        createLead,
        updateLeadStage,
        addCustomer,
        updateCustomer,
        employees,
        attendance,
        clockInOut,
        addEmployee,
        exportDataJson,
        importDataJson,
        resetAllData
      }}
    >
      {children}
    </BusinessContext.Provider>
  );
};

export const useBusiness = () => {
  const context = useContext(BusinessContext);
  if (!context) {
    throw new Error('useBusiness must be used within a BusinessProvider');
  }
  return context;
};
