import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  History, 
  Search, 
  Filter, 
  ChevronRight,
  Calendar,
  Download
} from 'lucide-react';
import { useInsightHistory } from '@/hooks/api/useInsights';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { InsightSeverity, InsightStatus, InsightHistoryParams } from '@/types/api';

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

function LoadingSkeleton() {
  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-32" />
      </div>
      <div className="flex gap-3">
        <Skeleton className="h-10 flex-1" />
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-10 w-32" />
      </div>
      <div className="space-y-3">
        {[...Array(8)].map((_, i) => (
          <Skeleton key={i} className="h-20 rounded-xl" />
        ))}
      </div>
    </div>
  );
}

export default function HistoryPage() {
  const [filters, setFilters] = useState<InsightHistoryParams>({
    days: 7,
  });
  const [searchQuery, setSearchQuery] = useState('');

  const { data, isLoading, error } = useInsightHistory(filters);

  const handleExportCSV = () => {
    if (!data?.insights) return;
    
    const headers = ['Title', 'Severity', 'Status', 'Source', 'Created At'];
    const rows = data.insights.map((i) => [
      i.title,
      i.severity,
      i.status,
      i.source,
      new Date(i.created_at).toISOString(),
    ]);
    
    const csv = [headers, ...rows].map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `insights-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  const insights = data?.insights || [];
  const filteredInsights = searchQuery
    ? insights.filter((i) => 
        i.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        i.explanation.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : insights;

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Issue History</h1>
          <p className="text-muted-foreground">
            View and filter past insights across all time periods
          </p>
        </div>
        <Button variant="outline" className="gap-2" onClick={handleExportCSV}>
          <Download className="h-4 w-4" />
          Export CSV
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search issues..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        
        <Select
          value={filters.days?.toString() || '7'}
          onValueChange={(v) => setFilters({ ...filters, days: parseInt(v) })}
        >
          <SelectTrigger className="w-[140px]">
            <Calendar className="h-4 w-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Last 7 days</SelectItem>
            <SelectItem value="14">Last 14 days</SelectItem>
            <SelectItem value="30">Last 30 days</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filters.severity || 'all'}
          onValueChange={(v) => setFilters({ 
            ...filters, 
            severity: v === 'all' ? undefined : v as InsightSeverity 
          })}
        >
          <SelectTrigger className="w-[130px]">
            <SelectValue placeholder="Severity" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Severity</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filters.status || 'all'}
          onValueChange={(v) => setFilters({ 
            ...filters, 
            status: v === 'all' ? undefined : v as InsightStatus 
          })}
        >
          <SelectTrigger className="w-[130px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="snoozed">Snoozed</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Results count */}
      <div className="text-sm text-muted-foreground">
        Showing {filteredInsights.length} of {insights.length} results
      </div>

      {/* Issues list */}
      {filteredInsights.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="rounded-full bg-muted p-4 mb-4">
            <History className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold">No issues found</h3>
          <p className="mt-1 text-muted-foreground max-w-sm">
            Try adjusting your filters or search query
          </p>
        </div>
      ) : (
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="space-y-2"
        >
          {filteredInsights.map((insight) => (
            <motion.div key={insight.id} variants={item}>
              <Link
                to={`/issues/${insight.id}`}
                className="flex items-center gap-4 rounded-lg border bg-card p-4 transition-colors hover:bg-accent"
              >
                <div className={`h-2 w-2 rounded-full flex-shrink-0 ${
                  insight.severity === 'high' ? 'bg-severity-high' :
                  insight.severity === 'medium' ? 'bg-severity-medium' :
                  'bg-severity-low'
                }`} />
                
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{insight.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(insight.created_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Badge 
                    variant="outline" 
                    className={`text-xs ${
                      insight.status === 'active' ? 'border-destructive/30 text-destructive' :
                      insight.status === 'snoozed' ? 'border-warning/30 text-warning' :
                      'border-success/30 text-success'
                    }`}
                  >
                    {insight.status}
                  </Badge>
                  <span className="text-xs text-muted-foreground uppercase">{insight.source}</span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
