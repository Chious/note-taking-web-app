# NextAuth.js 初始設定指南

> 這篇指南是整理自 [NextAuth.js 官方文件](https://next-auth.js.org/getting-started/example)。

### 1. 安裝 NextAuth.js & Setup Credentials

```bash
npm install next-auth
```

- `env` 中需要設定 `NEXTAUTH_SECRET`

```bash
openssl rand -base64 32
```

```bash
NEXTAUTH_URL=your-domain-here # 例如：http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-at-least-32-characters-long
```

### 2. 設定 NextAuth 路徑

`/api/auth/[...nextauth].js`: 這個路徑是 NextAuth.js 的預設路徑，用於處理 登入、登出、驗證 的請求。

next-auth-config 中常見的管理的選項有：

- `provider`（登入平台）：如 Google、GitHub、Facebook 等
- `CredentialsProvider`（憑證提供者）：如 Email、Password 等

```js
import NextAuth from "next-auth";
import GithubProvider from "next-auth/providers/github";

export const authOptions = {
  // Configure one or more authentication providers
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
    }),
    // ...add more providers here
  ],
};

export default NextAuth(authOptions);
```

3. 實作登入機制：DB 檢查、JWT 生成等等

> 同樣會將邏輯寫在 next-auth 的 config 中（接續步驟 2 的 authOptions）

```typescript
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { z } from "zod";
import { getDb } from "@/lib/db";
import { verifyPassword, hashPassword } from "@/lib/auth";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },
  jwt: {
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },
  pages: {
    signIn: "/",
    error: "/",
  },
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        try {
          const db = getDb();

          // Check if user already exists
          let existingUser = await db.user.findUnique({
            where: { email: user.email! },
          });

          if (!existingUser) {
            // Create new user for Google OAuth
            existingUser = await db.user.create({
              data: {
                email: user.email!,
                password: await hashPassword("google_oauth_user"), // Dummy password for OAuth users
              },
            });
          }

          // Update user object with database ID
          user.id = existingUser.id.toString();
        } catch (error) {
          console.error("Google OAuth error:", error);
          return false;
        }
      }
      return true;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
```

3. 登入請求

Server 端登入請求：

```js
import { signIn } from "next-auth/react";

const result = await signIn("credentials", {
  redirect: false,
  email: formData.email,
  password: formData.password,
});
```

4. 驗證登入狀態（用戶端）

Client 端登入請求：

```js
import { useSession } from "next-auth/react";

const { data: session, status } = useSession();
```

Server 端驗證登入狀態：例如放在 middleware.ts 中

```typescript
import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  if (!token) {
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 }
    );
  }
}
```

1. NextAuth.js: https://next-auth.js.org
