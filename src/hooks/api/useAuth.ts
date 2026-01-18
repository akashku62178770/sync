// import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
// import type { User } from '@/types/api';

// // Mock user data for development
// const mockUser: User = {
//   id: 1,
//   username: 'alexjohnson',
//   email: 'alex@company.com',
//   plan_type: 'pro',
//   primary_goal: 'conversions',
//   created_at: '2024-01-15T10:00:00Z',
//   onboarding_completed: true,
// };

// export const useCurrentUser = () => {
//   return useQuery({
//     queryKey: ['currentUser'],
//     queryFn: async (): Promise<User> => {
//       // Simulate API call
//       await new Promise((resolve) => setTimeout(resolve, 500));
//       return mockUser;
//     },
//   });
// };

// export const useLogout = () => {
//   const queryClient = useQueryClient();
  
//   return useMutation({
//     mutationFn: async () => {
//       await new Promise((resolve) => setTimeout(resolve, 300));
//       return true;
//     },
//     onSuccess: () => {
//       queryClient.clear();
//     },
//   });
// };

// export const useUpdateProfile = () => {
//   const queryClient = useQueryClient();
  
//   return useMutation({
//     mutationFn: async (data: Partial<User>) => {
//       await new Promise((resolve) => setTimeout(resolve, 500));
//       return { ...mockUser, ...data };
//     },
//     onSuccess: (data) => {
//       queryClient.setQueryData(['currentUser'], data);
//     },
//   });
// };

// export const useLogin = () => {
//   return useMutation({
//     mutationFn: async (data: { email: string; password: string }) => {
//       await new Promise((resolve) => setTimeout(resolve, 800));
//       return { user: mockUser, token: 'mock-token' };
//     },
//   });
// };

// export const useRegister = () => {
//   return useMutation({
//     mutationFn: async (data: { username: string; email: string; password: string }) => {
//       await new Promise((resolve) => setTimeout(resolve, 800));
//       return { user: { ...mockUser, ...data }, token: 'mock-token' };
//     },
//   });
// };

// export const useGoogleAuth = () => {
//   return useMutation({
//     mutationFn: async (data: { code: string }) => {
//       await new Promise((resolve) => setTimeout(resolve, 1000));
//       return { user: mockUser, token: 'mock-token' };
//     },
//   });
// }; 


// Give by claude 

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
   login: (data: { email: string; password: string }) =>
    axiosInstance.post<{ data: LoginResponse }>('/auth/login/', data).then(extractData),
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


// export const useLogin = () => {
//   const { setTokens } = useStore();
//   const navigate = useNavigate();
//   const queryClient = useQueryClient();

//   return useMutation({
//     mutationFn: authApi.login,
//     onSuccess: (data) => {
//       setTokens(data.tokens.access, data.tokens.refresh);
//       queryClient.setQueryData(authKeys.user(), data.user);
//       navigate('/dashboard');
//     },
//   });
// };
export const useLogin = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: { email: string; password: string }) => {
      await new Promise((resolve) => setTimeout(resolve, 500));
      return { user: mockUser, tokens: { access: 'token', refresh: 'refresh' } };
    },
    // Remove any onSuccess/onError here - let component handle it
  });
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