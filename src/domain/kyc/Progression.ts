export class Progression {
  current: number;
  target: number;

  constructor(current?: number, target?: number) {
    this.current = current;
    this.target = target;
  }

  public getPourcent(): number {
    if (!this.current || !this.target || this.target === 0) {
      return 0;
    }
    return Math.round((this.current / this.target) * 100);
  }

  public static getPourcentOfList(liste: Progression[]): number {
    let current = 0;
    let target = 0;
    for (const prog of liste) {
      current += prog.current ? prog.current : 0;
      target += prog.target ? prog.target : 0;
    }
    if (target === 0) {
      return 0;
    }
    return Math.round((current / target) * 100);
  }
}
