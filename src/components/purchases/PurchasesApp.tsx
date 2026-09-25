import React, { useState, useMemo } from 'react';
import { useBusiness } from '../../context/BusinessContext';
import { PurchaseOrder, PurchaseOrderStatus, PurchaseOrderLine } from '../../types';
import { ControlPanel } from '../layout/ControlPanel';
import {
  Truck,
  PackageCheck,
  Receipt,
  Plus,
  Trash2,
  ChevronLeft,
  CheckCircle2,
  AlertCircle,
  FileCheck,
  ShieldCheck,
  Building,
  ArrowRight
} from 'lucide-react';

interface PurchasesAppProps {
  activeTab?: string;
}

export const PurchasesApp: React.FC<PurchasesAppProps> = ({ activeTab = 'Purchase Orders' }) => {
  const {
    purchaseOrders,
    vendors,
    products,
    createPurchaseOrder,
    receivePurchaseOrder,
    createBillFromPurchaseOrder,
    formatCurrency,
    settings,
    setCurrentApp,
    currentBranch
  } = useBusiness();

  const [selectedPO, setSelectedPO] = useState<PurchaseOrder | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // New PO form state
  const [formVendorId, setFormVendorId] = useState<string>(vendors[0]?.id || '');
  const [formLines, setFormLines] = useState<PurchaseOrderLine[]>([]);

  const filteredPOs = useMemo(() => {
    return purchaseOrders.filter(po => {
      const matchSearch =
        po.reference.toLowerCase().includes(searchQuery.toLowerCase()) ||
        po.vendorName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchStatus = statusFilter === 'all' || po.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [purchaseOrders, searchQuery, statusFilter]);

  const handleAddLine = () => {
    const prod = products[0];
    if (!prod) return;
    setFormLines(prev => [
      ...prev,
      {
        productId: prod.id,
        productName: prod.name,
        quantity: 10,
        unitCost: prod.costPrice,
        subtotal: 10 * prod.costPrice
      }
    ]);
  };

  const handleUpdateLine = (index: number, productId: string, quantity: number, unitCost: number) => {
    const prod = products.find(p => p.id === productId);
    if (!prod) return;
    setFormLines(prev =>
      prev.map((line, idx) => {
        if (idx === index) {
          const qty = Math.max(1, quantity);
          const cost = Number(unitCost);
          return {
            ...line,
            productId: prod.id,
            productName: prod.name,
            quantity: qty,
            unitCost: cost,
            subtotal: qty * cost
          };
        }
        return line;
      })
    );
  };

  const handleRemoveLine = (index: number) => {
    setFormLines(prev => prev.filter((_, idx) => idx !== index));
  };

  const handleSavePO = () => {
    if (formLines.length === 0) return;
    const vendor = vendors.find(v => v.id === formVendorId) || vendors[0];
    const subtotal = formLines.reduce((s, l) => s + l.subtotal, 0);
    const taxTotal = subtotal * settings.taxRate;
    const total = subtotal + taxTotal;

    const newPO = createPurchaseOrder({
      vendorId: vendor.id,
      vendorName: vendor.name,
      lines: formLines,
      subtotal,
      taxTotal,
      total,
      status: 'purchase_order'
    });

    setIsCreatingNew(false);
    setSelectedPO(newPO);
    setFormLines([]);
  };

  // Status Stage ribbon styling
  const getStageClass = (currentStatus: PurchaseOrderStatus, targetStatus: PurchaseOrderStatus) => {
    const stages: PurchaseOrderStatus[] = ['draft_rfq', 'rfq_sent', 'purchase_order', 'received', 'billed'];
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

  // 1. 3-WAY MATCH AUDIT TAB (Enterprise Odoo Competitor)
  if (activeTab === '3-Way Match Audit') {
    return (
      <div className="flex-1 flex flex-col bg-slate-100 min-h-[calc(100vh-3rem)]">
        <ControlPanel
          breadcrumbs={['Purchases', 'Enterprise Compliance', '3-Way Match Reconciliation']}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          searchPlaceholder="Search audit reference..."
          totalRecords={purchaseOrders.length}
        />

        <div className="p-4 sm:p-6 space-y-4 max-w-7xl w-full mx-auto flex-1 overflow-y-auto">
          {/* Info Banner */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-blue-600" />
                <span>Enterprise 3-Way Match Internal Controls</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Audit validation checking: Purchase Order (PO) ↔ Goods Received Note (GRN) ↔ Vendor Invoice Bill. Prevents overpayment and ghost inventory.
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 bg-blue-50 text-blue-800 border border-blue-200 rounded-lg">
              Active Branch: {currentBranch.name}
            </span>
          </div>

          {/* Audit Grid */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4">PO Reference</th>
                  <th className="py-3 px-4">Supplier / Vendor</th>
                  <th className="py-3 px-4">PO Amount</th>
                  <th className="py-3 px-4 text-center">Step 1: PO Issued</th>
                  <th className="py-3 px-4 text-center">Step 2: GRN Received</th>
                  <th className="py-3 px-4 text-center">Step 3: Bill Matched</th>
                  <th className="py-3 px-4 text-center">3-Way Audit Status</th>
                  <th className="py-3 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {purchaseOrders.map(po => {
                  const isMatchComplete = po.productsReceived && po.billed;
                  const isPartiallyPending = po.productsReceived && !po.billed;

                  return (
                    <tr key={po.id} className="hover:bg-blue-50/30 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-blue-700">{po.reference}</td>
                      <td className="py-3 px-4 font-semibold text-slate-900">{po.vendorName}</td>
                      <td className="py-3 px-4 font-mono font-bold text-slate-900 tabular-nums">
                        {formatCurrency(po.total)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                          Approved ✓
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                          po.productsReceived ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {po.productsReceived ? 'GRN Verified' : 'Awaiting Delivery'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                          po.billed ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-500'
                        }`}>
                          {po.billed ? 'Bill Matched' : 'Pending Vendor Bill'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        {isMatchComplete ? (
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                            3-Way Matched ✓
                          </span>
                        ) : isPartiallyPending ? (
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                            Awaiting Bill
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                            Pending Receipt
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => setSelectedPO(po)}
                          className="text-[11px] text-blue-700 font-semibold hover:underline"
                        >
                          Review PO
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // 2. VENDORS TAB VIEW
  if (activeTab === 'Suppliers / Vendors') {
    return (
      <div className="flex-1 flex flex-col bg-slate-100 min-h-[calc(100vh-3rem)]">
        <ControlPanel
          breadcrumbs={['Purchases', 'Suppliers & Vendors']}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          totalRecords={vendors.length}
        />

        <div className="p-4 sm:p-6 max-w-5xl w-full mx-auto space-y-4 flex-1 overflow-y-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {vendors.map(v => (
              <div key={v.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3 hover:border-blue-300 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm">
                    {v.name.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-bold text-xs text-slate-900 leading-snug truncate">{v.name}</h4>
                    <p className="text-[11px] text-slate-500 truncate">Rep: {v.contactPerson}</p>
                  </div>
                </div>

                <div className="space-y-1 text-[11px] text-slate-600 pt-2 border-t border-slate-100">
                  <p>Email: {v.email}</p>
                  <p>Phone: {v.phone}</p>
                  <p className="font-semibold text-slate-800">Terms: {v.paymentTerms}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // 3. PURCHASE ORDER DETAIL FORM
  if (selectedPO) {
    return (
      <div className="flex-1 flex flex-col bg-slate-100 min-h-[calc(100vh-3rem)]">
        <div className="bg-white border-b border-slate-200 px-4 py-2.5 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSelectedPO(null)}
              className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div>
              <span className="text-xs text-slate-400 block leading-none">Purchase Order Document</span>
              <h2 className="text-base font-bold font-mono text-slate-900 leading-tight">
                {selectedPO.reference}
              </h2>
            </div>
          </div>

          <div className="flex items-center text-xs font-semibold rounded-lg overflow-hidden border border-slate-200 bg-white">
            <div className={`px-3 py-1.5 ${getStageClass(selectedPO.status, 'draft_rfq')}`}>
              RFQ
            </div>
            <div className={`px-3 py-1.5 ${getStageClass(selectedPO.status, 'purchase_order')}`}>
              PO Confirmed
            </div>
            <div className={`px-3 py-1.5 ${getStageClass(selectedPO.status, 'received')}`}>
              Products Received
            </div>
            <div className={`px-3 py-1.5 ${getStageClass(selectedPO.status, 'billed')}`}>
              Billed
            </div>
          </div>
        </div>

        {/* Action Buttons Bar with Cross-Module Workflows */}
        <div className="bg-slate-50 border-b border-slate-200 px-4 sm:px-6 py-2.5 flex items-center gap-2 flex-wrap">
          {!selectedPO.productsReceived && (
            <button
              onClick={() => {
                receivePurchaseOrder(selectedPO.id);
                setSelectedPO({ ...selectedPO, productsReceived: true, status: 'received' });
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
            >
              <PackageCheck className="w-4 h-4" />
              <span>Receive Products into Inventory</span>
            </button>
          )}

          {selectedPO.productsReceived && !selectedPO.billed && (
            <button
              onClick={() => {
                const bill = createBillFromPurchaseOrder(selectedPO.id);
                if (bill) {
                  setSelectedPO({ ...selectedPO, billed: true, billId: bill.id, status: 'billed' });
                }
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
            >
              <Receipt className="w-4 h-4" />
              <span>Generate Vendor Bill in Accounting</span>
            </button>
          )}

          {selectedPO.productsReceived && (
            <span className="inline-flex items-center gap-1 text-xs text-emerald-700 font-semibold bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg">
              <CheckCircle2 className="w-4 h-4" />
              <span>GRN Recorded · Stock incremented</span>
            </span>
          )}

          {selectedPO.billed && (
            <button
              onClick={() => setCurrentApp('accounting')}
              className="inline-flex items-center gap-1 text-xs text-blue-700 font-semibold bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <span>View Vendor Bill ({selectedPO.billId})</span>
            </button>
          )}
        </div>

        {/* Document Sheet */}
        <div className="p-4 sm:p-6 max-w-4xl w-full mx-auto flex-1 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-xl shadow-xs p-6 space-y-6">
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <label className="text-slate-400 block font-medium">Vendor / Supplier</label>
                <p className="text-sm font-bold text-slate-900 mt-0.5">{selectedPO.vendorName}</p>
                <p className="text-slate-500 text-[11px]">Warehouse Destination: {currentBranch.name}</p>
              </div>
              <div className="text-right">
                <label className="text-slate-400 block font-medium">Order Date</label>
                <p className="text-sm font-mono text-slate-900 mt-0.5">{selectedPO.orderDate}</p>
                <p className="text-slate-500 text-[11px]">Expected Delivery: {selectedPO.expectedDate}</p>
              </div>
            </div>

            {/* Lines */}
            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-2.5 px-3">Product Description</th>
                    <th className="py-2.5 px-3 text-right">Quantity Ordered</th>
                    <th className="py-2.5 px-3 text-right">Unit Cost</th>
                    <th className="py-2.5 px-3 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {selectedPO.lines.map((l, idx) => (
                    <tr key={idx}>
                      <td className="py-2.5 px-3 font-semibold text-slate-900">{l.productName}</td>
                      <td className="py-2.5 px-3 text-right font-mono tabular-nums">{l.quantity}</td>
                      <td className="py-2.5 px-3 text-right font-mono tabular-nums">{formatCurrency(l.unitCost)}</td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900 tabular-nums">
                        {formatCurrency(l.subtotal)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Summary */}
            <div className="flex justify-end">
              <div className="w-64 space-y-2 text-xs border-t border-slate-100 pt-3">
                <div className="flex justify-between text-slate-600">
                  <span>Untaxed Amount</span>
                  <span className="font-mono tabular-nums">{formatCurrency(selectedPO.subtotal)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Estimated Tax ({(settings.taxRate * 100).toFixed(1)}%)</span>
                  <span className="font-mono tabular-nums">{formatCurrency(selectedPO.taxTotal)}</span>
                </div>
                <div className="flex justify-between font-bold text-sm text-slate-900 pt-2 border-t border-slate-200">
                  <span>Total Cost</span>
                  <span className="font-mono text-base text-blue-700 tabular-nums">{formatCurrency(selectedPO.total)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 4. CREATE NEW PO
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
            <h2 className="text-base font-bold text-slate-900">New Purchase Order</h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsCreatingNew(false)}
              className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-md"
            >
              Discard
            </button>
            <button
              onClick={handleSavePO}
              disabled={formLines.length === 0}
              className={`px-4 py-1.5 rounded-md text-xs font-semibold shadow-xs ${
                formLines.length === 0
                  ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              Confirm Purchase Order
            </button>
          </div>
        </div>

        <div className="p-4 sm:p-6 max-w-4xl w-full mx-auto space-y-6 flex-1 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-xl shadow-xs p-6 space-y-6">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Vendor / Supplier</label>
              <select
                value={formVendorId}
                onChange={e => setFormVendorId(e.target.value)}
                className="w-full sm:w-80 px-3 py-2 border border-slate-300 rounded-lg text-xs"
              >
                {vendors.map(v => (
                  <option key={v.id} value={v.id}>
                    {v.name} ({v.contactPerson})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Products to Replenish</h4>
                <button
                  type="button"
                  onClick={handleAddLine}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-blue-700 hover:underline"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add product item</span>
                </button>
              </div>

              {formLines.length === 0 ? (
                <div className="p-6 text-center border-2 border-dashed border-slate-200 rounded-lg text-slate-400 text-xs">
                  Click "Add product item" to build this replenishment order.
                </div>
              ) : (
                <div className="space-y-2">
                  {formLines.map((line, idx) => (
                    <div key={idx} className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg border border-slate-200 text-xs">
                      <select
                        value={line.productId}
                        onChange={e => handleUpdateLine(idx, e.target.value, line.quantity, line.unitCost)}
                        className="flex-1 px-2.5 py-1.5 border border-slate-300 rounded bg-white text-xs"
                      >
                        {products.map(p => (
                          <option key={p.id} value={p.id}>
                            {p.name} (Current Stock: {p.stockOnHand} {p.unit})
                          </option>
                        ))}
                      </select>

                      <div className="flex items-center gap-1 w-24">
                        <span className="text-[11px] text-slate-400">Qty:</span>
                        <input
                          type="number"
                          min="1"
                          value={line.quantity}
                          onChange={e => handleUpdateLine(idx, line.productId, Number(e.target.value), line.unitCost)}
                          className="w-14 px-2 py-1 font-mono border border-slate-300 rounded text-center bg-white"
                        />
                      </div>

                      <div className="flex items-center gap-1 w-28">
                        <span className="text-[11px] text-slate-400">Cost:</span>
                        <input
                          type="number"
                          step="0.01"
                          value={line.unitCost}
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

  // DEFAULT PO LIST
  return (
    <div className="flex-1 flex flex-col bg-slate-100 min-h-[calc(100vh-3rem)]">
      <ControlPanel
        breadcrumbs={['Purchases', 'Purchase Orders']}
        primaryActionLabel="New Purchase Order"
        onPrimaryAction={() => {
          setIsCreatingNew(true);
          setFormLines([]);
          handleAddLine();
        }}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search PO reference or vendor..."
        totalRecords={filteredPOs.length}
      />

      <div className="p-4 sm:p-6 flex-1 overflow-y-auto">
        <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">PO Reference</th>
                <th className="py-3 px-4">Vendor</th>
                <th className="py-3 px-4">Order Date</th>
                <th className="py-3 px-4 text-center">Receipt Status</th>
                <th className="py-3 px-4 text-center">Billing Status</th>
                <th className="py-3 px-4 text-right">Total Amount</th>
                <th className="py-3 px-4 text-center">Stage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPOs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No purchase orders recorded yet.
                  </td>
                </tr>
              ) : (
                filteredPOs.map(po => (
                  <tr
                    key={po.id}
                    onClick={() => setSelectedPO(po)}
                    className="hover:bg-blue-50/30 cursor-pointer transition-colors"
                  >
                    <td className="py-3 px-4 font-mono font-bold text-blue-700">
                      {po.reference}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-900">{po.vendorName}</td>
                    <td className="py-3 px-4 text-slate-600">{po.orderDate}</td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                          po.productsReceived
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {po.productsReceived ? 'Received' : 'Pending Delivery'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                          po.billed
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {po.billed ? 'Billed' : 'Waiting Bills'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-900 tabular-nums">
                      {formatCurrency(po.total)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                        {po.status.replace('_', ' ')}
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
