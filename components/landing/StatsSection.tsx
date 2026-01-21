"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { CHART_DATA } from "./constants";

export function StatsSection() {
  return (
    <section id="stats" className="py-24 bg-background">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row items-start gap-12">
          {/* Chart Area */}
          <div className="w-full md:w-2/3 bg-card border border-border p-8 shadow-lg">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-lg font-medium text-foreground">Efficiency Breakdown</h3>
                <p className="text-sm text-muted-foreground">Time spent per transaction (seconds)</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 bg-primary"></span>
                <span className="text-xs text-muted-foreground">Performance</span>
              </div>
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={CHART_DATA}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={false} />
                  <XAxis type="number" stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis dataKey="name" type="category" stroke="#FAFAFA" fontSize={12} tickLine={false} axisLine={false} width={100} />
                  <Tooltip
                    cursor={{ fill: "transparent" }}
                    contentStyle={{ backgroundColor: "#1E293B", borderColor: "#334155", borderRadius: "0px" }}
                    itemStyle={{ color: "#FAFAFA" }}
                  />
                  <Bar dataKey="time" radius={[0, 0, 0, 0]} barSize={32}>
                    {CHART_DATA.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === 2 ? "#2A9D8F" : "#334155"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Content Area */}
          <div className="w-full md:w-1/3 space-y-8">
            <div className="inline-flex items-center space-x-2">
              <span className="w-1.5 h-1.5 rounded-none bg-primary" />
              <span className="text-xs font-bold tracking-widest text-muted-foreground uppercase">
                Smart Insights
              </span>
            </div>
            <h2 className="font-serif text-3xl md:text-4xl leading-tight text-foreground">
              Improve as you go
            </h2>
            <p className="text-muted-foreground leading-relaxed font-light">
              SplitThat learns from your corrections. The more receipts you scan, the smarter our item assignment becomes.
            </p>

            <div className="border-t border-border pt-8 space-y-6">
              <div>
                <div className="text-3xl font-light text-foreground mb-1">99.8%</div>
                <div className="text-sm text-muted-foreground uppercase tracking-wider">Parsing Accuracy</div>
              </div>
              <div>
                <div className="text-3xl font-light text-foreground mb-1">10x</div>
                <div className="text-sm text-muted-foreground uppercase tracking-wider">Faster than manual entry</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
