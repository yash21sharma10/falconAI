import { Injectable } from '@nestjs/common';

@Injectable()
export class EmailService {
  health() {
    return { module: 'email', status: 'ok' };
  }
}
