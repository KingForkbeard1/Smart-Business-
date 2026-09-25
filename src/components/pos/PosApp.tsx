import React, { useState, useMemo } from 'react';
import { useBusiness } from '../../context/BusinessContext';
import { Product, Customer, SalesOrder } from '../../types';
import { ReceiptModal } from './ReceiptModal';
import { MpesaStkModal } from '../mpesa/MpesaStkModal';
import {
  Search,
  Barcode,
  Plus,
  Minus,
  Trash2,
  User,
  CreditCard,
  Banknote,
  Smartphone,
  Check,
  Receipt,
  RotateCcw,
  Sparkles,
  AlertTriangle,
  History,
  Lock,
  Unlock,
  Coins
} from 'lucide-react';

interface PosAppProps {
  activeTab?: string;
}

export const PosApp: React.FC<PosAppProps> = ({ activeTab = 'Register' }) => {
  const {
    products,
    categories,
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
    customers,
    currentSession,
    openNewSession,
    closeCurrentSession,
    processPosSale,
    formatCurrency,
    settings,
    salesOrders,
    currentUser
  } = useBusiness();

  // Local POS State
  const [selectedCategory, setSelectedCategory] = useState<string>('cat-all');
  const [searchQuery, setSearchQuery] = useState('');
  const [barcodeQuery, setBarcodeQuery] = useState('');
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isMpesaModalOpen, setIsMpesaModalOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'mobile'>('cash');
  const [cashTendered, setCashTendered] = useState<number>(0);
  const [lastCompletedOrder, setLastCompletedOrder] = useState<SalesOrder | null>(null);
  const [lastChangeDue, setLastChangeDue] = useState<number>(0);
  const [sessionModalOpen, setSessionModalOpen] = useState<boolean>(false);
  const [newOpeningFloat, setNewOpeningFloat] = useState<number>(100);

  // Filter products by category & search query
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      if (!p.active) return false;
      const matchCat = selectedCategory === 'cat-all' || p.categoryId === selectedCategory;
      const matchSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.barcode.includes(searchQuery);
      return matchCat && matchSearch;
    });
  }, [products, selectedCategory, searchQuery]);

  // Handle barcode quick-scan submit
  const handleBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!barcodeQuery.trim()) return;
    const match = products.find(p => p.barcode === barcodeQuery.trim() || p.sku.toLowerCase() === barcodeQuery.trim().toLowerCase());
    if (match) {
      addToCart(match);
      setBarcodeQuery('');
    } else {
      // Alert inline or visual feedback
      setBarcodeQuery('');
    }
  };

  // Open payment modal
  const handleOpenPayment = () => {
    if (cart.length === 0) return;
    setCashTendered(cartTotal);
    setPaymentMethod('cash');
    setIsPaymentModalOpen(true);
  };

  // Trigger M-Pesa STK Push directly
  const handleOpenMpesaStk = () => {
    if (cart.length === 0) return;
    setIsPaymentModalOpen(false);
    setIsMpesaModalOpen(true);
  };

  // M-Pesa STK Success Callback
  const handleMpesaSuccess = (mpesaReceiptNumber: string, phoneNumber: string) => {
    const result = processPosSale('mobile', cartTotal, {
      receiptNumber: mpesaReceiptNumber,
      phoneNumber
    });
    setLastCompletedOrder(result.order);
    setLastChangeDue(0);
    setIsMpesaModalOpen(false);
    setIsPaymentModalOpen(false);
  };

  // Confirm payment & checkout
  const handleConfirmPayment = () => {
    if (paymentMethod === 'mobile') {
      handleOpenMpesaStk();
      return;
    }
    const result = processPosSale(paymentMethod, paymentMethod === 'cash' ? cashTendered : cartTotal);
    setLastCompletedOrder(result.order);
    setLastChangeDue(result.changeDue);
    setIsPaymentModalOpen(false);
  };

  // Pos Sales filter for History tab
  const posHistoryOrders = useMemo(() => {
    return salesOrders.filter(so => so.source === 'pos');
  }, [salesOrders]);

  // If in Orders History tab
  if (activeTab === 'Orders History') {
    return (
      <div className="p-6 max-w-6xl mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">POS Receipts & Sales History</h2>
            <p className="text-xs text-slate-500">Every transaction processed at checkout</p>
          </div>
          <span className="text-xs font-mono text-slate-600 bg-white px-3 py-1.5 rounded-md border border-slate-200">
            {posHistoryOrders.length} completed transactions
          </span>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Receipt Ref</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Items Count</th>
                <th className="py-3 px-4">Payment</th>
                <th className="py-3 px-4 text-right">Total Amount</th>
                <th className="py-3 px-4 text-center">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {posHistoryOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No POS sales recorded in this session yet.
                  </td>
                </tr>
              ) : (
                posHistoryOrders.map(order => (
                  <tr key={order.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-semibold text-slate-900">
                      {order.reference}
                    </td>
                    <td className="py-3 px-4 text-slate-600">{order.date}</td>
                    <td className="py-3 px-4 text-slate-800 font-medium">{order.customerName}</td>
                    <td className="py-3 px-4 text-slate-600">
                      {order.lines.reduce((s, l) => s + l.quantity, 0)} items
                    </td>
                    <td className="py-3 px-4">
                      <span className="uppercase text-[10px] font-semibold tracking-wider text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                        {order.paymentMethod || 'cash'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-semibold text-slate-900 tabular-nums">
                      {formatCurrency(order.total)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => {
                          setLastCompletedOrder(order);
                          setLastChangeDue(0);
                        }}
                        className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded transition-colors"
                        title="View / Print Receipt"
                      >
                        <Receipt className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {lastCompletedOrder && (
          <ReceiptModal
            order={lastCompletedOrder}
            changeDue={lastChangeDue}
            cashTendered={cashTendered}
            onClose={() => setLastCompletedOrder(null)}
          />
        )}
      </div>
    );
  }

  // If in Session Status tab
  if (activeTab === 'Session Status') {
    const totalSales =
      (currentSession.cashSalesTotal || 0) +
      (currentSession.cardSalesTotal || 0) +
      (currentSession.mobileSalesTotal || 0);

    return (
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Cash Register Session Control</h2>
            <p className="text-xs text-slate-500">Opening float, sales reconciliation, and daily drawer closing</p>
          </div>
          {currentSession.status === 'open' ? (
            <button
              onClick={closeCurrentSession}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Close Register Session</span>
            </button>
          ) : (
            <button
              onClick={() => setSessionModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
            >
              <Unlock className="w-3.5 h-3.5" />
              <span>Open New Session</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <span className="text-xs text-slate-500">Session Status</span>
            <div className="flex items-center gap-2 mt-1">
              <span className={`w-2.5 h-2.5 rounded-full ${currentSession.status === 'open' ? 'bg-emerald-500' : 'bg-slate-400'}`} />
              <span className="text-lg font-bold text-slate-900 capitalize">{currentSession.status}</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-2">Started {currentSession.openedAt} by {currentSession.openedBy}</p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <span className="text-xs text-slate-500">Opening Cash Float</span>
            <p className="text-2xl font-bold font-mono text-slate-900 tabular-nums mt-1">
              {formatCurrency(currentSession.openingFloat)}
            </p>
            <p className="text-[11px] text-slate-400 mt-2">Starting drawer balance</p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <span className="text-xs text-slate-500">Session Sales Total</span>
            <p className="text-2xl font-bold font-mono text-emerald-600 tabular-nums mt-1">
              {formatCurrency(totalSales)}
            </p>
            <p className="text-[11px] text-slate-400 mt-2">{currentSession.ordersCount} transactions</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="font-semibold text-slate-900 text-sm">Payment Breakdown in Drawer</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
              <div className="flex items-center gap-2 text-slate-600">
                <Banknote className="w-4 h-4 text-emerald-600" />
                <span className="font-semibold">Cash in Drawer</span>
              </div>
              <p className="text-lg font-bold font-mono text-slate-900 tabular-nums">
                {formatCurrency(currentSession.openingFloat + (currentSession.cashSalesTotal || 0))}
              </p>
              <p className="text-[11px] text-slate-500">
                Float {formatCurrency(currentSession.openingFloat)} + Cash Sales {formatCurrency(currentSession.cashSalesTotal || 0)}
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
              <div className="flex items-center gap-2 text-slate-600">
                <CreditCard className="w-4 h-4 text-blue-600" />
                <span className="font-semibold">Credit/Debit Card</span>
              </div>
              <p className="text-lg font-bold font-mono text-slate-900 tabular-nums">
                {formatCurrency(currentSession.cardSalesTotal || 0)}
              </p>
              <p className="text-[11px] text-slate-500">Settled to merchant account</p>
            </div>

            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
              <div className="flex items-center gap-2 text-slate-600">
                <Smartphone className="w-4 h-4 text-sky-600" />
                <span className="font-semibold">Mobile & Transfer</span>
              </div>
              <p className="text-lg font-bold font-mono text-slate-900 tabular-nums">
                {formatCurrency(currentSession.mobileSalesTotal || 0)}
              </p>
              <p className="text-[11px] text-slate-500">Digital direct deposit</p>
            </div>
          </div>
        </div>

        {/* Modal to open new session */}
        {sessionModalOpen && (
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="session-modal-title"
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4"
          >
            <div className="bg-white rounded-xl shadow-2xl p-6 max-w-sm w-full space-y-4 border border-slate-200">
              <h3 id="session-modal-title" className="font-bold text-slate-900 text-base">Open Cash Drawer Session</h3>
              <p className="text-xs text-slate-500">
                Count the physical cash bills and coins in the drawer to establish opening float.
              </p>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Opening Float ({settings.currencySymbol})
                </label>
                <input
                  type="number"
                  min="0"
                  step="5"
                  value={newOpeningFloat}
                  onChange={e => setNewOpeningFloat(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setSessionModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-md"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    openNewSession(newOpeningFloat);
                    setSessionModalOpen(false);
                  }}
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-md shadow-xs"
                >
                  Start Session
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // DEFAULT TAB: Interactive Register Screen
  return (
    <div className="flex-1 flex flex-col lg:flex-row h-[calc(100vh-3rem)] overflow-hidden bg-slate-100">
      {/* LEFT COLUMN: Product Catalog, Category Tabs & Quick Barcode */}
      <div className="flex-1 flex flex-col min-w-0 border-r border-slate-200">
        {/* Top Control Subbar: Category Tabs + Search + Barcode Scanner Input */}
        <div className="bg-white border-b border-slate-200 p-3 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-1 sm:pb-0 scrollbar-none">
            {categories.map(cat => {
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {cat.name}
                </button>
              );
            })}
          </div>

          {/* Search & Barcode Lookup */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-48">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search item..."
                className="w-full pl-8 pr-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600 focus:bg-white"
              />
            </div>

            <form onSubmit={handleBarcodeSubmit} className="relative sm:w-36">
              <Barcode className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                value={barcodeQuery}
                onChange={e => setBarcodeQuery(e.target.value)}
                placeholder="Scan barcode"
                className="w-full pl-8 pr-2.5 py-1.5 text-xs font-mono bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600 focus:bg-white"
              />
            </form>
          </div>
        </div>

        {/* Product Cards Grid */}
        <div className="flex-1 p-4 overflow-y-auto">
          {filteredProducts.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-400">
              <Sparkles className="w-8 h-8 mb-2 text-slate-300" />
              <p className="font-semibold text-slate-600">No products found</p>
              <p className="text-xs text-slate-400 mt-1">Try switching categories or clearing your search query.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3">
              {filteredProducts.map(product => {
                const isLowStock = product.stockOnHand <= product.minThreshold;
                const isOutOfStock = product.stockOnHand <= 0;

                return (
                  <button
                    key={product.id}
                    onClick={() => addToCart(product)}
                    disabled={isOutOfStock}
                    className={`group relative flex flex-col justify-between p-3.5 rounded-xl border text-left transition-all duration-100 ${
                      isOutOfStock
                        ? 'bg-slate-100 border-slate-200 opacity-50 cursor-not-allowed'
                        : 'bg-white border-slate-200 hover:border-blue-500 hover:shadow-md active:scale-[0.98]'
                    }`}
                  >
                    <div>
                      {/* Product Name */}
                      <h4 className="font-semibold text-xs text-slate-900 group-hover:text-blue-700 line-clamp-2 leading-snug">
                        {product.name}
                      </h4>
                      {/* SKU / Code */}
                      <p className="text-[10px] font-mono text-slate-400 mt-0.5">
                        {product.sku}
                      </p>
                    </div>

                    <div className="mt-3 pt-2 border-t border-slate-100 flex items-end justify-between">
                      <span className="font-bold font-mono text-sm text-slate-900 tabular-nums">
                        {formatCurrency(product.salePrice)}
                      </span>

                      {/* Stock on Hand pill */}
                      <span
                        className={`text-[10px] font-mono font-medium px-1.5 py-0.5 rounded ${
                          isOutOfStock
                            ? 'bg-rose-100 text-rose-700'
                            : isLowStock
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {product.stockOnHand} {product.unit}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* RIGHT COLUMN: Cashier Cart, Customer Selector, Tender & Keypad */}
      <div className="w-full lg:w-[380px] xl:w-[420px] bg-white flex flex-col shadow-lg border-l border-slate-200">
        {/* Customer Header */}
        <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <button
            onClick={() => setIsCustomerModalOpen(true)}
            className="flex items-center gap-2 text-left hover:bg-slate-200/60 p-1.5 rounded-lg transition-colors flex-1 min-w-0"
          >
            <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center">
              <User className="w-4 h-4" />
            </div>
            <div className="truncate">
              <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider block leading-none">
                Customer
              </span>
              <span className="text-xs font-bold text-slate-900 truncate block mt-0.5">
                {selectedCustomer.name}
              </span>
            </div>
          </button>

          {cart.length > 0 && (
            <button
              onClick={clearCart}
              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
              title="Clear Cart"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Cart Item Lines */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-2">
                <Receipt className="w-6 h-6 text-slate-300" />
              </div>
              <p className="text-xs font-semibold text-slate-600">Cart is empty</p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Select items from the catalog or scan barcodes to begin sale
              </p>
            </div>
          ) : (
            cart.map(item => {
              const lineTotal =
                (item.product.salePrice * item.quantity) * (1 - item.discountPercent / 100);

              return (
                <div
                  key={item.product.id}
                  className="bg-slate-50 hover:bg-slate-100/70 p-2.5 rounded-xl border border-slate-200 flex flex-col gap-2 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-slate-900 leading-snug line-clamp-1">
                        {item.product.name}
                      </p>
                      <p className="text-[10px] font-mono text-slate-500">
                        {formatCurrency(item.product.salePrice)} / {item.product.unit}
                      </p>
                    </div>

                    <span className="font-bold font-mono text-xs text-slate-900 tabular-nums">
                      {formatCurrency(lineTotal)}
                    </span>
                  </div>

                  {/* Quantity controls + delete */}
                  <div className="flex items-center justify-between pt-1 border-t border-slate-200/60">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => updateCartQuantity(item.product.id, item.quantity - 1)}
                        className="w-6 h-6 rounded bg-white hover:bg-slate-200 border border-slate-300 flex items-center justify-center text-slate-700 transition-colors"
                      >
                        <Minus className="w-3 h-3" />
                      </button>

                      <span className="w-8 text-center text-xs font-bold font-mono text-slate-900 tabular-nums">
                        {item.quantity}
                      </span>

                      <button
                        onClick={() => updateCartQuantity(item.product.id, item.quantity + 1)}
                        className="w-6 h-6 rounded bg-white hover:bg-slate-200 border border-slate-300 flex items-center justify-center text-slate-700 transition-colors"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <button
                      onClick={() => removeFromCart(item.product.id)}
                      className="text-slate-400 hover:text-rose-600 p-1 rounded transition-colors"
                      title="Remove item"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Cart Totals & Checkout Action */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 space-y-3">
          <div className="space-y-1.5 text-xs text-slate-600">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-mono tabular-nums">{formatCurrency(cartSubtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>
                {settings.taxName} ({(settings.taxRate * 100).toFixed(1)}%)
              </span>
              <span className="font-mono tabular-nums">{formatCurrency(cartTaxTotal)}</span>
            </div>
            <div className="flex justify-between text-base font-bold text-slate-900 pt-2 border-t border-slate-200">
              <span>TOTAL DUE</span>
              <span className="font-mono text-lg text-blue-700 tabular-nums">
                {formatCurrency(cartTotal)}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleOpenMpesaStk}
              disabled={cart.length === 0}
              className={`py-3.5 px-2 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-md transition-all ${
                cart.length === 0
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                  : 'bg-[#00843D] hover:bg-[#007033] text-white active:scale-[0.99]'
              }`}
            >
              <Smartphone className="w-4 h-4" />
              <span>M-PESA STK</span>
            </button>

            <button
              onClick={handleOpenPayment}
              disabled={cart.length === 0}
              className={`py-3.5 px-2 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-md transition-all ${
                cart.length === 0
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                  : 'bg-emerald-700 hover:bg-emerald-800 text-white active:scale-[0.99]'
              }`}
            >
              <Banknote className="w-4 h-4" />
              <span>CASH / CARD</span>
            </button>
          </div>
        </div>
      </div>

      {/* Customer Selector Modal */}
      {isCustomerModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="customer-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4"
        >
          <div className="bg-white rounded-xl shadow-2xl p-5 max-w-md w-full space-y-4 border border-slate-200 max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between">
              <h3 id="customer-modal-title" className="font-bold text-slate-900 text-base">Select Customer</h3>
              <button
                onClick={() => setIsCustomerModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-xs font-semibold"
              >
                Close
              </button>
            </div>

            <div className="overflow-y-auto space-y-2 flex-1">
              {customers.map(c => (
                <button
                  key={c.id}
                  onClick={() => {
                    setSelectedCustomer(c);
                    setIsCustomerModalOpen(false);
                  }}
                  className={`w-full text-left p-3 rounded-lg border transition-colors flex items-center justify-between ${
                    selectedCustomer.id === c.id
                      ? 'bg-blue-50 border-blue-500 text-blue-800'
                      : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-800'
                  }`}
                >
                  <div>
                    <p className="font-semibold text-xs text-slate-900">{c.name}</p>
                    <p className="text-[11px] text-slate-500">{c.phone || c.email || c.city}</p>
                  </div>
                  <div className="text-right font-mono text-[11px]">
                    <span className="text-slate-500 block">{c.ordersCount} orders</span>
                    <span className="text-slate-900 font-semibold">{formatCurrency(c.totalSpent)}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Payment Tender Modal */}
      {isPaymentModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="payment-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 overflow-y-auto"
        >
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200 space-y-5 p-6 animate-in fade-in zoom-in-95 duration-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 id="payment-modal-title" className="font-bold text-slate-900 text-lg">Process Payment</h3>
                <p className="text-xs text-slate-500">Order total due: <span className="font-mono font-bold text-slate-900">{formatCurrency(cartTotal)}</span></p>
              </div>
              <button
                onClick={() => setIsPaymentModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-xs font-semibold"
              >
                Cancel
              </button>
            </div>

            {/* Payment Method Selector */}
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setPaymentMethod('cash')}
                className={`py-3 px-2 rounded-xl border flex flex-col items-center gap-1.5 transition-all ${
                  paymentMethod === 'cash'
                    ? 'bg-emerald-50 border-emerald-600 text-emerald-800 font-semibold ring-1 ring-emerald-500'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Banknote className="w-5 h-5 text-emerald-600" />
                <span className="text-xs">Cash</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('card')}
                className={`py-3 px-2 rounded-xl border flex flex-col items-center gap-1.5 transition-all ${
                  paymentMethod === 'card'
                    ? 'bg-blue-50 border-blue-600 text-blue-800 font-semibold ring-1 ring-blue-500'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <CreditCard className="w-5 h-5 text-blue-600" />
                <span className="text-xs">Card / Terminal</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('mobile')}
                className={`py-3 px-2 rounded-xl border flex flex-col items-center gap-1.5 transition-all ${
                  paymentMethod === 'mobile'
                    ? 'bg-sky-50 border-sky-600 text-sky-800 font-semibold ring-1 ring-sky-500'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Smartphone className="w-5 h-5 text-sky-600" />
                <span className="text-xs">Mobile Pay</span>
              </button>
            </div>

            {/* Cash Tender & Change Calculations */}
            {paymentMethod === 'cash' ? (
              <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-700">Cash Received:</span>
                  <span className="font-mono text-base font-bold text-slate-900">
                    {formatCurrency(cashTendered)}
                  </span>
                </div>

                {/* Quick Bills Buttons */}
                <div className="grid grid-cols-4 gap-2">
                  <button
                    onClick={() => setCashTendered(cartTotal)}
                    className="py-1.5 px-2 bg-white hover:bg-slate-200 border border-slate-300 rounded text-xs font-semibold text-slate-800"
                  >
                    Exact
                  </button>
                  <button
                    onClick={() => setCashTendered(Math.ceil(cartTotal / 10) * 10)}
                    className="py-1.5 px-2 bg-white hover:bg-slate-200 border border-slate-300 rounded text-xs font-semibold text-slate-800 font-mono"
                  >
                    {formatCurrency(Math.ceil(cartTotal / 10) * 10)}
                  </button>
                  <button
                    onClick={() => setCashTendered(Math.ceil(cartTotal / 20) * 20)}
                    className="py-1.5 px-2 bg-white hover:bg-slate-200 border border-slate-300 rounded text-xs font-semibold text-slate-800 font-mono"
                  >
                    {formatCurrency(Math.ceil(cartTotal / 20) * 20)}
                  </button>
                  <button
                    onClick={() => setCashTendered(Math.ceil(cartTotal / 50) * 50 || 50)}
                    className="py-1.5 px-2 bg-white hover:bg-slate-200 border border-slate-300 rounded text-xs font-semibold text-slate-800 font-mono"
                  >
                    {formatCurrency(Math.ceil(cartTotal / 50) * 50 || 50)}
                  </button>
                </div>

                <div className="pt-2 border-t border-slate-200 flex justify-between items-center">
                  <span className="text-xs font-semibold text-slate-600">Change Due:</span>
                  <span className="font-mono text-lg font-bold text-emerald-700 tabular-nums">
                    {formatCurrency(Math.max(0, cashTendered - cartTotal))}
                  </span>
                </div>
              </div>
            ) : paymentMethod === 'mobile' ? (
              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 text-center text-xs space-y-2.5">
                <div className="flex items-center justify-center gap-1.5 font-bold text-[#00843D]">
                  <Smartphone className="w-4 h-4" />
                  <span>SAFARICOM LIPA NA M-PESA STK</span>
                </div>
                <p className="text-slate-600">
                  Sends an instant prompt across the network to the customer's mobile handset. Money is credited directly to <strong className="text-[#00843D]">{settings.mpesa?.receivingPhone || '0757329235'}</strong> ({settings.mpesa?.ownerName || 'Victor Mwangi'}).
                </p>
                <button
                  type="button"
                  onClick={handleOpenMpesaStk}
                  className="w-full py-2.5 px-3 bg-[#00843D] hover:bg-[#007033] text-white font-bold rounded-lg shadow-xs flex items-center justify-center gap-2 transition-colors"
                >
                  <Smartphone className="w-4 h-4" />
                  <span>START STK PUSH ({formatCurrency(cartTotal)})</span>
                </button>
              </div>
            ) : (
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-center text-xs text-slate-600 space-y-1">
                <p className="font-semibold text-slate-900">
                  Awaiting Card Swipe / Tap on Terminal
                </p>
                <p className="text-slate-400">Total charge: {formatCurrency(cartTotal)}</p>
              </div>
            )}

            {/* Validate Button */}
            {paymentMethod !== 'mobile' && (
              <button
                onClick={handleConfirmPayment}
                disabled={paymentMethod === 'cash' && cashTendered < cartTotal}
                className={`w-full py-3.5 rounded-xl font-bold text-sm text-white shadow-md transition-all ${
                  paymentMethod === 'cash' && cashTendered < cartTotal
                    ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                    : 'bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99]'
                }`}
              >
                VALIDATE PAYMENT & PRINT RECEIPT
              </button>
            )}
          </div>
        </div>
      )}

      {/* M-Pesa STK Push Modal */}
      {isMpesaModalOpen && (
        <MpesaStkModal
          amount={cartTotal}
          reference={`POS-${Date.now().toString().slice(-4)}`}
          customerName={selectedCustomer.name}
          defaultPhone={selectedCustomer.phone}
          onSuccess={handleMpesaSuccess}
          onClose={() => setIsMpesaModalOpen(false)}
        />
      )}

      {/* Completed Sale Receipt Modal */}
      {lastCompletedOrder && (
        <ReceiptModal
          order={lastCompletedOrder}
          changeDue={lastChangeDue}
          cashTendered={cashTendered}
          onClose={() => setLastCompletedOrder(null)}
        />
      )}
    </div>
  );
};
