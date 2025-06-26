export interface Experience {
  id: string;
  title: string;
  company: string;
  startDate: string;
  endDate: string;
  description: string[];
  location?: string;
}

export interface Education {
  id: string;
  school: string;
  degree: string;
  field: string;
  startYear: string;
  endYear: string;
  description?: string;
  gpa?: string;
}

export interface Skill {
  id: string;
  name: string;
}

export interface Document {
  id: string;
  name: string;
  type: string;
  dateUploaded: string;
  url: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'student' | 'company';
  profile_completed?: boolean;
  major?: string;
  graduationYear?: string;
  skills?: string;
  bio?: string;
  linkedIn?: string;
  github?: string;
  portfolio?: string;
  companySize?: string;
  foundedYear?: string;
  location?: string;
  longDescription?: string;
  twitter?: string;
  firstName?: string;
  lastName?: string;
  university?: string;
  companyName?: string;
  industry?: string;
  profilePicture?: string;
  
  // Extended profile fields
  experiences?: Experience[];
  education?: Education[];
  skillsList?: Skill[];
  documents?: Document[];
}
