import "@testing-library/jest-dom";
import { vi } from "vitest";

// Mock next-auth server module once so helpers can set return values without redefining
vi.mock("next-auth", () => ({
  getServerSession: vi.fn(),
}));

// Mock environment variables
process.env.JWT_SECRET = "test-jwt-secret-key-for-testing-purposes-only";
process.env.NEXTAUTH_SECRET = "test-nextauth-secret-key-for-testing";
process.env.DATABASE_URL = "file:./test.db";
// NODE_ENV is read-only in type-check; tests run under proper env via Vitest config

// Mock Next.js modules that aren't available in test environment
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
  }),
  useSearchParams: () => ({
    get: vi.fn(),
  }),
}));

vi.mock("next-auth/react", () => ({
  useSession: vi.fn(() => ({
    data: null,
    status: "unauthenticated",
  })),
  signOut: vi.fn(),
  SessionProvider: ({ children }: { children: React.ReactNode }) => children,
}));

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
vi.stubGlobal("localStorage", localStorageMock);
