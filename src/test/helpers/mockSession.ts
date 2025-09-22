import { vi } from "vitest";
import { getServerSession } from "next-auth";

export function mockSession(userId: string) {
  (getServerSession as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
    user: { id: userId, email: "test@example.com" },
    expires: "9999-12-31",
  } as any);
}

export function clearSession() {
  (getServerSession as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(
    null as any
  );
}
