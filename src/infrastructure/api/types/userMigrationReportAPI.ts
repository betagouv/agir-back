import { ApiProperty } from '@nestjs/swagger';
import { UserMigrationReport } from 'src/usecase/migration.usescase';

export class MigrationAPI {
  @ApiProperty() version: number;
  @ApiProperty() ok: boolean;
  @ApiProperty() info: string;
}

export class UserMigrationReportAPI {
  @ApiProperty() user_id: string;
  @ApiProperty({ type: [MigrationAPI] }) migrations: MigrationAPI[];

  public static mapToAPI(report: UserMigrationReport): UserMigrationReportAPI {
    return {
      user_id: report.user_id,
      migrations: report.migrations,
    };
  }
}
