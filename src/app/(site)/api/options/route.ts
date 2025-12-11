import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { options } from '@/temp/option';

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // TODO: Replace with real options data when options functionality is fully implemented
    // Currently returning mock data to maintain existing functionality
    return NextResponse.json({ options }, { status: 200 });
  } catch (error) {
    if (error instanceof Error) {
      console.log("ERROR", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    } else {
      return NextResponse.json({ error: 'An unknown error occurred' }, { status: 500 });
    }
  }
}
