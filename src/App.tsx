import React, { useState, useEffect } from "react";
import { 
  Phone, Mail, MapPin, Globe, Shield, CreditCard, MessageSquare, 
  HelpCircle, Image as ImageIcon, BookOpen, User as UserIcon, Lock, Key, 
  Search, ArrowRight, CheckCircle2, ChevronRight, Menu, X, Check, FileText, Smartphone,
  RefreshCw, CheckCircle, Wallet
} from "lucide-react";
import { User, Service, SystemConfig } from "./types";
import CustomerDashboard from "./components/CustomerDashboard";
import AgentDashboard from "./components/AgentDashboard";
import AdminDashboard from "./components/AdminDashboard";
import ApplicationTracker from "./components/ApplicationTracker";

// Multi-lingual Translation Resource Dictionary
const LOCALES = {
  en: {
    heroTitle: "AMAR CSC DIGITAL SERVICES",
    heroSubtitle: "Your Trusted Doorstep Gateway for PVC Cards, Identity, Welfare Schemes & Financial Solutions.",
    trustMessage: "Secure, API-ready, dynamic full-stack processing center.",
    trackLabel: "Track Application",
    loginLabel: "Dashboard Login",
    registerLabel: "Onboard Sub-Agent",
    home: "Home",
    about: "About",
    services: "Services Portfolio",
    pricing: "Pricing",
    contact: "Contact Us",
    faq: "FAQ",
    downloads: "Downloads",
    gallery: "Gallery",
    phoneLabel: "Call Now",
    whatsappLabel: "WhatsApp Chat",
    searchPlaceholder: "Search active CSC services...",
    addressLabel: "Main Market Road, Bihar, India",
    footerText: "© 2026 AMAR CSC CENTER. All Rights Reserved. Authorized Digital Seva Partner.",
    whoAreWe: "Amar CSC Center (amarprintservices.in) is India's leading secure print & e-Governance partner. Under the leadership of Amar Singh, we provide secure processing of Aadhaar PVCs, PAN corrections, Ayushman cards, Passport filings, and Business GSTIN setups across mobile app, web, and offline channels.",
    whyChooseUs: "Fastest Turnaround • 256-Bit SSL Encrypted Lockers • Verified SpeedPost Dispatch Alerts • Live SMS Tracking Codes"
  },
  hi: {
    heroTitle: "अमर सीएससी डिजिटल सेवाएं",
    heroSubtitle: "पीवीसी कार्ड, पहचान पत्र, कल्याणकारी योजनाओं और वित्तीय समाधानों के लिए आपका विश्वसनीय प्रवेश द्वार।",
    trustMessage: "सुरक्षित, एपीआई-सक्षम, डायनेमिक फुल-स्टैक प्रोसेसिंग सेंटर।",
    trackLabel: "आवेदन ट्रैक करें",
    loginLabel: "डैशबोर्ड लॉगिन",
    registerLabel: "सब-एजेंट ऑनबोर्ड करें",
    home: "होम",
    about: "हमारे बारे में",
    services: "सेवाएं पोर्टफोलियो",
    pricing: "मूल्य निर्धारण",
    contact: "संपर्क करें",
    faq: "अक्सर पूछे जाने वाले प्रश्न",
    downloads: "डाउनलोड",
    gallery: "गैलरी",
    phoneLabel: "अभी कॉल करें",
    whatsappLabel: "व्हाट्सएप चैट",
    searchPlaceholder: "सक्रिय सीएससी सेवाओं की खोज करें...",
    addressLabel: "मुख्य बाजार रोड, बिहार, भारत",
    footerText: "© 2026 अमर सीएससी सेंटर। सर्वाधिकार सुरक्षित। अधिकृत डिजिटल सेवा भागीदार।",
    whoAreWe: "अमर सीएससी सेंटर (amarprintservices.in) भारत का अग्रणी सुरक्षित प्रिंट और ई-गवर्नेंस भागीदार है। अमर सिंह के नेतृत्व में, हम मोबाइल ऐप, वेब और ऑफ़लाइन चैनलों के माध्यम से आधार पीवीसी, पैन सुधार, आयुष्मान कार्ड, पासपोर्ट फाइलिंग और व्यावसायिक जीएसटी पंजीकरण का सुरक्षित संपादन प्रदान करते हैं।",
    whyChooseUs: "सबसे तेज़ प्रोसेसिंग • 256-बिट एसएसएल सुरक्षित लॉकर • स्पीडपोस्ट प्रेषण अलर्ट • लाइव एसएमएस ट्रैकिंग कोड"
  }
};

const FAQS_DATA = [
  { q: "How long does PAN Correction PVC dispatch take?", a: "Standard PAN application corrections are verified by NSDL/UTI within 48 hours. The physical printed PVC card is shipped via registered SpeedPost and delivered within 5-7 business days." },
  { q: "Can I update Voter ID mobile link without Aadhaar OTP?", a: "Yes, our specialized CSC agent console has authorization to update Voter ID mobile number links via alternative offline biometric and photo-match validation." },
  { q: "How do Agents load their B2B wallets?", a: "B2B Agents, Distributors and Retailers can instantly scan the dynamic UPI QR code on their dashboard, complete the transfer via PhonePe, GPay, or Netbanking, and submit the 12-digit UTR transaction ID for immediate authorization." },
  { q: "Is my uploaded identity card safe in your database?", a: "Absolutely. All document lockers are stored under deep cryptographic SSL/TLS layers and are only accessed by certified officers to fulfill official government filings." }
];

export default function App() {
  const [activePage, setActivePage] = useState<"home" | "about" | "services" | "pricing" | "contact" | "faq" | "gallery" | "auth">("home");
  const [lang, setLang] = useState<"en" | "hi">("en");
  const [services, setServices] = useState<Service[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  
  // System Config State
  const [config, setConfig] = useState<SystemConfig>({
    themeColor: "royal-blue",
    language: "en",
    isMaintenance: false,
    allowRegistrations: true,
    whatsappNumber: "+919999999999",
    contactPhone: "+919999999999",
    contactEmail: "contact.amarprintservice@gmail.com",
    address: "Amar CSC Center, Main Market Road, Near Government School, Bihar, India",
    portalName: "ICT PAN ONLINE SEVA & SERVICES",
    marqueeText: "Welcome to ICT PAN ONLINE SEVA & SERVICES Portal! Fast track PAN card and eKYC services. Contact admin for wallet top-up and balance issues."
  });

  // Authentication states
  const [loggedInUser, setLoggedInUser] = useState<User | null>(null);
  const [authPhone, setAuthPhone] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authRole, setAuthRole] = useState<any>("customer");
  const [otpLogin, setOtpLogin] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [authOtp, setAuthOtp] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);
  
  // Registration
  const [isRegistering, setIsRegistering] = useState(false);
  const [regName, setRegName] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regRole, setRegRole] = useState<any>("customer");

  // Public Track state
  const [isTracking, setIsTracking] = useState(false);
  const [trackingQuery, setTrackingQuery] = useState("");

  // Contact form simulated state
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactMsg, setContactMsg] = useState("");
  const [contactSuccess, setContactSuccess] = useState<string | null>(null);

  // Load configuration and services
  useEffect(() => {
    fetch("/api/services")
      .then(res => res.json())
      .then(data => setServices(data))
      .catch(err => console.error("Error fetching services catalog:", err));

    fetch("/api/config")
      .then(res => res.json())
      .then(data => {
        setConfig(data);
        setLang(data.language);
      })
      .catch(err => console.error("Error fetching system configurations:", err));
  }, []);

  const getThemeClass = (color: string) => {
    switch (color) {
      case "royal-blue": return "theme-royal-blue";
      case "deep-emerald": return "theme-deep-emerald";
      case "warm-gold": return "theme-warm-gold";
      case "charcoal": return "theme-charcoal";
      default: return "theme-royal-blue";
    }
  };

  const getThemeColors = (color: string) => {
    switch (color) {
      case "royal-blue":
        return {
          primary: "bg-[#1E3A8A] hover:bg-[#152e73] text-white",
          text: "text-[#1E3A8A]",
          border: "border-[#1E3A8A]",
          light: "bg-blue-50 text-[#1E3A8A]",
          gradient: "from-[#1E3A8A] to-[#152e73]"
        };
      case "deep-emerald":
        return {
          primary: "bg-emerald-600 hover:bg-emerald-700",
          text: "text-emerald-600",
          border: "border-emerald-600",
          light: "bg-emerald-50 text-emerald-800",
          gradient: "from-emerald-600 to-emerald-800"
        };
      case "warm-gold":
        return {
          primary: "bg-amber-600 hover:bg-amber-700",
          text: "text-amber-600",
          border: "border-amber-600",
          light: "bg-amber-50 text-amber-800",
          gradient: "from-amber-600 to-amber-800"
        };
      case "charcoal":
        return {
          primary: "bg-slate-700 hover:bg-slate-800",
          text: "text-slate-700",
          border: "border-slate-700",
          light: "bg-slate-100 text-slate-800",
          gradient: "from-slate-700 to-slate-800"
        };
      default:
        return {
          primary: "bg-blue-600 hover:bg-blue-700",
          text: "text-blue-600",
          border: "border-blue-600",
          light: "bg-blue-50 text-blue-800",
          gradient: "from-blue-600 to-blue-800"
        };
    }
  };

  const tc = getThemeColors(config.themeColor);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    const payload = {
      phone: authPhone,
      password: authPassword,
      otpLogin,
      otp: authOtp
    };

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Authentication failure.");
      }

      if (otpLogin && !otpSent) {
        setOtpSent(true);
      } else {
        setLoggedInUser(data.user);
        setAuthPhone("");
        setAuthPassword("");
        setAuthOtp("");
        setOtpSent(false);
      }
    } catch (err: any) {
      setAuthError(err.message || "Something went wrong.");
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: regName,
          phone: regPhone,
          password: regPassword,
          role: regRole
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Registration failure.");
      }

      setLoggedInUser(data.user);
      setRegName("");
      setRegPhone("");
      setRegPassword("");
      setIsRegistering(false);
    } catch (err: any) {
      setAuthError(err.message || "Registration failed.");
    }
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setContactSuccess("Your support inquiry has been logged! Team Amar Singh will verify and alert you.");
    setContactName("");
    setContactPhone("");
    setContactMsg("");
  };

  const filteredServices = services.filter(service => {
    const term = searchQuery.toLowerCase();
    return service.name.toLowerCase().includes(term) || 
           service.category.toLowerCase().includes(term) ||
           (service.correctedName && service.correctedName.toLowerCase().includes(term));
  });

  const words = LOCALES[lang];

  return (
    <div className={`min-h-screen bg-[#F8FAFC] flex flex-col ${getThemeClass(config.themeColor)}`}>
      {/* HEADER NAVBAR */}
      {!loggedInUser ? (
        <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm px-4 py-2">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-3 cursor-pointer" onClick={() => { setActivePage("home"); setIsTracking(false); }}>
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-display font-black text-white bg-gradient-to-r ${tc.gradient}`}>
                  <span className="material-symbols-outlined text-[20px]">widgets</span>
                </div>
                <div>
                  <span className={`block text-xl font-bold font-display ${tc.text} leading-none tracking-tight`}>{config.portalName}</span>
                  <span className="text-[10px] text-slate-500 font-medium uppercase tracking-[0.1em]">Citizen Service Portal</span>
                </div>
              </div>

              {/* Desktop Navbar menu */}
              <nav className="hidden md:flex items-center gap-8 text-[13px] font-semibold text-slate-600">
                <button onClick={() => { setActivePage("home"); setIsTracking(false); }} className={`hover:${tc.text} transition ${activePage === "home" ? tc.text : ""}`}>{words.home}</button>
                <button onClick={() => { setActivePage("about"); setIsTracking(false); }} className={`hover:${tc.text} transition ${activePage === "about" ? tc.text : ""}`}>{words.about}</button>
                <button onClick={() => { setActivePage("services"); setIsTracking(false); }} className={`hover:${tc.text} transition ${activePage === "services" ? tc.text : ""}`}>{words.services}</button>
                <button onClick={() => { setActivePage("pricing"); setIsTracking(false); }} className={`hover:${tc.text} transition ${activePage === "pricing" ? tc.text : ""}`}>{words.pricing}</button>
                <button onClick={() => { setActivePage("gallery"); setIsTracking(false); }} className={`hover:${tc.text} transition ${activePage === "gallery" ? tc.text : ""}`}>{words.gallery}</button>
                <button onClick={() => { setActivePage("faq"); setIsTracking(false); }} className={`hover:${tc.text} transition ${activePage === "faq" ? tc.text : ""}`}>{words.faq}</button>
                <button onClick={() => { setActivePage("contact"); setIsTracking(false); }} className={`hover:${tc.text} transition ${activePage === "contact" ? tc.text : ""}`}>{words.contact}</button>
              </nav>

              {/* Multi-language and Auth controls */}
              <div className="flex items-center gap-3">
                <select
                  value={lang}
                  onChange={(e) => setLang(e.target.value as any)}
                  className="text-xs bg-slate-50 border border-slate-200 rounded px-2 py-1 focus:outline-none"
                >
                  <option value="en">English (EN)</option>
                  <option value="hi">हिंदी (HI)</option>
                </select>

                <div className="flex gap-3">
                  <button
                    onClick={() => { setIsRegistering(true); setActivePage("auth"); setIsTracking(false); }}
                    className={`px-5 py-2 text-[13px] font-bold ${tc.text} border ${tc.border} rounded-lg hover:bg-slate-50 transition`}
                  >
                    {words.registerLabel}
                  </button>
                  <button
                    onClick={() => { setIsRegistering(false); setActivePage("auth"); setIsTracking(false); }}
                    className={`px-5 py-2 text-[13px] font-bold text-white rounded-lg shadow-md transition ${tc.primary}`}
                  >
                    {words.loginLabel}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </header>
      ) : (
        /* DASHBOARD HEADER */
        <div className="flex flex-col">
          {/* Top Blue Bar */}
          <div className="bg-[#103a6a] text-white px-4 py-2 flex justify-between items-center text-sm">
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4" />
              <span>Call Now : <span className="font-bold">{config.contactPhone}</span></span>
            </div>
            <div className="flex items-center gap-2 bg-blue-900/50 px-3 py-1.5 rounded cursor-pointer border border-blue-800/50">
              <UserIcon className="w-4 h-4" />
              <span>Welcome <span className="font-bold">{loggedInUser.role === 'admin' ? 'Admin Panel' : loggedInUser.name}</span> !</span>
              <button onClick={() => setLoggedInUser(null)} className="ml-2 text-xs text-blue-200 hover:text-white underline">Logout</button>
            </div>
          </div>
          {/* Main White Nav */}
          <div className="bg-white border-b border-slate-200 shadow-sm px-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-4 max-w-[1400px] mx-auto w-full">
              {/* Logo area */}
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-[#0D8ABC] rounded-lg flex items-center justify-center p-2 text-white">
                  <CreditCard className="w-full h-full" />
                </div>
                <div>
                  <h1 className="font-bold text-xl text-[#0D8ABC] leading-tight">{config.portalName?.split(' ')[0]} {config.portalName?.split(' ')[1]} {config.portalName?.split(' ')[2]}</h1>
                  <h2 className="font-bold text-sm text-[#0D8ABC] leading-tight">{config.portalName?.split(' ').slice(3).join(' ')}</h2>
                </div>
              </div>
              
              {/* Dashboard Nav Links */}
              <nav className="flex flex-wrap items-center gap-1">
                <button className="px-4 py-2 text-sm font-semibold text-white bg-[#0D8ABC] rounded">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px]">home</span>
                    Home
                  </div>
                </button>
                <button className="px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 rounded transition">
                  New PAN Card
                </button>
                <button className="px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 rounded transition">
                  Update PAN Card
                </button>
                <button className="px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 rounded transition">
                  EKYC PAN
                </button>
                <button className="px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 rounded transition">
                  Wallet
                </button>
                <button className="px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 rounded transition">
                  Settings
                </button>
              </nav>
            </div>
          </div>
          
          {/* Marquee Banner */}
          <div className="bg-[#103a6a] text-white py-1.5 px-4 overflow-hidden flex items-center shadow-md">
            <div className="bg-red-600 text-white text-xs font-bold px-3 py-1 mr-4 rounded shadow-sm z-10 shrink-0 whitespace-nowrap">
              UPDATE NEWS
            </div>
            <div className="relative flex-1 overflow-hidden h-5">
              <div className="absolute whitespace-nowrap text-xs font-medium animate-[marquee_20s_linear_infinite] flex items-center h-full">
                {config.marqueeText}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECURE SYSTEM ALERT IF UNDER MAINTENANCE */}
      {config.isMaintenance && !loggedInUser && (
        <div className="bg-amber-600 text-white text-xs text-center font-bold py-2 px-4 shadow-sm">
          ⚠️ System Admin Notification: Amar CSC Portal is undergoing database schema optimizations. Active balance filing is paused temporarily.
        </div>
      )}

      {/* MAIN APPLICATION WORKSPACE CONTAINER */}
      <main className="flex-1 w-full">
        
        {/* Render Live Application status Tracker if triggered */}
        {isTracking ? (
          <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
            <ApplicationTracker 
              initialSearchQuery={trackingQuery} 
              onCloseSearch={() => setIsTracking(false)}
            />
          </div>
        ) : loggedInUser ? (
          /* MULTI-ROLE LOGGED IN WORKSPACE DASHBOARD ROUTER */
          <div className="animate-fade-in space-y-6 max-w-[1400px] mx-auto w-full px-4 py-8">
            {/* 4 Colored Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Card 1 - New PAN */}
              <div className="bg-[#FF9800] rounded overflow-hidden text-white flex flex-col shadow">
                <div className="p-4 flex-1 flex justify-between items-start">
                  <div>
                    <h3 className="text-3xl font-bold mb-1">4</h3>
                    <p className="text-sm font-medium opacity-90">New PAN Card</p>
                  </div>
                  <div className="opacity-40">
                    <FileText className="w-12 h-12" />
                  </div>
                </div>
                <button className="bg-black/10 py-1.5 px-4 text-xs font-semibold flex justify-center items-center gap-1 hover:bg-black/20 transition">
                  More info <ArrowRight className="w-3 h-3" />
                </button>
              </div>

              {/* Card 2 - Update PAN */}
              <div className="bg-[#00BCD4] rounded overflow-hidden text-white flex flex-col shadow">
                <div className="p-4 flex-1 flex justify-between items-start">
                  <div>
                    <h3 className="text-3xl font-bold mb-1">0</h3>
                    <p className="text-sm font-medium opacity-90">Update PAN Card</p>
                  </div>
                  <div className="opacity-40">
                    <RefreshCw className="w-12 h-12" />
                  </div>
                </div>
                <button className="bg-black/10 py-1.5 px-4 text-xs font-semibold flex justify-center items-center gap-1 hover:bg-black/20 transition">
                  More info <ArrowRight className="w-3 h-3" />
                </button>
              </div>

              {/* Card 3 - EKYC PAN */}
              <div className="bg-[#03A9F4] rounded overflow-hidden text-white flex flex-col shadow">
                <div className="p-4 flex-1 flex justify-between items-start">
                  <div>
                    <h3 className="text-3xl font-bold mb-1">2</h3>
                    <p className="text-sm font-medium opacity-90">EKYC PAN Card</p>
                  </div>
                  <div className="opacity-40">
                    <CheckCircle className="w-12 h-12" />
                  </div>
                </div>
                <button className="bg-black/10 py-1.5 px-4 text-xs font-semibold flex justify-center items-center gap-1 hover:bg-black/20 transition">
                  More info <ArrowRight className="w-3 h-3" />
                </button>
              </div>

              {/* Card 4 - Wallet Balance */}
              <div className="bg-[#F44336] rounded overflow-hidden text-white flex flex-col shadow">
                <div className="p-4 flex-1 flex justify-between items-start">
                  <div>
                    <h3 className="text-3xl font-bold mb-1">1689</h3>
                    <p className="text-sm font-medium opacity-90">Available Balances</p>
                  </div>
                  <div className="opacity-40">
                    <Wallet className="w-12 h-12" />
                  </div>
                </div>
                <button className="bg-black/10 py-1.5 px-4 text-xs font-semibold flex justify-center items-center gap-1 hover:bg-black/20 transition">
                  More info <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>

            {loggedInUser.role === "admin" ? (
              <AdminDashboard 
                user={loggedInUser}
                services={services}
                onLogout={() => setLoggedInUser(null)}
                systemConfig={config}
                onConfigChange={(c) => setConfig(c)}
                onServicesChange={(s) => setServices(s)}
              />
            ) : ["agent", "distributor", "retailer"].includes(loggedInUser.role) ? (
              <AgentDashboard 
                user={loggedInUser}
                services={services}
                onLogout={() => setLoggedInUser(null)}
                systemConfig={config}
              />
            ) : (
              <CustomerDashboard 
                user={loggedInUser}
                services={services}
                onLogout={() => setLoggedInUser(null)}
                systemConfig={config}
              />
            )}
          </div>
        ) : (
          /* PUBLIC PAGES ROUTING */
          <div className="space-y-12">
            
            {/* PUBLIC HOME PAGE */}
            {activePage === "home" && (
              <div className="animate-fade-in">
                {/* HERO BANNER SECTION */}
                <div className="bg-[#0a1027] pt-16 pb-24 text-white relative overflow-hidden shadow-2xl border-b border-slate-800">
                  <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between">
                    {/* Left Content */}
                    <div className="md:w-1/2 z-10 space-y-6">
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 text-[11px] font-semibold text-emerald-300 border border-white/10">
                        <div className="w-2 h-2 rounded-full bg-emerald-400"></div> Paperless e-KYC PAN service
                      </div>
                      
                      <h1 className="text-4xl md:text-5xl lg:text-[54px] font-bold leading-[1.1] tracking-tight">
                        Apply PAN instantly, <br />
                        <span className="text-[#64dfdf]">100% paperless</span> & offline.
                      </h1>
                      
                      <p className="text-slate-300 text-[15px] max-w-lg leading-relaxed font-medium">
                        Instant new PAN and minor PAN application through Aadhaar OTP & biometric — built for retailers, distributors and white-label partners across India.
                      </p>
                      
                      <div className="flex gap-4 pt-4">
                        <button 
                          onClick={() => { setIsRegistering(true); setActivePage("auth"); }}
                          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-full flex items-center gap-2 transition"
                        >
                          Register now <ArrowRight className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => { setIsRegistering(false); setActivePage("auth"); }}
                          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-full flex items-center gap-2 transition"
                        >
                          Login <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-3 gap-6 pt-8 text-sm">
                        <div>
                          <h4 className="font-bold text-white text-lg">Instant</h4>
                          <p className="text-slate-400 text-xs mt-1">ID activation</p>
                        </div>
                        <div>
                          <h4 className="font-bold text-white text-lg">OTP & Bio</h4>
                          <p className="text-slate-400 text-xs mt-1">e-KYC verification</p>
                        </div>
                        <div>
                          <h4 className="font-bold text-white text-lg">24/7</h4>
                          <p className="text-slate-400 text-xs mt-1">Online billing</p>
                        </div>
                      </div>
                    </div>

                    {/* Right Mockup Graphic */}
                    <div className="md:w-[45%] mt-12 md:mt-0 relative z-10 flex justify-center lg:justify-end">
                      <div className="w-[380px] h-[240px] bg-[#111936] rounded-2xl border border-white/10 shadow-2xl p-6 relative overflow-hidden backdrop-blur-sm">
                        {/* Approved Badge */}
                        <div className="absolute -top-4 -right-4 w-24 h-24 border-2 border-emerald-400 rounded-full flex flex-col items-center justify-center bg-[#0a1027] transform rotate-12 shadow-[0_0_15px_rgba(52,211,153,0.3)] z-20">
                          <Check className="w-6 h-6 text-emerald-400" />
                          <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest mt-1">Approved</span>
                        </div>
                        
                        <div className="w-8 h-8 bg-blue-500/20 rounded mb-6 flex items-center justify-center">
                          <CreditCard className="w-4 h-4 text-blue-400" />
                        </div>
                        
                        <div className="space-y-4">
                          <div>
                            <p className="text-[10px] text-slate-400 font-semibold mb-1">PAN</p>
                            <p className="text-xl text-white font-mono tracking-[0.2em] uppercase">ABCDE1234F</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-slate-400 font-semibold mb-1">NAME</p>
                            <p className="text-sm text-white">Your Customer</p>
                          </div>
                        </div>

                        <div className="absolute bottom-6 right-6 flex gap-6 text-[10px] font-semibold text-white">
                          <span>Aadhaar OTP</span>
                          <span>Paperless</span>
                        </div>
                      </div>

                      {/* Floating Toast Notification */}
                      <div className="absolute -bottom-6 -left-8 bg-white text-slate-800 p-4 rounded-2xl shadow-xl flex items-center gap-4 z-30 animate-bounce">
                        <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center shrink-0">
                          <Check className="w-5 h-5 text-emerald-600" />
                        </div>
                        <div>
                          <h4 className="font-bold text-sm">PAN approved</h4>
                          <p className="text-[11px] text-slate-500">Fastly</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Background Glows */}
                  <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3"></div>
                  <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/3"></div>
                </div>

                <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12 space-y-12">
                  {/* SERVICES SHORT PORTFOLIO CATALOG */}
                <div className="space-y-6">
                  <div className="text-center max-w-xl mx-auto space-y-2">
                    <h2 className="text-2xl font-black font-display text-slate-800 uppercase">{words.services}</h2>
                    <p className="text-xs text-slate-500">{words.whyChooseUs}</p>
                    <div className="relative max-w-md mx-auto mt-4">
                      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        placeholder={words.searchPlaceholder}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-slate-200 bg-white rounded-xl text-xs focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {filteredServices.slice(0, 9).map(service => (
                      <div key={service.id} className={`bg-white border border-slate-200 hover:${tc.border} transition-all cursor-pointer group rounded-xl p-5 flex flex-col justify-between`}>
                        <div>
                          <div className={`w-10 h-10 ${tc.light} rounded-lg flex items-center justify-center mb-3 group-hover:${tc.primary} group-hover:text-white transition-colors`}>
                            <FileText className="w-5 h-5" />
                          </div>
                          <span className="text-[9px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded uppercase mb-2 inline-block">
                            {service.category}
                          </span>
                          <h4 className="font-bold text-slate-800 text-sm mb-1">{service.correctedName || service.name}</h4>
                          <p className="text-[11px] text-slate-500 leading-relaxed line-clamp-3">{service.description}</p>
                        </div>

                        <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between items-center text-xs">
                          <span className="font-bold text-slate-700">₹{service.basePrice}</span>
                          <button
                            onClick={() => { setActivePage("auth"); }}
                            className={`font-bold text-[10px] uppercase flex items-center gap-1 ${tc.text} hover:underline`}
                          >
                            Book File <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="text-center pt-4">
                    <button
                      onClick={() => setActivePage("services")}
                      className={`text-xs font-bold border rounded-xl px-6 py-2.5 transition ${tc.border} ${tc.text} hover:bg-slate-50`}
                    >
                      Explore Complete Catalog ({services.length} services)
                    </button>
                  </div>
                </div>

                {/* ABOUT CSC SECTION */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center bg-white p-8 rounded-2xl border border-slate-100 shadow-sm">
                  <div className="space-y-4">
                    <h2 className="text-2xl font-black font-display text-slate-800 uppercase">Aadhaar PVC Card & Print Specialists</h2>
                    <p className="text-xs text-slate-500 leading-relaxed font-medium">
                      {words.whoAreWe}
                    </p>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      At <strong>amarprintservices.in</strong>, we provide immediate, pre-verified PVC card orders for Aadhaar and PAN credentials, and comprehensive travel, finance, and welfare schemes registration portals.
                    </p>
                  </div>
                  <div className="bg-slate-50 p-6 rounded-xl space-y-4 border border-slate-200">
                    <h3 className="font-bold text-slate-800 text-sm">System Capabilities Summary:</h3>
                    <div className="space-y-2 text-xs">
                      <div className="flex gap-2">
                        <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>Instant dynamic QR UPI integrations for fast balance credits</span>
                      </div>
                      <div className="flex gap-2">
                        <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>Secure digital lockers storing Aadhaar & PAN under high SSL levels</span>
                      </div>
                      <div className="flex gap-2">
                        <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>Direct support helpdesks answered by Owner Amar Singh</span>
                      </div>
                    </div>
                  </div>
                </div>
                </div>
              </div>
            )}

            {/* PUBLIC SERVICES PAGE */}
            {activePage === "services" && (
              <div className="space-y-6 animate-fade-in">
                <div className="text-center max-w-xl mx-auto space-y-2">
                  <h2 className="text-2xl font-black font-display text-slate-800 uppercase">Expansive Service Catalog</h2>
                  <p className="text-xs text-slate-400">Search over 25+ dynamic government and identity printing services.</p>
                  <div className="relative max-w-md mx-auto mt-4">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search card orders, correction services..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 border border-slate-200 bg-white rounded-xl text-xs focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {filteredServices.map(service => (
                    <div key={service.id} className="bg-white border border-slate-150 rounded-2xl p-5 hover:shadow-md transition duration-150 flex flex-col justify-between">
                      <div>
                        <span className="text-[9px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded uppercase">
                          {service.category}
                        </span>
                        <h3 className="font-bold text-slate-800 text-sm mt-2">{service.correctedName || service.name}</h3>
                        <p className="text-xs text-slate-400 mt-1.5 line-clamp-3">{service.description}</p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between items-center text-xs">
                        <span className="font-bold text-slate-700">₹{service.basePrice}</span>
                        <button
                          onClick={() => { setActivePage("auth"); }}
                          className={`font-semibold text-[10px] uppercase flex items-center gap-1 ${tc.text}`}
                        >
                          Book File <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* PUBLIC ABOUT PAGE */}
            {activePage === "about" && (
              <div className="max-w-3xl mx-auto bg-white rounded-2xl border border-slate-100 p-8 shadow-sm space-y-6 animate-fade-in">
                <h2 className="text-3xl font-black font-display text-slate-900 uppercase">About Amar CSC Center</h2>
                <p className="text-sm text-slate-600 leading-relaxed font-medium">
                  {words.whoAreWe}
                </p>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Our system supports an expansive network of Agents, Retailers, and Distributors. They use pre-funded wallets to execute high-volume identity dispatches, earn dynamic commission margins, and offer simplified e-Governance help directly to rural and urban citizens alike.
                </p>

                <div className="border-t border-slate-100 pt-6">
                  <h3 className="font-bold text-slate-800 text-base font-display">Core Infrastructure Architecture</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                      <span className="font-bold text-slate-800 text-sm block">SSL Encryption</span>
                      <span className="text-xs text-slate-400 block mt-1">Continuous secure digital uploads.</span>
                    </div>
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                      <span className="font-bold text-slate-800 text-sm block">Live Status Logs</span>
                      <span className="text-xs text-slate-400 block mt-1">Real-time status dispatch step tracking.</span>
                    </div>
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                      <span className="font-bold text-slate-800 text-sm block">B2B Commission</span>
                      <span className="text-xs text-slate-400 block mt-1">Automatic wallet credit adjustments.</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* PUBLIC PRICING PAGE */}
            {activePage === "pricing" && (
              <div className="space-y-6 animate-fade-in">
                <div className="text-center max-w-xl mx-auto">
                  <h2 className="text-2xl font-black font-display text-slate-800 uppercase">Affordable Dynamic Pricing</h2>
                  <p className="text-xs text-slate-400 mt-1">Transparent public and agent pricing tiers for standard filings.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                  {/* Public pricing */}
                  <div className="bg-white p-6 rounded-2xl border border-slate-150 shadow-sm space-y-4">
                    <h3 className="font-bold text-slate-800 text-lg">Public Service Fees</h3>
                    <div className="divide-y divide-slate-100 text-xs">
                      <div className="py-2.5 flex justify-between">
                        <span>Aadhaar PVC Card Order</span>
                        <strong>₹50.00</strong>
                      </div>
                      <div className="py-2.5 flex justify-between">
                        <span>New PAN Card Application</span>
                        <strong>₹107.00</strong>
                      </div>
                      <div className="py-2.5 flex justify-between">
                        <span>PAN Correction / PVC Reissue</span>
                        <strong>₹110.00</strong>
                      </div>
                      <div className="py-2.5 flex justify-between">
                        <span>Ayushman Golden Cover Card</span>
                        <strong>₹50.00</strong>
                      </div>
                    </div>
                  </div>

                  {/* Agent pricing */}
                  <div className="bg-white p-6 rounded-2xl border border-emerald-200 bg-emerald-50/10 shadow-sm space-y-4">
                    <h3 className="font-bold text-emerald-800 text-lg flex justify-between items-center">
                      Agent / Retailer Commissions
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded uppercase font-bold">Earn Rebates</span>
                    </h3>
                    <div className="divide-y divide-slate-100 text-xs text-slate-700">
                      <div className="py-2.5 flex justify-between">
                        <span>Passport Registration</span>
                        <strong className="text-emerald-700">₹120 commission</strong>
                      </div>
                      <div className="py-2.5 flex justify-between">
                        <span>GST Business Registration</span>
                        <strong className="text-emerald-700">₹150 commission</strong>
                      </div>
                      <div className="py-2.5 flex justify-between">
                        <span>Driving Licence Learning</span>
                        <strong className="text-emerald-700">₹40 commission</strong>
                      </div>
                      <div className="py-2.5 flex justify-between">
                        <span>ITR Income Tax Filing</span>
                        <strong className="text-emerald-700">₹100 commission</strong>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* GALLERY PAGE */}
            {activePage === "gallery" && (
              <div className="space-y-6 animate-fade-in">
                <div className="text-center max-w-xl mx-auto">
                  <h2 className="text-2xl font-black font-display text-slate-800 uppercase">Center Print Showcase</h2>
                  <p className="text-xs text-slate-400 mt-1">High-quality mockups of physical items processed at Amar CSC Center.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  <div className="bg-white rounded-2xl border border-slate-150 p-4 space-y-3">
                    <div className="aspect-video bg-blue-100 rounded-xl flex items-center justify-center font-display font-black text-blue-600">
                      PREMIUM Aadhaar PVC Card
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm">Smart PVC Aadhaar Print</h4>
                      <p className="text-xs text-slate-400">High-gloss, weather-proof plastic print with crisp microtext layers.</p>
                    </div>
                  </div>
                  <div className="bg-white rounded-2xl border border-slate-150 p-4 space-y-3">
                    <div className="aspect-video bg-emerald-100 rounded-xl flex items-center justify-center font-display font-black text-emerald-600">
                      NSDL PAN PVC Card
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm">NSDL / UTI PAN Cards</h4>
                      <p className="text-xs text-slate-400">Secure printed permanent account cards with readable barcode scanners.</p>
                    </div>
                  </div>
                  <div className="bg-white rounded-2xl border border-slate-150 p-4 space-y-3">
                    <div className="aspect-video bg-amber-100 rounded-xl flex items-center justify-center font-display font-black text-amber-600">
                      Ayushman Golden Card
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm">PMJAY Cover cards</h4>
                      <p className="text-xs text-slate-400">Laminated multi-family health entitlement cards printed directly.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* PUBLIC FAQ PAGE */}
            {activePage === "faq" && (
              <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
                <div className="text-center">
                  <h2 className="text-2xl font-black font-display text-slate-800 uppercase">Frequently Answered Queries</h2>
                  <p className="text-xs text-slate-400 mt-1">Quick information on wallet recharges, PVC dispatch speeds and verification.</p>
                </div>

                <div className="space-y-4">
                  {FAQS_DATA.map((faq, idx) => (
                    <div key={idx} className="bg-white p-5 rounded-2xl border border-slate-150 shadow-sm space-y-2">
                      <h3 className="font-bold text-slate-800 text-sm flex items-start gap-2">
                        <HelpCircle className="w-4.5 h-4.5 text-blue-600 shrink-0 mt-0.5" />
                        {faq.q}
                      </h3>
                      <p className="text-xs text-slate-500 leading-relaxed pl-6">
                        {faq.a}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* PUBLIC CONTACT PAGE */}
            {activePage === "contact" && (
              <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start animate-fade-in">
                {/* Contact Form */}
                <div className="md:col-span-5 bg-white p-6 rounded-2xl border border-slate-150 shadow-sm space-y-4">
                  <h2 className="text-xl font-bold font-display text-slate-800 uppercase">Send Instant Alert</h2>
                  
                  <form onSubmit={handleContactSubmit} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Your Name:</label>
                      <input
                        type="text"
                        required
                        placeholder="Amar"
                        value={contactName}
                        onChange={(e) => setContactName(e.target.value)}
                        className="w-full text-xs border border-slate-200 rounded-lg p-2.5 bg-slate-50 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Mobile Contact:</label>
                      <input
                        type="text"
                        required
                        maxLength={10}
                        placeholder="9999999999"
                        value={contactPhone}
                        onChange={(e) => setContactPhone(e.target.value)}
                        className="w-full text-xs border border-slate-200 rounded-lg p-2.5 bg-slate-50 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Your Inquiry Message:</label>
                      <textarea
                        rows={3}
                        required
                        placeholder="Type details about card order or status delay..."
                        value={contactMsg}
                        onChange={(e) => setContactMsg(e.target.value)}
                        className="w-full text-xs border border-slate-200 rounded-lg p-2.5 bg-slate-50 focus:outline-none"
                      />
                    </div>

                    {contactSuccess && (
                      <p className="text-xs text-emerald-700 font-semibold bg-emerald-50 p-2.5 rounded">
                        {contactSuccess}
                      </p>
                    )}

                    <button
                      type="submit"
                      className={`w-full text-white font-bold text-xs py-2.5 rounded-xl transition ${tc.primary}`}
                    >
                      Transmit Support Query
                    </button>
                  </form>
                </div>

                {/* Contact Coordinates & Google Maps */}
                <div className="md:col-span-7 bg-white p-6 rounded-2xl border border-slate-150 shadow-sm space-y-6">
                  <h2 className="text-xl font-bold font-display text-slate-800 uppercase">Center Coordinates</h2>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-600">
                    <div className="flex gap-2 items-start">
                      <MapPin className="w-5 h-5 text-blue-600 shrink-0" />
                      <div>
                        <strong className="block text-slate-800 font-bold">Physical Address:</strong>
                        <span>{config.address}</span>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex gap-2 items-center">
                        <Phone className="w-4 h-4 text-blue-600" />
                        <span>Phone: {config.contactPhone}</span>
                      </div>
                      <div className="flex gap-2 items-center">
                        <Mail className="w-4 h-4 text-blue-600" />
                        <span>Email: {config.contactEmail}</span>
                      </div>
                    </div>
                  </div>

                  {/* Google Maps Embed iframe */}
                  <div className="border border-slate-200 rounded-xl overflow-hidden aspect-video relative">
                    <iframe 
                      title="Amar CSC Center Google Map location"
                      src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d115132.86872583857!2d85.07300267746599!3d25.608022416719574!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39f29937c52d4f05%3A0x83158c9685aeec14!2sPatna%2C%20Bihar!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin" 
                      width="100%" 
                      height="100%" 
                      style={{ border: 0 }} 
                      allowFullScreen 
                      loading="lazy" 
                      referrerPolicy="no-referrer-when-downgrade"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* SECURE AUTHENTICATION LOGIN / SIGNUP VIEW */}
            {activePage === "auth" && (
              <div className="max-w-4xl mx-auto animate-fade-in mt-12 mb-12">
                {isRegistering ? (
                  /* REGISTER CONSOLE FORM */
                  <div className="flex flex-col md:flex-row gap-8">
                    {/* Left Info Panel */}
                    <div className="md:w-[35%]">
                      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-6 sticky top-24">
                        <div>
                          <h3 className="text-lg font-bold text-slate-800">New Partner Registration</h3>
                          <p className="text-xs text-slate-500 mt-2 leading-relaxed">Join our authorised network for paperless PAN application and eKYC services.</p>
                        </div>
                        
                        <div className="space-y-4">
                          <div className="flex gap-3 items-start text-xs text-slate-600">
                            <span className="w-5 h-5 rounded bg-blue-50 text-blue-600 flex items-center justify-center font-bold shrink-0 text-[10px]">1</span>
                            <span className="pt-0.5 font-medium">EKYC PAN & Offline PAN card processing</span>
                          </div>
                          <div className="flex gap-3 items-start text-xs text-slate-600">
                            <span className="w-5 h-5 rounded bg-blue-50 text-blue-600 flex items-center justify-center font-bold shrink-0 text-[10px]">2</span>
                            <span className="pt-0.5 font-medium">Biometric & OTP based eKYC</span>
                          </div>
                          <div className="flex gap-3 items-start text-xs text-slate-600">
                            <span className="w-5 h-5 rounded bg-blue-50 text-blue-600 flex items-center justify-center font-bold shrink-0 text-[10px]">3</span>
                            <span className="pt-0.5 font-medium">Retailer, Distributor & Super Distributor plans</span>
                          </div>
                          <div className="flex gap-3 items-start text-xs text-slate-600">
                            <span className="w-5 h-5 rounded bg-blue-50 text-blue-600 flex items-center justify-center font-bold shrink-0 text-[10px]">4</span>
                            <span className="pt-0.5 font-medium">Secure email-verified onboarding</span>
                          </div>
                        </div>

                        <div className="pt-4 border-t border-slate-100">
                          <h4 className="text-xs font-bold text-slate-800">Need assistance?</h4>
                          <p className="text-[11px] text-slate-500 mt-1">Complete the registration form and verify your email to activate your account.</p>
                        </div>
                      </div>
                    </div>

                    {/* Right Form Panel */}
                    <div className="md:w-[65%] bg-white rounded-xl shadow-sm border border-slate-200 p-8">
                      <div className="mb-6 border-b border-slate-100 pb-4">
                        <h2 className="text-xl font-bold text-slate-800">Create New Account</h2>
                        <p className="text-xs text-slate-500 mt-1">All fields marked with an asterisk (*) are required.</p>
                      </div>

                      <form onSubmit={handleRegister} className="space-y-8">
                        {authError && (
                          <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg border border-red-100 font-semibold">
                            {authError}
                          </div>
                        )}
                        
                        {/* PERSONAL DETAILS */}
                        <div className="space-y-4">
                          <h4 className="text-[11px] font-bold text-blue-600 tracking-wider uppercase">Personal Details</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name <span className="text-red-500">*</span></label>
                              <input type="text" required placeholder="Enter full name" value={regName} onChange={(e) => setRegName(e.target.value)} className="w-full text-sm border border-slate-200 rounded p-2.5 focus:outline-none focus:border-blue-500 transition" />
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-slate-700 mb-1">Password <span className="text-red-500">*</span></label>
                              <input type="password" required placeholder="Create a password" value={regPassword} onChange={(e) => setRegPassword(e.target.value)} className="w-full text-sm border border-slate-200 rounded p-2.5 focus:outline-none focus:border-blue-500 transition" />
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-slate-700 mb-1">Mobile Number <span className="text-red-500">*</span></label>
                              <input type="text" required maxLength={10} placeholder="Unique 10-digit mobile" value={regPhone} onChange={(e) => setRegPhone(e.target.value)} className="w-full text-sm border border-slate-200 rounded p-2.5 focus:outline-none focus:border-blue-500 transition" />
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address <span className="text-red-500">*</span></label>
                              <div className="flex gap-2">
                                <input type="email" placeholder="Unique email address" className="flex-1 text-sm border border-slate-200 rounded p-2.5 focus:outline-none focus:border-blue-500 transition" />
                                <button type="button" className="bg-blue-600 text-white px-4 rounded text-xs font-bold hover:bg-blue-700 transition shrink-0">Send OTP</button>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* ADDRESS & BUSINESS */}
                        <div className="space-y-4">
                          <h4 className="text-[11px] font-bold text-blue-600 tracking-wider uppercase">Address & Business</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs font-semibold text-slate-700 mb-1">Address <span className="text-red-500">*</span></label>
                              <input type="text" placeholder="District name" className="w-full text-sm border border-slate-200 rounded p-2.5 focus:outline-none focus:border-blue-500 transition" />
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-slate-700 mb-1">PIN Code <span className="text-red-500">*</span></label>
                              <input type="text" placeholder="6-digit PIN" className="w-full text-sm border border-slate-200 rounded p-2.5 focus:outline-none focus:border-blue-500 transition" />
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-slate-700 mb-1">State <span className="text-red-500">*</span></label>
                              <select className="w-full text-sm border border-slate-200 rounded p-2.5 focus:outline-none focus:border-blue-500 transition text-slate-500">
                                <option>-- Select State --</option>
                                <option>Bihar</option>
                                <option>Delhi</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-slate-700 mb-1">Company / Shop Name <span className="text-red-500">*</span></label>
                              <input type="text" placeholder="Company or shop name" className="w-full text-sm border border-slate-200 rounded p-2.5 focus:outline-none focus:border-blue-500 transition" />
                            </div>
                          </div>
                        </div>

                        {/* KYC DOCUMENTS */}
                        <div className="space-y-4">
                          <h4 className="text-[11px] font-bold text-blue-600 tracking-wider uppercase">KYC Documents</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs font-semibold text-slate-700 mb-1">Aadhar (UID) <span className="text-red-500">*</span></label>
                              <input type="text" placeholder="12-digit UID number" className="w-full text-sm border border-slate-200 rounded p-2.5 focus:outline-none focus:border-blue-500 transition" />
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-slate-700 mb-1">PAN Number <span className="text-red-500">*</span></label>
                              <input type="text" placeholder="Unique PAN number" className="w-full text-sm border border-slate-200 rounded p-2.5 focus:outline-none focus:border-blue-500 transition" />
                            </div>
                          </div>
                        </div>

                        {/* ACCOUNT PLAN */}
                        <div className="space-y-4">
                          <h4 className="text-[11px] font-bold text-blue-600 tracking-wider uppercase">Account Plan & Payment</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                            <div>
                              <label className="block text-xs font-semibold text-slate-700 mb-1">Account Type <span className="text-red-500">*</span></label>
                              <select 
                                value={regRole} 
                                onChange={(e) => setRegRole(e.target.value as any)}
                                className="w-full text-sm border border-slate-200 rounded p-2.5 focus:outline-none focus:border-blue-500 transition text-slate-700"
                              >
                                <option value="customer">Retailer</option>
                                <option value="agent">Distributor</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-slate-700 mb-1">Registration Charges</label>
                              <div className="w-full text-sm border border-slate-200 bg-slate-50 rounded p-2.5 font-bold text-slate-800 text-center">
                                Charges Rs.0
                              </div>
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-slate-700 mb-1">Payment Method <span className="text-red-500">*</span></label>
                              <div className="w-full text-sm border border-slate-200 bg-slate-50 rounded p-2.5 text-slate-500">
                                UPI Payments
                              </div>
                            </div>
                            <div>
                              <button type="submit" className="w-full bg-[#829ebd] hover:bg-[#6b85a3] text-white font-bold py-2.5 rounded transition shadow-sm">
                                Pay & Register
                              </button>
                            </div>
                          </div>
                        </div>

                        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                          <span className="text-xs text-slate-500">Already registered?</span>
                          <button type="button" onClick={() => { setIsRegistering(false); setAuthError(null); }} className="text-sm font-bold text-blue-600 hover:underline">
                            Sign in to your account
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                ) : (
                  /* LOGIN CONSOLE FORM (Match screenshot 3) */
                  <div className="max-w-[800px] mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row border border-slate-100">
                    {/* Left Dark Panel */}
                    <div className="md:w-[45%] bg-[#103a6a] p-10 flex flex-col items-center justify-center text-center relative overflow-hidden">
                      <div className="w-24 h-24 bg-white rounded-2xl p-2 mb-8 z-10 shadow-lg flex items-center justify-center text-blue-600">
                        <CreditCard className="w-12 h-12" />
                      </div>
                      
                      <h3 className="text-white text-lg font-medium mb-2 z-10">Welcome To</h3>
                      <h2 className="text-white text-[26px] font-bold leading-tight mb-6 z-10">
                        {config.portalName?.split(' ').slice(0, 3).join(' ')}<br />{config.portalName?.split(' ').slice(3).join(' ')}
                      </h2>
                      <p className="text-blue-100 text-[13px] leading-relaxed z-10 max-w-[200px] opacity-90">
                        Secure access to your business portal. Sign in to manage your account with confidence.
                      </p>

                      {/* Abstract background graphics */}
                      <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white via-transparent to-transparent pointer-events-none"></div>
                      <div className="absolute -bottom-24 -left-24 w-64 h-64 border-[40px] border-blue-500/10 rounded-full pointer-events-none"></div>
                      <div className="absolute -bottom-12 -left-12 w-32 h-32 border-[20px] border-blue-400/10 rounded-full pointer-events-none"></div>
                    </div>
                    
                    {/* Right Login Panel */}
                    <div className="md:w-[55%] p-10 bg-white flex flex-col justify-center relative">
                      <h2 className="text-[28px] font-bold text-slate-800 mb-2">Sign In</h2>
                      <p className="text-slate-500 text-sm mb-8">Enter your credentials to access your account.</p>

                      <form onSubmit={handleLogin} className="space-y-6">
                        {authError && (
                          <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg border border-red-100 font-semibold mb-4">
                            {authError}
                          </div>
                        )}
                        
                        <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-1.5">Username or Mobile No.</label>
                          <input
                            type="text"
                            required
                            maxLength={10}
                            value={authPhone}
                            onChange={(e) => setAuthPhone(e.target.value)}
                            className="w-full text-sm border border-transparent bg-blue-50 focus:bg-white focus:border-blue-500 rounded-lg p-3 transition focus:outline-none focus:ring-1 focus:ring-blue-500"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-1.5">Password</label>
                          <input
                            type="password"
                            required
                            value={authPassword}
                            onChange={(e) => setAuthPassword(e.target.value)}
                            className="w-full text-sm border border-transparent bg-blue-50 focus:bg-white focus:border-blue-500 rounded-lg p-3 transition focus:outline-none focus:ring-1 focus:ring-blue-500"
                          />
                        </div>

                        <div className="flex items-center justify-between mt-2">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                            <span className="text-[13px] text-slate-500 font-medium">Show password</span>
                          </label>
                          <button type="button" className="text-[13px] text-blue-600 hover:underline font-medium">Forgot Password?</button>
                        </div>

                        <button type="submit" className="w-full bg-[#103a6a] hover:bg-[#0c2a4d] text-white font-medium py-3 rounded-lg mt-6 shadow-md shadow-blue-900/20 transition flex justify-center items-center gap-2">
                          Sign In <ArrowRight className="w-4 h-4" />
                        </button>

                        <div className="pt-4 flex items-center justify-between border-t border-slate-100">
                          <button type="button" onClick={() => { setIsRegistering(true); setAuthError(null); }} className="text-[13px] text-blue-600 hover:underline font-medium">
                            SignUp New Account?
                          </button>
                        </div>
                        
                        {/* Testing Seeds */}
                        <div className="mt-8 bg-slate-50 p-3 rounded border border-slate-100 text-[10px] text-slate-500">
                           Admin: 9999999999 / admin123 <br/>
                           Agent: 8888888888 / agent123
                        </div>
                      </form>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </main>

      {/* FOOTER */}
      <footer className="bg-slate-900 text-slate-400 px-8 py-4 flex flex-col md:flex-row justify-between items-center text-[11px] mt-12 border-t border-slate-800">
        <div>© 2026 {config.portalName}. All Rights Reserved. Authorized Digital Seva Partner. ISO 9001:2015 Certified.</div>
        <div className="flex gap-6 mt-4 md:mt-0">
          <span className="flex items-center gap-1"><span className="w-2 h-2 bg-emerald-500 rounded-full"></span> Server Status: Stable</span>
          <button onClick={() => { setActivePage("auth"); }} className="hover:text-white transition">Admin Login</button>
          <button onClick={() => { setActivePage("auth"); }} className="hover:text-white transition">Agent Portal</button>
          <button onClick={() => { setActivePage("about"); }} className="hover:text-white transition">Privacy Policy</button>
        </div>
      </footer>

      {/* FLOATING CONTACT ACTIONS */}
      <div className="fixed bottom-6 right-8 flex flex-col gap-3 z-50">
        <a 
          href={`https://wa.me/${config.whatsappNumber.replace("+", "")}?text=Hello%20Amar%20Singh%20I%20have%20an%20inquiry%20regarding%20CSC%20Service`}
          target="_blank" 
          rel="noreferrer" 
          className="bg-[#25D366] hover:opacity-90 text-white p-3 rounded-full shadow-lg flex items-center gap-2 text-sm font-bold px-4 transition"
          title={words.whatsappLabel}
        >
          <MessageSquare className="w-4 h-4 shrink-0" />
          <span>{words.whatsappLabel}</span>
        </a>
        <a 
          href={`tel:${config.contactPhone}`}
          className={`${tc.primary} text-white p-3 rounded-full shadow-lg flex items-center gap-2 text-sm font-bold px-4 transition`}
          title={words.phoneLabel}
        >
          <Phone className="w-4 h-4 shrink-0" />
          <span>{words.phoneLabel}</span>
        </a>
      </div>
    </div>
  );
}
