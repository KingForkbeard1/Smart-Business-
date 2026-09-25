import React, { useState, useMemo } from 'react';
import { useBusiness } from '../../context/BusinessContext';
import { SalesOrder, SalesOrderStatus, OrderLine } from '../../types';
import { ControlPanel } from '../layout/ControlPanel';
import {
  FileText,
  Plus,
  Trash2,
  CheckCircle,
  Clock,
  Send,
  AlertCircle,
  User,
  Building,
  ChevronLeft,
  X,
  CreditCard,
  Printer,
  Download,
  Share2
} from 'lucide-react';

interface SalesAppProps {
  activeTab?: string;
}

export const SalesApp: React.FC<SalesAppProps> = ({ activeTab = 'Quotations & Orders' }) => {
  const {
    salesOrders,
    customers,
    products,
    createSalesOrder,
    updateSalesOrderStatus,
    createInvoiceFromSalesOrder,
    formatCurrency,
    settings,
    setCurrentApp,
    currentBranch,
    activeCurrency
  } = useBusiness();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<SalesOrder | null>(null);
  const [viewProformaModal, setViewProformaModal] = useState<SalesOrder | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isCreatingNew, setIsCreatingNew] = useState<boolean>(false);

  // Form states for creating new quotation
  const [formCustomerId, setFormCustomerId] = useState<string>(customers[0]?.id || '');
  const [formLines, setFormLines] = useState<OrderLine[]>([]);

  // Filtered orders list
  const filteredOrders = useMemo(() => {
    return salesOrders.filter(order => {
      const matchSearch =
        order.reference.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.customerName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchStatus = statusFilter === 'all' || order.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [salesOrders, searchQuery, statusFilter]);

  // Handle line additions in new quote
  const handleAddLine = () => {
    if (products.length === 0) return;
    const defaultProduct = products[0];
    const newLine: OrderLine = {
      productId: defaultProduct.id,
      productName: defaultProduct.name,
      sku: defaultProduct.sku,
      quantity: 1,
      unitPrice: defaultProduct.salePrice,
      taxRate: settings.taxRate,
      subtotal: defaultProduct.salePrice
    };
    setFormLines(prev => [...prev, newLine]);
  };

  const handleUpdateLine = (index: number, productId: string, quantity: number, price: number) => {
    const prod = products.find(p => p.id === productId);
    if (!prod) return;
    setFormLines(prev =>
      prev.map((l, idx) => {
        if (idx !== index) return l;
        const subtotal = quantity * price;
        return {
          ...l,
          productId,
          productName: prod.name,
          sku: prod.sku,
          quantity,
          unitPrice: price,
          subtotal
        };
      })
    );
  };

  const handleRemoveLine = (index: number) => {
    setFormLines(prev => prev.filter((_, idx) => idx !== index));
  };

  const handleSaveQuotation = () => {
    const cust = customers.find(c => c.id === formCustomerId);
    if (!cust || formLines.length === 0) return;

    const subtotal = formLines.reduce((sum, l) => sum + l.subtotal, 0);
    const taxTotal = subtotal * settings.taxRate;
    const total = subtotal + taxTotal;

    const newOrder = createSalesOrder({
      customerId: cust.id,
      customerName: cust.name,
      lines: formLines,
      subtotal,
      taxTotal,
      total,
      status: 'quotation',
      source: 'sales_order'
    });

    setIsCreatingNew(false);
    setSelectedOrder(newOrder);
  };

  // Status stage progression
  const getStageClass = (currentStatus: SalesOrderStatus, targetStatus: SalesOrderStatus) => {
    const stages: SalesOrderStatus[] = ['quotation', 'quotation_sent', 'sales_order', 'invoiced'];
    const currentIdx = stages.indexOf(currentStatus);
    const targetIdx = stages.indexOf(targetStatus);

    if (currentStatus === targetStatus) {
      return 'bg-blue-600 text-white font-bold shadow-xs';
    }
    if (currentIdx > targetIdx) {
      return 'bg-emerald-50 text-emerald-800 font-medium';
    }
    return 'bg-slate-100 text-slate-400';
  };

  // Customers Directory Tab View
  if (activeTab === 'Customers Directory' || activeTab === 'Customers') {
    return (
      <div className="flex-1 flex flex-col bg-slate-100 min-h-[calc(100vh-3rem)]">
        <ControlPanel
          breadcrumbs={['Sales', 'Accounts & Customers']}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          totalRecords={customers.length}
        />

        <div className="p-4 sm:p-6 max-w-6xl w-full mx-auto space-y-4 flex-1 overflow-y-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {customers.map(c => (
              <div key={c.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3 hover:border-blue-300 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm">
                    {c.name.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-bold text-xs text-slate-900 truncate">{c.name}</h4>
                    {c.company && <p className="text-[11px] text-slate-500 truncate">{c.company}</p>}
                  </div>
                </div>

                <div className="space-y-1 text-[11px] text-slate-600 pt-2 border-t border-slate-100">
                  <p>Email: {c.email || '—'}</p>
                  <p>Phone: {c.phone || '—'}</p>
                  <p>Address: {c.street}, {c.city}</p>
                </div>

                <div className="flex justify-between items-center pt-2 border-t border-slate-100 font-mono text-xs">
                  <span className="text-slate-500">{c.ordersCount} orders</span>
                  <span className="font-bold text-slate-900">{formatCurrency(c.totalSpent)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Sales Analytics Tab
  if (activeTab === 'Sales Analytics' || activeTab === 'Reporting') {
    const totalSales = salesOrders.reduce((sum, o) => sum + (o.status !== 'cancelled' ? o.total : 0), 0);
    const confirmedCount = salesOrders.filter(o => o.status === 'sales_order' || o.status === 'invoiced').length;

    return (
      <div className="flex-1 flex flex-col bg-slate-100 min-h-[calc(100vh-3rem)]">
        <ControlPanel breadcrumbs={['Sales', 'Performance Analytics']} />

        <div className="p-4 sm:p-6 max-w-5xl w-full mx-auto space-y-6 flex-1 overflow-y-auto">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500 font-medium">Cumulative Gross Sales</span>
              <p className="text-2xl font-bold font-mono text-blue-700 tabular-nums mt-1">
                {formatCurrency(totalSales)}
              </p>
              <p className="text-[11px] text-slate-400 mt-1">All confirmed & completed sales orders</p>
            </div>
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500 font-medium">Order Confirmation Rate</span>
              <p className="text-2xl font-bold font-mono text-emerald-600 tabular-nums mt-1">
                {confirmedCount} orders
              </p>
              <p className="text-[11px] text-slate-400 mt-1">{((confirmedCount / Math.max(1, salesOrders.length)) * 100).toFixed(0)}% conversion rate</p>
            </div>
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500 font-medium">Average Order Value (AOV)</span>
              <p className="text-2xl font-bold font-mono text-blue-900 tabular-nums mt-1">
                {formatCurrency(totalSales / Math.max(1, salesOrders.length))}
              </p>
              <p className="text-[11px] text-slate-400 mt-1">Per transaction average</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ORDER FORM VIEW (Detailed Form with Status Ribbon)
  if (selectedOrder) {
    return (
      <div className="flex-1 flex flex-col bg-slate-100 min-h-[calc(100vh-3rem)]">
        {/* Form Control Subbar */}
        <div className="bg-white border-b border-slate-200 px-4 py-2.5 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSelectedOrder(null)}
              className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
              title="Back to Orders List"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div>
              <span className="text-xs text-slate-400 block leading-none">Sales Document</span>
              <h2 className="text-base font-bold font-mono text-slate-900 leading-tight">
                {selectedOrder.reference}
              </h2>
            </div>
          </div>

          {/* Status Pipeline Ribbon */}
          <div className="flex items-center text-xs font-semibold rounded-lg overflow-hidden border border-slate-200 bg-white">
            <div className={`px-3 py-1.5 ${getStageClass(selectedOrder.status, 'quotation')}`}>
              Quotation
            </div>
            <div className={`px-3 py-1.5 ${getStageClass(selectedOrder.status, 'quotation_sent')}`}>
              Quotation Sent
            </div>
            <div className={`px-3 py-1.5 ${getStageClass(selectedOrder.status, 'sales_order')}`}>
              Sales Order
            </div>
            <div className={`px-3 py-1.5 ${getStageClass(selectedOrder.status, 'invoiced')}`}>
              Invoiced
            </div>
          </div>
        </div>

        {/* Action Buttons Bar */}
        <div className="bg-slate-50 border-b border-slate-200 px-4 sm:px-6 py-2 flex flex-wrap items-center gap-2">
          {selectedOrder.status === 'quotation' && (
            <>
              <button
                onClick={() => updateSalesOrderStatus(selectedOrder.id, 'quotation_sent')}
                className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-semibold rounded-md transition-colors"
              >
                Send by Email
              </button>
              <button
                onClick={() => updateSalesOrderStatus(selectedOrder.id, 'sales_order')}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-md shadow-xs transition-colors"
              >
                Confirm Order
              </button>
            </>
          )}

          {selectedOrder.status === 'quotation_sent' && (
            <button
              onClick={() => updateSalesOrderStatus(selectedOrder.id, 'sales_order')}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-md shadow-xs transition-colors"
            >
              Confirm Order
            </button>
          )}

          {selectedOrder.status === 'sales_order' && (
            <button
              onClick={() => {
                const inv = createInvoiceFromSalesOrder(selectedOrder.id);
                if (inv) {
                  setSelectedOrder({ ...selectedOrder, status: 'invoiced', invoiceId: inv.id });
                }
              }}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-md shadow-xs transition-colors"
            >
              Create Tax Invoice
            </button>
          )}

          {selectedOrder.status === 'invoiced' && (
            <button
              onClick={() => setCurrentApp('accounting')}
              className="px-3 py-1.5 bg-blue-800 hover:bg-blue-900 text-white text-xs font-semibold rounded-md shadow-xs transition-colors"
            >
              View Invoices in Accounting
            </button>
          )}

          <button
            onClick={() => setViewProformaModal(selectedOrder)}
            className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Pro-Forma</span>
          </button>

          {selectedOrder.status !== 'cancelled' && (
            <button
              onClick={() => updateSalesOrderStatus(selectedOrder.id, 'cancelled')}
              className="px-3 py-1.5 text-rose-600 hover:bg-rose-50 text-xs font-semibold rounded-md transition-colors ml-auto"
            >
              Cancel Order
            </button>
          )}
        </div>

        {/* Order Document Sheet */}
        <div className="p-4 sm:p-6 max-w-4xl w-full mx-auto flex-1 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-xl shadow-xs p-6 space-y-6">
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <label className="text-slate-400 block font-medium">Customer</label>
                <p className="text-sm font-bold text-slate-900 mt-0.5">{selectedOrder.customerName}</p>
                <p className="text-slate-500 text-[11px]">Invoice Address: Commercial Deliveries / Counter</p>
                <p className="text-slate-500 text-[11px]">Branch: {currentBranch.name}</p>
              </div>
              <div className="text-right">
                <label className="text-slate-400 block font-medium">Order Date</label>
                <p className="text-sm font-mono text-slate-900 mt-0.5">{selectedOrder.date}</p>
                <p className="text-slate-500 text-[11px]">Source: {selectedOrder.source === 'pos' ? 'Point of Sale' : 'Commercial Quote'}</p>
              </div>
            </div>

            {/* Order Lines Table */}
            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-2.5 px-3">Product</th>
                    <th className="py-2.5 px-3">SKU</th>
                    <th className="py-2.5 px-3 text-right">Quantity</th>
                    <th className="py-2.5 px-3 text-right">Unit Price</th>
                    <th className="py-2.5 px-3 text-right">Taxes</th>
                    <th className="py-2.5 px-3 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {selectedOrder.lines.map((l, idx) => (
                    <tr key={idx}>
                      <td className="py-2.5 px-3 font-semibold text-slate-900">{l.productName}</td>
                      <td className="py-2.5 px-3 font-mono text-slate-500">{l.sku}</td>
                      <td className="py-2.5 px-3 text-right font-mono tabular-nums">{l.quantity}</td>
                      <td className="py-2.5 px-3 text-right font-mono tabular-nums">{formatCurrency(l.unitPrice)}</td>
                      <td className="py-2.5 px-3 text-right font-mono text-slate-500 tabular-nums">
                        {(l.taxRate * 100).toFixed(0)}%
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900 tabular-nums">
                        {formatCurrency(l.subtotal)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals Summary */}
            <div className="flex justify-end">
              <div className="w-64 space-y-2 text-xs border-t border-slate-100 pt-3">
                <div className="flex justify-between text-slate-600">
                  <span>Untaxed Amount</span>
                  <span className="font-mono tabular-nums">{formatCurrency(selectedOrder.subtotal)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Taxes ({(settings.taxRate * 100).toFixed(1)}%)</span>
                  <span className="font-mono tabular-nums">{formatCurrency(selectedOrder.taxTotal)}</span>
                </div>
                <div className="flex justify-between font-bold text-sm text-slate-900 pt-2 border-t border-slate-200">
                  <span>Total</span>
                  <span className="font-mono text-base text-blue-700 tabular-nums">{formatCurrency(selectedOrder.total)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Pro-Forma Invoice Modal */}
        {viewProformaModal && (
          <div
            role="dialog"
            aria-modal="true"
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 overflow-y-auto"
          >
            <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full p-6 border border-slate-200 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  <h3 className="font-bold text-slate-900 text-base">Pro-Forma Commercial Quotation</h3>
                </div>
                <button
                  onClick={() => setViewProformaModal(null)}
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
                    <p className="text-slate-500 text-[11px]">Tel: {settings.phone}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-slate-900 text-sm">{viewProformaModal.reference}</p>
                    <p className="text-slate-500">Date: {viewProformaModal.date}</p>
                    <p className="text-slate-500">Validity: 30 Days</p>
                  </div>
                </div>

                <div className="py-2 border-b border-slate-100 font-sans">
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Prepared For:</span>
                  <p className="font-bold text-slate-900">{viewProformaModal.customerName}</p>
                </div>

                <div className="space-y-1.5 pt-2">
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal:</span>
                    <span>{formatCurrency(viewProformaModal.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>VAT (16%):</span>
                    <span>{formatCurrency(viewProformaModal.taxTotal)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-slate-900 text-sm pt-2 border-t border-slate-200">
                    <span>Quotation Total:</span>
                    <span className="text-blue-700">{formatCurrency(viewProformaModal.total)}</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Document</span>
                </button>
                <button
                  onClick={() => setViewProformaModal(null)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition-colors shadow-xs"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // CREATE NEW QUOTATION MODAL
  if (isCreatingNew) {
    const formSubtotal = formLines.reduce((s, l) => s + l.subtotal, 0);
    const formTax = formSubtotal * settings.taxRate;
    const formTotal = formSubtotal + formTax;

    return (
      <div className="flex-1 flex flex-col bg-slate-100 min-h-[calc(100vh-3rem)]">
        <div className="bg-white border-b border-slate-200 px-4 py-2.5 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsCreatingNew(false)}
              className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h2 className="text-base font-bold text-slate-900">New Sales Quotation</h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsCreatingNew(false)}
              className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-md"
            >
              Discard
            </button>
            <button
              onClick={handleSaveQuotation}
              disabled={formLines.length === 0}
              className={`px-4 py-1.5 rounded-md text-xs font-semibold shadow-xs ${
                formLines.length === 0
                  ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              Save Quotation
            </button>
          </div>
        </div>

        <div className="p-4 sm:p-6 max-w-4xl w-full mx-auto space-y-6 flex-1 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-xl shadow-xs p-6 space-y-6">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Customer Account</label>
              <select
                value={formCustomerId}
                onChange={e => setFormCustomerId(e.target.value)}
                className="w-full sm:w-80 px-3 py-2 border border-slate-300 rounded-lg text-xs"
              >
                {customers.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name} {c.company ? `(${c.company})` : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Order Lines */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Order Product Lines</h4>
                <button
                  type="button"
                  onClick={handleAddLine}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-blue-700 hover:underline"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add a product line</span>
                </button>
              </div>

              {formLines.length === 0 ? (
                <div className="p-6 text-center border-2 border-dashed border-slate-200 rounded-lg text-slate-400 text-xs">
                  Click "Add a product line" to select items for this commercial quotation.
                </div>
              ) : (
                <div className="space-y-2">
                  {formLines.map((line, idx) => (
                    <div key={idx} className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg border border-slate-200 text-xs">
                      <select
                        value={line.productId}
                        onChange={e => handleUpdateLine(idx, e.target.value, line.quantity, line.unitPrice)}
                        className="flex-1 px-2.5 py-1.5 border border-slate-300 rounded bg-white text-xs"
                      >
                        {products.map(p => (
                          <option key={p.id} value={p.id}>
                            {p.name} ({formatCurrency(p.salePrice)})
                          </option>
                        ))}
                      </select>

                      <div className="flex items-center gap-1 w-24">
                        <span className="text-[11px] text-slate-400">Qty:</span>
                        <input
                          type="number"
                          min="1"
                          value={line.quantity}
                          onChange={e => handleUpdateLine(idx, line.productId, Number(e.target.value), line.unitPrice)}
                          className="w-14 px-2 py-1 font-mono border border-slate-300 rounded text-center bg-white"
                        />
                      </div>

                      <div className="flex items-center gap-1 w-28">
                        <span className="text-[11px] text-slate-400">Price:</span>
                        <input
                          type="number"
                          step="0.01"
                          value={line.unitPrice}
                          onChange={e => handleUpdateLine(idx, line.productId, line.quantity, Number(e.target.value))}
                          className="w-16 px-2 py-1 font-mono border border-slate-300 rounded text-right bg-white"
                        />
                      </div>

                      <span className="w-24 text-right font-mono font-bold text-slate-900 tabular-nums">
                        {formatCurrency(line.subtotal)}
                      </span>

                      <button
                        type="button"
                        onClick={() => handleRemoveLine(idx)}
                        className="text-slate-400 hover:text-rose-600 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Totals */}
            <div className="flex justify-end pt-3 border-t border-slate-100">
              <div className="w-64 space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal</span>
                  <span className="font-mono tabular-nums">{formatCurrency(formSubtotal)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Taxes ({(settings.taxRate * 100).toFixed(1)}%)</span>
                  <span className="font-mono tabular-nums">{formatCurrency(formTax)}</span>
                </div>
                <div className="flex justify-between font-bold text-sm text-slate-900 pt-1.5 border-t border-slate-200">
                  <span>Total</span>
                  <span className="font-mono text-base text-blue-700 tabular-nums">{formatCurrency(formTotal)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // DEFAULT ORDERS LIST VIEW
  return (
    <div className="flex-1 flex flex-col bg-slate-100 min-h-[calc(100vh-3rem)]">
      <ControlPanel
        breadcrumbs={['Sales', 'Quotations & Orders']}
        primaryActionLabel="New Quotation"
        onPrimaryAction={() => {
          setIsCreatingNew(true);
          setFormLines([]);
          handleAddLine();
        }}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search order reference or customer..."
        totalRecords={filteredOrders.length}
      />

      {/* Status filter bar */}
      <div className="bg-white border-b border-slate-200 px-4 py-2 flex items-center gap-1.5 text-xs overflow-x-auto">
        {['all', 'quotation', 'quotation_sent', 'sales_order', 'invoiced', 'cancelled'].map(st => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            className={`px-3 py-1 rounded-md font-semibold transition-colors capitalize whitespace-nowrap ${
              statusFilter === st
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {st.replace('_', ' ')}
          </button>
        ))}
      </div>

      <div className="p-4 sm:p-6 flex-1 overflow-y-auto">
        <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Order Number</th>
                <th className="py-3 px-4">Order Date</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Origin / Channel</th>
                <th className="py-3 px-4 text-right">Total Amount</th>
                <th className="py-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    No orders match your filter criteria.
                  </td>
                </tr>
              ) : (
                filteredOrders.map(order => (
                  <tr
                    key={order.id}
                    onClick={() => setSelectedOrder(order)}
                    className="hover:bg-blue-50/30 cursor-pointer transition-colors"
                  >
                    <td className="py-3 px-4 font-mono font-bold text-blue-700">
                      {order.reference}
                    </td>
                    <td className="py-3 px-4 text-slate-600">{order.date}</td>
                    <td className="py-3 px-4 font-semibold text-slate-900">{order.customerName}</td>
                    <td className="py-3 px-4">
                      <span className="text-[10px] uppercase font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                        {order.source}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-900 tabular-nums">
                      {formatCurrency(order.total)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                          order.status === 'invoiced'
                            ? 'bg-emerald-100 text-emerald-800'
                            : order.status === 'sales_order'
                            ? 'bg-blue-100 text-blue-800'
                            : order.status === 'quotation'
                            ? 'bg-slate-100 text-slate-700'
                            : order.status === 'quotation_sent'
                            ? 'bg-sky-100 text-sky-800'
                            : 'bg-rose-100 text-rose-700'
                        }`}
                      >
                        {order.status.replace('_', ' ')}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
