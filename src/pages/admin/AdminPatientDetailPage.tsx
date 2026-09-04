import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { XCircle, Phone, MapPin, User, Calendar, ClipboardEdit, Plus, Pencil, Trash2 } from 'lucide-react';
import { useAdminPatientDetail, useCloseCase } from '@/hooks/useAdmin';
import { usePatientVisits } from '@/hooks/useVisits';
import { usePatientMedications } from '@/hooks/useMedications';
import { usePatientLabs } from '@/hooks/useLabs';
import { usePatientReferrals } from '@/hooks/useReferrals';
import { usePatientAdmissions } from '@/hooks/useAdmissions';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Textarea } from '@/components/ui/Textarea';
import { StatusBadge } from '@/components/common/StatusBadge';
import { BackButton } from '@/components/common/BackButton';
import { PageLoader } from '@/components/common/LoadingSpinner';
import { EmptyState, ErrorState } from '@/components/common/EmptyState';
import { formatDate, cn } from '@/lib/utils';
import { DISEASE_STAGE_LABELS as DSL, VISIT_TYPE_LABELS } from '@/constants';

// ── Frontend-only history entry type ────────────────────────────
interface HistoryEntry {
  id: string;
  date: string;           // ISO string
  category: string;
  note: string;
  addedBy: string;
}

const CATEGORY_OPTIONS = [
  'Clinical Note',
  'Care Observation',
  'Symptom Update',
  'Progress Note',
  'Visit Note',
  'Family Communication',
  'Other',
] as const;

// ── History modal (add / edit) ───────────────────────────────────
interface HistoryModalProps {
  entry?: HistoryEntry | null;   // null/undefined = adding new
  onSave: (entry: HistoryEntry) => void;
  onClose: () => void;
}

const HistoryModal: React.FC<HistoryModalProps> = ({ entry, onSave, onClose }) => {
  const isEditing = !!entry;
  const [category, setCategory] = useState(entry?.category ?? 'Clinical Note');
  const [note, setNote] = useState(entry?.note ?? '');
  const [noteError, setNoteError] = useState('');

  const handleSave = () => {
    if (!note.trim()) { setNoteError('Note cannot be empty.'); return; }
    onSave({
      id: entry?.id ?? `hist-${Date.now()}`,
      date: entry?.date ?? new Date().toISOString(),
      category,
      note: note.trim(),
      addedBy: entry?.addedBy ?? 'Admin',
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-on-surface/30 backdrop-blur-sm p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="history-modal-title"
    >
      <div className="w-full max-w-lg bg-surface-lowest rounded-2xl border border-border-base shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-border-base">
          <div className="flex items-center gap-2">
            <ClipboardEdit size={17} className="text-primary" />
            <h2 id="history-modal-title" className="text-base font-semibold text-on-surface">
              {isEditing ? 'Edit History Entry' : 'Add History Entry'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-text-muted hover:bg-surface-low transition-colors"
            aria-label="Close"
          >
            <XCircle size={16} />
          </button>
        </div>

        {/* Form */}
        <div className="px-6 py-5 space-y-4">
          {/* Date — read-only, shown for context */}
          <div>
            <p className="text-xs font-medium text-on-surface mb-1">Date</p>
            <p className="text-sm text-text-secondary">
              {isEditing ? formatDate(entry!.date) : formatDate(new Date().toISOString())}
            </p>
          </div>

          {/* Category */}
          <div>
            <label htmlFor="history-category" className="block text-sm font-medium text-on-surface mb-1">
              Category
            </label>
            <select
              id="history-category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className={cn(
                'block w-full rounded-lg border border-border-base bg-surface-lowest px-3 py-2 text-sm text-on-surface',
                'focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary',
                'hover:border-outline-variant transition-colors'
              )}
            >
              {CATEGORY_OPTIONS.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Note */}
          <Textarea
            label="Note"
            rows={5}
            placeholder="Enter clinical note, observation, or history update…"
            value={note}
            onChange={(e) => { setNote(e.target.value); if (noteError) setNoteError(''); }}
            error={noteError}
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3 px-6 pb-5">
          <Button variant="outline" className="flex-1" onClick={onClose}>
            Cancel
          </Button>
          <Button className="flex-1" onClick={handleSave}>
            {isEditing ? 'Save Changes' : 'Add Entry'}
          </Button>
        </div>
      </div>
    </div>
  );
};

const tabs = ['Visits', 'Medications', 'Labs', 'Referrals', 'Admissions'] as const;
type Tab = typeof tabs[number];

const AdminPatientDetailPage: React.FC = () => {
  const { patientId } = useParams<{ patientId: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>('Visits');
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [closeReason, setCloseReason] = useState<'Improved' | 'Deceased' | ''>('');

  // Frontend-only patient history state
  const [historyEntries, setHistoryEntries] = useState<HistoryEntry[]>([]);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [editingEntry, setEditingEntry] = useState<HistoryEntry | null>(null);

  // Primary patient data
  const { data: patient, isLoading, error, refetch } = useAdminPatientDetail(patientId!);

  // Sub-record data — same hooks as staff patient detail page
  const { data: visitsData } = usePatientVisits(patientId!);
  const { data: medsData } = usePatientMedications(patientId!);
  const { data: labsData } = usePatientLabs(patientId!);
  const { data: refsData } = usePatientReferrals(patientId!);
  const { data: admsData } = usePatientAdmissions(patientId!);

  const closeCaseMutation = useCloseCase();

  if (isLoading) return <PageLoader />;
  if (error || !patient) return <ErrorState onRetry={refetch} />;

  const tabCounts: Record<Tab, number> = {
    Visits:      visitsData?.total ?? 0,
    Medications: medsData?.total   ?? 0,
    Labs:        labsData?.total   ?? 0,
    Referrals:   refsData?.total   ?? 0,
    Admissions:  admsData?.total   ?? 0,
  };

  const handleCloseCase = () => {
    if (!closeReason) return;
    closeCaseMutation.mutate(
      { patientId: patientId!, data: { reason: closeReason } },
      { onSuccess: () => { setShowCloseModal(false); refetch(); } }
    );
  };

  const handleHistorySave = (entry: HistoryEntry) => {
    setHistoryEntries((prev) => {
      const exists = prev.findIndex((e) => e.id === entry.id);
      if (exists >= 0) {
        const updated = [...prev];
        updated[exists] = entry;
        return updated;
      }
      return [entry, ...prev];   // newest first
    });
    setShowHistoryModal(false);
    setEditingEntry(null);
  };

  const handleHistoryEdit = (entry: HistoryEntry) => {
    setEditingEntry(entry);
    setShowHistoryModal(true);
  };

  const handleHistoryDelete = (id: string) => {
    setHistoryEntries((prev) => prev.filter((e) => e.id !== id));
  };

  return (
    <div className="space-y-6 max-w-5xl">

      {/* ── Header ── */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <BackButton to="/admin/patients" label="All Patients" />
          <div>
            <p className="text-xs text-text-muted font-mono">{patient.patientDisplayId}</p>
            <h1 className="text-xl font-bold text-on-surface">{patient.firstName} {patient.lastName}</h1>
          </div>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <StatusBadge status={patient.status} type="patient" />
          <StatusBadge status={patient.currentLocation} />
          <Button
            variant="outline"
            size="sm"
            leftIcon={<ClipboardEdit size={14} />}
            onClick={() => { setEditingEntry(null); setShowHistoryModal(true); }}
          >
            Update History
          </Button>
          {patient.status === 'Active' && (
            <Button
              variant="destructive"
              size="sm"
              leftIcon={<XCircle size={14} />}
              onClick={() => setShowCloseModal(true)}
            >
              Close Case
            </Button>
          )}
        </div>
      </div>

      {/* ── Demographics + Medical cards ── */}
      <div className="grid lg:grid-cols-2 gap-5">
        <Card>
          <CardHeader><CardTitle>Patient Information</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            <Row icon={<User size={14} />}     label="Name"              value={`${patient.firstName} ${patient.lastName}`} />
            <Row icon={<Calendar size={14} />} label="Date of Birth"     value={formatDate(patient.dateOfBirth)} />
            <Row                               label="Age / Sex"         value={`${patient.age} years · ${patient.sex}`} />
            <Row icon={<MapPin size={14} />}   label="Address"           value={patient.address} />
            <Row icon={<Phone size={14} />}    label="Phone"             value={patient.phone} />
            <Row                               label="Emergency Contact" value={`${patient.emergencyContactName} · ${patient.emergencyContactPhone}`} />
            <Row                               label="Caregiver"         value={`${patient.caregiverName} · ${patient.caregiverPhone}`} />
          </CardContent>
        </Card>

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

      {/* ── Patient History ── */}
      <Card padding="none">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border-base">
          <div className="flex items-center gap-2">
            <ClipboardEdit size={16} className="text-primary" />
            <h2 className="text-sm font-semibold text-on-surface">Patient History</h2>
            {historyEntries.length > 0 && (
              <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-surface-container text-[10px] font-bold text-text-secondary px-1">
                {historyEntries.length}
              </span>
            )}
          </div>
          <Button
            size="sm"
            variant="outline"
            leftIcon={<Plus size={13} />}
            onClick={() => { setEditingEntry(null); setShowHistoryModal(true); }}
          >
            Add Entry
          </Button>
        </div>

        {historyEntries.length === 0 ? (
          <div className="px-5 py-8 text-center">
            <p className="text-sm font-medium text-on-surface mb-1">No history entries yet</p>
            <p className="text-xs text-text-muted mb-4">Click "Add Entry" or "Update History" to record clinical notes, observations, and care updates.</p>
            <Button
              size="sm"
              variant="outline"
              leftIcon={<Plus size={13} />}
              onClick={() => { setEditingEntry(null); setShowHistoryModal(true); }}
            >
              Add First Entry
            </Button>
          </div>
        ) : (
          <div className="divide-y divide-border-base">
            {historyEntries.map((entry) => (
              <div key={entry.id} className="px-5 py-4 hover:bg-surface-low/40 transition-colors">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <Badge variant="secondary">{entry.category}</Badge>
                      <span className="text-xs text-text-muted">{formatDate(entry.date)}</span>
                      <span className="text-xs text-text-muted">· {entry.addedBy}</span>
                    </div>
                    <p className="text-sm text-on-surface leading-relaxed whitespace-pre-wrap">{entry.note}</p>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={() => handleHistoryEdit(entry)}
                      className="p-1.5 rounded-lg text-text-muted hover:text-primary hover:bg-primary-light transition-all"
                      aria-label="Edit entry"
                      title="Edit"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => handleHistoryDelete(entry.id)}
                      className="p-1.5 rounded-lg text-text-muted hover:text-error hover:bg-error-bg transition-all"
                      aria-label="Delete entry"
                      title="Delete"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* ── Tabbed records ── */}
      <Card padding="none">
        {/* Tab strip */}
        <div className="flex border-b border-border-base overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                'flex items-center gap-2 px-5 py-3.5 text-sm font-medium whitespace-nowrap transition-all border-b-2',
                activeTab === tab
                  ? 'border-primary text-primary'
                  : 'border-transparent text-on-surface-variant hover:text-on-surface hover:bg-surface-low'
              )}
            >
              {tab}
              {tabCounts[tab] > 0 && (
                <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-surface-container text-[10px] font-bold text-text-secondary px-1">
                  {tabCounts[tab]}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="p-5 overflow-x-auto">

          {/* Visits */}
          {activeTab === 'Visits' && (
            visitsData?.items?.length ? (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-text-muted">
                    {['Date', 'Type', 'Status', 'Outcome', 'Scores'].map((h) => (
                      <th key={h} className="pb-3 pr-4 font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-base">
                  {visitsData.items.map((v) => (
                    <tr
                      key={v.id}
                      className="hover:bg-surface-low cursor-pointer"
                      onClick={() => navigate(`/admin/patients/${patientId}/visits/${v.id}`)}
                    >
                      <td className="py-3 pr-4">{formatDate(v.visitDate)}</td>
                      <td className="py-3 pr-4">
                        <Badge variant="secondary">{VISIT_TYPE_LABELS[v.visitType] || v.visitType}</Badge>
                      </td>
                      <td className="py-3 pr-4"><StatusBadge status={v.overallStatus} /></td>
                      <td className="py-3 pr-4"><StatusBadge status={v.outcome} type="visit" /></td>
                      <td className="py-3 text-text-muted text-xs">PPS {v.ppsScore}% · KPS {v.kpsScore}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <EmptyState title="No visits recorded" description="No home visits have been recorded for this patient yet." />
            )
          )}

          {/* Medications */}
          {activeTab === 'Medications' && (
            medsData?.items?.length ? (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-text-muted">
                    {['Medication', 'Dosage', 'Frequency', 'Route', 'Admin At', 'Status'].map((h) => (
                      <th key={h} className="pb-3 pr-4 font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-base">
                  {medsData.items.map((m) => (
                    <tr
                      key={m.id}
                      className="hover:bg-surface-low cursor-pointer"
                      onClick={() => navigate(`/admin/patients/${patientId}/medications/${m.id}`)}
                    >
                      <td className="py-3 pr-4 font-medium">{m.name}</td>
                      <td className="py-3 pr-4 text-text-secondary">{m.dosage}</td>
                      <td className="py-3 pr-4 text-text-secondary">{m.frequency}</td>
                      <td className="py-3 pr-4 text-text-secondary">{m.route}</td>
                      <td className="py-3 pr-4 text-text-secondary">{m.administeredAt}</td>
                      <td className="py-3 pr-4"><StatusBadge status={m.status} type="medication" /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <EmptyState title="No medications ordered" description="No medications have been ordered for this patient yet." />
            )
          )}

          {/* Labs */}
          {activeTab === 'Labs' && (
            labsData?.items?.length ? (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-text-muted">
                    {['Test', 'Ordered', 'Performed', 'Location', 'Status', 'Result'].map((h) => (
                      <th key={h} className="pb-3 pr-4 font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-base">
                  {labsData.items.map((l) => (
                    <tr
                      key={l.id}
                      className="hover:bg-surface-low cursor-pointer"
                      onClick={() => navigate(`/admin/patients/${patientId}/labs/${l.id}`)}
                    >
                      <td className="py-3 pr-4 font-medium">{l.testName}</td>
                      <td className="py-3 pr-4 text-text-secondary">{formatDate(l.dateOrdered)}</td>
                      <td className="py-3 pr-4 text-text-secondary">{l.datePerformed ? formatDate(l.datePerformed) : '—'}</td>
                      <td className="py-3 pr-4 text-text-secondary">{l.location}</td>
                      <td className="py-3 pr-4"><StatusBadge status={l.status} type="lab" /></td>
                      <td className="py-3 text-text-muted text-xs max-w-[160px] truncate">{l.result || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <EmptyState title="No lab tests ordered" description="No laboratory tests have been ordered for this patient yet." />
            )
          )}

          {/* Referrals */}
          {activeTab === 'Referrals' && (
            refsData?.items?.length ? (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-text-muted">
                    {['Date', 'Type', 'Receiving Facility', 'Status', 'Created'].map((h) => (
                      <th key={h} className="pb-3 pr-4 font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-base">
                  {refsData.items.map((r) => (
                    <tr
                      key={r.id}
                      className="hover:bg-surface-low cursor-pointer"
                      onClick={() => navigate(`/admin/patients/${patientId}/referrals/${r.id}`)}
                    >
                      <td className="py-3 pr-4">{formatDate(r.referralDate)}</td>
                      <td className="py-3 pr-4 text-text-secondary">{r.referralType}</td>
                      <td className="py-3 pr-4 text-text-secondary truncate max-w-[200px]">{r.receivingFacility}</td>
                      <td className="py-3 pr-4"><StatusBadge status={r.status} type="referral" /></td>
                      <td className="py-3 text-text-muted text-xs">{formatDate(r.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <EmptyState title="No referrals requested" description="No referrals have been submitted for this patient yet." />
            )
          )}

          {/* Admissions */}
          {activeTab === 'Admissions' && (
            admsData?.items?.length ? (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-text-muted">
                    {['Admission Date', 'Bed', 'Ward', 'Physician', 'Status', 'Discharge'].map((h) => (
                      <th key={h} className="pb-3 pr-4 font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-base">
                  {admsData.items.map((a) => (
                    <tr
                      key={a.id}
                      className="hover:bg-surface-low cursor-pointer"
                      onClick={() => navigate(`/admin/patients/${patientId}/admissions/${a.id}`)}
                    >
                      <td className="py-3 pr-4">{formatDate(a.admissionDate)}</td>
                      <td className="py-3 pr-4 text-text-secondary">{a.bedNumber}</td>
                      <td className="py-3 pr-4 text-text-secondary">{a.ward}</td>
                      <td className="py-3 pr-4 text-text-secondary">{a.admittingPhysician}</td>
                      <td className="py-3 pr-4"><StatusBadge status={a.status} type="admission" /></td>
                      <td className="py-3 text-text-muted text-xs">{a.dischargeDate ? formatDate(a.dischargeDate) : 'Ongoing'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <EmptyState title="No admissions recorded" description="No hospital admissions have been recorded for this patient yet." />
            )
          )}

        </div>
      </Card>

      {/* ── History modal ── */}
      {showHistoryModal && (
        <HistoryModal
          entry={editingEntry}
          onSave={handleHistorySave}
          onClose={() => { setShowHistoryModal(false); setEditingEntry(null); }}
        />
      )}

      {/* ── Close Case modal ── */}
      {showCloseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-on-surface/30 backdrop-blur-sm p-4">
          <Card className="w-full max-w-md" padding="lg">
            <CardHeader>
              <CardTitle>Close Patient Case</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-text-secondary mb-5">
                Are you sure you want to close the case for{' '}
                <strong>{patient.firstName} {patient.lastName}</strong>?
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
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => { setShowCloseModal(false); setCloseReason(''); }}
                >
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

// ── Helpers ──────────────────────────────────────────────────────
const Row: React.FC<{
  icon?: React.ReactNode;
  label: string;
  value?: string;
  children?: React.ReactNode;
}> = ({ icon, label, value, children }) => (
  <div className="flex items-start gap-2">
    {icon && <span className="text-text-muted mt-0.5 flex-shrink-0">{icon}</span>}
    <div className="flex-1 min-w-0">
      <span className="text-text-muted text-xs">{label}: </span>
      {children || <span className="text-on-surface">{value || '—'}</span>}
    </div>
  </div>
);

export default AdminPatientDetailPage;
