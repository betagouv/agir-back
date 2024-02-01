import { Injectable } from '@nestjs/common';
import { QuestionKYCRepository } from '../../src/infrastructure/repository/questionKYC.repository';
import { QuestionKYC } from '../domain/kyc/questionQYC';
import { ApplicationError } from '../../src/infrastructure/applicationError';
import { UtilisateurRepository } from '../../src/infrastructure/repository/utilisateur/utilisateur.repository';
import { Utilisateur } from '../../src/domain/utilisateur/utilisateur';

@Injectable()
export class QuestionKYCUsecase {
  constructor(
    private questionKYCRepository: QuestionKYCRepository,
    private utilisateurRepository: UtilisateurRepository,
  ) {}

  async getALL(utilisateurId: string): Promise<QuestionKYC[]> {
    const collection = await this.questionKYCRepository.getAll(utilisateurId);
    return collection.getAllQuestions();
  }

  async getQuestion(utilisateurId: string, questionId): Promise<QuestionKYC> {
    const collection = await this.questionKYCRepository.getAll(utilisateurId);
    const question = collection.getQuestion(questionId);
    if (!question) {
      ApplicationError.throwQuestionInconnue(questionId);
    }
    return question;
  }
  async updateResponse(
    utilisateurId: string,
    questionId: string,
    reponse: string[],
  ): Promise<void> {
    const collection = await this.questionKYCRepository.getAll(utilisateurId);

    collection.checkQuestionExistsOrThrowException(questionId);

    const utilisateur = await this.utilisateurRepository.findUtilisateurById(
      utilisateurId,
    );

    this.updateUserTodo(utilisateur, questionId);

    if (!collection.isQuestionAnswered(questionId)) {
      const question = collection.getQuestion(questionId);
      utilisateur.gamification.ajoutePoints(question.points);
    }

    await this.utilisateurRepository.updateUtilisateur(utilisateur);

    collection.updateQuestion(questionId, reponse);
    await this.questionKYCRepository.update(utilisateurId, collection);
  }

  private updateUserTodo(utilisateur: Utilisateur, questionId: string) {
    const matching =
      utilisateur.parcours_todo.findTodoKYCElementByQuestionID(questionId);
    if (matching && !matching.element.isDone()) {
      matching.todo.makeProgress(matching.element);
    }
  }
}
