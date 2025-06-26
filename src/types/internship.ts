
export interface Internship {
  id: number;
  title: string;
  company: string;
  location: string;
  type: string;
  category: string;
  posted: string;
  description: string;
  skills: string[];
  companyLogo?: string;
  deadline?: string;
  startDate?: string;
  duration?: string;
  stipend?: string;
  compensation?: string;
  responsibilities?: string[];
  requirements?: string[];
  benefits?: string[];
  applicationProcess?: string[];
  aboutCompany?: string;
  companySize?: string;
  companyWebsite?: string;
  companyIndustry?: string;
}
