export class Suivi {
  constructor(type: string, date?: Date) {
    this.type = type;
    this.date = date ? date : new Date();
  }
  static alimentation = 'alimentation';
  static transport = 'transport';

  private type: string;
  private date: Date;
  getAttributs(): string[] {
    return Object.keys(this.cloneAndClean());
  }
  getValeursAsStrings(): string[] {
    return Object.values(this.cloneAndClean()).map((x) => x.toString());
  }
  getType(): string {
    return this.type;
  }
  getDate(): Date {
    return this.date;
  }
  populateValues(keys: string[], values: String[]) {
    for (let i = 0; i < keys.length; i++) {
      switch (values[i]) {
        case 'true':
          this[keys[i]] = true;
          break;
        case 'false':
          this[keys[i]] = false;
          break;
        default:
          this[keys[i]] = Number(values[i]);
      }
    }
  }
  injectValuesFromObject(input: object) {
    let cleanInput = this.cloneAndClean(input);
    let keys = Object.keys(cleanInput);
    let values = Object.values(cleanInput);
    for (let i = 0; i < keys.length; i++) {
      this[keys[i]] = values[i];
    }
  }
  calculImpacts() {
    throw new Error('calculImpacts() should be implemented in subclass');
  }
  private cloneAndClean(input?: object): object {
    let thisToClean = { ...(input ? input : this) };
    delete thisToClean['alimentation'];
    delete thisToClean['transport'];
    delete thisToClean['type'];
    delete thisToClean['date'];
    return thisToClean;
  }
}
