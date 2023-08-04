import { Interaction } from './interaction';
import { InteractionDistribution } from './interactionDistribution';
import { InteractionPlacement } from './interactionPosition';
import { InteractionType } from './interactionType';

export class DistributionSettings {
  static settings = new Map<InteractionType, InteractionDistribution>([
    [
      InteractionType.aide,
      new InteractionDistribution(2, InteractionPlacement.any),
    ],
    [
      InteractionType.quizz,
      new InteractionDistribution(2, InteractionPlacement.any),
    ],
    [
      InteractionType.article,
      new InteractionDistribution(2, InteractionPlacement.any),
    ],
    [
      InteractionType.suivi_du_jour,
      new InteractionDistribution(1, InteractionPlacement.any),
    ],
  ]);

  static default = DistributionSettings.settings;

  static overrideSettings(
    override?: Map<InteractionType, InteractionDistribution>,
  ) {
    this.settings = override;
  }
  static resetSettings() {
    this.settings = this.default;
  }
  static getByType(type: InteractionType) {
    return this.settings.get(type);
  }
  static getPreferedOfType(type: InteractionType) {
    let distrib = this.getByType(type);
    return distrib ? distrib.prefered : undefined;
  }

  static addInteractionsToList(
    sourceList: Interaction[],
    targetList: Interaction[],
  ): Interaction[] {
    let result = [...targetList];
    sourceList.forEach((interaction) => {
      const interaction_distrib = this.getByType(interaction.type);
      if (interaction_distrib) {
        if (
          this.numberOfInteractionsOfType(interaction.type, result) <
          interaction_distrib.prefered
        ) {
          result.push(interaction);
        }
      } else {
        result.push(interaction);
      }
    });
    return result;
  }

  static numberOfInteractionsOfType(
    type: InteractionType,
    list: Interaction[],
  ) {
    return list.filter((x) => x.type === type).length;
  }
}
