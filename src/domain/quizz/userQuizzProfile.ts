import { Thematique } from '../thematique';
import { DifficultyLevel } from '../difficultyLevel';
import { UserQuizzLevel } from './userQuizzLevel';

export class UserQuizzProfile {
  constructor(profile: Record<string, UserQuizzLevel>) {
    this.data = profile;
    for (const cat in Thematique) {
      profile[Thematique[cat]] = profile[Thematique[cat]] || {
        level: DifficultyLevel.L1,
        isCompleted: false,
      };
    }
  }

  private data: Record<Thematique, UserQuizzLevel>;

  setLevel(thematique: Thematique, level: DifficultyLevel) {
    this.data[thematique] = { level, isCompleted: false };
    return level;
  }
  getLevel(thematique: Thematique): DifficultyLevel {
    return this.data[thematique].level;
  }
  isLevelCompleted(thematique: Thematique): boolean {
    return this.data[thematique].isCompleted;
  }
  setIsCompleted(thematique: Thematique, isCompleted: boolean) {
    this.data[thematique].isCompleted = isCompleted;
  }
  increaseLevel(thematique: Thematique) {
    const level = this.getLevel(thematique);
    switch (level) {
      case DifficultyLevel.L1:
        return this.setLevel(thematique, DifficultyLevel.L2);
      case DifficultyLevel.L2:
        return this.setLevel(thematique, DifficultyLevel.L3);
      case DifficultyLevel.L3:
        return this.setLevel(thematique, DifficultyLevel.L4);
      case DifficultyLevel.L4:
        return this.setLevel(thematique, DifficultyLevel.L5);
    }
    return DifficultyLevel.L5;
  }
  getData(): Record<Thematique, UserQuizzLevel> {
    return this.data;
  }
  static newLowProfile(): UserQuizzProfile {
    return new UserQuizzProfile({});
  }
  public toString() {
    return this.data.toString();
  }
}
