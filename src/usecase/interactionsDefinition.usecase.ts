import { BadRequestException, Injectable } from '@nestjs/common';
import { InteractionDefinitionRepository } from '../../src/infrastructure/repository/interactionDefinition.repository';
import { CMSWebhookAPI } from '../../src/infrastructure/api/types/cms/CMSWebhookAPI';
import { InteractionDefinition } from '../../src/domain/interaction/interactionDefinition';
import { v4 as uuidv4 } from 'uuid';
import { InteractionType } from '../../src/domain/interaction/interactionType';
import { InteractionRepository } from '../../src/infrastructure/repository/interaction.repository';
import { Interaction } from '../../src/domain/interaction/interaction';
import { UtilisateurRepository } from '../infrastructure/repository/utilisateur/utilisateur.repository';
import { Thematique } from '../../src/domain/thematique';
import { CMSThematiqueAPI } from '../../src/infrastructure/api/types/cms/CMSThematiqueAPI';
import { CMSEvent } from '../../src/infrastructure/api/types/cms/CMSEvent';
import { CMSModel } from '../../src/infrastructure/api/types/cms/CMSModels';

@Injectable()
export class InteractionsDefinitionUsecase {
  constructor(
    private interactionDefinitionRepository: InteractionDefinitionRepository,
    private interactionRepository: InteractionRepository,
    private utilisateurRepository: UtilisateurRepository,
  ) {}

  async insertOrUpdateInteractionDefFromCMS(cmsWebhookAPI: CMSWebhookAPI) {
    if (cmsWebhookAPI.model === CMSModel.aide) return;

    switch (cmsWebhookAPI.event) {
      case CMSEvent['entry.unpublish']:
        return this.deleteContent(cmsWebhookAPI);
      case CMSEvent['entry.delete']:
        return this.deleteContent(cmsWebhookAPI);
      case CMSEvent['entry.publish']:
        return this.createOrUpdateContent(cmsWebhookAPI);
      case CMSEvent['entry.update']:
        return this.createOrUpdateContent(cmsWebhookAPI);
      default:
        break;
    }
  }

  async deleteContent(cmsWebhookAPI: CMSWebhookAPI) {
    await this.interactionDefinitionRepository.deleteByContentId(
      cmsWebhookAPI.entry.id.toString(),
    );

    await this.interactionRepository.deleteByContentIdWhenNotDone(
      cmsWebhookAPI.entry.id.toString(),
    );
  }

  async createOrUpdateContent(cmsWebhookAPI: CMSWebhookAPI) {
    if (cmsWebhookAPI.entry.publishedAt === null) return;

    let interactionDef =
      InteractionsDefinitionUsecase.buildInteractionDefFromCMSData(
        cmsWebhookAPI,
      );

    await this.interactionDefinitionRepository.createOrUpdateBasedOnContentIdAndType(
      interactionDef,
    );

    const inter_already_deployed =
      await this.interactionRepository.doesContentIdExists(
        interactionDef.content_id,
      );

    if (inter_already_deployed) {
      await this.interactionRepository.updateInteractionFromDefinitionByContentId(
        interactionDef,
      );
    } else {
      const interactionToCreate =
        Interaction.newDefaultInteractionFromDefinition(interactionDef);
      const utilisateur_ids =
        await this.utilisateurRepository.listUtilisateurIds();

      const interactionListToInsert =
        this.duplicateInteractionForEachUtilisateur(
          interactionToCreate,
          utilisateur_ids,
        );

      await this.interactionRepository.insertInteractionList(
        interactionListToInsert,
      );
    }
  }

  static buildInteractionDefFromCMSData(
    cmsWebhookAPI: CMSWebhookAPI,
  ): InteractionDefinition {
    let result = new InteractionDefinition({});
    result.id = uuidv4();
    result.content_id = cmsWebhookAPI.entry.id.toString();
    result.titre = cmsWebhookAPI.entry.titre;
    result.soustitre = cmsWebhookAPI.entry.sousTitre;

    result.thematique_gamification = cmsWebhookAPI.entry.thematique_gamification
      ? CMSThematiqueAPI.getThematique(
          cmsWebhookAPI.entry.thematique_gamification,
        )
      : Thematique.climat;

    result.thematique_gamification_titre = cmsWebhookAPI.entry
      .thematique_gamification
      ? cmsWebhookAPI.entry.thematique_gamification.titre
      : '🌍 Climat';

    result.thematiques = cmsWebhookAPI.entry.thematiques
      ? CMSThematiqueAPI.getThematiqueList(cmsWebhookAPI.entry.thematiques)
      : [];

    result.tags = [];
    result.duree = cmsWebhookAPI.entry.duree;
    result.frequence = cmsWebhookAPI.entry.frequence;
    result.image_url = cmsWebhookAPI.entry.imageUrl
      ? cmsWebhookAPI.entry.imageUrl.formats.thumbnail.url
      : null;
    result.difficulty = cmsWebhookAPI.entry.difficulty
      ? cmsWebhookAPI.entry.difficulty
      : 1;
    result.points = cmsWebhookAPI.entry.points || 0;
    result.codes_postaux = cmsWebhookAPI.entry.codes_postaux
      ? cmsWebhookAPI.entry.codes_postaux.split(',')
      : undefined;
    result.type = InteractionType[cmsWebhookAPI.model];
    if (result.type === undefined) {
      throw new BadRequestException(
        `Model de contenu CMS [${cmsWebhookAPI.model}] manquant ou inconnu`,
      );
    }
    return result;
  }

  private duplicateInteractionForEachUtilisateur(
    interaction: Interaction,
    user_ids: Record<'id', string>[],
  ): Interaction[] {
    const result = [];
    user_ids.forEach((id_object) => {
      const newInter = new Interaction(interaction);
      newInter.utilisateurId = id_object.id;
      newInter.id = uuidv4();
      result.push(newInter);
    });
    return result;
  }
}
