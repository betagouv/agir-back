export class LinkyDataElement {
  time: Date;
  value: number;
  value_at_normal_temperature: number;
  jour?: string;
  semaine?: string;
  mois?: string;
  annee?: string;
}

export class LinkyData {
  constructor(data?: LinkyData) {
    if (data) {
      this.prm = data.prm;
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

  public addDataElement?(element: LinkyDataElement) {
    this.serie.push(element);
  }

  public extractLastNDays?(nombre: number): LinkyDataElement[] {
    let result = this.serie.slice(-nombre);
    result = result.map((elem) => {
      const new_data: LinkyDataElement = {
        time: elem.time,
        value: elem.value,
        value_at_normal_temperature: elem.value_at_normal_temperature,
        jour: new Intl.DateTimeFormat('fr-FR', { weekday: 'long' }).format(
          elem.time,
        ),
      };
      return new_data;
    });
    return result;
  }
  public extractLastNWeeks?(nombre: number): LinkyDataElement[] {
    let result: LinkyDataElement[] = [];
    let extract = this.serie.slice(-nombre * 7);
    for (
      let index_sem = 0;
      index_sem < extract.length;
      index_sem = index_sem + 7
    ) {
      let cumul = 0;
      let cumul_corrigee = 0;
      for (let index = index_sem; index < index_sem + 7; index++) {
        const element = extract[index];
        cumul += element.value;
        cumul_corrigee += element.value_at_normal_temperature;
      }
      result.push({
        time: this.serie[index_sem].time,
        value: cumul / 7,
        value_at_normal_temperature: cumul_corrigee / 7,
      });
    }
    return result;
  }
}
