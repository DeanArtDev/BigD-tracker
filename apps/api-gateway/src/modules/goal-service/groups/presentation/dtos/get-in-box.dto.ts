import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { IsInt, IsString, ValidateNested } from 'class-validator';

class GetInBoxResData {
  @ApiProperty({
    example: 1,
  })
  @Expose()
  @IsInt()
  id: number;

  @ApiProperty({ example: 'Имя inbox' })
  @Expose()
  @IsString()
  name: string;
}

class GetInBoxRes {
  @ApiProperty({
    description: 'Ответ сервера',
    type: GetInBoxResData,
  })
  @Expose()
  @ValidateNested()
  @Type(() => GetInBoxResData)
  data: GetInBoxResData;
}

export { GetInBoxRes };
