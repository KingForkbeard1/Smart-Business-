import {
  BusinessSettings,
  ProductCategory,
  Product,
  Customer,
  Vendor,
  SalesOrder,
  PurchaseOrder,
  Invoice,
  CRMLead,
  Employee,
  AttendanceRecord,
  StockMovement,
  POSSession,
  BusinessPreset
} from '../types';

export interface PresetData {
  settings: BusinessSettings;
  categories: ProductCategory[];
  products: Product[];
  customers: Customer[];
  vendors: Vendor[];
  salesOrders: SalesOrder[];
  purchaseOrders: PurchaseOrder[];
  invoices: Invoice[];
  leads: CRMLead[];
  employees: Employee[];
  attendance: AttendanceRecord[];
  stockMovements: StockMovement[];
  currentSession: POSSession;
}

export const PRESETS: Record<BusinessPreset, PresetData> = {
  grocery: {
    settings: {
      businessName: 'Greenleaf Fresh Grocers & Supermarket',
      businessType: 'grocery',
      currency: 'KES',
      currencySymbol: 'KSh ',
      taxRate: 0.16,
      taxName: '16% VAT',
      address: 'Kimathi Street, Nairobi CBD',
      phone: '+254 712 345 678',
      email: 'sales@greenleafgrocers.co.ke',
      receiptFooter: 'Asante sana for shopping local! Lipa M-Pesa to: 0757329235 (Victor Mwangi)',
      mpesa: {
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
      }
    },
    categories: [
      { id: 'cat-all', name: 'All Items', icon: 'Grid' },
      { id: 'cat-produce', name: 'Fresh Produce', icon: 'Apple' },
      { id: 'cat-bakery', name: 'Bakery & Pastries', icon: 'Croissant' },
      { id: 'cat-dairy', name: 'Dairy & Eggs', icon: 'Milk' },
      { id: 'cat-beverages', name: 'Juices & Beverages', icon: 'Coffee' },
      { id: 'cat-pantry', name: 'Pantry & Flours', icon: 'Package' }
    ],
    products: [
      {
        id: 'prod-001',
        name: 'Organic Hass Avocados (Pack of 3)',
        sku: 'PROD-AVO-03',
        barcode: '7935731001',
        categoryId: 'cat-produce',
        costPrice: 120,
        salePrice: 250,
        stockOnHand: 65,
        minThreshold: 15,
        unit: 'pack',
        active: true
      },
      {
        id: 'prod-002',
        name: 'Fresh Farm Sourdough Loaf (800g)',
        sku: 'BAK-SOUR-01',
        barcode: '7935731002',
        categoryId: 'cat-bakery',
        costPrice: 85,
        salePrice: 160,
        stockOnHand: 30,
        minThreshold: 10,
        unit: 'loaf',
        active: true
      },
      {
        id: 'prod-003',
        name: 'Fresh Pasteurised Whole Milk (1 Litre)',
        sku: 'DAIR-MILK-01',
        barcode: '7935731003',
        categoryId: 'cat-dairy',
        costPrice: 75,
        salePrice: 140,
        stockOnHand: 45,
        minThreshold: 15,
        unit: 'packet',
        active: true
      },
      {
        id: 'prod-004',
        name: 'Valencia Fresh Cold Pressed Orange Juice (500ml)',
        sku: 'BEV-OJ-500',
        barcode: '7935731004',
        categoryId: 'cat-beverages',
        costPrice: 100,
        salePrice: 190,
        stockOnHand: 28,
        minThreshold: 8,
        unit: 'bottle',
        active: true
      },
      {
        id: 'prod-005',
        name: 'Farm Fresh Kienyeji Eggs (Tray of 30)',
        sku: 'DAIR-EGG-30',
        barcode: '7935731005',
        categoryId: 'cat-dairy',
        costPrice: 380,
        salePrice: 520,
        stockOnHand: 40,
        minThreshold: 10,
        unit: 'tray',
        active: true
      },
      {
        id: 'prod-006',
        name: 'Pure Cooking Corn & Sunflower Oil (2 Litres)',
        sku: 'PAN-OIL-2L',
        barcode: '7935731006',
        categoryId: 'cat-pantry',
        costPrice: 480,
        salePrice: 720,
        stockOnHand: 25,
        minThreshold: 6,
        unit: 'can',
        active: true
      },
      {
        id: 'prod-007',
        name: 'Crisp Red Sweet Apples (1kg Bag)',
        sku: 'PROD-APP-01',
        barcode: '7935731007',
        categoryId: 'cat-produce',
        costPrice: 180,
        salePrice: 320,
        stockOnHand: 55,
        minThreshold: 15,
        unit: 'kg',
        active: true
      },
      {
        id: 'prod-008',
        name: 'Fresh Baked Butter Croissants (2-Pack)',
        sku: 'BAK-CR-02',
        barcode: '7935731008',
        categoryId: 'cat-bakery',
        costPrice: 120,
        salePrice: 220,
        stockOnHand: 7, // low stock alert
        minThreshold: 12,
        unit: 'pack',
        active: true
      },
      {
        id: 'prod-009',
        name: 'Premium Barista Oat Milk (1 Litre)',
        sku: 'BEV-OAT-1L',
        barcode: '7935731009',
        categoryId: 'cat-beverages',
        costPrice: 260,
        salePrice: 450,
        stockOnHand: 6, // low stock alert
        minThreshold: 10,
        unit: 'carton',
        active: true
      },
      {
        id: 'prod-010',
        name: 'Baringo Pure Natural Honey (500g Jar)',
        sku: 'PAN-HON-500',
        barcode: '7935731010',
        categoryId: 'cat-pantry',
        costPrice: 420,
        salePrice: 680,
        stockOnHand: 18,
        minThreshold: 5,
        unit: 'jar',
        active: true
      }
    ],
    customers: [
      {
        id: 'cust-walkin',
        name: 'Walk-in Customer',
        email: '',
        phone: '0712345678',
        street: 'Main Store Counter',
        city: 'Nairobi',
        balanceDue: 0,
        totalSpent: 48500,
        ordersCount: 42
      },
      {
        id: 'cust-001',
        name: 'Wanjiku Kamau',
        email: 'wanjiku.kamau@greenbistro.co.ke',
        phone: '0722123456',
        company: 'The Green Bistro Westlands',
        street: 'Ring Road Parklands',
        city: 'Nairobi',
        balanceDue: 3500,
        totalSpent: 78500,
        ordersCount: 16
      },
      {
        id: 'cust-002',
        name: 'Brian Kiprop',
        email: 'brian@kiproptech.co.ke',
        phone: '0712987654',
        company: 'Kiprop Tech Hub',
        street: 'Upper Hill Road',
        city: 'Nairobi',
        balanceDue: 0,
        totalSpent: 34200,
        ordersCount: 11
      },
      {
        id: 'cust-003',
        name: 'Amina Mohamed',
        email: 'amina.m@gmail.com',
        phone: '0733456789',
        street: 'Parklands 4th Avenue',
        city: 'Nairobi',
        balanceDue: 0,
        totalSpent: 16800,
        ordersCount: 7
      }
    ],
    vendors: [
      {
        id: 'vend-001',
        name: 'Naivasha Fresh Produce Ltd',
        contactPerson: 'David Kariuki',
        email: 'orders@naivashaproduce.co.ke',
        phone: '+254 722 990 112',
        paymentTerms: 'Net 15 Days'
      },
      {
        id: 'vend-002',
        name: 'Brookside & KCC Dairy Supplies',
        contactPerson: 'Grace Wambui',
        email: 'orders@dairycoop.co.ke',
        phone: '+254 733 445 566',
        paymentTerms: 'Immediate Payment'
      },
      {
        id: 'vend-003',
        name: 'Unga Mills & Grain Wholesalers',
        contactPerson: 'Peter Omondi',
        email: 'supply@ungagroup.co.ke',
        phone: '+254 720 114 433',
        paymentTerms: 'Net 30 Days'
      }
    ],
    salesOrders: [
      {
        id: 'so-001',
        reference: 'SO/2026/001',
        customerId: 'cust-001',
        customerName: 'Wanjiku Kamau',
        date: '2026-09-24',
        lines: [
          { productId: 'prod-002', productName: 'Fresh Farm Sourdough Loaf (800g)', sku: 'BAK-SOUR-01', quantity: 15, unitPrice: 160, taxRate: 0.16, subtotal: 2400 },
          { productId: 'prod-006', productName: 'Pure Cooking Corn & Sunflower Oil (2 Litres)', sku: 'PAN-OIL-2L', quantity: 4, unitPrice: 720, taxRate: 0.16, subtotal: 2880 }
        ],
        subtotal: 5280,
        taxTotal: 844.8,
        total: 6124.8,
        status: 'sales_order',
        source: 'sales_order',
        invoiceId: 'inv-001'
      },
      {
        id: 'so-002',
        reference: 'SO/2026/002',
        customerId: 'cust-002',
        customerName: 'Brian Kiprop',
        date: '2026-09-23',
        lines: [
          { productId: 'prod-004', productName: 'Valencia Fresh Cold Pressed Orange Juice (500ml)', sku: 'BEV-OJ-500', quantity: 12, unitPrice: 190, taxRate: 0.16, subtotal: 2280 },
          { productId: 'prod-008', productName: 'Fresh Baked Butter Croissants (2-Pack)', sku: 'BAK-CR-02', quantity: 6, unitPrice: 220, taxRate: 0.16, subtotal: 1320 }
        ],
        subtotal: 3600,
        taxTotal: 576,
        total: 4176,
        status: 'invoiced',
        paymentMethod: 'mobile',
        mpesaReceiptNumber: 'TD84KJ91A2',
        mpesaPhoneNumber: '254712987654',
        source: 'sales_order',
        invoiceId: 'inv-002'
      }
    ],
    purchaseOrders: [
      {
        id: 'po-001',
        reference: 'PO/2026/001',
        vendorId: 'vend-001',
        vendorName: 'Naivasha Fresh Produce Ltd',
        orderDate: '2026-09-20',
        expectedDate: '2026-09-23',
        lines: [
          { productId: 'prod-001', productName: 'Organic Hass Avocados (Pack of 3)', quantity: 40, unitCost: 120, subtotal: 4800 },
          { productId: 'prod-007', productName: 'Crisp Red Sweet Apples (1kg Bag)', quantity: 30, unitCost: 180, subtotal: 5400 }
        ],
        subtotal: 10200,
        taxTotal: 1632,
        total: 11832,
        status: 'received',
        productsReceived: true,
        billed: true,
        billId: 'bill-001'
      }
    ],
    invoices: [
      {
        id: 'inv-001',
        reference: 'INV/2026/001',
        type: 'customer_invoice',
        partnerId: 'cust-001',
        partnerName: 'Wanjiku Kamau',
        date: '2026-09-24',
        dueDate: '2026-10-09',
        amountUntaxed: 5280,
        amountTax: 844.8,
        amountTotal: 6124.8,
        amountPaid: 0,
        status: 'posted',
        origin: 'SO/2026/001'
      },
      {
        id: 'inv-002',
        reference: 'INV/2026/002',
        type: 'customer_invoice',
        partnerId: 'cust-002',
        partnerName: 'Brian Kiprop',
        date: '2026-09-23',
        dueDate: '2026-10-08',
        amountUntaxed: 3600,
        amountTax: 576,
        amountTotal: 4176,
        amountPaid: 4176,
        status: 'paid',
        origin: 'SO/2026/002',
        paymentMethod: 'M-PESA STK PUSH',
        mpesaReceiptNumber: 'TD84KJ91A2'
      },
      {
        id: 'bill-001',
        reference: 'BILL/2026/001',
        type: 'vendor_bill',
        partnerId: 'vend-001',
        partnerName: 'Naivasha Fresh Produce Ltd',
        date: '2026-09-21',
        dueDate: '2026-10-06',
        amountUntaxed: 10200,
        amountTax: 1632,
        amountTotal: 11832,
        amountPaid: 11832,
        status: 'paid',
        origin: 'PO/2026/001',
        paymentMethod: 'Bank Wire / M-Pesa Business'
      }
    ],
    leads: [
      {
        id: 'lead-001',
        title: 'Weekly Fruit & Fresh Snacks Crate for Westlands Tech Firm',
        contactName: 'James Mwangi',
        email: 'jmwangi@fintechke.com',
        phone: '0722889900',
        expectedRevenue: 35000,
        probability: 75,
        stage: 'proposition',
        priority: 'high',
        notes: 'Requested proposal for 50kg assorted fresh fruit crates delivered twice weekly.',
        createdDate: '2026-09-22'
      },
      {
        id: 'lead-002',
        title: 'Morning Pastries & Fresh Juice Catering for Law Firm',
        contactName: 'Catherine Nduta',
        email: 'catherine@ndutalaw.co.ke',
        phone: '0711445566',
        expectedRevenue: 18500,
        probability: 50,
        stage: 'qualified',
        priority: 'medium',
        notes: 'Monthly partners breakfast: 40 croissants and fresh orange juice.',
        createdDate: '2026-09-24'
      }
    ],
    employees: [
      {
        id: 'emp-001',
        name: 'Victor Mwangi',
        role: 'Store Manager',
        department: 'Store Operations',
        hourlyRate: 350,
        email: 'victor@greenleafgrocers.co.ke',
        phone: '+254 722 000 111',
        isClockedIn: true,
        lastClockIn: '2026-09-25T07:30:00',
        avatarBg: 'bg-emerald-700'
      },
      {
        id: 'emp-002',
        name: 'Faith Achieng',
        role: 'Head Cashier',
        department: 'Front Checkout',
        hourlyRate: 240,
        email: 'faith@greenleafgrocers.co.ke',
        phone: '+254 712 222 333',
        isClockedIn: true,
        lastClockIn: '2026-09-25T08:00:00',
        avatarBg: 'bg-indigo-600'
      },
      {
        id: 'emp-003',
        name: 'Dennis Mutua',
        role: 'Inventory & Receiving Specialist',
        department: 'Logistics',
        hourlyRate: 260,
        email: 'dennis@greenleafgrocers.co.ke',
        phone: '+254 733 999 888',
        isClockedIn: false,
        avatarBg: 'bg-amber-600'
      }
    ],
    attendance: [
      {
        id: 'att-001',
        employeeId: 'emp-001',
        employeeName: 'Victor Mwangi',
        date: '2026-09-24',
        clockInTime: '07:30 AM',
        clockOutTime: '04:30 PM',
        durationHours: 9.0
      },
      {
        id: 'att-002',
        employeeId: 'emp-002',
        employeeName: 'Faith Achieng',
        date: '2026-09-24',
        clockInTime: '08:00 AM',
        clockOutTime: '05:00 PM',
        durationHours: 9.0
      }
    ],
    stockMovements: [
      {
        id: 'sm-001',
        productId: 'prod-001',
        productName: 'Organic Hass Avocados (Pack of 3)',
        date: '2026-09-23 10:15',
        type: 'purchase',
        quantityChange: 40,
        newBalance: 65,
        reference: 'PO/2026/001',
        performedBy: 'Dennis Mutua'
      }
    ],
    currentSession: {
      id: 'pos-sess-001',
      openedAt: '2026-09-25 08:00',
      openedBy: 'Faith Achieng',
      openingFloat: 5000,
      cashSalesTotal: 14200,
      cardSalesTotal: 18500,
      mobileSalesTotal: 38600,
      ordersCount: 28,
      status: 'open'
    }
  },

  cafe: {
    settings: {
      businessName: 'Velvet Bean Roastery & Café Nairobi',
      businessType: 'cafe',
      currency: 'KES',
      currencySymbol: 'KSh ',
      taxRate: 0.16,
      taxName: '16% VAT',
      address: '77 Gigiri Lane, Village Market, Nairobi',
      phone: '+254 720 889 900',
      email: 'roastery@velvetbean.co.ke',
      receiptFooter: 'Crafted with care in Nairobi. Lipa M-Pesa to: 0757329235 (Victor Mwangi)',
      mpesa: {
        enabled: true,
        businessType: 'phone',
        receivingPhone: '0757329235',
        ownerName: 'Victor Mwangi',
        shortcode: '0757329235',
        accountReference: 'VELVET-CAFE',
        passkey: 'bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919',
        consumerKey: '',
        consumerSecret: '',
        environment: 'sandbox'
      }
    },
    categories: [
      { id: 'cat-all', name: 'All Items', icon: 'Grid' },
      { id: 'cat-espresso', name: 'Espresso Bar', icon: 'Coffee' },
      { id: 'cat-brewed', name: 'Brewed & Pourovers', icon: 'CupSoda' },
      { id: 'cat-beans', name: 'Retail Whole Beans', icon: 'Package' },
      { id: 'cat-pastries', name: 'Bakehouse Pastries', icon: 'Croissant' }
    ],
    products: [
      {
        id: 'cafe-001',
        name: 'Oat Milk Flat White (12oz)',
        sku: 'CAFE-FW-OAT',
        barcode: '882001001',
        categoryId: 'cat-espresso',
        costPrice: 120,
        salePrice: 450,
        stockOnHand: 180,
        minThreshold: 30,
        unit: 'cup',
        active: true
      },
      {
        id: 'cafe-002',
        name: 'Kenya AA Nyeri Washed Whole Bean (250g)',
        sku: 'BEAN-NYERI-250',
        barcode: '882001002',
        categoryId: 'cat-beans',
        costPrice: 650,
        salePrice: 1400,
        stockOnHand: 35,
        minThreshold: 10,
        unit: 'bag',
        active: true
      },
      {
        id: 'cafe-003',
        name: 'Cardamom Cinnamon Morning Bun',
        sku: 'BAKE-BUN-01',
        barcode: '882001003',
        categoryId: 'cat-pastries',
        costPrice: 110,
        salePrice: 320,
        stockOnHand: 18,
        minThreshold: 8,
        unit: 'pcs',
        active: true
      },
      {
        id: 'cafe-004',
        name: 'Single Origin Espresso Double Shot',
        sku: 'CAFE-ESP-DBL',
        barcode: '882001004',
        categoryId: 'cat-espresso',
        costPrice: 50,
        salePrice: 280,
        stockOnHand: 250,
        minThreshold: 50,
        unit: 'shot',
        active: true
      }
    ],
    customers: [
      {
        id: 'cust-walkin',
        name: 'Walk-in Customer',
        email: '',
        phone: '0722000000',
        street: 'Bar Counter',
        city: 'Gigiri, Nairobi',
        balanceDue: 0,
        totalSpent: 92400,
        ordersCount: 180
      }
    ],
    vendors: [],
    salesOrders: [],
    purchaseOrders: [],
    invoices: [],
    leads: [],
    employees: [],
    attendance: [],
    stockMovements: [],
    currentSession: {
      id: 'pos-cafe-001',
      openedAt: '2026-09-25 07:00',
      openedBy: 'Barista Lead',
      openingFloat: 5000,
      cashSalesTotal: 12400,
      cardSalesTotal: 28600,
      mobileSalesTotal: 46800,
      ordersCount: 65,
      status: 'open'
    }
  },

  hardware: {
    settings: {
      businessName: 'ProBuild Hardware & Supplies Ltd',
      businessType: 'hardware',
      currency: 'KES',
      currencySymbol: 'KSh ',
      taxRate: 0.16,
      taxName: '16% VAT',
      address: 'Enterprise Road, Industrial Area, Nairobi',
      phone: '+254 722 555 444',
      email: 'sales@probuildsupplies.co.ke',
      receiptFooter: 'Heavy-duty construction supplies. Lipa M-Pesa to: 0757329235 (Victor Mwangi)',
      mpesa: {
        enabled: true,
        businessType: 'phone',
        receivingPhone: '0757329235',
        ownerName: 'Victor Mwangi',
        shortcode: '0757329235',
        accountReference: 'PROBUILD',
        passkey: 'bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919',
        consumerKey: '',
        consumerSecret: '',
        environment: 'sandbox'
      }
    },
    categories: [
      { id: 'cat-all', name: 'All Items', icon: 'Grid' },
      { id: 'cat-power', name: 'Power Tools', icon: 'Zap' },
      { id: 'cat-hand', name: 'Hand Tools', icon: 'Wrench' },
      { id: 'cat-fasteners', name: 'Fasteners & Screws', icon: 'Layers' },
      { id: 'cat-electrical', name: 'Electrical & Cables', icon: 'BatteryCharging' }
    ],
    products: [
      {
        id: 'hard-001',
        name: '20V Brushless Cordless Drill Driver Kit',
        sku: 'TOOL-DRL-20V',
        barcode: '994001001',
        categoryId: 'cat-power',
        costPrice: 9500,
        salePrice: 14500,
        stockOnHand: 14,
        minThreshold: 4,
        unit: 'kit',
        active: true
      },
      {
        id: 'hard-002',
        name: 'Pro Heavy-Duty Steel Claw Hammer (16oz)',
        sku: 'HAND-HAM-16',
        barcode: '994001002',
        categoryId: 'cat-hand',
        costPrice: 950,
        salePrice: 1850,
        stockOnHand: 32,
        minThreshold: 10,
        unit: 'pcs',
        active: true
      },
      {
        id: 'hard-003',
        name: 'Galvanized Screws #8 x 2-1/2" (5kg Tub)',
        sku: 'FAST-SCR-5LB',
        barcode: '994001003',
        categoryId: 'cat-fasteners',
        costPrice: 1500,
        salePrice: 2400,
        stockOnHand: 45,
        minThreshold: 12,
        unit: 'tub',
        active: true
      },
      {
        id: 'hard-004',
        name: 'Solid Copper Electrical Cable 2.5mm Twin & Earth (100m)',
        sku: 'ELEC-CAB-100',
        barcode: '994001004',
        categoryId: 'cat-electrical',
        costPrice: 5800,
        salePrice: 8500,
        stockOnHand: 11,
        minThreshold: 5,
        unit: 'roll',
        active: true
      }
    ],
    customers: [
      {
        id: 'cust-walkin',
        name: 'Walk-in Customer',
        email: '',
        phone: '0700000000',
        street: 'Counter',
        city: 'Industrial Area, Nairobi',
        balanceDue: 0,
        totalSpent: 128000,
        ordersCount: 38
      }
    ],
    vendors: [],
    salesOrders: [],
    purchaseOrders: [],
    invoices: [],
    leads: [],
    employees: [],
    attendance: [],
    stockMovements: [],
    currentSession: {
      id: 'pos-hard-001',
      openedAt: '2026-09-25 07:00',
      openedBy: 'Store Supervisor',
      openingFloat: 10000,
      cashSalesTotal: 34000,
      cardSalesTotal: 65000,
      mobileSalesTotal: 98000,
      ordersCount: 22,
      status: 'open'
    }
  }
};
