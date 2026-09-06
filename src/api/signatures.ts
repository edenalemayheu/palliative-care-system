import apiClient from './client';
import { USE_MOCK } from '@/lib/config';
import type {
  SignVisitRequest,
  SignVisitResponse,
  VisitSignaturesResponse
} from '@/types/signature.types';

export const signatureApi = {
  signVisit: (visitId: string, data: SignVisitRequest): Promise<SignVisitResponse> => {
    return apiClient.post<SignVisitResponse>(`/visits/${visitId}/sign`, data).then((r) => r.data);
  },

  getVisitSignatures: (visitId: string): Promise<VisitSignaturesResponse> => {
    return apiClient.get<VisitSignaturesResponse>(`/visits/${visitId}/signatures`).then((r) => r.data);
  },
};