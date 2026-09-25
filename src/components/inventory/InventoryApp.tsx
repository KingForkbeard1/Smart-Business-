import React, { useState, useMemo } from 'react';
import { useBusiness } from '../../context/BusinessContext';
import { Product } from '../../types';
import { ControlPanel } from '../layout/ControlPanel';
import {
  Package,
  AlertTriangle,
  ArrowDownUp,
  Boxes,
  Plus,
  Edit2,
  Trash2,
  SlidersHorizontal,
  Layers,
  CheckCircle2,
  X,
  Building2,
  ArrowRightLeft,
  Truck,
  ShieldCheck
} from 'lucide-react';

interface InventoryAppProps {
  activeTab?: string;
}

export const InventoryApp: React.FC<InventoryAppProps> = ({ activeTab = 'Products' }) => {
  const {
    products,
    categories,
    stockMovements,
    addProduct,
    updateProduct,
    deleteProduct,
    adjustStock,
    formatCurrency,
    settings,
    setCurrentApp,
    branches,
    currentBranch
  } = useBusiness();

  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isNewProductModalOpen, setIsNewProductModalOpen] = useState(false);
  const [isAdjustStockModalOpen, setIsAdjustStockModalOpen] = useState(false);
  const [selectedProductForAdjust, setSelectedProductForAdjust] = useState<Product | null>(null);
  const [newStockCount, setNewStockCount] = useState<number>(0);
  const [adjustReason, setAdjustReason] = useState<string>('Physical Inventory Count');
  const [transferSuccess, setTransferSuccess] = useState<string | null>(null);

  // Form state for new product
  const [newProdData, setNewProdData] = useState({
    name: '',
    sku: '',
    barcode: '',
    categoryId: categories[1]?.id || 'cat-produce',
    costPrice: 0,
    salePrice: 0,
    stockOnHand: 10,
    minThreshold: 5,
    unit: 'units'
  });

  // Filter products
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchCat = selectedCategory === 'all' || p.categoryId === selectedCategory;
      const matchSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.barcode.includes(searchQuery);
      return matchCat && matchSearch;
    });
  }, [products, selectedCategory, searchQuery]);

  // Low stock products
  const lowStockProducts = useMemo(() => {
    return products.filter(p => p.stockOnHand <= p.minThreshold);
  }, [products]);

  const handleOpenAdjust = (prod: Product) => {
    setSelectedProductForAdjust(prod);
    setNewStockCount(prod.stockOnHand);
    setAdjustReason('Physical Inventory Count');
    setIsAdjustStockModalOpen(true);
  };

  const handleSaveAdjust = () => {
    if (!selectedProductForAdjust) return;
    adjustStock(selectedProductForAdjust.id, newStockCount, adjustReason);
    setIsAdjustStockModalOpen(false);
    setSelectedProductForAdjust(null);
  };

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdData.name.trim()) return;

    addProduct({
      name: newProdData.name,
      sku: newProdData.sku || `SKU-${Date.now().toString().slice(-4)}`,
      barcode: newProdData.barcode || Math.floor(1000000000 + Math.random() * 9000000000).toString(),
      categoryId: newProdData.categoryId,
      costPrice: Number(newProdData.costPrice),
      salePrice: Number(newProdData.salePrice),
      stockOnHand: Number(newProdData.stockOnHand),
      minThreshold: Number(newProdData.minThreshold),
      unit: newProdData.unit || 'units',
      active: true
    });

    setIsNewProductModalOpen(false);
    setNewProdData({
      name: '',
      sku: '',
      barcode: '',
      categoryId: categories[1]?.id || 'cat-produce',
      costPrice: 0,
      salePrice: 0,
      stockOnHand: 10,
      minThreshold: 5,
      unit: 'units'
    });
  };

  const handleInternalTransfer = (fromBranch: string, toBranch: string) => {
    setTransferSuccess(`Inter-facility transfer completed: 50 units dispatched from ${fromBranch} to ${toBranch}. Dispatch waybill generated.`);
    setTimeout(() => setTransferSuccess(null), 5000);
  };

  // 1. MULTI-WAREHOUSE TAB (Enterprise Feature)
  if (activeTab === 'Multi-Warehouse') {
    const totalInventoryValue = products.reduce((sum, p) => sum + (p.stockOnHand * p.costPrice), 0);

    return (
      <div className="flex-1 flex flex-col bg-slate-100 min-h-[calc(100vh-3rem)]">
        <ControlPanel
          breadcrumbs={['Inventory', 'Multi-Warehouse', 'Facility Stock Distribution']}
          totalRecords={branches.length}
        />

        <div className="p-4 sm:p-6 max-w-6xl w-full mx-auto space-y-6 flex-1 overflow-y-auto">
          {transferSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center justify-between animate-in fade-in">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{transferSuccess}</span>
              </div>
              <button onClick={() => setTransferSuccess(null)} className="text-emerald-700 font-bold">×</button>
            </div>
          )}

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Enterprise Warehouse Network</h2>
              <p className="text-xs text-slate-500">
                Total Consolidated Inventory Valuation across facilities: <span className="font-mono font-bold text-blue-700">{formatCurrency(totalInventoryValue)}</span>
              </p>
            </div>
            <button
              onClick={() => handleInternalTransfer('Central Warehouse (WH-01)', 'Nairobi CBD Flagship (HQ-01)')}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-2 shadow-xs transition-colors"
            >
              <ArrowRightLeft className="w-4 h-4" />
              <span>Simulate Inter-Warehouse Transfer</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {branches.map(branch => {
              const isCurrent = currentBranch.id === branch.id;
              return (
                <div
                  key={branch.id}
                  className={`bg-white p-5 rounded-xl border transition-all ${
                    isCurrent ? 'border-blue-500 ring-2 ring-blue-500/20 shadow-md' : 'border-slate-200 shadow-xs'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700">
                        <Building2 className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-sm text-slate-900">{branch.name}</h4>
                          <span className="font-mono text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">
                            {branch.code}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">{branch.city} · Manager: {branch.manager}</p>
                      </div>
                    </div>
                    {isCurrent && (
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                        Active Branch
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-100 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Facility Type</span>
                      <span className="font-semibold text-slate-700 capitalize">{branch.type.replace('_', ' ')}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Stock Share</span>
                      <span className="font-mono font-bold text-slate-900">
                        {branch.type === 'warehouse' ? '45%' : branch.type === 'flagship' ? '30%' : '15%'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Contact Phone</span>
                      <span className="font-mono text-slate-600">{branch.phone}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // 2. STOCK MOVES SUBTAB
  if (activeTab === 'Stock Moves') {
    return (
      <div className="flex-1 flex flex-col bg-slate-100 min-h-[calc(100vh-3rem)]">
        <ControlPanel
          breadcrumbs={['Inventory', 'Operations', 'Stock Moves Ledger']}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          searchPlaceholder="Search movement ref, product or operator..."
          totalRecords={stockMovements.length}
        />

        <div className="p-4 sm:p-6 max-w-6xl w-full mx-auto space-y-4 flex-1 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4">Date / Time</th>
                  <th className="py-3 px-4">Reference</th>
                  <th className="py-3 px-4">Product</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4 text-right">Qty Change</th>
                  <th className="py-3 px-4 text-right">New Stock</th>
                  <th className="py-3 px-4">User</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {stockMovements.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400">
                      No stock movements recorded yet.
                    </td>
                  </tr>
                ) : (
                  stockMovements.map(sm => (
                    <tr key={sm.id} className="hover:bg-blue-50/30 transition-colors">
                      <td className="py-3 px-4 font-mono text-slate-500">{sm.date}</td>
                      <td className="py-3 px-4 font-mono font-medium text-slate-900">{sm.reference}</td>
                      <td className="py-3 px-4 font-medium text-slate-800">{sm.productName}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded ${
                            sm.type === 'purchase'
                              ? 'bg-emerald-100 text-emerald-800'
                              : sm.type === 'sale'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {sm.type}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold tabular-nums">
                        <span className={sm.quantityChange > 0 ? 'text-emerald-600' : 'text-rose-600'}>
                          {sm.quantityChange > 0 ? `+${sm.quantityChange}` : sm.quantityChange}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-slate-800 tabular-nums">
                        {sm.newBalance}
                      </td>
                      <td className="py-3 px-4 text-slate-500">{sm.performedBy}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // 3. LOW STOCK ALERTS SUBTAB
  if (activeTab === 'Low Stock Alerts') {
    return (
      <div className="flex-1 flex flex-col bg-slate-100 min-h-[calc(100vh-3rem)]">
        <ControlPanel
          breadcrumbs={['Inventory', 'Reordering Rules', 'Low Stock Warnings']}
          totalRecords={lowStockProducts.length}
        />

        <div className="p-4 sm:p-6 max-w-5xl w-full mx-auto space-y-4 flex-1 overflow-y-auto">
          <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex items-center justify-between text-xs text-amber-800">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
              <div>
                <p className="font-semibold">Replenishment Alert Triggered</p>
                <p className="text-amber-700">The following products have fallen below their safety threshold level.</p>
              </div>
            </div>
            <button
              onClick={() => setCurrentApp('purchases')}
              className="px-3 py-1.5 bg-blue-700 hover:bg-blue-800 text-white font-semibold rounded-lg shadow-xs transition-colors shrink-0"
            >
              Go to Purchases
            </button>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4">Product Name</th>
                  <th className="py-3 px-4">SKU</th>
                  <th className="py-3 px-4 text-right">Current Stock</th>
                  <th className="py-3 px-4 text-right">Min Threshold</th>
                  <th className="py-3 px-4 text-right">Deficit</th>
                  <th className="py-3 px-4 text-center">Quick Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {lowStockProducts.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                      All products currently meet or exceed safety threshold quantities.
                    </td>
                  </tr>
                ) : (
                  lowStockProducts.map(p => (
                    <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 font-semibold text-slate-900">{p.name}</td>
                      <td className="py-3 px-4 font-mono text-slate-500">{p.sku}</td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-rose-600 tabular-nums">
                        {p.stockOnHand} {p.unit}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-slate-600 tabular-nums">
                        {p.minThreshold} {p.unit}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-semibold text-amber-700 tabular-nums">
                        -{Math.max(0, p.minThreshold - p.stockOnHand)} {p.unit}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => handleOpenAdjust(p)}
                          className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-[11px] font-semibold transition-colors"
                        >
                          Restock
                        </button>
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
  }

  // DEFAULT TAB: PRODUCTS LIST / KANBAN
  return (
    <div className="flex-1 flex flex-col bg-slate-100 min-h-[calc(100vh-3rem)]">
      <ControlPanel
        breadcrumbs={['Inventory', 'Products Catalog']}
        primaryActionLabel="New Product"
        onPrimaryAction={() => setIsNewProductModalOpen(true)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search product by name, SKU or barcode..."
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        totalRecords={filteredProducts.length}
      />

      {/* Category Tabs Bar */}
      <div className="bg-white border-b border-slate-200 px-4 py-2 flex items-center gap-1.5 text-xs overflow-x-auto">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-3 py-1 rounded-md font-semibold transition-colors whitespace-nowrap ${
            selectedCategory === 'all'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          All Items ({products.length})
        </button>
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-3 py-1 rounded-md font-semibold transition-colors whitespace-nowrap ${
              selectedCategory === cat.id
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Product Content Viewport */}
      <div className="p-4 sm:p-6 flex-1 overflow-y-auto">
        {viewMode === 'kanban' ? (
          /* Kanban Cards Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filteredProducts.map(prod => {
              const isLowStock = prod.stockOnHand <= prod.minThreshold;
              const margin = (((prod.salePrice - prod.costPrice) / prod.salePrice) * 100).toFixed(0);

              return (
                <div
                  key={prod.id}
                  className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs hover:border-blue-400 hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-1">
                      <h3 className="font-semibold text-xs text-slate-900 leading-snug line-clamp-2">
                        {prod.name}
                      </h3>
                      <span
                        className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded shrink-0 ${
                          isLowStock
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-50 text-emerald-800'
                        }`}
                      >
                        {prod.stockOnHand} {prod.unit}
                      </span>
                    </div>

                    <div className="text-[11px] font-mono text-slate-400 flex items-center justify-between">
                      <span>SKU: {prod.sku}</span>
                      <span>Bar: {prod.barcode}</span>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                      <div>
                        <span className="text-slate-400 block text-[10px]">Price</span>
                        <span className="font-mono font-bold text-slate-900">
                          {formatCurrency(prod.salePrice)}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Cost / Margin</span>
                        <span className="font-mono text-slate-600">
                          {formatCurrency(prod.costPrice)} <span className="text-emerald-600">({margin}%)</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <button
                      onClick={() => handleOpenAdjust(prod)}
                      className="text-slate-600 hover:text-blue-700 font-semibold text-[11px] flex items-center gap-1"
                    >
                      <ArrowDownUp className="w-3.5 h-3.5" />
                      <span>Adjust Stock</span>
                    </button>
                    <button
                      onClick={() => deleteProduct(prod.id)}
                      className="text-slate-400 hover:text-rose-600 p-1 rounded"
                      title="Delete Product"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* List Table View */
          <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4">Product Name</th>
                  <th className="py-3 px-4">Internal Reference (SKU)</th>
                  <th className="py-3 px-4">Barcode</th>
                  <th className="py-3 px-4 text-right">Cost Price</th>
                  <th className="py-3 px-4 text-right">Sale Price</th>
                  <th className="py-3 px-4 text-right">Stock On Hand</th>
                  <th className="py-3 px-4 text-right">Safety Min</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredProducts.map(p => (
                  <tr key={p.id} className="hover:bg-blue-50/30 transition-colors">
                    <td className="py-3 px-4 font-semibold text-slate-900">{p.name}</td>
                    <td className="py-3 px-4 font-mono text-slate-500">{p.sku}</td>
                    <td className="py-3 px-4 font-mono text-slate-500">{p.barcode}</td>
                    <td className="py-3 px-4 text-right font-mono text-slate-600 tabular-nums">
                      {formatCurrency(p.costPrice)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-900 tabular-nums">
                      {formatCurrency(p.salePrice)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold tabular-nums">
                      <span className={p.stockOnHand <= p.minThreshold ? 'text-amber-700' : 'text-slate-900'}>
                        {p.stockOnHand} {p.unit}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-slate-400 tabular-nums">
                      {p.minThreshold} {p.unit}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => handleOpenAdjust(p)}
                        className="text-xs text-blue-700 hover:underline font-semibold"
                      >
                        Adjust
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* New Product Modal */}
      {isNewProductModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="new-prod-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 overflow-y-auto"
        >
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-lg w-full space-y-4 border border-slate-200 animate-in fade-in zoom-in-95 duration-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 id="new-prod-title" className="font-bold text-slate-900 text-base">Create New Product</h3>
              <button
                onClick={() => setIsNewProductModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Product Title</label>
                <input
                  type="text"
                  required
                  value={newProdData.name}
                  onChange={e => setNewProdData({ ...newProdData, name: e.target.value })}
                  placeholder="e.g. Organic Almond Butter (250g)"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">SKU / Code</label>
                  <input
                    type="text"
                    value={newProdData.sku}
                    onChange={e => setNewProdData({ ...newProdData, sku: e.target.value })}
                    placeholder="e.g. PAN-ALM-250"
                    className="w-full px-3 py-2 font-mono border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Barcode</label>
                  <input
                    type="text"
                    value={newProdData.barcode}
                    onChange={e => setNewProdData({ ...newProdData, barcode: e.target.value })}
                    placeholder="e.g. 7935731099"
                    className="w-full px-3 py-2 font-mono border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={newProdData.categoryId}
                    onChange={e => setNewProdData({ ...newProdData, categoryId: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Measurement Unit</label>
                  <input
                    type="text"
                    value={newProdData.unit}
                    onChange={e => setNewProdData({ ...newProdData, unit: e.target.value })}
                    placeholder="units, kg, pack, loaf"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Cost Price ({settings.currencySymbol})</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={newProdData.costPrice}
                    onChange={e => setNewProdData({ ...newProdData, costPrice: Number(e.target.value) })}
                    className="w-full px-3 py-2 font-mono border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Sale Price ({settings.currencySymbol})</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={newProdData.salePrice}
                    onChange={e => setNewProdData({ ...newProdData, salePrice: Number(e.target.value) })}
                    className="w-full px-3 py-2 font-mono border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Initial Stock Count</label>
                  <input
                    type="number"
                    min="0"
                    value={newProdData.stockOnHand}
                    onChange={e => setNewProdData({ ...newProdData, stockOnHand: Number(e.target.value) })}
                    className="w-full px-3 py-2 font-mono border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Low Stock Warning Threshold</label>
                  <input
                    type="number"
                    min="0"
                    value={newProdData.minThreshold}
                    onChange={e => setNewProdData({ ...newProdData, minThreshold: Number(e.target.value) })}
                    className="w-full px-3 py-2 font-mono border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsNewProductModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-semibold"
                >
                  Discard
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold shadow-xs"
                >
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Adjust Stock Level Modal */}
      {isAdjustStockModalOpen && selectedProductForAdjust && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="adjust-stock-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4"
        >
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full space-y-4 border border-slate-200">
            <h3 id="adjust-stock-title" className="font-bold text-slate-900 text-base">Adjust Physical Inventory</h3>
            <p className="text-xs text-slate-500">
              Update counted stock for <span className="font-semibold text-slate-900">{selectedProductForAdjust.name}</span>
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">New Counted Quantity</label>
                <input
                  type="number"
                  min="0"
                  value={newStockCount}
                  onChange={e => setNewStockCount(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono text-base font-bold focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Current record: {selectedProductForAdjust.stockOnHand} {selectedProductForAdjust.unit}
                  {newStockCount !== selectedProductForAdjust.stockOnHand && (
                    <span className="ml-1 font-semibold text-blue-700">
                      (Diff: {newStockCount - selectedProductForAdjust.stockOnHand > 0 ? `+${newStockCount - selectedProductForAdjust.stockOnHand}` : newStockCount - selectedProductForAdjust.stockOnHand})
                    </span>
                  )}
                </span>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Reason / Reference</label>
                <select
                  value={adjustReason}
                  onChange={e => setAdjustReason(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                >
                  <option value="Physical Inventory Count">Physical Cycle Count</option>
                  <option value="Damaged / Expired Goods">Damaged / Expired Write-off</option>
                  <option value="Store Demo / Internal Use">Store Demo / Internal Use</option>
                  <option value="Customer Return Stock">Customer Return Restock</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setIsAdjustStockModalOpen(false)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveAdjust}
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-xs"
              >
                Apply Adjustment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
