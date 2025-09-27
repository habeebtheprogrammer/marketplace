# Chatbot Knowledge Base: Marketplace API

This document provides a comprehensive guide to the Marketplace API, designed to be used as a knowledge base for an AI chatbot. The chatbot can use this information to understand and perform actions on behalf of users.

## Table of Contents

- [User Management](#user-management)
- [Product Management](#product-management)
- [Category Management](#category-management) 
- [Wallet Management](#wallet-management) 
- [Ambassador Management](#ambassador-management)

---

## User Management
 
### 2. Create User

- **Endpoint**: `/users`
- **HTTP Method**: `POST`
- **Description**: Creates a new user account.
- **Authentication**: None.
- **Request Body**:
  ```json
  {
    "email": "newuser@example.com",
    "password": "securepassword123",
    "firstName": "Jane",
    "lastName": "Smith",
    "referralCode": "JOHN1234"
  }
  ```
- **Response Body (Success - 201)**:
  ```json
  {
    "success": true,
    "data": {
      "user": {
        "_id": "5f8d0d55b54764421b7166f3",
        "email": "newuser@example.com",
        "firstName": "Jane",
        "lastName": "Smith",
        "userType": "user",
        "referralCode": "JANE5678",
        "verificationCode": "12345",
        "createdAt": "2023-10-26T10:30:00.000Z"
      },
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
  }
  ```

### 3. Get User Account

- **Endpoint**: `/users/account`
- **HTTP Method**: `GET`
- **Description**: Retrieves the authenticated user's account details.
- **Authentication**: Bearer token required.
- **Response Body (Success - 200)**:
  ```json
  {
    "success": true,
    "data": {
      "_id": "5f8d0d55b54764421b7166f2",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "phoneNumber": ["+2348012345678"],
      "referralCode": "JOHN1234",
      "createdAt": "2023-10-25T14:30:00.000Z",
      "updatedAt": "2023-10-26T09:15:00.000Z"
    }
  }
  ```
  
### 4. Update User Account

- **Endpoint**: `/users/account`
- **HTTP Method**: `PATCH`
- **Description**: Updates the authenticated user's account details.
- **Authentication**: Bearer token required.
- **Request Body**:
  ```json
  {
    "firstName": "Johnny",
    "lastName": "Doe",
    "phoneNumber": ["+2348098765432"],
    "password": "newsecurepassword123"
  }
  ```
- **Response Body (Success - 200)**:
  ```json
  {
    "success": true,
    "data": {
      "_id": "5f8d0d55b54764421b7166f2",
      "email": "user@example.com",
      "firstName": "Johnny",
      "lastName": "Doe",
      "phoneNumber": ["+2348098765432"],
      "updatedAt": "2023-10-26T11:20:00.000Z"
    }
  }
  ```

### 5. Request Password Reset

- **Endpoint**: `/users/request-password-reset`
- **HTTP Method**: `POST`
- **Description**: Sends a password reset email to the user.
- **Authentication**: None.
- **Request Body**:
  ```json
  {
    "email": "user@example.com"
  }
  ```
- **Response Body (Success - 200)**:
  ```json
  {
    "success": true,
    "message": "Password reset email sent successfully"
  }
  ```

---

## Product Management

### 1. Get Products

- **Endpoint**: `/products`
- **HTTP Method**: `GET`
- **Description**: Retrieves a paginated list of products with optional filters and sorting.
- **Authentication**: Optional (Bearer token for authenticated features).
- **Query Parameters**:
  - `limit` (number, optional): Number of products per page (default: 9).
  - `page` (number, optional): Page number for pagination (default: 1).
  - `sort` (string, optional): Sort order (`highToLow`, `lowToHigh`, or latest).
  - `title` (string, optional): Search by product title.
  - `categoryId` (string, optional): Filter by category ID.
  - `vendorId` (string, optional): Filter by vendor ID.
  - `minPrice` (number, optional): Minimum price filter.
  - `maxPrice` (number, optional): Maximum price filter.
  - `trending` (boolean, optional): Filter trending products.

- **Response Body (Success - 200)**:
  ```json
  {
    "success": true,
    "data": {
      "docs": [
        {
          "_id": "5f8d0d55b54764421b7167001",
          "title": "Premium Smartphone X",
          "slug": "premium-smartphone-x-12345",
          "description": "Latest model with advanced features",
          "original_price": 259999,
          "discounted_price": 249999,
          "images": ["https://test.com/image1.jpg", "https://test.com/image2.jpg"],
          "categoryId": "5f8d0d55b54764421b7166f10",
          "vendorId": "5f8d0d55b54764421b7166f20",
          "is_stock": 1,
          "trending": false,
          "warranty": "2 years manufacturer warranty",
          "videoUrl": "https://example.com/video123",
          "views": 150,
          "rating": 4.5,
          "reviews": 24,
          "createdAt": "2023-10-20T10:00:00.000Z",
          "updatedAt": "2023-10-25T15:30:00.000Z"
        }
      ],
      "totalDocs": 1,
      "limit": 9,
      "page": 1,
      "totalPages": 1,
      "hasNextPage": false,
      "hasPrevPage": false
    }
  }
  ```

### 2. Get Product by ID

- **Endpoint**: `/products/:slug`
- **HTTP Method**: `GET`
- **Description**: Retrieves detailed information about a single product.
- **Authentication**: None.
- **URL Parameters**:
  - `slug` (string, required): The slug of the product to retrieve.

- **Response Body (Success - 200)**:
  ```json
  {
    "success": true,
    "data": {
      "_id": "5f8d0d55b54764421b7167001",
      "title": "Premium Smartphone X",
      "slug": "premium-smartphone-x-12345",
      "description": "Latest model with advanced features...",
      "original_price": 259999,
      "discounted_price": 249999,
      "images": ["https://test.com/image1.jpg", "https://test.com/image2.jpg"],
      "categoryId": {
        "_id": "5f8d0d55b54764421b7166f10",
        "name": "Smartphones",
        "slug": "smartphones"
      },
      "vendorId": {
        "_id": "5f8d0d55b54764421b7166f20",
        "title": "Tech Haven"
      },
      "is_stock": 1,
      "trending": false,
      "videoUrl": "https://example.com/video123",
      "views": 150,
      "rating": 4.5,
      "reviews": 24,
      "size": [
        {
          "title": "128GB",
          "is_stock": 1
        },
        {
          "title": "black",
          "is_stock": 1
        }
      ],
      "comments": [
        {
          "title": "Great Product!",
          "description": "Works perfectly, very satisfied with my purchase.",
          "images": ["https://test.com/review1.jpg"],
          "rating": 5,
          "creatorId": "5f8d0d55b54764421b7166f30",
          "createdAt": "2023-10-22T14:30:00.000Z"
        }
      ],
      "createdAt": "2023-10-20T10:00:00.000Z",
      "updatedAt": "2023-10-25T15:30:00.000Z"
    }
  }
  ```
- **Error Responses**:
  - `400 Bad Request`: 
    - Invalid request body
    - Amount exceeds ₦500 limit
    - Insufficient balance
  - `401 Unauthorized`: Invalid or missing authentication token

---

## Ambassador Management

### 1. List Ambassadors

- Endpoint: `/ambassador`
- HTTP Method: `GET`
- Description: Retrieves a paginated list of ambassadors. Supports basic text search across `fullName`, `email`, `university`, and `department`.
- Authentication: None.
- Query Parameters:
  - `page` (number, optional): Page number (default: 1)
  - `limit` (number, optional): Items per page (default: 10)
  - `sort` (string, optional): Field to sort by (desc) e.g. `createdAt`
  - `search` (string, optional): Text to search across fields
- Response (Success - 200):
  ```json
  {
    "success": true,
    "data": {
      "docs": [
        {
          "_id": "66f6b2f4a1b2c3d4e5f67890",
          "fullName": "Jane Doe",
          "email": "jane@example.com",
          "university": "UNILAG",
          "department": "Computer Science",
          "phone": "08030000000",
          "archive": false,
          "createdAt": "2025-09-27T20:50:00.000Z",
          "updatedAt": "2025-09-27T20:50:00.000Z"
        }
      ],
      "totalDocs": 1,
      "limit": 10,
      "page": 1,
      "totalPages": 1,
      "hasPrevPage": false,
      "hasNextPage": false
    }
  }
  ```

### 2. Create Ambassador

- Endpoint: `/ambassador`
- HTTP Method: `POST`
- Description: Creates a new ambassador record.
- Authentication: Bearer token required.
- Request Body:
  ```json
  {
    "fullName": "Jane Doe",
    "email": "jane@example.com",
    "university": "UNILAG",
    "department": "Computer Science",
    "phone": "08030000000"
  }
  ```
- Response (Success - 201/200):
  ```json
  {
    "success": true,
    "data": {
      "_id": "66f6b2f4a1b2c3d4e5f67890",
      "fullName": "Jane Doe",
      "email": "jane@example.com",
      "university": "UNILAG",
      "department": "Computer Science",
      "phone": "08030000000",
      "archive": false,
      "createdAt": "2025-09-27T20:50:00.000Z",
      "updatedAt": "2025-09-27T20:50:00.000Z"
    }
  }
  ```
- Error Responses:
  - `412 Precondition Failed`: Validation failed (missing/invalid fields)
  - `409 Conflict`: Duplicate email
  - `401 Unauthorized`: Missing/invalid token

### 3. Update Ambassador

- Endpoint: `/ambassador`
- HTTP Method: `PATCH`
- Description: Updates an existing ambassador. Requires `_id` in body. Only provided fields are updated.
- Authentication: Bearer token required.
- Request Body:
  ```json
  {
    "_id": "66f6b2f4a1b2c3d4e5f67890",
    "phone": "08031111111"
  }
  ```
- Response (Success - 200):
  ```json
  {
    "success": true,
    "data": {
      "_id": "66f6b2f4a1b2c3d4e5f67890",
      "fullName": "Jane Doe",
      "email": "jane@example.com",
      "university": "UNILAG",
      "department": "Computer Science",
      "phone": "08031111111",
      "archive": false,
      "updatedAt": "2025-09-27T21:00:00.000Z"
    }
  }
  ```
- Error Responses:
  - `412 Precondition Failed`: `_id` missing
  - `401 Unauthorized`: Missing/invalid token

### 4. Delete Ambassador

- Endpoint: `/ambassador`
- HTTP Method: `DELETE`
- Description: Deletes an ambassador by ID.
- Authentication: Bearer token required.
- Request Body:
  ```json
  {
    "id": "66f6b2f4a1b2c3d4e5f67890"
  }
  ```
- Response (Success - 200):
  ```json
  {
    "success": true,
    "data": {
      "_id": "66f6b2f4a1b2c3d4e5f67890",
      "fullName": "Jane Doe",
      "email": "jane@example.com"
    }
  }
  ```
- Error Responses:
  - `400 Bad Request`: `id` missing
  - `401 Unauthorized`: Missing/invalid token
  - `404 Not Found`: Product with the specified ID was not found
  
## Category Management

### 1. List Categories

- Endpoint: `/categories`
- HTTP Method: `GET`
- Description: Retrieves all categories (non-archived) available in the marketplace.
- Authentication: None.
- Response Body (Success - 200):
  ```json
  {
    "success": true,
    "data": [
      {
        "_id": "65b14b7105f8b5c69b5ab4e3",
        "title": "Smartphones",
        "image": "https://example.com/cat-smartphones.jpg",
        "slug": "smartphones-12345",
        "vendorId": "66927af6eb322a27f7c6902c",
        "archive": false,
        "createdAt": "2023-10-20T10:00:00.000Z",
        "updatedAt": "2023-10-25T15:30:00.000Z"
      }
    ]
  }
  ```
 

### 4. Get Category by ID

- Endpoint: `/categories/:id`
- HTTP Method: `GET`
- Description: Retrieves a single category by its ID.
- Authentication: None.
- URL Parameters:
  - `id` (string, required): Category ID.
- Response Body (Success - 200):
  ```json
  {
    "success": true,
    "data": {
      "_id": "65b14b7105f8b5c69b5ab4e3",
      "title": "Smartphones",
      "image": "https://example.com/cat-smartphones.jpg",
      "slug": "smartphones-12345",
      "vendorId": "66927af6eb322a27f7c6902c",
      "archive": false,
      "createdAt": "2023-10-20T10:00:00.000Z",
      "updatedAt": "2023-10-25T15:30:00.000Z"
    }
  }
  ```
- Error Responses:
  - `404 Not Found`: Category not found
 
## Chat Sessions API

### 1. Create Chat Session

- **Endpoint**: `/api/chat`
- **HTTP Method**: `POST`
- **Description**: Creates a new chat session. Works for both authenticated users and guests.
- **Authentication**: 
  - Authenticated: Bearer token
  - Guest: `device-id` header required
- **Request Headers**:
  - `device-id`: Required for guest users
  - `Authorization`: Bearer token for authenticated users
- **Request Body**:
  ```json
  {
    "title": "My Chat Session",
    "metadata": {
      "user_agent": "Mozilla/5.0...",
      "ip_address": "192.168.1.1"
    }
  }
  ```
- **Response (Success - 201)**:
  ```json
  {
    "success": true,
    "data": {
      "_id": "60d5ec9f4b3f8b001c8d4e5f",
      "sessionId": "550e8400-e29b-41d4-a716-446655440000",
      "userId": "60d5ec9f4b3f8b001c8d4e5f",
      "deviceId": "device-12345",
      "title": "My Chat Session",
      "isActive": true,
      "createdAt": "2023-10-26T10:00:00.000Z",
      "updatedAt": "2023-10-26T10:00:00.000Z"
    }
  }
  ```

### 2. Get Chat Session

- **Endpoint**: `/api/chat/:sessionId`
- **HTTP Method**: `GET`
- **Description**: Retrieves a specific chat session with all its messages.
- **Authentication**: Same as creation
- **URL Parameters**:
  - `sessionId` (string, required): The ID of the chat session to retrieve
- **Response (Success - 200)**:
  ```json
  {
    "success": true,
    "data": {
      "_id": "60d5ec9f4b3f8b001c8d4e5f",
      "sessionId": "550e8400-e29b-41d4-a716-446655440000",
      "userId": "60d5ec9f4b3f8b001c8d4e5f",
      "title": "My Chat Session",
      "messages": [
        {
          "role": "user",
          "content": "Hello, how are you?",
          "timestamp": "2023-10-26T10:00:00.000Z"
        },
        {
          "role": "assistant",
          "content": "I'm doing well, thank you for asking!",
          "timestamp": "2023-10-26T10:00:01.000Z"
        }
      ],
      "isActive": true,
      "createdAt": "2023-10-26T10:00:00.000Z",
      "updatedAt": "2023-10-26T10:01:00.000Z"
    }
  }
  ```

### 3. List Chat Sessions

- **Endpoint**: `/api/chat`
- **HTTP Method**: `GET`
- **Description**: Lists all chat sessions for the current user/device.
- **Authentication**: Same as creation
- **Query Parameters**:
  - `page` (number, optional): Page number (default: 1)
  - `limit` (number, optional): Items per page (default: 10)
- **Response (Success - 200)**:
  ```json
  {
    "success": true,
    "data": {
      "docs": [
        {
          "_id": "60d5ec9f4b3f8b001c8d4e5f",
          "sessionId": "550e8400-e29b-41d4-a716-446655440000",
          "title": "My Chat Session",
          "lastMessage": "I'm doing well, thank you for asking!",
          "messageCount": 2,
          "isActive": true,
          "updatedAt": "2023-10-26T10:01:00.000Z"
        }
      ],
      "totalDocs": 1,
      "limit": 10,
      "page": 1,
      "totalPages": 1,
      "hasNextPage": false,
      "hasPrevPage": false
    }
  }
  ```

### 4. Add Message to Session

- **Endpoint**: `/api/chat/:sessionId/messages`
- **HTTP Method**: `POST`
- **Description**: Adds a new message to an existing chat session.
- **Authentication**: Same as creation
- **Request Body**:
  ```json
  {
    "role": "user",
    "content": "What's the weather like today?",
    "metadata": {
      "source": "web"
    }
  }
  ```
- **Response (Success - 200)**:
  ```json
  {
    "success": true,
    "message": "Message added successfully"
  }
  ```

### 5. Update Chat Session

- **Endpoint**: `/api/chat/:sessionId`
- **HTTP Method**: `PATCH`
- **Description**: Updates session metadata or title.
- **Authentication**: Same as creation
- **Request Body**:
  ```json
  {
    "title": "Updated Chat Title",
    "metadata": {
      "tags": ["important", "follow-up"]
    }
  }
  ```
- **Response (Success - 200)**:
  ```json
  {
    "success": true,
    "data": {
      "_id": "60d5ec9f4b3f8b001c8d4e5f",
      "sessionId": "550e8400-e29b-41d4-a716-446655440000",
      "title": "Updated Chat Title",
      "metadata": {
        "tags": ["important", "follow-up"]
      },
      "updatedAt": "2023-10-26T10:05:00.000Z"
    }
  }
  ```

## Wallet Management

### 1. Get Wallet

- **Endpoint**: `/wallets`
- **HTTP Method**: `GET`
- **Description**: Retrieves the authenticated user's wallet balance and virtual account details for funding.
- **Authentication**: Bearer token required.
- **Response Body (Success - 200)**:
  ```json
  {
    "balance": 5000,
    "accounts": [
      {
        "accountName": "John Doe",
        "accountNumber": "1234567890",
        "bankName": "Wema Bank (1.5% fee)"
      },
      {
        "accountName": "John Doe",
        "accountNumber": "9876543210",
        "bankName": "Providus Bank (1.5% fee)"
      }
    ]
  }
  ```
- **Response Fields**:
  - `balance` (number): Current wallet balance in kobo (₦1 = 100 kobo)
  - `accounts` (array): List of virtual accounts for funding
    - `accountName` (string): Name on the account (user's full name)
    - `accountNumber` (string): 10-digit virtual account number
    - `bankName` (string): Name of the bank with transaction fee
- **Error Responses**:
  - `401 Unauthorized`: Invalid or missing authentication token
  - `500 Internal Server Error`: Failed to fetch wallet information
- **Notes**:
  - The virtual accounts are automatically created for each user on first wallet access
  - Any amount sent to any of the virtual accounts will be automatically credited to the user's wallet
  - A 1.5% processing fee is charged on all deposits
  - The virtual accounts are managed by Monnify and support instant bank transfers from any Nigerian bank

### 2. Get Transactions

- **Endpoint**: `/wallets/transactions`
- **HTTP Method**: `GET`
- **Description**: Retrieves the user's transaction history with pagination.
- **Authentication**: Optional (Bearer token for authenticated features).
- **Query Parameters**:
  - `page` (number, optional): Page number for pagination (default: 1)
  - `limit` (number, optional): Number of items per page (default: 10)
  - `type` (string, optional): Filter by transaction type (e.g., 'credit', 'debit')
- **Response Body (Success - 200)**:
  ```json
  {
    "success": true,
    "data": {
      "docs": [
        {
          "_id": "5f8d0d55b54764421b7166f4",
          "userId": "5f8d0d55b54764421b7166f2",
          "type": "debit",
          "amount": 1000,
          "reference": "Airtime_123456789",
          "narration": "Airtime topup to 08123456789",
          "currency": "NGN",
          "status": "successful",
          "createdAt": "2023-10-25T15:30:00.000Z"
        }
      ],
      "totalDocs": 1,
      "limit": 10,
      "page": 1,
      "totalPages": 1,
      "pagingCounter": 1,
      "hasPrevPage": false,
      "hasNextPage": false,
      "prevPage": null,
      "nextPage": null
    }
  }
  ```

### 3. Fetch Data Plans

- **Endpoint**: `/wallets/fetchDataPlan`
- **HTTP Method**: `GET`
- **Description**: Retrieves available data plans from all networks.
- **Authentication**: None.
- **Response Body (Success - 200)**:
  ```json
  [
    {
      "planName": "500MB",
      "planId": "41",
      "amount": "155.00",
      "planType": "COOPERATE GIFTING",
      "duration": "1month",
      "network": "9MOBILE",
      "vendor": "quickvtu"
    },
    {
      "planName": "1GB",
      "planId": "42",
      "amount": "300.00",
      "planType": "COOPERATE GIFTING",
      "duration": "1month",
      "network": "9MOBILE",
      "vendor": "quickvtu"
    },
    {
      "planName": "2GB",
      "planId": "43",
      "amount": "620.00",
      "planType": "SME",
      "duration": "1month",
      "network": "MTN",
      "vendor": "bilal"
    }
  ]
  ```

### 4. Buy Data Plan

- **Endpoint**: `/wallets/buyDataPlan`
- **HTTP Method**: `POST`
- **Description**: Purchases a data plan for a specified phone number.
- **Authentication**: Optional (Bearer token for authenticated features).
- **Request Body**:
  ```json
  {
    "plan": {
      "amount": 1000,
      "planId": "43",
      "vendor": "quickvtu",
      "network": "MTN",
      "planType": "SME"
    },
    "phone": "08123456789"
  }
  ```
- **Response Body (Success - 200)**:
  ```json
  {
    "success": true,
    "data": {
      "_id": "5f8d0d55b54764421b7166f5",
      "amount": 1000,
      "originalAmount": 1000,
      "discountApplied": 0,
      "couponUsed": null,
      "userId": "5f8d0d55b54764421b7166f2",
      "reference": "Data_123456789",
      "narration": "Data topup to 08123456789",
      "currency": "NGN",
      "type": "debit",
      "network": "MTN",
      "planType": "SME",
      "dataAmount": 2000,
      "status": "pending",
      "createdAt": "2023-10-25T16:30:00.000Z",
      "updatedAt": "2023-10-25T16:30:00.000Z"
    },
    "message": "Your data purchase is being processed"
  }
  ```
- **Error Responses**:
  - `400 Bad Request`: Invalid request body or insufficient balance
  - `401 Unauthorized`: Invalid or missing authentication token
  - `500 Internal Server Error`: Error processing the data plan purchase

### 5. Buy Airtime

- **Endpoint**: `/wallets/buyAirtime`
- **HTTP Method**: `POST`
- **Description**: Purchases airtime for a specified phone number (max ₦500 per transaction).
- **Authentication**: Optional (Bearer token for authenticated features).
- **Request Body**:
  ```json
  {
    "amount": 500,
    "phone": "08123456789"
  }
  ```
- **Response Body (Success - 200)**:
  ```json
  {
    "success": true,
    "data": {
      "_id": "5f8d0d55b54764421b7166f6",
      "amount": 500,
      "userId": "5f8d0d55b54764421b7166f2",
      "reference": "Airtime_123456789",
      "narration": "Airtime topup to 08123456789",
      "currency": "NGN",
      "type": "debit",
      "status": "successful",
      "createdAt": "2023-10-25T17:30:00.000Z",
      "updatedAt": "2023-10-25T17:30:00.000Z"
    }
  }
  ```
- **Error Responses**: