import React, { useState, useEffect, memo } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  ReferenceDot,
  ReferenceArea,
  Label,
  XAxis,
  YAxis,
} from "recharts";

interface TrendChartProps {
  title: string;
  data: any[];
  color: string;
  unit: string;
  range: string;
}

const TrendChart = ({ title, data, color, unit, range }: TrendChartProps) => {
  const hasData = data && data.length > 0;
  const startTimestamp = hasData ? data[0].timestamp : 0;
  const endTimestamp = hasData ? data[data.length - 1].timestamp : 0;

  const [minPoint, setMinPoint] = useState<any | null>(null);
  const [maxPoint, setMaxPoint] = useState<any | null>(null);

  useEffect(() => {
    if (!data || data.length === 0) {
      setMinPoint(null); setMaxPoint(null); return;
    }
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
  const yPadding = (maxVal - minVal) * 0.2 || 5;
  const yDomain = [minVal - yPadding, maxVal + yPadding];

  const gaps = data.filter(d => d.isGapMarker);

  const formatXAxis = (tickItem: number) => {
    const date = new Date(tickItem);
    return range === "1h" || range === "24h" 
      ? date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      : date.toLocaleDateString([], { month: "short", day: "numeric" });
  };

  return (
  <div className="glass-card rounded-xl p-2 optimize-gpu md:p-5 relative border border-white/5 bg-slate-950/40 backdrop-blur-md min-h-[350px] w-full overflow-visible">
    <style>{`
      /* DYNAMIC RADIUS LOGIC */
      :root { --chart-dot-radius: 3px; }
      @media (max-width: 850px) { :root { --chart-dot-radius: 2px; } }
      @media (max-width: 650px) { :root { --chart-dot-radius: 1px; } }

      .data-point { 
        r: var(--chart-dot-radius) !important; 
      }

      @keyframes ping-ripple { 75%, 100% { transform: scale(2.5); opacity: 0; } }
      .ping-dot > circle { 
        transform-origin: center; 
        transform-box: fill-box; 
        animation: ping-ripple 1.2s cubic-bezier(0, 0, 0.2, 1) infinite; 
      }
      
      @media (max-width: 450px) {
        .data-point {
          display: none !important;
        }
        .ping-dot {
          display: block !important;
          visibility: visible !important;
          opacity: 1 !important;
        }
      }
    `}</style>

    <div className="flex justify-between items-center mb-6 px-2">
      <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground opacity-70">
        {title} ({range})
      </h3>
      {hasData && (
        <div className="flex items-center gap-2">
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
          </span>
          <span className="text-[9px] font-bold text-emerald-500/80 uppercase tracking-widest">Live Window</span>
        </div>
      )}
    </div>

    <div className="h-[280px] md:h-[320px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 45, right: 30, left: 30, bottom: 20 }}>
          <defs>
            <linearGradient id={`grad-${title}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.4} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>

            <pattern 
              id="offlineHatch" 
              patternUnits="userSpaceOnUse" 
              width="6" 
              height="6" 
              patternTransform="rotate(45)"
            >
              <line 
                x1="0" y1="0" x2="0" y2="6" 
                stroke="#ff1e1e" 
                strokeOpacity="0.8" 
                strokeWidth="2.5" 
              />
            </pattern>
          </defs>

          <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="hsla(var(--border), 0.1)" />
          
          {gaps.map((gap, idx) => (
            <ReferenceArea
              key={idx}
              x1={gap.gapStart}
              x2={gap.gapEnd}
              fill="url(#offlineHatch)"
              stroke="rgba(239, 68, 68, 0.2)"
              strokeWidth={1}
            />
          ))}

          <XAxis
            dataKey="timestamp"
            type="number"
            domain={["dataMin", "dataMax"]}
            ticks={[startTimestamp, endTimestamp]}
            tickFormatter={formatXAxis}
            tick={{ fontSize: 10, fontWeight: 700, fill: "hsl(var(--muted-foreground))" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis hide domain={yDomain} />
          
          <Tooltip
            position={{ y: 0 }}
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const p = payload[0].payload;
                if (p.isGapMarker) return null;
                const date = new Date(p.timestamp);
                return (
                  <div className="bg-slate-900/95 backdrop-blur-xl border border-white/10 p-2.5 rounded-lg shadow-2xl">
                    <p className="text-[9px] font-bold text-muted-foreground/60 uppercase">{date.toLocaleString()}</p>
                    <p className="text-sm font-black flex items-center gap-2" style={{ color: color }}>
                      {title} <span className="text-slate-100">{Number(payload[0].value).toFixed(1)}{unit}</span>
                    </p>
                  </div>
                );
              }
              return null;
            }}
          />

          <Area
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={3}
            fill={`url(#grad-${title})`}
            connectNulls={false}
            isAnimationActive={false}
            dot={{
              className: "data-point", 
              fill: color, 
              fillOpacity: 0.5, 
              stroke: color, 
              strokeOpacity: 0.8 
            }}
            activeDot={{ className: "ping-dot", r: 5, stroke: "rgba(2, 6, 23, 1)", strokeWidth: 2, fill: color }}
          /> 

          {maxPoint && minPoint && maxPoint.id !== minPoint.id && (
            <ReferenceDot x={maxPoint.timestamp} y={maxPoint.value} r={5} fill="#4ade80" stroke="#020617" strokeWidth={2} className="ping-dot">
              <Label value={`MAX`} position="top" offset={10} fill="#10b981" fontSize={9} fontWeight="bold" />
            </ReferenceDot>
          )}
          
          {minPoint && (
            <ReferenceDot x={minPoint.timestamp} y={minPoint.value} r={5} fill="#f87171" stroke="#020617" strokeWidth={2} className="ping-dot">
              <Label value={`MIN`} position="bottom" offset={10} fill="#f87171" fontSize={9} fontWeight="bold" />
            </ReferenceDot>
          )}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  </div>
  );
};

export default memo(TrendChart);
