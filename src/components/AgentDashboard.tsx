import React, { useState, useEffect } from "react";
import { User, Service, Application, SecureDocument, Transaction, SupportTicket, DocumentType } from "../types";
import { 
  BookOpen, FolderLock, History, HelpCircle, UserCheck, Wallet, ArrowRight, FileText, 
  RefreshCw, TrendingUp, Cpu, CheckCircle2, AlertCircle, PlusCircle, CreditCard, Layout, Grid
} from "lucide-react";
import DocumentUploader from "./DocumentUploader";

interface AgentDashboardProps {
  user: User;
  services: Service[];
  onLogout: () => void;
  systemConfig: any;
}

export default function AgentDashboard({ user, services, onLogout, systemConfig }: AgentDashboardProps) {
  const [activeTab, setActiveTab] = useState<"services" | "bookings" | "register" | "commission" | "ledger">("services");
  const [agentProfile, setAgentProfile] = useState<User>(user);
  
  // Data State
  const [applications, setApplications] = useState<Application[]>([]);
  const [documents, setDocuments] = useState<SecureDocument[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(false);

  // Booking details
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [bookingFields, setBookingFields] = useState<Record<string, string>>({});
  const [linkedDocIds, setLinkedDocIds] = useState<{ id: string; name: string; type: DocumentType }[]>([]);
  const [bookingSuccess, setBookingSuccess] = useState<string | null>(null);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [submittingBooking, setSubmittingBooking] = useState(false);

  // Quick Client Registration Form
  const [regName, setRegName] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regRole, setRegRole] = useState<"customer" | "agent">("customer");
  const [regSuccess, setRegSuccess] = useState<string | null>(null);
  const [regError, setRegError] = useState<string | null>(null);

  // Fund load form
  const [fundAmount, setFundAmount] = useState("");
  const [fundRef, setFundRef] = useState("");
  const [fundMethod, setFundMethod] = useState<"upi" | "gpay" | "phonepe" | "paytm" | "bank_transfer">("upi");
  const [fundSuccess, setFundSuccess] = useState<string | null>(null);
  const [fundError, setFundError] = useState<string | null>(null);

  useEffect(() => {
    fetchAgentData();
  }, [agentProfile]);

  const fetchAgentData = async () => {
    setLoading(true);
    try {
      // Fetch agent specific files
      const [appsRes, txsRes, profileRes] = await Promise.all([
        fetch(`/api/applications/list?userId=${agentProfile.id}`),
        fetch(`/api/transactions?userId=${agentProfile.id}`),
        // Simple profile reload to update wallet
        fetch(`/api/users`)
      ]);

      if (appsRes.ok) setApplications(await appsRes.json());
      if (txsRes.ok) setTransactions(await txsRes.json());
      if (profileRes.ok) {
        const users = await profileRes.json();
        const me = users.find((u: User) => u.id === agentProfile.id);
        if (me) {
          setAgentProfile(me);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectService = (service: Service) => {
    setSelectedService(service);
    setBookingFields({});
    setLinkedDocIds([]);
    setBookingSuccess(null);
    setBookingError(null);
  };

  const handleFieldChange = (key: string, value: string) => {
    setBookingFields(prev => ({ ...prev, [key]: value }));
  };

  const handleDocumentLinked = (docId: string, fileName: string, docType: DocumentType) => {
    setLinkedDocIds(prev => [...prev, { id: docId, name: fileName, type: docType }]);
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedService) return;

    setSubmittingBooking(true);
    setBookingError(null);
    setBookingSuccess(null);

    const applicantName = bookingFields["Full Applicant Name"];
    const applicantPhone = bookingFields["Applicant Contact Mobile"];

    if (!applicantName || !applicantPhone) {
      setBookingError("Please enter Applicant Name and Mobile.");
      setSubmittingBooking(false);
      return;
    }

    try {
      const response = await fetch("/api/applications/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: agentProfile.id,
          serviceId: selectedService.id,
          applicantName,
          applicantPhone,
          details: bookingFields,
          docIds: linkedDocIds.map(d => d.id)
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to book application from agent wallet.");
      }

      setBookingSuccess(`B2B Order successfully debited! Application Tracking: ${data.trackingId}`);
      setSelectedService(null);
      setBookingFields({});
      setLinkedDocIds([]);
      fetchAgentData();
    } catch (err: any) {
      setBookingError(err.message || "Something went wrong.");
    } finally {
      setSubmittingBooking(false);
    }
  };

  const handleRegisterClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName || !regPhone || !regPassword) return;

    setRegError(null);
    setRegSuccess(null);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: regName,
          phone: regPhone,
          email: regEmail,
          password: regPassword,
          role: regRole
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to register partner profile.");
      }

      setRegSuccess(`Successfully onboarded ${regName} (${regRole})! They can now log in using ${regPhone}.`);
      setRegName("");
      setRegPhone("");
      setRegEmail("");
      setRegPassword("");
    } catch (err: any) {
      setRegError(err.message || "An error occurred.");
    }
  };

  const handleLoadFund = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fundAmount || !fundRef) return;

    setFundError(null);
    setFundSuccess(null);

    try {
      const response = await fetch("/api/transactions/manual-deposit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: agentProfile.id,
          amount: fundAmount,
          paymentMethod: fundMethod,
          referenceId: fundRef,
          remarks: `${agentProfile.role.toUpperCase()} loaded wallet via dashboard QR`
        })
      });

      if (!response.ok) {
        throw new Error("Failed to submit fund load request.");
      }

      setFundSuccess("Receipt filed. Wallet will be credited immediately upon Amar Singh's approval!");
      setFundAmount("");
      setFundRef("");
      fetchAgentData();
    } catch (err: any) {
      setFundError(err.message || "An error occurred.");
    }
  };

  const getDynamicFields = (serviceId: string) => {
    const fields = ["Full Applicant Name", "Applicant Contact Mobile"];
    if (serviceId.includes("pan")) {
      fields.push("Father's Name", "Date of Birth (YYYY-MM-DD)", "Existing PAN (if correction)", "Aadhaar Card Number");
    } else if (serviceId.includes("aadhaar")) {
      fields.push("Aadhaar Number", "Gender", "Delivery Address with PinCode");
    } else if (serviceId.includes("abha")) {
      fields.push("Aadhaar Number", "Mobile linked to Aadhaar");
    } else if (serviceId.includes("ayushman")) {
      fields.push("Ration Card / PM-JAY Family ID", "Aadhaar Number");
    } else if (serviceId.includes("licence") || serviceId.includes("vehicle")) {
      fields.push("Vehicle Type (e.g. LMV/MCWG)", "Date of Birth (YYYY-MM-DD)", "Aadhaar Number");
    } else if (serviceId.includes("gst") || serviceId.includes("udyam")) {
      fields.push("Firm/Business Name", "Nature of Business Activity", "PAN Card Number");
    } else if (serviceId.includes("itr")) {
      fields.push("Annual Estimated Income", "PAN Card Number", "Bank Account Number & IFSC");
    } else {
      fields.push("Ad-hoc Processing Notes", "Aadhaar / Identifier Reference");
    }
    return fields;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Sidebar Info Card */}
      <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-150 p-5 shadow-sm space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
          <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center font-bold text-lg">
            {agentProfile.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-sm leading-tight">{agentProfile.name}</h3>
            <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded font-bold uppercase tracking-wider mt-1.5 inline-block">
              Portal {agentProfile.role}
            </span>
          </div>
        </div>

        {/* Dynamic Navigation */}
        <nav className="space-y-1">
          <button
            onClick={() => { setActiveTab("services"); setSelectedService(null); }}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
              activeTab === "services" ? "bg-emerald-600 text-white shadow-sm" : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            <Grid className="w-4 h-4" />
            Agent Service Portal
          </button>
          <button
            onClick={() => setActiveTab("bookings")}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
              activeTab === "bookings" ? "bg-emerald-600 text-white shadow-sm" : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            <History className="w-4 h-4" />
            B2B Client Orders ({applications.length})
          </button>
          <button
            onClick={() => setActiveTab("register")}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
              activeTab === "register" ? "bg-emerald-600 text-white shadow-sm" : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            <UserCheck className="w-4 h-4" />
            Onboard Client / Sub-Agent
          </button>
          <button
            onClick={() => setActiveTab("commission")}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
              activeTab === "commission" ? "bg-emerald-600 text-white shadow-sm" : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            Commission Settings
          </button>
          <button
            onClick={() => setActiveTab("ledger")}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
              activeTab === "ledger" ? "bg-emerald-600 text-white shadow-sm" : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            <Wallet className="w-4 h-4" />
            Wallet Ledger & Recharges
          </button>
        </nav>

        {/* Live Wallet Card */}
        <div className="bg-emerald-50/50 border border-emerald-200/60 p-4 rounded-xl">
          <div className="flex justify-between items-center mb-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Available B2B Wallet:</span>
            <Wallet className="w-4 h-4 text-emerald-600" />
          </div>
          <span className="text-2xl font-black text-slate-800">
            ₹{agentProfile.walletBalance.toFixed(2)}
          </span>
          <div className="mt-2 text-[10px] text-slate-400 flex items-center gap-1">
            <Cpu className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
            Direct auto-debits for high throughput
          </div>
        </div>

        <button
          onClick={onLogout}
          className="w-full text-center py-2 border border-red-200 text-red-600 hover:bg-red-50 text-xs font-bold rounded-xl transition"
        >
          Secure Logout
        </button>
      </div>

      {/* Main Workspace */}
      <div className="lg:col-span-9 space-y-6">
        {activeTab === "services" && (
          <div className="space-y-6 animate-fade-in">
            {bookingSuccess && (
              <div className="bg-emerald-50 text-emerald-800 p-4 rounded-xl flex items-start gap-2.5 border border-emerald-200">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-sm">B2B Order Debited & Placed!</h4>
                  <p className="text-xs mt-0.5">{bookingSuccess}</p>
                </div>
              </div>
            )}

            {!selectedService ? (
              <div className="bg-white rounded-2xl border border-slate-150 p-6 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h2 className="text-lg font-bold text-slate-800 font-display">Specialized Agent Service Panel</h2>
                    <p className="text-xs text-slate-400 mt-0.5">Quick-book services on behalf of clients using your pre-loaded balance.</p>
                  </div>
                  <button onClick={fetchAgentData} className="p-2 hover:bg-slate-50 rounded-lg text-slate-400">
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>

                {/* Grid of categories */}
                <div className="space-y-6">
                  {Array.from(new Set(services.map(s => s.category))).map(category => (
                    <div key={category} className="space-y-3">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-1.5">
                        {category}
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {services.filter(s => s.category === category && s.isActive).map(service => (
                          <div 
                            key={service.id} 
                            onClick={() => handleSelectService(service)}
                            className="p-4 rounded-xl border border-slate-150 hover:border-emerald-400 hover:bg-slate-50/50 transition cursor-pointer flex flex-col justify-between"
                          >
                            <div>
                              <div className="flex justify-between items-start gap-2">
                                <h4 className="font-bold text-slate-800 text-sm">{service.correctedName || service.name}</h4>
                                <div className="text-right">
                                  <span className="text-xs font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded block">
                                    ₹{service.basePrice}
                                  </span>
                                  <span className="text-[9px] text-emerald-500 font-bold block mt-1">
                                    + ₹{service.commission} Comm.
                                  </span>
                                </div>
                              </div>
                              <p className="text-xs text-slate-400 mt-1 line-clamp-2">{service.description}</p>
                            </div>
                            
                            <div className="mt-3 flex justify-between items-center text-[10px]">
                              <span className="text-slate-400">Net Cost: ₹{(service.basePrice - service.commission).toFixed(2)}</span>
                              <span className="text-emerald-700 font-bold flex items-center gap-1">
                                Book Now <ArrowRight className="w-3 h-3" />
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-150 p-6 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2.5 py-1 rounded">
                      Category Code: {selectedService.id}
                    </span>
                    <h2 className="text-lg font-bold text-slate-800 font-display mt-2">
                      New Booking: {selectedService.correctedName || selectedService.name}
                    </h2>
                  </div>
                  <button 
                    onClick={() => setSelectedService(null)}
                    className="text-xs bg-slate-50 text-slate-500 border border-slate-200 hover:bg-slate-100 px-3 py-1.5 rounded-lg transition"
                  >
                    Cancel Order
                  </button>
                </div>

                <form onSubmit={handleBookingSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {getDynamicFields(selectedService.id).map(field => (
                      <div key={field}>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">{field}:</label>
                        <input
                          type={field.includes("Date") ? "date" : "text"}
                          required
                          placeholder={`Enter client's ${field.toLowerCase()}...`}
                          value={bookingFields[field] || ""}
                          onChange={(e) => handleFieldChange(field, e.target.value)}
                          className="w-full text-xs border border-slate-200 rounded-lg p-2.5 bg-slate-50 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                        />
                      </div>
                    ))}
                  </div>

                  {/* Attachment selection */}
                  <div className="border-t border-slate-100 pt-6">
                    <h4 className="text-xs font-bold text-slate-700 uppercase mb-3">Attach Client Supporting Identity Scan</h4>
                    {linkedDocIds.length > 0 && (
                      <div className="mb-4 space-y-2">
                        <span className="text-[10px] font-bold text-slate-400 block uppercase">Linked Files:</span>
                        <div className="flex flex-wrap gap-2">
                          {linkedDocIds.map(doc => (
                            <span key={doc.id} className="text-[10px] bg-emerald-50 border border-emerald-200 text-emerald-800 px-2.5 py-1 rounded-full flex items-center gap-1.5 font-medium">
                              <FileText className="w-3.5 h-3.5 text-emerald-600" />
                              {doc.name} ({doc.type})
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    <DocumentUploader 
                      userId={agentProfile.id} 
                      onUploadSuccess={handleDocumentLinked}
                    />
                  </div>

                  {bookingError && (
                    <div className="bg-red-50 text-red-700 p-3 rounded-lg text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      <span>{bookingError}</span>
                    </div>
                  )}

                  <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                    <div className="text-xs text-slate-500">
                      B2B Debit Price: <strong className="text-slate-800 font-bold text-sm">₹{selectedService.basePrice}</strong> 
                      <span className="text-emerald-600 font-semibold ml-2">(Earns ₹{selectedService.commission} commission on dispatch)</span>
                    </div>
                    <button
                      type="submit"
                      disabled={submittingBooking}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-6 py-3 rounded-xl transition shadow-sm"
                    >
                      {submittingBooking ? "Ordering via Wallet..." : "Deduct Wallet & Launch File"}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}

        {activeTab === "bookings" && (
          <div className="bg-white rounded-2xl border border-slate-150 p-6 shadow-sm space-y-6 animate-fade-in">
            <div>
              <h2 className="text-lg font-bold text-slate-800 font-display">Client Bookings Registry</h2>
              <p className="text-xs text-slate-400 mt-0.5">Comprehensive list of CSC files launched via your wallet.</p>
            </div>

            {applications.length === 0 ? (
              <div className="text-center py-12 text-slate-400">No client bookings submitted yet. Launch standard files from the Agent service portal.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 uppercase tracking-wider font-bold">
                      <th className="py-3 px-1">Tracking ID</th>
                      <th className="py-3">Client Name / Phone</th>
                      <th className="py-3">CSC Service</th>
                      <th className="py-3">Filed Date</th>
                      <th className="py-3 text-center">Status</th>
                      <th className="py-3 text-right">Updates</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {applications.map(app => {
                      const service = services.find(s => s.id === app.serviceId);
                      return (
                        <tr key={app.id} className="hover:bg-slate-50">
                          <td className="py-3.5 px-1 font-mono font-bold text-blue-600">{app.trackingId}</td>
                          <td className="py-3.5">
                            <span className="block font-bold text-slate-800">{app.applicantName}</span>
                            <span className="text-slate-400 text-[10px] block mt-0.5">{app.applicantPhone}</span>
                          </td>
                          <td className="py-3.5 font-medium text-slate-700">{service?.correctedName || service?.name}</td>
                          <td className="py-3.5 text-slate-500">{new Date(app.createdAt).toLocaleDateString()}</td>
                          <td className="py-3.5 text-center">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              app.status === "completed" ? "bg-emerald-50 text-emerald-800" :
                              app.status === "dispatched" ? "bg-blue-50 text-blue-800" :
                              "bg-amber-50 text-amber-800"
                            }`}>
                              {app.status.replace("_", " ")}
                            </span>
                          </td>
                          <td className="py-3.5 text-right font-medium text-slate-500 max-w-[150px] truncate" title={app.comments}>
                            {app.comments || "Queued"}
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

        {activeTab === "register" && (
          <div className="bg-white rounded-2xl border border-slate-150 p-6 shadow-sm space-y-6 animate-fade-in">
            <div>
              <h2 className="text-lg font-bold text-slate-800 font-display">Onboard New Customer or Agent</h2>
              <p className="text-xs text-slate-400 mt-0.5">Directly register sub-retailers or independent customers under your cluster.</p>
            </div>

            <form onSubmit={handleRegisterClient} className="max-w-xl space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Full Name:</label>
                  <input
                    type="text"
                    required
                    placeholder="Enter full name"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    className="w-full text-xs border border-slate-200 rounded-lg p-2.5 bg-slate-50 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Mobile Number:</label>
                  <input
                    type="text"
                    required
                    maxLength={10}
                    placeholder="10 digit mobile"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    className="w-full text-xs border border-slate-200 rounded-lg p-2.5 bg-slate-50 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Email Address (Optional):</label>
                  <input
                    type="email"
                    placeholder="client@gmail.com"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    className="w-full text-xs border border-slate-200 rounded-lg p-2.5 bg-slate-50 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Access Password:</label>
                  <input
                    type="password"
                    required
                    placeholder="Set login password"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    className="w-full text-xs border border-slate-200 rounded-lg p-2.5 bg-slate-50 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Onboarding Profile Role:</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-1.5 text-xs font-medium text-slate-700">
                    <input 
                      type="radio" 
                      name="regRole" 
                      checked={regRole === "customer"} 
                      onChange={() => setRegRole("customer")}
                    />
                    Retail Customer
                  </label>
                  <label className="flex items-center gap-1.5 text-xs font-medium text-slate-700">
                    <input 
                      type="radio" 
                      name="regRole" 
                      checked={regRole === "agent"} 
                      onChange={() => setRegRole("agent")}
                    />
                    Sub-Agent / Retail Partner
                  </label>
                </div>
              </div>

              {regSuccess && (
                <div className="bg-emerald-50 text-emerald-800 p-3 rounded-lg text-xs font-medium">
                  {regSuccess}
                </div>
              )}

              {regError && (
                <div className="bg-red-50 text-red-700 p-3 rounded-lg text-xs font-medium">
                  {regError}
                </div>
              )}

              <button
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-6 py-2.5 rounded-xl transition"
              >
                Complete Onboarding Registration
              </button>
            </form>
          </div>
        )}

        {activeTab === "commission" && (
          <div className="bg-white rounded-2xl border border-slate-150 p-6 shadow-sm space-y-6 animate-fade-in">
            <div>
              <h2 className="text-lg font-bold text-slate-800 font-display">B2B Commission Matrix</h2>
              <p className="text-xs text-slate-400 mt-0.5">Commissions credited back to your wallet instantly upon successful file dispatch.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-150 text-center">
                <span className="text-[10px] font-bold text-slate-400 block uppercase">Identity Services Average Commission</span>
                <span className="text-2xl font-black text-blue-700 block mt-1">₹10.00 / file</span>
              </div>
              <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-150 text-center">
                <span className="text-[10px] font-bold text-slate-400 block uppercase">Travel & Passport Average Commission</span>
                <span className="text-2xl font-black text-emerald-700 block mt-1">₹120.00 / file</span>
              </div>
              <div className="p-4 rounded-xl bg-amber-50/50 border border-amber-150 text-center">
                <span className="text-[10px] font-bold text-slate-400 block uppercase">Business & GST Registration Commission</span>
                <span className="text-2xl font-black text-amber-700 block mt-1">₹150.00 / file</span>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-700 uppercase">Interactive Commission Sheet:</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                      <th className="py-2.5">Service Name</th>
                      <th className="py-2.5">Base Client Cost</th>
                      <th className="py-2.5 text-right">Commission Rebate</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {services.map(s => (
                      <tr key={s.id} className="hover:bg-slate-50">
                        <td className="py-3 font-semibold text-slate-700">{s.correctedName || s.name}</td>
                        <td className="py-3 font-medium text-slate-600">₹{s.basePrice}</td>
                        <td className="py-3 text-right font-black text-emerald-600">₹{s.commission}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === "ledger" && (
          <div className="bg-white rounded-2xl border border-slate-150 p-6 shadow-sm space-y-6 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b border-slate-100">
              {/* Load fund instructions */}
              <div className="space-y-4">
                <h3 className="font-bold text-slate-800 text-sm font-display">Load Wallet Balance Instantly</h3>
                <p className="text-xs text-slate-500">Scan this QR, make dynamic payment via PhonePe, GPay, Paytm or Bank Transfer, and upload receipt references below.</p>
                
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-4">
                  <div className="w-20 h-20 bg-white border border-slate-300 p-1 flex flex-col justify-center items-center text-[10px] font-black text-slate-400 text-center rounded">
                    <span>UPI QR</span>
                    <span className="text-[8px] font-bold text-slate-400 mt-1">amar@upi</span>
                  </div>
                  <div className="text-xs space-y-1">
                    <p className="font-bold text-slate-700">Bank Transfer Account Details:</p>
                    <p className="text-slate-500">Bank: State Bank of India</p>
                    <p className="text-slate-500">A/C: 38291024391</p>
                    <p className="text-slate-500">IFSC: SBIN0001043</p>
                  </div>
                </div>

                <form onSubmit={handleLoadFund} className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-500 mb-1">Transfer Amount (₹):</label>
                      <input
                        type="number"
                        required
                        placeholder="e.g. 5000"
                        value={fundAmount}
                        onChange={(e) => setFundAmount(e.target.value)}
                        className="w-full text-xs border border-slate-200 rounded p-2 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-500 mb-1">Transfer Gateway:</label>
                      <select
                        value={fundMethod}
                        onChange={(e: any) => setFundMethod(e.target.value)}
                        className="w-full text-xs border border-slate-200 rounded p-2 focus:outline-none bg-white"
                      >
                        <option value="upi">PhonePe / UPI</option>
                        <option value="gpay">Google Pay</option>
                        <option value="paytm">Paytm Wallet</option>
                        <option value="bank_transfer">Direct NetBanking</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">12-Digit UPI / UTR Transaction ID:</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 918237129841"
                      value={fundRef}
                      onChange={(e) => setFundRef(e.target.value)}
                      className="w-full text-xs border border-slate-200 rounded p-2 focus:outline-none"
                    />
                  </div>

                  {fundSuccess && <p className="text-xs text-emerald-700 font-semibold">{fundSuccess}</p>}
                  {fundError && <p className="text-xs text-red-700 font-semibold">{fundError}</p>}

                  <button
                    type="submit"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-6 py-2 rounded transition shadow-sm"
                  >
                    Transmit Fund Loading Notification
                  </button>
                </form>
              </div>

              {/* Transaction ledger list */}
              <div className="space-y-4">
                <h3 className="font-bold text-slate-800 text-sm font-display">Recent Wallet Ledger</h3>
                {transactions.length === 0 ? (
                  <p className="text-xs text-slate-400 py-12 text-center">No transaction records logged.</p>
                ) : (
                  <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
                    {transactions.map(tx => (
                      <div key={tx.id} className="p-3 border border-slate-150 rounded-xl bg-slate-50 flex justify-between items-center text-xs">
                        <div>
                          <span className="font-bold text-slate-700 block">{tx.remarks}</span>
                          <span className="text-[10px] text-slate-400 mt-1 block">Ref: {tx.referenceId || "Internal"} • {new Date(tx.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div className="text-right">
                          <span className={`font-black text-sm block ${tx.type === "credit" ? "text-emerald-600" : "text-red-500"}`}>
                            {tx.type === "credit" ? "+" : "-"} ₹{tx.amount}
                          </span>
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                            tx.status === "completed" ? "bg-emerald-100 text-emerald-800" :
                            tx.status === "pending" ? "bg-amber-100 text-amber-800" : "bg-red-100 text-red-800"
                          }`}>
                            {tx.status.toUpperCase()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
