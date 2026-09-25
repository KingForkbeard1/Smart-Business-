import React, { useState } from 'react';
import { useBusiness } from '../../context/BusinessContext';
import { AppId, BusinessPreset, CurrencyCode, SystemMode } from '../../types';
import {
  Grid3X3,
  Store,
  ChevronDown,
  ShoppingBag,
  Package,
  TrendingUp,
  Truck,
  Users,
  CreditCard,
  UserCheck,
  Settings as SettingsIcon,
  CircleDot,
  Building2,
  Globe,
  Sliders,
  Check,
  Sparkles
} from 'lucide-react';

interface NavbarProps {
  activeSubTab?: string;
  onSubTabChange?: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeSubTab, onSubTabChange }) => {
  const {
    currentApp,
    setCurrentApp,
    toggleAppLauncher,
    settings,
    switchPreset,
    currentUser,
    setCurrentUser,
    userRoles,
    currentSession,
    branches,
    currentBranch,
    setCurrentBranch,
    systemMode,
    setSystemMode,
    activeCurrency,
    setActiveCurrency
  } = useBusiness();

  const [isPresetMenuOpen, setIsPresetMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isBranchMenuOpen, setIsBranchMenuOpen] = useState(false);
  const [isCurrencyMenuOpen, setIsCurrencyMenuOpen] = useState(false);

  const appMeta: Record<AppId, { title: string; icon: React.ElementType; subTabs: string[] }> = {
    pos: {
      title: 'Point of Sale',
      icon: ShoppingBag,
      subTabs: ['Register', 'Orders History', 'Session & Cash Drawers']
    },
    inventory: {
      title: 'Inventory',
      icon: Package,
      subTabs: ['Products', 'Stock Moves', 'Low Stock Alerts', 'Multi-Warehouse']
    },
    sales: {
      title: 'Sales & Invoicing',
      icon: TrendingUp,
      subTabs: ['Quotations & Orders', 'Pro-Forma Invoices', 'Customers Directory', 'Sales Analytics']
    },
    purchases: {
      title: 'Purchases & Supply',
      icon: Truck,
      subTabs: ['Purchase Orders', '3-Way Match Audit', 'Suppliers / Vendors']
    },
    crm: {
      title: 'CRM & Deals',
      icon: Users,
      subTabs: ['Sales Pipeline', 'Customers Directory', 'Deal Analytics']
    },
    accounting: {
      title: 'Accounting & Finance',
      icon: CreditCard,
      subTabs: ['Customer Invoices', 'Vendor Bills', 'General Ledger', 'P&L Statement', 'Balance Sheet', 'KRA Tax VAT']
    },
    employees: {
      title: 'Staff & Payroll',
      icon: UserCheck,
      subTabs: ['Staff Directory', 'Attendance Punch Clock']
    },
    settings: {
      title: 'Settings',
      icon: SettingsIcon,
      subTabs: ['Business Profile', 'M-Pesa STK Setup', 'Multi-Branch & Taxes', 'Data & Backups']
    }
  };

  const currentMeta = appMeta[currentApp];
  const AppIcon = currentMeta.icon;

  const presetsList: { id: BusinessPreset; label: string; desc: string }[] = [
    { id: 'grocery', label: 'Grocery & Supermarket Mart', desc: 'Fresh produce, dairy, bakery & packaged goods' },
    { id: 'cafe', label: 'Artisan Café & Roastery', desc: 'Espresso bar, baked pastries & coffee beans' },
    { id: 'hardware', label: 'Hardware & Industrial Supply', desc: 'Power tools, plumbing, fasteners & construction' }
  ];

  const currencies: { code: CurrencyCode; label: string; symbol: string }[] = [
    { code: 'KES', label: 'Kenyan Shillings (KES)', symbol: 'KSh' },
    { code: 'USD', label: 'US Dollars (USD)', symbol: '$' },
    { code: 'EUR', label: 'Euros (EUR)', symbol: '€' }
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#0F1E36] text-white shadow-md border-b border-blue-900/60 font-sans">
      {/* Primary Top Bar */}
      <div className="h-12 px-3 sm:px-4 flex items-center justify-between gap-2 text-sm">
        {/* Left: App Grid Waffle + Current App Name + Sub Tabs */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <button
            onClick={toggleAppLauncher}
            className="p-1.5 rounded-lg hover:bg-white/10 active:bg-blue-600/30 transition-colors flex items-center justify-center text-white shrink-0"
            title="App Launcher (Alt+A or Cmd+K)"
            aria-label="Open App Launcher"
          >
            <Grid3X3 className="w-5 h-5 text-blue-200 hover:text-white" />
          </button>

          <div className="flex items-center gap-2 border-l border-blue-800/80 pl-2.5 sm:pl-3 shrink-0">
            <div className="w-6 h-6 rounded-md bg-blue-600/30 border border-blue-400/30 flex items-center justify-center">
              <AppIcon className="w-3.5 h-3.5 text-blue-300" />
            </div>
            <span className="font-semibold tracking-tight text-white text-sm sm:text-base whitespace-nowrap">
              {currentMeta.title}
            </span>
          </div>

          {/* Sub tabs in navbar */}
          <nav className="hidden xl:flex items-center gap-1 ml-3 border-l border-blue-800/80 pl-3 overflow-x-auto">
            {currentMeta.subTabs.map(tab => {
              const isActive = (activeSubTab || currentMeta.subTabs[0]) === tab;
              return (
                <button
                  key={tab}
                  onClick={() => onSubTabChange?.(tab)}
                  className={`px-2.5 py-1 rounded text-xs font-medium transition-colors whitespace-nowrap ${
                    isActive
                      ? 'bg-blue-600 text-white font-semibold shadow-xs shadow-blue-950/50'
                      : 'text-blue-100/80 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {tab}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Right: Branch Selector + Mode Toggle + Currency + Business Preset + Session + User Profile */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Multi-Branch Selector (Enterprise Odoo Competitor) */}
          <div className="relative hidden md:block">
            <button
              onClick={() => {
                setIsBranchMenuOpen(prev => !prev);
                setIsPresetMenuOpen(false);
                setIsUserMenuOpen(false);
                setIsCurrencyMenuOpen(false);
              }}
              className="flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium bg-blue-950/70 hover:bg-blue-900/60 text-blue-100 transition-colors border border-blue-800/60"
              title="Active Branch Location"
            >
              <Building2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
              <span className="truncate max-w-[110px] xl:max-w-[140px] font-medium text-slate-100">
                {currentBranch.name}
              </span>
              <span className="text-[10px] font-mono px-1 py-0.2 bg-blue-800/50 rounded text-blue-200">
                {currentBranch.code}
              </span>
              <ChevronDown className="w-3 h-3 text-blue-300" />
            </button>

            {isBranchMenuOpen && (
              <div
                className="absolute right-0 mt-1 w-72 bg-white text-slate-800 rounded-xl shadow-2xl border border-slate-200 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100"
                onClick={() => setIsBranchMenuOpen(false)}
              >
                <div className="px-3 py-1.5 border-b border-slate-100 bg-slate-50 rounded-t-xl">
                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Enterprise Branch / Warehouse
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Consolidated inventory & accounting sync
                  </p>
                </div>
                <div className="max-h-64 overflow-y-auto p-1">
                  {branches.map(branch => (
                    <button
                      key={branch.id}
                      onClick={() => setCurrentBranch(branch)}
                      className={`w-full text-left px-3 py-2 text-xs rounded-lg flex items-center justify-between transition-colors ${
                        currentBranch.id === branch.id
                          ? 'bg-blue-50 text-blue-900 font-semibold'
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-slate-900">{branch.name}</span>
                          <span className="text-[10px] font-mono bg-slate-100 text-slate-600 px-1 py-0.2 rounded">
                            {branch.code}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          {branch.city} · Mgr: {branch.manager}
                        </p>
                      </div>
                      {currentBranch.id === branch.id && (
                        <Check className="w-4 h-4 text-blue-600 shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Operating Mode Toggle (Local Retail vs Enterprise ERP) */}
          <div className="hidden lg:flex items-center bg-blue-950/80 p-0.5 rounded-lg border border-blue-800/60 text-xs">
            <button
              onClick={() => setSystemMode('local_retail')}
              className={`px-2 py-0.8 rounded text-[11px] font-medium transition-colors ${
                systemMode === 'local_retail'
                  ? 'bg-blue-600 text-white font-semibold shadow-xs'
                  : 'text-blue-200 hover:text-white'
              }`}
              title="Streamlined local retail cashier mode"
            >
              Local Store
            </button>
            <button
              onClick={() => setSystemMode('enterprise_erp')}
              className={`px-2 py-0.8 rounded text-[11px] font-medium transition-colors ${
                systemMode === 'enterprise_erp'
                  ? 'bg-blue-600 text-white font-semibold shadow-xs'
                  : 'text-blue-200 hover:text-white'
              }`}
              title="Full multi-branch enterprise ERP mode"
            >
              Enterprise ERP
            </button>
          </div>

          {/* Currency Switcher */}
          <div className="relative">
            <button
              onClick={() => {
                setIsCurrencyMenuOpen(prev => !prev);
                setIsPresetMenuOpen(false);
                setIsUserMenuOpen(false);
                setIsBranchMenuOpen(false);
              }}
              className="flex items-center gap-1 px-2 py-1 rounded-md text-xs font-mono font-medium bg-blue-950/70 hover:bg-blue-900/60 text-blue-200 transition-colors border border-blue-800/60"
              title="Active Reporting Currency"
            >
              <Globe className="w-3.5 h-3.5 text-blue-300" />
              <span>{activeCurrency}</span>
              <ChevronDown className="w-2.5 h-2.5 text-blue-300" />
            </button>

            {isCurrencyMenuOpen && (
              <div
                className="absolute right-0 mt-1 w-44 bg-white text-slate-800 rounded-xl shadow-xl border border-slate-200 py-1 z-50 animate-in fade-in zoom-in-95 duration-100"
                onClick={() => setIsCurrencyMenuOpen(false)}
              >
                <div className="px-2.5 py-1 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Currency Conversion
                </div>
                {currencies.map(c => (
                  <button
                    key={c.code}
                    onClick={() => setActiveCurrency(c.code)}
                    className={`w-full text-left px-2.5 py-1.5 text-xs flex items-center justify-between hover:bg-blue-50 transition-colors ${
                      activeCurrency === c.code ? 'bg-blue-50 text-blue-800 font-semibold' : 'text-slate-700'
                    }`}
                  >
                    <span>{c.label}</span>
                    {activeCurrency === c.code && <Check className="w-3.5 h-3.5 text-blue-600" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Business Preset Switcher */}
          <div className="relative hidden sm:block">
            <button
              onClick={() => {
                setIsPresetMenuOpen(prev => !prev);
                setIsUserMenuOpen(false);
                setIsBranchMenuOpen(false);
                setIsCurrencyMenuOpen(false);
              }}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-blue-950/70 hover:bg-blue-900/60 text-blue-100 transition-colors border border-blue-800/60"
              title="Switch Sample Business Catalog"
            >
              <Store className="w-3.5 h-3.5 text-amber-300 shrink-0" />
              <span className="truncate max-w-[110px] md:max-w-[140px] font-medium">
                {settings.businessName}
              </span>
              <ChevronDown className="w-3 h-3 text-blue-200" />
            </button>

            {isPresetMenuOpen && (
              <div
                className="absolute right-0 mt-1 w-64 bg-white text-slate-800 rounded-xl shadow-2xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-100"
                onClick={() => setIsPresetMenuOpen(false)}
              >
                <div className="px-3 py-1.5 border-b border-slate-100 bg-slate-50">
                  <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    Business Domain Presets
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Switch mock catalog & operations
                  </p>
                </div>
                {presetsList.map(preset => (
                  <button
                    key={preset.id}
                    onClick={() => switchPreset(preset.id)}
                    className={`w-full text-left px-3 py-2 text-xs flex flex-col gap-0.5 hover:bg-blue-50 transition-colors ${
                      settings.businessType === preset.id ? 'bg-blue-50 text-blue-900 font-semibold' : 'text-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>{preset.label}</span>
                      {settings.businessType === preset.id && (
                        <span className="text-[10px] text-blue-700 font-bold bg-blue-100 px-1.5 py-0.2 rounded">Active</span>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-500 font-normal">
                      {preset.desc}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* POS Status Badge */}
          {currentApp === 'pos' && (
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono bg-emerald-950/60 text-emerald-300 border border-emerald-500/30">
              <CircleDot className="w-3 h-3 animate-pulse text-emerald-400" />
              <span>Session Open</span>
              <span className="text-emerald-300/80">({currentSession.ordersCount})</span>
            </div>
          )}

          {/* User Role Switcher */}
          <div className="relative">
            <button
              onClick={() => {
                setIsUserMenuOpen(prev => !prev);
                setIsPresetMenuOpen(false);
                setIsBranchMenuOpen(false);
                setIsCurrencyMenuOpen(false);
              }}
              className="flex items-center gap-2 pl-2 pr-1.5 py-1 rounded-md text-xs text-white hover:bg-white/10 transition-colors border border-transparent hover:border-blue-700/50"
              title="Active Employee / Role"
            >
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold text-white shadow-xs ${currentUser.avatarBg}`}>
                {currentUser.name.charAt(0)}
              </div>
              <span className="hidden md:inline font-medium text-blue-100">
                {currentUser.name}
              </span>
              <span className="hidden xl:inline text-[11px] text-blue-200 bg-blue-900/60 border border-blue-700/40 px-1.5 py-0.5 rounded">
                {currentUser.role}
              </span>
              <ChevronDown className="w-3 h-3 text-blue-300" />
            </button>

            {isUserMenuOpen && (
              <div
                className="absolute right-0 mt-1 w-56 bg-white text-slate-800 rounded-xl shadow-2xl border border-slate-200 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100"
                onClick={() => setIsUserMenuOpen(false)}
              >
                <div className="px-3 py-1.5 border-b border-slate-100 bg-slate-50 rounded-t-xl">
                  <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    Switch Active User & Role
                  </p>
                  <p className="text-[11px] text-slate-500">Role-Based Access Control</p>
                </div>
                <div className="p-1">
                  {userRoles.map(user => (
                    <button
                      key={user.id}
                      onClick={() => setCurrentUser(user)}
                      className={`w-full text-left px-3 py-2 text-xs flex items-center gap-2.5 rounded-lg hover:bg-blue-50 transition-colors ${
                        currentUser.id === user.id ? 'bg-blue-50 text-blue-900 font-semibold' : 'text-slate-700'
                      }`}
                    >
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0 ${user.avatarBg}`}>
                        {user.name.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-slate-900 leading-tight truncate">{user.name}</p>
                        <p className="text-[10px] text-slate-500 truncate">{user.role}</p>
                      </div>
                      {currentUser.id === user.id && (
                        <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Secondary Sub-Navigation Bar for medium/small screens */}
      {currentMeta.subTabs.length > 0 && (
        <div className="xl:hidden flex items-center gap-1 px-3 py-1.5 bg-[#0B172A] border-t border-blue-900/40 overflow-x-auto text-xs scrollbar-none">
          {currentMeta.subTabs.map(tab => {
            const isActive = (activeSubTab || currentMeta.subTabs[0]) === tab;
            return (
              <button
                key={tab}
                onClick={() => onSubTabChange?.(tab)}
                className={`px-2.5 py-1 rounded whitespace-nowrap font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-600 text-white font-semibold shadow-xs'
                    : 'text-blue-200/80 hover:text-white hover:bg-white/10'
                }`}
              >
                {tab}
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
};
