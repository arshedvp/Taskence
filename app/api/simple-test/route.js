import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function POST(request) {
  try {
    console.log('=== SIMPLE SIGNUP TEST ===');
    
    // Just return environment status first
    const envStatus = {
      hasMongoUri: !!process.env.MONGODB_URI,
      mongoPrefix: process.env.MONGODB_URI?.substring(0, 15) || 'MISSING',
      hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET,
      nodeVersion: process.version,
      timestamp: new Date().toISOString()
    };
    
    console.log('Environment check:', envStatus);
    
    return NextResponse.json({
      status: 'test_success',
      message: 'Simple test endpoint working',
      env: envStatus
    }, { status: 200 });
    
  } catch (error) {
    console.error('Simple test failed:', error);
    return NextResponse.json({
      status: 'test_failed',
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}
