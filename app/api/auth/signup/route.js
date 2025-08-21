import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectToDatabase from '@/utils/db';
import User from '@/models/User';

export const runtime = 'nodejs';

export async function POST(request) {
  try {
    console.log('=== SIGNUP ATTEMPT START ===');
    
    // Test 1: Basic request parsing
    let body;
    try {
      body = await request.json();
      console.log('✓ Request body parsed:', { username: body.username, hasPassword: !!body.password });
    } catch (e) {
      console.log('✗ Request parsing failed:', e.message);
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const { username, password } = body;

    if (!username || !password) {
      console.log('✗ Missing credentials');
      return NextResponse.json({ error: 'Username and password are required' }, { status: 400 });
    }

    // Test 2: Environment variables
    console.log('✓ Environment check:');
    console.log('  - MONGODB_URI:', process.env.MONGODB_URI ? 'EXISTS' : 'MISSING');
    console.log('  - NODE_ENV:', process.env.NODE_ENV);

    if (!process.env.MONGODB_URI) {
      console.log('✗ MONGODB_URI missing');
      return NextResponse.json({ error: 'Database configuration missing' }, { status: 500 });
    }

    // Test 3: Database connection
    try {
      console.log('→ Attempting database connection...');
      await connectToDatabase();
      console.log('✓ Database connected successfully');
    } catch (e) {
      console.log('✗ Database connection failed:', e.message);
      return NextResponse.json({ error: 'Database connection failed', details: e.message }, { status: 500 });
    }

    // Test 4: User lookup
    try {
      console.log('→ Checking for existing user...');
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        console.log('✗ User already exists:', username);
        return NextResponse.json({ error: 'Username already exists' }, { status: 409 });
      }
      console.log('✓ Username available');
    } catch (e) {
      console.log('✗ User lookup failed:', e.message);
      return NextResponse.json({ error: 'User lookup failed', details: e.message }, { status: 500 });
    }

    // Test 5: Password hashing
    let passwordHash;
    try {
      console.log('→ Creating password hash...');
      passwordHash = await bcrypt.hash(password, 12);
      console.log('✓ Password hash created');
    } catch (e) {
      console.log('✗ Password hashing failed:', e.message);
      return NextResponse.json({ error: 'Password hashing failed', details: e.message }, { status: 500 });
    }

    // Test 6: User creation
    try {
      console.log('→ Creating new user...');
      const newUser = new User({ username, passwordHash });
      await newUser.save();
      console.log('✓ User created successfully:', username);
    } catch (e) {
      console.log('✗ User creation failed:', e.message);
      return NextResponse.json({ error: 'User creation failed', details: e.message }, { status: 500 });
    }

    console.log('=== SIGNUP SUCCESS ===');
    return NextResponse.json({ message: 'User created successfully!' }, { status: 201 });

  } catch (error) {
    console.log('=== SIGNUP CRITICAL ERROR ===');
    console.error('Unexpected error:', error);
    console.error('Error stack:', error.stack);
    return NextResponse.json({ 
      error: 'Internal Server Error', 
      details: error.message,
      type: error.constructor.name 
    }, { status: 500 });
  }
}
