# Application Routing Structure

This document outlines the complete routing structure for the Note-Taking Web App, including authentication flow, protected routes, and API endpoints.

## Frontend Routes

### Public Routes (Unauthenticated)

| Route              | Component            | Description                                     | Task Reference |
| ------------------ | -------------------- | ----------------------------------------------- | -------------- |
| `/`                | `LoginPage`          | Login page with email/password and Google OAuth | Task 8         |
| `/login`           | `LoginPage`          | Alternative login route (same as root)          | Task 8         |
| `/register`        | `RegisterPage`       | User registration with dual auth options        | Task 8         |
| `/forgot-password` | `ForgotPasswordPage` | Password reset request form                     | Task 4, 8      |
| `/reset-password`  | `ResetPasswordPage`  | Password reset form with token                  | Task 4, 8      |

### Protected Routes (Authenticated)

All routes under `/dashboard` require authentication and will redirect to `/login` if not authenticated.

| Route                   | Component                               | Description                           | Task Reference |
| ----------------------- | --------------------------------------- | ------------------------------------- | -------------- |
| `/dashboard`            | `DashboardLayout` → `NotesPage`         | Main dashboard with all notes         | Task 7, 10     |
| `/dashboard/notes`      | `DashboardLayout` → `NotesPage`         | All notes listing (same as dashboard) | Task 10        |
| `/dashboard/notes/[id]` | `DashboardLayout` → `NoteDetailPage`    | Individual note view/edit             | Task 9, 10     |
| `/dashboard/notes/new`  | `DashboardLayout` → `NewNotePage`       | Create new note                       | Task 9         |
| `/dashboard/archived`   | `DashboardLayout` → `ArchivedNotesPage` | Archived notes listing                | Task 10        |
| `/dashboard/search`     | `DashboardLayout` → `SearchResultsPage` | Search results display                | Task 6, 10     |
| `/dashboard/settings`   | `DashboardLayout` → `SettingsPage`      | User settings and preferences         | Task 11        |
| `/dashboard/profile`    | `DashboardLayout` → `ProfilePage`       | User profile management               | Task 11        |

### Route Parameters and Query Strings

#### Note Detail Route: `/dashboard/notes/[id]`

- `id`: Note ID (string)
- Query parameters:
  - `edit=true`: Open in edit mode
  - `version=<number>`: View specific version from history

#### Search Route: `/dashboard/search`

- Query parameters:
  - `q`: Search query string
  - `tag`: Filter by specific tag
  - `archived`: Include archived notes (boolean)
  - `sort`: Sort order (date, title, relevance)

#### Notes Listing: `/dashboard/notes`

- Query parameters:
  - `tag`: Filter by tag
  - `sort`: Sort order (date, title, updated)
  - `view`: Display mode (list, grid, compact)

## API Routes

### Authentication Endpoints

| Method | Endpoint                  | Description                        | Authentication | Task Reference |
| ------ | ------------------------- | ---------------------------------- | -------------- | -------------- |
| `POST` | `/api/register`           | User registration (email/password) | Public         | Task 3         |
| `POST` | `/api/login`              | User login (email/password)        | Public         | Task 3         |
| `GET`  | `/api/auth/[...nextauth]` | NextAuth.js endpoints              | Public         | Task 3         |
| `POST` | `/api/auth/[...nextauth]` | NextAuth.js endpoints              | Public         | Task 3         |
| `POST` | `/api/forgot-password`    | Password reset request             | Public         | Task 4         |
| `POST` | `/api/reset-password`     | Password reset confirmation        | Public         | Task 4         |
| `POST` | `/api/auth/signout`       | User logout                        | Authenticated  | Task 3         |

### Notes Management Endpoints

| Method   | Endpoint                  | Description            | Authentication | Task Reference |
| -------- | ------------------------- | ---------------------- | -------------- | -------------- |
| `GET`    | `/api/notes`              | List all user notes    | Required       | Task 5         |
| `POST`   | `/api/notes`              | Create new note        | Required       | Task 5         |
| `GET`    | `/api/notes/[id]`         | Get specific note      | Required       | Task 5         |
| `PUT`    | `/api/notes/[id]`         | Update note            | Required       | Task 5         |
| `DELETE` | `/api/notes/[id]`         | Delete note            | Required       | Task 5         |
| `PATCH`  | `/api/notes/[id]/archive` | Archive/unarchive note | Required       | Task 5         |

### Note History Endpoints

| Method | Endpoint                            | Description                 | Authentication | Task Reference |
| ------ | ----------------------------------- | --------------------------- | -------------- | -------------- |
| `GET`  | `/api/notes/[id]/history`           | Get note edit history       | Required       | Task 5         |
| `GET`  | `/api/notes/[id]/history/[version]` | Get specific version        | Required       | Task 5         |
| `POST` | `/api/notes/[id]/restore`           | Restore to specific version | Required       | Task 5         |

### Search and Filtering Endpoints

| Method | Endpoint                  | Description               | Authentication | Task Reference |
| ------ | ------------------------- | ------------------------- | -------------- | -------------- |
| `GET`  | `/api/search`             | Advanced note search      | Required       | Task 6         |
| `GET`  | `/api/tags`               | Get all user tags         | Required       | Task 6         |
| `GET`  | `/api/notes/by-tag/[tag]` | Get notes by specific tag | Required       | Task 6         |

### User Management Endpoints

| Method | Endpoint                    | Description             | Authentication | Task Reference |
| ------ | --------------------------- | ----------------------- | -------------- | -------------- |
| `GET`  | `/api/user/profile`         | Get user profile        | Required       | Task 11        |
| `PUT`  | `/api/user/profile`         | Update user profile     | Required       | Task 11        |
| `PUT`  | `/api/user/preferences`     | Update user preferences | Required       | Task 11        |
| `POST` | `/api/user/change-password` | Change password         | Required       | Task 4         |

### File Upload Endpoints (Bonus Features)

| Method   | Endpoint                 | Description           | Authentication | Task Reference |
| -------- | ------------------------ | --------------------- | -------------- | -------------- |
| `POST`   | `/api/upload/image`      | Upload image to S3    | Required       | Task 14        |
| `DELETE` | `/api/upload/image/[id]` | Delete uploaded image | Required       | Task 14        |

### WebSocket Endpoints (Bonus Features)

| Endpoint      | Description                                      | Authentication | Task Reference |
| ------------- | ------------------------------------------------ | -------------- | -------------- |
| `/api/socket` | WebSocket connection for real-time collaboration | Required       | Task 13        |

## Route Protection and Middleware

### Authentication Middleware

The application uses Next.js middleware to protect routes:

```typescript
// middleware.ts
import { withAuth } from "next-auth/middleware";

export default withAuth(
  function middleware(req) {
    // Additional middleware logic
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: ["/dashboard/:path*"],
};
```

### Route Guards

#### Protected Route Component

```typescript
// components/ProtectedRoute.tsx
export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();

  if (status === "loading") return <LoadingSpinner />;
  if (!session) redirect("/login");

  return <>{children}</>;
}
```

#### Public Route Redirect

```typescript
// components/PublicRoute.tsx
export function PublicRoute({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();

  if (session) redirect("/dashboard");

  return <>{children}</>;
}
```

## Navigation Structure

### Main Navigation (Authenticated Users)

```typescript
const navigationItems = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: "HomeIcon",
    current: pathname === "/dashboard",
  },
  {
    name: "All Notes",
    href: "/dashboard/notes",
    icon: "DocumentTextIcon",
    current: pathname.startsWith("/dashboard/notes"),
  },
  {
    name: "Archived",
    href: "/dashboard/archived",
    icon: "ArchiveBoxIcon",
    current: pathname === "/dashboard/archived",
  },
  {
    name: "Search",
    href: "/dashboard/search",
    icon: "MagnifyingGlassIcon",
    current: pathname === "/dashboard/search",
  },
  {
    name: "Settings",
    href: "/dashboard/settings",
    icon: "CogIcon",
    current: pathname === "/dashboard/settings",
  },
];
```

### Breadcrumb Navigation

Dynamic breadcrumbs based on current route:

| Route                   | Breadcrumb                       |
| ----------------------- | -------------------------------- |
| `/dashboard`            | Dashboard                        |
| `/dashboard/notes`      | Dashboard → Notes                |
| `/dashboard/notes/[id]` | Dashboard → Notes → [Note Title] |
| `/dashboard/notes/new`  | Dashboard → Notes → New Note     |
| `/dashboard/archived`   | Dashboard → Archived Notes       |
| `/dashboard/search`     | Dashboard → Search Results       |
| `/dashboard/settings`   | Dashboard → Settings             |

## URL Patterns and SEO

### SEO-Friendly URLs

- `/dashboard/notes/create-amazing-web-apps` (note slug from title)
- `/dashboard/search?q=react+hooks` (readable search queries)
- `/dashboard/notes/tagged/typescript` (tag-based filtering)

### URL State Management

The application maintains state in URLs for:

- **Search queries**: Persist search terms and filters
- **Note editing**: Track edit mode and version history
- **View preferences**: Remember list/grid view modes
- **Pagination**: Maintain page position in long lists

## Error Routes

### Error Handling Routes

| Route                             | Component          | Description        |
| --------------------------------- | ------------------ | ------------------ |
| `/404`                            | `NotFoundPage`     | Page not found     |
| `/500`                            | `ServerErrorPage`  | Server error       |
| `/403`                            | `ForbiddenPage`    | Access denied      |
| `/dashboard/notes/[id]/not-found` | `NoteNotFoundPage` | Note doesn't exist |

### Error Boundaries

React Error Boundaries are implemented at:

- Root level (`app/error.tsx`)
- Dashboard level (`app/dashboard/error.tsx`)
- Note detail level (`app/dashboard/notes/[id]/error.tsx`)

## Route-Based Code Splitting

The application uses Next.js automatic code splitting:

```typescript
// Dynamic imports for large components
const NoteEditor = dynamic(() => import("@/components/NoteEditor"), {
  loading: () => <EditorSkeleton />,
  ssr: false,
});

const SearchResults = dynamic(() => import("@/components/SearchResults"), {
  loading: () => <SearchSkeleton />,
});
```

## Mobile Navigation

### Responsive Route Handling

- Desktop: Sidebar navigation always visible
- Tablet: Collapsible sidebar navigation
- Mobile: Bottom tab navigation or hamburger menu

### Mobile-Specific Routes

- `/dashboard/mobile-menu` - Mobile navigation overlay
- Query parameter `?mobile=true` - Mobile-optimized views

This routing structure provides a comprehensive foundation for the note-taking application, ensuring proper navigation flow, security, and user experience across all devices and use cases.
