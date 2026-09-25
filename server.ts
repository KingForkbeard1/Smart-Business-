import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

// In-memory store for M-Pesa STK transactions
interface MpesaTx {
  checkoutRequestId: string;
  merchantRequestId: string;
  phoneNumber: string;
  amount: number;
  reference: string;
  receivingPhone?: string;
  ownerName?: string;
  status: 'PENDING' | 'SUCCESS' | 'FAILED';
  resultCode?: number;
  resultDesc?: string;
  receiptNumber?: string;
  createdAt: number;
}

const transactions = new Map<string, MpesaTx>();

// Helper to format phone to 254XXXXXXXXX
function formatMpesaPhone(raw: string): string {
  let cleaned = raw.replace(/\D/g, '');
  if (cleaned.startsWith('0')) {
    cleaned = '254' + cleaned.slice(1);
  } else if (cleaned.startsWith('7') || cleaned.startsWith('1')) {
    cleaned = '254' + cleaned;
  } else if (cleaned.startsWith('+254')) {
    cleaned = cleaned.replace('+', '');
  }
  return cleaned;
}

// Generate YYYYMMDDHHmmss timestamp
function getMpesaTimestamp(): string {
  const now = new Date();
  const year = now.getFullYear().toString();
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const day = now.getDate().toString().padStart(2, '0');
  const hour = now.getHours().toString().padStart(2, '0');
  const minute = now.getMinutes().toString().padStart(2, '0');
  const second = now.getSeconds().toString().padStart(2, '0');
  return `${year}${month}${day}${hour}${minute}${second}`;
}

// Generate realistic Safaricom M-Pesa Receipt Code (e.g. TD92KN48X1)
function generateReceiptCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = 'TD';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// Daraja OAuth token generator
async function getDarajaToken(baseUrl: string, consumerKey: string, consumerSecret: string): Promise<string> {
  const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');
  const res = await fetch(`${baseUrl}/oauth/v1/generate?grant_type=client_credentials`, {
    method: 'GET',
    headers: { Authorization: `Basic ${auth}` }
  });
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Safaricom OAuth authentication failed (${res.status}): ${errorText}`);
  }
  const data: any = await res.json();
  if (!data.access_token) {
    throw new Error('Safaricom did not return an access token');
  }
  return data.access_token;
}

// Safaricom Daraja STK Push Initiation Endpoint
app.post('/api/mpesa/stkpush', async (req, res) => {
  try {
    const {
      phoneNumber,
      amount,
      reference = 'POS-ORDER',
      receivingPhone = '0757329235',
      ownerName = 'Victor Mwangi',
      consumerKey: customKey,
      consumerSecret: customSecret,
      passkey: customPasskey,
      shortcode: customShortcode,
      businessType: customType = 'phone',
      environment: customEnv = 'sandbox'
    } = req.body;

    if (!phoneNumber || !amount) {
      return res.status(400).json({ error: 'Customer phone number and amount are required' });
    }

    const formattedPhone = formatMpesaPhone(phoneNumber);
    if (formattedPhone.length !== 12) {
      return res.status(400).json({ error: 'Invalid Kenyan phone number. Expected format 07XXXXXXXX or 2547XXXXXXXX.' });
    }

    const env = process.env.MPESA_ENVIRONMENT || customEnv || 'sandbox';
    const isSandbox = env === 'sandbox';
    const baseUrl = isSandbox ? 'https://sandbox.safaricom.co.ke' : 'https://api.safaricom.co.ke';

    const consumerKey = process.env.MPESA_CONSUMER_KEY || customKey;
    const consumerSecret = process.env.MPESA_CONSUMER_SECRET || customSecret;
    const businessType = process.env.MPESA_BUSINESS_TYPE || customType || 'phone';
    // Default Safaricom Sandbox Shortcode 174379 or user shortcode/till/phone
    const shortcode = process.env.MPESA_SHORTCODE || customShortcode || (businessType === 'phone' ? '0757329235' : '174379');
    const passkey = process.env.MPESA_PASSKEY || customPasskey || 'bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919';

    const appUrl = process.env.APP_URL || `http://localhost:${PORT}`;
    const callbackUrl = `${appUrl}/api/mpesa/callback`;

    const timestamp = getMpesaTimestamp();
    const password = Buffer.from(`${shortcode}${passkey}${timestamp}`).toString('base64');
    const transactionType = businessType === 'paybill' ? 'CustomerPayBillOnline' : 'CustomerBuyGoodsOnline';

    let darajaSuccess = false;
    let checkoutRequestId = '';
    let merchantRequestId = '';
    let customerMessage = '';
    let liveGatewayError = '';
    let reasonIfNotSent = '';

    // Check if shortcode is a personal phone number instead of a Till/Paybill
    const isPersonalNumberAsShortcode = shortcode.startsWith('0') || shortcode.startsWith('254') || shortcode.length > 7;

    // If consumerKey and consumerSecret are supplied, attempt live call to Safaricom Daraja API
    if (consumerKey && consumerSecret && !consumerKey.includes('DEMO')) {
      if (isPersonalNumberAsShortcode) {
        liveGatewayError = `Safaricom STK Push requires an official M-Pesa Buy Goods Till or Paybill number (5-7 digits). Personal number ${shortcode} cannot receive automated STK network pushes directly via Daraja. Use Direct Send Money or link a Till number.`;
        reasonIfNotSent = liveGatewayError;
      } else {
        try {
          console.log(`[M-Pesa] Requesting OAuth token from ${baseUrl}...`);
          const accessToken = await getDarajaToken(baseUrl, consumerKey, consumerSecret);

          console.log(`[M-Pesa] Dispatching real STK Push to phone +${formattedPhone} (Shortcode: ${shortcode}, Recipient: ${receivingPhone})...`);
          const stkRes = await fetch(`${baseUrl}/mpesa/stkpush/v1/processrequest`, {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${accessToken}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              BusinessShortCode: shortcode,
              Password: password,
              Timestamp: timestamp,
              TransactionType: transactionType,
              Amount: Math.max(1, Math.round(Number(amount))),
              PartyA: formattedPhone,
              PartyB: shortcode,
              PhoneNumber: formattedPhone,
              CallBackURL: callbackUrl,
              AccountReference: reference.replace(/[^a-zA-Z0-9]/g, '').slice(0, 12) || 'STOREPOS',
              TransactionDesc: `Payment to ${ownerName}`
            })
          });

          const stkData: any = await stkRes.json();
          console.log('[M-Pesa] Daraja STK Response:', stkData);

          if (stkRes.ok && stkData.ResponseCode === '0') {
            darajaSuccess = true;
            checkoutRequestId = stkData.CheckoutRequestID;
            merchantRequestId = stkData.MerchantRequestID;
            customerMessage = stkData.CustomerMessage || 'Success. Prompt sent to customer phone.';
          } else {
            liveGatewayError = stkData.errorMessage || stkData.ResponseDescription || 'STK Push rejected by Safaricom Daraja.';
            reasonIfNotSent = `Safaricom Daraja rejected the request: ${liveGatewayError}`;
            console.warn('[M-Pesa] Daraja Gateway returned non-zero code:', liveGatewayError);
          }
        } catch (darajaErr: any) {
          liveGatewayError = darajaErr.message || 'Error communicating with Safaricom Daraja.';
          reasonIfNotSent = `Network error communicating with Safaricom: ${liveGatewayError}`;
          console.error('[M-Pesa] Connection error:', liveGatewayError);
        }
      }
    } else {
      reasonIfNotSent = 'Simulation Mode: No Live Safaricom Daraja API credentials configured. Cellular network prompt was not dispatched. To trigger a real handset prompt, configure a Safaricom Till and Daraja keys in Settings, or use USSD direct dial (*334#).';
    }

    // If credentials were test/demo or live call was not attempted/failed, produce a tracked test checkout request
    if (!darajaSuccess) {
      checkoutRequestId = `ws_CO_${timestamp}_${Math.floor(10000 + Math.random() * 90000)}`;
      merchantRequestId = `MR_${Math.floor(100000 + Math.random() * 900000)}`;
      customerMessage = liveGatewayError
        ? `Safaricom Gateway: ${liveGatewayError}`
        : `Simulation: STK push initiated for phone +${formattedPhone}. Destination: ${receivingPhone} (${ownerName}).`;
    }

    // Store in transaction ledger
    transactions.set(checkoutRequestId, {
      checkoutRequestId,
      merchantRequestId,
      phoneNumber: formattedPhone,
      amount: Number(amount),
      reference,
      receivingPhone,
      ownerName,
      status: 'PENDING',
      createdAt: Date.now()
    });

    return res.json({
      success: true,
      checkoutRequestId,
      merchantRequestId,
      customerMessage,
      phoneNumber: formattedPhone,
      receivingPhone,
      ownerName,
      amount: Number(amount),
      isLiveGateway: darajaSuccess,
      gatewayMode: darajaSuccess ? 'live' : 'simulation',
      gatewayNote: liveGatewayError || (!darajaSuccess ? reasonIfNotSent : undefined),
      reasonIfNotSent: !darajaSuccess ? reasonIfNotSent : undefined
    });
  } catch (error: any) {
    console.error('STK push error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error processing STK push' });
  }
});

// Safaricom Daraja Callback Webhook (Called by Safaricom when customer enters PIN)
app.post('/api/mpesa/callback', (req, res) => {
  try {
    const callbackData = req.body?.Body?.stkCallback;
    if (!callbackData) {
      return res.status(400).json({ error: 'Invalid callback payload' });
    }

    const { CheckoutRequestID, ResultCode, ResultDesc, CallbackMetadata } = callbackData;
    console.log(`M-Pesa Callback for ${CheckoutRequestID}: ResultCode ${ResultCode} - ${ResultDesc}`);

    const tx = transactions.get(CheckoutRequestID);
    if (tx) {
      if (ResultCode === 0) {
        let receiptNumber = generateReceiptCode();
        if (CallbackMetadata?.Item) {
          const receiptItem = CallbackMetadata.Item.find((i: any) => i.Name === 'MpesaReceiptNumber');
          if (receiptItem?.Value) {
            receiptNumber = receiptItem.Value;
          }
        }
        tx.status = 'SUCCESS';
        tx.resultCode = ResultCode;
        tx.resultDesc = ResultDesc;
        tx.receiptNumber = receiptNumber;
      } else {
        tx.status = 'FAILED';
        tx.resultCode = ResultCode;
        tx.resultDesc = ResultDesc;
      }
      transactions.set(CheckoutRequestID, tx);
    }

    return res.json({ ResultCode: 0, ResultDesc: 'Accepted' });
  } catch (err: any) {
    console.error('Error handling M-Pesa callback:', err);
    return res.status(500).json({ error: err.message });
  }
});

// Query Transaction Status Endpoint (Polled by the POS client)
app.get('/api/mpesa/query', async (req, res) => {
  try {
    const checkoutRequestId = req.query.checkoutRequestId as string;
    if (!checkoutRequestId) {
      return res.status(400).json({ error: 'checkoutRequestId is required' });
    }

    const tx = transactions.get(checkoutRequestId);
    if (!tx) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    return res.json({
      checkoutRequestId: tx.checkoutRequestId,
      status: tx.status,
      resultCode: tx.resultCode,
      resultDesc: tx.resultDesc,
      receiptNumber: tx.receiptNumber,
      amount: tx.amount,
      phoneNumber: tx.phoneNumber
    });
  } catch (err: any) {
    console.error('Error querying M-Pesa transaction:', err);
    return res.status(500).json({ error: err.message });
  }
});

// Manual Confirm / Fast Approve Endpoint (Used when customer completes on their phone and cashier verifies SMS)
app.post('/api/mpesa/confirm-manual', (req, res) => {
  try {
    const { checkoutRequestId, receiptNumber: customReceipt } = req.body;
    if (!checkoutRequestId) {
      return res.status(400).json({ error: 'checkoutRequestId is required' });
    }

    const tx = transactions.get(checkoutRequestId);
    const receiptNumber = customReceipt || generateReceiptCode();

    if (tx) {
      tx.status = 'SUCCESS';
      tx.resultCode = 0;
      tx.resultDesc = 'The service request is processed successfully.';
      tx.receiptNumber = receiptNumber;
      transactions.set(checkoutRequestId, tx);
    } else {
      transactions.set(checkoutRequestId, {
        checkoutRequestId,
        merchantRequestId: `MR_${Date.now()}`,
        phoneNumber: '254700000000',
        amount: 0,
        reference: 'MANUAL-CONFIRM',
        status: 'SUCCESS',
        resultCode: 0,
        resultDesc: 'Manually verified by cashier.',
        receiptNumber,
        createdAt: Date.now()
      });
    }

    return res.json({
      success: true,
      status: 'SUCCESS',
      receiptNumber
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Test Daraja Credentials Endpoint
app.post('/api/mpesa/test-connection', async (req, res) => {
  try {
    const { consumerKey, consumerSecret, environment = 'sandbox' } = req.body;
    if (!consumerKey || !consumerSecret) {
      return res.status(400).json({ success: false, error: 'Consumer Key and Consumer Secret are required to test connection.' });
    }
    const isSandbox = environment === 'sandbox';
    const baseUrl = isSandbox ? 'https://sandbox.safaricom.co.ke' : 'https://api.safaricom.co.ke';

    const token = await getDarajaToken(baseUrl, consumerKey, consumerSecret);
    return res.json({
      success: true,
      message: `Connection to Safaricom Daraja (${environment}) established successfully! OAuth access token generated.`,
      environment
    });
  } catch (err: any) {
    return res.status(400).json({
      success: false,
      error: err.message || 'Failed to authenticate with Safaricom Daraja API.'
    });
  }
});

// Launch Server & Vite Middlewares
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: process.env.DISABLE_HMR !== 'true' },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Odoo Local Business ERP Server with M-Pesa running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
