export class ServiceDefinitionData {
  id: string;
  titre: string;
  local: boolean;
  url?: string;
  is_url_externe?: boolean;
}
export class ServiceDefinition extends ServiceDefinitionData {
  constructor(data: ServiceDefinitionData) {
    super();
    this.id = data.id;
    this.titre = data.titre;
    this.local = data.local;
    this.url = data.url;
    this.is_url_externe = data.is_url_externe;
  }
}
