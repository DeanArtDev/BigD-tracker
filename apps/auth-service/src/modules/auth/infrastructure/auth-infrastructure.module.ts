import {
  SESSIONS_WRITE_REPOSITORY,
  USERS_READ_REPOSITORY,
  USERS_WRITE_REPOSITORY,
} from '@/modules/auth/application/ports';

import {
  SessionWriteRepositoryKysely,
  UsersReadRepositoryKysely,
  UsersWriteRepositoryKysely,
} from './persistence/kysely/repositories';
import { Module } from '@nestjs/common';

@Module({
  exports: [SESSIONS_WRITE_REPOSITORY, USERS_WRITE_REPOSITORY, USERS_READ_REPOSITORY],
  providers: [
    { provide: USERS_READ_REPOSITORY, useClass: UsersReadRepositoryKysely },
    { provide: SESSIONS_WRITE_REPOSITORY, useClass: SessionWriteRepositoryKysely },
    { provide: USERS_WRITE_REPOSITORY, useClass: UsersWriteRepositoryKysely },
  ],
})
export class AuthInfrastructureModule {}
