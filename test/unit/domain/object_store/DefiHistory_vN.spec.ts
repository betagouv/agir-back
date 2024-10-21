import { Univers } from '../../../../src/domain/univers/univers';
import { Thematique } from '../../../../src/domain/contenu/thematique';
import { Defi, DefiStatus } from '../../../../src/domain/defis/defi';
import { DefiHistory } from '../../../../src/domain/defis/defiHistory';
import {
  DefiHistory_v0,
  Defi_v0,
} from '../../../../src/domain/object_store/defi/defiHistory_v0';
import {
  SerialisableDomain,
  Upgrader,
} from '../../../../src/domain/object_store/upgrader';
import { Tag } from '../../../../src/domain/scoring/tag';
import { Categorie } from '../../../../src/domain/contenu/categorie';

describe('DefiHistory vN ', () => {
  it('build OK from empty', () => {
    // GIVEN
    const raw = Upgrader.upgradeRaw({}, SerialisableDomain.KYCHistory);

    // WHEN
    const domain = new DefiHistory(raw);

    // THEN
    expect(domain.defis).toHaveLength(0);
  });

  it('serialise <=> deserialise v0 OK', () => {
    // GIVEN
    const domain_start = new DefiHistory();
    domain_start.defis.push(
      new Defi({
        id: '1',
        thematique: Thematique.transport,
        titre: 'yo',
        tags: [Tag.transport],
        points: 5,
        astuces: 'a',
        date_acceptation: null,
        pourquoi: 'p',
        sous_titre: 'st',
        status: DefiStatus.todo,
        universes: [Univers.climat],
        accessible: true,
        motif: 'truc',
        categorie: Categorie.recommandation,
        mois: [1],
        conditions: [[{ id_kyc: 1, code_kyc: '123', code_reponse: 'oui' }]],
        sont_points_en_poche: true,
        impact_kg_co2: 6,
      }),
    );

    // WHEN
    const raw = DefiHistory_v0.serialise(domain_start);
    const domain_end = new DefiHistory(raw);

    // THEN
    expect(domain_end).toStrictEqual(domain_start);
  });
  it('serialise <=> upgade <=> deserialise v0 OK', () => {
    // GIVEN
    const domain_start = new DefiHistory();
    domain_start.defis.push(
      new Defi({
        id: '1',
        thematique: Thematique.transport,
        titre: 'yo',
        tags: [Tag.transport],
        points: 5,
        astuces: 'a',
        date_acceptation: null,
        pourquoi: 'p',
        sous_titre: 'st',
        status: DefiStatus.todo,
        universes: [Univers.climat],
        accessible: true,
        motif: 'truc',
        categorie: Categorie.recommandation,
        mois: [1],
        conditions: [[{ id_kyc: 1, code_kyc: '123', code_reponse: 'oui' }]],
        sont_points_en_poche: false,
        impact_kg_co2: 6,
      }),
    );

    // WHEN
    const raw = DefiHistory_v0.serialise(domain_start);
    const upgrade = Upgrader.upgradeRaw(raw, SerialisableDomain.DefiHistory);
    const domain_end = new DefiHistory(upgrade);

    // THEN
    expect(domain_end).toStrictEqual(domain_start);
  });
  it('sdesrialise ok missin accessibilite boolean', () => {
    // GIVEN
    const defi_sans_accessibilite: Defi_v0 = {
      id: '1',
      thematique: Thematique.transport,
      titre: 'yo',
      tags: [Tag.transport],
      points: 5,
      astuces: 'a',
      date_acceptation: null,
      pourquoi: 'p',
      sous_titre: 'st',
      status: DefiStatus.todo,
      universes: [Univers.climat],
      accessible: true,
      motif: 'truc',
      categorie: Categorie.recommandation,
      mois: [1],
      conditions: [[{ id_kyc: 1, code_kyc: '123', code_reponse: 'oui' }]],
      sont_points_en_poche: false,
      impact_kg_co2: 6,
    };

    delete defi_sans_accessibilite.accessible;

    const history: DefiHistory_v0 = {
      version: 0,
      defis: [defi_sans_accessibilite],
    };

    // WHEN
    const upgrade = Upgrader.upgradeRaw(
      history,
      SerialisableDomain.DefiHistory,
    );
    const domain_end = new DefiHistory(upgrade);

    // THEN
    expect(domain_end.defis[0].accessible).toStrictEqual(false);
  });
});
