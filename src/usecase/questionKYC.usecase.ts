import { Injectable } from '@nestjs/common';
import { QuestionKYC } from '../domain/kyc/questionKYC';
import { UtilisateurRepository } from '../../src/infrastructure/repository/utilisateur/utilisateur.repository';
import { Utilisateur } from '../../src/domain/utilisateur/utilisateur';
import { KycRepository } from '../../src/infrastructure/repository/kyc.repository';
import { KYCID } from '../../src/domain/kyc/KYCID';
import { DefiRepository } from '../../src/infrastructure/repository/defi.repository';
import { Personnalisator } from '../infrastructure/personnalisation/personnalisator';
import {
  Chauffage,
  DPE,
  Superficie,
  TypeLogement,
} from '../domain/logement/logement';
import {
  MosaicKYC,
  MosaicKYCDef,
  TypeReponseMosaicKYC,
} from '../domain/kyc/mosaicKYC';
import { Categorie } from '../domain/contenu/categorie';
import { ApplicationError } from '../infrastructure/applicationError';
import { KYCMosaicID } from '../domain/kyc/KYCMosaicID';

@Injectable()
export class QuestionKYCUsecase {
  static MOSAIC_CATALOGUE: MosaicKYCDef[] = [
    {
      id: KYCMosaicID.TEST_MOSAIC_ID,
      categorie: Categorie.test,
      points: 10,
      titre: 'Quels modes de chauffage existes chez vous ?',
      type: TypeReponseMosaicKYC.mosaic_boolean,
      question_kyc_codes: [
        KYCID.KYC_chauffage_bois,
        KYCID.KYC_chauffage_fioul,
        KYCID.KYC_chauffage_gaz,
      ],
    },
  ];

  constructor(
    private utilisateurRepository: UtilisateurRepository,
    private kycRepository: KycRepository,
    private defiRepository: DefiRepository,
    private personnalisator: Personnalisator,
  ) {}

  async getALL(utilisateurId: string): Promise<QuestionKYC[]> {
    const utilisateur = await this.utilisateurRepository.getById(utilisateurId);
    utilisateur.checkState();

    const kyc_catalogue = await this.kycRepository.getAllDefs();
    utilisateur.kyc_history.setCatalogue(kyc_catalogue);

    const result = utilisateur.kyc_history.getAllUpToDateQuestionSet();
    await this.utilisateurRepository.updateUtilisateur(utilisateur);

    return this.personnalisator.personnaliser(result, utilisateur);
  }

  async getQuestion(utilisateurId: string, questionId): Promise<QuestionKYC> {
    const utilisateur = await this.utilisateurRepository.getById(utilisateurId);
    utilisateur.checkState();

    const kyc_catalogue = await this.kycRepository.getAllDefs();
    utilisateur.kyc_history.setCatalogue(kyc_catalogue);

    const result =
      utilisateur.kyc_history.getUpToDateQuestionByCodeOrException(questionId);

    await this.utilisateurRepository.updateUtilisateur(utilisateur);

    return this.personnalisator.personnaliser(result, utilisateur);
  }

  async getQuestionMosaic(utilisateurId: string, mosaicId): Promise<MosaicKYC> {
    const utilisateur = await this.utilisateurRepository.getById(utilisateurId);
    utilisateur.checkState();

    const mosaic = QuestionKYCUsecase.MOSAIC_CATALOGUE.find(
      (m) => m.id === mosaicId,
    );
    if (!mosaic) {
      ApplicationError.throwUnknownMosaicId(mosaicId);
    }

    const kyc_catalogue = await this.kycRepository.getAllDefs();
    utilisateur.kyc_history.setCatalogue(kyc_catalogue);

    const target_kyc_liste: QuestionKYC[] = [];
    for (const kyc_code of mosaic.question_kyc_codes) {
      const kyc =
        utilisateur.kyc_history.getUpToDateQuestionByCodeOrNull(kyc_code);

      if (kyc) {
        target_kyc_liste.push(kyc);
      }
    }

    return new MosaicKYC(target_kyc_liste, mosaic);
  }

  async updateResponse(
    utilisateurId: string,
    code_question: string,
    reponse: string[],
  ): Promise<void> {
    const utilisateur = await this.utilisateurRepository.getById(utilisateurId);
    utilisateur.checkState();

    const kyc_catalogue = await this.kycRepository.getAllDefs();
    utilisateur.kyc_history.setCatalogue(kyc_catalogue);

    await this.updateQuestionOfCode(code_question, null, reponse, utilisateur);

    await this.utilisateurRepository.updateUtilisateur(utilisateur);
  }

  async updateResponseMosaic(
    utilisateurId: string,
    mosaicId: string,
    reponses: { code: string; boolean_value: boolean }[],
  ): Promise<void> {
    const utilisateur = await this.utilisateurRepository.getById(utilisateurId);
    utilisateur.checkState();

    const mosaic = QuestionKYCUsecase.MOSAIC_CATALOGUE.find(
      (m) => m.id === mosaicId,
    );
    if (!mosaic) {
      ApplicationError.throwUnknownMosaicId(mosaicId);
    }

    const kyc_catalogue = await this.kycRepository.getAllDefs();
    utilisateur.kyc_history.setCatalogue(kyc_catalogue);

    if (mosaic.type === TypeReponseMosaicKYC.mosaic_boolean) {
      for (const reponse of reponses) {
        await this.updateQuestionOfCode(
          reponse.code,
          reponse.boolean_value ? 'oui' : 'non',
          null,
          utilisateur,
        );
      }
    }
    await this.utilisateurRepository.updateUtilisateur(utilisateur);
  }

  private async updateQuestionOfCode(
    code_question: string,
    code_reponse: string,
    labels_reponse: string[],
    utilisateur: Utilisateur,
  ) {
    utilisateur.kyc_history.checkQuestionExistsByCode(code_question);
    this.updateUserTodo(utilisateur, code_question);

    if (!utilisateur.kyc_history.isQuestionAnsweredByCode(code_question)) {
      const question =
        utilisateur.kyc_history.getUpToDateQuestionByCodeOrException(
          code_question,
        );
      utilisateur.gamification.ajoutePoints(question.points, utilisateur);
    }

    if (labels_reponse) {
      utilisateur.kyc_history.updateQuestionByCodeWithLabel(
        code_question,
        labels_reponse,
      );
      this.synchroKYCAvecProfileUtilisateur(
        code_question,
        labels_reponse,
        utilisateur,
      );
    } else {
      utilisateur.kyc_history.updateQuestionByCodeWithCode(
        code_question,
        code_reponse,
      );
    }

    utilisateur.missions.answerKyc(code_question, utilisateur);

    utilisateur.recomputeRecoTags();

    const catalogue_defis = await this.defiRepository.list({});
    utilisateur.missions.recomputeRecoDefi(utilisateur, catalogue_defis);
  }

  public synchroKYCAvecProfileUtilisateur(
    code_question: string,
    reponse: string[],
    utilisateur: Utilisateur,
  ) {
    const kyc =
      utilisateur.kyc_history.getUpToDateQuestionByCodeOrNull(code_question);

    if (kyc) {
      switch (kyc.id) {
        case KYCID.KYC006:
          const label_age = kyc.getLabelByCode('plus_15');
          utilisateur.logement.plus_de_15_ans = reponse.includes(label_age);
          break;
        case KYCID.KYC_DPE:
          const code_dpe = kyc.getCodeByLabel(reponse[0]);
          utilisateur.logement.dpe = DPE[code_dpe];
          break;
        case KYCID.KYC_superficie:
          const valeur = parseInt(reponse[0]);
          if (valeur < 35)
            utilisateur.logement.superficie = Superficie.superficie_35;
          if (valeur < 70)
            utilisateur.logement.superficie = Superficie.superficie_70;
          if (valeur < 100)
            utilisateur.logement.superficie = Superficie.superficie_100;
          if (valeur < 150)
            utilisateur.logement.superficie = Superficie.superficie_150;
          if (valeur >= 150)
            utilisateur.logement.superficie = Superficie.superficie_150_et_plus;
          break;
        case KYCID.KYC_proprietaire:
          const code_prop = kyc.getCodeByLabel(reponse[0]);
          utilisateur.logement.proprietaire = code_prop === 'oui';
          break;
        case KYCID.KYC_chauffage:
          const code_chauff = kyc.getCodeByLabel(reponse[0]);
          utilisateur.logement.chauffage = Chauffage[code_chauff];
          break;
        case KYCID.KYC_type_logement:
          const code_log = kyc.getCodeByLabel(reponse[0]);
          utilisateur.logement.type =
            code_log === 'type_appartement'
              ? TypeLogement.appartement
              : TypeLogement.maison;
          break;
        default:
          break;
      }
    }
  }

  private updateUserTodo(utilisateur: Utilisateur, questionId: string) {
    const matching =
      utilisateur.parcours_todo.findTodoKYCElementByQuestionID(questionId);
    if (matching && !matching.element.isDone()) {
      matching.todo.makeProgress(matching.element);
    }
  }
}
