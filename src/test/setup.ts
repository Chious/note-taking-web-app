import "@testing-library/jest-dom";
import { vi } from "vitest";

// Mock environment variables
process.env.JWT_SECRET = "test-jwt-secret-key-for-testing-purposes-only";
process.env.NEXTAUTH_SECRET = "test-nextauth-secret-key-for-testing";
process.env.DATABASE_URL = "file:./test.db";
process.env.NODE_ENV = "test";

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
