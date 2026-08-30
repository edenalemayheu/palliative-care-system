import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, XCircle, Phone, MapPin, User, Calendar } from 'lucide-react';
import { useAdminPatientDetail, useCloseCase } from '@/hooks/useAdmin';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { StatusBadge } from '@/components/common/StatusBadge';
import { PageLoader } from '@/components/common/LoadingSpinner';
import { ErrorState } from '@/components/common/EmptyState';
import { formatDate, formatEnumLabel } from '@/lib/utils';
import { DISEASE_STAGE_LABELS as DSL } from '@/constants';

const AdminPatientDetailPage: React.FC = () => {
  const { patientId } = useParams<{ patientId: string }>();
  const navigate = useNavigate();
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [closeReason, setCloseReason] = useState<'Improved' | 'Deceased' | ''>('');

  const { data: patient, isLoading, error, refetch } = useAdminPatientDetail(patientId!);
  const closeCaseMutation = useCloseCase();

  if (isLoading) return <PageLoader />;
  if (error || !patient) return <ErrorState onRetry={refetch} />;

  const handleCloseCase = () => {
    if (!closeReason) return;
    closeCaseMutation.mutate(
      { patientId: patientId!, data: { reason: closeReason } },
      { onSuccess: () => { setShowCloseModal(false); refetch(); } }
    );
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/admin/patients')} aria-label="Back">
            <ArrowLeft size={18} />
          </Button>
          <div>
            <p className="text-xs text-text-muted font-mono">{patient.patientDisplayId}</p>
            <h1 className="text-xl font-bold text-on-surface">{patient.firstName} {patient.lastName}</h1>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <StatusBadge status={patient.status} type="patient" />
          <StatusBadge status={patient.currentLocation} />
          {patient.status === 'Active' && (
            <Button variant="destructive" size="sm" leftIcon={<XCircle size={14} />} onClick={() => setShowCloseModal(true)}>
              Close Case
            </Button>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        {/* Demographics */}
        <Card>
          <CardHeader><CardTitle>Patient Information</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            <Row icon={<User size={14} />} label="Name" value={`${patient.firstName} ${patient.lastName}`} />
            <Row icon={<Calendar size={14} />} label="Date of Birth" value={formatDate(patient.dateOfBirth)} />
            <Row label="Age / Sex" value={`${patient.age} years · ${patient.sex}`} />
            <Row icon={<MapPin size={14} />} label="Address" value={patient.address} />
            <Row icon={<Phone size={14} />} label="Phone" value={patient.phone} />
            <Row label="Emergency Contact" value={`${patient.emergencyContactName} · ${patient.emergencyContactPhone}`} />
            <Row label="Caregiver" value={`${patient.caregiverName} · ${patient.caregiverPhone}`} />
          </CardContent>
        </Card>

        {/* Medical */}
        <Card>
          <CardHeader><CardTitle>Medical Information</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            <Row label="Primary Diagnosis" value={patient.primaryDiagnosis} />
            {patient.secondaryDiagnoses?.length > 0 && (
              <Row label="Secondary" value={patient.secondaryDiagnoses.join(', ')} />
            )}
            <Row label="Disease Stage">
              <Badge variant="secondary">{DSL[patient.diseaseStage] ?? patient.diseaseStage}</Badge>
            </Row>
            <Row label="Prognosis" value={patient.estimatedPrognosis} />
            {patient.comorbidities?.length > 0 && (
              <Row label="Comorbidities" value={patient.comorbidities.join(', ')} />
            )}
            <Row label="Registered" value={formatDate(patient.createdAt)} />
          </CardContent>
        </Card>
      </div>

      {/* Records summary */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Visits', items: patient.visits, key: 'visitDate', statusKey: 'outcome', type: 'visit' as const },
          { label: 'Medications', items: patient.medications, key: 'name', statusKey: 'status', type: 'medication' as const },
          { label: 'Lab Tests', items: patient.labTests, key: 'name', statusKey: 'result', type: 'lab' as const },
          { label: 'Referrals', items: patient.referrals, key: 'date', statusKey: 'status', type: 'referral' as const },
        ].map(({ label, items }) => (
          <Card key={label} padding="md">
            <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">{label}</p>
            <p className="text-2xl font-bold text-primary">{items?.length ?? 0}</p>
            <p className="text-xs text-text-muted">records</p>
          </Card>
        ))}
      </div>

      {/* Close case modal */}
      {showCloseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-on-surface/30 backdrop-blur-sm p-4">
          <Card className="w-full max-w-md" padding="lg">
            <CardHeader>
              <CardTitle>Close Patient Case</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-text-secondary mb-5">
                Are you sure you want to close the case for <strong>{patient.firstName} {patient.lastName}</strong>?
              </p>
              <p className="text-sm font-medium text-on-surface mb-3">Reason for closing:</p>
              <div className="space-y-2 mb-6">
                {(['Improved', 'Deceased'] as const).map((r) => (
                  <label key={r} className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="radio"
                      name="closeReason"
                      value={r}
                      checked={closeReason === r}
                      onChange={() => setCloseReason(r)}
                      className="h-4 w-4 text-primary"
                    />
                    <span className="text-sm text-on-surface group-hover:text-primary transition-colors">{r}</span>
                  </label>
                ))}
              </div>
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => { setShowCloseModal(false); setCloseReason(''); }}>
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1"
                  disabled={!closeReason}
                  loading={closeCaseMutation.isPending}
                  onClick={handleCloseCase}
                >
                  Close Case
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

const Row: React.FC<{ icon?: React.ReactNode; label: string; value?: string; children?: React.ReactNode }> = ({ icon, label, value, children }) => (
  <div className="flex items-start gap-2">
    {icon && <span className="text-text-muted mt-0.5 flex-shrink-0">{icon}</span>}
    <div className="flex-1 min-w-0">
      <span className="text-text-muted text-xs">{label}: </span>
      {children || <span className="text-on-surface">{value || '—'}</span>}
    </div>
  </div>
);

export default AdminPatientDetailPage;
