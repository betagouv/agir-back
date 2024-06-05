import { Injectable } from '@nestjs/common';
import { UtilisateurRepository } from '../infrastructure/repository/utilisateur/utilisateur.repository';
import { DefiStatistiqueRepository } from '../../src/infrastructure/repository/defiStatistique.repository';
import { DefiStatus } from '../../src/domain/defis/defi';
import { DefiStatistique } from '../../src/domain/defis/defiStatistique';

@Injectable()
export class DefiStatistiqueUsecase {
  constructor(
    private defiStatistiqueRepository: DefiStatistiqueRepository,
    private utilisateurRepository: UtilisateurRepository,
  ) {}

  async calculStatistique(): Promise<string[]> {
    const defi_map: Map<string, DefiStatistique> = new Map();

    const result = [];

    const listeUtilisateursIds =
      await this.utilisateurRepository.listUtilisateurIds();

    for (let index = 0; index < listeUtilisateursIds.length; index++) {
      const user_id = listeUtilisateursIds[index];

      const utilisateur = await this.utilisateurRepository.getById(user_id);

      utilisateur.defi_history.defis.forEach((defi) => {
        const defi_agrega = this.getDefiAgregationRefById(defi.id, defi_map);
        switch (defi.getStatus()) {
          case DefiStatus.abondon:
            defi_agrega.nbr_abandon++;
            break;
          case DefiStatus.pas_envie:
            defi_agrega.nbr_pas_envie++;
            break;
          case DefiStatus.en_cours:
            defi_agrega.nbr_en_cours++;
            break;
          case DefiStatus.fait:
            defi_agrega.nbr_realise++;
            break;
        }
        defi_agrega.titre = defi.titre;
        if (defi.motif) defi_agrega.raisons_pas_envie.push(defi.motif);
      });
    }

    const liste_defis_from_map = Array.from(defi_map.entries());

    for (let index = 0; index < liste_defis_from_map.length; index++) {
      const [key, value] = liste_defis_from_map[index];

      await this.defiStatistiqueRepository.upsert(
        key,
        value.titre,
        value.nbr_abandon,
        value.nbr_pas_envie,
        value.nbr_en_cours,
        value.nbr_realise,
        value.raisons_pas_envie,
      );
      result.push(key);
    }

    return result;
  }

  async getById(content_id: string): Promise<DefiStatistique> {
    return this.defiStatistiqueRepository.getBy(content_id);
  }

  private getDefiAgregationRefById(id: string, defi_map) {
    let defi_agrega = defi_map.get(id);
    defi_agrega = defi_agrega
      ? defi_agrega
      : {
          nbr_abandon: 0,
          nbr_pas_envie: 0,
          nbr_en_cours: 0,
          nbr_realise: 0,
          titre: '',
          raisons_pas_envie: [],
        };
    defi_map.set(id, defi_agrega);
    return defi_agrega;
  }
}
