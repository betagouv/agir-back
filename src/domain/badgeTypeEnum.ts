export class BadgeTypeEnum {
  constructor(public type: string, public titre: string) {}
  static premier_quizz = new BadgeTypeEnum('1stquizz', '1er quizz réussi !');
}
