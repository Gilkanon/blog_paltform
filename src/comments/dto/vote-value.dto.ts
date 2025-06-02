import { ApiProperty } from '@nestjs/swagger';

export class VoteValueDto {
  @ApiProperty()
  voteValue: 1 | -1;
}
