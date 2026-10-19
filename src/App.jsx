import React, { useState, useEffect } from 'react';
import {
  Building,
  Key,
  Users,
  Wrench,
  DollarSign,
  Bell,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Plus,
  Printer,
  Download,
  Search,
  Filter,
  CreditCard,
  FileText,
  Home,
  Check,
  X,
  TrendingUp,
  ShieldCheck,
  PhoneCall,
  Mail,
  ChevronRight,
  Layers,
  Sparkles
} from 'lucide-react';
import {
  initialProperties,
  initialUnits,
  initialRentLedger,
  initialMaintenanceTickets,
  initialNotices
} from './data/estateData';

export default function App() {
  const [roleMode, setRoleMode] = useState('manager'); // 'manager' or 'tenant'
  const [activeTab, setActiveTab] = useState('units'); // 'units', 'ledger', 'tickets', 'notices'
  
  const [units, setUnits] = useState(() => {
    const saved = localStorage.getItem('estateflow_units');
    return saved ? JSON.parse(saved) : initialUnits;
  });

  const [ledger, setLedger] = useState(() => {
    const saved = localStorage.getItem('estateflow_ledger');
    return saved ? JSON.parse(saved) : initialRentLedger;
  });

  const [tickets, setTickets] = useState(() => {
    const saved = localStorage.getItem('estateflow_tickets');
    return saved ? JSON.parse(saved) : initialMaintenanceTickets;
  });

  const [notices, setNotices] = useState(() => {
    const saved = localStorage.getItem('estateflow_notices');
    return saved ? JSON.parse(saved) : initialNotices;
  });

  // Modals & Panels
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [isOnboardTenantOpen, setIsOnboardTenantOpen] = useState(false);
  const [isRecordPaymentOpen, setIsRecordPaymentOpen] = useState(false);
  const [isSubmitTicketOpen, setIsSubmitTicketOpen] = useState(false);
  const [isNewNoticeOpen, setIsNewNoticeOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Forms
  const [paymentForm, setPaymentForm] = useState({
    unitId: 'UNT-402',
    amount: '1250',
    method: 'M-Pesa (REF: QKX9901)',
    period: 'November 2026',
  });

  const [ticketForm, setTicketForm] = useState({
    unitNumber: 'Apartment 4B',
    tenantName: 'Marcus Vance',
    category: 'Plumbing',
    title: '',
    priority: 'Normal',
    description: '',
  });

  const [onboardForm, setOnboardForm] = useState({
    unitId: 'UNT-404',
    name: '',
    phone: '',
    email: '',
    rent: '850',
    deposit: '1700',
    leaseEnd: '2027-10-31',
  });

  const [noticeForm, setNoticeForm] = useState({
    title: '',
    target: 'All Residents',
    body: '',
  });

  useEffect(() => {
    localStorage.setItem('estateflow_units', JSON.stringify(units));
  }, [units]);

  useEffect(() => {
    localStorage.setItem('estateflow_ledger', JSON.stringify(ledger));
  }, [ledger]);

  useEffect(() => {
    localStorage.setItem('estateflow_tickets', JSON.stringify(tickets));
  }, [tickets]);

  useEffect(() => {
    localStorage.setItem('estateflow_notices', JSON.stringify(notices));
  }, [notices]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Calculations
  const totalUnitsCount = units.length;
  const occupiedUnits = units.filter(u => u.status === 'Occupied').length;
  const occupancyPercentage = totalUnitsCount ? Math.round((occupiedUnits / totalUnitsCount) * 100) : 0;
  const totalMonthlyYield = units.reduce((acc, u) => acc + (u.status === 'Occupied' ? u.monthlyRent : 0), 0);
  const totalArrears = units.reduce((acc, u) => acc + (u.tenant?.rentBalance || 0), 0);
  const openTicketsCount = tickets.filter(t => t.status !== 'Resolved').length;

  // Active Tenant Context (for Tenant Portal demo)
  const currentTenantUnit = units.find(u => u.unitNumber === 'Apartment 4B') || units[0];

  // Actions
  const handleRecordPayment = (e) => {
    e.preventDefault();
    const targetUnit = units.find(u => u.id === paymentForm.unitId);
    if (!targetUnit) return;

    const receiptObj = {
      id: `RCPT-${Math.floor(1000 + Math.random() * 9000)}`,
      unitNumber: targetUnit.unitNumber,
      tenantName: targetUnit.tenant?.name || 'Resident',
      amount: Number(paymentForm.amount),
      period: paymentForm.period,
      method: paymentForm.method,
      date: new Date().toISOString().split('T')[0],
      status: 'Cleared',
    };

    setLedger(prev => [receiptObj, ...prev]);

    // Clear balance on target unit
    setUnits(prev =>
      prev.map(u =>
        u.id === targetUnit.id && u.tenant
          ? {
              ...u,
              tenant: {
                ...u.tenant,
                rentBalance: Math.max(0, (u.tenant.rentBalance || 0) - Number(paymentForm.amount)),
                rentStatus: 'Paid',
              },
            }
          : u
      )
    );

    setIsRecordPaymentOpen(false);
    setSelectedReceipt(receiptObj);
    showToast(`Payment of $${paymentForm.amount} cleared for ${targetUnit.unitNumber}!`);
  };

  const handleSubmitTicket = (e) => {
    e.preventDefault();
    if (!ticketForm.title) return;

    const newTicket = {
      id: `TCK-${Math.floor(500 + Math.random() * 500)}`,
      unitNumber: ticketForm.unitNumber,
      tenantName: ticketForm.tenantName,
      category: ticketForm.category,
      title: ticketForm.title,
      priority: ticketForm.priority,
      status: 'In Progress',
      assignedTo: 'Estate Rapid Response Team',
      date: new Date().toISOString().split('T')[0],
      description: ticketForm.description || 'Reported through Tenant Helpdesk',
    };

    setTickets(prev => [newTicket, ...prev]);
    setIsSubmitTicketOpen(false);
    setTicketForm({
      unitNumber: 'Apartment 4B',
      tenantName: 'Marcus Vance',
      category: 'Plumbing',
      title: '',
      priority: 'Normal',
      description: '',
    });
    showToast(`Maintenance Ticket #${newTicket.id} logged. A technician is assigned.`);
  };

  const handleUpdateTicketStatus = (ticketId, newStatus) => {
    setTickets(prev =>
      prev.map(t => (t.id === ticketId ? { ...t, status: newStatus } : t))
    );
    showToast(`Ticket ${ticketId} updated to ${newStatus}`);
  };

  const handleOnboardTenant = (e) => {
    e.preventDefault();
    if (!onboardForm.name || !onboardForm.phone) return;

    setUnits(prev =>
      prev.map(u => {
        if (u.id === onboardForm.unitId) {
          return {
            ...u,
            status: 'Occupied',
            tenant: {
              id: `TNT-${Math.floor(8000 + Math.random() * 1000)}`,
              name: onboardForm.name,
              phone: onboardForm.phone,
              email: onboardForm.email || 'tenant@estate.com',
              leaseStart: new Date().toISOString().split('T')[0],
              leaseEnd: onboardForm.leaseEnd,
              depositPaid: Number(onboardForm.deposit),
              rentBalance: 0,
              rentStatus: 'Paid',
            },
          };
        }
        return u;
      })
    );

    setIsOnboardTenantOpen(false);
    showToast(`Tenant ${onboardForm.name} onboarded to unit.`);
  };

  const handlePublishNotice = (e) => {
    e.preventDefault();
    if (!noticeForm.title || !noticeForm.body) return;

    const newNotice = {
      id: `NOT-${Date.now().toString().slice(-3)}`,
      title: noticeForm.title,
      target: noticeForm.target,
      date: new Date().toISOString().split('T')[0],
      body: noticeForm.body,
    };

    setNotices(prev => [newNotice, ...prev]);
    setIsNewNoticeOpen(false);
    setNoticeForm({ title: '', target: 'All Residents', body: '' });
    showToast(`Notice broadcasted to ${newNotice.target}!`);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-3 bg-amber-400 text-slate-950 font-bold px-4 py-3 rounded-2xl shadow-2xl backdrop-blur-md border border-amber-300 animate-bounce no-print">
          <CheckCircle2 className="w-5 h-5" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Navbar */}
      <nav className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/80 px-6 py-3.5 flex items-center justify-between no-print">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center text-slate-950 shadow-lg shadow-amber-500/25">
            <Building className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-white via-amber-200 to-amber-400 bg-clip-text text-transparent">
                EstateFlow
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded-full bg-amber-500/10">
                Property & Tenant Portal
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Leases • Rent Ledger • Maintenance • Noticeboard</p>
          </div>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center bg-slate-900 border border-slate-800 p-1 rounded-xl">
          <button
            onClick={() => setRoleMode('manager')}
            className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              roleMode === 'manager'
                ? 'bg-amber-400 text-slate-950 font-bold shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Property Manager / Landlord
          </button>
          <button
            onClick={() => setRoleMode('tenant')}
            className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              roleMode === 'tenant'
                ? 'bg-amber-400 text-slate-950 font-bold shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Tenant Resident View
          </button>
        </div>

        {/* Quick Top Actions */}
        <div className="flex items-center gap-2.5">
          {roleMode === 'manager' ? (
            <>
              <button
                onClick={() => setIsRecordPaymentOpen(true)}
                className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-xl bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-600/30"
              >
                <DollarSign className="w-3.5 h-3.5" />
                <span>Receive Rent</span>
              </button>
              <button
                onClick={() => setIsOnboardTenantOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 shadow-lg shadow-amber-500/20 transition-all"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>Onboard Tenant</span>
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsSubmitTicketOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 shadow-lg shadow-amber-500/20 transition-all"
            >
              <Wrench className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Report Repair Issue</span>
            </button>
          )}
        </div>
      </nav>

      {/* ======================= VIEW: PROPERTY MANAGER COMMAND CENTER ======================= */}
      {roleMode === 'manager' ? (
        <main className="flex-1 max-w-7xl mx-auto px-6 py-8 w-full space-y-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Real Estate Asset & Tenancy Overview
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Multi-property occupancy tracking, financial yields, maintenance dispatch, and legal lease compliance.
            </p>
          </div>

          {/* Telemetry Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl">
              <div className="text-xs text-slate-400 uppercase font-medium">Occupancy Rate</div>
              <div className="text-3xl font-extrabold text-white mt-1">{occupancyPercentage}%</div>
              <div className="text-xs text-emerald-400 mt-1">
                {occupiedUnits} of {totalUnitsCount} Units Leased
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl">
              <div className="text-xs text-slate-400 uppercase font-medium">Monthly Gross Yield</div>
              <div className="text-3xl font-extrabold text-emerald-400 mt-1">
                ${totalMonthlyYield.toLocaleString()}
              </div>
              <div className="text-xs text-slate-400 mt-1">Current contracted rentals</div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl">
              <div className="text-xs text-slate-400 uppercase font-medium">Rent In Arrears</div>
              <div className="text-3xl font-extrabold text-rose-400 mt-1">
                ${totalArrears.toLocaleString()}
              </div>
              <div className="text-xs text-rose-400 mt-1">Pending tenant settlements</div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl">
              <div className="text-xs text-slate-400 uppercase font-medium">Open Maintenance</div>
              <div className="text-3xl font-extrabold text-amber-400 mt-1">
                {openTicketsCount} Tickets
              </div>
              <div className="text-xs text-slate-400 mt-1">Active repair contractors</div>
            </div>
          </div>

          {/* Manager Module Tabs */}
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            {[
              { id: 'units', label: 'Units & Leases', count: units.length },
              { id: 'ledger', label: 'Rent Collection Ledger', count: ledger.length },
              { id: 'tickets', label: 'Maintenance Dispatch', count: tickets.length },
              { id: 'notices', label: 'Resident Noticeboard', count: notices.length },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all ${
                  activeTab === tab.id
                    ? 'bg-amber-400 text-slate-950 font-bold shadow-md'
                    : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800'
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>

          {/* TAB 1: UNITS & LEASES */}
          {activeTab === 'units' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {units.map(unit => (
                  <div
                    key={unit.id}
                    className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-slate-700 transition-all shadow-xl flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-bold text-sm text-white">{unit.unitNumber}</span>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                            unit.status === 'Occupied'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          }`}
                        >
                          {unit.status}
                        </span>
                      </div>

                      <p className="text-xs text-slate-400">{unit.estateName}</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">{unit.type}</p>

                      <div className="mt-4 pt-3 border-t border-slate-800 space-y-1.5 text-xs text-slate-400">
                        <div className="flex items-center justify-between">
                          <span>Monthly Rent:</span>
                          <span className="font-mono font-bold text-white">${unit.monthlyRent}</span>
                        </div>
                        {unit.tenant ? (
                          <>
                            <div className="flex items-center justify-between">
                              <span>Tenant:</span>
                              <span className="font-semibold text-slate-200">{unit.tenant.name}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span>Lease Valid:</span>
                              <span className="text-slate-300">{unit.tenant.leaseEnd}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span>Rent Standing:</span>
                              <span
                                className={`font-bold ${
                                  unit.tenant.rentBalance === 0 ? 'text-emerald-400' : 'text-rose-400'
                                }`}
                              >
                                {unit.tenant.rentBalance === 0 ? 'Paid' : `Bal: $${unit.tenant.rentBalance}`}
                              </span>
                            </div>
                          </>
                        ) : (
                          <div className="py-2 text-center text-slate-500 italic text-[11px]">
                            Unit Vacant • Ready for tenant onboarding
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-800">
                      {unit.tenant ? (
                        <button
                          onClick={() => {
                            setPaymentForm({
                              unitId: unit.id,
                              amount: unit.monthlyRent.toString(),
                              method: 'M-Pesa (REF: QKX' + Math.floor(1000 + Math.random() * 9000) + ')',
                              period: 'November 2026',
                            });
                            setIsRecordPaymentOpen(true);
                          }}
                          className="w-full py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-xs font-semibold"
                        >
                          Record Rent Payment
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            setOnboardForm({ ...onboardForm, unitId: unit.id, rent: unit.monthlyRent.toString() });
                            setIsOnboardTenantOpen(true);
                          }}
                          className="w-full py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold"
                        >
                          Assign Tenant
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: RENT LEDGER */}
          {activeTab === 'ledger' && (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-xl">
              <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                <h3 className="font-bold text-sm text-white">Rent Receipts & Collection Records</h3>
                <button
                  onClick={() => setIsRecordPaymentOpen(true)}
                  className="text-xs text-amber-400 hover:text-amber-300 font-bold"
                >
                  + Record Payment
                </button>
              </div>

              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-900 text-slate-400 font-semibold uppercase text-[10px]">
                    <th className="p-4">Receipt Ref</th>
                    <th className="p-4">Unit</th>
                    <th className="p-4">Tenant</th>
                    <th className="p-4">Period</th>
                    <th className="p-4">Method</th>
                    <th className="p-4">Date</th>
                    <th className="p-4">Amount</th>
                    <th className="p-4 text-right">Official Receipt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-300">
                  {ledger.map(rcpt => (
                    <tr key={rcpt.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="p-4 font-mono font-bold text-amber-400">{rcpt.id}</td>
                      <td className="p-4 font-semibold text-white">{rcpt.unitNumber}</td>
                      <td className="p-4 text-slate-300">{rcpt.tenantName}</td>
                      <td className="p-4 text-slate-400">{rcpt.period}</td>
                      <td className="p-4">
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-medium">
                          {rcpt.method}
                        </span>
                      </td>
                      <td className="p-4 text-slate-400">{rcpt.date}</td>
                      <td className="p-4 font-extrabold font-mono text-emerald-400 text-sm">
                        ${rcpt.amount}
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => setSelectedReceipt(rcpt)}
                          className="px-2.5 py-1 rounded-lg bg-amber-400/20 text-amber-300 border border-amber-400/30 hover:bg-amber-400/30 font-semibold text-[11px]"
                        >
                          Print Receipt
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB 3: MAINTENANCE DISPATCH */}
          {activeTab === 'tickets' && (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-xl">
              <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                <h3 className="font-bold text-sm text-white">Maintenance Work Orders & Tickets</h3>
                <span className="text-xs text-slate-400">{tickets.length} Active Tickets</span>
              </div>

              <div className="divide-y divide-slate-800">
                {tickets.map(t => (
                  <div key={t.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-800/30 transition-colors">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2.5">
                        <span className="font-mono font-bold text-amber-400 text-xs">{t.id}</span>
                        <span className="font-bold text-white text-sm">{t.title}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          t.priority === 'Urgent'
                            ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                            : 'bg-slate-800 text-slate-400'
                        }`}>
                          {t.priority}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed">{t.description}</p>
                      <div className="flex items-center gap-4 text-[11px] text-slate-500 pt-1">
                        <span>Unit: <strong className="text-slate-300">{t.unitNumber}</strong></span>
                        <span>Tenant: <strong className="text-slate-300">{t.tenantName}</strong></span>
                        <span>Contractor: <strong className="text-slate-300">{t.assignedTo}</strong></span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <select
                        value={t.status}
                        onChange={e => handleUpdateTicketStatus(t.id, e.target.value)}
                        className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none"
                      >
                        <option value="Open">Open</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Scheduled">Scheduled</option>
                        <option value="Resolved">Resolved</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: NOTICEBOARD */}
          {activeTab === 'notices' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-base text-white">Estate Announcements & Resident Circulars</h3>
                <button
                  onClick={() => setIsNewNoticeOpen(true)}
                  className="px-4 py-2 rounded-xl bg-amber-400 text-slate-950 font-bold text-xs"
                >
                  + Post New Notice
                </button>
              </div>

              <div className="space-y-3">
                {notices.map(n => (
                  <div key={n.id} className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-sm text-white">{n.title}</h4>
                      <span className="text-[11px] text-slate-500">{n.date}</span>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      {n.target}
                    </span>
                    <p className="text-xs text-slate-300 leading-relaxed pt-1">{n.body}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      ) : (
        /* ======================= VIEW: TENANT RESIDENT PORTAL ======================= */
        <main className="flex-1 max-w-5xl mx-auto px-6 py-8 w-full space-y-8">
          {/* Tenant Lease Summary Card */}
          <div className="p-8 rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950/30 to-slate-900 border border-slate-800 relative overflow-hidden shadow-2xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2">
                <span className="px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-400 text-xs font-semibold">
                  Official Tenant Resident Account
                </span>
                <h1 className="text-3xl font-extrabold text-white">
                  Welcome Home, {currentTenantUnit.tenant?.name || 'Resident'}
                </h1>
                <p className="text-xs text-slate-400">
                  {currentTenantUnit.estateName} • {currentTenantUnit.unitNumber} ({currentTenantUnit.type})
                </p>
                <div className="pt-2 text-xs text-slate-300 space-y-1">
                  <div>Lease Active Until: <strong>{currentTenantUnit.tenant?.leaseEnd}</strong></div>
                  <div>Security Deposit Held: <strong>${currentTenantUnit.tenant?.depositPaid}</strong></div>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-slate-950/80 border border-slate-800 text-center space-y-3">
                <span className="text-xs text-slate-400 uppercase font-medium">Current Month Rent</span>
                <div className="text-3xl font-extrabold font-mono text-white">
                  ${currentTenantUnit.monthlyRent}
                </div>
                <div className="text-xs text-emerald-400 font-semibold">
                  Status: {currentTenantUnit.tenant?.rentStatus || 'Paid'}
                </div>
                <button
                  onClick={() => {
                    setPaymentForm({
                      unitId: currentTenantUnit.id,
                      amount: currentTenantUnit.monthlyRent.toString(),
                      method: 'M-Pesa Mobile Checkout',
                      period: 'Current Month',
                    });
                    setIsRecordPaymentOpen(true);
                  }}
                  className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20"
                >
                  Pay Rent via M-Pesa / Card
                </button>
              </div>
            </div>
          </div>

          {/* Quick Tenant Actions Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div
              onClick={() => setIsSubmitTicketOpen(true)}
              className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-amber-400/50 cursor-pointer transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-4">
                <div className="p-3.5 rounded-2xl bg-amber-400/10 text-amber-400 border border-amber-400/20">
                  <Wrench className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-white group-hover:text-amber-300 transition-colors">
                    Report Maintenance Issue
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">Plumbing, electrical, locks, air conditioning</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-500 group-hover:translate-x-1 transition-transform" />
            </div>

            <div
              onClick={() => {
                const myRcpt = ledger.find(l => l.unitNumber === currentTenantUnit.unitNumber) || ledger[0];
                setSelectedReceipt(myRcpt);
              }}
              className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-amber-400/50 cursor-pointer transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-4">
                <div className="p-3.5 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  <ReceiptIcon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-white group-hover:text-indigo-300 transition-colors">
                    View & Print Rent Receipt
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">Download official proof of payment</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-500 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Tenant Notices View */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-4">
            <h3 className="font-bold text-sm text-white">Estate Noticeboard</h3>
            <div className="space-y-3">
              {notices.map(n => (
                <div key={n.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-xs text-white">{n.title}</h4>
                    <span className="text-[10px] text-slate-500">{n.date}</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">{n.body}</p>
                </div>
              ))}
            </div>
          </div>
        </main>
      )}

      {/* ======================= MODAL: OFFICIAL RENT RECEIPT (PRINTABLE) ======================= */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl relative text-slate-200">
            <button
              onClick={() => setSelectedReceipt(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white no-print"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Receipt Letterhead */}
            <div className="text-center pb-4 border-b border-slate-800 space-y-1">
              <div className="w-10 h-10 rounded-2xl bg-amber-400/20 text-amber-400 flex items-center justify-center mx-auto mb-2">
                <Building className="w-6 h-6 stroke-[2.5]" />
              </div>
              <h2 className="text-xl font-extrabold text-white">ESTATEFLOW PROPERTIES</h2>
              <p className="text-[11px] text-slate-400">Official Rent Collection & Tenancy Receipt</p>
              <div className="font-mono text-xs font-bold text-amber-400 mt-1">{selectedReceipt.id}</div>
            </div>

            {/* Receipt Details */}
            <div className="py-4 space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Unit / Residence:</span>
                <span className="font-bold text-white">{selectedReceipt.unitNumber}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Tenant Name:</span>
                <span className="font-semibold text-slate-200">{selectedReceipt.tenantName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Rental Period:</span>
                <span className="text-slate-300">{selectedReceipt.period}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Payment Channel:</span>
                <span className="text-slate-300">{selectedReceipt.method}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Transaction Date:</span>
                <span className="text-slate-300">{selectedReceipt.date}</span>
              </div>
              <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-base">
                <span className="font-bold text-white">Amount Cleared:</span>
                <span className="font-mono font-extrabold text-emerald-400">${selectedReceipt.amount}</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[10px] text-slate-400 text-center">
              Verified by Property Management • Authorized Digital Seal
            </div>

            {/* Action Buttons */}
            <div className="pt-4 flex items-center justify-end gap-3 no-print">
              <button
                onClick={() => setSelectedReceipt(null)}
                className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white"
              >
                Close
              </button>
              <button
                onClick={() => window.print()}
                className="px-5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold flex items-center gap-2 shadow-lg shadow-amber-400/20"
              >
                <Printer className="w-4 h-4" />
                <span>Print Official Receipt</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================= MODAL: RECORD RENT ======================= */}
      {isRecordPaymentOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setIsRecordPaymentOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="p-3 rounded-2xl bg-emerald-500/20 text-emerald-400">
                <DollarSign className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Record Rent Remittance</h3>
                <p className="text-xs text-slate-400">Generate receipt and update lease arrears</p>
              </div>
            </div>

            <form onSubmit={handleRecordPayment} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Target Unit</label>
                <select
                  value={paymentForm.unitId}
                  onChange={e => setPaymentForm({ ...paymentForm, unitId: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200"
                >
                  {units
                    .filter(u => u.status === 'Occupied')
                    .map(u => (
                      <option key={u.id} value={u.id}>
                        {u.unitNumber} - {u.tenant?.name} (${u.monthlyRent}/mo)
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Amount ($)</label>
                <input
                  type="number"
                  value={paymentForm.amount}
                  onChange={e => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Rental Period</label>
                <input
                  type="text"
                  value={paymentForm.period}
                  onChange={e => setPaymentForm({ ...paymentForm, period: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Payment Method / Channel</label>
                <input
                  type="text"
                  value={paymentForm.method}
                  onChange={e => setPaymentForm({ ...paymentForm, method: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsRecordPaymentOpen(false)}
                  className="px-4 py-2 text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
                >
                  Confirm & Generate Receipt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================= MODAL: SUBMIT TICKET ======================= */}
      {isSubmitTicketOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setIsSubmitTicketOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="p-3 rounded-2xl bg-amber-400/20 text-amber-400">
                <Wrench className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Log Maintenance Request</h3>
                <p className="text-xs text-slate-400">Direct dispatch to estate technicians</p>
              </div>
            </div>

            <form onSubmit={handleSubmitTicket} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Issue Category</label>
                  <select
                    value={ticketForm.category}
                    onChange={e => setTicketForm({ ...ticketForm, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200"
                  >
                    <option value="Plumbing">Plumbing</option>
                    <option value="Electrical">Electrical</option>
                    <option value="Carpentry">Carpentry</option>
                    <option value="HVAC">Air Conditioning / HVAC</option>
                    <option value="Security">Locks & Security</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Urgency</label>
                  <select
                    value={ticketForm.priority}
                    onChange={e => setTicketForm({ ...ticketForm, priority: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200"
                  >
                    <option value="Normal">Normal</option>
                    <option value="Urgent">Urgent (Within 24h)</option>
                    <option value="Emergency">Emergency (Immediate)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Short Headline</label>
                <input
                  type="text"
                  placeholder="e.g. Master bedroom shower leaking"
                  value={ticketForm.title}
                  onChange={e => setTicketForm({ ...ticketForm, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Detailed Description</label>
                <textarea
                  rows={3}
                  placeholder="Describe when the issue began and any access instructions for the technician..."
                  value={ticketForm.description}
                  onChange={e => setTicketForm({ ...ticketForm, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsSubmitTicketOpen(false)}
                  className="px-4 py-2 text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold"
                >
                  Submit Maintenance Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================= MODAL: ONBOARD TENANT ======================= */}
      {isOnboardTenantOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setIsOnboardTenantOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="p-3 rounded-2xl bg-amber-400/20 text-amber-400">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Execute Lease & Onboard Tenant</h3>
                <p className="text-xs text-slate-400">Assign resident to property unit</p>
              </div>
            </div>

            <form onSubmit={handleOnboardTenant} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Select Unit</label>
                <select
                  value={onboardForm.unitId}
                  onChange={e => setOnboardForm({ ...onboardForm, unitId: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200"
                >
                  {units
                    .filter(u => u.status === 'Vacant')
                    .map(u => (
                      <option key={u.id} value={u.id}>
                        {u.unitNumber} - {u.type} (${u.monthlyRent}/mo)
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Tenant Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Dennis K. Munene"
                  value={onboardForm.name}
                  onChange={e => setOnboardForm({ ...onboardForm, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Tenant Phone</label>
                  <input
                    type="tel"
                    placeholder="+254 712 345 678"
                    value={onboardForm.phone}
                    onChange={e => setOnboardForm({ ...onboardForm, phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Security Deposit ($)</label>
                  <input
                    type="number"
                    value={onboardForm.deposit}
                    onChange={e => setOnboardForm({ ...onboardForm, deposit: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200"
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsOnboardTenantOpen(false)}
                  className="px-4 py-2 text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold"
                >
                  Finalize Lease Agreement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================= MODAL: NEW NOTICE ======================= */}
      {isNewNoticeOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setIsNewNoticeOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="p-3 rounded-2xl bg-amber-400/20 text-amber-400">
                <Bell className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Broadcast Community Notice</h3>
                <p className="text-xs text-slate-400">Publish update to tenant portals</p>
              </div>
            </div>

            <form onSubmit={handlePublishNotice} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Target Audience</label>
                <select
                  value={noticeForm.target}
                  onChange={e => setNoticeForm({ ...noticeForm, target: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200"
                >
                  <option value="All Residents">All Residents</option>
                  <option value="Crown Heights Enclave">Crown Heights Residents</option>
                  <option value="Serene Palms Townhomes">Serene Palms Residents</option>
                  <option value="Horizon Loft Suites">Horizon Loft Tenants</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Title</label>
                <input
                  type="text"
                  placeholder="e.g. Scheduled Generator Testing"
                  value={noticeForm.title}
                  onChange={e => setNoticeForm({ ...noticeForm, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Notice Body</label>
                <textarea
                  rows={3}
                  value={noticeForm.body}
                  onChange={e => setNoticeForm({ ...noticeForm, body: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200"
                  required
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsNewNoticeOpen(false)}
                  className="px-4 py-2 text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold"
                >
                  Broadcast Notice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function ReceiptIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z" />
      <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8" />
      <path d="M12 17.5v-11" />
    </svg>
  );
}
