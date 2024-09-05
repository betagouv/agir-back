import { ApiProperty } from '@nestjs/swagger';
import { TransportQuotidien } from '../../../../domain/transport/transport';
import {
  TypeLogement,
  Superficie,
  Chauffage,
  DPE,
  Logement,
} from '../../../../domain/logement/logement';
import { Utilisateur } from '../../../../../src/domain/utilisateur/utilisateur';
import { Transport } from '../../../../domain/transport/transport';

export class OnboardingResultAPI {
  @ApiProperty({ required: false })
  alimentation: number;
  @ApiProperty({ required: false })
  transports: number;
  @ApiProperty({ required: false })
  logement: number;
  @ApiProperty({ required: false })
  consommation: number;
}

export class LogementAPI {
  @ApiProperty({ required: false })
  nombre_adultes: number;
  @ApiProperty({ required: false })
  nombre_enfants: number;
  @ApiProperty({ required: false })
  code_postal: string;
  @ApiProperty({ required: false })
  commune: string;
  @ApiProperty({ required: false })
  commune_label: string;
  @ApiProperty({ enum: TypeLogement })
  type: TypeLogement;
  @ApiProperty({ enum: Superficie })
  superficie: Superficie;
  @ApiProperty({ required: false })
  proprietaire: boolean;
  @ApiProperty({ enum: Chauffage })
  chauffage: Chauffage;
  @ApiProperty({ required: false })
  plus_de_15_ans: boolean;
  @ApiProperty({ enum: DPE })
  dpe: DPE;

  public static mapToAPI(log: Logement): LogementAPI {
    return {
      nombre_adultes: log.nombre_adultes,
      nombre_enfants: log.nombre_enfants,
      code_postal: log.code_postal,
      commune: log.commune,
      type: log.type,
      superficie: log.superficie,
      proprietaire: log.proprietaire,
      chauffage: log.chauffage,
      plus_de_15_ans: log.plus_de_15_ans,
      dpe: log.dpe,
      commune_label: log.commune_label,
    };
  }
}

export class TransportAPI {
  @ApiProperty({ required: false })
  avions_par_an: number;
  @ApiProperty({
    required: false,
    enum: TransportQuotidien,
    enumName: 'TransportQuotidien',
    isArray: true,
  })
  transports_quotidiens: TransportQuotidien[];

  public static mapToAPI(data: Transport): TransportAPI {
    return {
      avions_par_an: data.avions_par_an,
      transports_quotidiens: data.transports_quotidiens,
    };
  }
}

export class UtilisateurUpdateProfileAPI {
  @ApiProperty({ required: true })
  nom: string;
  @ApiProperty({ required: true })
  prenom: string;
  @ApiProperty({ required: false })
  annee_naissance: number;
  @ApiProperty({ required: false })
  revenu_fiscal?: number;
  @ApiProperty({ required: true })
  mot_de_passe?: string;
  @ApiProperty({ required: false })
  nombre_de_parts_fiscales: number;
  @ApiProperty({ required: false })
  abonnement_ter_loire: boolean;
}

export class UtilisateurProfileAPI {
  @ApiProperty({ required: true })
  nom: string;
  @ApiProperty({ required: true })
  prenom: string;
  @ApiProperty({ required: false })
  annee_naissance: number;
  @ApiProperty({ required: true })
  email: string;
  @ApiProperty({ required: false })
  code_postal?: string;
  @ApiProperty({ required: false })
  commune?: string;
  @ApiProperty({ required: false })
  revenu_fiscal?: number;
  @ApiProperty({ required: true })
  mot_de_passe?: string;
  @ApiProperty({ required: false })
  nombre_de_parts_fiscales: number;
  @ApiProperty({ required: false })
  abonnement_ter_loire: boolean;

  /**
  @ApiProperty({ type: OnboardingResultAPI })
  onboarding_result: OnboardingResultAPI;
 */
  @ApiProperty({ type: LogementAPI })
  logement: LogementAPI;

  public static mapToAPI(user: Utilisateur): UtilisateurProfileAPI {
    return {
      email: user.email,
      nom: user.nom,
      prenom: user.prenom,
      code_postal: user.logement.code_postal,
      commune: user.logement.commune,
      revenu_fiscal: user.revenu_fiscal,
      nombre_de_parts_fiscales: user.getNombrePartsFiscalesOuEstimee(),
      abonnement_ter_loire: user.abonnement_ter_loire,
      //onboarding_result: user.onboardingResult.ventilation_par_thematiques,
      logement: LogementAPI.mapToAPI(user.logement),
      annee_naissance: user.annee_naissance,
    };
  }
}
