import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { vi, describe, beforeEach, it, expect } from "vitest";
import { LoginForm, RegisterForm, ForgotPasswordForm } from "@/components/auth";

// Mock NextAuth
vi.mock("next-auth/react", () => ({
  signIn: vi.fn(),
}));

// Mock Next.js router
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
}));

describe("Authentication Forms", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("LoginForm", () => {
    it("renders login form correctly", () => {
      render(<LoginForm />);

      expect(screen.getByLabelText("Email")).toBeInTheDocument();
      expect(screen.getByLabelText("Password")).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "Log in" })
      ).toBeInTheDocument();
    });

    it("shows validation errors for invalid input", async () => {
      render(<LoginForm />);

      const form = screen.getByRole("form");
      fireEvent.submit(form);

      await waitFor(() => {
        expect(screen.getByText("Invalid email address")).toBeInTheDocument();
        expect(screen.getByText("Password is required")).toBeInTheDocument();
      });
    });

    it("shows Google login button", () => {
      render(<LoginForm />);

      expect(screen.getByText("Continue with Google")).toBeInTheDocument();
    });
  });

  describe("RegisterForm", () => {
    it("renders register form correctly", () => {
      render(<RegisterForm />);

      expect(screen.getByText("Create your account")).toBeInTheDocument();
      expect(screen.getByLabelText("Email")).toBeInTheDocument();
      expect(screen.getByLabelText("Password")).toBeInTheDocument();
      expect(screen.getByLabelText("Confirm Password")).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "Create account" })
      ).toBeInTheDocument();
    });

    it("shows validation errors for password mismatch", async () => {
      render(<RegisterForm />);

      const passwordInput = screen.getByLabelText("Password");
      const confirmPasswordInput = screen.getByLabelText("Confirm Password");
      const form = screen.getByRole("form");

      fireEvent.change(passwordInput, { target: { value: "password123" } });
      fireEvent.change(confirmPasswordInput, {
        target: { value: "different123" },
      });
      fireEvent.submit(form);

      await waitFor(() => {
        expect(screen.getByText("Passwords don't match")).toBeInTheDocument();
      });
    });
  });

  describe("ForgotPasswordForm", () => {
    it("renders forgot password form correctly", () => {
      render(<ForgotPasswordForm />);

      expect(screen.getByText("Forgot your password?")).toBeInTheDocument();
      expect(screen.getByLabelText("Email")).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "Send reset link" })
      ).toBeInTheDocument();
    });

    it("shows validation error for invalid email", async () => {
      render(<ForgotPasswordForm />);

      const emailInput = screen.getByLabelText("Email");
      const form = screen.getByRole("form");

      fireEvent.change(emailInput, { target: { value: "invalid-email" } });
      fireEvent.submit(form);

      await waitFor(() => {
        expect(screen.getByText("Invalid email address")).toBeInTheDocument();
      });
    });
  });
});
