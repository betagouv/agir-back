import {
  Controller,
  Get,
  Headers,
  Param,
  Query,
  Response,
} from '@nestjs/common';
import { ApiBearerAuth, ApiExcludeController, ApiTags } from '@nestjs/swagger';
import axios from 'axios';
import { Response as Res } from 'express';
import { App } from '../../domain/app';
import { Categorie } from '../../domain/contenu/categorie';
import { KycDefinition } from '../../domain/kyc/kycDefinition';
import { TypeReponseQuestionKYC } from '../../domain/kyc/questionKYC';
import { Thematique } from '../../domain/thematique/thematique';
import { NGCCalculator } from '../ngc/NGCCalculator';
import { KycRepository } from '../repository/kyc.repository';
import { ThematiqueRepository } from '../repository/thematique.repository';
import { GenericControler } from './genericControler';
import { CMSWebhookPopulateAPI } from './types/cms/CMSWebhookPopulateAPI';

// https://fsymbols.com/generators/carty/

@ApiTags('ASCII Previews')
@Controller()
@ApiExcludeController()
@ApiBearerAuth()
export class AsciiPreviewController extends GenericControler {
  constructor(
    private kycRepository: KycRepository,
    private nGCCalculator: NGCCalculator,
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
          this.nGCCalculator.computeBasicBilanFromSituation(situation)
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
            this.nGCCalculator.computeBasicBilanFromSituation(situation)
              .bilan_carbone_annuel * 1000,
          ) / 1000;
        situation[kyc_def.ngc_key] = 2;
        const value_2 =
          Math.round(
            this.nGCCalculator.computeBasicBilanFromSituation(situation)
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
              this.nGCCalculator.computeBasicBilanFromSituation(situation)
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
    let all_kyc_defs = KycRepository.getCatalogue();
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
      result.push(this.dumpKycInfoToSingleLine(kyc_def, false, false));
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
      result.push(this.dumpKycInfoToSingleLine(kyc_def, false, false));
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
      result.push(this.dumpKycInfoToSingleLine(kyc_def, true, false));
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
    display_NGC: boolean,
    on_fire: boolean,
  ): string {
    let line = `KYC ${display_NGC ? (kyc_def.is_ngc ? 'NGC ' : 'STD ') : ''}${
      on_fire ? '🔥🔥🔥 ' : ''
    }<a href="/kyc_preview/${kyc_def.id_cms}">[${kyc_def.id_cms}]</a> => ${
      kyc_def.question
    }`;
    let index = 0;
    return line;
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
    if (!this.checkAuthHeaderOK(authorization)) {
      return this.returnBadOreMissingLoginError(res);
    }

    let result = [];

    let DATA: any = {};

    result.push(`


████████╗██╗░░██╗███████╗███╗░░░███╗░█████╗░████████╗██╗░██████╗░██╗░░░██╗███████╗░██████╗
╚══██╔══╝██║░░██║██╔════╝████╗░████║██╔══██╗╚══██╔══╝██║██╔═══██╗██║░░░██║██╔════╝██╔════╝
░░░██║░░░███████║█████╗░░██╔████╔██║███████║░░░██║░░░██║██║██╗██║██║░░░██║█████╗░░╚█████╗░
░░░██║░░░██╔══██║██╔══╝░░██║╚██╔╝██║██╔══██║░░░██║░░░██║╚██████╔╝██║░░░██║██╔══╝░░░╚═══██╗
░░░██║░░░██║░░██║███████╗██║░╚═╝░██║██║░░██║░░░██║░░░██║░╚═██╔═╝░╚██████╔╝███████╗██████╔╝
░░░╚═╝░░░╚═╝░░╚═╝╚══════╝╚═╝░░░░░╚═╝╚═╝░░╚═╝░░░╚═╝░░░╚═╝░░░╚═╝░░░░╚═════╝░╚══════╝╚═════╝░
`);

    const thematiqueDef =
      ThematiqueRepository.getThematiqueDefinition(input_thematique);
    const all_thematiques = ThematiqueRepository.getAllThematiques();
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

    result.push(``);
    result.push(`################################`);
    result.push(``);
    result.push(`<a href="/all_preview">SYNTHESE GLOBALE</a>`);
    result.push(``);

    result.push(`########################`);
    result.push(
      `### Thematique : ${ThematiqueRepository.getTitreThematique(
        input_thematique,
      )}`,
    );
    result.push(`########################`);
    result.push(``);
    DATA.id_cms = thematiqueDef.id_cms;
    DATA.titre = thematiqueDef.titre;
    DATA.label = thematiqueDef.label;
    DATA.code = thematiqueDef.code;
    DATA.emoji = thematiqueDef.emoji;
    DATA.image_url = thematiqueDef.image_url;
    result.push(JSON.stringify(DATA, null, 2));
    result.push(``);

    result.push('###############################');
    result.push(`# Liste Missions UNIVERS [${input_thematique}]`);
    result.push('###############################');

    if (prevent_send) {
      return `<pre>${result.join('\n')}</pre>`;
    }
    return res.send(`<pre>${result.join('\n')}</pre>`);
  }

  private getSpaceString(length: number, prefix_length: number) {
    if (prefix_length > length) return '';
    return '-----------------------------------------------------------------------------------------'.substr(
      0,
      length - prefix_length,
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
