import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

type CreateEmailLogInput = {
  campaignId: number;
  leadId: number;
  status: string;
  errorMessage?: string;
};

@Injectable()
export class LogsService {
  constructor(private readonly prisma: PrismaService) {}

  health() {
    return { module: 'logs', status: 'ok' };
  }

  async createEmailLog(input: CreateEmailLogInput) {
    return await this.prisma.emailLog.create({
      data: {
        campaignId: input.campaignId,
        leadId: input.leadId,
        status: input.status,
        errorMessage: input.errorMessage,
      },
    });
  }
}
