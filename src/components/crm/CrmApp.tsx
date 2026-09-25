import React, { useState, useMemo } from 'react';
import { useBusiness } from '../../context/BusinessContext';
import { CRMLead, LeadStage } from '../../types';
import { ControlPanel } from '../layout/ControlPanel';
import {
  Users,
  Target,
  DollarSign,
  TrendingUp,
  Plus,
  Mail,
  Phone,
  Building,
  ChevronRight,
  ChevronLeft,
  X,
  PieChart,
  BarChart3,
  Calendar,
  CheckCircle2
} from 'lucide-react';

interface CrmAppProps {
  activeTab?: string;
}

export const CrmApp: React.FC<CrmAppProps> = ({ activeTab = 'Sales Pipeline' }) => {
  const {
    leads,
    customers,
    createLead,
    updateLeadStage,
    addCustomer,
    formatCurrency,
    settings,
    currentBranch
  } = useBusiness();

  const [searchQuery, setSearchQuery] = useState('');
  const [isNewLeadModalOpen, setIsNewLeadModalOpen] = useState(false);
  const [isNewCustomerModalOpen, setIsNewCustomerModalOpen] = useState(false);

  // New Lead Form State
  const [leadForm, setLeadForm] = useState({
    title: '',
    contactName: '',
    email: '',
    phone: '',
    expectedRevenue: 10000,
    probability: 50,
    stage: 'new' as LeadStage,
    priority: 'medium' as 'low' | 'medium' | 'high',
    notes: ''
  });

  // New Customer Form State
  const [customerForm, setCustomerForm] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    street: '',
    city: 'Nairobi'
  });

  // Filtered Leads
  const filteredLeads = useMemo(() => {
    return leads.filter(l =>
      l.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.contactName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.email.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [leads, searchQuery]);

  // Kanban Stage Columns
  const stages: { id: LeadStage; title: string; color: string }[] = [
    { id: 'new', title: 'New Opportunity', color: 'border-blue-400' },
    { id: 'qualified', title: 'Qualified Lead', color: 'border-sky-500' },
    { id: 'proposition', title: 'Proposition / Quote', color: 'border-indigo-600' },
    { id: 'won', title: 'Won & Closed', color: 'border-emerald-600' }
  ];

  const handleAdvanceStage = (leadId: string, currentStage: LeadStage, direction: 'next' | 'prev') => {
    const stageIds: LeadStage[] = ['new', 'qualified', 'proposition', 'won'];
    const idx = stageIds.indexOf(currentStage);
    if (idx === -1) return;

    const nextIdx = direction === 'next' ? idx + 1 : idx - 1;
    if (nextIdx >= 0 && nextIdx < stageIds.length) {
      updateLeadStage(leadId, stageIds[nextIdx]);
    }
  };

  const handleCreateLead = (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadForm.title.trim()) return;

    createLead({
      title: leadForm.title,
      contactName: leadForm.contactName || 'Corporate Prospect',
      email: leadForm.email,
      phone: leadForm.phone,
      expectedRevenue: Number(leadForm.expectedRevenue),
      probability: Number(leadForm.probability),
      stage: leadForm.stage,
      priority: leadForm.priority,
      notes: leadForm.notes,
      createdDate: new Date().toISOString().slice(0, 10)
    });

    setIsNewLeadModalOpen(false);
    setLeadForm({
      title: '',
      contactName: '',
      email: '',
      phone: '',
      expectedRevenue: 10000,
      probability: 50,
      stage: 'new',
      priority: 'medium',
      notes: ''
    });
  };

  const handleCreateCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerForm.name.trim()) return;

    addCustomer({
      name: customerForm.name,
      company: customerForm.company,
      email: customerForm.email,
      phone: customerForm.phone,
      street: customerForm.street || 'Industrial Area',
      city: customerForm.city || 'Nairobi'
    });

    setIsNewCustomerModalOpen(false);
    setCustomerForm({
      name: '',
      company: '',
      email: '',
      phone: '',
      street: '',
      city: 'Nairobi'
    });
  };

  // 1. DEAL ANALYTICS TAB
  if (activeTab === 'Deal Analytics') {
    const totalPipeline = leads.reduce((s, l) => s + l.expectedRevenue, 0);
    const weightedPipeline = leads.reduce((s, l) => s + (l.expectedRevenue * (l.probability / 100)), 0);
    const wonLeads = leads.filter(l => l.stage === 'won');
    const wonTotal = wonLeads.reduce((s, l) => s + l.expectedRevenue, 0);

    return (
      <div className="flex-1 flex flex-col bg-slate-100 min-h-[calc(100vh-3rem)]">
        <ControlPanel breadcrumbs={['CRM', 'Enterprise Analytics', 'Pipeline Forecast']} />

        <div className="p-4 sm:p-6 max-w-5xl w-full mx-auto space-y-6 flex-1 overflow-y-auto">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500 font-medium">Unweighted Pipeline Total</span>
              <p className="text-2xl font-bold font-mono text-blue-700 tabular-nums mt-1">
                {formatCurrency(totalPipeline)}
              </p>
              <p className="text-[11px] text-slate-400 mt-1">{leads.length} active opportunities</p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500 font-medium">Weighted Expected Revenue</span>
              <p className="text-2xl font-bold font-mono text-emerald-700 tabular-nums mt-1">
                {formatCurrency(weightedPipeline)}
              </p>
              <p className="text-[11px] text-emerald-600 font-semibold mt-1">Probability-adjusted cash forecast</p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500 font-medium">Deals Won & Closed</span>
              <p className="text-2xl font-bold font-mono text-blue-900 tabular-nums mt-1">
                {formatCurrency(wonTotal)}
              </p>
              <p className="text-[11px] text-slate-400 mt-1">{wonLeads.length} deals closed this cycle</p>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
            <h3 className="font-bold text-sm text-slate-900">Stage Conversion Breakdown</h3>
            <div className="space-y-3">
              {stages.map(st => {
                const stageLeads = leads.filter(l => l.stage === st.id);
                const stageSum = stageLeads.reduce((s, l) => s + l.expectedRevenue, 0);
                const pct = totalPipeline > 0 ? (stageSum / totalPipeline) * 100 : 0;

                return (
                  <div key={st.id} className="space-y-1 text-xs">
                    <div className="flex justify-between items-center font-medium">
                      <span className="text-slate-700">{st.title} ({stageLeads.length} deals)</span>
                      <span className="font-mono font-bold text-slate-900">{formatCurrency(stageSum)} ({pct.toFixed(0)}%)</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-600 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 2. CUSTOMERS DIRECTORY TAB
  if (activeTab === 'Customers Directory' || activeTab === 'Customers') {
    return (
      <div className="flex-1 flex flex-col bg-slate-100 min-h-[calc(100vh-3rem)]">
        <ControlPanel
          breadcrumbs={['CRM', 'Accounts & Customers Directory']}
          primaryActionLabel="New Customer"
          onPrimaryAction={() => setIsNewCustomerModalOpen(true)}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          searchPlaceholder="Search customer, business name, or email..."
          totalRecords={customers.length}
        />

        <div className="p-4 sm:p-6 max-w-6xl w-full mx-auto space-y-4 flex-1 overflow-y-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {customers.map(c => (
              <div key={c.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3 hover:border-blue-300 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm">
                    {c.name.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-bold text-sm text-slate-900 leading-snug truncate">{c.name}</h4>
                    {c.company && <p className="text-xs text-slate-500 truncate">{c.company}</p>}
                  </div>
                </div>

                <div className="space-y-1 text-xs text-slate-600 pt-2 border-t border-slate-100">
                  <p className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span>{c.email || 'No email registered'}</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{c.phone || 'No phone registered'}</span>
                  </p>
                </div>

                <div className="flex justify-between items-center pt-2 border-t border-slate-100 font-mono text-xs">
                  <span className="text-slate-500">{c.ordersCount} lifetime orders</span>
                  <span className="font-bold text-slate-900 tabular-nums">{formatCurrency(c.totalSpent)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* New Customer Modal */}
        {isNewCustomerModalOpen && (
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="new-cust-modal-title"
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4"
          >
            <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full space-y-4 border border-slate-200 animate-in fade-in zoom-in-95 duration-100">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 id="new-cust-modal-title" className="font-bold text-slate-900 text-base">Add New Account</h3>
                <button
                  onClick={() => setIsNewCustomerModalOpen(false)}
                  className="text-slate-400 hover:text-slate-700"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreateCustomer} className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Contact Name *</label>
                  <input
                    type="text"
                    required
                    value={customerForm.name}
                    onChange={e => setCustomerForm({ ...customerForm, name: e.target.value })}
                    placeholder="e.g. John Kamau"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Company / Organization</label>
                  <input
                    type="text"
                    value={customerForm.company}
                    onChange={e => setCustomerForm({ ...customerForm, company: e.target.value })}
                    placeholder="e.g. Safari Enterprises Ltd"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Email</label>
                    <input
                      type="email"
                      value={customerForm.email}
                      onChange={e => setCustomerForm({ ...customerForm, email: e.target.value })}
                      placeholder="john@safari.co.ke"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Phone Number</label>
                    <input
                      type="text"
                      value={customerForm.phone}
                      onChange={e => setCustomerForm({ ...customerForm, phone: e.target.value })}
                      placeholder="+254 712 345 678"
                      className="w-full px-3 py-2 font-mono border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsNewCustomerModalOpen(false)}
                    className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold shadow-xs"
                  >
                    Save Customer
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  // DEFAULT TAB: Sales Pipeline Kanban
  return (
    <div className="flex-1 flex flex-col bg-slate-100 min-h-[calc(100vh-3rem)]">
      <ControlPanel
        breadcrumbs={['CRM', 'Sales Opportunities Pipeline']}
        primaryActionLabel="New Opportunity"
        onPrimaryAction={() => setIsNewLeadModalOpen(true)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search deal title or contact..."
        totalRecords={filteredLeads.length}
      />

      {/* Kanban Board Canvas */}
      <div className="p-4 sm:p-6 flex-1 overflow-x-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 min-w-[900px] h-full items-start">
          {stages.map(stage => {
            const stageLeads = filteredLeads.filter(l => l.stage === stage.id);
            const stageRevenue = stageLeads.reduce((sum, l) => sum + l.expectedRevenue, 0);

            return (
              <div
                key={stage.id}
                className={`bg-slate-200/70 rounded-xl p-3 flex flex-col gap-3 border-t-4 ${stage.color} shadow-2xs`}
              >
                {/* Column Header */}
                <div className="flex items-center justify-between px-1">
                  <div>
                    <h3 className="font-bold text-xs text-slate-900 uppercase tracking-wider">
                      {stage.title}
                    </h3>
                    <span className="text-[11px] font-mono text-slate-600 font-semibold tabular-nums">
                      {formatCurrency(stageRevenue)}
                    </span>
                  </div>
                  <span className="text-xs font-mono font-bold text-slate-600 bg-white px-2 py-0.5 rounded-full border border-slate-300">
                    {stageLeads.length}
                  </span>
                </div>

                {/* Cards List in Stage */}
                <div className="space-y-2.5 overflow-y-auto max-h-[calc(100vh-14rem)] pr-0.5">
                  {stageLeads.length === 0 ? (
                    <div className="p-4 text-center text-slate-400 text-xs italic bg-white/60 rounded-lg border border-dashed border-slate-300">
                      No opportunities in this stage
                    </div>
                  ) : (
                    stageLeads.map(lead => (
                      <div
                        key={lead.id}
                        className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs hover:border-blue-400 hover:shadow-md transition-all space-y-2"
                      >
                        <div className="flex items-start justify-between gap-1">
                          <h4 className="font-bold text-xs text-slate-900 leading-snug line-clamp-2">
                            {lead.title}
                          </h4>
                          <span
                            className={`text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded shrink-0 ${
                              lead.priority === 'high'
                                ? 'bg-rose-100 text-rose-700'
                                : lead.priority === 'medium'
                                ? 'bg-amber-100 text-amber-700'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {lead.priority}
                          </span>
                        </div>

                        <div className="space-y-1 text-[11px] text-slate-500">
                          <p className="font-medium text-slate-800">{lead.contactName}</p>
                          {lead.phone && <p>{lead.phone}</p>}
                        </div>

                        {lead.notes && (
                          <p className="text-[10px] text-slate-400 line-clamp-2 italic bg-slate-50 p-1.5 rounded">
                            "{lead.notes}"
                          </p>
                        )}

                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                          <span className="font-mono font-bold text-xs text-blue-700 tabular-nums">
                            {formatCurrency(lead.expectedRevenue)}
                          </span>

                          {/* Stage advance / rewind arrows */}
                          <div className="flex items-center gap-1">
                            {stage.id !== 'new' && (
                              <button
                                onClick={() => handleAdvanceStage(lead.id, lead.stage, 'prev')}
                                className="p-1 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded transition-colors"
                                title="Move Previous Stage"
                              >
                                <ChevronLeft className="w-3.5 h-3.5" />
                              </button>
                            )}
                            {stage.id !== 'won' && (
                              <button
                                onClick={() => handleAdvanceStage(lead.id, lead.stage, 'next')}
                                className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                title="Advance Stage"
                              >
                                <ChevronRight className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* New Lead Modal */}
      {isNewLeadModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="new-opp-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 overflow-y-auto"
        >
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full space-y-4 border border-slate-200 animate-in fade-in zoom-in-95 duration-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 id="new-opp-modal-title" className="font-bold text-slate-900 text-base">New Sales Deal Opportunity</h3>
              <button
                onClick={() => setIsNewLeadModalOpen(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateLead} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Opportunity Title *</label>
                <input
                  type="text"
                  required
                  value={leadForm.title}
                  onChange={e => setLeadForm({ ...leadForm, title: e.target.value })}
                  placeholder="e.g. Annual Office Supply Contract 2026"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Expected Revenue ({settings.currencySymbol})</label>
                  <input
                    type="number"
                    step="500"
                    min="0"
                    value={leadForm.expectedRevenue}
                    onChange={e => setLeadForm({ ...leadForm, expectedRevenue: Number(e.target.value) })}
                    className="w-full px-3 py-2 font-mono border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Priority</label>
                  <select
                    value={leadForm.priority}
                    onChange={e => setLeadForm({ ...leadForm, priority: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  >
                    <option value="low">Low Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="high">High Priority</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Contact Person Name</label>
                <input
                  type="text"
                  value={leadForm.contactName}
                  onChange={e => setLeadForm({ ...leadForm, contactName: e.target.value })}
                  placeholder="e.g. Grace Wanjiku"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Phone</label>
                  <input
                    type="text"
                    value={leadForm.phone}
                    onChange={e => setLeadForm({ ...leadForm, phone: e.target.value })}
                    placeholder="+254 7..."
                    className="w-full px-3 py-2 font-mono border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={leadForm.email}
                    onChange={e => setLeadForm({ ...leadForm, email: e.target.value })}
                    placeholder="client@domain.co.ke"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Notes / Scope</label>
                <textarea
                  rows={2}
                  value={leadForm.notes}
                  onChange={e => setLeadForm({ ...leadForm, notes: e.target.value })}
                  placeholder="Key customer requirements..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsNewLeadModalOpen(false)}
                  className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold shadow-xs"
                >
                  Create Opportunity
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
