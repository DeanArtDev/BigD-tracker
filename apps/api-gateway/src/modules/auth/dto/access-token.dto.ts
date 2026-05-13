import { Expose } from 'class-transformer';
import { IsInt } from 'class-validator';

class AccessTokenPayload {
  @Expose()
  @IsInt()
  uid: number;

  @Expose()
  @IsInt()
  sid: number;

  @Expose()
  @IsInt()
  iat: number;

  @Expose()
  @IsInt()
  exp: number;
}

export { AccessTokenPayload };
