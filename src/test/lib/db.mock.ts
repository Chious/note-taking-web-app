import { vi } from "vitest";

// Mock user data for testing
export const mockUsers = [
  {
    id: "user-1",
    email: "test@example.com",
    password: "$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VcLzHcqPa", // "password123"
    createdAt: new Date("2023-01-01"),
    updatedAt: new Date("2023-01-01"),
  },
  {
    id: "user-2",
    email: "existing@example.com",
    password: "$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VcLzHcqPa", // "password123"
    createdAt: new Date("2023-01-01"),
    updatedAt: new Date("2023-01-01"),
  },
];

export const createMockPrisma = () => {
  const users = [...mockUsers];

  return {
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
          createdAt: new Date(),
          updatedAt: new Date(),
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
            updatedAt: new Date(),
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
    $disconnect: vi.fn(() => Promise.resolve()),
  };
};

// Export the mock for use in tests
export const mockPrismaInstance = createMockPrisma();

// Mock the getDb function
export const mockGetDb = vi.fn(() => mockPrismaInstance);

// Mock the getDbAsync function
export const mockGetDbAsync = vi.fn(() => Promise.resolve(mockPrismaInstance));
