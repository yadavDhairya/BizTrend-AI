import { NextRequest, NextResponse } from 'next/server';

// GET endpoint to fetch users
export async function GET() {
  // This is a mock response - in a real app, you'd fetch from a database
  const users = [
    { id: 1, name: 'John Doe', email: 'john@example.com' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com' },
  ];

  return NextResponse.json({ 
    users,
    count: users.length,
    status: 'success'
  });
}

// POST endpoint to create a new user
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Basic validation
    if (!body.name || !body.email) {
      return NextResponse.json(
        { error: 'Name and email are required' },
        { status: 400 }
      );
    }

    // In a real app, you'd save to a database here
    const newUser = {
      id: Date.now(), // Simple ID generation
      name: body.name,
      email: body.email,
      createdAt: new Date().toISOString()
    };

    return NextResponse.json(
      { 
        message: 'User created successfully',
        user: newUser,
        status: 'success'
      },
      { status: 201 }
    );

  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid JSON data' },
      { status: 400 }
    );
  }
}