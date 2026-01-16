import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

// Auth slice
interface AuthSlice {
  isAuthenticated: boolean;
  accessToken: string | null;
  refreshToken: string | null;
  setTokens: (access: string, refresh: string) => void;
  clearTokens: () => void;
}

// UI slice
interface UISlice {
  sidebarOpen: boolean;
  theme: 'light' | 'dark';
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setTheme: (theme: 'light' | 'dark') => void;
}

// Onboarding slice
interface OnboardingSlice {
  onboardingStep: number;
  onboardingCompleted: boolean;
  setOnboardingStep: (step: number) => void;
  completeOnboarding: () => void;
  resetOnboarding: () => void;
}

// Feature flags slice
interface FeatureFlagsSlice {
  features: {
    betaFeatures: boolean;
    advancedReports: boolean;
    emailNotifications: boolean;
  };
  toggleFeature: (feature: keyof FeatureFlagsSlice['features']) => void;
  setFeature: (feature: keyof FeatureFlagsSlice['features'], value: boolean) => void;
}

// Notifications slice (client-side only)
interface NotificationsSlice {
  notifications: Array<{
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    message: string;
    timestamp: number;
  }>;
  addNotification: (type: NotificationsSlice['notifications'][0]['type'], message: string) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
}

// Combined store type
type Store = AuthSlice & UISlice & OnboardingSlice & FeatureFlagsSlice & NotificationsSlice;

export const useStore = create<Store>()(
  devtools(
    persist(
      (set) => ({
        // Auth state
        isAuthenticated: false,
        accessToken: null,
        refreshToken: null,
        setTokens: (access, refresh) => {
          localStorage.setItem('access_token', access);
          localStorage.setItem('refresh_token', refresh);
          set({ isAuthenticated: true, accessToken: access, refreshToken: refresh });
        },
        clearTokens: () => {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          set({ isAuthenticated: false, accessToken: null, refreshToken: null });
        },

        // UI state
        sidebarOpen: true,
        theme: 'light',
        toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
        setSidebarOpen: (open) => set({ sidebarOpen: open }),
        setTheme: (theme) => set({ theme }),

        // Onboarding state
        onboardingStep: 0,
        onboardingCompleted: false,
        setOnboardingStep: (step) => set({ onboardingStep: step }),
        completeOnboarding: () => set({ onboardingCompleted: true, onboardingStep: 0 }),
        resetOnboarding: () => set({ onboardingCompleted: false, onboardingStep: 0 }),

        // Feature flags
        features: {
          betaFeatures: false,
          advancedReports: false,
          emailNotifications: true,
        },
        toggleFeature: (feature) =>
          set((state) => ({
            features: {
              ...state.features,
              [feature]: !state.features[feature],
            },
          })),
        setFeature: (feature, value) =>
          set((state) => ({
            features: {
              ...state.features,
              [feature]: value,
            },
          })),

        // Notifications
        notifications: [],
        addNotification: (type, message) =>
          set((state) => ({
            notifications: [
              ...state.notifications,
              {
                id: `${Date.now()}-${Math.random()}`,
                type,
                message,
                timestamp: Date.now(),
              },
            ],
          })),
        removeNotification: (id) =>
          set((state) => ({
            notifications: state.notifications.filter((n) => n.id !== id),
          })),
        clearNotifications: () => set({ notifications: [] }),
      }),
      {
        name: 'app-storage',
        partialize: (state) => ({
          // Only persist these fields
          theme: state.theme,
          sidebarOpen: state.sidebarOpen,
          onboardingCompleted: state.onboardingCompleted,
          features: state.features,
        }),
      }
    ),
    { name: 'AppStore' }
  )
);

// Selectors for better performance
export const useAuth = () => useStore((state) => ({
  isAuthenticated: state.isAuthenticated,
  setTokens: state.setTokens,
  clearTokens: state.clearTokens,
}));

export const useUI = () => useStore((state) => ({
  sidebarOpen: state.sidebarOpen,
  theme: state.theme,
  toggleSidebar: state.toggleSidebar,
  setSidebarOpen: state.setSidebarOpen,
  setTheme: state.setTheme,
}));

export const useOnboarding = () => useStore((state) => ({
  onboardingStep: state.onboardingStep,
  onboardingCompleted: state.onboardingCompleted,
  setOnboardingStep: state.setOnboardingStep,
  completeOnboarding: state.completeOnboarding,
  resetOnboarding: state.resetOnboarding,
}));

export const useFeatureFlags = () => useStore((state) => ({
  features: state.features,
  toggleFeature: state.toggleFeature,
  setFeature: state.setFeature,
}));

export const useNotifications = () => useStore((state) => ({
  notifications: state.notifications,
  addNotification: state.addNotification,
  removeNotification: state.removeNotification,
  clearNotifications: state.clearNotifications,
}));