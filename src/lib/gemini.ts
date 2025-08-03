import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export interface ContentGenerationRequest {
  type: 'hero' | 'about' | 'products' | 'contact';
  description: string;
  businessType?: string;
  tone?: 'professional' | 'casual' | 'creative' | 'friendly';
}

export interface GeneratedContent {
  title?: string;
  subtitle?: string;
  text?: string;
  email?: string;
  products?: {
    name: string;
    description: string;
    price: number;
  }[];
}

export async function generateContent(
  request: ContentGenerationRequest
): Promise<GeneratedContent> {
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  let prompt = '';

  switch (request.type) {
    case 'hero':
      prompt = `Create a compelling hero section for a website. 
Business/Person: ${request.description}
Tone: ${request.tone || 'professional'}

Generate:
1. A catchy title (max 60 characters)
2. A subtitle that explains what they do (max 120 characters)

Format as JSON:
{
  "title": "Your title here",
  "subtitle": "Your subtitle here"
}`;
      break;

    case 'about':
      prompt = `Write an engaging "About" section for a website.
Business/Person: ${request.description}
Tone: ${request.tone || 'professional'}

Generate:
1. A section title (max 30 characters)
2. About text that tells their story (max 300 words)

Format as JSON:
{
  "title": "About section title",
  "text": "About text here..."
}`;
      break;

    case 'products':
      prompt = `Create product listings for a business.
Business: ${request.description}
Tone: ${request.tone || 'professional'}

Generate:
1. A products section title
2. 3-5 realistic products with names, descriptions, and prices

Format as JSON:
{
  "title": "Products section title",
  "products": [
    {
      "name": "Product name",
      "description": "Product description (max 100 chars)",
      "price": 99
    }
  ]
}`;
      break;

    case 'contact':
      prompt = `Create a contact section for a website.
Business/Person: ${request.description}
Tone: ${request.tone || 'professional'}

Generate:
1. A contact section title
2. Welcoming contact text (max 150 characters)

Format as JSON:
{
  "title": "Contact section title",
  "text": "Contact text here..."
}`;
      break;
  }

  try {
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const jsonStr = jsonMatch[0];
      return JSON.parse(jsonStr);
    }

    throw new Error('No valid JSON found in response');
  } catch (error) {
    console.error('Gemini API error:', error);
    throw new Error('Failed to generate content');
  }
}

export async function generateFullWebsite(
  description: string,
  businessType: string,
  tone: 'professional' | 'casual' | 'creative' | 'friendly' = 'professional'
) {
  try {
    const [hero, about, products, contact] = await Promise.all([
      generateContent({ type: 'hero', description, businessType, tone }),
      generateContent({ type: 'about', description, businessType, tone }),
      generateContent({ type: 'products', description, businessType, tone }),
      generateContent({ type: 'contact', description, businessType, tone })
    ]);

    return {
      hero,
      about,
      products,
      contact
    };
  } catch (error) {
    console.error('Error generating full website:', error);
    throw error;
  }
}
