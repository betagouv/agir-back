import { Injectable } from '@nestjs/common';
import { UtilisateurRepository } from '../infrastructure/repository/utilisateur/utilisateur.repository';
import { DefiStatistiqueRepository } from '../../src/infrastructure/repository/defiStatistique.repository';
import { DefiStatus } from '../../src/domain/defis/defi';

@Injectable()
export class DefiStatistiqueUsecase {
  private defi_map: Map<
    string,
    {
      titre: string;
      nbr_abondon: number;
      nbr_deja_fait: number;
      nbr_en_cours: number;
      nbr_realise: number;
    }
  >;

  constructor(
    private defiStatistiqueRepository: DefiStatistiqueRepository,
    private utilisateurRepository: UtilisateurRepository,
  ) {}

  async calculStatistique(): Promise<string[]> {
    this.defi_map = new Map();

    const result = [];

    const listeUtilisateursIds =
      await this.utilisateurRepository.listUtilisateurIds();

    for (let index = 0; index < listeUtilisateursIds.length; index++) {
      const user_id = listeUtilisateursIds[index];

      const utilisateur = await this.utilisateurRepository.getById(user_id);

      utilisateur.defi_history.defis.forEach((defi) => {
        let defi_agrega = this.getDefiAgregationRefById(defi.id);
        switch (defi.getStatus()) {
          case DefiStatus.abondon:
            defi_agrega.nbr_abondon++;
            break;
          case DefiStatus.deja_fait:
            defi_agrega.nbr_deja_fait++;
            break;
          case DefiStatus.en_cours:
            defi_agrega.nbr_en_cours++;
            break;
          case DefiStatus.fait:
            defi_agrega.nbr_realise++;
            break;
        }
        defi_agrega.titre = defi.titre;
      });
    }

    const liste_defis_from_map = Array.from(this.defi_map.entries());

    for (let index = 0; index < liste_defis_from_map.length; index++) {
      const [key, value] = liste_defis_from_map[index];

      await this.defiStatistiqueRepository.upsert(
        key,
        value.titre,
        value.nbr_abondon,
        value.nbr_deja_fait,
        value.nbr_en_cours,
        value.nbr_realise,
      );
      result.push(key);
    }

    return result;
  }

  private getDefiAgregationRefById(id: string) {
    let defi_agrega = this.defi_map.get(id);
    defi_agrega = defi_agrega
      ? defi_agrega
      : {
          nbr_abondon: 0,
          nbr_deja_fait: 0,
          nbr_en_cours: 0,
          nbr_realise: 0,
          titre: '',
        };
    this.defi_map.set(id, defi_agrega);
    return defi_agrega;
  }
}
