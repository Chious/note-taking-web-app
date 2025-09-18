# Centralized API Documentation

> **📌 CENTRALIZED API DOCUMENTATION**  
> This is the **single source of truth** for all API endpoints, tech stack, schemas, and configurations. All API-related information must be added here, not in separate files.

Complete API reference for the Note-Taking Web App with interactive documentation powered by Scalar API Reference.

## 🛠️ Tech Stack

### Backend

- **Framework**: Next.js 14 with App Router
- **Database**: Cloudflare D1 (SQLite) with Prisma ORM
- **Authentication**: JWT tokens with NextAuth.js
- **API Documentation**: next-openapi-gen with Scalar UI
- **Deployment**: Cloudflare Pages with OpenNext.js

### Frontend

- **Framework**: React 19 with Next.js
- **Styling**: Tailwind CSS with Radix UI components
- **State Management**: React Context + useState/useEffect
- **Editor**: Editor.js for rich text editing

### Development Tools

- **Type Safety**: TypeScript with Zod schemas
- **Testing**: Vitest with React Testing Library
- **Linting**: ESLint with Next.js config
- **Package Manager**: npm

## 🚀 Quick Access

### Interactive Documentation

- **Development**: [http://localhost:3000/api-docs](http://localhost:3000/api-docs) (No authentication required)
- **Production**: [https://yourdomain.com/api-docs](https://yourdomain.com/api-docs) (Requires authentication)

> **🔒 Production Security**: In production, the API documentation is protected with basic authentication. Contact your administrator for credentials.

### Raw OpenAPI Specification

- **Development**: [http://localhost:3000/api/docs](http://localhost:3000/api/docs)
- **Production**: [https://yourdomain.com/api/docs](https://yourdomain.com/api/docs)

## 📋 Base Configuration

- **Base URL**: `http://localhost:3000/api` (development) / `https://yourdomain.com/api` (production)
- **Authentication**: JWT Bearer Token
- **Content-Type**: `application/json`

## 🗄️ Database Schema

### User Model

```typescript
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  password  String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  notes     Note[]
}
```

### Note Model

```typescript
model Note {
  id         String   @id @default(cuid())
  userId     String
  title      String
  content    String
  tags       String   // Comma-separated string for SQLite compatibility
  isArchived Boolean  @default(false)
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
  lastEdited DateTime @default(now())
  user       User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

### Database Configuration

- **Provider**: SQLite (Cloudflare D1)
- **ORM**: Prisma with driver adapters
- **Migrations**: Prisma migrate with Cloudflare D1 integration
- **Connection**: Environment variable `DATABASE_URL`

## 🔐 Authentication

### JWT Bearer Token

Most protected endpoints require authentication:

```http
Authorization: Bearer <your-jwt-token>
```

### Getting a Token

1. Register: `POST /api/register`
2. Login: `POST /api/login`
3. Use the returned `token` in Authorization header

## 📝 Available Endpoints

### Authentication

#### Register User

- **POST** `/api/register`
- **Description**: Create a new user account
- **Body**: `{ "email": "user@example.com", "password": "password123" }`
- **Response**: User object with ID, email, and creation timestamp

#### Login User

- **POST** `/api/login`
- **Description**: Authenticate user and receive JWT token
- **Body**: `{ "email": "user@example.com", "password": "password123" }`
- **Response**: JWT token and user information

#### Test Authentication

- **GET** `/api/test-auth`
- **Description**: Verify JWT token is valid
- **Headers**: `Authorization: Bearer <token>`
- **Response**: User ID and success message

#### Verify API Documentation Access

- **POST** `/api/verify-api-docs-auth`
- **Description**: Authenticate access to API documentation (used internally by the docs UI)
- **Body**: `{ "username": "admin", "password": "password" }`
- **Response**: Authentication success status
- **Note**: This endpoint is used by the protected API documentation interface

### System

#### Health Check

- **GET** `/api/health`
- **Description**: Check system health and database connectivity
- **Response**: System status, database status, and statistics

## 🛠️ How to Edit Scalar API Documentation

### 1. Update API Routes

Edit the route files in `src/app/api/` and add OpenAPI annotations:

```typescript
/**
 * @body YourRequestSchema
 * @response YourResponseSchema:Description of response
 * @responseSet auth
 * @openapi
 */
export async function POST(request: Request) {
  // Your implementation
}
```

### 2. Update Schemas

Edit `src/schemas/auth.ts` to add new Zod schemas:

```typescript
export const YourSchema = z.object({
  field: z.string().describe("Field description"),
  // ... other fields
});

export type YourType = z.infer<typeof YourSchema>;
```

### 3. Regenerate Documentation

Run the generation command:

```bash
npx next-openapi-gen generate
```

### 4. Configuration Options

Edit `next.openapi.json` to customize:

- **API Info**: Title, description, version
- **Servers**: Base URLs for different environments
- **Security Schemes**: Authentication methods
- **Response Sets**: Common error responses
- **Error Config**: Error message templates

### 5. Available Annotations

| Annotation     | Description                 | Example                                  |
| -------------- | --------------------------- | ---------------------------------------- |
| `@body`        | Request body schema         | `@body LoginRequestSchema`               |
| `@response`    | Response schema             | `@response UserResponseSchema:User data` |
| `@responseSet` | Use predefined response set | `@responseSet auth`                      |
| `@add`         | Add custom response         | `@add 409:ConflictResponse`              |
| `@auth`        | Authentication method       | `@auth bearer`                           |
| `@openapi`     | Enable OpenAPI generation   | `@openapi`                               |

### 6. Response Sets

Predefined response sets in `next.openapi.json`:

- **common**: 400, 500 errors
- **auth**: 400, 401, 403, 500 errors
- **public**: 400, 500 errors

## 🔧 Development Workflow

### Adding New Endpoints

1. **Create Route File**: `src/app/api/your-endpoint/route.ts`
2. **Add OpenAPI Annotations**: Use the annotation format above
3. **Define Schemas**: Add Zod schemas in `src/schemas/`
4. **Regenerate Docs**: Run `npx next-openapi-gen generate`
5. **Test**: Visit `http://localhost:3000/api-docs`

### Testing API Endpoints

Use the interactive documentation at `/api-docs` or test with curl:

```bash
# Test health endpoint
curl http://localhost:3000/api/health

# Test login
curl -X POST http://localhost:3000/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Test protected endpoint
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/api/test-auth
```

## 📚 Configuration Files

- **Main Config**: `next.openapi.json`
- **Schemas**: `src/schemas/auth.ts`
- **UI Component**: `src/components/swagger-wrapper.tsx`
- **Docs Page**: `src/app/api-docs/page.tsx`

## 🎯 Features

- **Interactive Testing**: Test endpoints directly from documentation
- **Real-time Validation**: Schema validation with examples
- **Modern UI**: Clean, responsive Scalar interface
- **Auto-generation**: Documentation updates automatically from code
- **Type Safety**: Full TypeScript support with Zod schemas

## 🚦 Status Codes

| Code | Description                    |
| ---- | ------------------------------ |
| 200  | Success                        |
| 201  | Created                        |
| 400  | Bad Request (Validation Error) |
| 401  | Unauthorized                   |
| 403  | Forbidden                      |
| 404  | Not Found                      |
| 409  | Conflict                       |
| 500  | Internal Server Error          |

## 🔒 Production Security

### API Documentation Protection

The API documentation (`/api-docs`) is protected with basic authentication in production:

- **Development**: No authentication required
- **Production**: Username/password authentication required

#### Environment Variables

```bash
# API Documentation Authentication
API_DOCS_USERNAME=your-username
API_DOCS_PASSWORD=your-secure-password
```

#### Default Credentials

If environment variables are not set:

- **Username**: `admin`
- **Password**: `admin123`

> **⚠️ Security Warning**: Always set custom credentials in production!

### Authentication Flow

1. User visits `/api-docs` in production
2. System checks for existing authentication session
3. If not authenticated, shows login form
4. User enters credentials
5. System validates against environment variables
6. If valid, grants access to API documentation
7. Session persists until logout or browser close

## 📋 Documentation Rules

### **Centralized Documentation Policy**

- **ALL API endpoints MUST be documented in this file (`API_DOCUMENTATION.md`)**
- **NO separate API documentation files should be created**
- **This is the single source of truth for all API documentation**

### **Adding New Endpoints**

When adding new API endpoints:

1. **Add OpenAPI annotations** to the route file:

   ```typescript
   /**
    * @body YourRequestSchema
    * @response YourResponseSchema:Description
    * @responseSet auth
    * @openapi
    */
   ```

2. **Add endpoint documentation** to this file in the format:

   ```markdown
   #### Endpoint Name

   - **METHOD** `/api/endpoint-path`
   - **Description**: What the endpoint does
   - **Body**: Request body schema (if applicable)
   - **Headers**: Required headers (if applicable)
   - **Response**: Response schema description
   - **Errors**: Possible error responses
   ```

3. **Regenerate documentation**:
   ```bash
   npx next-openapi-gen generate
   ```

## 🔄 Migration from Swagger UI

This documentation system has been migrated from `swagger-jsdoc` to `next-openapi-gen` for better React 19 compatibility and modern tooling.
