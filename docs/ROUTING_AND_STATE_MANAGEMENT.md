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

| Route                        | Component                                 | Description                              | Implementation Status |
| ---------------------------- | ----------------------------------------- | ---------------------------------------- | --------------------- |
| `/dashboard/notes`           | `DashboardLayout` → `NotesPage`           | Main notes interface with mobile support | ✅ Implemented        |
| `/dashboard/setting`         | `DashboardLayout` → `SettingsPage`        | User settings and preferences            | ✅ Implemented        |
| `/dashboard/setting/theme`   | `DashboardLayout` → `ThemeSettingsPage`   | Color theme configuration                | ✅ Implemented        |
| `/dashboard/setting/font`    | `DashboardLayout` → `FontSettingsPage`    | Font preferences                         | ✅ Implemented        |
| `/dashboard/setting/account` | `DashboardLayout` → `AccountSettingsPage` | Account and password management          | ✅ Implemented        |
| `/dashboard/archived`        | `DashboardLayout` → `ArchivedNotesPage`   | Archived notes listing                   | 🚧 Planned            |
| `/dashboard/notes/[id]`      | `DashboardLayout` → `NoteDetailPage`      | Individual note view/edit                | 🚧 Planned            |
| `/dashboard/notes/new`       | `DashboardLayout` → `NewNotePage`         | Create new note                          | 🚧 Planned            |

### Route Parameters and Query Strings

#### Primary Route: `/dashboard/notes`

The application uses a single-page approach with URL parameters for state management:

- **Navigation Parameters:**

  - `nav`: Current navigation context
    - `null` or omitted: All notes (default)
    - `archived`: Archived notes view
    - `tags`: Tags browsing view (mobile)
    - `search`: Search interface (mobile)
    - `settings`: Settings (redirects to `/dashboard/setting`)

- **Filtering Parameters:**

  - `tag`: Filter notes by specific tag (string)
  - `q`: Search query string for filtering notes
  - `slug`: Currently selected note slug for editing

- **Example URLs:**
  - `/dashboard/notes` - Default all notes view
  - `/dashboard/notes?nav=archived` - Archived notes
  - `/dashboard/notes?tag=Dev` - Notes tagged with "Dev"
  - `/dashboard/notes?q=react` - Search for "react"
  - `/dashboard/notes?slug=react-performance-optimization` - Edit specific note
  - `/dashboard/notes?nav=tags&tag=TypeScript` - Mobile: browsing tags, filtered by TypeScript

#### Settings Routes: `/dashboard/setting`

- Base route: `/dashboard/setting` - Settings overview
- Action routes:
  - `/dashboard/setting/theme` - Color theme settings
  - `/dashboard/setting/font` - Font preferences
  - `/dashboard/setting/account` - Account management

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

### Desktop Navigation (Sidebar)

Desktop navigation uses a traditional sidebar with sections:

```typescript
const navigationItems = [
  {
    section: "notes",
    title: "Notes",
    items: [
      {
        id: "all-notes",
        label: "All Notes",
        icon: FileText,
        count: allNotesCount,
        onClick: () => setNav(null),
      },
      {
        id: "archived",
        label: "Archived Notes",
        icon: Archive,
        count: archivedCount,
        onClick: () => setNav("archived"),
      },
    ],
  },
  {
    section: "tags",
    title: "Tags",
    items: [
      {
        id: "all-tags",
        label: "All Tags",
        icon: Tag,
        count: totalTagsCount,
        onClick: () => setTag(null),
      },
      // Dynamic tag items with counts
      ...tagItems,
    ],
  },
];
```

### Mobile Navigation (Bottom Bar)

Mobile navigation uses a bottom navigation bar:

```typescript
const mobileNavItems = [
  {
    id: "home",
    label: "Home",
    icon: FileText,
    onClick: () => {
      setNav(null);
      setTag(null);
    },
    isActive: !nav && !tag,
  },
  {
    id: "search",
    label: "Search",
    icon: Search,
    onClick: () => setNav("search"),
    isActive: nav === "search",
  },
  {
    id: "archived",
    label: "Archive",
    icon: Archive,
    onClick: () => {
      setNav("archived");
      setTag(null);
    },
    isActive: nav === "archived",
  },
  {
    id: "tags",
    label: "Tags",
    icon: Tag,
    onClick: () => {
      setTag(null);
      setNav("tags");
    },
    isActive: nav === "tags",
  },
  {
    id: "settings",
    label: "Settings",
    icon: Settings,
    onClick: () => router.push("/dashboard/setting"),
    isActive: false,
  },
];
```

### Breadcrumb Navigation

Dynamic breadcrumbs and headers based on current route and state:

| Route/State                       | Desktop Header              | Mobile Header                   |
| --------------------------------- | --------------------------- | ------------------------------- |
| `/dashboard/notes`                | "My Notes"                  | "My Notes"                      |
| `/dashboard/notes?nav=archived`   | "Archived Notes"            | "Archived Notes"                |
| `/dashboard/notes?tag=Dev`        | "Tag: Dev"                  | "Tag: Dev"                      |
| `/dashboard/notes?q=react`        | "Search: react"             | "Search: react"                 |
| `/dashboard/notes?nav=tags`       | N/A (desktop sidebar)       | "All Tags"                      |
| `/dashboard/notes?nav=search`     | N/A (desktop header search) | "Search"                        |
| `/dashboard/notes?slug=note-slug` | Note title                  | Note title (with back button)   |
| `/dashboard/setting`              | Page title                  | "Settings" (with back to notes) |
| `/dashboard/setting/theme`        | Page title                  | Breadcrumb navigation           |
| `/dashboard/setting/font`         | Page title                  | Breadcrumb navigation           |
| `/dashboard/setting/account`      | Page title                  | Breadcrumb navigation           |

### Current Implementation Status

#### ✅ Completed Features

- **Mobile-responsive navigation** with bottom bar and desktop sidebar
- **URL parameter-based state management** for seamless navigation
- **Note editing interface** with mobile-optimized editor
- **Tag filtering and browsing** on both desktop and mobile
- **Search functionality** with real-time filtering
- **Archive view** for archived notes
- **Settings pages** with theme, font, and account management
- **Responsive layout system** with proper mobile/desktop switching

#### 🚧 Planned Features

- Individual note detail routes (`/dashboard/notes/[id]`)
- Note creation workflow (`/dashboard/notes/new`)
- Advanced search filters and sorting
- Note sharing and collaboration features

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

### Responsive Design Implementation

The application uses a responsive design approach with different layouts for different screen sizes:

#### Desktop (md and above)

- **Sidebar Navigation**: Traditional left sidebar with sections for Notes and Tags
- **Three-Column Layout**: Sidebar → Notes List → Note Editor/Actions
- **Always Visible**: All navigation elements remain visible

#### Mobile (below md breakpoint)

- **Bottom Navigation Bar**: Fixed bottom navigation with 5 main actions
- **Single-Column Layout**: Full-screen views that switch based on navigation state
- **Context-Aware Views**: Different full-screen interfaces for different actions

### Mobile View States

The mobile interface switches between different full-screen views based on URL parameters:

1. **Default Notes List** (`/dashboard/notes`)

   - Shows all notes with create button
   - Tapping a note opens the editor

2. **Note Editor** (`/dashboard/notes?slug=note-slug`)

   - Full-screen editor with back button
   - Note metadata and tags
   - Mobile-optimized editor interface

3. **Tags View** (`/dashboard/notes?nav=tags`)

   - List of all tags with note counts
   - Tapping a tag filters notes and returns to list

4. **Search View** (`/dashboard/notes?nav=search` or `?q=query`)

   - Search input with results
   - Real-time filtering as user types

5. **Archive View** (`/dashboard/notes?nav=archived`)

   - Shows only archived notes
   - Same interface as default notes list

6. **Settings** (redirects to `/dashboard/setting`)
   - Dedicated settings pages with back navigation
   - Mobile-optimized forms and controls

### State Management

The application uses URL parameters for state persistence across mobile views:

```typescript
interface URLParams {
  nav: string | null; // Navigation context
  q: string | null; // Search query
  tag: string | null; // Tag filter
  slug: string | null; // Selected note
}
```

### Mobile Navigation Flow

```
Bottom Nav Tap → URL Parameter Update → View State Change → UI Render

Examples:
- Tap "Search" → nav=search → Search interface
- Tap "Tags" → nav=tags → Tags list interface
- Tap "Archive" → nav=archived → Archived notes
- Select note → slug=note-id → Note editor
```

This routing structure provides a comprehensive foundation for the note-taking application, ensuring proper navigation flow, security, and user experience across all devices and use cases. The mobile-first approach ensures excellent usability on all screen sizes while maintaining desktop functionality.
