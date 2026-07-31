import * as z from "zod";

export const businessTypes = [
  "Sole Proprietorship",
  "Partnership (General / Limited)",
  "Limited Liability Partnership (LLP)",
  "Limited Liability Company (LLC)",
  "Private Limited Company (Ltd / Pvt Ltd)",
  "Public Corporation (Inc / PLC)",
  "Non-profit Organization (NGO / 501c3)",
  "Cooperative",
  "Trust / Foundation",
  "Government / Public Sector",
  "Independent Contractor / Freelancer",
  "Franchise",
];

export const industries = [
  "Technology & Software",
  "Finance, Banking & Insurance",
  "Healthcare & Pharmaceuticals",
  "Retail & Consumer Goods",
  "E-commerce",
  "Education & E-Learning",
  "Real Estate & Property Management",
  "Manufacturing & Production",
  "Transportation, Logistics & Supply Chain",
  "Hospitality, Tourism & Travel",
  "Media, Entertainment & Publishing",
  "Telecommunications",
  "Agriculture, Forestry & Fishing",
  "Energy, Utilities & Mining",
  "Professional & Business Services (Legal, Consulting)",
  "Food & Beverage",
  "Architecture & Construction",
  "Government & Public Administration",
  "Non-profit, NGO & Civic Organizations",
  "Automotive & Aviation",
  "Arts, Design & Fashion",
  "Sports, Wellness & Fitness",
  "Other",
];

export const useCases = [
  "2FA, OTP & Authentication",
  "Transactional Alerts & Receipts",
  "Customer Support & Care",
  "Marketing & Promotional Offers",
  "Appointment Reminders & Scheduling",
  "Account Updates & Status Notifications",
  "Billing & Payment Reminders",
  "Internal Employee Communications",
  "Delivery & Logistics Tracking",
  "Event & Webinar Updates",
  "Survey & Feedback Collection",
  "Emergency Alerts & Critical Notifications",
  "Charity & Fundraising",
  "Other",
];

export const monthlyVolumes = [
  "Under 1,000 / month",
  "1,000–10,000 / month",
  "10,000–100,000 / month",
  "100,000+ / month",
];

export const formSchema = z.object({
  workspaceName: z.string().trim().min(1, "Workspace name is required."),
  businessPhone: z.string().trim().min(1, "Business phone is required."),
  businessEmail: z.email("Please enter a valid email address."),
  businessAddress: z.string().trim().min(1, "Business address is required."),
  businessType: z.string().min(1, "Please select a business type."),
  industry: z.string().min(1, "Please select an industry."),
  registrationNumber: z
    .string()
    .trim()
    .min(1, "Registration number is required."),
  useCase: z.string().min(1, "Please select a primary use case."),
  monthlyVolume: z.string().min(1, "Please select an expected volume."),
  website: z.string().trim().optional(),
});

export type FormValues = z.infer<typeof formSchema>;

export const requiredFieldKeys: (keyof FormValues)[] = [
  "workspaceName",
  "businessPhone",
  "businessEmail",
  "businessAddress",
  "businessType",
  "industry",
  "registrationNumber",
  "useCase",
  "monthlyVolume",
];
