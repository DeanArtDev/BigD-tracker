import { Injectable } from '@nestjs/common';
import { KyselyService } from '@shared/modules/db';

/*TODO:
 *  - удалять просроченные токены по крону, раз в неделю
 *  - в базе рефреш токены захешированы
 * */
@Injectable()
export class AuthRepository {
  constructor(private kyselyService: KyselyService) {}

  generateRefreshToken() {
    return null;
  }
}
