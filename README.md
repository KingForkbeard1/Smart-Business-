# Apex ERP & POS Suite — Enterprise & Local Business System

[![React](https://img.shields.io/badge/React-19.0-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.0-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Express](https://img.shields.io/badge/Node_Express-Backend-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![Safaricom Daraja](https://img.shields.io/badge/M--Pesa-STK_Push_Daraja_2.0-00A651?logo=safaricom&logoColor=white)](https://developer.safaricom.co.ke/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

> A modern, lightning-fast Enterprise Resource Planning (ERP) and Point of Sale (POS) suite designed to compete with and outperform traditional legacy ERPs like Odoo. Built from the ground up with deep sapphire enterprise styling, dual operating modes (Local Retail vs. Multi-Branch Enterprise ERP), Safaricom Lipa Na M-Pesa STK Push integration, double-entry General Ledger, 3-Way Match procurement audits, and multi-warehouse logistics.

---

## 📑 Table of Contents

- [Key Highlights & Competitive Advantage](#-key-highlights--competitive-advantage)
- [How to Save & Push this Code to GitHub](#-how-to-save--push-this-code-to-github)
  - [Method 1: Google AI Studio Direct Export (Easiest)](#method-1-google-ai-studio-direct-export-easiest)
  - [Method 2: Git Command Line (Standard)](#method-2-git-command-line-standard)
  - [Method 3: GitHub CLI (Fastest for Devs)](#method-3-github-cli-fastest-for-devs)
- [Local Installation & Development](#-local-installation--development)
- [Environment Variables & Safaricom Daraja Setup](#-environment-variables--safaricom-daraja-setup)
- [System Architecture & Module Breakdown](#-system-architecture--module-breakdown)
- [Repository File Tree](#-repository-file-tree)
- [License](#-license)

---

## 🚀 Key Highlights & Competitive Advantage

### 1. Tailored for Both Local Shops and High-End Enterprises
* **Dual Operating Mode Toggle**: Instantly switch between **Local Store** (frictionless cashier POS, barcode scanning, thermal receipts) and **Enterprise ERP** (multi-branch headquarters, inter-warehouse stock transfers, audit trails).
* **Multi-Branch & Location Scope**: Switch contexts between Flagship Store (Nairobi CBD), Westlands Premium Retail, Central Distribution Hub, and Mombasa Coastal Depot.
* **Multi-Currency System**: Real-time financial views in **KES (Kenyan Shillings)**, **USD**, **EUR**, **GBP**, **UGX**, and **TZS**.

### 2. Safaricom Lipa Na M-Pesa STK Push Gateway
* Native full-stack integration with Safaricom Daraja API 2.0.
* Automatic customer phone formatting (`254XXXXXXXXX`).
* Real-time polling and instant callback listener with auto-generated receipt verification codes.
* One-click manual approval for cashiers to verify SMS notifications on spot.

### 3. Enterprise Accounting & Compliance
* **Double-Entry General Ledger**: Standard Chart of Accounts (Assets 1000s, Liabilities 2000s, Equity 3000s, Revenue 4000s, Cost of Sales 5000s, Expenses 6000s).
* **Automated Financial Statements**: Live Profit & Loss (P&L) and Balance Sheet.
* **KRA Tax VAT Returns**: Automated 16% standard VAT breakdown (Output VAT collected vs. Input VAT claimable).

### 4. Supply Chain & 3-Way Match Audit
* Complete purchasing lifecycle: Request for Quotation (RFQ) ➔ Purchase Order (PO) ➔ Goods Received Note (GRN) ➔ Vendor Invoice.
* Automated 3-Way Matching verifying PO line quantities, GRN warehouse receipts, and supplier billed rates to prevent procurement discrepancies.

### 5. Multi-Warehouse Inventory & Logistics
* Real-time inventory valuations, minimum reorder thresholds, barcode scanning, and multi-location distribution tracking.
* Waybill dispatch generator for inter-facility transfers.

### 6. CRM & Pipeline Forecasting
* Visual Kanban deal pipeline with weighted probability forecasting (`Deal Value × Win Probability`).
* Conversion metrics and lead source attribution.

---

## 📦 How to Save & Push this Code to GitHub

### Method 1: Google AI Studio Direct Export (Easiest)

If you are currently viewing this project in **Google AI Studio**:

1. Look at the top-right toolbar of the AI Studio workspace.
2. Click on the **Export** or **GitHub** button (or the 3-dot overflow menu `...`).
3. Select **"Export to GitHub"** (or **"Download ZIP"**).
4. Connect your GitHub account, specify your new repository name (e.g. `odoo-competitor-erp`), and click **Create & Push**.
5. All code, configuration files, and assets will be committed to your GitHub account automatically!

---

### Method 2: Git Command Line (Standard)

If you have downloaded the code to your computer or have terminal access:

#### Step 1: Open Terminal in the project root folder
```bash
cd odoo-local-business-erp
```

#### Step 2: Initialize Git
```bash
git init
```

#### Step 3: Add all files
```bash
git add .
```

#### Step 4: Make your initial commit
```bash
git commit -m "feat: initial commit - enterprise ERP suite with M-Pesa POS and accounting"
```

#### Step 5: Rename the primary branch to `main`
```bash
git branch -M main
```

#### Step 6: Create a new empty repository on GitHub
1. Go to [https://github.com/new](https://github.com/new).
2. Repository name: `odoo-competitor-erp` (or any name you prefer).
3. Choose **Public** or **Private**.
4. **Do NOT** check "Add a README file", ".gitignore", or "license" (we already have them).
5. Click **Create repository**.

#### Step 7: Link and push to GitHub
Replace `YOUR_USERNAME` and `YOUR_REPO_NAME` with your actual GitHub repository URL:
```bash
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git push -u origin main
```

*Done! Your repository is now fully backed up on GitHub with complete version history.*

---

### Method 3: GitHub CLI (Fastest for Devs)

If you have the [GitHub CLI (`gh`)](https://cli.github.com/) installed:

```bash
# 1. Initialize and add files
git init
git add .
git commit -m "feat: initial commit of enterprise ERP suite"

# 2. Create GitHub repo and push in one command
gh repo create odoo-competitor-erp --public --source=. --remote=origin --push
```

---

## 💻 Local Installation & Development

### Prerequisites
* **Node.js**: version `18.0.0` or higher
* **npm** or **bun** / **yarn**

### Quick Start
```bash
# 1. Clone your GitHub repository
git clone https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
cd YOUR_REPO_NAME

# 2. Install dependencies
npm install

# 3. Create your local environment file
cp .env.example .env

# 4. Start the full-stack development server (Express backend + Vite frontend)
npm run dev
```

Visit `http://localhost:3000` in your web browser.

### Available Scripts

| Command | Description |
| :--- | :--- |
| `npm run dev` | Starts Express backend and mounts Vite with hot module reload on port 3000 |
| `npm run build` | Compiles TypeScript and creates optimized production bundle in `dist/` |
| `npm start` | Runs production server (`node server.ts`) |
| `npm run lint` | Runs TypeScript type checking and validation |

---

## 🔑 Environment Variables & Safaricom Daraja Setup

The system includes a ready `.env.example` file. Copy it to `.env`:

```bash
cp .env.example .env
```

### Configuration Options:
```ini
# Application Port
PORT=3000

# Safaricom Daraja M-Pesa Credentials
MPESA_ENVIRONMENT=sandbox # Set to 'production' for live payments
MPESA_CONSUMER_KEY=your_daraja_consumer_key
MPESA_CONSUMER_SECRET=your_daraja_consumer_secret
MPESA_PASSKEY=bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919
MPESA_SHORTCODE=174379 # Business Shortcode (Lipa Na M-Pesa Online)
MPESA_CALLBACK_URL=https://your-domain.com/api/mpesa/callback

# Gemini AI Features (Optional)
GEMINI_API_KEY=your_gemini_api_key_here
```

> **Note on Testing**: If Daraja API credentials are not provided, the system seamlessly runs in **Smart Simulation Mode**, simulating instant M-Pesa STK prompts, user PIN inputs, transaction confirmations, and valid Safaricom receipt codes!

---

## 🏛 System Architecture & Module Breakdown

| Module | Core Features |
| :--- | :--- |
| **Point of Sale (POS)** | Rapid touchscreen register, numeric keypad, Safaricom M-Pesa STK Push, thermal receipt generator, cash drawers, and opening/closing float sessions. |
| **Inventory & Warehouses** | Multi-warehouse tracking (CBD, Westlands, Industrial Depot, Mombasa), reorder thresholds, barcode scanner lookup, waybills, and stock movement logs. |
| **Sales & Quotations** | Commercial B2B Quotations, automated Pro-Forma Invoices, sales approvals, delivery dispatches, and Net 30 / COD credit terms. |
| **Purchasing & 3-Way Match** | Vendor directory, Purchase Orders (PO), Goods Received Notes (GRN), and 3-Way Audit to detect invoice discrepancies. |
| **Accounting & General Ledger** | Double-entry journal entries, full Chart of Accounts, live Profit & Loss (P&L), Balance Sheet, and KRA 16% VAT automated returns. |
| **CRM & Deals Pipeline** | Interactive Kanban stage pipeline, weighted probability revenue forecasting, contact directory, and conversion analytics. |
| **Employees & Attendance** | Staff directory, daily clock-in/clock-out timestamps, hourly wage tracking, and role-based permissions (Cashier, Manager, Admin). |
| **Settings & Presets** | Domain switches (Electronics, Hardware, Supermarket, Cafe), tax rates, branch configurations, and printer preferences. |

---

## 📁 Repository File Tree

```
├── .env.example              # Sample environment variables for Daraja and Server
├── .gitignore                # Git ignore rules for node_modules, dist, env
├── index.html                # HTML entry point with enterprise styling
├── metadata.json             # AI Studio app metadata
├── package.json              # Project scripts and dependencies
├── server.ts                 # Express full-stack server (M-Pesa API & Vite proxy)
├── tsconfig.json             # TypeScript compiler settings
├── vite.config.ts            # Vite bundler configuration
├── README.md                 # Complete project documentation & guide
└── src/
    ├── App.tsx               # Main application shell & modal host
    ├── main.tsx              # React DOM root entry
    ├── index.css             # Tailwind CSS & enterprise theme definitions
    ├── types/
    │   └── index.ts          # TypeScript interfaces for ERP data models
    ├── context/
    │   └── BusinessContext.tsx # Central state management & business logic
    ├── data/
    │   └── mockData.ts       # Presets for hardware, retail, electronics, cafe
    └── components/
        ├── layout/
        │   ├── Navbar.tsx            # Enterprise navy header & branch switcher
        │   ├── ControlPanel.tsx      # Filter, search & action bar
        │   ├── AppLauncherModal.tsx  # Odoo 9-dots full application grid
        │   └── GitHubExportModal.tsx # Interactive GitHub export & sync modal
        ├── pos/
        │   ├── PosApp.tsx            # POS register with fast checkout
        │   └── ReceiptModal.tsx      # Thermal print receipt with M-Pesa details
        ├── inventory/
        │   └── InventoryApp.tsx      # Stock balances & multi-warehouse transfer
        ├── sales/
        │   └── SalesApp.tsx          # Quotations & Pro-Forma Invoices
        ├── purchases/
        │   └── PurchasesApp.tsx      # Procurement & 3-Way Match audit
        ├── accounting/
        │   └── AccountingApp.tsx     # Double-entry ledger, P&L, Balance Sheet, VAT
        ├── crm/
        │   └── CrmApp.tsx            # Kanban pipeline & weighted forecasting
        ├── employees/
        │   └── EmployeesApp.tsx      # Staff directory & attendance punch clock
        ├── mpesa/
        │   └── MpesaStkModal.tsx     # Live Daraja STK Push prompt & status monitor
        └── settings/
            └── SettingsApp.tsx       # System preferences, tax rates & credentials
```

---

## 📄 License

This project is licensed under the [MIT License](LICENSE) — free for personal and commercial enterprise use.
