"use client";

export function AppMockup() {
  const items = [
    { name: "Fresh Banana", price: 1.18, assigned: ["Me", "N", "S"] },
    { name: "Roma Tomato", price: 2.05, assigned: ["Me", "N"] },
    { name: "Yellow Onion", price: 3.18, assigned: ["Me", "N", "A"] },
    { name: "Jalapeno Seasoning", price: 3.48, assigned: ["Me"] },
    { name: "Microwave Popcorn", price: 4.83, assigned: ["Me", "S"] },
  ];

  return (
    <div className="w-full bg-white rounded-xl shadow-2xl overflow-hidden font-sans text-slate-900 select-none border border-slate-100">
      {/* Simplified Header */}
      <div className="bg-white border-b border-slate-100 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center text-teal-700">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
            </svg>
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-sm">Grocery Receipt</h3>
            <p className="text-slate-400 text-[10px] uppercase tracking-wider font-medium">Jan 12 • 5 Items</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">My Share</div>
          <div className="text-lg font-bold text-teal-600">$43.30</div>
        </div>
      </div>

      {/* Clean List */}
      <div className="divide-y divide-slate-50">
        {items.map((item, i) => (
          <div key={i} className="px-6 py-3.5 flex items-center justify-between hover:bg-slate-50 transition-colors group">
            <div className="flex-1 min-w-0 pr-4">
              <div className="font-medium text-slate-700 text-sm truncate">{item.name}</div>
            </div>

            <div className="flex items-center gap-4">
              {/* Simplified Avatars */}
              <div className="flex -space-x-2">
                {item.assigned.map((user, idx) => (
                  <div
                    key={idx}
                    className={`w-6 h-6 rounded-full border-2 border-white flex items-center justify-center text-[8px] font-bold text-white shadow-sm
                      ${user === "Me" ? "bg-teal-600 z-10" :
                        user === "N" ? "bg-red-500" :
                        user === "S" ? "bg-slate-700" : "bg-blue-500"}`}
                  >
                    {user}
                  </div>
                ))}
              </div>
              <div className="w-12 text-right font-medium text-slate-600 text-sm">
                ${item.price.toFixed(2)}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Simplified Action Footer */}
      <div className="bg-slate-50 px-6 py-4 border-t border-slate-100">
        <button className="w-full bg-slate-900 hover:bg-slate-800 text-white py-3 rounded-lg font-medium shadow-lg shadow-slate-900/10 transition-all active:scale-[0.98] text-sm flex items-center justify-center gap-2">
          <span>Confirm Split</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M5 12l5 5l10 -10" />
          </svg>
        </button>
      </div>
    </div>
  );
}
