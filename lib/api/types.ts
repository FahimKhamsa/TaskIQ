// Base types from Prisma schema
export type PlanType = "FREE" | "MONTHLY" | "BI_YEARLY" | "YEARLY";
export type OfferType = "PROMO" | "DISCOUNT" | "TRIAL" | "CREDIT_BONUS";
export type AnnouncementStatus =
  | "DRAFT"
  | "PUBLISHED"
  | "SHEDULED"
  | "FAILED"
  | "ARCHIVED";
export type LogType = "INFO" | "SUCCESS" | "WARNING" | "ERROR";
export type GoogleService = "GMAIL" | "CALENDAR" | "DRIVE";
export type UserRole = "USER" | "ADMIN" | "SUPER_ADMIN";
export type UserStatus = "ACTIVE" | "INACTIVE" | "SUSPENDED";

// Core entity types
export interface User {
  id: string;
  createdAt: Date | null;
  updatedAt: Date | null;
  fullName: string | null;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  phone: string | null;
  dob: Date | null;
  tgId: string | null;
  authSessionTgId: string | null;
  role: UserRole | null;
  status: UserStatus | null;
}

export interface Pricing {
  id: string;
  createdAt: Date | null;
  planType: PlanType | null;
  price: number | null;
}

export interface Subscription {
  id: string;
  createdAt: Date | null;
  userId: string | null;
  isSubscribed: boolean | null;
  plan: PlanType | null;
  startDate: Date | null;
  endDate: Date | null;
  stripeId: string | null;
}

export interface Credit {
  id: string;
  createdAt: Date | null;
  userId: string | null;
  dailyLimit: number | null;
  usedToday: number | null;
  lastUpdated: Date | null;
}

export interface AuthSession {
  createdAt: Date | null;
  tgId: string;
  userId: string | null;
  tempKey: string | null;
  sessionValid: boolean | null;
}

export interface Log {
  id: string;
  createdAt: Date | null;
  userId: string | null;
  type: LogType | null;
  content: string | null;
  isPremium: boolean | null;
}

export interface GoogleToken {
  createdAt: Date | null;
  userId: string;
  services: GoogleService;
  accessToken: string | null;
  refreshToken: string | null;
  expiry: Date | null;
}

export interface UserAnalytics {
  id: string;
  createdAt: Date | null;
  userId: string | null;
  totalPromptPerDay: number | null;
  totalSpent: number | null;
  planType: string | null;
  activeIntegrations: string[];
}

// Top user data structure
export interface TopUserData {
  user: string;
  prompts: number;
  credits_used: number;
  joined_at: string;
}

// Recently added user data structure
export interface RecentlyAddedUserData {
  name: string;
  email: string;
  joined_at: string;
  plan: PlanType;
}

export interface AdminAnalytics {
  id: string;
  createdAt: Date | null;
  totalUsers: number | null;
  topUsers: TopUserData[];
  activeIntegrations: string[];
  conversionRate: number | null;
  mostUsedCommands: string[];
  recentlyAddedUsers: RecentlyAddedUserData[];
}

export interface Offer {
  id: string;
  createdAt: Date | null;
  priceId: string | null;
  offerType: OfferType | null;
  offerName: string | null;
  offerStatus: boolean | null;
  expirationDate: Date | null;
  totalClaimed: number | null;
}

export interface OfferClaim {
  id: string;
  createdAt: Date | null;
  offerId: string | null;
  userId: string | null;
}

export interface Announcement {
  id: string;
  createdAt: Date | null;
  updatedAt: Date | null;
  title: string | null;
  body: string | null;
  currentStatus: AnnouncementStatus | null;
}

// Extended types with relations
export interface UserWithRelations extends User {
  subscription?: Subscription | null;
  credit?: Credit | null;
  userAnalytics?: UserAnalytics | null;
  logs?: Log[];
  googleTokens?: GoogleToken[];
  offerClaims?: (OfferClaim & { offer?: Offer | null })[];
}

export interface CreditWithUser extends Credit {
  user?: {
    id: string;
    email: string | null;
    fullName: string | null;
  } | null;
}

export interface SubscriptionWithPricing extends Subscription {
  pricing?: Pricing | null;
}

export interface OfferWithPricing extends Offer {
  price?: Pricing | null;
}

export interface OfferClaimWithOffer extends OfferClaim {
  offer?: Offer | null;
}

// API Response types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export interface CreditsResponse {
  credits: CreditWithUser;
}

export interface ConsumeCreditsResponse {
  credits: CreditWithUser;
  consumed: number;
  remaining: number;
}

export interface AddCreditsResponse {
  credits: CreditWithUser;
  added: number;
}

export interface UserProfileResponse {
  user: UserWithRelations;
}

export interface SubscriptionPlansResponse {
  plans: Pricing[];
}

export interface ActiveOffersResponse {
  offers: OfferWithPricing[];
}

export interface LogsResponse {
  logs: Log[];
  total: number;
}

export interface AdminStatsResponse {
  totalUsers: number;
  activeUsers: number;
  totalCreditsUsed: number;
  totalRevenue: number;
  conversionRate: number;
}

export interface SystemStatsResponse {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  suspendedUsers: number;
  totalSubscriptions: number;
  activeSubscriptions: number;
  totalCreditsUsed: number;
  totalRevenue: number;
  conversionRate: number;
  planDistribution: {
    free: number;
    monthly: number;
    yearly: number;
    bi_yearly: number;
  };
  recentUsers: Array<{
    name: string;
    email: string;
    joined_at: string;
    plan: string;
  }>;
  topUsers: Array<{
    user: string;
    prompts: number;
    credits_used: number;
    joined_at: string;
  }>;
  activeIntegrations: string[];
  mostUsedCommands: string[];
  lastUpdated: string;
}

export interface SystemHealthResponse {
  status: "healthy" | "degraded" | "down";
  database: "connected" | "disconnected";
  uptime: number;
  version: string;
}

export interface UpgradeSubscriptionResponse {
  subscription?: Subscription;
  redirectUrl?: string;
  message?: string;
}

// Admin Analytics API Response types
export interface AdminAnalyticsResponse {
  analytics: AdminAnalytics;
}

export interface AdminAnalyticsListResponse {
  analytics: AdminAnalytics[];
  total: number;
}

export interface GenerateAnalyticsRequest {
  forceRefresh?: boolean;
}

// Admin User with computed fields for display
export interface AdminUser extends User {
  planType: string;
  totalPrompts: number;
  totalSpent: number;
  activeIntegrations: string[];
  remainingCredits: number;
  credit: Credit | null;
  subscription: Subscription | null;
  userAnalytics: UserAnalytics | null;
}

// Admin Users API Response types
export interface AdminUsersResponse {
  users: AdminUser[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  stats: {
    totalUsers: number;
    activeUsers: number;
    inactiveUsers: number;
    suspendedUsers: number;
    planDistribution: {
      free: number;
      monthly: number;
      yearly: number;
      bi_yearly: number;
    };
    recentUsers: {
      id: string;
      email: string;
      fullName: string;
      createdAt: Date | null;
      planType: string;
      totalSpent: number;
    }[];
    totalSpent: number;
    totalPrompts: number;
  };
}

// Admin Logs API Response types
export interface LogWithUser extends Log {
  user?: {
    id: string;
    email: string | null;
    fullName: string | null;
  } | null;
  displayType: string;
  userDisplay: string;
  formattedTime: string;
  isPremiumAction: boolean;
}

export interface AdminLogsResponse {
  logs: LogWithUser[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  stats: {
    overall: Record<string, number>;
    filtered: Record<string, number>;
    total: number;
    filteredTotal: number;
  };
}

export interface CreateLogRequest {
  userId?: string;
  type: LogType;
  content: string;
  isPremium?: boolean;
}

export interface UpdateLogRequest {
  id: string;
  type?: LogType;
  content?: string;
  isPremium?: boolean;
}

// Request types
export interface ConsumeCreditsRequest {
  action: "consume";
  amount: number;
  description?: string;
}

export interface AddCreditsRequest {
  action: "add";
  amount: number;
}

export interface UpdateUserRequest {
  fullName?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  dob?: string;
}

export interface CreateOfferRequest {
  priceId?: string;
  offerType: OfferType;
  offerName: string;
  offerStatus: boolean;
  expirationDate?: string;
}

export interface CreateAnnouncementRequest {
  title: string;
  body: string;
  currentStatus: AnnouncementStatus;
}

// Dashboard specific types
export interface DashboardStats {
  commandsUsed: {
    value: string;
    change: string;
    changeType: "positive" | "negative" | "neutral";
  };
  creditsRemaining: {
    value: string;
    description: string;
    change: string;
    changeType: "positive" | "negative" | "neutral";
  };
  activeIntegrations: {
    value: string;
    change: string;
    changeType: "positive" | "negative" | "neutral";
  };
  botUptime: {
    value: string;
    change: string;
    changeType: "positive" | "negative" | "neutral";
  };
}

export interface IntegrationStatus {
  name: string;
  service: GoogleService;
  status: "connected" | "disconnected" | "error";
  lastUsed: string;
  isActive: boolean;
}
