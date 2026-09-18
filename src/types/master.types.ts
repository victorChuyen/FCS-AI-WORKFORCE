import { UserRole } from './auth.types';

export interface Partner {
  id: string;
  name: string;
  code: string;
  location: string;
  industry: string;
  activeWorkersCount: number;
}

export interface Job {
  id: string;
  partnerId: string;
  partnerName: string;
  title: string;
  salaryRange: string;
  location: string;
  vacancies: number;
}

export interface Staff {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  officeId: string;
  officeName: string;
  activeCandidatesCount: number;
}

export interface Office {
  id: string;
  name: string;
  code: string;
  address: string;
}
