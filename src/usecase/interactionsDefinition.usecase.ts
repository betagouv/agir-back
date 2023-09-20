import { BadRequestException, Injectable } from '@nestjs/common';
import { InteractionDefinitionRepository } from '../../src/infrastructure/repository/interactionDefinition.repository';
import { CMSWebhookAPI } from '../../src/infrastructure/api/types/cms/CMSWebhookAPI';
import { InteractionDefinition } from '../../src/domain/interaction/interactionDefinition';
import { v4 as uuidv4 } from 'uuid';
import { InteractionType } from '../../src/domain/interaction/interactionType';
import { InteractionRepository } from '../../src/infrastructure/repository/interaction.repository';
import { Interaction } from '../../src/domain/interaction/interaction';
import { UtilisateurRepository } from '../../src/infrastructure/repository/utilisateur.repository';
import { Thematique } from '../../src/domain/thematique';

@Injectable()
export class InteractionsDefinitionUsecase {
  constructor(
    private interactionDefinitionRepository: InteractionDefinitionRepository,
    private interactionRepository: InteractionRepository,
    private utilisateurRepository: UtilisateurRepository,
  ) {}

  async insertOrUpdateInteractionDefFromCMS(cmsWebhookAPI: CMSWebhookAPI) {
    let interactionDef: InteractionDefinition =
      InteractionsDefinitionUsecase.buildInteractionDefFromCMSData(
        cmsWebhookAPI,
      );
    // TEMP FIX pour tester les body CMS
    interactionDef.raison_lock = cmsWebhookAPI.toString();

    await this.interactionDefinitionRepository.createOrUpdateInteractionDefinitionBasedOnContentId(
      interactionDef,
    );

    const interactionToUpdateOrCreate =
      Interaction.newDefaultInteractionFromDefinition(interactionDef);

    const inter_already_deployed =
      await this.interactionRepository.doesContentIdExists(
        interactionToUpdateOrCreate.content_id,
      );

    if (inter_already_deployed) {
      interactionToUpdateOrCreate.id = undefined;
      await this.interactionRepository.updateInteractionByContentId(
        interactionToUpdateOrCreate,
      );
    } else {
      const utilisateur_ids =
        await this.utilisateurRepository.listUtilisateurIds();

      const interactionListToInsert =
        this.duplicateInteractionForEachUtilisateur(
          interactionToUpdateOrCreate,
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
    result.categorie = Thematique.climat; // FIXME : en dure pour le moment
    result.tags = [];
    result.duree = cmsWebhookAPI.entry.duree;
    result.frequence = cmsWebhookAPI.entry.frequence;
    result.image_url = cmsWebhookAPI.entry.imageUrl
      ? cmsWebhookAPI.entry.imageUrl.url
      : null;
    result.difficulty = cmsWebhookAPI.entry.difficulty;
    result.points = cmsWebhookAPI.entry.points;
    result.codes_postaux = cmsWebhookAPI.entry.codePostal
      ? [cmsWebhookAPI.entry.codePostal]
      : undefined; // FIXME : manque la liste
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
