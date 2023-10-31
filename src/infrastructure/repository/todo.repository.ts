import { PrismaService } from '../prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { Todo } from '../../../src/domain/todo/todo';

@Injectable()
export class TodoRepository {
  constructor(private prisma: PrismaService) {}

  async getUtilisateurTodo(utilisateurId: string): Promise<Todo> {
    const utilisateurDB = await this.prisma.utilisateur.findUnique({
      where: { id: utilisateurId },
      select: { todo: true },
    });
    return new Todo(utilisateurDB['todo'] as any);
  }
}
