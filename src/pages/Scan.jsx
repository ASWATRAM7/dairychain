import { useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Camera, CheckCircle2, ClipboardPaste, ExternalLink, ShieldCheck, Sparkles, X } from "lucide-react";

function getBatchId(value) {
  if (!value) return "";
  const text = String(value).trim();
  try {
    const url = new URL(text);
    const fromQuery = url.searchParams.get("batch");
    const pathMatch = url.pathname.match(/batch\/([^/]+)/i);
    return (fromQuery || pathMatch?.[1] || text).toUpperCase();
  } catch {
    const match = text.match(/(MILK\d+|BATCH[-_A-Z0-9]+)/i);
    return (match?.[1] || text).toUpperCase();
  }
}

export default function Scan() {
  const navigate = useNavigate();
  const location = useLocation();
  const videoRef = useRef(null);
  const controlsRef = useRef(null);
  const [manualCode, setManualCode] = useState(() => new URLSearchParams(location.search).get("batch") || "");
  const [scannerState, setScannerState] = useState("idle");
  const [message, setMessage] = useState("");

  const openJourney = (value) => {
    const batchId = getBatchId(value);
    if (!batchId) {
      setMessage("Enter a batch ID or scan the QR code printed on the carton.");
      return;
    }
    controlsRef.current?.stop();
    navigate(`/batch/${encodeURIComponent(batchId)}`);
  };

  const startScanner = async () => {
    setMessage("");
    setScannerState("starting");
    try {
      const reader = new BrowserMultiFormatReader();
      controlsRef.current?.stop();
      controlsRef.current = await reader.decodeFromVideoDevice(undefined, videoRef.current, (result) => {
        if (result) {
          setScannerState("found");
          openJourney(result.getText());
        }
      });
      setScannerState("scanning");
    } catch (error) {
      setScannerState("error");
      setMessage(error?.name === "NotAllowedError" ? "Camera permission was blocked. Use the manual batch ID field below." : "Camera scanning is unavailable in this browser. Use the manual batch ID field below.");
    }
  };

  useEffect(() => () => controlsRef.current?.stop(), []);

  return (
    <div className="min-h-[calc(100vh-144px)] bg-[#f7fbf7] px-4 py-12 md:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center"><span className="inline-flex items-center gap-2 rounded-full bg-[#e7f5ea] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[.16em] text-[#267447]"><ShieldCheck className="h-3.5 w-3.5" /> Public proof layer</span><h1 className="mt-5 font-serif text-4xl tracking-tight text-[#123b2a] md:text-5xl">Scan the carton.<br /><span className="text-[#2d8b57]">Meet its journey.</span></h1><p className="mt-4 text-slate-500 leading-relaxed">Use your phone camera to open the exact cold-chain record attached to your milk batch. No wallet or account required.</p></div>

        <div className="mt-10 grid gap-6 lg:grid-cols-[1.1fr_.9fr]">
          <div className="overflow-hidden rounded-2xl border border-[#cfe5d4] bg-[#123b2a] p-3 shadow-xl shadow-emerald-900/10">
            <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-[#0d2f21]">
              <video ref={videoRef} className="h-full w-full object-cover" muted playsInline />
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none"><div className="relative h-52 w-52 rounded-3xl border-2 border-[#a8e6bb] shadow-[0_0_0_999px_rgba(5,31,20,.42)]"><span className="absolute -left-1 -top-1 h-5 w-5 border-l-4 border-t-4 border-white" /><span className="absolute -right-1 -top-1 h-5 w-5 border-r-4 border-t-4 border-white" /><span className="absolute -bottom-1 -left-1 h-5 w-5 border-b-4 border-l-4 border-white" /><span className="absolute -bottom-1 -right-1 h-5 w-5 border-b-4 border-r-4 border-white" /><span className={`absolute left-3 right-3 top-1/2 h-px bg-[#a8e6bb] shadow-[0_0_14px_#a8e6bb] ${scannerState === "scanning" ? "scan-line" : "opacity-0"}`} /></div></div>
              {scannerState === "idle" && <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0d2f21]/65 text-center text-white"><Camera className="h-10 w-10 text-[#a8e6bb]" /><p className="mt-3 text-sm font-bold">Ready to scan</p><p className="mt-1 max-w-xs text-xs text-white/60">Allow camera access, then point at the QR code on your carton.</p></div>}
              {scannerState === "starting" && <div className="absolute inset-0 flex items-center justify-center bg-[#0d2f21]/70 text-sm font-semibold text-white">Opening camera…</div>}
              {scannerState === "found" && <div className="absolute inset-0 flex items-center justify-center bg-[#0d2f21]/70 text-sm font-semibold text-[#a8e6bb]"><CheckCircle2 className="mr-2 h-5 w-5" /> QR verified — opening journey</div>}
              {scannerState === "error" && <div className="absolute inset-x-4 bottom-4 rounded-lg bg-black/55 px-3 py-2 text-center text-xs text-white">{message}</div>}
            </div>
            <div className="flex items-center justify-between gap-3 px-2 pb-1 pt-4"><div><p className="text-xs font-bold text-white">Carton QR scanner</p><p className="mt-1 text-[10px] text-white/50">Works with any DairyChain-enabled batch</p></div><button type="button" onClick={startScanner} className="inline-flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-xs font-bold text-[#164d33] hover:bg-[#e7f5ea]"><Camera className="h-3.5 w-3.5" /> {scannerState === "scanning" ? "Scanning…" : "Start camera"}</button></div>
          </div>

          <div className="rounded-2xl border border-[#dcebe0] bg-white p-6 shadow-sm md:p-8"><div className="flex items-center gap-2 text-[#2d8b57]"><Sparkles className="h-4 w-4" /><p className="text-[10px] font-bold uppercase tracking-[.16em]">No camera? No problem.</p></div><h2 className="mt-3 text-2xl font-bold text-[#123b2a]">Enter the batch code</h2><p className="mt-2 text-sm leading-relaxed text-slate-500">Find the code beside the QR mark on your carton. Try the demo batch to preview the full customer experience.</p><label htmlFor="batch-code" className="mt-6 block text-[10px] font-bold uppercase tracking-[.15em] text-slate-400">Batch ID or QR URL</label><div className="mt-2 flex gap-2"><input id="batch-code" value={manualCode} onChange={(event) => setManualCode(event.target.value)} onKeyDown={(event) => event.key === "Enter" && openJourney(manualCode)} placeholder="MILK001" className="min-w-0 flex-1 rounded-lg border border-[#cfe5d4] bg-[#fbfefb] px-3 py-3 font-mono text-sm text-[#164d33] outline-none focus:border-[#2d8b57]" /><button type="button" onClick={() => setManualCode("")} aria-label="Clear batch code" className="rounded-lg border border-[#dcebe0] px-3 text-slate-400 hover:text-[#164d33]"><X className="h-4 w-4" /></button></div>{message && scannerState !== "error" && <p className="mt-2 text-xs font-medium text-[#b45309]">{message}</p>}<button type="button" onClick={() => openJourney(manualCode)} className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#164d33] px-4 py-3 text-sm font-bold text-white hover:bg-[#216a45]">View blockchain journey <ExternalLink className="h-4 w-4" /></button><button type="button" onClick={() => setManualCode("MILK001")} className="mt-3 inline-flex items-center gap-2 text-xs font-semibold text-[#2d8b57] hover:text-[#164d33]"><ClipboardPaste className="h-3.5 w-3.5" /> Use demo batch MILK001</button><div className="mt-8 border-t border-[#e6f0e7] pt-5"><p className="text-xs font-bold text-[#164d33]">What customers can verify</p><ul className="mt-3 space-y-2 text-xs text-slate-500"><li className="flex gap-2"><CheckCircle2 className="h-4 w-4 shrink-0 text-[#36a866]" /> Farm origin and collection handoffs</li><li className="flex gap-2"><CheckCircle2 className="h-4 w-4 shrink-0 text-[#36a866]" /> Temperature history and safe-range compliance</li><li className="flex gap-2"><CheckCircle2 className="h-4 w-4 shrink-0 text-[#36a866]" /> Block confirmation and cryptographic proof</li></ul></div></div>
        </div>
        <p className="mt-8 text-center text-xs text-slate-400">Looking for the operator dashboard? <Link to="/dashboard" className="font-semibold text-[#2d8b57] hover:text-[#164d33]">Open DairyChain Grid</Link></p>
      </div>
    </div>
  );
}
