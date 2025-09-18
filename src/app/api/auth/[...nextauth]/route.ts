import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth-config";

/**
 * @swagger
 * /api/auth/{nextauth}:
 *   get:
 *     summary: NextAuth.js authentication endpoints
 *     description: Handles various NextAuth.js authentication flows including sign-in, sign-out, callbacks, etc.
 *     tags:
 *       - Authentication
 *     parameters:
 *       - in: path
 *         name: nextauth
 *         required: true
 *         schema:
 *           type: string
 *         description: NextAuth.js dynamic route parameter (signin, signout, callback, etc.)
 *     responses:
 *       200:
 *         description: Authentication flow handled successfully
 *       302:
 *         description: Redirect to appropriate authentication page or callback
 *   post:
 *     summary: NextAuth.js authentication endpoints
 *     description: Handles POST requests for NextAuth.js authentication flows
 *     tags:
 *       - Authentication
 *     parameters:
 *       - in: path
 *         name: nextauth
 *         required: true
 *         schema:
 *           type: string
 *         description: NextAuth.js dynamic route parameter
 *     responses:
 *       200:
 *         description: Authentication flow handled successfully
 *       302:
 *         description: Redirect to appropriate authentication page or callback
 */

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
