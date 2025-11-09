import { pgTable, text, varchar, timestamp, integer, boolean, jsonb } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export const resumes = pgTable('resumes', {
  id: varchar('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  fileName: text('file_name').notNull(),
  fileSize: integer('file_size').notNull(),
  rawText: text('raw_text').notNull(),
  experience: jsonb('experience').$type<string[]>().notNull(),
  skills: jsonb('skills').$type<string[]>().notNull(),
  achievements: jsonb('achievements').$type<string[]>().notNull(),
  projects: jsonb('projects').$type<string[]>().notNull(),
  uploadedAt: timestamp('uploaded_at').defaultNow().notNull(),
});

export const companies = pgTable('companies', {
  id: varchar('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text('name').notNull(),
  website: text('website'),
  industry: text('industry'),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const campaigns = pgTable('campaigns', {
  id: varchar('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  resumeId: varchar('resume_id').notNull().references(() => resumes.id),
  companyId: varchar('company_id').notNull().references(() => companies.id),
  jobTitle: text('job_title').notNull(),
  status: text('status').notNull().default('draft'),
  emailTone: jsonb('email_tone').$type<{
    formality: number;
    energy: number;
    humor: number;
    preset?: string;
  }>(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const prospects = pgTable('prospects', {
  id: varchar('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  campaignId: varchar('campaign_id').notNull().references(() => campaigns.id),
  name: text('name').notNull(),
  email: text('email').notNull(),
  title: text('title'),
  linkedinUrl: text('linkedin_url'),
  researchData: jsonb('research_data').$type<{
    linkedinActivity?: string[];
    companyNews?: string[];
    githubActivity?: string[];
    hobbies?: string[];
  }>(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const emails = pgTable('emails', {
  id: varchar('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  prospectId: varchar('prospect_id').notNull().references(() => prospects.id),
  campaignId: varchar('campaign_id').notNull().references(() => campaigns.id),
  subject: text('subject').notNull(),
  body: text('body').notNull(),
  status: text('status').notNull().default('draft'),
  sentAt: timestamp('sent_at'),
  openedAt: timestamp('opened_at'),
  clickedAt: timestamp('clicked_at'),
  repliedAt: timestamp('replied_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export type Resume = typeof resumes.$inferSelect;
export type InsertResume = typeof resumes.$inferInsert;
export type Company = typeof companies.$inferSelect;
export type InsertCompany = typeof companies.$inferInsert;
export type Campaign = typeof campaigns.$inferSelect;
export type InsertCampaign = typeof campaigns.$inferInsert;
export type Prospect = typeof prospects.$inferSelect;
export type InsertProspect = typeof prospects.$inferInsert;
export type Email = typeof emails.$inferSelect;
export type InsertEmail = typeof emails.$inferInsert;
