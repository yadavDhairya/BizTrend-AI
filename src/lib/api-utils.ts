import { NextResponse } from 'next/server';

// Standard API response types
export interface ApiResponse<T = any> {
  data?: T;
  message?: string;
  status: 'success' | 'error';
  timestamp: string;
}

export interface ApiError {
  error: string;
  status: 'error';
  timestamp: string;
  code?: string;
}

// Success response helper
export function successResponse<T>(
  data?: T,
  message?: string,
  statusCode: number = 200
): NextResponse<ApiResponse<T>> {
  return NextResponse.json(
    {
      data,
      message,
      status: 'success',
      timestamp: new Date().toISOString(),
    },
    { status: statusCode }
  );
}

// Error response helper
export function errorResponse(
  error: string,
  statusCode: number = 400,
  code?: string
): NextResponse<ApiError> {
  return NextResponse.json(
    {
      error,
      status: 'error',
      timestamp: new Date().toISOString(),
      code,
    },
    { status: statusCode }
  );
}

// Validation helper
export function validateRequiredFields(
  body: any,
  requiredFields: string[]
): string | null {
  for (const field of requiredFields) {
    if (!body[field]) {
      return `${field} is required`;
    }
  }
  return null;
}

// CORS headers helper
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};