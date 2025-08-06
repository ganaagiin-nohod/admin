import { GoogleGenerativeAI } from '@google/generative-ai';
import { IChallenge, ILogEntry } from '@/models/DailyLog';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export interface DaySummaryParams {
  challenges: IChallenge[];
  entries: ILogEntry[];
  date: Date;
}

export async function generateDaySummary({
  challenges,
  entries,
  date
}: DaySummaryParams): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const completedChallenges = challenges.filter((c) => c.completed);
    const incompleteChallenges = challenges.filter((c) => !c.completed);

    const prompt = `
You're helping someone reflect on their day. Here's what happened on ${date.toDateString()}:

CHALLENGES SET:
${challenges.map((c) => `- ${c.text} ${c.completed ? '✅ COMPLETED' : '❌ NOT COMPLETED'}`).join('\n')}

DAILY ENTRIES:
${entries
  .map((entry) => {
    const time = entry.timestamp.toLocaleTimeString();
    return `[${time}] ${entry.type.toUpperCase()}: ${entry.content}`;
  })
  .join('\n')}

STATS:
- Completed: ${completedChallenges.length}/${challenges.length} challenges
- Total entries: ${entries.length}

Create a thoughtful, encouraging daily reflection that:
1. Celebrates what was accomplished
2. Acknowledges the journey and effort
3. Draws insights from the entries
4. Offers gentle motivation for incomplete challenges
5. Highlights patterns or growth moments

Keep it personal, authentic, and around 150-200 words. Write in second person ("you") as if speaking directly to them.
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error generating day summary:', error);
    return `Reflecting on ${date.toDateString()}: You set ${challenges.length} challenges and completed ${challenges.filter((c) => c.completed).length} of them. Every step forward counts, and your ${entries.length} entries throughout the day show your commitment to growth. Keep pushing forward! 🔥`;
  }
}

export async function suggestChallenges(
  previousChallenges?: string[]
): Promise<string[]> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `
Suggest 5 daily challenges for personal growth and productivity. 

${
  previousChallenges
    ? `Previous challenges to avoid repeating:
${previousChallenges.map((c) => `- ${c}`).join('\n')}`
    : ''
}

Create challenges that are:
- Specific and actionable
- Achievable in one day
- Focused on different areas (productivity, health, learning, creativity, relationships)
- Motivating and engaging

Return as a JSON array of strings, no additional text:
["challenge 1", "challenge 2", "challenge 3", "challenge 4", "challenge 5"]
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text().trim();

    if (text.startsWith('```json')) {
      text = text.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (text.startsWith('```')) {
      text = text.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }

    try {
      const suggestions = JSON.parse(text);
      return Array.isArray(suggestions) ? suggestions : [];
    } catch (parseError) {
      console.error('Error parsing challenge suggestions:', parseError);
      return [
        'Complete one important task before checking social media',
        'Take a 15-minute walk outside',
        'Learn something new for 30 minutes',
        'Connect with someone you care about',
        'Do one thing that scares you a little'
      ];
    }
  } catch (error) {
    console.error('Error generating challenge suggestions:', error);
    return [
      'Complete one important task before checking social media',
      'Take a 15-minute walk outside',
      'Learn something new for 30 minutes',
      'Connect with someone you care about',
      'Do one thing that scares you a little'
    ];
  }
}
