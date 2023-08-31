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
  }
  getLevel(categorie: Categorie): DifficultyLevel {
    return this.data[categorie].level;
  }
  isLevelCompleted(categorie: Categorie): boolean {
    return this.data[categorie].isCompleted;
  }
  setLevelCompletion(categorie: Categorie, isCompleted: boolean) {
    this.data[categorie].isCompleted = isCompleted;
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
