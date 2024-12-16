import { ErrorDetail } from '@/HockeyPickup.Api';

interface ApiErrorResponse {
  response: {
    data: {
      Errors: ErrorDetail[];
    };
  };
}

export const isApiErrorResponse = (error: unknown): error is ApiErrorResponse => {
  return (
    typeof error === 'object' &&
    error !== null &&
    'response' in error &&
    typeof error.response === 'object' &&
    error.response !== null &&
    'data' in error.response &&
    typeof error.response.data === 'object' &&
    error.response.data !== null &&
    'Errors' in error.response.data &&
    Array.isArray(error.response.data.Errors)
  );
};
