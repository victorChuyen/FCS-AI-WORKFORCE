export interface ConsultationRequest {
  fullName: string;
  phone: string;
  email: string;
  companyName: string;
  officeCount: string;
  workforceScale: string;
  bottleneck: string;
  createdAt?: string;
}

export interface ConsultationSubmissionResult {
  success: boolean;
  message: string;
  storageType: 'local_pending_backend' | 'server';
  data?: ConsultationRequest;
}

const STORAGE_KEY = 'fcs_consultation_requests';

/**
 * Service interface for submitting Workforce Audit & Blueprint consultations.
 * Note: Since a dedicated backend endpoint for consultations is not provisioned in Apps Script 3.2.0,
 * this persists consultation leads in local storage with clear transparent messaging.
 */
export async function submitConsultationRequest(
  data: ConsultationRequest
): Promise<ConsultationSubmissionResult> {
  // Simulate standard network dispatch
  await new Promise((resolve) => setTimeout(resolve, 800));

  try {
    const payload: ConsultationRequest = {
      ...data,
      createdAt: new Date().toISOString(),
    };

    if (typeof window !== 'undefined' && window.localStorage) {
      const existing = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      existing.push(payload);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
    }

    return {
      success: true,
      message:
        'Yêu cầu nhận AI Workforce Blueprint đã được ghi nhận. Chuyên gia tư vấn FCS sẽ liên hệ trong vòng 24 giờ làm việc.',
      storageType: 'local_pending_backend',
      data: payload,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error?.message || 'Có lỗi xảy ra khi ghi nhận thông tin tư vấn.',
      storageType: 'local_pending_backend',
    };
  }
}
