import type { User, LoginResponse, RegisterResponse, StaffProfile } from '@/types/auth.types';
import { delay } from '@/lib/utils';

// Mock users
export const MOCK_USERS = {
  staff: {
    id: 'staff-001',
    name: 'John Doe',
    email: 'john@gmail.com',
    phone: '+251911234567',
    role: 'Physician' as const,
    type: 'staff' as const,
    status: 'Active' as const,
    isEmailVerified: true,
    createdAt: '2026-01-15T08:00:00Z',
  } satisfies User,
  admin: {
    id: 'admin-001',
    name: 'Admin User',
    email: 'admin@example.com',
    type: 'admin' as const,
    createdAt: '2025-12-01T08:00:00Z',
  } satisfies User,
};

// Additional staff for admin panel fixtures
export const MOCK_STAFF_LIST = [
  { id: 'staff-001', name: 'John Doe', email: 'john@gmail.com', phone: '+251911234567', role: 'Physician' as const, status: 'Active' as const, isEmailVerified: true, createdAt: '2026-01-15T08:00:00Z' },
  { id: 'staff-002', name: 'Dr. Tigist Alemu', email: 'tigist@hospital.et', phone: '+251922345678', role: 'TeamLeader' as const, status: 'Active' as const, isEmailVerified: true, createdAt: '2026-01-20T08:00:00Z' },
  { id: 'staff-003', name: 'Nurse Selam Bekele', email: 'selam@hospital.et', phone: '+251933456789', role: 'Nurse' as const, status: 'Active' as const, isEmailVerified: true, createdAt: '2026-02-01T08:00:00Z' },
];

export const MOCK_PENDING_STAFF = [
  { id: 'staff-pending-001', name: 'Abebe Girma', email: 'abebe@example.com', phone: '+251944567890', role: null as null, status: 'Pending' as const, isEmailVerified: true, createdAt: '2026-08-28T10:00:00Z' },
  { id: 'staff-pending-002', name: 'Sara Tadesse', email: 'sara@example.com', phone: '+251955678901', role: null as null, status: 'Pending' as const, isEmailVerified: true, createdAt: '2026-08-27T14:00:00Z' },
  { id: 'staff-pending-003', name: 'Binyam Haile', email: 'binyam@example.com', phone: '+251966789012', role: null as null, status: 'Pending' as const, isEmailVerified: true, createdAt: '2026-08-26T09:00:00Z' },
];

export const MOCK_STAFF_PROFILE: StaffProfile = {
  id: 'staff-001',
  name: 'John Doe',
  email: 'john@gmail.com',
  phone: '+251911234567',
  role: 'Physician',
  status: 'Active',
  isEmailVerified: true,
  assignedPatientsCount: 8,
  todayVisitsCount: 3,
  createdAt: '2026-01-15T08:00:00Z',
};

export const mockAuthApi = {
  login: async (email: string, password: string): Promise<LoginResponse> => {
    await delay(600);
    if (email === 'john@gmail.com' && password === 'abcdefghi') {
      return { token: 'mock-staff-token-xyz123', user: MOCK_USERS.staff };
    }
    if (email === 'admin@example.com' && password === 'admin123') {
      return { token: 'mock-admin-token-abc456', user: MOCK_USERS.admin };
    }
    const err = new Error('Invalid email or password') as Error & { response?: { data?: { message: string }; status: number } };
    err.response = { data: { message: 'Invalid email or password' }, status: 401 };
    throw err;
  },

  register: async (data: { name: string; email: string; phone: string; password: string }): Promise<RegisterResponse> => {
    await delay(800);
    return {
      id: 'staff-new-' + Date.now(),
      name: data.name,
      email: data.email,
      phone: data.phone,
      status: 'Pending',
      isEmailVerified: false,
      createdAt: new Date().toISOString(),
    };
  },

  verifyEmail: async (token: string): Promise<{ email: string; isEmailVerified: boolean }> => {
    await delay(500);
    if (token === 'valid-token') {
      return { email: 'test@example.com', isEmailVerified: true };
    }
    if (token === 'expired-token') {
      const err = new Error('Verification link has expired. Please request a new one.') as Error & { response?: { data?: { message: string }; status: number } };
      err.response = { data: { message: 'Verification link has expired. Please request a new one.' }, status: 400 };
      throw err;
    }
    const err = new Error('Invalid verification link') as Error & { response?: { data?: { message: string }; status: number } };
    err.response = { data: { message: 'Invalid verification link' }, status: 400 };
    throw err;
  },

  resendVerification: async (email: string): Promise<{ email: string }> => {
    await delay(600);
    return { email };
  },

  getCurrentUser: async (): Promise<User> => {
    await delay(300);
    return MOCK_USERS.staff;
  },

  getStaffProfile: async (): Promise<StaffProfile> => {
    await delay(300);
    return MOCK_STAFF_PROFILE;
  },

  logout: async (): Promise<void> => {
    await delay(200);
  },

  updateProfile: async (data: { name?: string; phone?: string }) => {
    await delay(500);
    return { ...MOCK_STAFF_PROFILE, ...data, updatedAt: new Date().toISOString() };
  },
};
