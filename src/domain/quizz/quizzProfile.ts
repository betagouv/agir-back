import { Categorie } from '../categorie';

export class QuizzProfile {
  constructor(profile: any) {
    this.data = new Map();
    for (const cat in Categorie) {
      this.data.set(cat as Categorie, profile[cat]);
    }
  }
  private data: Map<Categorie, number>;
  setLevel(categorie: Categorie, level: number) {
    this.data.set(categorie, level);
  }
  getLevel(categorie: Categorie) {
    return this.data.get(categorie);
  }
}
