import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { LeadService } from './lead.service';
import { GetCampaignLeadsDto } from './dto/get-campaign-leads.dto';

@Controller('lead')
export class LeadController {
  constructor(private readonly leadService: LeadService) {}

  @Get('health')
  health() {
    return this.leadService.health();
  }

  @Get('campaign/:campaignId')
  getLeadsByCampaign(
    @Param('campaignId', ParseIntPipe) campaignId: number,
    @Query() query: GetCampaignLeadsDto,
  ) {
    return this.leadService.getLeadsByCampaign(campaignId, query);
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  uploadCsv(
    @UploadedFile() file: { buffer: Buffer } | undefined,
    @Body('campaignId', ParseIntPipe) campaignId: number,
  ) {
    if (!file) {
      throw new BadRequestException('CSV file is required');
    }

    return this.leadService.uploadCsv(file.buffer, campaignId);
  }
}
