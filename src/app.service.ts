import { Injectable } from '@nestjs/common';
import {CitoyenService} from './citoyen.service'

@Injectable()
export class AppService {
  constructor(private userService: CitoyenService) {}

  async getCitoyenName(id): Promise<string> {
    const citoyen = await this.userService.findCitoyen(id);
    return citoyen.name;
  }
}
