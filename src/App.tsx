import React, { useState, useRef } from "react";
import { AcceptanceData } from "./types";
import { AcceptanceForm } from "./components/AcceptanceForm";
import { AcceptanceLetter, NHubLogo } from "./components/AcceptanceLetter";
import appLogoImg from "./assets/images/app_logo_1782140083666.jpg";
import { DownloadButton } from "./components/DownloadButton";
import { 
  FileCheck, 
  Eye, 
  HelpCircle, 
  Mail, 
  Award, 
  Globe, 
  Activity, 
  Printer, 
  Maximize2,
  Minimize2,
  X,
  Send,
  Loader2,
  Info,
  Smartphone
} from "lucide-react";

const formatOrdinal = (day: number) => {
  if (day > 3 && day < 21) return "th";
  switch (day % 10) {
    case 1:
      return "st";
    case 2:
      return "nd";
    case 3:
      return "rd";
    default:
      return "th";
  }
};

const getTodayFormatted = () => {
  const d = new Date();
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  return `${months[d.getMonth()]} ${d.getDate()}${formatOrdinal(d.getDate())}, ${d.getFullYear()}`;
};

const INITIAL_DATA: AcceptanceData = {
  fullName: "",
  institution: "",
  department: "",
  matricNo: "",
  date: getTodayFormatted(),
  referenceNo: "NH-STU-92850",
  salutation: "Dear Sir/Madam",
  signatoryName: "Bashir Sheidu",
  signatoryTitle: "Chief Operations Officer",
  organization: "nHub Foundation & nHub Nigeria",
  signatoryContact: "08068640710",
  hasLogo: true,
  hasSignature: true,
  hasQrCode: true,
  templateId: "nhub-default",
  customLogoUrl: null,
  customSignatureUrl: null,
};

export default function App() {
  const [data, setData] = useState<AcceptanceData>(INITIAL_DATA);
  const [prevCompiledData, setPrevCompiledData] = useState<AcceptanceData>(INITIAL_DATA);
  const [highlightMode, setHighlightMode] = useState<boolean>(true);
  const [fontSizeScale, setFontSizeScale] = useState<number>(0.95);
  const [exportState, setExportState] = useState<"idle" | "capturing" | "success" | "error">("idle");
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  
  // Modals for scalable features
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailForm, setEmailForm] = useState({ to: "", subject: "Your Generated Letter", notes: "" });
  const [sendingEmail, setSendingEmail] = useState(false);
  
  // PWA Install Prompt State
  const [deferredPrompt, setDeferredPrompt] = React.useState<any>(null);
  const [showInstallBtn, setShowInstallBtn] = React.useState(false);

  React.useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallBtn(true);
    };
    window.addEventListener("beforeinstallprompt", handler);
    
    // Check if app is already running in standalone mode (installed)
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setShowInstallBtn(false);
    }

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setDeferredPrompt(null);
      setShowInstallBtn(false);
    }
  };
  


  const documentRef = useRef<HTMLDivElement | null>(null);

  const handleDataChange = (newData: Partial<AcceptanceData>) => {
    setData((prev) => {
      const updated = { ...prev, ...newData };
      setPrevCompiledData(updated);
      return updated;
    });
  };

  const handleResetForm = () => {
    if (window.confirm("Are you sure you want to restore the official nHub Foundation template defaults?")) {
      setData(INITIAL_DATA);
      setPrevCompiledData(INITIAL_DATA);
      triggerBannerAlert("Successfully restored default nHub template fields!");
    }
  };

  const handleApplyChanges = (e: React.FormEvent) => {
    e.preventDefault();
    setPrevCompiledData({ ...data });
    triggerBannerAlert("Document live variables lock applied successfully!");
  };

  const triggerBannerAlert = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => {
      setSuccessMsg(null);
    }, 4000);
  };

  const handleSendEmailSimulation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailForm.to.trim()) return;
    setSendingEmail(true);
    setTimeout(() => {
      setSendingEmail(false);
      setShowEmailModal(false);
      setEmailForm({ to: "", subject: "Your Generated Letter", notes: "" });
      triggerBannerAlert("Document sent successfully via mock mail network!");
    }, 1800);
  };



  return (
    <div className="min-h-screen bg-slate-100 text-slate-850 font-sans flex flex-col justify-between selection:bg-indigo-500/20 selection:text-indigo-900">
      
      {/* Top Professional Header Navigation */}
      <header className="sticky top-0 z-40 h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 lg:px-8 shrink-0 shadow-sm print:hidden">
        <div className="max-w-7xl w-full mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white border border-slate-200 rounded-sm overflow-hidden flex items-center justify-center">
              <img src={appLogoImg} alt="Logo" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
            </div>
            <div>
              <h1 className="text-sm font-bold tracking-tight text-slate-900 leading-none">
                Acceptance <span className="font-semibold text-slate-500 underline decoration-indigo-500 underline-offset-4">Letter</span>
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {showInstallBtn && (
              <button
                onClick={handleInstallClick}
                className="flex items-center gap-1.5 px-2 py-1 sm:px-3 sm:py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-sm text-[10px] sm:text-xs font-semibold shadow-xs hover:shadow-xs transition-all active:scale-95 cursor-pointer"
              >
                <Smartphone className="w-3.5 h-3.5 animate-pulse" />
                <span>Install App</span>
              </button>
            )}
            <a 
              href="https://nhubfoundation.org" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-xs text-slate-500 hover:text-slate-900 font-semibold flex items-center gap-1 transition-colors"
            >
              <Globe className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">nhubfoundation.org</span>
            </a>
            <span className="h-4 w-px bg-slate-200" />
            <div className="flex items-center gap-1 px-2.5 py-0.5 bg-green-500/10 rounded-sm text-green-700">
              <span className="text-[9px] font-bold uppercase tracking-wider">CONNECTED</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow">
        
        {/* Decorative Notification Banner */}
        {successMsg && (
          <div className="fixed bottom-6 right-6 z-50 max-w-sm bg-slate-900 text-white rounded shadow-xl p-4 border border-indigo-500/30 flex gap-3 items-start animate-fade-in">
            <div className="p-1.5 bg-indigo-500/20 text-indigo-300 rounded">
              <FileCheck className="w-4.5 h-4.5" />
            </div>
            <div className="flex-1 text-xs">
              <p className="font-bold text-indigo-300">System Notification</p>
              <p className="text-slate-300 leading-relaxed mt-0.5">{successMsg}</p>
            </div>
          </div>
        )}

        {/* Global Progress Overlay while Compiling */}
        {exportState === "capturing" && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-50 flex flex-col justify-center items-center gap-3">
            <div className="bg-white p-6 rounded shadow-2xl border border-slate-100 flex flex-col items-center gap-4 max-w-xs text-center">
              <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
              <div>
                <p className="font-bold text-sm text-slate-900">Compiling Document</p>
                <p className="text-[11px] text-slate-500 mt-1">Generating vector letter layout coordinates. Do not leave this tab.</p>
              </div>
            </div>
          </div>
        )}

        {/* Introduction Section */}
        <div className="mb-8 bg-gradient-to-br from-slate-900 to-indigo-950 p-6 sm:p-8 rounded text-white shadow-lg relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6 print:hidden">
          {/* Watermark detail */}
          <div className="absolute right-0 top-0 translate-x-20 -translate-y-20 opacity-10 pointer-events-none select-none">
            <Award className="w-110 h-110" />
          </div>

          <div className="space-y-2 max-w-2xl relative z-10">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Acceptance Letter Configurator</h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-medium">
              Create, customize, verify and compile standardized internship, academic, or corporate acceptance letters instantly. Enter the candidate details, tweak letterhead spacing, and download vectors in print-perfect quality.
            </p>
          </div>

          {/* Quick Metrics / Status */}
          <div className="flex gap-4 sm:gap-6 bg-white/5 backdrop-blur-xs p-4 rounded border border-white/10 w-full md:w-auto relative z-10">
            <div className="flex-1 text-center md:text-left min-w-[70px]">
              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Document DPI</span>
              <span className="text-lg font-black text-indigo-300 block">300 DPI</span>
            </div>
            <div className="h-8 w-px bg-white/10 align-middle self-center" />
            <div className="flex-1 text-center md:text-left min-w-[70px]">
              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Target Size</span>
              <span className="text-lg font-black text-emerald-400 block">A4 Sheet</span>
            </div>
            <div className="h-8 w-px bg-white/10 align-middle self-center" />
            <div className="flex-1 text-center md:text-left min-w-[70px]">
              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Format</span>
              <span className="text-lg font-black text-slate-200 block">PDF/A-1</span>
            </div>
          </div>
        </div>

        {/* Primary Dashboard Grid Splitter */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT SIDE: Active Config Form (5 cols on large screens) */}
          <div className="lg:col-span-5 h-full space-y-6 print:hidden">
            <AcceptanceForm 
              data={data}
              onChange={handleDataChange}
              onReset={handleResetForm}
              onSubmit={handleApplyChanges}
            />

             {/* Verification and Extra Features Box */}
            <div className="bg-white rounded border border-slate-200 shrink-0 shadow-sm p-5 space-y-4">
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider block">Extra Platform Utilities</span>
              <p className="text-xs text-slate-500 leading-relaxed">
                Send the generated letters or verify credentials inside our mock network tools below.
              </p>
              <div className="flex flex-col gap-3">
                {/* Simulated Email Trigger */}
                <button
                  type="button"
                  onClick={() => setShowEmailModal(true)}
                  className="w-full flex items-center justify-center gap-2 border border-slate-200 bg-slate-50 hover:bg-slate-100 py-2.5 px-3 rounded text-xs font-bold text-slate-700 transition-colors pointer shadow-3xs"
                >
                  <Mail className="w-4 h-4 text-slate-500" />
                  <span>Send via Email</span>
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT SIDE: Real-time Interactive A4 Document Preview (7 cols on large screens) */}
          <div className="lg:col-span-7 flex flex-col gap-5 sticky top-24">
            
            {/* Live Preview Controller Header bar */}
            <div className="bg-white rounded border border-slate-200 p-4 sm:p-5 shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between print:hidden">
              <div className="flex items-center gap-2 self-start sm:self-center">
                <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse"></span>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1">
                  Document Preview Core
                </span>
                <span className="text-[10px] bg-slate-100 text-slate-500 font-mono px-2 py-0.5 rounded-sm">
                  {highlightMode ? "Highlights On" : "Print Ready"}
                </span>
              </div>

              {/* Layout controls */}
              <div className="flex flex-wrap items-center gap-4 w-full sm:w-auto justify-end">
                {/* Highlight selector */}
                <button
                  type="button"
                  onClick={() => setHighlightMode(!highlightMode)}
                  className={`text-[10px] font-bold px-3 py-1.5 rounded transition-all border ${
                    highlightMode 
                      ? "bg-indigo-50 text-indigo-600 border-indigo-200" 
                      : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                  }`}
                  title="Toggle highlight markers for letter template placeholders"
                >
                  {highlightMode ? "Hide Highlights" : "Highlight Placeholders"}
                </button>
              </div>
            </div>

            {/* Embedded Live letter with current compiled data representation */}
            <AcceptanceLetter 
              data={prevCompiledData} 
              highlightMode={highlightMode}
              fontSizeScale={fontSizeScale}
              ref={documentRef}
            />

            {/* Compiled export & format triggers */}
            <div className="print:hidden">
              <DownloadButton 
                elementRef={documentRef}
                fullName={prevCompiledData.fullName}
                onStartExport={() => setExportState("capturing")}
                onSuccessExport={() => {
                  setExportState("success");
                  triggerBannerAlert("Successfully compiled vector elements and generated PDF!");
                }}
                onErrorExport={() => setExportState("error")}
              />
            </div>

          </div>
        </div>
      </main>

      {/* Scalable Modal 1: Simulated Email Form */}
      {showEmailModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex justify-center items-center p-4">
          <div className="bg-white rounded max-w-md w-full shadow-2xl border border-slate-200 p-6 relative animate-slide-up">
            <button
              onClick={() => setShowEmailModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-1.5 rounded"
            >
              <X className="w-4 h-4" />
            </button>
            
            <div className="flex gap-3 mb-4 items-center">
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 leading-tight">Simulated Email Delivery</h3>
                <p className="text-[10px] text-slate-500 mt-0.5">Send a verifiable copy of this letter to any recipient</p>
              </div>
            </div>

            <form onSubmit={handleSendEmailSimulation} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">
                  Recipient Email
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. registrar@university.edu"
                  className="w-full px-3 py-2 border border-slate-200 bg-slate-50 rounded text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  value={emailForm.to}
                  onChange={(e) => setEmailForm({ ...emailForm, to: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">
                  Email Subject
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Acceptance Letter for Kumven"
                  className="w-full px-3 py-2 border border-slate-200 bg-slate-50 rounded text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  value={emailForm.subject}
                  onChange={(e) => setEmailForm({ ...emailForm, subject: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">
                  Accompanied Notes (Internal Body Message)
                </label>
                <textarea
                  rows={3}
                  placeholder="Insert any introduction or notes here..."
                  className="w-full px-3 py-2 border border-slate-200 bg-slate-50 rounded text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  value={emailForm.notes}
                  onChange={(e) => setEmailForm({ ...emailForm, notes: e.target.value })}
                />
              </div>

              <div className="bg-slate-50 p-2.5 rounded text-slate-500 text-[10px] leading-relaxed flex gap-2">
                <Info className="w-3.5 h-3.5 text-indigo-500 flex-shrink-0 mt-0.5" />
                <span>
                  The system will process and compile the active PDF letterhead data structures prior to forwarding via simulated dispatch records.
                </span>
              </div>

              <div className="flex gap-2.5 pt-3 justify-end">
                <button
                  type="button"
                  onClick={() => setShowEmailModal(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={sendingEmail}
                  className="bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-bold text-xs px-4 py-2 rounded flex items-center gap-1.5 transition-colors shadow-lg shadow-indigo-105"
                >
                  {sendingEmail ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Sending Delivery...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Dispatch Email</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}



      {/* Styled Footer for Brand Context */}
      <footer className="bg-slate-900 text-slate-400 py-8 border-t border-slate-800 print:hidden mt-16 text-xs sm:text-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-sm bg-white overflow-hidden flex items-center justify-center shadow-sm">
              <img src={appLogoImg} alt="Logo" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
            </div>
            <div>
              <p className="text-slate-200 font-bold">Acceptance Letter</p>
              <p className="text-[10px] text-slate-500 font-medium font-sans">Digital Letter, Verification Signatures, and High Resolution PDF compiling.</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 text-slate-400 text-xs font-semibold">
            <p>© 2026 Acceptance Letter and nHub Foundation. All rights reserved.</p>
            <div className="flex gap-3 text-slate-500">
              <a href="#" className="hover:text-indigo-400 transition-colors">Privacy Terms</a>
              <span>•</span>
              <a href="#" className="hover:text-indigo-400 transition-colors">Security Audit</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
