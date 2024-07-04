import { Controller, Get, Param, Post, Request } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import { GenericControler } from './genericControler';
import { KycRepository } from '../repository/kyc.repository';
import { NGCCalculator } from '../ngc/NGCCalculator';
import { TypeReponseQuestionKYC } from '../../domain/kyc/questionKYC';
import { MissionRepository } from '../repository/mission.repository';
import { ThematiqueRepository } from '../repository/thematique.repository';
import { ContentType } from '../../domain/contenu/contentType';
import {
  ArticleFilter,
  ArticleRepository,
} from '../repository/article.repository';
import { Categorie } from '../../domain/contenu/categorie';
import { QuizzRepository } from '../repository/quizz.repository';
import { DefiRepository } from '../repository/defi.repository';
import { MissionDefinition } from '../../domain/mission/missionDefinition';
import { UniversUsecase } from '../../usecase/univers.usecase';

@Controller()
@ApiExcludeController()
export class PreviewController extends GenericControler {
  constructor(
    private kycRepository: KycRepository,
    private nGCCalculator: NGCCalculator,
    private missionRepository: MissionRepository,
    private articleRepository: ArticleRepository,
    private universUsecase: UniversUsecase,
    private quizzRepository: QuizzRepository,
    private defiRepository: DefiRepository,
  ) {
    super();
  }

  @Get('kyc_preview/:id')
  async kyc_preview(@Param('id') id: string): Promise<string> {
    let result = [];
    const kyc_def = await this.kycRepository.getByCMS_ID(parseInt(id));

    result.push('## KYC CMS ID : ' + id);
    result.push('######################');

    if (!kyc_def) {
      result.push('Publiez la question avant de faire le preview !!!');
      return `<pre>${result.join('\n')}</pre>`;
    }
    result.push(`## ${kyc_def.question}`);
    result.push(
      '#####################################################################',
    );
    result.push('');

    let DATA: any = {};

    if (kyc_def.is_ngc && !kyc_def.ngc_key) {
      result.push(`🔥🔥🔥 Clé de question NGC manquante ! 🔥🔥🔥`);
    }

    DATA.type = kyc_def.type;
    DATA.IS_NGC = kyc_def.is_ngc;
    if (kyc_def.is_ngc) {
      DATA.NGC_QUESTION_KEY = kyc_def.ngc_key;
    }

    if (!kyc_def.is_ngc) {
      DATA.reponses = kyc_def.reponses;
      result.push(JSON.stringify(DATA, null, 2));
      return `<pre>${result.join('\n')}</pre>`;
    }

    result.push(JSON.stringify(DATA, null, 2));
    result.push('');

    DATA = {};
    try {
      const situation: any = {};
      const base_line = Math.round(
        this.nGCCalculator.computeBilanFromSituation(situation)
          .bilan_carbone_annuel,
      );

      DATA.bilan_carbone_DEFAULT = base_line;

      if (!kyc_def.ngc_key) {
        result.push(`🔥🔥🔥 Clé de question NGC manquante ! 🔥🔥🔥`);
        DATA.question = kyc_def.reponses;
        result.push(JSON.stringify(DATA, null, 2));

        return `<pre>${result.join('\n')}</pre>`;
      }

      if (kyc_def.type === TypeReponseQuestionKYC.entier) {
        situation[kyc_def.ngc_key] = 1;
        const value_1 = Math.round(
          this.nGCCalculator.computeBilanFromSituation(situation)
            .bilan_carbone_annuel,
        );
        situation[kyc_def.ngc_key] = 2;
        const value_2 = Math.round(
          this.nGCCalculator.computeBilanFromSituation(situation)
            .bilan_carbone_annuel,
        );

        DATA.with_kyc_reponse_equal_1 =
          value_1 + this.compareBilan(value_1, base_line);
        DATA.with_kyc_reponse_equal_2 =
          value_2 + this.compareBilan(value_2, base_line);
      }

      if (kyc_def.type === TypeReponseQuestionKYC.choix_unique) {
        for (const reponse of kyc_def.reponses) {
          situation[kyc_def.ngc_key] = reponse.ngc_code;
          const value = Math.round(
            this.nGCCalculator.computeBilanFromSituation(situation)
              .bilan_carbone_annuel,
          );
          DATA[`value_when_${reponse.code}`] =
            value + this.compareBilan(value, base_line);
        }
      }
    } catch (error) {
      DATA.error = error.message;
    }
    DATA.question = kyc_def.reponses;
    result.push(JSON.stringify(DATA, null, 2));

    return `<pre>${result.join('\n')}</pre>`;
  }

  @Get('mission_preview/:id')
  async mission_preview(@Param('id') id: string): Promise<string> {
    const mission_def = await this.missionRepository.getByCMS_ID(parseInt(id));

    if (!mission_def) {
      return '<pre>Publiez la mission avant de faire la preview !!! </pre>';
    }
    let result = [];

    result.push(`########################`);
    result.push(`### MISSION ID_CMS : ${mission_def.id_cms}`);
    result.push(`########################`);
    result.push(``);
    result.push(
      `Titre : ${ThematiqueRepository.getTitreThematiqueUnivers(
        mission_def.thematique_univers,
      )}`,
    );
    result.push(
      `Univers : ${ThematiqueRepository.getTitreUnivers(mission_def.univers)}`,
    );
    result.push(`Est visible : ${mission_def.est_visible}`);
    result.push(
      `Prochaines thématiques liées : ${
        mission_def.prochaines_thematiques.length > 0
          ? mission_def.prochaines_thematiques
          : 'aucune'
      }`,
    );

    try {
      result.push('');
      result.push('#################');
      result.push('# Liste KYCs');
      result.push('#################');

      for (const objectif of mission_def.objectifs) {
        if (objectif.type === ContentType.kyc) {
          const kyc_def = await this.kycRepository.getByCode(
            objectif.content_id,
          );
          result.push(``);
          result.push(`## KYC [${kyc_def.id_cms}]`);

          const DATA: any = {};
          DATA.CODE = objectif.content_id;
          DATA.objectif_titre = objectif.titre;
          DATA.objectif_points = objectif.points;
          DATA.kyc_type = kyc_def.type;
          DATA.kyc_question = kyc_def.question;
          DATA.kyc_points = kyc_def.points;
          if (kyc_def.reponses) {
            DATA.reponses = kyc_def.reponses.map((k) => k.code);
          }
          result.push(JSON.stringify(DATA, null, 2));
          result.push(
            `</pre><a href="/kyc_preview/${kyc_def.id_cms}">Detail kyc</a><pre>`,
          );
        }
      }

      result.push('');
      result.push('#########################');
      result.push('# Liste Articles et Quizz');
      result.push('#########################');
      result.push('');

      for (const objectif of mission_def.objectifs) {
        if (objectif.type === ContentType.article) {
          result.push('');
          if (objectif.tag_article) {
            result.push(`## ARTICLES DYNAMIQUES TAG [${objectif.tag_article}]`);
            const DATA: any = {};
            DATA.objectif_titre = objectif.titre;
            DATA.objectif_points = objectif.points;
            const filtre: ArticleFilter = {
              categorie: Categorie.mission,
              tag_article: objectif.tag_article,
            };
            const article_candidat_liste =
              await this.articleRepository.searchArticles(filtre);

            const liste_article_preview = [];

            for (const article of article_candidat_liste) {
              const DATA_ARTICLE: any = {};
              DATA_ARTICLE.ARTICLE_ID = article.content_id;
              DATA_ARTICLE.article_titre = article.titre;
              DATA_ARTICLE.article_points = article.points;
              if (article.codes_postaux.length) {
                DATA_ARTICLE.codes_postaux = article.codes_postaux.join(',');
              }
              if (article.codes_region.length) {
                DATA_ARTICLE.codes_region = article.codes_region.join(',');
              }
              if (article.codes_departement.length) {
                DATA_ARTICLE.codes_departement =
                  article.codes_departement.join(',');
              }
              if (article.include_codes_commune.length) {
                DATA_ARTICLE.include_codes_commune =
                  article.include_codes_commune.join(',');
              }
              if (article.exclude_codes_commune.length) {
                DATA_ARTICLE.exclude_codes_commune =
                  article.exclude_codes_commune.join(',');
              }
              liste_article_preview.push(DATA_ARTICLE);
            }
            DATA.ARTICLES_CANDIDATS = liste_article_preview;
            result.push(JSON.stringify(DATA, null, 2));
          } else {
            const article = await this.articleRepository.getArticleByContentId(
              objectif.content_id,
            );
            const DATA: any = {};
            result.push(`## ARTICLE FIXE [${objectif.content_id}]`);
            DATA.objectif_titre = objectif.titre;
            DATA.objectif_points = objectif.points;
            DATA.article_titre = article.titre;
            DATA.article_points = article.points;
            result.push(JSON.stringify(DATA, null, 2));
          }
        } else if (objectif.type === ContentType.quizz) {
          result.push('');
          result.push(`## QUIZZ [${objectif.content_id}]`);

          const quizz = await this.quizzRepository.getQuizzByContentId(
            objectif.content_id,
          );
          const DATA: any = {};
          DATA.objectif_titre = objectif.titre;
          DATA.objectif_points = objectif.points;
          DATA.quizz_titre = quizz.titre;
          DATA.quizz_points = quizz.points;
          result.push(JSON.stringify(DATA, null, 2));
        }
      }
    } catch (error) {
      result.push('');
      result.push(error.message);
    }

    result.push('');
    result.push('#########################');
    result.push('# Liste Défis');
    result.push('#########################');

    await this.dump_defis_of_mission(mission_def, result);

    return `<pre>${result.join('\n')}</pre>`;
  }

  private async dump_defis_of_mission(
    mission_def: MissionDefinition,
    result: any[],
  ) {
    for (const objectif of mission_def.objectifs) {
      if (objectif.type === ContentType.defi) {
        result.push('');
        result.push('#### DEFI [' + objectif.content_id + ']');
        const defi = await this.defiRepository.getByContentId(
          objectif.content_id,
        );
        const DATA: any = {};
        DATA.objectif_titre = objectif.titre;
        DATA.objectif_points = objectif.points;
        DATA.defi_titre = defi.titre;
        DATA.defi_points = defi.points;
        result.push(JSON.stringify(DATA, null, 2));
        for (const OU_C of defi.conditions) {
          result.push('|---- OU -----');
          for (const ET_C of OU_C) {
            const target_kyc = await this.kycRepository.getByCode(
              ET_C.code_kyc,
            );
            let qualif;
            if (target_kyc) {
              const reponse = target_kyc.reponses.find(
                (r) => r.code === ET_C.code_reponse,
              );
              if (reponse) {
                qualif = ' 👍';
              } else {
                qualif = `  🔥🔥🔥 MISSING REPONSE of code [${ET_C.code_reponse}]`;
              }
            } else {
              qualif = ` 🔥🔥🔥 MISSING KYC of code [${ET_C.code_kyc}]`;
            }
            result.push(
              '| [KYC ' +
                ET_C.id_kyc +
                '] ' +
                ET_C.code_kyc +
                ' -> ' +
                ET_C.code_reponse +
                qualif,
            );
          }
        }
        result.push('|-------------');
      }
    }
  }

  @Get('univers_preview/:id')
  async univers_preview(@Param('id') id: string): Promise<string> {
    let result = [];

    let DATA: any = {};

    const tuile_univers = ThematiqueRepository.getTuileUniversByCMS_ID(
      parseInt(id),
    );
    result.push(`########################`);
    result.push(`### TOUS LES UNIVERS`);
    result.push(`########################`);

    const all_univers = ThematiqueRepository.getAllTuileUnivers();
    all_univers.sort((a, b) => a.id_cms - b.id_cms);
    for (const univers of all_univers) {
      if (univers.id_cms.toString() === id) {
        result.push(
          `</pre><a href="/mission_preview/${univers.id_cms}"><pre>####> Univers [${univers.id_cms}]</pre></a><pre>`,
        );
      } else {
        result.push(
          `</pre><a href="/mission_preview/${univers.id_cms}"><pre>      Univers [${univers.id_cms}]</pre></a><pre>`,
        );
      }
    }

    result.push(`########################`);
    result.push(`### UNIVERS ID_CMS : ${tuile_univers.id_cms}`);
    result.push(`########################`);
    result.push(``);
    DATA.titre = tuile_univers.titre;
    DATA.code = tuile_univers.type;
    result.push(JSON.stringify(DATA, null, 2));
    result.push(``);

    result.push('###############################');
    result.push(`# Liste Missions UNIVERS [${id}]`);
    result.push('###############################');

    let tuiles_thema = ThematiqueRepository.getAllTuilesThematique(
      tuile_univers.type,
    );

    tuiles_thema = await this.universUsecase.ordonneTuilesThematiques(
      tuiles_thema,
    );

    for (const tuile_thema of tuiles_thema) {
      const mission = await this.missionRepository.getByThematique(
        tuile_thema.type,
      );
      result.push('');
      result.push(
        `#### MISSION Famille_${tuile_thema.famille_id_cms} [${mission.id_cms}] - ${tuile_thema.titre}`,
      );
      result.push(`Est visible : ${mission.est_visible}`);

      const result2 = [];
      await this.dump_defis_of_mission(mission, result2);

      const ouput = result2.join('');
      result.push(
        `Paramétrage défis : ${ouput.includes('🔥') ? 'KO 🔥🔥🔥' : 'OK 👍'}`,
      );
      result.push(
        `</pre><a href="/mission_preview/${mission.id_cms}">Detail mission</a><pre>`,
      );
    }
    return `<pre>${result.join('\n')}</pre>`;
  }

  private compareBilan(value: number, bilan: number): string {
    if (value === bilan) {
      return ' 🔥🔥🔥 égale à la valeur DEFAULT !!';
    }
    if (value > bilan) {
      return ' > DEFAULT de ' + Math.round(value - bilan) + ' kg';
    } else {
      return ' < DEFAULT de ' + Math.round(bilan - value) + ' kg';
    }
  }
}
