import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsBoolean } from 'class-validator';

class DeleteGroupRes {
  @ApiProperty({
    description: 'Ответ сервера',
    type: Boolean,
  })
  @Expose()
  @IsBoolean()
  data: boolean;
}

export { DeleteGroupRes };
