import {
  Controller,
  Get,
  Param,
  UseGuards,
  Request,
  Post,
  Res,
  HttpStatus,
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
import { Response } from 'express';

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
    @Res() res: Response,
  ) {
    this.checkCallerId(req, utilisateurId);

    await this.todoUsecase.gagnerPointsFromTodoElement(
      utilisateurId,
      elementId,
    );

    res.status(HttpStatus.OK).json('ok').send();
  }

  @ApiOperation({
    summary: "empoche les points d'une todo complètement terminée",
  })
  @Post('utilisateurs/:utilisateurId/todo/gagner_points')
  @UseGuards(AuthGuard)
  async gagnerPointsTodo(
    @Request() req,
    @Param('utilisateurId') utilisateurId: string,
    @Res() res: Response,
  ) {
    this.checkCallerId(req, utilisateurId);

    await this.todoUsecase.gagnerPointsFromTodo(utilisateurId);
    res.status(HttpStatus.OK).json('ok').send();
  }
}
