import { Categorie } from '../categorie';

export class QuizzProfile {
  constructor(profile: any) {
    if (profile instanceof Map) {
      this.data = profile;
    } else {
      this.data = new Map();
      for (const cat in Categorie) {
        if (profile[cat]) {
          this.data.set(cat as Categorie, profile[cat]);
        }
      }
    }
  }
  private data: Map<Categorie, number>;
  setLevel(categorie: Categorie, level: number) {
    this.data.set(categorie, level);
  }
  getLevel(categorie: Categorie) {
    return this.data.get(categorie);
  }
  convertToKeyedObject(): object {
    return Object.fromEntries(this.data.entries());
  }
  static newLowProfile(): QuizzProfile {
    let map = new Map();
    for (const cat in Categorie) {
      map.set(cat, 1);
    }
    return new QuizzProfile(map);
  }
}
