import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCampaignDto } from './dto/create-campaign.dto';
import { UpdateCampaignDto } from './dto/update-campaign.dto';

@Injectable()
export class CampaignService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createCampaignDto: CreateCampaignDto) {
    return await this.prisma.campaign.create({
      data: createCampaignDto,
    });
  }

  async findAll() {
    return await this.prisma.campaign.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: number) {
    const campaign = await this.prisma.campaign.findUnique({
      where: { id },
    });

    if (!campaign) {
      throw new NotFoundException(`Campaign with ID ${id} not found`);
    }

    return campaign;
  }

  async update(id: number, updateCampaignDto: UpdateCampaignDto) {
    await this.findOne(id);

    return await this.prisma.campaign.update({
      where: { id },
      data: updateCampaignDto,
    });
  }

  async remove(id: number) {
    await this.findOne(id);

    return await this.prisma.campaign.delete({
      where: { id },
    });
  }
}
