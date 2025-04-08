# Marketplace Backend API

A robust Node.js/Express.js backend API for a marketplace platform that supports e-commerce, digital services, and user management.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [API Documentation](#api-documentation)
- [Project Structure](#project-structure)
- [Authentication](#authentication)
- [Error Handling](#error-handling)

## Features

- User Authentication (Email, Google, Apple Sign-in)
- Product Management
- Order Processing
- Cart Management
- Wishlist Management
- Vendor Management
- Wallet & Payment Integration
- Address Management
- Promotional System
- Blog Management
- Category Management
- File Upload Support
- Email Notifications
- SEO Optimization (Sitemap & Robots.txt)

## Tech Stack

- **Runtime Environment:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB (with Mongoose ODM)
- **Authentication:** JWT, Google Auth, Apple Sign-in
- **File Upload:** Express File Upload
- **Email Service:** Nodemailer
- **Security:** Helmet, CORS
- **Validation:** Validator.js
- **Payment Processing:** Monnify Integration
- **Push Notifications:** OneSignal

## Prerequisites

- Node.js (v14 or higher)
- MongoDB
- npm or yarn
- AWS Account (for file storage)
- Monnify Account (for payments)
- OneSignal Account (for push notifications)

## Installation

1. Clone the repository:
```bash
git clone [repository-url]
cd marketplace
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables (see Environment Variables section)

4. Start the server:
```bash
# Development
npm run dev

# Production
npm start
```

## Environment Variables

Create a `.env.development.local` file for development or `.env.production.local` for production with the following variables:

```env
NODE_ENV=development
PORT=3000
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_BUCKET_NAME=your_bucket_name
MONNIFY_SECRET_KEY=your_monnify_secret
ONESIGNAL_APP_ID=your_onesignal_app_id
ONESIGNAL_REST_API_KEY=your_onesignal_api_key
```

## API Documentation

### Authentication Endpoints

#### User Registration

```http
POST /api/users/signup
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "securePassword123",
  "referralCode": "ABC123" // Optional
}

Response (200 OK):
{
  "user": {
    "id": "user_id",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "referralCode": "JOHN1234",
    "verificationCode": "12345"
  },
  "token": "jwt_token"
}
```

#### User Login

```http
POST /api/users/signin
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securePassword123"
}

Response (200 OK):
{
  "user": {
    "id": "user_id",
    "firstName": "John",
    "email": "john@example.com"
  },
  "token": "jwt_token"
}
```

### Product Endpoints

#### Create Product

```http
POST /api/products
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Premium Headphones",
  "description": "High-quality wireless headphones",
  "price": 199.99,
  "category": "Electronics",
  "stock": 50,
  "vendorId": "vendor_id"
}

Response (201 Created):
{
  "id": "product_id",
  "title": "Premium Headphones",
  "slug": "premium-headphones-12345",
  "price": 199.99,
  "createdAt": "2024-04-06T12:00:00Z"
}
```

#### Get Products

```http
GET /api/products?category=Electronics&minPrice=100&maxPrice=200
Authorization: Bearer <token>

Response (200 OK):
{
  "products": [
    {
      "id": "product_id",
      "title": "Premium Headphones",
      "price": 199.99,
      "stock": 50
    }
  ],
  "total": 1,
  "page": 1,
  "limit": 10
}
```

### Order Endpoints

#### Create Order

```http
POST /api/orders
Authorization: Bearer <token>
Content-Type: application/json

{
  "items": [
    {
      "productId": "product_id",
      "quantity": 2
    }
  ],
  "shippingAddress": {
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001"
  },
  "paymentMethod": "wallet"
}

Response (201 Created):
{
  "orderId": "order_id",
  "status": "pending",
  "total": 399.98,
  "items": [...],
  "createdAt": "2024-04-06T12:00:00Z"
}
```

### Wallet Endpoints

#### Get Wallet Balance

```http
GET /api/wallets
Authorization: Bearer <token>

Response (200 OK):
{
  "balance": 1000.00,
  "currency": "NGN",
  "lastUpdated": "2024-04-06T12:00:00Z"
}
```

#### Withdraw Funds

```http
POST /api/wallets/withdraw
Authorization: Bearer <token>
Content-Type: application/json

{
  "amount": 500.00,
  "bankDetails": {
    "accountNumber": "1234567890",
    "bankName": "Example Bank",
    "accountName": "John Doe"
  }
}

Response (200 OK):
{
  "transactionId": "trans_id",
  "amount": 500.00,
  "status": "pending",
  "createdAt": "2024-04-06T12:00:00Z"
}
```

### Cart Endpoints

#### Add to Cart

```http
POST /api/carts
Authorization: Bearer <token>
Content-Type: application/json

{
  "productId": "product_id",
  "quantity": 2
}

Response (201 Created):
{
  "cartId": "cart_id",
  "items": [
    {
      "productId": "product_id",
      "quantity": 2,
      "price": 199.99
    }
  ],
  "total": 399.98
}
```

### Common Response Formats

#### Success Response

```json
{
  "status": "success",
  "data": {
    // Response data
  }
}
```

#### Error Response

```json
{
  "status": "error",
  "error": {
    "message": "Error message",
    "code": "ERROR_CODE"
  }
}
```

### Authentication

All protected endpoints require a JWT token in the Authorization header:
```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Rate Limiting

The API implements rate limiting to prevent abuse:
- 100 requests per minute for authenticated users
- 20 requests per minute for unauthenticated users

### Pagination

Endpoints that return lists support pagination using query parameters:
```http
GET /api/products?page=1&limit=10
```

### Filtering

Many endpoints support filtering using query parameters:
```http
GET /api/products?category=Electronics&minPrice=100&maxPrice=200&sort=price:asc
```

## Wallet Functionality

The marketplace platform includes a comprehensive wallet system that allows users to manage funds, make payments, and perform various financial transactions.

### Wallet Features

- **Balance Management**: Users can view their current wallet balance
- **Fund Transfers**: Support for funding wallets via bank transfers
- **Withdrawals**: Users can withdraw funds to their bank accounts
- **Transaction History**: Detailed record of all wallet transactions
- **Payment Processing**: Wallet can be used for in-app purchases
- **Airtime & Data Purchases**: Direct purchase of mobile airtime and data plans
- **Referral Bonuses**: Automatic crediting of referral bonuses to wallet

### Wallet Endpoints

#### Fetch Wallet Balance

```http
GET /api/wallets
Authorization: Bearer <token>

Response (200 OK):
{
  "balance": 1000.00,
  "accounts": [
    {
      "accountName": "John Doe",
      "accountNumber": "1234567890",
      "bankName": "Example Bank"
    }
  ]
}
```

#### Fetch Transaction History

```http
GET /api/wallets/transactions
Authorization: Bearer <token>

Response (200 OK):
{
  "docs": [
    {
      "amount": 500.00,
      "reference": "TRX123456",
      "narration": "Wallet funding",
      "status": "successful",
      "type": "credit",
      "createdAt": "2024-04-06T12:00:00Z"
    }
  ],
  "totalDocs": 1,
  "limit": 30,
  "page": 1
}
```

#### Withdraw Funds

```http
POST /api/wallets/withdraw
Authorization: Bearer <token>
Content-Type: application/json

{
  "amount": 500.00,
  "bankCode": "044",
  "bankName": "Access Bank",
  "accountNumber": "1234567890",
  "accountName": "John Doe",
  "reference": "WD123456"
}

Response (200 OK):
{
  "status": "success",
  "data": {
    "amount": 500.00,
    "reference": "WD123456--12345",
    "narration": "Withdrawal to ******7890",
    "status": "pending",
    "type": "debit",
    "createdAt": "2024-04-06T12:00:00Z"
  }
}
```

#### Fetch Available Data Plans

```http
GET /api/wallets/fetchDataPlan
Authorization: Bearer <token>

Response (200 OK):
{
  "dataplan": [
    {
      "planId": "MTN-1GB",
      "planName": "1GB",
      "network": "MTN",
      "planType": "Daily",
      "amount": 100.00,
      "vendor": "quickvtu"
    }
  ]
}
```

#### Purchase Data Plan

```http
POST /api/wallets/buyDataPlan
Authorization: Bearer <token>
Content-Type: application/json

{
  "plan": {
    "planId": "MTN-1GB",
    "amount": 100.00,
    "planName": "1GB",
    "network": "MTN",
    "planType": "Daily",
    "vendor": "quickvtu"
  },
  "phone": "08012345678"
}

Response (200 OK):
{
  "status": "success",
  "data": {
    "amount": 100.00,
    "reference": "Data_12345678901",
    "narration": "Data topup to 08012345678",
    "status": "pending",
    "type": "debit",
    "createdAt": "2024-04-06T12:00:00Z"
  },
  "message": "Your data purchase is being processed"
}
```

#### Purchase Airtime

```http
POST /api/wallets/buyAirtime
Authorization: Bearer <token>
Content-Type: application/json

{
  "amount": 100.00,
  "phone": "08012345678"
}

Response (200 OK):
{
  "status": "success",
  "data": {
    "amount": 100.00,
    "reference": "Airtime_12345678901",
    "narration": "Airtime topup to 08012345678",
    "status": "successful",
    "type": "debit",
    "createdAt": "2024-04-06T12:00:00Z"
  }
}
```

#### Fetch Banks List

```http
GET /api/wallets/fetchBanks
Authorization: Bearer <token>

Response (200 OK):
{
  "status": "success",
  "data": [
    {
      "bankCode": "044",
      "bankName": "Access Bank"
    }
  ]
}
```

#### Verify Bank Account

```http
POST /api/wallets/verifyBank
Authorization: Bearer <token>
Content-Type: application/json

{
  "bankCode": "044",
  "accountNumber": "1234567890"
}

Response (200 OK):
{
  "status": "success",
  "data": {
    "accountName": "John Doe",
    "accountNumber": "1234567890",
    "bankCode": "044"
  }
}
```

### Wallet Webhooks

The system supports webhooks for payment processing:

#### Monnify Webhook

```http
POST /api/wallets/monnify-hoook
Content-Type: application/json

{
  "eventType": "SUCCESSFUL_TRANSACTION",
  "eventData": {
    "settlementAmount": 1000.00,
    "product": {
      "type": "RESERVED_ACCOUNT",
      "reference": "user_id"
    },
    "amountPaid": 1000.00,
    "transactionReference": "TRX123456",
    "destinationAccountInformation": {
      "bankCode": "044",
      "bankName": "Access Bank",
      "accountNumber": "1234567890"
    }
  }
}
```

#### Flutterwave Webhook

```http
POST /api/wallets/f-hoook
Content-Type: application/json

{
  "event": "charge.completed",
  "data": {
    "status": "successful",
    "customer": {
      "email": "john@example.com"
    },
    "amount": 1000.00,
    "tx_ref": "TRX123456"
  }
}
```

## User Management

The marketplace platform includes a comprehensive user management system that handles authentication, account management, and user verification.

### User Features

- **Authentication**: Multiple sign-in methods including email/password, Google, and Apple
- **Account Management**: Create, update, and delete user accounts
- **User Verification**: Email verification with OTP
- **Referral System**: Users can refer others and earn rewards
- **User Types**: Support for different user types (user, vendor, superuser)
- **Location Tracking**: Track user location and device information
- **Admin Controls**: Admin-specific user management functions

### User Endpoints

#### User Registration

```http
POST /api/users/signup
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "securePassword123",
  "referralCode": "ABC123" // Optional
}

Response (200 OK):
{
  "user": {
    "id": "user_id",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "referralCode": "JOHN1234",
    "verificationCode": "12345"
  },
  "token": "jwt_token"
}
```

#### User Login

```http
POST /api/users/signin
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securePassword123"
}

Response (200 OK):
{
  "user": {
    "id": "user_id",
    "firstName": "John",
    "email": "john@example.com"
  },
  "token": "jwt_token"
}
```

#### Get User Account

```http
GET /api/users/account
Authorization: Bearer <token>

Response (200 OK):
{
  "id": "user_id",
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "referralCode": "JOHN1234",
  "referrals": 5,
  "userType": "user",
  "location": {
    "latitude": "40.7128",
    "longitude": "-74.0060",
    "city": "New York",
    "lastseen": "2024-04-06T12:00:00Z"
  }
}
```

#### Update User Account

```http
PATCH /api/users/account
Authorization: Bearer <token>
Content-Type: application/json

{
  "firstName": "Johnny",
  "lastName": "Doe",
  "password": "newPassword123" // Optional
}

Response (200 OK):
{
  "id": "user_id",
  "firstName": "Johnny",
  "lastName": "Doe",
  "email": "john@example.com",
  "updatedAt": "2024-04-06T12:00:00Z"
}
```

#### Send OTP Email

```http
POST /api/users/sendOtp
Content-Type: application/json

{
  "email": "john@example.com"
}

Response (200 OK):
{
  "success": true
}
```

#### Verify OTP

```http
POST /api/users/verifyOtp
Content-Type: application/json

{
  "email": "john@example.com",
  "otp": "12345"
}

Response (200 OK):
{
  "verified": true
}
```

#### Refresh Token

```http
GET /api/users/refreshToken
Authorization: Bearer <token>

Response (200 OK):
{
  "user": {
    "id": "user_id",
    "firstName": "John",
    "email": "john@example.com"
  },
  "token": "new_jwt_token"
}
```

#### Get User Delivery Information

```http
GET /api/users/delivery

Response (200 OK):
{
  "deliveryInfo": {
    // Delivery information
  }
}
```

#### Admin: Get All Users

```http
GET /api/users
Authorization: Bearer <token> // Admin token required

Response (200 OK):
{
  "docs": [
    {
      "id": "user_id",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com",
      "userType": "user",
      "referrals": 5
    }
  ],
  "totalDocs": 100,
  "limit": 10,
  "page": 1
}
```

#### Admin: Delete User

```http
DELETE /api/users/delete/:user_id
Authorization: Bearer <token> // Admin token required

Response (200 OK):
{
  "id": "user_id",
  "archive": true,
  "updatedAt": "2024-04-06T12:00:00Z"
}
```

### User Model

The user model includes the following fields:

- **email**: Unique email address (required)
- **oneSignalId**: ID for push notifications
- **userType**: Type of user (user, vendor, superuser)
- **firstName**: User's first name (required)
- **lastName**: User's last name (required)
- **password**: Hashed password (required)
- **archive**: Soft delete flag
- **vendorId**: Reference to vendor (if applicable)
- **referredBy**: Reference to referring user
- **referralCode**: Unique code for referrals
- **referrals**: Count of successful referrals
- **verificationCode**: Code for email verification
- **deviceid**: Device identifier
- **location**: User location and device information
  - latitude
  - longitude
  - city
  - platform
  - buildnumber
  - buildversion
  - model
  - deviceid
  - lastseen

## Project Structure

```
marketplace/
├── config/           # Configuration files
├── controller/       # Route controllers
├── model/           # Database models
├── routes/          # API routes
├── service/         # Business logic
├── utils/           # Utility functions
├── emailTemplates/  # Email templates
├── build/           # Production build
├── app.js           # Application entry point
└── package.json     # Project dependencies
```

## Authentication Middleware

The API uses JWT (JSON Web Tokens) for authentication. Most endpoints require a valid JWT token in the Authorization header:

```
Authorization: Bearer <token>
```

## Error Handling

The API uses a standardized error response format:

```json
{
  "error": {
    "message": "Error message",
    "code": "ERROR_CODE"
  }
}
```

Common HTTP status codes:
- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Internal Server Error

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

This project is licensed under the MIT License.
