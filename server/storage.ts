import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as schema from '../shared/schema.js';
import { eq } from 'drizzle-orm';

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql, { schema });

export const storage = {
  // Resumes
  async getResumes() {
    return db.select().from(schema.resumes).orderBy(schema.resumes.uploadedAt);
  },

  async getResume(id: string) {
    const [resume] = await db.select().from(schema.resumes).where(eq(schema.resumes.id, id));
    return resume;
  },

  async createResume(data: schema.InsertResume) {
    const [resume] = await db.insert(schema.resumes).values(data).returning();
    return resume;
  },

  async deleteResume(id: string) {
    await db.delete(schema.resumes).where(eq(schema.resumes.id, id));
  },

  // Companies
  async getCompanyByName(name: string) {
    const [company] = await db.select().from(schema.companies).where(eq(schema.companies.name, name));
    return company;
  },

  async getCompany(id: string) {
    const [company] = await db.select().from(schema.companies).where(eq(schema.companies.id, id));
    return company;
  },

  async createCompany(data: schema.InsertCompany) {
    const [company] = await db.insert(schema.companies).values(data).returning();
    return company;
  },

  // Campaigns
  async getCampaigns() {
    return db.select().from(schema.campaigns).orderBy(schema.campaigns.createdAt);
  },

  async getCampaign(id: string) {
    const [campaign] = await db.select().from(schema.campaigns).where(eq(schema.campaigns.id, id));
    return campaign;
  },

  async createCampaign(data: schema.InsertCampaign) {
    const [campaign] = await db.insert(schema.campaigns).values(data).returning();
    return campaign;
  },

  // Prospects
  async createProspect(data: schema.InsertProspect) {
    const [prospect] = await db.insert(schema.prospects).values(data).returning();
    return prospect;
  },

  async updateProspect(id: string, data: Partial<schema.InsertProspect>) {
    const [prospect] = await db.update(schema.prospects).set(data).where(eq(schema.prospects.id, id)).returning();
    return prospect;
  },

  // Emails
  async createEmail(data: schema.InsertEmail) {
    const [email] = await db.insert(schema.emails).values(data).returning();
    return email;
  },

  async getCampaignEmails(campaignId: string) {
    return db.select().from(schema.emails).where(eq(schema.emails.campaignId, campaignId));
  },
};
