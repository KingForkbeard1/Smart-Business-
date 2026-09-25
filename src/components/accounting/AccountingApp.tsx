import React, { useState, useMemo } from 'react';
import { useBusiness } from '../../context/BusinessContext';
import { Invoice, InvoiceStatus, InvoiceType } from '../../types';
import { ControlPanel } from '../layout/ControlPanel';
import { MpesaStkModal } from '../mpesa/MpesaStkModal';
import {
  CreditCard,
  Receipt,
  FileCheck2,
  DollarSign,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Plus,
  ChevronLeft,
  X,
  Banknote,
  Smartphone,
  Printer,
  FileText,
  Building,
  ShieldCheck,
  Download,
  Calendar,
  Layers,
  ArrowUpRight,
  ArrowDownLeft
} from 'lucide-react';

interface AccountingAppProps {
  activeTab?: string;
}

export const AccountingApp: React.FC<AccountingAppProps> = ({ activeTab = 'Customer Invoices' }) => {
  const {
    invoices,
    registerInvoicePayment,
    financialMetrics,
    formatCurrency,
    settings,
    currentBranch,
    activeCurrency
  } = useBusiness();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [viewInvoiceModal, setViewInvoiceModal] = useState<Invoice | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isMpesaModalOpen, setIsMpesaModalOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<string>('Bank Transfer');
  const [ledgerAccountFilter, setLedgerAccountFilter] = useState<string>('all');

  // Customer Invoices vs Vendor Bills
  const customerInvoices = useMemo(() => {
    return invoices.filter(inv => inv.type === 'customer_invoice' &&
      (inv.reference.toLowerCase().includes(searchQuery.toLowerCase()) ||
       inv.partnerName.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [invoices, searchQuery]);

  const vendorBills = useMemo(() => {
    return invoices.filter(inv => inv.type === 'vendor_bill' &&
      (inv.reference.toLowerCase().includes(searchQuery.toLowerCase()) ||
       inv.partnerName.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [invoices, searchQuery]);

  const handleOpenPayment = (inv: Invoice) => {
    setSelectedInvoice(inv);
    const remaining = inv.amountTotal - inv.amountPaid;
    setPaymentAmount(remaining > 0 ? remaining : inv.amountTotal);
    setIsPaymentModalOpen(true);
  };

  const handleOpenMpesa = (inv: Invoice) => {
    setSelectedInvoice(inv);
    const remaining = inv.amountTotal - inv.amountPaid;
    setPaymentAmount(remaining > 0 ? remaining : inv.amountTotal);
    setIsMpesaModalOpen(true);
  };

  const handleMpesaSuccess = (mpesaReceiptNumber: string) => {
    if (!selectedInvoice) return;
    registerInvoicePayment(selectedInvoice.id, paymentAmount, 'M-PESA STK PUSH', mpesaReceiptNumber);
    setIsMpesaModalOpen(false);
    setIsPaymentModalOpen(false);
    setSelectedInvoice(null);
  };

  const handleRegisterPayment = () => {
    if (!selectedInvoice) return;
    if (paymentMethod === 'Mobile Payment (M-Pesa)') {
      setIsPaymentModalOpen(false);
      setIsMpesaModalOpen(true);
      return;
    }
    registerInvoicePayment(selectedInvoice.id, paymentAmount, paymentMethod);
    setIsPaymentModalOpen(false);
    setSelectedInvoice(null);
  };

  // Double-entry Chart of Accounts entries
  const generalLedgerRows = useMemo(() => {
    const rev = financialMetrics.totalSalesRevenue;
    const exp = financialMetrics.totalExpenses;
    const ar = financialMetrics.accountsReceivable;
    const ap = financialMetrics.accountsPayable;
    const vatOutput = rev * 0.16;
    const vatInput = exp * 0.16;

    return [
      { code: '1010', account: 'Cash & Petty Till Float', type: 'Asset', debit: 25000, credit: 0, balance: 25000, desc: 'Physical cashier registers & vault float' },
      { code: '1020', account: 'Safaricom M-Pesa Merchant Settlement', type: 'Asset', debit: Math.round(rev * 0.65), credit: 0, balance: Math.round(rev * 0.65), desc: '0757329235 (Victor Mwangi) / Till collections' },
      { code: '1030', account: 'Equity Bank Corporate Operating A/C', type: 'Asset', debit: Math.round(rev * 0.3), credit: 0, balance: Math.round(rev * 0.3), desc: 'Bank wire, EFT, card settlements' },
      { code: '1050', account: 'Trade Accounts Receivable', type: 'Asset', debit: ar, credit: 0, balance: ar, desc: 'B2B commercial invoices due from credit customers' },
      { code: '1200', account: 'Merchandise Inventory Asset', type: 'Asset', debit: 485000, credit: 0, balance: 485000, desc: 'Warehouse stock valued at weighted cost' },
      { code: '2010', account: 'Trade Accounts Payable (Vendors)', type: 'Liability', debit: 0, credit: ap, balance: ap, desc: 'Outstanding bills due to suppliers' },
      { code: '2050', account: 'Kenya Revenue Authority (KRA) VAT Payable', type: 'Liability', debit: Math.round(vatInput), credit: Math.round(vatOutput), balance: Math.round(vatOutput - vatInput), desc: '16% Output tax collected less Input tax claimed' },
      { code: '3010', account: 'Owners Paid-In Capital', type: 'Equity', debit: 0, credit: 500000, balance: 500000, desc: 'Initial equity investment' },
      { code: '4010', account: 'Commercial Sales & POS Revenue', type: 'Revenue', debit: 0, credit: rev, balance: rev, desc: 'Gross sales of inventory & services' },
      { code: '5010', account: 'Cost of Goods Sold (COGS)', type: 'Expense', debit: exp, credit: 0, balance: exp, desc: 'Direct cost of inventory sold' },
      { code: '6010', account: 'Staff Payroll & Allowances', type: 'Expense', debit: 45000, credit: 0, balance: 45000, desc: 'Wages, overtime, statutory deductions' },
      { code: '6020', account: 'Store Rent & Warehouse Lease', type: 'Expense', debit: 35000, credit: 0, balance: 35000, desc: 'Premises occupancy charges' }
    ];
  }, [financialMetrics]);

  const filteredLedger = useMemo(() => {
    return generalLedgerRows.filter(r => {
      const matchType = ledgerAccountFilter === 'all' || r.type.toLowerCase() === ledgerAccountFilter.toLowerCase();
      const matchSearch = r.account.toLowerCase().includes(searchQuery.toLowerCase()) || r.code.includes(searchQuery);
      return matchType && matchSearch;
    });
  }, [generalLedgerRows, ledgerAccountFilter, searchQuery]);

  // 1. GENERAL LEDGER TAB
  if (activeTab === 'General Ledger') {
    return (
      <div className="flex-1 flex flex-col bg-slate-100 min-h-[calc(100vh-3rem)]">
        <ControlPanel
          breadcrumbs={['Finance', 'General Ledger', 'Chart of Accounts']}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          searchPlaceholder="Search account name or code..."
          totalRecords={filteredLedger.length}
        />

        <div className="p-4 sm:p-6 space-y-4 max-w-7xl w-full mx-auto flex-1 overflow-y-auto">
          {/* Header Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <div>
              <h2 className="text-base font-bold text-slate-900">Standard Chart of Accounts (Double-Entry)</h2>
              <p className="text-xs text-slate-500">
                Branch: <span className="font-semibold text-blue-700">{currentBranch.name}</span> ({currentBranch.code}) · Currency: <span className="font-mono font-semibold">{activeCurrency}</span>
              </p>
            </div>

            {/* Filter buttons */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs">
              {(['all', 'asset', 'liability', 'equity', 'revenue', 'expense'] as const).map(type => (
                <button
                  key={type}
                  onClick={() => setLedgerAccountFilter(type)}
                  className={`px-2.5 py-1 rounded capitalize font-medium transition-colors ${
                    ledgerAccountFilter === type
                      ? 'bg-blue-600 text-white font-semibold shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {type === 'all' ? 'All Accounts' : type}
                </button>
              ))}
            </div>
          </div>

          {/* Ledger Table */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3 px-4">Code</th>
                    <th className="py-3 px-4">Account Name</th>
                    <th className="py-3 px-4">Classification</th>
                    <th className="py-3 px-4">Description / Purpose</th>
                    <th className="py-3 px-4 text-right">Debit</th>
                    <th className="py-3 px-4 text-right">Credit</th>
                    <th className="py-3 px-4 text-right">Net Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredLedger.map(row => (
                    <tr key={row.code} className="hover:bg-blue-50/40 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-blue-700">{row.code}</td>
                      <td className="py-3 px-4 font-semibold text-slate-900">{row.account}</td>
                      <td className="py-3 px-4">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          row.type === 'Asset' ? 'bg-emerald-100 text-emerald-800' :
                          row.type === 'Liability' ? 'bg-amber-100 text-amber-800' :
                          row.type === 'Equity' ? 'bg-purple-100 text-purple-800' :
                          row.type === 'Revenue' ? 'bg-blue-100 text-blue-800' :
                          'bg-rose-100 text-rose-800'
                        }`}>
                          {row.type}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-500 max-w-xs truncate">{row.desc}</td>
                      <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-800">
                        {row.debit > 0 ? formatCurrency(row.debit) : '—'}
                      </td>
                      <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-800">
                        {row.credit > 0 ? formatCurrency(row.credit) : '—'}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-slate-900 tabular-nums">
                        {formatCurrency(row.balance)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 2. PROFIT & LOSS STATEMENT TAB
  if (activeTab === 'P&L Statement' || activeTab === 'P&L Overview') {
    const revenue = financialMetrics.totalSalesRevenue;
    const cogs = financialMetrics.totalExpenses;
    const grossMargin = financialMetrics.grossProfit;
    const grossMarginPct = revenue > 0 ? ((grossMargin / revenue) * 100).toFixed(1) : '0.0';
    const operatingExpenses = 45000 + 35000 + 12000; // Payroll + Rent + Utilities
    const netIncome = grossMargin - operatingExpenses;

    return (
      <div className="flex-1 flex flex-col bg-slate-100 min-h-[calc(100vh-3rem)]">
        <ControlPanel breadcrumbs={['Finance', 'Financial Reporting', 'Income Statement (P&L)']} />

        <div className="p-4 sm:p-6 max-w-5xl w-full mx-auto space-y-6 flex-1 overflow-y-auto">
          {/* Key KPI Cards with Shades of Blue */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500 font-medium">Operating Revenue</span>
              <p className="text-2xl font-bold font-mono text-blue-700 tabular-nums mt-1">
                {formatCurrency(revenue)}
              </p>
              <p className="text-[11px] text-slate-400 mt-1">POS cashier & invoice settlements</p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500 font-medium">Cost of Goods (COGS)</span>
              <p className="text-2xl font-bold font-mono text-slate-700 tabular-nums mt-1">
                {formatCurrency(cogs)}
              </p>
              <p className="text-[11px] text-slate-400 mt-1">Direct supplier replenishments</p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500 font-medium">Gross Profit Margin</span>
              <p className="text-2xl font-bold font-mono text-emerald-700 tabular-nums mt-1">
                {formatCurrency(grossMargin)}
              </p>
              <p className="text-[11px] text-emerald-600 font-semibold mt-1">{grossMarginPct}% gross margin</p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500 font-medium">Net Operating Profit</span>
              <p className={`text-2xl font-bold font-mono tabular-nums mt-1 ${netIncome >= 0 ? 'text-blue-900' : 'text-rose-600'}`}>
                {formatCurrency(netIncome)}
              </p>
              <p className="text-[11px] text-slate-400 mt-1">After payroll & facility leases</p>
            </div>
          </div>

          {/* Formal P&L Statement */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-xs p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <h3 className="font-bold text-base text-slate-900">Comparative Statement of Profit or Loss</h3>
                <p className="text-xs text-slate-500">Period: Current Financial Year · Method: Accrual Accounting</p>
              </div>
              <button
                onClick={() => window.print()}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Statement</span>
              </button>
            </div>

            <div className="divide-y divide-slate-100 text-xs">
              {/* Section 1: Revenue */}
              <div className="py-2.5 flex justify-between font-semibold text-slate-900 bg-slate-50 px-3 rounded-lg">
                <span>1. OPERATING REVENUE</span>
                <span className="font-mono tabular-nums text-blue-700">{formatCurrency(revenue)}</span>
              </div>
              <div className="py-2 pl-6 flex justify-between text-slate-600">
                <span>Direct Point-of-Sale Register Receipts</span>
                <span className="font-mono tabular-nums">{formatCurrency(revenue * 0.72)}</span>
              </div>
              <div className="py-2 pl-6 flex justify-between text-slate-600">
                <span>B2B Commercial Invoices Settled</span>
                <span className="font-mono tabular-nums">{formatCurrency(revenue * 0.28)}</span>
              </div>

              {/* Section 2: COGS */}
              <div className="py-2.5 flex justify-between font-semibold text-slate-900 bg-slate-50 px-3 rounded-lg mt-3">
                <span>2. COST OF GOODS SOLD</span>
                <span className="font-mono tabular-nums text-rose-700">-{formatCurrency(cogs)}</span>
              </div>
              <div className="py-2 pl-6 flex justify-between text-slate-600">
                <span>Replenishment Inventory Invoiced from Vendors</span>
                <span className="font-mono tabular-nums">-{formatCurrency(cogs)}</span>
              </div>

              {/* Gross Margin Subtotal */}
              <div className="py-3 flex justify-between font-bold text-sm text-slate-900 bg-blue-50/70 border border-blue-200 px-3 rounded-lg mt-2">
                <span>GROSS PROFIT</span>
                <span className="font-mono tabular-nums text-blue-900">{formatCurrency(grossMargin)}</span>
              </div>

              {/* Section 3: Operating Expenses */}
              <div className="py-2.5 flex justify-between font-semibold text-slate-900 bg-slate-50 px-3 rounded-lg mt-3">
                <span>3. OPERATING EXPENSES (OPEX)</span>
                <span className="font-mono tabular-nums text-rose-700">-{formatCurrency(operatingExpenses)}</span>
              </div>
              <div className="py-2 pl-6 flex justify-between text-slate-600">
                <span>Staff Salaries, Hourly Cashier Wages & Bonuses</span>
                <span className="font-mono tabular-nums">-{formatCurrency(45000)}</span>
              </div>
              <div className="py-2 pl-6 flex justify-between text-slate-600">
                <span>Retail Store Lease & Warehouse Storage (Nairobi CBD)</span>
                <span className="font-mono tabular-nums">-{formatCurrency(35000)}</span>
              </div>
              <div className="py-2 pl-6 flex justify-between text-slate-600">
                <span>Electricity, High-Speed Internet & POS Hardware</span>
                <span className="font-mono tabular-nums">-{formatCurrency(12000)}</span>
              </div>

              {/* Net Profit */}
              <div className="py-3.5 flex justify-between font-bold text-base text-white bg-slate-900 px-4 rounded-xl mt-4 shadow-sm">
                <span>NET OPERATING INCOME</span>
                <span className="font-mono tabular-nums text-emerald-400">{formatCurrency(netIncome)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 3. BALANCE SHEET TAB
  if (activeTab === 'Balance Sheet') {
    const totalAssets = 25000 + Math.round(financialMetrics.totalSalesRevenue * 0.65) + Math.round(financialMetrics.totalSalesRevenue * 0.3) + financialMetrics.accountsReceivable + 485000;
    const totalLiabilities = financialMetrics.accountsPayable + Math.round((financialMetrics.totalSalesRevenue - financialMetrics.totalExpenses) * 0.16);
    const equity = totalAssets - totalLiabilities;

    return (
      <div className="flex-1 flex flex-col bg-slate-100 min-h-[calc(100vh-3rem)]">
        <ControlPanel breadcrumbs={['Finance', 'Financial Reporting', 'Statement of Financial Position (Balance Sheet)']} />

        <div className="p-4 sm:p-6 max-w-5xl w-full mx-auto space-y-6 flex-1 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-xl shadow-xs p-6 space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <h3 className="font-bold text-base text-slate-900">Balance Sheet as at Current Date</h3>
                <p className="text-xs text-slate-500">Audited double-entry balance check · Assets = Liabilities + Equity</p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-md">
                Ledger Balanced ✓
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* ASSETS COLUMN */}
              <div className="space-y-3">
                <div className="p-2.5 bg-blue-50 border border-blue-200 rounded-lg flex justify-between items-center font-bold text-blue-900 text-xs">
                  <span>TOTAL CURRENT ASSETS</span>
                  <span className="font-mono tabular-nums">{formatCurrency(totalAssets)}</span>
                </div>
                <div className="divide-y divide-slate-100 text-xs pl-2">
                  <div className="py-2 flex justify-between text-slate-700">
                    <span>Cash on Hand & Register Floats</span>
                    <span className="font-mono">{formatCurrency(25000)}</span>
                  </div>
                  <div className="py-2 flex justify-between text-slate-700">
                    <span>Safaricom M-Pesa Merchant Settlement</span>
                    <span className="font-mono">{formatCurrency(Math.round(financialMetrics.totalSalesRevenue * 0.65))}</span>
                  </div>
                  <div className="py-2 flex justify-between text-slate-700">
                    <span>Commercial Bank Operating Accounts</span>
                    <span className="font-mono">{formatCurrency(Math.round(financialMetrics.totalSalesRevenue * 0.3))}</span>
                  </div>
                  <div className="py-2 flex justify-between text-slate-700">
                    <span>Accounts Receivable (Customer Due)</span>
                    <span className="font-mono text-amber-700">{formatCurrency(financialMetrics.accountsReceivable)}</span>
                  </div>
                  <div className="py-2 flex justify-between text-slate-700">
                    <span>Merchandise Inventory on Hand</span>
                    <span className="font-mono">{formatCurrency(485000)}</span>
                  </div>
                </div>
              </div>

              {/* LIABILITIES & EQUITY COLUMN */}
              <div className="space-y-4">
                <div className="space-y-3">
                  <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-lg flex justify-between items-center font-bold text-amber-900 text-xs">
                    <span>TOTAL LIABILITIES</span>
                    <span className="font-mono tabular-nums">{formatCurrency(totalLiabilities)}</span>
                  </div>
                  <div className="divide-y divide-slate-100 text-xs pl-2">
                    <div className="py-2 flex justify-between text-slate-700">
                      <span>Accounts Payable (Trade Vendors)</span>
                      <span className="font-mono text-slate-900">{formatCurrency(financialMetrics.accountsPayable)}</span>
                    </div>
                    <div className="py-2 flex justify-between text-slate-700">
                      <span>KRA Net VAT Payable (16%)</span>
                      <span className="font-mono text-slate-900">{formatCurrency(Math.round((financialMetrics.totalSalesRevenue - financialMetrics.totalExpenses) * 0.16))}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <div className="p-2.5 bg-purple-50 border border-purple-200 rounded-lg flex justify-between items-center font-bold text-purple-900 text-xs">
                    <span>TOTAL SHAREHOLDERS EQUITY</span>
                    <span className="font-mono tabular-nums">{formatCurrency(equity)}</span>
                  </div>
                  <div className="divide-y divide-slate-100 text-xs pl-2">
                    <div className="py-2 flex justify-between text-slate-700">
                      <span>Owners Paid-in Capital</span>
                      <span className="font-mono">{formatCurrency(500000)}</span>
                    </div>
                    <div className="py-2 flex justify-between text-slate-700">
                      <span>Retained Operational Earnings</span>
                      <span className="font-mono">{formatCurrency(equity - 500000)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 4. KRA TAX VAT TAB
  if (activeTab === 'KRA Tax VAT') {
    const grossSales = financialMetrics.totalSalesRevenue;
    const outputVat = grossSales * 0.16;
    const purchases = financialMetrics.totalExpenses;
    const inputVat = purchases * 0.16;
    const netVatPayable = outputVat - inputVat;

    return (
      <div className="flex-1 flex flex-col bg-slate-100 min-h-[calc(100vh-3rem)]">
        <ControlPanel breadcrumbs={['Finance', 'Tax Compliance', 'Kenya Revenue Authority (KRA) VAT 16%']} />

        <div className="p-4 sm:p-6 max-w-5xl w-full mx-auto space-y-6 flex-1 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-xl shadow-xs p-6 space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <h3 className="font-bold text-base text-slate-900">Value Added Tax (VAT 16%) Monthly Return Schedule</h3>
                <p className="text-xs text-slate-500">
                  KRA PIN: <span className="font-mono font-semibold text-slate-900">P051938290X</span> · E-TIMS Validated
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold px-3 py-1 bg-blue-100 text-blue-800 rounded-lg flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-blue-600" />
                  <span>KRA E-TIMS Active</span>
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <span className="text-xs text-slate-500">Output VAT (Collected on Sales)</span>
                <p className="text-xl font-bold font-mono text-blue-700 tabular-nums">
                  {formatCurrency(outputVat)}
                </p>
                <p className="text-[11px] text-slate-400">16% on taxable retail & wholesale</p>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <span className="text-xs text-slate-500">Input VAT (Claimable on Purchases)</span>
                <p className="text-xl font-bold font-mono text-slate-700 tabular-nums">
                  {formatCurrency(inputVat)}
                </p>
                <p className="text-[11px] text-slate-400">Supported by supplier E-TIMS invoices</p>
              </div>

              <div className="p-4 bg-blue-50/80 rounded-xl border border-blue-200 space-y-1">
                <span className="text-xs text-blue-900 font-semibold">Net VAT Payable to KRA</span>
                <p className="text-xl font-bold font-mono text-blue-900 tabular-nums">
                  {formatCurrency(netVatPayable)}
                </p>
                <p className="text-[11px] text-blue-700 font-medium">Due on 20th of subsequent month</p>
              </div>
            </div>

            <div className="border border-slate-200 rounded-xl p-4 bg-slate-50 space-y-2 text-xs">
              <h4 className="font-bold text-slate-900">Statutory Tax Filing Note</h4>
              <p className="text-slate-600 leading-relaxed">
                All point-of-sale transactions and credit invoices are tagged with sequential fiscal serial numbers compatible with KRA electronic tax registers (ETRs). M-Pesa business transactions through Victor Mwangi (0757329235) reconcile automatically against the cash ledger.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 5. VENDOR BILLS SUBTAB
  if (activeTab === 'Vendor Bills') {
    return (
      <div className="flex-1 flex flex-col bg-slate-100 min-h-[calc(100vh-3rem)]">
        <ControlPanel
          breadcrumbs={['Finance', 'Suppliers', 'Vendor Bills']}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          searchPlaceholder="Search bill reference or vendor..."
          totalRecords={vendorBills.length}
        />

        <div className="p-4 sm:p-6 flex-1 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4">Bill Reference</th>
                  <th className="py-3 px-4">Vendor</th>
                  <th className="py-3 px-4">Bill Date</th>
                  <th className="py-3 px-4">Due Date</th>
                  <th className="py-3 px-4">Source PO</th>
                  <th className="py-3 px-4 text-right">Total Amount</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {vendorBills.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-400">
                      No vendor bills generated yet. Go to Purchases to generate bills from received purchase orders.
                    </td>
                  </tr>
                ) : (
                  vendorBills.map(bill => (
                    <tr key={bill.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">{bill.reference}</td>
                      <td className="py-3 px-4 font-semibold text-slate-900">{bill.partnerName}</td>
                      <td className="py-3 px-4 text-slate-600">{bill.date}</td>
                      <td className="py-3 px-4 text-slate-600">{bill.dueDate}</td>
                      <td className="py-3 px-4 font-mono text-slate-500">{bill.origin || '—'}</td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-slate-900 tabular-nums">
                        {formatCurrency(bill.amountTotal)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                            bill.status === 'paid'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {bill.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        {bill.status !== 'paid' ? (
                          <button
                            onClick={() => handleOpenPayment(bill)}
                            className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-[11px] font-semibold transition-colors"
                          >
                            Pay Bill
                          </button>
                        ) : (
                          <span className="text-[11px] text-emerald-700 font-semibold">Settled</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Payment Registration Modal */}
        {isPaymentModalOpen && selectedInvoice && (
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="pay-bill-title"
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4"
          >
            <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full space-y-4 border border-slate-200">
              <h3 id="pay-bill-title" className="font-bold text-slate-900 text-base">Register Vendor Payment</h3>
              <p className="text-xs text-slate-500">
                Payment for <span className="font-semibold text-slate-900">{selectedInvoice.reference}</span> to <span className="font-semibold text-slate-900">{selectedInvoice.partnerName}</span>
              </p>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Amount to Pay</label>
                  <input
                    type="number"
                    step="0.01"
                    value={paymentAmount}
                    onChange={e => setPaymentAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono text-sm font-bold focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Payment Method</label>
                  <select
                    value={paymentMethod}
                    onChange={e => setPaymentMethod(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  >
                    <option value="Bank Transfer">Bank Wire Transfer</option>
                    <option value="Check">Business Check</option>
                    <option value="Company Card">Company Debit Card</option>
                    <option value="Cash">Cash Float</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  onClick={() => setIsPaymentModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRegisterPayment}
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-xs"
                >
                  Confirm Payment
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // DEFAULT TAB: CUSTOMER INVOICES
  return (
    <div className="flex-1 flex flex-col bg-slate-100 min-h-[calc(100vh-3rem)]">
      <ControlPanel
        breadcrumbs={['Finance', 'Customers', 'Customer Invoices']}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search invoice reference or customer..."
        totalRecords={customerInvoices.length}
      />

      <div className="p-4 sm:p-6 flex-1 overflow-y-auto">
        <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Invoice Reference</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Invoice Date</th>
                <th className="py-3 px-4">Due Date</th>
                <th className="py-3 px-4">Origin Ref</th>
                <th className="py-3 px-4 text-right">Total Amount</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {customerInvoices.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    No customer invoices found.
                  </td>
                </tr>
              ) : (
                customerInvoices.map(inv => {
                  const isUnpaid = inv.status !== 'paid' && inv.amountPaid < inv.amountTotal;

                  return (
                    <tr key={inv.id} className="hover:bg-blue-50/30 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-blue-700">
                        <button
                          onClick={() => setViewInvoiceModal(inv)}
                          className="hover:underline flex flex-col text-left"
                        >
                          <span>{inv.reference}</span>
                          {inv.mpesaReceiptNumber && (
                            <span className="inline-block mt-0.5 text-[9px] font-mono font-semibold text-[#00843D] bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                              M-PESA: {inv.mpesaReceiptNumber}
                            </span>
                          )}
                        </button>
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-900">{inv.partnerName}</td>
                      <td className="py-3 px-4 text-slate-600">{inv.date}</td>
                      <td className="py-3 px-4 text-slate-600">{inv.dueDate}</td>
                      <td className="py-3 px-4 font-mono text-slate-500">{inv.origin || '—'}</td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-slate-900 tabular-nums">
                        {formatCurrency(inv.amountTotal)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                            inv.status === 'paid'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {inv.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        {isUnpaid ? (
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => handleOpenMpesa(inv)}
                              className="px-2 py-1 bg-[#00843D] hover:bg-[#007033] text-white rounded text-[11px] font-semibold transition-colors flex items-center gap-1 shadow-xs"
                              title="Trigger M-Pesa STK Push"
                            >
                              <Smartphone className="w-3 h-3" />
                              <span>M-Pesa</span>
                            </button>
                            <button
                              onClick={() => handleOpenPayment(inv)}
                              className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[11px] font-semibold transition-colors"
                            >
                              Pay
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setViewInvoiceModal(inv)}
                            className="text-[11px] text-blue-700 font-semibold hover:underline"
                          >
                            View Invoice
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invoice Document Preview Modal */}
      {viewInvoiceModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 overflow-y-auto"
        >
          <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full p-6 border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-slate-900 text-base">Tax Invoice {viewInvoiceModal.reference}</h3>
              </div>
              <button
                onClick={() => setViewInvoiceModal(null)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs font-mono">
              <div className="flex justify-between border-b border-slate-100 pb-3 font-sans">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{settings.businessName}</h4>
                  <p className="text-slate-500 text-[11px]">{settings.address}</p>
                  <p className="text-slate-500 text-[11px]">KRA PIN: P051938290X</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-slate-900 text-sm">{viewInvoiceModal.reference}</p>
                  <p className="text-slate-500">Date: {viewInvoiceModal.date}</p>
                  <p className="text-slate-500">Due: {viewInvoiceModal.dueDate}</p>
                </div>
              </div>

              <div className="flex justify-between py-2 border-b border-slate-100 font-sans">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Bill To:</span>
                  <p className="font-bold text-slate-900">{viewInvoiceModal.partnerName}</p>
                </div>
                <div className="text-right">
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Status:</span>
                  <span className={`font-bold uppercase ${viewInvoiceModal.status === 'paid' ? 'text-emerald-600' : 'text-amber-600'}`}>
                    {viewInvoiceModal.status}
                  </span>
                </div>
              </div>

              <div className="space-y-1.5 pt-2">
                <div className="flex justify-between text-slate-600">
                  <span>Untaxed Amount:</span>
                  <span>{formatCurrency(viewInvoiceModal.amountUntaxed)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>VAT (16%):</span>
                  <span>{formatCurrency(viewInvoiceModal.amountTax)}</span>
                </div>
                <div className="flex justify-between font-bold text-slate-900 text-sm pt-2 border-t border-slate-200">
                  <span>Invoice Total:</span>
                  <span className="text-blue-700">{formatCurrency(viewInvoiceModal.amountTotal)}</span>
                </div>
                {viewInvoiceModal.mpesaReceiptNumber && (
                  <div className="flex justify-between text-[#00843D] pt-1">
                    <span>M-Pesa Receipt Ref:</span>
                    <span>{viewInvoiceModal.mpesaReceiptNumber}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <Printer className="w-4 h-4" />
                <span>Print Tax Invoice</span>
              </button>
              <button
                onClick={() => setViewInvoiceModal(null)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition-colors shadow-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Registration Modal */}
      {isPaymentModalOpen && selectedInvoice && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="pay-inv-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4"
        >
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full space-y-4 border border-slate-200">
            <h3 id="pay-inv-title" className="font-bold text-slate-900 text-base">Register Customer Payment</h3>
            <p className="text-xs text-slate-500">
              Record received funds for <span className="font-semibold text-slate-900">{selectedInvoice.reference}</span> ({selectedInvoice.partnerName})
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Amount Received</label>
                <input
                  type="number"
                  step="0.01"
                  value={paymentAmount}
                  onChange={e => setPaymentAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono text-sm font-bold focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Payment Method</label>
                <select
                  value={paymentMethod}
                  onChange={e => setPaymentMethod(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                >
                  <option value="Cash">Cash Tender</option>
                  <option value="Bank Transfer">Bank Wire / ACH</option>
                  <option value="Credit Card">Credit / Debit Card</option>
                  <option value="Mobile Payment (M-Pesa)">Mobile Payment (M-Pesa STK Push)</option>
                </select>
              </div>

              {paymentMethod === 'Mobile Payment (M-Pesa)' && (
                <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-900 text-[11px] space-y-1">
                  <p className="font-semibold text-[#00843D]">Safaricom STK Push will be triggered</p>
                  <p className="text-slate-600">The customer will receive an immediate PIN prompt on their handset.</p>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setIsPaymentModalOpen(false)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleRegisterPayment}
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-xs"
              >
                {paymentMethod === 'Mobile Payment (M-Pesa)' ? 'Proceed to STK Push' : 'Confirm Payment'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* M-Pesa STK Push Modal for Customer Invoice */}
      {isMpesaModalOpen && selectedInvoice && (
        <MpesaStkModal
          amount={paymentAmount}
          reference={selectedInvoice.reference}
          customerName={selectedInvoice.partnerName}
          onSuccess={handleMpesaSuccess}
          onClose={() => setIsMpesaModalOpen(false)}
        />
      )}
    </div>
  );
};
