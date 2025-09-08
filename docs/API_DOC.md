# API Documentation

Complete API reference for the Note-Taking Web App backend endpoints.

## Base URL

- **Development**: `http://localhost:3000/api`
- **Production**: `https://yourdomain.com/api`

## Authentication

The API uses JWT tokens for authentication. Most endpoints require authentication via:

### Headers

```
Authorization: Bearer <jwt-token>
```

### Session-based (NextAuth.js)

```
Cookie: next-auth.session-token=<session-token>
```

## Response Format

All API responses follow a consistent format:

### Success Response

```json
{
  "data": {
    /* response data */
  },
  "message": "Success message (optional)",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Error Response

```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": {
    /* additional error details */
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## Authentication Endpoints

### Register User

**POST** `/api/register`

Register a new user with email and password.

#### Request Body

```json
{
  "email": "user@example.com",
  "password": "securepassword123",
  "name": "John Doe" // optional
}
```

#### Response

```json
{
  "data": {
    "id": "user_id",
    "email": "user@example.com",
    "name": "John Doe",
    "provider": "email"
  },
  "message": "User registered successfully"
}
```

#### Errors

- `400` - Validation error or email already exists
- `500` - Server error

---

### Login User

**POST** `/api/login`

Login with email and password.

#### Request Body

```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

#### Response

```json
{
  "data": {
    "user": {
      "id": "user_id",
      "email": "user@example.com",
      "name": "John Doe"
    },
    "token": "jwt_token_here"
  },
  "message": "Login successful"
}
```

#### Errors

- `401` - Invalid credentials
- `400` - Validation error
- `500` - Server error

---

### Forgot Password

**POST** `/api/forgot-password`

Request password reset email.

#### Request Body

```json
{
  "email": "user@example.com"
}
```

#### Response

```json
{
  "message": "If an account exists, a reset email has been sent"
}
```

#### Errors

- `400` - Invalid email format
- `500` - Server error

---

### Reset Password

**POST** `/api/reset-password`

Reset password with token from email.

#### Request Body

```json
{
  "token": "reset_token_from_email",
  "password": "newsecurepassword123"
}
```

#### Response

```json
{
  "message": "Password reset successful"
}
```

#### Errors

- `400` - Invalid or expired token
- `400` - Validation error
- `500` - Server error

## Notes Management

### Get All Notes

**GET** `/api/notes`

Retrieve all notes for the authenticated user.

#### Query Parameters

- `query` (string): Search query for title/content
- `tag` (string): Filter by specific tag
- `archived` (boolean): Include archived notes
- `sort` (string): Sort order (`date`, `title`, `updated`)
- `limit` (number): Number of results (default: 50)
- `offset` (number): Pagination offset

#### Response

```json
{
  "data": {
    "notes": [
      {
        "id": "note_id",
        "title": "My First Note",
        "content": "Note content here...",
        "tags": ["work", "important"],
        "isArchived": false,
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T12:00:00.000Z",
        "lastEdited": "2024-01-01T12:00:00.000Z"
      }
    ],
    "total": 25,
    "hasMore": true
  }
}
```

#### Errors

- `401` - Unauthorized
- `500` - Server error

---

### Create Note

**POST** `/api/notes`

Create a new note.

#### Request Body

```json
{
  "title": "My New Note",
  "content": "Note content here...",
  "tags": ["work", "project"]
}
```

#### Response

```json
{
  "data": {
    "id": "new_note_id",
    "title": "My New Note",
    "content": "Note content here...",
    "tags": ["work", "project"],
    "isArchived": false,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z",
    "lastEdited": "2024-01-01T00:00:00.000Z"
  },
  "message": "Note created successfully"
}
```

#### Errors

- `400` - Validation error
- `401` - Unauthorized
- `500` - Server error

---

### Get Single Note

**GET** `/api/notes/[id]`

Retrieve a specific note by ID.

#### Response

```json
{
  "data": {
    "id": "note_id",
    "title": "My Note",
    "content": "Note content here...",
    "tags": ["work"],
    "isArchived": false,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T12:00:00.000Z",
    "lastEdited": "2024-01-01T12:00:00.000Z"
  }
}
```

#### Errors

- `404` - Note not found
- `403` - Access denied (not your note)
- `401` - Unauthorized
- `500` - Server error

---

### Update Note

**PUT** `/api/notes/[id]`

Update an existing note.

#### Request Body

```json
{
  "title": "Updated Title",
  "content": "Updated content...",
  "tags": ["work", "updated"],
  "isArchived": false
}
```

#### Response

```json
{
  "data": {
    "id": "note_id",
    "title": "Updated Title",
    "content": "Updated content...",
    "tags": ["work", "updated"],
    "isArchived": false,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T14:00:00.000Z",
    "lastEdited": "2024-01-01T14:00:00.000Z"
  },
  "message": "Note updated successfully"
}
```

#### Errors

- `404` - Note not found
- `403` - Access denied
- `400` - Validation error
- `401` - Unauthorized
- `500` - Server error

---

### Delete Note

**DELETE** `/api/notes/[id]`

Delete a note permanently.

#### Response

```json
{
  "message": "Note deleted successfully"
}
```

#### Errors

- `404` - Note not found
- `403` - Access denied
- `401` - Unauthorized
- `500` - Server error

---

### Archive/Unarchive Note

**PATCH** `/api/notes/[id]/archive`

Toggle archive status of a note.

#### Request Body

```json
{
  "isArchived": true
}
```

#### Response

```json
{
  "data": {
    "id": "note_id",
    "isArchived": true
  },
  "message": "Note archived successfully"
}
```

## Note History (Edit History)

### Get Note History

**GET** `/api/notes/[id]/history`

Get edit history for a specific note.

#### Query Parameters

- `limit` (number): Number of versions to return
- `offset` (number): Pagination offset

#### Response

```json
{
  "data": {
    "history": [
      {
        "id": "history_id",
        "version": 3,
        "title": "Current Title",
        "content": "Current content...",
        "tags": ["work"],
        "changeType": "content_change",
        "createdAt": "2024-01-01T14:00:00.000Z"
      },
      {
        "id": "history_id_2",
        "version": 2,
        "title": "Previous Title",
        "content": "Previous content...",
        "tags": ["work"],
        "changeType": "title_change",
        "createdAt": "2024-01-01T12:00:00.000Z"
      }
    ],
    "total": 5
  }
}
```

#### Errors

- `404` - Note not found
- `403` - Access denied
- `401` - Unauthorized

---

### Get Specific Version

**GET** `/api/notes/[id]/history/[version]`

Get a specific version of a note.

#### Response

```json
{
  "data": {
    "id": "history_id",
    "noteId": "note_id",
    "version": 2,
    "title": "Previous Title",
    "content": "Previous content...",
    "tags": ["work"],
    "changeType": "title_change",
    "createdAt": "2024-01-01T12:00:00.000Z"
  }
}
```

---

### Restore Note Version

**POST** `/api/notes/[id]/restore`

Restore a note to a previous version.

#### Request Body

```json
{
  "version": 2
}
```

#### Response

```json
{
  "data": {
    "id": "note_id",
    "title": "Restored Title",
    "content": "Restored content...",
    "tags": ["work"],
    "version": 4,
    "changeType": "restore"
  },
  "message": "Note restored to version 2"
}
```

## Search and Filtering

### Advanced Search

**GET** `/api/search`

Advanced search across all notes.

#### Query Parameters

- `q` (string): Search query
- `tags` (string[]): Filter by tags (can be multiple)
- `archived` (boolean): Include archived notes
- `sort` (string): Sort by `relevance`, `date`, `title`
- `limit` (number): Results per page
- `offset` (number): Pagination offset

#### Response

```json
{
  "data": {
    "results": [
      {
        "id": "note_id",
        "title": "Matching Note",
        "content": "Content with matching terms...",
        "tags": ["work"],
        "highlight": "...matching terms highlighted...",
        "score": 0.95,
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "total": 15,
    "query": "search terms",
    "took": 45
  }
}
```

---

### Get All Tags

**GET** `/api/tags`

Get all tags used by the user.

#### Response

```json
{
  "data": {
    "tags": [
      {
        "name": "work",
        "count": 15,
        "color": "#blue"
      },
      {
        "name": "personal",
        "count": 8,
        "color": "#green"
      }
    ]
  }
}
```

---

### Get Notes by Tag

**GET** `/api/notes/by-tag/[tag]`

Get all notes with a specific tag.

#### Query Parameters

- `archived` (boolean): Include archived notes
- `sort` (string): Sort order
- `limit` (number): Results limit
- `offset` (number): Pagination offset

#### Response

```json
{
  "data": {
    "notes": [
      /* array of notes */
    ],
    "tag": "work",
    "total": 15
  }
}
```

## User Management

### Get User Profile

**GET** `/api/user/profile`

Get current user profile information.

#### Response

```json
{
  "data": {
    "id": "user_id",
    "email": "user@example.com",
    "name": "John Doe",
    "image": "https://example.com/avatar.jpg",
    "provider": "email",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "preferences": {
      "theme": "dark",
      "fontSize": "medium",
      "language": "en"
    }
  }
}
```

---

### Update User Profile

**PUT** `/api/user/profile`

Update user profile information.

#### Request Body

```json
{
  "name": "John Smith",
  "image": "https://example.com/new-avatar.jpg"
}
```

#### Response

```json
{
  "data": {
    "id": "user_id",
    "email": "user@example.com",
    "name": "John Smith",
    "image": "https://example.com/new-avatar.jpg"
  },
  "message": "Profile updated successfully"
}
```

---

### Update User Preferences

**PUT** `/api/user/preferences`

Update user preferences (theme, font, etc.).

#### Request Body

```json
{
  "theme": "light",
  "fontSize": "large",
  "language": "en",
  "autoSave": true,
  "emailNotifications": false
}
```

#### Response

```json
{
  "data": {
    "preferences": {
      "theme": "light",
      "fontSize": "large",
      "language": "en",
      "autoSave": true,
      "emailNotifications": false
    }
  },
  "message": "Preferences updated successfully"
}
```

---

### Change Password

**POST** `/api/user/change-password`

Change user password (for email/password users only).

#### Request Body

```json
{
  "currentPassword": "oldpassword123",
  "newPassword": "newpassword456"
}
```

#### Response

```json
{
  "message": "Password changed successfully"
}
```

#### Errors

- `400` - Invalid current password
- `400` - New password validation failed
- `403` - Not available for OAuth users
- `401` - Unauthorized

## File Upload (Bonus Feature)

### Upload Image

**POST** `/api/upload/image`

Upload an image for use in notes.

#### Request Body

- `multipart/form-data` with `image` field

#### Response

```json
{
  "data": {
    "id": "image_id",
    "url": "https://s3.example.com/bucket/image.jpg",
    "filename": "image.jpg",
    "size": 1024000,
    "mimeType": "image/jpeg"
  },
  "message": "Image uploaded successfully"
}
```

#### Errors

- `400` - Invalid file type or size
- `401` - Unauthorized
- `500` - Upload failed

---

### Delete Image

**DELETE** `/api/upload/image/[id]`

Delete an uploaded image.

#### Response

```json
{
  "message": "Image deleted successfully"
}
```

## WebSocket API (Bonus Feature)

### Connection

Connect to WebSocket for real-time collaboration:

```javascript
const ws = new WebSocket("ws://localhost:3000/api/socket");
```

### Events

#### Join Note Room

```json
{
  "type": "join",
  "noteId": "note_id",
  "userId": "user_id"
}
```

#### Note Update

```json
{
  "type": "update",
  "noteId": "note_id",
  "content": "updated content",
  "cursor": { "line": 5, "column": 10 }
}
```

#### User Cursor

```json
{
  "type": "cursor",
  "noteId": "note_id",
  "userId": "user_id",
  "position": { "line": 5, "column": 10 }
}
```

## Error Codes

| Code                    | Description                      |
| ----------------------- | -------------------------------- |
| `VALIDATION_ERROR`      | Request validation failed        |
| `UNAUTHORIZED`          | Authentication required          |
| `FORBIDDEN`             | Access denied                    |
| `NOT_FOUND`             | Resource not found               |
| `DUPLICATE_EMAIL`       | Email already registered         |
| `INVALID_CREDENTIALS`   | Login failed                     |
| `EXPIRED_TOKEN`         | Token has expired                |
| `INVALID_TOKEN`         | Token is invalid                 |
| `FILE_TOO_LARGE`        | Uploaded file exceeds size limit |
| `UNSUPPORTED_FILE_TYPE` | File type not allowed            |
| `RATE_LIMITED`          | Too many requests                |
| `SERVER_ERROR`          | Internal server error            |

## Rate Limiting

API endpoints have rate limiting applied:

- **Authentication endpoints**: 5 requests per minute per IP
- **Search endpoints**: 30 requests per minute per user
- **CRUD operations**: 100 requests per minute per user
- **File uploads**: 10 requests per minute per user

Rate limit headers are included in responses:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

## Testing

### Using curl

```bash
# Register user
curl -X POST http://localhost:3000/api/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Login
curl -X POST http://localhost:3000/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Get notes (with token)
curl -X GET http://localhost:3000/api/notes \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Using Postman

A Postman collection is available at `/docs/postman/Note-Taking-API.json` with all endpoints pre-configured.

This API documentation provides a comprehensive reference for all available endpoints in the Note-Taking Web App. For implementation details, refer to the specific task documentation in the `.taskmaster/tasks/` directory.
