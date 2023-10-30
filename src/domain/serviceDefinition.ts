export class ServiceDefinitionData {
  id: string;
  titre: string;
  local: boolean;
  url: string;
  is_url_externe: boolean;
}
export class ServiceDefinition extends ServiceDefinitionData {
  constructor(data: ServiceDefinitionData) {
    super();
    Object.assign(this, data);
  }
}
