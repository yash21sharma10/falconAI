import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { parseString } from 'fast-csv';
import { isEmail } from 'class-validator';
import { PrismaService } from '../../prisma/prisma.service';
import { GetCampaignLeadsDto } from './dto/get-campaign-leads.dto';

type CsvLeadRow = {
  name: string;
  email: string;
  company: string;
  customFields?: Record<string, unknown>;
};

type CsvParseResult = {
  rows: CsvLeadRow[];
  invalidRows: Array<{ row: number; reason: string }>;
};

@Injectable()
export class LeadService {
  constructor(private readonly prisma: PrismaService) {}

  health() {
    return { module: 'lead', status: 'ok' };
  }

  async getLeadsByCampaign(campaignId: number, query: GetCampaignLeadsDto) {
    const campaign = await this.prisma.campaign.findUnique({
      where: { id: campaignId },
      select: { id: true },
    });

    if (!campaign) {
      throw new NotFoundException(`Campaign with ID ${campaignId} not found`);
    }

    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const skip = (page - 1) * limit;

    const where: Prisma.LeadWhereInput = {
      campaignId,
      ...(query.email
        ? {
            email: {
              contains: query.email,
            },
          }
        : {}),
      ...(query.name
        ? {
            OR: [
              {
                firstName: {
                  contains: query.name,
                },
              },
              {
                lastName: {
                  contains: query.name,
                },
              },
            ],
          }
        : {}),
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.lead.findMany({
        where,
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),
      this.prisma.lead.count({ where }),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async uploadCsv(csvBuffer: Buffer, campaignId: number) {
    const campaign = await this.prisma.campaign.findUnique({
      where: { id: campaignId },
      select: { id: true },
    });

    if (!campaign) {
      throw new NotFoundException(`Campaign with ID ${campaignId} not found`);
    }

    const { rows, invalidRows } = await this.parseCsv(csvBuffer);
    if (rows.length === 0) {
      throw new BadRequestException('CSV does not contain any lead rows');
    }

    const existingInCampaign = await this.prisma.lead.findMany({
      where: {
        campaignId,
        email: {
          in: rows.map((row) => row.email),
        },
      },
      select: { email: true },
    });

    const existingEmails = new Set(existingInCampaign.map((lead) => lead.email));
    const seenInCsv = new Set<string>();
    const skipped: Array<{ email: string; reason: string }> = [];
    let created = 0;

    for (const row of rows) {
      if (seenInCsv.has(row.email)) {
        skipped.push({
          email: row.email,
          reason: 'Duplicate email in CSV',
        });
        continue;
      }

      if (existingEmails.has(row.email)) {
        skipped.push({
          email: row.email,
          reason: 'Duplicate email in campaign',
        });
        seenInCsv.add(row.email);
        continue;
      }

      try {
        await this.prisma.lead.create({
          data: {
            campaignId,
            email: row.email,
            // Current schema has firstName/lastName, so full name is stored in firstName.
            firstName: row.name,
          },
        });
        created += 1;
        seenInCsv.add(row.email);
      } catch (error) {
        if (
          error instanceof Prisma.PrismaClientKnownRequestError &&
          error.code === 'P2002'
        ) {
          skipped.push({
            email: row.email,
            reason: 'Duplicate email',
          });
          seenInCsv.add(row.email);
          continue;
        }
        throw error;
      }
    }

    return {
      campaignId,
      totalRows: rows.length,
      created,
      skippedCount: skipped.length,
      skipped,
      invalidCount: invalidRows.length,
      invalidRows,
    };
  }

  private parseCsv(csvBuffer: Buffer): Promise<CsvParseResult> {
    return new Promise((resolve, reject) => {
      const rows: CsvLeadRow[] = [];
      const invalidRows: Array<{ row: number; reason: string }> = [];
      const csvContent = csvBuffer.toString('utf8');
      let currentRow = 1;

      parseString(csvContent, { headers: true, trim: true })
        .on('error', (error) => reject(new BadRequestException(error.message)))
        .on('data', (rawRow: Record<string, string>) => {
          currentRow += 1;
          const name = (rawRow.name || '').trim();
          const email = (rawRow.email || '').trim().toLowerCase();
          const company = (rawRow.company || '').trim();
          const customFieldsRaw = (rawRow.customFields || '').trim();

          if (!name || !email || !company) {
            invalidRows.push({
              row: currentRow,
              reason: 'Missing required fields (name, email, company)',
            });
            return;
          }

          if (!isEmail(email)) {
            invalidRows.push({
              row: currentRow,
              reason: 'Invalid email format',
            });
            return;
          }

          let customFields: Record<string, unknown> | undefined;
          if (customFieldsRaw) {
            try {
              const parsed = JSON.parse(customFieldsRaw);
              if (typeof parsed === 'object' && parsed !== null) {
                customFields = parsed as Record<string, unknown>;
              } else {
                invalidRows.push({
                  row: currentRow,
                  reason: 'customFields must be a JSON object string',
                });
                return;
              }
            } catch {
              invalidRows.push({
                row: currentRow,
                reason: 'customFields is not valid JSON',
              });
              return;
            }
          }

          rows.push({
            name,
            email,
            company,
            customFields,
          });
        })
        .on('end', () => resolve({ rows, invalidRows }));
    });
  }
}
