import { $publicQueryClient } from '@/shared/api/api-client';

function useReferralTokenValidate(params: { token?: string }) {
  const { data, ...others } = $publicQueryClient.useQuery(
    'get',
    '/auth/referral-token/validate',
    { params: { query: { token: params.token! } } },
    {
      enabled: params?.token != null,
      retry: 1,
    },
  );
  return { data: data?.data, ...others };
}

export { useReferralTokenValidate };
