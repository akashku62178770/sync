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

// Notifications slice
interface NotificationsSlice {
  notifications: Array<{
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    message: string;
    timestamp: number;
  }>;
  addNotification: (type: 'success' | 'error' | 'warning' | 'info', message: string) => void;
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
                id: crypto.randomUUID(),
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

// Optimized selectors - use individual selectors to prevent re-renders
export const useAuth = () => ({
  isAuthenticated: useStore((state) => state.isAuthenticated),
  setTokens: useStore((state) => state.setTokens),
  clearTokens: useStore((state) => state.clearTokens),
});

export const useUI = () => ({
  sidebarOpen: useStore((state) => state.sidebarOpen),
  theme: useStore((state) => state.theme),
  toggleSidebar: useStore((state) => state.toggleSidebar),
  setSidebarOpen: useStore((state) => state.setSidebarOpen),
  setTheme: useStore((state) => state.setTheme),
});

export const useOnboarding = () => ({
  onboardingStep: useStore((state) => state.onboardingStep),
  onboardingCompleted: useStore((state) => state.onboardingCompleted),
  setOnboardingStep: useStore((state) => state.setOnboardingStep),
  completeOnboarding: useStore((state) => state.completeOnboarding),
  resetOnboarding: useStore((state) => state.resetOnboarding),
});

export const useFeatureFlags = () => ({
  features: useStore((state) => state.features),
  toggleFeature: useStore((state) => state.toggleFeature),
  setFeature: useStore((state) => state.setFeature),
});

export const useNotifications = () => ({
  notifications: useStore((state) => state.notifications),
  addNotification: useStore((state) => state.addNotification),
  removeNotification: useStore((state) => state.removeNotification),
  clearNotifications: useStore((state) => state.clearNotifications),
});