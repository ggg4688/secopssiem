import { useSIEMStore } from '@/lib/siemStore';
import { Card } from '@/components/ui/card';
import { SeverityBadge } from './Badges';
import {
  Shield, Clock, AlertTriangle, TrendingUp,
  Server, Activity
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export function SOCMetrics() {
  const { metrics, alerts } = useSIEMStore();

  const severityData = [
    { name: 'Critical', value: metrics.alertsBySeverity.critical, color: '#ef4444' },
    { name: 'High', value: metrics.alertsBySeverity.high, color: '#f97316' },
    { name: 'Medium', value: metrics.alertsBySeverity.medium, color: '#eab308' },
    { name: 'Low', value: metrics.alertsBySeverity.low, color: '#22c55e' },
  ];

  const activeAlerts = alerts.filter(a => a.status !== 'closed').length;
  const newAlerts = alerts.filter(a => a.status === 'new').length;

  return (
    <div className="space-y-4">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Active Alerts"
          value={activeAlerts}
          subtitle={`${newAlerts} new`}
          icon={AlertTriangle}
          trend={newAlerts > 5 ? 'up' : 'stable'}
          accentColor="text-orange-500"
        />
        <MetricCard
          title="MTTD"
          value={`${metrics.mttd}m`}
          subtitle="Mean Time to Detect"
          icon={Clock}
          trend="down"
          accentColor="text-primary"
        />
        <MetricCard
          title="MTTR"
          value={`${metrics.mttr}m`}
          subtitle="Mean Time to Respond"
          icon={Activity}
          trend="stable"
          accentColor="text-green-500"
        />
        <MetricCard
          title="Incidents Today"
          value={metrics.incidentsToday}
          subtitle="Active investigations"
          icon={Shield}
          trend={metrics.incidentsToday > 3 ? 'up' : 'stable'}
          accentColor="text-red-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Alert Trend Chart */}
        <Card className="lg:col-span-2 p-4">
          <h3 className="text-sm font-medium text-muted-foreground mb-4">Alert Activity (24h)</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={metrics.alertsTrend}>
                <defs>
                  <linearGradient id="alertGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(199, 89%, 48%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(199, 89%, 48%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="hour"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'hsl(215, 15%, 55%)', fontSize: 10 }}
                  interval={3}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'hsl(215, 15%, 55%)', fontSize: 10 }}
                  width={30}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(222, 47%, 10%)',
                    border: '1px solid hsl(222, 30%, 18%)',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke="hsl(199, 89%, 48%)"
                  strokeWidth={2}
                  fill="url(#alertGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Severity Distribution */}
        <Card className="p-4">
          <h3 className="text-sm font-medium text-muted-foreground mb-4">Alerts by Severity</h3>
          <div className="h-32">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={severityData}
                  cx="50%"
                  cy="50%"
                  innerRadius={35}
                  outerRadius={55}
                  dataKey="value"
                  strokeWidth={0}
                >
                  {severityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {severityData.map((item) => (
              <div key={item.name} className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-xs text-muted-foreground">{item.name}</span>
                <span className="text-xs font-medium ml-auto">{item.value}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Top Attacked Assets */}
      <Card className="p-4">
        <h3 className="text-sm font-medium text-muted-foreground mb-4">Top Attacked Assets</h3>
        <div className="space-y-3">
          {metrics.topAttackedAssets.slice(0, 5).map((item, index) => (
            <div key={item.asset.id} className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground w-4">{index + 1}</span>
              <Server className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-mono flex-1">{item.asset.name}</span>
              <span className="text-xs text-muted-foreground">{item.asset.ip}</span>
              <div className="w-24 h-1.5 bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full"
                  style={{ width: `${(item.alertCount / metrics.topAttackedAssets[0].alertCount) * 100}%` }}
                />
              </div>
              <span className="text-xs font-medium w-8 text-right">{item.alertCount}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function MetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  accentColor,
}: {
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ElementType;
  trend: 'up' | 'down' | 'stable';
  accentColor: string;
}) {
  return (
    <Card className="p-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wide">{title}</p>
          <p className="text-2xl font-semibold mt-1">{value}</p>
          <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
        </div>
        <div className={`p-2 rounded-lg bg-secondary ${accentColor}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
      {trend === 'up' && (
        <div className="flex items-center gap-1 mt-2">
          <TrendingUp className="h-3 w-3 text-red-500" />
          <span className="text-xs text-red-500">Increasing</span>
        </div>
      )}
    </Card>
  );
}
