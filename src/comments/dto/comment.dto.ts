import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export default class CommentDto {
  @ApiProperty()
  @Expose()
  id: number;

  @ApiProperty()
  @Expose()
  content: string;

  @ApiProperty()
  @Expose()
  createdAt: Date;

  @ApiProperty()
  @Expose()
  updatedAt: Date;

  @ApiProperty()
  @Expose()
  postId: number;

  @ApiProperty()
  @Expose()
  userId: string;

  @ApiProperty({ nullable: true })
  @Expose()
  parentId: number | null;

  @ApiProperty({ type: [CommentDto] })
  @Expose()
  replies: CommentDto[];

  constructor(partial: Partial<CommentDto>) {
    Object.assign(this, partial);
  }
}
