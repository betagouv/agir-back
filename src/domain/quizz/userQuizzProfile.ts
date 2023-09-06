import { Categorie } from '../categorie';
import { DifficultyLevel } from '../difficultyLevel';
import { UserQuizzLevel } from './userQuizzLevel';

export class UserQuizzProfile {
  constructor(profile: Record<string, UserQuizzLevel>) {
    this.data = profile;
    for (const cat in Categorie) {
      profile[Categorie[cat]] = profile[Categorie[cat]] || {
        level: DifficultyLevel.L1,
        isCompleted: false,
      };
    }
  }

  private data: Record<Categorie, UserQuizzLevel>;

  setLevel(categorie: Categorie, level: DifficultyLevel) {
    this.data[categorie] = { level, isCompleted: false };
    return level;
  }
  getLevel(categorie: Categorie): DifficultyLevel {
    return this.data[categorie].level;
  }
  isLevelCompleted(categorie: Categorie): boolean {
    return this.data[categorie].isCompleted;
  }
  setIsCompleted(categorie: Categorie, isCompleted: boolean) {
    this.data[categorie].isCompleted = isCompleted;
  }
  increaseLevel(categorie: Categorie) {
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
  getData(): Record<Categorie, UserQuizzLevel> {
    return this.data;
  }
  static newLowProfile(): UserQuizzProfile {
    return new UserQuizzProfile({});
  }
  public toString() {
    return this.data.toString();
  }
}
