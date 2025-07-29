import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Basic health check
    console.log('Upload API called');

    const data = await request.formData();
    const file: File | null = data.get('image') as unknown as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No image file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPEG, PNG, and WebP are allowed.' },
        { status: 400 }
      );
    }

    // Strict file size limit for Vercel (1MB)
    if (file.size > 5000000) {
      return NextResponse.json(
        { error: 'File size too large. Maximum size is 1MB for production.' },
        { status: 400 }
      );
    }

    // Convert to base64 with error handling
    let dataUrl: string;
    try {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const base64 = buffer.toString('base64');
      dataUrl = `data:${file.type};base64,${base64}`;
    } catch (conversionError) {
      console.error('Base64 conversion failed:', conversionError);
      return NextResponse.json(
        { error: 'Failed to process image' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      imageUrl: dataUrl,
      success: true
    });
  } catch (error) {
    console.error('Upload API error:', error);

    // Return a more specific error message
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown server error';

    return NextResponse.json(
      {
        error: 'Server error during upload',
        details: errorMessage
      },
      { status: 500 }
    );
  }
}
