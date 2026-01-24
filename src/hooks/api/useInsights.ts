import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { axiosInstance, extractData, type ApiResponse } from '@/lib/axios';
import type {
  TodaysIssues,
  InsightDetail,
  Insight,
  DashboardSummary,
  UpdateInsightStatusRequest,
  InsightHistoryParams,
} from '@/types/api';

// API functions
const insightsApi = {
  getTodaysIssues: () =>
    axiosInstance.get<ApiResponse<TodaysIssues>>('/insights/today/').then(extractData),

  getInsightDetail: (id: number) =>
    axiosInstance.get<ApiResponse<InsightDetail>>(`/insights/${id}/`).then(extractData),

  updateInsightStatus: ({ id, ...data }: UpdateInsightStatusRequest & { id: number }) =>
    axiosInstance.patch<ApiResponse<Insight>>(`/insights/${id}/status/`, data).then(extractData),

  getInsightHistory: (params: InsightHistoryParams) =>
    axiosInstance.get<ApiResponse<{ insights: Insight[]; start_date: string; end_date: string }>>('/insights/history/', { params }).then(extractData),

  getDashboardSummary: () =>
    axiosInstance.get<ApiResponse<DashboardSummary>>('/dashboard/summary/').then(extractData),
};

// Query keys
export const insightKeys = {
  all: ['insights'] as const,
  today: () => [...insightKeys.all, 'today'] as const,
  detail: (id: number) => [...insightKeys.all, 'detail', id] as const,
  history: (params: InsightHistoryParams) => [...insightKeys.all, 'history', params] as const,
  dashboard: () => ['dashboard'] as const,
};

// Hooks
export const useTodaysIssues = () => {
  return useQuery({
    queryKey: insightKeys.today(),
    queryFn: insightsApi.getTodaysIssues,
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });
};

export const useInsightDetail = (id: number) => {
  return useQuery({
    queryKey: insightKeys.detail(id),
    queryFn: () => insightsApi.getInsightDetail(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};

export const useUpdateInsightStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: insightsApi.updateInsightStatus,
    onMutate: async ({ id, status }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: insightKeys.detail(id) });
      await queryClient.cancelQueries({ queryKey: insightKeys.today() });

      // Snapshot previous values
      const previousDetail = queryClient.getQueryData(insightKeys.detail(id));
      const previousToday = queryClient.getQueryData(insightKeys.today());

      // Optimistically update detail
      queryClient.setQueryData(insightKeys.detail(id), (old: InsightDetail | undefined) => {
        if (!old) return old;
        return {
          ...old,
          insight: {
            ...old.insight,
            status,
          },
        };
      });

      // Optimistically update today's issues
      queryClient.setQueryData(insightKeys.today(), (old: TodaysIssues | undefined) => {
        if (!old) return old;
        return {
          ...old,
          insights: old.insights.map((insight) =>
            insight.id === id ? { ...insight, status } : insight
          ),
        };
      });

      return { previousDetail, previousToday };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousDetail) {
        queryClient.setQueryData(insightKeys.detail(variables.id), context.previousDetail);
      }
      if (context?.previousToday) {
        queryClient.setQueryData(insightKeys.today(), context.previousToday);
      }
    },
    onSuccess: (data, variables) => {
      // Update with server data
      queryClient.setQueryData(insightKeys.detail(variables.id), (old: InsightDetail | undefined) => {
        if (!old) return old;
        return {
          ...old,
          insight: data,
        };
      });

      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: insightKeys.today() });
      queryClient.invalidateQueries({ queryKey: insightKeys.all });
      queryClient.invalidateQueries({ queryKey: insightKeys.dashboard() });
    },
  });
};

export const useInsightHistory = (params: InsightHistoryParams = {}) => {
  return useQuery({
    queryKey: insightKeys.history(params),
    queryFn: () => insightsApi.getInsightHistory(params),
    staleTime: 5 * 60 * 1000,
  });
};

export const useDashboardSummary = () => {
  return useQuery({
    queryKey: insightKeys.dashboard(),
    queryFn: insightsApi.getDashboardSummary,
    staleTime: 2 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
  });
};