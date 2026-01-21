"use client";

export function MathMockup() {
  const users = [
    { name: "Me", subtotal: 35.0, tax: 2.8, tip: 5.5, color: "bg-teal-600" },
    { name: "Kim", subtotal: 12.0, tax: 0.96, tip: 1.61, color: "bg-red-500" },
    { name: "Alex", subtotal: 18.5, tax: 1.48, tip: 1.64, color: "bg-slate-700" },
    { name: "Liz", subtotal: 18.0, tax: 1.44, tip: 1.92, color: "bg-blue-500" },
  ];

  return (
    <div className="w-full bg-white rounded-xl shadow-2xl overflow-hidden font-sans text-slate-900 select-none border border-slate-100">
      <div className="bg-white px-6 py-5 border-b border-slate-100">
        <h3 className="font-bold text-slate-800 text-sm">Fairness Breakdown</h3>
        <p className="text-slate-400 text-[10px] font-medium mt-1">Tax (8%) & Tip (15%) calculated proportionally</p>

        {/* Legend */}
        <div className="flex gap-4 mt-4">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-slate-300"></div>
            <span className="text-[10px] text-slate-500 font-medium uppercase tracking-wide">Item Cost</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-teal-500/30"></div>
            <span className="text-[10px] text-slate-500 font-medium uppercase tracking-wide">Tax</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-teal-500"></div>
            <span className="text-[10px] text-slate-500 font-medium uppercase tracking-wide">Tip</span>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {users.map((user, i) => {
          const total = user.subtotal + user.tax + user.tip;

          return (
            <div key={i} className="group">
              <div className="flex justify-between items-end mb-2">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${user.color}`}></div>
                  <span className="text-xs font-bold text-slate-700">{user.name}</span>
                </div>
                <span className="text-xs font-bold text-slate-900">${total.toFixed(2)}</span>
              </div>

              {/* Stacked Bar */}
              <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden flex">
                <div style={{ width: `${(user.subtotal / total) * 100}%` }} className="h-full bg-slate-300 group-hover:bg-slate-400 transition-colors"></div>
                <div style={{ width: `${(user.tax / total) * 100}%` }} className="h-full bg-teal-500/30"></div>
                <div style={{ width: `${(user.tip / total) * 100}%` }} className="h-full bg-teal-500"></div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-slate-50 px-6 py-3 border-t border-slate-100 text-[10px] text-center text-slate-400">
        Mathematically verified • Zero rounding errors
      </div>
    </div>
  );
}
