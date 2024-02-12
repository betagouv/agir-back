import {
  SerialisableDomain,
  Upgrader,
} from '../../../../src/domain/object_store/upgrader';
import { History } from '../../../../src/domain/history/history';
import { History_v0 } from '../../../../src/domain/object_store/history/history_v0';

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
    const history = new History();
    history.lireArticle('1');
    history.quizzAttempt('2', 25);

    // WHEN
    const raw = History_v0.serialise(history);
    const domain = new History(raw);

    // THEN
    expect(history).toStrictEqual(domain);
  });
  it('serialise <=> upgade <=> deserialise v0 OK', () => {
    // GIVEN
    const history = new History();
    history.lireArticle('1');
    history.quizzAttempt('2', 25);

    // WHEN
    const raw = History_v0.serialise(history);
    const upgrade = Upgrader.upgradeRaw(raw, SerialisableDomain.History);
    const domain = new History(upgrade);

    // THEN
    expect(history).toStrictEqual(domain);
  });
});
