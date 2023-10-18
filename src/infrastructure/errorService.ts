import { ApiProperty } from '@nestjs/swagger';

export class ErrorService {
  @ApiProperty()
  code: string;
  @ApiProperty()
  message: string;

  private constructor(code: string, message: string) {
    this.code = code;
    this.message = message;
  }

  static throwInactiveAccountError() {
    throw new ErrorService('001', 'Utilisateur non actif');
  }
  static throwForbiddenError() {
    throw new ErrorService('002', 'Vous ne pouvez pas accéder à ces données');
  }

  static toStringOrObject(error: object): object {
    if (error instanceof ErrorService) {
      return error;
    }
    return { code: '000', message: error['message'] };
  }
}
