import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Trash2, ChevronDown } from 'lucide-react';
import { createVisitSchema, type CreateVisitFormData } from '@/schemas/visit.schema';
import { useRecordVisit } from '@/hooks/useVisits';
import { usePatient } from '@/hooks/usePatients';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { Checkbox } from '@/components/ui/Checkbox';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { BackButton } from '@/components/common/BackButton';
import { PageLoader } from '@/components/common/LoadingSpinner';
import { cn } from '@/lib/utils';
import { PAIN_LOCATION_LABELS, SYMPTOM_LABELS, EDUCATION_LABELS, RED_FLAG_LABELS } from '@/constants';

// Collapsible section wrapper
const Section: React.FC<{ title: string; defaultOpen?: boolean; children: React.ReactNode }> = ({
  title, defaultOpen = true, children
}) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <Card padding="none">
      <button
        type="button"
        className="w-full flex items-center justify-between px-5 py-4 text-left"
        onClick={() => setOpen((v) => !v)}
      >
        <span className="text-sm font-semibold text-on-surface">{title}</span>
        <ChevronDown size={16} className={cn('text-text-muted transition-transform', open && 'rotate-180')} />
      </button>
      {open && <div className="px-5 pb-5 space-y-4">{children}</div>}
    </Card>
  );
};

// Removed CheckGroup — replaced with inline typed checkboxes

const RecordVisitPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: patient, isLoading: patientLoading } = usePatient(id!);
  const recordMutation = useRecordVisit(id!);

  const { register, handleSubmit, formState: { errors }, control, setValue, watch } = useForm<CreateVisitFormData>({
    resolver: zodResolver(createVisitSchema),
    defaultValues: {
      visitDate: new Date().toISOString().split('T')[0],
      timeStarted: '09:00', timeEnded: '10:30',
      visitType: 'Routine',
      teamMembers: [{ role: 'Physician', name: '' }],
      overallStatus: 'Stable', mobility: 'RequiresAssistance',
      painScore: 0, painMedicationEffective: true,
      adl: { feeding: 'NeedsAssistance', bathing: 'NeedsAssistance', dressing: 'NeedsAssistance', toileting: 'NeedsAssistance', mobility: 'NeedsAssistance' },
      ppsScore: 50, kpsScore: 50,
      appetite: 'Fair', oralIntake: 'Reduced', hydrationStatus: 'Adequate',
      emotionalStatus: 'Stable', familySupport: 'Good',
      financialDifficulty: false, spiritualNeeds: false, religiousSupportRequested: false,
      medicationAvailable: true, medicationCorrectlyTaken: true,
      medicationSideEffects: false, medicationRefillNeeded: false, morphineAvailable: true,
      adherenceLevel: 'Good', currentMedications: [],
      caregiverBurden: 'Moderate', caregiverUnderstanding: 'Good', caregivingCapacity: 'Moderate',
      familyEmotionalStatus: 'Stable',
      homeCondition: 'Clean',
      outcome: 'Stable',
      teamLeaderId: 'staff-002', physicianId: 'staff-001', nurseId: 'staff-003',
      painLocation: [], painCharacteristics: [], symptoms: [],
      educationProvided: [], homeObservations: [], nursingCareGiven: [], redFlags: [], referralsMade: [],
    },
  });

  const { fields: teamFields, append: appendTeam, remove: removeTeam } = useFieldArray({ control, name: 'teamMembers' });
  const { fields: medFields, append: appendMed, remove: removeMed } = useFieldArray({ control, name: 'currentMedications' });

  const onSubmit = (data: CreateVisitFormData) => {
    recordMutation.mutate(data, {
      onSuccess: () => navigate(`/patients/${id}`),
    });
  };

  if (patientLoading) return <PageLoader />;

  const adlOptions = [{ value: 'Independent', label: 'Independent' }, { value: 'NeedsAssistance', label: 'Needs Assistance' }, { value: 'FullyDependent', label: 'Fully Dependent' }];

  return (
    <div className="max-w-3xl space-y-5">
      <div className="flex items-center gap-3">
        <BackButton to={`/patients/${id}`} label="Patient" />
        <div>
          <h1 className="text-xl font-bold text-on-surface">Record Home Visit</h1>
          {patient && <p className="text-sm text-text-secondary">{patient.firstName} {patient.lastName} · {patient.patientDisplayId}</p>}
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        {/* 1. Visit Details */}
        <Section title="1. Visit Details">
          <div className="grid sm:grid-cols-3 gap-4">
            <Input label="Visit Date" type="date" error={errors.visitDate?.message} {...register('visitDate')} />
            <Input label="Time Started" type="time" error={errors.timeStarted?.message} {...register('timeStarted')} />
            <Input label="Time Ended" type="time" error={errors.timeEnded?.message} {...register('timeEnded')} />
          </div>
          <Select label="Visit Type" options={[
            { value: 'Routine', label: 'Routine Follow-up' }, { value: 'Emergency', label: 'Emergency Visit' },
            { value: 'FirstAssessment', label: 'First Home Assessment' }, { value: 'PostDischarge', label: 'Post-Discharge Follow-up' },
            { value: 'EndOfLife', label: 'End-of-Life Visit' }, { value: 'Bereavement', label: 'Bereavement Follow-Up' },
          ]} {...register('visitType')} />
          <div>
            <p className="text-sm font-medium text-on-surface mb-2">Team Members</p>
            {teamFields.map((field, i) => (
              <div key={field.id} className="flex gap-2 mb-2">
                <Select options={[{ value: 'TeamLeader', label: 'Team Leader' }, { value: 'Physician', label: 'Physician' }, { value: 'Nurse', label: 'Nurse' }]}
                  placeholder="Role" {...register(`teamMembers.${i}.role`)} className="w-40" />
                <Input placeholder="Staff name" {...register(`teamMembers.${i}.name`)} className="flex-1" />
                {teamFields.length > 1 && <Button type="button" variant="ghost" size="icon" onClick={() => removeTeam(i)}><Trash2 size={14} /></Button>}
              </div>
            ))}
            <Button type="button" variant="outline" size="sm" leftIcon={<Plus size={13} />} onClick={() => appendTeam({ role: 'Nurse', name: '' })}>Add Member</Button>
          </div>
        </Section>

        {/* 2. General Condition */}
        <Section title="2. Patient General Condition">
          <div className="grid sm:grid-cols-2 gap-4">
            <Select label="Overall Status" options={[{ value: 'Stable', label: 'Stable' }, { value: 'Deteriorating', label: 'Deteriorating' }, { value: 'Critical', label: 'Critical' }, { value: 'BedBound', label: 'Bed-Bound' }]} {...register('overallStatus')} />
            <Select label="Mobility" options={[{ value: 'Ambulatory', label: 'Ambulatory' }, { value: 'RequiresAssistance', label: 'Requires Assistance' }, { value: 'Bedridden', label: 'Bedridden' }]} {...register('mobility')} />
          </div>
        </Section>

        {/* 3. Vital Signs */}
        <Section title="3. Vital Signs (if available)" defaultOpen={false}>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <Input label="Temperature (°C)" type="number" step="0.1" {...register('vitals.temperature')} />
            <Input label="Pulse (bpm)" type="number" {...register('vitals.pulse')} />
            <Input label="Blood Pressure (mmHg)" placeholder="120/80" {...register('vitals.bp')} />
            <Input label="Respiration (/min)" type="number" {...register('vitals.respiration')} />
            <Input label="SpO₂ (%)" type="number" {...register('vitals.spo2')} />
          </div>
        </Section>

        {/* 4. Pain Assessment */}
        <Section title="4. Pain Assessment">
          <Input label="Pain Score (0–10)" type="number" min={0} max={10} error={errors.painScore?.message} {...register('painScore')} />
          <p className="text-sm font-medium text-on-surface">Pain Location</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {(['Head','Neck','Chest','Abdomen','Back','Limbs','Generalized','Other'] as const).map((loc) => (
              <label key={loc} className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" value={loc} {...register('painLocation')} className="h-4 w-4 rounded text-primary" />
                {PAIN_LOCATION_LABELS[loc] || loc}
              </label>
            ))}
          </div>
          <p className="text-sm font-medium text-on-surface">Pain Characteristics</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {(['Sharp','Dull','Burning','Cramping','Intermittent','Continuous'] as const).map((c) => (
              <label key={c} className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" value={c} {...register('painCharacteristics')} className="h-4 w-4 rounded text-primary" />
                {c}
              </label>
            ))}
          </div>
          <Checkbox label="Current Pain Medication Effective" {...register('painMedicationEffective')} />
        </Section>

        {/* 5. Symptoms */}
        <Section title="5. Symptoms">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {(['Dyspnea','Nausea','Constipation','Anxiety','Fatigue','PoorAppetite','PressureSores','Other'] as const).map((s) => (
              <label key={s} className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" value={s} {...register('symptoms')} className="h-4 w-4 rounded text-primary" />
                {SYMPTOM_LABELS[s] || s}
              </label>
            ))}
          </div>
        </Section>

        {/* 6. Functional Status */}
        <Section title="6. Functional Status (ADL)">
          {(['feeding', 'bathing', 'dressing', 'toileting', 'mobility'] as const).map((act) => (
            <div key={act} className="flex items-center gap-4">
              <p className="text-sm w-24 capitalize flex-shrink-0">{act}</p>
              <Select options={adlOptions} {...register(`adl.${act}`)} className="flex-1" />
            </div>
          ))}
          <div className="grid sm:grid-cols-2 gap-4">
            <Input label="PPS Score (0–100)" type="number" min={0} max={100} {...register('ppsScore')} />
            <Input label="KPS Score (0–100)" type="number" min={0} max={100} {...register('kpsScore')} />
          </div>
        </Section>

        {/* 7. Nutrition */}
        <Section title="7. Nutrition & Hydration" defaultOpen={false}>
          <div className="grid sm:grid-cols-3 gap-4">
            <Select label="Appetite" options={[{ value: 'Good', label: 'Good' }, { value: 'Fair', label: 'Fair' }, { value: 'Poor', label: 'Poor' }, { value: 'UnableToEat', label: 'Unable to Eat' }]} {...register('appetite')} />
            <Select label="Oral Intake" options={[{ value: 'Adequate', label: 'Adequate' }, { value: 'Reduced', label: 'Reduced' }, { value: 'Minimal', label: 'Minimal' }]} {...register('oralIntake')} />
            <Select label="Hydration Status" options={[{ value: 'Adequate', label: 'Adequate' }, { value: 'MildDehydration', label: 'Mild Dehydration' }, { value: 'SevereDehydration', label: 'Severe Dehydration' }]} {...register('hydrationStatus')} />
          </div>
        </Section>

        {/* 8. Psychosocial */}
        <Section title="8. Psychosocial Assessment" defaultOpen={false}>
          <div className="grid sm:grid-cols-2 gap-4">
            <Select label="Emotional Status" options={[{ value: 'Stable', label: 'Stable' }, { value: 'Anxious', label: 'Anxious' }, { value: 'Depressed', label: 'Depressed' }, { value: 'Fearful', label: 'Fearful' }, { value: 'Distressed', label: 'Distressed' }]} {...register('emotionalStatus')} />
            <Select label="Family Support" options={[{ value: 'Excellent', label: 'Excellent' }, { value: 'Good', label: 'Good' }, { value: 'Limited', label: 'Limited' }, { value: 'None', label: 'None' }]} {...register('familySupport')} />
          </div>
          <Checkbox label="Financial Difficulty" {...register('financialDifficulty')} />
        </Section>

        {/* 9. Spiritual */}
        <Section title="9. Spiritual Assessment" defaultOpen={false}>
          <Checkbox label="Spiritual Needs Identified" {...register('spiritualNeeds')} />
          <Checkbox label="Religious Support Requested" {...register('religiousSupportRequested')} />
        </Section>

        {/* 10. Medication Review */}
        <Section title="10. Medication Review" defaultOpen={false}>
          <div className="grid sm:grid-cols-2 gap-3">
            <Checkbox label="Medications Available at Home" {...register('medicationAvailable')} />
            <Checkbox label="Taking Medications Correctly" {...register('medicationCorrectlyTaken')} />
            <Checkbox label="Side Effects Present" {...register('medicationSideEffects')} />
            <Checkbox label="Refill Needed" {...register('medicationRefillNeeded')} />
            <Checkbox label="Morphine Available" {...register('morphineAvailable')} />
          </div>
          <Select label="Adherence Level" options={[{ value: 'Good', label: 'Good' }, { value: 'Partial', label: 'Partial' }, { value: 'Poor', label: 'Poor' }]} {...register('adherenceLevel')} />
          <div>
            <p className="text-sm font-medium text-on-surface mb-2">Current Medications</p>
            {medFields.map((field, i) => (
              <div key={field.id} className="grid grid-cols-4 gap-2 mb-2">
                <Input placeholder="Name" {...register(`currentMedications.${i}.name`)} />
                <Input placeholder="Dosage" {...register(`currentMedications.${i}.dosage`)} />
                <Input placeholder="Frequency" {...register(`currentMedications.${i}.frequency`)} />
                <div className="flex gap-1"><Input placeholder="Route" {...register(`currentMedications.${i}.route`)} /><Button type="button" variant="ghost" size="icon" onClick={() => removeMed(i)}><Trash2 size={13} /></Button></div>
              </div>
            ))}
            <Button type="button" variant="outline" size="sm" leftIcon={<Plus size={13} />} onClick={() => appendMed({ name: '', dosage: '', frequency: '', route: '' })}>Add Medication</Button>
          </div>
        </Section>

        {/* 11. Caregiver */}
        <Section title="11. Caregiver Assessment" defaultOpen={false}>
          <div className="grid sm:grid-cols-2 gap-4">
            <Select label="Caregiver Burden" options={[{ value: 'Low', label: 'Low' }, { value: 'Moderate', label: 'Moderate' }, { value: 'High', label: 'High' }]} {...register('caregiverBurden')} />
            <Select label="Understanding of Care Plan" options={[{ value: 'Good', label: 'Good' }, { value: 'Fair', label: 'Fair' }, { value: 'Poor', label: 'Poor' }]} {...register('caregiverUnderstanding')} />
            <Select label="Caregiving Capacity" options={[{ value: 'Strong', label: 'Strong' }, { value: 'Moderate', label: 'Moderate' }, { value: 'Weak', label: 'Weak' }]} {...register('caregivingCapacity')} />
            <Select label="Family Emotional Status" options={[{ value: 'Stable', label: 'Stable' }, { value: 'Stressed', label: 'Stressed' }, { value: 'Overwhelmed', label: 'Overwhelmed' }]} {...register('familyEmotionalStatus')} />
          </div>
        </Section>

        {/* 12. Education */}
        <Section title="12. Education Provided" defaultOpen={false}>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {(['MedicationAdministration','PainManagement','NutritionSupport','SkinCare','PressureSorePrevention','EndOfLifeCare','EmergencySigns','EmotionalSupport','Other'] as const).map((e) => (
              <label key={e} className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" value={e} {...register('educationProvided')} className="h-4 w-4 rounded text-primary" />
                {EDUCATION_LABELS[e] || e}
              </label>
            ))}
          </div>
        </Section>

        {/* 13. Home Environment */}
        <Section title="13. Home Environment" defaultOpen={false}>
          <Select label="Home Condition" options={[{ value: 'Clean', label: 'Clean' }, { value: 'Fair', label: 'Fair' }, { value: 'Poor', label: 'Poor' }]} {...register('homeCondition')} />
          <div className="grid grid-cols-2 gap-2">
            {(['AdequateLighting','Ventilation','SafeBed','CleanWater','SanitationIssues'] as const).map((o) => (
              <label key={o} className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" value={o} {...register('homeObservations')} className="h-4 w-4 rounded text-primary" />
                {{AdequateLighting:'Adequate Lighting',Ventilation:'Ventilation Adequate',SafeBed:'Safe Bed Arrangement',CleanWater:'Clean Water Available',SanitationIssues:'Sanitation Issues'}[o]}
              </label>
            ))}
          </div>
        </Section>

        {/* 14. Nursing Care */}
        <Section title="14. Nursing Care Provided" defaultOpen={false}>
          <div className="grid grid-cols-2 gap-2">
            {(['Hygiene','WoundCare','MedicationAdmin','PositionChange','FeedingAssistance','Counseling'] as const).map((n) => (
              <label key={n} className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" value={n} {...register('nursingCareGiven')} className="h-4 w-4 rounded text-primary" />
                {{Hygiene:'Patient Hygiene Care',WoundCare:'Wound Care',MedicationAdmin:'Medication Administration',PositionChange:'Position Change',FeedingAssistance:'Feeding Assistance',Counseling:'Counseling Provided'}[n]}
              </label>
            ))}
          </div>
        </Section>

        {/* 15. Red Flags */}
        <Section title="15. Red Flag Assessment">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {(['SevereUncontrolledPain','SevereShortnessOfBreath','MassiveBleeding','UncontrolledSeizures','AlteredMentalStatus','SevereDehydration','None'] as const).map((f) => (
              <label key={f} className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" value={f} {...register('redFlags')} className="h-4 w-4 rounded text-primary" />
                {RED_FLAG_LABELS[f] || f}
              </label>
            ))}
          </div>
          <Textarea label="Action Taken (if red flags present)" rows={3} {...register('redFlagActions')} />
        </Section>

        {/* 16. Referrals Made */}
        <Section title="16. Referrals Made During Visit" defaultOpen={false}>
          <div className="grid grid-cols-2 gap-2">
            {(['PhysicianReview','HospitalAdmission','SocialWorker','Psychologist','SpiritualCare','NutritionSupport'] as const).map((r) => (
              <label key={r} className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" value={r} {...register('referralsMade')} className="h-4 w-4 rounded text-primary" />
                {{PhysicianReview:'Physician Review',HospitalAdmission:'Hospital Admission',SocialWorker:'Social Worker',Psychologist:'Psychologist',SpiritualCare:'Spiritual Care',NutritionSupport:'Nutrition Support'}[r]}
              </label>
            ))}
          </div>
        </Section>

        {/* 17. Outcome */}
        <Section title="17. Outcome & Follow-up">
          <Select label="Visit Outcome" options={[
            { value: 'Stable', label: 'Patient Stable' }, { value: 'SymptomsImproved', label: 'Symptoms Improved' },
            { value: 'SymptomsUnchanged', label: 'Symptoms Unchanged' }, { value: 'SymptomsWorsened', label: 'Symptoms Worsened' },
            { value: 'ReferredToFacility', label: 'Referred to Facility' }, { value: 'Deceased', label: 'Patient Deceased' },
          ]} error={errors.outcome?.message} {...register('outcome')} />
          <Input label="Next Visit Date (if scheduled)" type="date" {...register('nextVisitDate')} />
        </Section>

        {/* 18. Signatures */}
        <Section title="18. Team Signatures">
          <Input label="Team Leader ID" {...register('teamLeaderId')} />
          <Input label="Physician ID" {...register('physicianId')} />
          <Input label="Nurse ID" {...register('nurseId')} />
        </Section>

        <div className="flex gap-3 justify-end pb-8">
          <Button type="button" variant="outline" onClick={() => navigate(`/patients/${id}`)}>Cancel</Button>
          <Button type="submit" loading={recordMutation.isPending}>Save Visit</Button>
        </div>
      </form>
    </div>
  );
};

export default RecordVisitPage;
