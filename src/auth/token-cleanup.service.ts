import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class TokenCleanupService {
  constructor(private prisma: PrismaService) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async cleanUpExpiredTokens() {
    const now = new Date();

    const result = await this.prisma.refreshToken.deleteMany({
      where: {
        expiresAt: { lt: now },
      },
    });

    console.log(
      `Cleaned up ${result.count} expired refresh tokens at ${now.toISOString()}`,
    );
  }
}
