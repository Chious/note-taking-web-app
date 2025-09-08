# Product Requirements Document

> 這邊是原始的需求說明

### The challenge

Users should be able to:

- Create, read, update, and delete notes
- Archive notes
- View all their notes
- View all archived notes
- View notes with specific tags
- Search notes by title, tag, and content
- Select their color theme
- Select their font theme
- Receive validation messages if required form fields aren't completed
- Navigate the whole app and perform all actions using only their keyboard
- View the optimal layout for the interface depending on their device's screen size
- See hover and focus states for all interactive elements on the page
- **Bonus**: Save details to a database (build the project as a full-stack app)
- **Bonus**: Create an account, log in, change password (add user authentication to the full-stack app)
- **Bonus**: Reset their password (add password reset to the full-stack app)

---

## Tech Stack(TD;LR)

- Next.js
- Tailwind CSS
- WYSIWYG Editor
- React Query

- Docker Compose
- GitHub Actions

- Vitest

- ORM: prisma
- zod: data validation
- PostegreSQL
- Bucket: TD;LR(to store images)
  - 暫定 s3 相容的圖片容器，透過 調整 env 如 `S3_BUCKET_URL` 等來決定儲存在本地，還是遠端的 s3 bucket
- WebSocket(Bonus, not required): coop notes with logined user.
- SMTP service (Bonus, not required) -- forgot password reset

## Routing

- `/` - Login Page
- `/register` - Register Page
- `/forgot-password` - Forgot Password Page
- `/reset-password` - Reset Password Page with `&token=<token>`

Protected Routes:

- `(/dashboard)/notes` - Dashboard Page
- `(/dashboard/notes/id)` - note detail page
- `(/dashboard/archived)` - archived notes page

**backend**

User Authentication:

- POST `/api/login` -- login
- POST `/api/register` -- register
- POST `/api/forgot-password` -- forgot password
- POST `/api/reset-password` -- reset password

Notes(Protected):

Requirement: `Authorization` header with `Bearer <token>`

- GET `/api/notes` -- get all notes
  - params:
    - `q` -- search keyword
- POST `/api/notes` -- create note
- PUT `/api/notes/:id` -- update note
- DELETE `/api/notes/:id` -- delete note
- GET `/api/search`: 根據 keyword 搜尋筆記

## Data Flow

**frontend**

1. LocalStorage: 儲存系統相關使用者設定

- `colorTheme` - string
- `fontTheme` - string

```tsx
// src/app/layout.tsx
import { ThemeProvider } from "@/components/theme-provider";

const colorTheme = "light";
const fontTheme = "sans-serif";

<ThemeProvider theme={colorTheme}></ThemeProvider>;
```

2. 筆記相關狀態：React Query

```tsx
// src/app/layout.tsx
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
```

```tsx
// src/app/dashboard/notes/page.tsx
import { useQuery } from "@tanstack/react-query";

const { data: notes } = useQuery({
  queryKey: ["notes"],
  queryFn: () => getNotes(),
});
```

3. accessbility:

> Navigate the whole app and perform all actions using only their keyboard

- `ctrl + s`: save
- `ctrl + z`: undo
- `ctrl + y`: redo
- `ctrl + c`: copy
- `ctrl + v`: paste
- `ctrl + x`: cut
- `ctrl + a`: select all

```tsx
const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
  if (event.key === "Enter") {
    event.preventDefault();
  }
};

<div onKeyDown={onKeyDown}>
  <input type="text" />
</div>;
```

## Database Schema

- `auth` collection: 儲存使用者帳號密碼

```prisma
{
  id: string;
  email: string;
  password: string;
}
```

- `notes` collection: 儲存筆記資料
  - can edit title, tags, content
  - auto save when user edit for few seconds (debounce) and sync to database

```prisma
{
  id: string;
  title: string;
  tags: string[];
  content: string;
  lastEdited: string;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}
```
