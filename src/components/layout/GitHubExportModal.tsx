import React, { useState } from 'react';
import { useBusiness } from '../../context/BusinessContext';
import {
  X,
  Copy,
  Check,
  Terminal,
  FolderGit2,
  ExternalLink,
  Code2,
  Download,
  Laptop,
  CheckCircle2,
  Sparkles,
  BookOpen
} from 'lucide-react';

export const GitHubExportModal: React.FC = () => {
  const { isGithubModalOpen, closeGithubModal } = useBusiness();
  const [activeTab, setActiveTab] = useState<'commands' | 'studio' | 'local' | 'files'>('commands');
  const [repoName, setRepoName] = useState('enterprise-business-erp');
  const [githubUsername, setGithubUsername] = useState('mwangivictor30');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);

  if (!isGithubModalOpen) return null;

  const repoUrl = `https://github.com/${githubUsername}/${repoName}.git`;

  const gitSteps = [
    {
      title: '1. Initialize Git in project directory',
      command: 'git init'
    },
    {
      title: '2. Stage all source code files',
      command: 'git add .'
    },
    {
      title: '3. Create your initial commit',
      command: 'git commit -m "feat: complete enterprise ERP suite with M-Pesa POS & accounting"'
    },
    {
      title: '4. Set the default branch name to main',
      command: 'git branch -M main'
    },
    {
      title: '5. Link to your GitHub repository',
      command: `git remote add origin ${repoUrl}`
    },
    {
      title: '6. Push your code to GitHub',
      command: 'git push -u origin main'
    }
  ];

  const allCommandsCombined = `# 1. Initialize local repository
git init

# 2. Stage all source files (node_modules is excluded by .gitignore)
git add .

# 3. Create initial commit
git commit -m "feat: complete enterprise ERP suite with M-Pesa POS & accounting"

# 4. Set branch to main
git branch -M main

# 5. Connect to your GitHub repository
git remote add origin ${repoUrl}

# 6. Push to GitHub
git push -u origin main`;

  const copyToClipboard = (text: string, index?: number) => {
    navigator.clipboard.writeText(text);
    if (index !== undefined) {
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } else {
      setCopiedAll(true);
      setTimeout(() => setCopiedAll(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden text-slate-800"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#0F1E36] text-white px-6 py-4.5 flex items-center justify-between border-b border-blue-900/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-900/40">
              <FolderGit2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white tracking-tight">Save Code to GitHub</h2>
                <span className="text-[11px] font-semibold bg-blue-500/20 text-blue-300 border border-blue-400/30 px-2 py-0.5 rounded-full">
                  Git & Source Code
                </span>
              </div>
              <p className="text-xs text-blue-200/80 mt-0.5">
                Export your entire enterprise codebase and host it securely on your GitHub account
              </p>
            </div>
          </div>
          <button
            onClick={closeGithubModal}
            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-blue-200 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-6 pt-3 border-b border-slate-200 bg-slate-50 text-xs">
          <button
            onClick={() => setActiveTab('commands')}
            className={`pb-2.5 px-3 font-medium flex items-center gap-1.5 border-b-2 transition-colors ${
              activeTab === 'commands'
                ? 'border-blue-600 text-blue-700 font-semibold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Terminal className="w-4 h-4" />
            Git Commands (Terminal)
          </button>
          <button
            onClick={() => setActiveTab('studio')}
            className={`pb-2.5 px-3 font-medium flex items-center gap-1.5 border-b-2 transition-colors ${
              activeTab === 'studio'
                ? 'border-blue-600 text-blue-700 font-semibold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-4 h-4 text-blue-600" />
            AI Studio 1-Click Export
          </button>
          <button
            onClick={() => setActiveTab('local')}
            className={`pb-2.5 px-3 font-medium flex items-center gap-1.5 border-b-2 transition-colors ${
              activeTab === 'local'
                ? 'border-blue-600 text-blue-700 font-semibold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Laptop className="w-4 h-4" />
            Local Machine Setup
          </button>
          <button
            onClick={() => setActiveTab('files')}
            className={`pb-2.5 px-3 font-medium flex items-center gap-1.5 border-b-2 transition-colors ${
              activeTab === 'files'
                ? 'border-blue-600 text-blue-700 font-semibold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Code2 className="w-4 h-4" />
            Project File Manifest
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-sm">
          {/* TAB 1: GIT COMMANDS */}
          {activeTab === 'commands' && (
            <div className="space-y-5">
              {/* GitHub Details Configurator */}
              <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <FolderGit2 className="w-4 h-4 text-blue-700" />
                  <span className="font-semibold text-xs text-blue-950 uppercase tracking-wider">
                    Configure Your GitHub Target
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">GitHub Username / Org</label>
                    <input
                      type="text"
                      value={githubUsername}
                      onChange={e => setGithubUsername(e.target.value)}
                      placeholder="e.g. mwangivictor30"
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-800 font-mono focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">GitHub Repository Name</label>
                    <input
                      type="text"
                      value={repoName}
                      onChange={e => setRepoName(e.target.value)}
                      placeholder="e.g. enterprise-business-erp"
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-800 font-mono focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div className="mt-2.5 text-[11px] text-blue-800 flex items-center gap-1 font-mono">
                  <span>Target Remote:</span>
                  <span className="font-semibold bg-white px-2 py-0.5 rounded border border-blue-200 truncate">
                    {repoUrl}
                  </span>
                </div>
              </div>

              {/* Quick Action: Copy All */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-slate-900 text-sm">Step-by-Step Terminal Instructions</h3>
                  <p className="text-xs text-slate-500">Run these commands inside your project root folder:</p>
                </div>
                <button
                  onClick={() => copyToClipboard(allCommandsCombined)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs shadow-xs transition-colors"
                >
                  {copiedAll ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedAll ? 'Copied All!' : 'Copy All Commands'}</span>
                </button>
              </div>

              {/* Step cards */}
              <div className="space-y-2.5">
                {gitSteps.map((step, idx) => (
                  <div key={idx} className="bg-slate-900 text-slate-100 rounded-xl p-3 border border-slate-800">
                    <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
                      <span className="font-medium text-slate-300">{step.title}</span>
                      <button
                        onClick={() => copyToClipboard(step.command, idx)}
                        className="flex items-center gap-1 text-[11px] text-blue-400 hover:text-blue-300 transition-colors"
                      >
                        {copiedIndex === idx ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedIndex === idx ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                    <code className="text-xs font-mono text-emerald-400 select-all block bg-slate-950/70 px-3 py-2 rounded-lg border border-slate-800">
                      {step.command}
                    </code>
                  </div>
                ))}
              </div>

              {/* Alternative: GitHub CLI */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-semibold text-xs text-slate-800">Option 2: Using GitHub CLI (gh) in 1 Command</span>
                  <button
                    onClick={() => copyToClipboard(`gh repo create ${repoName} --public --source=. --remote=origin --push`)}
                    className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1 font-medium"
                  >
                    <Copy className="w-3 h-3" />
                    Copy gh command
                  </button>
                </div>
                <code className="text-xs font-mono text-slate-800 select-all block bg-white px-3 py-2 rounded-lg border border-slate-200">
                  gh repo create {repoName} --public --source=. --remote=origin --push
                </code>
              </div>
            </div>
          )}

          {/* TAB 2: AI STUDIO DIRECT EXPORT */}
          {activeTab === 'studio' && (
            <div className="space-y-4">
              <div className="bg-linear-to-r from-blue-900 to-indigo-900 text-white rounded-xl p-5 border border-blue-800 shadow-md">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-5 h-5 text-amber-300" />
                  <h3 className="font-bold text-base">Google AI Studio Native GitHub Integration</h3>
                </div>
                <p className="text-xs text-blue-100 leading-relaxed">
                  Google AI Studio features a direct GitHub export function in its top workspace header. You do not need to manually clone or run terminal commands if you use this feature!
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                    1
                  </div>
                  <div>
                    <h4 className="font-semibold text-xs text-slate-900">Locate the AI Studio Top Header</h4>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Look at the top-right corner of the Google AI Studio page (above the web preview).
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                    2
                  </div>
                  <div>
                    <h4 className="font-semibold text-xs text-slate-900">Click &ldquo;Export&rdquo; or the GitHub Icon</h4>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Click the <strong>Export</strong> button (or three-dot menu `...`) and select <strong>&ldquo;Export to GitHub&rdquo;</strong> (or &ldquo;Download ZIP&rdquo;).
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                    3
                  </div>
                  <div>
                    <h4 className="font-semibold text-xs text-slate-900">Authorize & Pick Repository Name</h4>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Authenticate with your GitHub account, choose a repository name (e.g. <code>modern-enterprise-erp</code>), and click <strong>Create &amp; Push</strong>.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                    ✓
                  </div>
                  <div>
                    <h4 className="font-semibold text-xs text-slate-900">All Code &amp; Config Automatically Pushed</h4>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Your GitHub repository will receive the complete React, TypeScript, Express, and Tailwind CSS source code, along with our freshly generated professional <code>README.md</code>.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: LOCAL MACHINE SETUP */}
          {activeTab === 'local' && (
            <div className="space-y-4">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                <h3 className="font-bold text-sm text-slate-900 mb-1">Running the Project on Your Computer</h3>
                <p className="text-xs text-slate-600">
                  Once cloned or downloaded from GitHub, you can run the full-stack system locally:
                </p>
              </div>

              <div className="bg-slate-900 text-slate-100 rounded-xl p-4 font-mono text-xs space-y-3">
                <div>
                  <span className="text-slate-400"># 1. Clone repository from GitHub:</span>
                  <div className="text-emerald-400 mt-1">git clone {repoUrl}</div>
                  <div className="text-emerald-400">cd {repoName}</div>
                </div>

                <div>
                  <span className="text-slate-400"># 2. Install all dependencies:</span>
                  <div className="text-emerald-400 mt-1">npm install</div>
                </div>

                <div>
                  <span className="text-slate-400"># 3. Setup your environment variables:</span>
                  <div className="text-emerald-400 mt-1">cp .env.example .env</div>
                </div>

                <div>
                  <span className="text-slate-400"># 4. Start the Express backend + Vite frontend:</span>
                  <div className="text-emerald-400 mt-1">npm run dev</div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-xs text-blue-900">
                <p className="font-semibold mb-1">M-Pesa Daraja Integration Note:</p>
                <p className="text-blue-800 leading-relaxed">
                  The local environment automatically runs in <strong>Smart Simulation Mode</strong> if you do not have live Daraja credentials configured yet. Cashiers can test STK pushes, manual approvals, and receipt generation with 100% functional realism!
                </p>
              </div>
            </div>
          )}

          {/* TAB 4: PROJECT FILE MANIFEST */}
          {activeTab === 'files' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-slate-900">Included Repository Architecture</h3>
                  <p className="text-xs text-slate-500">Every module included in this project build:</p>
                </div>
                <div className="flex items-center gap-1 text-xs text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                  <span>Production Ready</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="border border-slate-200 rounded-xl p-3.5 bg-slate-50">
                  <div className="font-bold text-slate-900 mb-1 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                    Frontend Modules (Vite + React 19)
                  </div>
                  <ul className="space-y-1 text-slate-600 font-mono text-[11px]">
                    <li>• <code>src/components/pos/</code> — POS &amp; Receipts</li>
                    <li>• <code>src/components/accounting/</code> — Ledger, P&amp;L, VAT</li>
                    <li>• <code>src/components/inventory/</code> — Multi-Warehouse</li>
                    <li>• <code>src/components/sales/</code> — Pro-Forma &amp; Quotes</li>
                    <li>• <code>src/components/purchases/</code> — 3-Way Match Audit</li>
                    <li>• <code>src/components/crm/</code> — Weighted Pipeline</li>
                    <li>• <code>src/components/employees/</code> — Time Attendance</li>
                  </ul>
                </div>

                <div className="border border-slate-200 rounded-xl p-3.5 bg-slate-50">
                  <div className="font-bold text-slate-900 mb-1 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                    Backend &amp; Configurations
                  </div>
                  <ul className="space-y-1 text-slate-600 font-mono text-[11px]">
                    <li>• <code>server.ts</code> — Express backend + Daraja API</li>
                    <li>• <code>README.md</code> — GitHub docs &amp; guide</li>
                    <li>• <code>.env.example</code> — Environment template</li>
                    <li>• <code>.gitignore</code> — Standard exclusions</li>
                    <li>• <code>package.json</code> — Scripts &amp; dependencies</li>
                    <li>• <code>tsconfig.json</code> — Strict TypeScript</li>
                    <li>• <code>vite.config.ts</code> — Vite bundler</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-3.5 border-t border-slate-200 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-slate-500">
            <BookOpen className="w-4 h-4 text-blue-600" />
            <span>A comprehensive <code>README.md</code> has already been placed in the root directory.</span>
          </div>
          <button
            onClick={closeGithubModal}
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-xs transition-colors"
          >
            Done / Close
          </button>
        </div>
      </div>
    </div>
  );
};
