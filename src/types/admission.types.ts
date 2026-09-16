export interface HospitalAdmission {
  id: string;
  patientId: string;
  referralId: string;
  admissionDate: string;
  dischargeDate?: string;
  bedNumber: string;
  ward: string;
  admittingPhysician: string;
  careTeam: string;
  primaryDiagnosis: string;
  secondaryDiagnoses: string[];
  diseaseStage: 'Early' | 'Advanced' | 'Terminal';
  comorbidities: string[];
  estimatedPrognosis: 'Days' | 'Weeks' | 'Months' | 'Uncertain';
  ppsScore: number;
  /** Karnofsky Performance Scale score */
  kpsScore?: number;
  functionalStatus: 'FullyIndependent' | 'PartiallyDependent' | 'FullyDependent';
  painScore: number;
  painType: 'Acute' | 'Chronic' | 'Neuropathic' | 'Mixed';
  symptomsPresent: string[];
  emotionalStatus: 'Stable' | 'Anxious' | 'Depressed' | 'Distressed';
  familySupport: 'Strong' | 'Moderate' | 'Weak' | 'None';
  socialChallenges?: string;
  spiritualConcerns: boolean;
  spiritualSupportPreferred?: 'ReligiousLeader' | 'Counselor' | 'Other';
  /** Free-text description of spiritual needs when spiritualConcerns is true */
  spiritualNeedsDescription?: string;
  painManagementPlan: string;
  medicationPlan: string;
  nursingCarePlan: string;
  homeBasedCareRequired: boolean;
  psychosocialSupportPlan?: string;
  physiotherapyRequired: boolean;
  dischargeReason?: 'Improved' | 'Deceased';
  status: 'Active' | 'Discharged';
  // ── Patient identification fields (denormalised from patient record) ──
  /** Patient full name at time of admission */
  patientName?: string;
  /** Hospital MRN / patient display ID */
  hospitalPatientId?: string;
  /** Patient age at time of admission */
  age?: number;
  sex?: 'Male' | 'Female';
  dateOfBirth?: string;
  address?: string;
  phone?: string;
  emergencyContactName?: string;
  emergencyContactRelationship?: string;
  emergencyContactPhone?: string;
  // ── Referral information ──
  referredFrom?: string;
  referringClinician?: string;
  referralReason?: string;
  // ── Audit ──
  /** Staff member who created the admission record */
  createdBy: string | { name: string; role: string };
  createdAt: string;
  updatedAt: string;
}

export interface CreateAdmissionRequest {
  referralId: string;
  admissionDate: string;
  bedNumber: string;
  ward: string;
  admittingPhysician: string;
  careTeam: string;
  primaryDiagnosis: string;
  secondaryDiagnoses?: string[];
  diseaseStage: 'Early' | 'Advanced' | 'Terminal';
  comorbidities?: string[];
  estimatedPrognosis: 'Days' | 'Weeks' | 'Months' | 'Uncertain';
  ppsScore: number;
  functionalStatus: 'FullyIndependent' | 'PartiallyDependent' | 'FullyDependent';
  painScore: number;
  painType: 'Acute' | 'Chronic' | 'Neuropathic' | 'Mixed';
  symptomsPresent?: string[];
  emotionalStatus: 'Stable' | 'Anxious' | 'Depressed' | 'Distressed';
  familySupport: 'Strong' | 'Moderate' | 'Weak' | 'None';
  socialChallenges?: string;
  spiritualConcerns: boolean;
  spiritualSupportPreferred?: 'ReligiousLeader' | 'Counselor' | 'Other';
  painManagementPlan: string;
  medicationPlan: string;
  nursingCarePlan: string;
  homeBasedCareRequired: boolean;
  psychosocialSupportPlan?: string;
  physiotherapyRequired: boolean;
}

export interface UpdateAdmissionRequest {
  dischargeDate?: string;
  dischargeReason?: 'Improved' | 'Deceased';
  status: 'Active' | 'Discharged';
}

export interface AdmissionListResponse {
  items: HospitalAdmission[];
  page: number;
  limit: number;
  total: number;
}
