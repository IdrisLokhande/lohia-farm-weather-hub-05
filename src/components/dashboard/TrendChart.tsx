import React, { useState, useEffect, memo } from "react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, ReferenceDot, ReferenceArea, Label, XAxis, YAxis } from "recharts";

interface TrendChartProps { title: string; data: any[]; color: string; unit: string; range: string; t: any; }

const TrendChart = ({ title, data, color, unit, range, t }: TrendChartProps) => {
  const [minPoint, setMinPoint] = useState<any | null>(null);
  const [maxPoint, setMaxPoint] = useState<any | null>(null);

  useEffect(() => {
    if (!data || data.length === 0) { setMinPoint(null); setMaxPoint(null); return; }
    let minP = null, maxP = null;
    for (const point of data) {
      if (point.value === null) continue;
      const val = Number(point.value);
      if (!minP || val < Number(minP.value)) minP = point;
      if (!maxP || val > Number(maxP.value)) maxP = point;
    }
    setMinPoint(minP); setMaxPoint(maxP);
  }, [data]);

  const values = data.map(d => d.value).filter(v => v !== null && !isNaN(v));
  const minVal = values.length ? Math.min(...values) : 0;
  const maxVal = values.length ? Math.max(...values) : 100;
  const yPadding = (maxVal - minVal) * 0.22 || 12;
  const yDomain = [minVal - yPadding, maxVal + yPadding];

  const formatXAxis = (tickItem: number) => {
    const date = new Date(tickItem);
    return range === "1h" || range === "24h" 
      ? date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      : date.toLocaleDateString([], { month: "short", day: "numeric" });
  };

  return (
    <div className="w-full h-full flex flex-col">
      <style>{`
        @keyframes chart-ripple { 75%, 100% { transform: scale(2); opacity: 0; } }
        .ping-dot > circle { transform-origin: center; transform-box: fill-box; animation: chart-ripple 1.4s ease-out infinite; }
      `}</style>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 25, right: 100, left: 100, bottom: 15 }}>
          <defs>
            <linearGradient id={`grad-${title}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.4} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
            <pattern id="offlineHatch" patternUnits="userSpaceOnUse" width="6" height="6" patternTransform="rotate(45)">
              <line x1="0" y1="0" x2="0" y2="6" stroke="#ff1e1e" strokeOpacity="0.8" strokeWidth="3" />
            </pattern>
          </defs>
          <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="hsla(var(--border), 0.1)" />
          {data.filter(d => d.isGapMarker).map((gap, idx) => (
            <ReferenceArea key={idx} x1={gap.gapStart} x2={gap.gapEnd} fill="url(#offlineHatch)" fillOpacity={1} />
          ))}
          <XAxis 
            dataKey="timestamp" 
            type="number" 
            domain={["dataMin", "dataMax"]} 
            tickCount={range === "1h" ? 4 : range === "24h" ? 8 : range === "7d" ? 14 : 20} 
            interval={0} 
            padding={{ left: 100, right: 100 }} 
            tickFormatter={formatXAxis} 
            tick={{ fontSize: 9, fontWeight: 900, fill: "hsl(var(--muted-foreground))" }} 
            axisLine={false} 
            tickLine={false} 
            dy={10} 
          />
          <YAxis hide domain={yDomain} />
          <Tooltip position={{ y: 0 }} content={({ active, payload }) => {
            if (active && payload?.[0]) {
              const p = payload[0].payload; if (p.isGapMarker) return null;
              return (
                <div className="bg-slate-900/95 border border-white/10 p-2 rounded-lg shadow-xl">
                  <p className="text-[8px] font-bold text-slate-400 uppercase">{new Date(p.timestamp).toLocaleString()}</p>
                  <p className="text-xs font-black text-white" style={{ color: color }}>{Number(payload[0].value).toFixed(1)}{unit}</p>
                </div>
              );
            }
            return null;
          }} />
          <Area type="monotone" dataKey="value" stroke={color} strokeWidth={3} fill={`url(#grad-${title})`} connectNulls={false} isAnimationActive={false} activeDot={{ r: 4, fill: color, stroke: "#020617", strokeWidth: 2 }} /> 
          {maxPoint && (
            <ReferenceDot x={maxPoint.timestamp} y={maxPoint.value} r={4} fill="#10b981" stroke="#020617" strokeWidth={2} className="ping-dot">
              <Label value="MAX" position="top" offset={10} fill="#10b981" fontSize={9} fontWeight="900" />
            </ReferenceDot>
          )}
          {minPoint && (
            <ReferenceDot x={minPoint.timestamp} y={minPoint.value} r={4} fill="#f87171" stroke="#020617" strokeWidth={2} className="ping-dot">
              <Label value="MIN" position="bottom" offset={10} fill="#f87171" fontSize={9} fontWeight="900" />
            </ReferenceDot>
          )}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default memo(TrendChart);
