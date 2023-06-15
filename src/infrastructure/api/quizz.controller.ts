import { Body, Controller, Res, Param, Post,HttpStatus } from '@nestjs/common';
import { EvaluerQuizzUsecase } from '../../usecase/evaluer_quizz.usecase'
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { ReponsesQuizz } from './types/reponsesQuizz';

@Controller()
@ApiTags('Quizz')
export class QuizzController {
  constructor(private readonly evaluerQuizzUsecase: EvaluerQuizzUsecase) { }

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
  async evaluerQuizz(@Param('id') id: string, @Body() body:ReponsesQuizz, @Res() res: Response) {
    let success = await this.evaluerQuizzUsecase.doIt(body, id);
    res.status(HttpStatus.OK).json({resultat: success}).send();
  }
}
