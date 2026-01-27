// User types
export interface User {
  id: number;
  username: string;
  email: string;
  plan_type: 'free' | 'pro' | 'enterprise';
  is_premium: boolean;
  primary_goal?: 'conversions' | 'roas' | 'traffic' | 'revenue';
  signup_date: string;
  last_login?: string;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface LoginResponse {
  user: User;
  tokens: AuthTokens;
  is_new_user?: boolean;
}

// Integration types
export interface IntegrationAccount {
  id: number;
  provider: 'google' | 'meta' | 'clarity';
  external_account_id: string;
  name: string;
  is_active: boolean;
  created_at: string;
}

export interface GAProperty {
  id: number;
  property_id: string;
  name: string;
  website_url?: string;
  integration_account: number;
  integration_account_name: string;
  created_at: string;
}

export interface MetaAdAccount {
  id: number;
  ad_account_id: string;
  name: string;
  integration_account: number;
  integration_account_name: string;
  currency?: string;
  created_at: string;
}

export interface AvailableProperty {
  id: string;
  name: string;
  account?: string;
}

export interface ConnectGoogleResponse {
  integration: IntegrationAccount;
  available_properties: AvailableProperty[];
}

export interface ConnectMetaResponse {
  integration: IntegrationAccount;
  available_ad_accounts: AvailableProperty[];
}

// Insight types
export type InsightSeverity = 'low' | 'medium' | 'high';
export type InsightStatus = 'active' | 'snoozed' | 'resolved';

export interface Insight {
  id: number;
  date: string;
  severity: InsightSeverity;
  title: string;
  source: 'ga4' | 'meta' | 'clarity';
  explanation: string;
  recommended_action: string;
  metadata: Record<string, unknown>;
  status: InsightStatus;
  snoozed_until?: string;
  resolved_at?: string;
  ga_property: number;
  ga_property_name: string;
  created_at: string;
}

export interface TodaysIssues {
  insights: Insight[];
  count: number;
  last_week_avg: number;
  date: string;
}

export interface DailyMetric {
  id: number;
  date: string;
  source: 'ga4' | 'meta';
  source_name: string;
  sessions: number;
  conversions: number;
  revenue: number;
  spend: number;
  page_path?: string;
  is_anomaly: boolean;
  anomaly_type?: string;
}

export interface ClaritySignal {
  id: number;
  date: string;
  page_path: string;
  rage_clicks: number;
  dead_clicks: number;
  session_ids: string[];
}

export interface SessionRecording {
  session_id: string;
  page_path: string;
  url: string;
}

export interface InsightDetail {
  insight: Insight;
  metrics: DailyMetric[];
  clarity_signals: ClaritySignal[];
  recordings: SessionRecording[];
}

export interface DashboardSummary {
  todays_issues: number;
  week_total: number;
  severity_breakdown: {
    high: number;
    medium: number;
    low: number;
  };
  metrics: {
    sessions: number;
    conversions: number;
    revenue: number;
    spend: number;
    conversion_rate: number;
  };
  metrics_change?: {
    sessions: number;
    conversions: number;
    revenue: number;
    spend: number;
    conversion_rate: number;
  };
  date: string;
}

// Request types
export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  password2: string;
}

export interface GoogleAuthRequest {
  code: string;

}

export interface UpdateProfileRequest {
  primary_goal?: 'conversions' | 'roas' | 'traffic' | 'revenue';
}

export interface ConnectGoogleRequest {
  code: string;
}

export interface ConnectMetaRequest {
  code: string;
}

export interface ConnectClarityRequest {
  api_key: string;
  project_id: string;
}

export interface SelectPropertiesRequest {
  property_ids: string[];
}

export interface SelectMetaAccountsRequest {
  account_ids: string[];
}

export interface UpdateInsightStatusRequest {
  status: InsightStatus;
  snoozed_hours?: number;
}

export interface InsightHistoryParams {
  days?: number;
  severity?: InsightSeverity;
  status?: InsightStatus;
}