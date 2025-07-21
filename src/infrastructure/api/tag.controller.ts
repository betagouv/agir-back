import { Controller, Get, Query, Response, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiProperty, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { Response as Res } from 'express';
import { Action } from '../../domain/actions/action';
import { TypeAction } from '../../domain/actions/typeAction';
import { KYCID } from '../../domain/kyc/KYCID';
import { ComputedTagList } from '../../domain/scoring/system_v2/ComputedTagList';
import { EditorialTagList } from '../../domain/scoring/system_v2/EditorialTagList';
import { KycToTags_v2 } from '../../domain/scoring/system_v2/kycToTagsV2';
import { ProfileRecommandationUtilisateur } from '../../domain/scoring/system_v2/profileRecommandationUtilisateur';
import { Tag_v2 } from '../../domain/scoring/system_v2/Tag_v2';
import { Thematique } from '../../domain/thematique/thematique';
import { ApplicationError } from '../applicationError';
import { ActionRepository } from '../repository/action.repository';
import { KycRepository } from '../repository/kyc.repository';
import { StatistiqueExternalRepository } from '../repository/statitstique.external.repository';
import { TagRepository } from '../repository/tag.repository';
import { GenericControler } from './genericControler';

class ActionTagAPI {
  @ApiProperty() id_cms: string;
  @ApiProperty() code: string;
  @ApiProperty() type: string;
  @ApiProperty() titre: string;
  @ApiProperty({ enum: Thematique }) thematique: Thematique;
}
class KycTagAPI {
  @ApiProperty() id_cms: string;
  @ApiProperty() code: string;
  @ApiProperty() question: string;
}
class WarningTagAPI {
  @ApiProperty() est_cms_declaration_manquante: boolean;
  @ApiProperty() est_backend_declaration_manquante: boolean;
  @ApiProperty() est_activation_fonctionnelle_absente: boolean;
}

enum TypeTag {
  user_kyc = 'user_kyc',
  user_computed = 'user_computed',
  editorial = 'editorial',
}

class TagAPI {
  @ApiProperty() code: string;
  @ApiProperty() label_recommandation: string;
  @ApiProperty() description_interne: string;
  @ApiProperty({ type: WarningTagAPI }) warnings: WarningTagAPI;
  @ApiProperty({ enum: TypeTag }) type: TypeTag;
  @ApiProperty() pourcentage_user_avec_tag: number;
  @ApiProperty() nombre_user_avec_tag: number;
  @ApiProperty({ type: [KycTagAPI] }) kyc_creation_tag: KycTagAPI[];
  @ApiProperty({ type: [ActionTagAPI] }) actions_incluantes: ActionTagAPI[];
  @ApiProperty({ type: [ActionTagAPI] }) actions_excluantes: ActionTagAPI[];

  constructor(tag: string) {
    this.actions_excluantes = [];
    this.actions_incluantes = [];
    this.kyc_creation_tag = [];
    this.code = tag;
    this.warnings = {
      est_activation_fonctionnelle_absente: false,
      est_backend_declaration_manquante: false,
      est_cms_declaration_manquante: false,
    };
    const tag_def = TagRepository.getTagDefinition(tag);
    if (tag_def) {
      this.label_recommandation = tag_def.label_explication;
      this.description_interne = tag_def.description;
      this.warnings.est_cms_declaration_manquante = false;
    } else {
      this.warnings.est_cms_declaration_manquante = true;
    }
  }
}

class ProfileRecoActionAPI {
  @ApiProperty({ enum: Thematique }) thematique: Thematique;
  @ApiProperty() titre: string;
  @ApiProperty({ enum: TypeAction }) type: TypeAction;
  @ApiProperty() pourcentage_reco: number;
  @ApiProperty() est_exclue: boolean;
}

class ProfileRecoAPI {
  @ApiProperty({ type: [ProfileRecoActionAPI] })
  logement: ProfileRecoActionAPI[];

  @ApiProperty({ type: [ProfileRecoActionAPI] })
  transport: ProfileRecoActionAPI[];

  @ApiProperty({ type: [ProfileRecoActionAPI] })
  consommation: ProfileRecoActionAPI[];

  @ApiProperty({ type: [ProfileRecoActionAPI] })
  alimentation: ProfileRecoActionAPI[];
}

export class KycTagsAPI {
  @ApiProperty({ enum: KYCID })
  kyc: KYCID;

  @ApiProperty({ enum: Tag_v2, isArray: true })
  tags: Tag_v2[];
}

export class DynamicTagAPI {
  @ApiProperty({ enum: Tag_v2 })
  tag: Tag_v2;

  @ApiProperty() explication: string;
}

export class TagCMSAPI {
  @ApiProperty()
  id_cms: string;

  @ApiProperty()
  tag_id: string;

  @ApiProperty()
  label_explication_front: string;

  @ApiProperty()
  description_interne: string;

  @ApiProperty()
  ponderation: number;

  @ApiProperty()
  boost: number;
}

export class MappingKycTagAPI {
  @ApiProperty({ type: [KycTagsAPI] }) mapped_kyc_liste: KycTagsAPI[];

  @ApiProperty({ enum: Tag_v2, isArray: true })
  reachable_tags_via_kycs: Tag_v2[];

  @ApiProperty({ enum: Tag_v2, isArray: true })
  unreachable_tags_via_kyc: Tag_v2[];

  @ApiProperty({ type: [DynamicTagAPI] })
  dynamic_tags: DynamicTagAPI[];

  @ApiProperty({ type: [TagCMSAPI] }) cms_tags_not_in_backend: TagCMSAPI[];

  @ApiProperty({ enum: Tag_v2, isArray: true })
  backend_tags_not_in_cms: Tag_v2[];

  @ApiProperty({ type: [TagCMSAPI] })
  full_cms_tag_collection: TagCMSAPI[];
}

@ApiTags('Z - Admin')
@Controller()
export class TagController extends GenericControler {
  constructor(
    private actionRepository: ActionRepository,
    private statsRepo: StatistiqueExternalRepository,
    private kycRepo: KycRepository,
  ) {
    super();
  }

  @Get('recommandation/simulateur_actions_recommandees')
  @ApiQuery({
    name: 'tag',
    enum: Tag_v2,
    required: false,
    isArray: true,
    description: `liste des tags de l'utilisateur, si spécifié, prend la place des personas`,
  })
  @ApiOkResponse({ type: ProfileRecoAPI })
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 3, ttl: 1000 } })
  async action_reco_par_tag(
    @Query('tag') tag: string | string[],
    @Response() res: Res,
  ): Promise<any> {
    const result: ProfileRecoAPI = {
      alimentation: [],
      consommation: [],
      logement: [],
      transport: [],
    };

    const tag_liste = this.getStringListFromStringArrayAPIInput(tag);
    let final_tag_liste: Tag_v2[] = [];
    for (const one_tag of tag_liste) {
      if (Tag_v2[one_tag]) {
        final_tag_liste.push(Tag_v2[one_tag]);
      } else {
        ApplicationError.throwTagInconnu(one_tag);
      }
    }

    const profile = new ProfileRecommandationUtilisateur({
      version: 0,
      liste_tags_actifs: final_tag_liste,
    });

    let stock_actions = this.actionRepository
      .getActionCompleteList()
      .map((a) => new Action(a));

    profile.trierEtFiltrerRecommandations(stock_actions);

    for (const action of stock_actions) {
      const element = {
        pourcentage_reco: Math.round(action.pourcent_match),
        thematique: action.thematique,
        titre: action.titre,
        type: action.type,
        est_exclue: action.explicationScore.doesContainAnyExclusion(),
      };
      if (action.thematique === Thematique.alimentation) {
        result.alimentation.push(element);
      }
      if (action.thematique === Thematique.logement) {
        result.logement.push(element);
      }
      if (action.thematique === Thematique.consommation) {
        result.consommation.push(element);
      }
      if (action.thematique === Thematique.transport) {
        result.transport.push(element);
      }
    }

    result.alimentation.sort((a, b) => b.pourcentage_reco - a.pourcentage_reco);
    result.logement.sort((a, b) => b.pourcentage_reco - a.pourcentage_reco);
    result.transport.sort((a, b) => b.pourcentage_reco - a.pourcentage_reco);
    result.consommation.sort((a, b) => b.pourcentage_reco - a.pourcentage_reco);

    return res.json(result);
  }

  @Get('recommandation/mapping_kyc_tags')
  @ApiOkResponse({ type: MappingKycTagAPI })
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 3, ttl: 1000 } })
  async mapping_kyc_tags(): Promise<MappingKycTagAPI> {
    const report = KycToTags_v2.generate_dependency_report();

    const result = new MappingKycTagAPI();
    result.mapped_kyc_liste = [];

    const final_tag_set = new Set<Tag_v2>();

    for (const [kyc, tag_set] of report) {
      result.mapped_kyc_liste.push({
        kyc: kyc,
        tags: Array.from(tag_set.values()),
      });
      for (const value of tag_set.values()) {
        final_tag_set.add(value);
      }
    }

    result.reachable_tags_via_kycs = Array.from(final_tag_set.values());

    result.dynamic_tags = [];

    for (const [tag, explication] of Object.entries(ComputedTagList)) {
      result.dynamic_tags.push({
        tag: Tag_v2[tag],
        explication: explication,
      });
    }

    const unreachable = [];
    for (const tag of Object.values(Tag_v2)) {
      if (
        !result.reachable_tags_via_kycs.includes(tag) &&
        !(result.dynamic_tags.findIndex((t) => t.tag === tag) > -1)
      ) {
        unreachable.push(tag);
      }
    }
    result.unreachable_tags_via_kyc = unreachable;

    result.cms_tags_not_in_backend = [];
    result.backend_tags_not_in_cms = [];
    for (const tag of Object.values(Tag_v2)) {
      if (!TagRepository.getTagDefinition(tag)) {
        result.backend_tags_not_in_cms.push(tag);
      }
    }
    result.full_cms_tag_collection = [];
    for (const [tag, definition] of TagRepository.getCatalogue()) {
      const def = {
        id_cms: definition.cms_id,
        tag_id: definition.tag,
        label_explication_front: definition.label_explication,
        description_interne: definition.description,
        ponderation: definition.ponderation,
        boost: definition.boost,
      };
      if (!Tag_v2[tag]) {
        result.cms_tags_not_in_backend.push(def);
      }
      result.full_cms_tag_collection.push(def);
    }

    return result;
  }

  @Get('tags/dictionnaire')
  @ApiOkResponse({ type: [TagAPI] })
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 3, ttl: 1000 } })
  async getDicoTags(): Promise<TagAPI[]> {
    const dico = this.build_dictionnaire();
    return dico;
  }

  private async build_dictionnaire(): Promise<TagAPI[]> {
    const result: TagAPI[] = [];

    const nombre_total_users = await this.utilisateurRepository.countAll();

    const dependency_report = KycToTags_v2.generate_dependency_report();
    const reverse_dependency: Map<Tag_v2, Set<KYCID>> = new Map();

    for (const [kyc_id, tag_set] of dependency_report.entries()) {
      for (const tag of tag_set) {
        const elem = reverse_dependency.get(tag);
        if (elem) {
          elem.add(KYCID[kyc_id]);
        } else {
          const set: Set<KYCID> = new Set();
          set.add(KYCID[kyc_id]);
          reverse_dependency.set(tag, set);
        }
      }
    }

    for (const tag of Object.values(Tag_v2)) {
      const tag_api: TagAPI = new TagAPI(tag);

      await this.enrichTagInfo(tag_api, reverse_dependency, nombre_total_users);

      result.push(tag_api);
    }

    for (const tag_def of TagRepository.getCatalogue().values()) {
      if (!Tag_v2[tag_def.tag]) {
        const tag_api = new TagAPI(tag_def.tag);

        tag_api.warnings.est_backend_declaration_manquante = true;

        await this.enrichTagInfo(
          tag_api,
          reverse_dependency,
          nombre_total_users,
        );
        result.push(tag_api);
      }
    }
    return result;
  }

  private async enrichTagInfo(
    tag_api: TagAPI,
    reverse_dependency: Map<Tag_v2, Set<KYCID>>,
    nombre_total_users: number,
  ) {
    const tagged_users = await this.statsRepo.getNombreUserAvecTag(
      tag_api.code,
    );
    tag_api.nombre_user_avec_tag = tagged_users;
    tag_api.pourcentage_user_avec_tag =
      Math.round((tagged_users / nombre_total_users) * 1000) / 10;

    if (this.isComputed(tag_api.code)) {
      tag_api.type = TypeTag.user_computed;
      tag_api.description_interne = ComputedTagList[tag_api.code];
    } else if (this.isEditorial(tag_api.code)) {
      tag_api.type = TypeTag.editorial;
      tag_api.description_interne = EditorialTagList[tag_api.code];
    } else {
      tag_api.type = TypeTag.user_kyc;
    }

    if (Tag_v2[tag_api.code]) {
      const set_kyc = reverse_dependency.get(Tag_v2[tag_api.code]);
      if (set_kyc) {
        for (const kyc of set_kyc) {
          tag_api.kyc_creation_tag.push({
            id_cms: '' + this.kycRepo.getByCode(kyc)?.id_cms,
            code: kyc,
            question: this.kycRepo.getByCode(kyc)?.question,
          });
        }
      } else {
        if (this.isKycBased(tag_api.code)) {
          tag_api.warnings.est_activation_fonctionnelle_absente = true;
        }
      }
    }

    for (const action_def of this.actionRepository.getActionCompleteList()) {
      if (action_def.tags_a_inclure.includes(tag_api.code)) {
        tag_api.actions_incluantes.push({
          code: action_def.code,
          thematique: action_def.thematique,
          titre: action_def.titre,
          type: action_def.type,
          id_cms: action_def.cms_id,
        });
      }
      if (action_def.tags_a_exclure.includes(tag_api.code)) {
        tag_api.actions_excluantes.push({
          code: action_def.code,
          thematique: action_def.thematique,
          titre: action_def.titre,
          type: action_def.type,
          id_cms: action_def.cms_id,
        });
      }
    }
  }

  private isEditorial(tag: string): boolean {
    return !!EditorialTagList[tag];
  }
  private isComputed(tag: string): boolean {
    return !!ComputedTagList[tag];
  }
  private isKycBased(tag: string): boolean {
    return !ComputedTagList[tag] && !EditorialTagList[tag] && !!Tag_v2[tag];
  }
}
