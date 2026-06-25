# ALC Admin - Supabase Migration Guide

## Overview

This project has been successfully migrated from MySQL to PostgreSQL/Supabase. This guide documents the migration process, security improvements, and deployment instructions.

## Migration Summary

### What Changed

1. **Database Engine**: MySQL → PostgreSQL (Supabase)
2. **ORM**: Raw MySQL queries → Drizzle ORM with PostgreSQL
3. **Schema**: Migrated all tables to PostgreSQL with proper enums and types
4. **Connection**: Pool-based connection management with proper SSL support

### Security Improvements

The following security fixes have been implemented:

#### 1. Removed Hardcoded Credentials

**Before:**
```javascript
// ❌ INSECURE - Credentials exposed in source code
const connectionString = "postgresql://postgres:ZA6bw.djAAJ%2FguL@rhzloxuuyqjqrqryahkm.supabase.co:5432/postgres";
```

**After:**
```javascript
// ✅ SECURE - Uses environment variables
const connectionString = process.env.DATABASE_URL;
```

#### 2. Admin Password Management

**Before:**
```typescript
// ❌ INSECURE - Password hardcoded in source code
const hash = await bcrypt.hash("ALC@Admin2026#Secure", 12);
```

**After:**
```typescript
// ✅ SECURE - Uses environment variables with fallback
const defaultPassword = process.env.ADMIN_DEFAULT_PASSWORD || "ALC@Admin2026#Secure";
const hash = await bcrypt.hash(defaultPassword, 12);
```

#### 3. Admin Email Configuration

**Before:**
```typescript
// ❌ INSECURE - Email hardcoded in source code
const adminEmail = "z1xc20011019@gmail.com";
```

**After:**
```typescript
// ✅ SECURE - Uses environment variables with fallback
const adminEmail = process.env.ADMIN_EMAIL || "z1xc20011019@gmail.com";
```

## Environment Setup

### 1. Create `.env` file

Copy `.env.example` to `.env` and fill in your actual values:

```bash
cp .env.example .env
```

### 2. Required Environment Variables

```env
# Database
DATABASE_URL=postgresql://user:password@host:5432/database

# Admin Authentication
JWT_SECRET=your-very-secure-jwt-secret-key
ADMIN_USERNAME=yahya1019
ADMIN_DEFAULT_PASSWORD=your-secure-password
ADMIN_EMAIL=admin@example.com

# Email Notifications
GMAIL_USER=your-gmail@gmail.com
GMAIL_APP_PASSWORD=your-app-specific-password

# Other Configuration
VITE_APP_ID=your-app-id
OAUTH_SERVER_URL=https://oauth.server.url
OWNER_OPEN_ID=owner-open-id
BUILT_IN_FORGE_API_URL=https://forge.api.url
BUILT_IN_FORGE_API_KEY=your-forge-api-key
```

## Deployment Instructions

### Prerequisites

- Node.js 18+ and pnpm
- PostgreSQL 12+ or Supabase account
- Gmail account with App Password enabled

### Step 1: Install Dependencies

```bash
pnpm install
```

### Step 2: Verify Database Connection

```bash
node verify_db.js
```

This will:
- Test the database connection
- Apply pending migrations automatically

### Step 3: Build the Project

```bash
pnpm build
```

### Step 4: Start the Application

**Development:**
```bash
pnpm dev
```

**Production:**
```bash
pnpm start
```

## Database Schema

The project uses Drizzle ORM with PostgreSQL. The schema includes:

### Tables

1. **users** - OAuth users
   - id (PK)
   - openId (unique)
   - name, email, loginMethod
   - role (enum: user, admin)
   - timestamps

2. **admin_users** - Admin authentication
   - id (PK)
   - username (unique)
   - passwordHash
   - role (enum: superadmin, admin, teacher)
   - isSuperAdmin flag
   - createdAt

3. **registrations** - Course registration requests
   - id (PK)
   - offerIndex, fullName, phone, email
   - notes, status (enum: pending, contacted, enrolled, rejected)
   - timestamps

4. **certificate_requests** - Certificate requests
   - id (PK)
   - courseName, fullNameAr, fullNameEn
   - phone, birthPlace, birthDate, gender
   - idCardUrl, grades (JSON)
   - finalGrade, average, total
   - status (enum: pending, processing, completed, rejected)
   - timestamps

### Enums

- `user_role`: user, admin
- `admin_role`: superadmin, admin, teacher
- `registration_status`: pending, contacted, enrolled, rejected
- `gender`: male, female
- `certificate_status`: pending, processing, completed, rejected

## Migration Scripts

### apply_migrations.js

Manually applies SQL migrations from `drizzle/0000_pink_sinister_six.sql`:

```bash
node apply_migrations.js
```

**Note:** This is typically not needed as `verify_db.js` handles migrations automatically.

### verify_db.js

Verifies database connection and applies pending migrations:

```bash
node verify_db.js
```

## API Endpoints

### Public Endpoints

- `POST /api/trpc/registrations.submit` - Submit registration
- `POST /api/trpc/certificates.submit` - Submit certificate request

### Admin Endpoints (Protected)

- `POST /api/trpc/admin.login` - Admin login
- `GET /api/trpc/admin.registrations` - Get registrations
- `PUT /api/trpc/admin.updateRegistration` - Update registration status
- `DELETE /api/trpc/admin.deleteRegistration` - Delete registration
- `GET /api/trpc/admin.certificates` - Get certificate requests
- `PUT /api/trpc/admin.updateCertificate` - Update certificate status

## Troubleshooting

### Database Connection Issues

1. Verify `DATABASE_URL` is set correctly
2. Check network connectivity to Supabase
3. Ensure SSL is properly configured
4. Run `node verify_db.js` for detailed diagnostics

### Migration Failures

1. Check database user permissions
2. Ensure no active connections to the database
3. Review migration logs in `drizzle/` directory
4. Try `pnpm db:push` to regenerate migrations

### Email Notifications Not Working

1. Verify `GMAIL_USER` and `GMAIL_APP_PASSWORD` are set
2. Ensure Gmail App Password is enabled (not regular password)
3. Check firewall/network allows SMTP connections
4. Review server logs for email errors

## Best Practices

### Security

1. ✅ Always use environment variables for sensitive data
2. ✅ Never commit `.env` files to version control
3. ✅ Rotate credentials regularly
4. ✅ Use strong passwords (minimum 16 characters)
5. ✅ Enable 2FA on admin accounts
6. ✅ Use SSL/TLS for all connections

### Database

1. ✅ Regular backups (Supabase handles this automatically)
2. ✅ Monitor database performance
3. ✅ Use connection pooling (configured in db.ts)
4. ✅ Implement proper indexes for queries

### Deployment

1. ✅ Use environment-specific configurations
2. ✅ Never expose `.env` files
3. ✅ Use secrets management (GitHub Secrets, Vercel Secrets, etc.)
4. ✅ Monitor application logs
5. ✅ Set up alerting for critical errors

## Files Modified

1. **apply_migrations.js** - Removed hardcoded credentials
2. **server/routers.ts** - Admin password now uses environment variables
3. **server/email.ts** - Admin email now uses environment variables
4. **New: .env.example** - Template for environment variables
5. **New: MIGRATION_GUIDE.md** - This documentation

## Next Steps

1. Set up Supabase project if not already done
2. Configure all environment variables
3. Test database connection with `verify_db.js`
4. Deploy to production with proper environment configuration
5. Monitor application performance and logs

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review server logs
3. Verify all environment variables are set
4. Contact the development team

## References

- [Drizzle ORM Documentation](https://orm.drizzle.team/)
- [Supabase Documentation](https://supabase.com/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Node.js PostgreSQL Client](https://node-postgres.com/)
