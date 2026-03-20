import React, { useState, useEffect } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  ReferenceDot,
  ReferenceLine,
  Label,
  XAxis,
  YAxis,
} from "recharts";

interface TrendChartProps {
  title: string;
  data: any[];
  color: string;
  unit: string;
}

const TrendChart = ({ title, data, color, unit }: TrendChartProps) => {
  const hasData = data && data.length > 0;

  // 1. Label Logic: Get first and last time strings for the X-Axis
  // We now use timestamps for the axis, which is more robust for time-series data.
  const startTimestamp = hasData ? data[0].timestamp : 0;
  const endTimestamp = hasData ? data[data.length - 1].timestamp : 0;

  // --- REFACTORED LOGIC WITH DEBUGGING ---
  const [minPoint, setMinPoint] = useState<any | null>(null);
  const [maxPoint, setMaxPoint] = useState<any | null>(null);

  useEffect(() => {
    // console.log("[TrendChart] Received data:", data); // Keep this commented unless actively debugging
    if (!data || data.length === 0) {
      console.warn("[TrendChart] Data is empty, skipping min/max calculation.");
      setMinPoint(null);
      setMaxPoint(null);
      return;
    }

    let minP: any = null;
    let maxP: any = null;

    for (const point of data) {
      const value = Number(point.value);
      if (isNaN(value)) continue;

      if (minP === null || value < Number(minP.value)) {
        minP = point;
      }
      if (maxP === null || value > Number(maxP.value)) {
        maxP = point;
      }
    }

    // console.log("[TrendChart] Calculated Min/Max points:", { minP, maxP });

    setMinPoint(minP);
    setMaxPoint(maxP);
  }, [data]);
  // --- END REFACTORED LOGIC ---

  const values = data.map(d => Number(d.value)).filter(v => !isNaN(v));
  const minVal = values.length ? Math.min(...values) : 0;
  const maxVal = values.length ? Math.max(...values) : 100;

  // Add 20% padding to make space for min/max labels
  const range = maxVal - minVal;
  const padding = range === 0 ? 5 : range * 0.2;
  const yDomain = [minVal - padding, maxVal + padding];

  const areMinMaxSame = minPoint && maxPoint && minPoint.id === maxPoint.id;

  // We now only show start and end ticks on the axis. Min/Max times are in the labels.
  const uniqueTicks = [startTimestamp, endTimestamp].filter(t => t > 0);

  return (
    <div className="glass-card rounded-xl p-2 md:p-5 relative overflow-hidden border border-white/5 bg-slate-950/40 backdrop-blur-md">
      {/* Style for the animated dots */}
      <style>{`
        @keyframes inplace-blink { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
        .blinking-dot > circle { animation: inplace-blink 1.5s ease-in-out infinite; }
      `}</style>
      {/* Header Section */}
      <div className="flex justify-between items-center mb-6 px-2">
        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground opacity-70">
          {title} Trend
        </h3>
        {hasData && (
          <div className="flex items-center gap-2">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
            </span>
            <span className="text-[9px] font-bold text-emerald-500/80 uppercase tracking-widest">
              Live
            </span>
          </div>
        )}
      </div>

      <ResponsiveContainer width="100%" height={250}>
        <AreaChart data={data} margin={{ top: 45, right: 30, left: 30, bottom: 20 }}>
          <defs>
            <linearGradient id={`grad-${title}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.4} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>

          <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="hsla(var(--border), 0.1)" />

          <XAxis
            dataKey="timestamp"
            type="number"
            domain={["dataMin", "dataMax"]}
            ticks={uniqueTicks}
            interval={0}
            padding={{ left: 5, right: 5 }}
            tickLine={false}
            axisLine={false}
            tick={props => {
              const { x, y, payload } = props;
              const isLast = payload.value === endTimestamp;
              const formattedTime = new Date(payload.value).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              });
              return (
                <text
                  x={x}
                  y={y + 15}
                  fill="hsl(var(--muted-foreground))"
                  fontSize={10}
                  fontWeight="700"
                  textAnchor={isLast ? "end" : "start"}
                  className="opacity-50"
                >
                  {formattedTime}
                </text>
              );
            }}
          />

          <YAxis hide={true} domain={yDomain} />

          <Tooltip
            position={{ y: 0 }} // Affixed to the top of the chart
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const p = payload[0].payload;
                const val = Number(payload[0].value);
                return (
                  <div className="flex flex-col items-start bg-slate-900/90 backdrop-blur-xl border border-white/10 p-2.5 rounded-lg shadow-2xl transition-all duration-300">
                    <p className="text-[9px] font-bold text-muted-foreground/60 uppercase tracking-tighter">
                      {p.fullTime}
                    </p>
                    <p
                      className="text-sm font-black flex items-center gap-2"
                      style={{ color: color }}
                    >
                      {title}
                      <span className="text-white/20 text-[10px]">|</span>
                      <span className="text-slate-100">
                        {isNaN(val) ? "---" : val.toFixed(1)}
                        {unit}
                      </span>
                    </p>
                  </div>
                );
              }
              return null;
            }}
            cursor={{ stroke: color, strokeWidth: 1, opacity: 0.4 }}
          />

          <Area
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={3}
            fill={`url(#grad-${title})`}
            animationDuration={1000}
            connectNulls={true}
            activeDot={{
              r: 5,
              stroke: "rgba(2, 6, 23, 1)", // Match background for a "cutout" look
              strokeWidth: 2,
              fill: color,
            }}
          />

          {/* Reference Lines for Min/Max points (rendered after Area, before Dots) */}
          {maxPoint && !areMinMaxSame && (
            <ReferenceLine
              x={maxPoint.timestamp}
              stroke="hsl(var(--muted-foreground))"
              strokeOpacity={0.5}
              strokeDasharray="3 3"
            />
          )}
          {minPoint && (
            <ReferenceLine
              x={minPoint.timestamp}
              stroke="hsl(var(--muted-foreground))"
              strokeOpacity={0.5}
              strokeDasharray="3 3"
            />
          )}

          {/* Min/Max Value Dots and Labels */}
          {(() => {
            if (maxPoint && !areMinMaxSame) {
              const props = { x: maxPoint.timestamp, y: Number(maxPoint.value) };
              if (
                typeof props.x !== "number" ||
                typeof props.y !== "number" ||
                isNaN(props.x) ||
                isNaN(props.y)
              ) {
                console.error("[DOT FAILURE] Skipping MAX dot due to invalid props:", {
                  maxPoint,
                  props,
                });
                return null;
              }
              return (
                <ReferenceDot
                  {...props}
                  className="blinking-dot"
                  r={6}
                  fill="#4ade80"
                  stroke="#020617"
                  strokeWidth={2}
                  isFront={true}
                >
                  <Label
                    value={`Max: ${Number(maxPoint.value).toFixed(1)}${unit} (${
                      maxPoint.displayTime
                    })`}
                    position="top"
                    offset={12}
                    fill="hsl(var(--muted-foreground))"
                    fontSize={10}
                    fontWeight="bold"
                    style={{ opacity: 0.9 }}
                  />
                </ReferenceDot>
              );
            }
            return null;
          })()}

          {(() => {
            if (minPoint) {
              const props = { x: minPoint.timestamp, y: Number(minPoint.value) };
              if (
                typeof props.x !== "number" ||
                typeof props.y !== "number" ||
                isNaN(props.x) ||
                isNaN(props.y)
              ) {
                console.error("[DOT FAILURE] Skipping MIN dot due to invalid props:", {
                  minPoint,
                  props,
                });
                return null;
              }
              return (
                <ReferenceDot
                  {...props}
                  className="blinking-dot"
                  r={6}
                  fill={areMinMaxSame ? "#a3a3a3" : "#f87171"}
                  stroke="#020617"
                  strokeWidth={2}
                  isFront={true}
                >
                  <Label
                    value={
                      areMinMaxSame
                        ? `${Number(minPoint.value).toFixed(1)}${unit} (${minPoint.displayTime})`
                        : `Min: ${Number(minPoint.value).toFixed(1)}${unit} (${
                            minPoint.displayTime
                          })`
                    }
                    position={areMinMaxSame ? "top" : "bottom"}
                    offset={12}
                    fill="hsl(var(--muted-foreground))"
                    fontSize={10}
                    fontWeight="bold"
                    style={{ opacity: 0.9 }}
                  />
                </ReferenceDot>
              );
            }
            return null;
          })()}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TrendChart;
