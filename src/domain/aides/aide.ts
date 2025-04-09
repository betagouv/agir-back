import { ContenuLocal } from '../contenu/contenuLocal';
import { PartenaireDefinition } from '../contenu/partenaireDefinition';
import { AideHistory } from '../history/aideHistory';
import { Utilisateur } from '../utilisateur/utilisateur';
import { AideDefinition } from './aideDefinition';

export class Aide extends AideDefinition implements ContenuLocal {
  constructor(data: AideDefinition) {
    super(data);
  }
  ca?: string[];
  cu?: string[];
  cc?: string[];
  metropoles?: string[];
  vue_at?: Date;
  clicked_demande?: boolean;
  clicked_infos?: boolean;
  like_level?: number;
  feedback?: string;
  est_connue_utilisateur?: boolean;
  sera_sollicitee_utilisateur?: boolean;
  partenaire_nom?: string;
  partenaire_url?: string;
  partenaire_logo_url?: string;

  public static newAide(
    aide_def: AideDefinition,
    utilisateur: Utilisateur,
  ): Aide {
    const aide_hist = utilisateur.history.getAideInteractionByIdCms(
      aide_def.content_id,
    );
    return this.newAideFromHistory(aide_def, aide_hist);
  }

  public static newAideFromHistory(
    aide_def: AideDefinition,
    aide_hist: AideHistory,
  ): Aide {
    const aide = new Aide(aide_def);
    if (aide_hist) {
      aide.clicked_demande = aide_hist.clicked_demande;
      aide.clicked_infos = aide_hist.clicked_infos;
      aide.vue_at = aide_hist.vue_at;
      aide.like_level = aide_hist.like_level;
      aide.est_connue_utilisateur = aide_hist.est_connue_utilisateur;
      aide.sera_sollicitee_utilisateur = aide_hist.sera_sollicitee_utilisateur;
      aide.feedback = aide_hist.feedback;
    } else {
      aide.clicked_demande = false;
      aide.clicked_infos = false;
      aide.vue_at = null;
      aide.like_level = null;
      aide.est_connue_utilisateur = null;
      aide.sera_sollicitee_utilisateur = null;
      aide.feedback = null;
    }
    return aide;
  }

  public setPartenairePourUtilisateur(
    code_commune: string,
    liste_partenaires: PartenaireDefinition[],
  ) {
    if (!liste_partenaires || liste_partenaires.length === 0) {
      return;
    }

    if (!code_commune) {
      this.setPartenaire(liste_partenaires[0]);
      return;
    }

    const part_code_commune_exact = this.getPartenaireDeCodeCommune(
      code_commune,
      liste_partenaires,
    );
    if (part_code_commune_exact) {
      this.setPartenaire(part_code_commune_exact);
      return;
    }

    const match_EPCI = this.getPremierPartenaireQuiMatchEPCI(
      code_commune,
      liste_partenaires,
    );
    if (match_EPCI) {
      this.setPartenaire(match_EPCI);
      return;
    }

    this.setPartenaire(liste_partenaires[0]);
  }

  private getPartenaireDeCodeCommune(
    code_insee: string,
    liste_partenaires: PartenaireDefinition[],
  ): PartenaireDefinition {
    return liste_partenaires.find((p) => p.code_commune === code_insee);
  }

  private getPremierPartenaireQuiMatchEPCI(
    code_insee: string,
    liste_partenaires: PartenaireDefinition[],
  ): PartenaireDefinition {
    return liste_partenaires.find((p) =>
      p.liste_codes_commune_from_EPCI.includes(code_insee),
    );
  }

  private setPartenaire(part: PartenaireDefinition) {
    this.partenaire_nom = part.nom;
    this.partenaire_logo_url = part.image_url;
    this.partenaire_url = part.url;
  }
}
