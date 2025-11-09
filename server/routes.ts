import type { Express } from "express";
import multer from "multer";
import { storage } from "./storage.js";
import { parseResume } from "./services/resumeParser.js";
import { generateEmail } from "./services/emailGenerator.js";
import { researchProspect } from "./services/webScraper.js";

const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }
});

export function registerRoutes(app: Express) {
  
  // Health check
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  // Get all resumes
  app.get('/api/resumes', async (_req, res) => {
    try {
      const resumes = await storage.getResumes();
      res.json(resumes);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Upload resume
  app.post('/api/resumes', upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }

      console.log('Resume upload request received');
      console.log('File received:', {
        name: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype
      });

      const parsed = await parseResume(req.file.buffer);
      
      const resume = await storage.createResume({
        fileName: req.file.originalname,
        fileSize: req.file.size,
        rawText: parsed.rawText,
        experience: parsed.experience,
        skills: parsed.skills,
        achievements: parsed.achievements,
        projects: parsed.projects,
      });

      console.log('Resume saved with ID:', resume.id);
      res.json(resume);
    } catch (error: any) {
      console.error('Resume upload error:', error);
      res.status(500).json({ message: error.message });
    }
  });

  // Delete resume
  app.delete('/api/resumes/:id', async (req, res) => {
    try {
      await storage.deleteResume(req.params.id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Get all campaigns
  app.get('/api/campaigns', async (_req, res) => {
    try {
      const campaigns = await storage.getCampaigns();
      res.json(campaigns);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Create campaign
  app.post('/api/campaigns', async (req, res) => {
    try {
      const { resumeId, companyName, jobTitle, emailTone } = req.body;

      // Create or get company
      let company = await storage.getCompanyByName(companyName);
      if (!company) {
        company = await storage.createCompany({
          name: companyName,
          website: null,
          industry: null,
          description: null,
        });
      }

      const campaign = await storage.createCampaign({
        resumeId,
        companyId: company.id,
        jobTitle,
        status: 'draft',
        emailTone: emailTone || {
          formality: 0,
          energy: 0,
          humor: 0,
          preset: 'balanced'
        },
      });

      res.json(campaign);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Generate emails for campaign
  app.post('/api/campaigns/:id/generate-emails', async (req, res) => {
    try {
      const { id } = req.params;
      const { prospects } = req.body;

      const campaign = await storage.getCampaign(id);
      if (!campaign) {
        return res.status(404).json({ message: 'Campaign not found' });
      }

      const resume = await storage.getResume(campaign.resumeId);
      const company = await storage.getCompany(campaign.companyId);

      const generatedEmails = [];

      for (const prospectData of prospects) {
        // Create prospect
        const prospect = await storage.createProspect({
          campaignId: id,
          name: prospectData.name,
          email: prospectData.email,
          title: prospectData.title,
          linkedinUrl: prospectData.linkedinUrl,
          researchData: {},
        });

        // Research prospect
        const research = await researchProspect(prospect.name, company.name);
        await storage.updateProspect(prospect.id, { researchData: research });

        // Generate email
        const emailContent = await generateEmail({
          prospectName: prospect.name,
          prospectTitle: prospect.title || '',
          companyName: company.name,
          jobTitle: campaign.jobTitle,
          resumeData: {
            experience: resume.experience,
            skills: resume.skills,
            achievements: resume.achievements,
            projects: resume.projects,
          },
          researchData: research,
          tone: campaign.emailTone || { formality: 0, energy: 0, humor: 0 },
        });

        const email = await storage.createEmail({
          prospectId: prospect.id,
          campaignId: id,
          subject: emailContent.subject,
          body: emailContent.body,
          status: 'draft',
        });

        generatedEmails.push({ prospect, email });
      }

      res.json({ emails: generatedEmails });
    } catch (error: any) {
      console.error('Email generation error:', error);
      res.status(500).json({ message: error.message });
    }
  });

  // Get campaign emails
  app.get('/api/campaigns/:id/emails', async (req, res) => {
    try {
      const emails = await storage.getCampaignEmails(req.params.id);
      res.json(emails);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
}
