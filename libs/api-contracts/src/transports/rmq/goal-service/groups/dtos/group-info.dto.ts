import { IsInt, IsString } from 'class-validator';

class GroupInfoDto {
  @IsInt()
  id: number;

  @IsString()
  name: string;
}

export { GroupInfoDto };
