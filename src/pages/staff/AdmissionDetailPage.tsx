import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { LogOut } from 'lucide-react';
import { updateAdmissionSchema, type UpdateAdmissionFormData } from '@/schemas/admission.schema';
import { useAdmissionDetail, useUpdateAdmission } from '@/hooks/useAdmissions';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { StatusBadge } from '@/components/common/StatusBadge';
import { BackButton } from '@/components/common/BackButton';
import { PageLoader } from '@/components/common/LoadingSpinner';
import { ErrorState } from '@/components/common/EmptyState';
import { formatDate, formatEnumLabel } from '@/lib/utils';

const AdmissionDetailPage: React.FC = () => {
  const { id, admissionId } = useParams<{ id: string; admissionId: string }>();
  const navigate = useNavigate();
  const { data: adm, isLoading, error, refetch } = useAdmissionDetail(id!, admissionId!);
  const updateMutation = useUpdateAdmission(id!);
  const [showDischargeModal, setShowDischargeModal] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<UpdateAdmissionFormData>({
    resolver: zodResolver(updateAdmissionSchema),
    defaultValues: { status: 'Discharged', dischargeDate: new Date().toISOString().split('T')[0] },
  });

  if (isLoading) return <PageLoader />;
  if (error || !adm) return <ErrorState onRetry={refetch} />;

  const onDischarge = (data: UpdateAdmissionFormData) => {
    updateMutation.mutate(
      { admissionId: admissionId!, data },
      { onSuccess: () => { setShowDischargeModal(false); refetch(); } }
    );
  };

  return (
    <div className="max-w-3xl space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BackButton label="Patient" />
          <div>
            <h1 className="text-xl font-bold text-on-surface">Admission Detail</h1>
            <p className="text-sm text-text-secondary">{formatDate(adm.admissionDate)}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={adm.status} type="admission" />
          {adm.status === 'Active' && (
            <Button variant="outline" size="sm" leftIcon={<LogOut size={13} />} onClick={() => setShowDischargeModal(true)}>
              Discharge
            </Button>
          )}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Card padding="md">
          <CardHeader><CardTitle className="text-sm">Admission Details</CardTitle></CardHeader>
          <CardContent className="space-y-1.5 text-sm">
            <Row label="Date" value={formatDate(adm.admissionDate)} />
            <Row label="Bed" value={adm.bedNumber} />
            <Row label="Ward" value={adm.ward} />
            <Row label="Physician" value={adm.admittingPhysician} />
            <Row label="Care Team" value={adm.careTeam} />
          </CardContent>
        </Card>

        <Card padding="md">
          <CardHeader><CardTitle className="text-sm">Medical Information</CardTitle></CardHeader>
          <CardContent className="space-y-1.5 text-sm">
            <Row label="Diagnosis" value={adm.primaryDiagnosis} />
            <Row label="Stage" value={adm.diseaseStage} />
            <Row label="Prognosis" value={adm.estimatedPrognosis} />
            <Row label="PPS Score" value={`${adm.ppsScore}%`} />
            <Row label="Functional Status" value={formatEnumLabel(adm.functionalStatus)} />
            <Row label="Pain Score" value={`${adm.painScore}/10 (${adm.painType})`} />
          </CardContent>
        </Card>
      </div>

      {adm.symptomsPresent?.length > 0 && (
        <Card padding="md">
          <CardHeader><CardTitle className="text-sm">Symptoms</CardTitle></CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-1.5">
              {adm.symptomsPresent.map((s) => <Badge key={s} variant="warning">{s}</Badge>)}
            </div>
          </CardContent>
        </Card>
      )}

      <Card padding="md">
        <CardHeader><CardTitle className="text-sm">Care Plan</CardTitle></CardHeader>
        <CardContent className="space-y-1.5 text-sm">
          <Row label="Pain Management" value={adm.painManagementPlan} />
          <Row label="Medication Plan" value={adm.medicationPlan} />
          <Row label="Nursing Care" value={adm.nursingCarePlan} />
          {adm.psychosocialSupportPlan && <Row label="Psychosocial Support" value={adm.psychosocialSupportPlan} />}
          <Row label="Home-Based Care" value={adm.homeBasedCareRequired ? 'Yes' : 'No'} />
          <Row label="Physiotherapy" value={adm.physiotherapyRequired ? 'Yes' : 'No'} />
        </CardContent>
      </Card>

      {adm.dischargeDate && (
        <Card padding="md">
          <CardHeader><CardTitle className="text-sm">Discharge Information</CardTitle></CardHeader>
          <CardContent className="space-y-1.5 text-sm">
            <Row label="Discharge Date" value={formatDate(adm.dischargeDate)} />
            {adm.dischargeReason && <Row label="Reason" value={adm.dischargeReason} />}
          </CardContent>
        </Card>
      )}

      {/* Discharge modal */}
      {showDischargeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-on-surface/30 backdrop-blur-sm p-4">
          <Card className="w-full max-w-md" padding="lg">
            <CardHeader><CardTitle>Discharge Patient</CardTitle></CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onDischarge)} className="space-y-4" noValidate>
                <Input label="Discharge Date" type="date" error={errors.dischargeDate?.message} {...register('dischargeDate')} />
                <Select label="Discharge Reason" options={[{ value: 'Improved', label: 'Improved' }, { value: 'Deceased', label: 'Deceased' }]} error={errors.dischargeReason?.message} {...register('dischargeReason')} />
                <div className="flex gap-3">
                  <Button type="button" variant="outline" className="flex-1" onClick={() => setShowDischargeModal(false)}>Cancel</Button>
                  <Button type="submit" className="flex-1" loading={updateMutation.isPending}>Confirm Discharge</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

const Row: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div><span className="text-text-muted">{label}: </span><span className="text-on-surface">{value || '—'}</span></div>
);

export default AdmissionDetailPage;
