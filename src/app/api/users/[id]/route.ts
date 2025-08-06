import { NextRequest, NextResponse } from 'next/server';

// GET endpoint to fetch a specific user by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  // Mock user data - in a real app, you'd fetch from a database
  const mockUsers = {
    '1': { id: 1, name: 'John Doe', email: 'john@example.com' },
    '2': { id: 2, name: 'Jane Smith', email: 'jane@example.com' },
  };

  const user = mockUsers[id as keyof typeof mockUsers];

  if (!user) {
    return NextResponse.json(
      { error: 'User not found' },
      { status: 404 }
    );
  }

  return NextResponse.json({ 
    user,
    status: 'success'
  });
}

// PUT endpoint to update a specific user
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();

    // Basic validation
    if (!body.name || !body.email) {
      return NextResponse.json(
        { error: 'Name and email are required' },
        { status: 400 }
      );
    }

    // In a real app, you'd update the database here
    const updatedUser = {
      id: parseInt(id),
      name: body.name,
      email: body.email,
      updatedAt: new Date().toISOString()
    };

    return NextResponse.json(
      { 
        message: 'User updated successfully',
        user: updatedUser,
        status: 'success'
      }
    );

  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid JSON data' },
      { status: 400 }
    );
  }
}

// DELETE endpoint to delete a specific user
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  // In a real app, you'd delete from the database here
  return NextResponse.json(
    { 
      message: `User ${id} deleted successfully`,
      status: 'success'
    }
  );
}