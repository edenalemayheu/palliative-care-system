import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/api/admin';
import type { ApproveStaffRequest, CloseCaseRequest } from '@/types/admin.types';

export function useDashboardStats() {
  return useQuery({
    queryKey: ['admin', 'dashboard', 'stats'],
    queryFn: () => adminApi.getDashboardStats(),
    refetchInterval: 30000,
  });
}

export function useNotifications(params?: { limit?: number; read?: boolean }) {
  return useQuery({
    queryKey: ['admin', 'dashboard', 'notifications', params],
    queryFn: () => adminApi.getNotifications(params),
    refetchInterval: 30000,
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminApi.markNotificationRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard', 'notifications'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard', 'stats'] });
    },
  });
}

export function useAdminPatients(params?: { page?: number; limit?: number; status?: string; search?: string }) {
  return useQuery({
    queryKey: ['admin', 'patients', params],
    queryFn: () => adminApi.getPatients(params),
  });
}

export function useAdminPatientDetail(patientId: string) {
  return useQuery({
    queryKey: ['admin', 'patients', patientId],
    queryFn: () => adminApi.getPatientDetail(patientId),
    enabled: !!patientId,
  });
}

export function useCloseCase() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ patientId, data }: { patientId: string; data: CloseCaseRequest }) =>
      adminApi.closeCase(patientId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin'] });
      queryClient.invalidateQueries({ queryKey: ['patients'] });
    },
  });
}

export function usePendingStaff() {
  return useQuery({
    queryKey: ['admin', 'staff', 'pending'],
    queryFn: () => adminApi.getPendingStaff(),
  });
}

export function useApproveStaff() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ staffId, data }: { staffId: string; data: ApproveStaffRequest }) =>
      adminApi.approveStaff(staffId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'staff', 'pending'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard'] });
    },
  });
}

export function useRejectStaff() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (staffId: string) => adminApi.rejectStaff(staffId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'staff', 'pending'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard'] });
    },
  });
}

export function usePendingReferrals() {
  return useQuery({
    queryKey: ['admin', 'referrals', 'pending'],
    queryFn: () => adminApi.getPendingReferrals(),
  });
}

export function useApproveReferral() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (referralId: string) => adminApi.approveReferral(referralId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'referrals'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['patients'] });
    },
  });
}

export function useDeclineReferral() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (referralId: string) => adminApi.declineReferral(referralId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'referrals'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard'] });
    },
  });
}

export function useReports(params?: { startDate?: string; endDate?: string }) {
  return useQuery({
    queryKey: ['admin', 'reports', params],
    queryFn: () => adminApi.getReports(params),
  });
}

export function useExportReport() {
  return useMutation({
    mutationFn: ({ format }: { format: 'pdf' | 'excel' }) => adminApi.exportReport(format),
  });
}
