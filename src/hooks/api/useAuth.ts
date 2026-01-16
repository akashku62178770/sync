import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { axiosInstance, extractData } from '@/lib/axios';
import { useStore } from '@/store/useStore';
import { useNavigate } from 'react-router-dom';
import type {
  User,
  LoginResponse,
  RegisterRequest,
  GoogleAuthRequest,
  UpdateProfileRequest,
} from '@/types/api';

// API functions
const authApi = {
  register: (data: RegisterRequest) =>
    axiosInstance.post<{ data: LoginResponse }>('/auth/register/', data).then(extractData),

  googleAuth: (data: GoogleAuthRequest) =>
    axiosInstance.post<{ data: LoginResponse }>('/auth/google/', data).then(extractData),

  getCurrentUser: () =>
    axiosInstance.get<{ data: User }>('/auth/user/').then(extractData),

  updateProfile: (data: UpdateProfileRequest) =>
    axiosInstance.patch<{ data: User }>('/auth/profile/', data).then(extractData),

  logout: (refreshToken: string) =>
    axiosInstance.post('/auth/logout/', { refresh: refreshToken }),
};

// Query keys
export const authKeys = {
  all: ['auth'] as const,
  user: () => [...authKeys.all, 'user'] as const,
};

// Hooks
export const useCurrentUser = () => {
  const isAuthenticated = useStore((state) => state.isAuthenticated);

  return useQuery({
    queryKey: authKeys.user(),
    queryFn: authApi.getCurrentUser,
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });
};

export const useRegister = () => {
  const { setTokens } = useStore();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authApi.register,
    onSuccess: (data) => {
      setTokens(data.tokens.access, data.tokens.refresh);
      queryClient.setQueryData(authKeys.user(), data.user);
      navigate('/onboarding');
    },
  });
};

export const useGoogleAuth = () => {
  const { setTokens } = useStore();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authApi.googleAuth,
    onSuccess: (data) => {
      setTokens(data.tokens.access, data.tokens.refresh);
      queryClient.setQueryData(authKeys.user(), data.user);
      
      if (data.is_new_user) {
        navigate('/onboarding');
      } else {
        navigate('/dashboard');
      }
    },
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authApi.updateProfile,
    onSuccess: (data) => {
      queryClient.setQueryData(authKeys.user(), data);
      queryClient.invalidateQueries({ queryKey: authKeys.user() });
    },
  });
};

export const useLogout = () => {
  const { clearTokens, refreshToken } = useStore();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => authApi.logout(refreshToken || ''),
    onSuccess: () => {
      clearTokens();
      queryClient.clear();
      navigate('/login');
    },
    onError: () => {
      // Logout locally even if API fails
      clearTokens();
      queryClient.clear();
      navigate('/login');
    },
  });
};