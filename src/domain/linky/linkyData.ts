export class LinkyDataElement {
  time: Date;
  value: number;
  value_at_normal_temperature: number;
}

export class LinkyData {
  constructor(data?: LinkyData) {
    if (data) {
      this.serie = data.serie;
      this.serie.forEach((element) => {
        element.time = new Date(element.time);
      });
    } else {
      this.serie = [];
    }
  }
  serie: LinkyDataElement[];

  public addDataElement?(element: LinkyDataElement) {
    this.serie.push(element);
  }
}
