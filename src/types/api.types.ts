export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  error: {
    code: string;
    message: string;
    details?: any;
    [key: string]: any;
  } | null;
  requestId: string;
}
