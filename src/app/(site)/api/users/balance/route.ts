import { NextResponse, type NextRequest } from 'next/server';
import { updateUserBalance } from '@/services/userService';

export async function POST(
  req: NextRequest,
) {
  try {
    const { userId, amount } = await req.json();

    if (!userId || typeof amount !== 'number') {
      return NextResponse.json({ error: 'Invalid request parameters' }, { status: 400 });
    }

    await updateUserBalance(userId, amount);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating balance:', error);
    return NextResponse.json({ error: 'Failed to update balance' }, { status: 500 });
  }
} 
