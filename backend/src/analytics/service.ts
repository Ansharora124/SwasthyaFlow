import Schedule from '../schedules/model';

export interface AnalyticsSummary {
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
    completionTrend: number; // percentage change from yesterday
    cancellationRate: number;
    averageSessionsPerDay: number;
  };
}

type Client = { res: import('express').Response };
const clients: Record<string, Set<Client>> = {};

export async function buildSummary(userId: string): Promise<AnalyticsSummary> {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(startOfDay);
  endOfDay.setDate(endOfDay.getDate() + 1);

  // Get yesterday's date for trend comparison
  const startOfYesterday = new Date(startOfDay);
  startOfYesterday.setDate(startOfYesterday.getDate() - 1);
  const endOfYesterday = new Date(startOfYesterday);
  endOfYesterday.setDate(endOfYesterday.getDate() + 1);

  // Get today's data
  const todayDocs = await Schedule.find({
    userId,
    startTime: { $gte: startOfDay, $lt: endOfDay },
  }).lean();

  // Get yesterday's data for trends
  const yesterdayDocs = await Schedule.find({
    userId,
    startTime: { $gte: startOfYesterday, $lt: endOfYesterday },
  }).lean();

  // Get recent activity (last 7 days) for activity feed
  const weekAgo = new Date(startOfDay);
  weekAgo.setDate(weekAgo.getDate() - 7);
  const recentDocs = await Schedule.find({
    userId,
    updatedAt: { $gte: weekAgo },
  }).sort({ updatedAt: -1 }).limit(10).lean();

  const statusCounts: Record<string, number> = { scheduled: 0, completed: 0, cancelled: 0 };
  const hourlyMap: Record<number, { scheduled: number; completed: number; cancelled: number }> = {};
  for (let h = 0; h < 24; h++) hourlyMap[h] = { scheduled: 0, completed: 0, cancelled: 0 };

  // Process today's data
  for (const d of todayDocs) {
    const hour = new Date(d.startTime).getHours();
    statusCounts[d.status] = (statusCounts[d.status] || 0) + 1;
    hourlyMap[hour][d.status] += 1;
  }

  // Calculate trends
  const todayCompleted = statusCounts.completed || 0;
  const todayCancelled = statusCounts.cancelled || 0;
  const todayTotal = todayCompleted + todayCancelled;

  const yesterdayCompleted = yesterdayDocs.filter(d => d.status === 'completed').length;
  const yesterdayCancelled = yesterdayDocs.filter(d => d.status === 'cancelled').length;
  const yesterdayTotal = yesterdayCompleted + yesterdayCancelled;

  const completionTrend = yesterdayTotal > 0 
    ? ((todayCompleted / Math.max(1, todayTotal) - yesterdayCompleted / yesterdayTotal) * 100)
    : 0;

  const cancellationRate = todayTotal > 0 ? (todayCancelled / todayTotal) * 100 : 0;

  const completed = statusCounts.completed || 0;
  const cancelled = statusCounts.cancelled || 0;
  const successRate = completed + cancelled === 0 ? 0 : (completed / (completed + cancelled)) * 100;

  const hourly = Object.entries(hourlyMap).map(([hour, v]) => ({ hour: Number(hour), ...v }));

  // Build recent activity feed
  const recentActivity = recentDocs.map(doc => ({
    time: doc.updatedAt ? new Date(doc.updatedAt).toISOString() : new Date().toISOString(),
    action: doc.status === 'completed' ? 'completed' : doc.status === 'cancelled' ? 'cancelled' : 'scheduled',
    patient: doc.therapistId, // Using therapistId as patient identifier for now
    therapy: doc.notes || 'Therapy Session'
  }));

  return {
    timestamp: new Date().toISOString(),
    statusCounts,
    hourly,
    successRate: Number(successRate.toFixed(2)),
    totalSessions: todayDocs.length,
    recentActivity,
    trends: {
      completionTrend: Number(completionTrend.toFixed(2)),
      cancellationRate: Number(cancellationRate.toFixed(2)),
      averageSessionsPerDay: Number((todayDocs.length).toFixed(1))
    }
  };
}

export async function broadcastAnalytics(userId: string) {
  const set = clients[userId];
  if (!set || set.size === 0) return;
  try {
    const summary = await buildSummary(userId);
    const payload = `data: ${JSON.stringify(summary)}\n\n`;
    for (const client of set) {
      client.res.write(payload);
    }
  } catch (err) {
    const payload = 'event: error\ndata: {"message":"analytics_error"}\n\n';
    for (const client of set) {
      client.res.write(payload);
    }
  }
}

export function registerClient(userId: string, res: import('express').Response) {
  if (!clients[userId]) clients[userId] = new Set();
  clients[userId].add({ res });
}

export function unregisterClient(userId: string, res: import('express').Response) {
  const set = clients[userId];
  if (!set) return;
  for (const c of set) if (c.res === res) set.delete(c);
  if (set.size === 0) delete clients[userId];
}
