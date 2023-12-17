import { Injectable } from '@nestjs/common';
import { QuestionKYCRepository } from '../../src/infrastructure/repository/questionKYC.repository';
import { QuestionKYC } from '../../src/domain/utilisateur/questionsKYC';
import { ApplicationError } from '../../src/infrastructure/applicationError';

@Injectable()
export class QuestionKYCUsecase {
  constructor(private questionKYCRepository: QuestionKYCRepository) {}

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
    questionId,
    reponse: string,
  ): Promise<void> {
    const collection = await this.questionKYCRepository.getAll(utilisateurId);
    collection.updateQuestion(questionId, reponse);
    await this.questionKYCRepository.update(utilisateurId, collection);
  }
}
