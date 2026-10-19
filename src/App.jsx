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
  History,
  Receipt,
  UserCheck
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
    method: 'Bank ACH Direct',
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

  // Global ESC key listener to close modals
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setSelectedReceipt(null);
        setIsOnboardTenantOpen(false);
        setIsRecordPaymentOpen(false);
        setIsSubmitTicketOpen(false);
        setIsNewNoticeOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

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
  const totalUnits = units.length;
  const occupiedUnits = units.filter(u => u.status === 'Occupied').length;
  const occupancyRate = totalUnits > 0 ? ((occupiedUnits / totalUnits) * 100).toFixed(1) : '0.0';
  const totalMonthlyRoll = units.reduce((acc, u) => acc + (u.status === 'Occupied' ? Number(u.monthlyRent) : 0), 0);
  const totalArrears = units.reduce((acc, u) => acc + (u.tenant ? Number(u.tenant.rentBalance || 0) : 0), 0);

  // Maintenance Ticket Transition with Audit Trail
  const handleUpdateTicketStatus = (ticketId, newStatus) => {
    const now = new Date();
    const timestampStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    
    setTickets(prev =>
      prev.map(t => {
        if (t.id === ticketId) {
          const updatedHistory = [
            ...(t.history || []),
            { timestamp: timestampStr, note: `Status updated to ${newStatus}` }
          ];
          return { ...t, status: newStatus, history: updatedHistory };
        }
        return t;
      })
    );
    showToast(`Ticket #${ticketId} updated to ${newStatus}.`);
  };

  // Record Payment
  const handleRecordPayment = (e) => {
    e.preventDefault();
    const unit = units.find(u => u.id === paymentForm.unitId);
    if (!unit || !unit.tenant) return;

    const receiptId = `RCPT-${Math.floor(1000 + Math.random() * 9000)}`;
    const amt = Number(paymentForm.amount);

    const newReceipt = {
      id: receiptId,
      unitNumber: unit.unitNumber,
      tenantName: unit.tenant.name,
      amount: amt,
      period: paymentForm.period,
      method: paymentForm.method,
      date: new Date().toISOString().split('T')[0],
      status: 'Cleared'
    };

    setLedger(prev => [newReceipt, ...prev]);

    // Update tenant balance
    setUnits(prev =>
      prev.map(u => {
        if (u.id === unit.id && u.tenant) {
          const newBal = Math.max(0, (u.tenant.rentBalance || 0) - amt);
          return {
            ...u,
            tenant: {
              ...u.tenant,
              rentBalance: newBal,
              rentStatus: newBal === 0 ? 'Paid' : 'Partial'
            }
          };
        }
        return u;
      })
    );

    setIsRecordPaymentOpen(false);
    setSelectedReceipt(newReceipt);
    showToast(`Payment ${receiptId} recorded. Printable receipt generated!`);
  };

  // Submit Ticket
  const handleSubmitTicket = (e) => {
    e.preventDefault();
    if (!ticketForm.title) return;

    const ticketId = `TCK-${Math.floor(100 + Math.random() * 900)}`;
    const now = new Date();
    const timestampStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const newTicket = {
      id: ticketId,
      unitNumber: ticketForm.unitNumber,
      tenantName: ticketForm.tenantName,
      category: ticketForm.category,
      title: ticketForm.title,
      priority: ticketForm.priority,
      status: 'Scheduled',
      assignedTo: 'In-House Maintenance',
      date: now.toISOString().split('T')[0],
      description: ticketForm.description,
      history: [
        { timestamp: timestampStr, note: `Ticket submitted by ${ticketForm.tenantName}` }
      ]
    };

    setTickets(prev => [newTicket, ...prev]);
    setIsSubmitTicketOpen(false);
    showToast(`Maintenance ticket ${ticketId} logged successfully.`);
  };

  // Onboard Tenant
  const handleOnboardTenant = (e) => {
    e.preventDefault();
    if (!onboardForm.name) return;

    const tenantId = `TNT-${Math.floor(8000 + Math.random() * 1000)}`;

    setUnits(prev =>
      prev.map(u => {
        if (u.id === onboardForm.unitId) {
          return {
            ...u,
            status: 'Occupied',
            monthlyRent: Number(onboardForm.rent),
            tenant: {
              id: tenantId,
              name: onboardForm.name,
              phone: onboardForm.phone,
              email: onboardForm.email,
              leaseStart: new Date().toISOString().split('T')[0],
              leaseEnd: onboardForm.leaseEnd,
              depositPaid: Number(onboardForm.deposit),
              rentBalance: 0,
              rentStatus: 'Paid'
            }
          };
        }
        return u;
      })
    );

    setIsOnboardTenantOpen(false);
    showToast(`Tenant ${onboardForm.name} onboarded to unit.`);
  };

  // Add Notice
  const handleCreateNotice = (e) => {
    e.preventDefault();
    if (!noticeForm.title) return;

    const noticeId = `NOT-${Math.floor(100 + Math.random() * 900)}`;
    const newNotice = {
      id: noticeId,
      title: noticeForm.title,
      date: new Date().toISOString().split('T')[0],
      target: noticeForm.target,
      body: noticeForm.body
    };

    setNotices(prev => [newNotice, ...prev]);
    setIsNewNoticeOpen(false);
    showToast(`Broadcast notice dispatched (Simulated).`);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* Toast Alert */}
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed top-5 right-5 z-50 flex items-center gap-3 bg-slate-900 text-white font-semibold px-4 py-3 rounded-xl shadow-xl border border-slate-700 no-print"
        >
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-sm">{toastMessage}</span>
        </div>
      )}

      {/* Top Application Navbar */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 px-4 sm:px-8 py-3.5 flex items-center justify-between no-print shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#0F172A] text-white flex items-center justify-center shadow-xs">
            <Building className="w-5 h-5 text-blue-400 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold tracking-tight text-slate-900 font-display">
                EstateFlow
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">
                Nordic Edition
              </span>
            </div>
            <p className="text-xs text-slate-500">Residential Property & Rent Ledger Management</p>
          </div>
        </div>

        {/* Role Switcher & Action Controls */}
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              type="button"
              onClick={() => setRoleMode('manager')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                roleMode === 'manager'
                  ? 'bg-white text-slate-900 font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Property Manager
            </button>
            <button
              type="button"
              onClick={() => setRoleMode('tenant')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                roleMode === 'tenant'
                  ? 'bg-white text-slate-900 font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Tenant Portal
            </button>
          </div>

          {roleMode === 'manager' && (
            <button
              type="button"
              onClick={() => setIsRecordPaymentOpen(true)}
              aria-label="Record rent payment"
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-colors"
            >
              <CreditCard className="w-4 h-4" />
              <span className="hidden sm:inline">Record Payment</span>
            </button>
          )}

          {roleMode === 'tenant' && (
            <button
              type="button"
              onClick={() => setIsSubmitTicketOpen(true)}
              aria-label="Submit maintenance ticket"
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-colors"
            >
              <Wrench className="w-4 h-4" />
              <span>Report Issue</span>
            </button>
          )}
        </div>
      </header>

      {/* Main Workspace */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full space-y-6">
        
        {/* KPI Metric Summary Cards */}
        <section aria-label="Portfolio Key Metrics" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 no-print">
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Occupancy Rate</span>
            <div className="text-2xl font-black text-slate-900">{occupancyRate}%</div>
            <p className="text-xs text-emerald-700 font-medium">{occupiedUnits} of {totalUnits} units occupied</p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Monthly Rent Roll</span>
            <div className="text-2xl font-black text-slate-900">${totalMonthlyRoll.toLocaleString()}</div>
            <p className="text-xs text-slate-500">Contracted monthly baseline</p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Active Maintenance</span>
            <div className="text-2xl font-black text-slate-900">
              {tickets.filter(t => t.status !== 'Resolved').length}
            </div>
            <p className="text-xs text-amber-700 font-medium">Open work orders</p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Outstanding Arrears</span>
            <div className="text-2xl font-black text-slate-900">${totalArrears.toLocaleString()}</div>
            <p className="text-xs text-rose-700 font-medium">Pending collection balance</p>
          </div>
        </section>

        {/* Tab Navigation Controls */}
        <nav aria-label="Module Tabs" className="flex items-center gap-2 border-b border-slate-200 pb-3 no-print overflow-x-auto">
          {[
            { id: 'units', label: 'Unit Inventory & Leases', count: units.length, icon: Home },
            { id: 'ledger', label: 'Rent Ledger & Receipts', count: ledger.length, icon: Receipt },
            { id: 'tickets', label: 'Maintenance Requests', count: tickets.length, icon: Wrench },
            { id: 'notices', label: 'Broadcast Notices', count: notices.length, icon: Bell }
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  activeTab === tab.id
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                  activeTab === tab.id ? 'bg-slate-800 text-slate-200' : 'bg-slate-100 text-slate-600'
                }`}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </nav>

        {/* ======================= TAB 1: UNITS & TENANTS ======================= */}
        {activeTab === 'units' && (
          <section className="space-y-4 no-print">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900">Residential Units Directory</h2>
              {roleMode === 'manager' && (
                <button
                  type="button"
                  onClick={() => setIsOnboardTenantOpen(true)}
                  aria-label="Onboard new tenant"
                  className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-xs"
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Onboard Tenant</span>
                </button>
              )}
            </div>

            {/* Desktop Table View (>= 768px) */}
            <div className="hidden md:block rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[10px]">
                    <th className="py-3 px-4">Unit #</th>
                    <th className="py-3 px-4">Property / Location</th>
                    <th className="py-3 px-4">Layout / Type</th>
                    <th className="py-3 px-4 text-right">Rent</th>
                    <th className="py-3 px-4">Current Tenant</th>
                    <th className="py-3 px-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-800">
                  {units.map(u => (
                    <tr key={u.id} className="hover:bg-slate-50/50">
                      <td className="py-3.5 px-4 font-bold text-slate-900">{u.unitNumber}</td>
                      <td className="py-3.5 px-4 text-slate-600">{u.estateName}</td>
                      <td className="py-3.5 px-4 text-slate-600">{u.type}</td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900">
                        ${u.monthlyRent.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4">
                        {u.tenant ? (
                          <div>
                            <div className="font-semibold text-slate-900">{u.tenant.name}</div>
                            <div className="text-[11px] text-slate-500">{u.tenant.phone}</div>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">No Active Lease</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          u.status === 'Occupied'
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                            : 'bg-slate-100 text-slate-800 border border-slate-300'
                        }`}>
                          {u.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card Layout (< 768px) to prevent column wrapping */}
            <div className="md:hidden space-y-3">
              {units.map(u => (
                <div key={u.id} className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-base text-slate-900">{u.unitNumber}</span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      u.status === 'Occupied'
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                        : 'bg-slate-100 text-slate-800 border border-slate-300'
                    }`}>
                      {u.status}
                    </span>
                  </div>
                  <div className="text-slate-600">{u.estateName} • {u.type}</div>
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                    <div>
                      <div className="text-[10px] uppercase font-bold text-slate-400">Monthly Rent</div>
                      <div className="font-mono font-bold text-slate-900">${u.monthlyRent.toLocaleString()}</div>
                    </div>
                    {u.tenant && (
                      <div className="text-right">
                        <div className="text-[10px] uppercase font-bold text-slate-400">Tenant</div>
                        <div className="font-semibold text-slate-900">{u.tenant.name}</div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ======================= TAB 2: RENT LEDGER & RECEIPTS ======================= */}
        {activeTab === 'ledger' && (
          <section className="space-y-4 no-print">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900">Cleared Rent Remittance Ledger</h2>
              <span className="text-xs font-semibold text-slate-500">Instant PDF & Print Verification</span>
            </div>

            {/* Desktop Table View (>= 768px) */}
            <div className="hidden md:block rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[10px]">
                    <th className="py-3 px-4">Receipt #</th>
                    <th className="py-3 px-4">Unit</th>
                    <th className="py-3 px-4">Tenant</th>
                    <th className="py-3 px-4">Remittance Method</th>
                    <th className="py-3 px-4">Billing Period</th>
                    <th className="py-3 px-4 text-right">Amount</th>
                    <th className="py-3 px-4 text-center">Receipt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-800">
                  {ledger.map(rcpt => (
                    <tr key={rcpt.id} className="hover:bg-slate-50/50">
                      <td className="py-3.5 px-4 font-mono font-bold text-blue-700">{rcpt.id}</td>
                      <td className="py-3.5 px-4 font-semibold text-slate-900">{rcpt.unitNumber}</td>
                      <td className="py-3.5 px-4 text-slate-700">{rcpt.tenantName}</td>
                      <td className="py-3.5 px-4 text-slate-600">{rcpt.method}</td>
                      <td className="py-3.5 px-4 text-slate-600">{rcpt.period}</td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900">
                        ${rcpt.amount.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => setSelectedReceipt(rcpt)}
                          aria-label={`View and print receipt ${rcpt.id}`}
                          className="px-2.5 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-[11px] inline-flex items-center gap-1 transition-colors"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>View Receipt</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card Layout (< 768px) */}
            <div className="md:hidden space-y-3">
              {ledger.map(rcpt => (
                <div key={rcpt.id} className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-blue-700">{rcpt.id}</span>
                    <span className="font-mono font-bold text-slate-900 text-sm">${rcpt.amount.toLocaleString()}</span>
                  </div>
                  <div className="font-semibold text-slate-900">{rcpt.tenantName} • {rcpt.unitNumber}</div>
                  <div className="text-[11px] text-slate-500">{rcpt.method} • {rcpt.period}</div>
                  <button
                    type="button"
                    onClick={() => setSelectedReceipt(rcpt)}
                    aria-label={`Open receipt ${rcpt.id}`}
                    className="w-full mt-2 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs flex items-center justify-center gap-1.5"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print Official Receipt</span>
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ======================= TAB 3: MAINTENANCE TICKETS ======================= */}
        {activeTab === 'tickets' && (
          <section className="space-y-4 no-print">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900">Maintenance & Facilities Work Orders</h2>
              <button
                type="button"
                onClick={() => setIsSubmitTicketOpen(true)}
                aria-label="Report new maintenance issue"
                className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-xs"
              >
                <Plus className="w-3.5 h-3.5 stroke-[3]" />
                <span>New Ticket</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {tickets.map(t => (
                <article
                  key={t.id}
                  className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-slate-500 text-[11px]">{t.id}</span>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        t.priority === 'Urgent'
                          ? 'bg-rose-50 text-rose-900 border border-rose-300'
                          : 'bg-slate-100 text-slate-800 border border-slate-300'
                      }`}>
                        {t.priority} Priority
                      </span>
                    </div>

                    <h3 className="font-bold text-sm text-slate-900 leading-snug">{t.title}</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">{t.description}</p>
                    <div className="text-[11px] text-slate-500 pt-1">
                      {t.unitNumber} • {t.tenantName}
                    </div>

                    {/* Timestamped Audit Trail */}
                    {t.history && t.history.length > 0 && (
                      <div className="pt-2 border-t border-slate-100 space-y-1">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                          <History className="w-3 h-3" />
                          <span>Audit Trail Log:</span>
                        </div>
                        <ul className="space-y-1 text-[10px] text-slate-500">
                          {t.history.map((h, idx) => (
                            <li key={idx} className="flex items-start gap-1.5">
                              <span className="font-mono text-slate-400 shrink-0">{h.timestamp}:</span>
                              <span>{h.note}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                      t.status === 'Resolved'
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                        : t.status === 'In Progress'
                        ? 'bg-blue-50 text-blue-800 border border-blue-300'
                        : 'bg-amber-50 text-amber-900 border border-amber-300'
                    }`}>
                      {t.status}
                    </span>

                    {roleMode === 'manager' && t.status !== 'Resolved' && (
                      <div className="flex items-center gap-1.5">
                        {t.status !== 'In Progress' && (
                          <button
                            type="button"
                            onClick={() => handleUpdateTicketStatus(t.id, 'In Progress')}
                            className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-semibold"
                          >
                            Start Work
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleUpdateTicketStatus(t.id, 'Resolved')}
                          className="px-2 py-1 rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-[10px] font-bold border border-emerald-200"
                        >
                          Resolve
                        </button>
                      </div>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        {/* ======================= TAB 4: BROADCAST NOTICES ======================= */}
        {activeTab === 'notices' && (
          <section className="space-y-4 no-print">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900">Tenant Bulletins & Community Notices</h2>
              {roleMode === 'manager' && (
                <button
                  type="button"
                  onClick={() => setIsNewNoticeOpen(true)}
                  aria-label="Create broadcast notice"
                  className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[3]" />
                  <span>Dispatch Notice</span>
                </button>
              )}
            </div>

            <div className="space-y-3">
              {notices.map(n => (
                <article key={n.id} className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[11px] font-bold text-blue-700">{n.id} • {n.date}</span>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700">
                      Target: {n.target}
                    </span>
                  </div>
                  <h3 className="font-bold text-base text-slate-900">{n.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{n.body}</p>
                </article>
              ))}
            </div>
          </section>
        )}
      </main>

      {/* ======================= MODAL / PRINT VIEW: OFFICIAL RENT RECEIPT ======================= */}
      {selectedReceipt && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Official Rent Receipt"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4"
        >
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6 text-xs print-area">
            {/* Header */}
            <div className="flex items-start justify-between pb-4 border-b-2 border-slate-900">
              <div>
                <div className="text-lg font-black text-slate-900 tracking-tight font-display">
                  ESTATEFLOW PROPERTIES
                </div>
                <div className="text-slate-500 text-[11px]">Official Rent Remittance Receipt</div>
                <div className="text-slate-500 text-[11px]">Nordic Property Partners LLC</div>
              </div>
              <div className="text-right">
                <div className="font-mono font-bold text-slate-900 text-sm">{selectedReceipt.id}</div>
                <div className="text-slate-500 text-[11px]">Date: {selectedReceipt.date}</div>
                <span className="inline-block mt-1 px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-300">
                  PAYMENT CLEARED
                </span>
              </div>
            </div>

            {/* Receipt Details Grid */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 grid grid-cols-2 gap-4">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">RECEIVED FROM</span>
                <div className="font-bold text-slate-900 text-sm">{selectedReceipt.tenantName}</div>
                <div className="text-slate-600">{selectedReceipt.unitNumber}</div>
              </div>
              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">AMOUNT PAID</span>
                <div className="text-xl font-black font-mono text-slate-900">
                  ${selectedReceipt.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </div>
                <div className="text-[11px] text-slate-500">Period: {selectedReceipt.period}</div>
              </div>
            </div>

            <div className="space-y-1.5 text-slate-600 text-[11px]">
              <div><strong>Payment Method:</strong> {selectedReceipt.method}</div>
              <div><strong>Authorization:</strong> Electronic Verification Validated (No signature required)</div>
            </div>

            <div className="pt-4 border-t border-slate-200 flex items-center justify-between no-print">
              <button
                type="button"
                onClick={() => setSelectedReceipt(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
              >
                Close Receipt
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold flex items-center gap-1.5 shadow-xs"
              >
                <Printer className="w-4 h-4" />
                <span>Print / Save PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================= MODAL: RECORD RENT PAYMENT ======================= */}
      {isRecordPaymentOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Record Rent Payment"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 no-print"
        >
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-blue-600" />
                <h2 className="font-bold text-sm text-slate-900">Record Rent Payment</h2>
              </div>
              <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md">
                DEMO SIMULATOR
              </span>
            </div>

            <form onSubmit={handleRecordPayment} className="space-y-3">
              <div>
                <label htmlFor="ef-payment-unit" className="block text-slate-600 font-medium mb-1">
                  Target Leased Unit
                </label>
                <select
                  id="ef-payment-unit"
                  value={paymentForm.unitId}
                  onChange={e => setPaymentForm({ ...paymentForm, unitId: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-900"
                >
                  {units.filter(u => u.status === 'Occupied').map(u => (
                    <option key={u.id} value={u.id}>
                      {u.unitNumber} — {u.tenant ? u.tenant.name : 'Unknown'} (${u.monthlyRent}/mo)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="ef-payment-amount" className="block text-slate-600 font-medium mb-1">
                  Payment Amount ($) *
                </label>
                <input
                  id="ef-payment-amount"
                  type="number"
                  min="1"
                  required
                  value={paymentForm.amount}
                  onChange={e => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 font-mono"
                />
              </div>

              <div>
                <label htmlFor="ef-payment-method" className="block text-slate-600 font-medium mb-1">
                  Remittance Channel
                </label>
                <select
                  id="ef-payment-method"
                  value={paymentForm.method}
                  onChange={e => setPaymentForm({ ...paymentForm, method: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-900"
                >
                  <option value="Bank ACH Direct">Bank ACH Direct Deposit</option>
                  <option value="Wire Remittance">Domestic / Wire Transfer</option>
                  <option value="Debit Card Online">Debit Card Electronic Checkout</option>
                  <option value="Cash Deposit">Property Management Cash Escrow</option>
                </select>
              </div>

              <div>
                <label htmlFor="ef-payment-period" className="block text-slate-600 font-medium mb-1">
                  Billing Period
                </label>
                <input
                  id="ef-payment-period"
                  type="text"
                  value={paymentForm.period}
                  onChange={e => setPaymentForm({ ...paymentForm, period: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-900"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsRecordPaymentOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold"
                >
                  Confirm & Clear
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================= MODAL: SUBMIT MAINTENANCE TICKET ======================= */}
      {isSubmitTicketOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Submit Maintenance Request"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 no-print"
        >
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Wrench className="w-4 h-4 text-blue-600" />
                <h2 className="font-bold text-sm text-slate-900">Report Maintenance Issue</h2>
              </div>
              <button
                type="button"
                onClick={() => setIsSubmitTicketOpen(false)}
                aria-label="Close dialog"
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitTicket} className="space-y-3">
              <div>
                <label htmlFor="ef-ticket-title" className="block text-slate-600 font-medium mb-1">
                  Issue Summary *
                </label>
                <input
                  id="ef-ticket-title"
                  type="text"
                  required
                  placeholder="e.g. Kitchen sink faucet dripping"
                  value={ticketForm.title}
                  onChange={e => setTicketForm({ ...ticketForm, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="ef-ticket-category" className="block text-slate-600 font-medium mb-1">
                    Category
                  </label>
                  <select
                    id="ef-ticket-category"
                    value={ticketForm.category}
                    onChange={e => setTicketForm({ ...ticketForm, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-900"
                  >
                    <option value="Plumbing">Plumbing</option>
                    <option value="Electrical">Electrical</option>
                    <option value="Carpentry">Carpentry & Locks</option>
                    <option value="HVAC">Heating / AC</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="ef-ticket-priority" className="block text-slate-600 font-medium mb-1">
                    Priority
                  </label>
                  <select
                    id="ef-ticket-priority"
                    value={ticketForm.priority}
                    onChange={e => setTicketForm({ ...ticketForm, priority: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-900"
                  >
                    <option value="Normal">Normal</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="ef-ticket-desc" className="block text-slate-600 font-medium mb-1">
                  Detailed Description
                </label>
                <textarea
                  id="ef-ticket-desc"
                  rows="3"
                  placeholder="Describe location, symptoms, and urgency..."
                  value={ticketForm.description}
                  onChange={e => setTicketForm({ ...ticketForm, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-900"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsSubmitTicketOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold"
                >
                  Submit Work Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================= MODAL: ONBOARD TENANT ======================= */}
      {isOnboardTenantOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Onboard Tenant"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 no-print"
        >
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-blue-600" />
                <h2 className="font-bold text-sm text-slate-900">Onboard New Tenant</h2>
              </div>
              <button
                type="button"
                onClick={() => setIsOnboardTenantOpen(false)}
                aria-label="Close onboard dialog"
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleOnboardTenant} className="space-y-3">
              <div>
                <label htmlFor="ef-onboard-unit" className="block text-slate-600 font-medium mb-1">
                  Assign Unit
                </label>
                <select
                  id="ef-onboard-unit"
                  value={onboardForm.unitId}
                  onChange={e => setOnboardForm({ ...onboardForm, unitId: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-900"
                >
                  {units.map(u => (
                    <option key={u.id} value={u.id}>
                      {u.unitNumber} ({u.estateName})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="ef-onboard-name" className="block text-slate-600 font-medium mb-1">
                  Tenant Full Name *
                </label>
                <input
                  id="ef-onboard-name"
                  type="text"
                  required
                  placeholder="e.g. Rachel Sterling"
                  value={onboardForm.name}
                  onChange={e => setOnboardForm({ ...onboardForm, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="ef-onboard-phone" className="block text-slate-600 font-medium mb-1">
                    Phone
                  </label>
                  <input
                    id="ef-onboard-phone"
                    type="tel"
                    placeholder="+1 (555) 019-2834"
                    value={onboardForm.phone}
                    onChange={e => setOnboardForm({ ...onboardForm, phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-900"
                  />
                </div>
                <div>
                  <label htmlFor="ef-onboard-email" className="block text-slate-600 font-medium mb-1">
                    Email
                  </label>
                  <input
                    id="ef-onboard-email"
                    type="email"
                    placeholder="tenant@domain.com"
                    value={onboardForm.email}
                    onChange={e => setOnboardForm({ ...onboardForm, email: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-900"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsOnboardTenantOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold"
                >
                  Complete Lease
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================= MODAL: DISPATCH NOTICE ======================= */}
      {isNewNoticeOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Dispatch Notice"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 no-print"
        >
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-blue-600" />
                <h2 className="font-bold text-sm text-slate-900">Broadcast Notice</h2>
              </div>
              <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md">
                SIMULATOR
              </span>
            </div>

            <form onSubmit={handleCreateNotice} className="space-y-3">
              <div>
                <label htmlFor="ef-notice-title" className="block text-slate-600 font-medium mb-1">
                  Notice Subject *
                </label>
                <input
                  id="ef-notice-title"
                  type="text"
                  required
                  placeholder="e.g. Scheduled Power Maintenance"
                  value={noticeForm.title}
                  onChange={e => setNoticeForm({ ...noticeForm, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-900"
                />
              </div>

              <div>
                <label htmlFor="ef-notice-body" className="block text-slate-600 font-medium mb-1">
                  Message Body
                </label>
                <textarea
                  id="ef-notice-body"
                  rows="3"
                  value={noticeForm.body}
                  onChange={e => setNoticeForm({ ...noticeForm, body: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-900"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsNewNoticeOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold"
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
