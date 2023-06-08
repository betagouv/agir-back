import { Citoyen } from '.prisma/client';
import { Injectable } from '@nestjs/common';
import {CitoyenService} from './citoyen.service'

@Injectable()
export class AppService {
  constructor(private userService: CitoyenService) {}

  async getCitoyen(id): Promise<Citoyen> {
    return this.userService.findCitoyen(id);
  }
  async createCitoyen(name): Promise<Citoyen> {
    return this.userService.createCitoyen(name);
  }
}
