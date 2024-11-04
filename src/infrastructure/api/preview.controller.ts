import {
  Controller,
  Get,
  Param,
  Query,
  Headers,
  Response,
} from '@nestjs/common';
import { Response as Res } from 'express';
import { ApiBearerAuth, ApiExcludeController } from '@nestjs/swagger';
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
import { MissionUsecase } from '../../usecase/mission.usecase';
import { DefiDefinition } from '../../domain/defis/defiDefinition';
import { AuthGuard } from '../auth/guard';
import { KycDefinition } from '../../domain/kyc/kycDefinition';
import { App } from '../../domain/app';
import axios from 'axios';
import { CMSWebhookPopulateAPI } from './types/cms/CMSWebhookEntryAPI';
import { Thematique } from '../../domain/contenu/thematique';

// https://fsymbols.com/generators/carty/

@Controller()
@ApiExcludeController()
@ApiBearerAuth()
export class PreviewController extends GenericControler {
  constructor(
    private kycRepository: KycRepository,
    private nGCCalculator: NGCCalculator,
    private missionRepository: MissionRepository,
    private articleRepository: ArticleRepository,
    private missionUsecase: MissionUsecase,
    private quizzRepository: QuizzRepository,
    private defiRepository: DefiRepository,
  ) {
    super();
  }

  @Get('cms_urls_preview')
  async cms_urls_preview(
    @Headers('Authorization') authorization: string,
    @Response() res: Res,
  ): Promise<any> {
    if (!this.checkAuthHeaderOK(authorization)) {
      return this.returnBadOreMissingLoginError(res);
    }

    let result = [];
    result.push(`


░█████╗░░█████╗░███╗░░██╗████████╗███████╗███╗░░██╗████████╗  ██╗░░░██╗██████╗░██╗░░░░░░██████╗
██╔══██╗██╔══██╗████╗░██║╚══██╔══╝██╔════╝████╗░██║╚══██╔══╝  ██║░░░██║██╔══██╗██║░░░░░██╔════╝
██║░░╚═╝██║░░██║██╔██╗██║░░░██║░░░█████╗░░██╔██╗██║░░░██║░░░  ██║░░░██║██████╔╝██║░░░░░╚█████╗░
██║░░██╗██║░░██║██║╚████║░░░██║░░░██╔══╝░░██║╚████║░░░██║░░░  ██║░░░██║██╔══██╗██║░░░░░░╚═══██╗
╚█████╔╝╚█████╔╝██║░╚███║░░░██║░░░███████╗██║░╚███║░░░██║░░░  ╚██████╔╝██║░░██║███████╗██████╔╝
░╚════╝░░╚════╝░╚═╝░░╚══╝░░░╚═╝░░░╚══════╝╚═╝░░╚══╝░░░╚═╝░░░  ░╚═════╝░╚═╝░░╚═╝╚══════╝╚═════╝░

`);

    result.push(`###############################`);
    result.push(`## Articles (champ contenu)`);
    result.push(`###############################`);
    result.push(``);
    const all_articles = await this.loadDataFromCMS('articles');
    all_articles.sort((a, b) => a.id - b.id);

    for (const article of all_articles) {
      if (article.attributes.contenu) {
        const urls = article.attributes.contenu.match(/"https?:\/\/[^"]+"/gi);
        if (urls && urls.length > 0) {
          for (const url of urls) {
            if (url && url.length > 2) {
              const real_url = url.substring(1, url.length - 1);
              const ok = await this.checkURLOK(real_url);
              result.push(
                `Article [${article.id}] ${
                  ok ? '' : '[🔥🔥🔥 TO CHECK]'
                } : ${url}`,
              );
            }
          }
        }
      }
    }

    result.push(``);
    result.push(`###############################`);
    result.push(`## Aides (champ description)`);
    result.push(`###############################`);
    result.push(``);
    const all_aides = await this.loadDataFromCMS('aides');
    all_aides.sort((a, b) => a.id - b.id);

    for (const aide of all_aides) {
      if (aide.attributes.description) {
        const urls = aide.attributes.description.match(/"https?:\/\/[^"]+"/gi);
        if (urls && urls.length > 0) {
          for (const url of urls) {
            const real_url = url.substring(1, url.length - 1);
            const ok = await this.checkURLOK(real_url);
            result.push(
              `Aide [${aide.id}] ${ok ? '' : '[🔥🔥🔥 TO CHECK]'} : ${url}`,
            );
          }
        }
      }
    }

    result.push(``);
    result.push(`###############################`);
    result.push(`## Defis (astuce / pourquoi)`);
    result.push(`###############################`);
    result.push(``);
    const all_defis = await this.loadDataFromCMS('defis');
    all_defis.sort((a, b) => a.id - b.id);

    for (const defi of all_defis) {
      if (defi.attributes.astuces) {
        const urls = defi.attributes.astuces.match(/"https?:\/\/[^"]+"/gi);
        if (urls && urls.length > 0) {
          for (const url of urls) {
            const real_url = url.substring(1, url.length - 1);
            const ok = await this.checkURLOK(real_url);
            result.push(
              `Defi [${defi.id}] ${
                ok ? '' : '[🔥🔥🔥 TO CHECK]'
              } astuce   : ${url}`,
            );
          }
        }
      }
      if (defi.attributes.pourquoi) {
        const urls = defi.attributes.pourquoi.match(/"https?:\/\/[^"]+"/gi);
        if (urls && urls.length > 0) {
          for (const url of urls) {
            const real_url = url.substring(1, url.length - 1);
            const ok = await this.checkURLOK(real_url);
            result.push(
              `Defi [${defi.id}] ${
                ok ? '' : '[🔥🔥🔥 TO CHECK]'
              } pourquoi : ${url}`,
            );
          }
        }
      }
    }
    return res.send(`<pre>${result.join('\n')}</pre>`);
  }

  private async checkURLOK(url: string): Promise<boolean> {
    let head;
    try {
      head = await axios.head(url);
    } catch (error) {
      return false;
    }
    return head.status === 200;
  }

  @Get('kyc_preview/:id')
  async kyc_preview(
    @Param('id') id: string,
    @Headers('Authorization') authorization: string,
    @Response() res: Res,
  ): Promise<any> {
    if (!this.checkAuthHeaderOK(authorization)) {
      return this.returnBadOreMissingLoginError(res);
    }
    let result = [];
    const kyc_def = await this.kycRepository.getByCMS_ID(parseInt(id));

    result.push(`

██╗░░██╗██╗░░░██╗░█████╗░
██║░██╔╝╚██╗░██╔╝██╔══██╗
█████═╝░░╚████╔╝░██║░░╚═╝
██╔═██╗░░░╚██╔╝░░██║░░██╗
██║░╚██╗░░░██║░░░╚█████╔╝
╚═╝░░╚═╝░░░╚═╝░░░░╚════╝░

`);

    result = this.dumpSingleKycPage(kyc_def);

    return res.send(`<pre>${result.join('\n')}</pre>`);
  }

  private dumpSingleKycPage(kyc_def: KycDefinition): string[] {
    let result = [];

    result.push('## KYC CMS ID : ' + kyc_def.id_cms);
    result.push('######################');

    if (!kyc_def) {
      result.push('Publiez la question avant de faire le preview !!!');
      return result;
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

    DATA.code_fonctionnel = kyc_def.code;
    DATA.catgorie = kyc_def.categorie;
    DATA.tags = kyc_def.tags;
    DATA.thematique = kyc_def.thematique;
    DATA.universes = kyc_def.universes;
    DATA.type = kyc_def.type;
    DATA.IS_NGC = kyc_def.is_ngc;
    if (kyc_def.is_ngc) {
      DATA.NGC_QUESTION_KEY = kyc_def.ngc_key;
    }

    if (!kyc_def.is_ngc) {
      DATA.reponses = kyc_def.reponses;
      result.push(JSON.stringify(DATA, null, 2));
      return result;
    }

    result.push(JSON.stringify(DATA, null, 2));
    result.push('');

    DATA = {};
    try {
      const situation: any = {};
      const base_line =
        Math.round(
          this.nGCCalculator.computeBilanFromSituation(situation)
            .bilan_carbone_annuel * 1000,
        ) / 1000;

      DATA.bilan_carbone_DEFAULT = base_line;

      if (!kyc_def.ngc_key) {
        result.push(`🔥🔥🔥 Clé de question NGC manquante ! 🔥🔥🔥`);
        delete DATA.bilan_carbone_DEFAULT;
        DATA.reponses = kyc_def.reponses;
        result.push(JSON.stringify(DATA, null, 2));

        return result;
      }

      if (kyc_def.type === TypeReponseQuestionKYC.entier) {
        situation[kyc_def.ngc_key] = 1;
        const value_1 =
          Math.round(
            this.nGCCalculator.computeBilanFromSituation(situation)
              .bilan_carbone_annuel * 1000,
          ) / 1000;
        situation[kyc_def.ngc_key] = 2;
        const value_2 =
          Math.round(
            this.nGCCalculator.computeBilanFromSituation(situation)
              .bilan_carbone_annuel * 1000,
          ) / 1000;

        DATA.with_kyc_reponse_equal_1 =
          value_1 + this.compareBilan(value_1, base_line);
        DATA.with_kyc_reponse_equal_2 =
          value_2 + this.compareBilan(value_2, base_line);
      }

      if (kyc_def.type === TypeReponseQuestionKYC.choix_unique) {
        for (const reponse of kyc_def.reponses) {
          situation[kyc_def.ngc_key] = reponse.ngc_code;
          const value =
            Math.round(
              this.nGCCalculator.computeBilanFromSituation(situation)
                .bilan_carbone_annuel * 1000,
            ) / 1000;
          DATA[`value_when_${reponse.code}`] =
            value + this.compareBilan(value, base_line);
        }
      }
    } catch (error) {
      DATA.error = '🔥 ' + error.message;
    }
    DATA.question = kyc_def.reponses;
    result.push(JSON.stringify(DATA, null, 2));
    return result;
  }

  @Get('all_kyc_preview')
  async all_kyc_preview(
    @Query('check_kyc') check_kyc: string,
    @Headers('Authorization') authorization: string,
    @Response() res: Res,
  ): Promise<any> {
    if (!this.checkAuthHeaderOK(authorization)) {
      return this.returnBadOreMissingLoginError(res);
    }
    let all_kyc_defs = await this.kycRepository.getAllDefs();
    let all_mission_defs = await this.missionRepository.list();
    let result = [];

    const kyc_fire_map: Map<number, boolean> = new Map();

    result.push(`

░█████╗░██╗░░░░░██╗░░░░░  ██╗░░██╗██╗░░░██╗░█████╗░
██╔══██╗██║░░░░░██║░░░░░  ██║░██╔╝╚██╗░██╔╝██╔══██╗
███████║██║░░░░░██║░░░░░  █████═╝░░╚████╔╝░██║░░╚═╝
██╔══██║██║░░░░░██║░░░░░  ██╔═██╗░░░╚██╔╝░░██║░░██╗
██║░░██║███████╗███████╗  ██║░╚██╗░░░██║░░░╚█████╔╝
╚═╝░░╚═╝╚══════╝╚══════╝  ╚═╝░░╚═╝░░░╚═╝░░░░╚════╝░
    
`);
    all_kyc_defs.sort((a, b) => a.id_cms - b.id_cms);
    if (check_kyc === 'true') {
      result.push(
        `Les flammes 🔥🔥🔥 indiquent des questions NGC qui ne semblent pas fonctionnelles`,
      );
      result.push(``);
      result.push(
        `<strong><a href="/all_kyc_preview">Retour page sans check KYC NGC</a></strong>`,
      );
      result.push(``);
    } else {
      result.push(
        `<strong><a href="/all_kyc_preview?check_kyc=true">START CHECK</a></strong> : Vérifier toutes les KYC NGC`,
      );
      result.push(
        `ATTENTION requette longue et intensive, à ne pas abuser, surtout en PROD 🔥`,
      );
      result.push(``);
    }

    result.push(
      `################################################################################`,
    );
    result.push(`## <strong>KYC de type Nos Gestes Climat</strong>`);
    result.push(
      `################################################################################`,
    );
    result.push(``);

    const all_kyc_defs_ngc = all_kyc_defs.filter((k) => k.is_ngc);

    for (const kyc_def of all_kyc_defs_ngc) {
      if (check_kyc === 'true') {
        this.updateFireMapForNgcKYC(kyc_fire_map, kyc_def);
      }
      result.push(
        this.dumpKycInfoToSingleLine(
          kyc_def,
          all_mission_defs,
          false,
          kyc_fire_map.get(kyc_def.id_cms),
        ),
      );
    }

    result.push(``);
    result.push(
      `################################################################################`,
    );
    result.push(`## <strong>KYCs flaguées Recommendation</strong>`);
    result.push(
      `################################################################################`,
    );
    result.push(``);

    const all_kyc_defs_reco = all_kyc_defs.filter(
      (k) => k.categorie === Categorie.recommandation,
    );

    for (const kyc_def of all_kyc_defs_reco) {
      result.push(
        this.dumpKycInfoToSingleLine(kyc_def, all_mission_defs, false, false),
      );
    }

    result.push(``);
    result.push(
      `################################################################################`,
    );
    result.push(`## <strong>KYCs flaguées Mission</strong>`);
    result.push(
      `################################################################################`,
    );
    result.push(``);

    const all_kyc_defs_mission = all_kyc_defs.filter(
      (k) => k.categorie === Categorie.mission,
    );

    for (const kyc_def of all_kyc_defs_mission) {
      result.push(
        this.dumpKycInfoToSingleLine(kyc_def, all_mission_defs, false, false),
      );
    }

    result.push(``);
    result.push(
      `################################################################################`,
    );
    result.push(`## <strong>KYCs flaguée TEST 🤔❓ 🤔❓ 🤔❓ </strong>`);
    result.push(
      `################################################################################`,
    );
    result.push(``);

    const all_kyc_defs_test = all_kyc_defs.filter(
      (k) => k.categorie === Categorie.test,
    );

    for (const kyc_def of all_kyc_defs_test) {
      result.push(
        this.dumpKycInfoToSingleLine(kyc_def, all_mission_defs, true, false),
      );
    }

    return res.send(`<pre>${result.join('\n')}</pre>`);
  }

  private updateFireMapForNgcKYC(
    map: Map<number, boolean>,
    kyc_def: KycDefinition,
  ) {
    if (kyc_def.is_ngc && map.get(kyc_def.id_cms) === undefined) {
      map.set(
        kyc_def.id_cms,
        this.dumpSingleKycPage(kyc_def).join().includes('🔥'),
      );
    }
  }

  private dumpKycInfoToSingleLine(
    kyc_def: KycDefinition,
    all_mission_defs: MissionDefinition[],
    display_NGC: boolean,
    on_fire: boolean,
  ): string {
    const list_mission_with_kyc = this.getListeMissionFromKYCID(
      kyc_def.id_cms,
      all_mission_defs,
    );
    let line = `KYC ${display_NGC ? (kyc_def.is_ngc ? 'NGC ' : 'STD ') : ''}${
      on_fire ? '🔥🔥🔥 ' : ''
    }<a href="/kyc_preview/${kyc_def.id_cms}">[${kyc_def.id_cms}]</a> => ${
      kyc_def.question
    }`;
    let index = 0;
    const last = list_mission_with_kyc.length - 1;
    for (const mission_def of list_mission_with_kyc) {
      line += ` <a href="/mission_preview/${mission_def.id_cms}">${mission_def.code}</a>`;
      if (index !== last) {
        line += ' |';
      }
      index++;
    }
    return line;
  }

  @Get('mission_preview/:id')
  async mission_preview(
    @Param('id') id: string,
    @Headers('Authorization') authorization: string,
    @Response() res: Res,
  ): Promise<any> {
    if (!this.checkAuthHeaderOK(authorization)) {
      return this.returnBadOreMissingLoginError(res);
    }

    const mission_def = await this.missionRepository.getByCMS_ID(parseInt(id));

    if (!mission_def) {
      return res.send(
        '<pre>Publiez la mission avant de faire la preview !!! </pre>',
      );
    }
    let result = [];

    result.push(`

███╗░░░███╗██╗░██████╗░██████╗██╗░█████╗░███╗░░██╗
████╗░████║██║██╔════╝██╔════╝██║██╔══██╗████╗░██║
██╔████╔██║██║╚█████╗░╚█████╗░██║██║░░██║██╔██╗██║
██║╚██╔╝██║██║░╚═══██╗░╚═══██╗██║██║░░██║██║╚████║
██║░╚═╝░██║██║██████╔╝██████╔╝██║╚█████╔╝██║░╚███║
╚═╝░░░░░╚═╝╚═╝╚═════╝░╚═════╝░╚═╝░╚════╝░╚═╝░░╚══╝

`);

    result.push(`### MISSION ID_CMS : ${mission_def.id_cms}`);
    result.push('##################################################');
    result.push(``);
    result.push(
      `Titre : ${ThematiqueRepository.getTitreThematiqueUnivers(
        mission_def.code,
      )}`,
    );
    result.push(
      `Univers : <a href="/univers_preview/${
        mission_def.thematique
      }">${ThematiqueRepository.getTitreUnivers(mission_def.thematique)}</a>`,
    );
    result.push(`Est visible                : ${mission_def.est_visible}`);
    result.push(`Est première dans la liste : ${mission_def.est_visible}`);

    await this.dump_mission(result, mission_def);

    result.push('');
    result.push('##################################################');
    result.push('# Liste Défis');
    result.push('##################################################');

    await this.dump_defis_of_mission(mission_def, result);

    return res.send(`<pre>${result.join('\n')}</pre>`);
  }

  private async dump_mission(result: any[], mission_def: MissionDefinition) {
    try {
      result.push('');
      result.push('##################################################');
      result.push('# Liste KYCs');
      result.push('##################################################');

      for (const objectif of mission_def.objectifs) {
        if (objectif.type === ContentType.kyc) {
          const kyc_def = await this.kycRepository.getByCMS_ID(objectif.id_cms);
          if (!kyc_def) {
            result.push(``);
            result.push(
              `🔥🔥🔥 KYC [${objectif.id_cms}] MANQUANTE en base, sans doute pas publié ?`,
            );
            result.push(``);
          } else {
            result.push(``);
            result.push(
              `## <a href="/kyc_preview/${kyc_def.id_cms}">KYC</a> [${
                kyc_def.id_cms
              }] ${kyc_def.a_supprimer ? '[🔥🔥🔥 FLAG A SUPPRIMER]' : ''}`,
            );

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
          }
        }
      }

      result.push('');
      result.push('##################################################');
      result.push('# Liste Articles et Quizz');
      result.push('##################################################');
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
            if (!article) {
              result.push(``);
              result.push(
                `🔥🔥🔥 ARTICLE FIXE [${objectif.content_id}] MANQUANT en base, sans doute pas publié ?`,
              );
              result.push(``);
              continue;
            }

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
          if (!quizz) {
            result.push(``);
            result.push(
              `🔥🔥🔥 QUIZZ  [${objectif.content_id}] MANQUANT en base, sans doute pas publié ?`,
            );
            result.push(``);
            continue;
          }

          const DATA: any = {};
          DATA.objectif_titre = objectif.titre;
          DATA.objectif_points = objectif.points;
          DATA.quizz_titre = quizz.titre;
          DATA.quizz_points = quizz.points;
          result.push(JSON.stringify(DATA, null, 2));
        }
      }
    } catch (error) {
      result.push('🔥🔥🔥 UNKNOWN ERROR');
      result.push(error.message);
    }
  }

  private async dump_defis_of_mission(
    mission_def: MissionDefinition,
    result: any[],
  ) {
    for (const objectif of mission_def.objectifs) {
      if (objectif.type === ContentType.defi) {
        result.push('');
        result.push(
          `######## <a href="/defi_preview/${objectif.content_id}">DEFI</a> [${objectif.content_id}] ########`,
        );
        const defi = await this.defiRepository.getByContentId(
          objectif.content_id,
        );
        if (!defi) {
          result.push(``);
          result.push(
            `🔥🔥🔥 DEFI  [${objectif.content_id}] MANQUANT en base, sans doute pas publié ?`,
          );
          result.push(``);
          continue;
        }
        const DATA: any = {};
        DATA.objectif_titre = objectif.titre;
        DATA.objectif_points = objectif.points;
        DATA.defi_titre = defi.titre;
        DATA.defi_points = defi.points;
        result.push(JSON.stringify(DATA, null, 2));

        await this.dump_defi_conditions(result, defi);
      }
    }
  }

  @Get('all_preview')
  async all_preview(
    @Headers('Authorization') authorization: string,
    @Response() res: Res,
  ) {
    if (!this.checkAuthHeaderOK(authorization)) {
      return this.returnBadOreMissingLoginError(res);
    }

    let result = [];

    let DATA: any = {};

    const all_thematiques = Object.values(Thematique);

    result.push(`


██╗░░░░░███████╗  ░██████╗░██████╗░░█████╗░███╗░░██╗██████╗░  ████████╗░█████╗░██╗░░░██╗████████╗
██║░░░░░██╔════╝  ██╔════╝░██╔══██╗██╔══██╗████╗░██║██╔══██╗  ╚══██╔══╝██╔══██╗██║░░░██║╚══██╔══╝
██║░░░░░█████╗░░  ██║░░██╗░██████╔╝███████║██╔██╗██║██║░░██║  ░░░██║░░░██║░░██║██║░░░██║░░░██║░░░
██║░░░░░██╔══╝░░  ██║░░╚██╗██╔══██╗██╔══██║██║╚████║██║░░██║  ░░░██║░░░██║░░██║██║░░░██║░░░██║░░░
███████╗███████╗  ╚██████╔╝██║░░██║██║░░██║██║░╚███║██████╔╝  ░░░██║░░░╚█████╔╝╚██████╔╝░░░██║░░░
╚══════╝╚══════╝  ░╚═════╝░╚═╝░░╚═╝╚═╝░░╚═╝╚═╝░░╚══╝╚═════╝░  ░░░╚═╝░░░░╚════╝░░╚═════╝░░░░╚═╝░░░

`);

    for (const thematique of all_thematiques) {
      const preview_univers = await this.univers_preview(
        thematique,
        authorization,
        res,
        true,
      );
      const prefix = ` Univers [${thematique}] - <a href="/univers_preview/${thematique}">${ThematiqueRepository.getLibelleThematique(
        thematique,
      )}</a>`;
      if (preview_univers.includes('🔥🔥🔥')) {
        result.push(
          ` ${prefix} ${this.getSpaceString(
            80,
            prefix.length - thematique.length,
          )}> HAS SOME 🔥🔥🔥`,
        );
      } else {
        result.push(
          ` ${prefix} ${this.getSpaceString(
            80,
            prefix.length - thematique.length,
          )}> LOOKS GOOD`,
        );
      }
    }

    result.push(``);
    result.push(``);
    result.push('<h2>Fonctionalités clés</h2>');
    result.push(
      `<strong>[1] Détecter un contenu manquant mais référencé par une mission</strong>`,
    );
    result.push(` > Article`);
    result.push(` > KYC`);
    result.push(` > Quizz`);
    result.push(` > Defi`);
    result.push(``);
    result.push(
      `<strong>[2] Détecter un défi aux conditionalités mal paramétrées</strong>`,
    );
    result.push(` > Typo dans le code réponse `);
    result.push(` > KYC manquante`);
    result.push(``);
    result.push(
      `<strong>[3] Valider le bon fonctionnement d'une KYC NGC</strong>`,
    );
    result.push(` > Clé de la question connue par NGC `);
    result.push(` > Influence des codes réponse sur le bilan carbone`);
    result.push(``);
    result.push(
      `<strong>[4] Prévisualiser les articles locaux candidats dans une mission</strong>`,
    );
    result.push(` > Tag et liste candidats`);
    result.push(` > Codes de localisation (commune, département, région) `);
    result.push(``);
    result.push(
      `<strong>[5] Contrôler la visibilité des univers et missions</strong>`,
    );
    result.push(` > Regroupement des missions par famille`);
    result.push(` > Ordre des missions `);
    result.push(` > Visibilité des missions `);
    result.push(``);
    result.push(`<strong>[6] Vue agrégée des problèmes</strong>`);
    result.push(` > Sur l'ensemble des univers`);
    result.push(` > Sur l'ensemble d'une mission`);

    return res.send(`<pre>${result.join('\n')}</pre>`);
  }

  @Get('univers_preview/:id')
  async univers_preview(
    @Param('id') input_thematique: Thematique,
    @Headers('Authorization') authorization: string,
    @Response() res: Res,
    prevent_send?: boolean,
  ): Promise<any> {
    let result = [];

    let DATA: any = {};

    const tuile_univers =
      ThematiqueRepository.getTuileUnivers(input_thematique);
    result.push(`


████████╗██╗░░██╗███████╗███╗░░░███╗░█████╗░████████╗██╗░██████╗░██╗░░░██╗███████╗░██████╗
╚══██╔══╝██║░░██║██╔════╝████╗░████║██╔══██╗╚══██╔══╝██║██╔═══██╗██║░░░██║██╔════╝██╔════╝
░░░██║░░░███████║█████╗░░██╔████╔██║███████║░░░██║░░░██║██║██╗██║██║░░░██║█████╗░░╚█████╗░
░░░██║░░░██╔══██║██╔══╝░░██║╚██╔╝██║██╔══██║░░░██║░░░██║╚██████╔╝██║░░░██║██╔══╝░░░╚═══██╗
░░░██║░░░██║░░██║███████╗██║░╚═╝░██║██║░░██║░░░██║░░░██║░╚═██╔═╝░╚██████╔╝███████╗██████╔╝
░░░╚═╝░░░╚═╝░░╚═╝╚══════╝╚═╝░░░░░╚═╝╚═╝░░╚═╝░░░╚═╝░░░╚═╝░░░╚═╝░░░░╚═════╝░╚══════╝╚═════╝░
`);

    const all_thematiques = Object.values(Thematique);
    result.push(`################################`);
    result.push(``);
    for (const thematique of all_thematiques) {
      if (thematique === input_thematique) {
        const prefix = `>> Thematique [${thematique}]`;
        result.push(
          `${prefix} ${this.getSpaceString(
            30,
            prefix.length,
          )} <a href="/univers_preview/${thematique}">${ThematiqueRepository.getLibelleThematique(
            thematique,
          )}</a>`,
        );
      } else {
        const prefix = `   Thematique [${thematique}]`;
        this.getSpaceString(25, prefix.length);
        result.push(
          `${prefix} ${this.getSpaceString(
            30,
            prefix.length,
          )} <a href="/univers_preview/${thematique}">${ThematiqueRepository.getLibelleThematique(
            thematique,
          )}</a>`,
        );
      }
    }

    if (!tuile_univers) {
      result.push(``);
      result.push(
        `🔥🔥🔥 Missing Univer in CMS for themtique [${input_thematique}]`,
      );
      result.push(``);
      if (prevent_send) {
        return `<pre>${result.join('\n')}</pre>`;
      }
      return res.send(`<pre>${result.join('\n')}</pre>`);
    }

    result.push(``);
    result.push(`################################`);
    result.push(``);
    result.push(`<a href="/all_preview">SYNTHESE GLOBALE</a>`);
    result.push(``);

    result.push(`########################`);
    result.push(`### UNIVERS ID_CMS : ${tuile_univers.id_cms}`);
    result.push(`########################`);
    result.push(``);
    DATA.titre = tuile_univers.titre;
    DATA.code = tuile_univers.type;
    result.push(JSON.stringify(DATA, null, 2));
    result.push(``);

    result.push('###############################');
    result.push(`# Liste Missions UNIVERS [${input_thematique}]`);
    result.push('###############################');

    let missions = this.missionRepository.getByThematique(input_thematique);

    missions = this.missionUsecase.ordonneTuilesMission(missions);

    for (const mission of missions) {
      const mission_def = await this.missionRepository.getByCode(mission.code);
      if (mission_def) {
        result.push('');
        const prefix = `#### <a href="/mission_preview/${mission_def.id_cms}">MISSION [${mission_def.id_cms}]</a>`;
        result.push(
          `${prefix} ${this.getSpaceString(65, prefix.length)}> ${
            mission.titre
          }`,
        );
        result.push(`Est visible  : ${mission_def.est_visible}`);
        result.push(`Est première : ${mission_def.is_first}`);

        const result2 = [];
        await this.dump_defis_of_mission(mission_def, result2);

        const result3 = [];
        await this.dump_mission(result3, mission_def);

        const ouput2 = result2.join('');
        const ouput3 = result3.join('');
        result.push(
          `Paramétrage défis : ${
            ouput2.includes('🔥🔥🔥 MISSING') ? 'KO 🔥🔥🔥' : 'OK 👍'
          }`,
        );
        result.push(
          `Contenu disponible : ${
            ouput3.includes('MANQUANT') || ouput2.includes('MISSING KYC')
              ? 'KO 🔥🔥🔥'
              : 'OK 👍'
          }`,
        );
        if (ouput3.includes('UNKNOWN ERROR'))
          result.push(
            `🔥🔥🔥 ERREUR Inconnue, allez voir le détail de la mission`,
          );
        if (ouput3.includes('🔥🔥🔥 FLAG A SUPPRIMER'))
          result.push(
            `🔥🔥🔥 La mission contient au moins une KYC 'à supprimer', c-à-d à ne plus utiliser`,
          );
      } else {
        result.push('');
        result.push(
          `🔥🔥🔥 Thematique sans mission [${mission.code}] - ${mission.titre}`,
        );
        result.push('');
      }
    }
    if (prevent_send) {
      return `<pre>${result.join('\n')}</pre>`;
    }
    return res.send(`<pre>${result.join('\n')}</pre>`);
  }

  @Get('defi_preview/:id')
  async defi_preview(
    @Param('id') id: string,
    @Headers('Authorization') authorization: string,
    @Response() res: Res,
  ): Promise<any> {
    if (!this.checkAuthHeaderOK(authorization)) {
      return this.returnBadOreMissingLoginError(res);
    }
    let result = [];

    const defi_def = await this.defiRepository.getByContentId(id);
    if (!defi_def) {
      return res.send(
        `<pre>Publiez le defi [${id}] avant de faire la preview !!! </pre>`,
      );
    }

    result.push(`

██████╗░███████╗███████╗██╗
██╔══██╗██╔════╝██╔════╝██║
██║░░██║█████╗░░█████╗░░██║
██║░░██║██╔══╝░░██╔══╝░░██║
██████╔╝███████╗██║░░░░░██║
╚═════╝░╚══════╝╚═╝░░░░░╚═╝

`);
    result.push(`### DEFI ID_CMS [${id}] - ${defi_def.titre}`);
    result.push(`#######################`);

    const DATA: any = {};
    DATA.defi_points = defi_def.points;
    DATA.mois = defi_def.mois;
    DATA.tags = defi_def.tags;
    DATA.thematique = defi_def.thematique;
    DATA.categorie = defi_def.categorie;
    DATA.thematiques_univers = defi_def.thematiques_univers;
    DATA.universes = defi_def.universes;
    result.push(JSON.stringify(DATA, null, 2));

    await this.dump_defi_conditions(result, defi_def);

    return res.send(`<pre>${result.join('\n')}</pre>`);
  }

  private async dump_defi_conditions(result: any[], defi: DefiDefinition) {
    if (defi.conditions.length > 0) {
      result.push('');
      result.push(`## Conditions`);
      result.push('');
      for (const OU_C of defi.conditions) {
        result.push('|---- OU -----');
        for (const ET_C of OU_C) {
          const target_kyc = await this.kycRepository.getByCMS_ID(ET_C.id_kyc);
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
            qualif = ` 🔥🔥🔥 MISSING KYC of id [${ET_C.id_kyc}]`;
          }
          result.push(
            `| [<a href="/kyc_preview/${ET_C.id_kyc}">KYC</a> ` +
              ET_C.id_kyc +
              '] -> [' +
              ET_C.code_reponse +
              '] ' +
              qualif +
              `  (${target_kyc ? target_kyc.question : ''})`,
          );
        }
      }
      result.push('|-------------');
    }
  }

  private getSpaceString(length: number, prefix_length: number) {
    if (prefix_length > length) return '';
    return '-----------------------------------------------------------------------------------------'.substr(
      0,
      length - prefix_length,
    );
  }
  private getListeMissionFromKYCID(
    kyc_id: number,
    liste_mission_defs: MissionDefinition[],
  ): MissionDefinition[] {
    return liste_mission_defs.filter(
      (m) =>
        m.objectifs.findIndex(
          (o) => o.id_cms === kyc_id && o.type === ContentType.kyc,
        ) > -1,
    );
  }

  private compareBilan(value: number, bilan: number): string {
    if (value === bilan) {
      return ' = Bilan DEFAULT 🤔❓';
    }
    if (value > bilan) {
      return (
        ' > Bilan DEFAULT de ' +
        Math.round((value - bilan) * 1000) / 1000 +
        ' kg'
      );
    } else {
      return (
        ' < Bilan DEFAULT de ' +
        Math.round((bilan - value) * 1000) / 1000 +
        ' kg'
      );
    }
  }

  private async loadDataFromCMS(
    type:
      | 'articles'
      | 'quizzes'
      | 'aides'
      | 'defis'
      | 'kycs'
      | 'missions'
      | 'universes'
      | 'thematiques-univers',
  ): Promise<CMSWebhookPopulateAPI[]> {
    let result = [];
    const page_1 = '&pagination[start]=0&pagination[limit]=100';
    const page_2 = '&pagination[start]=100&pagination[limit]=100';
    const page_3 = '&pagination[start]=200&pagination[limit]=100';
    const page_4 = '&pagination[start]=300&pagination[limit]=400';
    let response = null;
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${App.getCmsApiKey()}`,
    };

    let URL = this.buildPopulateURL(page_1, type);
    response = await axios.get(URL, { headers: headers });
    result = result.concat(response.data.data);

    URL = this.buildPopulateURL(page_2, type);
    response = await axios.get(URL, { headers: headers });
    result = result.concat(response.data.data);

    URL = this.buildPopulateURL(page_3, type);
    response = await axios.get(URL, { headers: headers });
    result = result.concat(response.data.data);

    URL = this.buildPopulateURL(page_4, type);
    response = await axios.get(URL, { headers: headers });
    result = result.concat(response.data.data);

    return result;
  }

  private buildPopulateURL(page: string, type: string) {
    const URL = App.getCmsURL().concat(
      '/',
      type,
      '?populate[0]=thematiques&populate[1]=imageUrl&populate[2]=partenaire&populate[3]=thematique_gamification&populate[4]=rubriques&populate[5]=thematique&populate[6]=tags&populate[7]=besoin&populate[8]=univers&populate[9]=thematique_univers&populate[10]=prochaines_thematiques&populate[11]=objectifs&populate[12]=thematique_univers_unique&populate[13]=objectifs.article&populate[14]=objectifs.quizz&populate[15]=objectifs.defi&populate[16]=objectifs.kyc&populate[17]=reponses&populate[18]=OR_Conditions&populate[19]=OR_Conditions.AND_Conditions&populate[20]=OR_Conditions.AND_Conditions.kyc&populate[21]=famille&populate[22]=univers_parent&populate[23]=tag_article&populate[24]=objectifs.tag_article',
    );
    return URL.concat(page);
  }

  private returnBadOreMissingLoginError(res: Res) {
    return res
      .set({ 'WWW-Authenticate': 'Basic realm=preview' })
      .status(401)
      .send('Bad or missing login / password');
  }
  private checkAuthHeaderOK(header: string): boolean {
    if (!header || !header.startsWith('Basic ')) {
      return false;
    }
    const base64 = header.split(' ').pop();
    return App.getBasicLoginPwdBase64() == base64;
  }
}
