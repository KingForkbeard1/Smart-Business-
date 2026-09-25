import React, { useState, useEffect } from 'react';
import { BusinessProvider, useBusiness } from './context/BusinessContext';
import { Navbar } from './components/layout/Navbar';
import { AppLauncherModal } from './components/layout/AppLauncherModal';
import { PosApp } from './components/pos/PosApp';
import { InventoryApp } from './components/inventory/InventoryApp';
import { SalesApp } from './components/sales/SalesApp';
import { PurchasesApp } from './components/purchases/PurchasesApp';
import { CrmApp } from './components/crm/CrmApp';
import { AccountingApp } from './components/accounting/AccountingApp';
import { EmployeesApp } from './components/employees/EmployeesApp';
import { SettingsApp } from './components/settings/SettingsApp';

const MainAppContent: React.FC = () => {
  const { currentApp, toggleAppLauncher } = useBusiness();
  const [activeSubTab, setActiveSubTab] = useState<string>('');

  // Reset active sub-tab when app changes
  useEffect(() => {
    const defaultSubTabs: Record<string, string> = {
      pos: 'Register',
      inventory: 'Products',
      sales: 'Quotations & Orders',
      purchases: 'Purchase Orders',
      crm: 'Sales Pipeline',
      accounting: 'Customer Invoices',
      employees: 'Staff Directory',
      settings: 'Business Profile'
    };
    setActiveSubTab(defaultSubTabs[currentApp] || '');
  }, [currentApp]);

  // Global keyboard shortcut: Alt+A or Cmd+K to toggle App Launcher
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.altKey && e.key.toLowerCase() === 'a') || ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k')) {
        e.preventDefault();
        toggleAppLauncher();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleAppLauncher]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-100 text-slate-800 selection:bg-blue-600/20 selection:text-blue-900 font-sans">
      {/* Odoo Top Bar */}
      <Navbar
        activeSubTab={activeSubTab}
        onSubTabChange={setActiveSubTab}
      />

      {/* Main Viewport Container */}
      <main className="flex-1 flex flex-col min-h-0">
        {currentApp === 'pos' && <PosApp activeTab={activeSubTab} />}
        {currentApp === 'inventory' && <InventoryApp activeTab={activeSubTab} />}
        {currentApp === 'sales' && <SalesApp activeTab={activeSubTab} />}
        {currentApp === 'purchases' && <PurchasesApp activeTab={activeSubTab} />}
        {currentApp === 'crm' && <CrmApp activeTab={activeSubTab} />}
        {currentApp === 'accounting' && <AccountingApp activeTab={activeSubTab} />}
        {currentApp === 'employees' && <EmployeesApp activeTab={activeSubTab} />}
        {currentApp === 'settings' && <SettingsApp activeTab={activeSubTab} />}
      </main>

      {/* Full-Screen Odoo 9-Dots App Grid Launcher */}
      <AppLauncherModal />
    </div>
  );
};

export default function App() {
  return (
    <BusinessProvider>
      <MainAppContent />
    </BusinessProvider>
  );
}
