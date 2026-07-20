import React, { useState, useRef } from "react";
import { Upload, FileText, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { DocumentType } from "../types";

interface DocumentUploaderProps {
  userId: string;
  onUploadSuccess: (docId: string, fileName: string, docType: DocumentType) => void;
  allowedTypes?: DocumentType[];
  compact?: boolean;
}

export default function DocumentUploader({ userId, onUploadSuccess, allowedTypes, compact = false }: DocumentUploaderProps) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedType, setSelectedType] = useState<DocumentType>("pdf");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const docTypesList: { value: DocumentType; label: string }[] = [
    { value: "aadhaar", label: "Aadhaar Card" },
    { value: "pan", label: "PAN Card" },
    { value: "photo", label: "Passport Photograph" },
    { value: "signature", label: "Signature Scan" },
    { value: "pdf", label: "Supporting PDF Document" }
  ];

  const filteredTypes = allowedTypes 
    ? docTypesList.filter(t => allowedTypes.includes(t.value))
    : docTypesList;

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const processFile = async (file: File) => {
    if (!file) return;

    // Check size limit: 5MB for simple sandbox storage
    if (file.size > 5 * 1024 * 1024) {
      setError("File size exceeds the 5MB limit. Please compress your document.");
      return;
    }

    setUploading(true);
    setError(null);
    setSuccess(null);

    try {
      const base64 = await convertToBase64(file);
      
      const response = await fetch("/api/documents/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          docType: selectedType,
          fileName: file.name,
          fileSize: file.size,
          fileData: base64
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to upload document file.");
      }

      setSuccess(`Successfully uploaded ${file.name}!`);
      onUploadSuccess(data.documentId, file.name, selectedType);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred during uploading.");
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const onButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={`p-4 bg-white rounded-xl border border-slate-100 shadow-sm transition-all duration-200`}>
      <h3 className="text-sm font-semibold text-slate-800 mb-3 flex items-center gap-1.5">
        <FileText className="w-4 h-4 text-blue-600" />
        Upload Identity & Processing Documents
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">Select Document Category:</label>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value as DocumentType)}
            className="w-full text-xs border border-slate-200 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none bg-slate-50"
          >
            {filteredTypes.map(t => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>
        <div className="flex items-end text-xs text-slate-400">
          * Maximum file size 5MB (PDF, JPEG, or PNG formats).
        </div>
      </div>

      {/* Drag & Drop Canvas */}
      <div
        id="drag-file-uploader"
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={onButtonClick}
        className={`relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-150 ${
          dragActive 
            ? "border-blue-500 bg-blue-50/50" 
            : "border-slate-200 hover:border-blue-400 hover:bg-slate-50/50"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept=".pdf,.png,.jpg,.jpeg"
          onChange={handleFileChange}
          disabled={uploading}
        />

        <div className="flex flex-col items-center justify-center gap-2">
          {uploading ? (
            <>
              <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
              <p className="text-sm font-medium text-slate-600">Encrypting & transmitting secure file...</p>
            </>
          ) : (
            <>
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center">
                <Upload className="w-6 h-6" />
              </div>
              <p className="text-sm font-medium text-slate-700">
                <span className="text-blue-600 font-semibold underline">Click to browse</span> or drag and drop your document
              </p>
              <p className="text-xs text-slate-400">PDF, PNG, JPG files accepted</p>
            </>
          )}
        </div>
      </div>

      {error && (
        <div className="mt-3 flex items-start gap-2 bg-red-50 text-red-700 p-2.5 rounded-lg text-xs">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="mt-3 flex items-start gap-2 bg-emerald-50 text-emerald-800 p-2.5 rounded-lg text-xs">
          <CheckCircle className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
          <span>{success}</span>
        </div>
      )}
    </div>
  );
}
