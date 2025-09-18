# Third-Party Integrations

This document covers external services, tokens, and critical dependencies that require management and monitoring.

## 🔑 Service Tokens & Credentials

| Service                | Purpose        | Token/Key         | Environment Variable                       | Custodian     | Last Updated |
| ---------------------- | -------------- | ----------------- | ------------------------------------------ | ------------- | ------------ |
| **Cloudflare D1**      | Database       | Database ID       | `D1_DATABASE_ID`                           | DevOps Team   | -            |
| **Database**           | Database       | Connection String | `DATABASE_URL`                             | DevOps Team   | -            |
| **JWT Authentication** | Authentication | Secret Key        | `JWT_SECRET`                               | Security Team | -            |
| **NextAuth**           | Authentication | Secret Key        | `NEXTAUTH_SECRET`                          | Security Team | -            |
| **NextAuth**           | Authentication | URL               | `NEXTAUTH_URL`                             | DevOps Team   | -            |
| **Cloudflare API**     | Deployment     | API Token         | `CLOUDFLARE_API_TOKEN`                     | DevOps Team   | -            |
| **Cloudflare Account** | Services       | Account ID        | `CLOUDFLARE_ACCOUNT_ID`                    | DevOps Team   | -            |
| **API Docs**           | Documentation  | Username/Password | `API_DOCS_USERNAME`<br>`API_DOCS_PASSWORD` | DevOps Team   | -            |
| **Environment**        | Runtime        | Environment       | `NODE_ENV`                                 | DevOps Team   | -            |

## 🌐 External Services

| Service                | Purpose              | Status    | Configuration        | Dependencies   |
| ---------------------- | -------------------- | --------- | -------------------- | -------------- |
| **Cloudflare D1**      | Production Database  | ✅ Active | Cloudflare Dashboard | Prisma ORM     |
| **Cloudflare Workers** | Serverless Functions | ✅ Active | Auto-configured      | OpenNext.js    |
| **GitHub**             | Code Repository      | ✅ Active | Repository Settings  | CI/CD Pipeline |

## 📦 Critical Dependencies

| Package                         | Version | Purpose               | Critical | Backup Plan     |
| ------------------------------- | ------- | --------------------- | -------- | --------------- |
| **@prisma/client**              | ^6.16.1 | Database ORM          | ✅ Yes   | Manual queries  |
| **@opennextjs/cloudflare**      | ^1.8.0  | Cloudflare deployment | ✅ Yes   | Direct Wrangler |
| **next-auth**                   | ^4.24.7 | Authentication        | ✅ Yes   | Custom JWT      |
| **@scalar/api-reference-react** | ^0.7.49 | API Documentation     | ⚠️ No    | Static docs     |

## 🔧 Environment Variables

### Required for Production

```bash
# Database
DATABASE_URL=your-d1-database-connection-string
D1_DATABASE_ID=your-database-id

# JWT Authentication (REQUIRED)
JWT_SECRET=your-super-secret-jwt-key-here-at-least-32-characters-long

# NextAuth Configuration
NEXTAUTH_SECRET=your-secret-key-at-least-32-characters-long
NEXTAUTH_URL=https://your-domain.com

# API Documentation
API_DOCS_USERNAME=admin
API_DOCS_PASSWORD=secure-password

# Environment
NODE_ENV=production

# Cloudflare API (for deployment)
CLOUDFLARE_API_TOKEN=your-api-token
CLOUDFLARE_ACCOUNT_ID=your-account-id
```

### Development Only

```bash
# Local Database
DATABASE_URL="file:./prisma/dev.db"

# Development Environment
NODE_ENV=development
```

## 🚨 Service Monitoring

| Service                | Health Check       | Alert Threshold | Contact     |
| ---------------------- | ------------------ | --------------- | ----------- |
| **Cloudflare D1**      | Database queries   | >5s response    | DevOps Team |
| **Cloudflare Workers** | Function execution | >10s timeout    | DevOps Team |
| **Cloudflare Pages**   | Build status       | Build failure   | DevOps Team |
| **GitHub Actions**     | CI/CD pipeline     | Build failure   | DevOps Team |

## 🔄 Token Rotation Schedule

| Service                  | Rotation Period | Last Rotation | Next Rotation | Responsible   |
| ------------------------ | --------------- | ------------- | ------------- | ------------- |
| **JWT Secret**           | 90 days         | -             | -             | Security Team |
| **NextAuth Secret**      | 180 days        | -             | -             | Security Team |
| **Cloudflare API Token** | 90 days         | -             | -             | DevOps Team   |
| **API Docs Password**    | 90 days         | -             | -             | DevOps Team   |

## 📋 Service Dependencies

### Critical Path

1. **GitHub** → **GitHub Actions** → **Cloudflare Pages**
2. **Cloudflare D1** → **Prisma** → **Application**
3. **NextAuth** → **Authentication** → **Protected Routes**

### Backup Services

- **Database**: Local SQLite for development
- **Authentication**: Custom JWT implementation
- **Deployment**: Manual Wrangler deployment

## 🛠️ Troubleshooting

### Common Issues

| Issue                          | Service        | Solution                                           | Contact       |
| ------------------------------ | -------------- | -------------------------------------------------- | ------------- |
| Database connection failed     | Cloudflare D1  | Check `DATABASE_URL` and `D1_DATABASE_ID`          | DevOps Team   |
| JWT authentication failed      | JWT Auth       | Check `JWT_SECRET`                                 | Security Team |
| NextAuth authentication failed | NextAuth       | Check `NEXTAUTH_SECRET`                            | Security Team |
| Deployment failed              | Cloudflare API | Verify `CLOUDFLARE_API_TOKEN`                      | DevOps Team   |
| API docs access denied         | API Docs       | Verify `API_DOCS_USERNAME` and `API_DOCS_PASSWORD` | DevOps Team   |

### Emergency Contacts

- **DevOps Team**: [devops@company.com](mailto:devops@company.com)
- **Security Team**: [security@company.com](mailto:security@company.com)
- **On-call**: [oncall@company.com](mailto:oncall@company.com)

## 📊 Service Status

| Service                | Uptime | Last Incident | Notes  |
| ---------------------- | ------ | ------------- | ------ |
| **Cloudflare D1**      | 99.9%  | -             | Stable |
| **Cloudflare Workers** | 99.9%  | -             | Stable |
| **Cloudflare Pages**   | 99.9%  | -             | Stable |
| **GitHub**             | 99.9%  | -             | Stable |
