import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { updateProfileSchema, UpdateProfileFormData } from '@/schemas/profile.schema';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { StatusBadge } from '@/components/common/StatusBadge';
import { formatDate } from '@/lib/utils';
import { Profile } from '@/types/profile.types';

interface ProfileInfoProps {
  profile: Profile;
  onSave: (data: UpdateProfileFormData) => void;
  isSaving?: boolean;
}

export const ProfileInfo: React.FC<ProfileInfoProps> = ({ profile, onSave, isSaving }) => {
  const [isEditing, setIsEditing] = useState(false);
  const isStaff = profile.type === 'staff';

  const { register, handleSubmit, formState: { errors }, reset } = useForm<UpdateProfileFormData>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      name: profile.name,
      phone: isStaff ? (profile as any).phone || '' : '',
    },
  });

  const handleCancel = () => {
    reset({
      name: profile.name,
      phone: isStaff ? (profile as any).phone || '' : '',
    });
    setIsEditing(false);
  };

  const onSubmit = (data: UpdateProfileFormData) => {
    onSave(data);
    setIsEditing(false);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-on-surface">Full Name</label>
          {isEditing ? (
            <Input
              {...register('name')}
              error={errors.name?.message}
              className="mt-1"
            />
          ) : (
            <p className="mt-1 text-sm text-on-surface">{profile.name}</p>
          )}
        </div>

        <div>
          <label className="text-sm font-medium text-on-surface">Email</label>
          <p className="mt-1 text-sm text-text-secondary">{profile.email} (read-only)</p>
        </div>

        {isStaff && (
          <div>
            <label className="text-sm font-medium text-on-surface">Phone</label>
            {isEditing ? (
              <Input
                {...register('phone')}
                error={errors.phone?.message}
                className="mt-1"
              />
            ) : (
              <p className="mt-1 text-sm text-on-surface">{(profile as any).phone || '—'}</p>
            )}
          </div>
        )}

        <div>
          <label className="text-sm font-medium text-on-surface">Role</label>
          <p className="mt-1 text-sm text-on-surface">
            {isStaff ? (profile as any).role || 'Staff' : 'Administrator'}
          </p>
        </div>

        {isStaff && (
          <>
            <div>
              <label className="text-sm font-medium text-on-surface">Status</label>
              <div className="mt-1">
                <StatusBadge status={(profile as any).status} type="staff" />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-on-surface">Email Verified</label>
              <div className="mt-1">
                <Badge variant={(profile as any).isEmailVerified ? 'success' : 'warning'}>
                  {(profile as any).isEmailVerified ? 'Verified' : 'Pending'}
                </Badge>
              </div>
            </div>
          </>
        )}

        <div>
          <label className="text-sm font-medium text-on-surface">Member Since</label>
          <p className="mt-1 text-sm text-text-secondary">{formatDate(profile.createdAt)}</p>
        </div>
      </div>

      <div className="flex gap-3 pt-4 border-t border-border-base">
        {isEditing ? (
          <>
            <Button type="submit" loading={isSaving}>Save Changes</Button>
            <Button type="button" variant="outline" onClick={handleCancel}>Cancel</Button>
          </>
        ) : (
          <Button type="button" variant="outline" onClick={() => setIsEditing(true)}>
            Edit Profile
          </Button>
        )}
      </div>
    </form>
  );
};