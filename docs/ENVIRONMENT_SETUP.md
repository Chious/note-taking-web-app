# Environment Setup Guide

This guide will help you set up the development environment for the Note-Taking Web App.

## Prerequisites

### System Requirements

- **Node.js** 18.0.0 or higher
- **npm** 9.0.0 or higher
- **PostgreSQL** 14.0 or higher
- **Docker & Docker Compose** (recommended for development)
- **Git** for version control

### Development Tools (Recommended)

- **VS Code** or **Cursor** with extensions:
  - Prisma
  - Tailwind CSS IntelliSense
  - TypeScript and JavaScript Language Features
  - ESLint
  - Prettier

## Quick Start

### 1. Clone and Install

```bash
# Clone the repository
git clone <repository-url>
cd note-taking-web-app

# Install dependencies
npm install

# Install Task Master globally (recommended)
npm install -g task-master-ai
```

### 2. Environment Configuration

Create environment files from templates:

```bash
# Copy environment template
cp .env.example .env

# Edit environment variables
nano .env  # or your preferred editor
```

#### Required Environment Variables

```env
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/noteapp?schema=public"

# NextAuth.js
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-super-secret-jwt-secret-here"

# Google OAuth (for authentication)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Email (for password reset)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER="your-email@gmail.com"
SMTP_PASSWORD="your-app-password"
SMTP_FROM="your-email@gmail.com"

# Optional: S3-compatible storage for images
S3_BUCKET_URL="http://localhost:9000"
S3_ACCESS_KEY="minioadmin"
S3_SECRET_KEY="minioadmin"
S3_BUCKET_NAME="notes-images"
```

### 3. Database Setup

#### Option A: Using Docker (Recommended)

```bash
# Start PostgreSQL with Docker Compose
docker-compose up -d

# Verify database is running
docker-compose ps
```

#### Option B: Local PostgreSQL Installation

1. Install PostgreSQL on your system
2. Create a database:
   ```sql
   CREATE DATABASE noteapp;
   CREATE USER postgres WITH PASSWORD 'postgres';
   GRANT ALL PRIVILEGES ON DATABASE noteapp TO postgres;
   ```

### 4. Database Migration

```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev --name init

# (Optional) Seed database with sample data
npx prisma db seed
```

### 5. Start Development Server

```bash
# Start the Next.js development server
npm run dev

# Server will be available at http://localhost:3000
```

## Development Workflow

### Task Master Integration

This project uses Task Master for organized development:

```bash
# Check current task status
task-master list

# Get next recommended task
task-master next

# View specific task details
task-master show 1

# Start working on a task
task-master set-status --id=1 --status=in-progress

# Mark task as completed
task-master set-status --id=1 --status=done
```

### Code Quality Tools

```bash
# Run linting
npm run lint

# Fix linting issues
npm run lint:fix

# Format code with Prettier
npm run format

# Type checking
npm run type-check

# Run tests
npm run test

# Run tests in watch mode
npm run test:watch
```

## Google OAuth Setup

### 1. Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API

### 2. Configure OAuth Consent Screen

1. Go to "APIs & Services" → "OAuth consent screen"
2. Choose "External" user type
3. Fill required information:
   - App name: "Note-Taking App"
   - User support email: your email
   - Developer contact: your email

### 3. Create OAuth Credentials

1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth 2.0 Client IDs"
3. Application type: "Web application"
4. Name: "Note-Taking App"
5. Authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google` (development)
   - `https://yourdomain.com/api/auth/callback/google` (production)

### 4. Update Environment Variables

Copy the Client ID and Client Secret to your `.env` file:

```env
GOOGLE_CLIENT_ID="your-client-id-here"
GOOGLE_CLIENT_SECRET="your-client-secret-here"
```

## Email Configuration

### Gmail Setup (Recommended for Development)

1. Enable 2-Factor Authentication on your Gmail account
2. Generate an App Password:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate password for "Mail"
3. Use the app password in your `.env` file

### Alternative Email Providers

- **Mailgun**: For production use
- **SendGrid**: Alternative production option
- **Mailtrap**: For testing email functionality

## Troubleshooting

### Common Issues

#### Database Connection Issues

```bash
# Check if PostgreSQL is running
docker-compose ps

# Restart database
docker-compose restart db

# View database logs
docker-compose logs db
```

#### Port Already in Use

```bash
# Find process using port 3000
lsof -i :3000

# Kill the process (replace PID)
kill -9 <PID>

# Or use different port
npm run dev -- -p 3001
```

#### Prisma Issues

```bash
# Reset database (WARNING: This will delete all data)
npx prisma migrate reset

# Regenerate Prisma client
npx prisma generate

# View database in browser
npx prisma studio
```

#### Node Modules Issues

```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Getting Help

1. Check the [Task Master documentation](https://github.com/eyaltoledano/claude-task-master)
2. Review task details: `task-master show <task-id>`
3. Check project issues on GitHub
4. Consult the [Next.js documentation](https://nextjs.org/docs)
5. Review [Prisma documentation](https://www.prisma.io/docs)

## Development Best Practices

### Code Organization

- Follow the established folder structure
- Use TypeScript for type safety
- Implement proper error handling
- Write tests for critical functionality

### Database Best Practices

- Always use migrations for schema changes
- Never modify the database directly in production
- Use transactions for complex operations
- Implement proper indexing for performance

### Security Considerations

- Never commit sensitive data to version control
- Use environment variables for all secrets
- Implement proper authentication checks
- Validate all user inputs
- Use HTTPS in production

### Performance

- Implement proper caching strategies
- Optimize database queries
- Use Next.js Image component for images
- Implement proper loading states
- Monitor bundle size

This setup guide should get you up and running quickly. For specific implementation details, refer to the individual task documentation in the `.taskmaster/tasks/` directory.
