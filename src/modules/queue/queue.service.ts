import { Injectable } from '@nestjs/common';

@Injectable()
export class QueueService {
  health() {
    return { module: 'queue', status: 'ok' };
  }
}
