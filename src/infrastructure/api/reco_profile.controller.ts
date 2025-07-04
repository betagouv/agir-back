import { Controller, Get, Query, Response, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiProperty, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { Response as Res } from 'express';
import { Action } from '../../domain/actions/action';
import { TypeAction } from '../../domain/actions/typeAction';
import { ProfileRecommandationUtilisateur } from '../../domain/scoring/system_v2/profileRecommandationUtilisateur';
import { Tag_v2 } from '../../domain/scoring/system_v2/Tag_v2';
import { Thematique } from '../../domain/thematique/thematique';
import { ApplicationError } from '../applicationError';
import { ActionRepository } from '../repository/action.repository';
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

const TAGGING_PERSONA: Record<PersonaProfile, Tag_v2[]> = {
  rural: [Tag_v2.habite_zone_rurale],
  urbain: [Tag_v2.habite_zone_urbaine],
};

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
@ApiTags('Z - Admin')
@Controller()
export class RecoProfileController extends GenericControler {
  constructor(private actionRepository: ActionRepository) {
    super();
  }

  @Get('action_recommandee')
  @ApiQuery({
    name: 'tag',
    enum: Tag_v2,
    required: false,
    isArray: true,
    description: `liste des tags de l'utilisateur, si spécifié, prend la place des personas`,
  })
  @ApiQuery({
    name: 'persona',
    enum: PersonaProfile,
    required: false,
    description: `persona regroupant plusieurs tags`,
  })
  @ApiOkResponse({ type: ProfileRecoAPI })
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 3, ttl: 1000 } })
  async code_postal_synthese(
    @Query('tag') tag: string | string[],
    @Query('persona') persona: string,
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

    if (tag_liste.length === 0) {
      if (persona) {
        if (PersonaProfile[persona]) {
          final_tag_liste = TAGGING_PERSONA[PersonaProfile[persona]];
        } else {
          ApplicationError.throwPersonaInconnu(persona);
        }
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
}
