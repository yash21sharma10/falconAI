import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateCampaignDto {
  @IsString()
  @MaxLength(255)
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  @IsIn(['draft', 'active', 'paused', 'completed'])
  status?: string;
}
