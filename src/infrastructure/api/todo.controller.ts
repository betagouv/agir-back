import { Controller, Get, Param, UseGuards, Request } from '@nestjs/common';
import {
  ApiTags,
  ApiOkResponse,
  ApiOperation,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { GenericControler } from './genericControler';
import { AuthGuard } from '../auth/guard';
import { TodoAPI } from './types/todo/todoAPI';
import { TodoUsecase } from '../../../src/usecase/todo.usecase';

@Controller()
@ApiBearerAuth()
@ApiTags('Todo Liste')
export class TodoController extends GenericControler {
  constructor(private readonly todoUsecase: TodoUsecase) {
    super();
  }

  @Get('utilisateurs/:utilisateurId/todo')
  @ApiOperation({
    summary: "renvoie la todo liste courante de l'utilisateur d'id donné",
  })
  @ApiOkResponse({ type: TodoAPI })
  @UseGuards(AuthGuard)
  async getUtilisateurTodo(
    @Param('utilisateurId') utilisateurId: string,
    @Request() req,
  ) {
    this.checkCallerId(req, utilisateurId);

    const result = await this.todoUsecase.getUtilisateurTodo(utilisateurId);

    return TodoAPI.mapTodoToTodoAPI(result);
  }
}
