import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { generateContent, generateFullWebsite } from '@/lib/gemini';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { type, description, businessType, tone, fullWebsite } = body;

    if (!description) {
      return NextResponse.json(
        { error: 'Description is required' },
        { status: 400 }
      );
    }

    console.log('🤖 Generating AI content:', {
      type,
      description,
      businessType,
      tone,
      fullWebsite
    });

    let result;

    if (fullWebsite) {
      result = await generateFullWebsite(description, businessType, tone);
    } else {
      if (!type) {
        return NextResponse.json(
          { error: 'Type is required for single section generation' },
          { status: 400 }
        );
      }
      result = await generateContent({ type, description, businessType, tone });
    }

    return NextResponse.json({
      success: true,
      content: result
    });
  } catch (error) {
    console.error('❌ Content generation error:', error);
    return NextResponse.json(
      {
        error: 'Failed to generate content',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
