import { $privetQueryClient } from '@/shared/api/api-client';

function useReferralToken() {
  const { mutate: generateReferralToken, ...states } = $privetQueryClient.useMutation(
    'post',
    '/auth/referral-token',
  );

  return { generateReferralToken, ...states };
}

export { useReferralToken };
