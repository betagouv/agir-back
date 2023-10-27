export type ServiceDefinitionConstructorData = {
  id: string;
  titre: string;
  local: boolean;
  url?: string;
  is_url_externe?: boolean;
};
export class ServiceDefinition {
  id: string;
  titre: string;
  url?: string;
  local: boolean;
  is_url_externe?: boolean;

  constructor(data: ServiceDefinitionConstructorData) {
    this.id = data.id;
    this.titre = data.titre;
    this.local = data.local;
    this.url = data.url;
    this.is_url_externe = data.is_url_externe;
  }
}
