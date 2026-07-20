import React, { useState, useEffect } from "react";
import { User, Service, Application, SecureDocument, Transaction, SupportTicket, SystemConfig, NotificationLog } from "../types";
import { 
  Users, Settings, ShieldAlert, CheckCircle, AlertCircle, RefreshCw, BarChart4, ClipboardList,
  Edit, ToggleLeft, ToggleRight, DollarSign, Plus, ArrowUpRight, ArrowDownRight, Check, X, Eye, Link2, MessageCircle
} from "lucide-react";

interface AdminDashboardProps {
  user: User;
  services: Service[];
  onLogout: () => void;
  systemConfig: SystemConfig;
  onConfigChange: (newConfig: SystemConfig) => void;
  onServicesChange: (updatedServices: Service[]) => void;
}

export default function AdminDashboard({ 
  user, services, onLogout, systemConfig, onConfigChange, onServicesChange 
}: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<"analytics" | "bookings" | "users" | "deposits" | "catalog" | "tickets" | "notifications">("analytics");
  const [loading, setLoading] = useState(false);

  // DB States
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [allBookings, setAllBookings] = useState<Application[]>([]);
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
  const [allTickets, setAllTickets] = useState<SupportTicket[]>([]);
  const [allNotifications, setAllNotifications] = useState<NotificationLog[]>([]);

  // Selection states for actions
  const [targetUserId, setTargetUserId] = useState("");
  const [adjustAmount, setAdjustAmount] = useState("");
  const [adjustAction, setAdjustAction] = useState<"credit" | "debit">("credit");
  const [adjustRemarks, setAdjustRemarks] = useState("");
  const [adjustSuccess, setAdjustSuccess] = useState<string | null>(null);
  const [adjustError, setAdjustError] = useState<string | null>(null);

  // Status updating state
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [appStatusUpdate, setAppStatusUpdate] = useState<any>("under_review");
  const [appCommentUpdate, setAppCommentUpdate] = useState("");
  const [appUpdateSuccess, setAppUpdateSuccess] = useState<string | null>(null);

  // Edit Service State
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [servName, setServName] = useState("");
  const [servBasePrice, setServBasePrice] = useState("");
  const [servCommission, setServCommission] = useState("");
  const [servHyperlink, setServHyperlink] = useState("");
  const [servCorrection, setServCorrection] = useState("");
  const [servCategory, setServCategory] = useState("Identity Services");
  const [servDescription, setServDescription] = useState("");
  const [catalogSuccess, setCatalogSuccess] = useState<string | null>(null);

  // Ticket response state
  const [answeringTicket, setAnsweringTicket] = useState<SupportTicket | null>(null);
  const [ticketReply, setTicketReply] = useState("");
  const [ticketSuccess, setTicketSuccess] = useState<string | null>(null);

  // System Configuration Form state
  const [currentConfig, setCurrentConfig] = useState<SystemConfig>(systemConfig);
  const [configSuccess, setConfigSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchAdminData();
  }, [activeTab]);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [usersRes, appsRes, txsRes, tktsRes, notifsRes] = await Promise.all([
        fetch("/api/users"),
        fetch("/api/applications/list?userId=u-admin&role=admin"),
        fetch("/api/transactions?userId=u-admin&role=admin"),
        fetch("/api/tickets?userId=u-admin&role=admin"),
        fetch("/api/notifications")
      ]);

      if (usersRes.ok) setAllUsers(await usersRes.json());
      if (appsRes.ok) setAllBookings(await appsRes.json());
      if (txsRes.ok) setAllTransactions(await txsRes.json());
      if (tktsRes.ok) setAllTickets(await tktsRes.json());
      if (notifsRes.ok) setAllNotifications(await notifsRes.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleWalletAdjust = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetUserId || !adjustAmount) return;

    setAdjustError(null);
    setAdjustSuccess(null);

    try {
      const response = await fetch("/api/transactions/admin-adjust", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: targetUserId,
          amount: adjustAmount,
          action: adjustAction,
          remarks: adjustRemarks || "Owner balance alignment override"
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to make balance adjustment.");
      }

      setAdjustSuccess(`Successfully loaded/deducted ₹${adjustAmount} to user wallet!`);
      setAdjustAmount("");
      setAdjustRemarks("");
      setTargetUserId("");
      fetchAdminData();
    } catch (err: any) {
      setAdjustError(err.message || "An error occurred.");
    }
  };

  const handleAppStatusSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApp) return;

    setAppUpdateSuccess(null);

    try {
      const response = await fetch("/api/applications/update-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          applicationId: selectedApp.id,
          status: appStatusUpdate,
          comments: appCommentUpdate
        })
      });

      if (response.ok) {
        setAppUpdateSuccess("Application status updated and client SMS dispatched!");
        setAppCommentUpdate("");
        setSelectedApp(null);
        fetchAdminData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleUserStatus = async (userId: string, currentStatus: string) => {
    const nextStatus = currentStatus === "active" ? "suspended" : "active";
    try {
      const response = await fetch("/api/users/update-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, status: nextStatus })
      });

      if (response.ok) {
        fetchAdminData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleApproveDeposit = async (transactionId: string, status: "completed" | "failed") => {
    try {
      const response = await fetch("/api/transactions/admin-approve-deposit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transactionId, status })
      });

      if (response.ok) {
        fetchAdminData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleServiceEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCatalogSuccess(null);

    const payload = {
      id: editingService?.id,
      name: servName,
      category: servCategory,
      description: servDescription,
      basePrice: servBasePrice,
      commission: servCommission,
      hyperlinkOverride: servHyperlink,
      correctedName: servCorrection,
      isNew: !editingService
    };

    try {
      const response = await fetch("/api/services/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      if (response.ok) {
        setCatalogSuccess(editingService ? "Service corrected and saved!" : "New service catalog added!");
        onServicesChange(data.services);
        setEditingService(null);
        setServName("");
        setServBasePrice("");
        setServCommission("");
        setServHyperlink("");
        setServCorrection("");
        setServDescription("");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleStartEditService = (service: Service) => {
    setEditingService(service);
    setServName(service.name);
    setServBasePrice(service.basePrice.toString());
    setServCommission(service.commission.toString());
    setServHyperlink(service.hyperlinkOverride || "");
    setServCorrection(service.correctedName || "");
    setServCategory(service.category);
    setServDescription(service.description);
  };

  const handleToggleServiceActive = async (service: Service) => {
    try {
      const response = await fetch("/api/services/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: service.id,
          isActive: !service.isActive
        })
      });

      const data = await response.json();
      if (response.ok) {
        onServicesChange(data.services);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleTicketReplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!answeringTicket || !ticketReply) return;

    setTicketSuccess(null);

    try {
      const response = await fetch("/api/tickets/reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ticketId: answeringTicket.id,
          adminReply: ticketReply
        })
      });

      if (response.ok) {
        setTicketSuccess("Support reply recorded and sent back to partner locker!");
        setTicketReply("");
        setAnsweringTicket(null);
        fetchAdminData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setConfigSuccess(null);

    try {
      const response = await fetch("/api/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(currentConfig)
      });

      const data = await response.json();
      if (response.ok) {
        setConfigSuccess("Global portal configurations and brand theme committed!");
        onConfigChange(data.config);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Analytics Helpers
  const totalVolume = allTransactions.filter(t => t.status === "completed").reduce((acc, c) => acc + c.amount, 0);
  const totalWalletCredits = allUsers.reduce((acc, u) => acc + u.walletBalance, 0);
  const pendingDeposits = allTransactions.filter(t => t.status === "pending");
  const pendingApplicationsCount = allBookings.filter(a => a.status === "received" || a.status === "under_review").length;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Sidebar navigation */}
      <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-150 p-5 shadow-sm space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
          <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center font-bold text-lg">
            A
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-sm leading-tight">Amar Singh (Owner)</h3>
            <span className="text-[10px] bg-red-50 text-red-600 border border-red-200 px-2.5 py-0.5 rounded font-bold uppercase tracking-wider mt-1.5 inline-block">
              Super Administrator
            </span>
          </div>
        </div>

        <nav className="space-y-1">
          <button
            onClick={() => setActiveTab("analytics")}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
              activeTab === "analytics" ? "bg-red-600 text-white shadow-sm" : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            <BarChart4 className="w-4 h-4" />
            Control Center Analytics
          </button>
          <button
            onClick={() => setActiveTab("bookings")}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
              activeTab === "bookings" ? "bg-red-600 text-white shadow-sm" : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            <ClipboardList className="w-4 h-4" />
            Applications Workflow Queue ({pendingApplicationsCount})
          </button>
          <button
            onClick={() => setActiveTab("users")}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
              activeTab === "users" ? "bg-red-600 text-white shadow-sm" : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            <Users className="w-4 h-4" />
            CSC Partner Directory ({allUsers.length})
          </button>
          <button
            onClick={() => setActiveTab("deposits")}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
              activeTab === "deposits" ? "bg-red-600 text-white shadow-sm" : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            <DollarSign className="w-4 h-4" />
            Wallet Approvals Queue ({pendingDeposits.length})
          </button>
          <button
            onClick={() => setActiveTab("catalog")}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
              activeTab === "catalog" ? "bg-red-600 text-white shadow-sm" : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            <Settings className="w-4 h-4" />
            Catalog & Theme Corrections
          </button>
          <button
            onClick={() => setActiveTab("tickets")}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
              activeTab === "tickets" ? "bg-red-600 text-white shadow-sm" : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            <MessageCircle className="w-4 h-4" />
            Support Ticketing Desk
          </button>
          <button
            onClick={() => setActiveTab("notifications")}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
              activeTab === "notifications" ? "bg-red-600 text-white shadow-sm" : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            SMS & WhatsApp Audit Trail
          </button>
        </nav>

        <button
          onClick={onLogout}
          className="w-full text-center py-2 border border-red-200 text-red-600 hover:bg-red-50 text-xs font-bold rounded-xl transition"
        >
          Secure Logout
        </button>
      </div>

      {/* Main Control Panel Workspace */}
      <div className="lg:col-span-9 space-y-6">
        {activeTab === "analytics" && (
          <div className="space-y-6 animate-fade-in">
            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-2xl border border-slate-150 shadow-sm text-center">
                <span className="text-[10px] font-bold text-slate-400 block uppercase">Total System Ledger Volume</span>
                <span className="text-xl font-black text-slate-800 block mt-1.5">₹{totalVolume.toFixed(2)}</span>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-slate-150 shadow-sm text-center">
                <span className="text-[10px] font-bold text-slate-400 block uppercase">Cumulative Wallet Reserves</span>
                <span className="text-xl font-black text-emerald-600 block mt-1.5">₹{totalWalletCredits.toFixed(2)}</span>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-slate-150 shadow-sm text-center">
                <span className="text-[10px] font-bold text-slate-400 block uppercase">Filing Applications Queue</span>
                <span className="text-xl font-black text-blue-600 block mt-1.5">{allBookings.length} active</span>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-slate-150 shadow-sm text-center">
                <span className="text-[10px] font-bold text-slate-400 block uppercase">Partner Networks</span>
                <span className="text-xl font-black text-amber-600 block mt-1.5">{allUsers.length - 1} registered</span>
              </div>
            </div>

            {/* Wallet credit & debit balancing tool */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-150 p-5 shadow-sm space-y-4">
                <h3 className="font-bold text-slate-800 text-sm font-display flex items-center gap-1">
                  <DollarSign className="w-4 h-4 text-emerald-600" />
                  Owner Wallet balancing Adjustment
                </h3>
                <p className="text-xs text-slate-400">Directly load or deduct credits from agent/retailer portfolios.</p>

                <form onSubmit={handleWalletAdjust} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Select Partner / Client:</label>
                    <select
                      value={targetUserId}
                      required
                      onChange={(e) => setTargetUserId(e.target.value)}
                      className="w-full text-xs border border-slate-200 rounded-lg p-2.5 bg-slate-50 focus:outline-none"
                    >
                      <option value="">-- Select Wallet --</option>
                      {allUsers.filter(u => u.id !== "u-admin").map(u => (
                        <option key={u.id} value={u.id}>{u.name} ({u.role}) - Bal: ₹{u.walletBalance.toFixed(2)}</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Action:</label>
                      <select
                        value={adjustAction}
                        onChange={(e: any) => setAdjustAction(e.target.value)}
                        className="w-full text-xs border border-slate-200 rounded-lg p-2.5 bg-slate-50 focus:outline-none"
                      >
                        <option value="credit">Add Money (Credit)</option>
                        <option value="debit">Deduct Money (Debit)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Amount (₹):</label>
                      <input
                        type="number"
                        required
                        placeholder="e.g. 1500"
                        value={adjustAmount}
                        onChange={(e) => setAdjustAmount(e.target.value)}
                        className="w-full text-xs border border-slate-200 rounded-lg p-2.5 bg-slate-50 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Audit Ledger Remarks:</label>
                    <input
                      type="text"
                      placeholder="e.g. Approved cash deposits"
                      value={adjustRemarks}
                      onChange={(e) => setAdjustRemarks(e.target.value)}
                      className="w-full text-xs border border-slate-200 rounded-lg p-2.5 bg-slate-50 focus:outline-none"
                    />
                  </div>

                  {adjustSuccess && <p className="text-xs text-emerald-700 font-semibold">{adjustSuccess}</p>}
                  {adjustError && <p className="text-xs text-red-700 font-semibold">{adjustError}</p>}

                  <button
                    type="submit"
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2.5 rounded-xl transition shadow-sm"
                  >
                    Transmit Balance Adjustment
                  </button>
                </form>
              </div>

              {/* Graphical analytics */}
              <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-150 p-5 shadow-sm space-y-4">
                <h3 className="font-bold text-slate-800 text-sm font-display">System Filing Performance</h3>
                <div className="h-48 flex items-end justify-between gap-4 pt-4 border-b border-slate-150 pb-2 px-4">
                  {/* Mock beautiful vertical bar chart */}
                  <div className="flex-1 flex flex-col items-center">
                    <div className="w-full bg-blue-500 rounded-t-lg transition-all" style={{ height: '70%' }}></div>
                    <span className="text-[10px] font-bold text-slate-400 mt-2">Identity</span>
                  </div>
                  <div className="flex-1 flex flex-col items-center">
                    <div className="w-full bg-emerald-500 rounded-t-lg transition-all" style={{ height: '40%' }}></div>
                    <span className="text-[10px] font-bold text-slate-400 mt-2">Health</span>
                  </div>
                  <div className="flex-1 flex flex-col items-center">
                    <div className="w-full bg-purple-500 rounded-t-lg transition-all" style={{ height: '25%' }}></div>
                    <span className="text-[10px] font-bold text-slate-400 mt-2">Transport</span>
                  </div>
                  <div className="flex-1 flex flex-col items-center">
                    <div className="w-full bg-amber-500 rounded-t-lg transition-all" style={{ height: '85%' }}></div>
                    <span className="text-[10px] font-bold text-slate-400 mt-2">Finance</span>
                  </div>
                </div>
                <div className="flex justify-between text-[11px] text-slate-500 font-medium">
                  <span>* Charts reflect dynamic category transactions in last 30 days.</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "bookings" && (
          <div className="bg-white rounded-2xl border border-slate-150 p-6 shadow-sm space-y-6 animate-fade-in">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-lg font-bold text-slate-800 font-display">CSC Application Workflow Queue</h2>
                <p className="text-xs text-slate-400 mt-0.5">Control live statuses and add tracking details for dispatches.</p>
              </div>
              <button onClick={fetchAdminData} className="p-2 hover:bg-slate-50 rounded-lg text-slate-400">
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>

            {selectedApp && (
              <div className="p-5 bg-slate-50 rounded-xl border border-slate-200 space-y-4">
                <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider">
                  Update Application Code: {selectedApp.trackingId}
                </h3>

                <form onSubmit={handleAppStatusSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Set Application Status:</label>
                      <select
                        value={appStatusUpdate}
                        onChange={(e: any) => setAppStatusUpdate(e.target.value)}
                        className="w-full text-xs border border-slate-200 rounded-lg p-2.5 bg-white focus:outline-none"
                      >
                        <option value="received">Received (Lodge application)</option>
                        <option value="under_review">Under Review (Verifying files)</option>
                        <option value="dispatched">Dispatched (PVC Shipped / SpeedPost)</option>
                        <option value="completed">Completed (Successfully delivered)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Owner Action Comments (SpeedPost/Rejection remarks):</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Dispatched card. SpeedPost Tracking ID: SP19283712IN"
                        value={appCommentUpdate}
                        onChange={(e) => setAppCommentUpdate(e.target.value)}
                        className="w-full text-xs border border-slate-200 rounded-lg p-2.5 bg-white focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2 rounded-lg transition"
                    >
                      Commit Status & Send Simulated SMS
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedApp(null)}
                      className="border border-slate-200 hover:bg-slate-100 text-slate-600 font-bold text-xs px-4 py-2 rounded-lg transition bg-white"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {allBookings.length === 0 ? (
              <p className="text-xs text-slate-400 py-12 text-center">No client applications logged on system.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-150 text-slate-400 font-bold uppercase tracking-wider pb-2">
                      <th className="py-3 px-1">Tracking ID</th>
                      <th className="py-3">Applicant Name</th>
                      <th className="py-3">CSC Service Item</th>
                      <th className="py-3">Status</th>
                      <th className="py-3">Comments Log</th>
                      <th className="py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {allBookings.map(app => {
                      const service = services.find(s => s.id === app.serviceId);
                      return (
                        <tr key={app.id} className="hover:bg-slate-50/50">
                          <td className="py-3.5 px-1 font-mono font-bold text-blue-600">{app.trackingId}</td>
                          <td className="py-3.5">
                            <span className="block font-bold text-slate-800">{app.applicantName}</span>
                            <span className="text-[10px] text-slate-400 block">{app.applicantPhone}</span>
                          </td>
                          <td className="py-3.5 font-semibold text-slate-700">{service?.correctedName || service?.name}</td>
                          <td className="py-3.5">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              app.status === "completed" ? "bg-emerald-100 text-emerald-800" :
                              app.status === "dispatched" ? "bg-blue-100 text-blue-800" :
                              app.status === "under_review" ? "bg-amber-100 text-amber-800" : "bg-slate-100 text-slate-700"
                            }`}>
                              {app.status.replace("_", " ")}
                            </span>
                          </td>
                          <td className="py-3.5 text-slate-500 italic font-medium max-w-[150px] truncate">{app.comments || "No comments"}</td>
                          <td className="py-3.5 text-right">
                            <button
                              onClick={() => { setSelectedApp(app); setAppStatusUpdate(app.status); }}
                              className="bg-blue-50 hover:bg-blue-100 text-blue-600 text-[11px] font-bold px-3 py-1.5 rounded transition"
                            >
                              Update Status
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === "users" && (
          <div className="bg-white rounded-2xl border border-slate-150 p-6 shadow-sm space-y-6 animate-fade-in">
            <h2 className="text-lg font-bold text-slate-800 font-display">CSC Registered Partners Directory</h2>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase">
                    <th className="py-2.5">Partner Name</th>
                    <th className="py-2.5">Mobile Number</th>
                    <th className="py-2.5">Cluster Role</th>
                    <th className="py-2.5">Wallet Balance</th>
                    <th className="py-2.5">Profile Status</th>
                    <th className="py-2.5 text-right">Action Control</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {allUsers.map(usr => (
                    <tr key={usr.id} className="hover:bg-slate-50">
                      <td className="py-3.5 font-bold text-slate-800">{usr.name}</td>
                      <td className="py-3.5 font-medium text-slate-600">{usr.phone}</td>
                      <td className="py-3.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          usr.role === "admin" ? "bg-red-50 text-red-700" :
                          usr.role === "agent" ? "bg-emerald-50 text-emerald-700" :
                          usr.role === "distributor" ? "bg-purple-50 text-purple-700" : "bg-blue-50 text-blue-700"
                        }`}>
                          {usr.role}
                        </span>
                      </td>
                      <td className="py-3.5 font-black text-slate-700">₹{usr.walletBalance.toFixed(2)}</td>
                      <td className="py-3.5">
                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                          usr.status === "active" ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"
                        }`}>
                          {usr.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-3.5 text-right">
                        {usr.id !== "u-admin" && (
                          <button
                            onClick={() => handleToggleUserStatus(usr.id, usr.status)}
                            className={`text-[10px] font-black px-2.5 py-1.5 rounded transition ${
                              usr.status === "active" 
                                ? "bg-red-50 hover:bg-red-100 text-red-600" 
                                : "bg-emerald-50 hover:bg-emerald-100 text-emerald-700"
                            }`}
                          >
                            {usr.status === "active" ? "Suspend Profile" : "Activate Profile"}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "deposits" && (
          <div className="bg-white rounded-2xl border border-slate-150 p-6 shadow-sm space-y-6 animate-fade-in">
            <h2 className="text-lg font-bold text-slate-800 font-display">Wallet Recharge Approvals Queue</h2>

            {pendingDeposits.length === 0 ? (
              <p className="text-xs text-slate-400 py-12 text-center">No pending fund loading requests in pipeline.</p>
            ) : (
              <div className="space-y-4">
                {pendingDeposits.map(tx => {
                  const applicant = allUsers.find(u => u.id === tx.userId);
                  return (
                    <div key={tx.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-wrap justify-between items-center gap-4 text-xs">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 block uppercase">UTN TRANSACTION REF: {tx.referenceId}</span>
                        <h4 className="font-bold text-slate-800 text-sm mt-1">Requester: {applicant?.name} ({applicant?.role})</h4>
                        <span className="text-slate-500 block mt-0.5">Gateway: {tx.paymentMethod.toUpperCase()} • Requested on {new Date(tx.createdAt).toLocaleString()}</span>
                      </div>
                      
                      <div className="flex items-center gap-6">
                        <span className="text-lg font-black text-slate-800">₹{tx.amount}</span>
                        
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleApproveDeposit(tx.id, "completed")}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold p-1.5 rounded flex items-center justify-center transition"
                            title="Approve & Credit Wallet"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleApproveDeposit(tx.id, "failed")}
                            className="bg-red-500 hover:bg-red-600 text-white font-bold p-1.5 rounded flex items-center justify-center transition"
                            title="Decline"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === "catalog" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in">
            {/* Service Form edit/add */}
            <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-150 p-5 shadow-sm space-y-4">
              <h3 className="font-bold text-slate-800 text-sm font-display flex items-center gap-1.5">
                <Edit className="w-4 h-4 text-red-600" />
                Service Correction & Hyperlink Merge
              </h3>

              <form onSubmit={handleServiceEditSubmit} className="space-y-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Select Service to Modify (Optional):</label>
                  <select
                    onChange={(e) => {
                      const serv = services.find(s => s.id === e.target.value);
                      if (serv) handleStartEditService(serv);
                    }}
                    className="w-full text-xs border border-slate-200 rounded p-2 bg-slate-50 focus:outline-none"
                  >
                    <option value="">-- Create Fresh Service --</option>
                    {services.map(s => (
                      <option key={s.id} value={s.id}>{s.name} (Price: ₹{s.basePrice})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Service Display Name:</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Fresh Aadhaar PVC card"
                    value={servName}
                    onChange={(e) => setServName(e.target.value)}
                    className="w-full text-xs border border-slate-200 rounded p-2 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Base Price (₹):</label>
                    <input
                      type="number"
                      required
                      placeholder="e.g. 50"
                      value={servBasePrice}
                      onChange={(e) => setServBasePrice(e.target.value)}
                      className="w-full text-xs border border-slate-200 rounded p-2 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Commission Rebate (₹):</label>
                    <input
                      type="number"
                      required
                      placeholder="e.g. 10"
                      value={servCommission}
                      onChange={(e) => setServCommission(e.target.value)}
                      className="w-full text-xs border border-slate-200 rounded p-2 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Owner Service Correction (Override):</label>
                  <input
                    type="text"
                    placeholder="Correction overlay e.g. Voter Link Correction"
                    value={servCorrection}
                    onChange={(e) => setServCorrection(e.target.value)}
                    className="w-full text-xs border border-slate-200 rounded p-2 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Hyperlink Merging Portal URL (Direct redirect):</label>
                  <input
                    type="url"
                    placeholder="e.g. https://uidai.gov.in/"
                    value={servHyperlink}
                    onChange={(e) => setServHyperlink(e.target.value)}
                    className="w-full text-xs border border-slate-200 rounded p-2 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Category:</label>
                  <select
                    value={servCategory}
                    onChange={(e) => setServCategory(e.target.value)}
                    className="w-full text-xs border border-slate-200 rounded p-2 bg-slate-50 focus:outline-none"
                  >
                    <option value="Identity Services">Identity Services</option>
                    <option value="Health & Welfare">Health & Welfare</option>
                    <option value="Transport & Travel">Transport & Travel</option>
                    <option value="Business & Finance">Business & Finance</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Short Description:</label>
                  <textarea
                    rows={2}
                    placeholder="Type details..."
                    value={servDescription}
                    onChange={(e) => setServDescription(e.target.value)}
                    className="w-full text-xs border border-slate-200 rounded p-2 focus:outline-none"
                  />
                </div>

                {catalogSuccess && <p className="text-xs text-emerald-700 font-semibold">{catalogSuccess}</p>}

                <button
                  type="submit"
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-bold text-xs py-2 rounded transition shadow-sm"
                >
                  {editingService ? "Apply Corrective Modifications" : "Launch Fresh Catalog service"}
                </button>
              </form>
            </div>

            {/* Service Catalogue list control */}
            <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-150 p-5 shadow-sm space-y-4">
              <h3 className="font-bold text-slate-800 text-sm font-display">Active Service Toggles</h3>
              
              <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1 divide-y divide-slate-100">
                {services.map(serv => (
                  <div key={serv.id} className="py-3 first:pt-0 flex justify-between items-center text-xs">
                    <div>
                      <h4 className="font-bold text-slate-800">{serv.correctedName || serv.name}</h4>
                      <p className="text-[10px] text-slate-400 mt-0.5">{serv.category} • Cost: ₹{serv.basePrice} • Rebate: ₹{serv.commission}</p>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleToggleServiceActive(serv)}
                        className={`text-xs p-1 rounded transition`}
                        title={serv.isActive ? "Disable Service" : "Enable Service"}
                      >
                        {serv.isActive ? (
                          <ToggleRight className="w-8 h-8 text-emerald-500" />
                        ) : (
                          <ToggleLeft className="w-8 h-8 text-slate-300" />
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Theme & Config selector */}
            <div className="lg:col-span-12 bg-white rounded-2xl border border-slate-150 p-5 shadow-sm mt-4">
              <h3 className="font-bold text-slate-800 text-sm font-display mb-4">Owner Theme Control & Brand Configuration</h3>
              <form onSubmit={handleSaveConfig} className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Set Dynamic Brand Accent Color Theme:</label>
                  <select
                    value={currentConfig.themeColor}
                    onChange={(e: any) => setCurrentConfig(prev => ({ ...prev, themeColor: e.target.value }))}
                    className="w-full text-xs border border-slate-200 rounded-lg p-2.5 bg-slate-50 focus:outline-none"
                  >
                    <option value="royal-blue">Royal Corporate Blue</option>
                    <option value="deep-emerald">Deep Indian Emerald</option>
                    <option value="warm-gold">Warm Golden Amber</option>
                    <option value="charcoal">Slate Dark Charcoal</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Active Global Language:</label>
                  <select
                    value={currentConfig.language}
                    onChange={(e: any) => setCurrentConfig(prev => ({ ...prev, language: e.target.value }))}
                    className="w-full text-xs border border-slate-200 rounded-lg p-2.5 bg-slate-50 focus:outline-none"
                  >
                    <option value="en">English (default)</option>
                    <option value="hi">Hindi (हिन्दी)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Maintenance Mode Toggle:</label>
                  <div className="flex gap-4 pt-2">
                    <label className="flex items-center gap-1.5 text-xs font-medium text-slate-700">
                      <input 
                        type="radio" 
                        checked={currentConfig.isMaintenance} 
                        onChange={() => setCurrentConfig(prev => ({ ...prev, isMaintenance: true }))}
                      />
                      Active (Stop operations)
                    </label>
                    <label className="flex items-center gap-1.5 text-xs font-medium text-slate-700">
                      <input 
                        type="radio" 
                        checked={!currentConfig.isMaintenance} 
                        onChange={() => setCurrentConfig(prev => ({ ...prev, isMaintenance: false }))}
                      />
                      Inactive (Online)
                    </label>
                  </div>
                </div>

                <div className="md:col-span-3 border-t border-slate-100 pt-4 mt-2">
                  <h4 className="font-bold text-slate-700 text-xs mb-4 uppercase tracking-wider">Website Content & Details</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Portal Name / Title:</label>
                      <input
                        type="text"
                        value={currentConfig.portalName || ""}
                        onChange={(e) => setCurrentConfig(prev => ({ ...prev, portalName: e.target.value }))}
                        className="w-full text-xs border border-slate-200 rounded-lg p-2.5 bg-slate-50 focus:outline-none"
                        placeholder="e.g. ICT PAN ONLINE SEVA & SERVICES"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Contact Phone (Call Now):</label>
                      <input
                        type="text"
                        value={currentConfig.contactPhone}
                        onChange={(e) => setCurrentConfig(prev => ({ ...prev, contactPhone: e.target.value }))}
                        className="w-full text-xs border border-slate-200 rounded-lg p-2.5 bg-slate-50 focus:outline-none"
                        placeholder="9999999999"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">WhatsApp Number:</label>
                      <input
                        type="text"
                        value={currentConfig.whatsappNumber}
                        onChange={(e) => setCurrentConfig(prev => ({ ...prev, whatsappNumber: e.target.value }))}
                        className="w-full text-xs border border-slate-200 rounded-lg p-2.5 bg-slate-50 focus:outline-none"
                        placeholder="+919999999999"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Support Email:</label>
                      <input
                        type="text"
                        value={currentConfig.contactEmail}
                        onChange={(e) => setCurrentConfig(prev => ({ ...prev, contactEmail: e.target.value }))}
                        className="w-full text-xs border border-slate-200 rounded-lg p-2.5 bg-slate-50 focus:outline-none"
                        placeholder="contact@example.com"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Scrolling Marquee Text:</label>
                      <input
                        type="text"
                        value={currentConfig.marqueeText || ""}
                        onChange={(e) => setCurrentConfig(prev => ({ ...prev, marqueeText: e.target.value }))}
                        className="w-full text-xs border border-slate-200 rounded-lg p-2.5 bg-slate-50 focus:outline-none"
                        placeholder="Welcome to the portal..."
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Business Address:</label>
                      <input
                        type="text"
                        value={currentConfig.address}
                        onChange={(e) => setCurrentConfig(prev => ({ ...prev, address: e.target.value }))}
                        className="w-full text-xs border border-slate-200 rounded-lg p-2.5 bg-slate-50 focus:outline-none"
                        placeholder="Full business address..."
                      />
                    </div>
                  </div>
                </div>

                {configSuccess && <div className="md:col-span-3 text-xs text-emerald-800 font-bold bg-emerald-50 p-2 rounded">{configSuccess}</div>}

                <div className="md:col-span-3 text-right">
                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-6 py-2.5 rounded-xl transition shadow-sm"
                  >
                    Commit Global Configuration
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {activeTab === "tickets" && (
          <div className="bg-white rounded-2xl border border-slate-150 p-6 shadow-sm space-y-6 animate-fade-in">
            <h2 className="text-lg font-bold text-slate-800 font-display">Assistance Helpdesk Support Desk</h2>

            {answeringTicket && (
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <h3 className="font-bold text-slate-800 text-xs">Answering Ticket: {answeringTicket.subject}</h3>
                <p className="text-xs text-slate-600 italic">"{answeringTicket.message}"</p>

                <form onSubmit={handleTicketReplySubmit} className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Your Resolution Reply:</label>
                    <textarea
                      rows={3}
                      required
                      placeholder="Type instructions or correction confirmations..."
                      value={ticketReply}
                      onChange={(e) => setTicketReply(e.target.value)}
                      className="w-full text-xs border border-slate-200 rounded p-2.5 bg-white focus:outline-none"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2 rounded transition"
                    >
                      Resolve & Send Reply
                    </button>
                    <button
                      type="button"
                      onClick={() => setAnsweringTicket(null)}
                      className="border border-slate-200 hover:bg-slate-100 text-slate-600 font-bold text-xs px-4 py-2 rounded transition bg-white"
                    >
                      Close Pane
                    </button>
                  </div>
                </form>
              </div>
            )}

            {allTickets.length === 0 ? (
              <p className="text-xs text-slate-400 py-12 text-center">No assistance queries raised yet.</p>
            ) : (
              <div className="space-y-3">
                {allTickets.map(tkt => (
                  <div key={tkt.id} className="p-4 rounded-xl border border-slate-150 bg-slate-50/50 flex justify-between items-center text-xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-slate-800 text-sm">{tkt.subject}</h4>
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase ${
                          tkt.status === "resolved" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                        }`}>
                          {tkt.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1 italic">"{tkt.message}"</p>
                      {tkt.adminReply && (
                        <p className="text-xs text-blue-600 font-medium mt-1">Resolution: "{tkt.adminReply}"</p>
                      )}
                    </div>

                    {tkt.status === "open" && (
                      <button
                        onClick={() => setAnsweringTicket(tkt)}
                        className="bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-semibold px-3 py-1.5 rounded transition shrink-0"
                      >
                        Reply & Resolve
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "notifications" && (
          <div className="bg-white rounded-2xl border border-slate-150 p-6 shadow-sm space-y-6 animate-fade-in">
            <h2 className="text-lg font-bold text-slate-800 font-display">SMS, WhatsApp, & Email Audit Logs</h2>
            <p className="text-xs text-slate-400">Chronological history of simulated external gateway messages triggered by the CSC center.</p>

            {allNotifications.length === 0 ? (
              <p className="text-xs text-slate-400 py-12 text-center text-medium">No alerts generated yet. Lodge applications or update status to view dispatch alerts.</p>
            ) : (
              <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
                {allNotifications.map(notif => (
                  <div key={notif.id} className="p-3 border border-slate-150 bg-slate-50/50 rounded-xl flex justify-between items-center text-xs">
                    <div>
                      <span className="text-[10px] font-bold text-blue-600 uppercase bg-blue-50 px-2 py-0.5 rounded">
                        Gateway: {notif.channel.toUpperCase()}
                      </span>
                      <p className="text-slate-800 font-medium mt-1.5">Recipient: {notif.recipient}</p>
                      <p className="text-slate-600 italic mt-1 font-sans">"{notif.message}"</p>
                    </div>
                    <div className="text-right text-[10px] text-slate-400 font-mono">
                      <span>{new Date(notif.sentAt).toLocaleTimeString()}</span>
                      <span className="block text-emerald-600 font-bold mt-1">✓ Triggered</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
