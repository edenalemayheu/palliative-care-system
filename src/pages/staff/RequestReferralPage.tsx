import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft } from 'lucide-react';
import { createReferralSchema, type CreateReferralFormData } from '@/schemas/referral.schema';
import { useRequestReferral } from '@/hooks/useReferrals';
import { usePatient } from '@/hooks/usePatients';
import { useAuthStore } from '@/store/auth.store';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Checkbox } from '@/components/ui/Checkbox';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { PageLoader } from '@/components/common/LoadingSpinner';
import { REFERRAL_REASON_LABELS } from '@/constants';

const RequestReferralPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: patient, isLoading: pLoading } = usePatient(id!);
  const mutation = useRequestReferral(id!);
  const user = useAuthStore((s) => s.user);

  const { register, handleSubmit, formState: { errors } } = useForm<CreateReferralFormData>({
    resolver: zodResolver(createReferralSchema),
    defaultValues: {
      referralType: 'Outgoing',
      referralDate: new Date().toISOString().split('T')[0],
      diseaseStage: 'Advanced', ppsScore: 50, kpsScore: 50,
      currentSymptoms: { pain: 0, dyspnea: 0, fatigue: 0, anxiety: 0, depression: 0 },
      reasons: [],
      referringFacility: 'Y12HMC Home Care Unit',
      preparedBy: user?.name || '', preparedByDesignation: user?.role || '',
      signature: user?.name || '',
    },
  });

  const onSubmit = (data: CreateReferralFormData) => {
    mutation.mutate(data, { onSuccess: () => navigate(`/patients/${id}`) });
  };

  if (pLoading) return <PageLoader />;

  return (
    <div className="max-w-3xl space-y-5">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate(`/patients/${id}`)}><ArrowLeft size={18} /></Button>
        <div>
          <h1 className="text-xl font-bold text-on-surface">Request Referral</h1>
          {patient && <p className="text-sm text-text-secondary">{patient.firstName} {patient.lastName}</p>}
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
        <Card padding="lg">
          <CardHeader><CardTitle>Referral Information</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <Select label="Referral Type" options={[{ value: 'Incoming', label: 'Incoming' }, { value: 'Outgoing', label: 'Outgoing' }]} {...register('referralType')} />
              <Input label="Referral Date" type="date" error={errors.referralDate?.message} {...register('referralDate')} />
            </div>
          </CardContent>
        </Card>

        <Card padding="lg">
          <CardHeader><CardTitle>Clinical Information</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <Input label="Primary Diagnosis" error={errors.primaryDiagnosis?.message} {...register('primaryDiagnosis')} />
            <div className="grid sm:grid-cols-3 gap-4">
              <Select label="Disease Stage" options={[{ value: 'Early', label: 'Early' }, { value: 'Advanced', label: 'Advanced' }, { value: 'EndStage', label: 'End Stage' }]} {...register('diseaseStage')} />
              <Input label="PPS Score (%)" type="number" min={0} max={100} {...register('ppsScore')} />
              <Input label="KPS Score" type="number" min={0} max={100} {...register('kpsScore')} />
            </div>
            <p className="text-sm font-medium text-on-surface">Current Symptoms (0–10)</p>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
              {(['pain', 'dyspnea', 'fatigue', 'anxiety', 'depression'] as const).map((s) => (
                <Input key={s} label={s.charAt(0).toUpperCase() + s.slice(1)} type="number" min={0} max={10} {...register(`currentSymptoms.${s}`)} />
              ))}
            </div>
          </CardContent>
        </Card>

        <Card padding="lg">
          <CardHeader><CardTitle>Reason for Referral</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(REFERRAL_REASON_LABELS).map(([val, label]) => (
                <label key={val} className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" value={val} {...register('reasons')} className="h-4 w-4 rounded text-primary" />
                  {label}
                </label>
              ))}
            </div>
            {errors.reasons && <p className="text-xs text-error mt-1">{errors.reasons.message}</p>}
          </CardContent>
        </Card>

        <Card padding="lg">
          <CardHeader><CardTitle>Facility Details</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <Input label="Referring Facility" error={errors.referringFacility?.message} {...register('referringFacility')} />
            <Input label="Receiving Facility" error={errors.receivingFacility?.message} {...register('receivingFacility')} />
            <div className="grid sm:grid-cols-2 gap-4">
              <Input label="Contact Person" error={errors.contactPerson?.message} {...register('contactPerson')} />
              <Input label="Contact Number" error={errors.contactNumber?.message} {...register('contactNumber')} />
            </div>
          </CardContent>
        </Card>

        <Card padding="lg">
          <CardHeader><CardTitle>Staff Documentation</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid sm:grid-cols-3 gap-4">
              <Input label="Prepared By" error={errors.preparedBy?.message} {...register('preparedBy')} />
              <Input label="Designation" error={errors.preparedByDesignation?.message} {...register('preparedByDesignation')} />
              <Input label="Signature" error={errors.signature?.message} {...register('signature')} />
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-3 justify-end">
          <Button type="button" variant="outline" onClick={() => navigate(`/patients/${id}`)}>Cancel</Button>
          <Button type="submit" loading={mutation.isPending}>Submit Referral</Button>
        </div>
      </form>
    </div>
  );
};

export default RequestReferralPage;
