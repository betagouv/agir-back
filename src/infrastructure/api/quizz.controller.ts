import { Body, Controller, Res, Param, Post,HttpStatus, Get } from '@nestjs/common';
import { EvaluerQuizzUsecase } from '../../usecase/evaluer_quizz.usecase'
import { LireQuizzUsecase } from '../../usecase/lire_quizz.usecase'
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { BodyReponsesQuizz } from './types/reponsesQuizz';
import { Quizz } from '.prisma/client';

@Controller()
@ApiTags('Quizz')
export class QuizzController {
  constructor(
    private readonly evaluerQuizzUsecase: EvaluerQuizzUsecase,
    private readonly lireQuizzUsecase: LireQuizzUsecase
    ) { }

  @Post('quizz/:id/evaluer')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        utilisateur: {type : "string", description: "nom de l'utilisateur répondant au quizz"},
        reponses: {type : "array", items: {type: "object"}, description: "tableau des clés-valeur de réponse au quizz"}
      },
    },
  })
  async evaluerQuizz(@Param('id') quizzId: string, @Body() body:BodyReponsesQuizz, @Res() res: Response) {
    let success = await this.evaluerQuizzUsecase.doIt(body, quizzId);
    res.status(HttpStatus.OK).json({resultat: success}).send();
  }
  @Get('quizz/:id')
  async getById(@Param('id') id:string): Promise<Quizz> {
    return this.lireQuizzUsecase.doIt(id);
  }
}
