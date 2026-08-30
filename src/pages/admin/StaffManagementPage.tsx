import React, { useState } from 'react';
import { UserCheck, UserX } from 'lucide-react';
import { usePendingStaff, useApproveStaff, useRejectStaff } from '@/hooks/useAdmin';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { PageLoader } from '@/components/common/LoadingSpinner';
import { EmptyState, ErrorState } from '@/components/common/EmptyState';
import { formatDate, formatRelativeTime } from '@/lib/utils';

const StaffManagementPage: React.FC = () => {
  const { data: pendingStaff, isLoading, error, refetch } = usePendingStaff();
  const approveStaffMutation = useApproveStaff();
  const rejectStaffMutation = useRejectStaff();
  const [roleSelections, setRoleSelections] = useState<Record<string, string>>({});

  if (isLoading) return <PageLoader />;
  if (error) return <ErrorState onRetry={refetch} />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-on-surface">Staff Management</h1>
          <p className="text-sm text-text-secondary">Approve or reject staff registration requests</p>
        </div>
        {(pendingStaff?.length ?? 0) > 0 && (
          <Badge variant="warning">{pendingStaff?.length} pending</Badge>
        )}
      </div>

      <Card padding="none">
        {!pendingStaff?.length ? (
          <EmptyState
            icon={<UserCheck size={28} />}
            title="No pending staff registrations"
            description="All registration requests have been reviewed."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-surface-low border-b border-border-base">
                <tr>
                  {['Name', 'Email', 'Phone', 'Registered', 'Assign Role', 'Actions'].map((h) => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-on-surface-variant">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border-base">
                {pendingStaff.map((staff) => (
                  <tr key={staff.id} className="hover:bg-surface-low/40 transition-colors">
                    <td className="px-5 py-4">
                      <div>
                        <p className="font-medium text-on-surface">{staff.name}</p>
                        <p className="text-xs text-text-muted">{staff.isEmailVerified ? 'Email verified' : 'Email not verified'}</p>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-text-secondary">{staff.email}</td>
                    <td className="px-5 py-4 text-text-secondary">{staff.phone}</td>
                    <td className="px-5 py-4 text-text-muted text-xs">{formatRelativeTime(staff.createdAt)}</td>
                    <td className="px-5 py-4">
                      <Select
                        options={[
                          { value: 'TeamLeader', label: 'Team Leader' },
                          { value: 'Physician', label: 'Physician' },
                          { value: 'Nurse', label: 'Nurse' },
                        ]}
                        placeholder="Select role…"
                        value={roleSelections[staff.id] || ''}
                        onChange={(e) => setRoleSelections((prev) => ({ ...prev, [staff.id]: e.target.value }))}
                        className="w-40 text-xs"
                      />
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          leftIcon={<UserCheck size={13} />}
                          disabled={!roleSelections[staff.id]}
                          loading={approveStaffMutation.isPending}
                          onClick={() => roleSelections[staff.id] && approveStaffMutation.mutate({
                            staffId: staff.id,
                            data: { role: roleSelections[staff.id] as 'TeamLeader' | 'Physician' | 'Nurse' }
                          })}
                        >
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          leftIcon={<UserX size={13} />}
                          loading={rejectStaffMutation.isPending}
                          onClick={() => rejectStaffMutation.mutate(staff.id)}
                        >
                          Reject
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};

export default StaffManagementPage;
