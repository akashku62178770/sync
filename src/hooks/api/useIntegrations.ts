import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { axiosInstance, extractData } from '@/lib/axios';
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
} from '@/types/api';

// API functions
const integrationApi = { 
  listIntegrations: () =>
    axiosInstance.get<{ data: IntegrationAccount[] }>('/integrations/').then(extractData),

  connectGoogle: (data: ConnectGoogleRequest) =>
    axiosInstance.post<{ data: ConnectGoogleResponse }>('/integrations/google/connect/', data).then(extractData),

  connectMeta: (data: ConnectMetaRequest) =>
    axiosInstance.post<{ data: ConnectMetaResponse }>('/integrations/meta/connect/', data).then(extractData),

  connectClarity: (data: ConnectClarityRequest) =>
    axiosInstance.post<{ data: { integration: IntegrationAccount } }>('/integrations/clarity/connect/', data).then(extractData),

  disconnectIntegration: (provider: string) =>
    axiosInstance.delete(`/integrations/${provider}/disconnect/`),

  listGAProperties: () =>
    axiosInstance.get<{ data: GAProperty[] }>('/ga/properties/').then(extractData),

  selectGAProperties: (data: SelectPropertiesRequest) =>
    axiosInstance.post<{ data: GAProperty[] }>('/ga/properties/select/', data).then(extractData),

  listMetaAccounts: () =>
    axiosInstance.get<{ data: MetaAdAccount[] }>('/meta/accounts/').then(extractData),

  selectMetaAccounts: (data: SelectPropertiesRequest) =>
    axiosInstance.post<{ data: MetaAdAccount[] }>('/meta/accounts/select/', data).then(extractData),
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: integrationKeys.list() });
    },
  });
};

export const useConnectMeta = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: integrationApi.connectMeta,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: integrationKeys.list() });
    },
  });
};

export const useConnectClarity = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: integrationApi.connectClarity,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: integrationKeys.list() });
    },
  });
};

export const useDisconnectIntegration = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: integrationApi.disconnectIntegration,
    onSuccess: () => {
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
    onSuccess: () => {
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: integrationKeys.metaAccounts() });
    },
  });
};