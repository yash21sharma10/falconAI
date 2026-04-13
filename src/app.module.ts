import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';
import configuration from './config/configuration';
import { CampaignModule } from './modules/campaign/campaign.module';
import { EmailModule } from './modules/email/email.module';
import { LeadModule } from './modules/lead/lead.module';
import { LogsModule } from './modules/logs/logs.module';
import { PrismaModule } from './prisma/prisma.module';
import { QueueModule } from './modules/queue/queue.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      load: [configuration],
      validationSchema: Joi.object({
        NODE_ENV: Joi.string()
          .valid('development', 'test', 'production')
          .default('development'),
        PORT: Joi.number().default(3000),
        DATABASE_URL: Joi.string().uri().required(),
      }),
    }),
    PrismaModule,
    CampaignModule,
    LeadModule,
    EmailModule,
    QueueModule,
    LogsModule,
  ],
})
export class AppModule {}
