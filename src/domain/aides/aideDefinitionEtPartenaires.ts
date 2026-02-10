import { AideDefinition } from './aideDefinition';

export class AideDefinitionEtPartenaires
  extends AideDefinition
  implements AssociatedWithPartenaires
{
  constructor(data: AideDefinition) {
    super(data);
  }
  getPartenaireIds(): string[] {
    return this.partenaires_supp_ids;
  }
}
