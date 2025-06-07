import { ApiProperty } from '@nestjs/swagger';
import { TargetType } from '@prisma/client';
import { Expose } from 'class-transformer';

export class SubscriptionDto {
  @ApiProperty()
  @Expose()
  id: number;

  @ApiProperty()
  @Expose()
  targetType: TargetType;

  @ApiProperty({ description: 'ID of the post if the target type is POST' })
  @Expose()
  postId?: number;

  @ApiProperty({ description: 'ID of the user if the target type is USER' })
  @Expose()
  userTargetId?: string;

  @ApiProperty()
  @Expose()
  userId: string;

  @ApiProperty()
  @Expose()
  createdAt: Date;

  constructor(partial: Partial<SubscriptionDto>) {
    Object.assign(this, partial);
  }
}
