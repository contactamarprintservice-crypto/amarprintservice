import React, { useState, useEffect } from "react";
import { 
  User, Service, Application, SecureDocument, Transaction, SupportTicket, DocumentType 
} from "../types";
import { 
  BookOpen, FolderLock, History, HelpCircle, User as UserIcon, Wallet, 
  ArrowRight, FileText, UploadCloud, RefreshCw, Send, CheckCircle2, MessageSquare, AlertCircle, Plus, Layout
} from "lucide-react";
import DocumentUploader from "./DocumentUploader";

interface CustomerDashboardProps {
  user: User;
  services: Service[];
  onLogout: () => void;
  systemConfig: any;
}

export default function CustomerDashboard({ user, services, onLogout, systemConfig }: CustomerDashboardProps) {
  const [activeTab, setActiveTab] = useState<"book" | "history" | "locker" | "tickets">("book");
  const [userProfile, setUserProfile] = useState<User>(user);
  
  // Data State
  const [applications, setApplications] = useState<Application[]>([]);
  const [documents, setDocuments] = useState<SecureDocument[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(false);

  // Booking form state
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [bookingFields, setBookingFields] = useState<Record<string, string>>({});
  const [linkedDocIds, setLinkedDocIds] = useState<{ id: string; name: string; type: DocumentType }[]>([]);
  const [bookingSuccess, setBookingSuccess] = useState<string | null>(null);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [submittingBooking, setSubmittingBooking] = useState(false);

  // Ticket Form
  const [ticketSubject, setTicketSubject] = useState("");
  const [ticketMessage, setTicketMessage] = useState("");
  const [ticketSuccess, setTicketSuccess] = useState<string | null>(null);

  // Manual payment state
  const [manualAmount, setManualAmount] = useState("");
  const [manualRef, setManualRef] = useState("");
  const [manualMethod, setManualMethod] = useState<any>("upi");
  const [manualSuccess, setManualSuccess] = useState<string | null>(null);
  const [manualError, setManualError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, [userProfile]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [appsRes, docsRes, txsRes, tktsRes] = await Promise.all([
        fetch(`/api/applications/list?userId=${userProfile.id}`),
        fetch(`/api/documents?userId=${userProfile.id}`),
        fetch(`/api/transactions?userId=${userProfile.id}`),
        fetch(`/api/tickets?userId=${userProfile.id}`)
      ]);

      if (appsRes.ok) setApplications(await appsRes.json());
      if (docsRes.ok) setDocuments(await docsRes.json());
      if (txsRes.ok) setTransactions(await txsRes.json());
      if (tktsRes.ok) setTickets(await tktsRes.json());
    } catch (err) {
      console.error("Error loading dashboard modules:", err);
    } finally {
      setLoading(false);
    }
  };

  // Reset booking form
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
    // Reload locker list
    fetch(`/api/documents?userId=${userProfile.id}`)
      .then(res => res.json())
      .then(data => setDocuments(data));
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedService) return;

    setSubmittingBooking(true);
    setBookingError(null);
    setBookingSuccess(null);

    // Default required fields
    const applicantName = bookingFields["Full Applicant Name"] || userProfile.name;
    const applicantPhone = bookingFields["Applicant Contact Mobile"] || userProfile.phone;

    try {
      const response = await fetch("/api/applications/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: userProfile.id,
          serviceId: selectedService.id,
          applicantName,
          applicantPhone,
          details: bookingFields,
          docIds: linkedDocIds.map(d => d.id)
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to submit booking application.");
      }

      setBookingSuccess(`Application registered successfully! Tracking Code: ${data.trackingId}`);
      setSelectedService(null);
      setBookingFields({});
      setLinkedDocIds([]);
      fetchDashboardData();
    } catch (err: any) {
      setBookingError(err.message || "Something went wrong.");
    } finally {
      setSubmittingBooking(false);
    }
  };

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketSubject || !ticketMessage) return;

    try {
      const response = await fetch("/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: userProfile.id,
          subject: ticketSubject,
          message: ticketMessage
        })
      });

      if (response.ok) {
        setTicketSuccess("Support ticket created. Admin Amar Singh will respond shortly!");
        setTicketSubject("");
        setTicketMessage("");
        const tktsRes = await fetch(`/api/tickets?userId=${userProfile.id}`);
        if (tktsRes.ok) setTickets(await tktsRes.json());
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleManualPaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualAmount || !manualRef) return;

    setManualError(null);
    setManualSuccess(null);

    try {
      const response = await fetch("/api/transactions/manual-deposit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: userProfile.id,
          amount: manualAmount,
          paymentMethod: manualMethod,
          referenceId: manualRef,
          remarks: "Customer loaded wallet via portal payment QR"
        })
      });

      if (!response.ok) {
        throw new Error("Failed to upload manual deposit notification.");
      }

      setManualSuccess("Deposit details registered successfully. Awaiting Admin verification!");
      setManualAmount("");
      setManualRef("");
      
      const txsRes = await fetch(`/api/transactions?userId=${userProfile.id}`);
      if (txsRes.ok) setTransactions(await txsRes.json());
    } catch (err: any) {
      setManualError(err.message || "An error occurred.");
    }
  };

  // Determine dynamic fields based on service code
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
      {/* Sidebar Control Panel */}
      <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-150 p-5 shadow-sm space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
          <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-lg">
            {userProfile.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-sm leading-tight">{userProfile.name}</h3>
            <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded font-bold uppercase tracking-wider mt-1 inline-block">
              {userProfile.role}
            </span>
          </div>
        </div>

        {/* Dynamic Navigation Tabs */}
        <nav className="space-y-1">
          <button
            onClick={() => { setActiveTab("book"); setSelectedService(null); }}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
              activeTab === "book" 
                ? "bg-blue-600 text-white shadow-sm" 
                : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            <BookOpen className="w-4 h-4" />
            Book CSC Services
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
              activeTab === "history" 
                ? "bg-blue-600 text-white shadow-sm" 
                : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            <History className="w-4 h-4" />
            Booking History ({applications.length})
          </button>
          <button
            onClick={() => setActiveTab("locker")}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
              activeTab === "locker" 
                ? "bg-blue-600 text-white shadow-sm" 
                : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            <FolderLock className="w-4 h-4" />
            Secure Document Locker ({documents.length})
          </button>
          <button
            onClick={() => setActiveTab("tickets")}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
              activeTab === "tickets" 
                ? "bg-blue-600 text-white shadow-sm" 
                : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            Support Helpdesk ({tickets.length})
          </button>
        </nav>

        {/* Dynamic QR Recharge Panel */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
          <div className="flex justify-between items-center mb-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase">My Wallet Balance:</span>
            <Wallet className="w-4 h-4 text-blue-600" />
          </div>
          <span className="text-xl font-black text-slate-800">
            ₹{userProfile.walletBalance.toFixed(2)}
          </span>

          <div className="mt-4 pt-3 border-t border-slate-200 space-y-3">
            <span className="block text-[10px] font-bold text-slate-500 uppercase">Load Wallet via UPI QR:</span>
            {/* Simulation of Dynamic QR */}
            <div className="bg-white p-2 rounded border border-slate-100 flex justify-center">
              <div className="w-24 h-24 bg-slate-100 flex flex-col items-center justify-center border border-slate-200 text-[10px] font-bold text-slate-400 p-2 text-center rounded">
                <span className="text-slate-600 text-xs">DYNAMIC QR</span>
                <span className="text-[8px] text-slate-400 mt-1">UPI ID: amar@upi</span>
              </div>
            </div>

            <form onSubmit={handleManualPaymentSubmit} className="space-y-2">
              <input
                type="number"
                placeholder="Amount (₹)"
                value={manualAmount}
                onChange={(e) => setManualAmount(e.target.value)}
                className="w-full text-[11px] p-2 border border-slate-200 rounded focus:outline-none"
              />
              <input
                type="text"
                placeholder="UPI Ref ID (12 digits)"
                value={manualRef}
                onChange={(e) => setManualRef(e.target.value)}
                className="w-full text-[11px] p-2 border border-slate-200 rounded focus:outline-none"
              />
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-[10px] py-1.5 rounded transition"
              >
                Submit Payment Receipt
              </button>
            </form>

            {manualSuccess && <p className="text-[9px] text-emerald-600 font-semibold">{manualSuccess}</p>}
            {manualError && <p className="text-[9px] text-red-600 font-semibold">{manualError}</p>}
          </div>
        </div>

        <button
          onClick={onLogout}
          className="w-full text-center py-2 border border-red-200 text-red-600 hover:bg-red-50 text-xs font-bold rounded-xl transition"
        >
          Secure Logout
        </button>
      </div>

      {/* Main Workspace Area */}
      <div className="lg:col-span-9 space-y-6">
        {activeTab === "book" && (
          <div className="space-y-6 animate-fade-in">
            {bookingSuccess && (
              <div className="bg-emerald-50 text-emerald-800 p-4 rounded-xl flex items-start gap-2.5 border border-emerald-200 shadow-sm">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-sm">Booking Successful!</h4>
                  <p className="text-xs mt-0.5">{bookingSuccess}</p>
                </div>
              </div>
            )}

            {!selectedService ? (
              <div className="bg-white rounded-2xl border border-slate-150 p-6 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h2 className="text-lg font-bold text-slate-800 font-display">Expansive CSC Service Portfolio</h2>
                    <p className="text-xs text-slate-400 mt-0.5">Choose any digital service to process via Amar CSC Center.</p>
                  </div>
                  <button onClick={fetchDashboardData} className="p-2 hover:bg-slate-50 rounded-lg text-slate-400">
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>

                {/* Services categorized */}
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
                            className="p-4 rounded-xl border border-slate-150 hover:border-blue-400 hover:bg-slate-50/50 transition duration-150 cursor-pointer flex flex-col justify-between"
                            onClick={() => handleSelectService(service)}
                          >
                            <div>
                              <div className="flex justify-between items-start gap-2">
                                <h4 className="font-bold text-slate-800 text-sm">{service.correctedName || service.name}</h4>
                                <span className="text-xs font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded shrink-0">
                                  ₹{service.basePrice}
                                </span>
                              </div>
                              <p className="text-xs text-slate-400 mt-1.5 line-clamp-2">{service.description}</p>
                            </div>
                            
                            <div className="mt-3 flex justify-between items-center text-[10px]">
                              {service.hyperlinkOverride ? (
                                <span className="text-amber-600 font-semibold italic">Redirect Available</span>
                              ) : (
                                <span className="text-slate-400">Apply via standard CSC ledger</span>
                              )}
                              <span className="text-blue-600 font-bold flex items-center gap-1 hover:underline">
                                Apply Now <ArrowRight className="w-3 h-3" />
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
                    <span className="text-[10px] text-blue-600 font-bold bg-blue-50 px-2.5 py-1 rounded">
                      Application Ledger Code: {selectedService.id}
                    </span>
                    <h2 className="text-lg font-bold text-slate-800 font-display mt-2">
                      New Application: {selectedService.correctedName || selectedService.name}
                    </h2>
                  </div>
                  <button 
                    onClick={() => setSelectedService(null)}
                    className="text-xs bg-slate-50 text-slate-500 border border-slate-200 hover:bg-slate-100 px-3 py-1.5 rounded-lg transition"
                  >
                    Go Back
                  </button>
                </div>

                {selectedService.hyperlinkOverride && (
                  <div className="mb-4 bg-amber-50 border border-amber-200 text-amber-800 p-3 rounded-lg text-xs font-medium">
                    ⚠️ <strong>Admin Hyperlink Redirection:</strong> This service links directly to external systems. 
                    You may view the target portal here: <a href={selectedService.hyperlinkOverride} target="_blank" rel="noreferrer" className="underline text-blue-600 font-bold">{selectedService.hyperlinkOverride}</a>
                  </div>
                )}

                <form onSubmit={handleBookingSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {getDynamicFields(selectedService.id).map(field => (
                      <div key={field}>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">{field}:</label>
                        <input
                          type={field.includes("Date") ? "date" : "text"}
                          required
                          placeholder={`Enter ${field.toLowerCase()}...`}
                          value={bookingFields[field] || ""}
                          onChange={(e) => handleFieldChange(field, e.target.value)}
                          className="w-full text-xs border border-slate-200 rounded-lg p-2.5 bg-slate-50 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                      </div>
                    ))}
                  </div>

                  {/* Document uploader inside form */}
                  <div className="border-t border-slate-100 pt-6">
                    <h4 className="text-xs font-bold text-slate-700 uppercase mb-3">Attach Identity Documents for Processing</h4>
                    
                    {linkedDocIds.length > 0 && (
                      <div className="mb-4 space-y-2">
                        <span className="text-[10px] font-bold text-slate-400 block uppercase">Successfully Linked Items:</span>
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
                      userId={userProfile.id} 
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
                      Total Application Processing Price: <strong className="text-slate-800 font-bold text-sm">₹{selectedService.basePrice}</strong>
                    </div>
                    <button
                      type="submit"
                      disabled={submittingBooking}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-6 py-3 rounded-xl transition shadow-sm"
                    >
                      {submittingBooking ? "Submitting Secured Application..." : "Confirm Ledger payment & Submit Application"}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}

        {activeTab === "history" && (
          <div className="bg-white rounded-2xl border border-slate-150 p-6 shadow-sm space-y-6 animate-fade-in">
            <div>
              <h2 className="text-lg font-bold text-slate-800 font-display">Your Service Booking History</h2>
              <p className="text-xs text-slate-400 mt-0.5">Track your live applications and digital PVC dispatches.</p>
            </div>

            {loading ? (
              <div className="text-center py-12 text-slate-400">Loading booking records...</div>
            ) : applications.length === 0 ? (
              <div className="text-center py-12 text-slate-400">No applications filed yet. Begin by booking from the CSC service portfolio tab.</div>
            ) : (
              <div className="divide-y divide-slate-100">
                {applications.map(app => {
                  const service = services.find(s => s.id === app.serviceId);
                  return (
                    <div key={app.id} className="py-4 first:pt-0 last:pb-0 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                      <div className="md:col-span-4">
                        <span className="text-[9px] font-bold text-slate-400 block uppercase">TRACKING CODE: {app.trackingId}</span>
                        <h4 className="font-bold text-slate-800 text-xs mt-0.5">{service?.correctedName || service?.name || "CSC Processing"}</h4>
                        <span className="text-[10px] text-slate-500">Applicant: {app.applicantName}</span>
                      </div>
                      <div className="md:col-span-4">
                        <span className="text-[9px] font-bold text-slate-400 block uppercase">SUBMITTED ON:</span>
                        <span className="text-xs text-slate-700">{new Date(app.createdAt).toLocaleString()}</span>
                      </div>
                      <div className="md:col-span-2">
                        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase ${
                          app.status === "completed" ? "bg-emerald-50 text-emerald-800 border border-emerald-200" :
                          app.status === "dispatched" ? "bg-blue-50 text-blue-800 border border-blue-200" :
                          app.status === "under_review" ? "bg-amber-50 text-amber-800 border border-amber-200" :
                          "bg-slate-100 text-slate-700"
                        }`}>
                          {app.status.replace("_", " ")}
                        </span>
                      </div>
                      <div className="md:col-span-2 text-right">
                        {app.comments && (
                          <span className="text-[10px] text-blue-600 block italic font-medium truncate" title={app.comments}>
                            "{app.comments}"
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === "locker" && (
          <div className="bg-white rounded-2xl border border-slate-150 p-6 shadow-sm space-y-6 animate-fade-in">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-lg font-bold text-slate-800 font-display">Secure Digital Document Locker</h2>
                <p className="text-xs text-slate-400 mt-0.5">Secure, encrypted locker containing your uploaded identity files.</p>
              </div>
              <span className="text-[10px] bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full font-bold">
                🔒 256-Bit SSL Encrypted
              </span>
            </div>

            <DocumentUploader 
              userId={userProfile.id} 
              onUploadSuccess={fetchDashboardData}
            />

            {documents.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-xs border border-dashed border-slate-200 rounded-xl">
                Locker is empty. Upload your Aadhaar, PAN, Photos, and Signatures here for continuous CSC applications speed-fill.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {documents.map(doc => (
                  <div key={doc.id} className="p-4 rounded-xl border border-slate-150 bg-slate-50 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center font-bold">
                        {doc.docType.slice(0, 3).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-800 text-xs truncate max-w-[180px]">{doc.fileName}</h4>
                        <span className="text-[10px] text-slate-400">{new Date(doc.uploadedAt).toLocaleString()}</span>
                      </div>
                    </div>
                    {/* Simulation of Document Download */}
                    <button 
                      onClick={() => {
                        const win = window.open();
                        if (win) {
                          win.document.write(`<iframe src="${doc.fileData}" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>`);
                        }
                      }}
                      className="text-xs font-bold text-blue-600 hover:underline shrink-0"
                    >
                      View File
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "tickets" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in">
            {/* Create ticket form */}
            <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-150 p-5 shadow-sm space-y-4">
              <h3 className="font-bold text-slate-800 text-sm font-display flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4 text-blue-600" />
                Submit Support Query
              </h3>

              <form onSubmit={handleCreateTicket} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Subject / Issue:</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. SpeedPost Tracking not updating"
                    value={ticketSubject}
                    onChange={(e) => setTicketSubject(e.target.value)}
                    className="w-full text-xs border border-slate-200 rounded-lg p-2.5 bg-slate-50 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Detailed Message:</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Provide complete description of the error / delay..."
                    value={ticketMessage}
                    onChange={(e) => setTicketMessage(e.target.value)}
                    className="w-full text-xs border border-slate-200 rounded-lg p-2.5 bg-slate-50 focus:outline-none"
                  />
                </div>

                {ticketSuccess && <p className="text-xs text-emerald-700 font-semibold">{ticketSuccess}</p>}

                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2.5 rounded-xl transition"
                >
                  Create Support Ticket
                </button>
              </form>
            </div>

            {/* Support ticket list */}
            <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-150 p-5 shadow-sm space-y-4">
              <h3 className="font-bold text-slate-800 text-sm font-display">Active Assistance Tickets</h3>

              {tickets.length === 0 ? (
                <p className="text-xs text-slate-400 py-12 text-center">No active queries found. Open a support ticket on the left pane if you face any payment or filing issues.</p>
              ) : (
                <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
                  {tickets.map(ticket => (
                    <div key={ticket.id} className="p-3 border border-slate-150 rounded-xl space-y-2 bg-slate-50">
                      <div className="flex justify-between items-start">
                        <h4 className="font-bold text-slate-800 text-xs">{ticket.subject}</h4>
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                          ticket.status === "resolved" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                        }`}>
                          {ticket.status.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 italic">"{ticket.message}"</p>
                      {ticket.adminReply && (
                        <div className="bg-white p-2.5 rounded border border-blue-100 text-[11px] text-slate-700">
                          <strong className="text-blue-600 block mb-0.5">Admin Amar Singh Reply:</strong>
                          "{ticket.adminReply}"
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
