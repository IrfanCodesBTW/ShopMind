// ============================================================================
// API Response Helpers
// Source: API_SPEC.md §Common Response Format, §Error Codes
// ============================================================================

import { NextResponse } from 'next/server';
import type {
  ApiSuccessResponse,
  ApiErrorResponse,
  ApiErrorCode,
  PaginationMeta,
} from '@/types';

/**
 * Create a standardized success response.
 */
export function successResponse<T>(
  data: T,
  meta?: PaginationMeta,
  status: number = 200
): NextResponse<ApiSuccessResponse<T>> {
  const body: ApiSuccessResponse<T> = { success: true, data };
  if (meta) body.meta = meta;
  return NextResponse.json(body, { status });
}

/**
 * Create a standardized error response.
 */
export function errorResponse(
  code: ApiErrorCode,
  message: string,
  status: number,
  details?: Record<string, unknown> | Array<{ field?: string; message: string }>
): NextResponse<ApiErrorResponse> {
  const body: ApiErrorResponse = {
    success: false,
    error: { code, message },
  };
  if (details) body.error.details = details;
  return NextResponse.json(body, { status });
}

// ── Pre-built error factories ──────────────────────────────────────────────

export const Errors = {
  validation: (message: string, details?: Array<{ field?: string; message: string }>) =>
    errorResponse('VALIDATION_ERROR', message, 400, details),

  invalidAudio: (message = 'Audio file format not supported or corrupted') =>
    errorResponse('INVALID_AUDIO', message, 400),

  unauthorized: (message = 'Missing or invalid authentication token') =>
    errorResponse('UNAUTHORIZED', message, 401),

  tokenExpired: (message = 'Access token has expired') =>
    errorResponse('TOKEN_EXPIRED', message, 401),

  forbidden: (message = 'You do not have permission for this resource') =>
    errorResponse('FORBIDDEN', message, 403),

  notFound: (message = 'Requested resource does not exist') =>
    errorResponse('NOT_FOUND', message, 404),

  conflict: (message = 'Resource already exists') =>
    errorResponse('CONFLICT', message, 409),

  lowConfidence: (message: string, details: Record<string, unknown>) =>
    errorResponse('LOW_CONFIDENCE', message, 422, details),

  rateLimited: (message = 'Too many requests, please slow down') =>
    errorResponse('RATE_LIMITED', message, 429),

  internal: (message = 'An unexpected error occurred') =>
    errorResponse('INTERNAL_ERROR', message, 500),

  providerUnavailable: (message = 'AI provider is temporarily unavailable') =>
    errorResponse('PROVIDER_UNAVAILABLE', message, 503),
} as const;
