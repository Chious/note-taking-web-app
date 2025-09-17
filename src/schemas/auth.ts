import { z } from "zod";

// User schema
export const UserSchema = z.object({
  id: z.number().int().positive().describe("Unique identifier for the user"),
  email: z.string().email().describe("User email address"),
  createdAt: z.date().describe("User registration timestamp"),
});

// Login request schema
export const LoginRequestSchema = z.object({
  email: z
    .string()
    .email("Invalid email address")
    .describe("User email address"),
  password: z.string().min(1, "Password is required").describe("User password"),
});

// Login response schema
export const LoginResponseSchema = z.object({
  message: z.string().describe("Response message"),
  token: z.string().describe("JWT authentication token"),
  user: UserSchema,
});

// Register request schema
export const RegisterRequestSchema = z.object({
  email: z
    .string()
    .email("Invalid email address")
    .describe("User email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters long")
    .describe("User password (minimum 8 characters)"),
});

// Register response schema
export const RegisterResponseSchema = z.object({
  message: z.string().describe("Response message"),
  user: UserSchema,
});

// Auth test response schema
export const AuthTestResponseSchema = z.object({
  message: z.string().describe("Response message"),
  userId: z.number().int().positive().describe("Authenticated user ID"),
});

// Error response schema
export const ErrorResponseSchema = z.object({
  error: z.string().describe("Error message"),
  details: z
    .array(
      z.object({
        field: z.string().describe("Field name"),
        message: z.string().describe("Error message for the field"),
      })
    )
    .optional()
    .describe("Detailed validation errors (when applicable)"),
});

// Health check response schema
export const HealthResponseSchema = z.object({
  status: z.string().describe("Service status"),
  db: z.string().describe("Database connection status"),
  timestamp: z.string().describe("Response timestamp"),
  data: z
    .object({
      userCount: z
        .number()
        .int()
        .min(0)
        .describe("Number of users in database"),
      noteCount: z
        .number()
        .int()
        .min(0)
        .describe("Number of notes in database"),
    })
    .optional()
    .describe("Additional data"),
  error: z.string().optional().describe("Error message if any"),
});

// API Docs Authentication schemas
export const AuthRequestSchema = z.object({
  username: z
    .string()
    .min(1, "Username is required")
    .describe("API docs username"),
  password: z
    .string()
    .min(1, "Password is required")
    .describe("API docs password"),
});

export const AuthResponseSchema = z.object({
  success: z.boolean().describe("Authentication success status"),
  message: z.string().describe("Response message"),
});

// Type exports for TypeScript usage
export type User = z.infer<typeof UserSchema>;
export type LoginRequest = z.infer<typeof LoginRequestSchema>;
export type LoginResponse = z.infer<typeof LoginResponseSchema>;
export type RegisterRequest = z.infer<typeof RegisterRequestSchema>;
export type RegisterResponse = z.infer<typeof RegisterResponseSchema>;
export type AuthTestResponse = z.infer<typeof AuthTestResponseSchema>;
export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;
export type HealthResponse = z.infer<typeof HealthResponseSchema>;
export type AuthRequest = z.infer<typeof AuthRequestSchema>;
export type AuthResponse = z.infer<typeof AuthResponseSchema>;
