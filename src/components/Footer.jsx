export default function Footer() {
  const links = ["Smart Contracts", "Cold Chain Protocol", "Audit Logs", "API Docs", "Privacy Policy"];
  return (
    <footer className="bg-[#123b2a] text-white py-8">
      <div className="mx-auto max-w-7xl px-4 md:px-8 flex flex-col md:flex-row items-center justify-between gap-5">
        <div className="flex items-center gap-2"><span className="w-7 h-7 rounded-lg bg-[#2d8b57] flex items-center justify-center text-xs font-bold">D</span><span className="font-semibold text-base">Dairy<span className="text-[#a8e6bb]">Chain</span></span></div>
        <p className="text-xs text-white/50 text-center order-last md:order-none">© 2025 DairyChain Traceability Consortium · Tamil Nadu Milk Grid</p>
        <nav className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1">{links.map((label) => <a key={label} href="#" className="text-xs text-white/60 hover:text-[#a8e6bb]">{label}</a>)}</nav>
      </div>
    </footer>
  );
}
