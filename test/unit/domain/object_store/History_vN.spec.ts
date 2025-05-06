import { History } from '../../../../src/domain/history/history';
import { History_v0 } from '../../../../src/domain/object_store/history/history_v0';
import {
  SerialisableDomain,
  Upgrader,
} from '../../../../src/domain/object_store/upgrader';

describe('History vN ', () => {
  it('build OK from empty', () => {
    // GIVEN
    const raw = Upgrader.upgradeRaw({}, SerialisableDomain.History);

    // WHEN

    const domain = new History(raw);
    // THEN
    expect(domain.nombreArticles()).toEqual(0);
    expect(domain.nombreQuizz()).toEqual(0);
  });
  it('serialise <=> deserialise v0 OK', () => {
    // GIVEN
    const domain_start = new History();
    domain_start.lireArticle('1');
    domain_start.quizzAttempt('2', 25);

    // WHEN
    const raw = History_v0.serialise(domain_start);
    const domain_end = new History(raw);

    // THEN
    expect(domain_end).toStrictEqual(domain_start);
  });
  it('serialise <=> upgade <=> deserialise v0 OK', () => {
    // GIVEN
    const domain_start = new History();
    domain_start.lireArticle('1');
    domain_start.quizzAttempt('2', 25);

    // WHEN
    const raw = History_v0.serialise(domain_start);
    const upgrade = Upgrader.upgradeRaw(raw, SerialisableDomain.History);
    const domain_end = new History(upgrade);

    // THEN
    expect(domain_end).toStrictEqual(domain_start);
  });
});
