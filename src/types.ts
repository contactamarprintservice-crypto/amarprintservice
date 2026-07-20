/**
 * AMAR CSC CENTER - System Types and Database Schema
 * Domain: amarprintservices.in
 */

// ==========================================
// POSTGRESQL DATABASE SCHEMA (DDL DOCUMENTATION)
// ==========================================
/*
CREATE TABLE users (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  phone VARCHAR(15) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('customer', 'agent', 'distributor', 'retailer', 'admin')),
  email VARCHAR(100),
  wallet_balance DECIMAL(10, 2) DEFAULT 0.00,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'suspended')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE services (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  category VARCHAR(50) NOT NULL,
  description TEXT,
  base_price DECIMAL(10, 2) NOT NULL,
  commission DECIMAL(10, 2) DEFAULT 0.00,
  is_active BOOLEAN DEFAULT TRUE,
  hyperlink_override VARCHAR(255),
  corrected_name VARCHAR(100)
);

CREATE TABLE applications (
  id VARCHAR(50) PRIMARY KEY,
  tracking_id VARCHAR(50) UNIQUE NOT NULL,
  user_id VARCHAR(50) REFERENCES users(id),
  service_id VARCHAR(50) REFERENCES services(id),
  applicant_name VARCHAR(100) NOT NULL,
  applicant_phone VARCHAR(15) NOT NULL,
  status VARCHAR(20) DEFAULT 'received' CHECK (status IN ('received', 'under_review', 'dispatched', 'completed')),
  details JSONB NOT NULL,
  comments TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE documents (
  id VARCHAR(50) PRIMARY KEY,
  application_id VARCHAR(50) REFERENCES applications(id) ON DELETE SET NULL,
  user_id VARCHAR(50) REFERENCES users(id),
  doc_type VARCHAR(50) NOT NULL, -- 'aadhaar' | 'pan' | 'photo' | 'signature' | 'pdf'
  file_name VARCHAR(255) NOT NULL,
  file_size INT NOT NULL,
  file_data TEXT NOT NULL, -- base64 representation or secure URL
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE transactions (
  id VARCHAR(50) PRIMARY KEY,
  user_id VARCHAR(50) REFERENCES users(id),
  type VARCHAR(10) NOT NULL CHECK (type IN ('credit', 'debit')),
  amount DECIMAL(10, 2) NOT NULL,
  payment_method VARCHAR(30) NOT NULL, -- 'wallet' | 'upi' | 'gpay' | 'phonepe' | 'paytm' | 'bank_transfer'
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  reference_id VARCHAR(100),
  remarks TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE support_tickets (
  id VARCHAR(50) PRIMARY KEY,
  user_id VARCHAR(50) REFERENCES users(id),
  subject VARCHAR(150) NOT NULL,
  message TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'resolved')),
  admin_reply TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE system_config (
  key VARCHAR(50) PRIMARY KEY,
  value JSONB NOT NULL
);
*/

// ==========================================
// TYPESCRIPT INTERFACES
// ==========================================

export type UserRole = 'customer' | 'agent' | 'distributor' | 'retailer' | 'admin';

export interface User {
  id: string;
  name: string;
  phone: string;
  email?: string;
  role: UserRole;
  walletBalance: number;
  status: 'active' | 'suspended';
  createdAt: string;
}

export interface Service {
  id: string;
  name: string;
  category: string;
  description: string;
  basePrice: number;
  commission: number; // Commission paid back to agents/distributors
  isActive: boolean;
  hyperlinkOverride?: string; // Special override for "Hyperlink Merging"
  correctedName?: string; // Admin "Service Correction"
}

export type ApplicationStatus = 'received' | 'under_review' | 'dispatched' | 'completed';

export interface Application {
  id: string;
  trackingId: string;
  userId: string;
  serviceId: string;
  applicantName: string;
  applicantPhone: string;
  status: ApplicationStatus;
  details: Record<string, string>;
  comments?: string;
  createdAt: string;
  updatedAt: string;
}

export type DocumentType = 'aadhaar' | 'pan' | 'photo' | 'signature' | 'pdf';

export interface SecureDocument {
  id: string;
  applicationId?: string;
  userId: string;
  docType: DocumentType;
  fileName: string;
  fileSize: number;
  fileData: string; // Base64 encoding
  uploadedAt: string;
}

export interface Transaction {
  id: string;
  userId: string;
  type: 'credit' | 'debit';
  amount: number;
  paymentMethod: 'wallet' | 'upi' | 'gpay' | 'phonepe' | 'paytm' | 'bank_transfer';
  status: 'pending' | 'completed' | 'failed';
  referenceId?: string;
  remarks: string;
  createdAt: string;
}

export interface SupportTicket {
  id: string;
  userId: string;
  subject: string;
  message: string;
  status: 'open' | 'resolved';
  adminReply?: string;
  createdAt: string;
}

export interface SystemConfig {
  themeColor: 'royal-blue' | 'deep-emerald' | 'warm-gold' | 'charcoal';
  language: 'en' | 'hi';
  isMaintenance: boolean;
  allowRegistrations: boolean;
  whatsappNumber: string;
  contactPhone: string;
  contactEmail: string;
  address: string;
  portalName?: string;
  marqueeText?: string;
}

export interface NotificationLog {
  id: string;
  channel: 'sms' | 'whatsapp' | 'email' | 'push';
  recipient: string;
  message: string;
  sentAt: string;
  status: 'sent' | 'failed';
}
