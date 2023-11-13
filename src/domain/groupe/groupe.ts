export class GroupeData {
  id?: string;
  name: string;
  description: string;
}
export class Groupe extends GroupeData {
  constructor(data: GroupeData) {
    super();
    Object.assign(this, data);
  }
}
