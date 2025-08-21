import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function GET() {
  try {
    // Test basic functionality
    const testData = {
      nodeVersion: process.version,
      environment: process.env.NODE_ENV,
      hasMongoUri: !!process.env.MONGODB_URI,
      mongoUriStart: process.env.MONGODB_URI ? process.env.MONGODB_URI.substring(0, 20) + '...' : 'MISSING',
      timestamp: new Date().toISOString()
    };
    
    return NextResponse.json({ 
      status: 'ok',
      message: 'Test endpoint working',
      data: testData 
    });
  } catch (error) {
    return NextResponse.json({ 
      status: 'error',
      error: error.message,
      stack: error.stack 
    }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    
    return NextResponse.json({ 
      status: 'ok',
      message: 'POST test working',
      receivedData: body,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json({ 
      status: 'error',
      error: error.message,
      stack: error.stack 
    }, { status: 500 });
  }
}
