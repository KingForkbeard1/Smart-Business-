import React, { useState } from 'react';
import { useBusiness } from '../../context/BusinessContext';
import { Employee } from '../../types';
import { ControlPanel } from '../layout/ControlPanel';
import {
  UserCheck,
  Clock,
  Plus,
  Play,
  Square,
  Mail,
  Phone,
  DollarSign,
  Briefcase,
  X
} from 'lucide-react';

interface EmployeesAppProps {
  activeTab?: string;
}

export const EmployeesApp: React.FC<EmployeesAppProps> = ({ activeTab = 'Staff Directory' }) => {
  const {
    employees,
    attendance,
    clockInOut,
    addEmployee,
    formatCurrency
  } = useBusiness();

  const [searchQuery, setSearchQuery] = useState('');
  const [isNewEmployeeModalOpen, setIsNewEmployeeModalOpen] = useState(false);

  // New staff form
  const [empForm, setEmpForm] = useState({
    name: '',
    role: 'Cashier / Associate',
    department: 'Front Store',
    hourlyRate: 18.50,
    email: '',
    phone: ''
  });

  const handleCreateEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!empForm.name.trim()) return;

    addEmployee({
      name: empForm.name,
      role: empForm.role,
      department: empForm.department,
      hourlyRate: Number(empForm.hourlyRate),
      email: empForm.email,
      phone: empForm.phone
    });

    setIsNewEmployeeModalOpen(false);
    setEmpForm({
      name: '',
      role: 'Cashier / Associate',
      department: 'Front Store',
      hourlyRate: 18.50,
      email: '',
      phone: ''
    });
  };

  const filteredEmployees = employees.filter(e =>
    e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.department.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Attendance Punch Clock Tab
  if (activeTab === 'Attendance Punch Clock') {
    return (
      <div className="flex-1 flex flex-col bg-slate-100 min-h-[calc(100vh-3rem)]">
        <ControlPanel
          breadcrumbs={['Employees', 'Attendance', 'Punch Clock & Time Tracking']}
          totalRecords={attendance.length}
        />

        <div className="p-6 max-w-5xl w-full mx-auto space-y-6">
          {/* Live Punch Clock Terminal */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-xs p-6 space-y-4">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Shift Terminal (Tap to Clock In / Out)</h3>
              <p className="text-xs text-slate-500">Record actual time worked for payroll & store coverage</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {employees.map(emp => (
                <div
                  key={emp.id}
                  className={`p-4 rounded-xl border flex flex-col justify-between transition-all ${
                    emp.isClockedIn
                      ? 'bg-emerald-50/70 border-emerald-300 ring-1 ring-emerald-400'
                      : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-xs text-slate-900">{emp.name}</h4>
                      <p className="text-[11px] text-slate-500">{emp.role}</p>
                    </div>
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        emp.isClockedIn
                          ? 'bg-emerald-200 text-emerald-800'
                          : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {emp.isClockedIn ? 'On Duty' : 'Off Duty'}
                    </span>
                  </div>

                  <div className="pt-3 mt-3 border-t border-slate-200/60 flex items-center justify-between">
                    <span className="text-[11px] font-mono text-slate-500">
                      {emp.isClockedIn ? 'Clocked in today' : 'Shift not started'}
                    </span>

                    <button
                      onClick={() => clockInOut(emp.id)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold shadow-xs transition-colors ${
                        emp.isClockedIn
                          ? 'bg-rose-600 hover:bg-rose-700 text-white'
                          : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      }`}
                    >
                      {emp.isClockedIn ? (
                        <>
                          <Square className="w-3 h-3 fill-current" />
                          <span>Clock Out</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-3 h-3 fill-current" />
                          <span>Clock In</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Attendance Log Table */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
            <div className="px-5 py-3 border-b border-slate-200 flex items-center justify-between">
              <h4 className="font-bold text-xs text-slate-900 uppercase tracking-wider">
                Recent Shift Timesheet Records
              </h4>
              <span className="text-xs font-mono text-slate-500">{attendance.length} logs</span>
            </div>

            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-2.5 px-4">Staff Member</th>
                  <th className="py-2.5 px-4">Date</th>
                  <th className="py-2.5 px-4">Clock In</th>
                  <th className="py-2.5 px-4">Clock Out</th>
                  <th className="py-2.5 px-4 text-right">Hours Logged</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {attendance.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400">
                      No clock-out shifts recorded yet.
                    </td>
                  </tr>
                ) : (
                  attendance.map(rec => (
                    <tr key={rec.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-2.5 px-4 font-semibold text-slate-900">{rec.employeeName}</td>
                      <td className="py-2.5 px-4 text-slate-600 font-mono">{rec.date}</td>
                      <td className="py-2.5 px-4 text-slate-700 font-mono">{rec.clockInTime}</td>
                      <td className="py-2.5 px-4 text-slate-700 font-mono">{rec.clockOutTime || 'Active'}</td>
                      <td className="py-2.5 px-4 text-right font-mono font-bold text-slate-900 tabular-nums">
                        {rec.durationHours ? `${rec.durationHours} hrs` : 'In Progress'}
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

  // DEFAULT TAB: Staff Directory
  return (
    <div className="flex-1 flex flex-col bg-slate-100 min-h-[calc(100vh-3rem)]">
      <ControlPanel
        breadcrumbs={['Employees', 'Staff Directory']}
        primaryActionLabel="New Employee"
        onPrimaryAction={() => setIsNewEmployeeModalOpen(true)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search staff by name or role..."
        totalRecords={filteredEmployees.length}
      />

      <div className="p-6 flex-1 overflow-y-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 max-w-6xl">
          {filteredEmployees.map(emp => (
            <div key={emp.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-white shadow-xs ${emp.avatarBg}`}>
                  {emp.name.charAt(0)}
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900 leading-snug">{emp.name}</h4>
                  <p className="text-xs text-slate-500 font-medium">{emp.role}</p>
                  <span className="text-[10px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded font-mono mt-0.5 inline-block">
                    {emp.department}
                  </span>
                </div>
              </div>

              <div className="space-y-1.5 text-xs text-slate-600 pt-2 border-t border-slate-100">
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span>{emp.email || 'No email registered'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>{emp.phone || 'No phone registered'}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="font-mono text-slate-500">
                  {formatCurrency(emp.hourlyRate)} / hr
                </span>

                <span
                  className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                    emp.isClockedIn ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {emp.isClockedIn ? 'Clocked In' : 'Off Duty'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* New Employee Modal */}
      {isNewEmployeeModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="new-staff-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4"
        >
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full space-y-4 border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 id="new-staff-title" className="font-bold text-slate-900 text-base">Add Staff Member</h3>
              <button onClick={() => setIsNewEmployeeModalOpen(false)} className="text-slate-400 p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateEmployee} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={empForm.name}
                  onChange={e => setEmpForm({ ...empForm, name: e.target.value })}
                  placeholder="e.g. Jordan Reed"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Role / Job Title</label>
                  <input
                    type="text"
                    required
                    value={empForm.role}
                    onChange={e => setEmpForm({ ...empForm, role: e.target.value })}
                    placeholder="Cashier, Barista, etc."
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Department</label>
                  <input
                    type="text"
                    value={empForm.department}
                    onChange={e => setEmpForm({ ...empForm, department: e.target.value })}
                    placeholder="Front Desk, Warehouse"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Hourly Rate ($)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={empForm.hourlyRate}
                    onChange={e => setEmpForm({ ...empForm, hourlyRate: Number(e.target.value) })}
                    className="w-full px-3 py-2 font-mono border border-slate-300 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Phone</label>
                  <input
                    type="text"
                    value={empForm.phone}
                    onChange={e => setEmpForm({ ...empForm, phone: e.target.value })}
                    placeholder="+1 (555) 000-0000"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Work Email</label>
                <input
                  type="email"
                  value={empForm.email}
                  onChange={e => setEmpForm({ ...empForm, email: e.target.value })}
                  placeholder="jordan@business.local"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsNewEmployeeModalOpen(false)}
                  className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold shadow-xs"
                >
                  Save Employee
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
