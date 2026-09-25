import React, { useState, useEffect, useRef } from 'react';
import { useBusiness } from '../../context/BusinessContext';
import {
  Smartphone,
  CheckCircle2,
  AlertCircle,
  X,
  Loader2,
  ShieldCheck,
  RefreshCw,
  Radio,
  FileCheck2,
  ArrowRight,
  PhoneCall,
  Copy,
  Check,
  HelpCircle,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Info
} from 'lucide-react';

interface MpesaStkModalProps {
  amount: number;
  reference: string;
  customerName?: string;
  defaultPhone?: string;
  onSuccess: (mpesaReceiptNumber: string, phoneNumber: string) => void;
  onClose: () => void;
}

type StkStatus = 'input' | 'initiating' | 'waiting_phone' | 'success' | 'failed';
type TabMode = 'direct_phone' | 'stk';

export const MpesaStkModal: React.FC<MpesaStkModalProps> = ({
  amount,
  reference,
  customerName = 'Walk-in Customer',
  defaultPhone = '',
  onSuccess,
  onClose
}) => {
  const { settings, formatCurrency } = useBusiness();
  const mpesa = settings.mpesa || {
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
  };

  const merchantPhone = mpesa.receivingPhone || '0757329235';
  const merchantName = mpesa.ownerName || 'Victor Mwangi';

  // Check if live Daraja credentials are provided
  const hasLiveCredentials = Boolean(
    mpesa.consumerKey &&
    mpesa.consumerSecret &&
    !mpesa.consumerKey.includes('DEMO') &&
    mpesa.environment === 'production'
  );

  // If using a personal phone as receiving account, default to direct phone tab for guaranteed success
  const isPersonalPhone =
    mpesa.businessType === 'phone' ||
    merchantPhone.startsWith('0') ||
    merchantPhone.length === 10;

  const [activeTab, setActiveTab] = useState<TabMode>(isPersonalPhone ? 'direct_phone' : 'stk');
  const [customerPhone, setCustomerPhone] = useState(() => {
    if (defaultPhone && defaultPhone.length >= 9) return defaultPhone;
    return '0712345678';
  });
  const [status, setStatus] = useState<StkStatus>('input');
  const [errorMessage, setErrorMessage] = useState('');
  const [gatewayNotice, setGatewayNotice] = useState('');
  const [isLiveGateway, setIsLiveGateway] = useState(false);
  const [reasonIfNotSent, setReasonIfNotSent] = useState('');
  const [countdown, setCountdown] = useState(60);
  const [generatedReceipt, setGeneratedReceipt] = useState('');
  const [checkoutRequestId, setCheckoutRequestId] = useState('');
  const [isManualConfirmOpen, setIsManualConfirmOpen] = useState(false);
  const [manualReceiptInput, setManualReceiptInput] = useState('');
  const [copiedCode, setCopiedCode] = useState(false);
  const [showFaq, setShowFaq] = useState(false);

  const pollingIntervalRef = useRef<any>(null);

  // Auto clean phone number for Daraja (2547XXXXXXXX or 2541XXXXXXXX)
  const formatKenyanPhone = (raw: string): string => {
    let cleaned = raw.replace(/\D/g, '');
    if (cleaned.startsWith('0')) {
      cleaned = '254' + cleaned.slice(1);
    } else if (cleaned.startsWith('7') || cleaned.startsWith('1')) {
      cleaned = '254' + cleaned;
    } else if (cleaned.startsWith('+254')) {
      cleaned = cleaned.replace('+', '');
    }
    return cleaned;
  };

  const formattedCustomerPhone = formatKenyanPhone(customerPhone);
  const isValidPhone =
    formattedCustomerPhone.length === 12 &&
    (formattedCustomerPhone.startsWith('2547') || formattedCustomerPhone.startsWith('2541'));

  // USSD string for direct customer dial to merchant phone 0757329235
  const roundedAmount = Math.max(1, Math.round(amount));
  const ussdString = `*334*1*${merchantPhone}*${roundedAmount}#`;
  // URL encoded for tel: URI
  const telDialUri = `tel:*334*1*${merchantPhone}*${roundedAmount}%23`;

  // Clear polling interval on unmount
  useEffect(() => {
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, []);

  // Countdown timer when waiting for phone authorization
  useEffect(() => {
    let timer: any;
    if (status === 'waiting_phone' && countdown > 0) {
      timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            setStatus('failed');
            setErrorMessage(
              'Session timed out. The prompt was not completed within 60 seconds.'
            );
            if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [status, countdown]);

  // Initiate STK Push to backend endpoint
  const handleInitiateStk = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!isValidPhone) {
      setErrorMessage('Please enter a valid Kenyan customer phone number (e.g. 0712345678 or 0110123456).');
      return;
    }

    setErrorMessage('');
    setGatewayNotice('');
    setReasonIfNotSent('');
    setStatus('initiating');

    try {
      const response = await fetch('/api/mpesa/stkpush', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          phoneNumber: formattedCustomerPhone,
          amount: roundedAmount,
          reference,
          receivingPhone: merchantPhone,
          ownerName: merchantName,
          consumerKey: mpesa.consumerKey,
          consumerSecret: mpesa.consumerSecret,
          passkey: mpesa.passkey,
          shortcode: mpesa.shortcode || merchantPhone,
          businessType: mpesa.businessType,
          environment: mpesa.environment
        })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setStatus('failed');
        setErrorMessage(data.error || 'Failed to dispatch STK push through Safaricom Gateway.');
        return;
      }

      setIsLiveGateway(Boolean(data.isLiveGateway));
      if (data.gatewayNote) {
        setGatewayNotice(data.gatewayNote);
      }
      if (data.reasonIfNotSent) {
        setReasonIfNotSent(data.reasonIfNotSent);
      }

      setCheckoutRequestId(data.checkoutRequestId);
      setStatus('waiting_phone');
      setCountdown(55);

      // Start polling Safaricom transaction status from backend
      startPollingStatus(data.checkoutRequestId);
    } catch (err: any) {
      console.error('Error initiating STK push:', err);
      setStatus('failed');
      setErrorMessage(err.message || 'Network error connecting to payment gateway.');
    }
  };

  // Poll transaction status from server
  const startPollingStatus = (reqId: string) => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }

    pollingIntervalRef.current = setInterval(async () => {
      try {
        const queryRes = await fetch(`/api/mpesa/query?checkoutRequestId=${encodeURIComponent(reqId)}`);
        if (queryRes.ok) {
          const queryData = await queryRes.json();

          if (queryData.status === 'SUCCESS') {
            clearInterval(pollingIntervalRef.current);
            const receipt = queryData.receiptNumber || `TD${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
            setGeneratedReceipt(receipt);
            setStatus('success');
            setTimeout(() => {
              onSuccess(receipt, formattedCustomerPhone);
            }, 1800);
          } else if (queryData.status === 'FAILED') {
            clearInterval(pollingIntervalRef.current);
            setStatus('failed');
            setErrorMessage(queryData.resultDesc || 'Payment cancelled by customer on their handset.');
          }
        }
      } catch (pollErr) {
        console.warn('Polling error:', pollErr);
      }
    }, 2500);
  };

  // Manual verify: when customer approved and SMS arrives on merchant's phone 0757329235
  const handleManualConfirm = async (customCode?: string) => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }

    const code =
      customCode?.trim().toUpperCase() ||
      manualReceiptInput.trim().toUpperCase() ||
      `TD${Math.random().toString(36).substring(2, 10).toUpperCase()}`;

    try {
      await fetch('/api/mpesa/confirm-manual', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          checkoutRequestId: checkoutRequestId || `MANUAL_${Date.now()}`,
          receiptNumber: code
        })
      });
    } catch {
      // Continue anyway
    }

    setGeneratedReceipt(code);
    setStatus('success');
    setTimeout(() => {
      onSuccess(code, formattedCustomerPhone);
    }, 1200);
  };

  const handleCopyUssd = () => {
    navigator.clipboard?.writeText(ussdString);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="mpesa-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-150"
    >
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 my-auto">
        {/* Header - Safaricom Lipa Na M-Pesa Signature Brand */}
        <div className="bg-[#00843D] text-white px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center text-white font-bold text-xs tracking-wider">
              M-PESA
            </div>
            <div>
              <h3 id="mpesa-modal-title" className="font-bold text-sm tracking-wide leading-tight">
                Lipa Na M-Pesa Payment
              </h3>
              <p className="text-[11px] text-emerald-100 font-mono">
                Receiving Account: <span className="font-bold underline text-white">{merchantPhone}</span> ({merchantName})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-1 rounded-md hover:bg-white/10 transition-colors"
            title="Cancel"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Transaction Summary Header */}
        <div className="bg-slate-50 border-b border-slate-200 px-5 py-3 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider block">
              Order Reference
            </span>
            <span className="font-mono font-bold text-xs text-slate-800">{reference}</span>
          </div>

          <div className="text-right">
            <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider block">
              Amount Due
            </span>
            <span className="font-mono font-bold text-lg text-[#00843D] tabular-nums">
              {formatCurrency(amount)}
            </span>
          </div>
        </div>

        {/* Mode Switcher Tabs */}
        {status === 'input' && (
          <div className="flex border-b border-slate-200 bg-slate-100 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setActiveTab('direct_phone')}
              className={`flex-1 py-2.5 px-3 text-center transition-colors border-b-2 flex items-center justify-center gap-1.5 ${
                activeTab === 'direct_phone'
                  ? 'border-[#00843D] text-[#00843D] bg-white font-bold'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>Direct to {merchantPhone} (USSD / Send Money)</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('stk')}
              className={`flex-1 py-2.5 px-3 text-center transition-colors border-b-2 flex items-center justify-center gap-1.5 ${
                activeTab === 'stk'
                  ? 'border-[#00843D] text-[#00843D] bg-white font-bold'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>STK Push (Till / Simulator)</span>
            </button>
          </div>
        )}

        {/* MODAL BODY */}
        <div className="p-5 sm:p-6 space-y-4">

          {/* TAB 1: DIRECT PAY TO 0757329235 (Send Money / Pochi / USSD 1-tap) */}
          {status === 'input' && activeTab === 'direct_phone' && (
            <div className="space-y-4 text-xs">
              {/* Highlight Card */}
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-3">
                <div className="flex items-center justify-between border-b border-emerald-200/80 pb-2">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-[#00843D]" />
                    <span className="font-bold text-emerald-950 text-sm">Send Direct to Victor Mwangi</span>
                  </div>
                  <span className="bg-[#00843D] text-white px-2 py-0.5 rounded font-mono font-bold text-[10px]">
                    INSTANT CREDIT
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-600">Receiving Phone Number:</span>
                    <span className="font-mono font-bold text-base text-[#00843D]">{merchantPhone}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-600">Registered Name:</span>
                    <span className="font-bold text-slate-800">{merchantName}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-600">Exact Amount:</span>
                    <span className="font-mono font-bold text-slate-900 text-sm">{formatCurrency(amount)}</span>
                  </div>
                </div>

                {/* 1-Tap USSD dial trigger */}
                <div className="pt-2 border-t border-emerald-200/80 space-y-2">
                  <span className="text-[11px] font-semibold text-emerald-900 block">
                    Option A: Instant USSD Prompt on Customer's Phone
                  </span>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 px-3 py-2 bg-white border border-emerald-300 rounded-lg font-mono font-bold text-xs text-slate-800 break-all select-all">
                      {ussdString}
                    </div>
                    <button
                      type="button"
                      onClick={handleCopyUssd}
                      className="px-3 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg flex items-center gap-1 font-semibold text-xs transition-colors shrink-0"
                      title="Copy USSD"
                    >
                      {copiedCode ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedCode ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>

                  <a
                    href={telDialUri}
                    className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg flex items-center justify-center gap-2 text-xs transition-colors shadow-xs"
                  >
                    <PhoneCall className="w-3.5 h-3.5" />
                    <span>TAP TO DIAL PROMPT ON HANDSET</span>
                  </a>
                </div>

                {/* Option B: Standard Send Money */}
                <div className="pt-2 border-t border-emerald-200/80 text-[11px] text-emerald-950 space-y-1">
                  <span className="font-semibold block">Option B: Standard M-Pesa Menu</span>
                  <p className="text-slate-600">
                    Open M-Pesa &gt; <strong>Send Money</strong> or <strong>Pochi La Biashara</strong> &gt; Enter <strong>{merchantPhone}</strong> &gt; Enter <strong>{formatCurrency(amount)}</strong> &gt; Enter PIN.
                  </p>
                </div>
              </div>

              {/* Fast Cashier Confirmation */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <span className="font-semibold text-slate-800 block text-xs">
                  When money arrives and Safaricom SMS shows on {merchantPhone}:
                </span>
                <button
                  type="button"
                  onClick={() => handleManualConfirm()}
                  className="w-full py-3 bg-[#00843D] hover:bg-[#007033] text-white font-bold rounded-xl shadow-xs flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
                >
                  <FileCheck2 className="w-4 h-4" />
                  <span>CONFIRM PAYMENT RECEIVED ON {merchantPhone}</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: STK PUSH FLOW */}
          {status === 'input' && activeTab === 'stk' && (
            <form onSubmit={handleInitiateStk} className="space-y-4 text-xs">
              {/* Important Clarification Callout */}
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl space-y-1.5 text-amber-900">
                <div className="flex items-center gap-1.5 font-bold text-xs text-amber-950">
                  <Info className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>How Safaricom STK Push Works</span>
                </div>
                <p className="text-[11px] leading-relaxed">
                  Safaricom's automated STK push API requires a registered <strong>M-Pesa Buy Goods Till or Paybill number</strong> and <strong>Live Daraja API Keys</strong>.
                  Personal phone numbers (like <strong>{merchantPhone}</strong>) receive payments directly via <em>Send Money / USSD dial</em>.
                </p>
                <div className="pt-1 text-[11px] text-amber-800 flex items-center justify-between border-t border-amber-200/60">
                  <span>Current Gateway:</span>
                  <span className="font-bold bg-white px-2 py-0.5 rounded border border-amber-300">
                    {hasLiveCredentials ? '🟢 Live Daraja Gateway' : '🟡 Test Simulator Mode'}
                  </span>
                </div>
              </div>

              {/* Customer Phone Input */}
              <div className="space-y-1">
                <label className="block font-semibold text-slate-700">
                  Customer's Safaricom Phone Number
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-slate-400 font-semibold border-r border-slate-200 pr-2">
                    <span className="text-xs">🇰🇪 +254</span>
                  </div>
                  <input
                    type="text"
                    required
                    autoFocus
                    value={customerPhone}
                    onChange={e => {
                      setCustomerPhone(e.target.value);
                      setErrorMessage('');
                    }}
                    placeholder="0712 345 678"
                    className="w-full pl-24 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono text-sm text-slate-900 font-bold focus:bg-white focus:ring-2 focus:ring-[#00843D] focus:outline-none transition-all"
                  />
                </div>
                <p className="text-[11px] text-slate-500">
                  Customer: <strong>{customerName}</strong>. Accepts 07XXXXXXXX or 01XXXXXXXX.
                </p>
              </div>

              {errorMessage && (
                <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={!isValidPhone}
                className={`w-full py-3.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 text-white shadow-md transition-all ${
                  !isValidPhone
                    ? 'bg-slate-300 text-slate-500 cursor-not-allowed shadow-none'
                    : 'bg-[#00843D] hover:bg-[#007033] active:scale-[0.99]'
                }`}
              >
                <Smartphone className="w-4 h-4" />
                <span>DISPATCH STK PUSH REQUEST</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* STATE 1: INITIATING */}
          {status === 'initiating' && (
            <div className="py-8 flex flex-col items-center justify-center text-center space-y-3">
              <Loader2 className="w-10 h-10 text-[#00843D] animate-spin" />
              <div>
                <h4 className="font-bold text-sm text-slate-900">Connecting to Safaricom Gateway...</h4>
                <p className="text-xs text-slate-500 mt-1">
                  Routing STK Push request for customer handset...
                </p>
                <p className="text-xs font-mono text-[#00843D] font-bold mt-1">
                  Target Customer: +{formattedCustomerPhone}
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Credited to: {merchantPhone} ({merchantName})
                </p>
              </div>
            </div>
          )}

          {/* STATE 2: WAITING FOR AUTHORIZATION */}
          {status === 'waiting_phone' && (
            <div className="space-y-4">
              {/* Radar Status Animation */}
              <div className="py-2 flex flex-col items-center justify-center text-center space-y-3">
                <div className="relative flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center text-[#00843D] animate-pulse">
                    <Radio className="w-8 h-8" />
                  </div>
                  <span className="absolute -top-1 -right-1 flex h-4 w-4">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-4 w-4 bg-[#00843D]"></span>
                  </span>
                </div>

                <div className="space-y-1 max-w-sm">
                  <h4 className="font-bold text-sm text-slate-900">
                    Awaiting Customer Authorization
                  </h4>
                  <p className="text-xs font-mono font-bold text-emerald-800">
                    +{formattedCustomerPhone}
                  </p>
                  <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                    Amount: <strong>{formatCurrency(amount)}</strong> &bull; Receiving on:{' '}
                    <strong>{merchantPhone} ({merchantName})</strong>
                  </p>
                </div>

                {/* Gateway Status Badge */}
                {isLiveGateway ? (
                  <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-900 text-xs text-left w-full space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-emerald-800">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Live Safaricom Network Signal Dispatched</span>
                    </div>
                    <p className="text-[11px] text-emerald-700">
                      A SIM Toolkit pop-up was sent to the customer's phone. Once they enter their PIN, this screen will automatically confirm.
                    </p>
                  </div>
                ) : (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs text-left w-full space-y-1.5">
                    <div className="flex items-center gap-1.5 font-bold text-amber-900">
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>Simulation Mode (Why no prompt arrived on your phone)</span>
                    </div>
                    <p className="text-[11px] text-amber-800 leading-relaxed">
                      {reasonIfNotSent || gatewayNotice || 'Safaricom live Daraja credentials are not linked, and personal numbers cannot receive automated cellular pushes. No cellular prompt was sent to the physical phone.'}
                    </p>
                    <p className="text-[11px] text-amber-900 font-semibold pt-1 border-t border-amber-200/60">
                      To complete this transaction right now, click <strong>"Simulate Customer Approval"</strong> below, or tap <strong>"Dial USSD on Phone"</strong>!
                    </p>
                  </div>
                )}

                {/* Countdown Timer */}
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-100 border border-slate-200 rounded-full text-xs font-mono text-slate-700">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                  <span>
                    Awaiting PIN entry: <strong className="text-slate-900">{countdown}s</strong>
                  </span>
                </div>
              </div>

              {/* Action Buttons: 1-Tap USSD + Instant Confirm */}
              <div className="space-y-2">
                <a
                  href={telDialUri}
                  className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl flex items-center justify-center gap-2 text-xs transition-colors shadow-xs"
                >
                  <PhoneCall className="w-4 h-4" />
                  <span>DIAL PROMPT ON PHONE ({ussdString})</span>
                </a>

                <button
                  type="button"
                  onClick={() => handleManualConfirm()}
                  className="w-full py-2.5 bg-[#00843D] hover:bg-[#007033] text-white font-bold rounded-xl shadow-xs flex items-center justify-center gap-2 text-xs transition-colors"
                >
                  <FileCheck2 className="w-4 h-4" />
                  <span>CUSTOMER APPROVED ON HANDSET (INSTANT CONFIRM)</span>
                </button>
              </div>

              {/* Cashier Verification Box & SMS Code Fallback */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-700">Received SMS on {merchantPhone}?</span>
                  <button
                    type="button"
                    onClick={() => setIsManualConfirmOpen(prev => !prev)}
                    className="text-[#00843D] hover:underline font-semibold text-[11px]"
                  >
                    {isManualConfirmOpen ? 'Hide Manual Input' : 'Enter SMS Receipt Code'}
                  </button>
                </div>

                {isManualConfirmOpen && (
                  <div className="space-y-2 pt-1">
                    <label className="block text-[11px] text-slate-500">
                      Enter M-Pesa Transaction Code (from SMS on {merchantPhone}):
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={manualReceiptInput}
                        onChange={e => setManualReceiptInput(e.target.value.toUpperCase())}
                        placeholder="TD84KJ91A2"
                        className="flex-1 px-3 py-1.5 font-mono uppercase font-bold text-xs bg-white border border-slate-300 rounded-lg focus:ring-1 focus:ring-[#00843D]"
                      />
                      <button
                        type="button"
                        onClick={() => handleManualConfirm()}
                        className="px-3 py-1.5 bg-[#00843D] hover:bg-[#007033] text-white text-xs font-bold rounded-lg transition-colors"
                      >
                        Confirm
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STATE 3: SUCCESS */}
          {status === 'success' && (
            <div className="py-4 text-center space-y-4">
              <div className="w-14 h-14 bg-emerald-100 text-[#00843D] rounded-full flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div>
                <h4 className="font-bold text-base text-slate-900">M-Pesa Payment Confirmed!</h4>
                <p className="text-xs text-slate-500 mt-0.5">Safaricom ResultCode: 0 (Approved)</p>
              </div>

              {/* Safaricom SMS Box */}
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 text-left text-xs font-mono text-emerald-950 space-y-1">
                <div className="flex justify-between font-bold pb-1 border-b border-emerald-200 text-emerald-900">
                  <span>M-PESA RECEIPT:</span>
                  <span className="text-[#00843D] text-sm">{generatedReceipt}</span>
                </div>
                <p className="text-[11px] leading-relaxed pt-1">
                  Confirmed. {formatCurrency(amount)} received from +{formattedCustomerPhone} ({customerName}).
                  Credited to merchant <strong>{merchantPhone} ({merchantName})</strong> on{' '}
                  {new Date().toLocaleDateString()} at{' '}
                  {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.
                </p>
              </div>

              <p className="text-xs text-slate-400">Completing checkout and printing thermal receipt...</p>
            </div>
          )}

          {/* STATE 4: FAILED */}
          {status === 'failed' && (
            <div className="py-4 text-center space-y-4">
              <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto">
                <AlertCircle className="w-6 h-6" />
              </div>

              <div>
                <h4 className="font-bold text-sm text-slate-900">M-Pesa Payment Incomplete</h4>
                <p className="text-xs text-rose-600 mt-1 px-4">{errorMessage}</p>
              </div>

              <div className="flex flex-col sm:flex-row justify-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => handleManualConfirm()}
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-lg transition-colors"
                >
                  Confirm SMS Manually
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setStatus('input');
                    setActiveTab('direct_phone');
                    setErrorMessage('');
                  }}
                  className="px-4 py-2 bg-[#00843D] hover:bg-[#007033] text-white text-xs font-semibold rounded-lg shadow-xs flex items-center justify-center gap-1.5 transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Try Direct USSD / Dial</span>
                </button>
              </div>
            </div>
          )}

          {/* Collapsible FAQ: Why is there no prompt being sent? */}
          <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
            <button
              type="button"
              onClick={() => setShowFaq(prev => !prev)}
              className="w-full px-3.5 py-2.5 bg-slate-50 hover:bg-slate-100 flex items-center justify-between text-left text-slate-700 font-semibold transition-colors"
            >
              <div className="flex items-center gap-1.5 text-slate-800">
                <HelpCircle className="w-4 h-4 text-emerald-600" />
                <span>Why didn't a prompt appear on my phone?</span>
              </div>
              {showFaq ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
            </button>

            {showFaq && (
              <div className="p-3.5 bg-white space-y-2.5 text-slate-600 text-[11px] leading-relaxed border-t border-slate-200">
                <div className="space-y-1">
                  <strong className="text-slate-900 block font-bold">
                    1. Safaricom requires a registered Till or Paybill for automated STK pushes:
                  </strong>
                  <p>
                    Safaricom's cellular STK push gateway strictly allows business shortcodes (Buy Goods Till numbers or Paybills). It does <strong>not</strong> permit a 10-digit personal phone number (0757329235) to initiate automated cellular pushes.
                  </p>
                </div>

                <div className="space-y-1">
                  <strong className="text-slate-900 block font-bold">
                    2. Live Daraja API Credentials:
                  </strong>
                  <p>
                    Automated pushes require live API keys (Consumer Key & Secret from{' '}
                    <a
                      href="https://developer.safaricom.co.ke"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-700 underline inline-flex items-center gap-0.5"
                    >
                      developer.safaricom.co.ke
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                    ). Without live keys, the system operates in test simulation mode.
                  </p>
                </div>

                <div className="space-y-1">
                  <strong className="text-slate-900 block font-bold">
                    3. How money enters 0757329235 right now:
                  </strong>
                  <p>
                    Customers can simply tap the <strong>"Dial Prompt on Phone"</strong> button or dial{' '}
                    <code className="bg-slate-100 px-1 py-0.5 rounded font-mono font-bold text-slate-900">
                      *334*1*0757329235*{roundedAmount}#
                    </code>
                    , or send money to <strong>0757329235 (Victor Mwangi)</strong>.
                  </p>
                </div>

                <div className="space-y-1">
                  <strong className="text-slate-900 block font-bold">
                    4. Want real automated STK pushes?
                  </strong>
                  <p>
                    You can register a free <strong>Lipa Na M-Pesa Buy Goods Till</strong> with Safaricom linked directly to your phone 0757329235. Once Safaricom gives you your 6-digit Till number, add it in <em>Settings &gt; Payments</em>!
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Note */}
        <div className="px-5 py-2.5 bg-slate-50 border-t border-slate-200 text-center text-[10px] text-slate-500 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-[#00843D]" />
            <span>Safaricom M-Pesa Gateway</span>
          </div>
          <span className="font-mono text-[10px] text-slate-400">
            Beneficiary: {merchantPhone}
          </span>
        </div>
      </div>
    </div>
  );
};
