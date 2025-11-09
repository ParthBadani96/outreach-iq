import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface ToneSettings {
  formality: number; // -1 (informal) to 1 (formal)
  energy: number;    // -1 (subdued) to 1 (high energy)
  humor: number;     // -1 (none) to 1 (playful)
  preset?: string;
}

interface EmailGenerationInput {
  prospectName: string;
  prospectTitle: string;
  companyName: string;
  jobTitle: string;
  resumeData: {
    experience: string[];
    skills: string[];
    achievements: string[];
    projects: string[];
  };
  researchData: {
    linkedinActivity?: string[];
    companyNews?: string[];
    githubActivity?: string[];
    hobbies?: string[];
  };
  tone: ToneSettings;
}

function getToneInstructions(tone: ToneSettings): string {
  const { formality, energy, humor } = tone;
  
  let instructions = '';
  
  // Formality
  if (formality < -0.3) {
    instructions += 'Write very casually - use contractions, casual language, be conversational. ';
  } else if (formality > 0.3) {
    instructions += 'Write professionally and formally, but not stiff. ';
  } else {
    instructions += 'Write in a balanced, professional yet friendly tone. ';
  }
  
  // Energy
  if (energy < -0.3) {
    instructions += 'Keep it calm and thoughtful. ';
  } else if (energy > 0.3) {
    instructions += 'Be enthusiastic and energetic! ';
  } else {
    instructions += 'Be engaged but measured. ';
  }
  
  // Humor
  if (humor < -0.3) {
    instructions += 'Stay serious and straightforward. ';
  } else if (humor > 0.3) {
    instructions += 'Add some wit and playfulness where appropriate. ';
  } else {
    instructions += 'Keep it professional with subtle warmth. ';
  }
  
  return instructions;
}

export async function generateEmail(input: EmailGenerationInput): Promise<{
  subject: string;
  body: string;
}> {
  const toneInstructions = getToneInstructions(input.tone);
  
  const prompt = `You are writing a cold outreach email for a job application.

CONTEXT:
- Prospect: ${input.prospectName}, ${input.prospectTitle} at ${input.companyName}
- Job: ${input.jobTitle}
- Your experience: ${input.resumeData.experience.slice(0, 3).join('; ')}
- Your skills: ${input.resumeData.skills.slice(0, 5).join(', ')}
- Research findings: ${JSON.stringify(input.researchData)}

TONE INSTRUCTIONS:
${toneInstructions}

REQUIREMENTS:
1. Subject line: Make it creative, specific, and attention-grabbing (NOT generic)
2. Email body: 150-200 words MAX
3. Reference specific research findings naturally
4. Show genuine interest in their work
5. One clear CTA at the end
6. NO generic phrases like "I hope this email finds you well"
7. Make it sound HUMAN - like you're texting a colleague you respect
8. Use the person's name naturally in conversation

Generate the email in this JSON format:
{
  "subject": "your creative subject line",
  "body": "the email body"
}`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.9,
      max_tokens: 500,
    });

    const content = completion.choices[0].message.content || '{}';
    const parsed = JSON.parse(content);

    return {
      subject: parsed.subject || 'Quick question about the role',
      body: parsed.body || 'Email generation failed',
    };
  } catch (error: any) {
    console.error('Email generation error:', error);
    throw new Error(`Failed to generate email: ${error.message}`);
  }
}
