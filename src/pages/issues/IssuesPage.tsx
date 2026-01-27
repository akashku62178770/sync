import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  AlertCircle,
  AlertTriangle,
  Info,
  ChevronRight,
  Clock,
  Filter
} from 'lucide-react';
import { useTodaysIssues } from '@/hooks/api/useInsights';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import type { Insight, InsightSeverity } from '@/types/api';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 }
  }
};

const item = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 }
};

function SeverityIcon({ severity }: { severity: InsightSeverity }) {
  switch (severity) {
    case 'high':
      return <AlertCircle className="h-5 w-5 text-severity-high" />;
    case 'medium':
      return <AlertTriangle className="h-5 w-5 text-severity-medium" />;
    default:
      return <Info className="h-5 w-5 text-severity-low" />;
  }
}

function SourceBadge({ source }: { source: 'ga4' | 'meta' | 'clarity' }) {
  const config = {
    ga4: { label: 'GA4', className: 'bg-source-ga4/10 text-source-ga4' },
    meta: { label: 'Meta', className: 'bg-source-meta/10 text-source-meta' },
    clarity: { label: 'Clarity', className: 'bg-source-clarity/10 text-source-clarity' },
  };

  return (
    <span className={`source-badge ${config[source].className}`}>
      {config[source].label}
    </span>
  );
}

function IssueCard({ issue }: { issue: Insight }) {
  return (
    <motion.div variants={item}>
      <Link to={`/issues/${issue.id}`} className="insight-card block">
        <div className="flex items-start gap-4">
          <div className={`mt-0.5 rounded-lg p-2 ${issue.severity === 'high' ? 'bg-severity-high-bg' :
              issue.severity === 'medium' ? 'bg-severity-medium-bg' :
                'bg-severity-low-bg'
            }`}>
            <SeverityIcon severity={issue.severity} />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4">
              <h3 className="font-medium leading-snug">{issue.title}</h3>
              <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
            </div>

            <p className="mt-1.5 text-sm text-muted-foreground line-clamp-2">
              {issue.explanation}
            </p>

            <div className="mt-3 flex items-center gap-3">
              <SourceBadge source={issue.source} />
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                {new Date(issue.created_at).toLocaleTimeString('en-US', {
                  hour: 'numeric',
                  minute: '2-digit'
                })}
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-10 w-24" />
      </div>
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-xl" />
        ))}
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="rounded-full bg-success/10 p-4 mb-4">
        <AlertCircle className="h-8 w-8 text-success" />
      </div>
      <h3 className="text-lg font-semibold">All caught up!</h3>
      <p className="mt-1 text-muted-foreground max-w-sm">
        No issues detected today. Check back later or view your issue history.
      </p>
      <Link to="/history" className="mt-4">
        <Button variant="outline">View History</Button>
      </Link>
    </div>
  );
}

export default function IssuesPage() {
  const { data, isLoading, error } = useTodaysIssues();

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (error) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <p className="text-destructive">Failed to load issues</p>
      </div>
    );
  }

  const issues = data?.insights || [];

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Today's Issues</h1>
          <p className="text-muted-foreground">
            {issues.length} issue{issues.length !== 1 ? 's' : ''} need your attention
          </p>
        </div>
        <Button variant="outline" className="gap-2">
          <Filter className="h-4 w-4" />
          Filter
        </Button>
      </div>

      {/* Severity summary */}
      {issues.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {(['high', 'medium', 'low'] as InsightSeverity[]).map((severity) => {
            const count = issues.filter((i) => i.severity === severity).length;
            if (count === 0) return null;
            return (
              <Badge
                key={severity}
                variant="outline"
                className={`gap-1.5 ${severity === 'high' ? 'border-severity-high/30 text-severity-high' :
                    severity === 'medium' ? 'border-severity-medium/30 text-severity-medium' :
                      'border-severity-low/30 text-severity-low'
                  }`}
              >
                <span className={`h-2 w-2 rounded-full ${severity === 'high' ? 'bg-severity-high' :
                    severity === 'medium' ? 'bg-severity-medium' :
                      'bg-severity-low'
                  }`} />
                {count} {severity}
              </Badge>
            );
          })}
        </div>
      )}

      {/* Issues list */}
      {issues.length === 0 ? (
        <EmptyState />
      ) : (
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="space-y-4"
        >
          {issues.map((issue) => (
            <IssueCard key={issue.id} issue={issue} />
          ))}
        </motion.div>
      )}
    </div>
  );
}
