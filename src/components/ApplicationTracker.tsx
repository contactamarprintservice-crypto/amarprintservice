import React, { useState } from "react";
import { Search, Loader2, CheckCircle2, AlertCircle, Clock, FileSearch, ArrowRight, CornerDownRight } from "lucide-react";
import { Application } from "../types";

interface ApplicationTrackerProps {
  initialSearchQuery?: string;
  onCloseSearch?: () => void;
}

export default function ApplicationTracker({ initialSearchQuery = "", onCloseSearch }: ApplicationTrackerProps) {
  const [query, setQuery] = useState(initialSearchQuery);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Application[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleTrackSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/applications/track?query=${encodeURIComponent(query.trim())}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Failed to search tracking registry.");
      }

      setResults(data);
      setHasSearched(true);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred while looking up application records.");
    } finally {
      setLoading(false);
    }
  };

  const getStepIndex = (status: string) => {
    switch (status) {
      case "received": return 0;
      case "under_review": return 1;
      case "dispatched": return 2;
      case "completed": return 3;
      default: return 0;
    }
  };

  const steps = [
    { label: "Received", desc: "Application lodged" },
    { label: "Under Review", desc: "Verifying credentials" },
    { label: "Dispatched", desc: "Mailed / PVC Generated" },
    { label: "Completed", desc: "Delivered successfully" }
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold font-display text-slate-800 flex items-center gap-2">
            <FileSearch className="w-5 h-5 text-blue-600" />
            Live Universal Tracking
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Search immediately by Mobile Number, Application ID, Order ID, or Applicant Name.
          </p>
        </div>
        {onCloseSearch && (
          <button 
            onClick={onCloseSearch}
            className="text-xs bg-slate-50 text-slate-500 hover:bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 transition"
          >
            Go Back
          </button>
        )}
      </div>

      <form onSubmit={handleTrackSearch} className="mb-8">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Enter Application ID (e.g. AMAR-847291) or Registered Mobile Number..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 text-slate-800 text-sm font-medium shadow-sm transition"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm px-6 rounded-xl flex items-center gap-1.5 transition duration-150 shadow-sm disabled:opacity-75"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Track Now"}
          </button>
        </div>
      </form>

      {/* Results Rendering */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
          <p className="text-sm text-slate-500 mt-2 font-medium">Scanning cryptographic application records...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-xl flex items-start gap-3 mb-6">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-sm">Lookup Failed:</span>
            <p className="text-xs mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {hasSearched && !loading && results.length === 0 && (
        <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-200">
          <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-2" />
          <h4 className="font-bold text-slate-700 text-sm">No Active Records Found</h4>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            We couldn't locate any dynamic applications matching "{query}". Double check your mobile number or tracking ID format.
          </p>
        </div>
      )}

      {hasSearched && !loading && results.length > 0 && (
        <div className="space-y-6">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Search Found ({results.length}) Matches:
          </h3>
          {results.map((app) => {
            const currentStep = getStepIndex(app.status);
            return (
              <div key={app.id} className="border border-slate-150 rounded-xl p-5 shadow-sm space-y-6">
                {/* Header Information */}
                <div className="flex flex-wrap justify-between items-start gap-4 pb-4 border-b border-slate-100">
                  <div>
                    <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
                      ID: {app.trackingId}
                    </span>
                    <h4 className="font-bold text-slate-800 text-base mt-2">
                      Applicant: {app.applicantName}
                    </h4>
                    <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-1">
                      <Clock className="w-3.5 h-3.5" /> Registered: {new Date(app.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase ${
                      app.status === "completed" ? "bg-emerald-100 text-emerald-800" :
                      app.status === "dispatched" ? "bg-blue-100 text-blue-800" :
                      app.status === "under_review" ? "bg-amber-100 text-amber-800" :
                      "bg-slate-100 text-slate-700"
                    }`}>
                      {app.status.replace("_", " ")}
                    </span>
                    <p className="text-xs text-slate-500 mt-1.5 font-mono">Mobile: {app.applicantPhone}</p>
                  </div>
                </div>

                {/* Stepper Graphic */}
                <div className="relative pt-2 pb-6">
                  {/* Stepper Track */}
                  <div className="absolute top-[26px] left-[15px] right-[15px] h-1.5 bg-slate-100 rounded-full -translate-y-1/2 hidden md:block">
                    <div 
                      className="h-full bg-blue-600 rounded-full transition-all duration-300"
                      style={{ width: `${(currentStep / 3) * 100}%` }}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative z-10">
                    {steps.map((step, idx) => {
                      const isActive = idx <= currentStep;
                      const isCurrent = idx === currentStep;
                      return (
                        <div key={step.label} className="flex md:flex-col items-center md:items-center gap-3 md:gap-0 md:text-center text-left">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 transition-all ${
                            isCurrent ? "bg-blue-600 text-white ring-4 ring-blue-100 scale-110" :
                            isActive ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-400"
                          }`}>
                            {isActive ? "✓" : idx + 1}
                          </div>
                          <div className="md:mt-3">
                            <p className={`text-xs font-semibold ${isActive ? "text-slate-800" : "text-slate-400"}`}>
                              {step.label}
                            </p>
                            <p className="text-[10px] text-slate-400 mt-0.5">{step.desc}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Additional Processing Details */}
                <div className="bg-slate-50 p-4 rounded-xl space-y-3 border border-slate-100">
                  <h5 className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <CornerDownRight className="w-3.5 h-3.5 text-blue-600" />
                    Submitted Details File
                  </h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {Object.entries(app.details).map(([key, val]) => (
                      <div key={key} className="bg-white p-2.5 rounded-lg border border-slate-150">
                        <span className="block text-[10px] text-slate-400 font-semibold uppercase">{key}</span>
                        <span className="text-xs font-medium text-slate-700 block mt-0.5 break-all">{val}</span>
                      </div>
                    ))}
                  </div>

                  {app.comments && (
                    <div className="mt-3 pt-3 border-t border-slate-200">
                      <span className="block text-[10px] text-blue-600 font-bold uppercase">Latest Center Updates / SpeedPost Info:</span>
                      <p className="text-xs font-medium text-slate-600 mt-1 italic">
                        "{app.comments}"
                      </p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
