# NestJS Backend API

A comprehensive RESTful API built with NestJS, featuring authentication, user management, email services, file uploads, and real-time WebSocket support.

## Features

- **🔐 Authentication & Authorization**
    - JWT-based authentication with access and refresh tokens
    - Role-based access control (ADMIN, SUPER_ADMIN, USER)
    - OTP verification for registration and password reset
    - Cookie-based refresh token management

- **👥 User Management**
    - User registration, login, and profile management
    - Email verification system
    - Password reset functionality
    - User status management (ACTIVE, INACTIVE, BLOCKED, DELETED)

- **📧 Email Services**
    - SMTP integration for transactional emails
    - OTP email templates
    - Password reset notifications

- **📁 File Uploads**
    - AWS S3 integration for file storage
    - Multer for multipart file handling

- **💳 Payment Integration**
    - Stripe integration for payment processing

- **🔄 Real-time Communication**
    - Socket.IO for WebSocket connections
    - Real-time event broadcasting

- **📊 API Documentation**
    - Swagger/OpenAPI documentation
    - Comprehensive API endpoint documentation

## Tech Stack

- **Framework**: NestJS
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT with refresh tokens
- **Validation**: Class-validator & class-transformer
- **Email**: Nodemailer with Handlebars templates
- **File Storage**: AWS S3 SDK
- **Payments**: Stripe
- **Real-time**: Socket.IO
- **Documentation**: Swagger
- **Testing**: Jest

## Prerequisites

- Node.js (v18 or higher)
- PostgreSQL database
- AWS S3 bucket (for file uploads)
- Stripe account (for payments)
- SMTP server (for emails)

## Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd nestjs-backend

# Install dependencies
yarn install

# Copy environment variables
cp .env.example .env

# Configure your environment variables (see .env.example)
```

## Environment Variables

```bash
# Server Configuration
PORT=3000
NODE_ENV=development

# Database
DATABASE_URL="postgresql://username:password@localhost:5432/dbname"

# Authentication
BCRYPT_SALT_ROUNDS=12
JWT_SECRET="your_random_long_secret_key_here"
JWT_ACCESS_TOKEN_EXPIRES_IN="7d"
JWT_REFRESH_TOKEN_EXPIRES_IN="30d"

# Email Configuration
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-specific-password"

# AWS S3 (for file uploads)
AWS_ACCESS_KEY_ID="your-aws-access-key"
AWS_SECRET_ACCESS_KEY="your-aws-secret-key"
AWS_REGION="your-aws-region"
AWS_S3_BUCKET="your-s3-bucket-name"

# Stripe
STRIPE_SECRET_KEY="your-stripe-secret-key"
STRIPE_WEBHOOK_SECRET="your-webhook-secret"
```

## Database Setup

```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev

# (Optional) Seed database
npx prisma db seed
```

## Running the Application

```bash
# Development mode
yarn run dev

# Production mode
yarn run build
yarn run start:prod

# Debug mode
yarn run start:debug
```

## API Documentation

Once the server is running, visit:

- **Swagger UI**: `http://localhost:3000/api`
- **API Endpoints**: `http://localhost:3000/api/v1`

## Key API Endpoints

### Authentication

- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/verify-otp` - OTP verification
- `POST /api/v1/auth/forgot-password` - Forgot password
- `POST /api/v1/auth/reset-password` - Reset password
- `POST /api/v1/auth/refresh-token` - Refresh access token

### Users

- `GET /api/v1/users` - Get all users (admin only)
- `GET /api/v1/users/profile` - Get current user profile
- `PATCH /api/v1/users/:id` - Update user

### File Uploads

- `POST /api/v1/uploads` - Upload file to S3

## Project Structure

```
src/
├── auth/              # Authentication module
├── common/            # Shared utilities and decorators
├── guards/            # Route guards (auth, roles)
├── mail/              # Email services and templates
├── prisma/            # Database configuration
├── socket/            # WebSocket configuration
├── stripe/            # Payment integration
├── uploads/           # File upload handling
├── user/              # User management
├── app.module.ts      # Root module
├── main.ts            # Application entry point
└── filters/           # Exception filters
```

## Testing

```bash
# Run unit tests
yarn run test

# Run e2e tests
yarn run test:e2e

# Run test coverage
yarn run test:cov

# Watch mode
yarn run test:watch
```

## Code Quality

```bash
# Lint code
yarn run lint

# Format code
yarn run format
```

## Request Logging

The application includes comprehensive request logging that captures:

- HTTP method and route
- Response status codes (color-coded)
- Response duration
- Timestamp and user information

Example log format:

```
[Router] GET /api/v1/users 200 +45ms
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For questions and support, please open an issue in the repository.
