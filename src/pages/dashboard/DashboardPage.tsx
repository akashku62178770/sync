import { motion } from 'framer-motion';
import {
  TrendingUp,
  TrendingDown,
  Users,
  Target,
  DollarSign,
  CreditCard,
  AlertCircle,
  ArrowRight,
  Zap
} from 'lucide-react';
import { useDashboardSummary, useTodaysIssues } from '@/hooks/api/useInsights';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

function MetricCard({
  label,
  value,
  change,
  icon: Icon,
  format = 'number'
}: {
  label: string;
  value: number;
  change: number;
  icon: React.ComponentType<{ className?: string }>;
  format?: 'number' | 'currency' | 'percent';
}) {
  const formatValue = (val: number) => {
    switch (format) {
      case 'currency':
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);
      case 'percent':
        return `${val.toFixed(2)}%`;
      default:
        return new Intl.NumberFormat('en-US').format(val);
    }
  };

  const isPositive = change >= 0;

  return (
    <motion.div variants={item} className="metric-card group">
      <div className="flex items-start justify-between">
        <div className="rounded-lg bg-primary/10 p-2.5">
          <Icon className="h-5 w-5 text-primary" />
        </div>
        <div className={`flex items-center gap-1 ${isPositive ? 'stat-change-positive' : 'stat-change-negative'}`}>
          {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
          <span>{Math.abs(change).toFixed(1)}%</span>
        </div>
      </div>
      <div className="mt-4">
        <p className="text-2xl font-bold tracking-tight">{formatValue(value)}</p>
        <p className="mt-1 text-sm text-muted-foreground">{label}</p>
      </div>
    </motion.div>
  );
}

function SeverityBadge({ severity, count }: { severity: 'high' | 'medium' | 'low'; count: number }) {
  const config = {
    high: { label: 'High', className: 'severity-badge-high' },
    medium: { label: 'Medium', className: 'severity-badge-medium' },
    low: { label: 'Low', className: 'severity-badge-low' },
  };

  return (
    <div className={`severity-badge ${config[severity].className}`}>
      <span className="font-semibold">{count}</span>
      <span>{config[severity].label}</span>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="p-6 lg:p-8 space-y-8">
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-64" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-32 rounded-xl" />
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <Skeleton className="h-64 rounded-xl lg:col-span-2" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { data: summary, isLoading: summaryLoading } = useDashboardSummary();
  const { data: issues, isLoading: issuesLoading } = useTodaysIssues();

  if (summaryLoading || issuesLoading) {
    return <LoadingSkeleton />;
  }

  if (!summary) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <p className="text-muted-foreground">Failed to load dashboard data</p>
      </div>
    );
  }

  return (
    <motion.div
      className="p-6 lg:p-8 space-y-8"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {/* Header */}
      <motion.div variants={item}>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Your analytics overview for {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </p>
      </motion.div>

      {/* Metrics Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="Total Sessions"
          value={summary?.metrics?.sessions}
          change={summary?.metrics_change?.sessions}
          icon={Users}
        />
        <MetricCard
          label="Conversions"
          value={summary?.metrics?.conversions}
          change={summary?.metrics_change?.conversions}
          icon={Target}
        />
        <MetricCard
          label="Revenue"
          value={summary?.metrics?.revenue}
          change={summary?.metrics_change?.revenue}
          icon={DollarSign}
          format="currency"
        />
        <MetricCard
          label="Conversion Rate"
          value={summary?.metrics?.conversion_rate}
          change={summary?.metrics_change?.conversion_rate}
          icon={Zap}
          format="percent"
        />
      </div>

      {/* 7-Day Trend */}
      <motion.div variants={item} className="rounded-xl border bg-card p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-semibold">7-Day Trend</h2>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-primary" /> Sessions</span>
          </div>
        </div>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={[
              { name: 'Mon', value: 2400 },
              { name: 'Tue', value: 3800 },
              { name: 'Wed', value: 6800 },
              { name: 'Thu', value: 5200 },
              { name: 'Fri', value: 7800 },
              { name: 'Sat', value: 4800 },
              { name: 'Sun', value: 6100 },
            ]}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                dx={-10}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  borderColor: 'hsl(var(--border))',
                  borderRadius: '0.5rem',
                }}
                itemStyle={{ color: 'hsl(var(--foreground))' }}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorValue)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Issues & Quick Actions */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Today's Issues Summary */}
        <motion.div variants={item} className="lg:col-span-2">
          <div className="rounded-xl border bg-card overflow-hidden">
            <div className="flex items-center justify-between border-b p-5">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-destructive/10 p-2">
                  <AlertCircle className="h-5 w-5 text-destructive" />
                </div>
                <div>
                  <h2 className="font-semibold">Today's Issues</h2>
                  <p className="text-sm text-muted-foreground">{summary?.todays_issues} issues need attention</p>
                </div>
              </div>
              <Link to="/issues">
                <Button variant="ghost" size="sm" className="gap-1">
                  View all
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>

            <div className="p-5">
              {/* Severity breakdown */}
              <div className="flex flex-wrap gap-3 mb-6">
                <SeverityBadge severity="high" count={summary?.severity_breakdown.high} />
                <SeverityBadge severity="medium" count={summary?.severity_breakdown.medium} />
                <SeverityBadge severity="low" count={summary?.severity_breakdown.low} />
              </div>

              {/* Recent issues preview */}
              <div className="space-y-3">
                {issues?.insights?.slice(0, 3).map((issue) => (
                  <Link
                    key={issue?.id}
                    to={`/issues/${issue?.id}`}
                    className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-accent"
                  >
                    <div className={`h-2 w-2 rounded-full ${issue?.severity === 'high' ? 'bg-severity-high' :
                      issue?.severity === 'medium' ? 'bg-severity-medium' :
                        'bg-severity-low'
                      }`} />
                    <span className="flex-1 text-sm font-medium truncate">{issue?.title}</span>
                    <span className="text-xs text-muted-foreground capitalize">{issue?.ga_property_name || 'System'}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Quick Stats */}
        <motion.div variants={item}>
          <div className="rounded-xl border bg-card p-5 h-full">
            <h2 className="font-semibold mb-4">This Week</h2>

            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b">
                <span className="text-sm text-muted-foreground">Total Issues</span>
                <span className="font-semibold">{summary?.week_total}</span>
              </div>
              <div className="flex items-center justify-between py-3 border-b">
                <span className="text-sm text-muted-foreground">Ad Spend</span>
                <span className="font-semibold">${summary?.metrics?.spend.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between py-3">
                <span className="text-sm text-muted-foreground">Avg. ROAS</span>
                <span className="font-semibold">
                  {(summary?.metrics?.revenue / summary?.metrics?.spend).toFixed(2)}x
                </span>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t">
              <Link to="/integrations">
                <Button variant="outline" className="w-full gap-2">
                  <CreditCard className="h-4 w-4" />
                  Manage Integrations
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
