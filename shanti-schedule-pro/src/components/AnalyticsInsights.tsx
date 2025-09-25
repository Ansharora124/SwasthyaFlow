import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from '@/components/ui/chart';
import { LineChart, Line, CartesianGrid, XAxis, YAxis, PieChart, Pie, Cell, ResponsiveContainer, AreaChart, Area, BarChart, Bar } from 'recharts';
import { Activity, CheckCircle, XCircle, TrendingUp, TrendingDown, Clock, Users } from 'lucide-react';

interface AnalyticsSummary {
  timestamp: string;
  statusCounts: Record<string, number>;
  hourly: { hour: number; scheduled: number; completed: number; cancelled: number }[];
  successRate: number;
  totalSessions: number;
  recentActivity: Array<{
    time: string;
    action: string;
    patient: string;
    therapy: string;
  }>;
  trends: {
    completionTrend: number;
    cancellationRate: number;
    averageSessionsPerDay: number;
  };
}

const STATUS_COLORS: Record<string, string> = {
  scheduled: 'hsl(var(--primary))',
  completed: 'hsl(var(--success,140, 70%, 40%))',
  cancelled: 'hsl(var(--destructive,0, 70%, 50%))'
};

const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:4000';

const AnalyticsInsights: React.FC = () => {
  const [data, setData] = useState<AnalyticsSummary | null>(null);
  const [sseFailed, setSseFailed] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');

  useEffect(() => {
    let es: EventSource | null = null;
    let poll: any;

    async function fetchSummary() {
      try {
        const res = await fetch(`${apiBase}/api/analytics/summary`, { credentials: 'include' });
        if (res.ok) {
          const json = await res.json();
          setData(json);
          setConnectionStatus('connected');
        }
      } catch {
        setConnectionStatus('disconnected');
      }
    }

    fetchSummary();

    try {
      es = new EventSource(`${apiBase}/api/analytics/stream`, { withCredentials: true } as any);
      es.onopen = () => setConnectionStatus('connected');
      es.onmessage = (e) => {
        try { 
          setData(JSON.parse(e.data)); 
          setConnectionStatus('connected');
        } catch {}
      };
      es.onerror = () => {
        setSseFailed(true);
        setConnectionStatus('disconnected');
        es?.close();
      };
    } catch {
      setSseFailed(true);
      setConnectionStatus('disconnected');
    }

    if (sseFailed) {
      poll = setInterval(fetchSummary, 7000);
    }

    return () => {
      es?.close();
      if (poll) clearInterval(poll);
    };
  }, [sseFailed]);

  const pieData = useMemo(() => data ? Object.entries(data.statusCounts).map(([name, value]) => ({ name, value })) : [], [data]);
  const lineData = useMemo(() => data ? data.hourly.filter(h => h.scheduled || h.completed || h.cancelled) : [], [data]);
  
  const statusIndicator = connectionStatus === 'connected' ? '🟢' : connectionStatus === 'connecting' ? '🟡' : '🔴';

  return (
    <Card className="border-border bg-card overflow-hidden">
      <CardHeader>
        <CardTitle className="text-foreground flex items-center justify-between">
          Analytics & Insights
          <div className="flex items-center gap-2 text-xs">
            <span>{statusIndicator}</span>
            <span className="text-muted-foreground capitalize">{connectionStatus}</span>
          </div>
        </CardTitle>
        <CardDescription>Real-time therapy session metrics with live updates</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {!data && <div className="text-sm text-muted-foreground">Loading analytics...</div>}
        {data && (
          <>
            {/* Enhanced Stats Cards with Trends */}
            <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-4">
              <div className="p-3 rounded-lg bg-muted/40 flex flex-col">
                <span className="text-xs text-muted-foreground mb-1 flex items-center gap-1"><Activity className="h-3 w-3" /> Scheduled</span>
                <span className="text-xl font-bold text-foreground">{data.statusCounts.scheduled || 0}</span>
              </div>
              <div className="p-3 rounded-lg bg-muted/40 flex flex-col">
                <span className="text-xs text-muted-foreground mb-1 flex items-center gap-1"><CheckCircle className="h-3 w-3 text-success" /> Completed</span>
                <span className="text-xl font-bold text-foreground">{data.statusCounts.completed || 0}</span>
              </div>
              <div className="p-3 rounded-lg bg-muted/40 flex flex-col">
                <span className="text-xs text-muted-foreground mb-1 flex items-center gap-1"><XCircle className="h-3 w-3 text-destructive" /> Cancelled</span>
                <span className="text-xl font-bold text-foreground">{data.statusCounts.cancelled || 0}</span>
              </div>
              <div className="p-3 rounded-lg bg-muted/40 flex flex-col">
                <span className="text-xs text-muted-foreground mb-1">Success Rate</span>
                <span className="text-xl font-bold text-foreground">{data.successRate.toFixed(1)}%</span>
              </div>
              <div className="p-3 rounded-lg bg-muted/40 flex flex-col">
                <span className="text-xs text-muted-foreground mb-1 flex items-center gap-1"><Users className="h-3 w-3" /> Total Sessions</span>
                <span className="text-xl font-bold text-foreground">{data.totalSessions}</span>
              </div>
              <div className="p-3 rounded-lg bg-muted/40 flex flex-col">
                <span className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                  {data.trends.completionTrend >= 0 ? <TrendingUp className="h-3 w-3 text-success" /> : <TrendingDown className="h-3 w-3 text-destructive" />}
                  Trend
                </span>
                <span className={`text-xl font-bold ${data.trends.completionTrend >= 0 ? 'text-success' : 'text-destructive'}`}>
                  {data.trends.completionTrend > 0 ? '+' : ''}{data.trends.completionTrend.toFixed(1)}%
                </span>
              </div>
            </div>

            {/* Enhanced Charts Grid */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Hourly Activity Chart */}
              <div className="h-64">
                <h3 className="text-sm font-medium text-foreground mb-2">Hourly Session Activity</h3>
                <ChartContainer
                  config={{
                    scheduled: { label: 'Scheduled', color: 'hsl(var(--primary))' },
                    completed: { label: 'Completed', color: 'hsl(var(--success,140, 70%, 40%))' },
                    cancelled: { label: 'Cancelled', color: 'hsl(var(--destructive,0, 70%, 50%))' }
                  }}
                  className="h-full"
                >
                  <AreaChart data={lineData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorScheduled" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--color-scheduled,#8884d8)" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="var(--color-scheduled,#8884d8)" stopOpacity={0.1}/>
                      </linearGradient>
                      <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--color-completed,#82ca9d)" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="var(--color-completed,#82ca9d)" stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border/40" />
                    <XAxis dataKey="hour" tick={{ fontSize: 10 }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 10 }} />
                    <Area type="monotone" dataKey="completed" stackId="1" stroke="var(--color-completed,#82ca9d)" fill="url(#colorCompleted)" />
                    <Area type="monotone" dataKey="scheduled" stackId="1" stroke="var(--color-scheduled,#8884d8)" fill="url(#colorScheduled)" />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <ChartLegend content={<ChartLegendContent />} />
                  </AreaChart>
                </ChartContainer>
              </div>
              
              {/* Status Distribution Pie Chart */}
              <div className="h-64 flex flex-col">
                <h3 className="text-sm font-medium text-foreground mb-2">Session Status Distribution</h3>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie 
                      data={pieData} 
                      dataKey="value" 
                      nameKey="name" 
                      innerRadius={50} 
                      outerRadius={80} 
                      paddingAngle={3} 
                      label={(entry) => `${entry.name}: ${entry.value}`}
                    >
                      {pieData.map((entry, idx) => (
                        <Cell key={idx} fill={STATUS_COLORS[entry.name] || '#999'} />
                      ))}
                    </Pie>
                    <ChartTooltip content={<ChartTooltipContent />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="text-[10px] text-muted-foreground mt-2 flex items-center gap-2">
                  <Clock className="h-3 w-3" />
                  Last updated: {new Date(data.timestamp).toLocaleTimeString()}
                </div>
              </div>
            </div>

            {/* Real-time Activity Feed */}
            <div className="mt-6">
              <h3 className="text-sm font-medium text-foreground mb-3">Recent Activity</h3>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {data.recentActivity && data.recentActivity.length > 0 ? (
                  data.recentActivity.map((activity, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-2 bg-muted/30 rounded text-xs">
                      <div className={`w-2 h-2 rounded-full ${
                        activity.action === 'completed' ? 'bg-success' : 
                        activity.action === 'cancelled' ? 'bg-destructive' : 'bg-primary'
                      }`} />
                      <span className="text-muted-foreground">{new Date(activity.time).toLocaleTimeString()}</span>
                      <span className="text-foreground">{activity.patient}</span>
                      <span className="text-muted-foreground capitalize">{activity.action}</span>
                      <span className="text-muted-foreground">{activity.therapy}</span>
                    </div>
                  ))
                ) : (
                  <div className="text-xs text-muted-foreground p-2">No recent activity</div>
                )}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default AnalyticsInsights;
