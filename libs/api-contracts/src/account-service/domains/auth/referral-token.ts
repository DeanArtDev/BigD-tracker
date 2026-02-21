import { ReferralTokenReq, ReferralTokenRes } from './dtos';

export namespace AccountReferralToken {
  export const pattern = 'account.referral-token.command';

  export class Request extends ReferralTokenReq {}

  export class Response extends ReferralTokenRes {}
}
