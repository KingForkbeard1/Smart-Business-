import React from 'react';
import { useBusiness } from '../../context/BusinessContext';
import { SalesOrder } from '../../types';
import { Printer, CheckCircle2, X } from 'lucide-react';

interface ReceiptModalProps {
  order: SalesOrder | null;
  changeDue: number;
  cashTendered?: number;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  order,
  changeDue,
  cashTendered,
  onClose
}) => {
  const { settings, formatCurrency, currentUser } = useBusiness();

  if (!order) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="receipt-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 overflow-y-auto"
    >
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        {/* Top Header Bar */}
        <div className="bg-[#0F1E36] text-white px-5 py-3.5 flex items-center justify-between border-b border-blue-900/60">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span id="receipt-title" className="font-semibold text-sm">Payment Successful</span>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-1 rounded-md hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Change Due Callout */}
        {order.paymentMethod === 'cash' && changeDue > 0 && (
          <div className="bg-emerald-50 border-b border-emerald-100 px-6 py-3 text-center">
            <p className="text-xs uppercase tracking-wider text-emerald-700 font-semibold">
              Change Due to Customer
            </p>
            <p className="text-2xl font-bold font-mono text-emerald-800 tabular-nums">
              {formatCurrency(changeDue)}
            </p>
          </div>
        )}

        {/* Thermal Receipt Paper */}
        <div className="p-6 font-mono text-xs text-slate-800 space-y-4 max-h-[60vh] overflow-y-auto">
          {/* Store Brand */}
          <div className="text-center space-y-1 border-b border-dashed border-slate-300 pb-3">
            <h2 className="font-bold text-base tracking-tight text-slate-900 font-sans">
              {settings.businessName}
            </h2>
            <p className="text-slate-500 text-[11px]">{settings.address}</p>
            <p className="text-slate-500 text-[11px]">Tel: {settings.phone}</p>
          </div>

          {/* Metadata */}
          <div className="space-y-1 text-[11px] text-slate-600 border-b border-dashed border-slate-300 pb-3">
            <div className="flex justify-between">
              <span>Receipt Ref:</span>
              <span className="font-semibold text-slate-900">{order.reference}</span>
            </div>
            <div className="flex justify-between">
              <span>Date:</span>
              <span>{order.date}</span>
            </div>
            <div className="flex justify-between">
              <span>Cashier:</span>
              <span>{currentUser.name}</span>
            </div>
            <div className="flex justify-between">
              <span>Customer:</span>
              <span>{order.customerName}</span>
            </div>
          </div>

          {/* Item Lines */}
          <div className="space-y-2 border-b border-dashed border-slate-300 pb-3">
            <div className="flex justify-between font-semibold text-slate-900 text-[11px] pb-1 border-b border-slate-200">
              <span className="w-8">Qty</span>
              <span className="flex-1 px-1">Item</span>
              <span className="text-right">Total</span>
            </div>
            {order.lines.map((line, idx) => (
              <div key={idx} className="flex justify-between text-[11px] leading-tight">
                <span className="w-8 text-slate-500">{line.quantity}x</span>
                <span className="flex-1 px-1 text-slate-800 line-clamp-1">{line.productName}</span>
                <span className="text-right font-medium text-slate-900 tabular-nums">
                  {formatCurrency(line.subtotal)}
                </span>
              </div>
            ))}
          </div>

          {/* Financial Totals */}
          <div className="space-y-1.5 text-xs border-b border-dashed border-slate-300 pb-3">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal</span>
              <span className="tabular-nums">{formatCurrency(order.subtotal)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>{settings.taxName} ({(settings.taxRate * 100).toFixed(1)}%)</span>
              <span className="tabular-nums">{formatCurrency(order.taxTotal)}</span>
            </div>
            <div className="flex justify-between font-bold text-sm text-slate-900 pt-1 border-t border-slate-200">
              <span>TOTAL</span>
              <span className="tabular-nums">{formatCurrency(order.total)}</span>
            </div>
          </div>

          {/* Payment Method Details */}
          <div className="space-y-1 text-[11px] text-slate-600 border-b border-dashed border-slate-300 pb-3">
            <div className="flex justify-between">
              <span>Payment Mode:</span>
              <span className="font-semibold uppercase text-slate-800">
                {order.mpesaReceiptNumber ? 'LIPA NA M-PESA' : order.paymentMethod}
              </span>
            </div>
            {order.mpesaReceiptNumber && (
              <>
                <div className="flex justify-between font-bold text-[#00843D]">
                  <span>M-PESA REF:</span>
                  <span className="font-mono">{order.mpesaReceiptNumber}</span>
                </div>
                {order.mpesaPhoneNumber && (
                  <div className="flex justify-between text-slate-500">
                    <span>Sender Phone:</span>
                    <span className="font-mono">+{order.mpesaPhoneNumber}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-500">
                  <span>Merchant Recipient:</span>
                  <span className="font-mono font-medium text-slate-800">
                    {settings.mpesa?.receivingPhone || '0757329235'} ({settings.mpesa?.ownerName || 'Victor Mwangi'})
                  </span>
                </div>
              </>
            )}
            {cashTendered !== undefined && order.paymentMethod === 'cash' && (
              <>
                <div className="flex justify-between">
                  <span>Cash Received:</span>
                  <span className="tabular-nums">{formatCurrency(cashTendered)}</span>
                </div>
                <div className="flex justify-between font-semibold text-slate-900">
                  <span>Change Given:</span>
                  <span className="tabular-nums">{formatCurrency(changeDue)}</span>
                </div>
              </>
            )}
          </div>

          {/* Barcode Graphic Simulation */}
          <div className="text-center pt-1 space-y-1">
            <div className="flex justify-center items-center gap-[2px] h-9 mx-auto w-48 bg-slate-900/10 p-1 rounded">
              {Array.from({ length: 36 }).map((_, i) => (
                <div
                  key={i}
                  className={`h-full ${
                    i % 3 === 0 ? 'w-1 bg-black' : i % 5 === 0 ? 'w-0.5 bg-black' : 'w-1 bg-transparent'
                  }`}
                />
              ))}
            </div>
            <p className="text-[10px] text-slate-400 tracking-widest">{order.reference}</p>
          </div>

          {/* Footer note */}
          <p className="text-center text-[10px] text-slate-400 pt-1 italic font-sans">
            {settings.receiptFooter}
          </p>
        </div>

        {/* Modal Action Buttons */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
          <button
            onClick={handlePrint}
            className="flex-1 inline-flex items-center justify-center gap-2 py-2 px-4 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-semibold rounded-lg transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>Print Receipt</span>
          </button>
          <button
            onClick={onClose}
            className="flex-1 inline-flex items-center justify-center gap-2 py-2 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
          >
            <span>Next Customer</span>
          </button>
        </div>
      </div>
    </div>
  );
};
