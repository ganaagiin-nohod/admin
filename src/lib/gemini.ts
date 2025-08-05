import { GoogleGenerativeAI } from '@google/generative-ai';
import { JobStatus } from '@/models/JobApplication';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export interface EmailAnalysis {
  isJobRelated: boolean;
  company?: string;
  position?: string;
  status?: JobStatus;
  confidence: number;
  extractedInfo: {
    interviewDate?: string;
    salary?: {
      min?: number;
      max?: number;
      currency?: string;
    };
    location?: string;
    contactEmail?: string;
    nextSteps?: string;
  };
  summary: string;
}

export async function analyzeJobEmail(
  subject: string,
  from: string,
  body: string,
  snippet: string
): Promise<EmailAnalysis> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `
Analyze this email to determine if it's job application related and extract relevant information.

Email Details:
Subject: ${subject}
From: ${from}
Body: ${body}
Snippet: ${snippet}

Please analyze and return a JSON response with the following structure:
{
  "isJobRelated": boolean,
  "company": "string (if identifiable)",
  "position": "string (if mentioned)",
  "status": "one of: applied, screening, interview, offer, rejected, withdrawn",
  "confidence": number (0-1),
  "extractedInfo": {
    "interviewDate": "ISO date string if interview mentioned",
    "salary": {
      "min": number,
      "max": number,
      "currency": "string"
    },
    "location": "string if mentioned",
    "contactEmail": "string if different from sender",
    "nextSteps": "string describing what to do next"
  },
  "summary": "brief summary of the email content"
}

Guidelines:
- Set isJobRelated to true only if this is clearly about a job application, interview, or hiring process
- Determine status based on email content:
  - "applied": confirmation of application submission
  - "screening": phone/initial screening invitation
  - "interview": interview invitation or scheduling
  - "offer": job offer or offer-related communication
  - "rejected": rejection notification
  - "withdrawn": if candidate withdrew or position was cancelled
- Extract salary information if mentioned (look for numbers with currency symbols or salary ranges)
- Extract interview dates if mentioned
- Set confidence based on how certain you are about the analysis
- Provide a brief, helpful summary

Return only valid JSON, no additional text.
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    let cleanedText = text.trim();

    if (cleanedText.startsWith('```json')) {
      cleanedText = cleanedText
        .replace(/^```json\s*/, '')
        .replace(/\s*```$/, '');
    } else if (cleanedText.startsWith('```')) {
      cleanedText = cleanedText.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }

    try {
      const analysis: EmailAnalysis = JSON.parse(cleanedText);

      return {
        isJobRelated: Boolean(analysis.isJobRelated),
        company: analysis.company?.trim() || undefined,
        position: analysis.position?.trim() || undefined,
        status:
          analysis.status &&
          Object.values(JobStatus).includes(analysis.status as JobStatus)
            ? (analysis.status as JobStatus)
            : undefined,
        confidence: Math.max(0, Math.min(1, Number(analysis.confidence) || 0)),
        extractedInfo: {
          interviewDate: analysis.extractedInfo?.interviewDate || undefined,
          salary: analysis.extractedInfo?.salary || undefined,
          location: analysis.extractedInfo?.location?.trim() || undefined,
          contactEmail:
            analysis.extractedInfo?.contactEmail?.trim() || undefined,
          nextSteps: analysis.extractedInfo?.nextSteps?.trim() || undefined
        },
        summary: analysis.summary?.trim() || 'No summary available'
      };
    } catch (parseError) {
      console.error('Error parsing Gemini response:', parseError);
      console.error('Raw response:', text);
      console.error('Cleaned response:', cleanedText);

      return {
        isJobRelated: false,
        confidence: 0,
        extractedInfo: {},
        summary: 'Failed to analyze email content'
      };
    }
  } catch (error) {
    console.error('Error analyzing email with Gemini:', error);

    return {
      isJobRelated: false,
      confidence: 0,
      extractedInfo: {},
      summary: 'Error occurred during email analysis'
    };
  }
}

export async function generateJobInsights(
  jobApplications: any[]
): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const jobSummary = jobApplications.map((job) => ({
      company: job.company,
      position: job.position,
      status: job.status,
      applicationDate: job.applicationDate,
      priority: job.priority
    }));

    const prompt = `
Analyze these job applications and provide insights and recommendations:

Job Applications:
${JSON.stringify(jobSummary, null, 2)}

Please provide:
1. Overall application status summary
2. Success rate analysis
3. Recommendations for improving job search strategy
4. Patterns in applications (industries, positions, etc.)
5. Next steps suggestions

Keep the response concise and actionable, around 200-300 words.
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error generating job insights:', error);
    return 'Unable to generate insights at this time. Please try again later.';
  }
}

export async function suggestApplicationImprovements(
  company: string,
  position: string,
  currentNotes?: string
): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `
Provide suggestions for improving a job application for:
Company: ${company}
Position: ${position}
Current Notes: ${currentNotes || 'None'}

Please suggest:
1. Research points about the company
2. Key skills to highlight for this position
3. Questions to ask during interviews
4. Follow-up strategies
5. Application materials to prepare

Keep suggestions specific and actionable, around 150-200 words.
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error generating application suggestions:', error);
    return 'Unable to generate suggestions at this time. Please try again later.';
  }
}

export interface ContentGenerationParams {
  type: string;
  description: string;
  businessType?: string;
  tone?: string;
}

export async function generateContent(
  params: ContentGenerationParams
): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const { type, description, businessType, tone } = params;

    const prompt = `
Generate ${type} content for a website with the following requirements:

Description: ${description}
Business Type: ${businessType || 'General'}
Tone: ${tone || 'Professional'}

Please create engaging, high-quality content that:
1. Matches the specified tone and business type
2. Is relevant to the description provided
3. Is well-structured and readable
4. Includes appropriate calls-to-action if relevant
5. Is optimized for web presentation

Return only the content, no additional formatting or explanations.
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error generating content:', error);
    return 'Unable to generate content at this time. Please try again later.';
  }
}

export async function generateFullWebsite(
  description: string,
  businessType?: string,
  tone?: string
): Promise<{
  hero: string;
  about: string;
  services: string;
  contact: string;
  footer: string;
}> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `
Generate complete website content for a business with the following details:

Description: ${description}
Business Type: ${businessType || 'General'}
Tone: ${tone || 'Professional'}

Please create content for the following sections and return as JSON:
{
  "hero": "Hero section with compelling headline and description",
  "about": "About section describing the business",
  "services": "Services or products offered",
  "contact": "Contact information and call-to-action",
  "footer": "Footer content with additional information"
}

Guidelines:
- Make content engaging and relevant to the business type
- Use the specified tone throughout
- Include appropriate calls-to-action
- Keep sections concise but informative
- Ensure content flows well together

Return only valid JSON, no additional text.
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    let cleanedText = text.trim();
    if (cleanedText.startsWith('```json')) {
      cleanedText = cleanedText
        .replace(/^```json\s*/, '')
        .replace(/\s*```$/, '');
    } else if (cleanedText.startsWith('```')) {
      cleanedText = cleanedText.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }

    try {
      const websiteContent = JSON.parse(cleanedText);
      return {
        hero: websiteContent.hero || 'Welcome to our website',
        about: websiteContent.about || 'About our company',
        services: websiteContent.services || 'Our services',
        contact: websiteContent.contact || 'Contact us',
        footer: websiteContent.footer || 'Footer information'
      };
    } catch (parseError) {
      console.error('Error parsing website content:', parseError);
      return {
        hero: 'Welcome to our website',
        about: 'About our company',
        services: 'Our services',
        contact: 'Contact us',
        footer: 'Footer information'
      };
    }
  } catch (error) {
    console.error('Error generating full website:', error);
    return {
      hero: 'Welcome to our website',
      about: 'About our company',
      services: 'Our services',
      contact: 'Contact us',
      footer: 'Footer information'
    };
  }
}
