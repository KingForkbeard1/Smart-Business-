import React, { useState } from 'react';
import { useBusiness } from '../../context/BusinessContext';
import { BusinessPreset, MpesaConfig } from '../../types';
import { ControlPanel } from '../layout/ControlPanel';
import { MpesaStkModal } from '../mpesa/MpesaStkModal';
import {
  Settings,
  Store,
  Database,
  Download,
  Upload,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Save,
  Smartphone,
  ShieldCheck,
  Send,
  Zap,
  Globe,
  Info
} from 'lucide-react';

interface SettingsAppProps {
  activeTab?: string;
}

export const SettingsApp: React.FC<SettingsAppProps> = ({ activeTab = 'Business Profile' }) => {
  const {
    settings,
    updateSettings,
    switchPreset,
    exportDataJson,
    importDataJson,
    resetAllData,
    formatCurrency
  } = useBusiness();

  const [formSettings, setFormSettings] = useState({
    businessName: settings.businessName,
    currencySymbol: settings.currencySymbol,
    taxRate: settings.taxRate * 100,
    taxName: settings.taxName,
    address: settings.address,
    phone: settings.phone,
    email: settings.email,
    receiptFooter: settings.receiptFooter
  });

  const [mpesaSettings, setMpesaSettings] = useState<MpesaConfig>(() => settings.mpesa || {
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
  });

  const [testingConnection, setTestingConnection] = useState(false);
  const [connectionTestResult, setConnectionTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const [saveSuccess, setSaveSuccess] = useState(false);
  const [mpesaSaveSuccess, setMpesaSaveSuccess] = useState(false);
  const [importError, setImportError] = useState('');
  const [importSuccess, setImportSuccess] = useState(false);
  const [isTestStkModalOpen, setIsTestStkModalOpen] = useState(false);
  const [testPhoneNumber, setTestPhoneNumber] = useState('0712345678');
  const [testAmount, setTestAmount] = useState<number>(10);
  const [testSuccessMessage, setTestSuccessMessage] = useState('');

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      businessName: formSettings.businessName,
      currencySymbol: formSettings.currencySymbol,
      taxRate: Number(formSettings.taxRate) / 100,
      taxName: formSettings.taxName,
      address: formSettings.address,
      phone: formSettings.phone,
      email: formSettings.email,
      receiptFooter: formSettings.receiptFooter
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleSaveMpesa = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      mpesa: mpesaSettings
    });
    setMpesaSaveSuccess(true);
    setTimeout(() => setMpesaSaveSuccess(false), 2500);
  };

  const handleSetKenyanShillings = () => {
    setFormSettings(prev => ({
      ...prev,
      currencySymbol: 'KSh ',
      taxName: 'VAT',
      taxRate: 16
    }));
    updateSettings({
      currencySymbol: 'KSh ',
      currency: 'KES',
      taxName: 'VAT',
      taxRate: 0.16
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleExportJson = () => {
    const jsonStr = exportDataJson();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `odoo_backup_${settings.businessType}_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = event => {
      const content = event.target?.result as string;
      const success = importDataJson(content);
      if (success) {
        setImportSuccess(true);
        setImportError('');
        setTimeout(() => setImportSuccess(false), 3000);
      } else {
        setImportError('Invalid JSON backup file schema.');
      }
    };
    reader.readAsText(file);
  };

  // M-Pesa STK Setup Tab
  if (activeTab === 'M-Pesa STK Setup') {
    return (
      <div className="flex-1 flex flex-col bg-slate-100 min-h-[calc(100vh-3rem)]">
        <ControlPanel breadcrumbs={['Settings', 'Payments', 'Lipa Na M-Pesa Daraja 2.0']} />

        <div className="p-6 max-w-4xl w-full mx-auto space-y-6">
          {/* Quick Kenyan Shilling Banner */}
          {settings.currencySymbol !== 'KSh ' && (
            <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-emerald-950">
              <div className="flex items-center gap-2.5">
                <Globe className="w-5 h-5 text-[#00843D] shrink-0" />
                <div>
                  <p className="font-bold text-sm text-[#00843D]">Running in Kenya?</p>
                  <p className="text-slate-600">Switch store currency to Kenyan Shillings (KSh) & 16% VAT with one click.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleSetKenyanShillings}
                className="px-3.5 py-2 bg-[#00843D] hover:bg-[#007033] text-white font-bold rounded-lg shadow-xs transition-colors shrink-0"
              >
                Set Store to KSh (KES)
              </button>
            </div>
          )}

          {/* M-Pesa Configuration Form */}
          <form onSubmit={handleSaveMpesa} className="bg-white border border-slate-200 rounded-xl shadow-xs p-6 space-y-5 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#00843D] text-white flex items-center justify-center font-bold text-xs tracking-wider">
                  M-PESA
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">Lipa Na M-Pesa Online (Daraja API)</h3>
                  <p className="text-slate-500">Configure automated STK Push prompts for POS and invoice payments.</p>
                </div>
              </div>

              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#00843D] hover:bg-[#007033] text-white rounded-lg font-semibold shadow-xs transition-colors"
              >
                <Save className="w-4 h-4" />
                <span>Save M-Pesa Config</span>
              </button>
            </div>

            {mpesaSaveSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>M-Pesa STK Push settings saved and active in POS cashier!</span>
              </div>
            )}

            {/* Toggle Enabled */}
            <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <div>
                <p className="font-bold text-slate-900">Enable M-Pesa STK Push at Checkout</p>
                <p className="text-slate-500 text-[11px]">Displays Lipa Na M-Pesa button on cash register and invoice modals</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={mpesaSettings.enabled}
                  onChange={e => setMpesaSettings({ ...mpesaSettings, enabled: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#00843D]"></div>
              </label>
            </div>

            {/* Merchant Recipient Account Settings (Where money enters) */}
            <div className="p-4 bg-emerald-50/80 border border-emerald-300 rounded-xl space-y-3">
              <div className="flex items-center justify-between border-b border-emerald-200 pb-2">
                <div className="flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-[#00843D]" />
                  <span className="font-bold text-slate-900 text-sm">Merchant Receiving M-Pesa Account</span>
                </div>
                <span className="text-[11px] font-mono font-bold bg-[#00843D] text-white px-2 py-0.5 rounded">
                  MONEY DEPOSIT NUMBER
                </span>
              </div>

              <p className="text-[11px] text-slate-600">
                All customer M-Pesa payments (STK Push, Till, or direct Pochi) will be credited to this phone number.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Your M-Pesa Phone Number (Receiving Account)
                  </label>
                  <input
                    type="text"
                    required
                    value={mpesaSettings.receivingPhone}
                    onChange={e => setMpesaSettings({ ...mpesaSettings, receivingPhone: e.target.value })}
                    placeholder="0757329235"
                    className="w-full px-3 py-2 font-mono font-bold text-[#00843D] text-sm bg-white border border-emerald-300 rounded-lg focus:ring-2 focus:ring-[#00843D]"
                  />
                  <span className="text-[10px] text-slate-500 mt-0.5 block">
                    Phone number where money enters (Victor Mwangi)
                  </span>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Account Owner / Merchant Name
                  </label>
                  <input
                    type="text"
                    required
                    value={mpesaSettings.ownerName}
                    onChange={e => setMpesaSettings({ ...mpesaSettings, ownerName: e.target.value })}
                    placeholder="Victor Mwangi"
                    className="w-full px-3 py-2 font-bold text-slate-900 text-sm bg-white border border-emerald-300 rounded-lg focus:ring-2 focus:ring-[#00843D]"
                  />
                  <span className="text-[10px] text-slate-500 mt-0.5 block">
                    Displayed on thermal receipts and payment instructions
                  </span>
                </div>
              </div>
            </div>

            {/* Business Type: Buy Goods Till vs Paybill vs Direct Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">M-Pesa Business Channel</label>
                <select
                  value={mpesaSettings.businessType}
                  onChange={e => setMpesaSettings({ ...mpesaSettings, businessType: e.target.value as any })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                >
                  <option value="phone">Direct to Phone / Pochi La Biashara ({mpesaSettings.receivingPhone || '0757329235'})</option>
                  <option value="till">Buy Goods Till Number (Lipa Na M-Pesa)</option>
                  <option value="paybill">Paybill Business Number</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  {mpesaSettings.businessType === 'phone'
                    ? 'Receiving Phone Number'
                    : mpesaSettings.businessType === 'till'
                    ? 'Till Number (Shortcode)'
                    : 'Paybill Number'}
                </label>
                <input
                  type="text"
                  required
                  value={mpesaSettings.shortcode}
                  onChange={e => setMpesaSettings({ ...mpesaSettings, shortcode: e.target.value })}
                  placeholder={mpesaSettings.receivingPhone || '0757329235'}
                  className="w-full px-3 py-2 font-mono font-bold text-slate-900 border border-slate-300 rounded-lg text-xs"
                />
              </div>
            </div>

            {/* Explanatory Notice for Personal Phone vs Till */}
            {mpesaSettings.businessType === 'phone' && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl space-y-1 text-xs text-amber-900">
                <div className="flex items-center gap-1.5 font-bold text-amber-950">
                  <Info className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Personal Phone (0757329235) &amp; STK Push Requirements</span>
                </div>
                <p className="text-[11px] leading-relaxed text-amber-800">
                  Safaricom's automated STK push API (Daraja) requires an official <strong>M-Pesa Buy Goods Till</strong> or <strong>Paybill</strong> number.
                  Personal phone numbers (0757329235) cannot receive automated STK network pushes directly from Safaricom. Customers can pay you via <strong>Send Money / Pochi La Biashara</strong> or by tapping the <strong>1-Tap USSD dial</strong>.
                </p>
                <p className="text-[11px] leading-relaxed text-amber-900 font-semibold pt-1 border-t border-amber-200">
                  Want automated STK prompts? Apply for a free <strong>Lipa Na M-Pesa Till</strong> on Safaricom's website linked to your phone 0757329235, then enter the Till number above!
                </p>
              </div>
            )}

            {/* Account Reference & Environment */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Account Reference / Identifier</label>
                <input
                  type="text"
                  value={mpesaSettings.accountReference}
                  onChange={e => setMpesaSettings({ ...mpesaSettings, accountReference: e.target.value })}
                  placeholder="e.g. POS-TILL-01"
                  className="w-full px-3 py-2 font-mono border border-slate-300 rounded-lg text-xs"
                />
                <span className="text-[10px] text-slate-400 mt-0.5 block">Displayed on customer's phone prompt</span>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Daraja API Gateway Environment</label>
                <select
                  value={mpesaSettings.environment}
                  onChange={e => setMpesaSettings({ ...mpesaSettings, environment: e.target.value as any })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-semibold"
                >
                  <option value="sandbox">Sandbox (Development / Test Simulator)</option>
                  <option value="production">Production (Live Safaricom Gateway)</option>
                </select>
              </div>
            </div>

            {/* Passkey */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Lipa Na M-Pesa Online Passkey</label>
              <input
                type="text"
                value={mpesaSettings.passkey}
                onChange={e => setMpesaSettings({ ...mpesaSettings, passkey: e.target.value })}
                placeholder="bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919"
                className="w-full px-3 py-2 font-mono text-[11px] border border-slate-300 rounded-lg"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">
                Provided on the Safaricom Daraja Developer portal for STK push encryption.
              </span>
            </div>

            {/* Consumer Key & Secret */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Consumer Key</label>
                <input
                  type="text"
                  value={mpesaSettings.consumerKey}
                  onChange={e => setMpesaSettings({ ...mpesaSettings, consumerKey: e.target.value })}
                  placeholder="Optional: Enter Daraja App Consumer Key"
                  className="w-full px-3 py-2 font-mono text-[11px] border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Consumer Secret</label>
                <input
                  type="password"
                  value={mpesaSettings.consumerSecret}
                  onChange={e => setMpesaSettings({ ...mpesaSettings, consumerSecret: e.target.value })}
                  placeholder="Optional: Enter Daraja App Consumer Secret"
                  className="w-full px-3 py-2 font-mono text-[11px] border border-slate-300 rounded-lg"
                />
              </div>
            </div>

            {/* Test Connection Button */}
            <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200">
              <div>
                <span className="font-semibold text-slate-800 text-xs block">Verify Daraja Credentials</span>
                <span className="text-[11px] text-slate-500">Test live OAuth handshake with Safaricom gateway</span>
              </div>
              <button
                type="button"
                disabled={testingConnection || !mpesaSettings.consumerKey || !mpesaSettings.consumerSecret}
                onClick={async () => {
                  setTestingConnection(true);
                  setConnectionTestResult(null);
                  try {
                    const res = await fetch('/api/mpesa/test-connection', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        consumerKey: mpesaSettings.consumerKey,
                        consumerSecret: mpesaSettings.consumerSecret,
                        environment: mpesaSettings.environment
                      })
                    });
                    const d = await res.json();
                    setConnectionTestResult({
                      success: res.ok && d.success,
                      message: d.message || d.error || 'Connection failed'
                    });
                  } catch (e: any) {
                    setConnectionTestResult({ success: false, message: e.message || 'Network error' });
                  } finally {
                    setTestingConnection(false);
                  }
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  !mpesaSettings.consumerKey || !mpesaSettings.consumerSecret
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    : 'bg-emerald-700 hover:bg-emerald-800 text-white'
                }`}
              >
                {testingConnection ? 'Testing...' : 'Test Safaricom Handshake'}
              </button>
            </div>

            {connectionTestResult && (
              <div
                className={`p-3 rounded-lg text-xs font-semibold flex items-center gap-2 ${
                  connectionTestResult.success
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-rose-50 text-rose-800 border border-rose-200'
                }`}
              >
                {connectionTestResult.success ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                )}
                <span>{connectionTestResult.message}</span>
              </div>
            )}
          </form>

          {/* Test STK Push Simulator Box */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-xs p-6 space-y-4 text-xs">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-500" />
              <div>
                <h4 className="font-bold text-sm text-slate-900">Test Live STK Push Workflow</h4>
                <p className="text-slate-500">
                  Send an STK push prompt directly to a customer's phone handset. Payment will be credited to{' '}
                  <strong className="text-[#00843D]">{mpesaSettings.receivingPhone || '0757329235'}</strong> ({mpesaSettings.ownerName || 'Victor Mwangi'}).
                </p>
              </div>
            </div>

            {testSuccessMessage && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{testSuccessMessage}</span>
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="w-full sm:w-48">
                <label className="block font-semibold text-slate-700 mb-1">Phone Number</label>
                <input
                  type="text"
                  value={testPhoneNumber}
                  onChange={e => setTestPhoneNumber(e.target.value)}
                  placeholder="0712 345 678"
                  className="w-full px-3 py-2 font-mono border border-slate-300 rounded-lg"
                />
              </div>

              <div className="w-full sm:w-36">
                <label className="block font-semibold text-slate-700 mb-1">Amount</label>
                <input
                  type="number"
                  min="1"
                  value={testAmount}
                  onChange={e => setTestAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 font-mono border border-slate-300 rounded-lg"
                />
              </div>

              <div className="w-full sm:w-auto sm:self-end">
                <button
                  type="button"
                  onClick={() => setIsTestStkModalOpen(true)}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 bg-[#00843D] hover:bg-[#007033] text-white font-bold rounded-lg shadow-xs transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Test STK Push Prompt</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Test STK Modal */}
        {isTestStkModalOpen && (
          <MpesaStkModal
            amount={testAmount}
            reference="TEST-STK-001"
            customerName="Store Tester"
            defaultPhone={testPhoneNumber}
            onSuccess={(receipt, phone) => {
              setIsTestStkModalOpen(false);
              setTestSuccessMessage(`Test STK Push successful! Received receipt: ${receipt} from +${phone}`);
              setTimeout(() => setTestSuccessMessage(''), 5000);
            }}
            onClose={() => setIsTestStkModalOpen(false)}
          />
        )}
      </div>
    );
  }

  // Data & Backups Tab
  if (activeTab === 'Data & Backups') {
    return (
      <div className="flex-1 flex flex-col bg-slate-100 min-h-[calc(100vh-3rem)]">
        <ControlPanel breadcrumbs={['Settings', 'Configuration', 'Database Backup & Presets']} />

        <div className="p-6 max-w-4xl w-full mx-auto space-y-6">
          {/* Switch Preset */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-xs p-6 space-y-4">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Switch Industry Preset Data</h3>
              <p className="text-xs text-slate-500">
                Load full sample catalogs, customers, orders, and products for different local business types.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { id: 'grocery' as BusinessPreset, title: 'Grocery & Deli Mart', desc: 'Produce, dairy, pantry & bakery items' },
                { id: 'cafe' as BusinessPreset, title: 'Artisan Café & Roastery', desc: 'Espresso, pour-overs, pastries & whole beans' },
                { id: 'hardware' as BusinessPreset, title: 'Hardware & Supply', desc: 'Tools, electrical, fasteners & construction supplies' }
              ].map(preset => (
                <button
                  key={preset.id}
                  onClick={() => switchPreset(preset.id)}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    settings.businessType === preset.id
                      ? 'bg-blue-50 border-blue-500 ring-1 ring-blue-500'
                      : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-xs text-slate-900">{preset.title}</h4>
                    {settings.businessType === preset.id && (
                      <span className="text-[10px] font-bold text-blue-700">Active</span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1 leading-normal">{preset.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Export & Import */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-xs p-6 space-y-4">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Export & Restore Store Database</h3>
              <p className="text-xs text-slate-500">
                Save complete local business records or migrate data to another computer.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <div>
                  <h4 className="font-semibold text-xs text-slate-900">Export Backup File</h4>
                  <p className="text-[11px] text-slate-500">Downloads complete JSON snapshot of all modules</p>
                </div>
                <button
                  onClick={handleExportJson}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Backup JSON</span>
                </button>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <div>
                  <h4 className="font-semibold text-xs text-slate-900">Restore from File</h4>
                  <p className="text-[11px] text-slate-500">Upload a previously exported store JSON file</p>
                </div>
                <label className="inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 text-xs font-semibold rounded-lg shadow-xs cursor-pointer transition-colors">
                  <Upload className="w-4 h-4" />
                  <span>Select JSON File</span>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImportFile}
                    className="hidden"
                  />
                </label>
                {importSuccess && (
                  <p className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Database restored successfully!
                  </p>
                )}
                {importError && (
                  <p className="text-xs text-rose-600 font-semibold">{importError}</p>
                )}
              </div>
            </div>

            {/* Reset */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-xs text-slate-900">Reset Demo Data</h4>
                <p className="text-[11px] text-slate-500">Restore this preset to original clean seed data</p>
              </div>
              <button
                onClick={resetAllData}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-rose-600 hover:bg-rose-50 text-xs font-semibold rounded-lg border border-rose-200 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset to Preset Defaults</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // DEFAULT TAB: Business Profile
  return (
    <div className="flex-1 flex flex-col bg-slate-100 min-h-[calc(100vh-3rem)]">
      <ControlPanel breadcrumbs={['Settings', 'Configuration', 'Business Profile & Taxes']} />

      <div className="p-6 max-w-4xl w-full mx-auto space-y-6">
        <form onSubmit={handleSaveSettings} className="bg-white border border-slate-200 rounded-xl shadow-xs p-6 space-y-6 text-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-sm text-slate-900">Store Profile & Configuration</h3>
              <p className="text-slate-500">Manage business details printed on POS receipts and invoices.</p>
            </div>

            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold shadow-xs transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>Save Configuration</span>
            </button>
          </div>

          {saveSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Settings successfully saved and active across all modules!</span>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Business Name</label>
              <input
                type="text"
                required
                value={formSettings.businessName}
                onChange={e => setFormSettings({ ...formSettings, businessName: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-900"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Currency Symbol</label>
                <input
                  type="text"
                  required
                  value={formSettings.currencySymbol}
                  onChange={e => setFormSettings({ ...formSettings, currencySymbol: e.target.value })}
                  placeholder="$, €, £, KSh "
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono font-bold"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tax Name</label>
                <input
                  type="text"
                  required
                  value={formSettings.taxName}
                  onChange={e => setFormSettings({ ...formSettings, taxName: e.target.value })}
                  placeholder="Sales Tax, VAT, GST"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Default Tax Rate (%)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  value={formSettings.taxRate}
                  onChange={e => setFormSettings({ ...formSettings, taxRate: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono font-bold"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Store Address</label>
                <input
                  type="text"
                  value={formSettings.address}
                  onChange={e => setFormSettings({ ...formSettings, address: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Phone Number</label>
                <input
                  type="text"
                  value={formSettings.phone}
                  onChange={e => setFormSettings({ ...formSettings, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Receipt Footer Message</label>
              <textarea
                rows={2}
                value={formSettings.receiptFooter}
                onChange={e => setFormSettings({ ...formSettings, receiptFooter: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs italic"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Printed at the bottom of customer thermal receipts and checkout printouts.
              </span>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
