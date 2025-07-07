// Base types from Prisma schema
export type PlanType = "FREE" | "PRO" | "ENTERPRISE";
export type OfferType = "PROMO" | "DISCOUNT" | "TRIAL" | "CREDIT_BONUS";
export type AnnouncementStatus =
  | "DRAFT"
  | "PUBLISHED"
  | "SHEDULED"
  | "FAILED"
  | "ARCHIVED";
export type LogType = "INFO" | "SUCCESS" | "WARNING" | "ERROR";
export type GoogleService = "GMAIL" | "CALENDAR" | "DRIVE";

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

export interface AdminAnalytics {
  id: string;
  createdAt: Date | null;
  totalUsers: number | null;
  topUsers: any[];
  activeIntegrations: string[];
  conversionRate: number | null;
  mostUsedCommands: string[];
  recentlyAddedUsers: any[];
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
