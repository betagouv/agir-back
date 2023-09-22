import { max } from 'rxjs';
import { Interaction } from './interaction';
import { InteractionDistribution } from './interactionDistribution';
import { InteractionPlacement } from './interactionPosition';
import { InteractionType } from './interactionType';

export class DistributionSettings {
  static readonly TARGET_LOCKED_INTERACTION_NUMBER = 3;
  static readonly TARGET_LOCKED_INTERACTIONS_POSITIONS = [2, 5, 8]; // 1st position = 0

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
  ) {
    //let result = [...targetList];
    sourceList.forEach((interaction) => {
      const interaction_distrib = this.getByType(interaction.type);
      if (interaction_distrib) {
        if (
          this.numberOfInteractionsOfType(interaction.type, targetList) <
          interaction_distrib.prefered
        ) {
          targetList.push(interaction);
        }
      } else {
        targetList.push(interaction);
      }
    });
  }

  static numberOfInteractionsOfType(
    type: InteractionType,
    list: Interaction[],
  ) {
    return list.filter((x) => x.type === type).length;
  }

  static insertPinnedInteractions(
    pinned_list: Interaction[],
    work_list: Interaction[],
  ) {
    pinned_list.sort((a, b) => a.pinned_at_position - b.pinned_at_position);
    pinned_list.forEach((pinned_interaction) => {
      this.insertInteractionAtPosition(
        work_list,
        pinned_interaction,
        pinned_interaction.pinned_at_position,
      );
    });
  }

  static insertInteractionAtPosition(
    work_list: Interaction[],
    interaction: Interaction,
    position: number,
  ) {
    if (work_list.length < position + 1) {
      work_list.push(interaction);
    } else {
      work_list.splice(position, 0, interaction);
    }
  }

  static insertLockedInteractions(
    locked_list: Interaction[],
    work_list: Interaction[],
  ): Interaction[] {
    let result = this.repositionLockedItemsToTargetPositions(work_list);

    const current_locked_number = this.countLockedInteractions(result);
    const locked_to_insert_number = Math.max(
      0,
      this.TARGET_LOCKED_INTERACTION_NUMBER - current_locked_number,
    );
    const available_locked = Math.min(
      locked_to_insert_number,
      locked_list.length,
    );
    for (let index = 0; index < available_locked; index++) {
      if (!this.containsId(result, locked_list[index]))
        this.insertInteractionAtPosition(
          result,
          locked_list[index],
          this.TARGET_LOCKED_INTERACTIONS_POSITIONS[
            index + current_locked_number
          ],
        );
    }
    return result;
  }

  static containsId(list: Interaction[], interaction: Interaction) {
    return list.find((element) => {
      return element.id === interaction.id;
    });
  }

  static repositionLockedItemsToTargetPositions(
    work_list: Interaction[],
  ): Interaction[] {
    let result = [...work_list];

    const locked_interactions_positions =
      this.positionsOfLockedInteracion(work_list);

    const number_of_interactions_to_move = Math.min(
      locked_interactions_positions.length,
      this.TARGET_LOCKED_INTERACTIONS_POSITIONS.length,
    );

    for (let index = number_of_interactions_to_move - 1; index >= 0; index--) {
      this.moveInteraction(
        result,
        locked_interactions_positions[index],
        this.TARGET_LOCKED_INTERACTIONS_POSITIONS[index],
      );
    }
    return result;
  }
  static countLockedInteractions(list: Interaction[]) {
    return list.reduce((accumulator, currentValue) => {
      return accumulator + (currentValue.locked ? 1 : 0);
    }, 0);
  }
  static positionsOfLockedInteracion(list: Interaction[]) {
    let index = 0;
    return list.reduce((accumulator, currentValue) => {
      if (currentValue.locked) {
        accumulator.push(index);
      }
      index++;
      return accumulator;
    }, []);
  }

  static moveInteraction(
    list: Interaction[],
    startPosition: number,
    targetPosition: number,
  ) {
    const element = list[startPosition];
    list.splice(startPosition, 1);
    list.splice(targetPosition, 0, element);
  }
}
