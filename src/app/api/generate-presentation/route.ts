import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export interface PresentationSlide {
  id: string;
  title: string;
  content: string;
  backgroundColor: string;
  layout: 'title' | 'content' | 'image-left' | 'image-right' | 'image-center';
}

export async function POST(request: NextRequest) {
  let topic: string = '';
  let audience: string = '';
  let slideCount: number = 5;
  let tone: string = 'professional';
  let presentationType: string = 'informational';

  try {
    const requestData = await request.json();
    ({ topic, audience, slideCount, tone, presentationType } = requestData);

    console.log('Received request:', {
      topic,
      audience,
      slideCount,
      tone,
      presentationType
    });

    if (!topic) {
      return NextResponse.json(
        { success: false, error: 'Topic is required' },
        { status: 400 }
      );
    }

    if (!process.env.GEMINI_API_KEY) {
      console.error('GEMINI_API_KEY not found in environment variables');
      return NextResponse.json(
        { success: false, error: 'API key not configured' },
        { status: 500 }
      );
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `Create a ${slideCount || 5}-slide presentation about "${topic}" for ${audience || 'general audience'} in a ${tone || 'professional'} tone.

Return ONLY a JSON array with this exact structure:
[
  {
    "id": "1",
    "title": "Presentation Title",
    "content": "Brief engaging content for this slide",
    "backgroundColor": "bg-gradient-to-br from-blue-600 to-purple-700",
    "layout": "title"
  },
  {
    "id": "2", 
    "title": "Second Slide Title",
    "content": "Content for the second slide",
    "backgroundColor": "bg-gradient-to-br from-green-500 to-teal-600",
    "layout": "content"
  }
]

Use these exact background values:
- "bg-gradient-to-br from-blue-600 to-purple-700"
- "bg-gradient-to-br from-green-500 to-teal-600"  
- "bg-gradient-to-br from-red-500 to-pink-600"
- "bg-gradient-to-br from-yellow-500 to-orange-600"
- "bg-gradient-to-br from-indigo-600 to-blue-800"

Use these exact layout values: "title", "content", "image-left", "image-right", "image-center"

Make the first slide layout "title" and vary the others. Keep content under 100 words per slide.`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    console.log('Raw Gemini response:', text);

    let cleanedText = text.trim();

    cleanedText = cleanedText
      .replace(/```json\s*/gi, '')
      .replace(/```\s*/g, '');

    let jsonMatch = cleanedText.match(/\[\s*\{[\s\S]*?\}\s*\]/);

    if (!jsonMatch) {
      jsonMatch = cleanedText.match(/(\[[\s\S]*\])/);
    }

    if (!jsonMatch) {
      console.error(
        'No JSON array found in response:',
        cleanedText.substring(0, 500)
      );
      throw new Error('No valid JSON array found in response');
    }

    let slides: PresentationSlide[];
    try {
      const jsonString = jsonMatch[0];
      console.log(
        'Attempting to parse JSON:',
        jsonString.substring(0, 200) + '...'
      );

      slides = JSON.parse(jsonString) as PresentationSlide[];

      if (!Array.isArray(slides) || slides.length === 0) {
        throw new Error('Parsed result is not a valid array of slides');
      }
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      console.error('Attempted to parse:', jsonMatch[0].substring(0, 500));

      slides = Array.from({ length: slideCount || 5 }, (_, index) => ({
        id: (index + 1).toString(),
        title: index === 0 ? topic : `${topic} - Point ${index}`,
        content:
          index === 0
            ? `Welcome to this presentation about ${topic}. This content was generated as a fallback due to parsing issues.`
            : `This is slide ${index + 1} about ${topic}. Content will be added here.`,
        backgroundColor: [
          'bg-gradient-to-br from-blue-600 to-purple-700',
          'bg-gradient-to-br from-green-500 to-teal-600',
          'bg-gradient-to-br from-red-500 to-pink-600',
          'bg-gradient-to-br from-yellow-500 to-orange-600',
          'bg-gradient-to-br from-indigo-600 to-blue-800'
        ][index % 5],
        layout: index === 0 ? 'title' : 'content'
      }));
    }

    const validatedSlides = slides.map((slide, index) => ({
      id: slide.id || (index + 1).toString(),
      title: slide.title || `Slide ${index + 1}`,
      content: slide.content || 'Content will be added here.',
      backgroundColor:
        slide.backgroundColor ||
        'bg-gradient-to-br from-blue-600 to-purple-700',
      layout: slide.layout || 'content'
    }));

    return NextResponse.json({
      success: true,
      slides: validatedSlides,
      metadata: {
        topic,
        audience,
        slideCount: validatedSlides.length,
        tone,
        presentationType
      }
    });
  } catch (error) {
    console.error('Presentation generation error:', error);

    const fallbackSlides = Array.from(
      { length: slideCount || 5 },
      (_, index) => ({
        id: (index + 1).toString(),
        title: index === 0 ? topic : `${topic} - Section ${index}`,
        content:
          index === 0
            ? `Welcome to this presentation about ${topic}. This is a fallback presentation due to generation issues.`
            : `This section covers important aspects of ${topic}. Please edit this content to add your specific information.`,
        backgroundColor: [
          'bg-gradient-to-br from-blue-600 to-purple-700',
          'bg-gradient-to-br from-green-500 to-teal-600',
          'bg-gradient-to-br from-red-500 to-pink-600',
          'bg-gradient-to-br from-yellow-500 to-orange-600',
          'bg-gradient-to-br from-indigo-600 to-blue-800'
        ][index % 5],
        layout: index === 0 ? ('title' as const) : ('content' as const)
      })
    );

    return NextResponse.json({
      success: true,
      slides: fallbackSlides,
      metadata: {
        topic,
        audience,
        slideCount: fallbackSlides.length,
        tone,
        presentationType,
        fallback: true
      },
      warning:
        'Generated fallback presentation due to AI processing issues. Please edit the content.'
    });
  }
}
