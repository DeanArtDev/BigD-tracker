import { IsInt, IsString } from 'class-validator';
import { Expose } from 'class-transformer';

class AccessTokenPayload {
  @Expose()
  @IsInt()
  uid: number;

  @Expose()
  @IsString()
  sid: string;

  @Expose()
  @IsInt()
  iat: number;

  @Expose()
  @IsInt()
  exp: number;
}

export { AccessTokenPayload };
