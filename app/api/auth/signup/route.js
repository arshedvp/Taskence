import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectToDatabase from '@/utils/db';
import User from '@/models/User';

export const runtime = 'nodejs';

export async function POST(request) {
  console.log('=== SIGNUP ATTEMPT START ===');
  
  try {
    // Test 1: Basic request parsing
    let body;
    try {
      body = await request.json();
      console.log('✓ Request parsed successfully');
    } catch (e) {
      console.log('✗ Request parsing failed:', e.message);
      return NextResponse.json({ error: 'Invalid request body', details: e.message }, { status: 400 });
    }

    const { username, password, confirmPassword } = body;
    console.log('Username:', username, 'Has password:', !!password);

    if (!username || !password) {
      console.log('✗ Missing credentials');
      return NextResponse.json({ error: 'Username and password are required' }, { status: 400 });
    }
    if (password !== confirmPassword) {
      console.log('✗ Passwords do not match');
      return NextResponse.json({ error: 'Passwords do not match' }, { status: 400 });
    }

    // Test 2: Environment variables check
    console.log('=== ENVIRONMENT CHECK ===');
    console.log('MONGODB_URI exists:', !!process.env.MONGODB_URI);
    console.log('MONGODB_URI prefix:', process.env.MONGODB_URI?.substring(0, 20));
    console.log('Node version:', process.version);

    if (!process.env.MONGODB_URI) {
      console.log('✗ MONGODB_URI missing completely');
      return NextResponse.json({ error: 'Database configuration missing' }, { status: 500 });
    }

    // Test 3: Import check
    console.log('=== IMPORT CHECK ===');
    console.log('connectToDatabase type:', typeof connectToDatabase);
    console.log('User model type:', typeof User);
    console.log('bcrypt type:', typeof bcrypt);

    // Test 4: Database connection
    console.log('=== DATABASE CONNECTION ===');
    try {
      console.log('→ Attempting database connection...');
      const dbConnection = await connectToDatabase();
      console.log('✓ Database connected successfully');
      console.log('Connection state:', dbConnection?.connection?.readyState);
    } catch (e) {
      console.log('✗ Database connection failed:', e.message);
      console.log('Error stack:', e.stack);
      return NextResponse.json({ 
        error: 'Database connection failed', 
        details: e.message,
        mongoUri: process.env.MONGODB_URI?.substring(0, 30) + '...'
      }, { status: 500 });
    }

    // Test 5: User lookup
    console.log('=== USER LOOKUP ===');
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
      console.log('Error stack:', e.stack);
      return NextResponse.json({ error: 'User lookup failed', details: e.message }, { status: 500 });
    }

    // Test 6: Password hashing
    console.log('=== PASSWORD HASHING ===');
    let passwordHash;
    try {
      console.log('→ Creating password hash...');
      passwordHash = await bcrypt.hash(password, 12);
      console.log('✓ Password hash created successfully');
    } catch (e) {
      console.log('✗ Password hashing failed:', e.message);
      return NextResponse.json({ error: 'Password hashing failed', details: e.message }, { status: 500 });
    }

    // Test 7: User creation
    console.log('=== USER CREATION ===');
    try {
      console.log('→ Creating new user...');
      const newUser = new User({ username, passwordHash });
      console.log('→ Saving user to database...');
      const savedUser = await newUser.save();
      console.log('✓ User created successfully:', username);
      console.log('User ID:', savedUser._id);
    } catch (e) {
      console.log('✗ User creation failed:', e.message);
      console.log('Error stack:', e.stack);
      return NextResponse.json({ error: 'User creation failed', details: e.message }, { status: 500 });
    }

    console.log('=== SIGNUP COMPLETE SUCCESS ===');
    return NextResponse.json({ 
      message: 'User created successfully!',
      username: username,
      timestamp: new Date().toISOString()
    }, { status: 201 });

  } catch (error) {
    console.log('=== CRITICAL SIGNUP ERROR ===');
    console.error('Unexpected error:', error.message);
    console.error('Error type:', error.constructor.name);
    console.error('Full error:', error);
    console.error('Stack trace:', error.stack);
    
    return NextResponse.json({ 
      error: 'Internal Server Error', 
      details: error.message,
      type: error.constructor.name,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
