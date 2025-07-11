import { Controller, Get, Query, Response, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiProperty, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { Response as Res } from 'express';
import { Action } from '../../domain/actions/action';
import { TypeAction } from '../../domain/actions/typeAction';
import { KYCID } from '../../domain/kyc/KYCID';
import { KycToTags_v2 } from '../../domain/kyc/synchro/kycToTagsV2';
import { DynamicTag_v2Ref } from '../../domain/scoring/system_v2/DynamicTag_v2';
import { ProfileRecommandationUtilisateur } from '../../domain/scoring/system_v2/profileRecommandationUtilisateur';
import { Tag_v2 } from '../../domain/scoring/system_v2/Tag_v2';
import { Thematique } from '../../domain/thematique/thematique';
import { ApplicationError } from '../applicationError';
import { ActionRepository } from '../repository/action.repository';
import { TagRepository } from '../repository/tag.repository';
import { GenericControler } from './genericControler';

export class ProfileRecoActionAPI {
  @ApiProperty({ enum: Thematique }) thematique: Thematique;
  @ApiProperty() titre: string;
  @ApiProperty({ enum: TypeAction }) type: TypeAction;
  @ApiProperty() pourcentage_reco: number;
  @ApiProperty() est_exclue: boolean;
}
export enum PersonaProfile {
  urbain = 'urbain',
  rural = 'rural',
}

export class ProfileRecoAPI {
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
export class RecoProfileController extends GenericControler {
  constructor(private actionRepository: ActionRepository) {
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
        est_exclue: action.explicationScore.doesContainExclusion(),
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

    for (const [tag, explication] of Object.entries(DynamicTag_v2Ref)) {
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
}
