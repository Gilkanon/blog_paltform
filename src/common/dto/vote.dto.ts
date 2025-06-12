import { ApiProperty } from '@nestjs/swagger';

export class VoteDto {
  @ApiProperty()
  rating: number;
  @ApiProperty()
  message: string;
}
