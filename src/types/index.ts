// ============================================================================
// ShopMind — Core TypeScript Contracts
// Source: AI_ARCHITECTURE.md, DATABASE_SCHEMA.md, API_SPEC.md
// ============================================================================

// ---------------------------------------------------------------------------
// Enums & Union Types (from AI_ARCHITECTURE.md §Intent Taxonomy & Slot Schema)
// ---------------------------------------------------------------------------

export type Intent =
  | 'sale'
  | 'expense'
  | 'credit_given'
  | 'credit_received'
  | 'stock_update'
  | 'stock_check'
  | 'return';

export type PaymentMode = 'cash' | 'upi' | 'card' | 'credit' | 'other';

export type DueStatus = 'paid' | 'due' | 'partial' | 'none';

export type TransactionStatus = 'pending' | 'confirmed' | 'cancelled';

export type CreditLedgerType = 'credit' | 'debit';

export type SupportedLanguage = 'en' | 'hi' | 'te';

export type AIProvider = 'gemini' | 'groq' | 'local' | 'ollama' | 'manual';

export type RequestType = 'transcription' | 'parsing';

// ---------------------------------------------------------------------------
// AI Pipeline Types (from AI_ARCHITECTURE.md §Provider Abstraction Layer)
// ---------------------------------------------------------------------------

export interface ParsedTransaction {
  intent: Intent;
  item?: string;
  quantity?: number;
  unit?: string;
  amount?: number;
  customer?: string;
  payment_mode?: PaymentMode;
  due_status?: DueStatus;
  confidence: number;
  raw_transcript: string;
  normalized_transcript: string;
  provider_used: AIProvider;
}

export interface MerchantContext {
  businessType: string;
  commonItems: string[];
  regularCustomers: string[];
  preferredLanguage: SupportedLanguage;
  recentTransactions?: ParsedTransaction[];
}

export interface QuotaStatus {
  remaining: number;
  resetAt: Date;
  isExhausted: boolean;
}

export interface ParseResult {
  success: boolean;
  data?: ParsedTransaction;
  error?: string;
  fallbackTriggered?: boolean;
}

/**
 * TransactionParser interface — all AI providers implement this.
 * Source: ARCHITECTURE.md §AI Parsing Pipeline, AI_ARCHITECTURE.md §Provider Abstraction
 */
export interface TransactionParser {
  readonly provider: AIProvider;
  readonly model: string;
  readonly priority: number;

  parse(transcript: string, context?: MerchantContext): Promise<ParseResult>;
  isAvailable(): Promise<boolean>;
  getQuotaStatus(): Promise<QuotaStatus>;
}

// ---------------------------------------------------------------------------
// Parser Metrics (from AI_ARCHITECTURE.md §Model Performance Monitoring)
// ---------------------------------------------------------------------------

export interface ParserMetrics {
  provider: AIProvider;
  model: string;
  latencyMs: number;
  confidence: number;
  wasAccepted: boolean;
  wasEdited: boolean;
  editedFields: string[];
  timestamp: Date;
}

// ---------------------------------------------------------------------------
// Database Model Types (from DATABASE_SCHEMA.md)
// ---------------------------------------------------------------------------

export interface Merchant {
  id: string;
  name: string;
  shop_name: string;
  phone: string;
  language_preference: SupportedLanguage;
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: string;
  merchant_id: string;
  intent: Intent;
  item: string | null;
  quantity: number | null;
  unit: string | null;
  amount: number;
  customer_name: string | null;
  payment_mode: PaymentMode | null;
  due_status: DueStatus;
  confidence_score: number | null;
  raw_transcript: string | null;
  provider_used: AIProvider | null;
  status: TransactionStatus;
  created_at: string;
}

export interface Customer {
  id: string;
  merchant_id: string;
  name: string;
  phone: string | null;
  total_credit: number;
  total_paid: number;
  created_at: string;
  updated_at: string;
}

export interface InventoryItem {
  id: string;
  merchant_id: string;
  item_name: string;
  quantity: number;
  unit: string;
  reorder_level: number;
  last_updated: string;
}

export interface CreditLedgerEntry {
  id: string;
  merchant_id: string;
  customer_id: string;
  transaction_id: string | null;
  amount: number;
  type: CreditLedgerType;
  balance_after: number;
  created_at: string;
}

export interface AuditLog {
  id: string;
  merchant_id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  old_value: Record<string, unknown> | null;
  new_value: Record<string, unknown> | null;
  created_at: string;
}

export interface ApiUsageRecord {
  id: string;
  provider: AIProvider;
  model: string;
  tokens_used: number;
  request_type: RequestType;
  success: boolean;
  created_at: string;
}

// ---------------------------------------------------------------------------
// API Response Types (from API_SPEC.md §Common Response Format)
// ---------------------------------------------------------------------------

export interface PaginationMeta {
  page: number;
  per_page: number;
  total: number;
}

export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  meta?: PaginationMeta;
}

export interface ApiErrorDetail {
  field?: string;
  message: string;
}

export type ApiErrorCode =
  | 'VALIDATION_ERROR'
  | 'INVALID_AUDIO'
  | 'UNAUTHORIZED'
  | 'TOKEN_EXPIRED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'LOW_CONFIDENCE'
  | 'RATE_LIMITED'
  | 'INTERNAL_ERROR'
  | 'PROVIDER_UNAVAILABLE';

export interface ApiErrorResponse {
  success: false;
  error: {
    code: ApiErrorCode;
    message: string;
    details?: ApiErrorDetail[] | Record<string, unknown>;
  };
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

// ---------------------------------------------------------------------------
// Auth Types (from API_SPEC.md §Auth)
// ---------------------------------------------------------------------------

export interface AuthSession {
  access_token: string;
  refresh_token: string;
  expires_at: number;
}

export interface SignupRequest {
  phone: string;
  password: string;
  name: string;
  shop_name: string;
  language_preference?: SupportedLanguage;
}

export interface LoginRequest {
  phone: string;
  password: string;
}

export interface AuthResponse {
  user: Pick<Merchant, 'id' | 'phone' | 'name' | 'shop_name'>;
  session: AuthSession;
}

// ---------------------------------------------------------------------------
// Transaction API Types (from API_SPEC.md §Transactions)
// ---------------------------------------------------------------------------

export interface ConfirmTransactionRequest {
  transaction_id: string;
  corrections?: Partial<Pick<Transaction, 'intent' | 'item' | 'quantity' | 'unit' | 'amount' | 'customer_name' | 'payment_mode' | 'due_status'>>;
}

export interface TransactionListParams {
  page?: number;
  per_page?: number;
  status?: TransactionStatus;
  intent?: Intent;
  from?: string;
  to?: string;
  search?: string;
}

// ---------------------------------------------------------------------------
// Dashboard Types (from API_SPEC.md §Dashboard)
// ---------------------------------------------------------------------------

export type DashboardPeriod = 'today' | 'week' | 'month' | 'year';

export interface DashboardSummary {
  period: DashboardPeriod;
  total_sales: number;
  total_purchases: number;
  total_credit_given: number;
  total_credit_received: number;
  net_revenue: number;
  transaction_count: number;
  top_items: Array<{
    item: string;
    quantity_sold: number;
    revenue: number;
  }>;
  outstanding_credit: number;
  low_stock_count: number;
}

// ---------------------------------------------------------------------------
// Rate Limiter Types (from AI_ARCHITECTURE.md §Quota Management)
// ---------------------------------------------------------------------------

export interface RateLimiterConfig {
  provider: AIProvider;
  model: string;
  rpm: number;       // requests per minute
  tpm: number;       // tokens per minute
  dailyLimit: number; // requests per day
  safetyMarginPct: number; // e.g. 0.8 = route to fallback at 80% usage
}

export interface TokenBucketState {
  tokens: number;
  lastRefill: number;
  dailyUsed: number;
  dailyResetAt: number;
}
