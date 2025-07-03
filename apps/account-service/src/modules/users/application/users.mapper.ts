import { BaseMapper } from '@big-d/api-utils';
import { Injectable } from '@nestjs/common';
import { UserDto } from '@big-d/api-contracts';
import { UserEntity } from '../domain/user.entity';

@Injectable()
class UserMapper extends BaseMapper<UserDto, UserEntity> {
  constructor() {
    super();
  }

  fromEntityToDTO = (entity: UserEntity): UserDto => {
    return this.entityToDTO(entity, UserDto);
  };
}

export { UserMapper };
