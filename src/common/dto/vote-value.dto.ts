import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class VoteValueDto {
  @ApiProperty()
  @Type(() => Number)
  voteValue: 1 | -1;
}
