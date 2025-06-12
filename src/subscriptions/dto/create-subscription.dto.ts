import { ApiProperty } from '@nestjs/swagger';
import { TargetType } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { OneOfTwoFields } from 'src/common/decorators/one-of-two-fields.decorator';

export class CreateSubscriptionDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsEnum(TargetType)
  targetType: TargetType;

  @ApiProperty({ required: false })
  @IsNumber()
  @Type(() => Number)
  postId?: number;

  @ApiProperty({ required: false })
  @IsString()
  userTargetId?: string;

  @OneOfTwoFields('postId', 'userTargetId', {
    message: 'Either postId or userTargetId must be provided, but not both.',
  })
  dummyField?: any;
}
