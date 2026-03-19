import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
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
  const hasData = data && data.length > 1;
  
  // 1. Label Logic: Get first and last time strings for the X-Axis
  const startTick = hasData ? data[0].displayTime : "";
  const endTick = hasData ? data[data.length - 1].displayTime : "";
  const ticks = [startTick, endTick];

  // 2. Dynamic Y-Axis Scaling Logic
  // We calculate the min/max of the current dataset to "zoom in" on the trend
  const values = data.map(d => Number(d.value)).filter(v => !isNaN(v));
  const minVal = values.length ? Math.min(...values) : 0;
  const maxVal = values.length ? Math.max(...values) : 100;
  
  // Add 10% padding so the line doesn't hit the very top/bottom of the grid
  const range = maxVal - minVal;
  const padding = range === 0 ? 1 : range * 0.1; 
  const yDomain = [minVal - padding, maxVal + padding];

  return (
    <div className="glass-card rounded-xl p-2 md:p-5 relative overflow-hidden border border-white/5 bg-slate-950/40 backdrop-blur-md">
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
            <span className="text-[9px] font-bold text-emerald-500/80 uppercase tracking-widest">Live</span>
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
          
          <CartesianGrid 
            vertical={false} 
            strokeDasharray="3 3" 
            stroke="hsla(var(--border), 0.1)" 
          />
          
          <XAxis
            dataKey="displayTime"
            ticks={ticks}
            interval={0}
            padding={{ left: 5, right: 5 }}
            tickLine={false}
            axisLine={false}
            tick={(props) => {
              const { x, y, payload } = props;
              const isLast = payload.value === endTick;
              return (
                <text 
                  x={x} 
                  y={y + 15} 
                  fill="hsl(var(--muted-foreground))" 
                  fontSize={10} 
                  fontWeight="700" 
                  textAnchor={isLast ? "end" : "start"}
                  style={{ opacity: 0.5 }}
                >
                  {payload.value}
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
                    <p className="text-sm font-black flex items-center gap-2" style={{ color }}>
                      {title} 
                      <span className="text-white/20 text-[10px]">|</span> 
                      <span className="text-slate-100">
                        {isNaN(val) ? "---" : val.toFixed(1)}{unit}
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
              fill: color 
            }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TrendChart;
