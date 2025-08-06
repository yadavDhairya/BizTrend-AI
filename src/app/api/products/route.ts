import { NextRequest } from 'next/server';
import { successResponse, errorResponse, validateRequiredFields } from '@/lib/api-utils';

// Mock products data
const mockProducts = [
  { id: 1, name: 'Product 1', price: 29.99, category: 'electronics' },
  { id: 2, name: 'Product 2', price: 19.99, category: 'clothing' },
  { id: 3, name: 'Product 3', price: 39.99, category: 'electronics' },
];

// GET endpoint to fetch all products
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');

    let filteredProducts = [...mockProducts];

    // Filter by category
    if (category) {
      filteredProducts = filteredProducts.filter(p => p.category === category);
    }

    // Filter by price range
    if (minPrice) {
      filteredProducts = filteredProducts.filter(p => p.price >= parseFloat(minPrice));
    }

    if (maxPrice) {
      filteredProducts = filteredProducts.filter(p => p.price <= parseFloat(maxPrice));
    }

    return successResponse(
      { products: filteredProducts, count: filteredProducts.length },
      'Products retrieved successfully'
    );

  } catch (error) {
    return errorResponse('Failed to fetch products', 500);
  }
}

// POST endpoint to create a new product
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    const validationError = validateRequiredFields(body, ['name', 'price', 'category']);
    if (validationError) {
      return errorResponse(validationError, 400, 'VALIDATION_ERROR');
    }

    // Validate price is a number
    if (isNaN(body.price) || body.price <= 0) {
      return errorResponse('Price must be a positive number', 400, 'VALIDATION_ERROR');
    }

    // Create new product
    const newProduct = {
      id: Date.now(),
      name: body.name,
      price: parseFloat(body.price),
      category: body.category,
      createdAt: new Date().toISOString(),
    };

    // In a real app, you'd save to a database here
    mockProducts.push(newProduct);

    return successResponse(
      { product: newProduct },
      'Product created successfully',
      201
    );

  } catch (error) {
    return errorResponse('Invalid JSON data', 400, 'PARSE_ERROR');
  }
}