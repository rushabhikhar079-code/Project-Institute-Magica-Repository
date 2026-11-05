function LeftPanel() {
  const features = [
    { icon: "🏫", text: "Manage multiple branches with a single login" },
    { icon: "📊", text: "Fees, attendance, marks, payroll & more — all in one place" },
    { icon: "📋", text: "One-click reports: outstanding fees, absenteeism, payments" },
    { icon: "🎥", text: "Live virtual classes & online tests built right in" },
  ];

  return (
    <div className="relative overflow-hidden flex flex-col justify-between p-10 lg:p-14 bg-[#0f4c81] min-h-[480px] lg:min-h-0">
      {/* Background geometry */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-white/5" />
        <div className="absolute top-1/3 -left-16 w-64 h-64 rounded-full bg-white/5" />
        <div className="absolute -bottom-16 right-10 w-48 h-48 rounded-full bg-[#fdc700]/10" />
        <div className="absolute top-20 right-1/4 w-3 h-3 rounded-full bg-[#fdc700]" />
        <div className="absolute top-40 right-10 w-2 h-2 rounded-full bg-white/40" />
        <div className="absolute bottom-32 left-1/3 w-2.5 h-2.5 rounded-full bg-[#fdc700]/60" />
        {/* Grid lines */}
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: "linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)", backgroundSize: "48px 48px" }} />
      </div>

      {/* Logo */}
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-[#0f4c81] font-black text-lg">E</span>
          </div>
          <span className="text-white font-bold text-xl tracking-tight">Institute Magica</span>
        </div>
      </div>

      {/* Hero text */}
      <div className="relative z-10 my-8">
        <p className="text-[#fdc700] text-sm font-semibold tracking-widest uppercase mb-3">Institute Management</p>
        <h1 className="text-white text-3xl xl:text-4xl font-bold leading-snug">
          Run your institute<br />
          <span className="text-[#fdc700]">smarter, faster.</span>
        </h1>
        <p className="text-white/60 text-sm mt-4 leading-relaxed max-w-xs">
          Everything you need to manage students, staff, fees, and academics — in one platform.
        </p>
      </div>

      {/* Features */}
      <div className="relative z-10 space-y-3">
        {features.map((f, i) => (
          <div key={i} className="flex items-start gap-3 bg-white/8 rounded-xl px-4 py-3 backdrop-blur-sm">
            <span className="text-base mt-0.5">{f.icon}</span>
            <p className="text-white/80 text-sm leading-snug">{f.text}</p>
          </div>
        ))}
      </div>

      {/* Version */}
      <p className="relative z-10 text-white/30 text-xs mt-8">Version 10.0.0</p>
    </div>
  );
}
export default LeftPanel