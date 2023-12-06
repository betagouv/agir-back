export class LinkyDataElement {
  time: Date;
  value: number;
  value_at_normal_temperature: number;
}

export class LinkyData {
  constructor(data?: LinkyData) {
    if (data) {
      this.prm = data.prm;
      this.pk_winter = data.pk_winter;
      this.serie = data.serie;
      this.serie.forEach((element) => {
        element.time = new Date(element.time);
      });
    } else {
      this.serie = [];
    }
  }
  serie: LinkyDataElement[];
  prm: string;
  pk_winter: string;

  public addDataElement?(element: LinkyDataElement) {
    this.serie.push(element);
  }
}
