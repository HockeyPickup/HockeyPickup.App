import type { ErrorDetail } from '@/HockeyPickup.Api';

export interface ApiError {
  response?: {
    data?: {
      Errors?: ErrorDetail[];
    };
  };
}
