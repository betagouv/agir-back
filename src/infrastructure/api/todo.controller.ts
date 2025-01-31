import {
  Controller,
  Get,
  Param,
  UseGuards,
  Request,
  Post,
} from '@nestjs/common';
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
  @ApiOperation({
    summary:
      "empoche les points d'un element de todo terminé pour l'utilisateur",
  })
  @Post('utilisateurs/:utilisateurId/todo/:elementId/gagner_points')
  @UseGuards(AuthGuard)
  async gagnerPoints(
    @Request() req,
    @Param('utilisateurId') utilisateurId: string,
    @Param('elementId') elementId: string,
  ) {
    this.checkCallerId(req, utilisateurId);

    await this.todoUsecase.gagnerPointsFromTodoElement(
      utilisateurId,
      elementId,
    );
  }

  @ApiOperation({
    summary: "empoche les points d'une todo complètement terminée",
  })
  @Post('utilisateurs/:utilisateurId/todo/gagner_points')
  @UseGuards(AuthGuard)
  async gagnerPointsTodo(
    @Request() req,
    @Param('utilisateurId') utilisateurId: string,
  ) {
    this.checkCallerId(req, utilisateurId);

    await this.todoUsecase.gagnerPointsFromTodoTerminee(utilisateurId);
  }
}
