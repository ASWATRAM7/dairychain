import { useEffect, useMemo, useState } from "react";
import {
  Box,
  CheckCircle2,
  Factory,
  MapPin,
  Pause,
  Play,
  Radio,
  RotateCcw,
  ShieldCheck,
  SkipForward,
  Truck,
  Warehouse,
  Zap,
} from "lucide-react";

const STAGES = [
  { title: "Farm dispatch", location: "Erode Dairy Cluster", time: "05:42 IST", temp: 3.6, block: "18,492", event: "Origin handoff signed", icon: MapPin },
  { title: "Chilling center", location: "Bhavani BMC", time: "06:18 IST", temp: 3.8, block: "18,493", event: "Cold-room intake verified", icon: Warehouse },
  { title: "Transit tanker", location: "TN-38 / 2802", time: "08:06 IST", temp: 4.1, block: "18,494", event: "GPS + thermal ping anchored", icon: Truck },
  { title: "Processing plant", location: "Salem Central Dairy", time: "10:34 IST", temp: 4.0, block: "18,495", event: "Pasteurization cycle queued", icon: Factory },
  { title: "Retail cold hub", location: "Chennai South", time: "14:42 IST", temp: 3.7, block: "18,496", event: "Delivery custody confirmed", icon: Box },
];

function formatHash(step) {
  const hashes = ["0x7b8c...a91f", "0x8a2e...c40d", "0x91f4...7e2a", "0x2c7d...d981", "0x4f8b...91a"];
  return hashes[step];
}

export default function BlockchainSimulator() {
  const [activeStep, setActiveStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [events, setEvents] = useState([STAGES[0]]);
  const [liveTemperature, setLiveTemperature] = useState(STAGES[0].temp);
  const current = STAGES[activeStep];
  const progress = (activeStep / (STAGES.length - 1)) * 100;

  useEffect(() => {
    setLiveTemperature(current.temp);
  }, [current.temp]);

  useEffect(() => {
    const telemetryTimer = window.setInterval(() => {
      setLiveTemperature((temperature) => Number((temperature + (Math.random() - 0.5) * 0.12).toFixed(2)));
    }, 1500);
    return () => window.clearInterval(telemetryTimer);
  }, []);

  useEffect(() => {
    if (!isPlaying) return undefined;
    const timer = window.setInterval(() => {
      setActiveStep((step) => {
        if (step >= STAGES.length - 1) {
          setIsPlaying(false);
          return step;
        }
        return step + 1;
      });
    }, 2200);
    return () => window.clearInterval(timer);
  }, [isPlaying]);

  useEffect(() => {
    setEvents((previous) => {
      const next = STAGES[activeStep];
      if (previous.some((event) => event.block === next.block)) return previous;
      return [...previous, next].slice(-4);
    });
  }, [activeStep]);

  const statusLabel = useMemo(() => activeStep === STAGES.length - 1 ? "JOURNEY COMPLETE" : isPlaying ? "SIMULATION RUNNING" : "READY TO PLAY", [activeStep, isPlaying]);

  const stepForward = () => {
    setActiveStep((step) => Math.min(step + 1, STAGES.length - 1));
    setIsPlaying(false);
  };

  const reset = () => {
    setActiveStep(0);
    setEvents([STAGES[0]]);
    setIsPlaying(false);
  };

  return (
    <section className="relative overflow-hidden rounded-2xl border border-[#cfe5d4] bg-[#f5fbf6] shadow-sm">
      <div className="absolute -right-20 -top-28 h-64 w-64 rounded-full bg-[#d8f1de] blur-3xl opacity-70" />
      <div className="relative p-5 md:p-7">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2"><span className="inline-flex items-center gap-1.5 rounded-full bg-[#164d33] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[.14em] text-white"><Radio className="h-3 w-3" /> Interactive simulator</span><span className="text-[10px] font-bold uppercase tracking-[.14em] text-[#2d8b57]">{statusLabel}</span></div>
            <h2 className="mt-3 text-xl font-bold text-[#123b2a]">Watch a batch move through the blockchain</h2>
            <p className="mt-1 max-w-2xl text-sm leading-relaxed text-slate-500">Replay each custody handoff and see how telemetry becomes a signed, verifiable event on the DairyChain network.</p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <button type="button" onClick={() => setIsPlaying((playing) => !playing)} className="inline-flex items-center gap-2 rounded-lg bg-[#164d33] px-3 py-2 text-xs font-bold text-white shadow-sm hover:bg-[#216a45]">{isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}{isPlaying ? "Pause" : "Play journey"}</button>
            <button type="button" onClick={stepForward} disabled={activeStep === STAGES.length - 1} className="inline-flex items-center gap-2 rounded-lg border border-[#b8d8bf] bg-white px-3 py-2 text-xs font-bold text-[#164d33] hover:bg-[#edf8ef] disabled:cursor-not-allowed disabled:opacity-40"><SkipForward className="h-3.5 w-3.5" /> Step</button>
            <button type="button" onClick={reset} aria-label="Reset simulation" className="rounded-lg border border-[#b8d8bf] bg-white p-2 text-[#164d33] hover:bg-[#edf8ef]"><RotateCcw className="h-3.5 w-3.5" /></button>
          </div>
        </div>

        <div className="mt-8 rounded-xl border border-[#dcebe0] bg-white/80 p-4 md:p-6">
          <div className="relative px-1 md:px-4">
            <div className="absolute left-[10%] right-[10%] top-7 h-1 rounded-full bg-[#e4efe6]" /><div className="absolute left-[10%] top-7 h-1 rounded-full bg-[#36a866] transition-all duration-700" style={{ width: `${progress * 0.8}%` }} /><div className="pointer-events-none absolute left-[10%] right-[10%] top-[22px] h-2 overflow-hidden rounded-full"><span className="route-flow absolute left-0 top-0 h-1.5 w-10 rounded-full bg-white/80 shadow-[0_0_10px_#ffffff]" /><span className="route-flow route-flow-delay absolute left-0 top-0 h-1.5 w-10 rounded-full bg-white/70 shadow-[0_0_10px_#ffffff]" /></div>
            <div className="route-vehicle absolute top-[10px] z-20 -ml-3 flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-[#164d33] text-[#f6e1ae] shadow-lg" style={{ left: `${10 + progress * 0.8}%` }}><Truck className="h-3.5 w-3.5" /></div>
            <div className="relative grid grid-cols-5 gap-1">{STAGES.map((stage, index) => { const Icon = stage.icon; const done = index <= activeStep; const active = index === activeStep; return <button type="button" key={stage.title} onClick={() => { setActiveStep(index); setIsPlaying(false); }} className="group flex min-w-0 flex-col items-center text-center"><span className={`relative z-10 flex h-14 w-14 items-center justify-center rounded-2xl border-4 border-white shadow-sm transition-all duration-500 ${done ? "bg-[#2d8b57] text-white" : "bg-[#e9f1ea] text-[#9bb7a1]"} ${active ? "scale-110 ring-4 ring-[#bfe6c8]" : ""}`}><Icon className="h-5 w-5" />{active && <span className="absolute inset-0 rounded-2xl border border-white/70 animate-ping" />}</span><span className={`mt-3 text-[10px] font-bold uppercase tracking-wide md:text-xs ${active ? "text-[#164d33]" : "text-slate-400"}`}>{stage.title}</span><span className="mt-1 hidden text-[10px] text-slate-400 md:block">{stage.location}</span></button>; })}</div>
          </div>

          <div className="mt-8 grid gap-4 lg:grid-cols-[1.1fr_.9fr]">
            <div className="rounded-xl bg-[#123b2a] p-5 text-white"><div className="flex items-center justify-between"><div><p className="text-[10px] font-bold uppercase tracking-[.16em] text-[#a8e6bb]">Current checkpoint</p><h3 className="mt-1 text-2xl font-semibold">{current.title}</h3><p className="mt-1 text-sm text-white/60">{current.location} · {current.time}</p></div><div className="telemetry-beat rounded-xl bg-white/10 p-3"><ShieldCheck className="h-7 w-7 text-[#a8e6bb]" /></div></div><div className="mt-6 grid grid-cols-3 gap-3"><div><p className="text-[10px] uppercase tracking-wider text-white/45">Live temperature</p><p className="live-number mt-1 text-xl font-semibold">{liveTemperature.toFixed(2)}°C</p></div><div><p className="text-[10px] uppercase tracking-wider text-white/45">Block</p><p className="mt-1 font-mono text-sm">#{current.block}</p></div><div><p className="text-[10px] uppercase tracking-wider text-white/45">Integrity</p><p className="mt-1 text-xl font-semibold text-[#a8e6bb]">100%</p></div></div><div className="mt-5 flex items-center gap-2 border-t border-white/10 pt-4 text-xs text-white/65"><CheckCircle2 className="h-4 w-4 text-[#a8e6bb]" /> {current.event} · sensor ping just now</div></div>
            <div className="rounded-xl border border-[#dcebe0] bg-[#f9fdf9] p-5"><div className="flex items-center justify-between"><p className="text-[10px] font-bold uppercase tracking-[.16em] text-slate-400">Latest chain events</p><span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#2d8b57]"><Zap className="h-3 w-3" /> LIVE</span></div><div className="mt-4 space-y-3">{events.slice().reverse().map((event) => <div key={event.block} className="flex items-start gap-3 border-b border-[#e6f0e7] pb-3 last:border-0 last:pb-0"><span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-[#e5f5e8] text-[#2d8b57]"><Box className="h-3.5 w-3.5" /></span><div className="min-w-0"><p className="truncate text-xs font-bold text-[#164d33]">{event.event}</p><p className="mt-0.5 font-mono text-[10px] text-slate-400">Block #{event.block} · {formatHash(STAGES.indexOf(event))}</p></div></div>)}</div></div>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-[10px] text-slate-400"><span>Demo batch: <strong className="font-mono text-slate-500">MILK001</strong> · Erode → Chennai South</span><span>Click any checkpoint to inspect its proof</span></div>
      </div>
    </section>
  );
}
