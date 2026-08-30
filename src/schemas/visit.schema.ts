import { z } from 'zod';

const adlLevelEnum = z.enum(['Independent', 'NeedsAssistance', 'FullyDependent']);

export const createVisitSchema = z.object({
  visitDate: z.string().min(1, 'Visit date is required'),
  timeStarted: z.string().min(1, 'Start time is required'),
  timeEnded: z.string().min(1, 'End time is required'),
  visitType: z.enum(['Routine', 'Emergency', 'FirstAssessment', 'PostDischarge', 'EndOfLife', 'Bereavement']),
  teamMembers: z.array(z.object({
    role: z.enum(['TeamLeader', 'Physician', 'Nurse']),
    name: z.string().min(1, 'Name is required'),
  })).min(1, 'At least one team member is required'),

  // General condition
  overallStatus: z.enum(['Stable', 'Deteriorating', 'Critical', 'BedBound']),
  mobility: z.enum(['Ambulatory', 'RequiresAssistance', 'Bedridden']),

  // Vitals (optional)
  vitals: z.object({
    temperature: z.coerce.number().optional(),
    pulse: z.coerce.number().optional(),
    bp: z.string().optional(),
    respiration: z.coerce.number().optional(),
    spo2: z.coerce.number().optional(),
  }).optional(),

  // Pain
  painScore: z.coerce.number().min(0).max(10),
  painLocation: z.array(z.string()).optional().default([]),
  painCharacteristics: z.array(z.string()).optional().default([]),
  painMedicationEffective: z.boolean(),

  // Symptoms
  symptoms: z.array(z.string()).optional().default([]),

  // ADL
  adl: z.object({
    feeding: adlLevelEnum,
    bathing: adlLevelEnum,
    dressing: adlLevelEnum,
    toileting: adlLevelEnum,
    mobility: adlLevelEnum,
  }),
  ppsScore: z.coerce.number().min(0).max(100),
  kpsScore: z.coerce.number().min(0).max(100),

  // Nutrition
  appetite: z.enum(['Good', 'Fair', 'Poor', 'UnableToEat']),
  oralIntake: z.enum(['Adequate', 'Reduced', 'Minimal']),
  hydrationStatus: z.enum(['Adequate', 'MildDehydration', 'SevereDehydration']),

  // Psychosocial
  emotionalStatus: z.enum(['Stable', 'Anxious', 'Depressed', 'Fearful', 'Distressed']),
  familySupport: z.enum(['Excellent', 'Good', 'Limited', 'None']),
  financialDifficulty: z.boolean(),

  // Spiritual
  spiritualNeeds: z.boolean(),
  religiousSupportRequested: z.boolean(),

  // Medication review
  medicationAvailable: z.boolean(),
  medicationCorrectlyTaken: z.boolean(),
  medicationSideEffects: z.boolean(),
  medicationRefillNeeded: z.boolean(),
  morphineAvailable: z.boolean(),
  adherenceLevel: z.enum(['Good', 'Partial', 'Poor']),
  currentMedications: z.array(z.object({
    name: z.string(),
    dosage: z.string(),
    frequency: z.string(),
    route: z.string(),
  })).optional().default([]),

  // Caregiver
  caregiverBurden: z.enum(['Low', 'Moderate', 'High']),
  caregiverUnderstanding: z.enum(['Good', 'Fair', 'Poor']),
  caregivingCapacity: z.enum(['Strong', 'Moderate', 'Weak']),
  familyEmotionalStatus: z.enum(['Stable', 'Stressed', 'Overwhelmed']),

  // Education
  educationProvided: z.array(z.string()).optional().default([]),

  // Home environment
  homeCondition: z.enum(['Clean', 'Fair', 'Poor']),
  homeObservations: z.array(z.string()).optional().default([]),

  // Nursing care
  nursingCareGiven: z.array(z.string()).optional().default([]),

  // Red flags
  redFlags: z.array(z.string()).optional().default([]),
  redFlagActions: z.string().optional(),

  // Referrals made
  referralsMade: z.array(z.string()).optional().default([]),

  // Outcome
  outcome: z.enum(['Stable', 'SymptomsImproved', 'SymptomsUnchanged', 'SymptomsWorsened', 'ReferredToFacility', 'Deceased']),
  nextVisitDate: z.string().optional(),

  // Signatures
  teamLeaderId: z.string().min(1, 'Team leader is required'),
  physicianId: z.string().min(1, 'Physician is required'),
  nurseId: z.string().min(1, 'Nurse is required'),
});

export type CreateVisitFormData = z.infer<typeof createVisitSchema>;
