import { useTodaysIssues, useUpdateInsightStatus } from '@/hooks/api/useInsights';
import { useNotifications } from '@/store/useStore';
import { Link } from 'react-router-dom';

export function TodaysIssuesPage() {
  const { data, isLoading, error } = useTodaysIssues();
  const updateStatus = useUpdateInsightStatus();
  const { addNotification } = useNotifications();

  const handleSnooze = (insightId: number) => {
    updateStatus.mutate(
      { id: insightId, status: 'snoozed', snoozed_hours: 24 },
      {
        onSuccess: () => {
          addNotification('success', 'Issue snoozed for 24 hours');
        },
      }
    );
  };

  const handleResolve = (insightId: number) => {
    updateStatus.mutate(
      { id: insightId, status: 'resolved' },
      {
        onSuccess: () => {
          addNotification('success', 'Issue marked as resolved');
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading today's issues...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-600">
          Error loading issues: {error.message}
        </div>
      </div>
    );
  }

  if (!data || data.insights.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <h2 className="text-2xl font-semibold mb-2">No Issues Today! 🎉</h2>
        <p className="text-gray-600">Everything looks good.</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Today's Issues</h1>
        <p className="text-gray-600">
          {data.count} issue{data.count !== 1 ? 's' : ''} detected today
          {data.last_week_avg > 0 && (
            <span className="ml-2">
              (avg {data.last_week_avg} per day last week)
            </span>
          )}
        </p>
      </div>

      <div className="space-y-4">
        {data.insights.map((insight) => (
          <div
            key={insight.id}
            className={`bg-white border-l-4 rounded-lg shadow-md p-6 ${
              insight.severity === 'high'
                ? 'border-red-500'
                : insight.severity === 'medium'
                ? 'border-yellow-500'
                : 'border-green-500'
            }`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      insight.severity === 'high'
                        ? 'bg-red-100 text-red-800'
                        : insight.severity === 'medium'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-green-100 text-green-800'
                    }`}
                  >
                    {insight.severity.toUpperCase()}
                  </span>
                  <h3 className="text-xl font-semibold">{insight.title}</h3>
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  Property: {insight.ga_property_name}
                </p>
                <p className="text-gray-700 mb-3">{insight.explanation}</p>
                <p className="text-sm">
                  <strong>Recommended Action:</strong>{' '}
                  {insight.recommended_action}
                </p>
              </div>
            </div>

            <div className="flex gap-2 mt-4">
              <Link
                to={`/issues/${insight.id}`}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                View Details
              </Link>
              <button
                onClick={() => handleSnooze(insight.id)}
                disabled={updateStatus.isPending}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 disabled:opacity-50"
              >
                Snooze 24h
              </button>
              <button
                onClick={() => handleResolve(insight.id)}
                disabled={updateStatus.isPending}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
              >
                Mark Resolved
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}