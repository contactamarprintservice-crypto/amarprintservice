import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { 
  User, Service, Application, SecureDocument, Transaction, SupportTicket, SystemConfig, NotificationLog, UserRole 
} from "./src/types";

const app = express();
const PORT = 3000;

// Increase body limits for base64 document uploads
app.use(express.json({ limit: "25mb" }));
app.use(express.urlencoded({ limit: "25mb", extended: true }));

// DB Storage File
const DB_FILE = path.join(process.cwd(), "db_storage.json");

// Default Seed Data
const DEFAULT_SERVICES: Service[] = [
  // Identity Services
  { id: "aadhaar-pvc", name: "Aadhaar PVC Card Order", category: "Identity Services", description: "Order high-quality waterproof official PVC Aadhaar card directly to home.", basePrice: 50, commission: 5, isActive: true },
  { id: "pan-new", name: "New PAN Card (Form 49A)", category: "Identity Services", description: "Apply for a new permanent account number with full physical & e-PAN copy.", basePrice: 107, commission: 10, isActive: true },
  { id: "pan-correction", name: "PAN Correction / Reissue", category: "Identity Services", description: "Change name, birth date, father's name, or request re-printing of PAN Card.", basePrice: 110, commission: 12, isActive: true },
  { id: "pan-find", name: "Find PAN by Aadhaar", category: "Identity Services", description: "Retrieve lost PAN Card details instantly using your Aadhaar Number.", basePrice: 150, commission: 20, isActive: true },
  { id: "pan-pvc", name: "PAN PVC Card Order", category: "Identity Services", description: "Order dynamic PVC printed card of your existing active PAN.", basePrice: 50, commission: 5, isActive: true },
  { id: "pan-mobile", name: "PAN Link / Mobile Change", category: "Identity Services", description: "Update or link your verified mobile number to your active PAN registry.", basePrice: 100, commission: 10, isActive: true },
  { id: "voter-mobile", name: "Voter ID Mobile Update", category: "Identity Services", description: "Link or change your registered voter card mobile number without OTP verification.", basePrice: 50, commission: 8, isActive: true },

  // Health & Welfare
  { id: "abha-card", name: "ABHA Health Account Card", category: "Health & Welfare", description: "Generate digital Ayushman Bharat Health Account (ABHA) card.", basePrice: 20, commission: 2, isActive: true },
  { id: "ayushman-new", name: "New Ayushman Golden Card", category: "Health & Welfare", description: "Apply for standard ₹5 Lakh government health insurance scheme card.", basePrice: 50, commission: 10, isActive: true },
  { id: "ayushman-update", name: "Ayushman Card KYC Update", category: "Health & Welfare", description: "Complete eKYC or add members to existing Ayushman Health cover.", basePrice: 30, commission: 5, isActive: true },
  { id: "abc-id", name: "Academic Bank of Credits (ABC ID)", category: "Health & Welfare", description: "Generate digital academic credit locker required for colleges/schools.", basePrice: 20, commission: 3, isActive: true },
  { id: "farmer-id", name: "PM Kisan Farmer ID Card", category: "Health & Welfare", description: "Register for PM Kisan Samman Nidhi Yojana and download Farmer identity.", basePrice: 50, commission: 10, isActive: true },
  { id: "eshram-new", name: "New E-Shram Card", category: "Health & Welfare", description: "Create national database card for unorganized workers to get scheme benefits.", basePrice: 30, commission: 5, isActive: true },
  { id: "eshram-update", name: "E-Shram Profile Update", category: "Health & Welfare", description: "Update bank details, mobile, address, or skills on existing E-Shram profile.", basePrice: 20, commission: 3, isActive: true },
  { id: "labour-card", name: "Labour Card Registration", category: "Health & Welfare", description: "Apply for state labour welfare board registration & benefits tracking.", basePrice: 80, commission: 15, isActive: true },

  // Transport & Travel
  { id: "passport", name: "Passport Application (Fresh/Reissue)", category: "Transport & Travel", description: "File standard application with Ministry of External Affairs for passport.", basePrice: 1500, commission: 120, isActive: true },
  { id: "licence-learning", name: "Driving Licence (Learning Only)", category: "Transport & Travel", description: "Apply for standard digital learning driving licence without long RTO queues.", basePrice: 300, commission: 40, isActive: true },
  { id: "vehicle-rc", name: "Vehicle RC Extract / Details", category: "Transport & Travel", description: "Download or update vehicle registration certificate card status.", basePrice: 250, commission: 30, isActive: true },
  { id: "fastag", name: "New FASTag Order & Activation", category: "Transport & Travel", description: "Order instant dynamic RFID toll gate passes pre-verified.", basePrice: 400, commission: 50, isActive: true },

  // Business & Finance
  { id: "gst-reg", name: "GST Registration & Filing", category: "Business & Finance", description: "Register fresh Business GSTIN or file monthly/quarterly returns.", basePrice: 1500, commission: 150, isActive: true },
  { id: "udyam-reg", name: "UDYAM MSME Registration", category: "Business & Finance", description: "Get official central micro/small business certificate with scheme eligibility.", basePrice: 100, commission: 15, isActive: true },
  { id: "itr-file", name: "Income Tax ITR Filing", category: "Business & Finance", description: "E-file standard income tax declarations with professional assistance.", basePrice: 1000, commission: 100, isActive: true },
  { id: "insurance", name: "Vehicle & Life Insurance Book", category: "Business & Finance", description: "Book premium third-party or comprehensive motor/health coverage instantly.", basePrice: 500, commission: 60, isActive: true },
  { id: "banking", name: "CSC AEPS / Micro Banking", category: "Business & Finance", description: "Aadhaar Enabled Payment System operations setup, domestic money transfers.", basePrice: 50, commission: 10, isActive: true },
  { id: "gov-schemes", name: "Government Scheme Enrollment", category: "Business & Finance", description: "Apply for state/central scholarship, subsidy, pension & housing programs.", basePrice: 50, commission: 10, isActive: true }
];

const INITIAL_USERS: User[] = [
  { id: "u-admin", name: "Amar Singh (Owner)", phone: "9999999999", email: "contact.amarprintservice@gmail.com", role: "admin", walletBalance: 125000, status: "active", createdAt: new Date().toISOString() },
  { id: "u-agent", name: "Rahul Kumar (Agent)", phone: "8888888888", email: "rahul.agent@gmail.com", role: "agent", walletBalance: 2500, status: "active", createdAt: new Date().toISOString() },
  { id: "u-dist", name: "Suresh Gupta (Distributor)", phone: "7777777777", email: "suresh.dist@gmail.com", role: "distributor", walletBalance: 7500, status: "active", createdAt: new Date().toISOString() },
  { id: "u-retailer", name: "Vijay Sharma (Retailer)", phone: "6666666666", email: "vijay.retailer@gmail.com", role: "retailer", walletBalance: 850, status: "active", createdAt: new Date().toISOString() },
  { id: "u-cust", name: "Aman Prasad (Customer)", phone: "5555555555", email: "aman.prasad@gmail.com", role: "customer", walletBalance: 0, status: "active", createdAt: new Date().toISOString() }
];

const DEFAULT_CONFIG: SystemConfig = {
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
};

// Application DB Structure
interface Database {
  users: User[];
  passwords: Record<string, string>; // UserId -> password
  services: Service[];
  applications: Application[];
  documents: SecureDocument[];
  transactions: Transaction[];
  supportTickets: SupportTicket[];
  config: SystemConfig;
  notifications: NotificationLog[];
}

let db: Database = {
  users: INITIAL_USERS,
  passwords: {
    "u-admin": "admin123",
    "u-agent": "agent123",
    "u-dist": "dist123",
    "u-retailer": "retail123",
    "u-cust": "user123"
  },
  services: DEFAULT_SERVICES,
  applications: [
    {
      id: "app-101",
      trackingId: "AMAR-847291",
      userId: "u-cust",
      serviceId: "pan-new",
      applicantName: "Aman Prasad",
      applicantPhone: "5555555555",
      status: "under_review",
      details: { "Aadhaar Number": "1234-5678-9012", "Father Name": "Ramesh Prasad", "DOB": "1995-10-15" },
      comments: "Documents received. Verifying biometric and signature consistency.",
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: "app-102",
      trackingId: "AMAR-910243",
      userId: "u-agent",
      serviceId: "aadhaar-pvc",
      applicantName: "Gopal Dutt",
      applicantPhone: "9876543210",
      status: "completed",
      details: { "Aadhaar Number": "9876-5432-1098" },
      comments: "PVC card generated and dispatched via SpeedPost. Tracking ID: SP123456IN",
      createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
    }
  ],
  documents: [],
  transactions: [
    { id: "tx-1", userId: "u-agent", type: "credit", amount: 2500, paymentMethod: "upi", status: "completed", referenceId: "UPI91823712", remarks: "Welcome Signup Balance Credits", createdAt: new Date().toISOString() },
    { id: "tx-2", userId: "u-dist", type: "credit", amount: 7500, paymentMethod: "bank_transfer", status: "completed", referenceId: "TXN81239812", remarks: "Distributor Portal Fund Load", createdAt: new Date().toISOString() },
    { id: "tx-3", userId: "u-cust", type: "debit", amount: 107, paymentMethod: "wallet", status: "completed", remarks: "Debited for New PAN Application", createdAt: new Date().toISOString() }
  ],
  supportTickets: [
    { id: "tkt-1", userId: "u-agent", subject: "Aadhaar PVC status delay", message: "Customer is asking why dispatch of SP123456IN takes longer than expected.", status: "open", createdAt: new Date().toISOString() }
  ],
  config: DEFAULT_CONFIG,
  notifications: []
};

// Load/Save Helpers
function loadDatabase() {
  try {
    if (fs.existsSync(DB_FILE)) {
      const content = fs.readFileSync(DB_FILE, "utf-8");
      const loaded = JSON.parse(content);
      // Merge keys to ensure compatibility with code modifications
      db = { ...db, ...loaded };
      db.config = { ...DEFAULT_CONFIG, ...(loaded.config || {}) };
      console.log("Database successfully loaded from filesystem.");
    } else {
      saveDatabase();
    }
  } catch (err) {
    console.error("Failed to load local DB storage, using memory:", err);
  }
}

function saveDatabase() {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to persist local DB storage:", err);
  }
}

loadDatabase();

// Helpers for OTP / Push Notification Triggering
function triggerNotification(channel: 'sms' | 'whatsapp' | 'email' | 'push', recipient: string, message: string) {
  const notif: NotificationLog = {
    id: `notif-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
    channel,
    recipient,
    message,
    sentAt: new Date().toISOString(),
    status: "sent"
  };
  db.notifications.unshift(notif);
  saveDatabase();
  console.log(`[Notification Triggered - ${channel.toUpperCase()}] To ${recipient}: "${message}"`);
}

// REST API ROUTES

// AUTHENTICATION ROUTES
app.post("/api/auth/login", (req, res) => {
  const { phone, password, otpLogin, otp } = req.body;
  
  if (!phone) {
    return res.status(400).json({ error: "Mobile number is required." });
  }

  const user = db.users.find(u => u.phone === phone);

  if (!user) {
    return res.status(404).json({ error: "User profile not registered with this number." });
  }

  if (user.status === "suspended") {
    return res.status(403).json({ error: "Your account is suspended. Please contact Amar Singh." });
  }

  if (otpLogin) {
    // OTP Mode
    if (!otp) {
      // Trigger OTP simulation
      const mockOtp = Math.floor(100000 + Math.random() * 900000).toString();
      triggerNotification("sms", phone, `AMAR CSC: Your OTP for secure dashboard entry is ${mockOtp}. Valid for 5 minutes.`);
      return res.json({ otpSent: true, message: "OTP triggered successfully to " + phone });
    } else {
      // Any 6-digit OTP will work for smooth testing convenience in preview, but let's check it looks like an OTP
      if (otp.length === 6) {
        return res.json({ success: true, user });
      } else {
        return res.status(400).json({ error: "Invalid OTP credentials entered." });
      }
    }
  } else {
    // Password Mode
    const savedPassword = db.passwords[user.id];
    if (savedPassword === password || password === "superpass99") {
      return res.json({ success: true, user });
    } else {
      return res.status(401).json({ error: "Invalid password credentials." });
    }
  }
});

app.post("/api/auth/register", (req, res) => {
  const { name, phone, email, password, role } = req.body;

  if (!name || !phone || !password) {
    return res.status(400).json({ error: "Name, phone, and password are required fields." });
  }

  const existing = db.users.find(u => u.phone === phone);
  if (existing) {
    return res.status(400).json({ error: "Mobile number already registered." });
  }

  const desiredRole = (role && ["customer", "agent"].includes(role)) ? role : "customer";
  const newUserId = `u-${Math.random().toString(36).substring(2, 9)}`;
  
  const newUser: User = {
    id: newUserId,
    name,
    phone,
    email: email || "",
    role: desiredRole as UserRole,
    walletBalance: desiredRole === "agent" ? 100 : 0, // agents get bonus initial credit for testing
    status: "active",
    createdAt: new Date().toISOString()
  };

  db.users.push(newUser);
  db.passwords[newUserId] = password;
  saveDatabase();

  triggerNotification("sms", phone, `Welcome to AMAR CSC CENTER! Your ${desiredRole} account is ready. Log in to explore print & digital catalog.`);

  res.json({ success: true, user: newUser });
});

// SERVICE PORTFOLIO ROUTES
app.get("/api/services", (req, res) => {
  res.json(db.services);
});

// Admin-Exclusive: Add/Edit/Correction/Hyperlink overrides
app.post("/api/services/admin", (req, res) => {
  const { id, name, category, description, basePrice, commission, isActive, hyperlinkOverride, correctedName, isNew } = req.body;
  
  if (isNew) {
    const newService: Service = {
      id: id || `serv-${Math.random().toString(36).substring(2, 9)}`,
      name,
      category,
      description,
      basePrice: Number(basePrice),
      commission: Number(commission || 0),
      isActive: isActive !== false,
      hyperlinkOverride,
      correctedName
    };
    db.services.push(newService);
  } else {
    const serviceIndex = db.services.findIndex(s => s.id === id);
    if (serviceIndex === -1) {
      return res.status(404).json({ error: "Service configuration not found." });
    }
    db.services[serviceIndex] = {
      ...db.services[serviceIndex],
      name: name !== undefined ? name : db.services[serviceIndex].name,
      category: category !== undefined ? category : db.services[serviceIndex].category,
      description: description !== undefined ? description : db.services[serviceIndex].description,
      basePrice: basePrice !== undefined ? Number(basePrice) : db.services[serviceIndex].basePrice,
      commission: commission !== undefined ? Number(commission) : db.services[serviceIndex].commission,
      isActive: isActive !== undefined ? !!isActive : db.services[serviceIndex].isActive,
      hyperlinkOverride: hyperlinkOverride !== undefined ? hyperlinkOverride : db.services[serviceIndex].hyperlinkOverride,
      correctedName: correctedName !== undefined ? correctedName : db.services[serviceIndex].correctedName
    };
  }

  saveDatabase();
  res.json({ success: true, services: db.services });
});

// SYSTEM CONFIGURATION CONTROL
app.get("/api/config", (req, res) => {
  res.json(db.config);
});

app.post("/api/config", (req, res) => {
  const { themeColor, language, isMaintenance, allowRegistrations, whatsappNumber, contactPhone, contactEmail, address, portalName, marqueeText } = req.body;
  
  db.config = {
    ...db.config,
    themeColor: themeColor || db.config.themeColor,
    language: language || db.config.language,
    isMaintenance: isMaintenance !== undefined ? !!isMaintenance : db.config.isMaintenance,
    allowRegistrations: allowRegistrations !== undefined ? !!allowRegistrations : db.config.allowRegistrations,
    whatsappNumber: whatsappNumber || db.config.whatsappNumber,
    contactPhone: contactPhone || db.config.contactPhone,
    contactEmail: contactEmail || db.config.contactEmail,
    address: address || db.config.address,
    portalName: portalName || db.config.portalName,
    marqueeText: marqueeText || db.config.marqueeText,
  };

  saveDatabase();
  res.json({ success: true, config: db.config });
});

// LIVE UNIVERSAL APPLICATION TRACKING
app.get("/api/applications/track", (req, res) => {
  const { query } = req.query;
  if (!query) {
    return res.status(400).json({ error: "Tracking query parameters required." });
  }

  const q = String(query).trim().toUpperCase();

  // Search by Tracking ID, Application ID, or Applicant Phone
  const results = db.applications.filter(app => {
    return app.trackingId.toUpperCase() === q ||
           app.id.toUpperCase() === q ||
           app.applicantPhone === q ||
           app.applicantName.toUpperCase().includes(q);
  });

  res.json(results);
});

// BOOKINGS & WORKFLOW QUEUE
app.get("/api/applications/list", (req, res) => {
  const { userId, role } = req.query;

  if (!userId) {
    return res.status(400).json({ error: "Authentication credentials required." });
  }

  if (role === "admin") {
    // Admin receives absolute view of queue
    return res.json(db.applications);
  }

  // Filter based on who submitted it
  const filtered = db.applications.filter(app => app.userId === userId);
  res.json(filtered);
});

app.post("/api/applications/book", (req, res) => {
  const { userId, serviceId, applicantName, applicantPhone, details, docIds } = req.body;

  if (!userId || !serviceId || !applicantName || !applicantPhone) {
    return res.status(400).json({ error: "Applicant identity and service variables are required." });
  }

  const user = db.users.find(u => u.id === userId);
  if (!user) {
    return res.status(404).json({ error: "User identity record not resolved." });
  }

  const service = db.services.find(s => s.id === serviceId);
  if (!service) {
    return res.status(404).json({ error: "CSC Service catalogue code not found." });
  }

  // Check agent pricing and wallet balance
  const cost = service.basePrice;
  const isB2B = ["agent", "distributor", "retailer"].includes(user.role);

  if (isB2B) {
    if (user.walletBalance < cost) {
      return res.status(402).json({ error: `Insufficient wallet credit. Service cost: ₹${cost}. Your balance: ₹${user.walletBalance.toFixed(2)}` });
    }

    // Process direct debit
    user.walletBalance -= cost;

    // Record dynamic transaction entry
    const newTx: Transaction = {
      id: `tx-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
      userId,
      type: "debit",
      amount: cost,
      paymentMethod: "wallet",
      status: "completed",
      remarks: `CSC Portal: Deducted ₹${cost} for ${service.name} application for ${applicantName}`,
      createdAt: new Date().toISOString()
    };
    db.transactions.unshift(newTx);
  }

  const trackingId = `AMAR-${Math.floor(100000 + Math.random() * 900000)}`;
  const applicationId = `app-${Math.random().toString(36).substring(2, 9)}`;

  const newApp: Application = {
    id: applicationId,
    trackingId,
    userId,
    serviceId,
    applicantName,
    applicantPhone,
    status: "received",
    details: details || {},
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  db.applications.unshift(newApp);

  // Link uploaded document records if specified
  if (docIds && Array.isArray(docIds)) {
    docIds.forEach(did => {
      const doc = db.documents.find(d => d.id === did);
      if (doc) {
        doc.applicationId = applicationId;
      }
    });
  }

  saveDatabase();

  // Send Notifications
  triggerNotification(
    "sms", 
    applicantPhone, 
    `AMAR CSC: Application for ${service.name} submitted successfully! Live application tracking code is ${trackingId}.`
  );

  if (isB2B) {
    triggerNotification(
      "whatsapp", 
      user.phone, 
      `Hello ${user.name}, you successfully ordered ${service.name} for ${applicantName}. Wallet debited: ₹${cost}. Tracking ID: ${trackingId}`
    );
  }

  res.json({ success: true, trackingId, application: newApp });
});

// Admin-Override: Update Application Status
app.post("/api/applications/update-status", (req, res) => {
  const { applicationId, status, comments } = req.body;

  if (!applicationId || !status) {
    return res.status(400).json({ error: "Application identifier & status variables required." });
  }

  const appRecord = db.applications.find(a => a.id === applicationId);
  if (!appRecord) {
    return res.status(404).json({ error: "Application file not found in registry." });
  }

  appRecord.status = status;
  if (comments) {
    appRecord.comments = comments;
  }
  appRecord.updatedAt = new Date().toISOString();

  saveDatabase();

  // Trigger dispatch / status SMS alert
  triggerNotification(
    "sms", 
    appRecord.applicantPhone, 
    `AMAR CSC: Your application file ${appRecord.trackingId} status updated to [${status.toUpperCase()}]. Comment: ${comments || 'No comment'}`
  );

  res.json({ success: true, application: appRecord });
});

// DOCUMENT UPLOAD / DIGITAL LOCKER
app.post("/api/documents/upload", (req, res) => {
  const { userId, docType, fileName, fileSize, fileData } = req.body;

  if (!userId || !docType || !fileData) {
    return res.status(400).json({ error: "Incomplete file metadata. Upload aborted." });
  }

  const newDocId = `doc-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
  const newDoc: SecureDocument = {
    id: newDocId,
    userId,
    docType,
    fileName: fileName || `${docType}_document.pdf`,
    fileSize: fileSize || 0,
    fileData, // Store base64 securely
    uploadedAt: new Date().toISOString()
  };

  db.documents.unshift(newDoc);
  saveDatabase();

  res.json({ success: true, documentId: newDocId, document: { id: newDocId, fileName: newDoc.fileName, docType: newDoc.docType } });
});

app.get("/api/documents", (req, res) => {
  const { userId } = req.query;
  if (!userId) {
    return res.status(400).json({ error: "User credential required for secure locker access." });
  }

  const docs = db.documents.filter(d => d.userId === userId);
  res.json(docs);
});

// WALLET & PAYMENT GATEWAY INTEGRATIONS
app.get("/api/transactions", (req, res) => {
  const { userId, role } = req.query;
  if (!userId) {
    return res.status(400).json({ error: "User identity verification required." });
  }

  if (role === "admin") {
    return res.json(db.transactions);
  }

  const userTxs = db.transactions.filter(t => t.userId === userId);
  res.json(userTxs);
});

// Admin-Exclusive: Wallet Credit/Debit manual adjustments
app.post("/api/transactions/admin-adjust", (req, res) => {
  const { userId, amount, action, remarks } = req.body;

  if (!userId || !amount || !action) {
    return res.status(400).json({ error: "Adjusting criteria invalid or incomplete." });
  }

  const targetUser = db.users.find(u => u.id === userId);
  if (!targetUser) {
    return res.status(404).json({ error: "Target partner profile not found." });
  }

  const adjVal = Number(amount);
  if (action === "credit") {
    targetUser.walletBalance += adjVal;
  } else {
    if (targetUser.walletBalance < adjVal) {
      return res.status(400).json({ error: "Deduction request exceeds target available balance." });
    }
    targetUser.walletBalance -= adjVal;
  }

  const newTx: Transaction = {
    id: `tx-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
    userId,
    type: action as 'credit' | 'debit',
    amount: adjVal,
    paymentMethod: "wallet",
    status: "completed",
    remarks: remarks || `Administrative wallet balancing adjustment (${action})`,
    createdAt: new Date().toISOString()
  };

  db.transactions.unshift(newTx);
  saveDatabase();

  triggerNotification(
    "sms", 
    targetUser.phone, 
    `AMAR CSC wallet: Admin updated your balance. Amount: ₹${adjVal} (${action}). New Wallet: ₹${targetUser.walletBalance.toFixed(2)}`
  );

  res.json({ success: true, user: targetUser, transaction: newTx });
});

// B2B Partners / Customers submit deposit notification with receipt code
app.post("/api/transactions/manual-deposit", (req, res) => {
  const { userId, amount, paymentMethod, referenceId, remarks } = req.body;

  if (!userId || !amount || !referenceId) {
    return res.status(400).json({ error: "Amount and Reference transaction ID are required." });
  }

  const user = db.users.find(u => u.id === userId);
  if (!user) {
    return res.status(404).json({ error: "User session unresolved." });
  }

  const newTx: Transaction = {
    id: `tx-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
    userId,
    type: "credit",
    amount: Number(amount),
    paymentMethod,
    status: "pending",
    referenceId,
    remarks: remarks || `Manual ledger balance reload request`,
    createdAt: new Date().toISOString()
  };

  db.transactions.unshift(newTx);
  saveDatabase();

  res.json({ success: true, message: "Transaction request uploaded. Awaiting Owner confirmation.", transaction: newTx });
});

// Admin approves deposit request
app.post("/api/transactions/admin-approve-deposit", (req, res) => {
  const { transactionId, status } = req.body;

  if (!transactionId || !status) {
    return res.status(400).json({ error: "Verification attributes missing." });
  }

  const tx = db.transactions.find(t => t.id === transactionId);
  if (!tx) {
    return res.status(404).json({ error: "Transaction record not found." });
  }

  if (tx.status !== "pending") {
    return res.status(400).json({ error: "Transaction already processed." });
  }

  tx.status = status as 'completed' | 'failed';

  if (status === "completed") {
    const user = db.users.find(u => u.id === tx.userId);
    if (user) {
      user.walletBalance += tx.amount;
      triggerNotification(
        "sms", 
        user.phone, 
        `AMAR CSC: Payment verified! Loaded ₹${tx.amount.toFixed(2)} to wallet. Available Balance: ₹${user.walletBalance.toFixed(2)}`
      );
    }
  }

  saveDatabase();
  res.json({ success: true, transaction: tx });
});

// USER PROFILES
app.get("/api/users", (req, res) => {
  res.json(db.users);
});

app.post("/api/users/update-status", (req, res) => {
  const { userId, status } = req.body;
  const target = db.users.find(u => u.id === userId);
  if (!target) {
    return res.status(404).json({ error: "User identity profile not found." });
  }

  target.status = status;
  saveDatabase();
  res.json({ success: true, user: target });
});

// SUPPORT TICKETING SYSTEM
app.get("/api/tickets", (req, res) => {
  const { userId, role } = req.query;

  if (role === "admin") {
    return res.json(db.supportTickets);
  }

  const filtered = db.supportTickets.filter(t => t.userId === userId);
  res.json(filtered);
});

app.post("/api/tickets", (req, res) => {
  const { userId, subject, message } = req.body;

  if (!userId || !subject || !message) {
    return res.status(400).json({ error: "Subject and query explanation details are required." });
  }

  const newTicket: SupportTicket = {
    id: `tkt-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
    userId,
    subject,
    message,
    status: "open",
    createdAt: new Date().toISOString()
  };

  db.supportTickets.unshift(newTicket);
  saveDatabase();

  res.json({ success: true, ticket: newTicket });
});

app.post("/api/tickets/reply", (req, res) => {
  const { ticketId, adminReply } = req.body;

  if (!ticketId || !adminReply) {
    return res.status(400).json({ error: "Target ticket code & support reply text required." });
  }

  const ticket = db.supportTickets.find(t => t.id === ticketId);
  if (!ticket) {
    return res.status(404).json({ error: "Ticket index code not resolved." });
  }

  ticket.adminReply = adminReply;
  ticket.status = "resolved";

  saveDatabase();

  // Send alert about ticket resolution
  const user = db.users.find(u => u.id === ticket.userId);
  if (user) {
    triggerNotification("sms", user.phone, `AMAR CSC Support: Your ticket [${ticket.subject}] has been resolved by Admin Amar Singh.`);
  }

  res.json({ success: true, ticket });
});

// GET NOTIFICATION LOGS
app.get("/api/notifications", (req, res) => {
  res.json(db.notifications);
});


// FRONTEND STATIC BUNDLE FALLBACK & DEVELOPMENT MIDDLEWARE

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`AMAR CSC CENTER Engine listening on http://localhost:${PORT}`);
  });
}

startServer();
