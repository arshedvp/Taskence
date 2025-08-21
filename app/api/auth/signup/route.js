import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectToDatabase from '@/utils/db';
import User from '@/models/User';

export const runtime = 'nodejs';

export async function POST(request) {
  try {
    const { username, password } = await request.json();

    console.log('Signup attempt for username:', username);

    if (!username || !password) {
      console.log('Missing username or password');
      return NextResponse.json({ error: 'Username and password are required' }, { status: 400 });
    }

    console.log('Connecting to database...');
    await connectToDatabase();
    console.log('Database connected');

    // Check if username exists
    console.log('Checking for existing user...');
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      console.log('User already exists:', username);
      return NextResponse.json({ error: 'Username already exists' }, { status: 409 });
    }

    console.log('Creating password hash...');
    const passwordHash = await bcrypt.hash(password, 12);

    console.log('Creating new user...');
    // Create user
    const newUser = new User({ username, passwordHash });
    await newUser.save();
    console.log('User created successfully:', username);

    return NextResponse.json({ message: 'User created successfully!' }, { status: 201 });
  } catch (error) {
    console.error('Signup error:', error);
    console.error('Error stack:', error.stack);
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}
