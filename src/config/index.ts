/**
 * Application configuration
 * Environment-specific values and constants
 *
 * Note: process.env.NODE_ENV is injected at build time by webpack.
 * Webpack replaces it with the actual string value during bundling.
 */

export const config = {
  // Environment (webpack replaces process.env.NODE_ENV at build time)
  isDevelopment: process.env.NODE_ENV === "development",
  isProduction: process.env.NODE_ENV === "production",

  // POS Service
  posService: {
    // Change this endpoint as needed for your environment
    endpoint: "https://4dc811ba5137.ngrok-free.app/payment",
  },

  // PIN Configuration
  pin: {
    length: 4,
    maxAttempts: 3,
    // WARNING: This is for development only - in production, PIN validation should be server-side
    devPin: "1234",
  },

  // Currency
  currency: {
    default: "EUR",
    decimals: 2,
  },

  // Transaction
  transaction: {
    defaultPinThreshold: 100, // Transactions above this amount require PIN
  },

  // Card Communication
  card: {
    timeout: 5000, // APDU command timeout in ms
  },

  // Storage
  storage: {
    localStorageKey: "ilfpos",
  },
} as const;

// Type-safe config
export type Config = typeof config;
