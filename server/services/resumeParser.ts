import pdf from 'pdf-parse';

export interface ExtractedResumeData {
  rawText: string;
  experience: string[];
  skills: string[];
  achievements: string[];
  projects: string[];
}

export async function parseResume(buffer: Buffer): Promise<ExtractedResumeData> {
  try {
    console.log('Starting PDF parse...');
    const data = await pdf(buffer);
    const text = data.text;
    console.log('PDF parsed successfully, text length:', text.length);

    const lines = text.split('\n').filter(line => line.trim().length > 0);

    const experience: string[] = [];
    const skills: string[] = [];
    const achievements: string[] = [];
    const projects: string[] = [];
    let section = '';

    for (const line of lines) {
      const lower = line.toLowerCase();

      // Detect sections
      if (lower.includes('experience') || lower.includes('work history')) {
        section = 'experience';
        continue;
      } else if (lower.includes('skill') || lower.includes('technical')) {
        section = 'skills';
        continue;
      } else if (lower.includes('achievement') || lower.includes('accomplishment')) {
        section = 'achievements';
        continue;
      } else if (lower.includes('project')) {
        section = 'projects';
        continue;
      }

      // Add to appropriate section
      if (section === 'experience' && line.trim().length > 20) {
        experience.push(line.trim());
      } else if (section === 'skills' && line.trim().length > 2) {
        skills.push(line.trim());
      } else if (section === 'achievements' && line.trim().length > 10) {
        achievements.push(line.trim());
      } else if (section === 'projects' && line.trim().length > 10) {
        projects.push(line.trim());
      }
    }

    console.log('Extraction complete:', {
      experienceCount: experience.length,
      skillsCount: skills.length,
      achievementsCount: achievements.length,
      projectsCount: projects.length,
    });

    return {
      rawText: text,
      experience: experience.slice(0, 10),
      skills: skills.slice(0, 20),
      achievements: achievements.slice(0, 10),
      projects: projects.slice(0, 5),
    };
  } catch (error: any) {
    console.error('Error parsing PDF:', error);
    throw new Error(`Failed to parse resume: ${error.message}`);
  }
}
