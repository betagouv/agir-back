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

  setLevel(categorie: Thematique, level: DifficultyLevel) {
    this.data[categorie] = { level, isCompleted: false };
    return level;
  }
  getLevel(categorie: Thematique): DifficultyLevel {
    return this.data[categorie].level;
  }
  isLevelCompleted(categorie: Thematique): boolean {
    return this.data[categorie].isCompleted;
  }
  setIsCompleted(categorie: Thematique, isCompleted: boolean) {
    this.data[categorie].isCompleted = isCompleted;
  }
  increaseLevel(categorie: Thematique) {
    const level = this.getLevel(categorie);
    switch (level) {
      case DifficultyLevel.L1:
        return this.setLevel(categorie, DifficultyLevel.L2);
      case DifficultyLevel.L2:
        return this.setLevel(categorie, DifficultyLevel.L3);
      case DifficultyLevel.L3:
        return this.setLevel(categorie, DifficultyLevel.L4);
      case DifficultyLevel.L4:
        return this.setLevel(categorie, DifficultyLevel.L5);
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
