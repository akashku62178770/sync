import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  AlertCircle,
  AlertTriangle,
  Info,
  Clock,
  Timer,
  CheckCircle,
  RotateCcw,
  ExternalLink,
  PlayCircle,
  MousePointer,
  MousePointerClick
} from 'lucide-react';
import { useInsightDetail, useUpdateInsightStatus } from '@/hooks/api/useInsights';
import { useNotifications } from '@/store/useStore';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { InsightSeverity, InsightStatus } from '@/types/api';

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

function SeverityBadge({ severity }: { severity: InsightSeverity }) {
  const config = {
    high: { icon: AlertCircle, label: 'High Priority', className: 'severity-badge-high' },
    medium: { icon: AlertTriangle, label: 'Medium Priority', className: 'severity-badge-medium' },
    low: { icon: Info, label: 'Low Priority', className: 'severity-badge-low' },
  };

  const Icon = config[severity].icon;

  return (
    <div className={`severity-badge ${config[severity].className}`}>
      <Icon className="h-3 w-3" />
      {config[severity].label}
    </div>
  );
}

function StatusBadge({ status }: { status: InsightStatus }) {
  const config = {
    active: { label: 'Active', className: 'bg-destructive/10 text-destructive' },
    snoozed: { label: 'Snoozed', className: 'bg-warning/10 text-warning' },
    resolved: { label: 'Resolved', className: 'bg-success/10 text-success' },
  };

  return (
    <Badge variant="outline" className={config[status].className}>
      {config[status].label}
    </Badge>
  );
}

function LoadingSkeleton() {
  return (
    <div className="p-6 lg:p-8 space-y-6">
      <Skeleton className="h-8 w-32" />
      <Skeleton className="h-48 rounded-xl" />
      <div className="grid gap-6 lg:grid-cols-2">
        <Skeleton className="h-64 rounded-xl" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    </div>
  );
}

export default function InsightDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addNotification } = useNotifications();
  const { data, isLoading, error } = useInsightDetail(id ? parseInt(id) : 0);
  const updateStatus = useUpdateInsightStatus();

  const handleStatusUpdate = (newStatus: InsightStatus) => {
    if (!id) return;

    updateStatus.mutate(
      { id: parseInt(id), status: newStatus },
      {
        onSuccess: () => {
          const messages = {
            snoozed: 'Issue snoozed for 24 hours',
            resolved: 'Issue marked as resolved',
            active: 'Issue reactivated',
          };
          addNotification('success', messages[newStatus]);
        },
        onError: (error) => {
          addNotification('error', 'Failed to update status');
        },
      }
    );
  };

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (error || !data) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center gap-4">
        <p className="text-destructive">Failed to load insight details</p>
        <Button variant="outline" onClick={() => navigate('/issues')}>
          Back to Issues
        </Button>
      </div>
    );
  }

  const { insight, metrics, clarity_signals, recordings } = data;

  return (
    <motion.div
      className="p-6 lg:p-8 space-y-6"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {/* Back button */}
      <motion.div variants={item}>
        <Link
          to="/issues"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Issues
        </Link>
      </motion.div>

      {/* Main insight card */}
      <motion.div variants={item} className="rounded-xl border bg-card p-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <SeverityBadge severity={insight.severity} />
              <StatusBadge status={insight.status} />
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {new Date(insight.created_at).toLocaleString()}
              </span>
            </div>
            <h1 className="text-xl font-bold">{insight.title}</h1>
          </div>

          {/* Action buttons */}
          <div className="flex gap-2">
            {insight.status === 'active' && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  onClick={() => handleStatusUpdate('snoozed')}
                  disabled={updateStatus.isPending}
                >
                  <Timer className="h-4 w-4" />
                  Snooze 24h
                </Button>
                <Button
                  size="sm"
                  className="gap-2"
                  onClick={() => handleStatusUpdate('resolved')}
                  disabled={updateStatus.isPending}
                >
                  <CheckCircle className="h-4 w-4" />
                  Resolve
                </Button>
              </>
            )}
            {insight.status === 'snoozed' && (
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => handleStatusUpdate('active')}
                disabled={updateStatus.isPending}
              >
                <RotateCcw className="h-4 w-4" />
                Reactivate
              </Button>
            )}
            {insight.status === 'resolved' && (
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => handleStatusUpdate('active')}
                disabled={updateStatus.isPending}
              >
                <RotateCcw className="h-4 w-4" />
                Reopen
              </Button>
            )}
          </div>
        </div>

        <div className="mt-6 space-y-4">
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Explanation</h3>
            <p className="text-foreground">{insight.explanation}</p>
          </div>

          <div className="pt-4 border-t">
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Recommended Action</h3>
            <div className="rounded-lg bg-primary/5 border border-primary/20 p-4">
              <p className="text-foreground">{insight.recommended_action}</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Data tables */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Metrics table */}
        <motion.div variants={item} className="rounded-xl border bg-card overflow-hidden">
          <div className="p-4 border-b">
            <h2 className="font-semibold">Related Metrics</h2>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Page</TableHead>
                  <TableHead className="text-right">Sessions</TableHead>
                  <TableHead className="text-right">Conv.</TableHead>
                  <TableHead className="text-right">Revenue</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {metrics.map((metric, i) => (
                  <TableRow key={i}>
                    <TableCell className="text-muted-foreground text-sm">
                      {new Date(metric.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </TableCell>
                    <TableCell className="font-medium text-sm truncate max-w-[120px]">
                      {metric.page_path || 'Unknown'}
                    </TableCell>
                    <TableCell className="text-right">{metric.sessions.toLocaleString()}</TableCell>
                    <TableCell className="text-right">{metric.conversions}</TableCell>
                    <TableCell className="text-right">${metric.revenue.toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </motion.div>

        {/* Clarity signals table */}
        <motion.div variants={item} className="rounded-xl border bg-card overflow-hidden">
          <div className="p-4 border-b">
            <h2 className="font-semibold">Clarity Signals</h2>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Page</TableHead>
                  <TableHead className="text-right">
                    <span className="flex items-center justify-end gap-1">
                      <MousePointer className="h-3 w-3" />
                      Rage
                    </span>
                  </TableHead>
                  <TableHead className="text-right">
                    <span className="flex items-center justify-end gap-1">
                      <MousePointerClick className="h-3 w-3" />
                      Dead
                    </span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clarity_signals.map((signal, i) => (
                  <TableRow key={i}>
                    <TableCell className="font-medium text-sm truncate max-w-[140px]">
                      {signal.page_path}
                    </TableCell>
                    <TableCell className="text-right">
                      <span className={signal.rage_clicks > 50 ? 'text-destructive font-medium' : ''}>
                        {signal.rage_clicks}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">{signal.dead_clicks}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </motion.div>
      </div>

      {/* Session recordings */}
      <motion.div variants={item} className="rounded-xl border bg-card overflow-hidden">
        <div className="p-4 border-b">
          <h2 className="font-semibold">Session Recordings</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Watch user sessions to understand behavior patterns
          </p>
        </div>
        <div className="p-4">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {recordings.map((recording) => (
              <a
                key={recording.session_id}
                href={recording.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-accent"
              >
                <div className="rounded-lg bg-source-clarity/10 p-2">
                  <PlayCircle className="h-5 w-5 text-source-clarity" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{recording.page_path}</p>
                  <p className="text-xs text-muted-foreground">
                    Session {recording.session_id.slice(0, 8)}
                  </p>
                </div>
                <ExternalLink className="h-4 w-4 text-muted-foreground" />
              </a>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
