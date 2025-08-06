# API Documentation

This directory contains the API routes for your Next.js application. All routes are built using Next.js 15 App Router.

## Available Endpoints

### 1. Hello API
- **GET** `/api/hello`
- Returns a simple greeting message with timestamp

### 2. Users API
- **GET** `/api/users` - Get all users
- **POST** `/api/users` - Create a new user
- **GET** `/api/users/[id]` - Get a specific user by ID
- **PUT** `/api/users/[id]` - Update a specific user
- **DELETE** `/api/users/[id]` - Delete a specific user

### 3. Products API
- **GET** `/api/products` - Get all products (with optional filtering)
- **POST** `/api/products` - Create a new product

## Usage Examples

### Testing with curl

```bash
# Get hello message
curl http://localhost:3000/api/hello

# Get all users
curl http://localhost:3000/api/users

# Create a new user
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"name": "John Doe", "email": "john@example.com"}'

# Get a specific user
curl http://localhost:3000/api/users/1

# Get products with filters
curl "http://localhost:3000/api/products?category=electronics&minPrice=20"

# Create a new product
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -d '{"name": "New Product", "price": 49.99, "category": "electronics"}'
```

### Testing with JavaScript/Fetch

```javascript
// Get all users
const response = await fetch('/api/users');
const data = await response.json();

// Create a new user
const newUser = await fetch('/api/users', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    name: 'John Doe',
    email: 'john@example.com'
  })
});

// Get filtered products
const products = await fetch('/api/products?category=electronics&minPrice=20');
```

## Response Format

All API responses follow a consistent format:

### Success Response
```json
{
  "data": {...},
  "message": "Success message",
  "status": "success",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Error Response
```json
{
  "error": "Error message",
  "status": "error",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "code": "ERROR_CODE"
}
```

## Adding New API Routes

To add a new API route:

1. Create a new directory in `src/app/api/` for your route
2. Create a `route.ts` file in that directory
3. Export the HTTP methods you want to support (GET, POST, PUT, DELETE, etc.)

Example:
```typescript
// src/app/api/example/route.ts
import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/lib/api-utils';

export async function GET() {
  return successResponse({ message: 'Example endpoint' });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    return successResponse(body, 'Data received');
  } catch (error) {
    return errorResponse('Invalid data');
  }
}
```

## Environment Variables

For production APIs, consider using environment variables for:
- Database connections
- API keys
- Configuration settings

Create a `.env.local` file in your project root:
```env
DATABASE_URL=your_database_url
API_KEY=your_api_key
```

## Security Considerations

- Always validate input data
- Use proper authentication for sensitive endpoints
- Implement rate limiting for public APIs
- Sanitize user inputs to prevent injection attacks
- Use HTTPS in production