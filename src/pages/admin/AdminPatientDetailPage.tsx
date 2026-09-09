import React, { useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  XCircle, Phone, MapPin, User, Calendar, ClipboardEdit, Plus,
  Pencil, Trash2, FileText, Printer, AlertTriangle,
} from 'lucide-react';
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
import { VisitEditModal } from '@/components/admin/VisitEditModal';
import { useUpdateVisit, useVisitEditHistory } from '@/hooks/useAdmin';
import type { DischargeSummary } from '@/components/admin/DischargePatientModal';
import { printDischargeSummary } from '@/lib/printDischargeSummary';
import { useToast } from '@/context/ToastContext';

// ── Frontend-only history entry type ────────────────────────────
interface HistoryEntry {
  id: string;
  date: string;
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
  entry?: HistoryEntry | null;
  onSave: (entry: HistoryEntry) => void;
  onClose: () => void;
}

const HistoryModal: React.FC<HistoryModalProps> = ({ entry, onSave, onClose }) => {
  const isEditing = !!entry;
  const [category, setCategory] = useState(entry?.category ?? 'Clinical Note');
  const [note, setNote] = useState(entry?.note ?? '');
  const [noteError, setNoteError] = useState('');
  const [editingVisit, setEditingVisit] = useState<string | null>(null);

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
          <div>
            <p className="text-xs font-medium text-on-surface mb-1">Date</p>
            <p className="text-sm text-text-secondary">
              {isEditing ? formatDate(entry!.date) : formatDate(new Date().toISOString())}
            </p>
          </div>

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

          <Textarea
            label="Note"
            rows={5}
            placeholder="Enter clinical note, observation, or history update…"
            value={note}
            onChange={(e) => { setNote(e.target.value); if (noteError) setNoteError(''); }}
            error={noteError}
          />
        </div>

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

// ── Discharge summary viewer modal ────────────────────────────────
interface DischargeSummaryViewerProps {
  summary: DischargeSummary;
  patientName: string;
  onClose: () => void;
  onPrint: () => void;
}

const DischargeSummaryViewer: React.FC<DischargeSummaryViewerProps> = ({
  summary, patientName, onClose, onPrint,
}) => {
  const rows: [string, string][] = [
    ['Patient', summary.fullName || patientName],
    ['Hospital / Facility', summary.hospitalName],
    ['Palliative Care Unit', summary.palliativeCareUnit],
    ['Date of Admission', summary.dateOfAdmission ? formatDate(summary.dateOfAdmission) : '—'],
    ['Date of Discharge', summary.dateOfDischarge ? formatDate(summary.dateOfDischarge) : '—'],
    ['Time of Discharge', summary.timeOfDischarge || '—'],
    ['Discharge Type', summary.dischargeType === 'Other' ? `Other — ${summary.dischargeTypeOther}` : summary.dischargeType || '—'],
    ['Discharged To', summary.dischargedTo === 'Other' ? `Other — ${summary.dischargedToOther}` : summary.dischargedTo || '—'],
    ['Overall Condition', summary.overallCondition || '—'],
    ['Primary Diagnosis', summary.primaryDiagnosis || '—'],
    ['Final Discharge Diagnosis', summary.finalDischargeDiagnosis || '—'],
    ['Pain Score at Discharge', summary.painScore ? `${summary.painScore} / 10` : '—'],
    ['Pain Control', summary.painControl || '—'],
    ['Medication Reconciliation', summary.medicationReconciliation || '—'],
    ['Code Status', summary.codeStatus || '—'],
    ['Transport', summary.transport || '—'],
    ['Submitted By', summary.submittedBy || '—'],
    ['Submitted At', summary.submittedAt
      ? new Date(summary.submittedAt).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
      : '—'],
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-on-surface/30 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="w-full max-w-2xl my-4 bg-surface-lowest rounded-2xl border border-border-base shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-border-base">
          <div className="flex items-center gap-2">
            <FileText size={17} className="text-primary" />
            <div>
              <h2 className="text-base font-semibold text-on-surface">Discharge Summary</h2>
              <p className="text-xs text-text-muted mt-0.5">{patientName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-text-muted hover:bg-surface-low transition-colors"
            aria-label="Close"
          >
            <XCircle size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5">
          <div className="divide-y divide-border-base">
            {rows.map(([label, value]) => (
              <div key={label} className="flex items-start gap-3 py-2.5 text-sm">
                <span className="text-text-muted min-w-[180px] flex-shrink-0 text-xs pt-0.5">{label}</span>
                <span className="text-on-surface font-medium">{value}</span>
              </div>
            ))}
          </div>

          {/* Discharge notes preview */}
          {summary.dischargeNotes && (
            <div className="mt-4">
              <p className="text-xs font-medium text-text-muted mb-1.5">Discharge Notes</p>
              <div className="bg-surface-low rounded-lg px-4 py-3 text-sm text-on-surface whitespace-pre-wrap">
                {summary.dischargeNotes}
              </div>
            </div>
          )}

          <p className="text-xs text-text-muted mt-4">
            This is a summary view. Use "Print / Save as PDF" to see the full discharge form with all sections.
          </p>
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-6 pb-5">
          <Button variant="outline" className="flex-1" onClick={onClose}>
            Close
          </Button>
          <Button
            variant="secondary"
            className="flex-1"
            leftIcon={<Printer size={14} />}
            onClick={onPrint}
          >
            Print / Save as PDF
          </Button>
        </div>
      </div>
    </div>
  );
};

// ── Tabs ──────────────────────────────────────────────────────────
const tabs = ['Visits', 'Medications', 'Labs', 'Referrals', 'Admissions'] as const;
type Tab = typeof tabs[number];

// ── Main page ─────────────────────────────────────────────────────
const AdminPatientDetailPage: React.FC = () => {
  const { patientId } = useParams<{ patientId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState<Tab>('Visits');

  // Close-case state
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [closeReason, setCloseReason] = useState<'Improved' | 'Deceased' | ''>('');

  // Discharge state — read from router location state (set by DischargePatientPage on success)
  const locationState = (location.state as {
    dischargeSummary?: DischargeSummary;
    dischargeHistoryEntry?: HistoryEntry;
  } | null) ?? null;

  const [dischargeSummary, setDischargeSummary] = useState<DischargeSummary | null>(
    locationState?.dischargeSummary ?? null
  );
  const [showDischargeSummaryViewer, setShowDischargeSummaryViewer] = useState(false);

  // Frontend-only patient history state — seed with discharge entry if returning from discharge page
  const [historyEntries, setHistoryEntries] = useState<HistoryEntry[]>(() =>
    locationState?.dischargeHistoryEntry ? [locationState.dischargeHistoryEntry] : []
  );
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [editingEntry, setEditingEntry] = useState<HistoryEntry | null>(null);

  // Primary patient data
  const { data: patient, isLoading, error, refetch } = useAdminPatientDetail(patientId!);

  // Sub-record data
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

  // ── Handlers ────────────────────────────────────────────────────

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
      return [entry, ...prev];
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

  const handlePrintDischargeSummary = () => {
    if (dischargeSummary) printDischargeSummary(dischargeSummary);
  };

  // Derive discharged-on date for header label
  const dischargedOnLabel = dischargeSummary?.dateOfDischarge
    ? formatDate(dischargeSummary.dateOfDischarge)
    : patient.status === 'Discharged' ? 'previously' : null;

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

          {/* Update History — always visible */}
          <Button
            variant="outline"
            size="sm"
            leftIcon={<ClipboardEdit size={14} />}
            onClick={() => { setEditingEntry(null); setShowHistoryModal(true); }}
          >
            Update History
          </Button>

          {/* Discharge Patient — only when Active; warning-toned to signal significance */}
          {patient.status === 'Active' && (
            <Button
              variant="outline"
              size="sm"
              leftIcon={<AlertTriangle size={14} className="text-warning" />}
              className="border-warning/50 text-warning hover:bg-warning/10 hover:border-warning"
              onClick={() => navigate(`/admin/patients/${patientId}/discharge`)}
            >
              Discharge Patient
            </Button>
          )}

          {/* View Discharge Summary — once discharged */}
          {patient.status === 'Discharged' && dischargeSummary && (
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<FileText size={14} />}
              onClick={() => setShowDischargeSummaryViewer(true)}
            >
              View Discharge Summary
            </Button>
          )}

          {/* Discharged label — if discharged but no local summary (e.g. via Close Case) */}
          {patient.status === 'Discharged' && !dischargeSummary && dischargedOnLabel && (
            <span className="text-xs text-text-muted px-2 py-1 rounded-lg border border-border-base bg-surface-low">
              Discharged {dischargedOnLabel}
            </span>
          )}

          {/* Close Case — only when Active */}
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
            {dischargeSummary && (
              <Row label="Discharged">
                <button
                  onClick={() => setShowDischargeSummaryViewer(true)}
                  className="text-primary text-xs underline underline-offset-2 hover:text-primary-hover transition-colors"
                >
                  {dischargeSummary.dateOfDischarge
                    ? formatDate(dischargeSummary.dateOfDischarge)
                    : 'View summary'}
                </button>
              </Row>
            )}
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
            <p className="text-xs text-text-muted mb-4">
              Click "Add Entry" or "Update History" to record clinical notes, observations, and care updates.
            </p>
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
                      {/* "View Discharge Summary" link next to the discharge history entry */}
                      {entry.id.startsWith('hist-discharge-') && dischargeSummary && (
                        <button
                          onClick={() => setShowDischargeSummaryViewer(true)}
                          className="text-xs text-primary underline underline-offset-2 hover:text-primary-hover transition-colors"
                        >
                          View Discharge Summary
                        </button>
                      )}
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

      {/* ── Discharge summary viewer ── */}
      {showDischargeSummaryViewer && dischargeSummary && (
        <DischargeSummaryViewer
          summary={dischargeSummary}
          patientName={`${patient.firstName} ${patient.lastName}`}
          onClose={() => setShowDischargeSummaryViewer(false)}
          onPrint={handlePrintDischargeSummary}
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
