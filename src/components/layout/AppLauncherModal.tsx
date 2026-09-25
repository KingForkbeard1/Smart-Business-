import React, { useState } from 'react';
import { useBusiness } from '../../context/BusinessContext';
import { AppId } from '../../types';
import {
  ShoppingBag,
  Package,
  TrendingUp,
  Truck,
  Users,
  CreditCard,
  UserCheck,
  Settings,
  Search,
  X
} from 'lucide-react';

interface AppTile {
  id: AppId;
  name: string;
  category: string;
  icon: React.ElementType;
  color: string;
  badge?: string;
  description: string;
}

export const AppLauncherModal: React.FC = () => {
  const { isAppLauncherOpen, closeAppLauncher, setCurrentApp, currentApp, currentSession, financialMetrics } = useBusiness();
  const [searchQuery, setSearchQuery] = useState('');

  if (!isAppLauncherOpen) return null;

  const appTiles: AppTile[] = [
    {
      id: 'pos',
      name: 'Point of Sale',
      category: 'Sales & Retail',
      icon: ShoppingBag,
      color: 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-900/30',
      badge: currentSession.status === 'open' ? 'Active' : undefined,
      description: 'Touchscreen cashier, rapid checkout, barcode lookup & M-Pesa receipts'
    },
    {
      id: 'inventory',
      name: 'Inventory',
      category: 'Operations',
      icon: Package,
      color: 'bg-sky-700 hover:bg-sky-600 text-white shadow-sky-900/30',
      description: 'Multi-warehouse stock, min thresholds, physical cycle counts & stock moves'
    },
    {
      id: 'sales',
      name: 'Sales & Orders',
      category: 'Sales & Retail',
      icon: TrendingUp,
      color: 'bg-indigo-700 hover:bg-indigo-600 text-white shadow-indigo-900/30',
      description: 'Quotations, pro-forma invoices, customer credit terms & order approval'
    },
    {
      id: 'purchases',
      name: 'Purchases & Supply',
      category: 'Operations',
      icon: Truck,
      color: 'bg-blue-800 hover:bg-blue-700 text-white shadow-blue-950/30',
      description: 'Supplier purchase orders, 3-way match validation & receiving goods'
    },
    {
      id: 'crm',
      name: 'CRM & Pipeline',
      category: 'Sales & Retail',
      icon: Users,
      color: 'bg-cyan-700 hover:bg-cyan-600 text-white shadow-cyan-900/30',
      description: 'Customer directory, lead pipeline Kanban, weighted deal revenue'
    },
    {
      id: 'accounting',
      name: 'Invoicing & Accounting',
      category: 'Finance',
      icon: CreditCard,
      color: 'bg-blue-900 hover:bg-blue-800 text-white shadow-blue-950/40',
      badge: financialMetrics.unpaidInvoicesCount > 0 ? `${financialMetrics.unpaidInvoicesCount} due` : undefined,
      description: 'General ledger, P&L, balance sheet, KRA VAT returns & customer invoices'
    },
    {
      id: 'employees',
      name: 'Staff & Payroll',
      category: 'Human Resources',
      icon: UserCheck,
      color: 'bg-slate-700 hover:bg-slate-600 text-white shadow-slate-900/30',
      description: 'Staff directory, wage rates, clock-in / clock-out attendance punch clock'
    },
    {
      id: 'settings',
      name: 'Settings',
      category: 'Configuration',
      icon: Settings,
      color: 'bg-slate-800 hover:bg-slate-700 text-white shadow-slate-950/30',
      description: 'Store profile, Daraja M-Pesa setup, multi-branch, VAT tax & JSON backup'
    }
  ];

  const filteredApps = appTiles.filter(app =>
    app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    app.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    app.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectApp = (appId: AppId) => {
    setCurrentApp(appId);
    closeAppLauncher();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Enterprise App Launcher"
      className="fixed inset-0 z-50 flex flex-col bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-150"
      onClick={closeAppLauncher}
    >
      {/* Top Search Header */}
      <div
        className="w-full max-w-4xl mx-auto pt-8 px-6 pb-4 flex items-center justify-between gap-4"
        onClick={e => e.stopPropagation()}
      >
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-300" />
          <input
            type="text"
            autoFocus
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search applications, operations, or modules..."
            className="w-full pl-12 pr-4 py-3 bg-slate-900/90 border border-slate-700 rounded-xl text-white placeholder-slate-400 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-inner"
          />
        </div>
        <button
          onClick={closeAppLauncher}
          className="p-3 text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-xl transition-colors"
          title="Close Launcher (Esc)"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* App Grid */}
      <div
        className="w-full max-w-4xl mx-auto px-6 py-6 overflow-y-auto flex-1"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs uppercase tracking-wider text-blue-300 font-semibold">
            Enterprise Business Suite Modules
          </p>
          <span className="text-xs text-slate-400 font-mono">
            {filteredApps.length} modules available
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {filteredApps.map(app => {
            const Icon = app.icon;
            const isCurrent = currentApp === app.id;
            return (
              <button
                key={app.id}
                onClick={() => handleSelectApp(app.id)}
                className={`group relative flex flex-col items-center text-center p-5 rounded-2xl border transition-all duration-150 text-left ${
                  isCurrent
                    ? 'bg-slate-800/95 border-blue-500 ring-2 ring-blue-500/40 shadow-xl'
                    : 'bg-slate-900/70 border-slate-800 hover:bg-slate-800 hover:border-slate-700 hover:shadow-lg'
                }`}
              >
                {app.badge && (
                  <span className="absolute top-3 right-3 text-[11px] font-medium bg-blue-500/20 text-blue-300 border border-blue-500/30 px-2 py-0.5 rounded-full">
                    {app.badge}
                  </span>
                )}
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-3 shadow-md transition-transform group-hover:scale-105 ${app.color}`}
                >
                  <Icon className="w-7 h-7" />
                </div>
                <h3 className="text-sm font-semibold text-white group-hover:text-blue-100 mb-1">
                  {app.name}
                </h3>
                <p className="text-[12px] text-slate-400 line-clamp-2 leading-relaxed">
                  {app.description}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom shortcut help */}
      <div className="py-4 text-center text-xs text-slate-400 border-t border-slate-800/80">
        Press <kbd className="px-2 py-0.5 bg-slate-800 rounded border border-slate-700 text-slate-300 font-mono">Esc</kbd> or click outside to return to active app
      </div>
    </div>
  );
};
