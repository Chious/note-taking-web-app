import { vi } from "vitest";

// Mock user data for testing
export const mockUsers = [
  {
    id: "user-1",
    email: "test@example.com",
    password: "$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VcLzHcqPa", // "password123"
    createdAt: new Date("2023-01-01").toISOString(),
    updatedAt: new Date("2023-01-01").toISOString(),
  },
  {
    id: "user-2",
    email: "existing@example.com",
    password: "$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VcLzHcqPa", // "password123"
    createdAt: new Date("2023-01-01").toISOString(),
    updatedAt: new Date("2023-01-01").toISOString(),
  },
];

export const createMockDrizzle = () => {
  // Use the actual mockUsers array so changes are reflected
  const users = mockUsers;

  return {
    select: vi.fn((_fields: any) => ({
      from: vi.fn((_table: any) => ({
        where: vi.fn((condition: any) => ({
          limit: vi.fn((_count: number) => {
            // Find user by email - this is what the actual API routes use
            console.log("Mock Drizzle query - condition:", condition);
            // Handle Drizzle eq() condition - extract email from SQL object
            let email = null;
            if (condition && typeof condition === "object") {
              if (condition.email) {
                email = condition.email;
              } else if (condition.column && condition.value) {
                // This is likely an eq() condition from Drizzle
                email = condition.value;
              } else if (
                condition.queryChunks &&
                Array.isArray(condition.queryChunks)
              ) {
                // Extract email from Drizzle SQL object queryChunks
                const paramChunk = condition.queryChunks.find(
                  (chunk: any) =>
                    chunk &&
                    typeof chunk === "object" &&
                    chunk.value &&
                    chunk.encoder
                );
                if (paramChunk) {
                  email = paramChunk.value;
                }
              }
            }
            console.log("Mock Drizzle query - looking for email:", email);
            const user = users.find((u) => u.email === email);
            console.log("Mock Drizzle query - found user:", user);
            return Promise.resolve(user ? [user] : []);
          }),
        })),
      })),
    })),
    insert: vi.fn((_table: any) => ({
      values: vi.fn((data: any) => ({
        returning: vi.fn((_fields: any) => {
          const newUser = {
            id: `user-${users.length + 1}`,
            email: data.email,
            password: data.password,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          users.push(newUser);
          return Promise.resolve([newUser]);
        }),
      })),
    })),
    // Add schema tables for compatibility
    users: {},
    notes: {},
    // Add Prisma-style compatibility for tests
    user: {
      findUnique: vi.fn(
        ({ where }: { where: { email?: string; id?: string } }) => {
          if (where.email) {
            return Promise.resolve(
              users.find((user) => user.email === where.email) || null
            );
          }
          if (where.id) {
            return Promise.resolve(
              users.find((user) => user.id === where.id) || null
            );
          }
          return Promise.resolve(null);
        }
      ),
      create: vi.fn(({ data, select }: { data: any; select?: any }) => {
        const newUser = {
          id: `user-${users.length + 1}`,
          email: data.email,
          password: data.password,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        users.push(newUser);

        if (select) {
          const selectedFields: any = {};
          Object.keys(select).forEach((key) => {
            if (select[key]) {
              selectedFields[key] = (newUser as any)[key];
            }
          });
          return Promise.resolve(selectedFields);
        }

        return Promise.resolve(newUser);
      }),
      findMany: vi.fn(() => Promise.resolve(users)),
      update: vi.fn(({ where, data }: { where: any; data: any }) => {
        const userIndex = users.findIndex((user) => user.id === where.id);
        if (userIndex >= 0) {
          users[userIndex] = {
            ...users[userIndex],
            ...data,
            updatedAt: new Date().toISOString(),
          };
          return Promise.resolve(users[userIndex]);
        }
        throw new Error("User not found");
      }),
      delete: vi.fn(({ where }: { where: any }) => {
        const userIndex = users.findIndex((user) => user.id === where.id);
        if (userIndex >= 0) {
          const deletedUser = users.splice(userIndex, 1)[0];
          return Promise.resolve(deletedUser);
        }
        throw new Error("User not found");
      }),
    },
  };
};

// Export the mock for use in tests
export const mockDrizzleInstance = createMockDrizzle();

// Mock the getDb function
export const mockGetDb = vi.fn(() => mockDrizzleInstance);

// Mock the getDbAsync function
export const mockGetDbAsync = vi.fn(() => Promise.resolve(mockDrizzleInstance));
