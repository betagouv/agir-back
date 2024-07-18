export class LinkyDataElement {
  date: Date;
  day_value: number;
  value_cumulee: number;
  jour_text?: string;
  jour_val?: number;
  semaine?: string;
  mois?: string;
  annee?: string;
}

export class YearMonthLinkyData {
  years: Map<number, MonthLinkyData>;
  constructor() {
    this.years = new Map();
  }
}
export class MonthLinkyData {
  months: Map<number, LinkyDataElement[]>;
  constructor() {
    this.months = new Map();
  }
}
export class DayLinkyData {
  days: Map<number, LinkyDataElement>;
  start_date: Date;
  end_date: Date;
  constructor(startDate: Date, endDate: Date) {
    this.start_date = startDate;
    this.end_date = endDate;
    this.days = new Map();
  }
}
export class LinkyData {
  constructor(data?: LinkyData) {
    if (data) {
      this.prm = data.prm;
      this.utilisateurId = data.utilisateurId;
      this.winter_pk = data.winter_pk;
      this.serie = data.serie;
      this.serie.forEach((element) => {
        element.date = new Date(element.date);
      });
      this.created_at = data.created_at;
    } else {
      this.serie = [];
    }
  }
  serie: LinkyDataElement[];
  prm: string;
  utilisateurId?: string;
  winter_pk?: string;
  created_at?: Date;

  public addDataElement?(element: LinkyDataElement) {
    this.serie.push(element);
  }

  public computeDayValueFromCumulee?() {
    if (!this.serie || this.serie.length < 2) {
      return;
    }

    for (let index = 1; index < this.serie.length; index++) {
      const element_day_before = this.serie[index - 1];
      const element = this.serie[index];
      element.day_value =
        element.value_cumulee - element_day_before.value_cumulee;
    }
    this.serie[0].day_value = this.serie[1].day_value;
  }

  public compare14joursEntre2ans?(): {
    data: LinkyDataElement[];
    commentaires: string[];
  } {
    if (this.serie.length === 0) {
      return { data: [], commentaires: [] };
    }
    const last_element = this.getLastDataNotNull();
    const last_element_date = new Date(last_element.date);
    const last_element_date_minus14 = new Date(last_element_date);
    last_element_date_minus14.setDate(last_element_date.getDate() - 13);

    const last_element_date_minus_one_year = new Date(last_element_date);
    last_element_date_minus_one_year.setFullYear(
      last_element_date.getFullYear() - 1,
    );

    const last_element_date_minus14_minus_one_year = new Date(
      last_element_date_minus14,
    );
    last_element_date_minus14_minus_one_year.setFullYear(
      last_element_date.getFullYear() - 1,
    );

    let block = this.searchDays(last_element_date_minus14, last_element_date);

    const block_last_year = this.searchDays(
      last_element_date_minus14_minus_one_year,
      last_element_date_minus_one_year,
    );

    // Re alignement des blocks
    block = block.slice(block.length - block_last_year.length);

    const result: LinkyDataElement[] = [];

    // Entrelassage
    block.forEach((elem, index) => {
      result.push(block_last_year[index]);
      result.push(elem);
    });

    result.forEach((elem) => {
      elem.jour_text = LinkyData.formatJour(elem.date);
      elem.mois = LinkyData.formatMois(elem.date);
      elem.annee = LinkyData.formatAnnee(elem.date);
      elem.jour_val = elem.date.getDate();
    });

    const somme_block = this.sommeElements(block);
    const somme_block_last_year = this.sommeElements(block_last_year);

    const variation = Math.round(
      ((somme_block - somme_block_last_year) / somme_block_last_year) * 100,
    );

    const last_variation = this.getLastVariation();

    return {
      data: result,
      commentaires: [
        `Votre consommation a ${
          last_variation.pourcent > 0
            ? '<strong>augmenté de +'
            : '<strong>diminué de '
        }${last_variation.pourcent}%</strong> entre ${
          last_variation.previous_day
        } et ${last_variation.day} dernier`,
        `Au cours des 2 dernières semaines, votre consommation éléctrique a <strong>${
          variation > 0 ? 'augmenté de +' : 'diminué de '
        }${variation}%</strong> par rapport à la même période l'année dernière`,
      ],
    };
  }

  public compare2AnsParMois?(): {
    data: LinkyDataElement[];
    commentaires: string[];
  } {
    if (this.serie.length < 2) {
      return { data: [], commentaires: [] };
    }

    const result = [];

    const last_value = this.getLastDataNotNull();

    const extract = this.extractLastNMonths(24, last_value.date);

    let total_last_year = 0;
    let total_this_year = 0;
    let mois_frugal: string;
    let annee_frugal: number;
    let mois_frugal_val = 0;
    let mois_frugal_val_percent = 0;
    let mois_max: string;
    let annee_max: number;
    let mois_max_val = 0;
    let mois_max_val_percent = 0;

    for (let index = 0; index < 12; index++) {
      const mois = extract[index];
      total_last_year += mois.day_value;

      const mois_annee_suivante = extract[index + 12];
      total_this_year += mois_annee_suivante.day_value;

      if (
        mois_annee_suivante.day_value - mois.day_value < mois_frugal_val &&
        index < 11
      ) {
        mois_frugal_val = mois_annee_suivante.day_value - mois.day_value;
        mois_frugal = LinkyData.formatMois(mois.date);
        annee_frugal = mois_annee_suivante.date.getFullYear();
        mois_frugal_val_percent = Math.round(
          (Math.abs(mois_frugal_val) /
            Math.max(mois_annee_suivante.day_value, mois.day_value)) *
            100,
        );
      }
      if (
        mois_annee_suivante.day_value - mois.day_value > mois_max_val &&
        index < 11
      ) {
        mois_max_val = mois_annee_suivante.day_value - mois.day_value;
        mois_max = LinkyData.formatMois(mois.date);
        annee_max = mois_annee_suivante.date.getFullYear();
        mois_max_val_percent = Math.round(
          (Math.abs(mois_max_val) /
            Math.min(mois_annee_suivante.day_value, mois.day_value)) *
            100,
        );
      }
      result.push(mois);
      result.push(mois_annee_suivante);
    }

    const variation = Math.round(
      ((total_this_year - total_last_year) / total_last_year) * 100,
    );

    return {
      data: result,
      commentaires: [
        `Au cours des 12 derniers mois, votre consommation éléctrique a <strong>${
          variation > 0 ? 'augmenté de +' : 'diminué de -'
        }${Math.abs(variation)}%</strong> par rapport aux 12 mois précédents`,
        `C'est au mois de <strong>${mois_frugal} ${annee_frugal}</strong> que vous avez fait le <strong>plus d'économie d’électricité</strong> (<strong>-${mois_frugal_val_percent}%</strong> par rapport à ${mois_frugal} ${
          annee_frugal - 1
        })`,
        `C'est au mois de <strong>${mois_max} ${annee_max}</strong> que votre consommation d’électricité a le plus augmenté (<strong>+${mois_max_val_percent}%</strong> par rapport à ${mois_max} ${
          annee_max - 1
        })</strong>`,
      ],
    };
  }

  public getLastRoundedValue?(): number {
    if (this.serie.length === 0) return null;
    return (
      Math.round(this.serie[this.serie.length - 1].day_value * 1000) / 1000
    );
  }

  public getLastVariation?(): {
    pourcent: number;
    day: string;
    previous_day: string;
  } {
    if (this.serie.length < 2) return null;

    const last_day = this.serie[this.serie.length - 1];
    const previous_day = this.serie[this.serie.length - 2];
    const valN_2 = previous_day.day_value;
    const valN_1 = last_day.day_value;
    return {
      pourcent: Math.floor(((valN_1 - valN_2) / valN_2) * 10000) / 100,
      day: LinkyData.formatJour(last_day.date),
      previous_day: LinkyData.formatJour(previous_day.date),
    };
  }

  public extractLastNDays?(nombre: number): LinkyDataElement[] {
    let result = this.serie.slice(-nombre);
    result = result.map((elem) => {
      const new_data: LinkyDataElement = {
        date: elem.date,
        day_value: elem.day_value,
        jour_text: LinkyData.formatJour(elem.date),
        value_cumulee: elem.value_cumulee,
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
      for (let index = index_sem; index < index_sem + 7; index++) {
        const element = extract[index];
        cumul += element.day_value;
      }
      result.push({
        date: this.serie[index_sem].date,
        day_value: cumul,
        value_cumulee: null,
      });
    }
    return result;
  }
  public extractLastNMonths?(nombre: number, date: Date): LinkyDataElement[] {
    const result = [];

    const years_months = LinkyData.listMonthsFromDate(nombre, date);

    this.fillRequiredYearMonthsData(years_months);

    this.cumulateMonthData(years_months);

    years_months.years.forEach((year) => {
      year.months.forEach((month) => {
        result.push(month[0]);
      });
    });
    result.reverse();

    return result;
  }

  public cleanData?() {
    this.unduplicateDataSerie();
    this.orderDataSerie();
  }

  static listMonthsFromDate?(
    nombre: number,
    start_date: Date,
  ): YearMonthLinkyData {
    const result = new YearMonthLinkyData();
    let current_date = new Date(start_date);

    for (let index = 0; index < nombre; index++) {
      const current_year = current_date.getFullYear();
      if (!result.years.has(current_year)) {
        result.years.set(current_year, new MonthLinkyData());
      }
      const current_month = current_date.getMonth();
      result.years.get(current_year).months.set(current_month, []);
      current_date.setDate(0);
    }
    return result;
  }

  sommeElements?(list: LinkyDataElement[]): number {
    let result = 0;
    list.forEach((elem) => {
      result += elem.day_value;
    });
    return result;
  }

  cumulateMonthData?(year_month_data: YearMonthLinkyData) {
    year_month_data.years.forEach((year, key_year) => {
      year.months.forEach((month, key_month) => {
        let cumul = 0;
        month.forEach((element) => {
          cumul += element.day_value;
        });
        const date_to_set = new Date(key_year, key_month);
        year.months.set(key_month, [
          {
            date: date_to_set,
            day_value: cumul,
            mois: LinkyData.formatMois(date_to_set),
            annee: LinkyData.formatAnnee(date_to_set),
            value_cumulee: null,
          },
        ]);
      });
    });
  }

  fillRequiredYearMonthsData?(year_month_data: YearMonthLinkyData) {
    this.serie.forEach((element) => {
      const current_year = element.date.getFullYear();
      const current_month = element.date.getMonth();
      if (year_month_data.years.get(current_year)) {
        const month_entry = year_month_data.years
          .get(current_year)
          .months.get(current_month);
        if (month_entry) {
          month_entry.push(element);
        }
      }
    });
  }

  searchDays?(startDate: Date, endDate: Date): LinkyDataElement[] {
    const dayLinkyData = new DayLinkyData(startDate, endDate);
    this.serie.forEach((element) => {
      if (LinkyData.isBetween(element.date, startDate, endDate)) {
        dayLinkyData.days.set(element.date.getTime(), element);
      }
    });
    return Array.from(dayLinkyData.days.values());
  }

  searchSingleDay?(day: Date): LinkyDataElement {
    for (let index = 0; index < this.serie.length; index++) {
      const element = this.serie[index];
      if (LinkyData.isBetween(element.date, day, day)) {
        return element;
      }
    }
    return null;
  }

  static isBetween(day: Date, startDate: Date, endDate: Date): boolean {
    const start_time = new Date(startDate).setHours(0, 0, 0, 0);
    const end_time = new Date(endDate).setHours(23, 59, 59, 999);
    const dayTime = day.getTime();
    return start_time <= dayTime && dayTime <= end_time;
  }
  static isLessThan(day: Date, pivotDay: Date): boolean {
    const pivot_time = new Date(pivotDay).setHours(0, 0, 0, 0);
    const dayTime = day.getTime();
    return dayTime < pivot_time;
  }
  static getPreviousWeekFirstDay(now: Date): Date {
    const day_in_week = now.getDay() === 0 ? 6 : now.getDay() - 1;
    const day = now.getDate() - day_in_week - 7;
    const result = new Date(now.getTime());
    result.setDate(day);
    return result;
  }
  static getPreviousWeekLastDay(now: Date): Date {
    const monday = LinkyData.getPreviousWeekFirstDay(now);
    const result = new Date(now.getTime());
    result.setDate(monday.getDate() + 6);
    return result;
  }
  private orderDataSerie?() {
    this.serie.sort((a, b) => a.date.getTime() - b.date.getTime());
  }
  private unduplicateDataSerie?() {
    const time_map: Map<string, LinkyDataElement> = new Map();

    this.serie.forEach((element) => {
      time_map.set(element.date.toISOString(), element);
    });

    this.serie = Array.from(time_map.values());
  }

  // Returns the ISO week of the date.
  static getWeek?(input: Date) {
    let date = new Date(input.getTime());
    date.setHours(0, 0, 0, 0);
    // Thursday in current week decides the year.
    date.setDate(date.getDate() + 3 - ((date.getDay() + 6) % 7));
    // January 4 is always in week 1.
    let week1 = new Date(date.getFullYear(), 0, 4);
    // Adjust to Thursday in week 1 and count number of weeks from date to week1.
    return (
      1 +
      Math.round(
        ((date.getTime() - week1.getTime()) / 86400000 -
          3 +
          ((week1.getDay() + 6) % 7)) /
          7,
      )
    );
  }

  private getLastDataNotNull?(): LinkyDataElement | null {
    for (let index = this.serie.length - 1; index >= 0; index--) {
      const element = this.serie[index];
      if (element.day_value !== null) {
        return element;
      }
    }
    return null;
  }
  private static formatJour?(date: Date): string {
    return new Intl.DateTimeFormat('fr-FR', { weekday: 'long' }).format(date);
  }
  private static formatMois?(date: Date): string {
    return new Intl.DateTimeFormat('fr-FR', { month: 'long' }).format(date);
  }
  private static formatAnnee?(date: Date): string {
    return new Intl.DateTimeFormat('fr-FR', { year: 'numeric' }).format(date);
  }

  // Returns the four-digit year corresponding to the ISO week of the date.
  static getWeekYear?(input: Date) {
    let date = new Date(input.getTime());
    date.setDate(date.getDate() + 3 - ((date.getDay() + 6) % 7));
    return date.getFullYear();
  }
}
