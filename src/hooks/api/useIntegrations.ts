import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { axiosInstance, extractData, type ApiResponse } from '@/lib/axios';
import type {
  IntegrationAccount,
  GAProperty,
  MetaAdAccount,
  ConnectGoogleRequest,
  ConnectGoogleResponse,
  ConnectMetaRequest,
  ConnectMetaResponse,
  ConnectClarityRequest,
  SelectPropertiesRequest,
  SelectMetaAccountsRequest,
} from '@/types/api';

// API functions
const integrationApi = {
  listIntegrations: () =>
    axiosInstance.get<ApiResponse<IntegrationAccount[]>>('/integrations/').then(extractData),

  connectGoogle: (data: ConnectGoogleRequest) =>
    axiosInstance.post<ApiResponse<ConnectGoogleResponse>>('/integrations/google/connect/', data).then(extractData),

  connectMeta: (data: ConnectMetaRequest) =>
    axiosInstance.post<ApiResponse<ConnectMetaResponse>>('/integrations/meta/connect/', data).then(extractData),

  connectClarity: (data: ConnectClarityRequest) =>
    axiosInstance.post<ApiResponse<{ integration: IntegrationAccount }>>('/integrations/clarity/connect/', data).then(extractData),

  disconnectIntegration: (provider: string) =>
    axiosInstance.delete(`/integrations/${provider}/disconnect/`),

  listGAProperties: () =>
    axiosInstance.get<ApiResponse<GAProperty[]>>('/ga/properties/').then(extractData),

  selectGAProperties: (data: SelectPropertiesRequest) =>
    axiosInstance.post<ApiResponse<GAProperty[]>>('/ga/properties/select/', data).then(extractData),

  listMetaAccounts: () =>
    axiosInstance.get<ApiResponse<MetaAdAccount[]>>('/meta/accounts/').then(extractData),

  selectMetaAccounts: (data: SelectMetaAccountsRequest) =>
    axiosInstance.post<ApiResponse<MetaAdAccount[]>>('/meta/accounts/select/', data).then(extractData),
};

// Query keys
export const integrationKeys = {
  all: ['integrations'] as const,
  list: () => [...integrationKeys.all, 'list'] as const,
  gaProperties: () => [...integrationKeys.all, 'ga', 'properties'] as const,
  metaAccounts: () => [...integrationKeys.all, 'meta', 'accounts'] as const,
};

// Hooks
export const useIntegrations = () => {
  return useQuery({
    queryKey: integrationKeys.list(),
    queryFn: integrationApi.listIntegrations,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useConnectGoogle = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: integrationApi.connectGoogle,
    onSuccess: (data) => {
      console.log("Google connected:", data);
      queryClient.invalidateQueries({ queryKey: integrationKeys.list() });
    },
  });
};

export const useConnectMeta = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: integrationApi.connectMeta,
    onSuccess: (data) => {
      console.log("Meta connected:", data);
      queryClient.invalidateQueries({ queryKey: integrationKeys.list() });
    },
  });
};

export const useConnectClarity = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: integrationApi.connectClarity,
    onSuccess: (data) => {
      console.log("Clarity connected:", data);
      queryClient.invalidateQueries({ queryKey: integrationKeys.list() });
    },
  });
};

export const useDisconnectIntegration = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: integrationApi.disconnectIntegration,
    onSuccess: (data) => {
      console.log("Integration disconnected:", data);
      queryClient.invalidateQueries({ queryKey: integrationKeys.list() });
      queryClient.invalidateQueries({ queryKey: integrationKeys.gaProperties() });
      queryClient.invalidateQueries({ queryKey: integrationKeys.metaAccounts() });
    },
  });
};

export const useGAProperties = () => {
  return useQuery({
    queryKey: integrationKeys.gaProperties(),
    queryFn: integrationApi.listGAProperties,
    staleTime: 10 * 60 * 1000,
  });
};

export const useSelectGAProperties = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: integrationApi.selectGAProperties,
    onSuccess: (data) => {
      console.log("GA properties selected:", data);
      queryClient.invalidateQueries({ queryKey: integrationKeys.gaProperties() });
    },
  });
};

export const useMetaAccounts = () => {
  return useQuery({
    queryKey: integrationKeys.metaAccounts(),
    queryFn: integrationApi.listMetaAccounts,
    staleTime: 10 * 60 * 1000,
  });
};

export const useSelectMetaAccounts = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: integrationApi.selectMetaAccounts,
    onSuccess: (data) => {
      console.log("Meta accounts selected:", data);
      queryClient.invalidateQueries({ queryKey: integrationKeys.metaAccounts() });
    },
  });
};