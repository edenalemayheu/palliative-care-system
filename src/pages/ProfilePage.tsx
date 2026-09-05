import React from 'react';
import { useProfile, useUpdateProfile, useChangePassword, useActivityStats } from '@/hooks/useProfile';
import { ProfileInfo } from '@/components/profile/ProfileInfo';
import { ChangePassword } from '@/components/profile/ChangePassword';
import { ActivityStats } from '@/components/profile/ActivityStats';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { PageLoader } from '@/components/common/LoadingSpinner';
import { ErrorState } from '@/components/common/EmptyState';
import { BackButton } from '@/components/common/BackButton';
import { UserCircle, Mail, Phone, BadgeCheck, Calendar } from 'lucide-react';
import { formatDate } from '@/lib/utils';

const ProfilePage: React.FC = () => {
  const { data: profile, isLoading, error, refetch } = useProfile();
  const { data: stats, isLoading: statsLoading } = useActivityStats();
  const updateProfileMutation = useUpdateProfile();
  const changePasswordMutation = useChangePassword();
console.log(profile)
  if (isLoading || statsLoading) return <PageLoader />;
  if (error || !profile) return <ErrorState onRetry={refetch} />;

  const isStaff = profile.type === 'staff';

  return (
    <div className="max-w-4xl space-y-6">
      {/* Header with back button */}
      <div className="flex items-center gap-3">
        <BackButton to={profile.type === 'admin' ? '/admin' : '/dashboard'} label="Dashboard" />
        <h1 className="text-2xl font-bold text-on-surface">My Profile</h1>
      </div>

      {/* Identity Card - like patient identity section */}
      <Card padding="lg" className="border-l-4 border-l-primary">
        <div className="flex flex-col md:flex-row md:items-center gap-6">
          {/* Avatar */}
          <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-full bg-primary-light text-primary text-3xl font-bold">
            {profile.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)}
          </div>

          {/* Identity details */}
          <div className="flex-1 space-y-1">
            <h2 className="text-2xl font-bold text-on-surface">{profile.name}</h2>
            {isStaff && (
              <div className="flex items-center gap-3 mt-1">
                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  (profile as any).status === 'Active'
                    ? 'bg-success-bg text-success'
                    : (profile as any).status === 'Pending'
                    ? 'bg-warning-bg text-warning'
                    : 'bg-error-bg text-error'
                }`}>
                  {(profile as any).status || 'Active'}
                </span>
                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  (profile as any).isEmailVerified
                    ? 'bg-success-bg text-success'
                    : 'bg-warning-bg text-warning'
                }`}>
                  {isStaff && (profile as any).isEmailVerified ? '✓ Email Verified' : '⚠ Email Not Verified'}
                </span>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Profile Information */}
      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
        </CardHeader>
        <CardContent>
          <ProfileInfo
            profile={profile}
            onSave={updateProfileMutation.mutate}
            isSaving={updateProfileMutation.isPending}
          />
        </CardContent>
      </Card>

      {/* Change Password */}
      <Card>
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
        </CardHeader>
        <CardContent>
          <ChangePassword
            onSubmit={changePasswordMutation.mutate}
            isSubmitting={changePasswordMutation.isPending}
          />
        </CardContent>
      </Card>

      {/* Activity Statistics */}
      {stats && (
        <Card>
          <CardHeader>
            <CardTitle>My Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <ActivityStats stats={stats} userType={profile.type} />
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ProfilePage;